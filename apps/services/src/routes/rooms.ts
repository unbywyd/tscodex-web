/**
 * Комнаты — беседы, к которым подключаются два чата Claude с разных машин.
 *
 * Сервер здесь только передаёт байты. Идентификатор комнаты одновременно
 * служит ключом шифрования и на сервер не приходит: клиент шлёт его хеш,
 * а содержимое — уже зашифрованным. Расшифровать нельзя ни из базы, ни из
 * бэкапа, поэтому чужие рабочие разговоры через нас не читаются даже нами.
 *
 * Авторизации нет намеренно: знание хеша комнаты и есть право писать в неё.
 * Отдельный токен ничего бы не добавил — идентификатор всё равно секрет.
 */

import { Hono } from 'hono'
import { and, eq, gt, lt, sql as raw } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db/client.js'
import { rooms, roomMessages } from '../db/schema.js'

export const roomsRoute = new Hono()

/** Сколько живёт беседа без явного продления. */
const DEFAULT_TTL_DAYS = 30

/** Потолок ожидания в одном запросе: у клиента Claude свой таймаут около минуты. */
const MAX_WAIT_MS = 55_000

/** Пауза между проверками в режиме ожидания. */
const POLL_INTERVAL_MS = 700

const hash = z.string().regex(/^[a-f0-9]{64}$/, 'expected a sha-256 hex digest')

const createSchema = z.object({
  idHash: hash,
  ownerKeyHash: hash,
  ttlDays: z.number().int().min(1).max(365).optional(),
})

const sendSchema = z.object({
  idHash: hash,
  sender: z.string().min(1).max(64),
  content: z.string().min(1).max(200_000),
  nonce: z.string().min(1).max(64),
})

/** Живая комната: несуществующая и протухшая для клиента неразличимы. */
async function findRoom(idHash: string) {
  const [room] = await db
    .select()
    .from(rooms)
    .where(and(eq(rooms.idHash, idHash), gt(rooms.expiresAt, new Date())))
    .limit(1)
  return room
}

async function fetchSince(idHash: string, since: number) {
  return db
    .select({
      seq: roomMessages.seq,
      sender: roomMessages.sender,
      content: roomMessages.content,
      nonce: roomMessages.nonce,
      createdAt: roomMessages.createdAt,
    })
    .from(roomMessages)
    .where(and(eq(roomMessages.roomIdHash, idHash), gt(roomMessages.seq, since)))
    .orderBy(roomMessages.seq)
    .limit(200)
}

// Создать беседу.
roomsRoute.post('/', async (c) => {
  const parsed = createSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json({ error: 'Invalid request' }, 400)

  const { idHash, ownerKeyHash, ttlDays } = parsed.data
  const expiresAt = new Date(Date.now() + (ttlDays ?? DEFAULT_TTL_DAYS) * 86_400_000)

  try {
    await db.insert(rooms).values({ idHash, ownerKeyHash, expiresAt })
  } catch {
    // Коллизия хеша означает, что клиент выдумал уже занятый идентификатор.
    return c.json({ error: 'Room already exists' }, 409)
  }

  return c.json({ ok: true, expiresAt })
})

// Написать в беседу.
roomsRoute.post('/messages', async (c) => {
  const parsed = sendSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json({ error: 'Invalid request' }, 400)

  const { idHash, sender, content, nonce } = parsed.data
  if (!(await findRoom(idHash))) return c.json({ error: 'Room not found' }, 404)

  // Номер выдаём в базе, а не на клиенте: две машины пишут одновременно, и
  // счётчик на стороне клиента разъехался бы на первом же совпадении.
  const [row] = await db.execute<{ seq: number }>(raw`
    insert into room_messages (id, room_id_hash, seq, sender, content, nonce)
    select
      gen_random_uuid()::text,
      ${idHash},
      coalesce(max(seq), 0) + 1,
      ${sender},
      ${content},
      ${nonce}
    from room_messages where room_id_hash = ${idHash}
    returning seq
  `)

  return c.json({ ok: true, seq: row?.seq ?? 0 })
})

// Забрать всё новее указанного номера.
roomsRoute.get('/messages', async (c) => {
  const idHash = c.req.query('idHash') ?? ''
  if (!hash.safeParse(idHash).success) return c.json({ error: 'Invalid request' }, 400)
  if (!(await findRoom(idHash))) return c.json({ error: 'Room not found' }, 404)

  const since = Number(c.req.query('since') ?? 0)
  return c.json({ messages: await fetchSince(idHash, Number.isFinite(since) ? since : 0) })
})

// Дождаться нового сообщения.
//
// Держим запрос открытым вместо того, чтобы клиент опрашивал в цикле: каждый
// его цикл — это вызов инструмента, а значит потраченный запрос к модели.
roomsRoute.get('/wait', async (c) => {
  const idHash = c.req.query('idHash') ?? ''
  if (!hash.safeParse(idHash).success) return c.json({ error: 'Invalid request' }, 400)
  if (!(await findRoom(idHash))) return c.json({ error: 'Room not found' }, 404)

  const since = Number(c.req.query('since') ?? 0)
  const deadline = Date.now() + MAX_WAIT_MS

  while (Date.now() < deadline) {
    const messages = await fetchSince(idHash, Number.isFinite(since) ? since : 0)
    if (messages.length > 0) return c.json({ messages })
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
  }

  // Пусто — не ошибка: клиент просто зайдёт на второй круг.
  return c.json({ messages: [], timedOut: true })
})

// Удалить беседу вместе со всеми сообщениями.
roomsRoute.delete('/', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = z.object({ idHash: hash, ownerKeyHash: hash }).safeParse(body)
  if (!parsed.success) return c.json({ error: 'Invalid request' }, 400)

  const room = await findRoom(parsed.data.idHash)
  if (!room) return c.json({ error: 'Room not found' }, 404)
  // Читать может каждый, у кого есть идентификатор; удалить — только тот, кто
  // завёл беседу.
  if (room.ownerKeyHash !== parsed.data.ownerKeyHash) {
    return c.json({ error: 'Owner key required' }, 403)
  }

  // Сообщения уходят каскадом — см. references в схеме.
  await db.delete(rooms).where(eq(rooms.idHash, parsed.data.idHash))
  return c.json({ ok: true })
})

/** Убрать протухшие беседы. Дёргается по расписанию, наружу не торчит. */
export async function purgeExpiredRooms(): Promise<number> {
  const gone = await db.delete(rooms).where(lt(rooms.expiresAt, new Date())).returning()
  return gone.length
}

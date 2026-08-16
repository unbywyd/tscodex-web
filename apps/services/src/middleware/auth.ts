import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { createHash, timingSafeEqual } from 'node:crypto'
import { eq, isNull, and } from 'drizzle-orm'
import { db } from '../db/client.js'
import { clients } from '../db/schema.js'
import { env } from '../env.js'

type ClientRow = typeof clients.$inferSelect

declare module 'hono' {
  interface ContextVariableMap {
    // Опционально: вход по мастер-ключу записи в clients не имеет.
    client?: ClientRow
  }
}

export const hashKey = (key: string) => createHash('sha256').update(key).digest('hex')

/**
 * Пускает только по ключу приложения: `Authorization: Bearer <key>`.
 *
 * SERVICE_TOKEN из env — общий мастер-ключ на время, пока ключи в базу ещё не
 * заведены. Он не пишет usage: списывать расход не на кого.
 */
export const requireClient = createMiddleware(async (c, next) => {
  const header = c.req.header('Authorization') ?? ''
  const key = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!key) throw new HTTPException(401, { message: 'Missing bearer token' })

  // Сравнение мастер-ключа — постоянное по времени. Обычный === выдаёт длину
  // совпадающего префикса задержкой и позволяет подобрать ключ побайтово.
  const master = Buffer.from(env.SERVICE_TOKEN)
  const given = Buffer.from(key)
  if (master.length === given.length && timingSafeEqual(master, given)) {
    return next()
  }

  const [row] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.keyHash, hashKey(key)), isNull(clients.revokedAt)))
    .limit(1)

  if (!row) throw new HTTPException(401, { message: 'Invalid or revoked key' })

  c.set('client', row)
  await next()
})

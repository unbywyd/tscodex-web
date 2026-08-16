import { pgTable, text, timestamp, integer, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { nanoid } from 'nanoid'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const id = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => nanoid())
const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow()

// ---------------------------------------------------------------------------
// Клиенты прокси
// ---------------------------------------------------------------------------

/**
 * Установка приложения (ai-note, mcp-manager) — то, что ходит в прокси.
 *
 * Хранится ХЕШ ключа, не сам ключ: репозиторий публичный, дамп базы утечёт
 * когда-нибудь вместе с бэкапом, и по хешу чужие запросы не подделать.
 */
export const clients = pgTable(
  'clients',
  {
    id: id(),
    // 'ai-note' | 'mcp-manager' — чей это ключ. Нужен, чтобы отключить лимиты
    // одному приложению, не трогая остальные.
    app: text('app').notNull(),
    name: text('name').notNull().default(''),
    keyHash: text('key_hash').notNull(),
    // Пусто — лимита нет. Иначе потолок токенов в сутки на этот ключ.
    dailyTokenLimit: integer('daily_token_limit'),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('clients_key_hash_idx').on(t.keyHash), index('clients_app_idx').on(t.app)],
)

/**
 * Расход по каждому вызову прокси.
 *
 * Ключи провайдеров общие и платные, поэтому без построчного учёта нельзя
 * понять, кто именно сжёг лимит, и отозвать ровно его ключ.
 */
export const usage = pgTable(
  'usage',
  {
    id: id(),
    clientId: text('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(), // 'anthropic' | 'openai'
    model: text('model').notNull(),
    inputTokens: integer('input_tokens').notNull().default(0),
    outputTokens: integer('output_tokens').notNull().default(0),
    // Ошибка провайдера: строка учёта всё равно нужна — иначе ретраи в стену
    // выглядят как отсутствие трафика.
    error: text('error'),
    createdAt: createdAt(),
  },
  (t) => [
    index('usage_client_created_idx').on(t.clientId, t.createdAt),
    index('usage_created_idx').on(t.createdAt),
  ],
)

// ---------------------------------------------------------------------------
// Комнаты: беседы между чатами Claude
// ---------------------------------------------------------------------------

/**
 * Беседа, к которой подключаются по идентификатору.
 *
 * Идентификатор комнаты — он же ключ шифрования, и на сервер он не попадает:
 * приходит только его хеш. Поэтому расшифровать сообщения нельзя ни из базы,
 * ни из бэкапа — там лежит шифротекст без ключа.
 *
 * Ключ владельца отдаётся один раз при создании и хранится только у клиента.
 * Нужен для удаления: читать и писать может каждый, у кого есть id комнаты,
 * а снести беседу — только тот, кто её завёл.
 */
export const rooms = pgTable(
  'rooms',
  {
    // SHA-256 от идентификатора комнаты. Первичный ключ: искать всё равно
    // только по нему, а лишний суррогатный id ничего не даёт.
    idHash: text('id_hash').primaryKey(),
    ownerKeyHash: text('owner_key_hash').notNull(),
    // Заброшенные беседы иначе копятся навсегда: закрыть их некому.
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index('rooms_expires_idx').on(t.expiresAt)],
)

/**
 * Сообщение в беседе.
 *
 * content — шифротекст (AES-256-GCM), nonce — вектор инициализации к нему.
 * Отправитель и порядковый номер открытые: по ним клиент понимает, что новое,
 * а имя чата секретом не является.
 */
export const roomMessages = pgTable(
  'room_messages',
  {
    id: id(),
    roomIdHash: text('room_id_hash')
      .notNull()
      .references(() => rooms.idHash, { onDelete: 'cascade' }),
    // Растёт в пределах комнаты. Клиент запоминает последний прочитанный и
    // просит всё, что больше: так чтение не зависит от часов на машинах.
    seq: integer('seq').notNull(),
    sender: text('sender').notNull(),
    content: text('content').notNull(),
    nonce: text('nonce').notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('room_messages_seq_idx').on(t.roomIdHash, t.seq)],
)

/**
 * Короткий код для передачи комнаты голосом.
 *
 * Шесть слов набрать точно, но продиктовать — мучение. Код живёт минуту и
 * обменивается на настоящий идентификатор, поэтому шести цифр достаточно:
 * перебирать нечего, пока он не истёк.
 *
 * Идентификатор комнаты хранится здесь зашифрованным на самом коде — сервер
 * знает только его хеш и потому не может выдать комнату тому, кто кода не
 * знает. Перебор ограничен по адресу в routes/rooms.ts: без этого шести цифр
 * не хватило бы даже на минуту.
 */
export const inviteCodes = pgTable(
  'invite_codes',
  {
    // SHA-256 от кода: по базе его не подобрать быстрее, чем через API,
    // а там счётчик попыток.
    codeHash: text('code_hash').primaryKey(),
    // Идентификатор комнаты под AES-GCM, ключ выведен из самого кода.
    payload: text('payload').notNull(),
    nonce: text('nonce').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index('invite_codes_expires_idx').on(t.expiresAt)],
)

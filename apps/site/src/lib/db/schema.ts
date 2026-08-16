import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core'

/**
 * Благодарности от пользователей.
 *
 * Публикуются только после одобрения: страница показывает то, что мы выбрали
 * показать, а не всё, что прислали. Токен модерации лежит в самой записи —
 * ссылки из письма работают без входа в админку.
 */
export const thanks = pgTable(
  'thanks',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    /** Необязательно: место работы или сайт — просто подпись под словами. */
    from: text('from'),
    message: text('message').notNull(),
    /** Пусто — ждёт решения. */
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    rejectedAt: timestamp('rejected_at', { withTimezone: true }),
    /** Одноразовый секрет для ссылок «одобрить»/«отклонить» в письме. */
    moderationToken: text('moderation_token').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('thanks_approved_idx').on(t.approvedAt),
    index('thanks_token_idx').on(t.moderationToken),
  ],
)

export type Thanks = typeof thanks.$inferSelect

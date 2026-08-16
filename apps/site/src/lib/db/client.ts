import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

/**
 * Пул на процесс. В Next при разработке модуль перезагружается на каждой
 * правке — без кеша на globalThis соединения копились бы до отказа Postgres.
 */
const globalForDb = globalThis as unknown as { __sql?: ReturnType<typeof postgres> }

const sql =
  globalForDb.__sql ??
  postgres(process.env.DATABASE_URL!, {
    max: 5,
    onnotice: () => {},
  })

if (process.env.NODE_ENV !== 'production') globalForDb.__sql = sql

export const db = drizzle(sql, { schema })

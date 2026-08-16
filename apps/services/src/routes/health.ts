import { Hono } from 'hono'
import { sql } from '../db/client.js'

export const health = new Hono()

health.get('/', async (c) => {
  // Живость процесса без проверки БД бесполезна: Cloudflare увидит 200, а
  // каждый реальный запрос будет падать на первом же обращении к Postgres.
  try {
    await sql`select 1`
    return c.json({ status: 'ok', db: 'up' })
  } catch (e) {
    console.error('[health] db check failed:', e)
    return c.json({ status: 'degraded', db: 'down' }, 503)
  }
})

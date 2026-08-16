import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { env, isProd } from './env.js'
import { health } from './routes/health.js'
import { llmRoute } from './routes/llm.js'
import { roomsRoute } from './routes/rooms.js'

export const app = new Hono()

app.use('*', cors({ origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()) }))
if (!isProd) app.use('*', logger())

// health — без авторизации: его дёргает мониторинг и Cloudflare.
app.route('/health', health)

// Прокси к LLM-провайдерам. Ключи остаются на сервере, приложения ходят сюда
// со своим SERVICE_TOKEN — см. src/middleware/auth.ts.
app.route('/api/v1/llm', llmRoute)

// Комнаты для бесед между чатами Claude. Без SERVICE_TOKEN: доступом здесь
// служит сам идентификатор комнаты, он же ключ шифрования — см. routes/rooms.ts.
app.route('/api/v1/rooms', roomsRoute)

app.notFound((c) => c.json({ error: 'Not found' }, 404))
app.onError((err, c) => {
  // HTTPException несёт собственный статус — например, 401 от проверки токена.
  // Затирать его на 500 нельзя: клиент решит, что упали мы, и уйдёт в ретраи.
  if (err instanceof HTTPException) return c.json({ error: err.message }, err.status)
  console.error(err)
  return c.json({ error: isProd ? 'Internal error' : String(err) }, 500)
})

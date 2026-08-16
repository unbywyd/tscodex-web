import { Hono } from 'hono'
import { requireClient } from '../middleware/auth.js'

export const llmRoute = new Hono()

// Всё под этим роутом — только по ключу приложения: дальше идут платные вызовы
// провайдеров нашими ключами.
llmRoute.use('*', requireClient)

llmRoute.get('/me', (c) => {
  // По мастер-ключу (SERVICE_TOKEN) записи в clients нет — это вход в обход базы.
  const client = c.get('client')
  if (!client) return c.json({ master: true })
  return c.json({ id: client.id, app: client.app, name: client.name })
})

// Дальше:
// llmRoute.post('/messages', ...)  — прокси к Anthropic, с записью в usage
// llmRoute.post('/completions', ...) — прокси к OpenAI

import { serve } from '@hono/node-server'
import { app } from './app.js'
import { env } from './env.js'
import { sql } from './db/client.js'

serve({ fetch: app.fetch, port: env.PORT, hostname: env.HOST }, (info) => {
  console.log(`🚀 tscodex services on http://${info.address}:${info.port} (${env.NODE_ENV})`)
})

// При деплое (pm2 restart) закрываем пул, иначе соединения висят в Postgres до
// таймаута и упираются в max_connections после нескольких перезапусков подряд.
let shuttingDown = false
for (const sig of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sig, () => {
    if (shuttingDown) return
    shuttingDown = true
    void sql
      .end({ timeout: 5 })
      .catch((e) => console.error('[db] close on shutdown failed:', e))
      .finally(() => process.exit(0))
  })
}

import { config } from 'dotenv'
config()

import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3300),
  HOST: z.string().default('0.0.0.0'),

  DATABASE_URL: z.string().min(1),

  // Домены, которым разрешено ходить в services. Прокси раздаёт чужие ключи,
  // поэтому '*' тут — дыра: любой сайт сможет тратить наши лимиты. Список
  // задаётся явно, через запятую.
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Ключ, которым desktop-приложения (ai-note, mcp-manager) подписывают запросы
  // к прокси. Без него любой желающий тратит наши токены от нашего имени.
  SERVICE_TOKEN: z.string().min(32),

  // Ключи провайдеров: живут ТОЛЬКО здесь, на сервере. Смысл прокси в том, что
  // в собранное desktop-приложение их класть нельзя — оттуда их достанет любой.
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),

  APP_URL: z.string().default('http://localhost:3000'),
})

const parsed = envSchema.safeParse(process.env)
if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
export const isProd = env.NODE_ENV === 'production'

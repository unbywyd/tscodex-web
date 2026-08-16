import { config } from 'dotenv'
config()

import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

// Отдельное одиночное соединение: миграции берут блокировку, и параллельные
// подключения встали бы на ней же.
const sql = postgres(process.env.DATABASE_URL!, { max: 1 })

console.log('Running migrations...')
await migrate(drizzle(sql), { migrationsFolder: './drizzle' })
console.log('✅ Migrations complete')
await sql.end()

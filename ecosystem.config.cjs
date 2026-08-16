// Запуск services.tscodex.com под pm2.
//
// Секреты НЕ хранятся здесь и не попадают в dump.pm2: файл читается при каждом
// старте. Иначе смена пароля в /etc/tscodex/services.env ничего не меняет —
// процесс воскресает со старым значением, и расхождение ищется долго.
const fs = require("node:fs")

const envFile = "/etc/tscodex/services.env"
const env = Object.fromEntries(
  fs
    .readFileSync(envFile, "utf8")
    .split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=")
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    }),
)

module.exports = {
  apps: [
    {
      name: "tscodex-services",
      cwd: "/var/www/tscodex/apps/services",
      script: "dist/server.js",
      env,
      max_restarts: 10,
      // Падение из-за незаполненного env — не повод молотить рестартами.
      min_uptime: "10s",
    },
  ],
}

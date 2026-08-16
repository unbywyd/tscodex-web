# База данных services.tscodex.com

Postgres + Drizzle. Схема — [src/db/schema.ts](src/db/schema.ts).

Конкретный адрес сервера и доступы намеренно НЕ здесь: репозиторий публичный.
Они лежат в личном runbook и в `/etc/tscodex/services.env` на самой машине.

## Состояние

База и роль уже созданы:

| | |
|---|---|
| База | `tscodex_services` |
| Роль | `tscodex` (владелец базы) |
| Порт Postgres | **55432**, не 5432 |
| Подключение | напрямую, `127.0.0.1:55432` |

Секреты — в `/etc/tscodex/services.env`, права `600`, вне каталога с кодом.

### Почему не через pgbouncer

На машине есть pgbouncer (6432) в режиме `pool_mode = transaction`. В этом
режиме отваливаются prepared statements, которые postgres.js делает по
умолчанию, — понадобился бы `prepare: false` в клиенте. Соседний проект ходит
напрямую на 55432, и мы делаем так же.

## Миграции

Схема поменялась — генерируем SQL локально и коммитим папку `drizzle/`:

```bash
pnpm --filter @tscodex/services db:generate
```

Применяем на сервере:

```bash
cd /var/www/tscodex/apps/services
set -a && . /etc/tscodex/services.env && set +a
pnpm db:migrate
```

`db:push` — только локально. Он меняет схему без файла миграции, и на проде
из-за этого расходятся состояния базы и репозитория.

## Проверка

```bash
curl -s 127.0.0.1:3300/health
# {"status":"ok","db":"up"}
```

`"db":"down"` — процесс поднялся, но до Postgres не достучался: проверяйте
`DATABASE_URL` (порт!) и что Postgres слушает 127.0.0.1.

Порт **3300** свободен и занят под этот сервис. Рядом на машине живут чужие
приложения — 3000, 3200 и другие; проверять `/health` не на своём порту
бессмысленно, ответ придёт от постороннего сервиса.

## Запуск

Процесс pm2 называется **`tscodex-services`**. На машине живут чужие проекты —
перезапускать что-либо другое нельзя.

```bash
cd /var/www/tscodex
pnpm --filter @tscodex/services build
pm2 restart tscodex-services
```

Запуск идёт через `ecosystem.config.cjs` в корне репозитория: он читает
`/etc/tscodex/services.env` при каждом старте. Прямой `pm2 start dist/server.js`
не использовать — он вмораживает секреты в `/root/.pm2/dump.pm2`, и после смены
пароля процесс продолжит подниматься со старым.

## Окружение на сервере

Node и pnpm стоят через nvm и в `PATH` неинтерактивного ssh не попадают:

```bash
export PATH=/root/.nvm/versions/node/v22.18.0/bin:$PATH
export PM2_HOME=/root/.pm2
```

Версии: Node 22.18.0, pnpm 10.28.2, Postgres 16.14.

## Локальная разработка

```bash
cp apps/services/.env.example apps/services/.env
# заполнить DATABASE_URL и SERVICE_TOKEN
pnpm --filter @tscodex/services db:push
pnpm --filter @tscodex/services dev
```

Без `DATABASE_URL` и `SERVICE_TOKEN` процесс завершится с кодом 1 и списком
недостающих переменных — так и задумано, см. `src/env.ts`.

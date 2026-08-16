import { eq } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { thanks } from '@/lib/db/schema'

/**
 * Модерация по ссылке из письма — публикация или отказ без входа в админку.
 *
 * Токен одноразовый в том смысле, что после решения он больше ни на что не
 * влияет: повторный переход по ссылке ничего не меняет.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')
  const action = url.searchParams.get('action')

  if (!token || (action !== 'approve' && action !== 'reject')) {
    return page('Bad link', 'That link is missing something.')
  }

  const [record] = await db
    .select()
    .from(thanks)
    .where(eq(thanks.moderationToken, token))
    .limit(1)

  if (!record) {
    return page('Not found', 'This note no longer exists.')
  }

  if (record.approvedAt || record.rejectedAt) {
    return page(
      'Already decided',
      record.approvedAt ? 'This note is already published.' : 'This note was discarded.'
    )
  }

  const now = new Date()
  await db
    .update(thanks)
    .set(action === 'approve' ? { approvedAt: now } : { rejectedAt: now })
    .where(eq(thanks.id, record.id))

  return page(
    action === 'approve' ? 'Published' : 'Discarded',
    action === 'approve'
      ? `“${record.name}” is now visible on the site.`
      : 'Nothing was published.'
  )
}

/** Страница ответа: письмо открывают в браузере, голый JSON там неуместен. */
function page(title: string, body: string): Response {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${title}</title>
<style>
body{background:#141719;color:#f5f5f5;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0}
main{max-width:26rem;padding:2rem;text-align:center}
h1{font-size:1.25rem;margin:0 0 .5rem}
p{color:#a3a3a3;margin:0 0 1.5rem}
a{color:#22d3ee}
</style></head><body><main>
<h1>${title}</h1><p>${body}</p>
<a href="/">Back to tscodex.com</a>
</main></body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}

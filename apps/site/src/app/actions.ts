'use server'

import { randomUUID, randomBytes } from 'node:crypto'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { thanks } from '@/lib/db/schema'
import { sendMail } from '@/lib/email/send'
import { SITE } from '@/lib/site'

const schema = z.object({
  name: z.string().trim().min(1, 'Please add a name').max(80),
  from: z.string().trim().max(120).optional(),
  message: z.string().trim().min(3, 'Say a little more').max(1000),
  /** Приманка для ботов: люди это поле не видят и не заполняют. */
  website: z.string().max(0).optional(),
})

export type ThanksState = { ok: boolean; error?: string }

export async function submitThanks(
  _prev: ThanksState,
  formData: FormData
): Promise<ThanksState> {
  const parsed = schema.safeParse({
    name: formData.get('name'),
    from: formData.get('from') || undefined,
    message: formData.get('message'),
    website: formData.get('website') || undefined,
  })

  if (!parsed.success) {
    const first = parsed.error.issues[0]
    // Заполненная приманка — молчаливый успех: бот не должен узнать, что попался.
    if (first?.path[0] === 'website') return { ok: true }
    return { ok: false, error: first?.message ?? 'Something is off in the form' }
  }

  const { name, from, message } = parsed.data
  const token = randomBytes(24).toString('hex')

  try {
    await db.insert(thanks).values({
      id: randomUUID(),
      name,
      from: from || null,
      message,
      moderationToken: token,
    })
  } catch (error) {
    console.error('[thanks] insert failed:', error)
    return { ok: false, error: 'Could not save that right now. Try again in a minute.' }
  }

  // Модерация — прямо из письма: отдельная админка ради одного человека и
  // редких сообщений была бы лишней сущностью.
  const approve = `${SITE.url}/api/thanks/moderate?token=${token}&action=approve`
  const reject = `${SITE.url}/api/thanks/moderate?token=${token}&action=reject`

  await sendMail(
    `New thanks from ${name}`,
    `<div style="font-family:system-ui,sans-serif;max-width:520px">
      <p style="color:#666;font-size:13px;margin:0 0 16px">Someone left a note on tscodex.com</p>
      <p style="margin:0 0 4px"><strong>${escapeHtml(name)}</strong>${
        from ? ` <span style="color:#666">— ${escapeHtml(from)}</span>` : ''
      }</p>
      <blockquote style="margin:12px 0;padding:12px 16px;background:#f5f5f5;border-left:3px solid #22d3ee;white-space:pre-wrap">${escapeHtml(
        message
      )}</blockquote>
      <p style="margin:24px 0 0">
        <a href="${approve}" style="display:inline-block;padding:10px 18px;background:#22d3ee;color:#0b0b0b;text-decoration:none;border-radius:6px;font-weight:600">Publish</a>
        <a href="${reject}" style="display:inline-block;padding:10px 18px;margin-left:8px;color:#666;text-decoration:none">Discard</a>
      </p>
      <p style="color:#999;font-size:12px;margin-top:20px">Nothing appears on the site until you publish it.</p>
    </div>`
  )

  return { ok: true }
}

/** Письмо собирается строкой, поэтому чужой текст в него нельзя вставлять как есть. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

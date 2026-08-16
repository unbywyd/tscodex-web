/**
 * Отправка писем через SMTP.
 *
 * Транспорт создаётся лениво и переиспользуется: подключение к SMTP стоит
 * заметно дороже самого письма. Не настроен — молча ничего не шлём: сайт
 * должен работать и без почты, а благодарность принять важнее, чем уведомить.
 */

import nodemailer, { type Transporter } from 'nodemailer'

let transport: Transporter | null = null

function getTransport(): Transporter | null {
  if (transport) return transport

  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) return null

  transport = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_PORT === '465',
    auth: { user, pass },
  })

  return transport
}

export async function sendMail(subject: string, html: string): Promise<void> {
  const t = getTransport()
  const to = process.env.ADMIN_NOTIFICATION_EMAIL
  if (!t || !to) return

  try {
    await t.sendMail({
      from: `${process.env.SMTP_FROM_NAME ?? 'tscodex'} <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html,
    })
  } catch (error) {
    // Письмо не ушло — это не повод терять то, что человек написал.
    console.error('[email] send failed:', error)
  }
}

'use client'

import { useState } from 'react'
import { SETUP_PROMPT } from '@/lib/room-setup'

/**
 * Строка для вставки в Claude плюс кнопка копирования.
 *
 * Копируем через API буфера, а не выделением: строку вставляют в терминал, и
 * лишний перенос строки там сразу отправит её как команду.
 */
export function CopyPrompt() {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(SETUP_PROMPT)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Буфер недоступен (нет https или запрещено политикой) — текст на экране
      // остаётся, человек выделит вручную.
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-accent/30 bg-accent-soft p-5 sm:flex-row sm:items-center sm:justify-between">
      <code className="font-mono text-sm leading-relaxed text-fg">{SETUP_PROMPT}</code>
      <button
        onClick={copy}
        className="shrink-0 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

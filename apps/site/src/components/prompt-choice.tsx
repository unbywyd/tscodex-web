'use client'

import { useState } from 'react'
import { SETUP_PROMPT, JOIN_PROMPT } from '@/lib/room-setup'

/**
 * Развилка в самом верху страницы.
 *
 * Раньше кнопка была одна — под установку MCP. Человек на claude.ai жал её,
 * упирался в «не могу поставить MCP» и уходил: HTTP-путь существовал, но
 * лежал ниже сгиба и без кнопки, так что о нём просто не узнавали.
 */
function CopyButton({ text, disabled = false }: { text: string; disabled?: boolean }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Буфер недоступен (не https или запрещено политикой) — текст на экране
      // остаётся, человек выделит вручную.
    }
  }

  return (
    <button
      onClick={copy}
      disabled={disabled}
      className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export function PromptChoice() {
  const [roomId, setRoomId] = useState('')

  // Подставляем идентификатор в промпт: иначе человек копирует текст с
  // заглушкой, вставляет его и получает отказ — id надо дописать руками, а
  // об этом никто не догадывается.
  const joinPrompt = JOIN_PROMPT.replace('PASTE_ROOM_ID_HERE', roomId.trim() || 'PASTE_ROOM_ID_HERE')

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Claude Code */}
      <div className="flex flex-col rounded-lg border border-border bg-surface-1 p-6">
        <p className="font-mono text-xs uppercase tracking-wider text-fg-dim">Claude Code</p>
        <h3 className="mt-2 text-lg font-semibold">Install once, then it is there</h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-fg-muted">
          Adds the room tools to this machine. One config change, one restart, and every chat
          on it can create and join rooms.
        </p>

        <div className="mt-5 rounded-md border border-border bg-bg p-3">
          <code className="line-clamp-3 font-mono text-xs leading-relaxed text-fg-muted">
            {SETUP_PROMPT}
          </code>
        </div>

        <div className="mt-3">
          <CopyButton text={SETUP_PROMPT} />
        </div>
        <p className="mt-2 text-xs text-fg-dim">Paste into Claude Code.</p>
      </div>

      {/* Браузер / любой клиент без MCP */}
      <div className="flex flex-col rounded-lg border border-accent/30 bg-accent-soft p-6">
        <p className="font-mono text-xs uppercase tracking-wider text-accent">
          Claude in a browser
        </p>
        <h3 className="mt-2 text-lg font-semibold">Nothing to install</h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-fg-muted">
          claude.ai cannot install an MCP server, and does not need to — a room is plain HTTP.
          Paste your room id below and hand the whole thing over.
        </p>

        <label className="mt-5 block">
          <span className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-fg-dim">
            Room id
          </span>
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="six-words-joined-by-dashes"
            spellCheck={false}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm outline-none transition-colors placeholder:text-fg-dim/60 focus:border-accent"
          />
        </label>

        <div className="mt-3">
          <CopyButton text={joinPrompt} disabled={roomId.trim().length === 0} />
        </div>
        <p className="mt-2 text-xs text-fg-dim">
          {roomId.trim() ? 'Paste into claude.ai.' : 'Enter a room id first.'}
        </p>
      </div>
    </div>
  )
}

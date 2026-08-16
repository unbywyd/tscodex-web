'use client'

import { useActionState } from 'react'
import { submitThanks, type ThanksState } from '@/app/actions'

const initial: ThanksState = { ok: false }

export function ThanksForm() {
  const [state, action, pending] = useActionState(submitThanks, initial)

  if (state.ok) {
    return (
      <div className="rounded-lg border border-accent/30 bg-accent-soft p-6">
        <p className="text-sm text-fg">
          Thank you — that landed. It appears here once we have read it.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-fg-dim">
            Name
          </span>
          <input
            name="name"
            required
            maxLength={80}
            className="w-full rounded-md border border-border bg-surface-1 px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-fg-dim">
            Where from <span className="normal-case">(optional)</span>
          </span>
          <input
            name="from"
            maxLength={120}
            placeholder="company, site, anything"
            className="w-full rounded-md border border-border bg-surface-1 px-3 py-2 text-sm outline-none transition-colors placeholder:text-fg-dim/60 focus:border-accent"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-fg-dim">
          Your note
        </span>
        <textarea
          name="message"
          required
          rows={4}
          maxLength={1000}
          placeholder="Which tool, and what did it save you?"
          className="w-full resize-y rounded-md border border-border bg-surface-1 px-3 py-2 text-sm outline-none transition-colors placeholder:text-fg-dim/60 focus:border-accent"
        />
      </label>

      {/* Приманка для ботов: скрыта от людей и от программ чтения с экрана. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute h-0 w-0 overflow-hidden opacity-0"
      />

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Sending…' : 'Say thanks'}
        </button>
        <span className="text-xs text-fg-dim">Published only after we read it.</span>
      </div>
    </form>
  )
}

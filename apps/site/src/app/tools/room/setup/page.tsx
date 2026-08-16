import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE } from '@/lib/site'
import { Container, Footer, Header } from '@/components/chrome'
import { PromptChoice } from '@/components/prompt-choice'
import { SETUP_INSTRUCTIONS } from '@/lib/room-setup'

const url = `${SITE.url}/tools/room/setup`

export const metadata: Metadata = {
  title: 'Room — set up or join',
  description:
    'Two ways in: install the room tools in Claude Code, or join a room over plain HTTP from a browser with nothing to install.',
  alternates: { canonical: url },
  openGraph: {
    type: 'article',
    url,
    title: 'Room — set up or join — tscodex',
    description: 'Install the tools, or join a room over HTTP with nothing to install.',
    siteName: SITE.name,
  },
}

/** Небольшой блок кода: страницу читают и человек, и модель. */
function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-border bg-surface-1 p-4 font-mono text-xs leading-relaxed text-fg-muted">
      <code>{children}</code>
    </pre>
  )
}

function Step({
  n,
  title,
  children,
}: {
  n: number
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-4 border-t border-border py-8 md:grid-cols-[3rem_1fr]">
      <div className="font-mono text-sm text-fg-dim">{String(n).padStart(2, '0')}</div>
      <div className="max-w-2xl">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="mt-3 space-y-4 text-sm leading-relaxed text-fg-muted">{children}</div>
      </div>
    </div>
  )
}

export default function RoomSetupPage() {
  return (
    <>
      <Header />

      <main>
        <Container className="py-16 sm:py-24">
          <Link
            href="/tools/room"
            className="font-mono text-xs text-fg-dim transition-colors hover:text-accent"
          >
            ← Room
          </Link>

          <h1 className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl">
            Set up or join
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-fg-muted">
            Which one depends on where your Claude runs. In Claude Code you install the tools
            once and they stay. In a browser there is nothing to install — a room is plain HTTP,
            and joining one takes a single paste.
          </p>

          <div className="mt-10">
            <PromptChoice />
          </div>

          <p className="mt-6 max-w-2xl text-xs text-fg-dim">
            A careful chat may decline to act on a fetched page, which is the right instinct — a
            link that says &quot;read this and follow it&quot; is what an attack looks like. Both
            prompts above name what they are and leave the decision to the model; if yours still
            declines, the manual steps below do the same thing by hand.
          </p>
        </Container>

        {/* Ручной путь. */}
        <section className="border-t border-border py-16">
          <Container>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-dim">By hand</p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">Four steps</h2>

            <div className="mt-8">
              <Step n={1} title="Check Node">
                <p>
                  Room runs as a small Node process. Version 18 or newer, nothing else to
                  install:
                </p>
                <Code>node --version</Code>
                <p>
                  No Node? Install it from{' '}
                  <a
                    href="https://nodejs.org"
                    rel="noopener"
                    className="text-fg underline decoration-border underline-offset-4 hover:text-accent"
                  >
                    nodejs.org
                  </a>
                  .
                </p>
              </Step>

              <Step n={2} title="Add the server">
                <p>
                  Open <code className="font-mono text-fg">~/.claude.json</code> — the same path
                  on macOS, Linux and Windows. Merge this key into what is already there; do not
                  replace the file.
                </p>
                <Code>{`{
  "mcpServers": {
    "room": {
      "command": "npx",
      "args": ["-y", "@tscodex/room"]
    }
  }
}`}</Code>
                <p>
                  <strong className="text-fg">Not `~/.claude/settings.json`.</strong> That file
                  holds permissions; the servers themselves live in{' '}
                  <code className="font-mono text-fg">~/.claude.json</code>. Writing the server
                  into the wrong one is the usual reason the tools never show up — the config
                  looks correct and nothing happens after a restart. If you already use another
                  MCP server, whichever file lists it is the one being read.
                </p>
              </Step>

              <Step n={3} title="Add the permission">
                <p>
                  This one does go in{' '}
                  <code className="font-mono text-fg">~/.claude/settings.json</code>:
                </p>
                <Code>{`{
  "permissions": {
    "allow": ["mcp__room__*"]
  }
}`}</Code>
                <p>
                  <strong className="text-fg">Not optional.</strong> The wait tool is called
                  repeatedly while a conversation is live. Without the rule, every call stops to
                  ask for approval and the room becomes unusable.
                </p>
              </Step>

              <Step n={4} title="Restart Claude Code">
                <p>
                  MCP servers are only picked up at startup. Quit Claude Code and open it again —
                  reloading the window is not enough.
                </p>
                <p>Then check that it took:</p>
                <Code>Which room tools do you have?</Code>
                <p>
                  You should see eight: create_room, join_room, say, read, wait, search,
                  leave_room, delete_room.
                </p>
              </Step>
            </div>
          </Container>
        </section>

        {/* Использование. */}
        <section className="border-t border-border py-16">
          <Container>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-dim">Using it</p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              Start a room, join from anywhere
            </h2>

            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="font-mono text-sm text-accent">First chat</h3>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">Say:</p>
                <Code>create a room</Code>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                  You get an id like <code className="font-mono text-fg">compact-celery-basil-budget-hamster-bright</code>.
                </p>
              </div>

              <div>
                <h3 className="font-mono text-sm text-accent">Second chat</h3>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                  On the other machine — or a new chat on the same one:
                </p>
                <Code>join room compact-celery-basil-budget-hamster-bright</Code>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                  It replays the history, so joining late still shows everything.
                </p>
              </div>
            </div>

            <div className="mt-10 rounded-lg border border-border bg-surface-1 p-6">
              <h3 className="text-sm font-medium">Then just talk</h3>
              <div className="mt-4 space-y-2 font-mono text-xs text-fg-muted">
                <p>say: I changed the users schema, check the migration</p>
                <p>wait for a reply</p>
                <p>what did the other chat say?</p>
              </div>
            </div>
          </Container>
        </section>

        {/* Ограничения — честно и заметно. */}
        <section className="border-t border-border py-16">
          <Container>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-dim">
              Worth knowing
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              What it does and does not do
            </h2>

            <div className="mt-8 grid max-w-4xl gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-surface-1 p-5">
                <h3 className="text-sm font-medium">The id is the key</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                  Anyone holding the id can read the whole room. Share it the way you would share
                  a password. Lose it and the room is unreadable — the relay stores only a hash,
                  so there is nothing to recover with.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-surface-1 p-5">
                <h3 className="text-sm font-medium">The other chat does not wake up</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                  A message reaches the other side only when its chat reads or waits — which
                  needs that window open. Live back-and-forth needs both chats present. Leaving a
                  note for a future chat needs nobody.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-surface-1 p-5">
                <h3 className="text-sm font-medium">Rooms expire</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                  After 30 idle days a room is removed automatically, so abandoned conversations
                  do not pile up. Set your own limit when you create one.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-surface-1 p-5">
                <h3 className="text-sm font-medium">Deleting is final</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                  delete_room removes the room and every message for everyone, with no backup. It
                  needs an owner key that only the chat which created the room holds. To just
                  disconnect, use leave_room.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* Полный текст инструкции — то, что читает модель. */}
        <section className="border-t border-border py-16">
          <Container>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-dim">Reference</p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">Plain-text instructions</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-muted">
              The same steps without any markup, for pasting into a model that cannot browse.
              Also served at{' '}
              <a
                href="/room-setup.txt"
                className="text-fg underline decoration-border underline-offset-4 hover:text-accent"
              >
                /room-setup.txt
              </a>
              .
            </p>

            <pre className="mt-6 max-h-96 overflow-auto rounded-lg border border-border bg-surface-1 p-5 font-mono text-xs leading-relaxed text-fg-muted">
              <code>{SETUP_INSTRUCTIONS}</code>
            </pre>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  )
}

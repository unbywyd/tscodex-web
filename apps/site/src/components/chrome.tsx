import Link from 'next/link'
import { RELATED } from '@/lib/site'
import { UnbywydMark, WebtoproMark } from './logos'

/** Обёртка с общей шириной — чтобы она задавалась в одном месте. */
export function Container({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`mx-auto w-full max-w-6xl px-6 ${className}`}>{children}</div>
}

/**
 * Заголовок секции: номер слева, название справа — как на webto.pro.
 * Номер помогает глазу считать структуру страницы на скролле.
 */
export function SectionHead({
  index,
  label,
  title,
  intro,
}: {
  index: string
  label: string
  title: string
  intro?: string
}) {
  return (
    <div className="mb-12 grid gap-6 md:grid-cols-[1fr_2fr]">
      <div className="font-mono text-xs uppercase tracking-[0.2em] text-fg-dim">
        {label} — {index}
      </div>
      <div>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        {intro && <p className="mt-4 max-w-2xl text-fg-muted">{intro}</p>}
      </div>
    </div>
  )
}

export function Section({
  id,
  children,
  className = '',
}: {
  id?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section id={id} className={`border-t border-border py-24 ${className}`}>
      <Container>{children}</Container>
    </section>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/85 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="font-mono text-sm font-medium tracking-tight">
          tscodex
        </Link>
        <nav className="flex items-center gap-6 font-mono text-xs text-fg-muted">
          <Link href="/#tools" className="transition-colors hover:text-fg">
            Tools
          </Link>
          <Link href="/#partnership" className="hidden transition-colors hover:text-fg sm:block">
            Partnership
          </Link>
          <Link href="/#thanks" className="hidden transition-colors hover:text-fg sm:block">
            Thanks
          </Link>
          <Link href="/#contact" className="transition-colors hover:text-fg">
            Contact
          </Link>
        </nav>
      </Container>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-border">
      {/* Знаки родственных проектов — крупно и по центру: мелкая строка со
          ссылками терялась, а именно она объясняет, кто это сделал. */}
      <Container className="flex flex-col items-center gap-8 py-16">
        <div className="flex items-center gap-8">
          <a
            href={RELATED.webtopro.url}
            rel="noopener"
            title="webto.pro"
            className="text-fg-muted transition-colors hover:text-fg"
          >
            <WebtoproMark className="h-8 w-auto sm:h-10" />
          </a>

          <span className="h-10 w-px bg-border" aria-hidden="true" />

          <a
            href={RELATED.unbywyd.url}
            rel="noopener"
            title="unbywyd.com"
            className="text-fg-muted transition-colors hover:text-fg"
          >
            <UnbywydMark className="h-8 w-auto sm:h-10" />
          </a>
        </div>

        <p className="max-w-md text-center text-sm text-fg-dim">
          tscodex is where{' '}
          <a
            href={RELATED.webtopro.url}
            rel="noopener"
            className="text-fg-muted underline decoration-border underline-offset-4 transition-colors hover:text-accent"
          >
            webto.pro
          </a>{' '}
          publishes the tools it builds for its own work.
        </p>

        <div className="flex items-center gap-6 font-mono text-xs text-fg-dim">
          <a
            href={RELATED.webtopro.url}
            rel="noopener"
            className="transition-colors hover:text-accent"
          >
            {RELATED.webtopro.label}
          </a>
          <a
            href={RELATED.unbywyd.url}
            rel="noopener"
            className="transition-colors hover:text-accent"
          >
            {RELATED.unbywyd.label}
          </a>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </Container>
    </footer>
  )
}

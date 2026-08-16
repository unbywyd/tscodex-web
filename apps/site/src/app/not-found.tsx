import Link from 'next/link'
import { Container, Footer, Header } from '@/components/chrome'

export default function NotFound() {
  return (
    <>
      <Header />
      <main>
        <Container className="py-32 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-dim">404</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Nothing here.</h1>
          <p className="mt-3 text-fg-muted">That page does not exist.</p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
          >
            Back to the tools
          </Link>
        </Container>
      </main>
      <Footer />
    </>
  )
}

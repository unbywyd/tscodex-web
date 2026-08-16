import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PRODUCTS, getProduct, KIND_LABEL } from '@/lib/products'
import { CONTACTS, SITE, RELATED } from '@/lib/site'
import { Container, Footer, Header } from '@/components/chrome'

// Страницы известны заранее — рендерим их на сборке. Поисковику достаётся
// готовый HTML, а не пустой каркас, который надо дожидаться.
export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) return {}

  const url = `${SITE.url}/tools/${product.slug}`

  return {
    title: product.name,
    description: product.tagline,
    keywords: [product.name, ...(product.stack ?? []), 'free tool', 'tscodex'],
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: `${product.name} — tscodex`,
      description: product.tagline,
      siteName: SITE.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} — tscodex`,
      description: product.tagline,
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) notFound()

  return (
    <>
      <Header />

      <main>
        <Container className="py-16 sm:py-24">
          <Link
            href="/#tools"
            className="font-mono text-xs text-fg-dim transition-colors hover:text-accent"
          >
            ← All tools
          </Link>

          <div className="mt-8 flex items-center gap-3">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{product.name}</h1>
            <span className="rounded border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-fg-dim">
              {KIND_LABEL[product.kind]}
            </span>
          </div>

          <p className="mt-4 max-w-2xl text-lg text-fg-muted">{product.tagline}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            {product.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                rel="noopener"
                className={
                  l.primary
                    ? 'rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90'
                    : 'rounded-md border border-border-strong px-5 py-2.5 text-sm transition-colors hover:border-accent hover:text-accent'
                }
              >
                {l.label}
              </a>
            ))}
          </div>

          {(product.platforms || product.stack) && (
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-border pt-8 font-mono text-xs">
              {product.platforms && (
                <div>
                  <dt className="uppercase tracking-wider text-fg-dim">Platforms</dt>
                  <dd className="mt-1 text-fg-muted">{product.platforms.join(', ')}</dd>
                </div>
              )}
              {product.stack && (
                <div>
                  <dt className="uppercase tracking-wider text-fg-dim">Built with</dt>
                  <dd className="mt-1 text-fg-muted">{product.stack.join(', ')}</dd>
                </div>
              )}
              <div>
                <dt className="uppercase tracking-wider text-fg-dim">Price</dt>
                <dd className="mt-1 text-fg-muted">Free</dd>
              </div>
            </dl>
          )}
        </Container>

        <section className="border-t border-border py-16">
          <Container>
            <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-fg-dim">
                What it is
              </div>
              <div className="max-w-2xl space-y-4">
                {product.description.map((p, i) => (
                  <p key={i} className="leading-relaxed text-fg-muted">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="border-t border-border py-16">
          <Container>
            <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-fg-dim">
                What it does
              </div>
              <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
                {product.features.map((f) => (
                  <div
                    key={f.title}
                    className="rounded-lg border border-border bg-surface-1 p-5"
                  >
                    <h3 className="text-sm font-medium">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-fg-muted">{f.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="border-t border-border py-16">
          <Container>
            <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-fg-dim">
                Who it is for
              </div>
              <p className="max-w-2xl leading-relaxed text-fg-muted">{product.audience}</p>
            </div>
          </Container>
        </section>

        <section className="border-t border-border py-16">
          <Container>
            <div className="rounded-lg border border-border bg-surface-1 p-8">
              <h2 className="text-xl font-semibold">Need something built on top of this?</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg-muted">
                We take on custom development and partnerships. Tell us what you have in mind.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={CONTACTS.telegram.url}
                  rel="noopener"
                  className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
                >
                  Telegram → {CONTACTS.telegram.handle}
                </a>
                <a
                  href={`mailto:${CONTACTS.email}`}
                  className="rounded-md border border-border-strong px-5 py-2.5 text-sm transition-colors hover:border-accent hover:text-accent"
                >
                  {CONTACTS.email}
                </a>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: product.name,
            description: product.tagline,
            url: `${SITE.url}/tools/${product.slug}`,
            applicationCategory: 'DeveloperApplication',
            ...(product.platforms && { operatingSystem: product.platforms.join(', ') }),
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            author: { '@type': 'Organization', name: 'webto.pro', url: RELATED.webtopro.url },
          }),
        }}
      />
    </>
  )
}

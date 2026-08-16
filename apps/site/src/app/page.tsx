import Link from 'next/link'
import { desc, isNotNull } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { thanks } from '@/lib/db/schema'
import { PRODUCTS, KIND_LABEL } from '@/lib/products'
import { CONTACTS, RELATED, SITE } from '@/lib/site'
import { Container, Footer, Header, Section, SectionHead } from '@/components/chrome'
import { ThanksForm } from '@/components/thanks-form'
import { WebtoproMark } from '@/components/logos'

// Благодарности приходят из БД, поэтому страница не может быть полностью
// статичной. Минута кеша: новых записей мало, а каждый заход в базу ради
// одного и того же списка не нужен.
export const revalidate = 60

async function getApprovedThanks() {
  try {
    return await db
      .select()
      .from(thanks)
      .where(isNotNull(thanks.approvedAt))
      .orderBy(desc(thanks.approvedAt))
      .limit(20)
  } catch (error) {
    // База недоступна — страница всё равно должна открыться.
    console.error('[thanks] read failed:', error)
    return []
  }
}

export default async function HomePage() {
  const notes = await getApprovedThanks()

  return (
    <>
      <Header />

      <main>
        {/* Hero */}
        <Container className="py-24 sm:py-32">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            Free tools — 01
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
            Tools we build for ourselves, free for everyone else.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-fg-muted">
            tscodex is where{' '}
            <a
              href={RELATED.webtopro.url}
              className="text-fg underline decoration-border underline-offset-4 transition-colors hover:text-accent"
              rel="noopener"
            >
              webto.pro
            </a>{' '}
            publishes the software it wrote to solve its own problems. No accounts, no
            subscriptions, no telemetry — you bring your own API key and the tool gets out of
            the way.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="#tools"
              className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
            >
              See the tools
            </Link>
            <Link
              href="#partnership"
              className="rounded-md border border-border-strong px-5 py-2.5 text-sm transition-colors hover:border-accent hover:text-accent"
            >
              Work with us
            </Link>
          </div>
        </Container>

        {/* Tools */}
        <Section id="tools">
          <SectionHead
            index="02"
            label="Tools"
            title="What we have published so far."
            intro="Each one came out of real work and is maintained because we use it. The list grows as we build."
          />

          <div className="grid gap-4">
            {PRODUCTS.map((product) => (
              <article
                key={product.slug}
                className="group rounded-lg border border-border bg-surface-1 p-6 transition-colors hover:border-border-strong sm:p-8"
              >
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold tracking-tight">{product.name}</h3>
                      <span className="rounded border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-fg-dim">
                        {KIND_LABEL[product.kind]}
                      </span>
                    </div>
                    <p className="mt-3 text-fg-muted">{product.tagline}</p>
                    {product.platforms && (
                      <p className="mt-3 font-mono text-xs text-fg-dim">
                        {product.platforms.join(' · ')}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link
                      href={`/tools/${product.slug}`}
                      className="rounded-md border border-border-strong px-4 py-2 text-sm transition-colors hover:border-accent hover:text-accent"
                    >
                      Details
                    </Link>
                    {product.links
                      .filter((l) => l.primary)
                      .map((l) => (
                        <a
                          key={l.href}
                          href={l.href}
                          rel="noopener"
                          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
                        >
                          {l.label}
                        </a>
                      ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Section>

        {/* Partnership */}
        <Section id="partnership">
          <SectionHead
            index="03"
            label="Partnership"
            title="Open to working together."
            intro="The free tools are one side of it. The other is that we build software for a living."
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface-1 p-6 sm:p-8">
              <WebtoproMark className="h-6 w-auto text-fg-muted" />
              <h3 className="mt-4 text-lg font-semibold">Custom development</h3>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                System architecture, APIs, admin panels, mobile apps, infrastructure, LLM
                integrations that reach production rather than a demo. 18+ years, 100+ projects.
              </p>
              <a
                href={RELATED.webtopro.url}
                rel="noopener"
                className="mt-6 inline-block font-mono text-xs text-accent transition-opacity hover:opacity-80"
              >
                What we do → webto.pro
              </a>
            </div>

            <div className="rounded-lg border border-border bg-surface-1 p-6 sm:p-8">
              <h3 className="text-lg font-semibold">Partnerships</h3>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                Want one of these tools to support your service, need a variant for your team, or
                have something worth building together? Say what you have in mind — the answer
                comes from a person, not a form.
              </p>
              <a
                href="#contact"
                className="mt-6 inline-block font-mono text-xs text-accent transition-opacity hover:opacity-80"
              >
                Get in touch ↓
              </a>
            </div>
          </div>
        </Section>

        {/* Thanks */}
        <Section id="thanks">
          <SectionHead
            index="04"
            label="Thanks"
            title="Say thanks."
            intro="The tools are free. If one saved you an afternoon, that is worth hearing about."
          />

          <div className="grid gap-10 md:grid-cols-2">
            <div>
              {notes.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <p className="text-sm text-fg-dim">
                    Nobody has said anything yet. Be the first.
                  </p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {notes.map((note) => (
                    <li
                      key={note.id}
                      className="rounded-lg border border-border bg-surface-1 p-5"
                    >
                      <p className="text-sm leading-relaxed text-fg-muted">{note.message}</p>
                      <p className="mt-3 font-mono text-xs text-fg-dim">
                        {note.name}
                        {note.from && <span className="text-fg-dim/70"> — {note.from}</span>}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <ThanksForm />
          </div>
        </Section>

        {/* Contact */}
        <Section id="contact">
          <SectionHead index="05" label="Contact" title="The fastest way is direct." />

          <div className="flex flex-wrap gap-3">
            <a
              href={`mailto:${CONTACTS.email}`}
              className="rounded-lg border border-border px-5 py-3 text-sm transition-colors hover:border-accent hover:text-accent"
            >
              {CONTACTS.email}
            </a>
            <a
              href={CONTACTS.whatsapp.url}
              rel="noopener"
              className="rounded-lg border border-border px-5 py-3 text-sm transition-colors hover:border-accent hover:text-accent"
            >
              WhatsApp → {CONTACTS.whatsapp.display}
            </a>
            <a
              href={CONTACTS.telegram.url}
              rel="noopener"
              className="rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
            >
              Telegram → {CONTACTS.telegram.handle}
            </a>
          </div>
        </Section>
      </main>

      <Footer />

      {/* Структурированные данные: поисковик должен понимать, что это набор
          инструментов от конкретной компании, а не одностраничник ни о чём. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: SITE.title,
            description: SITE.description,
            url: SITE.url,
            publisher: {
              '@type': 'Organization',
              name: 'webto.pro',
              url: RELATED.webtopro.url,
            },
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: PRODUCTS.map((p, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: `${SITE.url}/tools/${p.slug}`,
                name: p.name,
              })),
            },
          }),
        }}
      />
    </>
  )
}

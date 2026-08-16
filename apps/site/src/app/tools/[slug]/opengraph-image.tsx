import { ImageResponse } from 'next/og'
import { getProduct, PRODUCTS, KIND_LABEL } from '@/lib/products'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }))
}

export const alt = 'tscodex tool'

/**
 * Своё превью на каждый инструмент: ссылка в мессенджере показывает, о чём
 * именно страница, а не общую заставку сайта.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getProduct(slug)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#141a1c',
          padding: 80,
          fontFamily: 'system-ui',
        }}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span
            style={{
              fontSize: 20,
              color: '#22d3ee',
              letterSpacing: 4,
              textTransform: 'uppercase',
            }}
          >
            tscodex
          </span>
          {product && (
            <span
              style={{
                fontSize: 18,
                color: '#8a8a8a',
                border: '1px solid #333',
                borderRadius: 4,
                padding: '4px 10px',
              }}
            >
              {KIND_LABEL[product.kind]}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 76,
              fontWeight: 700,
              color: '#f7f7f7',
              letterSpacing: -2,
            }}
          >
            {product?.name ?? 'tscodex'}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 30,
              color: '#a8a8a8',
              lineHeight: 1.35,
              maxWidth: 900,
            }}
          >
            {product?.tagline ?? 'Free developer tools'}
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 22, color: '#666' }}>
          Free — tscodex.com
        </div>
      </div>
    ),
    size
  )
}

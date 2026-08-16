import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'tscodex — free developer tools by webto.pro'

/**
 * Превью для соцсетей и мессенджеров. Собирается на сборке, поэтому картинку
 * не нужно рисовать руками и обновлять при каждой правке текста.
 */
export default function OpengraphImage() {
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
        <div
          style={{
            display: 'flex',
            fontSize: 22,
            color: '#22d3ee',
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          tscodex
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 68,
              fontWeight: 700,
              color: '#f7f7f7',
              lineHeight: 1.1,
              letterSpacing: -2,
            }}
          >
            Tools we build for ourselves,
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 68,
              fontWeight: 700,
              color: '#22d3ee',
              lineHeight: 1.1,
              letterSpacing: -2,
            }}
          >
            free for everyone else.
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 24, color: '#8a8a8a' }}>
          tscodex.com — by webto.pro
        </div>
      </div>
    ),
    size
  )
}

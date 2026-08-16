import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

/**
 * Значок вкладки. На 16px читается только одна буква, поэтому «t» — первая
 * буква имени, тем же цианом, что и акцент сайта.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#141a1c',
          color: '#22d3ee',
          fontSize: 24,
          fontWeight: 700,
          fontFamily: 'system-ui',
          letterSpacing: -1,
          borderRadius: 6,
        }}
      >
        t
      </div>
    ),
    size
  )
}

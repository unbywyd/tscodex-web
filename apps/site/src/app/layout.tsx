import type { Metadata } from 'next'
import { SITE } from '@/lib/site'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    // Страницы продуктов дописывают своё имя перед этим.
    template: '%s — tscodex',
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: 'Artyom Gorlovetskiy', url: 'https://unbywyd.com/' }],
  creator: 'webto.pro',
  keywords: [
    'free developer tools',
    'LLM desktop app',
    'AI text assistant',
    'React Native RTL',
    'Claude skill',
    'open source tools',
  ],
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.title,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: { canonical: SITE.url },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

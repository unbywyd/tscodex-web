import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Ссылки модерации приходят в письме и не должны попасть в индекс.
      disallow: '/api/',
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  }
}

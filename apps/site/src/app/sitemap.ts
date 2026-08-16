import type { MetadataRoute } from 'next'
import { PRODUCTS } from '@/lib/products'
import { SITE } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE.url, changeFrequency: 'monthly', priority: 1 },
    ...PRODUCTS.map((p) => ({
      url: `${SITE.url}/tools/${p.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    // Инструкция по установке — отдельная страница входа: на неё ведут ссылки
    // со стороны, а из каталога до неё два клика.
    { url: `${SITE.url}/tools/room/setup`, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${SITE.url}/tools/room/api`, changeFrequency: 'monthly' as const, priority: 0.6 },
  ]
}

/**
 * Постоянные о сайте — адрес, контакты, ссылки.
 *
 * В одном месте, потому что они расходятся по метаданным, JSON-LD, sitemap и
 * разметке: разъехавшись, они дают поисковику один адрес, а человеку другой.
 */

export const SITE = {
  url: 'https://tscodex.com',
  name: 'tscodex',
  title: 'tscodex — free developer tools by webto.pro',
  description:
    'Free tools we build for our own work and share as they are: a desktop LLM text assistant, a project workspace, and an agent skill for right-to-left React Native layouts.',
  locale: 'en_US',
} as const

export const CONTACTS = {
  email: 'office@webtopro.com',
  telegram: { handle: '@unbywyd', url: 'https://t.me/unbywyd' },
  whatsapp: { display: '+972 50-202-1603', url: 'https://wa.me/972502021603' },
} as const

export const RELATED = {
  webtopro: { label: 'webto.pro', url: 'https://webto.pro/' },
  unbywyd: { label: 'unbywyd.com', url: 'https://unbywyd.com/' },
} as const

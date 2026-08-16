import type { NextConfig } from 'next'

const config: NextConfig = {
  // Отзывы читаются из БД, поэтому полностью статическим сайт быть не может.
  // Всё остальное отдаётся заранее отрендеренным — SEO это и требует.
  poweredByHeader: false,
  compress: true,
}

export default config

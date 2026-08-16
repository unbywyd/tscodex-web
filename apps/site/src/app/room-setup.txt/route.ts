import { SETUP_INSTRUCTIONS } from '@/lib/room-setup'

/**
 * Инструкция простым текстом.
 *
 * Существует ради моделей: страница настройки — это React с разметкой, а сюда
 * можно послать fetch и получить ровно те шаги, что надо выполнить.
 */
export function GET() {
  return new Response(SETUP_INSTRUCTIONS, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // Инструкция меняется редко, но обновление должно доезжать без ожидания
      // суток — час компромисс между этим и лишними запросами.
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

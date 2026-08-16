/**
 * Каталог инструментов tscodex.
 *
 * Один источник для главной, отдельных страниц, sitemap и структурированных
 * данных: разойдись они — поисковик увидел бы одно, человек другое.
 */

export type ProductKind = 'app' | 'project' | 'skill' | 'mcp'

export interface Product {
  /** Часть URL: /tools/<slug>. Меняется — ломается ссылка, так что не меняем. */
  slug: string
  name: string
  kind: ProductKind
  /** Одна строка для карточки и для meta description. */
  tagline: string
  /** Пара абзацев для страницы продукта. */
  description: string[]
  /** Что именно оно делает — по пунктам, без воды. */
  features: { title: string; body: string }[]
  /** Кому это нужно: помогает и человеку, и поиску по длинным запросам. */
  audience: string
  platforms?: string[]
  links: { label: string; href: string; primary?: boolean }[]
  /** Технологии — для страницы и для JSON-LD. */
  stack?: string[]
  /** Файл в /public. */
  logo?: string
  /** Готов к использованию или в работе. */
  status: 'available' | 'in-progress'
}

export const PRODUCTS: Product[] = [
  {
    slug: 'ai-note',
    name: 'AI Note',
    kind: 'app',
    tagline: 'Process any text with an LLM from a tray window — translate, fix, rewrite.',
    description: [
      'AI Note is a desktop app that lives in your system tray. Press a hotkey, paste or type text, press send — the result lands in your history and goes straight to the clipboard.',
      'What happens to the text is defined by a mode, and a mode is one free-form instruction. Write "translate to Hebrew" and you get Hebrew; write "explain like I am five" and you get that. The app adds nothing of its own to what you wrote — there is no separate language picker and no output format setting, because your instruction already says it.',
    ],
    features: [
      {
        title: 'One instruction, no forms',
        body: 'A mode is a single text field. No name, no description, no prompt template — the first line becomes the label in the list.',
      },
      {
        title: 'Refine the result',
        body: 'Not quite right? Write what to change. The model sees the original, its own previous answer and your comment, then updates the same entry instead of creating a new one.',
      },
      {
        title: 'Works with images',
        body: 'Enable Vision and drag an image into the input. Useful for screenshots, scanned documents and anything you would otherwise retype.',
      },
      {
        title: 'Your key, your provider',
        body: 'OpenAI, Anthropic, OpenRouter, DeepSeek, Groq, Ollama, LM Studio — or any OpenAI-compatible endpoint. The key is encrypted locally and never leaves for anywhere except your provider.',
      },
      {
        title: 'Global hotkey',
        body: 'Configurable. Opens the window with the cursor already in the input, so you can start typing immediately.',
      },
      {
        title: 'Nothing to install first',
        body: 'No Node.js, no runtime, no dependencies. Download, install, add your API key.',
      },
    ],
    audience:
      'People who write in a language that is not their first, developers translating documentation, anyone who reaches for a chat window to fix a paragraph and wants it two keystrokes away instead.',
    platforms: ['Windows'],
    stack: ['Electron', 'React', 'TypeScript'],
    links: [
      { label: 'Download for Windows', href: 'https://github.com/unbywyd/ai-note/releases/latest', primary: true },
      { label: 'Source on GitHub', href: 'https://github.com/unbywyd/ai-note' },
    ],
    status: 'available',
  },
  {
    slug: 'room',
    name: 'Room',
    kind: 'mcp',
    tagline: 'Let two Claude chats talk to each other — across machines, or across time.',
    description: [
      'A Claude chat knows nothing about any other chat. Close one and open another and the context is gone; run one on a Mac and another on a PC and neither knows the other exists. A room is a shared thread both connect to by id.',
      'Messages are encrypted on the machine that sends them. The room id doubles as the encryption key and never reaches the relay — what the server stores is a hash and ciphertext, so a database dump or a backup gives an attacker nothing readable.',
    ],
    features: [
      {
        title: 'Pick up where the last chat stopped',
        body: 'Write what matters into the room, and the next chat reads it when it joins. No one has to be present — this works on a single machine with nobody else involved.',
      },
      {
        title: 'Two machines, one id',
        body: 'The chat that starts a room reports an id. Any other chat joins with it, from any machine, and sees the history from the beginning.',
      },
      {
        title: 'Six digits when you have to say it out loud',
        body: 'Six words type cleanly but dictate badly. A room can hand out a six-digit code that expires after a minute and works once — enough to pass a room across the table, too short-lived to be worth guessing.',
      },
      {
        title: 'Hold for a reply',
        body: 'The wait tool holds until someone else writes rather than answering "nothing yet", and takes a longer window when the other side is an agent composing an answer. Polling in a loop would spend a model request per empty check.',
      },
      {
        title: 'Tell a pause from an exit',
        body: 'Silence on its own means nothing — still thinking, closed the session and never arrived all look identical. members lists who has written and how long ago, so a quiet room can be read for what it is.',
      },
      {
        title: 'The server cannot read it',
        body: 'AES-256-GCM, with the key derived from the room id. The id stays on your machines; only its hash is sent. Losing the id means losing the room — there is no recovery, by design.',
      },
      {
        title: 'Deleting means deleting',
        body: 'delete_room destroys the room and every message in it for everyone, with no backup. It requires an owner key held only by the chat that created the room; joining does not grant it.',
      },
      {
        title: 'Nothing to install first',
        body: 'One entry in your Claude Code config. Node 18 or newer is the only requirement, and the skill writes the config for you.',
      },
    ],
    audience:
      'Anyone running Claude Code in more than one window or on more than one machine — and anyone tired of re-explaining the same context to a fresh chat.',
    platforms: ['macOS', 'Windows', 'Linux'],
    stack: ['MCP', 'TypeScript', 'Node'],
    links: [
      { label: 'Setup instructions', href: '/tools/room/setup', primary: true },
      { label: 'npm package', href: 'https://www.npmjs.com/package/@tscodex/room' },
      { label: 'Source on GitHub', href: 'https://github.com/unbywyd/mcp-room' },
    ],
    status: 'available',
  },
  {
    slug: 'chatick',
    name: 'Chatick',
    kind: 'project',
    tagline: 'Project workspace where the AI assistant is a participant, not a sidebar.',
    description: [
      'Chatick is a workspace for running projects: tasks, documents, time tracking and chat in one place, built so an AI agent can work inside it rather than beside it.',
      'It is a separate product with its own site — listed here because it comes from the same workshop.',
    ],
    features: [
      { title: 'Tasks and sprints', body: 'Plan work, assign it, track how long it actually took.' },
      { title: 'Documents', body: 'Collaborative editing, shareable by public link when you need it.' },
      { title: 'Agent access', body: 'A bridge lets an external AI agent read and update the project directly.' },
    ],
    audience: 'Small teams and solo developers who want project state an agent can actually reach.',
    links: [{ label: 'Visit chatick.com', href: 'https://chatick.com/', primary: true }],
    logo: '/chatick.svg',
    status: 'available',
  },
  {
    slug: 'rtl-react-native-skill',
    name: 'RTL for React Native',
    kind: 'skill',
    tagline: 'A Claude skill that gets right-to-left layouts right in React Native.',
    description: [
      'Hebrew, Arabic, Farsi and Urdu layouts break in ways that produce no warning: the framework already mirrored the layout, the code mirrors it again, and the result looks almost correct. Reviewing a mirrored mockup makes it worse — it is easy to reimplement the mirroring that is already happening.',
      'This skill teaches Claude what actually happens on device. Every rule in it comes from measurements on real Android and iOS hardware, not from documentation claims — several of which turned out to be wrong and are corrected here.',
    ],
    features: [
      {
        title: 'Measured, not assumed',
        body: 'Rules are backed by hardware measurements across both platforms. Widely repeated claims about RTL behaviour that do not survive testing are called out.',
      },
      {
        title: 'DirectionProvider and useDirection',
        body: 'Direction kept in app state rather than read from I18nManager.isRTL, which proved unreliable. Live language switching works on both platforms.',
      },
      {
        title: 'Six ESLint rules',
        body: 'Catch the silent failures: physical style properties instead of logical ones, isRTL reads, missing BiDi isolation around phone numbers and other sensitive strings.',
      },
      {
        title: 'Activates on its own',
        body: 'Claude picks it up when it sees RTL work or the symptoms of it — flipped layouts, text aligned the wrong way, an icon pointing backwards.',
      },
    ],
    audience:
      'React Native and Expo developers shipping to Hebrew or Arabic markets, and anyone debugging a layout that mirrors twice.',
    stack: ['React Native', 'Expo', 'ESLint'],
    links: [
      {
        label: 'Get it on GitHub',
        href: 'https://github.com/unbywyd/claude-skill-rtl-react-native',
        primary: true,
      },
    ],
    status: 'available',
  },
]

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug)
}

export const KIND_LABEL: Record<ProductKind, string> = {
  app: 'Desktop app',
  project: 'Project',
  skill: 'Agent skill',
  mcp: 'MCP server',
}

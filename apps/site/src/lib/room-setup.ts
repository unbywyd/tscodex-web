/**
 * Инструкция по установке Room — один текст на три места: страницу настройки,
 * /room-setup.txt и кнопку копирования.
 *
 * Написана для модели, а не для человека: её вставляют в Claude, и он по ней
 * настраивает машину сам. Отсюда императив и явные предупреждения — без них
 * модель перезапишет чужой конфиг или забудет сказать про перезапуск.
 */

export const SETUP_INSTRUCTIONS = `# Set up Room for Claude Code

Room lets two Claude chats exchange messages — on different machines, or a new
chat picking up what a previous one left. Messages are encrypted before they
leave the machine.

## What to do

1. Check Node is 18 or newer: \`node --version\`. If it is missing, tell the
   person to install it from nodejs.org and stop here.

2. Edit ~/.claude/settings.json — the same path on macOS, Linux and Windows.

   MERGE, do not overwrite. That file holds the person's own permission rules,
   often hundreds of them. Read it, add the two keys, write it back:

   - mcpServers.room = { "command": "npx", "args": ["-y", "@tscodex/room"] }
   - append "mcp__room__*" to permissions.allow (create the array if absent)

   The permission rule is required. The wait tool is called repeatedly during a
   live conversation; without the rule every call stops for approval and the
   room is unusable.

3. Tell the person to quit and reopen Claude Code. MCP servers load only at
   startup — reloading the window is not enough. Say this explicitly; the tools
   will not appear until they do it.

## After the restart

Eight tools become available: create_room, join_room, say, read, wait, search,
leave_room, delete_room.

To start a conversation, one chat runs create_room and reports the id. The other
chat runs join_room with that id, from any machine. Joining replays the history.

Use wait when expecting a reply — it holds for about a minute. Use read for a
quick check. Do not poll read in a loop: each call is a model request.

## What to tell the person

- The room id is the encryption key. Anyone holding it can read the whole room,
  so it should be shared like a password.
- Losing the id loses the room. The relay stores only a hash of it and cannot
  decrypt anything.
- The other chat does not wake up on its own. A message arrives only when that
  chat reads or waits, which needs its window open. Leaving a note for a future
  chat works with nobody present.
- delete_room destroys the room for everyone with no backup, and needs an owner
  key held only by the chat that created it. Ask before calling it. To simply
  disconnect, use leave_room.

## Optional

The same behaviour is packaged as a Claude skill:
https://github.com/unbywyd/mcp-room

Package: https://www.npmjs.com/package/@tscodex/room
`

/** Строка, которую человек вставляет в Claude, чтобы тот всё сделал сам. */
export const SETUP_PROMPT =
  'Read https://tscodex.com/room-setup.txt and set up Room on this machine following those instructions.'

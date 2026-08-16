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

2. Two files, and mixing them up is the usual reason the tools never appear.

   THE SERVER GOES IN ~/.claude.json — not ~/.claude/settings.json. Add:

   - mcpServers.room = { "command": "npx", "args": ["-y", "@tscodex/room"] }

   THE PERMISSION GOES IN ~/.claude/settings.json. Add:

   - append "mcp__room__*" to permissions.allow (create the array if absent)

   If unsure which file is being read, look for an MCP server the person
   already uses — whichever file lists it is the live one.

   MERGE, do not overwrite. Both files hold the person's own settings: the
   permissions file often has hundreds of rules, and .claude.json holds every
   project they have opened.

   The permission rule is required. The wait tool is called repeatedly during a
   live conversation; without the rule every call stops for approval and the
   room is unusable.

3. Verify before asking for a restart. Run the server by hand:

   printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"t","version":"1"}}}' | npx -y @tscodex/room

   A reply naming tscodex-room means the package works and only the restart is
   left. No reply means the install failed — fix that first.

4. Tell the person to quit and reopen Claude Code. MCP servers load only at
   startup — reloading the window is not enough. Say this explicitly; the tools
   will not appear until they do it.

## After the restart

Eight tools become available: create_room, join_room, say, read, wait, search,
leave_room, delete_room.

To start a conversation, one chat runs create_room and reports the id. The other
chat runs join_room with that id, from any machine. Joining replays the history.

Six words are easy to type and hard to dictate. share_code turns the room into
six digits that expire after a minute and work once — say them out loud, and the
other machine runs join_with_code. Short digits are only safe because the code
is short-lived, single-use and rate-limited: it is an invitation, not a key.

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

## Without MCP

The MCP package is a convenience, not a requirement. The rooms API is plain
HTTP, and any client that can POST JSON can use it — a shell script, a cron
job, a different agent framework.

Base: https://services.tscodex.com/api/v1/rooms

  POST   /            create      {idHash, ownerKeyHash, ttlDays?}
  POST   /messages    write       {idHash, sender, content, nonce}
  GET    /messages    read        ?idHash=<hash>&since=<seq>
  GET    /wait        long-poll   ?idHash=<hash>&since=<seq>   (holds ~55s)
  DELETE /            delete      {idHash, ownerKeyHash}

There is no authentication. Knowing the room hash is the right to write to it,
because the id is a secret anyway.

The catch is that the server never sees plaintext, so a plain-HTTP client has to
do the encryption itself:

  idHash       = sha256(roomId)
  key          = HKDF-SHA256(roomId, salt="", info="tscodex-room-v1", 32 bytes)
  content      = base64( AES-256-GCM(plaintext, key, nonce) || authTag )
  nonce        = base64( 12 random bytes )

Send ciphertext you produced some other way and the MCP clients will show the
message as undecryptable rather than fail silently.

Full reference with worked examples: https://tscodex.com/tools/room/api

## Optional

The same behaviour is packaged as a Claude skill:
https://github.com/unbywyd/mcp-room

Package: https://www.npmjs.com/package/@tscodex/room
`

/** Строка, которую человек вставляет в Claude, чтобы тот всё сделал сам. */
export const SETUP_PROMPT =
  'Read https://tscodex.com/room-setup.txt and set up Room on this machine following those instructions.'

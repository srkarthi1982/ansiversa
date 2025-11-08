# ðŸ“‹ Clipboard Manager â€” Full Requirements (Ansiversa)

Codexâ€‘ready specification for building the **Clipboard Manager** mini app. Target stack: **Astro (SSR)** + **Tailwind** + **Alpine.js** + **Astro DB**, deployed on **Vercel**. Privacyâ€‘first, crossâ€‘device clipboard with rich items (text, links, code, images), quick actions, and powerful search.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### What it does
- Captures **snippets** from the web/app (text, links, code blocks, images, HTML â†’ Markdown), organizes them into **boards/folders**, and syncs across devices.
- Offers **quick actions** (copy, format, share, export, transform with AI), **hotkeys**, and **templates**.
- Works standalone and as a **universal clipboard** for other Ansiversa mini apps (Blog Writer, Email Polisher, Snippet Generator, QR Code Creator, etc.).

### Core Features
- **Clip types**: plain text, rich text (HTML/MD), URLs, code (language tagged), images (PNG/JPEG/SVG), files (small), tables (CSV/TSV), color values (#hex, rgb), credentials (masked), phone/email.
- **Capture**: paste/upload, **browser extension (v2)**, dragâ€‘drop, â€œSave selectionâ€ bookmarklet, **/clip API**, image OCR (v2).
- **Organization**: boards/folders, tags, pin/star, favorites, recents, quick collections (Today, This device).
- **Search**: fullâ€‘text, filters (type, board, date, source app/device), code language, exact match, **semantic search (v2)**.
- **Quick actions**: copy, share link, download, convert case, trim/clean, URL UTM add/remove, code format, **AI transforms** (summarize, rewrite, translate).
- **Clipboard sync**: push clip to this device (client permission), **oneâ€‘time copy link** (expire after use).
- **History**: undo/redo, versions per clip, last n copies on device.
- **Import/Export**: CSV/JSON/Markdown bundle; ZIP (with assets).

### Key Pages
- `/clipboard` â€” Home (boards, recents, search).
- `/clipboard/board/[id]` â€” Board view (grid/list, filters).
- `/clipboard/clip/[id]` â€” Clip detail (preview, actions, versions).
- `/clipboard/settings` â€” Preferences (hotkeys, privacy, default board, retention, device name).
- `/clipboard/api` â€” Docs for programmatic capture.

### Minimal Data Model
`Clip`, `Board`, `ClipTag`, `Tag`, `Device`, `ShareLink`, `Attachment`, `Version`, `Profile`, `ImportJob`, `ExportJob`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Storage | 200 MB | 10 GB |
| Max clip size | 1 MB | 50 MB |
| AI transforms | 20/mo | 1,000/mo |
| Share links | 10 active | 200 active |
| History per clip | 5 versions | 100 versions |
| Retention | 90 days | Unlimited |
| OCR/Semantic search | â€” | âœ… |
| Browser extension | âœ… (basic) | âœ… (batch + context) |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Information Architecture & Routes

**Pages**
- `/clipboard` â€” global search, â€œNew Clipâ€, boards sidebar, recents, pinned.
- `/clipboard/board/[id]` â€” sortable grid/list; bulk select; dragâ€‘drop reorder; filters.
- `/clipboard/clip/[id]` â€” preview (render MD, syntax highlight code, image preview), actions, versions, metadata.
- `/clipboard/settings` â€” device name, hotkeys, default board, autoâ€‘copy after paste, retention, privacy options.

**API (SSR)**
- Clips: `POST /clipboard/api/clip/save`, `GET /clipboard/api/clip/get?id=`, `POST /clipboard/api/clip/delete`
- Boards: `POST /clipboard/api/board/save`, `POST /clipboard/api/board/delete`, `GET /clipboard/api/board/list`
- Search: `GET /clipboard/api/search?q=&type=&board=&from=&to=`
- Uploads: `POST /clipboard/api/upload` (multipart) â†’ returns `attachmentId`
- Share: `POST /clipboard/api/share/create`, `POST /clipboard/api/share/revoke`, `GET /clipboard/api/share/get?id=`
- Import/Export: `POST /clipboard/api/import`, `GET /clipboard/api/export?id=`
- Device sync: `POST /clipboard/api/push` (send clip to device), `GET /clipboard/api/pull?since=`
- AI transforms: `POST /clipboard/api/ai/transform` (Pro)

---

### 2) Data Model (Astro DB / SQL)

**Clip**  
- `id` (uuid pk), `userId` (fk), `boardId` (fk|null), `type` ('text'|'url'|'code'|'image'|'file'|'table'|'color'|'credential'), `title` (text|null), `content` (text/json), `lang` (text|null), `size` (int), `hash` (text), `source` (json:{app,device,context,url}), `tags` (json), `pinned` (bool), `favorite` (bool), `createdAt`, `updatedAt`, `deletedAt` (nullable)

**Attachment** (for images/files)  
- `id` (pk), `clipId` (fk), `path` (text), `mime` (text), `bytes` (int), `width` (int|null), `height` (int|null), `createdAt`

**Version**  
- `id` (pk), `clipId` (fk), `content` (text/json), `createdAt`

**Board**  
- `id` (pk), `userId` (fk), `name` (text), `color` (text|null), `sort` (int), `createdAt`

**Tag** / **ClipTag**  
- `id` (pk), `name` (text unique), `color` (text|null); join table `clipId` + `tagId`

**ShareLink**  
- `id` (pk), `clipId` (fk), `token` (text unique), `expiresAt` (datetime|null), `oneTime` (bool), `createdAt`

**Device**  
- `id` (pk), `userId` (fk), `name` (text), `key` (text unique), `lastSeenAt` (datetime)

**ImportJob** / **ExportJob**  
- `id` (pk), `userId` (fk), `status` ('queued'|'running'|'done'|'error'), `payload` (json), `resultUrl` (text|null), `createdAt`

Indexes: `Clip.userId+updatedAt`, `Clip.hash`, `ShareLink.token`, `Device.key`, fullâ€‘text on `Clip.title+content` (SQLite FTS5 if available).

---

### 3) UX / UI

- **Global command bar** (âŒ˜/Ctrl+K): New Clip, Paste asâ€¦, Move to board, Copy as, Transform.
- **Dragâ€‘drop**: move clips across boards; reorder pins.
- **Preview renderers**: Markdown, code highlight, link unfurl (title/image), image/lightbox, color swatch.
- **Quick actions** on hover: Copy, Edit, Share, Favorite, Delete.
- **Bulk actions**: merge, move, tag, export.
- **Hotkeys**:  
  - New clip = `N`, Paste = `V`, Copy = `C`, Search focus = `/`, Edit = `E`, Delete = `Del`.
- **Device push**: button on each clip to send to a registered device (show toast on target).

---

### 4) Clipboard Integration (Browser & App)

- Use **Clipboard API** (`navigator.clipboard.read/write`) with explicit user gesture permission.
- **Autoâ€‘capture** toggle: on paste, prompt â€œSave to Clipboard Manager?â€ (remember decision).
- **Oneâ€‘time copy link**: generates a short URL which copies content to clipboard when opened once; then expires.
- **MIME handling**: text/plain, text/html, image/png/jpeg/svg, text/csv; normalize HTMLâ†’Markdown snapshot.

---

### 5) AI Transforms (Pro)

Actions on text/code clips:
- Summarize, Rephrase, Translate (EN/AR/TA etc.), Fix grammar, Make tweet / caption, Generate title, Extract key points.
- Code: Format/Prettify, Explain code, Convert language (JSâ†”TS, Pythonâ†”JS partial), Add docstring.
- Bulk transform for selected clips; output as new clip (keep original).

---

### 6) Privacy, Security & Compliance

- **Serverâ€‘side encryption** at rest for **credentials** clip type; mask in UI; require reâ€‘auth to reveal.
- Hide sensitive clip content in preâ€‘rendered HTML (SSR) unless owner is logged in.
- **Share links** are **tokenized**; support **oneâ€‘time** and/or expiration; revoke anytime.
- **Rate limits** on API endpoints; payload size guards.
- CORS limited to Ansiversa origins; CSRF protect stateâ€‘changing POSTs.
- Delete flows: softâ€‘delete with 30â€‘day trash (Pro: restore); hardâ€‘delete on purge.
- Logs exclude clip content; store minimal metadata.

---

### 7) Limits & Retention

| Limit | Free | Pro |
|---|---|---|
| Max clip size | 1 MB | 50 MB |
| Total storage | 200 MB | 10 GB |
| Versions/clip | 5 | 100 |
| Share links | 10 active | 200 active |
| Device connections | 2 | 10 |
| Trash retention | 15 days | 90 days |

---

## ðŸ§© PART 3 â€” TECH NOTES (for Codex)

### Suggested File Layout

```
src/pages/clipboard/index.astro
src/pages/clipboard/board/[id].astro
src/pages/clipboard/clip/[id].astro
src/pages/clipboard/settings.astro

src/pages/clipboard/api/clip/save.ts
src/pages/clipboard/api/clip/get.ts
src/pages/clipboard/api/clip/delete.ts
src/pages/clipboard/api/board/save.ts
src/pages/clipboard/api/board/delete.ts
src/pages/clipboard/api/board/list.ts
src/pages/clipboard/api/search.ts
src/pages/clipboard/api/upload.ts
src/pages/clipboard/api/share/create.ts
src/pages/clipboard/api/share/revoke.ts
src/pages/clipboard/api/share/get.ts
src/pages/clipboard/api/import.ts
src/pages/clipboard/api/export.ts
src/pages/clipboard/api/push.ts
src/pages/clipboard/api/pull.ts
src/pages/clipboard/api/ai/transform.ts

src/lib/clipboard/extract.ts        # sanitize/normalize incoming data
src/lib/clipboard/search.ts         # FTS setup and queries
src/lib/clipboard/share.ts          # tokenized links + one-time copy
src/lib/clipboard/devices.ts        # device registration & push
src/lib/clipboard/ai.ts             # wrappers for AI transforms
src/lib/clipboard/mime.ts           # mime detect/convert (htmlâ†’md, csvâ†’table)
```

### Pseudocode: Save Clip
```ts
// /clipboard/api/clip/save.ts
const input = await readRequest();
const normalized = extract(input); // detect type, sanitize, compute hash, size
const clip = await db.insert('Clip', {...normalized, userId, createdAt:new Date()});
return json({ ok: true, id: clip.id });
```

### Pseudocode: Oneâ€‘time Copy Link
```ts
// /clipboard/api/share/create.ts
const token = randomToken();
await db.insert('ShareLink', { clipId, token, oneTime:true, expiresAt:addHours(new Date(), 1) });
return { url: `/s/${token}` };
```

Add route handler:
```
src/pages/s/[token].ts  // copies content (text/plain) and marks link as used
```

---

## âœ… ACCEPTANCE CRITERIA

- [ ] Create, edit, delete clips (text, url, code, image) with preview and quick actions.
- [ ] Fullâ€‘text search with filters and sorting works across all clips.
- [ ] Boards/tags, pin/star, favorites, recents implemented.
- [ ] Import (CSV/JSON/MD bundle) and export (ZIP with assets).
- [ ] Oneâ€‘time copy link works and expires after first use.
- [ ] Device push pulls to the target device (with user permission).
- [ ] AI transforms (Pro) available and billed against plan quotas.
- [ ] Privacy: masked credentials, tokenized share links, softâ€‘delete & purge.

---

**End of Requirements â€” Ready for Codex Implementation.**
# ðŸ”§ Snippet Generator â€” Full Requirements (Ansiversa)

Codexâ€‘ready specification for building the **Snippet Generator** mini app.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### What it does
**Snippet Generator** creates, stores, and reuses **text/code/email/UI** snippets with **variables, prompts, and dynamic placeholders**. It supports **parameterized templates**, **AIâ€‘assisted generation**, **multiâ€‘language code syntax**, **macros**, **clipboard/oneâ€‘click copy**, **sharing to other Ansiversa apps**, and **version history**. Snippets can be organized into **collections**, tagged, and exported as **JSON/MD** or installed as a **local hotkey pack** (optional).

### Core Features
- **Template variables**: `{name}`, `{date:YYYYâ€‘MMâ€‘DD}`, `{company}`, `{locale}`, `{custom:regex}` with live form.  
- **AI assist**: generate draft from a short brief; convert between languages (JSâ†’TS, Pythonâ†’Go), style/tone rewrite.  
- **Code & text modes**: syntax highlighting, fenced code blocks, language metadata, line numbering, tabs vs spaces.  
- **Macros**: pre/post transforms (minify, prettify, wrap in try/catch, add logging, add headers/footers).  
- **Parameters & presets**: save parameter sets as named presets; quick apply on paste.  
- **Snippets types**: code, email, UI component, SQL, regex, marketing copy, legal boilerplate, support replies.  
- **Insert destinations**: copy to clipboard, download file, insert into **Email Polisher**, **Blog Writer**, **Resume**, etc.  
- **Search**: fullâ€‘text with tags, type, language, last used, favorites, and fuzzy match.  
- **Versioning**: perâ€‘snippet versions with diff viewer and rollback.  
- **Permissions**: personal by default; shareâ€‘link (private) and org collections (future).  
- **Exports/Imports**: JSON (schema), Markdown catalog, `.zip` with files.  
- **Safety**: secret detector (API keys), PII mask, license header reminders.

### Key Pages
- `/snippets` â€” Library (collections, search, filters)  
- `/snippets/new` â€” Create wizard (type, language, variables)  
- `/snippets/[id]` â€” Editor (Content, Variables, Preview, Versions)  
- `/snippets/import` â€” Import center  
- `/snippets/settings` â€” Defaults (tabs/spaces, licenses, secret/PII rules)

### Minimal Data Model
`Snippet`, `SnippetVersion`, `Variable`, `Preset`, `Collection`, `Tag`, `ExportJob`, `ImportJob`, `UsageLog`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Snippets | 100 | Unlimited |
| Collections | 5 | Unlimited |
| Versions/snippet | 10 | Unlimited |
| AI assist | Basic | Full (code refactor + tone) |
| Export formats | JSON | + MD/ZIP |
| Secret/PII scans | Basic | Advanced (regex + entropy) |
| History | 60 days | Unlimited |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives & Nonâ€‘Goals
**Objectives**
- Provide a **fast repository** of reusable snippets with **parametrization** and **safe pasting**.  
- Enable **AIâ€‘assisted** creation/refactor while **preserving variables** and formatting.  
- Keep outputs **portable** across Ansiversa apps and external tools.

**Nonâ€‘Goals (v1)**
- Not a full IDE or package manager.  
- No realâ€‘time multiuser collab (shareâ€‘link only in v1).

---

### 2) Information Architecture & Routes

**Pages**
- `/snippets` â€” Library with sidebar (collections/tags), cards list, search, quick copy.  
- `/snippets/new` â€” Type, language, variable detection, starter from AI.  
- `/snippets/[id]` â€” Tabs: **Content**, **Variables**, **Preview**, **Versions**, **Meta** (tags, type, language).  
- `/snippets/import` â€” Upload JSON/MD/ZIP; map to collections and tags.  
- `/snippets/settings` â€” Tabs/spaces, licenses, secret/PII rules, default language, copy formatting.

**API (SSR)**
- Snippet CRUD: `POST /snippets/api/create` Â· `GET /snippets/api/get?id=` Â· `POST /snippets/api/update` Â· `POST /snippets/api/delete`  
- Variables & presets: `POST /snippets/api/variable/extract` Â· `POST /snippets/api/preset/save` Â· `POST /snippets/api/preset/delete`  
- Versions: `POST /snippets/api/version/create` Â· `GET /snippets/api/version/list?id=` Â· `POST /snippets/api/version/rollback`  
- AI assist: `POST /snippets/api/ai/generate` Â· `POST /snippets/api/ai/refactor` Â· `POST /snippets/api/ai/rewrite`  
- Search: `GET /snippets/api/search?q=&filters=`  
- Export/Import: `POST /snippets/api/export` (json|md|zip) Â· `GET /snippets/api/export/status?id=` Â· `POST /snippets/api/import`  
- Utilities: `POST /snippets/api/secret/scan` Â· `POST /snippets/api/pii/scan` Â· `POST /snippets/api/format` (prettify|minify|lint)  
- Usage: `POST /snippets/api/usage/log` (copy|download|insert)

Optional WebSocket `/snippets/ws` for live preview and diff stream.

---

### 3) Variables, Macros & Preview

- **Variable syntax**: `{var}`, `{var:default}`, `{date:YYYYâ€‘MMâ€‘DD}`, `{uuid}`, `{counter}`, `{choice:a|b|c}`, `{custom:/regex/}`.  
- **UI for variables**: autoâ€‘detect vars; allow type (text, number, date, choice), default, validation (regex), required.  
- **Macros**: sequence of transforms applied on output:  
  - Code: `prettify(language)`, `minify`, `wrapTryCatch`, `addConsoleLog`, `addHeader(license)`.  
  - Text: `uppercase`, `titleCase`, `addSignature`, `wrapMarkdown`.
- **Preview**: form on the left (variables), rendered snippet on the right; **copy**, **download file** (with suggested extension), **insert into** other apps.

---

### 4) AI Assist Behaviour

- **Generate**: user gives a brief (â€œNode email validator functionâ€); app proposes snippet with inferred variables and language; shows explanation notes.  
- **Refactor**: change language (JSâ†’TS), framework (Fetchâ†’Axios), or style (functionalâ†’OO).  
- **Rewrite**: tone changes for text snippets; keep variables **exactly as placeholders**.  
- **Guards**: never output secret keys in examples; mask `.env` patterns; add â€œTODO: set env varâ€.

---

### 5) Data Model (Astro DB / SQL)

**Snippet**  
- `id` (uuid pk), `userId`, `title`, `type` ('code'|'text'|'email'|'sql'|'regex'|'ui'|'other'), `language` (text|null), `content` (longtext), `collections` (json), `tags` (json), `macros` (json), `vars` (json), `favorite` (bool), `createdAt`, `updatedAt`

**SnippetVersion**  
- `id` (pk), `snippetId` (fk), `content` (longtext), `vars` (json), `macros` (json), `notes` (text), `createdAt`

**Variable**  
- `id` (pk), `snippetId` (fk), `key` (text), `type` ('text'|'number'|'date'|'choice'|'uuid'|'counter'|'custom'), `default` (text|null), `regex` (text|null), `required` (bool), `meta` (json)

**Preset**  
- `id` (pk), `snippetId` (fk), `name` (text), `values` (json)

**Collection**  
- `id` (pk), `userId`, `name` (text), `icon` (text|null), `order` (int)

**Tag**  
- `id` (pk), `name`, `color`

**ExportJob**  
- `id` (pk), `userId`, `format` ('json'|'md'|'zip'), `status` ('queued'|'running'|'done'|'error'), `url` (text|null), `createdAt`

**ImportJob**  
- `id` (pk), `userId`, `status` ('queued'|'done'|'error'), `report` (json), `createdAt`

**UsageLog**  
- `id` (pk), `snippetId` (fk), `action` ('copy'|'download'|'insert'), `target` (text|null), `createdAt`

Indexes: `Snippet.userId+title`, `Snippet.tags`, `UsageLog.snippetId`.

---

### 6) UX / UI

- **Library view**: grid/list toggle; quick copy button; hover shows primary variables; tag chips; usage count.  
- **Editor**: code editor with language switch; variables panel; preview with macro pipeline; version timeline.  
- **Keyboard**: `Cmd/Ctrl+C` copy output, `Cmd/Ctrl+S` save, `Cmd/Ctrl+K` AI assist, `Cmd/Ctrl+.` open variables.  
- **Import**: drop JSON/MD/ZIP; mapping wizard to collections and tags; conflict resolver.  
- Accessibility: screenâ€‘reader labels for variable inputs, high contrast theme, large font toggle.

---

### 7) Validation & Safety

- Do not allow hardâ€‘coded secrets (AWS keys, bearer tokens); secret scan must warn/block.  
- PII scan highlights emails, phones, IDs; allow redaction.  
- Variable keys must be unique per snippet; `{custom:/regex/}` must compile.  
- Macro pipeline must preserve fenced code blocks and markdown integrity.  
- Maximum output per render: 100k chars; file download requires an extension whitelist.  
- On export, strip usage analytics and private notes unless user opts in.

---

### 8) Plans & Limits

| Feature | Free | Pro |
|---|---|---|
| Snippets | 100 | Unlimited |
| Versions/snippet | 10 | Unlimited |
| Exports/day | 10 | 100 |
| Imports/day | 5 | 50 |
| AI calls/day | 50 | 400 |
| History | 60 days | Unlimited |

Rate limits: `/ai/generate` 100/day (Free) 600/day (Pro); `/ai/refactor` 60/day (Free) 300/day (Pro).

---

### 9) Suggested File Layout

```
src/pages/snippets/index.astro
src/pages/snippets/new.astro
src/pages/snippets/[id].astro
src/pages/snippets/import.astro
src/pages/snippets/settings.astro

src/pages/snippets/api/create.ts
src/pages/snippets/api/get.ts
src/pages/snippets/api/update.ts
src/pages/snippets/api/delete.ts
src/pages/snippets/api/variable/extract.ts
src/pages/snippets/api/preset/save.ts
src/pages/snippets/api/preset/delete.ts
src/pages/snippets/api/version/create.ts
src/pages/snippets/api/version/list.ts
src/pages/snippets/api/version/rollback.ts
src/pages/snippets/api/ai/generate.ts
src/pages/snippets/api/ai/refactor.ts
src/pages/snippets/api/ai/rewrite.ts
src/pages/snippets/api/search.ts
src/pages/snippets/api/export.ts
src/pages/snippets/api/export/status.ts
src/pages/snippets/api/import.ts
src/pages/snippets/api/secret/scan.ts
src/pages/snippets/api/pii/scan.ts
src/pages/snippets/api/format.ts

src/components/snippets/Library/*.astro
src/components/snippets/Editor/*.astro
src/components/snippets/Variables/*.astro
src/components/snippets/Preview/*.astro
src/components/snippets/Versions/*.astro
```

---

### 10) Future Enhancements (v2+)

- **Hotkey client** (desktop/browser extension) to paste snippets anywhere with `;trigger`.  
- **Org collections** with roles and approvals.  
- **Snippet marketplace** (community packs with licenses).  
- **Code runners** (sandbox execute small snippets).  
- **Telemetry** dashboards (most used snippets, time saved).

---

**End of Requirements â€” Ready for Codex Implementation.**
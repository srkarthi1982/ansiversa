# âœ‰ï¸ Email Polisher â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/email`  
**Category:** Career and Professional  
**Stack:** Astro + Tailwind (islands where needed), Astro SSR API routes, Astro DB / Supabase  
**Goal:** Help users **write, rewrite, and optimize** emails fast â€” with tone control, grammar/style fixes, reply suggestions, thread summaries, and reusable templates.

> ðŸ” **Privacy:** Content may be processed by AI. Provide an **ephemeral mode** (â€œdo not retain after outputâ€) and clearly mark any data saved to the database.

---

## 1) Objectives and Nonâ€‘Goals

### Objectives
- **Rewrite/Polish** any email to a selected tone and formality (e.g., friendly, professional, concise).  
- **Grammar and Clarity** fixes; **shorten/expand** options.  
- **Reply Suggestions**: paste an incoming email â†’ get 3 suggested replies.  
- **Thread Summary**: paste a thread â†’ get key points and asks.  
- **Personalization**: smart placeholders (e.g., `{FirstName}`, `{Company}`, `{Role}`) with quick fill.  
- **Templates**: reusable email templates (cold outreach, followâ€‘up, status update, apology, intro, etc.).  
- **Signatures** and brand blocks; detect schedule/time zone hints.  
- **Export/Copy** to clipboard; optional `mailto:` prefill; v2 SMTP send.

### Nonâ€‘Goals (v1)
- No inbox connection or OAuth to Gmail/Outlook (v2).  
- No bulk email campaigns or tracking pixels.  
- No attachments management beyond inline image links (v2).

---

## 2) User Stories (with Acceptance Criteria)

1. **Polish Email**
   - *As a user*, I can paste text and choose a tone (Professional, Friendly, Concise, Assertive, Empathetic) and formality.  
   - **AC:** `/email/api/polish` returns a refined version preserving intent, with optional **subject line suggestions**.

2. **Reply Suggestions**
   - *As a user*, I can paste an incoming email and generate 3 candidate replies.  
   - **AC:** `/email/api/reply` returns variants with adjustable tone and length; includes an **acknowledge-only** option.

3. **Thread Summary**
   - *As a user*, I can paste a long thread and get a **summary with action items** and **open questions**.  
   - **AC:** `/email/api/summarize` returns bullets + suggested next steps; optional subject update.

4. **Shorten/Expand/Rewrite**
   - *As a user*, I can click quick actions: **Shorten**, **Expand**, **Make Polite**, **Make Clear**, **Fix Grammar**.  
   - **AC:** `/email/api/rewrite` returns the transformed text and highlights changes (diff optional).

5. **Templates and Variables**
   - *As a user*, I can pick a template and auto-fill `{FirstName}`, `{Company}`, `{Role}`, `{MyName}`, `{MyTitle}`.  
   - **AC:** `/email/api/render-template` merges variables with preview; missing fields prompt quick fill.

6. **Signature and Brand Block**
   - *As a user*, I can define a **default signature** and optional brand footer.  
   - **AC:** Signature appended automatically on copy/export; can be toggled per email.

7. **Localization and Translate**
   - *As a user*, I can translate my email to another language while keeping tone.  
   - **AC:** `/email/api/translate` returns translated draft; RTL support for Arabic.

8. **Export/Copy**
   - *As a user*, I can **copy** polished text; export **.md** or **.txt**; open **mailto:** with subject/body prefilled.  
   - **AC:** Buttons work across mobile/desktop; newline and URL encoding safe.

9. **Plan Gating**
   - Free: 30 polishes/month, 5 templates, watermark â€œPolished with Ansiversaâ€ (on copy/export).  
   - Pro: unlimited polishes (fair-use), unlimited templates, no watermark, translate and thread summary unlocked.

---

## 3) Information Architecture and Routes

- `/email` â€” Dashboard and Quick Polish (paste box + tone controls + output pane)  
- `/email/editor` â€” Full editor with templates, variables, signature, history  
- `/email/templates` â€” Template gallery (create/edit/duplicate)  
- `/email/history` â€” (optional) Saved drafts/polishes
  
**API (SSR):**  
- `POST /email/api/polish`  
- `POST /email/api/reply`  
- `POST /email/api/summarize`  
- `POST /email/api/rewrite`  
- `POST /email/api/translate`  
- `POST /email/api/render-template`  
- `POST /email/api/save` (draft + metadata; autosave in editor)  
- `POST /email/api/delete`  
- `POST /email/api/duplicate`

---

## 4) Database Model (Astro DB / SQL)

**User**  
- `id` (pk), `email` (unique), `plan`, `displayName`, `company`, `role`, `timezone`, `createdAt`

**EmailDraft**  
- `id` (pk uuid), `userId` (fk), `title` (string), `status` ('draft'|'final'),  
  `input` (longtext), `output` (longtext), `language` (string, 'en'), `tone` (string), `formality` ('low'|'medium'|'high'),  
  `subject` (string), `variables` (json), `signatureEnabled` (boolean),  
  `lastSavedAt` (datetime), `createdAt` (datetime)

**Template**  
- `id` (pk), `userId` (fk), `name` (string), `category` (string), `body` (longtext with `{Placeholders}`), `language` (string), `createdAt`

**Signature**  
- `id` (pk), `userId` (fk), `display` (text/html-safe), `enabled` (boolean), `createdAt`

**Contact** (optional, for variable fill)  
- `id` (pk), `userId` (fk), `firstName`, `lastName`, `company`, `email`, `role`, `notes`, `createdAt`

**History** (optional)  
- `id` (pk), `draftId` (fk), `action` ('polish'|'rewrite'|'reply'|'translate'|'summarize'), `inputSize` (int), `outputSize` (int), `cost` (numeric), `createdAt`

### Variables Example
```json
{
  "FirstName": "Aisha",
  "Company": "Acme FZ-LLC",
  "Role": "Product Manager",
  "MyName": "Karthik",
  "MyTitle": "Founder, Ansiversa",
  "MyPhone": "+971-â€¦",
  "MyLink": "https://ansiversa.com"
}
```

---

## 5) UI / Pages

### `/email` (Quick Polish)
- **Left**: Input textarea with word count; tone selector; formal/informal slider; language selector; buttons: **Polish**, **Shorten**, **Expand**, **Fix Grammar**, **Make Polite**.  
- **Right**: Output preview with **Copy**, **Open in Editor**, **Export (.md/.txt)**, **mailto:** buttons.  
- **Tips**: keyboard shortcuts (Cmd/Ctrl+Enter to polish).

### `/email/editor`
- Top bar: Subject field, From persona (future), Language, Tone, Formality, Save status.  
- Two-pane: **Editor** (input/output tabs with diff toggle) and **Assist** (Templates, Variables, Signature toggle).  
- Side panel: **Reply Suggestions** (paste inbound), **Thread Summary** (paste thread), **Translate**.  
- Footer: character/word count, reading-grade, time-to-read; plan usage meter.

### `/email/templates`
- Gallery: cards with category (Outreach, Follow-up, Status, Apology, Intro, Handoff).  
- Template editor (body supports placeholders + small toolbar).  
- Actions: **Use**, **Edit**, **Duplicate**, **Delete** (soft delete).

---

## 6) API Contracts

### `POST /email/api/polish`
**Req:** `{ "text":"...", "tone":"professional|friendly|concise|assertive|empathetic", "formality":"low|medium|high", "language":"en", "needSubject": true }`  
**Res:** `{ "subject":"<optional>", "text":"<polished>" }`

### `POST /email/api/reply`
**Req:** `{ "incoming":"...raw email...", "context":{"relationship":"new|existing","urgency":"low|normal|high"}, "tone":"professional", "variants":3 }`  
**Res:** `{ "replies":[{"subject":"...","body":"..."}, {...}, {...}] }`

### `POST /email/api/summarize`
**Req:** `{ "thread":"...full thread...", "prefer":["action_items","open_questions"] }`  
**Res:** `{ "summary":{"bullets":[...], "action_items":[...], "open_questions":[...]}, "suggestedSubject":"Re: <...>" }`

### `POST /email/api/translate`
**Req:** `{ "text":"...", "to":"ar|en|ta|hi|...","preserveTone":true }`  
**Res:** `{ "text":"<translated>" }`

### `POST /email/api/rewrite`
**Req:** `{ "text":"...", "mode":"shorten|expand|polite|clarify|grammar", "tone":"professional", "language":"en" }`  
**Res:** `{ "text":"<rewritten>" }`

### `POST /email/api/render-template`
**Req:** `{ "templateId":"...", "variables":{...}, "signature":true }`  
**Res:** `{ "subject":"...", "body":"<merged>" }`

### `POST /email/api/save`
**Req:** `{ "id":"<uuid|null>", "draft":{...fields} }`  
**Res:** `{ "id":"<uuid>", "lastSavedAt":"<ISO>" }`

### `POST /email/api/delete`
**Req:** `{ "id":"<uuid>" }` â†’ **Res:** `{ "ok": true }`  
### `POST /email/api/duplicate`
**Req:** `{ "id":"<uuid>" }` â†’ **Res:** `{ "id":"<newUuid>" }`

---

## 7) Validation Rules

- Subject â‰¤ 120 chars; body â‰¤ 20,000 chars.  
- Language codes ISO (e.g., `en`, `ar`, `ta`).  
- Variables must resolve before export/copy (warn if missing).  
- Avoid sensitive PII in public exports; sanitize HTML (only basic formatting).  
- Diff view limited to last 5 transformations for performance.

---

## 8) Export and Integration

- **Copy** to clipboard (primary).  
- **Export** `.md` / `.txt`.  
- **mailto:** `subject` + `body` URL-encoded.  
- **Future v2:** SMTP send (Gmail/Outlook), saved â€œSentâ€ status, and signature images.

---

## 9) Plans and Rate Limits

| Feature | Free | Pro |
|--------|------|-----|
| Polishes / month | 30 | Unlimited (fair-use) |
| Templates | 5 | Unlimited |
| Translate | â€” | Yes |
| Thread Summary | â€” | Yes |
| Watermark on export | â€œPolished with Ansiversaâ€ | None |

Rate limit keys: `userId` + day for API calls; `userId` + month for quota.

---

## 10) Security and Privacy

- **Ephemeral mode**: do not persist input/output; show warning before navigation.  
- Drafts private by default.  
- Redact emails/phone in public samples.  
- Do not log raw content in production; store only sizes and timings for metrics.

---

## 11) Analytics and Events

- `email.polish`, `email.reply`, `email.summarize`, `email.translate`, `email.rewrite`, `email.save`, `email.delete`, `email.duplicate`, `template.use`, `template.create`.  
- Track tone/formality distribution for UX improvements.

---

## 12) Accessibility and UX

- Keyboard shortcuts (Polish = Cmd/Ctrl+Enter; Copy = Cmd/Ctrl+C).  
- Clear focus states; aria labels; high-contrast mode.  
- RTL support for Arabic in editor and preview.

---

## 13) Suggested File Layout

```
src/pages/email/index.astro
src/pages/email/editor.astro
src/pages/email/templates.astro

src/pages/email/api/polish.ts
src/pages/email/api/reply.ts
src/pages/email/api/summarize.ts
src/pages/email/api/rewrite.ts
src/pages/email/api/translate.ts
src/pages/email/api/render-template.ts
src/pages/email/api/save.ts
src/pages/email/api/delete.ts
src/pages/email/api/duplicate.ts

src/components/email/Editor/*.astro or .tsx
src/components/email/Templates/*.astro
src/lib/email/variables.ts
```

---

## 14) Future Enhancements (v2+)

- Gmail/Outlook integrations (OAuth) to read incoming and send polished replies.  
- Smart scheduling suggestions by recipient timezone.  
- Team templates and shared signatures.  
- Multilingual grammar hints with examples.

---

**End of Requirements â€” ready for Codex implementation.**
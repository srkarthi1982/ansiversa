# ðŸ“¨ Email Newsletter Writer â€” Full Requirements (Ansiversa)

Codexâ€‘ready specification for building the **Email Newsletter Writer** mini app.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### What it does
**Email Newsletter Writer** helps users plan, draft, assemble, and export **deliverabilityâ€‘friendly** email newsletters. It supports **issue planning**, **content blocks**, **brand themes**, **RSS/URL imports**, **AI rewrite & tone control**, **A/B subjects & preview text**, **accessibility & spam checks**, **UTM tagging**, and exports to **responsive HTML, Markdown, and JSON** suitable for ESPs (Mailchimp, Brevo, SendGrid, ConvertKit, etc.).

### Core Features
- **Issue planner**: goals, audience segment, send window, KPIs.  
- **Content sources**: paste text, upload images, **import URLs/RSS** (extract title/summary/hero).  
- **Block library**: hero, headline, article list, product grid, testimonial, promo/CTA, event, tip of the week, divider, footer, social bar.  
- **Branding**: theme colors, logo, typography stack, button shape, spacing scale; oneâ€‘click **darkâ€‘mode** styles.  
- **AI assists**: topic ideation, outlines, rewrites (clarity/simplify/expand), tone (professional/warm/playful/urgent), localization (EN/TA/AR/ES/HI).  
- **A/B**: subject lines, preview text, hero copy.  
- **Compliance**: footer contact address, unsub placeholder, legal snippets; **CANâ€‘SPAM/GDPR** checklist.  
- **Deliverability**: **spam lints** (ALL CAPS, spammy words), link safety, alt text audit, image:text ratio.  
- **Accessibility**: color contrast, alt text, logical headings, **tab order** in HTML.  
- **Tracking**: UTM presets, perâ€‘link tags, â€œmirrored web viewâ€ link slug.  
- **Exports**: responsive **HTML** (hybrid MJMLâ€‘like), **Markdown**, **JSON**, **image assets** packaged as ZIP.  
- **Integrations**: push HTML to popular ESPs via copyâ€‘paste or download; optional webâ€‘view page under `ansiversa.com/nl/[slug]`.

### Key Pages
- `/newsletter` â€” Library  
- `/newsletter/new` â€” Issue wizard  
- `/newsletter/project/[id]` â€” Workspace (Outline, Blocks, Design, QA, Export)  
- `/newsletter/export/[id]` â€” Export center  
- `/newsletter/settings` â€” Defaults (brand theme, UTM presets, snippets)

### Minimal Data Model
`NewsletterProject`, `Issue`, `AudienceSegment`, `Theme`, `Block`, `Asset`, `Snippet`, `ABTest`, `Link`, `Checklist`, `ExportJob`, `Tag`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Projects | 3 | Unlimited |
| Issues per project | 5 | Unlimited |
| Localization | EN | + TA/AR/ES/HI |
| A/B variants | Subject only | Subject + Preheader + Hero |
| Exports | HTML | + MD/JSON + ZIP assets |
| Brand themes | 1 | 5 + shareable |
| History retention | 60 days | Unlimited |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives & Nonâ€‘Goals
**Objectives**
- Provide a **fast, reliable** way to compose **onâ€‘brand, accessible, and ESPâ€‘ready** newsletters.  
- Improve **open/click rates** via A/B experimentation and deliverability linting.  
- Keep the output **portable** (copyâ€‘paste into any ESP or use exported HTML).

**Nonâ€‘Goals (v1)**
- No email **sending** or list management (handled by external ESP).  
- No deep CRM features; only simple audience notes for context.

---

### 2) Information Architecture & Routes

**Pages**
- `/newsletter` â€” Library: search, tags, last edited, status (draft/QA/approved).  
- `/newsletter/new` â€” Wizard: goal, segment, send window, content sources, brand theme.  
- `/newsletter/project/[id]` â€” Tabs: **Outline**, **Blocks**, **Design**, **QA**, **Export**, **Settings**.  
- `/newsletter/export/[id]` â€” Export options (HTML/MD/JSON/ZIP).  
- `/newsletter/settings` â€” Brand themes, UTM presets, company footer info, legal snippets.

**API (SSR)**
- Projects & issues:  
  - `POST /newsletter/api/project/create` Â· `GET /newsletter/api/project?id=` Â· `POST /newsletter/api/project/update` Â· `POST /newsletter/api/project/archive`  
  - `POST /newsletter/api/issue/create` Â· `POST /newsletter/api/issue/update` Â· `POST /newsletter/api/issue/status`
- Content & blocks:  
  - `POST /newsletter/api/source/import` (url|rss)  
  - `POST /newsletter/api/block/add` `.../update` `.../reorder` `.../delete`  
  - `POST /newsletter/api/asset/upload`
- Design & theme:  
  - `POST /newsletter/api/theme/set` Â· `POST /newsletter/api/theme/preview`
- AI assists:  
  - `POST /newsletter/api/ai/outline` Â· `POST /newsletter/api/ai/rewrite` Â· `POST /newsletter/api/ai/translate`
- A/B testing:  
  - `POST /newsletter/api/ab/create` (subject|preheader|hero) Â· `POST /newsletter/api/ab/choose`
- QA & compliance:  
  - `GET /newsletter/api/qa/run` (spam|a11y|links|legal) Â· `POST /newsletter/api/checklist/save`
- Tracking:  
  - `POST /newsletter/api/utm/preset` Â· `POST /newsletter/api/link/tag`
- Export:  
  - `POST /newsletter/api/export` (html|md|json|zip) Â· `GET /newsletter/api/export/status?id=`
- Settings:  
  - `POST /newsletter/api/settings/save`

Optional WebSocket `/newsletter/ws` for live preview and QA lint stream.

---

### 3) Blocks & Design System

**Core Blocks (properties)**  
- **Hero**: image, eyebrow, title, subtitle, CTA (label/url/style).  
- **Article**: image, category, title, dek, body (markdown), CTA.  
- **List**: items (icon or image + label + link).  
- **Product grid**: 2â€“4 columns; price, badge, CTA.  
- **Testimonial**: quote, author, role, avatar.  
- **Promo**: big CTA with contrast color; timer text.  
- **Event**: date/time, venue/link, RSVP.  
- **Tip**: title, short body, â€œRead moreâ€ link.  
- **Divider/Spacer**.  
- **Footer**: company, address, legal links, unsubscribe placeholder, social.

**Design tokens**  
- `colors.primary/secondary/bg/text/muted`, `radius`, `shadow`, `spaceScale`, `font.body`, `font.heading`, `font.mono`.  
- **Darkâ€‘mode** media queries; **prefersâ€‘colorâ€‘scheme** support.  
- **System fonts** by default; allow Google Fonts (with fallback stack).

**Responsive rules**  
- Singleâ€‘column mobile; avoid floats; max width 600px; bulletproof buttons (VML for Outlook).  
- Images with width/height attributes + alt text; `srcset` for retina.  
- Hybrid tableâ€‘based layout to balance compatibility with modern clients.

---

### 4) AI Aids

- **Outline**: propose sections and block order based on goal + sources.  
- **Rewrite**: clarity/summarize/expand; tone controls; CTA generator; **subject & preheader variants** (up to 5 each).  
- **Localization**: translate blocks or full issue; keep brand & links.  
- **Image ALT text** suggestions; **link text** accessibility suggestions.  
- **Spam lint**: flags ALL CAPS, â€œfree!!!â€, â€œurgent!!!â€, excessive exclamation, shortened URLs, imageâ€‘only emails.  
- **A11y lint**: color contrast, heading order, tap targets, semantic alt text, link purpose clarity.

---

### 5) Data Model (Astro DB / SQL)

**NewsletterProject**  
- `id` (uuid pk), `userId`, `name`, `brandThemeId` (fk|null), `createdAt`, `updatedAt`

**Issue**  
- `id` (pk), `projectId` (fk), `title`, `slug`, `goal` (text), `audienceId` (fk|null), `sendWindowStart` (datetime|null), `sendWindowEnd` (datetime|null), `status` ('draft'|'qa'|'approved'), `kpis` (json), `language` (text), `notes` (text)

**AudienceSegment**  
- `id` (pk), `projectId` (fk), `name`, `persona` (json), `notes` (text)

**Theme**  
- `id` (pk), `projectId` (fk), `name`, `tokens` (json), `darkTokens` (json)

**Block**  
- `id` (pk), `issueId` (fk), `type` ('hero'|'article'|'list'|'product'|'testimonial'|'promo'|'event'|'tip'|'divider'|'footer'|'custom'), `order` (int), `content` (json), `visible` (bool)

**Asset**  
- `id` (pk), `projectId` (fk), `kind` ('image'|'icon'|'logo'), `url`, `meta` (json)

**Snippet**  
- `id` (pk), `projectId` (fk), `key` (text), `html` (longtext), `notes`

**ABTest**  
- `id` (pk), `issueId` (fk), `target` ('subject'|'preheader'|'hero'), `variants` (json:[{label,value}]), `chosen` (text|null)

**Link**  
- `id` (pk), `issueId` (fk), `blockId` (fk|null), `href` (text), `label` (text), `utm` (json), `rel` (text)

**Checklist**  
- `id` (pk), `issueId` (fk), `spamScore` (float), `a11y` (json), `legalOk` (bool), `notes` (text)

**ExportJob**  
- `id` (pk), `issueId` (fk), `format` ('html'|'md'|'json'|'zip'), `status` ('queued'|'running'|'done'|'error'), `url` (text|null), `createdAt`

**Tag**  
- `id` (pk), `name`, `color`

Indexes: `Issue.projectId+status`, `Block.issueId+order`, `Link.issueId`, `ExportJob.issueId`.

---

### 6) UX / UI

- **Workspace**: leftâ€”outline (blocks list), centerâ€”live preview (desktop/mobile toggles), rightâ€”properties (block fields, theme tokens, A/B controls).  
- **QA panel**: spam & a11y warnings with fix buttons; link checker; missing ALT; missing footer items.  
- **A/B panel**: generate/select subject and preheader; lock chosen variant.  
- **Export panel**: copy HTML, download ZIP (HTML + assets), generate MD/JSON.  
- Accessibility: keyboardâ€‘first, focus rings, screen reader labels, sufficient contrasts; RTL layouts.

Shortcuts: `Cmd/Ctrl+B` add block, `Cmd/Ctrl+P` preview mobile, `Cmd/Ctrl+K` run QA, `Cmd/Ctrl+E` export, `Cmd/Ctrl+U` UTM tags.

---

### 7) Validation Rules

- Footer must include company name, address line, and unsubscribe placeholder.  
- All images need `alt` text (allow decorative flag).  
- Color contrast AA for text on buttons and hero overlays.  
- Links must have labels; URLs must be absolute.  
- Subject â‰¤ 60 chars; preheader â‰¤ 100 chars.  
- Export HTML must inline critical CSS; max width 600px; include webâ€‘safe font stack fallback.  
- ZIP export must include `index.html`, `/assets`, and `README.txt` with ESP import tips.

---

### 8) Plans & Limits

| Feature | Free | Pro |
|---|---|---|
| Projects | 3 | Unlimited |
| Issues/project | 5 | Unlimited |
| Exports/day | 5 | 25 |
| Assets storage | 200 MB | 5 GB |
| A/B variants | 2 | 5 |
| History | 60 days | Unlimited |

Rate limits: `/ai/outline` 30/day (Free) 200/day (Pro); `/ai/rewrite` 60/day (Free) 400/day (Pro).

---

### 9) Suggested File Layout

```
src/pages/newsletter/index.astro
src/pages/newsletter/new.astro
src/pages/newsletter/project/[id].astro
src/pages/newsletter/export/[id].astro
src/pages/newsletter/settings.astro

src/pages/newsletter/api/project/create.ts
src/pages/newsletter/api/project/index.ts
src/pages/newsletter/api/project/update.ts
src/pages/newsletter/api/project/archive.ts
src/pages/newsletter/api/issue/create.ts
src/pages/newsletter/api/issue/update.ts
src/pages/newsletter/api/issue/status.ts
src/pages/newsletter/api/source/import.ts
src/pages/newsletter/api/block/add.ts
src/pages/newsletter/api/block/update.ts
src/pages/newsletter/api/block/reorder.ts
src/pages/newsletter/api/block/delete.ts
src/pages/newsletter/api/asset/upload.ts
src/pages/newsletter/api/theme/set.ts
src/pages/newsletter/api/theme/preview.ts
src/pages/newsletter/api/ai/outline.ts
src/pages/newsletter/api/ai/rewrite.ts
src/pages/newsletter/api/ai/translate.ts
src/pages/newsletter/api/ab/create.ts
src/pages/newsletter/api/ab/choose.ts
src/pages/newsletter/api/qa/run.ts
src/pages/newsletter/api/checklist/save.ts
src/pages/newsletter/api/utm/preset.ts
src/pages/newsletter/api/link/tag.ts
src/pages/newsletter/api/export.ts
src/pages/newsletter/api/export/status.ts

src/components/newsletter/Outline/*.astro
src/components/newsletter/Blocks/*.astro
src/components/newsletter/Design/*.astro
src/components/newsletter/QA/*.astro
src/components/newsletter/Export/*.astro
```

---

### 10) Future Enhancements (v2+)

- **ESP push adapters** (Mailchimp/SendGrid APIs) with tokens.  
- **Content calendar** with reminders and multiâ€‘issue planning.  
- **Team review** with threaded comments and approvals.  
- **Smart image optimizer** (WebP, focal point crop, compression budget).  
- **Dynamic content** placeholders (first name, segment flags).  
- **RSS automation** to assemble weekly digests automatically.

---

**End of Requirements â€” Ready for Codex Implementation.**
# ðŸ§  Creative Title Maker â€” Full Requirements (Ansiversa)

This document contains a **Codexâ€‘friendly summary** and a **full technical specification** for implementing the Creative Title Maker mini app.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### Overview
**Creative Title Maker** generates **catchy, onâ€‘brand titles** for posts, videos, podcasts, books, courses, landing pages, and campaigns. It supports **style constraints** (length, syllables, alliteration, rhyme, power words), **SEO focus** (keyword placement, SERP length), **tone and audience controls**, **localization**, and **A/B multiâ€‘variant packs** with **scoring** (clarity, novelty, searchability, CTRâ€‘intent). The tool explains **why a title works**, offers **alternatives**, and exports to **CSV/JSON/PDF**. Integrates with **Blog Writer, Presentation Designer, Story Crafter, Ad Copy Assistant, Song Lyric Maker**.

### Core Features
- **Brief â†’ 50+ title variants** across formats (article/video/podcast/course/book/landing page/ad).  
- **Knobs**: length (chars/words), syllables, headline type (Howâ€‘to, Listicle, Question, Statement, Command, Comparison), tone (professional/playful/bold/sincere), POV (you/we/brand), and **stylistic devices** (alliteration, rhyme, pun, numeral use, colon split).  
- **SEO mode**: enforce primary keyword in the first 60 characters; SERP snippet preview; slug suggestions.  
- **Scoring**: **Clarity**, **Novelty**, **SEO**, **CTRâ€‘Intent**, **Brand Fit**; show top reasons and risk flags (clickbait, vagueness, overâ€‘promise).  
- **Explainers**: rationale per title; suggested thumbnails/hooks (for video).  
- **Localization**: translate + culturally adapt titles; preserve wordplay where possible or reâ€‘invent it.  
- **Bundles**: A/B/C packs; theme buckets (benefitâ€‘led, curiosity, contrarian, proof/social).  
- **Exports**: CSV (bulk), JSON, PDF sheet with rationale; push to other apps.  
- **Integrations**: Blog Writer (draft outline), Presentation Designer (slides), Ad Copy Assistant (headline fields), Story Crafter (chapter/episode names), Song Lyric Maker (track titles).

### Key Pages
- `/titles` â€” Dashboard/library  
- `/titles/new` â€” Brief wizard  
- `/titles/project/[id]` â€” Workspace (variants, scoring, filters, localization)  
- `/titles/export/[id]` â€” Export center  
- `/titles/settings` â€” Brand voice, banned words, defaults

### Minimal Data Model
`TitleProject`, `Brief`, `Variant`, `Score`, `Rationale`, `ThemeBucket`, `Keyword`, `LocalePack`, `ExportJob`, `Tag`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Projects | 3 | Unlimited |
| Variants per brief | 25 | 200 |
| SEO mode | Basic | Full + SERP preview |
| Localization | 1 locale | Multiâ€‘locale |
| Exports | CSV | CSV + JSON + PDF |
| Integrations | Viewâ€‘only | Oneâ€‘click push |
| History retention | 60 days | Unlimited |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives and Nonâ€‘Goals
**Objectives**
- Produce **highâ€‘quality, constraintâ€‘aware** titles that match **audience + channel**.  
- Provide **transparent scoring** and concise rationales to choose confidently.  
- Support **SEO** and **localization** without losing brand voice.

**Nonâ€‘Goals (v1)**
- No automatic image generation for thumbnails (hand off to Presentation Designer).  
- No direct posting to CMS/social APIs (v2).

---

### 2) Information Architecture and Routes

**Pages**
- `/titles` â€” Library with search/tags; recent projects.  
- `/titles/new` â€” Brief wizard: asset type, topic, audience, tone, keyword(s), constraints, locales.  
- `/titles/project/[id]` â€” Workspace with tabs: **Variants**, **Scores**, **Localization**, **Settings**.  
- `/titles/export/[id]` â€” Export presets.  
- `/titles/settings` â€” Brand voice, banned words, default constraints, glossary (protected terms).

**API (SSR)**
- Projects/briefs:  
  - `POST /titles/api/project/create`  
  - `GET  /titles/api/project?id=`  
  - `POST /titles/api/project/update`  
  - `POST /titles/api/project/archive`
- Generation and editing:  
  - `POST /titles/api/generate` (brief â†’ variants)  
  - `POST /titles/api/variant/edit` Â· `POST /titles/api/variant/delete`  
  - `POST /titles/api/bucket/apply` (benefit/curiosity/contrarian/proof/social/command/howto/listicle/question)
- Scoring and checks:  
  - `POST /titles/api/score` (clarity/novelty/seo/ctr/brandfit)  
  - `POST /titles/api/check/compliance` (banned words, legal claims)  
  - `POST /titles/api/check/seo` (length, keyword position, slug)
- Localization and voice:  
  - `POST /titles/api/localize` (target locales; preserve voice; reâ€‘invent puns)  
  - `POST /titles/api/voice/save`
- Export:  
  - `POST /titles/api/export` (csv|json|pdf) Â· `GET /titles/api/export/status?id=`

Optional WebSocket `/titles/ws` for live counters and autosave notices.

---

### 3) Generation Controls

**Asset types**  
- Article/blog, YouTube/video, Short/Reel, Podcast episode, Book/ebook, Course/module, Landing page, Email subject, Ad headline.

**Headline devices** (toggleable)
- Numerals (Top 7), Alliteration, Rhyme, Pun/Wordplay, Colon split, Parenthetical, Brackets, Emoji (video only), Question hooks, Command hooks.

**Constraints**  
- **Length**: chars/words; hard and soft limits per platform (e.g., email subject â‰¤ 60 chars, YouTube â‰¤ 100).  
- **Syllables** target (optional) and **readability grade** (Fleschâ€‘Kincaid).  
- **Keywords**: primary (mustâ€‘include), secondary (niceâ€‘toâ€‘have), **placement** (front/middle/end).  
- **Brand glossary**: required phrases; protected terms (never alter).  
- **Risk flags**: superlatives, clickbait patterns, overâ€‘promise words; generate safer rewrites.

**Theme buckets**  
- Benefitâ€‘led, Painâ€‘relief, Curiosity gap, Contrarian/Challenge, Social proof and numbers, Howâ€‘to/tutorial, Listicle, Case study/result, Timely/newsâ€‘jacking.

---

### 4) Scoring Model (Heuristic + LLM hints)

- **Clarity** (0â€“1): unambiguous topic, active voice, jargon penalty.  
- **Novelty** (0â€“1): nâ€‘gram overlap vs brief/other variants; clichÃ© penalty list.  
- **SEO** (0â€“1): primary keyword inclusion and early placement; SERP length; slug cleanliness.  
- **CTRâ€‘Intent** (0â€“1): presence of benefits, specificity, curiosity without deception.  
- **Brand Fit** (0â€“1): tone match vs saved voice, banned words avoidance.

Provide **topâ€‘3 reasons** for each score and **red/yellow flags** with suggested fixes.

---

### 5) Data Model (Astro DB / SQL)

**TitleProject**  
- `id` (uuid pk), `userId`, `name`, `assetType`, `locales` (json), `status` ('draft'|'ready'|'archived'), `createdAt`, `updatedAt`

**Brief**  
- `id` (pk), `projectId` (fk), `topic` (text), `audience` (json), `tone` (text), `keywords` (json: primary/secondary), `constraints` (json), `cta` (text|null), `notes` (text)

**Variant**  
- `id` (pk), `projectId` (fk), `text` (text), `deviceFlags` (json), `length` (json: chars, words, syllables), `bucket` (text), `locale` (string 'en-US','ar-AE','ta-IN',...), `status` ('candidate'|'approved'|'archived')

**Score**  
- `id` (pk), `variantId` (fk), `clarity` (float), `novelty` (float), `seo` (float), `ctr` (float), `brandfit` (float), `explanations` (json), `flags` (json)

**Rationale**  
- `id` (pk), `variantId` (fk), `whyItWorks` (text), `thumbnailHook` (text|null), `altAngles` (json)

**ThemeBucket**  
- `id` (pk), `projectId` (fk), `name`, `examples` (json)

**Keyword**  
- `id` (pk), `projectId` (fk), `type` ('primary'|'secondary'), `value` (text), `placement` ('front'|'middle'|'end'|null)

**LocalePack**  
- `id` (pk), `projectId` (fk), `sourceVariantId` (fk), `locale` (string), `text` (text), `notes` (text)

**ExportJob**  
- `id` (pk), `projectId` (fk), `format` ('csv'|'json'|'pdf'), `options` (json), `status` ('queued'|'running'|'done'|'error'), `url` (string|null), `createdAt`

**Tag**  
- `id` (pk), `name`, `color`

Indexes: `Variant.projectId`, `Score.variantId`, `LocalePack.projectId`, `Keyword.projectId`.

---

### 6) UX / UI

- **Workspace**: grid of variants with scores; quick filters (bucket, device, locale, score â‰¥ X).  
- **Live counters**: chars/words/syllables; SERP preview with ellipsis guard.  
- **Explain** drawer: rationale, improvements, thumbnail/hook suggestions.  
- **Localization**: sideâ€‘byâ€‘side sourceâ†’target; preserve brand terms; reâ€‘invent wordplay.  
- **Export center**: CSV/JSON/PDF; select columns.  
- Accessibility: keyboard nav; high contrast; RTL scripts; reduced motion.

Shortcuts: `Ctrl/Cmd+Enter` generate; `Ctrl/Cmd+.` cycle bucket; `Ctrl/Cmd+L` localize; `Ctrl/Cmd+E` export.

---

### 7) API Contracts (Examples)

**Create project**  
`POST /titles/api/project/create`  
```json
{ "name":"Ansiversa Launch Titles", "assetType":"landing_page", "locales":["en-US","ar-AE"] }
```
Res: `{ "projectId":"tp_100" }`

**Generate variants**  
`POST /titles/api/generate`  
```json
{
  "projectId":"tp_100",
  "variants":120,
  "buckets":["benefit","curiosity","contrarian","social"],
  "constraints":{"maxChars":60,"keywordFront":true,"devices":["numeral","colon"]}
}
```
Res: `{ "count": 120 }`

**Score a variant**  
`POST /titles/api/score`  
```json
{ "variantId":"v_44" }
```
Res: `{ "scores":{"clarity":0.86,"seo":0.92,"ctr":0.78}, "flags":["clickbait_risk"] }`

**Localize**  
`POST /titles/api/localize`  
```json
{ "variantId":"v_44", "targetLocale":"ta-IN", "preserveTerms":["Ansiversa"] }
```
Res: `{ "ok": true }`

**Export**  
`POST /titles/api/export`  
```json
{ "projectId":"tp_100", "format":"csv", "options":{"include":["text","scores","bucket","locale"]} }
```
Res: `{ "jobId":"e_12" }`

---

### 8) Validation Rules

- Enforce max char/word limits; compute serverâ€‘side.  
- Primary keyword must appear if SEO mode is on; warn if not at desired placement.  
- Ban list must be respected; suggest safe alternatives.  
- Duplicates (caseâ€‘insensitive) autoâ€‘merge unless user allows nearâ€‘duplicates.  
- Export schema unitâ€‘tests; CSV delimiter and quoting validated.

---

### 9) Plans and Limits

| Feature | Free | Pro |
|---|---|---|
| Projects | 3 | Unlimited |
| Variants/brief | 25 | 200 |
| SEO mode | Basic | Full + preview |
| Localization | 1 | Multi |
| Exports | CSV | CSV/JSON/PDF |
| History retention | 60 days | Unlimited |

Rate limits: `/generate` 60/day (Free) 400/day (Pro); `/localize` 40/day (Free) 300/day (Pro).

---

### 10) Suggested File Layout

```
src/pages/titles/index.astro
src/pages/titles/new.astro
src/pages/titles/project/[id].astro
src/pages/titles/export/[id].astro
src/pages/titles/settings.astro

src/pages/titles/api/project/create.ts
src/pages/titles/api/project/index.ts
src/pages/titles/api/project/update.ts
src/pages/titles/api/project/archive.ts
src/pages/titles/api/generate.ts
src/pages/titles/api/variant/edit.ts
src/pages/titles/api/variant/delete.ts
src/pages/titles/api/bucket/apply.ts
src/pages/titles/api/score.ts
src/pages/titles/api/check/compliance.ts
src/pages/titles/api/check/seo.ts
src/pages/titles/api/localize.ts
src/pages/titles/api/voice/save.ts
src/pages/titles/api/export.ts
src/pages/titles/api/export/status.ts

src/components/titles/Workspace/*.astro
src/components/titles/Explain/*.astro
src/components/titles/Localization/*.astro
src/components/titles/Export/*.astro
```

---

### 11) Future Enhancements (v2+)

- **SERP live data** (suggested related keywords, questions).  
- **Competitor diff**: compare against top SERP titles to avoid sameness.  
- **Clickâ€‘through prediction** via historical datasets (privacyâ€‘safe proxy).  
- **CMS connectors** (WordPress, Ghost, Notion) and **YouTube API** push.  
- **Team review mode** with votes and comments.  
- **PWA** for offline brainstorming.

---

**End of Requirements â€” Ready for Codex Implementation.**
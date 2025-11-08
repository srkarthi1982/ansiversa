# âœ¨ Quote Forge â€” Full Requirements (Ansiversa)

This document includes a **Codexâ€‘friendly summary** and a **full technical specification** for implementing the Quote Forge mini app.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### Overview
**Quote Forge** helps users generate, curate, and package **original quotes** (motivational, witty, philosophical, leadership, wellness, tech, study, romantic, faithâ€‘safe, etc.) with **tone/style controls**, **topic tags**, and **multiâ€‘language** output. It supports **attribution modes** (anonymous, pen name, brand), **paraphrase and refine**, **antiâ€‘clichÃ© checks**, and **uniqueness scoring**. Users can create **quote packs** for social media and export **image cards** via Presentation Designer integration, plus CSV/JSON for reuse.

### Core Features
- **Brief â†’ quote variants** (short oneâ€‘liners, 2â€‘liners, aphorisms, microâ€‘poems).  
- **Controls**: tone (uplifting/stoic/humorous/poetic), length (â‰¤80/â‰¤140 chars), devices (alliteration, contrast, parallelism, antimetabole), persona (coach/teacher/monk/CEO/scientist), language (EN/TA/AR + more).  
- **Attribution**: anonymous, pen name, real name, brand handle, or â€œpublic domainâ€‘styleâ€ aphorism (no claim).  
- **Antiâ€‘clichÃ© and originality**: phrase blacklist and similarity guard; **uniqueness score** vs internal corpus.  
- **Refine passes**: tighten, simplify, punchline, poetic, faithâ€‘safe, kidâ€‘friendly, formal.  
- **Bundles**: themed packs (e.g., â€œDaily Discipline x30â€), scheduled calendar (30/60/90â€‘day).  
- **Hashtag and caption helper**: suggest 5â€“12 tags + a 1â€‘line caption per quote.  
- **Exports**: CSV/JSON; handoff to **Presentation Designer** for image cards (square/vertical/landscape) and to **Social Caption Generator**.  
- **Collections**: save, tag, favorite, and reorder.  
- **Integrations**: Presentation Designer (graphics), Creative Title Maker (series names), Blog Writer (epigraphs), Poem Studio (lyrical variants).

### Key Pages
- `/quotes` â€” Library/dashboard  
- `/quotes/new` â€” Generator wizard (topic, tone, style, language, attribution)  
- `/quotes/project/[id]` â€” Workspace (variants, refine, bundles, schedule)  
- `/quotes/export/[id]` â€” Export center (CSV/JSON; send to Presentation Designer)  
- `/quotes/settings` â€” Defaults (brand, pen name, banned phrases)

### Minimal Data Model
`QuoteProject`, `PromptBrief`, `Quote`, `Score`, `Refinement`, `Pack`, `Schedule`, `ExportJob`, `Tag`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Projects | 3 | Unlimited |
| Variants per prompt | 10 | 100 |
| Languages | EN only | EN + TA/AR/ES + more |
| Antiâ€‘clichÃ© and uniqueness | Basic | Full + packâ€‘level checks |
| Packs and scheduler | 10 items | 200 items |
| Exports | CSV | CSV + JSON + push to Designer |
| History retention | 60 days | Unlimited |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives and Nonâ€‘Goals
**Objectives**
- Generate **concise, originalâ€‘sounding quotes** with tunable style and language.  
- Enable **batch production** (packs) for consistent social posting.  
- Provide **quality checks** (clichÃ©/uniqueness/tone safety).

**Nonâ€‘Goals (v1)**
- No public feed or community sharing (v2).  
- No automatic stockâ€‘image search (handled in Presentation Designer).

---

### 2) Information Architecture and Routes

**Pages**
- `/quotes` â€” Library with search, tags, and favorites.  
- `/quotes/new` â€” Wizard: topic(s), tone, devices, persona, length, language, attribution, pack size.  
- `/quotes/project/[id]` â€” Tabs: **Variants**, **Refine**, **Bundles**, **Schedule**, **Settings**.  
- `/quotes/export/[id]` â€” Export to CSV/JSON; push to Presentation Designer with chosen template.  
- `/quotes/settings` â€” Defaults: brand name/handle, pen name list, banned phrase list, sensitiveâ€‘content filters.

**API (SSR)**
- Projects/briefs:  
  - `POST /quotes/api/project/create`  
  - `GET  /quotes/api/project?id=`  
  - `POST /quotes/api/project/update`  
  - `POST /quotes/api/project/archive`
- Generation/refine:  
  - `POST /quotes/api/generate` (brief â†’ N quotes)  
  - `POST /quotes/api/refine` (tighten/simplify/punch/poetic/faithâ€‘safe/kidâ€‘friendly/formal)  
  - `POST /quotes/api/paraphrase` (K variants of a selected quote)
- Scoring/checks:  
  - `POST /quotes/api/score` (clarity, punch, originality, clichÃ© risk)  
  - `POST /quotes/api/check/cliche`  
  - `POST /quotes/api/check/uniqueness`
- Packs and schedule:  
  - `POST /quotes/api/pack/create` Â· `POST /quotes/api/pack/add` Â· `POST /quotes/api/pack/reorder`  
  - `POST /quotes/api/schedule/create` (daily/weekly list with timezone and post hints)
- Export and handoff:  
  - `POST /quotes/api/export` (csv|json) Â· `GET /quotes/api/export/status?id=`  
  - `POST /quotes/api/designer/push` (template, colorway, size)

Optional WebSocket `/quotes/ws` for live counters and uniqueness meter.

---

### 3) Generation Controls

**Length presets**: micro (â‰¤80 chars), short (â‰¤140), tweetâ€‘safe (â‰¤240), poster (â‰¤16 words).  
**Tones**: uplifting, stoic, humorous, poetic, reflective, bold, gentle, academic.  
**Devices**: antithesis, parallelism, anaphora, chiasmus/antimetabole, alliteration, metaphor, contrast pair, ruleâ€‘ofâ€‘three.  
**Personas**: coach, teacher, monk, scientist, CEO, athlete, artist, parent.  
**Attribution**:  
- `mode`: 'anonymous' | 'pen_name' | 'real_name' | 'brand' | 'none'  
- `display`: suffix (`â€” Name`) or prefix (`Name:`) or inline.  
**Languages**: English default; Tamil/Arabic/Spanish as Pro starters (respect script and punctuation norms).  
**Safety**: profanity block; sensitive topics filter (religion/politics toggle); faithâ€‘safe wording option.

---

### 4) Quality Heuristics (Scoring)

- **Clarity (0â€“1)**: concrete nouns/verbs, low hedging, short length.  
- **Punch (0â€“1)**: cadence (ruleâ€‘ofâ€‘three), contrast, alliteration; stopâ€‘word ratio.  
- **Originality (0â€“1)**: low nâ€‘gram overlap with builtâ€‘in clichÃ© list and prior saved quotes; **similarity index** threshold.  
- **ClichÃ© Risk**: flags common templates (â€œfollow your dreamsâ€, â€œnever give upâ€).  
- **Tone Safety**: flags preachy absolutes or harmful imperatives; suggests softer rewrites.

Provide **topâ€‘3 reasons** and **fixâ€‘it suggestions** for each score below 0.6.

---

### 5) Data Model (Astro DB / SQL)

**QuoteProject**  
- `id` (uuid pk), `userId`, `name`, `topicTags` (json), `language` (code), `attribution` (json), `status` ('draft'|'ready'|'archived'), `createdAt`, `updatedAt`

**PromptBrief**  
- `id` (pk), `projectId` (fk), `topics` (json), `tone` (text), `lengthPreset` (text), `devices` (json), `persona` (text), `count` (int), `notes` (text)

**Quote**  
- `id` (pk), `projectId` (fk), `text` (text), `language` (code), `attribution` (json), `scoreId` (fk|null), `flags` (json), `status` ('candidate'|'approved'|'archived'), `tags` (json)

**Score**  
- `id` (pk), `quoteId` (fk), `clarity` (float), `punch` (float), `originality` (float), `clicheRisk` (float), `explanations` (json)

**Refinement**  
- `id` (pk), `quoteId` (fk), `type` ('tighten'|'simplify'|'punch'|'poetic'|'faith_safe'|'kid_friendly'|'formal'|'paraphrase'), `before` (text), `after` (text), `notes` (text), `createdAt`

**Pack**  
- `id` (pk), `projectId` (fk), `title` (text), `items` (json: ordered quote ids), `theme` (text), `colorway` (text|null), `templates` (json|null)

**Schedule**  
- `id` (pk), `projectId` (fk), `startDate` (date), `cadence` ('daily'|'weekly'|'custom'), `items` (json: [{quoteId, date}]), `timezone` (text)

**ExportJob**  
- `id` (pk), `projectId` (fk), `format` ('csv'|'json'), `options` (json), `status` ('queued'|'running'|'done'|'error'), `url` (string|null), `createdAt`

**Tag**  
- `id` (pk), `name`, `color`

Indexes: `QuoteProject.userId`, `Quote.projectId`, `Score.quoteId`, `Pack.projectId`.

---

### 6) UX / UI

- **Workspace**: twoâ€‘pane â€” left variants list with score chips; right detail (quote, attribution style, tags, flags, refine actions).  
- **Uniqueness meter**: gauge with reasons and highlighted clichÃ© fragments.  
- **Bundles**: dragâ€‘drop to pack; apply theme color and export or push to Designer.  
- **Schedule**: calendar grid; assign quotes per day; export CSV schedule.  
- **Export**: CSV/JSON and Designer handoff with template/size.  
- Accessibility: keyboard shortcuts, high contrast, RTL scripts, reduced motion.

Shortcuts: `Ctrl/Cmd+Enter` generate, `Ctrl/Cmd+R` refine (cycle), `Ctrl/Cmd+K` paraphrase, `Ctrl/Cmd+E` export, `Ctrl/Cmd+B` add to pack.

---

### 7) API Contracts (Examples)

**Create project**  
`POST /quotes/api/project/create`  
```json
{ "name":"Discipline Daily", "topicTags":["habits","focus"], "language":"en", "attribution":{"mode":"brand","display":"suffix","name":"Ansiversa"} }
```
Res: `{ "projectId":"qp_21" }`

**Generate quotes**  
`POST /quotes/api/generate`  
```json
{ "projectId":"qp_21", "count":30, "tone":"stoic", "lengthPreset":"micro", "devices":["contrast","rule_of_three"] }
```
Res: `{ "created":30 }`

**Refine a quote**  
`POST /quotes/api/refine`  
```json
{ "quoteId":"q_7", "type":"punch", "notes":"make contrast sharper; keep micro length" }
```
Res: `{ "ok":true, "after":"..." }`

**Score and checks**  
`POST /quotes/api/score` â†’ `{ "clarity":0.78, "punch":0.71, "originality":0.83, "clicheRisk":0.12 }`  
`POST /quotes/api/check/uniqueness` â†’ `{ "similarity":0.07 }`

**Create a pack**  
`POST /quotes/api/pack/create`  
```json
{ "projectId":"qp_21", "title":"Discipline x30", "items":["q_1","q_2","q_3"] }
```
Res: `{ "packId":"pk_9" }`

**Push to Designer**  
`POST /quotes/api/designer/push`  
```json
{ "packId":"pk_9", "template":"square_clean", "colorway":"slate", "size":"1080x1080" }
```
Res: `{ "ok": true }`

---

### 8) Validation Rules

- Quote length must respect preset (micro/short/tweet/poster).  
- Attribution display must match mode; brand glossary protected terms cannot be altered.  
- ClichÃ© blacklist must be enforced; block save if above max similarity threshold (configurable).  
- Scheduler dates must be in the future; timezone required.  
- CSV exports validated for delimiter and quoting.

---

### 9) Plans and Limits

| Feature | Free | Pro |
|---|---|---|
| Projects | 3 | Unlimited |
| Variants per prompt | 10 | 100 |
| Languages | EN | EN + TA/AR/ES + more |
| Packs | 10 items | 200 items |
| Exports | CSV | CSV/JSON + Designer push |
| History retention | 60 days | Unlimited |

Rate limits: `/generate` 80/day (Free) 500/day (Pro); `/refine` 60/day (Free) 400/day (Pro).

---

### 10) Suggested File Layout

```
src/pages/quotes/index.astro
src/pages/quotes/new.astro
src/pages/quotes/project/[id].astro
src/pages/quotes/export/[id].astro
src/pages/quotes/settings.astro

src/pages/quotes/api/project/create.ts
src/pages/quotes/api/project/index.ts
src/pages/quotes/api/project/update.ts
src/pages/quotes/api/project/archive.ts
src/pages/quotes/api/generate.ts
src/pages/quotes/api/refine.ts
src/pages/quotes/api/paraphrase.ts
src/pages/quotes/api/score.ts
src/pages/quotes/api/check/cliche.ts
src/pages/quotes/api/check/uniqueness.ts
src/pages/quotes/api/pack/create.ts
src/pages/quotes/api/pack/add.ts
src/pages/quotes/api/pack/reorder.ts
src/pages/quotes/api/schedule/create.ts
src/pages/quotes/api/designer/push.ts
src/pages/quotes/api/export.ts
src/pages/quotes/api/export/status.ts

src/components/quotes/Workspace/*.astro
src/components/quotes/Packs/*.astro
src/components/quotes/Schedule/*.astro
```

---

### 11) Future Enhancements (v2+)

- **Citation tracer** (web search) to warn if a quote might match an attributed historical quote.  
- **Autoâ€‘series** generator (e.g., 365 quotes for a year) with smart theming.  
- **Audience targeting** with interest tags; perâ€‘vertical templates (fitness, study, startup).  
- **Collaboration** with comments and approvals.  
- **PWA** for daily quote drafting offline.

---

**End of Requirements â€” Ready for Codex Implementation.**
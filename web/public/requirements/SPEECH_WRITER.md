# ðŸŽ¤ Speech Writer â€” Full Requirements (Ansiversa)

Codexâ€‘ready specification for building the **Speech Writer** mini app.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### What it does
**Speech Writer** creates **audienceâ€‘aware, timeâ€‘accurate** speeches for any occasion (keynotes, product launches, weddings, eulogies, classroom talks, elevator pitches, debates). It provides **structured outlines**, **rhetorical devices**, **story beats**, **quote suggestions with attribution**, **timing estimates**, **teleprompter mode**, **practice tools** (pace, filler reduction), and **multilingual output**. Exports to **DOCX/PDF/Markdown/Teleprompter TXT**, and integrates with **Presentation Designer** (slide bullets) and **Creative Title Maker** (titles/taglines).

### Core Features
- **Brief â†’ outline â†’ full draft** pipeline with **length target** (e.g., 5/10/18 minutes) and **wordsâ€‘perâ€‘minute pacing**.  
- **Audience and purpose controls**: persuade/inform/inspire/entertain; expertise level; cultural sensitivity.  
- **Rhetoric toggles**: ruleâ€‘ofâ€‘three, contrast, callâ€‘backs, anaphora, metaphors, statistics, personal story slot.  
- **Section builder**: cold open hooks, thesis, key points (2â€“5), proof, objection handling, CTA, memorable close.  
- **Tone and voice**: formal/professional/warm/playful/ceremonial; brand/persona preservation.  
- **Quotations and sources**: curated suggested quotes with author, source, year; inline citation stubs.  
- **Practice suite**: teleprompter with autoâ€‘scroll, **timing meter**, **applause/pause marks**, and **fillerâ€‘word detector**.  
- **Language and localization**: EN/TA/AR + others (Pro); bilingual versions and transliteration.  
- **Safety and originality**: plagiarism check summary, sensitiveâ€‘content flags, inclusiveâ€‘language suggestions.  
- **Exports**: DOCX, PDF, MD, Teleprompter TXT; **Slide bullets** push to Presentation Designer.  
- **Templates**: toast, keynote, pitch, panel intro, award acceptance, graduation, wedding, eulogy, tech talk, investor pitch, debate opening/rebuttal.

### Key Pages
- `/speech` â€” Library  
- `/speech/new` â€” Brief wizard  
- `/speech/project/[id]` â€” Workspace (Outline, Draft, Practice, Teleprompter)  
- `/speech/export/[id]` â€” Export center  
- `/speech/settings` â€” Defaults (brand voice, banned phrases, pacing profile)

### Minimal Data Model
`SpeechProject`, `Brief`, `Outline`, `Section`, `Draft`, `Cue`, `Quote`, `Source`, `PracticeLog`, `ExportJob`, `Tag`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Projects | 3 | Unlimited |
| Max length | 8 min | 30 min |
| Languages | EN | EN + TA/AR/ES/HIâ€¦ |
| Teleprompter pro | Basic | Autoâ€‘scroll + rehearsal logs |
| Exports | MD/TXT | + DOCX/PDF + slide push |
| Quotes db | Basic | Extended + year/source |
| History retention | 60 days | Unlimited |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives and Nonâ€‘Goals
**Objectives**
- Generate **compelling, wellâ€‘structured** speeches aligned to audience and purpose.  
- Keep **time accuracy** using target WPM and pause budgeting; provide rehearsal feedback.  
- Offer **transparent structure and sources** (quotes, stats) to build trust.

**Nonâ€‘Goals (v1)**
- No live voice recording or realâ€‘time ASR feedback (v1.1 may add).  
- No automatic fact checking beyond citation stubs (user verifies).

---

### 2) Information Architecture and Routes

**Pages**
- `/speech` â€” Library with search/tags; recent projects and durations.  
- `/speech/new` â€” Wizard: occasion, audience, purpose, tone, length target, key points, mustâ€‘include anecdotes, constraints/banned phrases, language, WPM profile.  
- `/speech/project/[id]` â€” Tabs: **Outline**, **Draft**, **Practice**, **Teleprompter**, **Settings**.  
- `/speech/export/[id]` â€” Export presets (DOCX/PDF/MD/TXT) + slide push.  
- `/speech/settings` â€” Defaults (voice, quotes pack preferences, pacing profiles).

**API (SSR)**
- Projects:  
  - `POST /speech/api/project/create` Â· `GET /speech/api/project?id=` Â· `POST /speech/api/project/update` Â· `POST /speech/api/project/archive`
- Authoring:
  - `POST /speech/api/outline/generate` (brief â†’ outline)  
  - `POST /speech/api/draft/generate` (outline â†’ draft; target WPM and pause budget)  
  - `POST /speech/api/draft/rewrite` (tone/length/rhetorical toggles)  
  - `POST /speech/api/section/edit` (id, operations)  
- Quotes and sources:
  - `GET /speech/api/quotes/suggest?topic=&tone=&era=`  
  - `POST /speech/api/quote/attach` (variant â†’ section)  
  - `POST /speech/api/source/add` (citation metadata)  
- Practice and teleprompter:
  - `POST /speech/api/cues/insert` (applause, pause, emphasis, slideâ€‘change)  
  - `POST /speech/api/teleprompter/prepare` (split into scroll chunks; font/lines/contrast)  
  - `POST /speech/api/practice/log` (time, pace, filler counts, notes)
- Export and integration:
  - `POST /speech/api/export` (md|docx|pdf|txt) Â· `GET /speech/api/export/status?id=`  
  - `POST /speech/api/presentation/push` (deck outline to Presentation Designer)

Optional WebSocket `/speech/ws` for countdown timers and rehearsal progress.

---

### 3) Generation Controls

**Occasion templates**: keynote, investor pitch, wedding toast, award acceptance, eulogy, graduation, panel intro, debate opening, rebuttal, lightning talk, TEDâ€‘style.  
**Audience**: size (small/med/large), familiarity (cold/warm), expertise (layperson/intermediate/expert), culture/region (for examples and idioms).  
**Purpose**: inform, persuade, inspire, entertain, commemorate.  
**Length targeting**: time (min) or words; **WPM** presets (slow 110, medium 140, fast 170); **pause budget** (intro, transitions, applause).  
**Rhetoric toggles**: ruleâ€‘ofâ€‘three, parallelism, contrast pairs, rhetorical questions, callbacks, metaphors, story arc, evidence mix (stats/anecdotes/examples/quotes).  
**Tone**: professional, warm, playful, solemn, motivational, visionary, humble, celebratory.  
**Constraints**: banned words, compliance phrases, brand voice glossary, legal sensitivity.  
**Safety**: inclusive language mode; sensitive topic warnings; claimâ€‘strength limiter (avoid overâ€‘promising).

---

### 4) Timing and Structure Logic

- **Outline**: Hook â†’ Context â†’ Thesis â†’ 2â€“5 Points (each: leadâ€‘in, evidence, story, bridge) â†’ Objections/risks â†’ CTA â†’ Close/echo of hook.  
- **Timing model**: `estimated_minutes = (words / WPM) + pause_seconds/60`.  
- Autoâ€‘insert **[PAUSE n sec]**, **[APPLAUSE]**, **[SLIDE âŒ¥]** cues based on density and climax points.  
- Live **trim/expand** suggestions to hit target Â±5%.

---

### 5) Data Model (Astro DB / SQL)

**SpeechProject**  
- `id` (uuid pk), `userId`, `title`, `occasion`, `language`, `targetMinutes` (int), `wpm` (int), `pauseBudgetSec` (int), `status` ('brief'|'outlined'|'drafted'|'rehearsed'|'final'), `createdAt`, `updatedAt`

**Brief**  
- `id` (pk), `projectId` (fk), `audience` (json), `purpose` (text), `tone` (text), `keyPoints` (json), `mustInclude` (json), `constraints` (json), `notes` (text)

**Outline**  
- `id` (pk), `projectId` (fk), `sections` (json: [{type:'hook'|'point'|'cta'|'close', title, bullets[]}]), `estimatedWords` (int)

**Section**  
- `id` (pk), `projectId` (fk), `type` (text), `title` (text), `content` (longtext), `order` (int), `minutes` (float), `cues` (json)

**Draft**  
- `id` (pk), `projectId` (fk), `content` (longtext), `words` (int), `wpm` (int), `estimatedMinutes` (float), `flags` (json)

**Cue**  
- `id` (pk), `projectId` (fk), `kind` ('pause'|'applause'|'emphasis'|'slide'), `offsetWord` (int), `payload` (json)

**Quote**  
- `id` (pk), `projectId` (fk|null), `text` (text), `author` (text), `source` (text|null), `year` (int|null), `url` (text|null), `tags` (json)

**Source**  
- `id` (pk), `projectId` (fk), `type` ('book'|'article'|'report'|'url'), `meta` (json)

**PracticeLog**  
- `id` (pk), `projectId` (fk), `durationSec` (int), `wpm` (int), `fillerCounts` (json), `notes` (text), `createdAt`

**ExportJob**  
- `id` (pk), `projectId` (fk), `format` ('md'|'docx'|'pdf'|'txt'), `options` (json), `status` ('queued'|'running'|'done'|'error'), `url` (string|null), `createdAt`

**Tag**  
- `id` (pk), `name`, `color`

Indexes: `SpeechProject.userId`, `Draft.projectId`, `Cue.projectId`, `PracticeLog.projectId`.

---

### 6) UX / UI

- **Workspace**: Leftâ€”outline tree; Centerâ€”editor with cue chips; Rightâ€”properties (timing, tone, rhetoric toggles, quotes).  
- **Teleprompter**: large text, autoâ€‘scroll (WPM), dark mode, margins and line height, **mirror mode**, **tapâ€‘toâ€‘pause**.  
- **Practice**: timer, live WPM gauge, fillerâ€‘word counter (um/uh/like) via simple client mic heuristic (v1 shows manual input).  
- **Quote picker**: search by topic/era; shows author/year/source; insert with citation stub.  
- **Slide sync**: â€œSend bullets to Presentation Designerâ€ with oneâ€‘click mapping by section.  
- Accessibility: keyboard first; screen reader labels; highâ€‘contrast theme; RTL scripts.

Shortcuts: `Ctrl/Cmd+Enter` (regenerate), `Alt+â†‘/â†“` (move section), `Ctrl/Cmd+L` (length tune), `Ctrl/Cmd+T` (teleprompter), `Ctrl/Cmd+E` (export).

---

### 7) API Contracts (Examples)

**Create project**  
`POST /speech/api/project/create`  
```json
{ "title":"Product Launch 2026", "occasion":"keynote", "language":"en", "targetMinutes":12, "wpm":140 }
```
Res: `{ "projectId":"sp_101" }`

**Generate outline**  
`POST /speech/api/outline/generate`  
```json
{ "projectId":"sp_101", "keyPoints":["problem","solution","proof","vision"], "tone":"visionary", "rhetoric":["rule_of_three","callbacks"] }
```
Res: `{ "sections":[...] }`

**Generate draft**  
`POST /speech/api/draft/generate`  
```json
{ "projectId":"sp_101", "targetMinutes":12, "pauseBudgetSec":60, "evidence":{"quotes":2,"stats":2} }
```
Res: `{ "words":1680, "estimatedMinutes":12.1 }`

**Prepare teleprompter**  
`POST /speech/api/teleprompter/prepare`  
```json
{ "projectId":"sp_101", "font":"Inter", "lineHeight":1.5, "wpm":140, "mirror":false }
```
Res: `{ "ok": true }`

**Export**  
`POST /speech/api/export`  
```json
{ "projectId":"sp_101", "format":"docx", "options":{"cueMarks":true,"slideHeaders":true} }
```
Res: `{ "jobId":"e_55" }`

---

### 8) Validation Rules

- Enforce **target time Â±5%**; offer trim/expand suggestions instead of failing.  
- Banned phrases must not appear; provide alternates.  
- Quotes require **author** and at least one of (year/source/url).  
- Teleprompter prep: enforce min font size for readability; max line length ~80 chars.  
- Exports must pass schema checks; TXT removes styling and keeps cue marks.

---

### 9) Plans and Limits

| Feature | Free | Pro |
|---|---|---|
| Projects | 3 | Unlimited |
| Max minutes | 8 | 30 |
| Languages | EN | Multi |
| Teleprompter | Basic | Autoâ€‘scroll + logs |
| Exports | MD/TXT | + DOCX/PDF |
| Quotes | Basic | Extended |
| Exports/day | 3 | 15 |
| History | 60 days | Unlimited |

Rate limits: `/outline/generate` 30/day (Free) 200/day (Pro); `/draft/generate` 20/day (Free) 120/day (Pro).

---

### 10) Suggested File Layout

```
src/pages/speech/index.astro
src/pages/speech/new.astro
src/pages/speech/project/[id].astro
src/pages/speech/export/[id].astro
src/pages/speech/settings.astro

src/pages/speech/api/project/create.ts
src/pages/speech/api/project/index.ts
src/pages/speech/api/project/update.ts
src/pages/speech/api/project/archive.ts
src/pages/speech/api/outline/generate.ts
src/pages/speech/api/draft/generate.ts
src/pages/speech/api/draft/rewrite.ts
src/pages/speech/api/section/edit.ts
src/pages/speech/api/quotes/suggest.ts
src/pages/speech/api/quote/attach.ts
src/pages/speech/api/source/add.ts
src/pages/speech/api/cues/insert.ts
src/pages/speech/api/teleprompter/prepare.ts
src/pages/speech/api/practice/log.ts
src/pages/speech/api/export.ts
src/pages/speech/api/export/status.ts

src/components/speech/Workspace/*.astro
src/components/speech/Teleprompter/*.astro
src/components/speech/Practice/*.astro
src/components/speech/Quotes/*.astro
```

---

### 11) Future Enhancements (v2+)

- **ASRâ€‘based rehearsal**: live wordsâ€‘perâ€‘minute and filler detection from mic.  
- **Autoâ€‘slide sync**: highlight teleprompter cue when Presentation Designer reaches section.  
- **Story library**: reusable anecdotes with tags; privacyâ€‘aware.  
- **Audience feedback** simulator: test 5 coldâ€‘open options, pick best via ratings.  
- **TTS voice rehearsal** with SSML marks for pauses and emphasis.

---

**End of Requirements â€” Ready for Codex Implementation.**
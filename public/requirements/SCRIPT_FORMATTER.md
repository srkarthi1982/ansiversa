# ðŸŽ¬ Script Formatter â€” Full Requirements (Ansiversa)

This document includes a **Codexâ€‘friendly summary** and a **full technical specification** for implementing the Script Formatter mini app.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### Overview
**Script Formatter** is a professional screen/stage/audio script editor with **industryâ€‘standard formatting**, **live preview**, and **export pipelines**. It supports **screenplays** (Fountain/FDX), **stage plays** (Samuel French/Modern format), **sitcom multiâ€‘cam**, **audio drama/podcast**, **ad spot scripts**, and **YouTube/scripted content**. It provides **elementâ€‘aware editing** (slugline, action, character, dialogue, parenthetical, transition, shot, lyric), **format validators**, **pageâ€‘time estimates** (â‰ˆ1 page â‰ˆ 1 minute for screenplays), **autoâ€‘reformat**, **rewrite passes** (tighten action, dialogue punch, cutâ€‘toâ€‘time), and **imports/exports** (Fountain, Final Draft FDX, PDF, DOCX). Integrates with **Story Crafter** (beatsâ†”scenes), **Presentation Designer** (pitch decks), and **Poem Studio / Song Lyric Maker** (lyric blocks).

### Core Features
- **Elementâ€‘aware editor** with keyboard shortcuts and tab/enter cycling between elements.  
- **Format presets**: Screenplay (US Letter/A4), Stage play, Sitcom multiâ€‘cam, Audio script, Ad spot (30s/60s), YouTube script.  
- **Live preview and pagination** with **exact margins**, monospaced fonts, and page numbers.  
- **Validators**: slugline caps, character caps, dialogue width, scene numbers, CONTâ€™D, MORE, transitions on right, orphan line checks.  
- **Autoâ€‘reformat**: convert raw text to elements; normalize capitalization, smart quotes, emâ€‘dashes, spacing.  
- **Timing**: page/minute estimate; dialogue syllable duration heuristic; readâ€‘through timer.  
- **Rewrite passes**: tighten action, punch dialogue, simplify stage directions, remove filler, target duration, profanity cleaner.  
- **Breakdown tools**: character list, scene list, locations, props; **shot list** extraction (INT/EXT, DAY/NIGHT, shots in Action).  
- **Beat sync**: import beats from **Story Crafter**; align scenes; backâ€‘annotate changes.  
- **Revision system**: colored revision marks (Blue, Pink, Yellow, etc.), Aâ€‘pages, watermarks (Pro).  
- **Exports**: Fountain `.fountain`, Final Draft `.fdx`, PDF, DOCX; **scene/shot/character reports** (CSV).  
- **Imports**: Fountain, FDX, TXT/MD; basic parsing for DOCX (v1.1).

### Key Pages
- `/script` â€” Library/dashboard  
- `/script/new` â€” Template wizard (format preset, page size, margins, title page)  
- `/script/[id]/edit` â€” Dualâ€‘pane editor (left source, right preview) with format toolbar  
- `/script/[id]/analyze` â€” Validation issues, timing, reports (scenes/characters/locations/props/shots)  
- `/script/[id]/export` â€” Export center (Fountain/FDX/PDF/DOCX/CSV)  
- `/script/settings` â€” Defaults (preset, fonts, margins, language), revision colors

### Minimal Data Model
`ScriptProject`, `Scene`, `ScriptElement`, `Character`, `Location`, `BeatLink`, `Analysis`, `Suggestion`, `Revision`, `Snapshot`, `ImportJob`, `ExportJob`, `StylePreset`, `Report`, `Tag`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Projects | 2 | Unlimited |
| Export | Fountain + PDF (watermark) | Fountain/FDX/PDF/DOCX/CSV (no watermark) |
| Revision colors & Aâ€‘pages | Basic | Full set + watermark + locks |
| Reports | Scenes/Characters | + Locations/Props/Shots CSV |
| Beat sync | View only | Twoâ€‘way sync with Story Crafter |
| AI passes/day | 20 | 300 |
| History retention | 60 days | Unlimited |

Integrations: **Story Crafter** (beatsâ†”scenes), **Presentation Designer** (oneâ€‘pager/pitch), **Song Lyric Maker/Poem Studio** (lyric blocks), **Ad Copy Assistant** (ad scripts).

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives & Nonâ€‘Goals
**Objectives**
- Deliver **correct, industryâ€‘standard** formatting for multiple script types with **live preview** and **robust exports**.  
- Provide **smart validators** and **autoâ€‘reformat** to clean messy text.  
- Offer practical **timing** and **breakdown** tools for production readiness.

**Nonâ€‘Goals (v1)**
- No collaborative multiâ€‘user editing (v2).  
- No watermarked preview removal for Free plan.  
- No final scheduling or budgeting (export preâ€‘production CSVs only).

---

### 2) Formats & Presets

**Screenplay (Feature/Short)**  
- US Letter/A4, 12pt Courier Prime, 1.0â€“1.5" margins per element conventions.  
- Elements: **Slugline**, **Action**, **Character**, **Parenthetical**, **Dialogue**, **Transition**, **Shot**, **Lyrics** (monospace centered), **Notes/Comments**.  
- Slugline: `INT./EXT. LOCATION â€“ DAY/NIGHT` with scene numbers optional.  
- Rules: character names ALL CAPS, dialogue width â‰ˆ 35â€“43 chars, transitions flush right, continued `CONTâ€™D`, page numbers top-right.

**Stage Play**  
- Elements: **Act/Scene headers**, **Character**, **Dialogue**, **Stage directions** (italics), **Lyrics**, **Notes**.  
- Presets: Modern format; optional Samuel French margins.

**Sitcom Multiâ€‘Cam**  
- Elements: **Scene header**, **Action**, **Character**, **Dialogue**, **Parenthetical**, **Camera**; **doubleâ€‘column** joke/alternate lines (v1.1).

**Audio Drama/Podcast**  
- Elements: **SCENE**, **SFX**, **MUSIC**, **DIALOGUE (CHARACTER)**, **V.O./O.S.**, **TIME** stamps; left column cue labels (v1.1).

**Ad Spot (30/60s)**  
- **Twoâ€‘column A/V** layout (video left, audio right); duration per row; total time meter.

**YouTube/Content Script**  
- Sections: Hook, Intro, Value beats, CTA; timestamps; teleprompter mode.

---

### 3) Information Architecture & Routes

**Pages**
- `/script` â€” Library with filters (format, status, tags).  
- `/script/new` â€” Title page meta (title, by, contact), preset, page size, margins, scene numbers on/off.  
- `/script/[id]/edit` â€” Dualâ€‘pane: **source editor** (Fountainâ€‘like markdown) and **preview** with exact pagination.  
- `/script/[id]/analyze` â€” Lint results (format violations), timing, reports, beat alignment.  
- `/script/[id]/export` â€” Export formats and report generators.  
- `/script/settings` â€” Defaults, fonts, margins, language, revision colors (Blue, Pink, Yellow, etc.).

**API (SSR)**
- Projects: `POST /script/api/project/create` Â· `GET /script/api/project?id=` Â· `POST /script/api/project/update` Â· `POST /script/api/project/archive`  
- Import/Export: `POST /script/api/import` (fountain|fdx|txt|md) Â· `POST /script/api/export` (fountain|fdx|pdf|docx|csv) Â· `GET /script/api/export/status?id=`  
- Parse & Analyze: `POST /script/api/parse` (detect elements) Â· `POST /script/api/analyze` (lint + timing + reports)  
- Reformat & Passes: `POST /script/api/reformat` (auto clean) Â· `POST /script/api/pass/dialogue` `.../action_tighten` `.../cut_to_time` `.../profanity_clean`  
- Beats & Sync: `POST /script/api/beat/link` Â· `POST /script/api/beat/sync`  
- Reports: `GET /script/api/report?type=scenes|characters|locations|props|shots`  
- Settings: `POST /script/api/settings/save`  
- Revisions: `POST /script/api/revision/apply` (color, page locks, Aâ€‘pages)  
- Snapshots: `POST /script/api/snapshot/create` Â· `GET /script/api/snapshot/compare?id1&id2`

Optional WebSocket `/script/ws` for pagination/timing updates and long export notifications.

---

### 4) Editing Model & Shortcuts

**Source syntax (Fountainâ€‘like)**  
- `EXT. BEACH â€“ SUNSET` â†’ Slugline  
- `CHARACTER NAME` + next line dialogue â†’ Character + Dialogue  
- `()`: Parenthetical; `> CUT TO:` rightâ€‘aligned transition; `!NOTE:` inline note; `# Scene Title` scene label.  
- `@LYRIC:` lines treated as centered lyric block.  
- `[[SHOT: CU on hands]]` embeds shot note; `[[PROP: phone]]` tags prop.

**Shortcuts**  
- `Tab` cycles element type; `Enter` continues element; `Shift+Enter` insert element above.  
- `Ctrl/Cmd+1..7` Element hotkeys (slugline, action, character, dialogue, parenthetical, transition, shot).  
- `Ctrl/Cmd+Shift+E` Export; `Ctrl/Cmd+;` Scene number toggle; `Ctrl/Cmd+=` Add Aâ€‘page.

---

### 5) Timing & Reports

- **Timing**: page count Ã— 1 min baseline; dialogue duration = syllables / WPS (wordsâ€‘perâ€‘second) with actor pace presets (slow/normal/fast).  
- **Reports**:  
  - **Scene report**: number, heading, page start/end, est. length.  
  - **Character report**: lines count, total words, speaking time estimate.  
  - **Location report**: INT/EXT breakdown, day/night counts.  
  - **Props**: list with first occurrences.  
  - **Shot list**: extracted from `[[SHOT: ...]]` and Action verbs.

CSV exports available for all reports (Pro).

---

### 6) Data Model (Astro DB / SQL)

**ScriptProject**  
- `id` (uuid pk), `userId`, `title`, `type` ('screenplay'|'stage'|'sitcom'|'audio'|'adspot'|'youtube'), `pageSize` ('letter'|'a4'), `margins` (json), `sceneNumbers` (bool), `language` (code), `status` ('active'|'archived'), `createdAt`, `updatedAt`

**Scene**  
- `id` (pk), `projectId` (fk), `index` (int), `slug` (text), `title` (text|null), `pageStart` (float|null), `pageEnd` (float|null), `timingSec` (int|null), `tags` (json)

**ScriptElement**  
- `id` (pk), `projectId` (fk), `sceneId` (fk), `type` ('slugline'|'action'|'character'|'dialogue'|'parenthetical'|'transition'|'shot'|'lyric'|'note'), `text` (longtext), `meta` (json), `index` (int)

**Character**  
- `id` (pk), `projectId` (fk), `name`, `aliases` (json), `notes` (text)

**Location**  
- `id` (pk), `projectId` (fk), `name`, `intExt` ('INT'|'EXT'|'INT/EXT'), `notes` (text)

**BeatLink**  
- `id` (pk), `projectId` (fk), `beatId` (string), `sceneId` (fk), `note` (text)

**Analysis**  
- `id` (pk), `projectId` (fk), `createdAt`, `lint` (json), `timing` (json), `reports` (json)

**Suggestion**  
- `id` (pk), `projectId` (fk), `type` ('dialogue'|'action'|'cut_to_time'|'profanity'), `payload` (json), `createdAt`

**Revision**  
- `id` (pk), `projectId` (fk), `color` ('blue'|'pink'|'yellow'|'green'|'goldenrod'|'buff'|...), `pageLocks` (json), `aPages` (json), `watermark` (text|null), `createdAt`

**Snapshot**  
- `id` (pk), `projectId` (fk), `createdAt`, `title`, `diff` (json), `sizeBytes` (int)

**ImportJob / ExportJob**  
- common fields: `id`, `projectId`, `format`, `status`, `url`, `createdAt`

**StylePreset**  
- `id` (pk), `projectId` (fk|null), `name`, `pageSize`, `margins`, `fonts` (json), `rules` (json)

**Report**  
- `id` (pk), `projectId` (fk), `type`, `payload` (json), `createdAt`

**Tag**  
- `id` (pk), `name`, `color`

Indexes: `ScriptElement.projectId+sceneId+index`, `Scene.projectId+index`, `Character.projectId+name`.

---

### 7) Validators & Lint Rules

- Slugline must start with `INT.`, `EXT.`, or `INT/EXT.`; location present; time of day present.  
- Character cues: ALL CAPS; `(V.O.)` / `(O.S.)` allowed; `CONTâ€™D` auto when same speaker continues over page.  
- Dialogue: max width enforced; parenthetical small width; avoid trailing spaces.  
- Transitions: only rightâ€‘aligned; allowed: `CUT TO:`, `DISSOLVE TO:`, `FADE IN:`, `FADE OUT.`  
- Scene numbers optional but must be ascending if enabled.  
- Page numbers required on PDF exports; title page without number.  
- Stage/audio presets relax/alter rules accordingly.

---

### 8) AI Passes (Rewrite Tools)

- **Tighten Action**: remove fluff, active verbs, shorter sentences.  
- **Dialogue Punch**: increase subtext, rhythm, and distinct voices.  
- **Cut to Time**: reduce total estimated time by N%; preserve plot beats.  
- **Profanity Clean**: replace or mask words while keeping rhythm.  
- **Stage Direction Simplify**: shorter, producible cues.  
- **ADR pass** (v1.1): flag offâ€‘screen fixes and alt lines.

All passes produce a **diff** preview with accept/reject chunks.

---

### 9) UX / UI

- Dualâ€‘pane editor with sticky ruler; live pagination; character & scene pickers.  
- Side panel: element palette, lint list, timing meter, revision color selector.  
- Reports table with CSV export (Pro).  
- Teleprompter mode (YouTube) with adjustable WPM and highâ€‘contrast theme.  
- Accessibility: full keyboard nav, SR labels, RTL scripts, reduced motion.

---

### 10) API Contracts (Examples)

**Import Fountain**  
`POST /script/api/import`  
```json
{ "projectId":"sp_1", "format":"fountain", "file":"(upload ref)" }
```
Res: `{ "ok":true, "scenes": 28 }`

**Analyze & lint**  
`POST /script/api/analyze`  
```json
{ "projectId":"sp_1", "ruleset":"screenplay_default" }
```
Res: `{ "issues":[{"type":"slugline_time_missing","scene":12}], "timing":{"pages":102,"minutes":102}}`

**Reformat**  
`POST /script/api/reformat`  
```json
{ "projectId":"sp_1", "normalize": ["smart_quotes","caps","spacing"] }
```
Res: `{ "changed": 143 }`

**Dialogue punch pass**  
`POST /script/api/pass/dialogue`  
```json
{ "projectId":"sp_1", "sceneRange":[12,18], "style":"witty", "keepLore":true }
```
Res: `{ "diffMd":"...", "notes":["Condensed banter","Trimmed exposition"] }`

**Export PDF**  
`POST /script/api/export`  
```json
{ "projectId":"sp_1", "format":"pdf", "options":{"watermark":"CONFIDENTIAL â€“ Ansiversa"}} 
```
Res: `{ "jobId":"e_91" }`

---

### 11) Validation Rules

- Title 3â€“120 chars.  
- Max project size: 1,200 elements per script (Free 400).  
- Export size â‰¤ 25 MB; rateâ€‘limit exports to 5/day.  
- Element sequence rules enforced (e.g., Transition cannot start a scene).  
- Imports must pass a basic parse; reject malformed FDX XML.

---

### 12) Plans & Limits

| Feature | Free | Pro |
|---|---|---|
| Projects | 2 | Unlimited |
| Exports | Fountain + watermarked PDF | Fountain/FDX/PDF/DOCX/CSV |
| AI passes/day | 20 | 300 |
| Reports | Basic | Full (CSV) |
| History retention | 60 days | Unlimited |

Rate limits: `/analyze` 60/day (Free) 400/day (Pro); `/pass/*` 40/day (Free) 300/day (Pro).

---

### 13) Suggested File Layout

```
src/pages/script/index.astro
src/pages/script/new.astro
src/pages/script/[id]/edit.astro
src/pages/script/[id]/analyze.astro
src/pages/script/[id]/export.astro
src/pages/script/settings.astro

src/pages/script/api/project/create.ts
src/pages/script/api/project/index.ts
src/pages/script/api/project/update.ts
src/pages/script/api/project/archive.ts
src/pages/script/api/import.ts
src/pages/script/api/export.ts
src/pages/script/api/export/status.ts
src/pages/script/api/parse.ts
src/pages/script/api/analyze.ts
src/pages/script/api/reformat.ts
src/pages/script/api/pass/dialogue.ts
src/pages/script/api/pass/action_tighten.ts
src/pages/script/api/pass/cut_to_time.ts
src/pages/script/api/pass/profanity_clean.ts
src/pages/script/api/beat/link.ts
src/pages/script/api/beat/sync.ts
src/pages/script/api/report.ts
src/pages/script/api/settings/save.ts

src/components/script/Editor/*.astro
src/components/script/Preview/*.astro
src/components/script/Analyze/*.astro
src/components/script/Export/*.astro
```

---

### 14) Future Enhancements (v2+)

- **Collaboration** with comments and tracked changes.  
- **Scheduling handoff**: export to breakdown/scheduling tools (FDX tagger, Movie Magic CSV).  
- **Shot designer** miniâ€‘integration for simple shot diagrams.  
- **Watermark per recipient** and secure screeners.  
- **PWA** with offline editing and sync queue.

---

**End of Requirements â€” Ready for Codex Implementation.**
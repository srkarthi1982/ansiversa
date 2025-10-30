# ðŸ“– Story Crafter â€” Full Requirements (Ansiversa)

This document contains a **Codexâ€‘friendly summary** and a **full technical specification** for implementing the Story Crafter mini app.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### Overview
**Story Crafter** is an AIâ€‘assisted creative writing studio for short stories, novellas, and novels. It helps users **ideate**, **outline**, **develop characters & worlds**, and **draft scenes** using structured tools: **beat sheets (3â€‘Act / Save the Cat)**, **character arcs**, **worldbuilding entries**, and **scene cards**. Users can select **genre & tone**, control **POV/tense**, and run **targeted passes** (dialogue polish, showâ€‘donâ€™tâ€‘tell, pacing). The app maintains **canon/continuity** via a project knowledge base and exports to **Markdown/DOCX/EPUB**.

### Core Features
- **Project templates**: short story, novella, novel; common genres (fantasy, mystery, romance, sciâ€‘fi, thriller, litâ€‘fic).  
- **Outliner**: 3â€‘Act / Save The Cat beats; dragâ€‘drop chapters & scenes with wordâ€‘count goals.  
- **Character system**: profiles, goals/conflicts, arcs (positive/flat/negative), relationships map.  
- **Worldbuilding**: locations, factions, items, rules/magic systems, timelines; crossâ€‘references.  
- **Scene writer**: splitâ€‘pane (notes on left; draft on right); POV/tense lock; â€œexpand/shortenâ€, â€œshowâ€‘donâ€™tâ€‘tellâ€, â€œdialogue passâ€.  
- **Canon engine**: glossary of facts; **consistency check** (names, ages, dates, places).  
- **Pitch pack**: logline, oneâ€‘paragraph hook, 1â€‘page synopsis, backâ€‘cover blurb.  
- **Versioning**: snapshots per scene/chapter; compare & restore.  
- **Exports**: MD/DOCX/EPUB with styles; chapter separators; title page & ToC.  
- **Integrations**: Prompt Builder (advanced prompts), Research Assistant (background info), Presentation Designer (pitch deck), Grammar Fixer (copy edit).

### Key Pages
- `/storycrafter` â€” Library/dashboard  
- `/storycrafter/new` â€” Project wizard (template, genre, tone, POV/tense, target length)  
- `/storycrafter/[id]/outline` â€” Beats, chapters, scenes (dragâ€‘drop)  
- `/storycrafter/[id]/characters` â€” Character sheets & arcs  
- `/storycrafter/[id]/world` â€” World entries (locations/factions/items), timeline  
- `/storycrafter/[id]/editor` â€” Scene editor with side notes & AI tools  
- `/storycrafter/[id]/export` â€” Compile & export options  
- `/storycrafter/settings` â€” Defaults (POV/tense, voice presets), safety, backups

### Minimal Data Model
`Project`, `OutlineNode`, `Chapter`, `Scene`, `Character`, `Arc`, `WorldEntry`, `Relation`, `TimelineEvent`, `CanonFact`, `Note`, `Snapshot`, `ExportJob`, `Tag`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Projects | 2 | Unlimited |
| Max compile length | 20k words | 200k words |
| Versions/Snapshots | Last 2 | Full history |
| Exports | MD | MD + DOCX + EPUB |
| Consistency checks | Basic | Full (timeline + name/age/place) |
| AI passes per day | 20 | 500 |
| Pitch pack | Basic | Full with variants |

Integrations: **Prompt Builder**, **Research Assistant**, **Presentation Designer**, **Grammar Fixer**, **Poem Studio** (lyrical inserts), **Comic Storyboarder** (v2).

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives & Nonâ€‘Goals
**Objectives**
- Provide an endâ€‘toâ€‘end flow from **idea â†’ outline â†’ character/world â†’ drafting â†’ export**.  
- Keep creative control with **explicit knobs** (genre, tone, POV/tense, word goals).  
- Maintain **continuity** with a project knowledge base and light checks.

**Nonâ€‘Goals (v1)**
- No realâ€‘time multiâ€‘user collaboration (v2).  
- No image generation; link to Presentation Designer for covers/art.  
- No marketplace for user templates (v2).

---

### 2) Information Architecture & Routes

**Pages**
- `/storycrafter` â€” Library of projects; create from template; recent scenes; wordâ€‘count progress.  
- `/storycrafter/new` â€” Wizard (title, logline, genre, subâ€‘genre, tone, target length, POV/tense, template).  
- `/storycrafter/[id]/outline` â€” Beat sheet selector (3â€‘Act / Save the Cat); chapters & scenes tree; dragâ€‘drop ordering; word goals & status.  
- `/storycrafter/[id]/characters` â€” Character list; profile editor; arc timeline; relationship matrix.  
- `/storycrafter/[id]/world` â€” World entries table (type: location/faction/item/rule); detail drawer; timeline; link to canon facts.  
- `/storycrafter/[id]/editor` â€” Scene editor: left (notes, outline, canon highlights), right (rich text editor); AI toolbar.  
- `/storycrafter/[id]/export` â€” Compile options (front/back matter, ToC, chapter breaks, styles, formats); preview.  
- `/storycrafter/settings` â€” Defaults: language, POV, tense, autoâ€‘snapshot every N minutes, plagiarism selfâ€‘check toggle.

**API (SSR)**
- Projects: `GET /storycrafter/api/project/list` Â· `POST /storycrafter/api/project/create` Â· `POST /storycrafter/api/project/update` Â· `POST /storycrafter/api/project/archive`  
- Outline: `POST /storycrafter/api/outline/generate` Â· `POST /storycrafter/api/outline/update` Â· `GET /storycrafter/api/outline?id=`  
- Characters: `POST /storycrafter/api/character/create` Â· `POST /storycrafter/api/character/update` Â· `GET /storycrafter/api/character?id=`  
- World: `POST /storycrafter/api/world/create` Â· `POST /storycrafter/api/world/update` Â· `GET /storycrafter/api/world?id=`  
- Scenes: `POST /storycrafter/api/scene/generate` Â· `POST /storycrafter/api/scene/update` Â· `GET /storycrafter/api/scene?id=`  
- Passes: `POST /storycrafter/api/pass/dialogue` `.../show` `.../pacing` `.../style` `.../consistency`  
- Canon: `POST /storycrafter/api/canon/rebuild` Â· `POST /storycrafter/api/canon/check`  
- Timeline: `POST /storycrafter/api/timeline/add` Â· `GET /storycrafter/api/timeline`  
- Pitch: `POST /storycrafter/api/pitchpack/generate` (logline, synopsis, blurb; variants)  
- Export: `POST /storycrafter/api/export` (md|docx|epub) Â· `GET /storycrafter/api/export/status?id=`  
- Notes/Snapshots: `POST /storycrafter/api/note/add` Â· `POST /storycrafter/api/snapshot/create` Â· `GET /storycrafter/api/snapshot/compare?id1&id2`  
- Settings: `POST /storycrafter/api/settings/save`

Optional WebSocket `/storycrafter/ws` for live wordâ€‘count and snapshot notifications.

---

### 3) AI Controls & Prompts

**Global controls per project**
- **Genre/Subâ€‘genre & Tropes** (e.g., cozy mystery, epic fantasy).  
- **Tone/Voice** (witty, lyrical, gritty, whimsical).  
- **POV** (1st/3rd limited/omniscient) and **tense** (past/present).  
- **Audience** (YA, adult).  
- **Sensitivity guardrails** (limit explicit content; avoid slurs).

**Generators**
- **Idea seeds**: 10 loglines based on genre + tropes.  
- **Beat sheet**: 15 Save the Cat beats or 3â€‘Act with midpoints & turns.  
- **Character arcs**: hero, ally, antagonist; desires/ghost/wound/lie/truth.  
- **World entries**: locations/factions/items; 5â€‘W metadata + rules.  
- **Scene draft**: expand a beat or outline bullet to target word count.  
- **Passes**: dialogue punchâ€‘up; showâ€‘donâ€™tâ€‘tell; reduce adverbs; tighten pacing; consistency & foreshadowing hints.  
- **Pitch pack**: logline, 1â€‘para hook, 1â€‘page synopsis, backâ€‘cover blurb, comparable titles.

**Consistency check (v1 heuristic)**
- Named entity extraction across scenes â†’ build canonical dictionary (`CanonFact`).  
- Detect conflicts (e.g., â€œblue eyesâ€ vs â€œgreen eyesâ€; age math; place spellings).  
- Timeline check: order of `TimelineEvent` vs scene timestamps.

---

### 4) Data Model (Astro DB / SQL)

**Project**  
- `id` (uuid pk), `userId`, `title`, `subtitle`, `logline`, `genre`, `subgenre`, `tone`, `pov` ('1st'|'3rdL'|'3rdO'), `tense` ('past'|'present'), `targetWords` (int), `settings` (json), `createdAt`, `updatedAt`, `status` ('active'|'archived')

**OutlineNode** (beat/chapter/scene node)  
- `id` (pk), `projectId` (fk), `type` ('beat'|'chapter'|'scene'), `parentId` (fk|null), `index` (int), `title`, `summary` (text), `goal` (text|null), `conflict` (text|null), `outcome` (text|null), `wordGoal` (int|null)

**Chapter**  
- `id` (pk), `projectId`, `index`, `title`, `summary`, `wordGoal` (int|null)

**Scene**  
- `id` (pk), `projectId`, `chapterId` (fk|null), `index` (int), `title`, `povCharacterId` (fk|null), `settingId` (fk|null), `draftMd` (longtext), `notesMd` (longtext), `wordCount` (int), `status` ('idea'|'draft'|'revise'|'final'), `createdAt`

**Character**  
- `id` (pk), `projectId`, `name`, `role` ('protagonist'|'antagonist'|'ally'|'other'), `bio` (text), `voice` (text), `goals` (json), `arcType` ('positive'|'flat'|'negative'|null), `age` (int|null), `traits` (json)

**Arc**  
- `id` (pk), `characterId`, `beats` (json: need/want/ghost/wound/lie/truth, turning points), `notes` (text)

**WorldEntry**  
- `id` (pk), `projectId`, `type` ('location'|'faction'|'item'|'rule'), `name`, `summary` (text), `details` (json), `tags` (json)

**Relation**  
- `id` (pk), `projectId`, `fromId`, `toId`, `type` ('knows'|'family'|'rival'|'ally'|'owns'|'located_in'), `note` (text|null)

**TimelineEvent**  
- `id` (pk), `projectId`, `when` (date|string), `label`, `sceneId` (fk|null), `details` (json)

**CanonFact**  
- `id` (pk), `projectId`, `entityType` ('character'|'place'|'item'|'date'|'misc'), `key` (text), `value` (text), `sourceIds` (json), `confidence` (0..1)

**Note**  
- `id` (pk), `projectId`, `sceneId` (fk|null), `text`, `tags` (json), `createdAt`

**Snapshot**  
- `id` (pk), `projectId`, `sceneId` (fk|null), `createdAt`, `title`, `diff` (json), `sizeBytes` (int)

**ExportJob**  
- `id` (pk), `projectId`, `format` ('md'|'docx'|'epub'), `options` (json), `status` ('queued'|'running'|'done'|'error'), `url` (string|null), `createdAt`

**Tag**  
- `id` (pk), `name`, `color`

Indexes on `projectId`, `sceneId`, `characterId`, `createdAt`.

---

### 5) UX / UI

- **Library**: cards with wordâ€‘count progress, last edited time; search & tags.  
- **Outline**: beat sheet view with preset templates; dragâ€‘drop; wordâ€‘goal chips; expand/collapse.  
- **Characters**: tabbed profiles; relationship matrix graph; arc timeline.  
- **World**: table & detail drawer; tag filters; crossâ€‘links; timeline strip.  
- **Editor**: distractionâ€‘free mode; side notes; canon highlights (hover to view fact); toolbar for passes (dialogue, show, pacing, shorten/expand, rewrite in voice).  
- **Export**: preview with styles; ToC; scene/chapter separators; include/exclude front matter.  
- Accessibility: keyboard shortcuts; screen reader labels; high contrast; RTL; reduced motion.

Shortcuts: `Ctrl/Cmd+B` beat, `Ctrl/Cmd+Shift+N` new scene, `Ctrl/Cmd+K` command palette, `Ctrl/Cmd+S` snapshot.

---

### 6) API Contracts (Examples)

**Generate outline**  
`POST /storycrafter/api/outline/generate`  
```json
{
  "projectId":"p1",
  "framework":"save_the_cat",
  "genre":"mystery",
  "targetWords":60000,
  "beats":["Opening Image","Theme Stated","Catalyst","Debate","Break into Two"]
}
```
Res: `{ "nodes":[{"type":"beat","title":"Catalyst","summary":"A body is found..."}] }`

**Create character**  
`POST /storycrafter/api/character/create`  
```json
{ "projectId":"p1", "name":"Asha Raman", "role":"protagonist", "age":29, "arcType":"positive" }
```
Res: `{ "characterId":"c9" }`

**Generate scene**  
`POST /storycrafter/api/scene/generate`  
```json
{
  "projectId":"p1",
  "chapterId":"ch2",
  "title":"Rooftop chase",
  "povCharacterId":"c9",
  "summary":"Protagonist chases thief across market rooftops; nearly falls; finds clue.",
  "wordGoal":1200,
  "tone":"fastâ€‘paced",
  "pov":"3rdL",
  "tense":"past"
}
```
Res: `{ "sceneId":"s42", "draftMd":"..." }`

**Run dialogue pass**  
`POST /storycrafter/api/pass/dialogue`  
```json
{ "sceneId":"s42", "instructions":"Punch up banter; keep clues intact; shorten by 10%." }
```
Res: `{ "diffMd":"...", "notes":["Reduced exposition","Sharper retorts"] }`

**Canon check**  
`POST /storycrafter/api/canon/check` â†’ `{ "conflicts":[{"type":"name","where":["s17","s42"],"detail":"Riya vs Ria"}] }`

**Export**  
`POST /storycrafter/api/export` â†’ `{ "jobId":"e7" }`  
`GET /storycrafter/api/export/status?id=e7` â†’ `{ "status":"done","url":"/exports/p1_book_v1.epub" }`

---

### 7) Validation Rules

- Title 3â€“120 chars; logline â‰¤ 240 chars.  
- Scene `wordGoal` 100â€“5000; project `targetWords` 1kâ€“300k.  
- Max beats per outline 40; max characters 100 per project.  
- Snapshot size â‰¤ 2 MB each; autoâ€‘snapshot no more than once per 2 minutes.  
- Export file size â‰¤ 25 MB; rateâ€‘limit exports to 5/day.  
- AI passes per scene â‰¤ 20/day (Free â‰¤ 3/day).

---

### 8) Plans & Limits

| Feature | Free | Pro |
|---|---|---|
| Projects | 2 | Unlimited |
| Compile length | 20k | 200k |
| Snapshots | 2 recent | Unlimited |
| Consistency | Names only | Names + timeline + places |
| AI passes/day | 20 total | 500 total |
| Exports | MD | MD/DOCX/EPUB |
| History retention | 60 days | Unlimited |

Rate limits: `/outline/generate` 30/day (Free) 200/day (Pro); `/scene/generate` 20/day (Free) 150/day (Pro).

---

### 9) Suggested File Layout

```
src/pages/storycrafter/index.astro
src/pages/storycrafter/new.astro
src/pages/storycrafter/[id]/outline.astro
src/pages/storycrafter/[id]/characters.astro
src/pages/storycrafter/[id]/world.astro
src/pages/storycrafter/[id]/editor.astro
src/pages/storycrafter/[id]/export.astro
src/pages/storycrafter/settings.astro

src/pages/storycrafter/api/project/list.ts
src/pages/storycrafter/api/project/create.ts
src/pages/storycrafter/api/project/update.ts
src/pages/storycrafter/api/project/archive.ts
src/pages/storycrafter/api/outline/generate.ts
src/pages/storycrafter/api/outline/update.ts
src/pages/storycrafter/api/outline/index.ts
src/pages/storycrafter/api/character/create.ts
src/pages/storycrafter/api/character/update.ts
src/pages/storycrafter/api/character/index.ts
src/pages/storycrafter/api/world/create.ts
src/pages/storycrafter/api/world/update.ts
src/pages/storycrafter/api/world/index.ts
src/pages/storycrafter/api/scene/generate.ts
src/pages/storycrafter/api/scene/update.ts
src/pages/storycrafter/api/scene/index.ts
src/pages/storycrafter/api/pass/dialogue.ts
src/pages/storycrafter/api/pass/show.ts
src/pages/storycrafter/api/pass/pacing.ts
src/pages/storycrafter/api/pass/style.ts
src/pages/storycrafter/api/canon/rebuild.ts
src/pages/storycrafter/api/canon/check.ts
src/pages/storycrafter/api/timeline/add.ts
src/pages/storycrafter/api/timeline/index.ts
src/pages/storycrafter/api/pitchpack/generate.ts
src/pages/storycrafter/api/export.ts
src/pages/storycrafter/api/export/status.ts
src/pages/storycrafter/api/note/add.ts
src/pages/storycrafter/api/snapshot/create.ts
src/pages/storycrafter/api/snapshot/compare.ts
src/pages/storycrafter/api/settings/save.ts

src/components/storycrafter/Outline/*.astro
src/components/storycrafter/Characters/*.astro
src/components/storycrafter/World/*.astro
src/components/storycrafter/Editor/*.astro
src/components/storycrafter/Export/*.astro
```

---

### 10) Future Enhancements (v2+)

- **Coâ€‘writing** with share links & comment threads.  
- **Beat â†’ storyboard** handoff to **Comic Storyboarder** with panel suggestions.  
- **Style transfer** presets (Hemingway, Austenâ€‘esque, etc.).  
- **Audio narration** export (TTS).  
- **Series support** (multiâ€‘book bible).  
- **PWA** with offline editing & sync queue.

---

**End of Requirements â€” Ready for Codex Implementation.**
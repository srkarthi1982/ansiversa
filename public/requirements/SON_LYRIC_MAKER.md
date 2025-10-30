# ðŸŽµ Song Lyric Maker â€” Full Requirements (Ansiversa)

This document contains a **Codexâ€‘friendly summary** and a **full technical specification** for implementing the Song Lyric Maker mini app.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### Overview
**Song Lyric Maker** helps users **ideate, structure, and polish** song lyrics across genres (pop, hipâ€‘hop, indie, EDM toplines, rock, Kâ€‘pop, R&B, devotional, kids). It supports **sectioned structures** (verse/chorus/pre/bridge/outro), **hook generation**, **rhyme & syllable guidance**, **prosody alignment** (stress vs beat), and **theme/tone controls**. Users can import a **chord progression or syllable map** to guide line lengths and stresses. Exports include **lyric sheet (MD/DOCX/PDF)** and **singâ€‘along timing sheet**. Integrates with **Poem Studio** (for craft passes), **Presentation Designer** (lyric slides), and **Story Crafter** (diegetic songs).

### Core Features
- **Genre templates** with common section orders & syllable/rhyme expectations.  
- **Hook/Title generator** with variants and **melodic syllable map**.  
- **Lyric editor** with **rhyme suggestions**, **nearâ€‘rhyme**, **alliteration/assonance** hints.  
- **Prosody tools**: align syllables to beats/measures; stress checks with tolerance.  
- **Thematic controls**: topic, setting, persona/POV, tone, vocabulary sliders (simple â†” poetic).  
- **Multilingual** drafting (EN first; TA/AR/ES supported with relaxed meter).  
- **Revision passes**: tighten imagery, punch up hook, increase singability, simplify for chorus, â€œcleanâ€ version.  
- **Structure lab**: rearrange sections; preview rhyme map (A/B/C) and syllable bars.  
- **Rhythm/tempo helpers**: tap tempo, line timing estimation, performance timer.  
- **Exports**: lyric sheet; chordâ€‘synced sheet; karaoke cue sheet (timestamps); CSV for DAW markers.  
- **Integrations**: Poem Studio, Presentation Designer, Story Crafter; optional link to **Prompt Builder**.

### Key Pages
- `/lyrics` â€” Library/dashboard  
- `/lyrics/new` â€” Project wizard (genre, vibe, theme, section template)  
- `/lyrics/[id]/edit` â€” Sectioned editor with craft panel and structure lab  
- `/lyrics/[id]/analyze` â€” Rhyme/syllable/prosody report  
- `/lyrics/[id]/export` â€” Compile & export options  
- `/lyrics/settings` â€” Defaults (language, rhyme style, profanity filter), privacy

### Minimal Data Model
`LyricProject`, `Section`, `Line`, `Analysis`, `Suggestion`, `Hook`, `Structure`, `TempoMap`, `ExportJob`, `Tag`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Projects | 3 | Unlimited |
| Hook variants per prompt | 5 | 30 |
| Nearâ€‘rhyme & prosody analysis | Basic | Full + timing sheet |
| Multilingual drafting | EN only | EN + TA/AR/ES |
| Exports | MD | MD + PDF + DOCX + CSV |
| AI passes/day | 25 | 400 |
| Templates | Core | All genres + custom save |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives & Nonâ€‘Goals
**Objectives**
- Make it **fast** to reach a **singable**, catchy lyric with proper **sections** and a **memorable hook**.  
- Offer helpful **rhyme/syllable** guidance without being rigid.  
- Support multilingual drafting and cleanâ€‘lyrics toggles.

**Nonâ€‘Goals (v1)**
- No audio melody generation or full music production.  
- No marketplace of user beats/instrumentals (v2).

---

### 2) Information Architecture & Routes

**Pages**
- `/lyrics` â€” Library with recent projects; quick start and templates.  
- `/lyrics/new` â€” Wizard: genre, subâ€‘genre, theme/topic, POV, tone, section template (e.g., V1â€“Preâ€“Châ€“V2â€“Châ€“Brâ€“Châ€“Out).  
- `/lyrics/[id]/edit` â€” Core editor: left (sections + lines), right (craft panel: rhyme suggestions, syllable bars, imagery), bottom (structure lab & tempo).  
- `/lyrics/[id]/analyze` â€” Detailed report: rhyme map, syllable histograms, stress/beat alignment, clichÃ© detector, repetition map.  
- `/lyrics/[id]/export` â€” Choose formats; include chord symbols, timestamps, or karaoke cues.  
- `/lyrics/settings` â€” Defaults: language, rhyme style (perfect/near/internal), profanity/clean toggle, allowed vocabulary lists.

**API (SSR)**
- Projects: `GET /lyrics/api/list` Â· `POST /lyrics/api/create` Â· `POST /lyrics/api/update` Â· `POST /lyrics/api/archive`  
- Generate: `POST /lyrics/api/generate` (hook + sections from prompt)  
- Hooks: `POST /lyrics/api/hook/variants`  
- Analysis: `POST /lyrics/api/analyze` (rhyme/syllable/prosody/clichÃ©s)  
- Passes: `POST /lyrics/api/pass/hook_punch` `.../imagery` `.../singability` `.../simplify` `.../clean`  
- Structure: `POST /lyrics/api/structure/update` Â· `POST /lyrics/api/section/add` `.../delete` `.../move`  
- Tempo: `POST /lyrics/api/tempo/set` (bpm, bars), `POST /lyrics/api/tempo/tap`  
- Export: `POST /lyrics/api/export` (md|pdf|docx|csv) Â· `GET /lyrics/api/export/status?id=`  
- Settings: `POST /lyrics/api/settings/save`

Optional WebSocket `/lyrics/ws` for live syllable counts and tapâ€‘tempo feedback.

---

### 3) Generators & Controls

**Genre presets**  
- Pop, Rock, Indie, Hipâ€‘hop, R&B, EDM (topline), Kâ€‘pop, Country, Devotional, Childrenâ€™s.  
- Each preset provides: **common section order**, **target syllable spans** per line, **rhyme tendencies** (e.g., couplets for rap, alt rhymes for indie).

**Prompt controls**  
- Theme/topic, setting, POV (I/you/heâ€‘she/they), relationship status, tone (wistful, hype, defiant, tender), vocabulary slider (simple â†” poetic), â€œcleanâ€‘lyricsâ€ toggle, language.

**Hook generator**  
- Produce 5â€“30 variants with **short memorable phrases** (â‰¤7 content words), punchiness score, singability score, and **keyword coverage**.  
- Let the user pin one as **Title**.

**Section drafting**  
- For each section (Verse, Pre, Chorus, Bridge, Outro), generate lines respecting **target syllable spans** and **rhyme map** (AABB/ABAB/etc.) with tolerance.  
- Offer alternative lines; 1â€‘click swap.

**Prosody alignment**  
- If a **syllable map** or **bars** (e.g., `7|7|8|7`) is provided, nudge line lengths and stresses to fit.  
- Stress check (heuristic) warns about clunky scansion.

**Revision passes**  
- *Hook Punch*: shorten/heighten contrast/alliteration.  
- *Singability*: reduce tongueâ€‘twisters; avoid dense consonant clusters.  
- *Simplify Chorus*: fewer unique words; repeat motif.  
- *Imagery*: swap abstractions for sensory detail.  
- *Clean*: remove profanity; suggest clean synonyms.

---

### 4) Data Model (Astro DB / SQL)

**LyricProject**  
- `id` (uuid pk), `userId`, `title`, `genre`, `language`, `theme`, `tone`, `pov`, `clean` (bool), `settings` (json), `createdAt`, `updatedAt`, `status` ('active'|'archived')

**Structure**  
- `id` (pk), `projectId` (fk), `order` (json: array of section ids in order), `notes` (text)

**Section**  
- `id` (pk), `projectId` (fk), `type` ('verse'|'pre'|'chorus'|'bridge'|'outro'|'intro'|'hook'|'rap'), `index` (int), `rhymePlan` (json), `syllablePlan` (json), `tempoMapId` (fk|null), `notes` (text)

**Line**  
- `id` (pk), `sectionId` (fk), `index` (int), `text` (text), `syllables` (int|null), `rhymeKey` (char|null), `stressOk` (bool|null), `alt` (json), `flags` (json), `timestamp` (float|null)

**Hook**  
- `id` (pk), `projectId` (fk), `text`, `scorePunch` (float), `scoreSing` (float), `keywords` (json), `pinned` (bool)

**TempoMap**  
- `id` (pk), `projectId` (fk), `bpm` (int), `bars` (int), `signature` (text default '4/4'), `timestamps` (json)

**Analysis**  
- `id` (pk), `projectId` (fk), `createdAt`, `rhyme` (json), `syllables` (json), `prosody` (json), `cliche` (json), `repetition` (json), `scores` (json)

**Suggestion**  
- `id` (pk), `projectId` (fk), `type` ('hook_punch'|'imagery'|'singability'|'simplify'|'clean'), `payload` (json), `createdAt`

**ExportJob**  
- `id` (pk), `projectId` (fk), `format` ('md'|'pdf'|'docx'|'csv'), `options` (json), `status` ('queued'|'running'|'done'|'error'), `url` (string|null), `createdAt`

**Tag**  
- `id` (pk), `name`, `color`

Indexes: `LyricProject.userId`, `Section.projectId`, `Line.sectionId`, `Hook.projectId`, `Analysis.projectId`.

---

### 5) UX / UI

- **Editor**: section cards; inline syllable counters; rhyme key badges (A/B/Câ€¦); suggested synonyms; profanity flags (if clean mode on).  
- **Structure lab**: dragâ€‘drop section order; visualize rhyme map; syllable bar chart; â€œadd rap verseâ€ toggle.  
- **Hook board**: grid of variants with punch/singability scores; pin to title; send to Presentation Designer for cover slide.  
- **Analyze page**: rhyme graph, repetition heatmap (per word), clichÃ© warnings, syllable histograms.  
- **Export**: lyric sheet with or without chord placeholders; CSV markers (`section,line,time`).  
- Accessibility: screenâ€‘reader labels, high contrast, RTL, reduced motion.

Shortcuts: `Ctrl/Cmd+Alt+H` new hook variants, `Ctrl/Cmd+Enter` analyze, `Ctrl/Cmd+S` save, `Ctrl/Cmd+L` add line, `Ctrl/Cmd+Shift+R` run â€œHook Punchâ€.

---

### 6) API Contracts (Examples)

**Create project**  
`POST /lyrics/api/create`  
```json
{ "title":"Neon Skyline", "genre":"pop", "language":"en", "theme":"late-night city", "tone":"wistful", "pov":"I", "clean":true }
```  
Res: `{ "projectId":"lp_42" }`

**Generate hooks**  
`POST /lyrics/api/hook/variants`  
```json
{ "projectId":"lp_42", "count":12, "keywords":["neon","skyline","after midnight"] }
```
Res: `{ "items":[{"text":"after midnight on the neon skyline","scorePunch":0.84,"scoreSing":0.79}] }`

**Draft sections**  
`POST /lyrics/api/generate`  
```json
{
  "projectId":"lp_42",
  "sections":["verse","pre","chorus"],
  "rhymePlan":{"verse":"ABAB","chorus":"A A A A"},
  "syllablePlan":{"verse":[7,8,7,8],"chorus":[6,6,6,6]}
}
```
Res: `{ "sections":[{"type":"verse","lines":[{"text":"...","syllables":7,"rhymeKey":"A"}]}] }`

**Analyze**  
`POST /lyrics/api/analyze` â†’ `{ "rhyme":{"scheme":"ABAB"}, "syllables":{"verse":[7,8,7,9]}, "prosody":{"warnings":[{"line":4,"msg":"stress misaligned"}]}}`

**Run pass**  
`POST /lyrics/api/pass/hook_punch` â†’ `{ "diff":{"hook":"shorter snappier phrase"} }`

**Export**  
`POST /lyrics/api/export`  
```json
{ "projectId":"lp_42", "format":"pdf", "options":{"chords":false,"timestamps":true} }
```
Res: `{ "jobId":"e101" }`

---

### 7) Validation Rules

- Title 2â€“120 chars; lines â‰¤ 160 chars.  
- Section count 1â€“20; line count per section 1â€“24.  
- BPM 40â€“200; bars 1â€“512.  
- Exports â‰¤ 20 MB; rateâ€‘limit exports to 5/day.  
- AI passes/day: Free â‰¤ 25; Pro â‰¤ 400.  
- Clean mode must replace/asterisk disallowed words (maintain rhythm where possible).

---

### 8) Plans & Limits

| Feature | Free | Pro |
|---|---|---|
| Projects | 3 | Unlimited |
| Hooks per prompt | 5 | 30 |
| Analysis depth | Basic | Full + prosody |
| Multilingual | EN | EN + TA/AR/ES |
| Exports | MD | MD/PDF/DOCX/CSV |
| AI passes/day | 25 | 400 |
| History retention | 60 days | Unlimited |

Rate limits: `/hook/variants` 60/day (Free) 400/day (Pro); `/generate` 40/day (Free) 300/day (Pro).

---

### 9) Suggested File Layout

```
src/pages/lyrics/index.astro
src/pages/lyrics/new.astro
src/pages/lyrics/[id]/edit.astro
src/pages/lyrics/[id]/analyze.astro
src/pages/lyrics/[id]/export.astro
src/pages/lyrics/settings.astro

src/pages/lyrics/api/list.ts
src/pages/lyrics/api/create.ts
src/pages/lyrics/api/update.ts
src/pages/lyrics/api/archive.ts
src/pages/lyrics/api/generate.ts
src/pages/lyrics/api/hook/variants.ts
src/pages/lyrics/api/analyze.ts
src/pages/lyrics/api/pass/hook_punch.ts
src/pages/lyrics/api/pass/imagery.ts
src/pages/lyrics/api/pass/singability.ts
src/pages/lyrics/api/pass/simplify.ts
src/pages/lyrics/api/pass/clean.ts
src/pages/lyrics/api/structure/update.ts
src/pages/lyrics/api/section/add.ts
src/pages/lyrics/api/section/delete.ts
src/pages/lyrics/api/section/move.ts
src/pages/lyrics/api/tempo/set.ts
src/pages/lyrics/api/tempo/tap.ts
src/pages/lyrics/api/export.ts
src/pages/lyrics/api/export/status.ts

src/components/lyrics/Editor/*.astro
src/components/lyrics/StructureLab/*.astro
src/components/lyrics/Analyze/*.astro
src/components/lyrics/HookBoard/*.astro
```

---

### 10) Future Enhancements (v2+)

- **Melody helper**: noteâ€‘name suggestions per syllable; MIDI export.  
- **Rhyme dictionary customization** per language; user word lists.  
- **Collaborative writing** with comments & roles (topliner/rapper).  
- **Beat import** (tempo autoâ€‘detect from audio; align bars).  
- **Karaoke preview** with autoâ€‘scroll lyrics.  
- **PWA** for offline drafting and rehearsal.

---

**End of Requirements â€” Ready for Codex Implementation.**
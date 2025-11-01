# âœï¸ Poem Studio â€” Full Requirements (Ansiversa)

This document contains a **Codexâ€‘friendly summary** and a **full technical specification** for implementing the Poem Studio mini app.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### Overview
**Poem Studio** is an AIâ€‘assisted poetry workshop. It helps users **draft, revise, and analyze poems** across forms (free verse, sonnet, haiku, ghazal, villanelle, limerick, blank verse, acrostic, spoken word). The studio includes **form validators**, **meter and rhyme helpers**, **imagery/figurativeâ€‘language detectors**, **tone/style controls**, and a **revision assistant** with craftâ€‘focused passes (concreteness, music, enjambment, line breaks). Users can compile chapbooks and export to **MD/PDF/DOCX** with layout presets.

### Core Features
- **Form presets** with constraints (syllable counts, rhyme schemes, stanza structures).  
- **Meter and rhyme tools**: stress detection (heuristic), IPA display, rhyme finder, nearâ€‘rhyme suggestions.  
- **Draft workspace** with splitâ€‘pane: **poem editor** and **craft panel** (imagery, verbs, clichÃ©s, abstractness).  
- **Style and tone controls** (e.g., romantic, confessional, surreal, minimalist; diction level).  
- **Targeted revision passes**: sharpen imagery, reduce adverbs, vary line length, strengthen verbs, adjust enjambment, compress language.  
- **Form validator**: live checks for sonnet/haiku/villanelle/ghazal/etc., with guidance.  
- **Prompt seeds**: theme, scene, or constraintâ€‘driven starters.  
- **Readâ€‘aloud (TTS)** and performance timer for spokenâ€‘word pacing.  
- **Chapbook builder**: sequence multiple poems with title/section pages.  
- **Exports**: MD, PDF (server), DOCX; keep stanza spacing and small caps options.  
- **Integrations**: Story Crafter (lyrics/poem-studios into scenes), Presentation Designer (poetry slides), Grammar Fixer (light copy edit).

### Key Pages
- `/poem-studio` â€” Library/dashboard  
- `/poem-studio/new` â€” Create poem (form, theme, tone, constraints)  
- `/poem-studio/[id]/edit` â€” Editor + craft/analysis tools  
- `/poem-studio/[id]/analyze` â€” Detailed meter/rhyme/imagery report  
- `/poem-studio/chapbook` â€” Build/preview/export a collection  
- `/poem-studio/settings` â€” Defaults (language, tone, fonts), privacy

### Minimal Data Model
`Poem`, `Form`, `Constraint`, `Draft`, `Analysis`, `Suggestion`, `Revision`, `Collection`, `ExportJob`, `Tag`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Saved poems | 5 | Unlimited |
| Advanced forms (villanelle/ghazal) | Limited | Full |
| Meter/rhyme deep analysis | Basic | Full + nearâ€‘rhyme |
| Chapbook builder | â€” | âœ… |
| TTS readâ€‘aloud | âœ… | âœ… |
| Exports | MD | MD + PDF + DOCX |
| AI passes/day | 20 | 300 |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives and Nonâ€‘Goals
**Objectives**
- Provide a craftâ€‘aware poetry workspace with realâ€‘time **form validation** and **analysis**.  
- Support **English** first; allow multilingual with reduced meter accuracy for nonâ€‘stress languages.  
- Encourage iteration via **revision passes** and **sideâ€‘byâ€‘side diffs**.

**Nonâ€‘Goals (v1)**
- No community publishing feed (v2).  
- No peer critique marketplace (v2).

---

### 2) Information Architecture and Routes

**Pages**
- `/poem-studio` â€” Library; quick actions; recent analyses; collection progress.  
- `/poem-studio/new` â€” Choose form, theme, tone, constraints (syllables/rhyme), language.  
- `/poem-studio/[id]/edit` â€” Main editor with craft panel: analysis chips; inline warnings; generator and pass toolbar.  
- `/poem-studio/[id]/analyze` â€” Full report: meter scan, rhyme map, imagery density, abstractness index, clichÃ©s, repeated words, line length histogram.  
- `/poem-studio/chapbook` â€” Collection builder; order poems; section titles; dedication/acknowledgments.  
- `/poem-studio/settings` â€” Defaults: font family/size, line spacing, language, tone, privacy.

**API (SSR)**
- Poems: `GET /poem-studio/api/list` Â· `POST /poem-studio/api/create` Â· `POST /poem-studio/api/update` Â· `POST /poem-studio/api/archive`  
- Generate: `POST /poem-studio/api/generate` (seed â†’ draft by form/tone)  
- Analyze: `POST /poem-studio/api/analyze` (returns metrics + issues)  
- Passes: `POST /poem-studio/api/pass/imagery` `.../verbs` `.../compress` `.../enjambment` `.../breaks` `.../style`  
- Rhyme: `GET /poem-studio/api/rhyme?word=&near=`  
- Meter: `POST /poem-studio/api/meter/scan` (heuristic stress)  
- Form: `POST /poem-studio/api/form/validate`  
- Collections: `POST /poem-studio/api/collection/create` Â· `POST /poem-studio/api/collection/add` Â· `GET /poem-studio/api/collection?id=`  
- Export: `POST /poem-studio/api/export` (md|pdf|docx) Â· `GET /poem-studio/api/export/status?id=`  
- Settings: `POST /poem-studio/api/settings/save`

Optional WebSocket `/poem-studio/ws` for live meter feedback and diff previews.

---

### 3) Forms and Constraints (Reference)

**Builtâ€‘in forms** (v1)
- **Free verse** (no constraints).  
- **Haiku** (5â€‘7â€‘5 syllables; seasonal word optional).  
- **Tanka** (5â€‘7â€‘5â€‘7â€‘7).  
- **Limerick** (AABBA; anapestic tendency; line length rules).  
- **Sonnet** (Shakespearean ABAB CDCD EFEF GG; 10 syllables guideline; iambic bent).  
- **Villanelle** (ABA Ã—5 + ABA; refrains at lines 1, 6, 12, 18, 19).  
- **Ghazal** (AA bA cA â€¦; radif and qaafiya; couplets semantically selfâ€‘contained).  
- **Acrostic** (line initials spell a word/phrase).  
- **Blank verse** (unrhymed iambic pentameter).  
- **Spoken word** (performance timing, repetition emphasis).

**Constraint model**
- `syllablesPerLine` (array or pattern), `rhymeScheme` (per line), `refrains`, `acrosticKey`, `meterHint` ('iambic','anapestic',etc.), `stanzas` (#, size), `options` (leniency).

---

### 4) Craft Analysis (Heuristics + LLM Hints)

- **Meter scan**: syllable count and stress pattern (CMUdictâ€‘style heuristics for English; tolerance score).  
- **Rhyme map**: endâ€‘rhyme letters; nearâ€‘rhyme suggestions with IPA distance.  
- **Imagery and concreteness**: nouns vs abstractions ratio; verb strength index.  
- **Sound devices**: alliteration/assonance/consonance (approximate nâ€‘gram match).  
- **ClichÃ© and redundancy**: simple nâ€‘gram hits + LLM heuristic flags.  
- **Line length**: histogram; outlier markers; enjambment opportunities.  
- **Form compliance**: pass/fail per line/stanza with corrective tips.

---

### 5) Data Model (Astro DB / SQL)

**Poem**  
- `id` (uuid pk), `userId`, `title`, `formId` (fk), `language` ('en'|'ta'|'ar'|...), `tone`, `theme`, `draftMd` (longtext), `createdAt`, `updatedAt`, `status` ('draft'|'final')

**Form**  
- `id` (pk), `name`, `constraints` (json), `description`, `examples` (json)

**Constraint**  
- `id` (pk), `formId` (fk), `key`, `value` (json)

**Draft** (versioning)  
- `id` (pk), `poemId` (fk), `createdAt`, `diff` (json), `sizeBytes` (int), `note` (text|null)

**Analysis**  
- `id` (pk), `poemId` (fk), `createdAt`, `meter` (json), `rhyme` (json), `imagery` (json), `issues` (json), `score` (float)

**Suggestion**  
- `id` (pk), `poemId` (fk), `type` ('imagery'|'verbs'|'compress'|'enjambment'|'breaks'|'style'), `payload` (json), `createdAt`

**Revision**  
- `id` (pk), `poemId` (fk), `fromDraftId` (fk), `toDraftId` (fk), `notes` (text)

**Collection**  
- `id` (pk), `userId` (fk), `title`, `poemOrder` (json), `frontMatter` (json), `createdAt`

**ExportJob**  
- `id` (pk), `poemId` (fk|null), `collectionId` (fk|null), `format` ('md'|'pdf'|'docx'), `options` (json), `status` ('queued'|'running'|'done'|'error'), `url` (string|null), `createdAt`

**Tag**  
- `id` (pk), `name`, `color`

Indexes: `Poem.userId`, `Poem.formId`, `Analysis.poemId`, `Draft.poemId`.

---

### 6) UX / UI

- **Editor**: monospace or poetry serif fonts; line numbers optional; soft wrap; stanza spacing controls.  
- **Craft panel**: analysis chips (e.g., *Meter: 78%*, *Rhyme: ABAB*), warnings with quick fixes.  
- **Pass toolbar**: buttons for *Sharpen Imagery*, *Stronger Verbs*, *Compress*, *Line Breaks*, *Enjambment*, *Style*.  
- **Diff viewer**: sideâ€‘byâ€‘side with additions/deletions; accept/reject chunks.  
- **Chapbook**: dragâ€‘drop poem order; preview with title page, sections, acknowledgments.  
- Accessibility: keyboard shortcuts; high contrast; RTL scripts; reduced motion.

Shortcuts: `Ctrl/Cmd+Enter` analyze, `Ctrl/Cmd+Shift+E` export, `Ctrl/Cmd+S` save draft, `Ctrl/Cmd+D` snapshot.

---

### 7) API Contracts (Examples)

**Create poem**  
`POST /poem-studio/api/create`  
```json
{ "title":"Kitchen Light", "formId":"sonnet", "language":"en", "tone":"intimate", "theme":"memory" }
```
Res: `{ "poemId":"p42" }`

**Generate seed**  
`POST /poem-studio/api/generate`  
```json
{ "form":"villanelle", "theme":"monsoon in Chennai", "tone":"lyrical", "constraints":{"refrain":"..."} }
```
Res: `{ "poemMd":"..." }`

**Analyze**  
`POST /poem-studio/api/analyze`  
```json
{ "poemId":"p42", "text":"Your poem text..." }
```
Res: `{ "meter":{"score":0.72}, "rhyme":{"scheme":"ABAB"}, "issues":[{"type":"cliche","line":3,"hint":"Avoid 'cold as ice'"}] }`

**Run pass**  
`POST /poem-studio/api/pass/imagery`  
```json
{ "poemId":"p42", "instructions":"Make concrete with sensory detail; keep Tamil cultural references." }
```
Res: `{ "diffMd":"...", "notes":["Replaced 'flower' with 'jasmine garland'"] }`

**Validate form**  
`POST /poem-studio/api/form/validate` â†’ `{ "ok":false, "problems":[{"line":14,"issue":"syllables=9 expectedâ‰ˆ10"}] }`

**Export chapbook**  
`POST /poem-studio/api/export`  
```json
{ "collectionId":"c7", "format":"pdf", "options":{"font":"Garamond","smallCaps":true} }
```
Res: `{ "jobId":"e9" }`

---

### 8) Validation Rules

- Title 2â€“120 chars.  
- Draft text â‰¤ 50k chars per poem (Free â‰¤ 10k).  
- Form validator tolerances: Â±1 syllable for English unless strict mode.  
- Max poems per collection: 100.  
- Export file size â‰¤ 20 MB; rateâ€‘limit exports to 5/day.  
- AI passes per poem/day: Free â‰¤ 5; Pro â‰¤ 50.

---

### 9) Plans and Limits

| Feature | Free | Pro |
|---|---|---|
| Saved poems | 5 | Unlimited |
| Advanced forms | Limited | Full |
| Analysis depth | Basic | Full + nearâ€‘rhyme |
| Chapbook | â€” | âœ… |
| Exports | MD | MD + PDF/DOCX |
| AI passes/day | 20 total | 300 total |
| History retention | 60 days | Unlimited |

Rate limits: `/analyze` 60/day (Free) 400/day (Pro); `/pass/*` 40/day (Free) 300/day (Pro).

---

### 10) Suggested File Layout

```
src/pages/poem-studio/index.astro
src/pages/poem-studio/new.astro
src/pages/poem-studio/[id]/edit.astro
src/pages/poem-studio/[id]/analyze.astro
src/pages/poem-studio/chapbook.astro
src/pages/poem-studio/settings.astro

src/pages/poem-studio/api/list.ts
src/pages/poem-studio/api/create.ts
src/pages/poem-studio/api/update.ts
src/pages/poem-studio/api/archive.ts
src/pages/poem-studio/api/generate.ts
src/pages/poem-studio/api/analyze.ts
src/pages/poem-studio/api/pass/imagery.ts
src/pages/poem-studio/api/pass/verbs.ts
src/pages/poem-studio/api/pass/compress.ts
src/pages/poem-studio/api/pass/enjambment.ts
src/pages/poem-studio/api/pass/breaks.ts
src/pages/poem-studio/api/pass/style.ts
src/pages/poem-studio/api/rhyme.ts
src/pages/poem-studio/api/meter/scan.ts
src/pages/poem-studio/api/form/validate.ts
src/pages/poem-studio/api/collection/create.ts
src/pages/poem-studio/api/collection/add.ts
src/pages/poem-studio/api/collection/index.ts
src/pages/poem-studio/api/export.ts
src/pages/poem-studio/api/export/status.ts

src/components/poem-studio/Editor/*.astro
src/components/poem-studio/Analysis/*.astro
src/components/poem-studio/Chapbook/*.astro
```

---

### 11) Future Enhancements (v2+)

- **Community challenge prompts** and seasonal contests.  
- **Rhyme + meter training view** with interactive tapping.  
- **Collaborative workshop mode** (comments, lineâ€‘level suggestions).  
- **Cover designer handoff** to Presentation Designer.  
- **PWA** for offline drafting and reading.

---

**End of Requirements â€” Ready for Codex Implementation.**
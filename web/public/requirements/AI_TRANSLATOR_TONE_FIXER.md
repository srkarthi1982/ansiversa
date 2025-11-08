# ðŸŒ AI Translator & Tone Fixer â€” Full Requirements (Ansiversa)

Codexâ€‘ready specification for building the **AI Translator & Tone Fixer** mini app.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### What it does
**AI Translator & Tone Fixer** converts text and documents across languages while **preserving formatting** and adapting **tone, voice, and style** to a target audience. It supports **realâ€‘time typing translate**, **document & subtitle translation**, **brand voice profiles**, **terminology glossaries**, **inclusive language & gender options**, **PII redaction**, and **quality checks** (backâ€‘translation, fluency, consistency). Exports to **Markdown, HTML, DOCX, SRT/VTT, and JSON**.

### Core Features
- **Modes**: Translate, Tone Fix, Translate+Tone, Summarize+Translate, Backâ€‘translate QA.  
- **Languages**: EN, TA, AR, ES, HI (Pro adds 80+). Script variants & transliteration.  
- **Tone presets**: formal, neutral, friendly, persuasive, concise, academic, legal, customer support, marketing.  
- **Voice profiles**: brand voice sliders (warmth, enthusiasm, authority, playfulness), copy rules (avoid jargon, sentence length caps).  
- **Style guides**: localeâ€‘specific (ENâ€‘US/ENâ€‘UK/ARâ€‘AE/TAâ€‘IN etc.); Oxford comma toggle; honorifics; numerals.  
- **Terminology**: glossary upload (CSV/JSON), term lock (doâ€‘notâ€‘translate), synonyms, inflection rules.  
- **Formatting**: preserve **Markdown/HTML** structure, tables, bullet lists, inline code, emojis; protect URLs.  
- **Documents**: paste text, upload **DOCX/MD/HTML/TXT**, **SRT/VTT** subtitles; multiâ€‘file batch.  
- **Segment editor**: CATâ€‘style sidebar (source/target), perâ€‘segment status (todo/done/flag), comments.  
- **QA checks**: length constraints, punctuation mirroring, terminology adherence, numeric mismatch, link preservation, profanity screen, inclusive language suggestions, **backâ€‘translation** diff.  
- **Privacy**: optional **PII detector/redactor** (emails, phones, IDs) before sending to the model; local preview.  
- **Localization helpers**: unit & date conversion (e.g., AED â†” USD, DD/MM â†” MM/DD), honorifics, politeness levels.  
- **Exports**: MD/HTML/DOCX, SRT/VTT, JSON (segments, metadata), ZIP with assets.  
- **Integrations**: handâ€‘off to **Email Polisher**, **Blog Writer**, **Presentation Designer**.

### Key Pages
- `/translate` â€” Workspace (Editor, Tone, Glossary, QA, Export)  
- `/translate/new` â€” Quick wizard (source â†’ target, tone, style, file upload)  
- `/translate/history` â€” Projects list with filters  
- `/translate/settings` â€” Languages, brand voice, style guide, PII, defaults

### Minimal Data Model
`TransProject`, `Segment`, `Glossary`, `StyleGuide`, `VoiceProfile`, `QAResult`, `ImportJob`, `ExportJob`, `Attachment`, `Tag`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Projects | 5 | Unlimited |
| File types | Text/MD | + DOCX/HTML/SRT/VTT |
| Languages | EN/TA/AR/ES/HI | + 80+ locales |
| Glossaries | 1 (100 terms) | 10 (10k terms) |
| Voice profiles | 1 | 10 |
| Batch | up to 3 files | up to 50 files |
| QA | Basic | Full + backâ€‘translation |
| History retention | 60 days | Unlimited |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives & Nonâ€‘Goals
**Objectives**
- Deliver **accurate, styled translations** that keep structure intact and match brand tone.  
- Provide **CATâ€‘like controls** (segments, glossary, QA) with lightweight UX.  
- Ensure **privacy** via optional PII redaction and clear logging.

**Nonâ€‘Goals (v1)**
- No offline/local inference.  
- Not a full DTP tool (advanced layout handled elsewhere).

---

### 2) Information Architecture & Routes

**Pages**
- `/translate` â€” Editor with panes: **Segments**, **Tone/Voice**, **Glossary**, **QA**, **Export**.  
- `/translate/new` â€” Quick wizard for firstâ€‘time setup.  
- `/translate/history` â€” Search, sort, tag filter, status.  
- `/translate/settings` â€” Language packs, style guides, voice profiles, PII settings.

**API (SSR)**  
- Projects: `POST /translate/api/project/create` Â· `GET /translate/api/project?id=` Â· `POST /translate/api/project/update` Â· `POST /translate/api/project/archive`  
- Import/parse: `POST /translate/api/import` (text|docx|md|html|srt|vtt) Â· `GET /translate/api/import/status?id=`  
- Segment ops: `POST /translate/api/segment/translate` Â· `POST /translate/api/segment/tone` Â· `POST /translate/api/segment/update` Â· `POST /translate/api/segment/status`  
- Batch ops: `POST /translate/api/batch/run` (Translate|Tone|Both)  
- Glossary: `POST /translate/api/glossary/upload` Â· `POST /translate/api/glossary/delete`  
- Style & voice: `POST /translate/api/styleguide/set` Â· `POST /translate/api/voice/set`  
- QA: `GET /translate/api/qa/run` (terminology|numbers|punct|links|length|inclusive|profanity|backtranslate)  
- PII: `POST /translate/api/pii/scan` Â· `POST /translate/api/pii/redact`  
- Export: `POST /translate/api/export` (md|html|docx|srt|vtt|json|zip) Â· `GET /translate/api/export/status?id=`  
- Settings: `POST /translate/api/settings/save`

Optional WebSocket `/translate/ws` for streaming segment translations and QA.

---

### 3) Translation & Tone Controls

- **Source/Target**: language dropdowns with locale (e.g., **ARâ€‘AE** for UAE Arabic, **ENâ€‘IN**, **TAâ€‘IN**).  
- **Tone presets** with sliders and checkboxes:  
  - *Formality*: very casual â†’ very formal  
  - *Directness*: concise â†” elaborate  
  - *Warmth/Authority/Playfulness* sliders  
  - *Constraints*: max chars/words, sentence cap, passiveâ€‘voice off, bulletize  
- **Voice profiles**: name + sliders + rules; attach to project.  
- **Terminology**: live term highlights; forced terms; casing rules.  
- **Inclusive language**: prefer genderâ€‘neutral, honorifics config, personâ€‘first phrases.  
- **Localization**: currency/date/units autoâ€‘convert with switch (AEDâ†”USD; kmâ†”mi).  
- **Backâ€‘translation**: target â†’ source with diff highlights to estimate adequacy.

---

### 4) Segment Editor

- Automatic segmentation by sentences/lines (or subtitle cues).  
- Sideâ€‘byâ€‘side source/target cells; **lock**, **approve**, **reopen** states.  
- **Glossary** tooltips; copy source; show alt suggestions.  
- **Batch actions**: translate all, retone all, accept all.  
- **Search/replace** with regex; filter by status or issue tag.  
- **Keyboard**: `Tab` next cell, `Shift+Tab` previous, `Ctrl/Cmd+Enter` translate, `Alt+Enter` retone.

---

### 5) QA Checks

- **Terminology** adherence; **numeric** parity; **punctuation** mirroring (quotes, ellipsis, brackets).  
- **Links** preserved and valid; **markdown/HTML tags** closed; code spans untouched.  
- **Length** constraints (e.g., UI strings or social captions).  
- **Inclusive** language suggestions; **profanity & toxicity** screen.  
- **Backâ€‘translation** difference with color diff and confidence estimate.  
- **Report** panel with fixâ€‘it buttons.

---

### 6) Data Model (Astro DB / SQL)

**TransProject**  
- `id` (uuid pk), `userId`, `title`, `sourceLocale`, `targetLocale`, `mode` ('translate'|'tone'|'both'|'summarize'), `voiceProfileId` (fk|null), `styleGuideId` (fk|null), `status` ('draft'|'inâ€‘qa'|'approved'), `createdAt`, `updatedAt`

**Segment**  
- `id` (pk), `projectId` (fk), `index` (int), `source` (longtext), `target` (longtext), `status` ('todo'|'done'|'locked'|'flagged'), `issues` (json), `meta` (json:{srt:{start,end}})

**Glossary**  
- `id` (pk), `projectId` (fk), `term` (text), `pos` (text|null), `source` (text), `target` (text), `case` (text|'keep'|'upper'|'title'), `notes` (text)

**StyleGuide**  
- `id` (pk), `projectId` (fk), `locale` (text), `rules` (json:{oxfordComma:boolean,numerals:'words'|'digits',honorifics:'Dr.'|...}) 

**VoiceProfile**  
- `id` (pk), `projectId` (fk), `name`, `sliders` (json), `rules` (json)

**QAResult**  
- `id` (pk), `projectId` (fk), `kind` ('terminology'|'numbers'|'punct'|'links'|'length'|'inclusive'|'profanity'|'backtranslate'), `result` (json), `createdAt`

**ImportJob**  
- `id` (pk), `projectId` (fk), `format` ('text'|'docx'|'md'|'html'|'srt'|'vtt'), `status` ('queued'|'done'|'error'), `meta` (json)

**ExportJob**  
- `id` (pk), `projectId` (fk), `format` ('md'|'html'|'docx'|'srt'|'vtt'|'json'|'zip'), `status` ('queued'|'running'|'done'|'error'), `url` (text|null), `createdAt`

**Attachment**  
- `id` (pk), `projectId` (fk), `kind` ('image'|'doc'), `url` (text), `meta` (json)

**Tag**  
- `id` (pk), `name`, `color`

Indexes: `Segment.projectId+index`, `Glossary.term`, `TransProject.userId`.

---

### 7) UX / UI

- **Threeâ€‘pane layout**: left (segments list), center (editor), right (Tone/Voice/Glossary/QA).  
- **Live preview** for MD/HTML.  
- **Subtitle timeline** miniâ€‘track for SRT/VTT with drag handles.  
- **Diff viewer** for backâ€‘translation & version history.  
- Accessibility: keyboardâ€‘first, RTL support (Arabic), large text, high contrast.

Shortcuts: `Ctrl/Cmd+Enter` translate, `Alt+Enter` retone, `Ctrl/Cmd+K` run QA, `Ctrl/Cmd+E` export, `Ctrl/Cmd+F` find/replace.

---

### 8) Validation Rules

- Source/target locales must differ for translate mode.  
- Protected tokens: code spans, URLs, `{placeholders}` remain unchanged.  
- All segments must reach `done` or `locked` before export (unless forced).  
- Glossary must not include duplicate `term` within a project.  
- SRT/VTT exports must keep original **cue timings** (editable but warn on overlaps).  
- PII redaction must mask before remote model calls when enabled.

---

### 9) Plans & Limits

| Feature | Free | Pro |
|---|---|---|
| Projects | 5 | Unlimited |
| Files/batch | 3 | 50 |
| Glossary terms | 100 | 10,000 |
| Backâ€‘translation | â€” | âœ… |
| Exports/day | 5 | 50 |
| History | 60 days | Unlimited |

Rate limits: `/segment/translate` 500 segments/day (Free) 5,000 (Pro); `/qa/run` 50/day (Free) 400 (Pro).

---

### 10) Suggested File Layout

```
src/pages/translate/index.astro
src/pages/translate/new.astro
src/pages/translate/history.astro
src/pages/translate/settings.astro

src/pages/translate/api/project/create.ts
src/pages/translate/api/project/index.ts
src/pages/translate/api/project/update.ts
src/pages/translate/api/project/archive.ts
src/pages/translate/api/import.ts
src/pages/translate/api/segment/translate.ts
src/pages/translate/api/segment/tone.ts
src/pages/translate/api/segment/update.ts
src/pages/translate/api/segment/status.ts
src/pages/translate/api/batch/run.ts
src/pages/translate/api/glossary/upload.ts
src/pages/translate/api/glossary/delete.ts
src/pages/translate/api/styleguide/set.ts
src/pages/translate/api/voice/set.ts
src/pages/translate/api/qa/run.ts
src/pages/translate/api/pii/scan.ts
src/pages/translate/api/pii/redact.ts
src/pages/translate/api/export.ts
src/pages/translate/api/export/status.ts

src/components/translate/Editor/*.astro
src/components/translate/Tone/*.astro
src/components/translate/Glossary/*.astro
src/components/translate/QA/*.astro
src/components/translate/Export/*.astro
```

---

### 11) Future Enhancements (v2+)

- **OCR** for scanned PDFs and images.  
- **Custom MT adapters** (DeepL, Google, Azure) via plugin interface.  
- **Termbase** management with conceptâ€‘level entries and morphology.  
- **TM (Translation Memory)** with fuzzy matches and concordance search.  
- **Collaboration**: reviewer roles, suggestions, approvals.  
- **Domain presets**: legal, medical, marketing with tailored QA.

---

**End of Requirements â€” Ready for Codex Implementation.**
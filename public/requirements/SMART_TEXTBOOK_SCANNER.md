# ðŸ“– Smart Textbook Scanner â€” Full Requirements (Ansiversa)

Codexâ€‘ready specification for building the **Smart Textbook Scanner** mini app.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### What it does
Turns **photos or PDFs of textbooks/handouts** into **clean, searchable, and structured study material**: selectable text, **math LaTeX**, **diagrams â†’ SVG**, **tables â†’ CSV**, **headings/chapters**, **exercise extraction**, **glossary & formula index**, and **autoâ€‘made flashcards/quizzes**. It also supports **problemâ€‘answer pairing**, **page anchors** for citations, and **export to Quiz Institute, FlashNote, Formula Finder, Concept Explainer, Study Planner, and Homework Helper**.

### Core
- **Capture/Upload**: photos (mobile), multiâ€‘page PDF, or scanned images.  
- **Cleanâ€‘up**: deskew, dewarp, denoise, background clean, crop margins, contrast boost.  
- **OCR+Math**: text OCR + **math OCR â†’ LaTeX** and inline `$...$`/block `$$...$$`.  
- **Layout detection**: headings, columns, sidebars, captions, footnotes, callouts, exercises.  
- **Semantics**: **Exercise â†’ parts (a,b,c)**, **Examples**, **Theorems/Proofs**, **Definitions**, **Formulas**, **Diagrams**, **Tables**.  
- **Diagrams**: vectorize simple diagrams (lines/arrows/shapes) â†’ **SVG**; otherwise extract as PNG with caption.  
- **Tables**: cell grid recognition â†’ **CSV** and HTML.  
- **Anchors**: page/section anchors for every block; citation strings.  
- **Study artifacts**: auto Flashcards, MCQ/TF/Short Qs, summary notes.  
- **Search**: perâ€‘book fullâ€‘text with filters (section type, formula, keyword).  
- **Exports**: **Markdown**, **DOCX**, **PDF (text layer)**, **CSV**, **Anki package (APKG v1.1)**, **LaTeX bundle**, **Quiz JSON** for Exam Simulator.  
- **Integrations**: push to **FlashNote**, **Language Flashcards**, **Study Planner**, **Exam Simulator**, **Concept Explainer**, **Formula Finder**.

### Key Pages
- `/scan` (Library) Â· `/scan/new` (capture/import) Â· `/scan/[id]` (review & edit) Â· `/scan/export/[id]` Â· `/scan/settings`.

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Max pages per job | 30 | 300 |
| OCR languages | 1 (EN) | Multiâ€‘lang (EN/TA/AR/ES/HIâ€¦) |
| Math OCR | Basic | Full LaTeX w/ align & matrices |
| Vectorize diagrams | â€” | âœ… |
| Exports | MD/PDF | + DOCX/CSV/LaTeX/Anki/Quiz JSON |
| Integrations | View only | Push to apps |
| History retention | 30 days | Unlimited |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives & Nonâ€‘Goals
**Objectives**
- Produce **accurate, citeâ€‘anchored** digital versions of textbook pages optimized for study.  
- Extract **semantics** (exercises, examples, theorems, definitions) automatically.  
- Provide **readyâ€‘toâ€‘use study artifacts** (cards/quizzes/summary) and reliable exports.

**Nonâ€‘Goals (v1)**
- No copyright circumvention/DRM decryption.  
- No public sharing or search across other usersâ€™ books.  
- No full handwriting recognition beyond neat block letters (v1.1 adds better handwriting).

---

### 2) Information Architecture & Routes

**Pages**
- `/scan` â€” Library/dashboard with search & tags; recent scans and processing status.  
- `/scan/new` â€” Capture/import wizard: **Camera** (mobile), **Upload PDF/Images**, **Cloud import** (GDrive/Photos v1.1).  
- `/scan/[id]` â€” Review workspace with tabs: **Overview**, **Pages**, **Blocks**, **Exercises**, **Formulas**, **Tables**, **Diagrams**, **Cards/Quiz**, **Corrections**.  
- `/scan/export/[id]` â€” Export center with presets.  
- `/scan/settings` â€” Defaults: OCR languages, math style, export presets, privacy.

**API (SSR)**
- Ingest: `POST /scan/api/upload` (multipart) Â· `POST /scan/api/capture` (mobile chunks)  
- Pipeline: `POST /scan/api/process` (steps flags) Â· `GET /scan/api/status?id=`  
- Blocks: `GET /scan/api/page?id=&n=` Â· `POST /scan/api/block/update` (text/latex/labels)  
- Exercises: `POST /scan/api/exercise/parse` Â· `POST /scan/api/exercise/pair_answers`  
- Diagrams: `POST /scan/api/diagram/vectorize`  
- Tables: `POST /scan/api/table/structure`  
- Artifacts: `POST /scan/api/cards/generate` Â· `POST /scan/api/quiz/generate` Â· `POST /scan/api/summary/generate`  
- Export: `POST /scan/api/export` (md|pdf|docx|csv|apkg|tex|json) Â· `GET /scan/api/export/status?id=`  
- Search: `GET /scan/api/search?bookId=&q=&filters=`  
- Settings: `POST /scan/api/settings/save`

Optional WebSocket `/scan/ws` for realâ€‘time progress, page OCR previews, and diff after corrections.

---

### 3) Processing Pipeline

1) **Preprocess**: detect page edges; deskew; **dewarp** (curved pages); remove shadows; white balance; crop margins; normalize DPI.  
2) **Layout analysis**: regions (text block, math block, image/diagram, table, sidebar, header/footer); detect **multiâ€‘column** and **reading order**.  
3) **OCR**:  
   - **Text OCR** with language model selection; produce tokens with bbox + confidence.  
   - **Math OCR**: detect formula regions; parse to **LaTeX** (block/inline).  
4) **Structure**: infer headings hierarchy (H1â€“H4), paragraphs, lists, captions, callouts; build **TOC**.  
5) **Semantics**: classify **Definition / Theorem / Proof / Example / Exercise / Solution / Tip / Warning**; pair **Exercise â†” Answer** (same page or later pages).  
6) **Tables**: grid detection, cell merge; export CSV/HTML with header detection.  
7) **Diagrams**: stroke detection â†’ primitive shapes; **SVG** where possible; fallback PNG with caption.  
8) **QA & repair**: lowâ€‘confidence spans flagged; suggest corrections; **humanâ€‘inâ€‘theâ€‘loop** edit; reflow after edits.  
9) **Artifacts**: create **flashcards**, **quiz items**, **summary notes**, **formula index** and **glossary**.  
10) **Anchoring**: assign **page and block ids** and citation strings (`Book:Page:Block`).

**Hallucination guard**: artifacts must derive only from recognized text; each card/quiz item stores **source block ids**.

---

### 4) Data Model (Astro DB / SQL)

**BookScan**  
- `id` (uuid pk), `userId`, `title`, `subject`, `grade` (text|null), `language` (code), `pages` (int), `status` ('uploaded'|'processing'|'done'|'error'), `confSummary` (json), `createdAt`

**SourceAsset**  
- `id` (pk), `bookId` (fk), `type` ('pdf'|'image'), `url`, `pageIndex` (int|null), `checksum`, `dpi` (int|null), `meta` (json)

**Page**  
- `id` (pk), `bookId` (fk), `index` (int), `width` (int), `height` (int), `rotation` (int), `previewUrl` (text)

**Block**  
- `id` (pk), `pageId` (fk), `type` ('text'|'math'|'table'|'diagram'|'caption'|'sidebar'|'header'|'footer'), `bbox` (json), `text` (longtext|null), `latex` (longtext|null), `html` (longtext|null), `conf` (float), `labels` (json), `anchors` (json)

**Heading**  
- `id` (pk), `bookId` (fk), `level` (int), `title` (text), `pageIndex` (int), `blockId` (fk|null)

**Exercise**  
- `id` (pk), `bookId` (fk), `label` (text:'Ex 3.1 Q1(a)'), `text` (longtext), `parts` (json), `pageIndex` (int), `answerBlockId` (fk|null), `sourceBlocks` (json)

**Table**  
- `id` (pk), `pageId` (fk), `grid` (json), `csvUrl` (text), `headerRows` (int)

**Diagram**  
- `id` (pk), `pageId` (fk), `svgUrl` (text|null), `pngUrl` (text|null), `caption` (text|null), `vectorized` (bool)

**Formula**  
- `id` (pk), `bookId` (fk), `latex` (text), `inline` (bool), `pageIndex` (int), `blockId` (fk), `tags` (json)

**GlossaryTerm**  
- `id` (pk), `bookId` (fk), `term` (text), `definition` (text), `sourceBlockId` (fk)

**Card**  
- `id` (pk), `bookId` (fk), `type` ('definition'|'cloze'|'formula'|'concept'), `front` (text|json), `back` (text|json), `sourceBlocks` (json), `tags` (json)

**QuizItem**  
- `id` (pk), `bookId` (fk), `type` ('mcq'|'tf'|'short'|'numeric'), `question` (text), `options` (json|null), `answer` (json), `explain` (text|null), `sourceBlocks` (json)

**ExportJob**  
- `id` (pk), `bookId` (fk), `format` ('md'|'pdf'|'docx'|'csv'|'apkg'|'tex'|'json'), `options` (json), `status` ('queued'|'running'|'done'|'error'), `url` (string|null), `createdAt`

Indexes: `Page.bookId+index`, `Block.pageId+type`, `Exercise.bookId+label`, `Formula.bookId+latex`(hash), `Card.bookId`, `QuizItem.bookId`.

---

### 5) UX / UI

- **Capture wizard**: live edge guides, glare warnings, autoâ€‘capture when steady; reorder/delete pages before processing.  
- **Review workspace**:  
  - Page strip left; main canvas with selectable blocks.  
  - Right panel tabs: **Text/Math**, **Exercises**, **Tables**, **Diagrams**, **Artifacts**.  
  - Inline editor for text/LaTeX; confidence heatmap overlay; **merge/split blocks**; reassign reading order.  
- **Exercises tab**: grouped by chapter; auto detected labels; link to answer block; **export to Quiz Institute**.  
- **Formulas tab**: LaTeX list with preview; push to **Formula Finder**.  
- **Cards/Quiz**: generated items; edit; export CSV/Anki/Quiz JSON.  
- **Corrections**: queue of lowâ€‘confidence items; accept fixes â†’ reflow.  
- Accessibility: keyboard nav, zoom/pan, high contrast, RTL text, dyslexicâ€‘friendly font toggle.

Shortcuts: `A` add block, `M` merge, `S` split, `L` toggle layout, `E` export, `G` go to page, `F` find term, `Z` zoom, `R` rerun OCR on selection.

---

### 6) Exports & Integrations

**Presets**  
- **Study Markdown**: headings + text + LaTeX + figures + tables + exercise list with anchors.  
- **Executive Notes**: chapter TL;DR + key definitions + formulas index.  
- **Quiz Pack**: MCQ/TF/Short JSON for **Exam Simulator**.  
- **Anki Deck**: APKG with source anchors in back.  
- **LaTeX Bundle**: `main.tex`, images, `figures/`, `tables/`, bibliography stub.  
- **DOCX/PDF** with selectable text layer.

**Pushes**  
- **FlashNote** (cards), **Language Flashcards** (definitions), **Study Planner** (revision plan), **Concept Explainer** (selected concept), **Homework Helper** (exercises).

---

### 7) API Contracts (Examples)

**Upload PDF**  
`POST /scan/api/upload`  
```json
{ "file":"(upload ref)", "meta":{"title":"Chemistry Class 12 - Unit 3", "language":"en"} }
```
Res: `{ "bookId":"b_42" }`

**Start processing**  
`POST /scan/api/process`  
```json
{ "bookId":"b_42", "steps":["preprocess","layout","ocr_text","ocr_math","structure","semantics"] }
```
Res: `{ "jobId":"p_90" }`

**Get page blocks**  
`GET /scan/api/page?bookId=b_42&n=12` â†’ `{ "blocks":[{"id":"blk_7","type":"math","latex":"E=mc^2", "bbox":...}] }`

**Generate artifacts**  
`POST /scan/api/cards/generate`  
```json
{ "bookId":"b_42", "types":["definition","cloze","formula"] }
```
Res: `{ "created": 56 }`

**Export**  
`POST /scan/api/export`  
```json
{ "bookId":"b_42", "format":"md", "options":{"include":["headings","text","math","figures","tables","exercises"]} }
```
Res: `{ "jobId":"e_12" }`

---

### 8) Validation Rules

- Supported inputs: **PDF**, **PNG/JPEG**; size â‰¤ 50 MB (Free), 300 MB (Pro).  
- Minimum DPI 200; warn and allow upscale with quality note.  
- Math blocks must compile to LaTeX; nonâ€‘compiling blocks flagged for fix.  
- Exercise labels must be unique per chapter; enforce mapping to page/block.  
- Diagrams vectorization only for simple primitives; otherwise store PNG.  
- Exports capped at 20 MB per job; paginate long Markdown into chapters.  
- Privacy: scans are private by default; sharing requires explicit export.

---

### 9) Plans & Limits

| Feature | Free | Pro |
|---|---|---|
| Pages/job | 30 | 300 |
| Languages | EN | EN + multi |
| Math OCR | Basic | Full |
| Diagram SVG | â€” | âœ… |
| Exports | MD/PDF | + DOCX/CSV/LaTeX/Anki/Quiz JSON |
| Push to apps | View only | âœ… |
| Exports/day | 3 | 12 |
| History | 30 days | Unlimited |

Rate limits: `/process` 10/day (Free) 80/day (Pro); `/export` 5/day (Free) 30/day (Pro).

---

### 10) Suggested File Layout

```
src/pages/scan/index.astro
src/pages/scan/new.astro
src/pages/scan/[id]/index.astro
src/pages/scan/[id]/exercises.astro
src/pages/scan/[id]/formulas.astro
src/pages/scan/[id]/tables.astro
src/pages/scan/[id]/diagrams.astro
src/pages/scan/[id]/cards.astro
src/pages/scan/export/[id].astro
src/pages/scan/settings.astro

src/pages/scan/api/upload.ts
src/pages/scan/api/capture.ts
src/pages/scan/api/process.ts
src/pages/scan/api/status.ts
src/pages/scan/api/page.ts
src/pages/scan/api/block/update.ts
src/pages/scan/api/exercise/parse.ts
src/pages/scan/api/exercise/pair_answers.ts
src/pages/scan/api/diagram/vectorize.ts
src/pages/scan/api/table/structure.ts
src/pages/scan/api/cards/generate.ts
src/pages/scan/api/quiz/generate.ts
src/pages/scan/api/summary/generate.ts
src/pages/scan/api/search.ts
src/pages/scan/api/export.ts
src/pages/scan/api/export/status.ts
src/pages/scan/api/settings/save.ts

src/components/scan/Capture/*.astro
src/components/scan/Review/*.astro
src/components/scan/Blocks/*.astro
src/components/scan/Exercises/*.astro
src/components/scan/Formulas/*.astro
src/components/scan/Tables/*.astro
src/components/scan/Diagrams/*.astro
src/components/scan/Artifacts/*.astro
src/components/scan/Corrections/*.astro
```

---

### 11) Future Enhancements (v2+)

- **Handwriting OCR** for teacher notes & student solutions.  
- **AR overlay** (mobile): point camera to a page â†’ popâ€‘up definitions/solutions.  
- **Equation solver** linkâ€‘out; plot previews for functions.  
- **Collaborative study packs** (classroom mode).  
- **Citations export** (BibTeX/RIS) for referenced textbooks.

---

**End of Requirements â€” Ready for Codex Implementation.**
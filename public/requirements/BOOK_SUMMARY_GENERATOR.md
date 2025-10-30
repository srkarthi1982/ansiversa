# ðŸ“š Book Summary Generator â€” Full Requirements (Ansiversa)

This document contains a **Codexâ€‘friendly summary** and a **full technical specification** for implementing the Book Summary Generator mini app.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### Overview
**Book Summary Generator** ingests a book (PDF/EPUB/TXT or pasted text) and produces **layered summaries** (1â€‘sentence, 5 bullets, 1â€‘page, chapterâ€‘byâ€‘chapter) with **key ideas, quotes with page refs, character/concept maps, flashcards, and quizzes**. It supports **reading levels** (kid/teen/adult), **tones** (neutral/academic/storytelling), and **useâ€‘case views** (exam prep, business takeaways, literature analysis). Integrations push highlights to **FlashNote**, vocabulary to **Language Flashcards**, and a revision plan to **Study Planner**.

### Core Features
- **Ingestion**: upload PDF/EPUB/TXT or paste text; auto chapter detection; page mapping where available.  
- **Summaries**: TL;DR, 5 key ideas, 1â€‘page executive summary, and chapter summaries; **persona/reading level** control.  
- **Quotes & citations**: pull notable quotes with **page/location references**; extract references/footnotes.  
- **Concept graph**: characters/entities/terms and their relationships; timelines (for fiction) or frameworks (nonâ€‘fiction).  
- **Flashcards & quiz**: autoâ€‘generate Q/A cards (cloze, definition, concept), and quiz items; export CSV to **Exam Simulator**.  
- **Comparisons**: compare two books or editions; highlight overlapping ideas and disagreements.  
- **Bias & reliability hints**: flag opinion vs evidence and note potential biases.  
- **Reading progress**: track % read, notes, highlights; continue where you left off.  
- **Exports**: MD, PDF, DOCX; CSV for flashcards/quiz; image of mind map (PNG).  
- **Integrations**: **FlashNote**, **Language Flashcards**, **Study Planner**, **Presentation Designer** (slide deck from key ideas).

### Key Pages
- `/book-summary-generator` â€” Library/dashboard  
- `/book-summary-generator/new` â€” Ingest wizard (upload/paste, metadata, goal/persona)  
- `/book-summary-generator/[id]` â€” Summary hub (tabs: Overview, Chapters, Quotes, Cards, Graph, Notes)  
- `/book-summary-generator/compare` â€” Sideâ€‘byâ€‘side comparison  
- `/book-summary-generator/export/[id]` â€” Export center  
- `/book-summary-generator/settings` â€” Defaults (reading level, tone, privacy)

### Minimal Data Model
`BookItem`, `Source`, `IngestJob`, `Chapter`, `Section`, `Quote`, `Entity`, `Relation`, `TimelineEvent`, `Summary`, `Card`, `QuizItem`, `Note`, `Highlight`, `ExportJob`, `Tag`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Max book size | 50 MB | 200 MB |
| Summaries | TL;DR + 5 bullets | All layers + chapter summaries |
| Quotes with page refs | 10 | Unlimited |
| Flashcards/Quiz export | CSV only | CSV + push to apps |
| Concept graph | Basic | Full + PNG export |
| Compare books | â€” | âœ… |
| History retention | 30 days | Unlimited |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives & Nonâ€‘Goals
**Objectives**
- Create **reliable, citeâ€‘anchored** layered summaries that adapt to **audience level** and **purpose**.  
- Provide **study artifacts** (cards, quizzes, slides) to reinforce learning.  
- Work offline on uploaded files (no external scraping in v1).

**Nonâ€‘Goals (v1)**
- No storeâ€‘bought eBook DRM decryption.  
- No web crawling/scraping of external sites for summaries.

---

### 2) Information Architecture & Routes

**Pages**
- `/book-summary-generator` â€” Library with search & tags; recent books; â€œcontinue readingâ€.  
- `/book-summary-generator/new` â€” Upload or paste; enter metadata (title, author, year, edition), goal (exam/business/pleasure), persona/level, tone; consent for processing.  
- `/book-summary-generator/[id]` â€” Tabs:  
  - **Overview**: TL;DR, 5 bullets, 1â€‘page summary, key themes.  
  - **Chapters**: perâ€‘chapter summaries + key quotes.  
  - **Quotes**: filterable list with page refs; copy with citation.  
  - **Cards**: generated flashcards; export/push.  
  - **Graph**: concept/character map; timeline (fiction).  
  - **Notes**: user highlights & notes with page anchors.  
- `/book-summary-generator/compare` â€” Upload/select two books; diff their ideas/themes.  
- `/book-summary-generator/export/[id]` â€” Export presets (study sheet, executive brief, slide outline).  
- `/book-summary-generator/settings` â€” Defaults: level, tone, privacy, preferred citation style (APA/MLA/Chicago).

**API (SSR)**  
- Ingestion:  
  - `POST /book-summary-generator/api/ingest` (upload file or text; returns `ingestJobId`).  
  - `GET  /book-summary-generator/api/ingest/status?id=` (pages detected, chapters, ETA).  
- Summaries:  
  - `POST /book-summary-generator/api/summarize` (layer=`tldr|bullets|onepager|chapters`, audience, tone, purpose).  
  - `GET  /book-summary-generator/api/summary?id=&layer=`  
- Quotes & entities:  
  - `POST /book-summary-generator/api/quotes/extract`  
  - `POST /book-summary-generator/api/entities/extract`  
  - `POST /book-summary-generator/api/relations/derive`  
- Cards & quiz:  
  - `POST /book-summary-generator/api/cards/generate` (types: cloze/definition/concept)  
  - `POST /book-summary-generator/api/quiz/generate` (formats: MCQ/TF/short)  
- Compare:  
  - `POST /book-summary-generator/api/compare` (bookA, bookB, focus: themes/findings/arguments)  
- Notes & highlights:  
  - `POST /book-summary-generator/api/highlight/add` Â· `POST /book-summary-generator/api/note/add`  
- Export:  
  - `POST /book-summary-generator/api/export` (md|pdf|docx|csv|png) Â· `GET /book-summary-generator/api/export/status?id=`  
- Settings: `POST /book-summary-generator/api/settings/save`

Optional WebSocket `/book-summary-generator/ws` for ingest progress and longâ€‘running export notifications.

---

### 3) Summarization Layers & Controls

**Layers**  
- **TL;DR (1â€“2 sentences)**  
- **Five Key Ideas** (â‰¤ 12 words per bullet, optional evidence tag)  
- **Oneâ€‘page Executive Summary** (~400â€“600 words)  
- **Chapter Summaries** (100â€“300 words each, with 2â€“3 quotes)

**Controls**  
- **Audience levels**: Kid (8â€“12), Teen (13â€“17), Adult (neutral), Academic (formal).  
- **Purposes**: Exam prep, business takeaways, literature analysis, quick brief.  
- **Tone**: neutral, persuasive, storytelling, analytical.  
- **Citation style**: APA, MLA, Chicago (for quotes).  
- **Compression**: conservative â†” aggressive; **Hallucination guard**: must anchor facts to pages/locations.

**Bias & reliability flags**  
- Identify claims without evidence â†’ mark as opinion.  
- Highlight author assumptions and perspective; suggest counterpoints.

---

### 4) Data Model (Astro DB / SQL)

**BookItem**  
- `id` (uuid pk), `userId`, `title`, `author`, `year` (int|null), `edition` (text|null), `isbn` (text|null), `language` (code), `pages` (int|null), `sourceId` (fk), `meta` (json), `createdAt`

**Source**  
- `id` (pk), `type` ('upload'|'paste'), `mime` ('application/pdf'|'application/epub+zip'|'text/plain'), `url` (storage path), `checksum` (text), `sizeBytes` (int)

**IngestJob**  
- `id` (pk), `bookId` (fk), `status` ('queued'|'running'|'done'|'error'), `pagesDetected` (int), `chaptersDetected` (int), `log` (json), `createdAt`, `finishedAt` (nullable)

**Chapter**  
- `id` (pk), `bookId` (fk), `index` (int), `title` (text), `startPage` (int|null), `endPage` (int|null)

**Section**  
- `id` (pk), `chapterId` (fk), `index` (int), `title` (text|null), `range` (json: page|location)

**Quote**  
- `id` (pk), `bookId` (fk), `chapterId` (fk|null), `text` (text), `page` (int|null), `loc` (text|null), `themeTags` (json), `sentiment` (float|null)

**Entity**  
- `id` (pk), `bookId` (fk), `type` ('person'|'character'|'place'|'concept'|'date'|'org'|'term'), `name`, `aliases` (json)

**Relation**  
- `id` (pk), `bookId` (fk), `fromId` (fk), `toId` (fk), `type` ('knows'|'conflicts'|'supports'|'parent'|'teacher_of'|'causes'|'part_of'), `evidence` (json: quote ids)

**TimelineEvent**  
- `id` (pk), `bookId` (fk), `when` (string|date), `label`, `chapterId` (fk|null), `evidence` (json)

**Summary**  
- `id` (pk), `bookId` (fk), `layer` ('tldr'|'bullets'|'onepager'|'chapters'), `audience` ('kid'|'teen'|'adult'|'academic'), `tone` (text), `purpose` (text), `text` (longtext|json), `createdAt`

**Card**  
- `id` (pk), `bookId` (fk), `type` ('cloze'|'definition'|'concept'), `front` (text|json), `back` (text|json), `sourceQuoteId` (fk|null), `tags` (json)

**QuizItem**  
- `id` (pk), `bookId` (fk), `type` ('mcq'|'tf'|'short'), `question` (text), `options` (json|null), `answer` (json), `explain` (text|null), `sourceRange` (json)

**Note**  
- `id` (pk), `bookId` (fk), `text`, `page` (int|null), `loc` (text|null), `tags` (json), `createdAt`

**Highlight**  
- `id` (pk), `bookId` (fk), `text`, `page` (int|null), `loc` (text|null), `color` (text), `createdAt`

**ExportJob**  
- `id` (pk), `bookId` (fk), `format` ('md'|'pdf'|'docx'|'csv'|'png'), `options` (json), `status` ('queued'|'running'|'done'|'error'), `url` (string|null), `createdAt`

**Tag**  
- `id` (pk), `name`, `color`

Indexes: `BookItem.userId`, `Summary.bookId+layer`, `Quote.bookId+page`, `Entity.bookId+name`.

---

### 5) Summarization & Extraction Pipeline

1) **Parse**: detect chapters via TOC, headings, or heuristics; map page numbers/locations.  
2) **Chunk**: create semantic chunks (â‰ˆ1â€“2k tokens) with overlap.  
3) **Summarize** per layer:  
   - **TL;DR**: 1â€“2 sentences; no unsupported claims.  
   - **Five bullets**: â‰¤12 words each; one evidence tag each when possible.  
   - **Oneâ€‘pager**: structured: problem â†’ thesis â†’ key arguments â†’ evidence â†’ critique â†’ takeaway.  
   - **Chapters**: 100â€“300 words + 2â€“3 quotes with page refs.  
4) **Extract**: entities, relations, timeline (fiction) / frameworks (nonâ€‘fiction).  
5) **Generate study aids**: Q/A cards, cloze deletions from quotes, MCQs with plausible distractors.  
6) **Validate**: ensure quotes exist in text; page refs present when available; deduplicate.  
7) **Assemble**: Overview page + artifacts; enable exports/push.

Hallucination guard: **never** attribute events/claims not present in the source; surface â€œlow confidenceâ€ markers if page refs are missing.

---

### 6) UX / UI

- **Hub**: left sidebar (chapters, notes, cards); main area (summary panes).  
- **Quotes tab**: copy with citation; filter by chapter/theme/person.  
- **Cards tab**: edit front/back; export CSV; â€œPush to FlashNote / Language Flashcardsâ€.  
- **Graph tab**: interactive nodes; export PNG.  
- **Compare**: two columns; overlap matrix; contradiction highlights.  
- **Reader** (optional v1.1): lightweight PDF/EPUB viewer with highlight tools.  
- Accessibility: keyboard shortcuts, high contrast, RTL; largeâ€‘font mode.

Shortcuts: `Ctrl/Cmd+Enter` regenerate layer, `Ctrl/Cmd+L` add highlight, `Ctrl/Cmd+E` export, `Ctrl/Cmd+F` find quote.

---

### 7) API Contracts (Examples)

**Ingest**  
`POST /book-summary-generator/api/ingest`  
```json
{ "file":"(upload ref)", "meta":{"title":"Deep Work","author":"Cal Newport","year":2016}, "goal":"business_takeaways", "audience":"adult", "tone":"neutral" }
```
Res: `{ "ingestJobId":"ing_77" }`

**Status**  
`GET /book-summary-generator/api/ingest/status?id=ing_77` â†’ `{ "status":"running","pagesDetected":312,"chaptersDetected":10 }`

**Summarize oneâ€‘pager**  
`POST /book-summary-generator/api/summarize`  
```json
{ "bookId":"b_1", "layer":"onepager", "audience":"adult", "tone":"analytical", "purpose":"business_takeaways" }
```
Res: `{ "summaryId":"s_19" }`

**Extract quotes**  
`POST /book-summary-generator/api/quotes/extract` â†’ `{ "count": 74 }`

**Generate cards**  
`POST /book-summary-generator/api/cards/generate`  
```json
{ "bookId":"b_1", "types":["cloze","definition"], "deckTag":"DeepWork" }
```
Res: `{ "created": 48 }`

**Compare**  
`POST /book-summary-generator/api/compare`  
```json
{ "bookA":"b_1", "bookB":"b_2", "focus":"themes" }
```
Res: `{ "overlap":["attention economy"], "differences":["calendaring discipline"], "contradictions":[] }`

**Export**  
`POST /book-summary-generator/api/export`  
```json
{ "bookId":"b_1", "format":"md", "options":{"include":"overview+chapters+quotes"} }
```
Res: `{ "jobId":"e_88" }`

---

### 8) Validation Rules

- File types: PDF/EPUB/TXT; max size per plan; checksum required.  
- Page references are required for quotes if source provides them.  
- Chapter summaries must include at least one quote when available.  
- Cards/quiz must link to a source range or chapter.  
- Exports may not exceed 20 MB; rateâ€‘limit to 5/day.  
- Privacy: no sharing outside the user account unless explicitly exported.

---

### 9) Plans & Limits

| Feature | Free | Pro |
|---|---|---|
| Max size | 50 MB | 200 MB |
| Layers | TL;DR + 5 bullets | + Oneâ€‘pager + Chapters |
| Quotes | 10 | Unlimited |
| Graph | Basic | Full + PNG |
| Compare | â€” | âœ… |
| Exports/day | 3 | 10 |
| History retention | 30 days | Unlimited |

Rate limits: `/summarize` 40/day (Free) 300/day (Pro); `/cards/generate` 40/day (Free) 300/day (Pro).

---

### 10) Suggested File Layout

```
src/pages/book-summary-generator/index.astro
src/pages/book-summary-generator/new.astro
src/pages/book-summary-generator/[id]/index.astro
src/pages/book-summary-generator/[id]/quotes.astro
src/pages/book-summary-generator/[id]/cards.astro
src/pages/book-summary-generator/[id]/graph.astro
src/pages/book-summary-generator/compare.astro
src/pages/book-summary-generator/export/[id].astro
src/pages/book-summary-generator/settings.astro

src/pages/book-summary-generator/api/ingest.ts
src/pages/book-summary-generator/api/ingest/status.ts
src/pages/book-summary-generator/api/summarize.ts
src/pages/book-summary-generator/api/summary/index.ts
src/pages/book-summary-generator/api/quotes/extract.ts
src/pages/book-summary-generator/api/entities/extract.ts
src/pages/book-summary-generator/api/relations/derive.ts
src/pages/book-summary-generator/api/cards/generate.ts
src/pages/book-summary-generator/api/quiz/generate.ts
src/pages/book-summary-generator/api/compare.ts
src/pages/book-summary-generator/api/highlight/add.ts
src/pages/book-summary-generator/api/note/add.ts
src/pages/book-summary-generator/api/export.ts
src/pages/book-summary-generator/api/export/status.ts
src/pages/book-summary-generator/api/settings/save.ts

src/components/book-summary-generator/Overview/*.astro
src/components/book-summary-generator/Chapters/*.astro
src/components/book-summary-generator/Quotes/*.astro
src/components/book-summary-generator/Cards/*.astro
src/components/book-summary-generator/Graph/*.astro
src/components/book-summary-generator/Notes/*.astro
```

---

### 11) Future Enhancements (v2+)

- **Web clipper** to ingest articles and merge into a bookâ€‘level summary.  
- **OCR layer** for scanned PDFs.  
- **Collaborative reading groups** with shared notes and weekly questions.  
- **Citation manager export** (RIS/BibTeX).  
- **Audio summary** (TTS) and podcastâ€‘style recap.  
- **Adaptive study plans** based on quiz accuracy.

---

**End of Requirements â€” Ready for Codex Implementation.**
# 🔎 Research Assistant — Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/research`  
**Category:** Learning & Knowledge / Writing & Creativity  
**Stack:** Astro + Tailwind (islands for reader/notes), Astro SSR API routes, Astro DB / Supabase, optional background workers for long summarization jobs  
**Goal:** Help users plan, collect, read, highlight, and synthesize information into **evidence-backed notes, outlines, and drafts** with proper **citations**. Optimized for students, creators, founders, and PMs.

> Positioning: A trustworthy “evidence engine” that turns messy sources into clean insights, with one-click exports to essays, decks, and proposals.

---

## 1) Objectives & Non-Goals

### Objectives
- **Projects** that hold questions, scope, sources, highlights, notes, claims, bibliographies, and exports.  
- **Source intake**: URL (article/blog), PDF upload, pasted text, and manual notes. *(v1 avoids live web crawlers; users paste/upload content or provide URLs for server fetch)*  
- **Reading workspace**: split-pane **Reader** (PDF/HTML) + **Notes** with highlight capture, quote → citation, auto-summaries.  
- **Synthesis toolkit**: **topic map**, **compare & contrast**, **claim ↔ evidence matrix**, **counter-arguments**, and **bias checks**.  
- **Writer**: turn insights into **outline** → **section drafts** with citations in APA/MLA/Chicago/IEEE.  
- **Exports**: MD/DOCX/PDF; **Slides** to Presentation Designer; **Fact pack** to FlashNote; **Data** to CSV/JSON.  
- **Integrity**: every non-obvious statement maps to a source/line; plagiarism check and quotation handling.

### Non-Goals (v1)
- No automated large-scale web scraping; no paywall bypass.  
- No medical/legal/financial advice output; provide neutral summaries with citations.  
- No collaborative editing (single-user projects; v2 adds sharing).

---

## 2) User Stories (Acceptance Criteria)

1. **Start a Project**
   - *As a user*, I create a project and write a research question + scope (timeframe, geography, audience).  
   - **AC:** `/research/api/project/create` seeds a question, empty source list, and default bibliography style.

2. **Add Sources**
   - *As a user*, I paste URLs or upload PDFs.  
   - **AC:** `/research/api/source/add` stores metadata (title, author, date, publisher), fetches text (if URL), and fingerprint hash for dedupe.

3. **Read & Highlight**
   - *As a user*, I open a source in the **Reader** (PDF/HTML view) and select text.  
   - **AC:** selection → **Highlight** with color/tag; **Quote** saved with page/loc; **Note** linked to the highlight.

4. **Summarize & Extract**
   - *As a user*, I click **Auto-summary** or **Key points**.  
   - **AC:** `/research/api/summary` returns a bullet summary + key quotes with citations and confidence.

5. **Claim ↔ Evidence Matrix**
   - *As a user*, I write a claim (or pick generated claims).  
   - **AC:** `/research/api/claims/link` associates claim text with one or more source spans; UI shows coverage and counter-evidence opportunities.

6. **Compare Sources**
   - *As a user*, I select 2–5 sources.  
   - **AC:** `/research/api/compare` returns **agreement**, **disagreement**, **gaps**, and **recency** differences.

7. **Outline & Draft**
   - *As a user*, I click **Make outline** → **Draft section**.  
   - **AC:** `/research/api/outline` generates H2/H3s; `/research/api/draft` produces sections with inline citations in chosen style.

8. **Bibliography**
   - *As a user*, I pick APA/MLA/Chicago/IEEE.  
   - **AC:** `/research/api/bib/render` formats all sources accordingly; invalid fields flagged for manual fixes.

9. **Plagiarism & Quotes**
   - *As a user*, I run **Plagiarism Check**.  
   - **AC:** `/research/api/plagiarism/check` highlights close paraphrases; UI suggests quotation or re-write with attribution.

10. **Export**
    - *As a user*, I export MD/DOCX/PDF or **Send to Presentation Designer**.  
    - **AC:** `/research/api/export` returns a file URL; deck export sends outline + key claims to `/presentation`.

11. **Plan Gating**
    - Free: 1 project, 10 sources, 200 highlights, basic summaries, MD export.  
    - Pro: unlimited projects, 2k sources/project, long-doc summarization, DOCX/PDF exports, plagiarism check, outline/draft generator.

---

## 3) Information Architecture & Routes

- `/research` — Project list + **New project**.  
- `/research/project/[id]` — Dashboard: question/scope, sources, quick stats.  
- `/research/project/[id]/sources` — Source manager.  
- `/research/project/[id]/reader/[sourceId]` — Reader (PDF/HTML) with highlights/notes pane.  
- `/research/project/[id]/synthesis` — Topic map, compare, claims matrix, bias checks.  
- `/research/project/[id]/writer` — Outline & draft editor with citation tools.  
- `/research/settings` — Citation style, language, safety settings.

**API (SSR):**  
- Project: `POST /research/api/project/create` · `GET /research/api/project/list` · `POST /research/api/project/delete`  
- Sources: `POST /research/api/source/add` · `POST /research/api/source/update` · `POST /research/api/source/delete` · `GET /research/api/source/list`  
- Content: `POST /research/api/summary` · `POST /research/api/compare` · `POST /research/api/claims/link` · `POST /research/api/claims/suggest`  
- Notes/Highlights: `POST /research/api/highlight/add` · `POST /research/api/note/add` · `GET /research/api/highlight/list`  
- Writer: `POST /research/api/outline` · `POST /research/api/draft` · `POST /research/api/bib/render`  
- Integrity: `POST /research/api/plagiarism/check` · `POST /research/api/safety/check`  
- Export: `POST /research/api/export` (md|docx|pdf|json|csv)

---

## 4) Data Model (Astro DB / SQL)

**User**  
- `id` (pk), `email`, `plan`, `timezone`, `language`, `createdAt`

**Project**  
- `id` (pk uuid), `userId` (fk), `title`, `question`, `scope` (json {timeframe, region, audience}), `citationStyle` ('apa'|'mla'|'chicago'|'ieee'), `language`, `createdAt`, `updatedAt`

**Source**  
- `id` (pk uuid), `projectId` (fk), `type` ('url'|'pdf'|'text'|'note'), `title`, `authors` (json), `publisher`, `pubDate` (date|null), `accessDate` (date), `url` (string|null), `fileUrl` (string|null), `fingerprint` (hash), `meta` (json), `status` ('added'|'parsed'|'error')

**Excerpt**  
- `id` (pk uuid), `sourceId` (fk), `text`, `start` (loc), `end` (loc), `page` (int|null), `meta` (json {selector, context}), `createdAt`

**Highlight**  
- `id` (pk uuid), `sourceId` (fk), `excerptId` (fk|null), `color` ('yellow'|'green'|'blue'|'pink'), `tags` (json), `noteId` (fk|null), `createdAt`

**Note**  
- `id` (pk uuid), `projectId` (fk), `textMd`, `links` (json {sourceId, excerptId}), `createdAt`

**Claim**  
- `id` (pk uuid), `projectId` (fk), `text`, `stance` ('pro'|'con'|'neutral'), `confidence` (0..1), `createdAt`

**EvidenceLink**  
- `id` (pk uuid), `claimId` (fk), `sourceId` (fk), `excerptId` (fk), `role` ('support'|'refute'|'context'), `weight` (0..1)

**Outline**  
- `id` (pk uuid), `projectId` (fk), `structure` (json H2/H3), `createdAt`

**Draft**  
- `id` (pk uuid), `projectId` (fk), `outlineId` (fk), `contentMd`, `citations` (json), `createdAt`

**BibliographyItem**  
- `id` (pk uuid), `projectId` (fk), `sourceId` (fk), `style` ('apa'|'mla'|'chicago'|'ieee'), `text` (string), `createdAt`

**PlagiarismReport**  
- `id` (pk uuid), `projectId` (fk), `status`, `score` (0..1), `matches` (json), `createdAt`

---

## 5) Reader & Capture UX

- **Split layout**: left = document (PDF/HTML), right = notes/highlights.  
- **Text selection → toolbar**: *Highlight*, *Quote*, *Copy with citation*, *Add note*, *Tag*.  
- **Citation card** auto-fills author, title, date, page/loc, access date.  
- **Keyboard**: `H` highlight, `Q` quote, `N` note, `C` copy-citation.  
- **Search in doc**; page thumbnails for PDFs.  
- **Tags**: topic, stance, priority (P0-P2), confidence.

---

## 6) Synthesis Tools

- **Topic Map**: extracted entities/terms; merge/rename; drag to outline.  
- **Compare & Contrast**: table of sources with columns for stance, key findings, limitations, and dates.  
- **Claim Matrix**: rows = claims, columns = sources; cells show support/refute/context; completeness % meter.  
- **Counter-arguments**: suggest credible opposing views with sources.  
- **Bias checks**: publisher type (gov/edu/news/blog), funding/conflicts, recency gaps.  
- **Confidence scoring**: per claim based on source tier, agreement, and recency.

---

## 7) Writer & Citations

- **Outline builder**: H2/H3 with drag-drop from notes/claims.  
- **Draft generator**: section-by-section, with inline citation marks `[1]`/author-year and automatic bibliography.  
- **Citation styles**: APA, MLA, Chicago, IEEE; locale-aware punctuation.  
- **Quote management**: quotes limited to short excerpts; auto-paraphrase prompt with attribution.  
- **Footnotes** (optional): for explanatory asides, not citations.

---

## 8) Integrity, Safety, and Ethics

- **Attribution:** every non-obvious sentence in a draft must have at least one evidence link.  
- **Plagiarism check** (heuristic in v1); flag near-verbatim spans for quoting.  
- **Sensitive topics**: require neutral phrasing and multiple viewpoints.  
- **Time-scoping**: store `accessDate` and encourage stating “as of <date>”.  
- **Privacy**: uploaded files remain private; exports redact personal data.

---

## 9) API Contracts (examples)

### `POST /research/api/source/add`
Req:  
```json
{
  "projectId":"<uuid>",
  "type":"url",
  "url":"https://example.com/article",
  "accessDate":"2025-10-29"
}
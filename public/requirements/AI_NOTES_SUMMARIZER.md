# ðŸ§  AI Notes Summarizer â€” Full Requirements (Ansiversa)

This document combines a **short summary** for Codex onboarding and the **detailed specification** for implementation.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### Overview
The **AI Notes Summarizer** mini app automatically transforms lengthy notes, documents, transcripts, or pasted text into **clean, structured summaries**.  
It intelligently extracts key points, action items, and insights â€” ideal for students, professionals, and researchers using Ansiversaâ€™s ecosystem.

### Key Features
- Summarize notes, meeting transcripts, articles, or PDFs.  
- Supports multiple summary modes: *Concise*, *Detailed*, *Bullet*, *Abstract*, *Action-oriented*.  
- Identify key takeaways, tasks, and sentiment.  
- Allows topic tagging and highlight extraction.  
- Export summaries to Markdown, PDF, or FlashNote cards.  
- Integrates with **Research Assistant**, **Meeting Minutes AI**, and **FlashNote**.  
- Optional storage for summary history and source references.

### Core Pages
- `/ai-notes-summarizer` â†’ Dashboard + Input panel  
- `/ai-notes-summarizer/summary/[id]` â†’ Summary viewer/editor  
- `/ai-notes-summarizer/history` â†’ Saved summaries list  

### Database Summary
Tables: `User`, `Note`, `Summary`, `Tag`, `History`

### Plan Gating
| Feature | Free | Pro |
|----------|------|-----|
| Input length | 3,000 chars | 50,000 chars |
| Summary modes | 2 | 5+ |
| Export formats | Markdown | Markdown + PDF |
| Save history | â€” | Included |
| Integrations | â€” | Enabled |

### Integrations
- **Research Assistant** â†’ summarize imported sources.  
- **Meeting Minutes AI** â†’ extract key actions and discussion points.  
- **FlashNote** â†’ generate flashcards from summary lines.  

---

## ðŸ§© PART 2 â€” DETAILED REQUIREMENTS

### 1. Objectives & Nonâ€‘Goals
**Objectives:**
- Accept text, pasted notes, or uploaded files.  
- Generate structured summaries and highlights.  
- Store past summaries and allow exports.  
- Enable reâ€‘summarization (different tone or format).  

**Nonâ€‘Goals:**
- No external web crawling.  
- No plagiarism or fact verification (use Research Assistant for that).  

---

### 2. User Stories (Acceptance Criteria)
1. **Input Text or Upload File**
   - `/ai-notes-summarizer/api/ingest`
   - Accepts pasted text, Markdown, or PDF file (â‰¤10MB).

2. **Generate Summary**
   - `/ai-notes-summarizer/api/summarize`
   - Modes: *Concise*, *Detailed*, *Bullet*, *Abstract*, *Action Plan*.

3. **Edit & Save Summary**
   - `/ai-notes-summarizer/api/save`
   - Users can tweak AI output before saving.

4. **Tag & Export**
   - `/ai-notes-summarizer/api/export`
   - Exports to MD or PDF; tags summaries by topic (Education, Business, etc.).

5. **History & Search**
   - `/ai-notes-summarizer/api/history/list`
   - Retrieve previous summaries with metadata and timestamps.

6. **Integrations**
   - Push summary data to FlashNote (`/flashnote/api/import`).

---

### 3. Pages & Routes
- `/ai-notes-summarizer` â†’ Input box + Upload panel + Mode selector  
- `/ai-notes-summarizer/summary/[id]` â†’ Output editor & export  
- `/ai-notes-summarizer/history` â†’ History viewer  
- `/ai-notes-summarizer/settings` â†’ Preferences (tone, max length, language)

**API (SSR):**
- `POST /ai-notes-summarizer/api/ingest`
- `POST /ai-notes-summarizer/api/summarize`
- `POST /ai-notes-summarizer/api/save`
- `POST /ai-notes-summarizer/api/export`
- `GET /ai-notes-summarizer/api/history/list`

---

### 4. Database Schema (Astro DB / SQL)

**User**
- `id`, `email`, `plan`, `language`, `createdAt`

**Note**
- `id`, `userId`, `title`, `content`, `sourceType` ('text'|'pdf'), `createdAt`

**Summary**
- `id`, `noteId`, `userId`, `mode`, `summaryText`, `wordCount`, `tags` (json), `createdAt`

**Tag**
- `id`, `userId`, `name`, `color`

**History**
- `id`, `userId`, `noteId`, `summaryId`, `createdAt`

---

### 5. API Contract Example

#### `POST /ai-notes-summarizer/api/summarize`
Request:
```json
{
  "noteId": "uuid",
  "mode": "detailed",
  "language": "en"
}
```
Response:
```json
{
  "summaryId": "uuid",
  "summaryText": "This article discusses...",
  "keyPoints": ["Topic 1", "Topic 2"],
  "actionItems": ["Follow up on X"],
  "confidence": 0.94
}
```

---

### 6. Validation Rules
- Input â‰¤ 50,000 chars.  
- PDFs â‰¤ 10MB.  
- Tags â‰¤ 10 per summary.  
- Summary length 5â€“15% of original.  
- Duplicate summaries must reference the same note ID.

---

### 7. UX & Accessibility
- Upload or paste text directly.  
- Choose tone: *Neutral*, *Professional*, *Academic*, *Creative*.  
- Inline edit summary before saving.  
- Keyboard shortcuts: `Ctrl+Enter` to summarize, `Ctrl+S` to save.  
- Autosave & progress indicator during generation.  
- High contrast and mobile responsive layout.

---

### 8. Integrations
- **Research Assistant:** Summarize extracted sources or reader notes.  
- **Meeting Minutes AI:** Convert minutes to summarized outcomes.  
- **FlashNote:** Convert bullet points into flashcards.  
- **Presentation Designer:** Export summarized sections into slides.

---

### 9. Export Formats
- Markdown (default)
- PDF (Pro only)
- JSON (for API use)
- FlashNote sync

---

### 10. Plan Gating
| Feature | Free | Pro |
|----------|------|-----|
| Input size | 3k chars | 50k chars |
| Modes | Concise, Bullet | All modes |
| Save history | â€” | Enabled |
| Export | Markdown | MD + PDF |
| AI Model | GPTâ€‘Lite | GPTâ€‘5 Pro |

---

### 11. Suggested File Layout

```
src/pages/ai-notes-summarizer/index.astro
src/pages/ai-notes-summarizer/summary/[id].astro
src/pages/ai-notes-summarizer/history.astro
src/pages/ai-notes-summarizer/settings.astro

src/pages/ai-notes-summarizer/api/ingest.ts
src/pages/ai-notes-summarizer/api/summarize.ts
src/pages/ai-notes-summarizer/api/save.ts
src/pages/ai-notes-summarizer/api/export.ts
src/pages/ai-notes-summarizer/api/history/list.ts

src/components/ai-notes-summarizer/InputBox.astro
src/components/ai-notes-summarizer/SummaryView.astro
src/components/ai-notes-summarizer/HistoryList.astro
```

---

### 12. Future Enhancements (v2+)
- Multi-language summaries (auto-detect language).  
- Real-time collaborative summarization.  
- Voice dictation input and transcript summarizer.  
- Chrome/Edge extension for page summarization.  
- Auto-sync with Google Docs and Notion.  
- Custom AI tone fine-tuning per user.

---

**End of Requirements â€” Ready for Codex Implementation.**
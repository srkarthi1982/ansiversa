# ðŸ”Ž Research Assistant â€” Full Requirements (Ansiversa)

This file contains both a **condensed overview** for Codex onboarding and the **full technical specification** for implementation.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### Overview
The **Research Assistant** mini app helps users collect, read, highlight, summarize, and synthesize knowledge into structured drafts with citations. It serves as a workspace for evidence-based writing, academic research, and idea development.

### Key Features
- Create projects with research questions and scopes.
- Add and parse sources (URLs, PDFs, text, or notes).
- Built-in reader with highlighting, quoting, and tagging.
- AI summaries and key point extraction.
- Compare multiple sources for agreement/disagreement.
- Build claimâ€“evidence matrices and bias checks.
- Auto-generate outlines and drafts with citations (APA/MLA/Chicago/IEEE).
- Export to MD/DOCX/PDF or send outline to Presentation Designer.
- Integrations: FlashNote, Fact Generator, Proposal Writer, Blog Writer.

### Core Pages
- `/research-assistant` â†’ Project list
- `/research-assistant/project/[id]` â†’ Dashboard
- `/research-assistant/project/[id]/reader/[sourceId]` â†’ Reader and Notes
- `/research-assistant/project/[id]/synthesis` â†’ Comparison and Matrix
- `/research-assistant/project/[id]/writer` â†’ Outline and Draft Editor

### Database Summary
Tables: `User`, `Project`, `Source`, `Excerpt`, `Highlight`, `Note`, `Claim`, `EvidenceLink`, `Outline`, `Draft`, `BibliographyItem`, `PlagiarismReport`.

### Plan Gating
| Feature | Free | Pro |
|----------|------|-----|
| Projects | 1 | Unlimited |
| Sources/project | 10 | 2,000 |
| Highlights | 200 | 20,000 |
| Drafts | Outline only | Outline + Draft |
| Exports | MD | MD/DOCX/PDF |
| Plagiarism | â€” | Included |

### Integrations
- **Presentation Designer** â†’ Export slides from outline.
- **FlashNote** â†’ Create flashcards from highlights.
- **Fact Generator** â†’ Validate and extract facts.
- **Proposal Writer / Blog Writer** â†’ Reuse drafted sections.

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1. Objectives and Non-Goals
**Objectives:**
- Projects manage sources, notes, claims, and drafts.
- Reader supports highlights, notes, and citation extraction.
- Summarization, comparison, and synthesis with integrity tracking.

**Non-Goals:**
- No live scraping or collaborative editing in v1.

### 2. User Stories
1. Create project â†’ `/research-assistant/api/project/create`
2. Add sources (URL, PDF, text) â†’ `/research-assistant/api/source/add`
3. Highlight and quote â†’ `/research-assistant/api/highlight/add`
4. Summarize â†’ `/research-assistant/api/summary`
5. Compare â†’ `/research-assistant/api/compare`
6. Outline and draft â†’ `/research-assistant/api/outline`, `/research-assistant/api/draft`
7. Generate bibliography â†’ `/research-assistant/api/bib/render`
8. Export â†’ `/research-assistant/api/export`
9. Plagiarism check â†’ `/research-assistant/api/plagiarism/check`

### 3. Routes
- `/research-assistant`
- `/research-assistant/project/[id]`
- `/research-assistant/project/[id]/reader/[sourceId]`
- `/research-assistant/project/[id]/synthesis`
- `/research-assistant/project/[id]/writer`
- `/research-assistant/settings`

### 4. Database Schema (Astro DB)
**Project**
- id, userId, title, question, scope, citationStyle, language, createdAt

**Source**
- id, projectId, type, title, authors, publisher, url, fileUrl, pubDate, status

**Highlight**
- id, sourceId, color, tags, noteId, createdAt

**Note**
- id, projectId, textMd, links, createdAt

**Claim**
- id, projectId, text, stance, confidence, createdAt

**Draft**
- id, projectId, outlineId, contentMd, citations

**BibliographyItem**
- id, projectId, sourceId, style, text

### 5. API Contract Example
`POST /research-assistant/api/summary`
```json
{
  "sourceId": "uuid",
  "mode": "keypoints"
}
```
Response:
```json
{
  "bullets": ["Point 1", "Point 2"],
  "quotes": [{"text": "Excerpt", "page": 3}],
  "confidence": 0.88
}
```

### 6. Validation
- URLs: must be http(s)
- PDFs: â‰¤25MB
- Notes: â‰¤20k chars
- Highlights: 1â€“2000 chars
- Draft: â‰¥2 sources per section

### 7. Accessibility
- Keyboard shortcuts for highlight/note.
- High-contrast and dyslexia fonts.
- RTL and multi-language support.

### 8. Integration and Export
Exports: MD, DOCX, PDF, JSON, CSV  
Deck export: Outline + key claims â†’ `/presentation-designer`

### 9. Future Enhancements
- Collaboration and comments.
- Semantic search across notes/sources.
- Import from Zotero, Notion, or Drive.
- Argument graphs and contradiction detection.
- Video/audio transcript support.

---

**End of Document â€” Ready for Codex Implementation.**
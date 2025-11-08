# ðŸ“ Meeting Minutes AI â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/minutes`  
**Category:** Career and Professional  
**Stack:** Astro + Tailwind (islands where needed), Astro SSR routes, Astro DB / Supabase, optional Web Speech API (client)  
**Goal:** Help users **capture, summarize, and share meeting minutes** with AI â€” from audio recordings or typed notes â€” including **action items**, **decisions**, **attendees**, and **followâ€‘ups**.

> âš ï¸ **Privacy Note**: Inform users that uploaded recordings/notes may be processed by AI. Provide a toggle for â€œDo not retain content after summarizationâ€ and link to privacy policy.

---

## 1) Objectives and Nonâ€‘Goals

### Objectives
- Ingest **audio** (MP3/WAV/M4A) and/or **live notes** to produce structured minutes.  
- Generate **AI summaries**: Agenda, Key Points, Decisions, Action Items (assignee, due), Risks, Parking Lot.  
- Basic **speaker diarization** labels (Speaker 1/2 or named).  
- Allow **editing** of AI output and **export** to PDF/DOCX/Markdown/CSV.  
- Meeting **templates** (Standâ€‘up, Sprint Review, Client Call, Sales Discovery).  
- **Action tracker** across meetings.

### Nonâ€‘Goals (v1)
- Live multiâ€‘party streaming transcription (upload-only).  
- Calendar/email notifications (Phase 2).  
- Longâ€‘term audio retention by default.

---

## 2) User Stories (Acceptance Criteria)

1. **Create Minutes** â†’ draft created; open builder.  
2. **Transcribe Audio** â†’ returns text + timestamps + (optional) speakers.  
3. **AI Summarize** â†’ returns structured sections; extracts assignees/due dates.  
4. **Edit and Organize** â†’ autosave; reassign tasks; reorder items.  
5. **Templates** â†’ apply without wiping current content.  
6. **Export** â†’ PDF/DOCX/MD + CSV (action items).  
7. **Share** â†’ public readâ€‘only link `/minutes/view/<slug>`.  
8. **Action Tracker** â†’ `/minutes/actions` aggregates tasks.  
9. **Plan Gating** â†’ Free vs Pro limits.

---

## 3) Routes and APIs

- `/minutes` (dashboard)  
- `/minutes/builder` (editor + preview + audio upload)  
- `/minutes/templates` (gallery)  
- `/minutes/actions` (global action items)  
- `/minutes/view/[slug]` (public)

**API:**  
- `POST /minutes/api/create`  
- `POST /minutes/api/transcribe`  
- `POST /minutes/api/summarize`  
- `POST /minutes/api/save`  
- `POST /minutes/api/export`  
- `POST /minutes/api/publish`  
- `POST /minutes/api/delete`  
- `GET  /minutes/api/templates`

---

## 4) Database

**User**: id, email, plan, createdAt  
**Minutes**: id, userId, title, slug, status, meetingDate, templateKey, attendees(json), transcript(json), summary(json), privacy, lastSavedAt, createdAt  
**ActionItem**: id, minutesId, task, assignee, due, priority, status, createdAt  
**Media**: id, minutesId, type('audio'), filePath, durationSec, createdAt

---

## 5) JSON Examples

**Transcript**
```json
{
  "language": "en",
  "speakers": ["Karthik", "Priya"],
  "segments": [
    {"t0": 0.0, "t1": 12.3, "speaker": "Karthik", "text": "Welcome..."},
    {"t0": 12.3, "t1": 30.1, "speaker": "Priya", "text": "Updates..."}
  ]
}
```

**Summary**
```json
{
  "agenda": ["Sprint review"],
  "decisions": ["Ship v1 Friday"],
  "key_points": ["API ready"],
  "action_items": [
    {"task": "Release notes", "assignee": "Alex", "due": "2025-10-24", "priority": "med", "status": "open"}
  ],
  "risks": ["Low QA bandwidth"],
  "parking_lot": ["Metrics dashboard"]
}
```

---

## 6) UI

**Dashboard**: list meetings (title/date/attendees/actions).  
**Builder**: Tabs â†’ Transcript / Summary / Actions / Meta; rightâ€‘side Preview.  
**Templates**: Standâ€‘up, Sprint, Client, Sales.  
**Actions**: global table with filters (assignee/due/status).  
**Public View**: clean readâ€‘only minutes; hide transcript by default.

---

## 7) API Contracts

- **Create**: `{ "title":"Sprint Review - Oct 22", "meetingDate":"2025-10-22" }` â†’ `{ "id":"<uuid>", "slug":"sprint-review-oct-22" }`  
- **Transcribe**: multipart `audio` + `{ "diarize":true }` â†’ transcript JSON + duration.  
- **Summarize**: `{ "transcript":{...}, "templateKey":"sprint" }` â†’ summary JSON.  
- **Save**: `{ "id":"<uuid>", "patch": { "path":"summary.action_items[0].status", "value":"done" } }` â†’ `{ "ok":true }`  
- **Export**: `{ "id":"<uuid>", "format":"pdf|docx|md|csv" }` â†’ URL  
- **Publish**: `{ "id":"<uuid>" }` â†’ public URL  
- **Delete**: `{ "id":"<uuid>" }` â†’ `{ "ok":true }`  
- **Templates**: list default templates.

---

## 8) Validation

- Audio: Free â‰¤ 30 min; Pro â‰¤ 120 min.  
- Publish requires: title, date, â‰¥ 1 summary section.  
- Action items: task 1â€“200 chars; status in {open,in-progress,done}.  
- Attendees â‰¤ 50; emails optional.  
- Ephemeral mode deletes transcript after summarize.

---

## 9) Exports

- **PDF** (branded, page numbers), **DOCX** (headings + tables), **MD**, **CSV** (tasks).

---

## 10) Plans and Limits

| Feature | Free | Pro |
|--------|------|-----|
| Minutes | 5 | Unlimited |
| Uploads | 3/mo, â‰¤ 30 min | Unlimited, â‰¤ 120 min |
| Templates | 1 | All |
| Exports | PDF/MD (watermark) | PDF/DOCX/MD/CSV (no watermark) |
| Public Link | Yes | Yes |

---

## 11) Security and Privacy

- Private by default; publish explicitly.  
- Sanitize inputs; redact PII in public views if needed.  
- Privacy toggle to delete transcripts post-summary.

---

## 12) Analytics and Accessibility

- Events: `minutes.create/transcribe/summarize/save/export/publish/delete`.  
- Keyboard navigation; aria labels; focus rings; `noindex` drafts; OG tags for public.

---

## 13) Suggested File Layout

```
src/pages/minutes/index.astro
src/pages/minutes/builder.astro
src/pages/minutes/templates.astro
src/pages/minutes/actions.astro
src/pages/minutes/view/[slug].astro

src/pages/minutes/api/create.ts
src/pages/minutes/api/transcribe.ts
src/pages/minutes/api/summarize.ts
src/pages/minutes/api/save.ts
src/pages/minutes/api/export.ts
src/pages/minutes/api/publish.ts
src/pages/minutes/api/delete.ts
src/pages/minutes/api/templates.ts

src/components/minutes/Form/*.astro or .tsx
src/components/minutes/Preview/*.astro
```

---

## 14) Future Enhancements

- Calendar sync and email/Slack reminders.  
- Live streaming transcription for short meetings.  
- Voice â†’ name mapping.  
- Section reordering and custom fields.

---

**End of Requirements â€” ready for Codex implementation.**
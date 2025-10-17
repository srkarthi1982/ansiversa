# ✉️ Cover Letter Writer — Product Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module:** `/cover-letter-writer`  
**Stack:** Astro + Tailwind + Alpine stores, Astro SSR routes, Astro DB  
**Goal:** Help users craft personalized, ATS-friendly cover letters with AI assistance, reusable templates, and export options.

---

## 1) Objectives & Non-Goals

### 1.1 Objectives
- Let users generate tailored cover letters from structured prompts (role, company, achievements).
- Provide AI rewrites for tone (professional, confident, friendly) and length control.
- Offer reusable templates/layouts with live preview.
- Support quick duplication per job, version history, and export to PDF/DOCX/Markdown/plain text.
- Integrate with Resume Builder data to prefill basics and achievements.

### 1.2 Non-Goals (v1)
- No collaborative editing or commenting.
- No automatic job scraping from URLs (manual entry only).
- No CRM/email sending integrations (Gmail, Outlook) in v1.

---

## 2) User Stories & Acceptance Criteria

1. **Start a Cover Letter**  
   - *As a user*, I can click “New Cover Letter” to create a draft tied to a role + company.  
   - **AC:** Draft record is created with status `draft`, prefilled with my latest resume summary, and opens `/cover-letter-writer/editor?id=<uuid>`.

2. **Guided Prompting**  
   - *As a user*, I can fill structured prompts for role, company mission, key achievements, value proposition, and closing CTA.  
   - **AC:** Form updates preview within 200ms; required fields validated (role, company, greeting).

3. **AI Compose**  
   - *As a user*, I can generate a first draft via “AI Compose” using my prompts + resume bullet highlights.  
   - **AC:** Server action `actions.coverLetter.compose` calls AI with safety guardrails, stores prompt/result tokens, and writes the output to the draft.

4. **Tone & Length Adjustments**  
   - *As a user*, I can pick tone (professional, confident, friendly) and target length (short, medium, long).  
   - **AC:** Tone/length settings persist per draft and affect subsequent AI rewrites; preview updates instantly.

5. **Manual Editing with Autosave**  
   - *As a user*, I can edit the letter body manually with inline formatting helpers (bold, bullet list).  
   - **AC:** Changes autosave after 2s of inactivity; `lastSavedAt` visible; undo/redo history tracked for current session.

6. **Template Switcher**  
   - *As a user*, I can switch between templates (Minimal, Classic, Bold Accent) without losing content.  
   - **AC:** Template metadata saved on draft; preview rerenders instantly; template gating respects plan (Pro unlocks Bold Accent).

7. **Duplication per Job**  
   - *As a user*, I can duplicate a cover letter, tweak company/role, and save as a new draft.  
   - **AC:** Duplicate copies all content + tone settings, assigns new UUID, sets status `draft`.

8. **Exports & Share Links**  
   - *As a user*, I can export PDF/DOCX/Markdown/plain text or copy shareable link (optional).  
   - **AC:** Free plan adds subtle PDF watermark; export filenames follow `CoverLetter_<role>_<company>_<date>.pdf`.

9. **Integration with Resume Builder**  
   - *As a user*, I can pull resume highlights or summary directly into the cover letter prompts.  
   - **AC:** “Insert from Resume” modal lists my resumes; selecting one injects summary + top achievements.

10. **Plan Gating**  
    - *As a free user*, I get 3 AI compose requests/day, 1 template, watermark exports.  
    - *As a Pro user*, unlimited drafts, all templates, no watermark, AI analytics dashboard.  
    - **AC:** Action responses include friendly upsell message when quota exceeded; gating enforced server-side.

---

## 3) Information Architecture & Routing

- `/cover-letter-writer` — landing with existing letters, “New Cover Letter”, and plan upsell banner.
- `/cover-letter-writer/editor` — editor + live preview; expects `id` or creates new.
- `/cover-letter-writer/templates` — gallery of layouts with sample previews + plan indicators.
- Astro server actions:
  - `actions.coverLetter.list` — fetch drafts for logged-in user.
  - `actions.coverLetter.create` — create draft from prompts/resume.
  - `actions.coverLetter.save` — autosave updates + tone/template settings.
  - `actions.coverLetter.compose` — AI compose / rewrite.
  - `actions.coverLetter.duplicate` — duplicate draft.
  - `actions.coverLetter.export` — render PDF/DOCX/Markdown/Text.
  - `actions.coverLetter.delete` — delete draft with cascade for exports/history.

> Actions live under `src/actions/cover-letter/*.ts`, using `defineAction` with `astro:actions`.

---

## 4) Data Model (Astro DB)

### 4.1 Tables

**CoverLetter**  
- `id` (uuid, pk)  
- `userId` (fk → User.id)  
- `title` (string)  
- `role` (string)  
- `company` (string)  
- `greeting` (string)  
- `tone` (enum: `professional` | `confident` | `friendly`)  
- `length` (enum: `short` | `medium` | `long`)  
- `templateKey` (string) — `minimal` | `classic` | `bold`  
- `prompts` (json) — structured prompt fields  
- `body` (text) — latest composed text  
- `status` (enum: `draft` | `final`)  
- `lastSavedAt` (datetime)  
- `createdAt` (datetime)

**CoverLetterExport**  
- `id` (uuid, pk)  
- `letterId` (fk → CoverLetter.id)  
- `format` (`pdf` | `docx` | `md` | `txt`)  
- `filePath` (string or storage key)  
- `createdAt` (datetime)

**CoverLetterHistory** (optional but recommended)  
- `id` (uuid, pk)  
- `letterId` (fk)  
- `body` (text)  
- `createdAt` (datetime)  
- `generatedBy` (`user` | `ai`)

### 4.2 Prompt JSON Schema

```json
{
  "introduction": "string",
  "valueProps": ["string"],
  "achievements": [
    {
      "headline": "string",
      "metric": "string",
      "description": "string"
    }
  ],
  "motivation": "string",
  "closing": "string"
}
```

---

## 5) AI & Safety Requirements

- Use OpenAI GPT (or fallback prompts) with deterministic system prompt.  
- Sanitize inputs (strip HTML except allowed formatting tokens) before sending to AI.  
- Log prompt + response metadata (tokens, latency) in observability pipeline without storing raw PII in production.  
- Redact secrets (emails, phone numbers) if model returns them unexpectedly.  
- Refuse prompts requesting discriminatory or sensitive info; show friendly error.

### Compose Prompt Template
```
You are Ansiversa's cover letter assistant. Write a {tone} cover letter with {length} length.
Use the following details:
- Role: {role}
- Company: {company}
- Greeting: {greeting}
- Motivation: {motivation}
- Value Propositions: {valueProps}
- Achievements: {achievements}
- Closing CTA: {closing}
Ensure ATS-friendly formatting (no tables), keep paragraphs short, and include a confident closing.
```

---

## 6) Editor Experience

- Split layout: form on left, preview on right (sticky on desktop, stacked on mobile).  
- Autosave indicator shows "Autosaved just now" or "Save failed".  
- Toolbar for body editor: **Bold**, *Italic*, bullet list, insert placeholder (company, role).  
- Keyboard shortcuts: `Ctrl/Cmd + S` triggers manual save; `Ctrl/Cmd + Z/Y` for undo/redo (client-side stack).  
- Preview renders markdown-safe HTML; highlight placeholders when empty.  
- Provide "Insert from Resume" modal pulling data via `actions.resume.list`.

---

## 7) Exports & Sharing

- **PDF**: simple letter layout with header (name/contact), sections for intro/body/closing.  
- **DOCX**: use same structure, ensure bullet lists preserved.  
- **Markdown**: plain text with headings and bullet formatting.  
- **Plain text**: sanitized string for quick copy.  
- Filenames follow `CoverLetter_<Role>_<Company>_<YYYY-MM-DD>.<ext>`.  
- Free plan PDF watermark (bottom-right “Created with Ansiversa”).  
- Optional share link generates signed token (expires in 7 days) for read-only view.

---

## 8) Plan Limits & Analytics

- Track daily AI compose count per user; enforce 3/day for Free, unlimited for Pro/Elite.  
- Store metrics events: `coverLetter.create`, `coverLetter.compose`, `coverLetter.export`, `coverLetter.duplicate`.  
- Surface usage counters in dashboard (e.g., "2/3 AI comps today").

---

## 9) Accessibility & Internationalization

- Ensure full keyboard navigation, ARIA labels on toolbar buttons, visible focus states.  
- Support locales: `en` default, `ar` & `ta` (RTL adjustments in preview).  
- Date formats and tone labels localized via translation strings.  
- Provide alternate text for icons and plan badges.

---

## 10) Future Enhancements

- Email send integrations (Gmail/Outlook) with tracking.  
- Collaborative review mode with comments.  
- Smart suggestions based on job description parsing.  
- Integration with job application tracker mini-app.

---

**End of Requirements** — Use this document to scope the Cover Letter Writer mini-app alongside the Resume Builder.

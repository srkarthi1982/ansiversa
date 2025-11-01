# 📄 Resume Builder — Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module:** `/resume-builder`  
**Stack:** Astro (+ Tailwind, Alpine or small islands), Astro SSR routes, Astro DB (or Supabase)  
**Goal:** Let users **create, edit, preview, and export** professional, ATS‑friendly resumes with AI assistance.

---

## 1) Objectives and Non‑Goals

### 1.1 Objectives
- Users can **create a resume** quickly with guided forms and live preview.
- Offer **AI assistance** to rewrite/improve sections (summary, experience, skills).
- Provide **multiple templates** (Modern, Classic, Minimal, Creative) with instant switching.
- **Export** to **PDF** and **DOCX**; **copy as Markdown/HTML**.
- Save multiple resumes per user; allow **duplicate**, **rename**, **delete**.
- Support **free vs paid** feature gating (Pro templates, unlimited export).

### 1.2 Non‑Goals (v1)
- No rich collaboration or comments in v1.
- No advanced design editor (drag/drop blocks) — we use structured sections.
- No external job board integration (can be v2).

---

## 2) User Stories (with Acceptance Criteria)

1. **Create Resume**
   - *As a user*, I can create a new resume and fill my details (name, email, phone, location).
   - **AC:** “Create Resume” button generates a draft record with `status='draft'` and opens `/resume-builder/builder?id=<uuid>`.

2. **Edit Sections**
   - *As a user*, I can add/edit sections: Summary, Experience, Education, Skills, Projects, Certificates, Links.
   - **AC:** Each section has add/remove items; changes reflect in **live preview** within 200ms.

3. **Template Switch**
   - *As a user*, I can switch between templates (Modern / Classic / Minimal / Creative).
   - **AC:** Template switch updates preview without losing content; saved to `templateKey` field.

4. **AI Improve**
   - *As a user*, I can click “AI Improve” on any text area to rewrite with chosen tone (concise, professional).
   - **AC:** Server action `actions.resume.aiImprove` returns improved text; unsafe content sanitized; token usage tracked.

5. **Export PDF/DOCX**
   - *As a user*, I can export the current preview to PDF/DOCX.
   - **AC:** Exported file includes correct typography, section order, and page breaks; filename pattern `Resume_<name>_<template>_<date>.pdf`.

6. **Save and Autosave**
   - *As a user*, my data autosaves every 3s after change (debounced), and on navigation.
   - **AC:** Resume document version increments; lastSaved timestamp visible.

7. **Multiple Resumes**
   - *As a user*, I can maintain multiple resumes and set one as **default**.
   - **AC:** `/resume-builder` lists cards with last modified, template, and action buttons.

8. **Permissions (Pro vs Free)**
   - *As a free user*, I can create 1 resume, use 1 free template, and export watermark PDF.
   - *As a Pro user*, unlimited resumes, all templates, no watermark.
   - **AC:** Gate by `plan` on session; show upsell when exceeding limits.

9. **Accessibility**
   - *As a user with accessibility needs*, I can navigate with keyboard and screen readers.
   - **AC:** Labels, aria attributes, contrast and focus ring present; “Skip to content” link.

10. **Localization (Phase 2)**
    - *As a user*, I can set resume locale (en, ar, ta) for date formats and headings.
    - **AC:** Localized labels and RTL switch for Arabic templates.

---

## 3) Information Architecture and Routing

- `/resume-builder` — App landing (list user resumes, “New Resume” button)
- `/resume-builder/builder` — Builder (form + live preview); expects `id` query or creates one
- `/resume-builder/templates` — Template gallery (preview cards, Pro tagging)
- Server actions (astro:actions):
  - `actions.resume.create` → create draft resume
  - `actions.resume.save` → partial updates (autosave; patch by path)
  - `actions.resume.aiImprove` → AI rewrite endpoint
  - `actions.resume.export` → server-side render → PDF/DOCX
  - `actions.resume.duplicate` → duplicate resume
  - `actions.resume.delete` → delete resume

> Astro: implement as `src/actions/resume/*.ts` using `defineAction`.

---

## 4) Data Model (Astro DB / SQL)

### 4.1 Entities

**User** (if not already defined globally)
- `id` (string, pk)
- `email` (string, unique)
- `plan` (enum: 'free' | 'pro' | 'elite')
- `createdAt` (datetime)

**Resume**
- `id` (string, pk, uuid)
- `userId` (fk → User.id)
- `title` (string) — user label, e.g., “Software Engineer — 2025”
- `templateKey` (string) — 'modern' | 'classic' | 'minimal' | 'creative'
- `locale` (string) — 'en' default; future: 'ar', 'ta'
- `status` (string) — 'draft' | 'final'
- `data` (json) — full structured payload (schema below)
- `lastSavedAt` (datetime)
- `createdAt` (datetime)

**Exports**
- `id` (string, pk)
- `resumeId` (fk)
- `format` (string) — 'pdf' | 'docx' | 'md' | 'html'
- `filePath` (string) — storage url/key
- `createdAt` (datetime)

### 4.2 JSON Schema for `Resume.data`

```json
{
  "basics": {
    "fullName": "Karthik Ramalingam",
    "title": "Full‑Stack Developer",
    "email": "karthik@example.com",
    "phone": "+971…",
    "location": "Dubai, UAE",
    "links": [
      {"label": "GitHub", "url": "https://github.com/srkarthi1982"},
      {"label": "Portfolio", "url": "https://ansiversa.com"}
    ]
  },
  "summary": "Full‑stack developer with X years…",
  "skills": [
    {"name": "JavaScript", "level": "expert"},
    {"name": "Astro", "level": "advanced"}
  ],
  "experience": [
    {
      "company": "Ansiversa",
      "role": "Founder",
      "location": "Dubai, UAE",
      "start": "2024-01",
      "end": null,
      "current": true,
      "highlights": [
        "Built 20+ AI mini‑apps",
        "Grew MAU by 200%"
      ]
    }
  ],
  "education": [
    {
      "school": "University Name",
      "degree": "B.Tech CSE",
      "start": "2016-08",
      "end": "2020-05",
      "highlights": ["CGPA 8.5"]
    }
  ],
  "projects": [
    {"name": "Quiz Institute", "url": "https://ansiversa.com/quiz", "summary": "Learning platform…"}
  ],
  "certificates": [
    {"name": "AWS Practitioner", "date": "2023-10", "issuer": "AWS"}
  ],
  "awards": [
    {"name": "Hackathon Winner", "date": "2024-06", "by": "XYZ"}
  ],
  "extras": {
    "languages": ["English", "Tamil", "Arabic"],
    "interests": ["AI", "Design"]
  }
}
```

> **Note:** Keep schema permissive so templates can hide unused sections.

### 4.3 Astro DB (example)

```ts
// db/config.ts
import { defineDb, defineTable, column, now } from "astro:db";

export const User = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    email: column.text({ unique: true }),
    plan: column.text({ default: "free" }),
    createdAt: column.date({ default: now() }),
  },
});

export const Resume = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    title: column.text(),
    templateKey: column.text({ default: "modern" }),
    locale: column.text({ default: "en" }),
    status: column.text({ default: "draft" }),
    data: column.json(),
    lastSavedAt: column.date({ default: now() }),
    createdAt: column.date({ default: now() }),
  },
});

export default defineDb({
  tables: { User, Resume },
});
```

---

## 5) Pages / UI Spec

### 5.1 `/resume-builder` (List and CTA)
- Header: “Resume Builder” + “Create Resume” button.
- Grid of existing resumes (title, template, updatedAt) with actions: **Open**, **Duplicate**, **Delete**.
- Empty state illustration.

### 5.2 `/resume-builder/builder` (Two‑Pane)
- **Left pane**: form sections (accordion) — Basics, Summary, Experience, Education, Skills, Projects, Certificates, Extras.
  - “Add item”, “Remove”, drag‑sort (optional v1.1).
  - “AI Improve” button per textarea (tone select).
- **Right pane**: live **Preview** (template renderer component).
  - Template switcher (dropdown).
  - Theme picker (light/dark; accent color v1.1).
  - Export buttons: PDF / DOCX / MD / HTML.
- **Top bar**: title input, status chip, autosave indicator.

### 5.3 `/resume-builder/templates`
- Cards previewing each template with sample content.
- Pro badge for premium templates.
- “Use this template” CTA → updates `templateKey` and redirects to builder.

---

## 6) Components

- `ResumeFormSection.astro` — generic wrapper (title, add/remove).
- `ExperienceItemEditor.tsx` — fields + bullets editor (island).
- `TemplatePreview.astro` — mounts selected template.
- Templates under `src/components/resume/templates/`:
  - `Modern.astro`
  - `Classic.astro`
  - `Minimal.astro`
  - `Creative.astro`

> Templates receive `data` (JSON) + `locale` and map to typography layout.

---

## 7) Action Contracts

### 7.1 `actions.resume.create`
**Input**: `{ "title": "Software Engineer – 2025" }`  
**Output**: `{ "id": "<uuid>", "templateKey": "modern" }`

### 7.2 `actions.resume.save`
**Input**: `{ "id": "<uuid>", "patch": { "path": "summary", "value": "..." } }`  
- Supports nested paths (e.g., `experience[0].highlights[2]`).  
**Output**: `{ "ok": true, "lastSavedAt": "<ISO>" }`

### 7.3 `actions.resume.aiImprove`
**Input**: `{ "text": "...", "tone": "concise|professional|friendly", "locale":"en" }`  
**Output**: `{ "text": "Improved text..." }`

### 7.4 `actions.resume.export`
**Input**: `{ "id": "<uuid>", "format": "pdf|docx|md|html", "templateKey":"modern" }`  
**Output**: `{ "url": "/storage/resumes/Resume_Karthik_modern_2025-10-16.pdf" }`

### 7.5 `actions.resume.duplicate`
**Input**: `{ "id": "<uuid>" }`  
**Output**: `{ "id": "<newUuid>" }`

### 7.6 `actions.resume.delete`
**Input**: `{ "id": "<uuid>" }`  
**Output**: `{ "ok": true }`

---

## 8) Validation Rules

- **Basics:** email format, phone length (region aware later), required: fullName, email.
- **Experience:** if `current=true` then `end=null`; start <= end.
- **Skills:** max 30 items; level ∈ {beginner, intermediate, advanced, expert}.
- **Projects/Certificates:** name required; URLs must be valid.
- **Length guard:** summary ≤ 1200 chars; highlight bullet ≤ 220 chars.
- Sanitize AI output (no HTML tags except allowed list for MD export).

---

## 9) Export and Rendering

- **PDF**: Server render (SSR) using headless Chromium or `@react-pdf/renderer` alternative; ensure consistent fonts.
- **DOCX**: Use `docx` npm package; map sections to docx paragraphs, headings, lists.
- **Markdown/HTML**: simple string template from `data`.
- **Page breaks**: avoid orphans; keep section headers with at least one item.

---

## 10) Rate Limits and Plans

- **Free**: 1 resume, 1 template, 3 AI improves/day, PDF with watermark.
- **Pro**: unlimited resumes, all templates, unlimited AI improves (fair-use), no watermark.
- Rate limiter: by `userId`/IP and date bucket; show gentle upsell when exceeded.

---

## 11) Security and Privacy

- Store only necessary PII (name, email, phone) inside user-owned resume docs.
- Allow **Delete Account** → cascade delete resumes/exports.
- Don’t log raw AI inputs in prod; mask secrets in logs.

---

## 12) Observability

- Events: `resume.create`, `resume.save`, `resume.export`, `ai.improve` (with result size), `template.switch`.
- Store anonymized analytics for UX improvement.

---

## 13) i18n and RTL (Phase 2)

- Localize section headings and date formats.
- RTL CSS for Arabic templates (mirror layout; right-aligned headings).

---

## 14) Accessibility and SEO

- WCAG: labels, aria-expanded for accordions, keyboard focus trap in dialogs.
- Landings have canonical/meta descriptions; builder is app-like (noindex optional).

---

## 15) Example Prompts (AI Improve)

- **Summary (Professional):**  
  “Rewrite the following resume summary to be concise, results‑oriented, and ATS‑friendly. Keep it under 80 words. Use strong verbs and quantify impact.”

- **Experience Bullet:**  
  “Rewrite this bullet to start with an action verb, quantify impact, and remove filler: ‘{text}’ ”

- **Skills Merge:**  
  “From this raw list of skills, standardize names, remove duplicates, and group by category.”

---

## 16) Acceptance Criteria (End‑to‑End)

- Creating a resume yields a **UUID** and opens the builder.
- Editing fields **autosaves** and updates preview live.
- Switching templates retains data and changes layout instantly.
- Exporting PDF produces a valid file in under 5s with correct typography.
- AI Improve returns safe text; refuses PII-injection or unsafe prompts.
- Plan gating works; non‑Pro export shows a small watermark.
- All core flows pass on **mobile** (≤ 390px) and desktop (≥ 1280px).

---

## 17) File Layout (Suggested)

```
src/pages/resume-builder/index.astro          # list + CTA
src/pages/resume-builder/builder.astro        # main builder
src/pages/resume-builder/templates.astro      # gallery

src/components/resume/Form/*.astro or .tsx
src/components/resume/templates/Modern.astro
src/components/resume/templates/Classic.astro
src/components/resume/templates/Minimal.astro
src/components/resume/templates/Creative.astro

src/lib/resume/schema.ts              # TS types, zod schema
src/lib/resume/render/pdf.ts          # export helpers
src/lib/resume/render/docx.ts
src/lib/resume/ai/prompts.ts
src/actions/resume/create.ts          # example action modules
src/actions/resume/save.ts
src/actions/resume/ai-improve.ts
src/actions/resume/export.ts
src/actions/resume/duplicate.ts
src/actions/resume/delete.ts
```

---

## 18) Nice‑to‑Have (Post‑MVP)

- Import from **LinkedIn PDF** or **JSON Resume** format.
- Share public link (redacted contact info).
- Section reordering and custom sections.
- Version history and compare diff.
- Cover Letter generator (re-use details).

---

**End of Requirements** — Ready for Codex to implement pages, DB tables, server actions, and UI.

# ðŸ§¾ Job Description Analyzer â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/job-analyzer`  
**Category:** Career and Professional  
**Stack:** Astro + Tailwind (islands where needed), Astro SSR API routes, Astro DB / Supabase  
**Goal:** Help users **analyze job descriptions (JDs)**, extract **skills/requirements**, and produce a **match report** against a resume/profile with **gap analysis**, **ATS-friendly keywords**, and **tailored suggestions** for Resume Builder, Cover Letter Writer, and Career Planner.

---

## 1) Objectives and Nonâ€‘Goals

### Objectives
- Upload/paste **Job Description** (text, PDF, URL) and normalize it.
- Extract **required skills**, **nice-to-haves**, **responsibilities**, **tools**, **soft skills**, **certs**, **education**, and **clearance/location** constraints.
- **Match** a JD with either a **resume** (file/text) or the userâ€™s **Ansiversa profile**.
- Compute a **Match Score** with transparent breakdowns (skills coverage, seniority, domain fit, location/legal fit).
- Generate **actionable suggestions**: resume bullet improvements, missing keywords, cover letter focus points, learning resources for gaps.
- Export a **Match Report** (PDF/MD/JSON); save for later; share readâ€‘only link (optional).
- Integrations: **Resume Builder**, **Career Planner**, **Portfolio Creator**.

### Nonâ€‘Goals (v1)
- No automated job application submission or scraping behind logins.
- No salary prediction beyond static hints/heuristics.
- No multiâ€‘user collaboration/comments (Phase 2).

---

## 2) User Stories (Acceptance Criteria)

1. **Analyze JD**
   - *As a user*, I paste/upload a JD and get extracted sections and skills.
   - **AC:** `/job-analyzer/api/analyze` returns normalized JD JSON and categorized skills.

2. **Compare to Resume**
   - *As a user*, I upload my resume or pick from my Resume Builder drafts.
   - **AC:** `/job-analyzer/api/compare-resume` returns a Match Score (0â€“100) with section-by-section breakdown and missing keywords.

3. **Keyword Suggestions**
   - *As a user*, I get a prioritized keyword list (ATS-friendly) with usage suggestions.
   - **AC:** `/job-analyzer/api/keywords` returns required and optional keywords with frequency targets and context phrases.

4. **Tailored Resume Bullets**
   - *As a user*, I receive 3â€“6 suggested resume bullets aligned to the JD.
   - **AC:** `/job-analyzer/api/resume-bullets` returns STAR-style bullets with quantified impact placeholders.

5. **Learning Plan for Gaps**
   - *As a user*, I see recommended resources for the top gaps.
   - **AC:** `/job-analyzer/api/gap-plan` returns modules/resources and estimated study time, ready to push to Career Planner.

6. **Export and Share**
   - *As a user*, I export a Match Report (PDF/MD/JSON) and optionally publish a readâ€‘only link.
   - **AC:** `/job-analyzer/api/export` and `/job-analyzer/api/publish` produce a permalink (watermark on Free).

7. **Plan Gating**
   - Free: 10 analyses/month, 1 saved report, watermark exports.
   - Pro: 200 analyses/month, unlimited saved reports, no watermark, advanced compare (multi-resume A/B).

---

## 3) Routes and Information Architecture

- `/job-analyzer` â€” Landing + quick analyze form (paste JD, upload PDF, or URL).
- `/job-analyzer/upload` â€” Full workflow (JD â†’ Resume/Profile â†’ Results).
- `/job-analyzer/result/[id].astro` â€” Detailed match report view (saved).
- `/job-analyzer/templates` â€” JD templates and role presets.
- `/job-analyzer/history` â€” Past analyses (Pro).

**API (SSR):**
- `POST /job-analyzer/api/analyze` (JD ingest + parse/extract)
- `POST /job-analyzer/api/compare-resume` (JD vs Resume/Profile; compute score)
- `POST /job-analyzer/api/keywords` (ATS keywords and phrasing suggestions)
- `POST /job-analyzer/api/resume-bullets` (tailored bullet generator)
- `POST /job-analyzer/api/gap-plan` (learning plan for gaps)
- `POST /job-analyzer/api/save` (persist report)
- `POST /job-analyzer/api/export` (pdf|md|json)
- `POST /job-analyzer/api/publish` (share link)
- `POST /job-analyzer/api/delete`
- `POST /job-analyzer/api/duplicate`

---

## 4) Data Model (Astro DB / SQL)

**User**
- `id` (pk), `email`, `plan`, `timezone`, `createdAt`

**JobDescription**
- `id` (pk uuid), `userId` (fk), `title`, `company`, `location`, `seniority` ('intern'|'junior'|'mid'|'senior'|'lead'|'manager'),  
  `type` ('ft'|'pt'|'contract'|'intern'), `remote` (bool|null), `rawText` (longtext), `sourceUrl` (nullable),  
  `normalized` (json: sections: summary, responsibilities, requirements, benefits),  
  `skills` (json: {required:[], niceToHave:[], tools:[], soft:[], certs:[], edu:[]}),  
  `constraints` (json: {visa:[], clearance:[], shift:[], travel:[], onsitePercent: number|null}),  
  `createdAt`

**Resume**
- `id` (pk uuid), `userId` (fk), `source` ('upload'|'resume_builder'), `title`, `rawText` (longtext), `structured` (json), `createdAt`

**MatchReport**
- `id` (pk uuid), `userId` (fk), `jdId` (fk), `resumeId` (fk|null), `profileUsed` (bool),  
  `scoreTotal` (number), `scoreBreakdown` (json), `coverage` (json: matched/missing skills),  
  `keywordSuggestions` (json), `bullets` (json), `gapPlan` (json),  
  `notes` (text|null), `published` (bool), `publishedSlug` (nullable), `createdAt`

**KeywordSet** (optional cache)
- `id` (pk), `role`, `industry`, `items` (json), `createdAt`

---

## 5) Normalization and Extraction (NLP Pipeline)

1. **Ingestors:**
   - Text area, PDF upload (text extraction), URL fetch (readability extraction).
2. **Cleanup:**
   - Remove headers/footers, normalize bullets, dedupe whitespace, sentence split.
3. **Sectioner:**
   - Heuristic + AI prompts to detect **Summary**, **Responsibilities**, **Requirements**, **Benefits**, **Company** blurb.
4. **Skill Extraction:**
   - Dictionaries + AI to tag: **hard skills** (React, SQL), **tools** (Figma, Jira), **soft skills**, **domains** (FinTech), **certs** (AWS), **edu** (BSc).
5. **Constraint Extraction:**
   - Location, visa/clearance mentions, shift/on-call, travel %, languages.
6. **Seniority Estimation:**
   - Heuristics (years + phrases) + AI check.
7. **Normalization Output:**
   - Canonical JSON saved to `JobDescription.normalized` + `skills` + `constraints`.

---

## 6) Match Score (Transparent)

**Score =** 60% Skills Coverage + 15% Seniority Fit + 10% Domain/Industry Fit + 10% Responsibility Alignment + 5% Location/Legal Fit

- **Skills Coverage (60%)**: required (weighted 2Ã—), nice-to-have (1Ã—); partial matches allowed via synonyms.
- **Seniority (15%)**: compare JD level vs resume experience; penalty for large gaps.
- **Domain Fit (10%)**: match of industry keywords and project domains.
- **Responsibilities (10%)**: verbs and scope overlap (own/lead/manage/architect).
- **Location/Legal (5%)**: remote eligibility, visa, clearance; hard-fail flag if impossible.

Return full **breakdown** + color-coded gauges. Provide toggles to change weights (Pro).

---

## 7) UI / Pages

### `/job-analyzer` (Quick Start)
- Inputs: JD text/PDF/URL.
- Output preview: title/company detection, extracted skills, quick **Match Score** if a resume is selected.
- CTA: **View Full Report** â†’ save.

### `/job-analyzer/upload` (Full Flow)
- **Step 1 JD**: paste/upload/fetch; show parsed sections with editable chips.
- **Step 2 Resume/Profile**: upload resume or pick from Resume Builder; profile autofill.
- **Step 3 Results**: Match Score gauges, matched vs missing skills, keyword list, resume bullets, gap plan.
- Actions: **Send to Resume Builder**, **Add to Career Planner**, **Export**, **Save**.

### `/job-analyzer/result/[id]`
- Saved report view with tabs: **Overview**, **Skills**, **Keywords**, **Bullets**, **Gaps**, **JSON**.
- Buttons: **Export**, **Duplicate**, **Publish** (read-only share).

### `/job-analyzer/templates`
- Role presets (Frontend, Data Analyst, PM, DevOps, UI/UX, QA).

### `/job-analyzer/history` (Pro)
- List of past analyses with filters (role/company/date).

---

## 8) API Contracts (examples)

### `POST /job-analyzer/api/analyze`
Req: `{ "jd": { "text":"...", "pdf":"<file|null>", "url":"<string|null>" } }`  
Res: `{ "title":"Senior Frontend Engineer", "company":"Acme", "normalized": {...}, "skills": {...}, "constraints": {...}, "seniority":"senior" }`

### `POST /job-analyzer/api/compare-resume`
Req: `{ "jdId":"<uuid>", "resume": { "text":"..."} | { "resumeId":"<uuid>" }, "profile": { "skills":[...], "years": ... } }`  
Res: `{ "scoreTotal": 74, "scoreBreakdown": {...}, "coverage": {"matched":[...], "missing":[...]}, "domainFit":["ecommerce"], "responsibilityFit":["lead","mentor"] }`

### `POST /job-analyzer/api/keywords`
Req: `{ "jdId":"<uuid>" }`  
Res: `{ "required":[{"term":"React","freq":2}], "optional":[{"term":"GraphQL","freq":1}], "phrases":["state management","unit testing"] }`

### `POST /job-analyzer/api/resume-bullets`
Req: `{ "jdId":"<uuid>", "resumeId":"<uuid|null>", "profile":{...} }`  
Res: `{ "bullets":[ "Led X...", "Cut latency by 35%..." ] }`

### `POST /job-analyzer/api/gap-plan`
Req: `{ "missing":["GraphQL","Cypress"], "targetRole":"frontend_engineer" }`  
Res: `{ "plan": { "modules":[{"title":"GraphQL Basics","hours":8},{"title":"Cypress Testing","hours":6}] } }`

### `POST /job-analyzer/api/save`
Req: `{ "report": {...} }` â†’ Res: `{ "id":"<uuid>" }`

### `POST /job-analyzer/api/export`
Req: `{ "id":"<uuid>", "format":"pdf|md|json" }` â†’ Res: `{ "url": "/exports/JD_Report_<slug>.pdf" }`

### `POST /job-analyzer/api/publish`
Req: `{ "id":"<uuid>" }` â†’ Res: `{ "url": "/job-analyzer/result/<slug>" }`

---

## 9) Validation Rules

- JD text length 200â€“50,000 chars.
- Supported uploads: PDF â‰¤ 5 MB; text/markdown.
- Resume length 200â€“30,000 chars.
- Role/seniority must be one of allowed enums.
- Keyword suggestions: dedupe; avoid overâ€‘stuffing (max 10 per section).

---

## 10) Exports

- **PDF**: Overview + breakdown + skills tables + keyword list + bullets + gap plan.
- **Markdown**: same sections in clean text for editing.
- **JSON**: machineâ€‘readable, includes normalized JD + results.

---

## 11) Integrations

- **Resume Builder**: push bullets and keyword hints to a selected resume draft.
- **Career Planner**: push gap plan as learning modules and weekly tasks.
- **Portfolio Creator**: suggest a project brief for a major skill gap.

---

## 12) Plans and Rate Limits

| Feature | Free | Pro |
|--------|------|-----|
| Analyses / month | 10 | 200 |
| Saved Reports | 1 | Unlimited |
| Exports | PDF/MD (watermark) | PDF/MD/JSON (no watermark) |
| Compare Modes | Single resume | Multi-resume A/B, custom weights |
| Share page | Watermark | No watermark |

Rate-limit keys: `userId` + day for analyze/compare; `userId` + month for exports.

---

## 13) Security and Privacy

- All uploads private by default; share is optâ€‘in.
- Strip PII from public share view (emails, phone, address) by default.
- Sanitize markdown and escape HTML in all text fields.
- Optional â€œephemeral AIâ€ processing (do not retain prompts/inputs).

---

## 14) Accessibility and UX

- Clear focus states; keyboard shortcuts (Analyze = Cmd/Ctrl+Enter; Export = Cmd/Ctrl+E).
- Colorâ€‘blind safe gauges; tables with proper headers; RTL support for Arabic.
- Large text-friendly view and printâ€‘friendly CSS for PDF.

---

## 15) Suggested File Layout

```
src/pages/job-analyzer/index.astro
src/pages/job-analyzer/upload.astro
src/pages/job-analyzer/templates.astro
src/pages/job-analyzer/history.astro
src/pages/job-analyzer/result/[id].astro

src/pages/job-analyzer/api/analyze.ts
src/pages/job-analyzer/api/compare-resume.ts
src/pages/job-analyzer/api/keywords.ts
src/pages/job-analyzer/api/resume-bullets.ts
src/pages/job-analyzer/api/gap-plan.ts
src/pages/job-analyzer/api/save.ts
src/pages/job-analyzer/api/export.ts
src/pages/job-analyzer/api/publish.ts
src/pages/job-analyzer/api/delete.ts
src/pages/job-analyzer/api/duplicate.ts

src/components/job-analyzer/Uploader/*.astro
src/components/job-analyzer/Report/*.astro
src/components/job-analyzer/Skills/*.astro
src/components/job-analyzer/Keywords/*.astro
```

---

## 16) Future Enhancements (v2+)

- Multiâ€‘JD comparison (compare multiple postings to find common skills).
- Realâ€‘world phrasing miner (ingest public postings for upâ€‘toâ€‘date keywords).
- ATS simulator (heuristic preview of common ATS checks).
- Interview question generator based on JD and resume diff.
- Salary/location map using public datasets.
- Team mode for coaches/recruiters.

---

**End of Requirements â€” ready for Codex implementation.**
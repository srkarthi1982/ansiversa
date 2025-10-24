# ðŸŽ¯ Career Planner â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/career`  
**Category:** Career & Professional  
**Stack:** Astro + Tailwind (islands where needed), Astro SSR API routes, Astro DB / Supabase, optional skills/occupations taxonomy seed  
**Goal:** Help users **assess skills, choose target roles, and build an actionable plan** (skills gap, learning path, portfolio items, applications, and milestones) with AI assistance and integrations to other Ansiversa apps (Resume, Portfolio, Interview Coach, Proposal Writer).

---

## 1) Objectives & Nonâ€‘Goals

### Objectives
- Collect a **profile** (current role, skills, experience, interests, constraints like location/remote).  
- Suggest **target roles/paths** with salary ranges and demand indicators (as static seeded hints in v1).  
- Compute **skills gap** vs chosen target role; propose a **learning plan** with resources & milestones.  
- Create a **90â€‘day career sprint plan**: weekly tasks, checkpoints, portfolio projects, and jobâ€‘search cadence.  
- Generate **resume bullets** and **portfolio project briefs** tied to target role.  
- Track **applications**, **interviews**, and **offers**; calendar reminders (v2).  
- Export to **PDF/DOCX/Markdown**; publish optional share link (private by default).

### Nonâ€‘Goals (v1)
- No live job scraping or ATS integration (Phase 2).  
- No salary negotiation advisory beyond generic guidance.  
- No personal financial planning (separate app).

---

## 2) User Stories (Acceptance Criteria)

1. **Create Career Plan**
   - *As a user*, I start a plan from my profile or resume import.  
   - **AC:** Draft created; redirect to `/career/builder?id=<uuid>`.

2. **Profile & Assessment**
   - *As a user*, I add current role, years of experience, skills (tags + levels), industries, constraints (location/remote).  
   - **AC:** `/career/api/assess` summarises strengths and suggested paths; creates baseline skills map.

3. **Target Roles**
   - *As a user*, I browse suggested roles (e.g., Frontend Engineer, Data Analyst, PM) with typical skills & sample JDs.  
   - **AC:** Selecting a target populates **required skills** and **example responsibilities**.

4. **Skills Gap & Learning Plan**
   - *As a user*, I view a gap matrix (current vs required) and generate a **learning plan** with resources (courses, docs, practice tasks).  
   - **AC:** `/career/api/plan/learning` returns modules with duration estimates and checkpoints.

5. **Projects & Portfolio**
   - *As a user*, I generate **project briefs** (scope, deliverables, acceptance criteria) and link to **Portfolio Creator**.  
   - **AC:** `/career/api/projects` returns 2â€“4 scoped projects aligned to target skills.

6. **Resume Bullets**
   - *As a user*, I generate roleâ€‘targeted **resume bullets** and link to **Resume Builder**.  
   - **AC:** `/career/api/resume-bullets` returns STARâ€‘style achievements using user context.

7. **Job Search Tracker**
   - *As a user*, I track applications, status (applied/interviewed/offered/rejected), and notes.  
   - **AC:** `/career/api/applications` supports CRUD; stats show weekly progress.

8. **90â€‘Day Sprint Plan**
   - *As a user*, I see a weekly calendar of tasks (learning, projects, networking, applications).  
   - **AC:** `/career/api/plan/sprint` returns a 13â€‘week schedule with milestones.

9. **Export & Share**
   - *As a user*, I export my plan to PDF/DOCX/Markdown and optionally publish a readâ€‘only share page.  
   - **AC:** `/career/view/<slug>` hides private notes by default.

10. **Plan Gating**
    - Free: 1 career plan, limited AI calls, watermark export.  
    - Pro: unlimited plans, full AI, no watermark, CSV exports for applications.

---

## 3) Routes & Information Architecture

- `/career` â€” Dashboard (plans list + trackers)  
- `/career/builder` â€” Main wizard/editor (Profile â†’ Targets â†’ Gaps â†’ Plan â†’ Projects â†’ Job Search)  
- `/career/roles` â€” Role explorer (seeded role cards)  
- `/career/tracker` â€” Application tracker table  
- `/career/view/[slug].astro` â€” Public readâ€‘only plan view

**API (SSR):**  
- `POST /career/api/create`  
- `POST /career/api/save` (patch; autosave)  
- `POST /career/api/import-resume` (parse text/pdf â†’ skills map; basic)  
- `POST /career/api/assess` (summarize strengths/paths from profile)  
- `POST /career/api/plan/learning`  
- `POST /career/api/plan/sprint`  
- `POST /career/api/projects`  
- `POST /career/api/resume-bullets`  
- `POST /career/api/applications` (create/update/delete)  
- `POST /career/api/export` (pdf/docx/md/csv)  
- `POST /career/api/publish`  
- `POST /career/api/delete`  
- `POST /career/api/duplicate`  
- `GET  /career/api/roles` (seed list)

---

## 4) Database Model (Astro DB / SQL)

**User**  
- `id` (pk), `email` (unique), `plan`, `location`, `timezone`, `createdAt`

**CareerPlan**  
- `id` (pk uuid), `userId` (fk), `title`, `slug` (unique per user), `status` ('draft'|'published'),  
  `profile` (json), `targets` (json), `skillsCurrent` (json), `skillsRequired` (json),  
  `gapMatrix` (json), `learningPlan` (json), `sprintPlan` (json), `projects` (json),  
  `resumeBullets` (json), `notes` (text), `lastSavedAt`, `publishedAt`, `createdAt`

**Application**  
- `id` (pk), `planId` (fk), `company`, `role`, `source`, `link`,  
  `status` ('wishlist'|'applied'|'interview'|'offer'|'rejected'),  
  `appliedOn` (date|null), `nextStepOn` (date|null), `notes` (text), `createdAt`

**Role** (seed)  
- `id` (pk), `title`, `category`, `skills` (json), `sampleJD` (text), `medianRange` (json), `demandLevel` ('low'|'med'|'high')

**Resource** (optional)  
- `id` (pk), `title`, `url`, `type` ('course'|'doc'|'video'|'book'|'practice'), `durationHrs` (float), `tags` (json)

### JSON Examples

**CareerPlan.profile**  
```json
{
  "currentRole": "Support Engineer",
  "experienceYears": 5,
  "industries": ["SaaS"],
  "education": "B.Tech",
  "interests": ["frontend", "data"],
  "constraints": {"location": "Dubai", "remote": true, "hoursPerWeek": 8}
}
```

**CareerPlan.skillsCurrent**  
```json
{
  "javascript": 3,
  "html_css": 4,
  "sql": 2,
  "customer_success": 5
}
```

**CareerPlan.targets**  
```json
[
  {"roleId":"frontend_engineer","priority":1},
  {"roleId":"product_manager","priority":2}
]
```

**CareerPlan.skillsRequired** (for `frontend_engineer`)  
```json
{
  "javascript": 4,
  "react": 3,
  "typescript": 3,
  "testing": 3,
  "git": 3,
  "system_design": 2
}
```

**CareerPlan.gapMatrix**  
```json
[
  {"skill": "react", "current": 0, "target": 3, "priority": "high"},
  {"skill": "typescript", "current": 1, "target": 3, "priority": "high"},
  {"skill": "testing", "current": 2, "target": 3, "priority": "med"}
]
```

**CareerPlan.learningPlan**  
```json
{
  "modules": [
    {"title":"React Foundations","hours":12,"resources":["res_react_docs","res_scrimba_react"],"checkpoint":"Build a todo app with tests"},
    {"title":"TypeScript for React","hours":10,"resources":["res_ts_handbook"],"checkpoint":"Convert app to TS"}
  ]
}
```

**CareerPlan.sprintPlan**  
```json
{
  "weeks": [
    {"week": 1, "focus": "React basics", "tasks": ["Module 1","Start portfolio project"], "milestone": "Todo app v1"},
    {"week": 2, "focus": "TypeScript", "tasks": ["Module 2","Refactor to TS"], "milestone": "TS conversion"}
  ]
}
```

**CareerPlan.projects**  
```json
[
  {"title":"Job Tracker App","skills":["react","testing","crud"],"brief":"Create a job applications tracker with filters and stats.","acceptance":["CRUD works","Unit tests 70%+","Deployed link"]}
]
```

**CareerPlan.resumeBullets**  
```json
[
  "Built a React job-tracker app used by 50+ peers; improved application throughput by 30%.",
  "Automated test suite with 45 unit tests; reduced regressions 20%."
]
```

---

## 5) UI / Pages

### `/career` (Dashboard)
- Cards: Plans (progress), This Weekâ€™s Tasks, Applications summary.  
- Actions: **New Plan**, **Open Tracker**, **Explore Roles**.

### `/career/builder` (Wizard/Editor)
- Steps across top: **Profile â†’ Targets â†’ Gaps â†’ Learning â†’ Projects â†’ Sprint â†’ Tracker â†’ Review**.  
- Left: section form; Right: live preview with progress and AI suggestions.  
- Toolbar: Generate (assess/learning/projects/bullets), Export, Publish; autosave indicator.

### `/career/roles`
- Role cards with skills list, sample JD, median range (static), demand chip.  
- â€œChoose Roleâ€ adds to Targets.

### `/career/tracker`
- Table with filters (status/date/company) + quick status updates; CSV export (Pro).

### `/career/view/[slug]`
- Readâ€‘only public plan: profile summary, target roles, gap matrix, learning modules, 90â€‘day schedule, portfolio briefs.  
- Privacy toggle to hide sensitive notes.

---

## 6) API Contracts

### `POST /career/api/create`
Req: `{ "title": "Frontend Engineer Transition" }`  
Res: `{ "id":"<uuid>", "slug":"frontend-engineer-transition" }`

### `POST /career/api/save`
Req: `{ "id":"<uuid>", "patch": { "path":"profile.interests", "value":["frontend","data"] } }`  
Res: `{ "ok": true, "lastSavedAt":"<ISO>" }`

### `POST /career/api/import-resume`
Req: multipart or `{ "text":"...resume..." }`  
Res: `{ "skillsCurrent": { "javascript": 3, "sql": 2, ... }, "highlights": ["..."] }`

### `POST /career/api/assess`
Req: `{ "profile": {...} }`  
Res: `{ "summary":"...", "suggestedRoles":[{"roleId":"frontend_engineer"}, {"roleId":"data_analyst"}] }`

### `POST /career/api/plan/learning`
Req: `{ "skillsCurrent": {...}, "skillsRequired": {...}, "hoursPerWeek": 8 }`  
Res: `{ "learningPlan": {...}, "etaWeeks": 12 }`

### `POST /career/api/plan/sprint`
Req: `{ "learningPlan": {...}, "jobsPerWeek": 10, "networkingPerWeek": 2 }`  
Res: `{ "sprintPlan": {...} }`

### `POST /career/api/projects`
Req: `{ "targetRole":"frontend_engineer", "level":"junior|mid|senior" }`  
Res: `{ "projects":[...briefs...] }`

### `POST /career/api/resume-bullets`
Req: `{ "profile": {...}, "projects":[...], "targetRole":"..." }`  
Res: `{ "bullets":[ "...", "..." ] }`

### `POST /career/api/applications`
Req: `{ "op":"create|update|delete", "item":{...} }`  
Res: `{ "ok": true, "item":{...} }`

### `POST /career/api/export`
Req: `{ "id":"<uuid>", "format":"pdf|docx|md|csv" }`  
Res: `{ "url": "/exports/CareerPlan_Frontend_2025-10-23.pdf" }`

### `POST /career/api/publish`
Req: `{ "id":"<uuid>" }`  
Res: `{ "url": "/career/view/frontend-engineer-transition" }`

### `POST /career/api/delete`
Req: `{ "id":"<uuid>" }` â†’ `{ "ok": true }`  
### `POST /career/api/duplicate`
Req: `{ "id":"<uuid>" }` â†’ `{ "id":"<newUuid>" }`  
### `GET /career/api/roles`
Res: `{ "items":[{"id":"frontend_engineer", "title":"Frontend Engineer", "skills":["javascript","react","typescript","testing","git"]}, ...] }`

---

## 7) Validation Rules

- Title 3â€“120 chars; slug unique per user.  
- Skill levels 0â€“5; required skills must include at least 5 for a role.  
- Learning module hours 0.5â€“40; total ETA â‰¤ 52 weeks (warn).  
- Applications status must be valid enum; URLs must be https or mailto.  
- Exports sanitize text; no scripts/HTML injection.

---

## 8) Exports

- **PDF/DOCX**: plan summary, gap matrix, learning modules, sprint schedule, projects, resume bullets.  
- **Markdown**: clean outline for sharing.  
- **CSV**: applications tracker (Pro).

---

## 9) Plans & Rate Limits

| Feature | Free | Pro |
|--------|------|-----|
| Career Plans | 1 | Unlimited |
| AI Calls/day | 20 | 200 |
| Exports | PDF/MD (watermark) | PDF/DOCX/MD/CSV (no watermark) |
| Publish | Yes | Yes |
| Tracker CSV | â€” | Yes |

Rate-limit keys: `userId` + day for AI; `userId` + month for exports.

---

## 10) Security & Privacy

- Plans are private by default; public only when published.  
- Redact emails/phone and company secrets from public view.  
- Optional **ephemeral** AI processing flag.  
- Store only necessary metrics; avoid raw prompt logs in production.

---

## 11) Analytics & Events

- `career.create`, `career.save`, `career.publish`, `career.export`, `career.delete`, `career.duplicate`,  
- `career.assess`, `career.learningPlan`, `career.sprintPlan`, `career.projects`, `career.resumeBullets`,  
- `career.app.create/update/delete`.

---

## 12) Accessibility & SEO

- Keyboardâ€‘accessible forms/tables; aria for stepper and drag handles.  
- Public view with SEO meta & OG; `noindex` for drafts.  
- RTL support (Arabic).

---

## 13) Suggested File Layout

```
src/pages/career/index.astro
src/pages/career/builder.astro
src/pages/career/roles.astro
src/pages/career/tracker.astro
src/pages/career/view/[slug].astro

src/pages/career/api/create.ts
src/pages/career/api/save.ts
src/pages/career/api/import-resume.ts
src/pages/career/api/assess.ts
src/pages/career/api/plan/learning.ts
src/pages/career/api/plan/sprint.ts
src/pages/career/api/projects.ts
src/pages/career/api/resume-bullets.ts
src/pages/career/api/applications.ts
src/pages/career/api/export.ts
src/pages/career/api/publish.ts
src/pages/career/api/delete.ts
src/pages/career/api/duplicate.ts
src/pages/career/api/roles.ts

src/components/career/Builder/*.astro or .tsx
src/components/career/GapMatrix/*.astro
src/components/career/Plans/*.astro
src/components/career/Tracker/*.astro
```

---

## 14) Future Enhancements (v2+)

- Live job search integrations and JD parsing.  
- Mentorship matching and mock interview scheduling.  
- Salary insights by location/level; leveling guides.  
- Calendar sync for weekly tasks and follow-ups.  
- Team mode for career coaching programs.

---

**End of Requirements â€” ready for Codex implementation.**
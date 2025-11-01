# ðŸ“š Lesson Builder â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/lesson`  
**Category:** Learning and Knowledge  
**Stack:** Astro + Tailwind (islands as needed), Astro SSR API routes, Astro DB / Supabase  
**Goal:** Let educators, creators, and teams **design, generate (AI), organize, and publish** lesson plans and microâ€‘courses (with outcomes, activities, resources, and quizzes) that integrate with **Quiz Institute**.

---

## 1) Objectives and Nonâ€‘Goals

### Objectives
- Create lessons and multiâ€‘lesson **modules** with clear **learning outcomes** and **success criteria**.  
- **AI Assist**: generate outlines, objectives, activities, sample scripts, and quiz questions.  
- Integrate with **/quiz** (Quiz Institute) to attach existing quizzes or autoâ€‘generate new ones.  
- Rich editor for **sections/blocks** (Warmâ€‘up, Explain, Explore, Practice, Assess, Wrapâ€‘up).  
- **Export** lesson plans to PDF/Docx/Markdown; publish readâ€‘only pages.  
- **Scheduling**: suggested durations, pacing guides; calendar export (ics).  
- **Localization**: RTL-friendly and translation helper.

### Nonâ€‘Goals (v1)
- No LMS gradebook sync (Phase 2).  
- No live classroom attendance or analytics (Phase 2).  
- No full SCORM/xAPI (Phase 2 export).

---

## 2) User Stories (Acceptance Criteria)

1. **Create Lesson**
   - *As a user*, I create a new lesson from blank or template.  
   - **AC:** Draft with `status='draft'`; redirect to `/lesson/editor?id=<uuid>`.

2. **AI Outline and Objectives**
   - *As a user*, I enter a topic, audience, and duration â†’ get **outline** and **SMART objectives**.  
   - **AC:** `/lesson/api/ai-outline` returns sections and measurable outcomes.

3. **Add Sections and Activities**
   - *As a user*, I add blocks (Warmâ€‘up, Teach, Practice, Assess) with materials, timing, and instructions.  
   - **AC:** Items are reorderable; total duration autoâ€‘sums; warnings if over/under plan.

4. **Attach or Generate Quiz**
   - *As a user*, I attach an existing quiz from `/quiz` or ask AI to generate MCQs.  
   - **AC:** `/lesson/api/quiz-link` links a quiz ID; `/lesson/api/ai-quiz` creates draft questions JSON.

5. **Resources and Handouts**
   - *As a user*, I attach files/links (slides, worksheets, videos).  
   - **AC:** Resources appear in preview and export; file metadata stored.

6. **Differentiation and Accessibility**
   - *As a user*, I add accommodations (ELL/SpEd), extension tasks, and accessibility notes.  
   - **AC:** Structured fields saved and shown in export.

7. **Publish and Export**
   - *As a user*, I publish a readâ€‘only page and export PDF/Docx/Markdown.  
   - **AC:** `/lesson/view/<slug>` is clean, printable; exports include timings and materials list.

8. **Modules and Sequencing**
   - *As a user*, I group lessons into a module and define prerequisites and pacing.  
   - **AC:** `/lesson/module` shows sequence and hours; can export a module overview.

9. **Plan Gating**
   - Free: up to 10 lessons, 2 modules, watermark on exports, limited AI.  
   - Pro: unlimited, no watermark, advanced AI and translation, calendar export, quiz autoâ€‘gen.

---

## 3) Routes and Information Architecture

- `/lesson` â€” Dashboard (lessons list + â€œNew Lessonâ€ + Modules tab)  
- `/lesson/editor` â€” Lesson editor (outline/sections/resources/assessment)  
- `/lesson/module` â€” Module overview and sequencing  
- `/lesson/templates` â€” Template gallery  
- `/lesson/view/[slug].astro` â€” Public readâ€‘only lesson view  
- `/lesson/module/[slug].astro` â€” Public readâ€‘only module view

**API (SSR):**  
- `POST /lesson/api/create`  
- `POST /lesson/api/save` (patch; autosave)  
- `POST /lesson/api/ai-outline` (topic â†’ outline + objectives)  
- `POST /lesson/api/ai-activities` (suggest activities with timing/materials)  
- `POST /lesson/api/ai-quiz` (generate MCQs/short answers)  
- `POST /lesson/api/quiz-link` (attach /quiz id)  
- `POST /lesson/api/export` (pdf/docx/md)  
- `POST /lesson/api/publish` (lesson)  
- `POST /lesson/api/publish-module` (module)  
- `POST /lesson/api/delete`  
- `POST /lesson/api/duplicate`  
- `GET  /lesson/api/templates`

---

## 4) Database Model (Astro DB / SQL)

**User**  
- `id` (pk), `email` (unique), `plan`, `displayName`, `timezone`, `createdAt`

**Lesson**  
- `id` (pk uuid), `userId` (fk), `title`, `slug` (unique per user), `status` ('draft'|'published'),  
  `subject` (string), `level` (enum: 'beginner'|'intermediate'|'advanced'|'mixed'), `durationMin` (int),  
  `objectives` (json), `outcomes` (json), `standards` (json),  
  `sections` (json), `resources` (json), `assessment` (json), `accommodations` (json),  
  `quizLink` (json|null), `notes` (text), `lastSavedAt` (datetime), `publishedAt` (datetime|null), `createdAt`

**Module**  
- `id` (pk uuid), `userId` (fk), `title`, `slug` (unique per user), `description` (text),  
  `sequence` (json: list of {lessonId, order, required}), `estimatedHours` (float),  
  `status` ('draft'|'published'), `createdAt`

**Media**  
- `id` (pk), `userId` (fk), `filePath`, `alt`, `type` ('pdf'|'image'|'video'|'link'), `createdAt`

**Link (Quiz)**  
- `quizId` (string), `source` ('quiz_institute'), `title`, `url`

### JSON Examples

**Lesson.objectives**  
```json
[
  {"text": "Define recursion with examples", "measure": "Exit ticket Q1"},
  {"text": "Trace simple recursive functions", "measure": "Quiz score >= 70%"}
]
```

**Lesson.sections**  
```json
[
  {"type":"warmup","title":"Recall Challenge","minutes":10,"instructions":"Pair shareâ€¦","materials":["sticky notes"]},
  {"type":"teach","title":"Concept Walkthrough","minutes":20,"instructions":"Explain with visualsâ€¦","materials":["slides"]},
  {"type":"practice","title":"Hands-on","minutes":25,"instructions":"Solve problems 1â€“5","materials":["worksheet.pdf"]},
  {"type":"assess","title":"Quick Quiz","minutes":10,"instructions":"Use attached quiz","materials":[]}
]
```

**Lesson.assessment**  
```json
{
  "methods": ["quiz","exit_ticket"],
  "rubric": [{"criterion":"Understanding","levels":["Emerging","Proficient","Advanced"]}],
  "aiQuiz": {"items":[{"type":"mcq","q":"...","a":["A","B","C","D"],"correct":1}]}
}
```

**Lesson.quizLink**  
```json
{ "quizId": "QUIZ-abc123", "source": "quiz_institute", "title": "Recursion Basics", "url": "/quiz/recursion-basics" }
```

**Module.sequence**  
```json
[
  {"lessonId":"<uuid1>","order":1,"required":true},
  {"lessonId":"<uuid2>","order":2,"required":true}
]
```

---

## 5) Editor UI / Pages

### `/lesson` (Dashboard)
- Tabs: **Lessons** and **Modules**.  
- Lessons table/cards: title, subject, duration, status, updatedAt; actions: **Open**, **Duplicate**, **Delete**, **Publish**, **Export**.  
- Modules list: title, lessons count, hours; actions: **Open**, **Publish**, **Export**.

### `/lesson/editor`
- **Left**: Outline and Sections (drag to reorder). Quick add: Warmâ€‘up, Teach, Practice, Assess, Wrapâ€‘up.  
- **Center**: Rich form for the selected block (title, minutes, instructions, materials).  
- **Right**: Objectives/Outcomes, Quiz, Resources, Accommodations, Standards.  
- Top bar: AI Outline, AI Activities, AI Quiz, Publish, Export (PDF/DOCX/MD). Autosave indicator.  
- Footer: **Total Duration** counter and warnings if plan over/under target.

### `/lesson/module`
- Builder: list of lessons with dragâ€‘order; set prerequisites; pacing (hours/week).  
- Export Module Overview (with links to each lesson).

### `/lesson/templates`
- Cards: STEM Lesson, Language Arts, Coding Workshop, Business Training, Soft Skills.  
- â€œUse Templateâ€ pre-fills sections and outcomes.

### `/lesson/view/[slug]`
- Public readâ€‘only lesson: clear typography, timing, materials list, objectives/outcomes, attached quiz link.  
- Download buttons (PDF/DOCX/MD).

### `/lesson/module/[slug]`
- Public readâ€‘only module overview with sequence and hours.

---

## 6) API Contracts

### `POST /lesson/api/create`
Req: `{ "title":"Intro to Recursion", "subject":"CS", "level":"beginner", "durationMin":60 }`  
Res: `{ "id":"<uuid>", "slug":"intro-to-recursion" }`

### `POST /lesson/api/save`
Req: `{ "id":"<uuid>", "patch": { "path":"sections[2].minutes", "value": 30 } }`  
Res: `{ "ok":true, "durationMin": 70, "lastSavedAt":"<ISO>" }`

### `POST /lesson/api/ai-outline`
Req: `{ "topic":"Recursion", "audience":"high-school", "durationMin":60 }`  
Res: `{ "outline":[...], "objectives":[...], "successCriteria":[...] }`

### `POST /lesson/api/ai-activities`
Req: `{ "outline":[...], "constraints":{"materials":["projector"],"group":"pairs"} }`  
Res: `{ "activities":[{"type":"warmup","minutes":10,"instructions":"..."}, ...] }`

### `POST /lesson/api/ai-quiz`
Req: `{ "topic":"Recursion", "count":5, "level":"beginner" }`  
Res: `{ "items":[{"type":"mcq","q":"...","a":["A","B","C","D"],"correct":1}] }`

### `POST /lesson/api/quiz-link`
Req: `{ "id":"<lessonId>", "quizId":"QUIZ-abc123" }`  
Res: `{ "ok":true }`

### `POST /lesson/api/export`
Req: `{ "id":"<uuid>", "format":"pdf|docx|md" }`  
Res: `{ "url": "/exports/Lesson_Intro_to_Recursion.pdf" }`

### `POST /lesson/api/publish`
Req: `{ "id":"<uuid>" }`  
Res: `{ "url": "/lesson/view/intro-to-recursion" }`

### `POST /lesson/api/publish-module`
Req: `{ "id":"<moduleId>" }`  
Res: `{ "url": "/lesson/module/recursion-series" }`

### `POST /lesson/api/delete`
Req: `{ "id":"<uuid>" }` â†’ Res: `{ "ok": true }`

### `POST /lesson/api/duplicate`
Req: `{ "id":"<uuid>" }` â†’ Res: `{ "id":"<newUuid>" }`

### `GET /lesson/api/templates`
Res: `{ "items": ["stem","coding","soft-skills","business-training","language-arts"] }`

---

## 7) Validation Rules

- Title 3â€“120 chars; slug unique per user.  
- Duration range 10â€“240 minutes per lesson.  
- At least one **objective** and one **section** required to publish.  
- Total minutes must be within Â±20% of `durationMin` target (warning).  
- Materials list items â‰¤ 100 chars; max 50 items.  
- Quiz items: MCQ options 2â€“6; `correct` index in range.  
- Exports sanitize Markdown/HTML; no scripts.

---

## 8) Export and Rendering

- **PDF**: printable layout with timing table, objectives/outcomes, sections, materials, and attached quiz link.  
- **DOCX**: structured headings and tables (sections, timings, materials).  
- **Markdown**: clean text for wikis/Notion.  
- **ICS**: optional calendar event per lesson (title, duration).

---

## 9) Plans and Limits

| Feature | Free | Pro |
|--------|------|-----|
| Lessons | 10 | Unlimited |
| Modules | 2 | Unlimited |
| AI Calls/day | 20 | 200 |
| Exports | PDF/MD (watermark) | PDF/DOCX/MD (no watermark) |
| Publish | Yes | Yes |

Rate limit keys: `userId` + day for AI; perâ€‘month for create/publish quotas.

---

## 10) Security and Privacy

- Drafts private by default; publish makes readâ€‘only page public.  
- Sanitize/escape user input in exports and public views.  
- Optional â€œephemeralâ€ AI flag (do not retain inputs after generation).

---

## 11) Analytics and Events

- `lesson.create`, `lesson.save`, `lesson.publish`, `lesson.export`, `lesson.delete`, `lesson.duplicate`,  
  `lesson.aiOutline`, `lesson.aiActivities`, `lesson.aiQuiz`, `module.create`, `module.publish`.

---

## 12) Accessibility and SEO

- Keyboard navigable editor; aria for tabs/accordions and drag handles.  
- Public views with SEO meta, canonical URL, and OpenGraph.  
- RTL support for Arabic; printâ€‘friendly CSS.

---

## 13) Suggested File Layout

```
src/pages/lesson/index.astro
src/pages/lesson/editor.astro
src/pages/lesson/module.astro
src/pages/lesson/templates.astro
src/pages/lesson/view/[slug].astro
src/pages/lesson/module/[slug].astro

src/pages/lesson/api/create.ts
src/pages/lesson/api/save.ts
src/pages/lesson/api/ai-outline.ts
src/pages/lesson/api/ai-activities.ts
src/pages/lesson/api/ai-quiz.ts
src/pages/lesson/api/quiz-link.ts
src/pages/lesson/api/export.ts
src/pages/lesson/api/publish.ts
src/pages/lesson/api/publish-module.ts
src/pages/lesson/api/delete.ts
src/pages/lesson/api/duplicate.ts
src/pages/lesson/api/templates.ts

src/components/lesson/Editor/*.astro or .tsx
src/components/lesson/Sections/*.astro
src/components/lesson/Preview/*.astro
```

---

## 14) Future Enhancements (v2+)

- LMS integrations (Google Classroom, Canvas, Moodle).  
- Student view with interactive activities (slides, checks).  
- Standards mapping libraries (CBSE, NGSS, Common Core).  
- Slide deck export (PPTX/Google Slides).  
- Class analytics and feedback forms.

---

**End of Requirements â€” ready for Codex implementation.**
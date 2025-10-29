# ðŸ§ª Exam Simulator â€” Full Requirements (Ansiversa)

This document includes a **short summary** for Codex onboarding and the **full technical spec** to implement the mini app.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### Overview
**Exam Simulator** delivers authentic, timeâ€‘bound mock exams with sectioning, negative marking, shuffling, and postâ€‘exam analytics. It uses **Quiz Institute** question banks and mirrors popular formats (CBSE board, JEE/NEET presets, SATâ€‘style MCQ, custom exams). Tight integration with **Study Planner**, **FlashNote**, and **Course Tracker** closes the loop from practice â†’ review â†’ revision.

### Core Features
- **Exam builder**: sections, question counts, marks, negative marking, perâ€‘section timers.  
- **Test modes**: Full mock, Sectional, Custom mix, Practice (untimed), Adaptive (v2).  
- **Delivery**: randomized but seedâ€‘replayable paper, perâ€‘question or perâ€‘section navigation, flag & review, time warnings.  
- **Question types**: MCQ (single/multi), True/False, Numeric, Matching/Matrix (grid), Short text (autoâ€‘pattern).  
- **Result analytics**: score, accuracy, time per question/section, weak topics, difficulty curve, percentile estimate, normalized score.  
- **Review**: explanations, solution steps, compare to topper median, add to FlashNote, schedule fixes to Study Planner.  
- **Presets**: CBSE Classes 9â€“12, JEE Main/Adv (PCM), NEET (PCB), plus custom templates.  
- **Antiâ€‘cheat basics**: server clock, blocking keyboard shortcuts (client), focusâ€‘loss counter, answer lock rules.

### Key Pages
- `/exam` â€” Dashboard (recent, presets, start new)  
- `/exam/builder` â€” Create paper (sections/rules)  
- `/exam/start/[id]` â€” Instruction + config (shuffle, timer)  
- `/exam/test/[attemptId]` â€” Live exam player  
- `/exam/result/[attemptId]` â€” Score & analytics  
- `/exam/history` â€” Attempts & replays  
- `/exam/admin` â€” (internal) seed/curate papers

### Minimal Data Model
`Paper`, `Section`, `PaperQuestion`, `Attempt`, `Answer`, `Result`, `Preset`, `Explainer`

### Plan Gating
| Feature | Free | Pro |
|--------|------|-----|
| Presets | Limited | All presets |
| Attempts/day | 2 | Unlimited |
| Review | Basic | Full analytics + explanations |
| Custom paper | â€” | Builder enabled |
| Export | â€” | PDF/CSV |
| Integrations | View links | Oneâ€‘click FlashNote/Planner

Integrations: **Quiz Institute**, **FlashNote**, **Study Planner**, **Course Tracker**.

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives & Nonâ€‘Goals
**Objectives**
- Provide realistic exam experience with faithful timing, navigation, and scoring.  
- Offer strong postâ€‘exam diagnostics to guide study plans.  
- Work reliably on mobile and low bandwidth; preserve attempt state robustly.

**Nonâ€‘Goals (v1)**
- No remote proctoring or webcam monitoring.  
- No open subjective longâ€‘answer manual grading (v2 rubric tool).  
- No public userâ€‘generated question authoring (admin/curated only).

---

### 2) Information Architecture & Routes

**Pages**
- `/exam` â€” Dashboard: start recent/presets, resume saved, see stats.  
- `/exam/builder` â€” Paper builder with templates, section editor, validation.  
- `/exam/start/[paperId]` â€” Instructions, config (shuffle, perâ€‘section timer), start button.  
- `/exam/test/[attemptId]` â€” Player: question panel, section tabs, flag, palette, timer, submit.  
- `/exam/result/[attemptId]` â€” Summary + analysis + recommended actions.  
- `/exam/history` â€” Attempts table & filters.  
- `/exam/admin` â€” (internal) upload/curate questions, map topics/difficulty.

**API (SSR)**
- Papers & presets:  
  - `GET  /exam/api/paper?id=`  
  - `POST /exam/api/paper/create` Â· `POST /exam/api/paper/update`  
  - `GET  /exam/api/preset/list`  
- Delivery & attempts:  
  - `POST /exam/api/attempt/start`  
  - `GET  /exam/api/attempt?id=` (state sync)  
  - `POST /exam/api/answer/save` (autosave)  
  - `POST /exam/api/attempt/submit`  
  - `GET  /exam/api/result?id=`  
  - `GET  /exam/api/history`  
- Analytics & actions:  
  - `GET  /exam/api/analysis?attemptId=`  
  - `POST /exam/api/flashnote/add`  
  - `POST /exam/api/planner/schedule`  
  - `POST /exam/api/export` (pdf|csv)

WebSocket (optional): `/exam/ws` for timer ticks & lowâ€‘latency palette updates.

---

### 3) Paper Model & Scoring Rules

**Paper** attributes: title, board/class, subjects, total time, total marks, shuffle rules, seed, perâ€‘section settings (timer, negative marking, attempt switching rule).

**Section** attributes: subject/topic, question count, marks per correct, negative per wrong (may be fractional), difficulty mix (e.g., 30% easy / 50% medium / 20% hard).

**Question types supported**
- MCQ single / multi (checkbox); multipleâ€‘correct uses partial marking (configurable: â€œallâ€‘orâ€‘nothingâ€ or â€œ+1/âˆ’0.25 per optionâ€).  
- True/False.  
- Numeric (exact or tolerance Â±Îµ; integer or real).  
- Matching/Matrix (partial marking per correct pair).  
- Short text with pattern/keyword (autoâ€‘check simple cases).

**Scoring**  
- Aggregate perâ€‘question â†’ section â†’ paper; keep raw and normalized.  
- Negative marking applied per config; unattempted = 0.  
- Normalization option: `zâ€‘score` against cohort or preset historical stats; percentile estimate via empirical distribution (if available).

---

### 4) Data Model (Astro DB / SQL)

**Paper**  
- `id` (uuid pk), `title`, `board` ('cbse'|'intl'|null), `class` ('9'|'10'|'11'|'12'|null), `subjects` (json), `totalTimeMin` (int), `seed` (int), `shuffle` (bool), `createdBy` (fk userId), `createdAt`

**Section**  
- `id` (pk), `paperId` (fk), `title`, `subject`, `topicTags` (json), `questionCount` (int), `marksCorrect` (decimal), `marksWrong` (decimal), `timerMin` (int|null), `difficultyMix` (json)

**PaperQuestion**  
- `id` (pk), `paperId` (fk), `sectionId` (fk), `source` ('quiz_institute'), `sourceId` (string), `type` ('mcq'|'mcm'|'tf'|'num'|'matrix'|'short'), `meta` (json), `answerHash` (string)

**Attempt**  
- `id` (uuid pk), `paperId` (fk), `userId` (fk), `startedAt`, `submittedAt` (ts|null), `status` ('active'|'paused'|'submitted'|'expired'), `seed` (int), `clientEnv` (json), `focusLoss` (int default 0)

**Answer**  
- `id` (pk), `attemptId` (fk), `paperQuestionId` (fk), `response` (json), `isCorrect` (bool|null), `score` (decimal default 0), `timeSpentSec` (int), `flagged` (bool)

**Result**  
- `id` (pk), `attemptId` (fk), `scoreTotal` (decimal), `scoreNormalized` (decimal|null), `percentile` (decimal|null), `accuracy` (decimal), `timePerQ` (decimal), `weakTopics` (json), `recommendations` (json)

**Preset**  
- `id` (pk), `name`, `board`, `class`, `subjects` (json), `paperTemplate` (json)

**Explainer**  
- `id` (pk), `sourceId` (string), `contentMd` (text), `media` (json|null)

**Replay** (optional)  
- `id` (pk), `attemptId` (fk), `events` (json compressed)

Index common fields for fast filters: `board`, `class`, `subject`, `createdAt`.

---

### 5) Delivery & Player UX

**Instruction page**: total time, sections, marking scheme, allowed navigation, calculator policy; honor code checkbox.  
**Player UI**:
- Header: paper title, global timer (or section timer), submit; warnings at 10m/5m/1m.  
- Sidebar palette: question numbers with color states (unvisited, seen, answered, flagged).  
- Center: question stem + options/inputs; image/math rendering via KaTeX; zoom for images.  
- Footer: Prev/Next; Section tabs; â€œReview flaggedâ€ quick filter.  
- Autosave: every interaction and on interval (e.g., 15s).  
- Offline resilience: local draft state queued; server authoritative; reconnect within 60s continues.  
- Keyboard shortcuts: `1..9` options, `N` next, `P` prev, `F` flag, `S` submit.  
Accessibility: high contrast, screenâ€‘reader labels for options, large text mode, RTL.

**Navigation policy** (configurable per paper): free navigation; sectionâ€‘locked; oneâ€‘way only (no back).

---

### 6) Analytics & Review

- **Perâ€‘section**: score, accuracy, time spent vs target, difficulty breakdown.  
- **Topic mastery**: map to Course Tracker topics; chart weak areas.  
- **Question review**: show correct answer, explanation, solution steps; userâ€™s choice/time; add to **FlashNote**; â€œschedule practiceâ€ to **Study Planner**.  
- **Benchmarks**: compare against cohort medians (if same paper attempted by â‰¥50 users) and historical stats.  
- **Recommendations**: 3â€“5 next steps (topics, flashcards, quizzes).  
- **Exports**: PDF score report; CSV questionâ€‘level log (Pro).

---

### 7) Antiâ€‘Cheat & Integrity

- **Server clock** for timers; client manipulations ignored.  
- **Focusâ€‘loss counter**: +1 when tab loses focus (for information only in v1).  
- **Randomization** with seed for replay; option to rotate options order.  
- **Answer rate limits** and throttling on suspicious bursts.  
- **Screenshot/print detection** (bestâ€‘effort clientâ€‘side hints).  
- **Expired attempts** autoâ€‘submit remaining answers.  
- **Audit log** (admin): start/submit times, IP, focus events.

---

### 8) API Contracts (Examples)

**Start attempt**  
`POST /exam/api/attempt/start`  
```json
{ "paperId":"<uuid>", "config":{"shuffle":true} }
```
Res: `{ "attemptId":"<uuid>", "expiresAt":"2025-11-01T10:30:00Z" }`

**Save answer**  
`POST /exam/api/answer/save`  
```json
{ "attemptId":"<uuid>", "paperQuestionId":123, "response":{"choice":"B"}, "timeSpentSec":23, "flagged":false }
```
Res: `{ "ok":true }`

**Submit attempt**  
`POST /exam/api/attempt/submit`  
```json
{ "attemptId":"<uuid>" }
```
Res: `{ "resultId": "r_789" }`

**Get result + analysis**  
`GET /exam/api/analysis?attemptId=<uuid>`  
Res: `{ "score":141, "accuracy":0.72, "sections":[...], "weakTopics":["Optics","Thermo"], "recommendations":[...]} `

**Export report**  
`POST /exam/api/export`  
```json
{ "attemptId":"<uuid>", "format":"pdf" }
```
Res: `{ "url":"/exports/Exam_Report_<uuid>.pdf" }`

---

### 9) Validation Rules

- Paper total time 15â€“360 min; sections 1â€“6; questions per section 1â€“200.  
- MarksCorrect in [0.5, 10]; MarksWrong in [âˆ’5, 0]; numeric tolerance Îµ â‰¥ 0.  
- Attempt submission only within allowed time; late grace â‰¤ 60s.  
- Response schema must match question type; multiâ€‘correct must specify array of choices.  
- PDF/CSV exports size < 10 MB; throttled per user/day.

---

### 10) Plans & Limits

| Feature | Free | Pro |
|--------|------|-----|
| Attempts/day | 2 | Unlimited |
| Presets | Limited | All |
| Builder | â€” | Enabled |
| Review | Basic | Full explanations + CSV |
| Exports | â€” | PDF/CSV |
| Integrations | Links | Oneâ€‘click actions |
| History | 30 attempts | Unlimited |

Rate limits: `/attempt/start` 10/day (Free) 50/day (Pro); `/answer/save` 5 req/sec burst 20; `/export` 5/day.

---

### 11) Suggested File Layout

```
src/pages/exam/index.astro
src/pages/exam/builder.astro
src/pages/exam/start/[paperId].astro
src/pages/exam/test/[attemptId].astro
src/pages/exam/result/[attemptId].astro
src/pages/exam/history.astro
src/pages/exam/admin.astro

src/pages/exam/api/paper.ts
src/pages/exam/api/paper/create.ts
src/pages/exam/api/paper/update.ts
src/pages/exam/api/preset/list.ts
src/pages/exam/api/attempt/start.ts
src/pages/exam/api/attempt/index.ts
src/pages/exam/api/answer/save.ts
src/pages/exam/api/attempt/submit.ts
src/pages/exam/api/result.ts
src/pages/exam/api/analysis.ts
src/pages/exam/api/history.ts
src/pages/exam/api/flashnote/add.ts
src/pages/exam/api/planner/schedule.ts
src/pages/exam/api/export.ts

src/components/exam/Player/*.astro
src/components/exam/Result/*.astro
src/components/exam/Builder/*.astro
```

---

### 12) Future Enhancements (v2+)

- **Adaptive testing** (IRTâ€‘style difficulty adjustment).  
- **Subjective items** with rubric & AI assisted scoring.  
- **Proctoring** (photo ID, webcam, behavior analytics).  
- **Classroom mode** for teachers to schedule & monitor.  
- **Item statistics** (discrimination index, facility value).  
- **Question feedback** pipeline for item improvement.

---

**End of Requirements â€” Ready for Codex Implementation.**
# ðŸ“… Study Planner â€” Full Requirements (Ansiversa)

This document contains a **short summary** for Codex onboarding and the **full technical specification** to implement the mini app.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### Overview
**Study Planner** helps learners plan, schedule, and track study across subjects, boards (CBSE/Intl), and goals (exams, projects). It combines **timeâ€‘blocking**, **spaced repetition**, **Pomodoro**, **priority scoring**, and **progress analytics**â€”integrated with Quiz Institute, FlashNote, Homework Helper, and Course Tracker.

### Core Features
- Plan by **subjects â†’ topics â†’ tasks** with estimated durations and difficulty.  
- **Smart scheduler**: autoâ€‘allocates tasks to calendar using constraints (deadlines, availability, daily cap).  
- **Spaced repetition** for FlashNote decks (SMâ€‘2â€‘style).  
- **Pomodoro** timer with focus stats, breaks, and â€œresume laterâ€.  
- **Progress tracking**: time spent vs. planned, mastery by topic, streaks.  
- **Exam mode**: backâ€‘plan from exam date with syllabus coverage targets.  
- **Recommendations**: next best task based on urgency Ã— importance Ã— learning decay.  
- Export printable plan; optional ICS calendar export.

### Key Pages
- `/study` â€” Dashboard (today plan, next steps, timer)  
- `/study/plan` â€” Planner (subjects/topics, backlog, calendar)  
- `/study/tasks/[id]` â€” Task detail & history  
- `/study/revision` â€” Spaced repetition & reviews  
- `/study/analytics` â€” Reports (time, completion, mastery)  
- `/study/settings` â€” Availability, board, class, goals

### Minimal Data Model
`Subject`, `Topic`, `Task`, `Session`, `PlanSlot`, `Goal`, `Exam`, `DeckLink`, `Review`, `Streak`

### Plan Gating
| Feature | Free | Pro |
|--------|------|-----|
| Tasks | 200 | Unlimited |
| Autoâ€‘schedule | Basic | Advanced constraints |
| Pomodoro | Yes | Yes + CSV export |
| Spaced repetition | Decks â‰¤ 2 | Unlimited decks |
| Analytics | Basic | Detailed + CSV |
| Calendar export | â€” | ICS export |
| Integrations | View only | Full (FlashNote/Quiz/Helper) |

Integrations: **FlashNote** (reviews), **Quiz Institute** (practice links), **Homework Helper** (convert tasks), **Course Tracker** (syllabus import).

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives & Nonâ€‘Goals
**Objectives**
- Provide a reliable personal study operating system with scheduling, review cycles, and analytics.  
- Support CBSE Classes 9â€“12 and general/college tracks with simple board filters.  
- Encourage healthy habits (breaks, streaks, workload caps) and accessibility.

**Nonâ€‘Goals (v1)**
- No multiâ€‘user shared plans (teacher dashboards later).  
- No thirdâ€‘party calendar write access (use ICS export in v1).  
- No proctoring or exam delivery (handled by Exam Simulator).

---

### 2) Information Architecture & Routes

**Pages**
- `/study` â€” Today: agenda, â€œNext best taskâ€, Pomodoro, quick add.  
- `/study/plan` â€” Planner: subjects, topics, backlog, calendar (week/day).  
- `/study/tasks/[id]` â€” Task detail: checklists, resources, links to Quiz/FlashNote.  
- `/study/revision` â€” Spaced repetition; due reviews list and session.  
- `/study/analytics` â€” Time, completion, consistency, topic mastery.  
- `/study/settings` â€” Availability (weekday hours), board/class, goals, notifications, study caps.

**API (SSR)**
- Subjects/Topics:  
  - `POST /study/api/subject/create` Â· `GET /study/api/subject/list`  
  - `POST /study/api/topic/create` Â· `GET /study/api/topic/list`
- Tasks & Planning:  
  - `POST /study/api/task/create` Â· `POST /study/api/task/update` Â· `GET /study/api/task/list`  
  - `POST /study/api/schedule/plan` (autoâ€‘schedule) Â· `POST /study/api/slot/update` Â· `GET /study/api/agenda/today`
- Sessions & Timer:  
  - `POST /study/api/session/start` Â· `POST /study/api/session/pause` Â· `POST /study/api/session/finish`
- Revision (Spaced Repetition):  
  - `GET /study/api/review/due` Â· `POST /study/api/review/submit`  
  - `POST /study/api/deck/link` (connect FlashNote deck)
- Goals/Exams:  
  - `POST /study/api/goal/create` Â· `POST /study/api/exam/create` Â· `GET /study/api/goal/list`
- Analytics:  
  - `GET /study/api/analytics/overview` Â· `GET /study/api/analytics/time` Â· `GET /study/api/analytics/mastery`
- Export:  
  - `POST /study/api/export/ics` (Pro) Â· `POST /study/api/export/pdf`
- Settings:  
  - `POST /study/api/settings/save`

---

### 3) Scheduling Logic (Algorithm)

**Inputs**: backlog tasks `{duration, deadline, topic, difficulty, priority, requiresFocus?}`, availability blocks, daily cap, pacing (e.g., 2h/day).  

**Priority Score (0â€“100)**:  
`score = w1*urgency + w2*importance + w3*difficulty + w4*decay`  
- *Urgency*: inverse of daysâ€‘toâ€‘deadline (capped).  
- *Importance*: user weight (subject goal or exam weightage).  
- *Difficulty*: order earlier in day; add buffer (setup + wrap).  
- *Decay*: time since last session for the topic (spacedâ€‘repetition style).

**Autoâ€‘schedule** (greedy with constraints):  
1) Sort tasks by `score` desc.  
2) Fit into available blocks honoring: daily cap, preferred study windows, break rules (e.g., 25+5), focus requirement (avoid lateâ€‘night).  
3) Split long tasks into sessions (e.g., 50â€‘min chunks).  
4) Respect hard constraints: blackout dates, exam dates, locked slots.  
5) Produce `PlanSlot[]` with start/end; unplaced tasks remain in backlog with reasons (conflict messages).

---

### 4) Data Model (Astro DB / SQL)

**User**  
- `id`, `email`, `plan`, `timezone`, `board` ('cbse'|'intl'|null), `class` ('9'|'10'|'11'|'12'|null), `language`, `createdAt`

**Subject**  
- `id`, `userId`, `name`, `board`, `class`, `color`, `goalWeight` (0..1), `createdAt`

**Topic**  
- `id`, `subjectId`, `name`, `syllabusRef` (json|null), `difficulty` (1..5), `targetMastery` (0..1)

**Task**  
- `id`, `topicId`, `title`, `type` ('study'|'quiz'|'assignment'|'revision'), `estimateMin`, `priority` (1..5), `difficulty` (1..5), `deadline` (ts|null), `requiresFocus` (bool), `links` (json), `status` ('backlog'|'planned'|'done'|'skipped'), `notesMd`, `createdAt`

**PlanSlot**  
- `id`, `taskId`, `userId`, `startAt`, `endAt`, `locked` (bool), `source` ('auto'|'manual')

**Session**  
- `id`, `taskId`, `userId`, `slotId` (nullable), `startAt`, `endAt`, `actualMin`, `interruptions` (int), `pomodoros` (int), `mood` ('low'|'ok'|'high')

**Goal**  
- `id`, `userId`, `title`, `targetDate`, `targetHours` (int|null), `syllabusCoverage` (json)

**Exam**  
- `id`, `userId`, `name`, `date`, `board`, `class`, `subjects` (json), `weightage` (json)

**DeckLink** (FlashNote integration)  
- `id`, `userId`, `deckId`, `subjectId` (nullable), `topicId` (nullable)

**Review** (spaced repetition log)  
- `id`, `deckId`, `cardId`, `userId`, `reviewedAt`, `grade` (0..5), `interval` (days), `ease` (float), `dueAt`

**Streak**  
- `id`, `userId`, `day`, `minutes`, `pomodoros`

**Setting**  
- `id`, `userId`, `availability` (json of weekday hours), `dailyCapMin` (int), `pomodoroWork` (min), `pomodoroBreak` (min), `notifications` (json)

---

### 5) Pomodoro & Sessions

- Defaults: 25â€‘min work / 5â€‘min break; configurable.  
- Track focus time, interruptions, and mood; autoâ€‘append to current PlanSlot.  
- Session finish updates Task progress and Topic decay counter.  
- Export CSV (Pro): date, subject, topic, minutes, pomodoros, interruptions, mood.

---

### 6) Revision (Spaced Repetition)

- Link FlashNote decks; show **due reviews** count on `/study/revision`.  
- Review session flow: card â†’ grade 0â€“5 â†’ schedule next `dueAt` using SMâ€‘2 variant.  
- Topic decay: if no reviews/sessions recently, increase decay term in priority score.

---

### 7) UX / UI

- **Planner board**: left backlog (drag tasks), right calendar (week/day), color by subject.  
- **Task composer**: estimate, deadline, difficulty, requires focus, links (Quiz/Helper/Research).  
- **Today view**: â€œNext best taskâ€, agenda, timer widget, quick log.  
- **Analytics**: time vs plan, completion rate, mastery radar by subject/topic, streak heatmap.  
- **Conflicts**: show reasons when autoâ€‘schedule canâ€™t place tasks.  
- Accessibility: keyboard operations, highâ€‘contrast mode, dyslexia font, RTL support, reduced motion.

---

### 8) API Contracts (Examples)

**Autoâ€‘schedule**  
`POST /study/api/schedule/plan`  
```json
{
  "tasks":["t1","t2","t3"],
  "availability":[{"day":"Mon","start":"18:00","end":"21:00"}],
  "dailyCapMin":120,
  "startDate":"2025-11-01",
  "endDate":"2025-12-31"
}
```
Res: `{ "slots":[{"taskId":"t1","startAt":"2025-11-01T18:00","endAt":"2025-11-01T18:50"}], "unplaced":[{"taskId":"t3","reason":"No free time before deadline"}] }`

**Start session**  
`POST /study/api/session/start` â†’ `{ "sessionId":"<uuid>" }`

**Review due**  
`GET /study/api/review/due` â†’ `{ "count": 23, "cards":[...]} `

**Export ICS** (Pro)  
`POST /study/api/export/ics` â†’ `{ "url":"/exports/study_plan.ics" }`

---

### 9) Validation Rules

- Estimates 5â€“300 min; deadlines must be future timestamps.  
- Daily cap 30â€“600 min; Pomodoro 15â€“60/3â€“15 work/break.  
- Autoâ€‘schedule must not overlap locked `PlanSlot`s.  
- Review grades 0â€“5; interval clamp 1â€“365 days.  
- Subject/topic names 2â€“60 chars; profanity filter basic.

---

### 10) Plans & Limits

| Feature | Free | Pro |
|--------|------|-----|
| Tasks | 200 | Unlimited |
| Autoâ€‘schedule | Basic | Advanced constraints |
| ICS export | â€” | Yes |
| CSV export | â€” | Yes |
| Integrations | View only | Full |
| Analytics | Basic | Detailed + exports |

Rate limits: `/schedule/plan` 10/day (Free) 50/day (Pro); timer/session endpoints 5 req/min.

---

### 11) Suggested File Layout

```
src/pages/study/index.astro
src/pages/study/plan.astro
src/pages/study/tasks/[id].astro
src/pages/study/revision.astro
src/pages/study/analytics.astro
src/pages/study/settings.astro

src/pages/study/api/subject/create.ts
src/pages/study/api/subject/list.ts
src/pages/study/api/topic/create.ts
src/pages/study/api/topic/list.ts
src/pages/study/api/task/create.ts
src/pages/study/api/task/update.ts
src/pages/study/api/task/list.ts
src/pages/study/api/schedule/plan.ts
src/pages/study/api/slot/update.ts
src/pages/study/api/agenda/today.ts
src/pages/study/api/session/start.ts
src/pages/study/api/session/pause.ts
src/pages/study/api/session/finish.ts
src/pages/study/api/review/due.ts
src/pages/study/api/review/submit.ts
src/pages/study/api/deck/link.ts
src/pages/study/api/goal/create.ts
src/pages/study/api/exam/create.ts
src/pages/study/api/goal/list.ts
src/pages/study/api/analytics/overview.ts
src/pages/study/api/analytics/time.ts
src/pages/study/api/analytics/mastery.ts
src/pages/study/api/export/ics.ts
src/pages/study/api/export/pdf.ts
src/pages/study/api/settings/save.ts

src/components/study/Planner/*.astro
src/components/study/Timer/*.astro
src/components/study/Revision/*.astro
src/components/study/Analytics/*.astro
```

---

### 12) Future Enhancements (v2+)

- **Google/Apple Calendar twoâ€‘way sync** with conflict resolution.  
- **Goal templates** (JEE mains, NEET, CBSE board exams) with syllabus imports.  
- **AI task breakdown** from syllabus or textbook pages.  
- **Energy management** (suggest easier tasks when mood/energy low).  
- **Focus mode** website blocker integrations.  
- **Team/teacher plans** with shareable templates and live sessions.

---

**End of Requirements â€” Ready for Codex Implementation.**
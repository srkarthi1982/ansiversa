# ðŸŽ“ Course Tracker â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/course-tracker`  
**Category:** Learning and Knowledge  
**Stack:** Astro + Tailwind (islands where needed), Astro SSR API routes, Astro DB / Supabase  
**Goal:** Help users **track online courses, lessons, and progress** across platforms (Coursera, Udemy, YouTube, etc.), create **study plans**, log **notes and highlights**, and stay consistent with **reminders** and **streaks**. Integrates with **Lesson Builder**, **Quiz Institute**, and **Blog Writer** for deeper learning workflows.

---

## 1) Objectives and Non-Goals

### Objectives
- Save **courses** from any URL with metadata (title, provider, duration, difficulty).  
- Break courses into **modules/lessons**; mark progress, completion %, and time spent.  
- Create a **study plan** (weekly schedule + target end date); track **streaks** and **reminders**.  
- Inline **notes and highlights** per lesson; export notes.  
- **Quizzes**: attach Quiz Institute sets to lessons; quick self-check.  
- **Reflections** and **blog export**: turn notes into a blog draft (to Blog Writer).  
- **Dashboard**: What to study today, overdue items, weekly time chart.  
- Export to **CSV/Markdown/PDF**.

### Non-Goals (v1)
- No scraping of course contents behind authentication (user copies outline manually or via paste).  
- No calendar two-way sync (Phase 2 ICS export only).  
- No public course catalog (userâ€™s private tracker).

---

## 2) User Stories (Acceptance Criteria)

1. **Add a Course** â€” Paste URL or enter details manually â†’ creates course record.  
2. **Build Outline** â€” Add/edit modules and lessons; mark progress and completion.  
3. **Study Plan** â€” Auto-generate weekly study schedule based on target end date and hours/week.  
4. **Track Session** â€” Start/pause/stop timers; logs minutes and updates streaks.  
5. **Notes and Highlights** â€” Markdown notes per lesson; searchable and exportable.  
6. **Attach Quiz** â€” Link quizzes from Quiz Institute to lessons.  
7. **Reminders and Streaks** â€” Daily/weekly reminders; auto streak calculation.  
8. **Export and Blog Draft** â€” Export summaries or send to Blog Writer for reflection posts.  
9. **Complete / Archive** â€” Mark courses done or archived; preserve data.  
10. **Plan Gating** â€” Free plan limits; Pro unlocks all.

---

## 3) Routes and Pages

| Route | Description |
|-------|--------------|
| `/course-tracker` | Dashboard: active courses, todayâ€™s plan, progress |
| `/course-tracker/new` | Add course manually or via URL |
| `/course-tracker/[slug]` | Course overview: outline, notes, schedule |
| `/course-tracker/[slug]/lesson/[lessonId]` | Lesson view: notes, timer, quiz |
| `/course-tracker/settings` | Preferences (reminders, default hours) |

---

## 4) Database Model (Astro DB / SQL)

**User**  
- id, email, plan, timezone, createdAt  

**Course**  
- id (uuid), userId (fk), title, slug, url, provider, level, status, estimatedHours, progressPct  
- outline (json), plan (json), reminders (json), startedAt, completedAt, createdAt, lastSavedAt  

**Lesson**  
- id, courseId, moduleTitle, title, durationMin, resourceUrl, position, completed  

**StudySession**  
- id, courseId, lessonId, startedAt, endedAt, minutes  

**Note**  
- id, courseId, lessonId, title, bodyMd, createdAt, updatedAt  

**QuizLink**  
- id, courseId, lessonId, quizId, title, url  

---

## 5) API Endpoints

- `POST /course-tracker/api/create` â€” create a new course  
- `POST /course-tracker/api/save` â€” update course/outline  
- `POST /course-tracker/api/plan` â€” generate/update schedule  
- `POST /course-tracker/api/session/start`  
- `POST /course-tracker/api/session/stop`  
- `POST /course-tracker/api/notes` â€” manage notes  
- `POST /course-tracker/api/quiz-link` â€” attach quiz  
- `POST /course-tracker/api/reminders` â€” set reminders  
- `GET  /course-tracker/api/streak`  
- `POST /course-tracker/api/status` â€” mark completed/archived  
- `POST /course-tracker/api/export` â€” CSV/MD/PDF  
- `POST /course-tracker/api/blog-draft` â€” send reflections to Blog Writer  
- `POST /course-tracker/api/delete`  
- `POST /course-tracker/api/duplicate`

---

## 6) Integrations

- **Quiz Institute** â€” attach quizzes to lessons  
- **Lesson Builder** â€” import course outlines  
- **Blog Writer** â€” export notes into reflection posts  

---

## 7) Exports

| Format | Description |
|--------|-------------|
| Markdown | Notes grouped by lesson |
| CSV | Lessons, sessions, completion status |
| PDF | Dashboard + stats |
| ICS (Pro) | Study calendar |

---

## 8) Plans and Limits

| Feature | Free | Pro |
|----------|------|-----|
| Courses | 10 | Unlimited |
| Notes | 200 | Unlimited |
| Exports | CSV/MD (watermark) | PDF/ICS (no watermark) |
| AI Assists | 20/month | 300/month |

---

## 9) Security and Privacy

- User data private by default.  
- Sanitize all Markdown and block scripts.  
- Optional ephemeral AI for analysis/drafts.  

---

## 10) Future Enhancements (v2+)

- Browser extension for quick course capture.  
- Integration with Coursera/Udemy APIs.  
- Smart rescheduling after missed days.  
- Cohort study mode.  
- Pomodoro + ambient sound focus tools.

---

âœ… **End of Requirements â€” ready for Codex implementation.**
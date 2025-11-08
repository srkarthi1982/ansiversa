# ðŸŽ¤ Interview Coach â€” Full Requirements (Ansiversa)

This document includes a **Codex-friendly summary** and a **full technical specification** for implementation.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### Overview
**Interview Coach** is a practice environment for behavioral and technical interviews. It generates **roleâ€‘specific questions** from a **Job Description (JD)** or chosen preset (e.g., SDE, Data Analyst, Product Manager), runs **mock interviews** (text or voice), records responses, and delivers **structured feedback** using **rubrics** (STAR for behavioral, competency rubrics for technical). Tight integrations with **Resume Builder, Job Description Analyzer, Portfolio Creator, Presentation Designer, Study Planner**, and **Email Polisher**.

### Core Features
- **JDâ€‘aware** question generator: parse a pasted JD or URL â†’ extract skills/competencies â†’ build interview plan.  
- **Mock modes**:  
  - **Behavioral** (STAR coach with followâ€‘ups)  
  - **Technical Q and A** (concept, coding, system design â€” text only in v1)  
  - **Case/Scenario** (business/product cases with prompts)  
  - **Lightning Round** (quick 10â€‘question drill)  
  - **Voice interview** (Pro: TTS questions, record answers, auto transcript)
- **Feedback and scoring**: perâ€‘question rubric + overall summary; strengths, gaps, concrete rewrites, and **next practice plan**.  
- **Answer drafting**: generate draft **STAR** answers using resume highlights; user can rehearse and improve.  
- **Question banks**: curated banks by role/domain + companyâ€‘style packs.  
- **Reports and exports**: PDF summary; shareable link; CSV of Q/A with rubric scores.  
- **Calendar and reminders**: add prep plan to **Study Planner**; schedule sessions.  
- **Company research snapshot** (v2 web-powered; v1 manual notes field).

### Key Pages
- `/interview` â€” Dashboard + recent sessions + quick start  
- `/interview/setup` â€” Role/JD input, mode, difficulty, duration  
- `/interview/session/[id]` â€” Live mock interview UI  
- `/interview/review/[id]` â€” Feedback, scores, suggested rewrites, action items  
- `/interview/banks` â€” Question banks and packs  
- `/interview/settings` â€” Mic/audio, rubric presets, privacy

### Minimal Data Model
`CandidateProfile`, `JobTarget`, `JDAnalysis`, `Session`, `Question`, `Answer`, `Rubric`, `Score`, `Feedback`, `Pack`, `Skill`, `Tag`, `Note`, `Attachment`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Sessions/day | 1 | Unlimited |
| Voice mock (TTS/record/transcript) | â€” | âœ… |
| Case/Design modes | Limited | Full |
| Exports | PDF only | PDF + CSV + share link |
| Banks | Core | Full + companyâ€‘style |
| Analytics | Basic | Detailed + trends |
| Integrations | View links | Oneâ€‘click to Planner/Resume/Email |

Integrations: **Resume Builder** (pull achievements), **Job Description Analyzer** (competencies), **Study Planner** (prep plan), **Email Polisher** (thankâ€‘you mail), **Portfolio Creator** (project links), **Presentation Designer** (pitch deck).

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives and Nonâ€‘Goals
**Objectives**
- Provide realistic, roleâ€‘aware interview practice with **constructive, rubricâ€‘based feedback**.  
- Support both **behavioral (STAR)** and **technical** drills, with shareable summaries and next steps.  
- Work well on **mobile**; tolerate network blips; record/transcribe safely (Pro).

**Nonâ€‘Goals (v1)**
- No live multiâ€‘interviewer rooms (v2).  
- No coding execution environment (v2; link out to Snippet/Compiler).  
- No web scraping for company info (v1 manual notes).

---

### 2) Information Architecture and Routes

**Pages**
- `/interview` â€” Dashboard: new session, resume-linked highlights, last feedback, upcoming events.  
- `/interview/setup` â€” Wizard: role, level, JD paste/URL, mode, packs, difficulty, duration, voice toggle, rubric preset.  
- `/interview/session/[id]` â€” Live player: question, timer, notepad, record/stop (Pro), next/flag, hint, â€œinsert resume bulletâ€.  
- `/interview/review/[id]` â€” Scores, annotated transcript, STAR structure heatmap, skill coverage, suggested rewrites, action items, export.  
- `/interview/banks` â€” Browse/search packs by role/company/topic; add to session.  
- `/interview/settings` â€” Mic test, storage/privacy, default rubrics, consent, locales.

**API (SSR)**
- Setup and analysis:  
  - `POST /interview/api/jd/analyze` (extract skills, responsibilities, keywords)  
  - `POST /interview/api/setup` (create session from options)  
- Session I/O:  
  - `GET  /interview/api/session?id=` (state)  
  - `POST /interview/api/session/next` (serve next question, followâ€‘ups)  
  - `POST /interview/api/answer/text` (save text answer)  
  - `POST /interview/api/answer/audio` (upload audio; Pro)  
  - `POST /interview/api/answer/transcribe` (Pro; server STT)  
  - `POST /interview/api/session/finish`
- Feedback and exports:  
  - `POST /interview/api/score` (apply rubric; return perâ€‘criterion scores)  
  - `GET  /interview/api/review?id=`  
  - `POST /interview/api/export` (pdf|csv)  
- Banks and packs:  
  - `GET  /interview/api/packs` Â· `GET /interview/api/pack?id=`  
  - `POST /interview/api/pack/create` (admin/curator)  
- Integrations:  
  - `POST /interview/api/planner/schedule`  
  - `POST /interview/api/resume/pull` (bullets/achievements)  
  - `POST /interview/api/email/thanks` (template â†’ Email Polisher)  
- Settings: `POST /interview/api/settings/save`

Optional WebSocket: `/interview/ws` for timer ticks and lowâ€‘latency prompts.

---

### 3) Rubrics and Scoring

**Behavioral (STAR) rubric criteria (0â€“5 each)**  
- **Situation/Context** (clear, relevant)  
- **Task/Goal** (specific, measurable)  
- **Action** (your actions, depth, leadership)  
- **Result/Impact** (quantified, outcomes, learning)  
- **Conciseness and Structure**  
- **Communication** (tone, clarity)  
Weighted overall score; configurable weights by preset.

**Technical rubric criteria (examples)**  
- **Correctness**, **Complexity reasoning**, **Tradeâ€‘offs**, **Edge cases**, **Communication**, **Systematics** (for design).

**Followâ€‘up generator**: based on gaps (e.g., missing metrics) â†’ ask up to N probing questions before scoring.

**Feedback output**  
- Per criterion: score, 1â€“2 lines feedback, **concrete rewrite** snippet.  
- Overall summary: strengths, top 3 gaps, **next practice plan** (topics and question types).

---

### 4) Data Model (Astro DB / SQL)

**CandidateProfile**  
- `id`, `userId`, `name`, `headline`, `years`, `skills` (json), `resumeUrl` (string|null), `highlights` (json: STAR bullet seeds), `timezone`

**JobTarget**  
- `id`, `userId`, `role`, `level`, `company` (text|null), `location` (text|null), `notes`, `createdAt`

**JDAnalysis**  
- `id`, `jobTargetId` (fk), `sourceType` ('paste'|'url'), `raw` (text), `skills` (json), `competencies` (json), `keywords` (json), `summary` (text)

**Pack** (question bank)  
- `id`, `name`, `category` ('behavioral'|'tech'|'case'|'company'), `tags` (json), `items` (json of templated questions), `level` ('junior'|'mid'|'senior'), `createdAt`

**Session**  
- `id` (uuid pk), `userId`, `jobTargetId` (fk|null), `mode` ('behavioral'|'technical'|'case'|'lightning'|'voice'), `durationMin` (int), `difficulty` (1..5), `language` ('en'|'ta'|'ar'|...), `status` ('active'|'finished'|'abandoned'), `startedAt`, `finishedAt` (nullable), `config` (json), `metrics` (json: wordsPerMin, fillerRate, avgAnswerSec)

**Question**  
- `id`, `sessionId`, `index`, `type` ('behavioral'|'tech'|'case'|'followup'), `prompt` (text), `hints` (json), `competencies` (json), `skills` (json)

**Answer**  
- `id`, `sessionId`, `questionId`, `mode` ('text'|'audio'), `text` (longtext|null), `audioUrl` (string|null), `transcript` (longtext|null), `durationSec` (int|null), `fillerRate` (float|null), `timestamps` (json)

**Rubric**  
- `id`, `name`, `schema` (json: criteria, weights, guides)

**Score**  
- `id`, `sessionId`, `questionId`, `rubricId`, `perCriterion` (json), `total` (float), `notes` (text)

**Feedback**  
- `id`, `sessionId`, `questionId` (nullable for overall), `summary` (text), `strengths` (json), `gaps` (json), `rewrites` (json), `nextActions` (json)

**Skill**  
- `id`, `name`, `category`, `aliases` (json)

**Note**  
- `id`, `sessionId`, `text`, `createdAt`

**Attachment**  
- `id`, `sessionId`, `type` ('resume'|'portfolio'|'slides'), `url`

Indexes on `userId`, `sessionId`, `jobTargetId`, `createdAt`.

---

### 5) Mock Interview Flow

1) **Setup**: role, level, JD paste/URL (optional), packs, duration, difficulty, voice toggle, rubric preset, language.  
2) **Plan**: generator composes sequence (e.g., 6 behavioral + 4 tech + 2 followâ€‘ups).  
3) **Run** (session page):  
   - Show question; **timer**; controls: Next, Flag, Hint, Reveal STAR tips.  
   - **Voice** (Pro): TTS asks question; user records; autoâ€‘transcribe; filler/pace metrics.  
   - **Insert resume bullet**: pulls from Profile â†’ encourage metricâ€‘rich stories.  
4) **Followâ€‘ups**: ask targeted probes if missing STAR elements or competency signals.  
5) **Finish and Score**: apply rubric; produce perâ€‘question + overall scores.  
6) **Review**: show transcript with highlights; **rewritten model answers** tailored to user story; next steps.  
7) **Export/Integrate**: PDF; CSV; create Planner tasks; â€œSend thankâ€‘you email draftâ€ to Email Polisher.

---

### 6) UX / UI

- **Dashboard**: â€œStart mockâ€, last score trend, upcoming interviews (manual entry), quick links.  
- **Session UI**: large readable card; progress dots; timer; notepad; mic widget; language switch.  
- **Review**: radar chart (criteria), bar chart (per question score), STAR heatmap overlay on transcript, top gaps list with quick practice links.  
- **Banks**: filters by role/company/competency; preview questions.  
- Accessibility: keyboard shortcuts; high contrast; screenâ€‘reader labels; RTL; reduced motion.

---

### 7) API Contracts (Examples)

**Analyze JD**  
`POST /interview/api/jd/analyze`  
```json
{ "sourceType":"paste", "raw":"We are hiring an SDE with experience in REST APIs, AWS, SQL..." }
```
Res: `{ "skills":["REST","AWS","SQL"], "competencies":["ownership","problem solving"], "keywords":["microservices","latency"], "summary":"..." }`

**Create session**  
`POST /interview/api/setup`  
```json
{
  "role":"Software Engineer",
  "level":"mid",
  "mode":"behavioral",
  "durationMin":45,
  "difficulty":3,
  "packs":["behavioral_core","amazon_lp"],
  "voice":false,
  "rubric":"star_default"
}
```
Res: `{ "sessionId":"sess_123" }`

**Next question**  
`POST /interview/api/session/next` â†’ `{ "index":1, "prompt":"Tell me about a time you disagreed with a team member.", "hints":["Explain Situationâ†’Taskâ†’Actionâ†’Result"], "skills":["communication","conflict resolution"] }`

**Submit answer (text)**  
`POST /interview/api/answer/text`  
```json
{ "sessionId":"sess_123", "questionId":7, "text":"In my last project..." }
```
Res: `{ "ok":true }`

**Score and feedback**  
`POST /interview/api/score` â†’  
`{ "total":3.8, "perCriterion":{"STAR.Result":3,"Conciseness":4}, "feedback":{"gaps":["no metrics"],"rewrite":"I increased latency SLO adherence from 92%â†’99% by..."}}`

**Export**  
`POST /interview/api/export` â†’ `{ "url":"/exports/Interview_Summary_sess_123.pdf" }`

---

### 8) Validation Rules

- Session duration 10â€“120 minutes.  
- Max questions per session 40; followâ€‘ups per question â‰¤ 3.  
- Audio uploads â‰¤ 10MB/answer; mp3/webm; transcript length â‰¤ 10k chars.  
- Rubric must define 3â€“10 criteria; weights sum to 1.0.  
- Packs must be system/curator owned; user cannot alter curated items (copy to personal pack to edit).  
- Exports under 10MB; rateâ€‘limited.

---

### 9) Plans and Limits

| Feature | Free | Pro |
|---|---|---|
| Sessions/day | 1 | Unlimited |
| Voice mock | â€” | Yes |
| Case/Design | Limited | Full |
| Packs | Core | Full + companyâ€‘style |
| Exports | PDF | PDF + CSV + share link |
| Analytics | Basic | Detail + trends |
| History retention | 30 days | Unlimited |

Rate limits: `/session/next` 10/min; `/answer/audio` 30/day; `/export` 5/day.

---

### 10) Suggested File Layout

```
src/pages/interview/index.astro
src/pages/interview/setup.astro
src/pages/interview/session/[id].astro
src/pages/interview/review/[id].astro
src/pages/interview/banks.astro
src/pages/interview/settings.astro

src/pages/interview/api/jd/analyze.ts
src/pages/interview/api/setup.ts
src/pages/interview/api/session/index.ts
src/pages/interview/api/session/next.ts
src/pages/interview/api/answer/text.ts
src/pages/interview/api/answer/audio.ts
src/pages/interview/api/answer/transcribe.ts
src/pages/interview/api/session/finish.ts
src/pages/interview/api/score.ts
src/pages/interview/api/review.ts
src/pages/interview/api/export.ts
src/pages/interview/api/packs.ts
src/pages/interview/api/pack/index.ts
src/pages/interview/api/planner/schedule.ts
src/pages/interview/api/resume/pull.ts
src/pages/interview/api/email/thanks.ts

src/components/interview/Session/*.astro
src/components/interview/Review/*.astro
src/components/interview/Banks/*.astro
```

---

### 11) Seed Packs (v1)

- **Behavioral Core (STAR)**: teamwork, conflict, leadership, failure, ownership, ambiguity, stakeholder mgmt.  
- **Companyâ€‘style**: Amazon Leadership Principles, Google GCA, Microsoft growth mindset (curated paraphrases).  
- **Technical Core**: data structures and algorithms concepts (conceptual Q and A), REST/HTTP, SQL reasoning, system design prompts (highâ€‘level).  
- **Product/Case**: product sense, metrics, prioritization, estimation, goâ€‘toâ€‘market.

---

### 12) Future Enhancements (v2+)

- **Live peer panel** and mentor scoring.  
- **Coding runner** and whiteboard canvas.  
- **Company research autoâ€‘brief** (web browse + summary).  
- **Answer library** with retrievalâ€‘augmented examples from user history.  
- **Speech analytics** (filler words, pacing, sentiment).  
- **Mobile PWA** with offline practice packs.

---

**End of Requirements â€” Ready for Codex Implementation.**
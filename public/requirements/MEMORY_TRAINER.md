# ðŸ§  Memory Trainer â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/memory`  
**Category:** Learning & Knowledge  
**Stack:** Astro + Tailwind (islands where needed), Astro SSR API routes, Astro DB / Supabase  
**Goal:** Help users **improve working and longâ€‘term memory** with scienceâ€‘based drills (Nâ€‘Back, chunking, spaced repetition), daily plans, streaks, and rich stats. Integrates with **FlashNote** (flashcards) and **Quiz Institute**.

---

## 1) Objectives & Nonâ€‘Goals

### Objectives
- Offer **multiple exercise types**:  
  1) **Nâ€‘Back** (audio/visual/dual),  
  2) **Digit/Letter Span** (forward/reverse),  
  3) **Wordâ€‘Pair Recall**,  
  4) **Nameâ€“Face Recall** (placeholder images v1),  
  5) **Grid Pattern Recall**,  
  6) **Spacedâ€‘Repetition Flashcards** (Leitner/SMâ€‘2â€‘like).  
- **Adaptive difficulty** per user using Eloâ€‘style rating / SMâ€‘2 (for SRS).  
- **Daily plan** with warmâ€‘up â†’ focus â†’ cooldown; **streaks** and **reminders**.  
- **Progress analytics**: response time, accuracy, level history, forgetting curves.  
- **Content**: builtâ€‘in starter decks; import from **FlashNote** / CSV.  
- **Export**: CSV/MD/PDF summaries; share readâ€‘only personal bests.

### Nonâ€‘Goals (v1)
- No webcam/realâ€‘person face uploads (privacy). Use stock placeholders.  
- No clinical claims; this is a training tool, not medical.  
- No multiplayer/competitive leaderboards (Phase 2).

---

## 2) User Stories (Acceptance Criteria)

1. **Start Daily Training**
   - *As a user*, I press **Start** and complete a ~10â€“15 min session across 2â€“3 selected exercises.  
   - **AC:** `/memory/api/plan/today` returns a tailored queue; completion logs a `Session` and updates streak.

2. **Adaptive Nâ€‘Back**
   - *As a user*, my **N** increases after high performance and decreases after low performance.  
   - **AC:** `/memory/api/nback/start` seeds level; `/nback/submit` returns next level + accuracy/time stats.

3. **Digit/Letter Span**
   - *As a user*, the span length adapts; reverse mode available.  
   - **AC:** `/memory/api/span/start` & `/span/submit` track span max and running average.

4. **Wordâ€‘Pair & Grid Recall**
   - *As a user*, I study briefly then recall; scoring penalizes order/position mistakes.  
   - **AC:** `/memory/api/pairs/start` & `/pairs/submit`; `/grid/start` & `/grid/submit` return accuracy maps.

5. **Spaced Repetition (SRS)**
   - *As a user*, I review cards from my deck using 1â€“5 grading.  
   - **AC:** `/memory/api/srs/next` serves due cards; `/srs/grade` schedules using **SMâ€‘2â€‘like** algorithm.

6. **Decks & Imports**
   - *As a user*, I create decks and import from CSV or **FlashNote**.  
   - **AC:** `/memory/api/deck/create` & `/deck/import` create/populate decks; report duplicate merges.

7. **Reminders & Streaks**
   - *As a user*, I set a daily reminder time; streak shows consecutive days trained.  
   - **AC:** `/memory/api/reminders` stores schedule; `/memory/api/streak` computes counts.

8. **Stats & Exports**
   - *As a user*, I view charts: accuracy, response time, nâ€‘back level trend, SRS due forecast.  
   - **AC:** `/memory/api/stats` aggregates; `/memory/api/export` returns CSV/MD/PDF.

9. **Plan Gating**
   - Free: 1 custom deck, basic drills, 30 SRS reviews/day, watermark exports.  
   - Pro: unlimited decks, advanced drills (dual nâ€‘back), full analytics, no watermark.

---

## 3) Routes & Information Architecture

- `/memory` â€” Dashboard (today plan, streak, quick start)  
- `/memory/training` â€” Guided daily session (queue of exercises)  
- `/memory/exercises/nback` â€” Standalone Nâ€‘Back  
- `/memory/exercises/span` â€” Digit/Letter Span  
- `/memory/exercises/pairs` â€” Wordâ€‘Pair Recall  
- `/memory/exercises/grid` â€” Grid Pattern Recall  
- `/memory/srs` â€” Spacedâ€‘Repetition review  
- `/memory/decks` â€” Deck manager (create/import/export)  
- `/memory/stats` â€” Analytics (charts, records)  
- `/memory/settings` â€” Preferences (reminders, audio, difficulty)

**API (SSR):**  
- `POST /memory/api/plan/today`  
- `POST /memory/api/nback/start` Â· `POST /memory/api/nback/submit`  
- `POST /memory/api/span/start` Â· `POST /memory/api/span/submit`  
- `POST /memory/api/pairs/start` Â· `POST /memory/api/pairs/submit`  
- `POST /memory/api/grid/start` Â· `POST /memory/api/grid/submit`  
- `GET  /memory/api/srs/next` Â· `POST /memory/api/srs/grade`  
- `POST /memory/api/deck/create` Â· `POST /memory/api/deck/import` Â· `POST /memory/api/deck/export`  
- `POST /memory/api/reminders` Â· `GET /memory/api/streak`  
- `GET  /memory/api/stats` Â· `POST /memory/api/export`  
- `POST /memory/api/delete` Â· `POST /memory/api/duplicate`

---

## 4) Database Model (Astro DB / SQL)

**User**  
- `id` (pk), `email` (unique), `plan`, `timezone`, `createdAt`

**Session**  
- `id` (pk uuid), `userId`, `startedAt`, `endedAt`, `minutes`, `streakCount`, `planConfig` (json)

**Exercise**  
- `id` (pk), `userId`, `type` ('nback'|'span'|'pairs'|'grid'|'srs'), `config` (json), `rating` (float), `createdAt`

**Trial** (atomic attempt data)  
- `id` (pk), `sessionId` (fk), `exerciseType`, `stimulus` (json), `response` (json), `correct` (bool), `rtMs` (int)

**Deck**  
- `id` (pk uuid), `userId`, `title`, `tags` (json), `createdAt`

**Card**  
- `id` (pk uuid), `deckId` (fk), `front`, `back`, `extra` (json), `createdAt`

**SrsState**  
- `cardId` (pk fk), `intervalDays` (float), `easeFactor` (float), `repetitions` (int), `dueOn` (date), `lapseCount` (int)

**Reminder**  
- `id` (pk), `userId`, `days` (json), `time` (HH:MM), `timezone`

**Record** (personal bests)  
- `id` (pk), `userId`, `type`, `value`, `meta` (json), `createdAt`

### JSON Examples

**Exercise.config (nâ€‘back)**  
```json
{"mode":"dual","n":2,"stimuli":{"grid":3,"audio":"beep"}, "rounds":20}
```

**Trial.stimulus/response**  
```json
{"pos":[1,3], "audio":"A"}   // stimulus
{"match_pos":true, "match_audio":false}   // response
```

**SrsState (SMâ€‘2â€‘like)**  
```json
{"intervalDays":5,"easeFactor":2.4,"repetitions":3,"dueOn":"2025-11-02","lapseCount":1}
```

---

## 5) Algorithms & Adaptation

### Nâ€‘Back Leveling
- Start at **N=1** (Free) or last best (Pro).  
- After each block:  
  - **Promote** if `accuracy â‰¥ 85%` and `falseâ€‘positive rate â‰¤ 10%`.  
  - **Demote** if `accuracy < 65%`.  
  - Else **hold** level.  
- Track **best N** and 7â€‘day rolling accuracy.

### Digit/Letter Span
- 3 correct at current span â†’ **+1**; 2 fails at span â†’ **âˆ’1** (floor at 3).  
- Reverse mode adds +1 effective difficulty in stats.

### SMâ€‘2â€‘like (SRS)
- Grade âˆˆ {1..5}. If grade < 3 â†’ lapse: `interval = 1`, `ef = max(1.3, ef-0.2)`.  
- Else: `repetitions += 1`, `interval = 1 (rep=1)`, `6 (rep=2)`, else `interval = round(interval * ef)`;  
  `ef = max(1.3, ef + 0.1 - (5-grade)*(0.08 + (5-grade)*0.02))`.

### Eloâ€‘Style Rating (per exercise)
- Update `rating` per block using opponent=task difficulty; drift slowly upward on consistent wins.

---

## 6) UI / Pages

### `/memory` (Dashboard)
- **Todayâ€™s Plan** card with Start button; **Streak**; **Due SRS** count; quick settings.  
- **Recent Performance** miniâ€‘charts (accuracy, RT, best N).  
- Decks panel (import/create) with due forecast.

### `/memory/training`
- Guided queue with progress steps.  
- Nâ€‘Back with grid + audio; big pause/skip buttons; keyboard controls.  
- Span with clean monospace display; feedback flashes.  
- Pairs/Grid with study timer â†’ recall stage.  
- Session summary: accuracy, RT, level change, next plan.

### `/memory/srs`
- Flashcard review with 1â€‘5 grading; hotkeys; â€œsuspendâ€ and â€œeditâ€ (own cards only).  
- Due chart for the week; add card quick form.

### `/memory/decks`
- Table/cards: title, due today, size, last review; actions: import/export, edit, delete.  
- Import CSV: `front,back,tags` with preview & duplicate detection.

### `/memory/stats`
- Charts: accuracy %, RT ms, best N over time; SRS due forecast; streak calendar.  
- Export buttons.

### `/memory/settings`
- Exercise toggles, default daily minutes, reminder time, audio on/off, strict mode.

---

## 7) API Contracts (examples)

### `POST /memory/api/plan/today`
Req: `{ "minutes": 12, "exercises": ["nback","span","srs"] }`  
Res: `{ "queue":[{"type":"nback","config":{...}},{"type":"span","config":{...}},{"type":"srs"}] }`

### `POST /memory/api/nback/start`
Req: `{ "mode":"dual","n":2 }`  
Res: `{ "rounds":[...], "seed":123, "level":2 }`

### `POST /memory/api/nback/submit`
Req: `{ "level":2, "results":[{"correct":true,"rtMs":620}, ...] }`  
Res: `{ "accuracy":0.82,"fpRate":0.08,"nextLevel":3 }`

### `GET /memory/api/srs/next`
Req: `?deckId=<uuid>&limit=20`  
Res: `{ "cards":[{"id":"c1","front":"â€¦","back":"â€¦"}] }`

### `POST /memory/api/srs/grade`
Req: `{ "cardId":"c1","grade":4 }`  
Res: `{ "dueOn":"2025-11-03","intervalDays":6,"easeFactor":2.36 }`

### `POST /memory/api/deck/import`
Req: multipart CSV or `{ "rows":[{"front":"â€¦","back":"â€¦","tags":["bio"]}] }`  
Res: `{ "ok":true,"imported":120,"duplicates":5 }`

### `GET /memory/api/stats`
Res: `{ "accuracy":[...], "rt":[...], "bestN":3, "dueForecast":[...], "streak":12 }`

### `POST /memory/api/export`
Req: `{ "format":"csv|md|pdf" }`  
Res: `{ "url": "/exports/Memory_Stats_2025-10-27.pdf" }`

---

## 8) Validation Rules

- Daily plan minutes 5â€“60.  
- Nâ€‘Back `n` âˆˆ 1..5; rounds 10â€“40 per block.  
- Span 3â€“12; reverse only if span â‰¥ 4.  
- Pairs count 5â€“20; study time 10â€“60s.  
- Grid size 3Ã—3 to 5Ã—5.  
- SRS grades 1â€“5 only; deck title 3â€“120 chars.  
- CSV import â‰¤ 10k rows / 5 MB.

---

## 9) Plans & Limits

| Feature | Free | Pro |
|--------|------|-----|
| Custom Decks | 1 | Unlimited |
| SRS Reviews/day | 30 | 300 |
| Nâ€‘Back Modes | Visual | Visual + Dual (audio) |
| Exports | CSV/MD (watermark) | CSV/MD/PDF (no watermark) |
| Analytics | Basic | Full (RT histograms, due forecast) |

Rate limits: `userId`+day for sessions/SRS; `userId`+month for exports.

---

## 10) Security & Privacy

- No storage of raw audio; only event logs.  
- Sanitize all card content; escape Markdown/HTML.  
- Exercises run clientâ€‘side where possible; only results posted.  
- Optional **ephemeral AI** when generating starter decks.

---

## 11) Accessibility & UX

- Keyboardâ€‘first controls; highâ€‘contrast themes; adjustable font sizes.  
- Motionâ€‘reduced animations; audio cues with captions.  
- RTL support for Arabic; printâ€‘friendly stats.

---

## 12) Suggested File Layout

```
src/pages/memory/index.astro
src/pages/memory/training.astro
src/pages/memory/exercises/nback.astro
src/pages/memory/exercises/span.astro
src/pages/memory/exercises/pairs.astro
src/pages/memory/exercises/grid.astro
src/pages/memory/srs.astro
src/pages/memory/decks.astro
src/pages/memory/stats.astro
src/pages/memory/settings.astro

src/pages/memory/api/plan/today.ts
src/pages/memory/api/nback/start.ts
src/pages/memory/api/nback/submit.ts
src/pages/memory/api/span/start.ts
src/pages/memory/api/span/submit.ts
src/pages/memory/api/pairs/start.ts
src/pages/memory/api/pairs/submit.ts
src/pages/memory/api/grid/start.ts
src/pages/memory/api/grid/submit.ts
src/pages/memory/api/srs/next.ts
src/pages/memory/api/srs/grade.ts
src/pages/memory/api/deck/create.ts
src/pages/memory/api/deck/import.ts
src/pages/memory/api/deck/export.ts
src/pages/memory/api/reminders.ts
src/pages/memory/api/streak.ts
src/pages/memory/api/stats.ts
src/pages/memory/api/export.ts
src/pages/memory/api/delete.ts
src/pages/memory/api/duplicate.ts

src/components/memory/NBack/*.astro
src/components/memory/Span/*.astro
src/components/memory/Pairs/*.astro
src/components/memory/Grid/*.astro
src/components/memory/SRS/*.astro
src/components/memory/Charts/*.astro
```

---

## 13) Future Enhancements (v2+)

- Dualâ€‘task paradigms (tone counting + visuoâ€‘spatial tasks).  
- Community deck sharing and collaborative editing.  
- Coach mode with weekly prescriptions.  
- Mobile offline mode (PWA).

---

**End of Requirements â€” ready for Codex implementation.**
# ðŸŸï¸ Trivia Arena â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/trivia`  
**Category:** Fun & Engagement  
**Stack:** Astro + Tailwind (islands where needed), Astro SSR API routes, Astro DB / Supabase, WebSockets (optional for live rooms)  
**Goal:** Deliver a fast, addictive trivia experience with **solo drills**, **daily challenge**, and **headâ€‘toâ€‘head arena** play. Includes question packs, streaks, powerâ€‘ups, and rich stats. Integrates with **Quiz Institute** for authoring and imports.

---

## 1) Objectives & Nonâ€‘Goals

### Objectives
- Multiple modes: **Solo**, **Daily Challenge**, **Headâ€‘toâ€‘Head (async)**, **Live Room (realtime, v2)**, and **Tournaments (v2)**.  
- Question types: **Multiple Choice (single/multi)**, **True/False**, **Fillâ€‘in (short text with fuzzy match)**, **Image prompt** (URL).  
- Categories & difficulty: General, Science, Tech, History, Sports, Movies, Music, Geography, Mixed; **Easy/Medium/Hard**.  
- **Powerâ€‘ups**: 50/50, Add Time, Double Points, Hint (excludes fillâ€‘in).  
- **Scoring**: base points + **time bonus**; streak multipliers; antiâ€‘cheat timers.  
- **Question Banks**: builtâ€‘in packs + import from CSV/JSON or **Quiz Institute**.  
- **Leaderboards**: global (Pro), friends (perâ€‘user seed), and daily challenge.  
- **Analytics**: accuracy, avg time to answer, category strengths, streaks.  
- **Localization**: i18n strings + RTL support.

### Nonâ€‘Goals (v1)
- No cash prizes or gambling.  
- No public chat or DM (safety).  
- No camera/microphone gameplay.

---

## 2) User Stories (Acceptance Criteria)

1. **Start Solo Game**
   - *As a user*, I choose category, difficulty, number of questions (e.g., 10), and start.  
   - **AC:** `/trivia/api/game/create` returns a `GameSession` with a randomized question set and a countdown timer.

2. **Answer Questions**
   - *As a user*, I answer within the time limit; I see correct/incorrect + explanation.  
   - **AC:** `/trivia/api/game/answer` validates response, computes points (base + time bonus), applies powerâ€‘ups.

3. **Daily Challenge**
   - *As a user*, I play **one fixed set** per day (seeded).  
   - **AC:** `/trivia/api/daily/today` returns the daily session; leaderboard updates after submit.

4. **Headâ€‘toâ€‘Head (Async)**
   - *As a user*, I challenge a friend via link; both play the same set independently.  
   - **AC:** `/trivia/api/arena/create` issues a match URL; `/arena/submit` compares totals and declares winner; antiâ€‘replay enforced.

5. **Powerâ€‘Ups**
   - *As a user*, I use a powerâ€‘up once per game (free users: 1, Pro: 3).  
   - **AC:** `/trivia/api/game/powerup` mutates the current question (50/50, add time, double points, hint).

6. **Import Questions**
   - *As a user*, I import a CSV/JSON of questions.  
   - **AC:** `/trivia/api/bank/import` validates schema, dedupes by hash, and reports results.

7. **Stats & Leaderboards**
   - *As a user*, I view my accuracy, avg answer time, streaks, best categories; compare on leaderboards.  
   - **AC:** `/trivia/api/stats` aggregates; `/trivia/api/leaderboard` paginates rankings.

8. **Plan Gating**
   - Free: Solo + Daily Challenge, limited powerâ€‘ups, basic leaderboards.  
   - Pro: Async headâ€‘toâ€‘head, custom packs import, category analytics, global leaderboards, tournaments (v2).

---

## 3) Routes & Information Architecture

- `/trivia` â€” Hub: start Solo, Daily Challenge card, Headâ€‘toâ€‘Head invite, stats.  
- `/trivia/play` â€” Solo game UI (question panel, options, timer, powerâ€‘ups).  
- `/trivia/daily` â€” Daily Challenge entry and leaderboard.  
- `/trivia/arena/[matchId]` â€” Async Headâ€‘toâ€‘Head page (join/play/compare).  
- `/trivia/bank` â€” Question packs (builtâ€‘in + user imports).  
- `/trivia/stats` â€” Personal analytics.  
- `/trivia/settings` â€” Preferences (sounds, timer length, language).

**API (SSR):**  
- `POST /trivia/api/game/create` (create solo session)  
- `POST /trivia/api/game/next` (next question)  
- `POST /trivia/api/game/answer` (validate & score)  
- `POST /trivia/api/game/powerup`  
- `POST /trivia/api/daily/today` Â· `POST /trivia/api/daily/submit`  
- `POST /trivia/api/arena/create` Â· `POST /trivia/api/arena/join` Â· `POST /trivia/api/arena/submit`  
- `POST /trivia/api/bank/import` Â· `GET /trivia/api/bank/list`  
- `GET  /trivia/api/stats` Â· `GET /trivia/api/leaderboard`  
- `POST /trivia/api/delete` Â· `POST /trivia/api/duplicate`

---

## 4) Database Model (Astro DB / SQL)

**User**  
- `id` (pk), `email`, `plan`, `handle` (unique), `createdAt`

**Question**  
- `id` (pk uuid), `hash` (unique), `text`, `type` ('mcq'|'multi'|'tf'|'fill'|'image'),  
  `options` (json: array of strings), `answer` (json), `explanation` (text|null),  
  `category` (string), `difficulty` ('easy'|'medium'|'hard'), `imageUrl` (nullable), `source` ('builtin'|'import'|'quiz_institute'), `createdAt`

**QuestionPack**  
- `id` (pk uuid), `userId` (fk nullable for builtin), `title`, `description`, `category`, `difficulty`, `size`, `visibility` ('private'|'public'|'builtin'), `createdAt`

**PackItem**  
- `packId` (fk), `questionId` (fk), `position` (int)

**GameSession**  
- `id` (pk uuid), `userId` (fk), `mode` ('solo'|'daily'|'arena'), `category`, `difficulty`, `questionIds` (json),  
  `currentIndex` (int), `score` (int), `streak` (int), `powerupsUsed` (json), `timePerQuestion` (int), `expiresAt`, `createdAt`

**AnswerLog**  
- `id` (pk), `sessionId` (fk), `questionId` (fk), `given` (json), `correct` (bool), `timeMs` (int), `points` (int), `usedPowerups` (json)

**ArenaMatch**  
- `id` (pk uuid), `creatorId` (fk), `opponentId` (fk nullable), `questionIds` (json), `status` ('open'|'playing'|'finished'|'expired'), `scores` (json), `createdAt`, `expiresAt`

**DailySeed**  
- `date` (pk), `questionIds` (json), `leaderboardId` (fk)

**LeaderboardEntry**  
- `id` (pk), `scope` ('daily'|'global'|'category'), `scopeKey` (date or category), `userId` (fk), `score` (int), `timeMs` (int), `createdAt`

**UserStat**  
- `userId` (pk fk), `gamesPlayed` (int), `accuracy` (float), `avgTimeMs` (int), `bestStreak` (int), `categoryWins` (json), `lastPlayedAt`

---

## 5) Game Rules & Scoring

- **Timer:** default 20s/question (min 10s, max 45s).  
- **Base Points:** Easy=100, Medium=150, Hard=200.  
- **Time Bonus:** `ceil((remaining_ms / total_ms) * 100)`.  
- **Streak Multiplier:** `1.0 + (current_streak * 0.05)` up to 2Ã—.  
- **Powerâ€‘ups:**  
  - **50/50:** remove two wrong options (MCQ only).  
  - **Add Time:** +10s (cap at max).  
  - **Double Points:** doubles points for current question (apply after bonus).  
  - **Hint:** show short clue; âˆ’25 base points if used.  
- **Antiâ€‘Cheat:** perâ€‘question nonce; late submits rejected; serverâ€‘side timestamp check; lock session after all questions.  
- **Fillâ€‘in Matching:** caseâ€‘insensitive trim + Damerauâ€‘Levenshtein distance â‰¤ 1 or synonyms set.

---

## 6) Import/Export

- **CSV schema (MCQ/Multi/TF):**  
  `question,type,option_a,option_b,option_c,option_d,answer,explanation,category,difficulty,image_url`  
- **JSON schema:** array of `{text,type,options,answer,explanation,category,difficulty,imageUrl}`.  
- **Export:** `GameSession` results (CSV/JSON) and personal stats (CSV/JSON).  
- **Quiz Institute:** import by quiz ID; map to QuestionPack.

---

## 7) UI / Pages

### `/trivia` (Hub)
- Start Solo: category, difficulty, #questions, timer length, powerâ€‘ups toggle.  
- Daily Challenge card: time left, yesterdayâ€™s top 10.  
- Headâ€‘toâ€‘Head invite: generate link.  
- Recent stats miniâ€‘cards.

### `/trivia/play`
- Header: progress `Q 3/10`, timer, score, streak.  
- Question card + options; powerâ€‘ups row; **Submit** / **Next**.  
- Feedback panel: correct answer + explanation; â€œShare scoreâ€ (copy text).

### `/trivia/daily`
- Start button; after finish: leaderboard table (Top, My Rank).

### `/trivia/arena/[matchId]`
- Preâ€‘game: join prompt for opponent.  
- During game: same UI as Solo.  
- Postâ€‘game: sideâ€‘byâ€‘side results, rematch button.

### `/trivia/bank`
- Builtâ€‘in packs; user packs with size; import wizard (CSV/JSON).

### `/trivia/stats`
- Charts: accuracy by category, avg time per difficulty, streak calendar, best scores.

### `/trivia/settings`
- Sounds on/off, timer default, language, accessibility (high contrast, larger text).

---

## 8) API Contracts (examples)

### `POST /trivia/api/game/create`
Req: `{ "mode":"solo", "category":"science", "difficulty":"medium", "count":10, "timer":20 }`  
Res: `{ "sessionId":"<uuid>", "questionIds":[...], "timePerQuestion":20 }`

### `POST /trivia/api/game/next`
Req: `{ "sessionId":"<uuid>" }`  
Res: `{ "q":{"id":"...","text":"...","type":"mcq","options":["A","B","C","D"]} }`

### `POST /trivia/api/game/answer`
Req: `{ "sessionId":"<uuid>", "questionId":"...", "answer":"B" }`  
Res: `{ "correct":true, "points":187, "streak":3, "nextAvailable":true, "explanation":"..." }`

### `POST /trivia/api/game/powerup`
Req: `{ "sessionId":"<uuid>", "type":"5050" }`  
Res: `{ "remaining":["B","D"] }`

### `POST /trivia/api/daily/today`
Req: `{}`  
Res: `{ "sessionId":"<uuid>", "questionIds":[...], "seed":"2025-10-27" }`

### `POST /trivia/api/daily/submit`
Req: `{ "sessionId":"<uuid>" }`  
Res: `{ "score":1234, "rank":57 }`

### `POST /trivia/api/arena/create`
Req: `{ "category":"mixed", "difficulty":"mixed", "count":10 }`  
Res: `{ "matchId":"<uuid>", "inviteUrl":"/trivia/arena/<uuid>" }`

### `POST /trivia/api/arena/join`
Req: `{ "matchId":"<uuid>" }` â†’ Res: `{ "ok":true }`

### `POST /trivia/api/arena/submit`
Req: `{ "matchId":"<uuid>", "sessionId":"<uuid>" }`  
Res: `{ "winner":"creator|opponent|draw", "scores":{"creator":1200,"opponent":1150} }`

### `GET /trivia/api/leaderboard`
Req: `?scope=daily&key=2025-10-27&limit=50&offset=0`  
Res: `{ "rows":[{"user":"Karthik","score":1890,"timeMs":95000}], "me":{"rank":42} }`

### `POST /trivia/api/bank/import`
Req: multipart CSV/JSON  
Res: `{ "ok":true, "imported":340, "duplicates":12, "errors":0 }`

---

## 9) Validation Rules

- Question text 5â€“600 chars; options 1â€“200 chars.  
- Categories limited to whitelist; difficulty âˆˆ {easy,medium,hard}.  
- Timer 10â€“45s; count 5â€“50 per session.  
- Singleâ€‘use powerâ€‘ups per session (Free=1, Pro=3).  
- Import size â‰¤ 10k questions / 10 MB; dedupe by `{text+options}` hash.

---

## 10) Plans & Limits

| Feature | Free | Pro |
|--------|------|-----|
| Solo & Daily | Yes | Yes |
| Headâ€‘toâ€‘Head (async) | â€” | Yes |
| Powerâ€‘ups per game | 1 | 3 |
| Imports | â€” | CSV/JSON, 10k cap |
| Analytics | Basic | Full |
| Leaderboards | Daily | Daily + Global/Category |
| Tournaments | â€” | v2 |

Rate limits: `userId`+day for plays; `userId`+month for imports.

---

## 11) Security, Privacy, Fair Play

- No PII in questions; sanitize rich text; proxy external images.  
- Serverâ€‘validated timers & nonces; prevent replay; cap perâ€‘IP for daily challenge.  
- Reports: flag bad questions; moderation queue for public packs.

---

## 12) Accessibility & UX

- Keyboard shortcuts (1â€“4 to answer; Space to submit/next).  
- Highâ€‘contrast theme toggle; large text; screenâ€‘reader labels.  
- Reduced motion; sounds with volume control.

---

## 13) Suggested File Layout

```
src/pages/trivia/index.astro
src/pages/trivia/play.astro
src/pages/trivia/daily.astro
src/pages/trivia/arena/[matchId].astro
src/pages/trivia/bank.astro
src/pages/trivia/stats.astro
src/pages/trivia/settings.astro

src/pages/trivia/api/game/create.ts
src/pages/trivia/api/game/next.ts
src/pages/trivia/api/game/answer.ts
src/pages/trivia/api/game/powerup.ts
src/pages/trivia/api/daily/today.ts
src/pages/trivia/api/daily/submit.ts
src/pages/trivia/api/arena/create.ts
src/pages/trivia/api/arena/join.ts
src/pages/trivia/api/arena/submit.ts
src/pages/trivia/api/bank/import.ts
src/pages/trivia/api/bank/list.ts
src/pages/trivia/api/stats.ts
src/pages/trivia/api/leaderboard.ts
src/pages/trivia/api/delete.ts
src/pages/trivia/api/duplicate.ts

src/components/trivia/Game/*.astro
src/components/trivia/Question/*.astro
src/components/trivia/Powerups/*.astro
src/components/trivia/Bank/*.astro
src/components/trivia/Stats/*.astro
```

---

## 14) Future Enhancements (v2+)

- **Live Rooms** with WebSockets (buzzâ€‘in, fastestâ€‘finger, host controls).  
- **Seasonal Tournaments** with brackets and prizes (nonâ€‘monetary).  
- **AI Question Generator** with templated validation and difficulty calibration.  
- **Tagging & Adaptive Difficulty** per user category strength.  
- **Team Mode** (2v2) and **Coâ€‘op** marathon.

---

**End of Requirements â€” ready for Codex implementation.**
# ðŸ˜„ Guess the Emoji â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/guess-the-emoji`  
**Category:** Fun & Engagement  
**Stack:** Astro + Tailwind (islands where needed), Astro SSR API routes, Astro DB / Supabase  
**Goal:** Fast, familyâ€‘friendly word game where users decode a phrase/title/object from a **sequence of emojis**. Includes Solo, Daily Puzzle, and Async Versus. Supports localization, hints, packs, and creator tools.

---

## 1) Objectives & Nonâ€‘Goals

### Objectives
- Deliver multiple play modes with smooth UX:
  - **Classic Solo** â€” pick a pack/category and solve sets of 10â€“20 emoji puzzles.
  - **Daily Emoji** â€” one curated puzzle per day with a shared leaderboard.
  - **Time Attack** â€” solve as many as you can in 90â€“180s.
  - **Versus (Async)** â€” challenge a friend to the same set; highest score wins.
- Rich **content model**: title/answer, emoji string, category, difficulty, accepted aliases/synonyms, and explanations.
- **Hint system** (reveal letter, remove wrong letters, clue) and **scoring** with streak/time multipliers.
- **Packs**: builtâ€‘in, imported (CSV/JSON), and communityâ€‘made (private/public, moderated).
- **Accessibility & i18n**: RTL and languageâ€‘specific accepted answers.
- Antiâ€‘cheat timers and serverâ€‘side validation.

### Nonâ€‘Goals (v1)
- No live realtime buzzer rooms (possible v2 via WebSockets).
- No chat between users; no UGC comments.
- No NSFW/unsafe content; builtâ€‘in filters enforce familyâ€‘friendly terms.

---

## 2) User Stories (Acceptance Criteria)

1. **Solve a Puzzle**
   - *As a user*, Iâ€™m shown emojis like `ðŸ”ðŸ ` and a text input.  
   - **AC:** `/guess-the-emoji/api/check` accepts `burger house`, `burgerhouse`, or `burger home` if listed as aliases; returns correct/incorrect and an explanation string.

2. **Daily Emoji**
   - *As a user*, I get one seedâ€‘based puzzle per day.  
   - **AC:** `/guess-the-emoji/api/daily/today` returns todayâ€™s puzzle; `/daily/submit` posts my score/time to the leaderboard.

3. **Hints**
   - *As a user*, I can reveal a letter, remove 2 wrong letters from a keyboard bank, or get a textual clue.  
   - **AC:** `/guess-the-emoji/api/hint` returns a specific hint; score penalty applies.

4. **Time Attack**
   - *As a user*, I choose 90/120/180s and try to solve a stream.  
   - **AC:** `/guess-the-emoji/api/timeattack/start` returns a stream/session id; `/timeattack/next` serves the next puzzle; `/timeattack/submit` tallies score.

5. **Versus (Async)**
   - *As a user*, I generate an invite link; both players solve the same set; server compares final scores.  
   - **AC:** `/guess-the-emoji/api/versus/create` â†’ `inviteUrl`; `/versus/submit` computes winner; antiâ€‘replay enforced.

6. **Packs & Import**
   - *As a user*, I import a CSV/JSON of puzzles (with emojis and accepted answers).  
   - **AC:** `/guess-the-emoji/api/packs/import` dedupes by puzzle hash; `/packs/list` lists packs; `/packs/start` creates a session from a pack.

7. **Stats & Streaks**
   - *As a user*, I see accuracy, avg time per puzzle, streak days, and top categories.  
   - **AC:** `/guess-the-emoji/api/stats` aggregates metrics; `/guess-the-emoji/api/leaderboard` paginates standings.

8. **Plan Gating**
   - Free: Classic + Daily + basic hints + builtâ€‘in packs.  
   - Pro: Versus, Time Attack, imports, custom packs, global leaderboards, advanced analytics.

---

## 3) Routes & Information Architecture

- `/guess-the-emoji` â€” Hub: Start Classic, Daily card, Time Attack, Versus invite, recent stats.  
- `/guess-the-emoji/play` â€” Classic Solo UI (progress, keyboard, hints).  
- `/guess-the-emoji/daily` â€” Daily Emoji + leaderboard panel.  
- `/guess-the-emoji/versus/[matchId]` â€” Async Versus room (join/play/results).  
- `/guess-the-emoji/packs` â€” Pack browser (builtâ€‘in + user imports).  
- `/guess-the-emoji/stats` â€” Personal analytics.  
- `/guess-the-emoji/settings` â€” Language, input rules, hints behavior, accessibility.

**API (SSR):**  
- `POST /guess-the-emoji/api/session/create` (classic)  
- `POST /guess-the-emoji/api/next` (next puzzle within a session)  
- `POST /guess-the-emoji/api/check` (validate answer; apply scoring/penalties)  
- `POST /guess-the-emoji/api/hint` (reveal/remove/clue)  
- `POST /guess-the-emoji/api/daily/today` Â· `POST /guess-the-emoji/api/daily/submit`  
- `POST /guess-the-emoji/api/versus/create` Â· `POST /guess-the-emoji/api/versus/join` Â· `POST /guess-the-emoji/api/versus/submit`  
- `GET  /guess-the-emoji/api/packs/list` Â· `POST /guess-the-emoji/api/packs/start` Â· `POST /guess-the-emoji/api/packs/import`  
- `GET  /guess-the-emoji/api/stats` Â· `GET /guess-the-emoji/api/leaderboard`  
- `POST /guess-the-emoji/api/delete` Â· `POST /guess-the-emoji/api/duplicate`

---

## 4) Content Schema

**Puzzle**  
```json
{
  "id": "emj-0001",
  "emojis": "ðŸ”ðŸ ",
  "answer": "burger house",
  "aliases": ["burgerhouse", "burger home"],
  "category": "food & places",
  "difficulty": "easy",
  "explanation": "ðŸ” = burger, ðŸ  = house",
  "language": "en",
  "tags": ["compound word"]
}
```

**Keyboard Bank (optional mode)**  
```json
{
  "letters": "BURGERHOUSEALN",
  "disabled": ["X","Q"],
  "reveal_order": [5, 0, 9]
}
```

**Pack**  
```json
{
  "id": "pack-classics",
  "title": "Classics Vol.1",
  "language": "en",
  "category": "mixed",
  "size": 100,
  "visibility": "builtin"
}
```

---

## 5) Database Model (Astro DB / SQL)

**User**  
- `id` (pk), `email`, `plan`, `handle`, `language`, `timezone`, `createdAt`

**Puzzle**  
- `id` (pk uuid), `hash` (unique), `emojis` (text), `answer` (text), `aliases` (json),  
  `category` (string), `difficulty` ('easy'|'medium'|'hard'), `explanation` (text), `language` (string), `tags` (json), `source` ('builtin'|'import'), `createdAt`

**Pack**  
- `id` (pk uuid), `userId` (fk nullable), `title`, `description`, `language`, `category`, `size`, `visibility` ('private'|'public'|'builtin'), `createdAt`

**PackItem**  
- `packId` (fk), `puzzleId` (fk), `position` (int)

**Session**  
- `id` (pk uuid), `userId` (fk), `mode` ('classic'|'daily'|'timeattack'|'versus'), `packId` (fk nullable),  
  `puzzleIds` (json), `currentIndex` (int), `score` (int), `streak` (int), `timePerPuzzle` (int|null), `createdAt`, `expiresAt`

**AnswerLog**  
- `id` (pk), `sessionId` (fk), `puzzleId` (fk), `given` (text), `normalized` (text), `correct` (bool), `timeMs` (int), `points` (int), `hintPenalty` (int)

**DailySeed**  
- `date` (pk), `puzzleId` (fk), `leaderboardId` (fk)

**LeaderboardEntry**  
- `id` (pk), `scope` ('daily'|'global'|'pack'), `scopeKey` (date or packId), `userId` (fk), `score` (int), `timeMs` (int), `createdAt`

---

## 6) Normalization, Matching & Hints

### Answer Normalization
- Lowercase, trim, collapse spaces, remove punctuation, remove diacritics.  
- Replace common symbols: `&` â†’ `and`, `+` â†’ `plus`.  
- Optional: transliteration for local languages.

### Matching
- Exact match against **answer** or any **alias** after normalization.  
- Fuzzy pass if Damerauâ€‘Levenshtein distance â‰¤ 1 and within same token length Â±1 (Pro-only toggle).  
- Categoryâ€‘specific synonyms (e.g., **movie titles** ignore leading â€œthe/aâ€).

### Hints
- **Reveal Letter** (positions shown; uses current keyboard bank mode).  
- **Remove Letters** (remove two letters not in the answer).  
- **Clue** (short textual hint from `explanation` or curated `clue` field).  
- Penalties: Reveal âˆ’10 pts, Remove âˆ’5 pts, Clue âˆ’8 pts. Applied once per puzzle per type.

---

## 7) Scoring & Game Rules

- **Base Points:** Easy=100, Medium=150, Hard=200.  
- **Time Bonus (timed modes):** `ceil((remaining_ms / total_ms) * 100)`.  
- **Streak Multiplier:** `1.0 + (correct_streak * 0.05)` up to 2Ã—.  
- **Hint Penalty:** subtract from earned points, not below zero.  
- **Incorrect Guess Cooldown:** 1â€“2 seconds; show small nudge instead of harsh penalty.  
- **Session End:** show summary, shareable text/PNG.

**Daily Leaderboard**: rank by score; time as tiebreaker; antiâ€‘replay nonces.

---

## 8) Import/Export

- **CSV format:**  
  `emojis,answer,aliases (| separated),category,difficulty,explanation,language,tags (| separated)`  
- **JSON format:** array of Puzzle objects (see schema).  
- **Export:** session results (CSV/JSON); pack export (JSON).  
- **Dedup:** hash on `emojis + normalized(answer)`.

---

## 9) UI / Pages

### `/guess-the-emoji` (Hub)
- Start Classic (category, difficulty, pack); Daily card; Time Attack; Versus invite; recent stats.

### `/guess-the-emoji/play`
- Header: `Q 3/10`, score, streak, timer (if any).  
- Center: big emoji string; below: input field with onâ€‘screen keyboard (optional).  
- Hints row: Reveal, Remove, Clue; submit button; feedback chip.  
- Next / Skip (limited skips; âˆ’20 pts).

### `/guess-the-emoji/daily`
- Hero card; after finish: leaderboard + share score.

### `/guess-the-emoji/versus/[matchId]`
- Join screen â†’ play set â†’ results with sideâ€‘byâ€‘side scores.

### `/guess-the-emoji/packs`
- Builtâ€‘in packs; user packs with size and language; import wizard; validation report.

### `/guess-the-emoji/stats`
- Charts: accuracy, avg time, streak calendar, category strengths.

### `/guess-the-emoji/settings`
- Language, keyboard/IME options, hint toggles, high contrast, large text, motionâ€‘reduced.

---

## 10) API Contracts (examples)

### `POST /guess-the-emoji/api/session/create`
Req: `{ "mode":"classic", "category":"movies", "difficulty":"medium", "count":10, "timePerPuzzle":20 }`  
Res: `{ "sessionId":"<uuid>", "puzzleIds":[...], "timePerPuzzle":20 }`

### `POST /guess-the-emoji/api/next`
Req: `{ "sessionId":"<uuid>" }`  
Res: `{ "puzzle":{"id":"emj-0001","emojis":"ðŸ”ðŸ ","difficulty":"easy"} }`

### `POST /guess-the-emoji/api/check`
Req: `{ "sessionId":"<uuid>", "puzzleId":"emj-0001", "guess":"Burger House" }`  
Res: `{ "correct":true, "points":172, "streak":4, "explanation":"ðŸ” = burger, ðŸ  = house" }`

### `POST /guess-the-emoji/api/hint`
Req: `{ "sessionId":"<uuid>", "type":"reveal_letter" }`  
Res: `{ "hint":{"pos":3,"char":"g"}, "penalty":10 }`

### `POST /guess-the-emoji/api/daily/today`
Req: `{}`  
Res: `{ "sessionId":"<uuid>", "puzzleId":"<uuid>", "seed":"2025-10-28" }`

### `POST /guess-the-emoji/api/versus/create`
Req: `{ "category":"mixed", "difficulty":"mixed", "count":10 }`  
Res: `{ "matchId":"<uuid>", "inviteUrl":"/guess-the-emoji/versus/<uuid>" }`

### `POST /guess-the-emoji/api/versus/submit`
Req: `{ "matchId":"<uuid>", "sessionId":"<uuid>" }`  
Res: `{ "winner":"me|opponent|draw", "scores":{"me":1280,"opponent":1210} }`

### `GET /guess-the-emoji/api/leaderboard`
Req: `?scope=daily&key=2025-10-28&limit=50&offset=0`  
Res: `{ "rows":[{"user":"Karthik","score":1890,"timeMs":91000}], "me":{"rank":42} }`

### `POST /guess-the-emoji/api/packs/import`
Req: multipart CSV/JSON  
Res: `{ "ok":true, "imported":340, "duplicates":12, "errors":0 }`

---

## 11) Validation Rules

- Emoji string 1â€“12 characters (Unicode); must pass safeâ€‘list filter.  
- Answer 2â€“60 chars; aliases 0â€“10 items; language ISO code.  
- Categories from whitelist; difficulty âˆˆ {easy, medium, hard}.  
- Time per puzzle 10â€“45s in timed modes.  
- Import size â‰¤ 10 MB; â‰¤ 10k puzzles per pack.

---

## 12) Plans & Limits

| Feature | Free | Pro |
|--------|------|-----|
| Classic & Daily | Yes | Yes |
| Time Attack | â€” | Yes |
| Versus | â€” | Yes |
| Hints per puzzle | 1 | 3 |
| Imports | â€” | CSV/JSON (10k) |
| Analytics | Basic | Full |
| Leaderboards | Daily only | Daily + Global/Category |

Rate limits: `userId`+day for sessions; `userId`+minute for versus creates; `userId`+month for imports.

---

## 13) Accessibility & UX

- Big emoji font; high contrast; large text mode; screenâ€‘reader labels describe emojis (names via CLDR annotations).  
- Reduced motion; haptic ticks on keypress (mobile).  
- RTL layout for Arabic; languageâ€‘specific input normalization.

---

## 14) Suggested File Layout

```
src/pages/guess-the-emoji/index.astro
src/pages/guess-the-emoji/play.astro
src/pages/guess-the-emoji/daily.astro
src/pages/guess-the-emoji/versus/[matchId].astro
src/pages/guess-the-emoji/packs.astro
src/pages/guess-the-emoji/stats.astro
src/pages/guess-the-emoji/settings.astro

src/pages/guess-the-emoji/api/session/create.ts
src/pages/guess-the-emoji/api/next.ts
src/pages/guess-the-emoji/api/check.ts
src/pages/guess-the-emoji/api/hint.ts
src/pages/guess-the-emoji/api/daily/today.ts
src/pages/guess-the-emoji/api/daily/submit.ts
src/pages/guess-the-emoji/api/versus/create.ts
src/pages/guess-the-emoji/api/versus/join.ts
src/pages/guess-the-emoji/api/versus/submit.ts
src/pages/guess-the-emoji/api/packs/list.ts
src/pages/guess-the-emoji/api/packs/start.ts
src/pages/guess-the-emoji/api/packs/import.ts
src/pages/guess-the-emoji/api/stats.ts
src/pages/guess-the-emoji/api/leaderboard.ts
src/pages/guess-the-emoji/api/delete.ts
src/pages/guess-the-emoji/api/duplicate.ts

src/components/guess-the-emoji/Board/*.astro
src/components/guess-the-emoji/Controls/*.astro
src/components/guess-the-emoji/Packs/*.astro
src/components/guess-the-emoji/Stats/*.astro
```

---

## 15) Future Enhancements (v2+)

- **Themed Seasons** (Movies 90s, Kâ€‘pop titles, World Capitals).  
- **Creator Studio** with validation (duplicate/ambiguous answer detection).  
- **Confetti/Particles** microâ€‘interactions; shareable stickers.  
- **AI Assist** to propose aliases and categorize puzzles.  
- **PWA offline** for daily puzzle caching.

---

**End of Requirements â€” ready for Codex implementation.**
# ðŸ§© Puzzle Zone â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/puzzle`  
**Category:** Fun & Engagement  
**Stack:** Astro + Tailwind (islands where needed), Astro SSR API routes, Astro DB / Supabase, optional WebWorkers for generators/solvers  
**Goal:** Deliver an everâ€‘fresh library of **logic and word puzzles** with daily challenges, generators, hints, scoring, and packs. Integrates with **Trivia Arena** for streaks and with **FlashNote** for vocabulary.

---

## 1) Objectives & Nonâ€‘Goals

### Objectives
- Support a curated set of puzzle types at v1 with solid UX and generators/validators:
  - **Crossword (mini 5Ã—5 / 9Ã—9)**  
  - **Word Search**  
  - **Sudoku (4Ã—4 / 9Ã—9)**  
  - **Kakuro (mini)**  
  - **Nonogram (Picross)**  
  - **Sliding Puzzle (3Ã—3 / 4Ã—4)**  
  - **15â€‘Puzzle**  
  - **Logic Grid Puzzles (who owns the zebra?)**  
  - **Riddles** (textual)
- Modes: **Solo**, **Daily Puzzle**, **Packs**, and **Time Attack**.  
- **Hint system** and **error checking**, with configurable strictness.  
- **Scoring** with time/accuracy, and **streaks** (shared across Fun apps).  
- **Puzzle Packs** (builtâ€‘in and userâ€‘imported).  
- **Export** puzzle & solution to PDF/PNG/JSON.  

### Nonâ€‘Goals (v1)
- No multiplayer realtime races (consider later).  
- No camera uploads for jigsaw in v1 (image jigsaw can be v2).  
- No user chat/comments.

---

## 2) User Stories (Acceptance Criteria)

1. **Play a Puzzle**
   - *As a user*, I pick a type (e.g., Sudoku 9Ã—9) and difficulty (Easy/Medium/Hard).  
   - **AC:** `/puzzle/api/create` returns a `PuzzleInstance` with grid + metadata; `/play/[id]` loads it with timer.

2. **Request Hints & Checking**
   - *As a user*, I can **Check Cell/Row/Board**, **Reveal Cell/Word**, or **Get Logical Hint**.  
   - **AC:** `/puzzle/api/hint` returns a hint atom and applies penalties.

3. **Daily Puzzle**
   - *As a user*, I play a seeded daily puzzle once; my rank appears on the daily leaderboard.  
   - **AC:** `/puzzle/api/daily/today` returns the instance; `/daily/submit` posts score; antiâ€‘replay enforced.

4. **Puzzle Packs**
   - *As a user*, I browse builtâ€‘in and imported packs, start any puzzle, and track completion % per pack.  
   - **AC:** `/puzzle/api/packs/list` + `/packs/start` create/load instances.

5. **Time Attack**
   - *As a user*, I solve as many microâ€‘puzzles as possible in 3 minutes (Word search snippets, mini Sudoku 4Ã—4).  
   - **AC:** `/puzzle/api/timeattack/start` â†’ stream of microâ€‘boards; `/timeattack/submit` totals score.

6. **Import/Export**
   - *As a user*, I import JSON/PUZ (crossword) or simple CSV word lists; I can export to PNG/PDF/JSON.  
   - **AC:** `/puzzle/api/import` validates schema and dedupes by hash; `/export` generates files.

7. **Stats & Streaks**
   - *As a user*, I see time to solve, hints used, accuracy, best streak, and perâ€‘type skill chart.  
   - **AC:** `/puzzle/api/stats` aggregates per user and per type.

8. **Plan Gating**
   - Free: Daily + Solo, limited hints, basic exports.  
   - Pro: Packs import, advanced hints, Time Attack, full exports (PDF/PNG), global leaderboards.

---

## 3) Routes & Information Architecture

- `/puzzle` â€” Hub: choose type/difficulty; Daily card; Packs; Time Attack; recent stats.  
- `/puzzle/play/[id]` â€” Generic play UI container that mounts the correct component by puzzle type.  
- `/puzzle/daily` â€” Daily entry and leaderboard.  
- `/puzzle/packs` â€” Pack browser (builtâ€‘in + user imports).  
- `/puzzle/timeattack` â€” Time Attack mode.  
- `/puzzle/stats` â€” Personal analytics.  
- `/puzzle/settings` â€” Preferences (grid size, checking strictness, highlight errors, color themes, keyboard).

**API (SSR):**  
- `POST /puzzle/api/create` (create instance from type/difficulty/seed)  
- `POST /puzzle/api/hint` (contextual hints)  
- `POST /puzzle/api/check` (validate full/partial board)  
- `POST /puzzle/api/submit` (finish; compute score)  
- `POST /puzzle/api/daily/today` Â· `POST /puzzle/api/daily/submit`  
- `GET  /puzzle/api/packs/list` Â· `POST /puzzle/api/packs/start`  
- `POST /puzzle/api/timeattack/start` Â· `POST /puzzle/api/timeattack/submit`  
- `POST /puzzle/api/import` Â· `POST /puzzle/api/export`  
- `GET  /puzzle/api/stats` Â· `GET /puzzle/api/leaderboard`  
- `POST /puzzle/api/delete` Â· `POST /puzzle/api/duplicate`

---

## 4) Database Model (Astro DB / SQL)

**User**  
- `id` (pk), `email`, `plan`, `handle`, `timezone`, `createdAt`

**Puzzle** (template/seed)  
- `id` (pk uuid), `type` ('crossword'|'wordsearch'|'sudoku'|'kakuro'|'nonogram'|'sliding'|'fifteen'|'logic'|'riddle'),  
  `difficulty` ('easy'|'medium'|'hard'), `data` (json), `solution` (json|text), `source` ('generator'|'import'|'builtin'), `createdAt`

**PuzzleInstance** (playable copy)  
- `id` (pk uuid), `puzzleId` (fk|null if generated on the fly), `userId` (fk), `mode` ('solo'|'daily'|'pack'|'timeattack'),  
  `state` (json), `hintsUsed` (int), `errors` (int), `timeMs` (int), `score` (int), `completed` (bool), `seed` (string|null), `createdAt`, `expiresAt`

**Attempt**  
- `id` (pk), `instanceId` (fk), `event` ('input'|'hint'|'check'|'submit'), `payload` (json), `ts`

**Pack**  
- `id` (pk uuid), `title`, `description`, `ownerId` (fk nullable for builtin), `visibility` ('private'|'public'|'builtin'), `createdAt`

**PackItem**  
- `packId` (fk), `puzzleId` (fk), `position` (int)

**DailySeed**  
- `date` (pk), `type`, `puzzleId` (fk|null), `seed`, `leaderboardId` (fk)

**LeaderboardEntry**  
- `id` (pk), `scope` ('daily'|'global'|'type'), `scopeKey` (date or type), `userId` (fk), `score` (int), `timeMs` (int), `createdAt`

**HintUsage**  
- `id` (pk), `instanceId` (fk), `type` ('check_cell'|'reveal_cell'|'reveal_word'|'logic_hint'), `penalty` (int), `ts`

---

## 5) Generators & Validators (Algorithms)

### Sudoku
- **Generator:** randomized backtracking with diagonal block seeding; remove clues while ensuring **unique solution** using solver check.  
- **Solver/Validator:** constraint propagation + backtracking; quick invalid state detection.

### Crossword (Mini)
- **Grid fill:** backtracking with word list; symmetric grid optional.  
- **Clue assignment:** basic clue templates (â€œSynonym of â€¦â€, â€œOpposite of â€¦â€) + manual override.  
- **Validator:** check crossing consistency; no orphan letters.

### Word Search
- **Placement:** place words in 8 directions; fill remainder with random letters; ensure nonâ€‘overlap rules.  
- **Validator:** coordinates & direction match; caseâ€‘insensitive.

### Kakuro
- **Generation:** start from solved grid; carve runs with sum clues; ensure uniqueness.  
- **Validator:** digit uniqueness per run; sum constraints.

### Nonogram
- **Generator:** start from bitmap; compute row/column runs.  
- **Validator/Solver:** lineâ€‘byâ€‘line deduction + contradiction checks.

### Logic Grid
- **Engine:** propositional constraints; solve with backtracking + constraint propagation; hints suggest next deducible step.

### Sliding/15â€‘Puzzle
- **Shuffler:** random even permutations only (solvable).  
- **Validator:** count inversions; solved when sequence ordered.

### Riddles
- Text only; solution string; accept synonyms (small fuzzy distance).

---

## 6) Scoring & Hints

- **Base score:** per type + difficulty (e.g., Easy=100, Medium=200, Hard=300).  
- **Time bonus:** `ceil((maxTimeMs - timeMs)/maxTimeMs * 100)` with floor at 0.  
- **Accuracy bonus:** âˆ’5 per error; âˆ’10 per wrong check.  
- **Hint penalties:** Check Cell âˆ’5, Reveal Cell âˆ’15, Reveal Word/Number âˆ’30, Logic Hint âˆ’20.  
- **Streak multiplier:** `1.0 + (streak * 0.05)` capped at 2Ã—.  
- **Daily leaderboard:** score, then time as tiebreaker.

---

## 7) Import/Export

- **Crossword:** accept **.puz** (v1 limited), JSON with `{grid, cluesAcross, cluesDown}`.  
- **Word Search:** CSV lines (`WORD,CLUE(optional)`).  
- **Sudoku/Kakuro/Nonogram:** JSON puzzle spec.  
- **Export:** PNG/PDF board + solution (watermark on Free), JSON spec (Pro).

---

## 8) UI / Pages

### `/puzzle` (Hub)
- Type tiles; Daily card; Packs; Time Attack; â€œContinue last puzzleâ€.

### `/puzzle/play/[id]`
- Header: timer, score, hints, mistakes; Pause/Submit.  
- Grid canvas (per type component) with keyboard and touch controls; color themes; **error highlight** toggle.  
- Sidebar: clues (crossword), sums (kakuro), runs (nonogram).  
- Hint menu.

### `/puzzle/daily`
- Start button; after submit: leaderboard with rank and share button.

### `/puzzle/packs`
- Builtâ€‘in packs + user imports; completion progress; start/resume buttons.

### `/puzzle/timeattack`
- Countdown header; sequence of microâ€‘puzzles; quick feedback.

### `/puzzle/stats`
- Charts: solve time distribution, accuracy, hints usage, streak calendar, perâ€‘type rating.

### `/puzzle/settings`
- Preferences: checking strictness, color theme, keyboard, contrast, grid size.

---

## 9) API Contracts (examples)

### `POST /puzzle/api/create`
Req: `{ "type":"sudoku","difficulty":"medium" }`  
Res: `{ "instanceId":"<uuid>","board":[[0,0,...]],"meta":{"type":"sudoku","difficulty":"medium"}}`

### `POST /puzzle/api/hint`
Req: `{ "instanceId":"<uuid>","context":{"cell":[3,4]}}`  
Res: `{ "hint":{"type":"reveal_cell","value":7},"penalty":15 }`

### `POST /puzzle/api/check`
Req: `{ "instanceId":"<uuid>", "scope":"board|row|cell", "target":[r,c] }`  
Res: `{ "ok":true,"errors":[[1,2],[4,7]] }`

### `POST /puzzle/api/submit`
Req: `{ "instanceId":"<uuid>" }`  
Res: `{ "completed":true,"score":512,"timeMs":286000 }`

### `POST /puzzle/api/daily/today`
Req: `{}` â†’ Res: `{ "instanceId":"<uuid>","seed":"2025-10-28","type":"crossword" }`

### `POST /puzzle/api/timeattack/start`
Req: `{ "types":["sudoku4","wordsearch"],"minutes":3 }` â†’ Res: `{ "streamId":"<uuid>" }`

### `POST /puzzle/api/import`
Req: multipart file or JSON body â†’ Res: `{ "ok":true, "imported":12, "duplicates":1 }`

---

## 10) Validation Rules

- Difficulty âˆˆ {easy, medium, hard}.  
- Board sizes: Sudoku 4Ã—4/9Ã—9; Nonogram up to 15Ã—15 in v1; Crossword up to 9Ã—9.  
- TimeAttack minutes 1â€“10.  
- Import size â‰¤ 5 MB, â‰¤ 2,000 puzzles per pack.  
- Strict JSON schema per type; reject ambiguous specs.

---

## 11) Plans & Limits

| Feature | Free | Pro |
|--------|------|-----|
| Daily Puzzle | Yes | Yes |
| Solo Types | Core set | All types |
| Hints per puzzle | 2 | 8 |
| Packs | Builtâ€‘in only | Import + create |
| Exports | PNG (watermark) | PDF/PNG/JSON (no watermark) |
| Time Attack | â€” | Yes |
| Leaderboards | Daily only | Global + Type |

Rate limits: `userId`+day for create/hint/check; `userId`+month for exports/imports.

---

## 12) Accessibility & UX

- Full keyboard navigation; highâ€‘contrast themes; large cell sizes; screenâ€‘reader labels for clues.  
- Reduced motion; haptic feedback on mobile (where supported).  
- RTL support for Arabic word puzzles.

---

## 13) Suggested File Layout

```
src/pages/puzzle/index.astro
src/pages/puzzle/play/[id].astro
src/pages/puzzle/daily.astro
src/pages/puzzle/packs.astro
src/pages/puzzle/timeattack.astro
src/pages/puzzle/stats.astro
src/pages/puzzle/settings.astro

src/pages/puzzle/api/create.ts
src/pages/puzzle/api/hint.ts
src/pages/puzzle/api/check.ts
src/pages/puzzle/api/submit.ts
src/pages/puzzle/api/daily/today.ts
src/pages/puzzle/api/daily/submit.ts
src/pages/puzzle/api/packs/list.ts
src/pages/puzzle/api/packs/start.ts
src/pages/puzzle/api/timeattack/start.ts
src/pages/puzzle/api/timeattack/submit.ts
src/pages/puzzle/api/import.ts
src/pages/puzzle/api/export.ts
src/pages/puzzle/api/stats.ts
src/pages/puzzle/api/leaderboard.ts
src/pages/puzzle/api/delete.ts
src/pages/puzzle/api/duplicate.ts

src/components/puzzle/Sudoku/*.astro
src/components/puzzle/Crossword/*.astro
src/components/puzzle/WordSearch/*.astro
src/components/puzzle/Kakuro/*.astro
src/components/puzzle/Nonogram/*.astro
src/components/puzzle/Sliding/*.astro
src/components/puzzle/LogicGrid/*.astro
src/components/puzzle/Shared/*.astro
```

---

## 14) Future Enhancements (v2+)

- **Jigsaw (image upload)** with edge snapping and ghost image.  
- **KenKen**, **Hitori**, **Hashi (Bridges)**.  
- **Weekly Tournaments** (nonâ€‘monetary).  
- **Adaptive difficulty** per user with perâ€‘type rating.  
- **Puzzle editor** for community sharing (moderated).

---

**End of Requirements â€” ready for Codex implementation.**
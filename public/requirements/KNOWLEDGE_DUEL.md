# âš”ï¸ Knowledge Duel â€” Full Requirements (Ansiversa)

This document contains a **short summary** for Codex onboarding and the **full technical spec** for implementing the mini app.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### Overview
**Knowledge Duel** is a headâ€‘toâ€‘head trivia battler built on top of **Quiz Institute** question banks. Players challenge friends or get autoâ€‘matched, answer questions in realâ€‘time or turnâ€‘based modes, and climb seasonal leaderboards. Designed for quick, replayable sessions with fair scoring and antiâ€‘cheat.

### Core Features
- **Modes:** Realâ€‘time (speed + accuracy), Turnâ€‘based (asynchronous), Solo practice.  
- **Question Sources:** Quiz Institute categories, difficulty tiers, and curated sets.  
- **Rounds:** 5â€“10 questions per match, time per question 10â€“30s.  
- **Scoring:** Accuracy, speed bonus, streaks, and negative marking options.  
- **Matchmaking:** ELOâ€‘like rating, friend challenges, rematches.  
- **Leaderboards:** Global, weekly season, friends, and category ladders.  
- **Antiâ€‘Cheat:** serverâ€‘timed questions, answer hashing, rate limits, anomaly detection.  
- **Rewards:** XP, badges, streaks; optional coins for cosmetics.  
- **Spectate & Share:** postâ€‘match recap, shareable highlights.  
- **Integrations:** Quiz Institute (questions), Trivia Arena (solo play), Profile/Resume badges.

### Key Pages
- `/duel` â€” Lobby (find match, create room, join via code)  
- `/duel/match/[id]` â€” Live match UI  
- `/duel/results/[id]` â€” Recap & breakdown  
- `/duel/leaderboards` â€” Ladders & seasons  
- `/duel/history` â€” Past matches & replays  
- `/duel/settings` â€” Preferences (topics, time, difficulty)

### Minimal Data Model
`User`, `Match`, `Round`, `QuestionRef`, `Answer`, `Rating`, `LeaderboardEntry`, `Season`, `Report`

### Plan Gating
| Feature | Free | Pro |
|--------|------|-----|
| Daily matches | 10 | Unlimited |
| Question sets | Core | All + custom |
| Leaderboards | Global only | Global + friends + category |
| Rematch/friends | â€” | Enabled |
| Replays/analytics | Basic | Full |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives & Nonâ€‘Goals
**Objectives**
- Fair, fun duels using trusted question banks.  
- Multiple modes (realâ€‘time, turnâ€‘based) with solid antiâ€‘cheat.  
- Progression system (XP, ELO rating, badges).  
- Seasonal leaderboards and category ladders.  
- Smooth mobile UX with low latency.

**Nonâ€‘Goals (v1)**
- No realâ€‘money wagering.  
- No public chat (emoji/quick reactions only).  
- No custom userâ€‘generated questions (admin curated only).

---

### 2) Game Modes & Mechanics

**2.1 Realâ€‘time Duel**
- 1v1, 5â€“10 questions; 10â€“30s per question.
- Questions revealed **serverâ€‘timed**; answers POST within window.
- **Scoring (default):** +10 correct, 0 skip, âˆ’3 wrong; **speed bonus:** up to +5 (linear with remaining time). **Streak:** +3 after 3 correct in a row.
- Tieâ€‘break: fastest aggregate response time, then suddenâ€‘death 1â€“3 questions.

**2.2 Turnâ€‘based Duel**
- Asynchronous: Player A answers all; Player B has â‰¤24h to respond.
- Hidden answers until both complete; scoring identical to realâ€‘time (without speed bonus unless perâ€‘question timers are respected clientâ€‘side with server verification).
- Reminders (app only, no email in v1).

**2.3 Solo Practice**
- Uses same scoring sans opponent; feeds XP, not rating.
- Good for warmâ€‘up and onboarding.

**2.4 Question Pools**
- Pull from Quiz Institute: parameters = category, subâ€‘topic, difficulty, question type (MCQ/TF/numeric).  
- **Deterministic seed** per match to enable replays and antiâ€‘tamper.

---

### 3) Information Architecture & Routes

**Pages**
- `/duel` â€” Lobby: Quick Match, Create Room, Join with Code, Practice.  
- `/duel/match/[id]` â€” Live board: timer, question, choices, progress, reaction emojis.  
- `/duel/results/[id]` â€” Score, perâ€‘question breakdown, accuracy, speed graph, share.  
- `/duel/leaderboards` â€” Global/Season/Friends/Category tabs.  
- `/duel/history` â€” Recent matches; replay viewer.  
- `/duel/settings` â€” Topics, difficulty, time per question, privacy.

**API (SSR)**
- Match lifecycle:  
  - `POST /duel/api/match/create`  
  - `POST /duel/api/match/join`  
  - `GET  /duel/api/match` (state by id)  
  - `POST /duel/api/match/ready`  
  - `POST /duel/api/match/finish`
- Rounds & answers:  
  - `GET  /duel/api/round/next`  
  - `POST /duel/api/answer/submit`  
  - `GET  /duel/api/results`
- Matchmaking & ratings:  
  - `POST /duel/api/matchmaking/queue`  
  - `POST /duel/api/rating/update` (serverâ€‘side only)  
- Leaderboards & seasons:  
  - `GET  /duel/api/leaderboard`  
  - `GET  /duel/api/season/current`
- History & replays:  
  - `GET  /duel/api/history`  
  - `GET  /duel/api/replay`
- Reports & abuse:  
  - `POST /duel/api/report`

**WebSocket (optional for realâ€‘time)**
- `/duel/ws` â€” events: `match:start`, `round:show`, `timer:tick`, `answer:ack`, `match:end`.

---

### 4) Data Model (Astro DB / SQL)

**User**  
- `id` (pk), `handle`, `avatar`, `plan`, `rating` (int, default 1000), `xp` (int), `country`, `createdAt`

**Match**  
- `id` (uuid pk), `mode` ('realtime'|'turn'), `status` ('pending'|'active'|'complete'|'expired'), `seed` (int),  
  `p1Id` (fk), `p2Id` (fk|null), `winnerId` (fk|null), `rounds` (int), `timePerQ` (int), `category` (string), `difficulty` ('easy'|'med'|'hard'), `createdAt`, `completedAt`

**Round**  
- `id` (pk), `matchId` (fk), `index` (int), `questionRefId` (fk), `startAt` (ts server), `endAt` (ts server)

**QuestionRef**  
- `id` (pk), `source` ('quiz_institute'), `sourceId` (string), `type` ('mcq'|'tf'|'numeric'), `meta` (json), `hash` (string)

**Answer**  
- `id` (pk), `matchId` (fk), `roundId` (fk), `userId` (fk), `choice` (string|null), `isCorrect` (bool), `elapsedMs` (int), `scoreDelta` (int), `createdAt`

**Rating**  
- `id` (pk), `userId` (fk), `before` (int), `after` (int), `matchId` (fk), `delta` (int), `createdAt`

**LeaderboardEntry**  
- `id` (pk), `seasonId` (fk), `userId` (fk), `points` (int), `wins` (int), `losses` (int), `streak` (int), `updatedAt`

**Season**  
- `id` (pk), `name`, `startsOn`, `endsOn`, `rules` (json), `rewards` (json)

**Replay**  
- `id` (pk), `matchId` (fk), `events` (json compressed), `createdAt`

**Report**  
- `id` (pk), `matchId` (fk), `reporterId` (fk), `reason`, `details`, `createdAt`, `status` ('new'|'triaged'|'resolved')

---

### 5) Scoring & Rating

**Perâ€‘question scoring (default):**  
- Correct: +10; Wrong: âˆ’3; Skip/Timeout: 0.  
- Speed bonus (realâ€‘time): `floor(5 * remaining_time / total_time)`  
- Streak: +3 bonus starting at 3+ consecutive correct, resets on wrong/skip.

**Match result:** sum of question scores.  
**ELO update:** `Î” = K * (score_actual âˆ’ score_expected)` with `K=24`, expected from rating difference; protect new users with provisional K=40 for first 10 matches.

**Category ladders:** points = base (win=3, draw=1) Ã— category multiplier (hard=1.5).

---

### 6) Antiâ€‘Cheat & Fair Play

- **Serverâ€‘timed windows**: round `startAt`/`endAt` from server; client clocks ignored.  
- **Answer hashing**: send answer choice, server validates vs hashed canonical solution.  
- **No prefetch**: next question payload available **only** after both answers submitted or time up.  
- **Latency tolerance**: grace period 300ms; record `elapsedMs` based on server receipt time.  
- **Anomaly detection**: flag if `elapsedMs < 250ms` repeatedly or accuracy > 99% over 100+ questions.  
- **Rate limits**: per user & IP on `/answer/submit`, `/match/create`, `/matchmaking/queue`.  
- **Turnâ€‘based expiry**: 24h; autoâ€‘forfeit if no response.

---

### 7) UX / UI

- **Lobby**: Quick Match, Create Room (code), Join, Practice; topic & difficulty filters.  
- **Live match**: question card, timer ring, choices, lockâ€‘in state, emoji reactions (ðŸ‘ðŸ˜®ðŸ”¥), progress bar, perâ€‘round results.  
- **Results**: accuracy %, average time, streak chart, perâ€‘question review with explanations.  
- **Leaderboards**: tabs (Global, Season, Friends, Category), search, country flags.  
- **History/Replays**: list with W/L, rating delta, replay viewer (step through rounds).  
- **Settings**: default categories, time per question, privacy (allow challenges?).  
- **Mobileâ€‘first**: big tap targets; offline handling for reconnect within 5s.

Accessibility: high contrast, screenâ€‘reader labels, keyboard shortcuts (1â€‘4 to answer, Enter to lock).

---

### 8) API Contracts (Examples)

**Create Match**  
`POST /duel/api/match/create`  
```json
{
  "mode":"realtime",
  "rounds":7,
  "timePerQ":15,
  "category":"General Knowledge",
  "difficulty":"med"
}
```
Res: `{ "matchId":"<uuid>", "joinCode":"ABCD" }`

**Join Match**  
`POST /duel/api/match/join`  
```json
{ "matchId":"<uuid>" }
```
Res: `{ "ok":true }`

**Next Round (server reveals)**  
`GET /duel/api/round/next?matchId=<uuid>`  
Res: `{ "roundId":123, "question":{"id":"q_981","type":"mcq","text":"...","choices":["A","B","C","D"]}, "startAt":1692000000,"endAt":1692000015 }`

**Submit Answer**  
`POST /duel/api/answer/submit`  
```json
{ "matchId":"<uuid>", "roundId":123, "choice":"B" }
```
Res: `{ "ack":true, "isCorrect":true, "scoreDelta":14 }`

**Results**  
`GET /duel/api/results?matchId=<uuid>`  
Res: `{ "winnerId":"u_1", "p1":{"score":81,"accuracy":86}, "p2":{"score":77,"accuracy":80}, "breakdown":[...], "ratingDelta":{"u_1":+14,"u_2":-14} }`

**Leaderboard**  
`GET /duel/api/leaderboard?season=current&type=global&limit=100`

---

### 9) Validation Rules

- Rounds: 3â€“15; Time per question: 5â€“60s.  
- Categories/difficulties must exist in Quiz Institute metadata.  
- One active realtime match per user; turnâ€‘based max 10 concurrent per user.  
- Replay payload < 200KB (compress events).  
- Nicknames 2â€“20 chars; no profanity (basic filter).

---

### 10) Plans & Limits

| Feature | Free | Pro |
|--------|------|-----|
| Daily matches | 10 | Unlimited |
| Turnâ€‘based slots | 2 | 10 |
| Categories | Core | All + premium |
| Leaderboards | Global | + Friends + Category |
| Rematch & friends list | â€” | Enabled |
| Replays/analytics | Basic | Detailed graphs |
| Custom rooms | â€” | Password + private |
| Cosmetics | Limited | Full set |

Rate limits: `/match/create` 10/day (Free) 50/day (Pro); `/answer/submit` 2 req/sec burst 10.

---

### 11) Suggested File Layout

```
src/pages/duel/index.astro
src/pages/duel/match/[id].astro
src/pages/duel/results/[id].astro
src/pages/duel/leaderboards.astro
src/pages/duel/history.astro
src/pages/duel/settings.astro

src/pages/duel/api/match/create.ts
src/pages/duel/api/match/join.ts
src/pages/duel/api/match/index.ts
src/pages/duel/api/match/ready.ts
src/pages/duel/api/match/finish.ts
src/pages/duel/api/round/next.ts
src/pages/duel/api/answer/submit.ts
src/pages/duel/api/results.ts
src/pages/duel/api/leaderboard.ts
src/pages/duel/api/season/current.ts
src/pages/duel/api/history.ts
src/pages/duel/api/replay.ts
src/pages/duel/api/report.ts

src/components/duel/Lobby/*.astro
src/components/duel/Live/*.astro
src/components/duel/Results/*.astro
src/components/duel/Leaderboards/*.astro
```

---

### 12) Future Enhancements (v2+)

- **Team battles** (2v2, 3v3) and tournaments.  
- **Powerâ€‘ups** (e.g., 50/50, freeze timer) balanced for fairness.  
- **Category streak quests** and daily missions.  
- **Classrooms mode** for teachers to host live games.  
- **Regional servers** and latencyâ€‘adaptive timers.  
- **PWA offline** (practice & replays).

---

**End of Requirements â€” Ready for Codex Implementation.**
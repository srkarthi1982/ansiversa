# ðŸ”¤ Daily Word Challenge â€” Full Requirements (Ansiversa)

This document includes a **Codex-friendly summary** and a **full technical specification** to implement the mini app.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### Overview
**Daily Word Challenge** is a lightweight, addictive vocabulary game. Each day, users get a curated **word pack** (1â€“5 items) with **clues, context sentences, and microâ€‘tasks** (guess meaning, pick correct usage, type synonym/antonym, fill cloze). It tracks **streaks**, **accuracy**, and **speed**, and connects to **Dictionary+** and **Language Flashcards** to convert wins into longâ€‘term learning.

### Core Features
- **Daily pack** (rotates by language, level A1â€“C2, and theme).  
- **Task types**: definition guess (MCQ), usage pick, synonym/antonym, cloze typing, audioâ€‘toâ€‘word (Pro), image hint (v2).  
- **Streaks & scoring**: score = accuracy Ã— speed bonus; daily leaderboard (Pro, optional).  
- **Hints**: IPA, part of speech, brief usage note; â€œOpen in Dictionary+â€.  
- **Afterâ€‘action**: add missed words to **Language Flashcards** in one click.  
- **Archive**: play previous days (Pro) without affecting â€œtodayâ€™sâ€ streak.  
- **Notifications**: gentle daily reminder window.

### Key Pages
- `/daily-word-challenge` â€” Todayâ€™s challenge start/resume  
- `/daily-word-challenge/play` â€” Game UI  
- `/daily-word-challenge/summary/[id]` â€” Results & learning links  
- `/daily-word-challenge/archive` â€” Past challenges (Pro)  
- `/daily-word-challenge/stats` â€” Streaks & accuracy trends  
- `/daily-word-challenge/settings` â€” Language level, reminder time, hints

### Minimal Data Model
`DailyPack`, `DailyItem`, `Attempt`, `Score`, `Streak`, `Settings`, `Leaderboard` (Pro), `Hint`, `Tag`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Daily pack | Today only | Today + archive + replay |
| Tasks per day | 3 | 5 |
| Hints | Basic | Full (IPA/audio/usage) |
| Leaderboard | â€” | Daily/weekly |
| Export to Flashcards | âœ… | âœ… |
| Notifications | âœ… | âœ… |

Integrations: **Dictionary+**, **Language Flashcards**, **Study Planner** (schedule 10â€‘min drill), **Exam Simulator** (vocab section).

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives & Nonâ€‘Goals
**Objectives**
- Provide a **fast, fun** daily vocabulary drill that nudges longâ€‘term retention.  
- Respect **multilingual** pairs and **CEFR** levels.  
- Encourage conversion of misses â†’ flashcards and short planner sessions.

**Nonâ€‘Goals (v1)**
- No realâ€‘time multiplayer.  
- No userâ€‘generated daily packs (curated seeds only).  
- No external web scraping.

---

### 2) Information Architecture & Routes

**Pages**
- `/daily-word-challenge` â€” â€œPlay Todayâ€™s Packâ€; shows level, theme, time estimate, streak badge.  
- `/daily-word-challenge/play` â€” Task runner (progress 1/5; timer; hint; skip).  
- `/daily-word-challenge/summary/[id]` â€” Score, accuracy, time, streak update, missed words â†’ â€œAdd to Flashcardsâ€.  
- `/daily-word-challenge/archive` â€” Calendar list of previous days; replay doesnâ€™t change streak.  
- `/daily-word-challenge/stats` â€” Streak chart, accuracy trend, top tags.  
- `/daily-word-challenge/settings` â€” Language, level, reminder, hints, audio.

**API (SSR)**
- Packs: `GET /daily-word-challenge/api/today?lang=&level=` Â· `GET /daily-word-challenge/api/pack?id=`  
- Attempts: `POST /daily-word-challenge/api/attempt` (submit response)  
- Finish: `POST /daily-word-challenge/api/finish` (compute score, update streak)  
- Stats: `GET /daily-word-challenge/api/stats`  
- Leaderboard (Pro): `GET /daily-word-challenge/api/leaderboard?range=daily|weekly`  
- Export: `POST /daily-word-challenge/api/flashcards/send` Â· `POST /daily-word-challenge/api/dictionary/open`  
- Settings: `POST /daily-word-challenge/api/settings/save`  
- Notifications: `POST /daily-word-challenge/api/notify/register`

Optional WebSocket `/daily-word-challenge/ws` for timer ticks; HTTP is fine for v1.

---

### 3) Game Mechanics & Scoring

**Task types**
- `mcq_def`: choose the correct definition among 4 options.  
- `mcq_usage`: pick the sentence that uses the word correctly.  
- `syn_ant`: type or pick a synonym/antonym.  
- `cloze`: fill a missing word; optional â€œlenientâ€ check (Levenshtein â‰¤1).  
- `audio_word` (Pro): listen to TTS audio and type the word.

**Scoring**
- Base points per item: 100.  
- Accuracy bonus: full if first try; partial on second (âˆ’40%).  
- Speed bonus: `+floor(max(0, 20 - seconds_taken)) * 3`.  
- Daily total = sum of item scores.  
- Streak day counts if daily total â‰¥ **threshold** (e.g., 250 points).

**Hints & penalties**
- Show IPA/POS/usage hint â†’ âˆ’10 points each time used.  
- â€œOpen in Dictionary+â€ does not award/penalize (just opens in new tab).

**Streak rules**
- Daily streak increments once per day on threshold met.  
- Grace: 1 â€œskip dayâ€ per 14 days for Pro (autoâ€‘kept streak).

---

### 4) Data Model (Astro DB / SQL)

**DailyPack**  
- `id` (pk), `date` (yyyyâ€‘mmâ€‘dd UTC), `langCode` ('en','es','ar','ta',...), `level` ('A1'..'C2'), `theme` (text), `items` (json), `tags` (json), `createdAt`

**DailyItem** (stored inside pack `items`, also materialized for analytics)  
- `id` (pk), `packId` (fk), `lemmaId` (fkâ†’Dictionary+.Lemma), `taskType` ('mcq_def'|'mcq_usage'|'syn_ant'|'cloze'|'audio_word'),  
  `prompt` (json), `answer` (json), `hints` (json), `explain` (text), `difficulty` (1..5)

**Attempt**  
- `id` (pk), `userId` (fk), `packId` (fk), `itemId` (fk), `response` (json), `correct` (bool), `tries` (int), `seconds` (int), `hintCount` (int), `score` (int), `createdAt`

**Score**  
- `id` (pk), `userId` (fk), `packId` (fk), `total` (int), `accuracy` (float), `timeSec` (int), `breakdown` (json), `createdAt`

**Streak**  
- `id` (pk), `userId` (fk), `current` (int), `best` (int), `lastDate` (date), `skipsLeft` (int)

**Settings**  
- `id` (pk), `userId` (fk), `language` (code), `level` ('A1'..'C2'), `remindAt` (time), `hints` (json), `audio` (bool)

**Leaderboard** (Pro)  
- `id` (pk), `date` (date), `langCode`, `level`, `userId`, `rank` (int), `score` (int), `createdAt`

**Hint**  
- `id` (pk), `itemId` (fk), `type` ('ipa'|'pos'|'usage'|'audio'), `payload` (json)

**Tag**  
- `id` (pk), `name`, `color`

Indexes: `DailyPack.date+langCode+level` unique; `Attempt.userId+packId`, `Score.userId+packId`, `Leaderboard.date+level`.

---

### 5) Content & Pack Generation

- Start from **Dictionary+ Lemma** seed lists by level/theme.  
- For MCQ distractors: sample **sameâ€‘POS** lemmas with **similar frequency** and **different definitions**.  
- Cloze sentences pulled from **Example** table; blank the target lemma with context.  
- Syn/ant items from `Relation` table.  
- Audio uses TTS for the lemma.  
- Pack size defaults: **Free=3; Pro=5** items/day.  
- Generation runs **serverâ€‘side** (cron) and writes `DailyPack` per language/level for the next N days (N=7).

---

### 6) UX / UI

- **Start screen**: theme, level, estimated time (e.g., â€œ~3 minâ€), streak badge, Play button.  
- **Play UI**: progress dots; timer; item card; **hint** affordances; keyboard shortcuts; mobileâ€‘first.  
- **Summary**: score confetti; streak update; â€œAdd all missed to Flashcardsâ€; â€œOpen all in Dictionary+â€.  
- **Stats**: streak calendar heatmap; accuracy trend line; top weaknesses by tag/POS.  
- Accessibility: focus outlines, SR labels, RTL layouts, reduced motion.

---

### 7) API Contracts (Examples)

**Get todayâ€™s pack**  
`GET /daily-word-challenge/api/today?lang=en&level=B2`  
Res: `{ "packId":"p2025-10-29-en-B2", "date":"2025-10-29", "items":[{"id":"i1","taskType":"mcq_def","prompt":{...}}], "size":3 }`

**Submit attempt**  
`POST /daily-word-challenge/api/attempt`  
```json
{ "packId":"p2025-10-29-en-B2", "itemId":"i1", "response":{"choice":2}, "seconds":9, "hintCount":1 }
```
Res: `{ "correct":true, "score":154 }`

**Finish pack**  
`POST /daily-word-challenge/api/finish` â†’ `{ "total": 412, "accuracy": 0.86, "streak":{"current":14,"best":29} }`

**Export to Flashcards**  
`POST /daily-word-challenge/api/flashcards/send`  
```json
{ "packId":"p2025-10-29-en-B2", "onlyMissed":true, "deckName":"Daily B2 Recovery" }
```
Res: `{ "created": 3 }`

**Leaderboard (Pro)**  
`GET /daily-word-challenge/api/leaderboard?range=daily&lang=en&level=B2`  
Res: `{ "items":[{"rank":1,"user":"Akash","score":487}], "you":{"rank":27,"score":312} }`

---

### 8) Validation Rules

- Pack must have 3â€“10 items; item types only from enum.  
- Attempt seconds 0â€“120; tries 1â€“3.  
- Score recomputed serverâ€‘side; client score ignored.  
- Streak increments only once/day; archive play doesnâ€™t affect streak.  
- Leaderboard entries only for completed packs with â‰¥ threshold.  
- Reminder time must be a valid local time string (HH:MM).

---

### 9) Plans & Limits

| Feature | Free | Pro |
|---|---|---|
| Items per day | 3 | 5 |
| Archive access | â€” | Full |
| Leaderboard | â€” | Daily/Weekly |
| Skip day grace | â€” | 1 per 14 days |
| Export to Flashcards | âœ… | âœ… |
| History retention | 60 days | Unlimited |

Rate limits: `/attempt` 60/min; `/finish` 10/day; `/flashcards/send` 50/day.

---

### 10) Suggested File Layout

```
src/pages/daily-word-challenge/index.astro
src/pages/daily-word-challenge/play.astro
src/pages/daily-word-challenge/summary/[id].astro
src/pages/daily-word-challenge/archive.astro
src/pages/daily-word-challenge/stats.astro
src/pages/daily-word-challenge/settings.astro

src/pages/daily-word-challenge/api/today.ts
src/pages/daily-word-challenge/api/pack.ts
src/pages/daily-word-challenge/api/attempt.ts
src/pages/daily-word-challenge/api/finish.ts
src/pages/daily-word-challenge/api/stats.ts
src/pages/daily-word-challenge/api/leaderboard.ts
src/pages/daily-word-challenge/api/flashcards/send.ts
src/pages/daily-word-challenge/api/dictionary/open.ts
src/pages/daily-word-challenge/api/settings/save.ts
src/pages/daily-word-challenge/api/notify/register.ts

src/components/daily-word-challenge/Play/*.astro
src/components/daily-word-challenge/Summary/*.astro
src/components/daily-word-challenge/Stats/*.astro
```

---

### 11) Future Enhancements (v2+)

- **Image hints** and **picture word** items.  
- **Headâ€‘toâ€‘head duel** mode using same daily pack.  
- **Adaptive difficulty** based on accuracy/streak.  
- **Teacher mode**: assign a daily pack to a class code.  
- **PWA** with offline todayâ€‘pack cache.

---

**End of Requirements â€” Ready for Codex Implementation.**
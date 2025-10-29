# â±ï¸ Study Timer â€” Full Requirements (Ansiversa)

This document contains a **short summary** for Codex onboarding and the **full technical specification** for implementation.

> Note: Study Timer is a **standâ€‘alone mini app** but also acts as the lightweight timer module for **Study Planner**. It should run even if the user never sets up the planner.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### Overview
**Study Timer** is a focused productivity timer for learning sessions. It provides **Pomodoro**, **custom intervals**, **focus stats**, **distraction tracking**, and **lightweight session notes**. Users can tag sessions by **subject/topic**, log **interruptions**, and export **daily/weekly summaries**. Tight integrations let users send sessions to **Study Planner**, attach to **Quiz Institute** practice, or **FlashNote** reviews.

### Core Features
- Presets: **Pomodoro (25/5)**, **Longâ€‘Pom (50/10)**, **Custom cycles**, **Countâ€‘up timer**, and **Countdown by duration**.  
- **Tags**: subject/topic/board/class; quick selectors & color chips.  
- **Distraction logger**: oneâ€‘tap â€œinterruptionâ€ counter + reason list.  
- **Autoâ€‘resume** options, **smart breaks**, **daily goals** (minutes, pomos).  
- **Session notes** & links to resources (Quiz/FlashNote/Research).  
- **Stats**: time focused, pomodoros, interruptions, average session length; export CSV/ICS.  
- Offlineâ€‘friendly; runs in background tab; gentle notifications.

### Key Pages
- `/timer` â€” Main timer & quick tags  
- `/timer/history` â€” Sessions log & notes  
- `/timer/stats` â€” Daily/weekly/monthly analytics  
- `/timer/settings` â€” Presets, goals, sounds/notifications

### Minimal Data Model
`Preset`, `Session`, `Interruption`, `Tag`, `Goal`, `Setting`, `Linkout`

### Plan Gating
| Feature | Free | Pro |
|--------|------|-----|
| Presets | Basic (Pomodoro, Custom) | Unlimited named presets |
| Goals | Daily minutes only | Daily + weekly + streaks |
| Exports | â€” | CSV + ICS |
| Sounds | 3 tones | Full pack + custom |
| Integrations | View links | Oneâ€‘click log to Planner/Quiz/FlashNote |

Integrations: **Study Planner**, **Quiz Institute**, **FlashNote**, **Research Assistant**.

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives & Nonâ€‘Goals
**Objectives**
- Provide a zeroâ€‘friction, reliable study timer with accurate logging and simple analytics.  
- Work great on **mobile**, tolerate tab sleeps, and recover state after refresh.  
- Offer session tagging + notes to make data useful in other apps.

**Nonâ€‘Goals (v1)**
- No website blocker or OSâ€‘level focus enforcement.  
- No calendar write (ICS export only).  
- No multiplayer/teacher monitoring.

---

### 2) Information Architecture & Routes

**Pages**
- `/timer` â€” Timer UI with presets, tag chips, note field, interruption button, sound toggle.  
- `/timer/history` â€” List of sessions; filters by date, tag; edit notes.  
- `/timer/stats` â€” Summaries (daily/weekly/monthly), charts (time, pomos, interruptions).  
- `/timer/settings` â€” Presets, default tags, goals (min & pomos), sounds, notifications, autoâ€‘start, longâ€‘break every N cycles.

**API (SSR)**
- Presets: `GET /timer/api/preset/list` Â· `POST /timer/api/preset/save` Â· `POST /timer/api/preset/delete`  
- Session lifecycle: `POST /timer/api/session/start` Â· `POST /timer/api/session/pause` Â· `POST /timer/api/session/resume` Â· `POST /timer/api/session/finish`  
- Interruptions: `POST /timer/api/interrupt` (reason enum or text)  
- Notes/Tags: `POST /timer/api/session/update` (notes, tags)  
- History & Stats: `GET /timer/api/history` Â· `GET /timer/api/stats`  
- Export: `POST /timer/api/export/csv` Â· `POST /timer/api/export/ics` (Pro)  
- Settings/Goals: `POST /timer/api/settings/save`

Web worker recommended to keep timers accurate when tab sleeps; store authoritative timestamps serverâ€‘side as well to prevent drift.

---

### 3) Timer Engine & State

**Client state (web worker):**
- Holds current phase: `work` | `short_break` | `long_break` | `countup` | `countdown`.  
- Tick interval 1s; if tab sleeps, on wake compute elapsed from **actual timestamps** to reconcile.  
- Plays sound/vibration (respect OS/user settings).  
- Sends heartbeat to server every 30â€“60s (debounced).

**Server state:**
- Each session stores `startAt`, `endAt`, `phaseLog` (array with `{phase, startAt, endAt}`), `pomos`, `interruptions`, `notes`, `tags`.

**Autoâ€‘resume rules:**
- If browser reloads and a session is active within last 2h â†’ resume with reconstructed elapsed.  
- If idle > 15m during `work` â†’ soft prompt to discard or keep as â€œinterruptedâ€.

---

### 4) Data Model (Astro DB / SQL)

**Preset**  
- `id` (pk), `userId` (fk), `name`, `workMin` (int), `shortBreakMin` (int), `longBreakMin` (int), `longEvery` (int), `repeat` (bool), `sound` ('beep'|'bell'|'ding'|'custom'|null), `createdAt`

**Session**  
- `id` (uuid pk), `userId` (fk), `presetId` (fk|null), `mode` ('pomodoro'|'custom'|'countup'|'countdown'),  
  `startAt`, `endAt` (nullable), `durationSec` (int, computed), `pomos` (int), `notesMd` (text), `tags` (json), `phaseLog` (json), `createdAt`

**Interruption**  
- `id` (pk), `sessionId` (fk), `at` (ts), `reason` ('phone'|'chat'|'door'|'break'|'fatigue'|'other'), `note` (text|null)

**Tag**  
- `id` (pk), `userId` (fk), `name`, `color`, `subjectId` (nullable), `topicId` (nullable)

**Goal**  
- `id` (pk), `userId`, `dailyMin` (int), `dailyPomos` (int|null), `weeklyMin` (int|null), `streak` (int), `lastDay` (date)

**Setting**  
- `id` (pk), `userId`, `autoStartBreaks` (bool), `autoStartWork` (bool), `confirmBeforeFinish` (bool), `notify` (json), `sound` (string|null)

**Linkout** (optional links to other apps)  
- `id` (pk), `sessionId` (fk), `type` ('quiz'|'flashnote'|'research'|'planner'), `url` (string), `meta` (json)

---

### 5) UX / UI

**Timer page**
- Big time display; phase label; start/pause/reset; preset selector; tag chips; notes field; â€œ+ interruptionâ€ button.  
- Visual ring progress; longâ€‘break indicator (every N cycles).  
- Keyboard: `Space` start/pause, `R` reset, `N` new note focus, `I` interruption.  
- Mobile: large touch targets; keep display awake (if allowed); vibration at phase switch.  
- Accessibility: high contrast, screenâ€‘reader labels, reduced motion; RTL support.

**History**
- Table/list grouped by day; inline edit notes; tag filters; quick linkouts to create related Planner tasks.

**Stats**
- Cards: Today, This Week, 30 days.  
- Charts: total focus minutes, pomodoros, avg session length, interruptions per hour, top tags/subjects.  
- Streak heatmap (calendar style).

---

### 6) API Contracts (Examples)

**Start session**  
`POST /timer/api/session/start`  
```json
{ "presetId":"p1", "mode":"pomodoro", "tags":["Physics","Optics"] }
```
Res: `{ "sessionId":"s_123", "phase":"work", "workMin":25, "shortBreakMin":5, "longBreakMin":15, "longEvery":4 }`

**Tick/heartbeat (client optional)**  
`POST /timer/api/session/update`  
```json
{ "sessionId":"s_123", "notesMd":"derived thin lens formula", "tags":["Physics"] }
```

**Log interruption**  
`POST /timer/api/interrupt`  
```json
{ "sessionId":"s_123", "reason":"phone", "note":"parent call" }
```
Res: `{ "ok": true }`

**Finish session**  
`POST /timer/api/session/finish`  
```json
{ "sessionId":"s_123", "force":false }
```
Res: `{ "durationSec": 2900, "pomos": 1 }`

**Stats**  
`GET /timer/api/stats?range=last30`  
Res: `{ "minutes": 1240, "pomos": 39, "avgSessionMin": 33, "interruptionsPerHour": 0.7, "topTags":[{"tag":"Math","min":240}] }`

**Export ICS (Pro)**  
`POST /timer/api/export/ics` â†’ `{ "url": "/exports/study_sessions.ics" }`

---

### 7) Validation Rules

- `workMin` 5â€“120; `shortBreakMin` 1â€“30; `longBreakMin` 5â€“60; `longEvery` 2â€“12.  
- `mode` must be in enum; `notesMd` â‰¤ 5,000 chars.  
- Session cannot finish if `startAt` missing; duration computed as `endAt - startAt` minus paused spans.  
- Max concurrent active sessions per user: 1.  
- Exports â‰¤ 5MB; rate limit 10/day.

---

### 8) Plans & Limits

| Feature | Free | Pro |
|--------|------|-----|
| Presets | 2 custom | Unlimited |
| Goals | Daily minutes | Daily + weekly + pomos |
| Sounds | Basic | Custom upload |
| Exports | â€” | CSV + ICS |
| Integrations | Links only | Oneâ€‘click create Planner task / attach Quiz / FlashNote |
| History retention | 60 days | Unlimited |

Rate limits: `/session/start` 30/day (Free) 200/day (Pro).

---

### 9) Suggested File Layout

```
src/pages/timer/index.astro
src/pages/timer/history.astro
src/pages/timer/stats.astro
src/pages/timer/settings.astro

src/pages/timer/api/preset/list.ts
src/pages/timer/api/preset/save.ts
src/pages/timer/api/preset/delete.ts
src/pages/timer/api/session/start.ts
src/pages/timer/api/session/pause.ts
src/pages/timer/api/session/resume.ts
src/pages/timer/api/session/finish.ts
src/pages/timer/api/session/update.ts
src/pages/timer/api/interrupt.ts
src/pages/timer/api/history.ts
src/pages/timer/api/stats.ts
src/pages/timer/api/export/csv.ts
src/pages/timer/api/export/ics.ts
src/pages/timer/api/settings/save.ts

src/components/timer/TimerDisplay.astro
src/components/timer/Presets.astro
src/components/timer/TagChips.astro
src/components/timer/Notes.astro
src/components/timer/Stats/*.astro
```

---

### 10) Future Enhancements (v2+)

- **Twoâ€‘way sync** with Study Planner slots; autoâ€‘start timer when a slot begins.  
- **Focus soundtrack** (loâ€‘fi, rain) with volume ducking on alarms.  
- **Smart suggestions** (e.g., â€œLong break now?â€ based on fatigue signals).  
- **Wearables** integration (basic heartâ€‘rate marker) for research.  
- **PWA install** with offline history sync.

---

**End of Requirements â€” Ready for Codex Implementation.**
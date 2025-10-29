# ðŸ§¾ Fact Generator â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/facts`  
**Category:** Learning & Knowledge  
**Stack:** Astro + Tailwind (islands where needed), Astro SSR API routes, Astro DB / Supabase  
**Goal:** Deliver short, trustworthy **facts** with citations and optional kidâ€‘friendly language. Offer **random facts**, **topic facts**, **daily fact**, and **quizify/explain more** actions. Support multiâ€‘language, reading levels, and export/sharing.

> **Positioning:** A fun yet credible microâ€‘learning utility that always **shows its sources** and lets users â€œgo deeperâ€ or â€œquiz meâ€ in one click.

---

## 1) Objectives & Nonâ€‘Goals

### Objectives
- Generate and serve **atomic fact cards**: 1â€“3 sentences + **citations** (1â€“3 refs) + tags.  
- Modes: **Random**, **By Topic**, **Daily Fact**, **Fact Streak**, and **Pack/Collection**.  
- **Trust layer:** each fact has a `sourceTier` (A: primary/official; B: reputable secondary; C: communityâ€‘maintained).  
- **Readability controls:** audience level (Kids/Teen/Adult/Expert), concise vs expanded, language (EN/Tamil/Arabic, etc.).  
- Actions: **Explain More**, **Create FlashNote**, **Make a Quiz**, **Save**, **Share**, **Export** (PNG/MD/JSON).  
- **Moderation/safety:** no medical/legal/financial advice; avoid sensationalism; kidâ€‘safe vocabulary toggle.

### Nonâ€‘Goals (v1)
- No realâ€‘time web crawling in user request path (facts are curated/generated and cached).  
- No opinions or predictions; strictly factual claims with citations.  
- No user comments/chat (packs are curated or private).

---

## 2) User Stories (Acceptance Criteria)

1. **Random Fact**
   - *As a user*, I press **Surprise me**.  
   - **AC:** `/facts/api/random` returns a `FactCard` with text, citations, tags, and actions; no repeats within the last 20 items per user.

2. **Topic Fact**
   - *As a user*, I choose a topic (e.g., Space, Biology, History, Tech, Geography).  
   - **AC:** `/facts/api/topic` takes `topic` + optional `subtopic` and returns a fact relevant to that area with citations.

3. **Reading Level & Language**
   - *As a user*, I set level=Kids and language=Tamil.  
   - **AC:** output is simplified and localized; citation anchors stay in English or localized if available.

4. **Explain More & Quizify**
   - *As a user*, I click **Explain More** or **Quizify**.  
   - **AC:** `/facts/api/explain` returns a short explainer; `/facts/api/quiz` returns 3â€“5 MCQs/TF based on the fact.

5. **Save & Packs**
   - *As a user*, I save facts to **Collections** (e.g., â€œSpace wow!â€).  
   - **AC:** `/facts/api/save` stores the fact and associates it with a user collection; `/facts/api/packs/list` lists builtâ€‘in packs.

6. **Daily Fact & Streaks**
   - *As a user*, I subscribe to a **Daily Fact**.  
   - **AC:** `/facts/api/daily/today` returns the dayâ€™s fact; streak count increments on view.

7. **Plan Gating**
   - Free: Random + Topic + Daily (limited exports).  
   - Pro: Create/Import packs, advanced export, batch â€œExplain Moreâ€, and translation options.

---

## 3) Routes & Information Architecture

- `/facts` â€” Hub: Random, Topic chooser, Daily card, recent saves.  
- `/facts/topic/[topic]` â€” Topic stream (filters: subtopic, difficulty, level, language).  
- `/facts/daily` â€” Todayâ€™s fact + streak; archive (Pro).  
- `/facts/packs` â€” Builtâ€‘in packs & user collections.  
- `/facts/collection/[id]` â€” A saved collection.  
- `/facts/settings` â€” Preferences: language, level, kidâ€‘safe, export defaults.

**API (SSR):**  
- `POST /facts/api/random`  
- `POST /facts/api/topic`  
- `POST /facts/api/explain`  
- `POST /facts/api/quiz`  
- `POST /facts/api/save` Â· `POST /facts/api/delete` Â· `POST /facts/api/duplicate`  
- `GET  /facts/api/packs/list` Â· `POST /facts/api/packs/start`  
- `POST /facts/api/daily/today`  
- `POST /facts/api/export` (png|md|json)  
- `GET  /facts/api/history`

---

## 4) FactCard Content Schema

```json
{
  "id": "fact-7c27",
  "text": "Lightning can heat the air to temperatures hotter than the surface of the sun for a brief instant.",
  "level": "teen",
  "language": "en",
  "topic": "physics",
  "subtopic": "atmospheric electricity",
  "tags": ["weather", "electricity", "temperature"],
  "sourceTier": "B",
  "citations": [
    {"title": "NOAA Lightning Science", "url": "https://...", "publisher": "NOAA"},
    {"title": "Encyclopaedia Britannica: Lightning", "url": "https://...", "publisher": "Britannica"}
  ],
  "evidence": "Short snippet or paraphrase from source with attribution.",
  "createdAt": "2025-10-28T00:00:00Z"
}
```

**Explainer Output**  
```json
{
  "factId": "fact-7c27",
  "sections": {
    "simple": "Lightning makes air expand super fast, which feels like thunder.",
    "detail": "A lightning channel can reach ~30,000 K for microseconds...",
    "why_it_matters": ["Explains thunder shockwave", "Safety guidance"]
  }
}
```

**Quiz Output**  
```json
[
  {"type":"mcq","q":"Lightning heats air up toâ€¦","options":["300 K","3,000 K","30,000 K","300,000 K"],"answer":"30,000 K","why":"Orderâ€‘ofâ€‘magnitude fact."},
  {"type":"tf","q":"Lightning is cooler than boiling water.","answer":false,"why":"It is vastly hotter."}
]
```

---

## 5) Database Model (Astro DB / SQL)

**User**  
- `id` (pk), `email`, `plan`, `language`, `level` ('kids'|'teen'|'adult'|'expert'), `kidSafe` (bool), `timezone`, `createdAt`

**Fact**  
- `id` (pk uuid), `hash` (unique), `text`, `topic`, `subtopic`, `tags` (json), `levelDefault`, `sourceTier` ('A'|'B'|'C'), `citations` (json), `evidence` (text), `langBase` ('en'), `createdAt`

**FactLocalized**  
- `id` (pk), `factId` (fk), `language`, `text`, `notes` (json), `createdAt`

**Collection**  
- `id` (pk uuid), `userId` (fk), `title`, `description`, `createdAt`

**CollectionItem**  
- `collectionId` (fk), `factId` (fk), `position` (int)

**DailySeed**  
- `date` (pk), `topic` (nullable), `factId` (fk), `leaderboardId` (fk nullable)

**History**  
- `id` (pk), `userId` (fk), `factId` (fk), `action` ('view'|'save'|'share'|'export'), `ts`

---

## 6) Trust & Moderation

- **Source tiers**:  
  - **A (Primary/Official):** gov/edu standards, official agencies (e.g., NASA, WHO, NOAA).  
  - **B (Reputable Secondary):** Britannica, respected publishers, textbooks.  
  - **C (Community/Reference):** Wikipedia, community data; allowed with corroboration or labeling.
- **Kidâ€‘safe filter:** avoid sensitive/graphic content; replace with milder wording or block with explanation.  
- **Factuality guardrails:** require at least one A or B tier citation where feasible; flag facts missing A/B as **needs review**.  
- **Duplicate detection:** hash of `normalized(text)`; avoid repetition in sessions.

---

## 7) UI / Pages

### `/facts` (Hub)
- Search bar with topic chips; **Surprise me** button; Daily Fact card; recent saves.  
- Settings chip: language, level, kidâ€‘safe.

### Fact Card
- Big fact text, tags, small **source chips** (hover reveals title/publisher), trust badge (A/B/C).  
- Buttons: **Explain More**, **Quizify**, **Save**, **Share**, **Export** (PNG/MD/JSON).  
- Toggle: **Kids mode wording**.

### `/facts/topic/[topic]`
- Infinite scroll; filters (subtopic, tier, level); copy link.

### `/facts/daily`
- Todayâ€™s featured fact; streak counter; archive (Pro).

### `/facts/packs`
- Builtâ€‘in packs (Space 100, Biology Basics, World Flags, Computing Milestones).  
- User collections with progress.

---

## 8) API Contracts (examples)

### `POST /facts/api/random`
Req: `{ "level":"teen", "language":"en", "topic":"any", "kidSafe":true }`  
Res: `{ "fact": { ...FactCard... }, "next": "cursor-abc" }`

### `POST /facts/api/topic`
Req: `{ "topic":"space", "subtopic":"planets", "level":"kids", "language":"en" }`  
Res: `{ "fact": { ... }, "related":[ "...ids..." ] }`

### `POST /facts/api/explain`
Req: `{ "factId":"<uuid>", "depth":"short|medium|long", "language":"en" }`  
Res: `{ "explainer": { ... } }`

### `POST /facts/api/quiz`
Req: `{ "factId":"<uuid>", "count":5 }`  
Res: `{ "quizId":"QUIZ-123", "items":[ ... ] }`

### `POST /facts/api/export`
Req: `{ "factId":"<uuid>", "format":"png|md|json" }`  
Res: `{ "url":"/exports/Fact_Space_2025-10-28.png" }`

### `GET /facts/api/packs/list`
Res: `{ "builtin":[...], "user":[...] }`

---

## 9) Validation Rules

- Fact text 40â€“300 chars; must be declarative, timeâ€‘stable, and nonâ€‘harmful.  
- Must include â‰¥1 citation; if only Câ€‘tier, mark `needsReview=true`.  
- Topic from whitelist; tags â‰¤ 10; language ISO code; level âˆˆ {kids, teen, adult, expert}.  
- Export PNG â‰¤ 5 MB; JSON/MD allowed; watermarks for Free plan.  
- Random repeat window: do not repeat the last 20 facts per user.

---

## 10) Plans & Limits

| Feature | Free | Pro |
|--------|------|-----|
| Random/Topic/Daily | Yes | Yes |
| Explain More | Short only | Medium/Long |
| Quizify | 3 Qs | 5â€“10 Qs + export to Quiz |
| Collections | 3 | Unlimited |
| Packs | Builtâ€‘in only | Import + create |
| Exports | PNG (watermark) | PNG/MD/JSON (no watermark) |
| Archive | Today only | Full archive & search |

Rate limits: `userId`+day for random/topic; `userId`+day for exports; `userId`+hour for explain/quiz.

---

## 11) Accessibility & UX

- Large fonts, high contrast, screenâ€‘reader labels; copy buttons have ariaâ€‘labels.  
- RTL support for Arabic; localized number/date formatting.  
- Reduced motion; content warnings for sensitive topics (if kidâ€‘safe off).

---

## 12) Suggested File Layout

```
src/pages/facts/index.astro
src/pages/facts/topic/[topic].astro
src/pages/facts/daily.astro
src/pages/facts/packs.astro
src/pages/facts/collection/[id].astro
src/pages/facts/settings.astro

src/pages/facts/api/random.ts
src/pages/facts/api/topic.ts
src/pages/facts/api/explain.ts
src/pages/facts/api/quiz.ts
src/pages/facts/api/save.ts
src/pages/facts/api/delete.ts
src/pages/facts/api/duplicate.ts
src/pages/facts/api/packs/list.ts
src/pages/facts/api/packs/start.ts
src/pages/facts/api/daily/today.ts
src/pages/facts/api/export.ts
src/pages/facts/api/history.ts

src/components/facts/Card/*.astro
src/components/facts/Explain/*.astro
src/components/facts/Quiz/*.astro
src/components/facts/Packs/*.astro
```

---

## 13) Future Enhancements (v2+)

- **Verify button**: background verification job that checks citations and marks confidence.  
- **Source diversity scoring** to avoid overâ€‘reliance on one publisher.  
- **Timeline facts** that include a year and context (with time sensitivity flags).  
- **Audio narration** (TTS) for kid mode.  
- **Widget**: â€œFact of the Dayâ€ embeddable tile for Ansiversa home.

---

**End of Requirements â€” ready for Codex implementation.**
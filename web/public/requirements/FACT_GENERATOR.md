# ðŸ§¾ Fact Generator â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/fact-generator`  
**Category:** Learning and Knowledge  
**Stack:** Astro + Tailwind (islands where needed), Astro SSR API routes, Astro DB / Supabase  
**Goal:** Deliver short, trustworthy **facts** with citations and optional kidâ€‘friendly language. Offer **random facts**, **topic facts**, **daily fact**, and **quizify/explain more** actions. Support multiâ€‘language, reading levels, and export/sharing.

> **Positioning:** A fun yet credible microâ€‘learning utility that always **shows its sources** and lets users â€œgo deeperâ€ or â€œquiz meâ€ in one click.

---

## 1) Objectives and Nonâ€‘Goals

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
   - **AC:** `/fact-generator/api/random` returns a `FactCard` with text, citations, tags, and actions; no repeats within the last 20 items per user.

2. **Topic Fact**
   - *As a user*, I choose a topic (e.g., Space, Biology, History, Tech, Geography).  
   - **AC:** `/fact-generator/api/topic` takes `topic` + optional `subtopic` and returns a fact relevant to that area with citations.

3. **Reading Level and Language**
   - *As a user*, I set level=Kids and language=Tamil.  
   - **AC:** output is simplified and localized; citation anchors stay in English or localized if available.

4. **Explain More and Quizify**
   - *As a user*, I click **Explain More** or **Quizify**.  
   - **AC:** `/fact-generator/api/explain` returns a short explainer; `/fact-generator/api/quiz` returns 3â€“5 MCQs/TF based on the fact.

5. **Save and Packs**
   - *As a user*, I save facts to **Collections** (e.g., â€œSpace wow!â€).  
   - **AC:** `/fact-generator/api/save` stores the fact and associates it with a user collection; `/fact-generator/api/packs/list` lists builtâ€‘in packs.

6. **Daily Fact and Streaks**
   - *As a user*, I subscribe to a **Daily Fact**.  
   - **AC:** `/fact-generator/api/daily/today` returns the dayâ€™s fact; streak count increments on view.

7. **Plan Gating**
   - Free: Random + Topic + Daily (limited exports).  
   - Pro: Create/Import packs, advanced export, batch â€œExplain Moreâ€, and translation options.

---

## 3) Routes and Information Architecture

- `/fact-generator` â€” Hub: Random, Topic chooser, Daily card, recent saves.  
- `/fact-generator/topic/[topic]` â€” Topic stream (filters: subtopic, difficulty, level, language).  
- `/fact-generator/daily` â€” Todayâ€™s fact + streak; archive (Pro).  
- `/fact-generator/packs` â€” Builtâ€‘in packs and user collections.  
- `/fact-generator/collection/[id]` â€” A saved collection.  
- `/fact-generator/settings` â€” Preferences: language, level, kidâ€‘safe, export defaults.

**API (SSR):**  
- `POST /fact-generator/api/random`  
- `POST /fact-generator/api/topic`  
- `POST /fact-generator/api/explain`  
- `POST /fact-generator/api/quiz`  
- `POST /fact-generator/api/save` Â· `POST /fact-generator/api/delete` Â· `POST /fact-generator/api/duplicate`  
- `GET  /fact-generator/api/packs/list` Â· `POST /fact-generator/api/packs/start`  
- `POST /fact-generator/api/daily/today`  
- `POST /fact-generator/api/export` (png|md|json)  
- `GET  /fact-generator/api/history`

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

## 6) Trust and Moderation

- **Source tiers**:  
  - **A (Primary/Official):** gov/edu standards, official agencies (e.g., NASA, WHO, NOAA).  
  - **B (Reputable Secondary):** Britannica, respected publishers, textbooks.  
  - **C (Community/Reference):** Wikipedia, community data; allowed with corroboration or labeling.
- **Kidâ€‘safe filter:** avoid sensitive/graphic content; replace with milder wording or block with explanation.  
- **Factuality guardrails:** require at least one A or B tier citation where feasible; flag facts missing A/B as **needs review**.  
- **Duplicate detection:** hash of `normalized(text)`; avoid repetition in sessions.

---

## 7) UI / Pages

### `/fact-generator` (Hub)
- Search bar with topic chips; **Surprise me** button; Daily Fact card; recent saves.  
- Settings chip: language, level, kidâ€‘safe.

### Fact Card
- Big fact text, tags, small **source chips** (hover reveals title/publisher), trust badge (A/B/C).  
- Buttons: **Explain More**, **Quizify**, **Save**, **Share**, **Export** (PNG/MD/JSON).  
- Toggle: **Kids mode wording**.

### `/fact-generator/topic/[topic]`
- Infinite scroll; filters (subtopic, tier, level); copy link.

### `/fact-generator/daily`
- Todayâ€™s featured fact; streak counter; archive (Pro).

### `/fact-generator/packs`
- Builtâ€‘in packs (Space 100, Biology Basics, World Flags, Computing Milestones).  
- User collections with progress.

---

## 8) API Contracts (examples)

### `POST /fact-generator/api/random`
Req: `{ "level":"teen", "language":"en", "topic":"any", "kidSafe":true }`  
Res: `{ "fact": { ...FactCard... }, "next": "cursor-abc" }`

### `POST /fact-generator/api/topic`
Req: `{ "topic":"space", "subtopic":"planets", "level":"kids", "language":"en" }`  
Res: `{ "fact": { ... }, "related":[ "...ids..." ] }`

### `POST /fact-generator/api/explain`
Req: `{ "factId":"<uuid>", "depth":"short|medium|long", "language":"en" }`  
Res: `{ "explainer": { ... } }`

### `POST /fact-generator/api/quiz`
Req: `{ "factId":"<uuid>", "count":5 }`  
Res: `{ "quizId":"QUIZ-123", "items":[ ... ] }`

### `POST /fact-generator/api/export`
Req: `{ "factId":"<uuid>", "format":"png|md|json" }`  
Res: `{ "url":"/exports/Fact_Space_2025-10-28.png" }`

### `GET /fact-generator/api/packs/list`
Res: `{ "builtin":[...], "user":[...] }`

---

## 9) Validation Rules

- Fact text 40â€“300 chars; must be declarative, timeâ€‘stable, and nonâ€‘harmful.  
- Must include â‰¥1 citation; if only Câ€‘tier, mark `needsReview=true`.  
- Topic from whitelist; tags â‰¤ 10; language ISO code; level âˆˆ {kids, teen, adult, expert}.  
- Export PNG â‰¤ 5 MB; JSON/MD allowed; watermarks for Free plan.  
- Random repeat window: do not repeat the last 20 facts per user.

---

## 10) Plans and Limits

| Feature | Free | Pro |
|--------|------|-----|
| Random/Topic/Daily | Yes | Yes |
| Explain More | Short only | Medium/Long |
| Quizify | 3 Qs | 5â€“10 Qs + export to Quiz |
| Collections | 3 | Unlimited |
| Packs | Builtâ€‘in only | Import + create |
| Exports | PNG (watermark) | PNG/MD/JSON (no watermark) |
| Archive | Today only | Full archive and search |

Rate limits: `userId`+day for random/topic; `userId`+day for exports; `userId`+hour for explain/quiz.

---

## 11) Accessibility and UX

- Large fonts, high contrast, screenâ€‘reader labels; copy buttons have ariaâ€‘labels.  
- RTL support for Arabic; localized number/date formatting.  
- Reduced motion; content warnings for sensitive topics (if kidâ€‘safe off).

---

## 12) Suggested File Layout

```
src/pages/fact-generator/index.astro
src/pages/fact-generator/topic/[topic].astro
src/pages/fact-generator/daily.astro
src/pages/fact-generator/packs.astro
src/pages/fact-generator/collection/[id].astro
src/pages/fact-generator/settings.astro

src/pages/fact-generator/api/random.ts
src/pages/fact-generator/api/topic.ts
src/pages/fact-generator/api/explain.ts
src/pages/fact-generator/api/quiz.ts
src/pages/fact-generator/api/save.ts
src/pages/fact-generator/api/delete.ts
src/pages/fact-generator/api/duplicate.ts
src/pages/fact-generator/api/packs/list.ts
src/pages/fact-generator/api/packs/start.ts
src/pages/fact-generator/api/daily/today.ts
src/pages/fact-generator/api/export.ts
src/pages/fact-generator/api/history.ts

src/components/fact-generator/Card/*.astro
src/components/fact-generator/Explain/*.astro
src/components/fact-generator/Quiz/*.astro
src/components/fact-generator/Packs/*.astro
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
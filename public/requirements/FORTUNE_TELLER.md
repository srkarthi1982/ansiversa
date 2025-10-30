# ðŸ”® Fortune Teller â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/fortune-teller`  
**Category:** Fun & Engagement  
**Stack:** Astro + Tailwind (islands), Astro SSR API routes, Astro DB / Supabase  
**Goal:** Provide playful, optâ€‘in entertainment readings (tarotâ€‘style spreads, zodiacâ€‘style horoscopes, numerologyâ€‘like summaries, â€œyes/no coin,â€ crystal ball prompts) with strict **disclaimers** that results are for **fun** and **not advice**. Personalize with user mood/intents and keep things fresh via seeds and daily rotations.

> **Disclaimer shown everywhere:** â€œFor entertainment only. Not medical, legal, or financial advice.â€

---

## 1) Objectives & Nonâ€‘Goals

### Objectives
- Offer **quick fortunes** and **richer readings**:  
  - **Daily Fortune** (1â€‘card style),  
  - **Yes/No** (coin/pendulumâ€‘like),  
  - **3â€‘Card Spread** (past/present/future),  
  - **5â€‘Card Focus** (situation, blocks, guidance, external, outcome),  
  - **Zodiacâ€‘style daily/weekly** (fun, generalized),  
  - **Birthâ€‘date Numerologyâ€‘like** summary (playful).  
- **Personalization inputs**: name/nickname, (optional) birth date, mood, areas (love, career, study, health, money, creativity).  
- **Seeds & history** to avoid repetition; allow â€œrerollâ€ with reason.  
- **Collections** of decks/themes (classic, sciâ€‘fi, mythology, minimal).  
- **Shareable cards** (PNG), **journal** logging, **streaks**, and **optâ€‘in reminders**.  
- **Localization** (English + local languages).

### Nonâ€‘Goals (v1)
- No claims of accuracy or predictions; no real astrology calculations or professional advice.  
- No userâ€‘toâ€‘user matchmaking or chats.  
- No thirdâ€‘party paid readings.

---

## 2) User Stories (Acceptance Criteria)

1. **Daily Fortune**
   - *As a user*, I tap **Daily Fortune** and get a short themed message and â€œlucky focusâ€ for the day.  
   - **AC:** `/fortune-teller/api/daily` returns a card (title, meaning, action, emoji), seedâ€‘rotated by date+user.

2. **Yes/No**
   - *As a user*, I ask a question and tap **Yes/No**.  
   - **AC:** `/fortune-teller/api/yesno` returns yes/no/maybe with a oneâ€‘liner; cooldown enforces 10s minimum between asks.

3. **3â€‘Card & 5â€‘Card**
   - *As a user*, I choose spread and domain (e.g., career).  
   - **AC:** `/fortune-teller/api/spread` returns positions with meanings and guidance paragraphs.

4. **Zodiacâ€‘style Feed**
   - *As a user*, I choose a sign (or â€œsurprise meâ€).  
   - **AC:** `/fortune-teller/api/zodiac` returns daily/weekly generic text with rotating themes.

5. **Numerologyâ€‘like Summary**
   - *As a user*, I enter birth date to get a playful, evergreen summary.  
   - **AC:** `/fortune-teller/api/numsum` returns static descriptors and strengths/growth areas.

6. **Save, Share, Journal**
   - *As a user*, I save a reading, export a postcard (PNG), and write a journal note.  
   - **AC:** `/fortune-teller/api/save` persists reading; `/export` returns image URL; `/journal/create` stores note.

7. **Plan Gating**
   - Free: daily fortune, yes/no, 3â€‘card, limited saves/exports.  
   - Pro: 5â€‘card, zodiac feed archive, custom themes, unlimited saves/exports, reminders.

---

## 3) Routes & Information Architecture

- `/fortune-teller` â€” Hub: Daily Fortune, Yes/No, Spreads, Zodiac, â€œMy Journalâ€.  
- `/fortune-teller/daily` â€” Todayâ€™s fortune; reroll (once) with reason.  
- `/fortune-teller/yesno` â€” Ask a question â†’ yes/no/maybe with cooldown.  
- `/fortune-teller/spreads` â€” Choose 3â€‘card or 5â€‘card; pick domain & theme.  
- `/fortune-teller/zodiac` â€” Pick a sign; switch daily/weekly tabs.  
- `/fortune-teller/journal` â€” Saved readings + notes; calendar view.  
- `/fortune-teller/settings` â€” Themes, reminders, language; disclaimer & safety links.

**API (SSR):**  
- `POST /fortune-teller/api/daily`  
- `POST /fortune-teller/api/yesno`  
- `POST /fortune-teller/api/spread`  
- `POST /fortune-teller/api/zodiac`  
- `POST /fortune-teller/api/numsum`  
- `POST /fortune-teller/api/save` Â· `POST /fortune-teller/api/delete` Â· `POST /fortune-teller/api/duplicate`  
- `POST /fortune-teller/api/export` (png|md|pdf)  
- `POST /fortune-teller/api/journal/create` Â· `POST /fortune-teller/api/journal/update`  
- `GET  /fortune-teller/api/history`

---

## 4) Reading Model (Content Spec)

### Card/Archetype Schema
```json
{
  "id": "the-innovator",
  "title": "The Innovator",
  "upright": {
    "keywords": ["new ideas", "curiosity", "first step"],
    "guidance": "Start small. Ship a version today.",
    "affirmation": "I learn by building."
  },
  "reversed": {
    "keywords": ["hesitation", "overthinking"],
    "guidance": "Pick one idea; ignore the rest for now."
  },
  "domains": {
    "career": "Pitch the experiment; gather data.",
    "study": "Chunk topics; test yourself often."
  }
}
```

### Spread Response
```json
{
  "spread": "3-card",
  "domain": "career",
  "cards": [
    {"position":"past","card":"the-innovator","orientation":"upright","text":"â€¦"},
    {"position":"present","card":"the-anchor","orientation":"upright","text":"â€¦"},
    {"position":"future","card":"the-bridge","orientation":"reversed","text":"â€¦"}
  ],
  "actions": ["Email X today","Draft a 7â€‘day plan"]
}
```

---

## 5) Database Model (Astro DB / SQL)

**User**  
- `id` (pk), `email`, `plan`, `nickname`, `birthdate` (optional), `timezone`, `language`, `createdAt`

**Deck**  
- `id` (pk uuid), `title`, `theme` ('classic'|'myth'|'sci-fi'|'minimal'), `i18n` (json), `createdAt`

**Card**  
- `id` (pk uuid), `deckId` (fk), `slug`, `title`, `upright` (json), `reversed` (json), `domains` (json)

**Reading**  
- `id` (pk uuid), `userId` (fk), `type` ('daily'|'yesno'|'spread3'|'spread5'|'zodiac'|'numsum'),  
  `seed` (string), `input` (json), `output` (json), `theme`, `createdAt`

**Journal**  
- `id` (pk), `userId` (fk), `readingId` (fk), `text`, `mood` ('ðŸ™‚'|'ðŸ˜'|'ðŸ™'|'ðŸ˜„'|'ðŸ˜´'|'ðŸ¤©'), `createdAt`

**Streak**  
- `userId` (pk fk), `days` (int), `lastDate` (date)

**Reminder**  
- `id` (pk), `userId`, `time` (HH:MM), `days` (json), `timezone`

**ZodiacText**  
- `id` (pk), `sign`, `period` ('daily'|'weekly'), `dateKey` (date|week), `text` (json by language), `theme`

---

## 6) Personalization, Seeding & Cooldowns

- **Seed =** hash(userId + date + type + intent + theme).  
- **Reroll:** 1 free reroll on Daily with â€œwhy reroll?â€ (e.g., â€œtoo vagueâ€); store reason.  
- **Yes/No Cooldown:** 10s minimum; 3/minute max; block obvious repeats (same hashed text within 30s).  
- **Diversity:** avoid repeating same card twice within 7 days per user.  
- **Themes:** choose deck by user preference; Pro can set default theme.

---

## 7) UI / Pages

### `/fortune-teller` (Hub)
- Big **Daily Fortune** card, **Yes/No** chip, **Spreads** carousel, **Zodiac** shortcut, **Journal** preview.  
- Footer disclaimer + safety links.

### `/fortune-teller/daily`
- Animated card reveal; â€œlucky focusâ€, â€œtiny actionâ€; **Save**, **Share**, **Reroll** (once).

### `/fortune-teller/yesno`
- Text box + reveal button; animated outcome; timer/cooldown indicator.

### `/fortune-teller/spreads`
- Choose spread size, domain, theme; swipe cards; perâ€‘position meaning panel.

### `/fortune-teller/zodiac`
- Grid of signs; toggle daily/weekly; archive (Pro).

### `/fortune-teller/journal`
- List by date with emoji mood and attached reading; search; export.

### `/fortune-teller/settings`
- Toggles: reminders, language, theme; edit nickname/birth date (optional).

---

## 8) API Contracts (examples)

### `POST /fortune-teller/api/daily`
Req: `{ "theme":"classic", "intent":"career" }`  
Res: `{ "readingId":"<uuid>","card":{...},"action":"Email one person today" }`

### `POST /fortune-teller/api/yesno`
Req: `{ "question":"Should I start today?" }`  
Res: `{ "outcome":"yes","oneLiner":"Start small and iterate.","cooldown":10 }`

### `POST /fortune-teller/api/spread`
Req: `{ "spread":"3","domain":"study","theme":"myth" }`  
Res: `{ "cards":[...], "actions":[...], "readingId":"<uuid>" }`

### `POST /fortune-teller/api/zodiac`
Req: `{ "sign":"leo","period":"daily","date":"2025-10-28" }`  
Res: `{ "title":"Fire & Focus","text":"â€¦","theme":"classic" }`

### `POST /fortune-teller/api/numsum`
Req: `{ "birthdate":"2004-03-09" }`  
Res: `{ "summary":{"strengths":["curiosity"],"growth":["patience"]},"theme":"minimal" }`

### `POST /fortune-teller/api/export`
Req: `{ "readingId":"<uuid>", "format":"png" }`  
Res: `{ "url":"/exports/Fortune_2025-10-28.png" }`

---

## 9) Validation & Limits

- Nickname 2â€“24 chars; birth date optional; language ISO code.  
- Yes/No question 3â€“240 chars; profanity filter (light).  
- Spread choices limited to allowed list; domain âˆˆ {love, career, study, health, money, creativity, general}.  
- Export PNG <= 5 MB; MD/PDF allowed (watermark on Free).  
- Reroll once per day on Daily; additional rerolls are Pro feature (max 3/day).

---

## 10) Plans & Limits

| Feature | Free | Pro |
|--------|------|-----|
| Daily Fortune | Yes | Yes |
| Yes/No | Yes (rate limited) | Yes (higher limits) |
| Spreads | 3â€‘card | 3â€‘ & 5â€‘card + custom domains |
| Zodiac | Today only | Weekly + archive |
| Saves/Exports | 20 saves, 5 PNG/month | Unlimited, no watermark |
| Themes | Classic only | All themes + custom |

Rate limits: `userId`+minute for yes/no; `userId`+day for daily/spreads/export.

---

## 11) Ethics, Safety & Privacy

- **Prominent disclaimers**; â€œGet real helpâ€ links for sensitive topics.  
- Filter questions that request medical/legal/financial predictions; return gentle redirect.  
- Avoid deterministic promises; write in playful, empowering tone.  
- Private by default; sharing is optâ€‘in; remove PII from share images.  
- Logs store seeds and options, not raw questions for public views.

---

## 12) Accessibility & UX

- Large text options, high contrast, reduced motion toggles.  
- Screenâ€‘reader labels for cards and results; keyboard shortcuts (R to reroll).  
- RTL support for Arabic; localization keys for all fixed text.

---

## 13) Suggested File Layout

```
src/pages/fortune-teller-teller/index.astro
src/pages/fortune-teller-teller/daily.astro
src/pages/fortune-teller-teller/yesno.astro
src/pages/fortune-teller-teller/spreads.astro
src/pages/fortune-teller-teller/zodiac.astro
src/pages/fortune-teller-teller/journal.astro
src/pages/fortune-teller-teller/settings.astro

src/pages/fortune-teller-teller/api/daily.ts
src/pages/fortune-teller-teller/api/yesno.ts
src/pages/fortune-teller-teller/api/spread.ts
src/pages/fortune-teller-teller/api/zodiac.ts
src/pages/fortune-teller-teller/api/numsum.ts
src/pages/fortune-teller-teller/api/save.ts
src/pages/fortune-teller-teller/api/delete.ts
src/pages/fortune-teller-teller/api/duplicate.ts
src/pages/fortune-teller-teller/api/export.ts
src/pages/fortune-teller-teller/api/journal/create.ts
src/pages/fortune-teller-teller/api/journal/update.ts
src/pages/fortune-teller-teller/api/history.ts

src/components/fortune-teller/Cards/*.astro
src/components/fortune-teller/Spreads/*.astro
src/components/fortune-teller/Zodiac/*.astro
src/components/fortune-teller/Journal/*.astro
```

---

## 14) Future Enhancements (v2+)

- **Deck Editor** (create your own archetypes and texts, moderated).  
- **Widget Mode** for landing page: â€œFortune of the dayâ€.  
- **Seasonal Themes** (Diwali, New Year, Ramadan).  
- **Ambient Soundscapes** toggle.  
- **PWA offline** for daily card caching.

---

**End of Requirements â€” ready for Codex implementation.**
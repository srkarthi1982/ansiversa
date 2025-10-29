# ðŸ—£ï¸ Language Flashcards â€” Full Requirements (Ansiversa)

This document includes a **short summary** for Codex onboarding and the **full technical specification** for implementation.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### Overview
**Language Flashcards** helps learners master vocabulary, phrases, grammar patterns, and scripts using **spaced repetition**, **pronunciation practice**, and **microâ€‘games**. It supports bilingual cards (L1 â†” L2), IPA, audio (TTS/recordings), example sentences, and conjugations â€” tightly integrated with **Study Planner** and **Course Tracker**.

### Key Features
- Create/import decks for languages (e.g., Englishâ†”Arabic, Englishâ†”Tamil, Englishâ†”Spanish).  
- Card types: **Word**, **Phrase**, **Cloze**, **Image hint**, **Conjugation**, **Script writing**.  
- **Spaced repetition (SMâ€‘2 style)** with daily review queue.  
- **Pronunciation**: TTS playback + user recording with simple scoring (pronunciation similarity heuristic v1).  
- **Script practice**: stroke order images (v2), â€œtype the transliteration/answerâ€, keyboard hints.  
- **Autoâ€‘generate** cards from pasted text (detect language, extract lemmas, frequency rank).  
- **Deck goals** & **streaks**; analytics for retention and accuracy.  
- Export/Import: CSV/JSON; shareable deck links (readâ€‘only v1).

### Core Pages
- `/langcards` â€” Dashboard (todayâ€™s reviews, due count, quick add)  
- `/langcards/deck/[id]` â€” Deck home (browse, add, train)  
- `/langcards/review` â€” SRS session player  
- `/langcards/create` â€” Generator (paste text â†’ suggest cards)  
- `/langcards/analytics` â€” Progress & retention  
- `/langcards/settings` â€” Language pair, scripts, audio, review target

### Minimal Data Model
`Language`, `Deck`, `Card`, `Note` (shared fields), `Review`, `Media`, `Tag`, `Goal`, `ImportJob`

### Plan Gating
| Feature | Free | Pro |
|--------|------|-----|
| Decks | 3 | Unlimited |
| Daily reviews | 100 | 1000 |
| Autoâ€‘generator | Basic | Full (phrases, frequency, POS) |
| Audio | TTS only | TTS + record/compare |
| Export/Import | CSV only | CSV + JSON |
| Share deck | â€” | Readâ€‘only links |

Integrations: **Study Planner** (schedule reviews), **Course Tracker** (syllabusâ†’decks), **Exam Simulator** (vocab section), **Research Assistant** (generate term glossaries).

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives & Nonâ€‘Goals
**Objectives**
- Deliver a fast, reliable SRS vocabulary/phrase trainer with audio and examples.  
- Support RTL scripts (Arabic), Indic scripts (Tamil), diacritics, and transliteration.  
- Provide quick creation via text ingestion and dictionary hints (no paid APIs in v1; internal heuristics).

**Nonâ€‘Goals (v1)**
- No collaborative deck editing (v2).  
- No marketplace for paid decks.  
- No handwriting recognition (v2 sketchpad practice only).

---

### 2) Information Architecture & Routes

**Pages**
- `/langcards` â€” Todayâ€™s queue, streaks, quick add, recent decks.  
- `/langcards/deck/[id]` â€” Deck details, filters (tags, POS), add/edit cards.  
- `/langcards/review` â€” SRS player (keyboard: 1â€“5 grading).  
- `/langcards/create` â€” Paste text â†’ detect language â†’ extract candidates â†’ approve cards.  
- `/langcards/analytics` â€” Retention (forgetting curve), accuracy by tag/POS, due forecast.  
- `/langcards/settings` â€” Daily target, audio settings, default language pair, answer mode.

**API (SSR)**
- Decks: `POST /langcards/api/deck/create` Â· `GET /langcards/api/deck/list` Â· `POST /langcards/api/deck/update` Â· `POST /langcards/api/deck/delete`  
- Cards: `POST /langcards/api/card/create` Â· `POST /langcards/api/card/update` Â· `POST /langcards/api/card/delete` Â· `GET /langcards/api/card/list`  
- Reviews: `GET /langcards/api/review/due` Â· `POST /langcards/api/review/submit`  
- Generator: `POST /langcards/api/generate` (from text)  
- Media: `POST /langcards/api/media/upload` (image/audio) Â· `GET /langcards/api/media`  
- Import/Export: `POST /langcards/api/import` (csv|json) Â· `POST /langcards/api/export` (csv|json)  
- Settings/Goals: `POST /langcards/api/settings/save` Â· `POST /langcards/api/goal/upsert`  
- Share: `POST /langcards/api/share/create` (Pro, readâ€‘only link)

Web workers recommended for audio processing & session timing to keep UI responsive.

---

### 3) Data Model (Astro DB / SQL)

**Language**  
- `id` (pk), `code` ('en','ar','ta','es',...), `name`, `script` ('Latn','Arab','Taml',...), `rtl` (bool), `translit` ('iso','iast','buckwalter'|null)

**Deck**  
- `id` (uuid pk), `userId` (fk), `name`, `baseLang` (fk Language), `targetLang` (fk Language), `tags` (json), `isShared` (bool default false), `sharedSlug` (string|unique|null), `createdAt`

**Note** (logical note for multiple card faces; similar to Anki Model)  
- `id` (pk), `deckId` (fk), `type` ('word'|'phrase'|'cloze'|'image'|'conjugation'|'script'),  
  `fields` (jsonb: see below), `tags` (json), `createdAt`

**Card** (SRS scheduling unit)  
- `id` (pk), `noteId` (fk), `deckId` (fk), `front` (text), `back` (text), `hint` (text|null),  
  `ipa` (text|null), `audioTtsUrl` (string|null), `audioUserUrl` (string|null),  
  `imageUrl` (string|null), `pos` ('noun'|'verb'|'adj'|'adv'|'expr'|null),  
  `interval` (int days), `ease` (float), `dueAt` (ts), `lapses` (int), `stability` (float|null), `createdAt`

**Review**  
- `id` (pk), `cardId` (fk), `userId` (fk), `grade` (0..5), `reviewedAt` (ts), `nextDueAt` (ts), `durationSec` (int)

**Media**  
- `id` (pk), `userId` (fk), `type` ('audio'|'image'), `url`, `meta` (json), `createdAt`

**Goal**  
- `id` (pk), `userId` (fk), `dailyTarget` (int), `streak` (int), `lastReviewedOn` (date)

**ImportJob**  
- `id` (pk), `userId`, `status` ('pending'|'done'|'error'), `stats` (json), `createdAt`

**Field schema examples for `Note.fields`**
- `word`: `{ "base":"book", "target":"libro", "ipa":"/Ëˆli.bÉ¾o/", "gender":"m", "plural":"libros", "translit":null, "example":{"base":"This is a book.","target":"Esto es un libro."} }`  
- `phrase`: `{ "base":"How are you?","target":"Â¿CÃ³mo estÃ¡s?","register":"informal","example":{...} }`  
- `cloze`: `{ "base":"I ____ soccer on Sundays.","answer":"play","targetSentence":"Juego al fÃºtbol los domingos." }`  
- `conjugation`: `{ "lemma":"to be","table":[{"tense":"present","base":"am/is/are","target":"soy/eres/es/somos/sois/son"}] }`  
- `script`: `{ "character":"à¤…","name":"a","order":[1,2,3], "mnemonic":"like 'a' in 'ago'"} `

---

### 4) SRS Algorithm (SMâ€‘2 Variant)

For each review with **grade g âˆˆ {0..5}**:
```
if g < 3: interval = 1; ease = max(1.3, ease - 0.2); lapses += 1
else:
  if interval == 0: interval = 1
  elif interval == 1: interval = 6
  else: interval = round(interval * ease)
  ease = ease + (0.1 - (5 - g) * (0.08 + (5 - g) * 0.02))
dueAt = now + interval days
```
Defaults: `ease=2.5`, `interval=0`. Clamp interval to [1, 3650]. Pro may enable **stability** research later.

Daily queue pulls cards with `dueAt <= today`, capped by user goal or plan. New card introductions per day configurable (e.g., 10).

---

### 5) Review Player UX

- **Modes**: Normal SRS, **Listen & Type**, **Speak & Compare**, **Cloze**, **Typing (strict/lenient)**.  
- Front shows **prompt** (L1 or L2), optional **audio** & **image**. Back shows answer with **IPA**, **transliteration**, **example sentence**, **notes**.  
- **Grade buttons** 0â€“5 with hotkeys (`1..6`).  
- **Audio**: play TTS; record user (Pro) and show similarity score (rough heuristic v1: Levenshtein/phoneme proxy).  
- **Typing**: diacritics keyboard helper; RTL alignment; toggle â€œshow transliterationâ€.  
- **Streak & progress** indicators; due counter; pause/resume.  
- Accessibility: screenâ€‘reader labels, highâ€‘contrast, large text, RTL support, reduced motion.

---

### 6) Card Creation & Generator

- **Manual add**: base â†” target, IPA/translit, POS, example, audio (optional), image (optional).  
- **Bulk import**: CSV columns autoâ€‘mapped (base,target,ipa,translit,pos,example_base,example_target,image_url,audio_url,tags).  
- **Autoâ€‘generate** from pasted text:  
  1) Detect language(s), split sentences.  
  2) Tokenize and **lemmatize** (basic heuristics and stopword list).  
  3) Rank by frequency and novelty (avoid alreadyâ€‘known words).  
  4) Suggest card drafts with example sentence context.  
- **Conjugation helper**: given lemma + language, provide common tenses grid (seeded rule tables for a few languages in v1).  
- **Cloze builder**: select token(s) to blank out; create L1/L2 mapping.

Validation: required fields per type; length limits; profanity filter (basic).

---

### 7) Analytics

- **Retention**: rolling 7/30/90â€‘day retention %, ease distribution.  
- **Accuracy by tag/POS** and by deck.  
- **Due forecast** (cards due per day for next 14/30 days).  
- **Streaks** and **time spent**.  
- Export CSV (Pro).

---

### 8) Integrations

- **Study Planner**: push â€œreview session 20 minâ€ to schedule; reflect due count.  
- **Course Tracker**: import syllabus vocab lists to decks.  
- **Exam Simulator**: optional vocabâ€‘only practice paper.  
- **Research Assistant**: turn glossary highlights into deck cards.  
- **FlashNote**: core engine parity; decks can sync/duplicate from FlashNote if needed.

---

### 9) API Contracts (Examples)

**Due list**  
`GET /langcards/api/review/due?limit=50` â†’  
`{ "cards":[{"id":"c1","front":"house","hint":null,"audioTtsUrl":"/m/tts/c1.mp3"}], "due": 47 }`

**Submit review**  
`POST /langcards/api/review/submit`  
```json
{ "cardId":"c1", "grade":4, "durationSec":9 }
```
Res: `{ "nextDueAt":"2025-11-10T00:00:00Z", "interval":6, "ease":2.56 }`

**Generate from text**  
`POST /langcards/api/generate`  
```json
{ "baseLang":"en", "targetLang":"es", "text":"I read books in the library on Sundays." }
```
Res: `{ "candidates":[{"type":"word","base":"book","target":"libro","example":{...}}], "detected":"en" }`

**Create card**  
`POST /langcards/api/card/create`  
```json
{
  "deckId":"d1",
  "note":{
    "type":"word",
    "fields":{"base":"water","target":"agua","ipa":"/Ëˆa.É£wa/","example":{"base":"Drink water.","target":"Bebe agua."}},
    "tags":["A1","food"]
  }
}
```
Res: `{ "cardId": "c_123" }`

**Export deck**  
`POST /langcards/api/export` â†’ `{ "url":"/exports/deck_spanish_basic.csv" }`

**Share deck (Pro)**  
`POST /langcards/api/share/create` â†’ `{ "url":"/langcards/shared/abcd1234" }`

---

### 10) Validation Rules

- Deck name 2â€“80 chars; language codes must exist in `Language`.  
- Card front/back 1â€“200 chars each; example sentences â‰¤ 240 chars each.  
- Audio uploads â‰¤ 2MB/clip; images â‰¤ 1MB; formats: mp3/ogg, png/jpg/webp.  
- Daily new card limit 0â€“50; daily review cap 20â€“2000.  
- Review grade âˆˆ {0..5}; duration 1â€“120s.  
- Share links readâ€‘only; cloning creates a new deck for recipient.

---

### 11) Plans & Limits

| Feature | Free | Pro |
|--------|------|-----|
| Decks | 3 | Unlimited |
| Cards/deck | 1,000 | 10,000 |
| Daily reviews | 100 | 1000 |
| Autoâ€‘generator | Basic | Full |
| Audio | TTS | TTS + record/compare |
| Export/Import | CSV | CSV + JSON |
| Share | â€” | Readâ€‘only links |
| CSV Export | â€” | Enabled |

Rate limits: `/review/submit` 60/min, `/generate` 10/hour, `/import` 3/hour.

---

### 12) Suggested File Layout

```
src/pages/langcards/index.astro
src/pages/langcards/deck/[id].astro
src/pages/langcards/review.astro
src/pages/langcards/create.astro
src/pages/langcards/analytics.astro
src/pages/langcards/settings.astro

src/pages/langcards/api/deck/create.ts
src/pages/langcards/api/deck/list.ts
src/pages/langcards/api/deck/update.ts
src/pages/langcards/api/deck/delete.ts
src/pages/langcards/api/card/create.ts
src/pages/langcards/api/card/update.ts
src/pages/langcards/api/card/delete.ts
src/pages/langcards/api/card/list.ts
src/pages/langcards/api/review/due.ts
src/pages/langcards/api/review/submit.ts
src/pages/langcards/api/generate.ts
src/pages/langcards/api/media/upload.ts
src/pages/langcards/api/media/index.ts
src/pages/langcards/api/import.ts
src/pages/langcards/api/export.ts
src/pages/langcards/api/settings/save.ts
src/pages/langcards/api/goal/upsert.ts
src/pages/langcards/api/share/create.ts

src/components/langcards/Deck/*.astro
src/components/langcards/Review/*.astro
src/components/langcards/Create/*.astro
src/components/langcards/Analytics/*.astro
```

---

### 13) Future Enhancements (v2+)

- **Handwriting/sketchpad** for character practice with stroke guides.  
- **Phonemeâ€‘level** scoring using lightweight onâ€‘device models.  
- **Dictionary plugins** (Wiktionary/CCâ€‘BY sources) for richer autoâ€‘hints.  
- **Community sharing** and teacher decks with class codes.  
- **Gamified microâ€‘games**: speed match, audio bingo, picture pick.  
- **Mobile PWA** with offline review sync.

---

**End of Requirements â€” Ready for Codex Implementation.**
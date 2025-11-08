

# ðŸ“š Dictionary+ â€” Full Requirements (Ansiversa)

This document includes a **Codex-friendly summary** and a **full technical specification** to implement the mini app.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### Overview
**Dictionary+** is a fast, multilingual learnerâ€™s dictionary with rich entries: **definitions, examples, synonyms/antonyms, collocations, frequency, morphology, IPA, audio**, and **crossâ€‘links** to related apps (Language Flashcards, Study Planner, Research Assistant). It supports **bilingual lookups** (L1â†”L2), **word forms/lemmas**, **phrase search**, and **miniâ€‘thesaurus** views. Offline caching provides instant responsiveness for recently viewed terms.

### Core Features
- **Smart search**: prefix/fuzzy, language autoâ€‘detect, lemma â†’ inflected forms, phrase search.  
- **Entry view**: senses with **definition, example sentences, IPA, part of speech, morphology**, **synonyms/antonyms**, **collocations**, **idioms/phrasal verbs**, **frequency band**, **CEFR level** (if known).  
- **Pronunciation**: onâ€‘device **TTS** playback; user recording (Pro) with similarity score (light heuristic).  
- **Bilingual mode**: baseâ†”target language translations with usage notes.  
- **Word lists**: custom lists (A1â€“C2, exam lists, user lists), â€œlearn this listâ€ â†’ Language Flashcards.  
- **History and bookmarks**; offline cache of last N entries.  
- **Exports**: Markdown/CSV; â€œSend to Flashcards/Study Plannerâ€.

### Key Pages
- `/dictionary` â€” Search + quick entry panel  
- `/dictionary/word/[slug]` â€” Full entry page  
- `/dictionary/lists` â€” Curated/user lists  
- `/dictionary/compare` â€” Synonym/antonym compare view  
- `/dictionary/history` â€” Recent and bookmarks  
- `/dictionary/settings` â€” Lang pair, phonetics, audio, cache limits

### Minimal Data Model
`Language`, `Lemma`, `Sense`, `Example`, `Relation`, `PronAudio`, `List`, `ListItem`, `Bookmark`, `History`, `Tag`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Lookups/day | 200 | Unlimited |
| Audio | TTS | TTS + record/compare |
| Export | â€” | CSV/MD |
| Lists | 3 custom | Unlimited |
| Offline cache | 50 entries | 500 entries |
| Integrations | Links | Oneâ€‘click send to other apps |

Integrations: **Language Flashcards**, **Study Planner**, **Research Assistant**, **EduPrompt** (term glossaries).

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives and Nonâ€‘Goals
**Objectives**
- Deliver a reliable learnerâ€™s dictionary with **fast search**, **clean entries**, and **useful learning tools**.  
- Support **multilingual pairs** and **bilingual translations** (seed a few popular pairs first).  
- Make it easy to **turn lookups into learning** (flashcards, study tasks).

**Nonâ€‘Goals (v1)**
- No paid thirdâ€‘party dictionary API dependencies (seed with CCâ€‘BY sources/curation).  
- No collaborative public editing (v2).  
- No full corpus concordance (v2 basic collocations only).

---

### 2) Information Architecture and Routes

**Pages**
- `/dictionary` â€” Search with instant results + compact entry drawer; filters: language pair, POS, CEFR.  
- `/dictionary/word/[slug]` â€” Full entry: definitions by sense; IPA/audio; morphology; synonyms/antonyms; collocations; examples; translations; notes; frequency/CEFR; related words.  
- `/dictionary/lists` â€” Curated (A1â€“A2/IELTS/TOEFL) + user lists.  
- `/dictionary/compare` â€” Sideâ€‘byâ€‘side synonym/antonym compare with example sentences.  
- `/dictionary/history` â€” Recent searches and bookmarks; bulk actions/export.  
- `/dictionary/settings` â€” Phonetics style (IPA vs none), default languages, audio, offline cache limits.

**API (SSR)**
- `GET  /dictionary/api/search?q=&baseLang=&targetLang=&pos=`  
- `GET  /dictionary/api/word?slug=&lang=`  
- `GET  /dictionary/api/related?lemmaId=` (synonyms/antonyms/collocations)  
- `GET  /dictionary/api/examples?lemmaId=`  
- `POST /dictionary/api/list/create` Â· `GET /dictionary/api/list` Â· `POST /dictionary/api/list/add` Â· `POST /dictionary/api/list/delete`  
- `POST /dictionary/api/bookmark` Â· `GET /dictionary/api/history`  
- `POST /dictionary/api/export` (csv|md)  
- `POST /dictionary/api/flashcards/send`  
- `POST /dictionary/api/planner/schedule`  
- `POST /dictionary/api/pronounce/record` (Pro) Â· `GET /dictionary/api/pronounce/tts?lemmaId=`

Web workers recommended for **fuzzy search** and **phonetic indexing** on the client for recent cache; SSR handles authoritative results.

---

### 3) Data Model (Astro DB / SQL)

**Language**  
- `id` (pk), `code` ('en','ar','ta','es',...), `name`, `script` ('Latn','Arab','Taml',...), `rtl` (bool)

**Lemma** (base word entry)  
- `id` (uuid pk), `languageId` (fk), `slug` (unique), `lemma` (text), `pos` ('noun'|'verb'|'adj'|'adv'|'expr'|'prep'|'conj'|'det'|'num'|'pron'),  
  `ipa` (text|null), `morph` (json: stems/forms), `frequencyBand` (0..9|null), `cefr` ('A1'..'C2'|null), `tags` (json), `createdAt`

**Sense** (one meaning/usage)  
- `id` (pk), `lemmaId` (fk), `index` (int), `definition` (text), `translation` (text|null), `usageNotes` (text|null), `register` ('formal'|'neutral'|'informal'|null), `domain` (text|null)

**Example**  
- `id` (pk), `lemmaId` (fk), `senseId` (fk|null), `text` (text), `translation` (text|null), `source` (text|null)

**Relation** (synonym/antonym/collocation/derived/phrase)  
- `id` (pk), `fromLemmaId` (fk), `toLemmaId` (fk), `type` ('syn'|'ant'|'colloc'|'deriv'|'phrase'|'phrasal'), `strength` (0..1), `note` (text|null)

**PronAudio**  
- `id` (pk), `lemmaId` (fk), `url` (string), `accent` ('US'|'UK'|'IN'|null), `type` ('tts'|'user'), `durationSec` (int|null), `createdAt`

**List** (curated or user)  
- `id` (pk), `userId` (fk|null for curated), `name`, `langCode`, `level` ('A1'..'C2'|null), `tags` (json), `isCurated` (bool default false)

**ListItem**  
- `id` (pk), `listId` (fk), `lemmaId` (fk), `addedAt`

**Bookmark**  
- `id` (pk), `userId` (fk), `lemmaId` (fk), `createdAt`

**History**  
- `id` (pk), `userId` (fk), `query` (text), `lemmaId` (fk|null), `searchedAt`

**Tag**  
- `id` (pk), `name`, `color`

Indexes: `Lemma.slug`, `Lemma.languageId`, `Sense.lemmaId`, `Relation.fromLemmaId`, `Relation.type`.

---

### 4) Search and Ranking

- Tokenize on **lemma**, **lowercased**; include **phonetic key** (Soundexâ€‘like/Doubleâ€‘Metaphone for Latn; simple mapping for others).  
- Rank by: exact lemma match > lemma prefix > edit distance (â‰¤2) > token overlap in examples/definitions.  
- Language autoâ€‘detect for input; fallback to selected base language.  
- Lemmatize common inflections for English/Spanish/Arabic/Tamil (seed file rules); map to base `Lemma`.  
- â€œDid you meanâ€ using nearest slug + phonetic key.

---

### 5) Entry Composition

Each **Sense** renders with:
- Definition; usage notes; register; optional domain label.  
- Example sentences (min 1; show translation if available).  
- Bilingual translation (if targetLang is set).  
- Synonyms/antonyms (Relation join) with **compare** links.  
- Collocations (Relation type `colloc`) listed by strength.  
- IPA; audio buttons (TTS; user record on Pro).  
- Morphology table (plural, past, comparatives, derived forms).  
- Frequency band and CEFR badge (if known).

**Compare view** merges two lemmas: show differences in register/meaning with examples sideâ€‘byâ€‘side.

---

### 6) UX / UI

- **Search bar** with language pair selector; results list with mini cards.  
- **Entry page** with tabs: *All*, *Synonyms*, *Examples*, *Collocations*, *Phrases*.  
- **Bookmark** and **Add to list** buttons; **Send to Flashcards** CTA.  
- **History** page: infinite scroll; filters by language and time; bulk export.  
- **Lists**: progress indicators; â€œStudy this listâ€ â†’ opens Language Flashcards review session.  
- Accessibility: large text, high contrast, screenâ€‘reader labels, RTL layouts, reduced motion.

---

### 7) API Contracts (Examples)

**Search**  
`GET /dictionary/api/search?q=run&baseLang=en&targetLang=es`  
Res: `{ "items":[{"slug":"run","pos":"verb","ipa":"/rÊŒn/","snippet":"move swiftly..."}], "didYouMean":null }`

**Get entry**  
`GET /dictionary/api/word?slug=run&lang=en`  
Res: `{ "lemma":{"id":"l1","lemma":"run","ipa":"/rÊŒn/","pos":"verb"}, "senses":[{"index":1,"definition":"move swiftly on foot","examples":[...]}, ...], "relations":{"syn":[...],"ant":[...],"colloc":[...]}, "morph":{"past":"ran","pp":"run"} }`

**Related**  
`GET /dictionary/api/related?lemmaId=l1&type=syn` â†’ `{ "items":[{"slug":"sprint","pos":"verb"}] }`

**Create list**  
`POST /dictionary/api/list/create`  
```json
{ "name":"IELTS Core", "langCode":"en", "level":"B2" }
```
Res: `{ "listId":"list_123" }`

**Add to Flashcards**  
`POST /dictionary/api/flashcards/send`  
```json
{ "lemmaId":"l1", "targetLang":"es", "deckName":"ENâ€‘ES Core" }
```
Res: `{ "deckId":"d_99", "cardId":"c_77" }`

**Record pronunciation (Pro)**  
`POST /dictionary/api/pronounce/record` â†’ `{ "ok":true, "score":0.71 }`

**Export**  
`POST /dictionary/api/export` â†’ `{ "url":"/exports/dictionary_list_en_B2.csv" }`

---

### 8) Validation Rules

- Lemma: 1â€“64 chars; slug unique per language.  
- Examples â‰¤ 240 chars; usage notes â‰¤ 500 chars.  
- Relations must reference existing lemmas; `strength` in [0,1].  
- Lists: 2â€“80 chars; items unique per lemma/list.  
- Audio upload â‰¤ 2MB; mp3/ogg.  
- Daily lookup rateâ€‘limits: Free 200/day; Pro unlimited.  
- Offline cache size enforced in settings.

---

### 9) Plans and Limits

| Feature | Free | Pro |
|---|---|---|
| Lookups/day | 200 | Unlimited |
| Lists | 3 custom | Unlimited |
| Export | â€” | CSV/MD |
| Pronunciation | TTS | TTS + record/compare |
| Offline cache | 50 entries | 500 entries |
| History retention | 90 days | Unlimited |

Rate limits: `/search` 60/min; `/flashcards/send` 100/day; `/pronounce/record` 30/day.

---

### 10) Suggested File Layout

```
src/pages/dictionary/index.astro
src/pages/dictionary/word/[slug].astro
src/pages/dictionary/lists.astro
src/pages/dictionary/compare.astro
src/pages/dictionary/history.astro
src/pages/dictionary/settings.astro

src/pages/dictionary/api/search.ts
src/pages/dictionary/api/word.ts
src/pages/dictionary/api/related.ts
src/pages/dictionary/api/examples.ts
src/pages/dictionary/api/list/create.ts
src/pages/dictionary/api/list/index.ts
src/pages/dictionary/api/list/add.ts
src/pages/dictionary/api/list/delete.ts
src/pages/dictionary/api/bookmark.ts
src/pages/dictionary/api/history.ts
src/pages/dictionary/api/export.ts
src/pages/dictionary/api/flashcards/send.ts
src/pages/dictionary/api/planner/schedule.ts
src/pages/dictionary/api/pronounce/record.ts
src/pages/dictionary/api/pronounce/tts.ts

src/components/dictionary/SearchBar.astro
src/components/dictionary/Entry/*.astro
src/components/dictionary/Lists/*.astro
src/components/dictionary/History/*.astro
```

---

### 11) Seed and Curation Plan (v1)

- **Languages**: English (base) with **ENâ†”ES**, **ENâ†”AR**, **ENâ†”TA** seed translations.  
- **POS coverage**: noun, verb, adjective, adverb; common phrasal verbs and idioms.  
- **Lists**: CEFR A1â€“B2 cores (500â€“1500 words each).  
- **Morph rules**: light rule tables for EN/ES/AR/TA to lemmatize common forms.  
- **Audio**: TTS generated; optional curated human clips (later).

---

### 12) Future Enhancements (v2+)

- **Dictionary plugins** (Wiktionary/CCâ€‘BY) with attribution.  
- **Corpus collocations** and nâ€‘gram frequency lines.  
- **Crossâ€‘lingual synonyms** via concept IDs.  
- **Handwriting lookup** for scripts.  
- **Browser extension**: highlight â†’ â€œDefine in Dictionary+â€.  
- **PWA** with offline fullâ€‘text index for chosen languages.

---

**End of Requirements â€” Ready for Codex Implementation.**
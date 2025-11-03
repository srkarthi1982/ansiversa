# ðŸŒŸ Fanfic Generator â€” Full Requirements (Ansiversa)

Codexâ€‘ready specification for building the **Fanfic Generator** mini app.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### What it does
**Fanfic Generator** helps users create original, **transformative fanfiction** across fandoms (anime, games, books, films, Kâ€‘pop AUs, etc.). It offers **canonâ€‘aware setup**, **AU templates**, **pairing & trope controls**, **episode/chapters planner**, **style & tone mimic (nonâ€‘infringing)**, **content safety filters**, and exports to **Markdown/DOCX/EPUB**. Includes **character sheets**, **relationship dynamics**, **lore notes**, and **continuity tracking**.

### Core Features
- **Fandom setup** (title/series + optional canon notes) and **canonâ€‘neutral prompts**.  
- **AU presets**: coffee shop, college, royalty, space opera, historical, time loop, isekai, fantasy RPG, superhero, cyberpunk, idol AU.  
- **Pairings**: ships (MxF, FxF, MxM, poly w/ consent), friendships, ensemble. **No minors in sexual contexts**; consent & age checks enforced.  
- **Tropes & beats**: enemiesâ€‘toâ€‘lovers, slow burn, found family, fake dating, rivals AU, hurt/comfort, secret identity, soulmate marks, mutual pining, fixâ€‘it, canon divergence.  
- **Planner**: outline â†’ acts â†’ chapters â†’ scenes with word targets; subplot threads & tag matrix.  
- **Style**: narrative POV (1st/3rd), tense, tone sliders (angst/fluff/humor/suspense), pacing, rating (G/T/M).  
- **Safety**: content ratings, trigger warnings, ship/age rules, fandom disclaimers (â€œtransformative, nonâ€‘commercialâ€).  
- **Continuity tools**: character voices, recurring motifs, timeline, relationship arc heatmap, â€œpromise & payoffâ€ checks.  
- **Generation**: beats â†’ chapter drafts with optional author notes and endâ€‘ofâ€‘chapter hooks.  
- **Beta mode**: critique suggestions (show/tell, pacing, POV headhops) + lineâ€‘level polish.  
- **Exports**: MD/DOCX/EPUB, AO3â€‘style HTML, preview cards for social.  
- **Integrations**: **Novel Outliner** (import/export beats), **Presentation Designer** (pitch deck), **StoryCrafter** (idea pool).

### Key Pages
- `/fanfic` â€” Library  
- `/fanfic/new` â€” Fandom & pairing wizard  
- `/fanfic/project/[id]` â€” Workspace (Beats, Characters, World/AU, Chapters, Scenes, Threads, Beta)  
- `/fanfic/export/[id]` â€” Export center  
- `/fanfic/settings` â€” Defaults (ratings, trope packs, language)

### Minimal Data Model
`FanficProject`, `Fandom`, `Pairing`, `Character`, `AU`, `BeatModel`, `Beat`, `Chapter`, `Scene`, `Thread`, `RelationshipArc`, `LoreNote`, `StyleProfile`, `Draft`, `BetaNote`, `ExportJob`, `Tag`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Projects | 2 | Unlimited |
| Max words/project | 40k | 200k |
| AU & trope packs | Starter | Full |
| Beta critique | Lite | Full (line notes) |
| Exports | MD | + DOCX/EPUB/AO3 HTML |
| Version history | Last 3 | Unlimited |
| History retention | 60 days | Unlimited |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives & Nonâ€‘Goals
**Objectives**
- Provide a **safe, flexible** tool for creating **transformative** fanworks with strong structure.  
- Keep **continuity** (ships, arcs, lore) consistent across long projects.  
- Offer **clear safety controls** for ratings/consent/age and triggers.

**Nonâ€‘Goals (v1)**
- No NSFW explicit content depicting minors or exploitative scenarios.  
- No scraping or reproducing long copyrighted passages; **summaries only** for canon references.  
- No public gallery (v2 may add private share links).

---

### 2) Information Architecture & Routes

**Pages**
- `/fanfic` â€” Library with filters (fandom, rating, ship type, language).  
- `/fanfic/new` â€” Wizard: fandom, AU, pairings, tropes, themes, rating, warnings, POV/tense, tone, word target.  
- `/fanfic/project/[id]` â€” Tabs: **Beats**, **Characters**, **AU/World**, **Chapters**, **Scenes**, **Threads**, **Beta**, **Settings**.  
- `/fanfic/export/[id]` â€” Export MD/DOCX/EPUB/AO3 HTML.  
- `/fanfic/settings` â€” Defaults; blocked tropes; language pack.

**API (SSR)**
- Projects: `POST /fanfic/api/project/create` Â· `GET /fanfic/api/project?id=` Â· `POST /fanfic/api/project/update` Â· `POST /fanfic/api/project/archive`
- Fandom & AU: `POST /fanfic/api/fandom/set` Â· `POST /fanfic/api/au/set`  
- Pairings & characters: `POST /fanfic/api/pairing/add` Â· `POST /fanfic/api/character/create` `.../update` `.../delete`  
- Structure: `POST /fanfic/api/beatmodel/apply` Â· `POST /fanfic/api/beat/create` `.../update` `.../reorder`  
- Chapters & scenes: `POST /fanfic/api/chapter/create` Â· `POST /fanfic/api/scene/create` `.../update` `.../reorder`  
- Threads & arcs: `POST /fanfic/api/thread/create` Â· `POST /fanfic/api/relationship/track`  
- Lore notes: `POST /fanfic/api/lorenote/add`  
- Style: `POST /fanfic/api/style/set`  
- Generation: `POST /fanfic/api/draft/generate` (beat/chapter â†’ prose) Â· `POST /fanfic/api/draft/rewrite` (tone/pov/length)  
- Beta critique: `POST /fanfic/api/beta/run` Â· `POST /fanfic/api/beta/comment`  
- Export: `POST /fanfic/api/export` (md|docx|epub|html) Â· `GET /fanfic/api/export/status?id=`  
- Safety: `POST /fanfic/api/safety/validate` (rating/age/consent/warnings)

Optional WebSocket `/fanfic/ws` for live word counts and beta feedback streaming.

---

### 3) Generation Controls

**Fandom**: text name (e.g., â€œPokÃ©monâ€), optional era/season/book. Store only **short, factual references**; avoid copying canon text.  
**AU presets**: selectable + custom fields (setting, tech/magic rules, social norms).  
**Pairings**: label, participants, relationship type (romantic platonic poly), consent flags, age (â‰¥18 for adult content), dynamics (rivals, mentor, exes).  
**Tropes & themes**: checklist; intensity sliders (0â€“3).  
**Style profile**: POV (1st/3rd limited/omniscient), tense (past/present), tone sliders (fluff/angst/humor/suspense), pacing (slow/medium/fast), dialogue:narration ratio, prose density.  
**Ratings**: G, T, M (no explicit details in v1); **Warnings**: violence, injury, death, horror, abuse (fadeâ€‘toâ€‘black for sensitive scenes).  
**Language**: EN by default, Pro adds TA/AR/ES/HI; transliteration option.  
**Chapter targets**: number of chapters, words per chapter, cliffhanger preference.

---

### 4) Planner & Continuity

- **Beats**: Threeâ€‘Act/Save The Cat variations tuned for romance, mystery, adventure.  
- **Chapter grid**: shows target words, beat coverage, trope usage.  
- **Relationship arc**: attraction â†’ friction â†’ pivot â†’ mutuality â†’ commitment/break (heatmap).  
- **Lore notebook**: factions, moves/attacks (for games/anime), magic/tech limits, items, geography.  
- **Timeline**: inâ€‘story dates; travel time notes; â€œtime loopâ€ handling.  
- **Promise & payoff**: track setâ€‘ups and later callbacks; warnings for dangling promises.

---

### 5) Data Model (Astro DB / SQL)

**FanficProject**  
- `id` (uuid pk), `userId`, `title`, `fandom`, `au` (text), `language`, `rating` ('G'|'T'|'M'), `warnings` (json), `status` ('idea'|'outline'|'draft'|'revisions'|'final'), `targetWords` (int), `createdAt`, `updatedAt`

**Pairing**  
- `id` (pk), `projectId` (fk), `name`, `type` ('romantic'|'friendship'|'poly'), `memberIds` (json), `consentOk` (bool), `allAdults` (bool), `tags` (json)

**Character**  
- `id` (pk), `projectId` (fk), `name`, `role` (protag/antag/ally/etc.), `age` (int|null), `bio` (longtext), `voice` (text), `goals` (json), `flaws` (json), `tags` (json)

**AU**  
- `id` (pk), `projectId` (fk), `name`, `settings` (json), `rules` (json), `notes` (longtext)

**BeatModel**  
- `id` (pk), `projectId` (fk), `name`, `beats` (json)

**Beat**  
- `id` (pk), `projectId` (fk), `key`, `label`, `summary`, `order` (int)

**Chapter**  
- `id` (pk), `projectId` (fk), `index` (int), `title` (text), `summary` (text), `wordTarget` (int), `status` (text)

**Scene**  
- `id` (pk), `projectId` (fk), `chapterId` (fk), `title` (text), `summary` (longtext), `povCharId` (fk|null), `tense` (text), `when` (datetime|null), `location` (text|null), `wordTarget` (int), `status` (text), `tags` (json)

**Thread**  
- `id` (pk), `projectId` (fk), `type` ('theme'|'motif'|'clue'|'ship'), `name` (text), `color` (text)

**RelationshipArc**  
- `id` (pk), `projectId` (fk), `pairingId` (fk), `stages` (json:[{label,intensity,chapterIndex}]) 

**LoreNote**  
- `id` (pk), `projectId` (fk), `type` (faction/item/place/skill), `title`, `content`, `refs` (json)

**StyleProfile**  
- `id` (pk), `projectId` (fk), `pov`, `tense`, `tone` (json), `density` (text), `dialogueRatio` (float)

**Draft**  
- `id` (pk), `projectId` (fk), `chapterId` (fk), `content` (longtext), `words` (int), `flags` (json)

**BetaNote**  
- `id` (pk), `projectId` (fk), `chapterId` (fk|null), `sceneId` (fk|null), `text` (longtext), `kind` ('pacing'|'voice'|'consistency'|'spelling'|'safety'), `status` ('open'|'resolved')

**ExportJob**  
- `id` (pk), `projectId` (fk), `format` ('md'|'docx'|'epub'|'html'), `options` (json), `status` ('queued'|'running'|'done'|'error'), `url` (string|null), `createdAt`

**Tag**  
- `id` (pk), `name`, `color`

Indexes: `Chapter.projectId+index`, `Draft.chapterId`, `RelationshipArc.pairingId`.

---

### 6) UX / UI

- **Workspace**: left outline (beats/chapters), center editor (chapter/scene), right panel (pairings, tropes, style, warnings).  
- **Ship matrix**: pairings Ã— chapters heatmap (presence/intensity).  
- **Trope tracker**: toggle per chapter; avoid repetition warnings.  
- **Beta view**: inline comments, readability meter (Flesch), dialogue ratio chart.  
- **AO3 tag helper**: suggest tags based on tropes & content.  
- Accessibility: keyboard first, high contrast, RTL scripts.

Shortcuts: `Ctrl/Cmd+Enter` (regenerate), `Alt+â†‘/â†“` (move beat/chapter), `Ctrl/Cmd+B` (beta critique), `Ctrl/Cmd+E` (export).

---

### 7) Safety & Moderation Rules

- **Age & consent**: adult content only if **all** characters are 18+ and consentOk=true; otherwise **fadeâ€‘toâ€‘black** or restrict to T.  
- **Prohibited**: sexual content with minors; sexual violence; incest; bestiality; exploitative content.  
- **Sensitive**: violence, selfâ€‘harm, abuse â†’ use warnings; employ euphemistic/elliptical narration on M.  
- **Copyright**: avoid quoting canon verbatim; summarize canon events.  
- **Celebrities**: allow **PGâ€‘13** RPF with consent tone; disallow explicit content in v1.

---

### 8) API Contracts (Examples)

**Create project**  
`POST /fanfic/api/project/create`  
```json
{ "title":"Fixâ€‘it AU â€” Final Act", "fandom":"PokÃ©mon", "rating":"T", "language":"en", "targetWords":60000 }
```

**Set pairings**  
`POST /fanfic/api/pairing/add`  
```json
{ "projectId":"ff_10", "name":"Ash/Serena", "type":"romantic", "memberIds":["c_ash","c_serena"], "consentOk":true, "allAdults":true }
```

**Apply beat model**  
`POST /fanfic/api/beatmodel/apply`  
```json
{ "projectId":"ff_10", "name":"Romance STC 12", "beats":[{"key":"meet","label":"Meetâ€‘Cute","order":1}] }
```

**Generate chapter draft**  
`POST /fanfic/api/draft/generate`  
```json
{ "projectId":"ff_10", "chapterId":"ch_3", "style":{"pov":"3rd-limited","tense":"past"}, "tone":{"fluff":2,"angst":1} }
```

**Run beta critique**  
`POST /fanfic/api/beta/run`  
```json
{ "projectId":"ff_10", "chapterId":"ch_3", "checks":["pacing","voice","consistency","safety"] }
```

---

### 9) Plans & Limits

| Feature | Free | Pro |
|---|---|---|
| Projects | 2 | Unlimited |
| Words/project | â‰¤ 40k | â‰¤ 200k |
| Exports/day | 3 | 15 |
| Beta notes | 50 | 500 |
| Version history | 3 | Unlimited |
| History | 60 days | Unlimited |

Rate limits: `/draft/generate` 20/day (Free) 150/day (Pro); `/beta/run` 10/day (Free) 80/day (Pro).

---

### 10) Suggested File Layout

```
src/pages/fanfic/index.astro
src/pages/fanfic/new.astro
src/pages/fanfic/project/[id].astro
src/pages/fanfic/export/[id].astro
src/pages/fanfic/settings.astro

src/pages/fanfic/api/project/create.ts
src/pages/fanfic/api/project/index.ts
src/pages/fanfic/api/project/update.ts
src/pages/fanfic/api/project/archive.ts
src/pages/fanfic/api/fandom/set.ts
src/pages/fanfic/api/au/set.ts
src/pages/fanfic/api/pairing/add.ts
src/pages/fanfic/api/character/create.ts
src/pages/fanfic/api/character/update.ts
src/pages/fanfic/api/character/delete.ts
src/pages/fanfic/api/beatmodel/apply.ts
src/pages/fanfic/api/beat/create.ts
src/pages/fanfic/api/beat/update.ts
src/pages/fanfic/api/beat/reorder.ts
src/pages/fanfic/api/chapter/create.ts
src/pages/fanfic/api/scene/create.ts
src/pages/fanfic/api/scene/update.ts
src/pages/fanfic/api/scene/reorder.ts
src/pages/fanfic/api/thread/create.ts
src/pages/fanfic/api/relationship/track.ts
src/pages/fanfic/api/lorenote/add.ts
src/pages/fanfic/api/style/set.ts
src/pages/fanfic/api/draft/generate.ts
src/pages/fanfic/api/draft/rewrite.ts
src/pages/fanfic/api/beta/run.ts
src/pages/fanfic/api/beta/comment.ts
src/pages/fanfic/api/export.ts
src/pages/fanfic/api/export/status.ts
src/pages/fanfic/api/safety/validate.ts

src/components/fanfic/Beats/*.astro
src/components/fanfic/Characters/*.astro
src/components/fanfic/AU/*.astro
src/components/fanfic/Chapters/*.astro
src/components/fanfic/Scenes/*.astro
src/components/fanfic/Threads/*.astro
src/components/fanfic/Beta/*.astro
```

---

### 11) Future Enhancements (v2+)

- **AO3/FFN export helpers** (metadata forms and tag validation).  
- **Collab beta reading** with roles and approvals.  
- **Voice consistency checker** across chapters.  
- **Prompt pool** for fandomâ€‘specific ideas (curated, nonâ€‘infringing).  
- **Image prompt cards** (for illustrators) with character/scene summaries.

---

**End of Requirements â€” Ready for Codex Implementation.**
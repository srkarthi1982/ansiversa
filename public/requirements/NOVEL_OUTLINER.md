# ðŸ“š Novel Outliner â€” Full Requirements (Ansiversa)

Codexâ€‘ready specification for building the **Novel Outliner** mini app.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### What it does
**Novel Outliner** helps fiction writers plan longâ€‘form stories from **idea â†’ logline â†’ beat sheet â†’ acts â†’ chapters â†’ scenes â†’ revisions**. It supports **multiple structures** (Threeâ€‘Act, Save The Cat!, Heroâ€™s Journey, KishÅtenketsu, Snowflake), **character arcs**, **worldâ€‘building bibles**, **timeline consistency**, **POV & tense tracking**, **theme & motif threads**, and **export to manuscript** or to **Presentation Designer** for pitch decks.

### Core Features
- **Project wizard**: genre, audience, comps, tone, POV, tense, target word count.  
- **Structure presets** with editable beats; custom template builder.  
- **Snowflake mode**: singleâ€‘sentence â†’ paragraph â†’ oneâ€‘page â†’ multiâ€‘page outline.  
- **Character system**: bios, goals/flaws, internal/external arcs, relationships graph, cast balance.  
- **Worldâ€‘building**: locations, rules, factions, magic/tech systems, artifacts; crossâ€‘references.  
- **Scene planner**: purpose, conflict, stakes, outcome, setting, POV, onstage cast, foreshadowing hooks.  
- **Threading**: track **themes, motifs, clues**, Chekhov items, Bâ€‘plots; heatâ€‘map per chapter.  
- **Timeline**: chronological vs narrative order; date/time math; continuity warnings.  
- **Beat coverage meter**: shows pacing and act balance; suggests expansions or trims.  
- **Revision tools**: diagnostics (POV swings, orphan threads), color labels, compare versions.  
- **Exports**: Markdown, DOCX, FDX (Final Draft outline), JSON; handoff to **Presentation Designer** (oneâ€‘pager/pitch).

### Key Pages
- `/novel` â€” Library  
- `/novel/new` â€” Project wizard  
- `/novel/project/[id]` â€” Workspace (Beats, Characters, World, Timeline, Scenes, Threads, Revisions)  
- `/novel/export/[id]` â€” Export center  
- `/novel/settings` â€” Defaults (structure templates, color labels, diagnostics)

### Minimal Data Model
`NovelProject`, `BeatModel`, `Beat`, `Act`, `Chapter`, `Scene`, `Character`, `Arc`, `Relation`, `Location`, `Faction`, `Rule`, `Thread`, `ThreadLink`, `TimelineEvent`, `Diagnostic`, `ExportJob`, `Tag`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Projects | 2 | Unlimited |
| Max words target | 60k | 200k |
| Structures | 2 presets | All + custom |
| Snowflake steps | 3 | 10 |
| Exports | MD | + DOCX/FDX/JSON + Deck push |
| Version history | Last 3 | Unlimited |
| Collaboration | â€” | Viewer comments (v1.1) |
| History retention | 60 days | Unlimited |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives & Nonâ€‘Goals
**Objectives**
- Provide a **clear, flexible outlining system** that scales from idea to full scene list.  
- Maintain **continuity** (timeline, POV, arcs, threads) with visual diagnostics.  
- Offer **industryâ€‘familiar structures** and export to common formats.

**Nonâ€‘Goals (v1)**
- Not a full prose editor (handoff to Manuscript/Docs).  
- No AI art generation; cover art handled elsewhere.  
- No public sharing feed (v2).

---

### 2) Information Architecture & Routes

**Pages**
- `/novel` â€” Library with search, tags, genre filters.  
- `/novel/new` â€” Wizard: genre, comps, tone, POV/tense, structure preset, word count, elevator pitch.  
- `/novel/project/[id]` â€” Tabs: **Beats**, **Characters**, **World**, **Timeline**, **Scenes**, **Threads**, **Revisions**, **Settings**.  
- `/novel/export/[id]` â€” Export MD/DOCX/FDX/JSON; pitch deck handoff.  
- `/novel/settings` â€” Manage templates, color palettes, diagnostics thresholds.

**API (SSR)**
- Projects: `POST /novel/api/project/create` Â· `GET /novel/api/project?id=` Â· `POST /novel/api/project/update` Â· `POST /novel/api/project/archive`
- Structures & beats:  
  - `GET /novel/api/structure/list` Â· `POST /novel/api/structure/create` (custom)  
  - `POST /novel/api/beatmodel/apply` (preset â†’ project)  
  - `POST /novel/api/beat/create` Â· `POST /novel/api/beat/update` Â· `POST /novel/api/beat/reorder`
- Characters & arcs:  
  - `POST /novel/api/character/create` `.../update` `.../delete`  
  - `POST /novel/api/arc/create` (internal/external)  
  - `POST /novel/api/relation/link` (character â†” character with label)
- Worldâ€‘building:  
  - `POST /novel/api/location/create` Â· `POST /novel/api/faction/create` Â· `POST /novel/api/rule/create`
- Scenes & chapters:  
  - `POST /novel/api/chapter/create` Â· `POST /novel/api/scene/create` `.../update` `.../reorder`  
  - `POST /novel/api/scene/link` (scene â†” beats/threads)  
- Threads & clues:  
  - `POST /novel/api/thread/create` (theme/motif/clue/bâ€‘plot) Â· `POST /novel/api/threadlink/add`
- Timeline & diagnostics:  
  - `POST /novel/api/timeline/add` (datetime, duration, location, cast)  
  - `GET /novel/api/diagnostics/run` (pacing, POV balance, orphan threads, continuity)  
- Export: `POST /novel/api/export` (md|docx|fdx|json) Â· `GET /novel/api/export/status?id=`  
- Settings: `POST /novel/api/settings/save`

Optional WebSocket `/novel/ws` for live outline meters and conflict warnings.

---

### 3) Structures & Snowflake

**Presets included (Pro gets all):**  
- *Threeâ€‘Act (12 beats)*, *Save The Cat!* (15 beats), *Heroâ€™s Journey* (12 stages), *KishÅtenketsu* (4 beats), *Romance/Meetâ€‘Cute*, *Mystery (Whodunit spine)*, *Thriller (8 sequences)*, *TV Episodic (A/B plots)*.  
- **Custom builder**: define acts, beats, labels, expected word % per beat.

**Snowflake mode**  
1. Oneâ€‘sentence premise â†’ 2. Oneâ€‘paragraph summary â†’ 3. Character summaries â†’ 4. Expanded plot synopsis â†’ 5â€“10. Chapterâ€‘level outline.  
Track deltas and store each step; allow rollback and branch.

---

### 4) Scene Planner

Fields: **Goal**, **Conflict**, **Stakes**, **Outcome**, **Setting**, **POV**, **Onstage cast**, **Time/Date**, **Beat link**, **Foreshadowing**, **Objects/Clues**, **Theme tags**, **Motifs**, **Word target**.  
Status: idea â†’ planned â†’ drafted â†’ revised.  
Diagnostics: **POV heatmap**, **onstage balance**, **exposition load**, **cliffhanger density**.

---

### 5) Threads & Pacing

- **Thread types**: theme, motif, clue/evidence, romance arc, mystery redâ€‘herring, Bâ€‘plot.  
- **Coverage map**: per chapter/scene grid (thread present/absent/intensity).  
- **Pacing meters**: words per beat vs target %; spike warnings; act transition checks.  
- **Continuity checks**: clue introduced â†’ payoff; Chekhov items planted â†’ fired by end.

---

### 6) Timeline & Continuity

- **Chronological vs narrative** ordering; detect flashbacks/flashforwards.  
- **Time math**: event durations; travel times (manual inputs); **overlap warnings** for character locations.  
- **Calendar selector** for inâ€‘world dates; time zones; **moon phase**/sunrise (v1.1 optional).

---

### 7) Data Model (Astro DB / SQL)

**NovelProject**  
- `id` (uuid pk), `userId`, `title`, `genre`, `audience`, `tone`, `pov` ('1st'|'3rd-limited'|'omniscient'|'multi'), `tense` ('past'|'present'), `targetWords` (int), `structure` (text), `status` ('idea'|'outline'|'scenes'|'revisions'|'locked'), `createdAt`, `updatedAt`

**BeatModel**  
- `id` (pk), `projectId` (fk), `name` (text), `acts` (json), `beats` (json:[{key,label,act,expectedPct}])

**Beat**  
- `id` (pk), `projectId` (fk), `key` (text), `label` (text), `summary` (text), `order` (int), `targetPct` (float)

**Act**  
- `id` (pk), `projectId` (fk), `index` (int), `title` (text), `targetPct` (float)

**Chapter**  
- `id` (pk), `projectId` (fk), `index` (int), `title` (text), `summary` (text), `wordTarget` (int), `status` (text)

**Scene**  
- `id` (pk), `projectId` (fk), `chapterId` (fk|null), `title` (text), `summary` (longtext), `povCharId` (fk|null), `tense` (text), `settingId` (fk|null), `when` (datetime|null), `durationMin` (int|null), `status` (text), `wordTarget` (int), `meta` (json)

**Character**  
- `id` (pk), `projectId` (fk), `name`, `role` (protagonist/antagonist/ally/mentor/etc.), `bio` (longtext), `goal` (text), `flaw` (text), `want` (text), `need` (text), `arcType` (growth/fall/flat), `tags` (json)

**Arc**  
- `id` (pk), `projectId` (fk), `characterId` (fk), `beats` (json:[{label,change_evidence,sceneIds[]}])

**Relation**  
- `id` (pk), `projectId` (fk), `aId` (fk), `bId` (fk), `label` (text), `notes` (text)

**Location**  
- `id` (pk), `projectId` (fk), `name`, `type` (city/room/ship/realm), `notes` (text), `geo` (json|null)

**Faction**  
- `id` (pk), `projectId` (fk), `name`, `kind` (guild/corp/kingdom/etc.), `notes` (text)

**Rule**  
- `id` (pk), `projectId` (fk), `domain` (magic/tech/law/custom), `text` (longtext)

**Thread**  
- `id` (pk), `projectId` (fk), `type` ('theme'|'motif'|'clue'|'bplot'|'romance'), `name` (text), `color` (text)

**ThreadLink**  
- `id` (pk), `projectId` (fk), `threadId` (fk), `sceneId` (fk), `intensity` (int 0â€“3)

**TimelineEvent**  
- `id` (pk), `projectId` (fk), `sceneId` (fk|null), `title` (text), `when` (datetime), `durationMin` (int|null), `locationId` (fk|null), `cast` (json)

**Diagnostic**  
- `id` (pk), `projectId` (fk), `type` ('pacing'|'pov'|'thread'|'continuity'), `result` (json), `createdAt`

**ExportJob**  
- `id` (pk), `projectId` (fk), `format` ('md'|'docx'|'fdx'|'json'), `options` (json), `status` ('queued'|'running'|'done'|'error'), `url` (string|null), `createdAt`

**Tag**  
- `id` (pk), `name`, `color`

Indexes: `NovelProject.userId`, `Scene.projectId+chapterId`, `Character.projectId`, `ThreadLink.sceneId`, `TimelineEvent.when`.

---

### 8) UX / UI

- **Dualâ€‘pane workspace**: outline tree left; detail editor right.  
- **Beats view**: draggable beats; progress bars for target vs actual words.  
- **Characters**: card grid + relationship graph; arc timeline for each character.  
- **World**: notebook with linked pages; backlink previews.  
- **Scenes**: kanban (Idea/Planned/Drafted/Revised), table, and timeline views.  
- **Threads**: heatâ€‘map matrix (chapter Ã— thread) with intensity toggle.  
- **Timeline**: horizontal zoomable track; snap to dates; conflict chips.  
- **Revisions**: snapshot & diff; color labels; comment pins (Pro v1.1).  
- Accessibility: keyboard shortcuts, highâ€‘contrast mode, RTL support.

Shortcuts: `N` new scene, `B` new beat, `C` new character, `T` new thread, `G` link to beat, `L` timeline, `E` export.

---

### 9) Diagnostics & Suggestions

- **Pacing**: compare perâ€‘beat word targets; warn Â±20% deviation.  
- **POV**: overuse of single POV or abrupt switches; suggest alternates.  
- **Threads**: orphaned threads; unresolved clues; motif droughts.  
- **Continuity**: impossible overlaps; missing travel time; date order errors.  
- **Representation**: cast diversity balance dashboard (manual tags).

---

### 10) Validation Rules

- Structure must include at least one act and three beats.  
- Scenes must link to a chapter or backlog lane.  
- Timeline events require either a datetime or relative anchor; no negative durations.  
- Thread intensity 0â€“3 only; chapter indices unique; POV must match defined character.  
- Exports limited to â‰¤ 10 MB; DOCX/FDX schema checks.

---

### 11) Plans & Limits

| Feature | Free | Pro |
|---|---|---|
| Projects | 2 | Unlimited |
| Word target | â‰¤ 60k | â‰¤ 200k |
| Snowflake steps | 3 | 10 |
| Version history | 3 snapshots | Unlimited |
| Exports/day | 3 | 15 |
| History | 60 days | Unlimited |

Rate limits: `/beatmodel/apply` 20/day (Free) 200/day (Pro); `/diagnostics/run` 20/day (Free) 120/day (Pro).

---

### 12) Suggested File Layout

```
src/pages/novel/index.astro
src/pages/novel/new.astro
src/pages/novel/project/[id].astro
src/pages/novel/export/[id].astro
src/pages/novel/settings.astro

src/pages/novel/api/project/create.ts
src/pages/novel/api/project/index.ts
src/pages/novel/api/project/update.ts
src/pages/novel/api/project/archive.ts
src/pages/novel/api/structure/list.ts
src/pages/novel/api/structure/create.ts
src/pages/novel/api/beatmodel/apply.ts
src/pages/novel/api/beat/create.ts
src/pages/novel/api/beat/update.ts
src/pages/novel/api/beat/reorder.ts
src/pages/novel/api/character/create.ts
src/pages/novel/api/character/update.ts
src/pages/novel/api/character/delete.ts
src/pages/novel/api/arc/create.ts
src/pages/novel/api/relation/link.ts
src/pages/novel/api/location/create.ts
src/pages/novel/api/faction/create.ts
src/pages/novel/api/rule/create.ts
src/pages/novel/api/chapter/create.ts
src/pages/novel/api/scene/create.ts
src/pages/novel/api/scene/update.ts
src/pages/novel/api/scene/reorder.ts
src/pages/novel/api/scene/link.ts
src/pages/novel/api/thread/create.ts
src/pages/novel/api/threadlink/add.ts
src/pages/novel/api/timeline/add.ts
src/pages/novel/api/diagnostics/run.ts
src/pages/novel/api/export.ts
src/pages/novel/api/export/status.ts

src/components/novel/Beats/*.astro
src/components/novel/Characters/*.astro
src/components/novel/World/*.astro
src/components/novel/Scenes/*.astro
src/components/novel/Threads/*.astro
src/components/novel/Timeline/*.astro
src/components/novel/Revisions/*.astro
```

---

### 13) Future Enhancements (v2+)

- **Pitch deck generator** with logline, comps, character arcs, and beats autoâ€‘formatted.  
- **AI scene synopsis** from beats; **conflict brainstormer** per scene.  
- **Reader mode** to create chapter summaries and sensitivity checklists.  
- **Collaboration** with roles and approvals.  
- **Import** from existing outlines (Scrivener/Notion/Google Docs).

---

**End of Requirements â€” Ready for Codex Implementation.**
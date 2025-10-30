# ðŸ§© Concept Explainer â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/concept-explainer`  
**Category:** Learning & Knowledge  
**Stack:** Astro + Tailwind (islands where needed), Astro SSR API routes, Astro DB / Supabase  
**Goal:** Turn any concept (from school topics to pro subjects) into **clear, levelâ€‘appropriate explanations** with **examples, analogies, visuals, stepâ€‘byâ€‘step breakdowns, and quick checks**. Connects to **FlashNote**, **Quiz Institute**, **Lesson Builder**, and **Blog Writer**.

---

## 1) Objectives & Nonâ€‘Goals

### Objectives
- Input a **topic or pasted text** â†’ get a structured explanation: **definition â†’ breakdown â†’ examples â†’ analogies â†’ visuals â†’ pitfalls â†’ miniâ€‘quiz**.
- **Audience levels**: Kids (8â€“12), Teen (13â€“17), Undergrad, Professional, Expert.  
- **Styles**: textbook, teacherâ€‘talk, story, bullet cheatsheet, Socratic Q&A.  
- **Add context**: region (e.g., CBSE/State Board), subject, exam tag, language (English/Tamil/Arabic, etc.).  
- Generate **diagrams** (ASCII/flowchart spec) and **formula derivations** where relevant.  
- Produce **FlashNotes** and **Quiz Institute** questions with one click.  
- Save, version, and export: Markdown/PDF/JSON.  

### Nonâ€‘Goals (v1)
- No claims of exam correctness guarantees; human review recommended.  
- No copyrighted textbook content reproduction beyond fair use transformation.  
- No external web scraping behind logins.

---

## 2) User Stories (Acceptance Criteria)

1. **Explain a Concept**
   - *As a user*, I enter â€œPhotosynthesisâ€ and choose level=Teen, style=teacherâ€‘talk.  
   - **AC:** `/concept-explainer/api/explain` returns sections: definition, steps, key terms, example, analogy, diagram spec, pitfalls, miniâ€‘quiz.

2. **Refine With Context**
   - *As a user*, I set Board=CBSE, Class=10, Language=Tamil.  
   - **AC:** output respects context (terminology, units, syllabus emphasis, translation).

3. **Generate FlashNotes & Quiz**
   - *As a user*, I click **Create FlashNote** and **Create Quiz**.  
   - **AC:** `/concept-explainer/api/flashnote` and `/concept-explainer/api/quiz` return readyâ€‘toâ€‘save items.

4. **Compare Styles/Levels**
   - *As a user*, I view sideâ€‘byâ€‘side versions (kids vs undergrad; textbook vs story).  
   - **AC:** `/concept-explainer/api/variants` returns two or more formatted variants.

5. **Upload Source Text (Optional)**
   - *As a user*, I paste a passage (or upload txt/pdf) and ask to â€œexplain simplyâ€.  
   - **AC:** `/concept-explainer/api/explain` extracts topics and rewrites in chosen level/style.

6. **Export & Save**
   - *As a user*, I export to MD/PDF/JSON or save a version.  
   - **AC:** `/concept-explainer/api/export` + `/concept-explainer/api/save` succeed; slug created.

7. **Plan Gating**
   - Free: 10 concepts/day, 1 export/day, watermark.  
   - Pro: unlimited explanations, batch mode, no watermark, custom templates.

---

## 3) Routes & Information Architecture

- `/concept-explainer` â€” Landing: quick form (topic, level, style, language) + recent concepts.  
- `/concept-explainer/new` â€” Advanced form (subject, region/board, exam tags, tone, depth, include diagram/quiz).  
- `/concept-explainer/[slug]` â€” Concept page (sections + actions: FlashNote, Quiz, Export, Save, Version diff).  
- `/concept-explainer/variants/[slug]` â€” Sideâ€‘byâ€‘side comparisons.  
- `/concept-explainer/history` â€” Saved concepts and versions.  
- `/concept-explainer/templates` â€” Style presets (teacher, textbook, cheatsheet, story, Socratic).

**API (SSR)**  
- `POST /concept-explainer/api/explain`  
- `POST /concept-explainer/api/variants`  
- `POST /concept-explainer/api/flashnote`  
- `POST /concept-explainer/api/quiz`  
- `POST /concept-explainer/api/save` Â· `POST /concept-explainer/api/duplicate` Â· `POST /concept-explainer/api/delete`  
- `POST /concept-explainer/api/export` (md|pdf|json)
- `POST /concept-explainer/api/upload` (txt/pdf) â€” extract text, then explain

---

## 4) Output Schema (JSON)

```json
{
  "topic": "Photosynthesis",
  "level": "teen",
  "style": "teacher",
  "language": "en",
  "sections": {
    "definition": "â€¦",
    "key_terms": [{"term":"chlorophyll","meaning":"â€¦"}],
    "step_by_step": ["Light hits chlorophyllâ€¦","Electronsâ€¦","Glucoseâ€¦"],
    "formulas": [{"name":"Overall","expr":"6CO2 + 6H2O â†’ C6H12O6 + 6O2"}],
    "worked_example": {"prompt":"â€¦","solution_steps":["â€¦","â€¦"]},
    "analogy": "Like a solar kitchenâ€¦",
    "diagram": {"type":"flow","dsl":"start:Sun -> chloroplast -> glucose+oxygen"},
    "pitfalls": ["Plants also respireâ€¦"],
    "mini_quiz": [
      {"type":"mcq","q":"â€¦","options":["A","B","C","D"],"answer":"B","why":"â€¦"},
      {"type":"tf","q":"â€¦","answer":false,"why":"â€¦"}
    ]
  },
  "sources": [],
  "createdAt": "2025-10-28T00:00:00Z"
}
```

---

## 5) Database Model (Astro DB / SQL)

**User**  
- `id` (pk), `email`, `plan`, `languagePref`, `timezone`, `createdAt`

**Concept**  
- `id` (pk uuid), `userId` (fk), `topic`, `slug`, `subject`, `board`, `classGrade`, `level`, `style`, `language`,  
  `context` (json), `output` (json), `createdAt`, `updatedAt`, `version` (int)

**ConceptVersion**  
- `id` (pk), `conceptId` (fk), `output` (json), `createdAt`, `note`

**Template**  
- `id` (pk), `userId` (fk), `name`, `level`, `style`, `language`, `config` (json)

**ExportJob**  
- `id` (pk), `conceptId` (fk), `format` ('md'|'pdf'|'json'), `url`, `createdAt`

---

## 6) UI / Pages

### `/concept-explainer` (Quick Explain)
- Topic input + level/style/language selects.  
- Output preview panes: definition, steps, examples, analogy, miniâ€‘quiz.  
- Buttons: **FlashNote**, **Quiz**, **Variants**, **Export**, **Save**.

### `/concept-explainer/new`
- Advanced fields: subject, board, class, exam tags (NEET/JEE/CBSE), tone, depth, translations, include diagram.  
- Option: â€œstrict syllabusâ€ (limits breadth for board exams).

### `/concept-explainer/[slug]`
- Tabs: **Explain**, **Examples**, **Diagrams**, **Miniâ€‘Quiz**, **Versions**.  
- Actions: **Create FlashNote**, **Create Quiz**, **Export** (MD/PDF/JSON), **Duplicate**, **Delete**.

### `/concept-explainer/variants/[slug]`
- Sideâ€‘byâ€‘side cards; swap level/style; copy any section into main.

### `/concept-explainer/history`
- Filter by subject, board, class, date; quick open.

### `/concept-explainer/templates`
- Preset cards; â€œset as defaultâ€ per user.

---

## 7) API Contracts (examples)

### `POST /concept-explainer/api/explain`
Req:  
```json
{
  "topic":"Photosynthesis",
  "level":"teen",
  "style":"teacher",
  "language":"en",
  "subject":"Biology",
  "board":"CBSE",
  "classGrade":"10",
  "include":{"diagram":true,"miniQuiz":true}
}
```  
Res: `{ "slug":"photosynthesis-teen-teacher", "output":{...} }`

### `POST /concept-explainer/api/variants`
Req: `{ "topic":"Entropy", "variants":[{"level":"kids"},{"style":"story"}] }`  
Res: `{ "items":[{"label":"kids","output":{...}}, {"label":"story","output":{...}}] }`

### `POST /concept-explainer/api/flashnote`
Req: `{ "conceptId":"<uuid>" }` â†’ Res: `{ "flashnoteId":"<uuid>", "url":"/flashnote/<id>" }`

### `POST /concept-explainer/api/quiz`
Req: `{ "conceptId":"<uuid>", "count":6, "types":["mcq","tf"] }` â†’ Res: `{ "quizId":"QUIZ-123" }`

### `POST /concept-explainer/api/export`
Req: `{ "conceptId":"<uuid>", "format":"md|pdf|json" }` â†’ Res: `{ "url":"/exports/Concept_Photosynthesis.md" }`

### `POST /concept-explainer/api/delete`
Req: `{ "id":"<uuid>" }` â†’ Res: `{ "ok":true }`

---

## 8) Validation Rules

- Topic length 2â€“120 chars; subject from whitelist; board optional.  
- Level âˆˆ {kids, teen, undergrad, professional, expert}; style âˆˆ {textbook, teacher, story, cheatsheet, socratic}.  
- Miniâ€‘quiz size 3â€“10; examples 1â€“3; diagrams max 1 per explain (v1).  
- Language ISO code required; fallback to English if unsupported.

---

## 9) Integrations

- **FlashNote** â€” convert key points into flashcards.  
- **Quiz Institute** â€” autoâ€‘generate quiz from miniâ€‘quiz items.  
- **Lesson Builder** â€” send â€œlesson skeletonâ€ from the sections.  
- **Blog Writer** â€” publish as a blogified explainer.

---

## 10) Plans & Limits

| Feature | Free | Pro |
|--------|------|-----|
| Explanations/day | 10 | Unlimited |
| Exports | 1/day (watermark) | Unlimited (no watermark) |
| Variants | 2 at once | 5 at once |
| Languages | EN + 1 local | All supported |
| Batch mode | â€” | Yes |

Rate limits: `userId`+day for explain/variants; `userId`+month for exports.

---

## 11) Accessibility & UX

- Large readable typography; highâ€‘contrast math/diagrams; RTL support.  
- Keyboard copy buttons; collapsible sections; printâ€‘friendly.  
- Optional â€œsimple words modeâ€ for kids.

---

## 12) Suggested File Layout

```
src/pages/concept-explainer/index.astro
src/pages/concept-explainer/new.astro
src/pages/concept-explainer/[slug].astro
src/pages/concept-explainer/variants/[slug].astro
src/pages/concept-explainer/history.astro
src/pages/concept-explainer/templates.astro

src/pages/concept-explainer/api/explain.ts
src/pages/concept-explainer/api/variants.ts
src/pages/concept-explainer/api/flashnote.ts
src/pages/concept-explainer/api/quiz.ts
src/pages/concept-explainer/api/save.ts
src/pages/concept-explainer/api/export.ts
src/pages/concept-explainer/api/delete.ts
src/pages/concept-explainer/api/upload.ts

src/components/concept-explainer/Explain/*.astro
src/components/concept-explainer/Variants/*.astro
src/components/concept-explainer/Quiz/*.astro
src/components/concept-explainer/Diagrams/*.astro
```

---

## 13) Future Enhancements (v2+)

- Rich diagram renderers (Mermaid/Graphviz) and editable canvases.  
- Crossâ€‘linking between related concepts and prerequisite maps.  
- â€œMisconception detectorâ€ for pasted student answers.  
- Cohort sharing/teacher packs.  
- Audio narration (TTS) per section.

---

**End of Requirements â€” ready for Codex implementation.**
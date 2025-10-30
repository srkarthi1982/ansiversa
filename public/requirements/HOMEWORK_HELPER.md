# ðŸ“š Homework Helper â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/homework-helper`  
**Category:** Learning & Knowledge  
**Stack:** Astro + Tailwind (islands for editors/solvers), Astro SSR API routes, Astro DB / Supabase, optional worker for long jobs  
**Goal:** Help students understand and solve homework problems **stepâ€‘byâ€‘step** across Math, Science, English, Social Science, and Programmingâ€”**without doing their work for them**. Emphasize learning: hints, explanation paths, similar practice, and citations when facts are used.

> Positioning: A guided tutor that turns any question into learnable stepsâ€”connected with Quiz Institute, Concept Explainer, Fact Generator, and FlashNote.

---

## 1) Objectives & Nonâ€‘Goals

### Objectives
- Accept problems via **text**, **image upload (OCR)**, or **URL of a worksheet/page** (text only in v1).  
- Provide **stepâ€‘byâ€‘step guidance** with controllable hint levels (Hint 1, Hint 2, Reveal Step, Full Solution).  
- Support **Math** (arithmetic â†’ calculus), **Science** (physics/chem/biology factual & conceptual), **English** (grammar, comprehension), **Social** (history/geographyâ€”with citations), **Programming** (pseudoâ€‘code + explanation; *no ready-made graded solutions if academic integrity applies*).
- Autoâ€‘detect topic & grade band (CBSE/International toggle) and suggest **Concept Explainer** links.  
- Generate **similar practice problems** with answers and **explain my mistake** flow.  
- **Citations** for factual answers (Tier A/B preferred, see Fact Generator tiers).  
- Export to **PDF/MD** study sheets or **FlashNote** cards.  
- Parent/teacher view for progress snapshots.

### Nonâ€‘Goals (v1)
- No full book/PDF scanning beyond a single page or cropped image.  
- No plagiarism of textbook solution manuals; instead, produce **original steps**.  
- No auto-submission to LMS platforms.

---

## 2) User Stories (Acceptance Criteria)

1. **Ask a Question (Text)**
   - *As a student*, I paste a question and choose a subject.  
   - **AC:** `/homework-helper/api/solve` returns a scaffold with topic, estimated difficulty, and **Step 1** displayed + `Show next step` control.

2. **Ask a Question (Image)**
   - *As a student*, I upload a clear photo of a problem.  
   - **AC:** `/homework-helper/api/ocr` extracts text; I can edit the detection before solving.

3. **Hints â†’ Full Solution**
   - *As a learner*, I try hints first.  
   - **AC:** Each `Show next step` reveals one step; final step shows the answer + reasoning; math renders with KaTeX.

4. **Check My Work**
   - *As a learner*, I enter my attempt.  
   - **AC:** `/homework-helper/api/check` compares reasoning & result, pointing out **exact mistake locations** and suggesting corrections.

5. **Similar Practice**
   - *As a learner*, I click **Practice similar**.  
   - **AC:** `/homework-helper/api/practice/generate` returns 3â€“5 new problems with answers and short solutions.

6. **Citations (Nonâ€‘Math)**
   - *As a learner*, I see sources for factual questions.  
   - **AC:** Citations listed with tier badges (A/B/C), minimum one reputable source.

7. **Plan Gating**
   - Free: 10 questions/day, basic hints, no PDF export.  
   - Pro: Unlimited questions, detailed solutions, PDF exports, practice sets, teacher dashboard.

---

## 3) Subjects & Capabilities

- **Math:** arithmetic, factors, fractions, decimals, ratio, percentages, algebra (linear/quadratic), coordinate geometry, sequences/series, probability & statistics, trigonometry basics, calculus (limits/derivatives/integrals) â€” with symbolic steps.  
- **Physics:** kinematics, Newtonâ€™s laws, work/energy, electricity, waves â€” numeric & conceptual; unit handling & sig figs.  
- **Chemistry:** stoichiometry, moles, reactions, periodic trends; equilibrium & pH basics.  
- **Biology:** definitions, processes, diagrams (explain textually), genetics basics; **requires citations**.  
- **English:** grammar fixes, paraphrase with explanation, summarization, reading comprehension (evidence from text).  
- **Social:** history/geography/civics factual answers â€” **always cite** and timeâ€‘scope the answer.  
- **Programming:** algorithm reasoning, pseudoâ€‘code, code review with explanations; avoid providing full graded solutions where prohibited by honor code prompts.

---

## 4) Routes & Information Architecture

- `/homework-helper` â€” Hub: input (text/upload), recent problems, quick subject chips.  
- `/homework-helper/solve/[id]` â€” Solver page (steps, hints, practice).  
- `/homework-helper/history` â€” My questions, filters by subject & date.  
- `/homework-helper/practice` â€” Practice generator & sets.  
- `/homework-helper/teacher` â€” Teacher/parent snapshot (Pro).  
- `/homework-helper/settings` â€” Board (CBSE/Intl), grade band, units (SI/US), language.

**API (SSR):**  
- `POST /homework-helper/api/ocr` (image â†’ text)  
- `POST /homework-helper/api/solve` (returns stepwise plan)  
- `POST /homework-helper/api/step/next` (progressive reveal)  
- `POST /homework-helper/api/check` (compare attempt)  
- `POST /homework-helper/api/practice/generate`  
- `POST /homework-helper/api/explain/mistake`  
- `POST /homework-helper/api/export` (pdf|md)  
- `GET  /homework-helper/api/history`  
- `POST /homework-helper/api/flag` (report incorrect/unsafe)  
- `POST /homework-helper/api/settings/save`

---

## 5) Data Model (Astro DB / SQL)

**User**  
- `id` (pk), `email`, `plan`, `role` ('student'|'teacher'|'parent'), `board` ('cbse'|'intl'), `gradeBand` ('5â€‘8'|'9â€‘10'|'11â€‘12'|'UG'), `language`, `units`, `createdAt`

**Problem**  
- `id` (pk uuid), `userId` (fk), `subject`, `text`, `images` (json), `detectedTopic` (string), `gradeBand`, `difficulty` (1..5), `createdAt`

**SolutionPlan**  
- `id` (pk uuid), `problemId` (fk), `status` ('draft'|'in_progress'|'complete'), `steps` (array of {n, title, bodyMd, latex? bool}), `finalAnswer` (json), `hints` (array), `safetyTags` (json), `citations` (json), `explanations` (json), `createdAt`

**Attempt**  
- `id` (pk uuid), `problemId` (fk), `userId` (fk), `workMd` (text), `result` (json {correct:bool, diff:string[]}), `createdAt`

**PracticeSet**  
- `id` (pk uuid), `userId` (fk), `subject`, `items` (array of {q, a, stepsMd}), `createdAt`

**Settings**  
- `id` (pk), `userId` (fk), `board`, `gradeBand`, `language`, `units`

**Flag**  
- `id` (pk), `problemId` (fk), `userId` (fk|null), `reason`, `details`, `createdAt`, `status` ('new'|'triaged'|'fixed')

---

## 6) Solution Plan Content Schema

```json
{
  "steps": [
    {"n":1, "title":"Identify given and required", "bodyMd":"Given: ... Required: ..."},
    {"n":2, "title":"Choose formula", "bodyMd":"Use **Distance formula**: $d=\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$"},
    {"n":3, "title":"Substitute and simplify", "bodyMd":"..."}
  ],
  "finalAnswer": {"value":"5 cm", "units":"cm", "precision":"2 dp"},
  "citations": [
    {"title":"NCERT Class 10 Mathematics â€“ Chapter 7", "url":"https://...", "tier":"A"}
  ]
}
```

- Steps render with **KaTeX** for LaTeX blocks.  
- Buttons: **Show next step**, **Explain this step**, **Alternate method**.

---

## 7) Safety, Integrity, and Guidance

- Show **learning disclaimer** (â€œUse this to learn, not to cheat.â€).  
- For essays/assignments, provide **outline & evidence** rather than final copy; encourage own words.  
- Cite sources for non-math/derivation content; avoid misinformation with date scoping.  
- **Ageâ€‘appropriate** filters (Kid mode hides sensitive examples).  
- Offensive content autoâ€‘flags; show safer alternatives.  
- Respect **academic integrity** toggles for teachers (â€œno final numeric answers until last stepâ€).

---

## 8) UI / Pages (Key Interactions)

### `/homework-helper` (Hub)
- Input: text box, camera/upload. Subject chips, grade band, board.  
- Recent problems list; quick links: **Practice**, **Concept Explainer**.

### Solver
- Left: problem & images.  
- Center: steps with progressive reveal; math renderer; attempt input.  
- Right: references (citations), related concepts, similar problems, export.

### Practice
- Generate similar problems; track accuracy; oneâ€‘click **Send to Quiz Institute**.

### Teacher/Parent Snapshot (Pro)
- Summary cards: **Problems solved**, **Avg steps revealed**, **Accuracy**, **Top weak topics**.  
- Downloadable report.

---

## 9) API Contracts (examples)

### `POST /homework-helper/api/solve`
Req:  
```json
{
  "text":"Find the distance between (2,3) and (7,11).",
  "subject":"math",
  "board":"cbse",
  "gradeBand":"9-10",
  "hintMode":"progressive"
}
```
Res: `{ "problemId":"<uuid>", "planId":"<uuid>", "step":1 }`

### `POST /homework-helper/api/check`
Req: `{ "problemId":"<uuid>", "attempt":"d = sqrt(9^2 + 8^2) = 12" }`  
Res: `{ "correct":false, "diff":["Used 9 and 8 instead of 5 and 8"], "nextHint":"Reâ€‘compute Î”x and Î”y." }`

### `POST /homework-helper/api/practice/generate`
Req: `{ "topic":"distance_formula", "count":5, "gradeBand":"9-10" }`  
Res: `{ "setId":"<uuid>", "items":[{"q":"...","a":"..."}] }`

### `POST /homework-helper/api/export`
Req: `{ "planId":"<uuid>", "format":"pdf" }`  
Res: `{ "url":"/exports/homework-helper_set_Nov-2025.pdf" }`

---

## 10) Validation Rules

- Problem text 10â€“2,000 chars. Images â‰¤ 5 MB (jpg/png, clear text).  
- Math LaTeX length caps; escape sequences sanitized.  
- Citations required for factual subjects; at least one Tier A/B source where feasible.  
- Practice set size 1â€“20; teacher reports within last 90 days.

---

## 11) Plans & Limits

| Feature | Free | Pro |
|--------|------|-----|
| Questions/day | 10 | Unlimited |
| Step reveal | Up to 3 | Unlimited |
| Practice sets | 1 active | Unlimited |
| Exports | â€” | PDF/MD |
| Teacher/parent | â€” | Snapshot & report |
| OCR | Basic | Enhanced + batch |
| Integrations | Concept Explainer | + Quiz Institute, FlashNote |

Rate limits: per `userId`/day for solve/check/generate; per `planId`/hour for step reveals.

---

## 12) Accessibility & UX

- Keyboard operable step navigation and hint buttons.  
- Highâ€‘contrast & large font modes; screenâ€‘reader labels.  
- RTL support (Arabic); language toggle (English/Tamil/Arabic).  
- Reduced motion; dyslexiaâ€‘friendly font option.

---

## 13) Suggested File Layout

```
src/pages/homework-helper/index.astro
src/pages/homework-helper/solve/[id].astro
src/pages/homework-helper/history.astro
src/pages/homework-helper/practice.astro
src/pages/homework-helper/teacher.astro
src/pages/homework-helper/settings.astro

src/pages/homework-helper/api/ocr.ts
src/pages/homework-helper/api/solve.ts
src/pages/homework-helper/api/step/next.ts
src/pages/homework-helper/api/check.ts
src/pages/homework-helper/api/practice/generate.ts
src/pages/homework-helper/api/explain/mistake.ts
src/pages/homework-helper/api/export.ts
src/pages/homework-helper/api/history.ts
src/pages/homework-helper/api/flag.ts
src/pages/homework-helper/api/settings/save.ts

src/components/homework-helper/Solver/*.astro
src/components/homework-helper/Practice/*.astro
src/components/homework-helper/Teacher/*.astro
```

---

## 14) Future Enhancements (v2+)

- **Handwriting OCR** and onâ€‘canvas annotation.  
- **Diagram helper** (plots, freeâ€‘body diagrams, circuit maps).  
- **Timed practice** and mastery progression (spaced repetition).  
- **Skill map** per board (CBSE/ICSE/IB) with coverage heatmaps.  
- **Live tutor mode** (chat) with guardrails.  
- **PWA offline** for cached steps and practice.

---

**End of Requirements â€” ready for Codex implementation.**
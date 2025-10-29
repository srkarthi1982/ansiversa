# ðŸŽ“ EduPrompt â€” Full Requirements (Ansiversa)

This document includes a **short summary** for Codex onboarding and the **full technical specification** for implementation.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### Overview
**EduPrompt** is a promptâ€‘engineering toolkit tailored for **teachers, tutors, and students**. It provides **readyâ€‘made, curriculumâ€‘aware prompt templates** (lesson plans, explanations at different reading levels, quiz writers, rubric graders), plus a **prompt builder** that assembles highâ€‘quality prompts with **roles, constraints, examples, and evaluation rubrics**. Outputs can be exported to Lesson Builder, Quiz Institute, FlashNote, and Presentation Designer.

### Core Features
- **Template Gallery**: curriculumâ€‘aware prompts (CBSE 9â€“12, general STEM/Humanities).  
- **Prompt Builder**: structured fields â†’ role, task, context, format, constraints, examples, rubric.  
- **Multiâ€‘persona Runs**: teacher/tutor/examiner/coach variants for the same task.  
- **Level & Tone Controls**: reading level (A1â€“C2), tone (formal, friendly), language.  
- **Evaluation & Selfâ€‘check**: auto rubric to grade generated output and suggest fixes.  
- **Dataset Mode**: create N variants (e.g., 20 quiz questions) with **deduplication and topic coverage**.  
- **Guardrails**: plagiarism check, sources requested, safe completion policy.  
- **Exports**: MD, JSON (schema for Quiz/FlashNote), DOCX; send to other mini apps.

### Key Pages
- `/eduprompt` â€” Gallery + Recent  
- `/eduprompt/builder` â€” Structured builder  
- `/eduprompt/run/[id]` â€” Run console (inputs, outputs, eval)  
- `/eduprompt/datasets` â€” Batch generation & QA  
- `/eduprompt/history` â€” Saved prompts & outputs  
- `/eduprompt/settings` â€” Model, safety, limits

### Minimal Data Model
`Template`, `Prompt`, `Run`, `Eval`, `Dataset`, `Output`, `Constraint`, `ParamProfile`

### Plan Gating
| Feature | Free | Pro |
|--------|------|-----|
| Templates | Core set | Full library + custom |
| Batch size | 5 items/run | 200 items/run |
| Exports | MD | MD/DOCX/JSON |
| Model | base | pro tier |
| Guardrails | Basic | Full + plagiarism check |
| Integrations | View only | Oneâ€‘click to apps |

Integrations: **Lesson Builder, Quiz Institute, FlashNote, Presentation Designer, Study Planner, Research Assistant**.

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives & Nonâ€‘Goals
**Objectives**
- Provide highâ€‘quality educational prompt templates and a robust builder that make **repeatable, controllable** outputs.  
- Support **curriculum alignment**, reading levels, multilingual outputs, and exports to other Ansiversa apps.  
- Include **evaluation** and **guardrails** to maintain quality and safety.

**Nonâ€‘Goals (v1)**
- No public template marketplace.  
- No collaborative editing; singleâ€‘user templates only (sharing v2).  
- No web search in prompts (users can paste sources / use Research Assistant).

---

### 2) Information Architecture & Routes

**Pages**
- `/eduprompt` â€” Gallery: search, subject filters, class/board, task types.  
- `/eduprompt/builder` â€” Form with sections: Role, Task, Inputs, Context, Constraints, Format, Examples, Rubric, Tone/Level, Language.  
- `/eduprompt/run/[id]` â€” Run console: prompt preview, model settings, output viewer, eval score, revise & reâ€‘run.  
- `/eduprompt/datasets` â€” Batch generation UI with progress & dedupe.  
- `/eduprompt/history` â€” Past prompts & outputs, tags, favorites.  
- `/eduprompt/settings` â€” Defaults: model, max tokens, temperature, safety toggles, style presets.

**API (SSR)**
- Templates: `GET /eduprompt/api/template/list` Â· `GET /eduprompt/api/template?id=` Â· `POST /eduprompt/api/template/create` Â· `POST /eduprompt/api/template/update`  
- Builder & Runs: `POST /eduprompt/api/prompt/preview` Â· `POST /eduprompt/api/run` Â· `GET /eduprompt/api/run?id=`  
- Eval: `POST /eduprompt/api/eval` (selfâ€‘check rubric)  
- Dataset: `POST /eduprompt/api/dataset/create` Â· `POST /eduprompt/api/dataset/run` Â· `GET /eduprompt/api/dataset/status`  
- Quality: `POST /eduprompt/api/dedupe` Â· `POST /eduprompt/api/coverage`  
- Export: `POST /eduprompt/api/export` (md|docx|json) Â· `POST /eduprompt/api/send` (to other apps)  
- Settings: `POST /eduprompt/api/settings/save`

Web workers recommended for batch generation/dedupe to keep UI responsive.

---

### 3) Prompt Model & Builder

**Template Types (examples)**  
- **Lesson Plan Generator** (topic â†’ objectives, materials, activities, assessments, differentiation).  
- **Concept Explainer** (gradeâ€‘level rewrite, analogies, examples).  
- **Quiz Writer** (MCQ, TF, numeric, short answer; difficulty mix; blueprint).  
- **Flashcards Maker** (term â†’ definition, example; JSON schema for FlashNote).  
- **Rubric Grader** (criteria & levels â†’ grade + feedback).  
- **Socratic Tutor** (stepâ€‘byâ€‘step questioning; reveal answer last).  
- **Reading Comprehension Pack** (passage â†’ questions by Bloom level).  
- **Worksheet Builder** (N variants, answer key).  
- **Slide Outliner** (headings + bullet points; handâ€‘off to Presentation Designer).

**Builder Sections (fields)**  
- **Role**: teacher, tutor, examiner, coach, curriculum specialist.  
- **Task**: clear instruction verb; objective.  
- **Context**: board/class, prior knowledge, constraints (time, materials), safety.  
- **Inputs**: topic text, syllabus outline, example problems, passages.  
- **Format**: Markdown/JSON; headings, table needs, token caps.  
- **Examples**: fewâ€‘shot examples (inputâ†’output pairs).  
- **Rubric**: criteria/levels for selfâ€‘check and iterative improvement.  
- **Constraints**: avoid plagiarism; cite sources if provided; language/tone; reading level.  
- **Params**: temperature, topâ€‘p, max tokens, stop sequences.  
- **Metadata**: tags, subject, class, language, owner.

Prompt preview concatenates sections deterministically with markers:

```
[ROLE] You are a {role}. 
[TASK] {task}. 
[CONTEXT] {context}. 
[INPUT] {input}. 
[FORMAT] {format_instructions}. 
[CONSTRAINTS] {constraints}. 
[EXAMPLES] {few_shot_pairs}. 
[RUBRIC] {criteria}. 
[PARAMS] temp={t}, max_tokens={k}.
```

---

### 4) Data Model (Astro DB / SQL)

**Template**  
- `id` (uuid pk), `ownerId` (fk), `name`, `type`, `subject`, `board`, `class`, `language`, `fields` (json schema with defaults), `createdAt`, `updatedAt`, `isSystem` (bool)

**Prompt**  
- `id` (pk), `templateId` (fk|null), `ownerId` (fk), `title`, `sections` (json: role/task/context/inputs/format/examples/rubric/constraints/params), `tags` (json), `createdAt`

**Run**  
- `id` (pk), `promptId` (fk), `model` (enum), `temperature` (float), `maxTokens` (int), `seed` (int|null), `status` ('queued'|'running'|'done'|'error'), `costCents` (int|null), `createdAt`

**Output**  
- `id` (pk), `runId` (fk), `contentMd` (text), `contentJson` (json|null), `language`, `grade` (float|null), `feedback` (text|null), `exportUrls` (json), `createdAt`

**Eval**  
- `id` (pk), `runId` (fk), `rubric` (json), `score` (float), `details` (json), `createdAt`

**Dataset**  
- `id` (pk), `ownerId`, `promptId` (fk), `sizeRequested` (int), `sizeCompleted` (int), `status` ('pending'|'running'|'done'|'error'), `coverage` (json), `dedupeStats` (json), `createdAt`

**Constraint**  
- `id` (pk), `promptId` (fk), `type` ('plagiarism'|'age_safety'|'sources_required'|'level_limit'|'length'), `value` (json)

**ParamProfile**  
- `id` (pk), `ownerId`, `name`, `params` (json), `createdAt`

Indexes on `ownerId`, `templateId`, `createdAt`, `tags` for fast filtering.

---

### 5) Quality, Coverage & Dedupe

- **Coverage**: ensure generated set spans topics/difficulties or Bloom levels as requested.  
- **Dedupe**: nâ€‘gram or embeddingâ€‘free similarity (v1 heuristic): lowerâ€‘cased text, remove numbers, Jaccard â‰¥ 0.85 â†’ consider duplicate.  
- **Selfâ€‘check**: LLM evaluates against rubric and suggests edits; optionally autoâ€‘revise and reâ€‘grade up to N loops (Nâ‰¤3).  
- **Plagiarism check**: heuristic in v1 (string similarity vs inputs/samples); flag for manual review.  
- **Citations**: if sources provided, format as footnotes or inline authorâ€‘year (no claims without attribution when sources are included).

---

### 6) UX / UI

- **Gallery**: cards with subject/board tags; quick preview; â€œUse templateâ€.  
- **Builder**: tabbed sections; live prompt preview panel; token estimator.  
- **Run Console**: left = inputs/params; right = output + rubric grade; action buttons: Improve, Make variants (N), Export, Send to app.  
- **Datasets**: progress bar; coverage grid; dedupe/conflict list; oneâ€‘click export to Quiz Institute/FlashNote.  
- **History**: table with filters; star/favorite; compare runs.  
- Accessibility: keyboard nav, screenâ€‘reader labels, high contrast, RTL, reduced motion.

---

### 7) API Contracts (Examples)

**Preview prompt**  
`POST /eduprompt/api/prompt/preview`  
```json
{
  "sections": {
    "role":"teacher",
    "task":"Create a CBSE Class 10 lesson plan on Newton's Laws",
    "context":"40-minute class; include materials and differentiation",
    "inputs":"Syllabus unit: Force and Laws of Motion",
    "format":"Markdown with H2/H3 and checklists",
    "constraints":"Age-appropriate; no plagiarism; examples from daily life",
    "examples":[{"in":"Topic: Ohm's Law","out":"..."}],
    "rubric":{"criteria":["coverage","clarity","age-appropriate"],"levels":4},
    "params":{"temperature":0.4,"maxTokens":1000}
  }
}
```
Res: `{ "promptText":"[ROLE] You are a teacher...","tokenEstimate": 820 }`

**Run**  
`POST /eduprompt/api/run` â†’ `{ "runId":"<uuid>" }`

**Evaluate**  
`POST /eduprompt/api/eval` â†’ `{ "score": 0.86, "feedback":"Add exit ticket and formative checks." }`

**Dataset run**  
`POST /eduprompt/api/dataset/run`  
```json
{ "promptId":"p1","size":50,"coverage":{"physics":["kinematics","thermo"],"difficulty":{"easy":20,"med":20,"hard":10}} }
```
Res: `{ "datasetId":"d1","status":"running" }`

**Export**  
`POST /eduprompt/api/export`  
```json
{ "outputId":"o1", "format":"json", "target":"quiz" }
```
Res: `{ "url":"/exports/quiz_pack_2025_11.json" }`

**Send to Lesson Builder**  
`POST /eduprompt/api/send`  
```json
{ "outputId":"o1", "targetApp":"lesson", "meta":{"courseId":"c1"} }
```

---

### 8) Validation Rules

- Template/Prompt names 3â€“80 chars; tags â‰¤ 10.  
- Batch size 1â€“200 (Pro); Free â‰¤ 5.  
- Max tokens per run â‰¤ 4000; temperature 0â€“1.2.  
- Rubric must define 1â€“10 criteria; each 2â€“5 levels.  
- Dedup threshold defaults to 0.85; adjustable 0.7â€“0.95 (Pro).  
- Exports under 10MB per file; rateâ€‘limited.

---

### 9) Plans & Limits

| Feature | Free | Pro |
|--------|------|-----|
| Templates | Core | Full + custom |
| Batch size | 5 | 200 |
| Selfâ€‘check loops | 1 | 3 |
| Dedup/Coverage | Basic | Advanced controls |
| Exports | MD | MD/DOCX/JSON |
| Integrations | View links | Oneâ€‘click to apps |
| History retention | 30 days | Unlimited |

Rate limits: `/run` 30/day (Free) 500/day (Pro); `/dataset/run` 3/day (Free) 20/day (Pro).

---

### 10) Suggested File Layout

```
src/pages/eduprompt/index.astro
src/pages/eduprompt/builder.astro
src/pages/eduprompt/run/[id].astro
src/pages/eduprompt/datasets.astro
src/pages/eduprompt/history.astro
src/pages/eduprompt/settings.astro

src/pages/eduprompt/api/template/list.ts
src/pages/eduprompt/api/template/index.ts
src/pages/eduprompt/api/template/create.ts
src/pages/eduprompt/api/template/update.ts
src/pages/eduprompt/api/prompt/preview.ts
src/pages/eduprompt/api/run.ts
src/pages/eduprompt/api/eval.ts
src/pages/eduprompt/api/dataset/create.ts
src/pages/eduprompt/api/dataset/run.ts
src/pages/eduprompt/api/dataset/status.ts
src/pages/eduprompt/api/dedupe.ts
src/pages/eduprompt/api/coverage.ts
src/pages/eduprompt/api/export.ts
src/pages/eduprompt/api/send.ts

src/components/eduprompt/Gallery/*.astro
src/components/eduprompt/Builder/*.astro
src/components/eduprompt/Run/*.astro
src/components/eduprompt/Datasets/*.astro
```

---

### 11) Seed Template List (v1)

- Lesson Plan (CBSE 9â€“12): Physics, Chemistry, Math, Biology, English.  
- Concept Explainer (5 levels): Beginnerâ†’Advanced.  
- Quiz Writer (MCQ/TF/Numeric/Short) with blueprint.  
- Flashcards Maker (JSON schema for FlashNote).  
- Reading Comprehension Pack (Bloom levels).  
- Worksheet Builder (with answer key).  
- Socratic Tutor dialogue.  
- Slide Outliner (to Presentation Designer).  
- Rubric Grader (with customizable criteria).

---

### 12) Future Enhancements (v2+)

- **Template sharing** with class codes.  
- **Live classroom runs** (teacher broadcasts a run to students).  
- **Model ensembles** (consensus of 2â€“3 outputs).  
- **Feedback learning loops** (implicit fineâ€‘tuning per user).  
- **Curriculum plugins** (import from CBSE PDFs; structured parsing).

---

**End of Requirements â€” Ready for Codex Implementation.**
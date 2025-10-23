# ðŸ§© Prompt Builder â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/prompt-builder`  
**Category:** Writing & Creativity / Developer Tools  
**Stack:** Astro + Tailwind (islands where needed), Astro SSR API routes, Astro DB / Supabase  
**Goal:** Help users **design, test, version, and share** effective prompts (system/instruction/fewâ€‘shot) with variables, test benches, cost/token estimates, and exports for quick integration in apps.

---

## 1) Objectives & Nonâ€‘Goals

### Objectives
- Compose prompts from **blocks**: System, Instruction, Fewâ€‘shot examples, Tool/Function hints, and User variables.  
- **Variables & slots** like `{product}`, `{tone}`, `{audience}` with default values and validation.  
- **Test bench**: run prompt against a set of test cases; capture outputs, token/cost, latency.  
- **A/B compare** prompt variants; highlight differences and score results.  
- **Versioning** & rollback; **templates** for common tasks (email, code, blog, support, sql).  
- **Export/Share**: JSON/.prompt, Markdown, copyâ€‘ready code (fetch/cURL/JS/TS), sharable readâ€‘only link.  
- **Safety & quality checks**: prompt linter (ambiguity, missing vars), redâ€‘flag terms, PII reminders.

### Nonâ€‘Goals (v1)
- No multiâ€‘tenant team collaboration or comments (v2).  
- No live dataset eval with metrics like accuracy/F1 (v2 lite uses tag scoring only).  
- No external tool calls beyond model inference (v2 may add web or function-calling mocks).

---

## 2) User Stories (Acceptance Criteria)

1. **Create Prompt**
   - *As a user*, I can create a prompt project and add blocks (System, Instruction, Examples, Variables).  
   - **AC:** Project saved with a unique slug; opens Builder at `/prompt-builder/builder?id=<uuid>`.

2. **Define Variables**
   - *As a user*, I can declare variables `{name}`, `{tone}`, etc., with type (string, enum, number), default, and description.  
   - **AC:** Missing variables are flagged on Run; UI asks to fill them.

3. **Add Fewâ€‘shot Examples**
   - *As a user*, I can add example pairs (input â†’ ideal output) that are interpolated into the final prompt.  
   - **AC:** Examples reorderable; can be enabled/disabled per run.

4. **Test Bench**
   - *As a user*, I can add test cases (inputs + expected traits/tags).  
   - **AC:** `/prompt-builder/api/run` executes cases and records outputs, tokens, latency; shows pass/fail tags.

5. **A/B Compare**
   - *As a user*, I can duplicate the prompt to Variant B and run the same test bench.  
   - **AC:** Sideâ€‘byâ€‘side results; shows token and cost deltas with color cues.

6. **Prompt Linter & Safety**
   - *As a user*, I see warnings: undefined variables, vague words, jailbreak magnets, personal data hints.  
   - **AC:** `/prompt-builder/api/lint` returns issues by severity with quick fixes.

7. **Export/Share**
   - *As a user*, I can export as JSON/.prompt/Markdown and copy a ready JS/TS snippet.  
   - **AC:** Exports include blocks, variables, model settings, and metadata.

8. **Model Settings**
   - *As a user*, I can choose model, temperature, max tokens, topâ€‘p, frequency/presence penalty.  
   - **AC:** Settings stored per version and applied on run.

9. **Versioning**
   - *As a user*, I can snapshot a version with notes; restore older versions.  
   - **AC:** Version history with diffs and timestamps.

10. **Plan Gating**
    - Free: 5 projects, 50 runs/day, single model profile, watermark on share.  
    - Pro: unlimited projects, 1,000 runs/day, multiple model profiles, A/B compare, no watermark.

---

## 3) Routes & Information Architecture

- `/prompt-builder` â€” Dashboard (projects list + â€œNew Promptâ€).  
- `/prompt-builder/builder` â€” Main editor (blocks + variables + test bench + results).  
- `/prompt-builder/templates` â€” Template gallery.  
- `/prompt-builder/view/[slug].astro` â€” Readâ€‘only share page.

**API (SSR):**  
- `POST /prompt-builder/api/create`  
- `POST /prompt-builder/api/save` (patch; autosave)  
- `POST /prompt-builder/api/run` (single or batch)  
- `POST /prompt-builder/api/lint`  
- `POST /prompt-builder/api/export` (json|prompt|md|code)  
- `POST /prompt-builder/api/duplicate`  
- `POST /prompt-builder/api/delete`  
- `POST /prompt-builder/api/publish` (create public slug)  
- `GET  /prompt-builder/api/templates`

---

## 4) Database Model (Astro DB / SQL)

**User**  
- `id` (pk), `email` (unique), `plan`, `createdAt`

**PromptProject**  
- `id` (pk uuid), `userId` (fk), `title`, `slug` (unique per user), `status` ('draft'|'published'),  
  `blocks` (json), `variables` (json), `model` (json), `notes` (text),  
  `lastSavedAt` (datetime), `createdAt` (datetime)

**PromptVersion**  
- `id` (pk), `projectId` (fk), `version` (int), `blocks` (json), `variables` (json), `model` (json), `notes` (text), `createdAt`

**TestCase**  
- `id` (pk), `projectId` (fk), `label` (string), `input` (json), `tags` (json), `expected` (json|null), `createdAt`

**Run**  
- `id` (pk), `projectId` (fk), `version` (int), `caseId` (fk|null),  
  `output` (longtext), `tokensPrompt` (int), `tokensOutput` (int), `cost` (numeric), `latencyMs` (int),  
  `modelName` (string), `createdAt`

**SnippetLibrary** (optional)  
- `id` (pk), `userId` (fk), `name` (string), `body` (text), `language` (string 'js'|'ts'|'py'), `createdAt`

### JSON: `PromptProject.blocks` (example)
```json
{
  "system": "You are a helpful assistant that writes UAE-friendly English.",
  "instruction": "Write a {tone} product description for {product} targeting {audience}.",
  "examples": [
    {"input": "Noise-cancelling earbuds", "output": "A concise, benefit-led blurb..."},
    {"input": "Kids coding camp", "output": "Friendly, parent-facing copy..."}
  ],
  "toolHints": "When user asks for price, avoid exact numbers unless given."
}
```

### JSON: `PromptProject.variables` (example)
```json
[
  {"name": "product", "type": "string", "default": "", "required": true, "desc": "What are we describing?"},
  {"name": "tone", "type": "enum", "options": ["professional","friendly","playful"], "default": "professional"},
  {"name": "audience", "type": "string", "default": "general"}
]
```

### JSON: `PromptProject.model` (example)
```json
{ "provider": "openai", "model": "gpt-5-turbo", "temperature": 0.3, "maxTokens": 600, "topP": 1 }
```

---

## 5) UI / Pages

### `/prompt-builder` (Dashboard)
- Cards: title, last run, versions, runs count; actions: **Open**, **Duplicate**, **Delete**.  
- Filters: tag, model, date. CTA: â€œNew Promptâ€ (blank or template).

### `/prompt-builder/builder`
- **Left**: Blocks editor (System, Instruction, Examples, Tool Hints).  
- **Center**: Variables panel + Model settings.  
- **Right**: Test Bench â†’ table of test cases; Run button; Results list with tokens/cost/latency.  
- Top bar: Save/Version, A/B toggle (Variant A/B), Export, Publish; autosave indicator.  
- Bottom: Linter warnings; token estimate; cost estimate (perâ€‘run + total).

### `/prompt-builder/templates`
- Template cards (Email, Support Reply, Blog Outline, SQL Helper, Code Review).  
- â€œUse Templateâ€ â†’ pre-fills blocks, variables, test cases.

### `/prompt-builder/view/[slug]`
- Readâ€‘only view showing blocks, variables, and sample outputs; **Copy Code** and **Download JSON**.

---

## 6) API Contracts

### `POST /prompt-builder/api/create`
Req: `{ "title": "Product Copy Prompt" }`  
Res: `{ "id": "<uuid>", "slug": "product-copy-prompt" }`

### `POST /prompt-builder/api/save`
Req: `{ "id": "<uuid>", "patch": { "path": "blocks.instruction", "value": "Write a {tone}..." } }`  
Res: `{ "ok": true, "lastSavedAt": "<ISO>" }`

### `POST /prompt-builder/api/run`
Req: `{ "id":"<uuid>", "cases":[{"label":"Earbuds","input":{"product":"NC earbuds","tone":"friendly","audience":"commuters"}}], "model":{"temperature":0.2} }`  
Res: `{ "results":[{"case":"Earbuds","output":"...", "tokensPrompt":355, "tokensOutput":217, "cost":0.0032, "latencyMs":850}] }`

### `POST /prompt-builder/api/lint`
Req: `{ "blocks": {...}, "variables":[...]} }`  
Res: `{ "issues":[{"severity":"warn","field":"instruction","message":"Variable {audiene} undefined, did you mean {audience}?"}] }`

### `POST /prompt-builder/api/export`
Req: `{ "id":"<uuid>", "format":"json|prompt|md|code", "lang":"js|ts|py" }`  
Res: `{ "url": "/exports/Prompt_Product_Copy_2025-10-23.json" }`

### `POST /prompt-builder/api/duplicate`
Req: `{ "id":"<uuid>" }`  
Res: `{ "id":"<newUuid>" }`

### `POST /prompt-builder/api/delete`
Req: `{ "id":"<uuid>" }`  
Res: `{ "ok": true }`

### `POST /prompt-builder/api/publish`
Req: `{ "id":"<uuid>" }`  
Res: `{ "url": "/prompt-builder/view/product-copy-prompt" }`

### `GET /prompt-builder/api/templates`
Res: `{ "items": ["email","support","blog-outline","sql-helper","code-review"] }`

---

## 7) Validation Rules

- Title 3â€“120 chars; slug unique per user.  
- Variable names: `^[a-z][a-z0-9_]*$`; unique; required vars must be provided on run.  
- Blocks length limits: system â‰¤ 2000 chars, instruction â‰¤ 4000, each example â‰¤ 1500.  
- Max 30 examples; max 50 test cases per project (Free: 10).  
- Runs/day: Free â‰¤ 50; Pro â‰¤ 1000 (soft cap).

---

## 8) Export & Code Snippets

- **JSON**: full project (blocks, vars, model).  
- **.prompt**: plain text with block markers.  
- **Markdown**: humanâ€‘readable doc for reviews.  
- **Code**: JS/TS `fetch` snippet and cURL including variable injection.  
- **Token & cost** estimates shown preâ€‘run based on block lengths and model rates (config table).

---

## 9) Plans & Rate Limits

| Feature | Free | Pro |
|--------|------|-----|
| Projects | 5 | Unlimited |
| Runs/day | 50 | 1000 |
| Templates | 2 basic | All |
| A/B Compare | â€” | Yes |
| Export | JSON/MD | JSON/MD/.prompt/Code |
| Share Page Watermark | Yes | No |

Rate limit keys: `userId` + day for runs; `userId` + hour for lint.

---

## 10) Security & Privacy

- Drafts private; share pages public only when published.  
- Sanitize all text; block script tags; escape curly braces within content.  
- Do not log raw prompt texts in production; store sizes and timing only (configurable).

---

## 11) Analytics & Events

- `prompt.create`, `prompt.save`, `prompt.run`, `prompt.ab`, `prompt.export`, `prompt.publish`, `prompt.delete`, `prompt.duplicate`, `prompt.lint`.  
- Capture token/cost totals per project and top performing variants.

---

## 12) Accessibility & UX

- Keyboard shortcuts (Run = Cmd/Ctrl+Enter; Duplicate = Cmd/Ctrl+D).  
- Clear focus states; aria for tabs/tables; code fonts in blocks editor.  
- RTL support in blocks and view.

---

## 13) Suggested File Layout

```
src/pages/prompt-builder/index.astro
src/pages/prompt-builder/builder.astro
src/pages/prompt-builder/templates.astro
src/pages/prompt-builder/view/[slug].astro

src/pages/prompt-builder/api/create.ts
src/pages/prompt-builder/api/save.ts
src/pages/prompt-builder/api/run.ts
src/pages/prompt-builder/api/lint.ts
src/pages/prompt-builder/api/export.ts
src/pages/prompt-builder/api/duplicate.ts
src/pages/prompt-builder/api/delete.ts
src/pages/prompt-builder/api/publish.ts
src/pages/prompt-builder/api/templates.ts

src/components/prompt-builder/BlocksEditor/*.astro or .tsx
src/components/prompt-builder/VariablesPanel/*.astro
src/components/prompt-builder/TestBench/*.astro
src/components/prompt-builder/Results/*.astro
```

---

## 14) Future Enhancements (v2+)

- Team spaces, comments, and approvals.  
- Dataset eval with scoring functions & golden sets.  
- Prompt chaining (multiâ€‘step workflows) and toolâ€‘calling mocks.  
- Model routing & fallback policies; budget caps per project.  
- Oneâ€‘click export to other Ansiversa apps (Email, Blog, Proposal).

---

**End of Requirements â€” ready for Codex implementation.**
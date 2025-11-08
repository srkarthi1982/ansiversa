# ðŸ” Rephrase & Paraphraser â€” Full Requirements (Ansiversa)

Codexâ€‘ready specification for building the **Rephrase & Paraphraser** mini app.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### What it does
**Rephrase & Paraphraser** rewrites text with **clear controls** for tone, style, length, and originality. It supports **sentence/paragraph/doc modes**, **simplify/expand/condense**, **fluency & grammar fixes**, **formal â†” casual voice**, **keywordâ€‘preserving SEO rewrites**, **readability targets**, **citationâ€‘safe paraphrase**, and **sideâ€‘byâ€‘side diffs**. Exports to **Markdown, HTML, and DOCX**.

### Core Features
- **Modes**: Quick Rewrite, Guided Rewrite, Academicâ€‘safe Paraphrase, SEO Rewrite, Social Caption Shrink, Email Polisher (handoff).  
- **Controls**: tone (formal/neutral/friendly/persuasive), style (concise/narrative/bulletized), length (â€“70% â€¦ +150%), reading level (Grade 5â€“16), passiveâ†’active toggle, jargonâ†’plain toggle, emoji allowance.  
- **Constraints**: **keep keywords**, **keep named entities**, **preserve numbers/units/links**, **do not change quotes/code**.  
- **Quality & integrity**: similarity score vs source, plagiarism guard (highâ€‘overlap warning), citation helper (turn sentences into â€œaccording toâ€¦â€ with source placeholders).  
- **Batch**: multiple snippets in one session; CSV import/export (text, output, settings).  
- **Diffs**: perâ€‘sentence change view, tokens colorâ€‘diff, reason tags (reordered, simplified, clarified).  
- **Exports**: MD/HTML/DOCX/JSON; copy buttons for small snippets.  
- **Integrations**: **AI Translator & Tone Fixer**, **Email Polisher**, **Blog Writer**.

### Key Pages
- `/rephrase` â€” Workspace  
- `/rephrase/new` â€” Quick wizard  
- `/rephrase/history` â€” Past jobs  
- `/rephrase/settings` â€” Defaults (tone, style, constraints)

### Minimal Data Model
`RephraseProject`, `Snippet`, `Constraint`, `Preset`, `QAResult`, `ExportJob`, `Tag`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Projects | 10 | Unlimited |
| Max input per job | 2,000 chars | 50,000 chars |
| Batch CSV | â€” | âœ… |
| Readability targets | Basic | Full + custom |
| Similarity report | Preview | Full with perâ€‘sentence |
| Exports | MD/HTML | + DOCX/JSON |
| History retention | 30 days | Unlimited |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives & Nonâ€‘Goals
**Objectives**
- Provide **controllable rewrites** that improve clarity and match intent without altering factual content or protected text.  
- Encourage **ethical use** with similarity and citation aids.  
- Keep output **portable** and easy to integrate with other apps.

**Nonâ€‘Goals (v1)**
- No automatic **source retrieval**; user supplies citations.  
- No realâ€‘time web plagiarism scanning (only internal **similarity** vs input and optional userâ€‘provided sources).

---

### 2) Information Architecture & Routes

**Pages**
- `/rephrase` â€” Editor with panes: **Input/Output**, **Controls**, **Constraints**, **QA/Diff**, **Export**.  
- `/rephrase/new` â€” Quick presets (Email formalize, Simplify for Grade 6, SEO keepâ€‘keywords, Academic neutral).  
- `/rephrase/history` â€” Jobs list (filters: preset, length change, date).  
- `/rephrase/settings` â€” Presets, default tone/style, allowed emojis, legal notice.

**API (SSR)**
- Projects/jobs: `POST /rephrase/api/project/create` Â· `GET /rephrase/api/project?id=` Â· `POST /rephrase/api/project/update` Â· `POST /rephrase/api/project/archive`  
- Rewrite: `POST /rephrase/api/snippet/rewrite` (text + controls + constraints)  
- Batch: `POST /rephrase/api/batch/upload` (csv) Â· `GET /rephrase/api/batch/status?id=`  
- Presets: `POST /rephrase/api/preset/save` Â· `POST /rephrase/api/preset/delete`  
- QA & diff: `POST /rephrase/api/qa/similarity` Â· `POST /rephrase/api/qa/readability` Â· `POST /rephrase/api/diff`  
- Export: `POST /rephrase/api/export` (md|html|docx|json) Â· `GET /rephrase/api/export/status?id=`  
- Settings: `POST /rephrase/api/settings/save`

Optional WebSocket `/rephrase/ws` for streaming rewrites and live diffs.

---

### 3) Controls & Presets

**Controls**  
- Tone (enum), Style (concise/narrative/bulleted), Length slider (â€‘70%..+150%), Reading level (5..16), Passiveâ†’Active, Jargonâ†’Plain, Emoji allowed, Bulletize, Sentence cap (max N words).  
- **Constraints toggles**: Keep keywords (list), Keep entities (ORG/PROD/LOC/PER), Preserve numbers/units/links, Lock quotes/code/backticks, Preserve headings/markdown.  
- **SEO options**: keep keywords, add synonyms, meta description draft, slug suggestion.  
- **Academicâ€‘safe**: neutral tone, cite prompts (e.g., â€œAccording to [Author, Year]â€¦â€), prevent metaphorical inventions in factual paragraphs.

**Presets (examples)**  
- *Email â€” Formalize & Shorten* (tone=formal, length=â€‘30%, active voice).  
- *Explain Like Iâ€™m 12* (tone=friendly, level=6, jargonâ†’plain, emoji allowed).  
- *SEO â€” Keep Keywords* (tone=neutral, keep keywords + synonyms).  
- *Academic Paraphrase* (tone=academic, level=12â€“14, citation helper on, quotes locked).  
- *Social Caption Shrink* (tone=playful, 150 chars, bulletize off, emojis limited).

---

### 4) QA, Similarity & Readability

- **Similarity**: cosine/Jaccard token overlap + nâ€‘gram uniqueness; perâ€‘sentence scores with thresholds (low/med/high).  
- **Readability**: Fleschâ€‘Kincaid grade; sentence length & passive voice counts.  
- **Diff**: wordâ€‘level and sentenceâ€‘level color diff; â€œwhy changeâ€ tags (grammar, clarity, deâ€‘jargon, shorten, restructure).  
- **Warnings**: changed numbers/units/links; removed citations; altered quotes/code.  
- **Report**: downloadable JSON/MD summary with settings + scores.

---

### 5) Data Model (Astro DB / SQL)

**RephraseProject**  
- `id` (uuid pk), `userId`, `title`, `presetId` (fk|null), `status` ('draft'|'done'), `createdAt`, `updatedAt`

**Snippet**  
- `id` (pk), `projectId` (fk), `index` (int), `input` (longtext), `output` (longtext), `controls` (json), `constraints` (json), `scores` (json:{similarity,readability}), `diff` (json), `flags` (json)

**Constraint**  
- `id` (pk), `projectId` (fk), `keepKeywords` (json), `keepEntities` (json), `preserveNumbers` (bool), `preserveLinks` (bool), `lockQuotes` (bool), `lockCode` (bool)

**Preset**  
- `id` (pk), `projectId` (fk|null), `name`, `controls` (json), `constraints` (json)

**QAResult**  
- `id` (pk), `projectId` (fk), `snippetId` (fk|null), `kind` ('similarity'|'readability'|'diff'), `result` (json), `createdAt`

**ExportJob**  
- `id` (pk), `projectId` (fk), `format` ('md'|'html'|'docx'|'json'), `status` ('queued'|'running'|'done'|'error'), `url` (text|null), `createdAt`

**Tag**  
- `id` (pk), `name`, `color`

Indexes: `Snippet.projectId+index`, `RephraseProject.userId`, `Preset.name`.

---

### 6) UX / UI

- **Twoâ€‘panel editor**: left input, right output with line numbers and colorâ€‘diff.  
- **Controls drawer** on the right; quick **Presets bar** on top.  
- **Constraint chips** under the input; click to inspect highlights (e.g., locked quotes).  
- **Batch table** view for CSV: each row is a snippet; bulk apply preset; export results CSV.  
- Accessibility: keyboard shortcuts, high contrast theme, screenâ€‘reader labels.

Shortcuts: `Ctrl/Cmd+Enter` rewrite, `Ctrl/Cmd+K` run QA, `Ctrl/Cmd+E` export, `Alt+L` lengthâ€‘down, `Alt+Shift+L` lengthâ€‘up.

---

### 7) Validation Rules

- If **Academicâ€‘safe** preset: require citation mode if paraphrasing sourced text.  
- **Keep keywords** must appear in output; warn if any are dropped.  
- **Numbers/units/links** must match unless user allows changes.  
- Locked quotes/code cannot be altered; if length change breaks markdown structure â†’ error.  
- Max output size 100k chars per job (paginate beyond).

---

### 8) Plans & Limits

| Feature | Free | Pro |
|---|---|---|
| Jobs/day | 50 | 500 |
| Snippet length | â‰¤ 2k chars | â‰¤ 50k chars |
| CSV rows/job | â€” | 1,000 |
| Exports/day | 10 | 100 |
| History | 30 days | Unlimited |

Rate limits: `/snippet/rewrite` 200/day (Free) 2,000/day (Pro); `/qa/similarity` 100/day (Free) 800/day (Pro).

---

### 9) Suggested File Layout

```
src/pages/rephrase/index.astro
src/pages/rephrase/new.astro
src/pages/rephrase/history.astro
src/pages/rephrase/settings.astro

src/pages/rephrase/api/project/create.ts
src/pages/rephrase/api/project/index.ts
src/pages/rephrase/api/project/update.ts
src/pages/rephrase/api/project/archive.ts
src/pages/rephrase/api/snippet/rewrite.ts
src/pages/rephrase/api/batch/upload.ts
src/pages/rephrase/api/batch/status.ts
src/pages/rephrase/api/preset/save.ts
src/pages/rephrase/api/preset/delete.ts
src/pages/rephrase/api/qa/similarity.ts
src/pages/rephrase/api/qa/readability.ts
src/pages/rephrase/api/diff.ts
src/pages/rephrase/api/export.ts
src/pages/rephrase/api/export/status.ts

src/components/rephrase/Editor/*.astro
src/components/rephrase/Controls/*.astro
src/components/rephrase/QA/*.astro
src/components/rephrase/Export/*.astro
src/components/rephrase/Batch/*.astro
```

---

### 10) Future Enhancements (v2+)

- **Guardrails for facts** (automatic claim checks if user supplies sources).  
- **Custom rewrite functions** (regex pipelines, company style macros).  
- **Team review** (suggestions, approvals, change history).  
- **IDE/Docs plugins** and browser extension.  
- **Onâ€‘device quick rewrite** for mobile app (small snippets).

---

### 11) Legal & Ethical Notice (display to users)

- Paraphrasing should **not** be used to evade plagiarism detection or violate academic policies.  
- For sourced content, **add citations**; the tool can help transform sentences into citationâ€‘friendly phrasing.  
- Respect thirdâ€‘party copyrights; do not paste confidential or personal data unless you have permission.

---

**End of Requirements â€” Ready for Codex Implementation.**
# âœ… Grammar Fixer â€” Full Requirements (Ansiversa)

Codexâ€‘ready specification for building the **Grammar Fixer** mini app.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### What it does
**Grammar Fixer** analyzes English (and selected locales) for **grammar, spelling, punctuation, style, and clarity**, then proposes **explanations + oneâ€‘click fixes**. It supports **dialect rules (ENâ€‘US/ENâ€‘UK/ENâ€‘IN, etc.)**, **style guides** (academic, business, legal, casual), **readability targets**, **inclusive language**, **terminology lock**, and **safe autoâ€‘apply**. Outputs can be exported as **Markdown/HTML/DOCX** or sent to **Rephrase**, **Email Polisher**, or **AI Translator & Tone Fixer**.

### Core Features
- **Modes**: Checkâ€‘only, Autoâ€‘fix (safe rules), Explain & Teach, Proofread & Rephrase (handoff).  
- **Rule packs**: grammar, spelling, punctuation, capitalization, hyphenation/compounding, numerals, parallelism, agreement, tense & aspect, dangling modifiers, wordy phrasing, clichÃ©s, passive voice hints, **inclusive language**.  
- **Dialects & registers**: ENâ€‘US, ENâ€‘UK, ENâ€‘AU, ENâ€‘IN with date/currency formats and spelling variants (color/colour, organize/organise).  
- **Style guides**: Academic (APA/MLAâ€‘like), Business, Legal memo, Blog/Marketing, Casual.  
- **Clarity tools**: split long sentences, simplify phrases, remove filler, enforce sentence caps, bulletize lists.  
- **Readability**: live grade estimate + targets; flags for hard sentences.  
- **Terminology**: glossary lock (doâ€‘notâ€‘change), case & spelling constraints for product names.  
- **Diff & explanations**: sideâ€‘byâ€‘side view; each fix has a rule reference and short lesson.  
- **Batch**: run checks on multiple snippets or files; CSV in/out.  
- **Privacy**: optional PII masking for emails, phones, IDs before sending to model.

### Key Pages
- `/grammar` â€” Workspace (Editor, Issues, Rules, Export)  
- `/grammar/new` â€” Quick wizard (dialect, style, targets)  
- `/grammar/history` â€” Jobs list  
- `/grammar/settings` â€” Defaults (style, dialect, safeâ€‘rules, glossary)

### Minimal Data Model
`GrammarProject`, `Snippet`, `Suggestion`, `Fix`, `RulePack`, `StyleGuide`, `Glossary`, `QAResult`, `ExportJob`, `Tag`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Projects | 10 | Unlimited |
| Max input/job | 2,500 chars | 100,000 chars |
| Batch CSV | â€” | âœ… |
| Dialects | ENâ€‘US | + ENâ€‘UK/ENâ€‘IN/ENâ€‘AU |
| Style guides | Basic | Full + custom |
| Autoâ€‘apply | Safe only | Safe + extended |
| Exports | MD/HTML | + DOCX/JSON |
| History retention | 30 days | Unlimited |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives & Nonâ€‘Goals
**Objectives**
- Provide **accurate, explainable** grammar and style fixes with **minimal friction**.  
- Respect user intent by locking **terminology and code/quotes**.  
- Keep output **portable** and suitable for professional use.

**Nonâ€‘Goals (v1)**
- Not a plagiarism detector or citation manager.  
- No realâ€‘time multiâ€‘cursor collaboration (comments only).

---

### 2) Information Architecture & Routes

**Pages**
- `/grammar` â€” Editor with panes: **Input/Output**, **Issues**, **Rules/Style**, **Export**.  
- `/grammar/new` â€” Wizard: dialect, style, readability target, safeâ€‘apply toggle, glossary upload.  
- `/grammar/history` â€” Search & filters (style, dialect, date).  
- `/grammar/settings` â€” Default style/dialect, safe rules, inclusive language options, PII masking.

**API (SSR)**
- Projects/jobs: `POST /grammar/api/project/create` Â· `GET /grammar/api/project?id=` Â· `POST /grammar/api/project/update` Â· `POST /grammar/api/project/archive`  
- Analyze: `POST /grammar/api/snippet/analyze` (text + dialect + style + targets)  
- Apply fixes: `POST /grammar/api/snippet/apply` (suggestionIds[] | mode:'safe'|'extended')  
- Batch: `POST /grammar/api/batch/upload` (csv|docx|md|txt) Â· `GET /grammar/api/batch/status?id=`  
- Glossary & style: `POST /grammar/api/glossary/upload` Â· `POST /grammar/api/styleguide/set`  
- QA & metrics: `POST /grammar/api/qa/readability` Â· `POST /grammar/api/qa/diff`  
- Export: `POST /grammar/api/export` (md|html|docx|json) Â· `GET /grammar/api/export/status?id=`  
- Settings: `POST /grammar/api/settings/save`  
- Safety: `POST /grammar/api/pii/scan` Â· `POST /grammar/api/pii/redact`

Optional WebSocket `/grammar/ws` for streaming issue discovery and live diffs.

---

### 3) Issue Types & Rules

**Grammar**: subjectâ€‘verb agreement, pronoun case/ambiguity, tense sequence, parallelism, modifiers (misplaced/dangling), fragments/runâ€‘ons, preposition choice, article use.  
**Punctuation**: commas (serial/Oxford optional), semicolons/colons, em/en dashes, quotation punctuation locale, ellipses, parentheses.  
**Spelling & variants**: USâ†”UK, common typos, homophones hints (their/there/theyâ€™re).  
**Capitalization**: titles (AP vs sentence case), proper nouns, acronyms, headline rules.  
**Hyphenation/compounds**: twoâ€‘word modifiers, numberâ€‘unit compounds.  
**Formatting**: list consistency, spacing (no double spaces), smart quotes toggle.  
**Style & clarity**: passive voice warning with **polite rewrite**, verbosity, clichÃ©s, nominalizations, weasel words.  
**Inclusive language**: genderâ€‘neutral suggestions, respectful alternatives; regional sensitivity flags.  
**Numbers & units**: spellâ€‘out rules for 0â€“9 vs 10+, unit spacing, currency formatting per locale.  
**Terminology**: enforce case/spelling for brand/product names; doâ€‘notâ€‘change list.

Each suggestion contains: `ruleId`, description, before/after preview, severity (`info|warn|error`), autoâ€‘fixable (bool), explanation text, and **toggle â€œteach meâ€** short lesson.

---

### 4) Controls & Targets

- **Dialect** (ENâ€‘US/ENâ€‘UK/ENâ€‘IN/ENâ€‘AU).  
- **Style guide** (Academic, Business, Legal, Marketing, Casual) + **custom overrides** (Oxford comma on/off, headline style, serial comma, % formatting).  
- **Readability** target (Grade 5â€“16) with soft/hard enforcement.  
- **Autoâ€‘apply**: `safe` (typos, punctuation, spacing) or `extended` (includes style/clarity).  
- **Lock**: quotes, code/backticks, terminology (from glossary).  
- **Clarity tools**: sentence splitter/merger, simplify verbosity, bulletize long lists.  
- **Length**: optional max length per paragraph (e.g., 140 chars for social).

---

### 5) Data Model (Astro DB / SQL)

**GrammarProject**  
- `id` (uuid pk), `userId`, `title`, `dialect` (text), `styleGuideId` (fk|null), `targets` (json:{grade,maxLen}), `mode` ('check'|'auto'|'explain'), `status` ('draft'|'done'), `createdAt`, `updatedAt`

**Snippet**  
- `id` (pk), `projectId` (fk), `index` (int), `input` (longtext), `output` (longtext|null), `metrics` (json:{grade,words,sentences,readTime}), `flags` (json)

**Suggestion**  
- `id` (pk), `projectId` (fk), `snippetId` (fk), `ruleId` (text), `category` (text), `severity` (text), `start` (int), `end` (int), `before` (text), `after` (text), `explanation` (longtext), `autoFix` (bool), `accepted` (bool|null)

**Fix**  
- `id` (pk), `snippetId` (fk), `suggestionIds` (json), `mode` ('safe'|'extended'), `diff` (json), `appliedAt` (datetime)

**RulePack**  
- `id` (pk), `name` (text), `options` (json)

**StyleGuide**  
- `id` (pk), `projectId` (fk|null), `name`, `dialect`, `rules` (json)

**Glossary**  
- `id` (pk), `projectId` (fk), `term` (text), `locked` (bool), `case` ('keep'|'upper'|'title'), `note` (text)

**QAResult**  
- `id` (pk), `projectId` (fk), `snippetId` (fk|null), `kind` ('readability'|'diff'), `result` (json), `createdAt`

**ExportJob**  
- `id` (pk), `projectId` (fk), `format` ('md'|'html'|'docx'|'json'), `status` ('queued'|'running'|'done'|'error'), `url` (text|null), `createdAt`

**Tag**  
- `id` (pk), `name`, `color`

Indexes: `Snippet.projectId+index`, `Suggestion.snippetId`, `GrammarProject.userId`.

---

### 6) UX / UI

- **Threeâ€‘pane**: left (snippets/files), center (editor with inline underlines), right (Issues list with filters + Fix/Explain tabs).  
- **Inline cards**: click underline â†’ quick explanation + `Accept`, `Ignore`, `Why?`, `Rule options`.  
- **Diff viewer**: before/after with color highlights and counts by category.  
- **Batch table**: filename, words, issues found, fixes applied.  
- **Teaching mode**: collapsible â€œmicroâ€‘lessonsâ€ with 1â€‘sentence rule + 2 examples.  
- Accessibility: keyboard navigation, screenâ€‘reader labels, high contrast, RTLâ€‘aware editor (for mixed content).

Shortcuts: `Ctrl/Cmd+Enter` apply safe fixes, `Alt+Enter` apply extended, `Ctrl/Cmd+K` recompute issues, `Ctrl/Cmd+E` export, `]` next issue, `[` previous issue.

---

### 7) Validation Rules

- Do **not** modify locked glossary terms, code spans, or quoted text.  
- Keep numbers/units/links unchanged unless user allows.  
- Respect chosen dialect (e.g., serial comma off if style disables).  
- Warn if grade target unattainable without changing locked passages.  
- Ensure markdown/HTML remains valid (balanced tags) after fixes.  
- Max output 100k chars per job; paginate beyond.

---

### 8) Plans & Limits

| Feature | Free | Pro |
|---|---|---|
| Jobs/day | 50 | 500 |
| Input/job | â‰¤ 2.5k chars | â‰¤ 100k chars |
| CSV rows/job | â€” | 2,000 |
| Exports/day | 10 | 100 |
| History | 30 days | Unlimited |

Rate limits: `/snippet/analyze` 300/day (Free) 3,000/day (Pro); `/snippet/apply` 300/day (Free) 3,000/day (Pro).

---

### 9) Suggested File Layout

```
src/pages/grammar/index.astro
src/pages/grammar/new.astro
src/pages/grammar/history.astro
src/pages/grammar/settings.astro

src/pages/grammar/api/project/create.ts
src/pages/grammar/api/project/index.ts
src/pages/grammar/api/project/update.ts
src/pages/grammar/api/project/archive.ts
src/pages/grammar/api/snippet/analyze.ts
src/pages/grammar/api/snippet/apply.ts
src/pages/grammar/api/batch/upload.ts
src/pages/grammar/api/batch/status.ts
src/pages/grammar/api/glossary/upload.ts
src/pages/grammar/api/styleguide/set.ts
src/pages/grammar/api/qa/readability.ts
src/pages/grammar/api/qa/diff.ts
src/pages/grammar/api/export.ts
src/pages/grammar/api/export/status.ts

src/components/grammar/Editor/*.astro
src/components/grammar/Issues/*.astro
src/components/grammar/Explain/*.astro
src/components/grammar/Export/*.astro
src/components/grammar/Batch/*.astro
```

---

### 10) Future Enhancements (v2+)

- **Multilingual** grammar packs (ES/AR/HI/TA) sharing the same UI.  
- **Team review** with comments/approvals and style enforcement across teams.  
- **Company style macros** (convert passive to active, headline case rules, boilerplate checks).  
- **IDE/Docs plugins** and a browser extension.  
- **Explainâ€‘why in Tamil** or other chosen language.

---

### 11) Legal & Ethical Notice

- The tool suggests highâ€‘quality edits but **final responsibility** lies with the author.  
- Avoid applying changes that **alter meaning** unless intended.  
- Do not paste confidential data without permission; enable PII masking when needed.

---

**End of Requirements â€” Ready for Codex Implementation.**
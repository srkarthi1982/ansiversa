# ðŸ§® Formula Finder â€” Full Requirements (Ansiversa)

This document includes a concise **summary** for Codex onboarding and a **full technical specification** for implementation.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### Overview
**Formula Finder** is a searchable, structured library of **Math, Physics, Chemistry** (and later Engineering, Finance) formulas with:
- topic and variable filters,
- **symbol explanations and units**,
- **rearrangement/solve-for-any-variable**,
- **dimensional analysis and unit conversion**, and
- worked **examples** + export to Markdown/LaTeX/PDF.

### Core Features
- Fast search by **topic, symbol, or text** (e.g., â€œdistanceâ€, â€œvâ€, â€œkinematicsâ€).  
- Formula cards with **LaTeX** rendering, **units**, **dimensions**, and **assumptions**.  
- **Solve for X** UI: isolate any variable; plug numbers to compute; show steps.  
- **Unit-aware calculator** with SI/imperial conversions.  
- **Dimensional analysis** validator (checks L, M, T, I, Î˜, N, J).  
- **Examples**: minimal worked examples + graphs (where relevant).  
- Collections: â€œCBSE Class 10 Physicsâ€, â€œIITâ€‘JEE Mechanics basicsâ€, etc.  
- Exports: MD/LaTeX/PDF; **FlashNote** cards for revision.

### Key Pages
- `/formula-finder` â€” Search and browse (topics, filters, recent).  
- `/formula-finder/[id]` â€” Formula detail (variables, steps, examples).  
- `/formula-finder/collections` â€” Boards/exams packs.  
- `/formula-finder/tools/solver` â€” Unit-aware solver.  
- `/formula-finder/history` â€” Recently viewed and custom saves.

### Minimal Data Model
`Topic`, `Formula`, `Variable`, `Unit`, `Dimension`, `Identity`, `Derivation`, `Example`, `Collection`, `Tag`

### Plan Gating
| Feature | Free | Pro |
|--------|------|-----|
| Library access | Core sets | Full library + collections |
| Solver | Basic numeric | Step-by-step + unit/DA checks |
| Exports | MD | MD/PDF/LaTeX |
| Custom saves | â€” | Save favorites and notes |
| Integrations | â€” | FlashNote, Homework Helper, Exam Simulator |

Integrations: **Homework Helper**, **Concept Explainer**, **Exam Simulator**, **FlashNote**.

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives and Nonâ€‘Goals
**Objectives**
- Provide reliable, unitâ€‘aware formula lookup with rearrangement and examples.
- Support education boards (CBSE 9â€‘12) + general college topics.
- Clean LaTeX output and copy buttons for symbols, LaTeX, and Markdown.

**Nonâ€‘Goals (v1)**
- No CAS symbolic integration beyond linear/monomial rearrangements and predefined derivation scripts.  
- No userâ€‘generated public content (admins seed/curate; users can save private notes in Pro).

---

### 2) Information Architecture and Routes

**Pages**
- `/formula-finder` â€” Explore/search, filters: Subject (Math/Physics/Chem), Topic, Board, Class, Difficulty.  
- `/formula-finder/[id]` â€” Detail: card, symbols, units, rearrangements, examples, assumptions, tags, related.  
- `/formula-finder/collections` â€” Packs by exam/board.  
- `/formula-finder/tools/solver` â€” Numeric/unit solver with step display.  
- `/formula-finder/history` â€” Viewed, favorites, downloads.

**API (SSR)**
- `GET  /formula-finder/api/search?q=&topic=&subject=&board=&class=`  
- `GET  /formula-finder/api/formula?id=`  
- `POST /formula-finder/api/solve` (solve for variable with units)  
- `POST /formula-finder/api/rearrange` (algebraic isolate variable)  
- `POST /formula-finder/api/convert` (unit conversion)  
- `GET  /formula-finder/api/collections`  
- `POST /formula-finder/api/export` (md|pdf|tex)  
- `POST /formula-finder/api/favorite` (Pro)  
- `GET  /formula-finder/api/history`

Web workers (optional) for unit math and rearrangement to keep UI snappy.

---

### 3) Data Model (Astro DB / SQL)

**Topic**  
- `id` (pk), `subject` ('math'|'physics'|'chem'), `name`, `board` ('cbse'|'intl'|null), `class` ('9'|'10'|'11'|'12'|null), `tags` (json)

**Formula**  
- `id` (uuid pk), `topicId` (fk), `code` (short key, e.g., `physics.kinematics.distance`),  
  `latex` (string), `plainText` (string), `description` (text), `assumptions` (json),  
  `dim` (json: base dims map), `validityNotes` (text|null), `difficulty` ('easy'|'med'|'hard'), `sources` (json), `createdAt`

**Variable**  
- `id` (pk), `formulaId` (fk), `symbol` (string), `name` (string), `unit` (string|null), `dimension` (json), `isKnown` (bool default true)

**Identity** (alternate forms / equivalent identities)  
- `id` (pk), `formulaId` (fk), `latex` (string), `notes` (text|null)

**Derivation**  
- `id` (pk), `formulaId` (fk), `stepsMd` (text), `references` (json)

**Example**  
- `id` (pk), `formulaId` (fk), `problemMd` (text), `solutionMd` (text), `inputs` (json), `answer` (json), `graphSpec` (json|null)

**Unit** (lookup table for conversions)  
- `id` (pk), `code` ('m','s','kg','A','K','mol','cd','N','J','Pa','W','Hz','Â°C','km','mi','ft',...),  
  `factorToSI` (decimal), `offsetToSI` (decimal default 0), `dimension` (json)

**Collection**  
- `id` (pk), `name`, `board`, `class`, `tags` (json), `formulaIds` (json array)

**Tag**  
- `id` (pk), `name`, `color`

**Favorite** (Pro)  
- `id` (pk), `userId` (fk), `formulaId` (fk), `note` (text|null), `createdAt`

**History**  
- `id` (pk), `userId` (fk), `formulaId` (fk), `openedAt`

---

### 4) Search and Ranking

- Tokenize on symbols (`v`, `Î”x`), aliases (â€œspeedâ€, â€œvelocityâ€), and topic tags.  
- Rank by: exact symbol hit > topic match > text match; boost by board/class chosen.  
- Fallback â€œDid you meanâ€ using alias map.

---

### 5) Solver and Rearrangement

**`/formula-finder/api/rearrange`**
- Input: LaTeX string or internal AST + target symbol.  
- Allowed algebra: add/subtract both sides, multiply/divide, power/root, log/exp where predefined.  
- Output: LaTeX of isolated variable + step list `stepsMd`.

**`/formula-finder/api/solve`**
- Input: `formulaId`, `target`, `values` (with units).  
- Pipeline: validate units â†’ convert to SI â†’ compute â†’ convert to requested output unit.  
- Output: numeric value + steps (substitution table, unit cancellation).  
- Dimensional check: ensure left/right dimensions consistent; flag if mismatch.

---

### 6) Unit and Dimension System

- Base dimensions: **L, M, T, I, Î˜, N, J**.  
- Unit table maintains factor/offset; temperature conversions handle affine offsets.  
- Composite dimensions derived from variable dimensions; validator ensures formula dimensional homogeneity.

---

### 7) UI / UX

- **Formula Card**: LaTeX display, copy buttons (LaTeX/Markdown), assumptions, tags.  
- **Variables Table**: symbol, meaning, unit, dimension, typical range.  
- **Solve for X**: dropdown for target variable, autoâ€‘rearrange, numeric inputs with unit pickers, live result.  
- **Examples**: collapsible worked example; optional simple graph (e.g., `s = ut + 1/2 at^2` vs t).  
- **Collections**: board/exam packs; â€œAdd all to FlashNoteâ€.  
- **History and Favorites**: quick access.  
- Accessibility: KaTeX with screenâ€‘reader alt text, keyboard nav, high contrast.

---

### 8) API Contracts (Examples)

**Search**  
`GET /formula-finder/api/search?q=velocity&subject=physics&board=cbse&class=11`  
Res: `{ "items":[{"id":"kin_v1","latex":"v=\frac{\Delta x}{\Delta t}","topic":"Kinematics"}] }`

**Read Formula**  
`GET /formula-finder/api/formula?id=kin_v1`  
Res: `{ "id":"kin_v1","latex":"v=\frac{\Delta x}{\Delta t}","variables":[{"symbol":"v","unit":"m/s"}], "dim":{"L":1,"T":-1} }`

**Rearrange**  
`POST /formula-finder/api/rearrange`  
```json
{ "latex":"s = ut + \tfrac{1}{2} a t^2", "target":"a" }
```  
Res: `{ "latex":"a = \frac{2(s - ut)}{t^2}", "stepsMd":"1) Subtract ut ... 2) Multiply by 2 ... 3) Divide by t^2 ..." }`

**Solve**  
`POST /formula-finder/api/solve`  
```json
{
  "formulaId":"kin_suvat_2",
  "target":"s",
  "values":{"u":{"value":5,"unit":"m/s"},"a":{"value":2,"unit":"m/s^2"},"t":{"value":3,"unit":"s"}}
}
```  
Res: `{ "value":24, "unit":"m", "stepsMd":"Substitute: s = 5*3 + 0.5*2*3^2 ..." }`

**Export**  
`POST /formula-finder/api/export`  
```json
{ "formulaId":"kin_v1", "format":"tex" }
```  
Res: `{ "url":"/exports/formula-finder_kin_v1.tex" }`

---

### 9) Validation Rules

- LaTeX length â‰¤ 2k chars; variables 1â€“20 per formula.  
- Every variable must have **name** and **dimension**; **unit** optional.  
- Dimensional consistency check passes before save/publish.  
- Example inputs require units when formula is dimensional.  
- Collections reference only **published** formulas.

---

### 10) Plans and Limits

| Feature | Free | Pro |
|--------|------|-----|
| Library size | Core | Full + board packs |
| Solver | Numeric only | Stepâ€‘byâ€‘step + DA |
| Exports | MD | MD/PDF/LaTeX |
| Favorites/Notes | â€” | Enabled |
| API rate | 60 req/day | 1,000 req/day |

Rate limits: `/search` 30/min, `/solve` 10/min/user, `/rearrange` 5/min/user.

---

### 11) Suggested File Layout

```
src/pages/formula-finder/index.astro
src/pages/formula-finder/[id].astro
src/pages/formula-finder/collections.astro
src/pages/formula-finder/tools/solver.astro
src/pages/formula-finder/history.astro

src/pages/formula-finder/api/search.ts
src/pages/formula-finder/api/formula.ts
src/pages/formula-finder/api/solve.ts
src/pages/formula-finder/api/rearrange.ts
src/pages/formula-finder/api/convert.ts
src/pages/formula-finder/api/collections.ts
src/pages/formula-finder/api/export.ts
src/pages/formula-finder/api/favorite.ts
src/pages/formula-finder/api/history.ts

src/components/formula-finder/Card/*.astro
src/components/formula-finder/Solver/*.astro
src/components/formula-finder/VariablesTable.astro
src/components/formula-finder/Examples/*.astro
```

---

### 12) Seed List (Initial Coverage)

**Physics**: Kinematics (SUVAT), Dynamics (F=ma), Workâ€‘Energy (W=Fd, KE, PE), Power, Momentum/Impulse, Circular motion, Gravitation, Electricity (Ohmâ€™s law, series/parallel), Magnetism (F=qvB), Waves (v=fÎ»), Optics (lens/mirror).  
**Math**: Algebra (quadratic formula), Geometry (area/perimeter/volume), Trig identities, Coordinate geometry (distance/midpoint/slope), Calculus basics (derivative rules), Probability (nCr, nPr), Statistics (mean/variance).  
**Chem**: Moles and stoichiometry, Gas laws (PV=nRT), Concentration (M, m), pH, Equilibrium (Kc), Rate law (intro).

---

### 13) Future Enhancements (v2+)

- Symbolic CAS for broader rearrangements and derivations.  
- Graphing of parametric relationships (s vs t, v vs t).  
- Stepâ€‘byâ€‘step derivations from first principles.  
- Teacher mode: assemble custom collections and share readâ€‘only.  
- Perâ€‘user custom formulas repository (private/public).  
- Chrome extension: highlight â†’ â€œFind formulaâ€.

---

**End of Requirements â€” Ready for Codex Implementation.**
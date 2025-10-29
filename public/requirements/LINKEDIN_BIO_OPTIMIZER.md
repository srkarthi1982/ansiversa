# ðŸ’¼ LinkedIn Bio Optimizer â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/linkedin-bio`  
**Category:** Career & Professional  
**Stack:** Astro + Tailwind (islands for editors/forms), Astro SSR API routes, Astro DB / Supabase  
**Goal:** Generate and refine **LinkedIn headlines, About/Bio, and Featured sections** that are keywordâ€‘rich, authentic, and aligned to target roles/industries. Produce multiple tone/length variants, quantify impact, and ensure policyâ€‘safe output.

> Positioning: A precision tool to turn experience into a crisp, searchable, humanâ€‘sounding LinkedIn presenceâ€”integrated with Resume Builder, Cover Letter Writer, Portfolio Creator, and Email Polisher.

---

## 1) Objectives & Nonâ€‘Goals

### Objectives
- **Import** user data from: Resume Builder (JSON), pasted text, or manual form.  
- Create **3 artifact types**:
  1) **Headline** (â‰¤ 220 chars) â€” keywordâ€‘optimized, roleâ€‘targeted.  
  2) **About / Bio** (â‰¤ 2,600 chars) â€” narrative with proof points & metrics.  
  3) **Featured** suggestions â€” top links/media to showcase (portfolio, posts, talks).
- **Variants & tone** controls: professional, friendly, confident, humble, storyteller, dataâ€‘driven.  
- **Targeting:** role(s), seniority, industries, location, visa/remote, and top 10 keywords/skills.  
- **Frameworks:** **STAR/CAR** microâ€‘bullets, value proposition, elevator pitch.  
- **Compliance:** no exaggeration/claims without evidence; optional **â€œevidence mapâ€** showing which data point supports which line.
- **Scoring:** keyword coverage %, reading level, buzzword density, length checks, inclusive language linting.
- **Localization:** language (EN/Tamil/Arabic + others), emoji toggle, first/third person selection.
- **Export:** copy blocks, MD/PDF; push to Resume Builder & Cover Letter Writer.

### Nonâ€‘Goals (v1)
- No automated LinkedIn API publishing (manual copy/paste).  
- No scraping public LinkedIn pages.  
- No live SEO rank tracking beyond keyword coverage heuristics.

---

## 2) User Stories (Acceptance Criteria)

1. **Generate from Resume**
   - *As a user*, I import my resume JSON.  
   - **AC:** `/linkedin-bio/api/generate` outputs 3 headline options, 2 bio variants (short/long), and Featured suggestions with source evidence map.

2. **Target Role Optimization**
   - *As a user*, I select â€œFrontend Engineer Â· Astro/React Â· Dubai/UAEâ€.  
   - **AC:** variants prioritize relevant keywords (Astro, React, SSR, Tailwind, Vercel), show domain proof, and respect character limits.

3. **Tone & Persona**
   - *As a user*, I switch tone to **confident + dataâ€‘driven** and persona to **firstâ€‘person**.  
   - **AC:** text updates while keeping facts from evidence map; buzzword linting stays green.

4. **Metrics & STAR**
   - *As a user*, I click **Add metrics**.  
   - **AC:** bullets convert achievements into STAR/CAR lines with numbers (e.g., â€œCut TTFB 38% byâ€¦â€) using resume evidence.

5. **Score & Lint**
   - *As a user*, I see **Coverage 86%**, **Readability B2**, **Length OK**, **Biasâ€‘free OK**.  
   - **AC:** `/linkedin-bio/api/score` returns structured scores and suggestions.

6. **Export & Save**
   - *As a user*, I save the winning variant and export MD/PDF.  
   - **AC:** `/linkedin-bio/api/save` persists artifacts; `/linkedin-bio/api/export` returns a file URL.

7. **Plan Gating**
   - Free: 3 generations/day, 1 saved profile, limited export.  
   - Pro: unlimited generations, multiple profiles, full exports, advanced linting.

---

## 3) Artifacts & Content Schema

**InputData**  
```json
{
  "user": {"name":"Karthik","headline":"â€”","location":"Dubai, UAE"},
  "targets": {"roles":["Frontend Engineer"],"industries":["EdTech"],"location":"Dubai","seniority":"mid","keywords":["Astro","React","Tailwind","Vercel","SSR"]},
  "resume": {"summary":"...","experience":[{"title":"...","impact":["Increased CTR 22%","Reduced TTFB 38%"]}],"skills":["JS","TS","Astro","React","SQL"]},
  "preferences": {"tone":["confident","data-driven"],"person":"first","emoji":false,"language":"en"}
}
```

**Artifact**  
```json
{
  "id":"bio-123",
  "type":"headline|about|featured",
  "language":"en",
  "text":"â€¦",
  "chars": 198,
  "keywordsCovered":["Astro","React","Vercel"],
  "evidenceRefs":[{"source":"resume.experience[0].impact[1]","verbatim":"Reduced TTFB 38%"}],
  "scores":{"coverage":0.86,"readability":"B2","buzzword":"OK","bias":"OK"}
}
```

**EvidenceMap**  
```json
{"claim":"Reduced TTFB 38%","evidence":"resume.experience[0].impact[1]"}
```

---

## 4) Routes & Information Architecture

- `/linkedin-bio` â€” Hub: Import resume, set targets, generate variants, compare.  
- `/linkedin-bio/editor/[profileId]` â€” Editor: sideâ€‘byâ€‘side variants, tone sliders, keyword checklist, scores.  
- `/linkedin-bio/history` â€” Saved profiles/versions.  
- `/linkedin-bio/settings` â€” Localization, persona, emoji policy, export defaults.

**API (SSR):**  
- `POST /linkedin-bio/api/generate`  
- `POST /linkedin-bio/api/score`  
- `POST /linkedin-bio/api/save` Â· `GET /linkedin-bio/api/profile` Â· `GET /linkedin-bio/api/history`  
- `POST /linkedin-bio/api/export` (md|pdf)  
- `POST /linkedin-bio/api/keywords/suggest` (from targets)  
- `POST /linkedin-bio/api/variants/tone` (regenerate with tone/persona)  
- `POST /linkedin-bio/api/featured/suggest`

---

## 5) Data Model (Astro DB / SQL)

**User**  
- `id` (pk), `email`, `plan`, `timezone`, `language`, `createdAt`

**Profile**  
- `id` (pk uuid), `userId` (fk), `targets` (json), `preferences` (json), `resumeRef` (json), `createdAt`, `updatedAt`

**Artifact**  
- `id` (pk uuid), `profileId` (fk), `type` ('headline'|'about'|'featured'), `language`, `text`, `chars` (int), `keywordsCovered` (json), `scores` (json), `evidenceRefs` (json), `createdAt`

**KeywordBank**  
- `id` (pk uuid), `profileId` (fk), `items` (array of strings), `source` ('user'|'suggested'|'import'), `createdAt`

**History**  
- `id` (pk), `profileId` (fk), `artifactId` (fk), `action` ('create'|'update'|'export'), `ts`

---

## 6) Scoring & Linting

- **Coverage:** ratio of target keywords present (stemmed + synonyms).  
- **Readability:** CEFR estimate (A2â€“C2) using heuristics (sentence length, vocab).  
- **Length:** enforce â‰¤ 220 chars for headline; â‰¤ 2,600 for About.  
- **Buzzword density:** flag clichÃ©s (e.g., â€œresultsâ€‘orientedâ€, â€œrockstarâ€) and offer rewrites.  
- **Biasâ€‘free language:** inclusive, avoids gendered phrases.  
- **Authenticity:** every numeric claim should map to an evidenceRef; unverified claims flagged.

---

## 7) UI / Editor (Key Interactions)

- **Variant Compare**: 2â€“3 columns; select winner; copy buttons.  
- **Tone sliders**: Professional â†” Friendly, Concise â†” Story, Confident â†” Humble.  
- **Keyword checklist** with autoâ€‘suggest.  
- **Evidence sideâ€‘panel**: click a claim â†’ show resume snippet.  
- **Live counters**: char count, keyword coverage, reading level.  
- **Localization controls**: language dropdown, emoji toggle, first/third person.  
- **Export**: MD/PDF; â€œSend to Resume/CL/Portfolioâ€ actions.

---

## 8) API Contracts (examples)

### `POST /linkedin-bio/api/generate`
Req:  
```json
{
  "targets":{"roles":["Frontend Engineer"],"industries":["EdTech"],"location":"Dubai","keywords":["Astro","React","Vercel","SSR","Tailwind"]},
  "resumeRef":{"experience":[{"title":"Fullâ€‘stack Dev","impact":["Cut TTFB 38%","Shipped SSR Astro on Vercel"]}]},
  "preferences":{"tone":["confident","data-driven"],"person":"first","emoji":false,"language":"en"}
}
```
Res:  
```json
{
  "profileId":"<uuid>",
  "artifacts":[
    {"type":"headline","text":"Frontend Engineer â€¢ Astro/React â€¢ Cut TTFB 38% | SSR @ Vercel | Building fast, clean UIs", "chars":130},
    {"type":"about","text":"I build fast, resilient web apps...","chars":1240}
  ]
}
```

### `POST /linkedin-bio/api/score`
Req: `{ "text":"Frontend Engineer â€¢ Astro/React ...", "targets":{"keywords":["Astro","React","SSR","Vercel","Tailwind"]} }`  
Res: `{ "scores":{"coverage":0.86,"readability":"B2","buzzword":"OK","length":"OK"} }`

### `POST /linkedin-bio/api/featured/suggest`
Req: `{ "resumeRef":{"projects":[{"name":"Quiz Institute","url":"https://quiz.institute"}]} }`  
Res: `{ "featured":[{"title":"Quiz Institute â€” AI Quiz Platform","url":"https://quiz.institute","type":"link"}] }`

### `POST /linkedin-bio/api/export`
Req: `{ "profileId":"<uuid>", "format":"md" }`  
Res: `{ "url":"/exports/LinkedIn_Bio_Karthik.md" }`

---

## 9) Validation Rules

- Headline â‰¤ 220 chars (postâ€‘normalization); About â‰¤ 2,600 chars.  
- No unverifiable claims unless marked as **aspirational** (toggle adds â€œaiming toâ€ phrasing).  
- Avoid prohibited content (PII leaks, confidential data).  
- Language ISO code; persona in {first, third}.  
- Keyword list â‰¤ 50 unique tokens; dedupe by stemming.

---

## 10) Plans & Limits

| Feature | Free | Pro |
|--------|------|-----|
| Generations/day | 3 | Unlimited |
| Saved profiles | 1 | Unlimited |
| Variants | 2 per type | 5 per type |
| Exports | MD only | MD/PDF |
| Linting | Basic | Advanced (bias, buzzword, authenticity) |
| Localization | EN only | EN + multiâ€‘language |
| Integrations | â€” | Resume/CL/Portfolio push |

Rate limits: per `userId`/day for generate/score; per `profileId`/hour for exports.

---

## 11) Accessibility & UX

- Screenâ€‘reader labels; highâ€‘contrast & largeâ€‘text modes.  
- Keyboard shortcuts (cycle variants, copy).  
- RTL support; localized punctuation rules; emoji toggle for readability.

---

## 12) Suggested File Layout

```
src/pages/linkedin-bio/index.astro
src/pages/linkedin-bio/editor/[profileId].astro
src/pages/linkedin-bio/history.astro
src/pages/linkedin-bio/settings.astro

src/pages/linkedin-bio/api/generate.ts
src/pages/linkedin-bio/api/score.ts
src/pages/linkedin-bio/api/save.ts
src/pages/linkedin-bio/api/profile.ts
src/pages/linkedin-bio/api/history.ts
src/pages/linkedin-bio/api/export.ts
src/pages/linkedin-bio/api/keywords/suggest.ts
src/pages/linkedin-bio/api/variants/tone.ts
src/pages/linkedin-bio/api/featured/suggest.ts

src/components/linkedin-bio/Editor/*.astro
src/components/linkedin-bio/Compare/*.astro
src/components/linkedin-bio/Scoring/*.astro
```

---

## 13) Future Enhancements (v2+)

- **Role libraries** (preset keyword banks for common roles/industries).  
- **ATS/SEO simulators** (searchability estimation for recruiter queries).  
- **A/B test assistant** to rotate headlines and gather soft feedback.  
- **â€œTurn posts into Featuredâ€** helper that extracts best lines & thumbnails.  
- **Multilingual parity** with translation memory between languages.

---

**End of Requirements â€” ready for Codex implementation.**
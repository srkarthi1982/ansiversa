# ðŸ“£ Client Feedback Analyzer â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/feedback`  
**Category:** Career and Professional (CX/PM)  
**Stack:** Astro + Tailwind (islands where needed), Astro SSR API routes, Astro DB / Supabase, optional Workers for NLP jobs  
**Goal:** Ingest feedback (forms, CSV, pasted text), analyze with **sentiment + topics + aspects**, surface **themes, urgency, churn risk**, and turn insights into **tickets, tasks, and reports**. Integrates with **Email Polisher** (reply drafts), **Presentation Designer** (auto-slides), and **Proposal Writer** (improvement plan).

> Positioning: A practical, privacyâ€‘first tool to convert noisy feedback into prioritized action items with measurable impact.

---

## 1) Objectives and Nonâ€‘Goals

### Objectives
- **Ingest** feedback from: CSV upload, paste, simple form, manual entry.  
- **Normalize** and deduplicate items; detect language automatically.  
- **Analyze**: overall sentiment, **aspectâ€‘based sentiment** (pricing, support, UX, content, performance, reliability, features), **topic clustering**, **keyword/keyphrase** extraction, **urgency** and **impact** scores, **NPS/CSAT** parsing.  
- **Group**: themes, trends over time, cohorts (plan, geography, version).  
- **Act**: generate **action items**, **JIRA-style tickets**, reply **email drafts**, **release notes** snippets.  
- **Report**: dashboards, downloadable **PDF/MD** summaries, and export to CSV/JSON.  
- **Privacy**: PII masking (emails/phones order IDs), orgâ€‘scoped data.

### Nonâ€‘Goals (v1)
- No live SaaS connectors (Gmail/Zendesk/Intercom) in v1; provide imports and placeholders.  
- No realâ€‘time streaming analytics; jobs run on demand.  
- No autoâ€‘messageâ€‘sending; all replies are drafts for review.

---

## 2) User Stories (Acceptance Criteria)

1. **Upload and Analyze**
   - *As a PM*, I upload a CSV of feedback and click **Analyze**.  
   - **AC:** `/feedback/api/analyze` queues a job; `/feedback/api/job/[id]/status` reaches `done`; results include sentiment, topics, aspects, and themes with counts and example quotes.

2. **Quick Paste**
   - *As a support lead*, I paste 10 raw comments.  
   - **AC:** normalized entries appear; I can run analysis and see top 3 themes and urgent items.

3. **Aspect Insights**
   - *As a designer*, I filter **UX** and see subâ€‘aspects (**navigation, visual clarity, accessibility**) with sentiment and example quotes.  
   - **AC:** `/feedback/api/aspects` returns breakdown and representative snippets.

4. **Action Items**
   - *As an engineering manager*, I click **Generate Actions**.  
   - **AC:** `/feedback/api/actions` returns prioritized tasks with **impact Ã— effort** scores and links to grouped feedback.

5. **Reply Drafts**
   - *As a CSM*, I select a comment and click **Draft Reply**.  
   - **AC:** `/feedback/api/reply` returns a respectful email draft with placeholders and tone controls.

6. **Report**
   - *As an exec*, I click **Create Report** (This week / Custom range).  
   - **AC:** `/feedback/api/report` returns a PDF/MD summary with charts, KPIs, and appendix quotes.

7. **Plan Gating**
   - Free: up to 300 feedback rows per project, basic analysis, one report/month.  
   - Pro: 50k rows/project, advanced aspects, reply drafts, multiâ€‘language, unlimited reports.

---

## 3) Routes and Information Architecture

- `/feedback` â€” Hub: Upload/Paste, recent projects, quick stats.  
- `/feedback/project/[id]` â€” Project dashboard (KPIs, charts, top themes, open actions).  
- `/feedback/project/[id]/ingest` â€” Upload CSV, paste, form builder.  
- `/feedback/project/[id]/explore` â€” Analyzer (filters: time, sentiment, language, cohort, source, topic, aspect).  
- `/feedback/project/[id]/actions` â€” Action items board (status, assignee, due).  
- `/feedback/project/[id]/report` â€” Report creator and exports.  
- `/feedback/settings` â€” PII masking, stop-words, aspect schema, scoring weights.

**API (SSR):**  
- `POST /feedback/api/project/create` Â· `GET /feedback/api/project/list`  
- `POST /feedback/api/ingest/upload` (CSV) Â· `POST /feedback/api/ingest/paste` Â· `POST /feedback/api/ingest/form`  
- `POST /feedback/api/analyze` Â· `GET /feedback/api/job/[jobId]/status`  
- `GET /feedback/api/themes` Â· `GET /feedback/api/topics` Â· `GET /feedback/api/aspects` Â· `GET /feedback/api/keywords`  
- `POST /feedback/api/actions/generate` Â· `POST /feedback/api/actions/update`  
- `POST /feedback/api/reply`  
- `POST /feedback/api/report` (pdf|md) Â· `POST /feedback/api/export` (csv|json)  
- `POST /feedback/api/settings/update`

---

## 4) Data Model (Astro DB / SQL)

**User**  
- `id` (pk), `email`, `plan`, `timezone`, `language`, `createdAt`

**Project**  
- `id` (pk uuid), `userId` (fk), `name`, `description`, `cohorts` (json schema), `settings` (json), `createdAt`

**Source**  
- `id` (pk uuid), `projectId` (fk), `type` ('csv'|'paste'|'form'), `meta` (json), `createdAt`

**FeedbackItem**  
- `id` (pk uuid), `projectId` (fk), `sourceId` (fk), `raw` (text), `clean` (text), `lang` (string), `userMeta` (json), `timestamp` (datetime), `hash` (unique), `piiMasked` (bool)

**Analysis**  
- `id` (pk uuid), `projectId` (fk), `jobId` (string), `status` ('queued'|'running'|'done'|'error'), `params` (json), `summary` (json), `createdAt`

**Theme**  
- `id` (pk uuid), `projectId` (fk), `label`, `sentiment` (float -1..1), `volume` (int), `trend` (json), `keywords` (json), `exampleIds` (json)

**Aspect**  
- `id` (pk uuid), `projectId` (fk), `name` ('pricing'|'support'|'ux'|'performance'|'reliability'|'features'|'content'|'onboarding'|'docs'), `sentiment` (float), `subAspects` (json)

**Topic**  
- `id` (pk uuid), `projectId` (fk), `label`, `sentiment` (float), `volume` (int), `keywords` (json), `exampleIds` (json)

**ActionItem**  
- `id` (pk uuid), `projectId` (fk), `title`, `description`, `priority` ('p0'|'p1'|'p2'), `impact` (1..5), `effort` (1..5), `status` ('todo'|'doing'|'done'), `assignee` (string|null), `feedbackRefs` (json), `createdAt`, `dueAt` (nullable)

**ReplyDraft**  
- `id` (pk uuid), `projectId` (fk), `itemId` (fk), `tone` ('neutral'|'friendly'|'apologetic'|'formal'), `body` (text), `createdAt`

**Report**  
- `id` (pk uuid), `projectId` (fk), `range` (json), `kpis` (json), `charts` (json), `url` (string), `format` ('pdf'|'md'), `createdAt`

---

## 5) Ingest and Normalization

- **CSV headers** autoâ€‘detect (support: `message, created_at, user_id, email, plan, region, version, channel`). Map with a wizard.  
- **Cleaning:** trim, Unicode normalize, remove signatures, collapse whitespace, strip quoted replies.  
- **PII masking:** replace emails/phones/order IDs with tokens (`<email_1>`).  
- **Language detect and translate:** store `lang`; optional translation to analysis language (`en`).  
- **Dedup:** hash(`clean + userMeta.hashable`) to avoid repeats.

---

## 6) NLP Pipeline (Deterministic + AIâ€‘assisted)

1. **Sentence segmentation and tokenization**  
2. **Rule filters:** profanity, boilerplate removal, stopâ€‘words per domain  
3. **Sentiment:** model returns score **-1..1** and label (neg/neu/pos)  
4. **Aspect tagging:** dictionary + ML classifier â†’ perâ€‘aspect sentiment  
5. **Topic clustering:** embeddings + HDBSCAN/Kâ€‘means; top keywords per topic  
6. **Urgency score:** heuristic (`neg strong` + contains trigger words like *crash, refund, broken* â†’ higher)  
7. **Impact score:** cohort weights (e.g., **Pro plan** > Free), recency, volume, churn risk indicators  
8. **Summaries:** per aspect and per topic with example quotes  
9. **Action synthesis:** ICE or RICE scoring; create tasks

**Configurable Weights** in `/feedback/settings`: urgency/impact multipliers, stopâ€‘words, custom aspects.

---

## 7) UI / Pages

### `/feedback` (Hub)
- Create project, import data; cards show **Total feedback**, **Pos/Neu/Neg** %, **Top themes**, **Open actions**.

### Project Dashboard
- KPI band: **N items**, **NPS avg**, **CSAT avg**, **% Negative**, **Top aspect**, **Trend Î” 7/30d**.  
- Charts: *Sentiment over time*, *Aspect radar*, *Topic volume*, *Urgency vs Impact matrix*.  
- Table: **Urgent items** with quick **Draft Reply**.

### Explore
- Filters: date, sentiment, language, plan, region, version, channel, topic, aspect.  
- Left: theme/topic tree; Center: comment list with highlights; Right: item details, aspect bars, quick actions.

### Actions
- Kanban board (Toâ€‘do, Doing, Done); each card shows **impact Ã— effort**. Link back to supporting comments.

### Report
- Range picker â†’ preview â†’ export PDF/MD; â€œSend to Presentation Designerâ€ button.

### Settings
- PII masking toggles, stopâ€‘words, aspects schema, scoring weights.

---

## 8) API Contracts (examples)

### `POST /feedback/api/ingest/upload`
Req: multipart CSV with mapping payload  
Res: `{ "sourceId":"<uuid>", "rows": 523, "mapped": {"message":"text","created_at":"ts", ...} }`

### `POST /feedback/api/analyze`
Req: `{ "projectId":"<uuid>", "sourceIds":["<uuid>"], "recompute": false }`  
Res: `{ "jobId":"JOB-9132" }`

### `GET /feedback/api/job/[jobId]/status`
Res: `{ "status":"done", "analysisId":"<uuid>", "errors":[] }`

### `GET /feedback/api/themes`
Res: `{ "themes":[{"label":"Onboarding","volume":120,"sentiment":-0.22,"trend":{"w30":1.4}}] }`

### `POST /feedback/api/actions/generate`
Req: `{ "projectId":"<uuid>", "max":10, "strategy":"RICE" }`  
Res: `{ "items":[{"title":"Reduce signâ€‘up steps","impact":5,"effort":2,"priority":"p0"}] }`

### `POST /feedback/api/reply`
Req: `{ "itemId":"<uuid>", "tone":"apologetic", "include_compensation":false }`  
Res: `{ "draftId":"<uuid>", "body":"Hi <name>, Thanks for flagging..." }`

### `POST /feedback/api/report`
Req: `{ "projectId":"<uuid>", "range":{"from":"2025-10-01","to":"2025-10-29"}, "format":"pdf" }`  
Res: `{ "url":"/exports/feedback_report_Oct-2025.pdf" }`

---

## 9) Validation and Limits

- CSV â‰¤ 50 MB (Free: 5 MB); rows per project Free â‰¤ 300, Pro â‰¤ 50k.  
- Comment length 5â€“5000 chars; languages supported: en/ar/ta/es/hi (extendable).  
- PII masking enabled by default; disable requires confirmation.  
- Only orgâ€‘scoped users can view a project; sharing exports removes PII.  
- Rate limits: `userId`+day for analyze/report; `projectId`+hour for actions/replies.

---

## 10) Plans and Limits

| Feature | Free | Pro |
|--------|------|-----|
| Projects | 1 | Unlimited |
| Rows/project | 300 | 50,000 |
| Analysis | Basic | Advanced (aspects, drift) |
| Reply drafts | â€” | Yes |
| Reports | 1/month | Unlimited |
| Exports | CSV only | CSV/JSON/PDF |
| Brand slides | â€” | Send to Presentation Designer |

---

## 11) Privacy, Safety, Ethics

- PII masking, private by default; logs do not store raw PII.  
- Toxic/profane content flagged; summaries keep neutral tone.  
- Do not make medical/legal/financial claims; reply drafts avoid promises.  
- Data deletion: per project and per source; exports expire after 24h.

---

## 12) Suggested File Layout

```
src/pages/feedback/index.astro
src/pages/feedback/project/[id].astro
src/pages/feedback/project/[id]/ingest.astro
src/pages/feedback/project/[id]/explore.astro
src/pages/feedback/project/[id]/actions.astro
src/pages/feedback/project/[id]/report.astro
src/pages/feedback/settings.astro

src/pages/feedback/api/project/create.ts
src/pages/feedback/api/project/list.ts
src/pages/feedback/api/ingest/upload.ts
src/pages/feedback/api/ingest/paste.ts
src/pages/feedback/api/ingest/form.ts
src/pages/feedback/api/analyze.ts
src/pages/feedback/api/job/[jobId]/status.ts
src/pages/feedback/api/themes.ts
src/pages/feedback/api/topics.ts
src/pages/feedback/api/aspects.ts
src/pages/feedback/api/keywords.ts
src/pages/feedback/api/actions/generate.ts
src/pages/feedback/api/actions/update.ts
src/pages/feedback/api/reply.ts
src/pages/feedback/api/report.ts
src/pages/feedback/api/export.ts
src/pages/feedback/api/settings/update.ts

src/components/feedback/Dashboard/*.astro
src/components/feedback/Explore/*.astro
src/components/feedback/Actions/*.astro
src/components/feedback/Reports/*.astro
```

---

## 13) Future Enhancements (v2+)

- **Connectors**: Gmail, Zendesk, Intercom, Slack, App Store/Play reviews.  
- **Drift detection**: alert when a themeâ€™s negative sentiment spikes.  
- **Multilingual fineâ€‘tuning** and custom domain taxonomies.  
- **Closedâ€‘loop tracking**: mark when action resolves a theme; show KPI lift.  
- **Anomaly and churn predictors**: model top churn drivers per cohort.  
- **Auto release notes**: compile bullet points from positive deltas.

---

**End of Requirements â€” ready for Codex implementation.**
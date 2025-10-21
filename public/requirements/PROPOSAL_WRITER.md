# ðŸ“ Proposal Writer â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/proposal`  
**Stack:** Astro + Tailwind + (islands) TS/Alpine, Astro SSR routes, Astro DB or Supabase  
**Goal:** Enable users to **compose, collaborate (basic), and export** professional proposals (business, project, freelance, grant) with **AI assistance**, reusable **templates**, and **client-specific tailoring**.

---

## 1) Objectives & Nonâ€‘Goals

### Objectives
- Create proposals quickly with **guided sections** and **live preview**.  
- **AI Draft/Improve** for any section (scope, timeline, budget, terms).  
- **Template system** (Business, Startup, Agency, Grant, RFP Response).  
- **Client-tailoring wizard**: paste RFP / client brief â†’ extract requirements & risks.  
- **Export** to **PDF/DOCX/Markdown**; optional shareable link.  
- Store multiple proposals per user; **duplicate/rename/delete**.

### Nonâ€‘Goals (v1)
- No real-time multi-user editing (only single-user edits).  
- No eâ€‘signature (add in v2).  
- No payments/invoicing flows (separate app).

---

## 2) User Stories (with Acceptance Criteria)

1. **Create Proposal**
   - *As a user*, I can start a new proposal from blank or a template.  
   - **AC:** Record created with `status='draft'`; redirect to `/proposal/builder?id=<uuid>`.

2. **Client Brief Import**
   - *As a user*, I can paste a client brief/RFP or a URL.  
   - **AC:** `/proposal/api/brief-analyze` extracts goals, scope, constraints, and risks into a sidebar checklist.

3. **AI Draft & Improve**
   - *As a user*, I can generate a first draft or improve selected sections with tone options.  
   - **AC:** `/proposal/api/ai-draft` and `/proposal/api/ai-improve` return safe text with placeholders filled.

4. **Budget & Timeline**
   - *As a user*, I can add cost line items, totals, and a milestone timeline.  
   - **AC:** Totals auto-calc; validation for currency; dates ordered.

5. **Scope & Deliverables**
   - *As a user*, I can define scope, deliverables, out-of-scope, and assumptions.  
   - **AC:** Sections saved as structured JSON; preview updates instantly.

6. **Terms & Conditions**
   - *As a user*, I can pick from preset T&C blocks (IP, confidentiality, payment terms).  
   - **AC:** Inserted blocks are editable; stored in JSON.

7. **Branding & Templates**
   - *As a user*, I can switch templates and upload a logo.  
   - **AC:** Template change preserves content; logo appears in header.

8. **Export & Share**
   - *As a user*, I can export to PDF/DOCX/MD and optionally create a public view link.  
   - **AC:** Files download; public link `/proposal/view/<slug>` (read-only).

9. **Plan Gating**
   - Free: 1 proposal, basic template, watermark export.  
   - Pro: unlimited proposals, all templates, no watermark.

---

## 3) Information Architecture & Routes

- `/proposal` â€” Dashboard (list + â€œNew Proposalâ€)  
- `/proposal/builder` â€” Main editor (form + live preview)  
- `/proposal/templates` â€” Template gallery  
- `/proposal/view/[slug].astro` â€” Public read-only view

**API (SSR):**  
- `POST /proposal/api/create`  
- `POST /proposal/api/save` (patch, autosave)  
- `POST /proposal/api/ai-draft` (create draft from brief + inputs)  
- `POST /proposal/api/ai-improve` (rewrite section)  
- `POST /proposal/api/brief-analyze` (extract reqs from RFP text/URL)  
- `POST /proposal/api/export` (pdf/docx/md)  
- `POST /proposal/api/duplicate`  
- `POST /proposal/api/delete`  
- `POST /proposal/api/publish` (create public slug)

---

## 4) Data Model (Astro DB / SQL)

**User**  
- `id` (pk), `email` (unique), `plan`, `createdAt`

**Proposal**  
- `id` (pk uuid), `userId` (fk), `title` (string), `slug` (string unique per user),  
  `templateKey` ('business' | 'agency' | 'startup' | 'grant' | 'rfp'),  
  `status` ('draft'|'published'), `data` (json), `currency` (string, default 'USD'),  
  `lastSavedAt` (datetime), `createdAt` (datetime)

**Sections JSON (`Proposal.data`)**  
```json
{
  "client": {
    "name": "",
    "contact": "",
    "company": "",
    "website": ""
  },
  "overview": "Short value proposition",
  "goals": ["Goal A", "Goal B"],
  "scope": ["Feature 1", "Feature 2"],
  "deliverables": ["Deliverable A", "Deliverable B"],
  "outOfScope": ["Excluded X"],
  "assumptions": ["Assumption 1"],
  "timeline": [
    {"milestone": "Design", "start": "2025-11-01", "end": "2025-11-15"}
  ],
  "budget": {
    "currency": "USD",
    "items": [
      {"label": "Design", "qty": 1, "unitPrice": 1200, "total": 1200}
    ],
    "subtotal": 1200,
    "tax": 0,
    "discount": 0,
    "total": 1200
  },
  "team": [{"name": "Karthik", "role": "Lead"}],
  "caseStudies": [
    {"title": "Quiz Institute", "summary": "Edtech quiz platform", "url": "https://ansiversa.com/quiz"}
  ],
  "risks": ["Tight deadline"],
  "mitigations": ["Add buffer"],
  "terms": [
    "Payment terms: 50% upfront, 50% on delivery",
    "IP: Work-for-hire"
  ],
  "branding": {
    "logoUrl": "",
    "accentColor": "#4f46e5"
  }
}
```

---

## 5) UI / Pages

### `/proposal` (Dashboard)
- Cards: title, client, updatedAt, status; actions: **Open**, **Duplicate**, **Delete**.  
- CTA: â€œNew Proposalâ€ (blank or from template).

### `/proposal/builder`
- **Left panel** (accordion): Client, Overview, Goals, Scope, Deliverables, Out-of-scope, Assumptions, Timeline, Budget, Team, Case Studies, Risks & Mitigations, Terms, Branding.  
- **Right panel**: live preview (template).  
- Top bar: template switcher, currency selector, AI Draft/Improve, Publish, Export.  
- Autosave indicator.

### `/proposal/templates`
- Template cards with â€œUse Templateâ€.  
- Pro badges for premium templates.

### `/proposal/view/[slug]`
- Read-only public proposal (SEO, OG tags).  
- Hide internal notes; display totals clearly.

---

## 6) API Contracts

### `POST /proposal/api/create`
Req: `{ "title": "Website Redesign Proposal" }`  
Res: `{ "id": "<uuid>", "templateKey": "business" }`

### `POST /proposal/api/save`
Req: `{ "id": "<uuid>", "patch": { "path": "scope[0]", "value": "User flows" } }`  
Res: `{ "ok": true, "lastSavedAt": "<ISO>" }`

### `POST /proposal/api/brief-analyze`
Req: `{ "text": "<rfp text or url>", "industry": "saas" }`  
Res: `{ "goals": [...], "requirements": [...], "risks": [...], "timelineHints": [...] }`

### `POST /proposal/api/ai-draft`
Req: `{ "client": "...", "industry": "...", "services": ["design","dev"], "tone":"professional" }`  
Res: `{ "overview": "...", "scope": [...], "deliverables": [...], "timeline": [...], "budget": {...} }`

### `POST /proposal/api/ai-improve`
Req: `{ "text": "raw section", "tone": "concise|professional|friendly" }`  
Res: `{ "text": "refined section" }`

### `POST /proposal/api/export`
Req: `{ "id": "<uuid>", "format": "pdf|docx|md" }`  
Res: `{ "url": "/exports/Proposal_Website_Redesign_2025-10-21.pdf" }`

### `POST /proposal/api/publish`
Req: `{ "id": "<uuid>" }`  
Res: `{ "url": "/proposal/view/website-redesign-proposal" }`

---

## 7) Validation Rules

- Required: title, client name, at least 1 scope item, at least 1 deliverable.  
- Budget: totals must match sum(items); non-negative numbers; currency code valid (ISO 4217).  
- Timeline: start <= end; date format ISO.  
- Terms: limited to safe text; sanitize HTML.

---

## 8) Exports

- **PDF**: server-rendered (consistent fonts, page breaks, branded header/footer).  
- **DOCX**: via `docx` library; map sections to headings/lists/tables.  
- **Markdown**: clean structure for email pasting or wiki.

---

## 9) Plans & Rate Limits

| Feature | Free | Pro |
|--------|------|-----|
| Proposals | 1 | Unlimited |
| Templates | 1 | All |
| AI Draft/Improve | 3/day | Unlimited (fair-use) |
| Export Watermark | Yes | No |
| Public Link | Yes | Yes |

Rate limit keys: `userId` + day.

---

## 10) Security & Privacy

- Client data is private by default; only published proposals are public.  
- No secrets in logs; sanitize AI inputs/outputs.  
- Public view hides email/phone unless user opts in.

---

## 11) Analytics & Events

- `proposal.create`, `proposal.save`, `proposal.publish`, `proposal.export`, `proposal.aiDraft`, `proposal.aiImprove`, `proposal.duplicate`, `proposal.delete`.

---

## 12) Accessibility & SEO

- Keyboard navigation, labeled controls, aria for accordions.  
- SEO meta for public view; OpenGraph preview for sharing.

---

## 13) File Layout (suggested)

```
src/pages/proposal/index.astro
src/pages/proposal/builder.astro
src/pages/proposal/templates.astro
src/pages/proposal/view/[slug].astro

src/pages/proposal/api/create.ts
src/pages/proposal/api/save.ts
src/pages/proposal/api/brief-analyze.ts
src/pages/proposal/api/ai-draft.ts
src/pages/proposal/api/ai-improve.ts
src/pages/proposal/api/export.ts
src/pages/proposal/api/duplicate.ts
src/pages/proposal/api/delete.ts
src/pages/proposal/api/publish.ts

src/components/proposal/Form/*.astro or .tsx
src/components/proposal/templates/Business.astro
src/components/proposal/templates/Agency.astro
src/components/proposal/templates/Startup.astro
src/components/proposal/templates/Grant.astro
```

---

## 14) Future Enhancements (v2+)

- Eâ€‘signature & acceptance tracking.  
- Pricing tables with tiers & optional line items.  
- Collaboration & comments.  
- CRM sync (HubSpot/Notion).  
- Multi-currency quotes & tax/VAT handling.

---

**End of Requirements â€” ready for Codex implementation.**
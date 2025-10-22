# ðŸ“œ Contract Generator â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/contract`  
**Category:** Career & Professional  
**Stack:** Astro + Tailwind (islands where needed), Astro SSR routes, Astro DB or Supabase  
**Goal:** Help users **generate, customize, and export** legally sound *contract documents* (e.g., Freelance Agreement, NDA, Service Agreement, Consulting, Employment Offer) with **AI assistance**, **clause libraries**, and **eâ€‘sign ready** exports.

> âš ï¸ **Disclaimer**: Ansiversa is **not a law firm**. Contracts are **for informational use**. Users should consult a qualified attorney for legal advice in their jurisdiction.

---

## 1) Objectives & Nonâ€‘Goals

### Objectives
- Create contracts from **templates** or **questionnaire wizard**.  
- **AI clause assistant** to draft/improve/translate clauses in plain language.  
- **Clause library** (IP, Confidentiality, Payment, Termination, Dispute, Jurisdiction, Nonâ€‘compete, Warranty, Liability).  
- **Variables & placeholders** (party names, dates, fees, scope) autoâ€‘filled.  
- **Export** to **PDF/DOCX/Markdown**; **shareable readâ€‘only link**.  
- **Versioning** and ability to **duplicate** contracts.

### Nonâ€‘Goals (v1)
- No inâ€‘app eâ€‘signature (generate PDFs ready for external eâ€‘sign).  
- No multiâ€‘party live editing (single user edits only).  
- No jurisdictionâ€‘specific legal guarantees (general clauses only).

---

## 2) User Stories & Acceptance Criteria

1. **Start from Template or Wizard**
   - Create draft with default clauses â†’ open `/contract/builder?id=<uuid>`.

2. **Q&A Wizard**
   - Guided inputs (parties, scope, fees, dates, jurisdiction).  
   - Generate variables and toggle clause options.

3. **AI Clause Assistant**
   - Draft/simplify/tighten/translate clauses with tone control.  
   - Safe outputs; no unlawful advice.

4. **Clause Library Insert**
   - Browse categories and insert editable clauses.  
   - Placeholders (e.g., `{ClientName}`) merge on insert.

5. **Variables (Merge Fields)**
   - Edit variables panel; reflected across preview in real time.

6. **Versioning**
   - Save checkpoints; restore previous version.

7. **Export & Share**
   - Export PDF/DOCX/MD; optional public readâ€‘only link.

8. **Plan Gating**
   - Free: 1 contract, basic templates, watermark PDF.  
   - Pro: unlimited, all templates, DOCX/MD, no watermark.

---

## 3) Routes & APIs

- `/contract` â€” dashboard  
- `/contract/wizard` â€” guided intake  
- `/contract/builder` â€” editor + preview  
- `/contract/templates` â€” gallery  
- `/contract/view/[slug]` â€” public view

**API:**  
- `POST /contract/api/create`  
- `POST /contract/api/save`  
- `POST /contract/api/ai-clause`  
- `POST /contract/api/export`  
- `POST /contract/api/duplicate`  
- `POST /contract/api/delete`  
- `POST /contract/api/publish`  
- `GET  /contract/api/library`

---

## 4) Database Model

**User**: id, email, plan, createdAt

**Contract**: id, userId, title, slug, type, status, templateKey, variables (json), clauses (json), lastSavedAt, createdAt

**ClauseLibrary**: id, category, title, body, locale, createdAt

**Variables (example)**  
```json
{
  "ClientName": "Acme FZ-LLC",
  "ProviderName": "Karthik Ramalingam",
  "StartDate": "2025-10-22",
  "EndDate": null,
  "ServiceFee": "AED 12,000",
  "PaymentSchedule": "50% upfront, 50% on delivery",
  "Jurisdiction": "Dubai, UAE",
  "Currency": "AED"
}
```

**Clauses (example)**  
```json
{
  "preamble": "This Agreement is made between {ClientName} and {ProviderName}...",
  "services": "Provider will deliver the following services...",
  "fees": "Client agrees to pay {ServiceFee}...",
  "ip_ownership": "Work-for-hire; Provider assigns all rights...",
  "confidentiality": "Each party agrees to protect confidential info...",
  "liability": "Limitation of liability not exceeding amounts paid...",
  "termination": "Either party may terminate with 14 days notice...",
  "dispute_resolution": "Any disputes shall be resolved by arbitration in {Jurisdiction}...",
  "governing_law": "This Agreement is governed by the laws of {Jurisdiction}.",
  "signatures": "IN WITNESS WHEREOF..."
}
```

---

## 5) UI Spec

### `/contract` (Dashboard)
- List/grid of contracts with actions: **Open**, **Duplicate**, **Delete**.  
- CTA: â€œNew Contractâ€ (choose template or wizard).

### `/contract/wizard`
- Steps: Parties â†’ Scope â†’ Fees â†’ Dates â†’ Jurisdiction â†’ Options â†’ Review â†’ Generate.

### `/contract/builder`
- Left: Variables panel + Clause Library + AI Clause tool.  
- Right: Live Preview with merge fields resolved.  
- Toolbar: Template switcher, Translate/Simplify/Tighten, Export, Publish, Versioning.

### `/contract/templates`
- Template cards: Freelance / NDA / Service / Consulting / Employment Offer / Custom.

### `/contract/view/[slug]`
- Readâ€‘only public view with disclaimer footer.

---

## 6) API Contracts

- **Create**: Req `{ "title": "Freelance Agreement", "type": "freelance" }` â†’ Res `{ "id": "<uuid>" }`  
- **Save**: Req `{ "id": "<uuid>", "patch": { "path": "variables.ClientName", "value": "Acme FZ-LLC" } }` â†’ `{ "ok": true }`  
- **AI Clause**: Req `{ "mode": "tighten|draft|translate|simplify", "text": "...", "tone": "formal" }` â†’ `{ "text": "...", "notes": "..." }`  
- **Export**: Req `{ "id": "<uuid>", "format": "pdf|docx|md" }` â†’ `{ "url": "/exports/Contract_....pdf" }`  
- **Publish**: Req `{ "id": "<uuid>" }` â†’ `{ "url": "/contract/view/<slug>" }`  
- **Library**: `GET ?category=ip&locale=en` â†’ list of clauses.

---

## 7) Validation & Rules

- Required: ClientName, ProviderName, StartDate, Jurisdiction.  
- Dates ISO; EndDate >= StartDate.  
- Currency code valid (ISO 4217); positive fees.  
- Each clause â‰¤ 3000 chars; signatures block required for export.  
- Sanitize inputs; no scripts/unsafe HTML.

---

## 8) Export

- **PDF**: SSR render, page numbers, header/footer, watermark for Free plan.  
- **DOCX**: heading styles + numbered clauses.  
- **Markdown**: portable text export.

---

## 9) Plans & Rate Limits

| Feature | Free | Pro |
|--------|------|-----|
| Contracts | 1 | Unlimited |
| Templates | 2 basic | All |
| AI Clause Ops | 5/day | Unlimited |
| Export | PDF (watermark) | PDF/DOCX/MD (no watermark) |
| Public Link | Yes | Yes |

---

## 10) Security, Analytics, Accessibility

- Private by default; public only when published.  
- Legal disclaimer on builder and exports.  
- Events: `contract.create/save/export/publish/aiClause`.  
- Accessible forms/dialogs; OG tags for public pages; `noindex` drafts.

---

## 11) Suggested File Layout

```
src/pages/contract/index.astro
src/pages/contract/wizard.astro
src/pages/contract/builder.astro
src/pages/contract/templates.astro
src/pages/contract/view/[slug].astro

src/pages/contract/api/create.ts
src/pages/contract/api/save.ts
src/pages/contract/api/ai-clause.ts
src/pages/contract/api/export.ts
src/pages/contract/api/duplicate.ts
src/pages/contract/api/delete.ts
src/pages/contract/api/publish.ts
src/pages/contract/api/library.ts

src/components/contract/Form/*.astro or .tsx
src/components/contract/ClauseLibrary/*.astro
src/components/contract/templates/Freelance.astro
src/components/contract/templates/NDA.astro
src/components/contract/templates/Service.astro
src/components/contract/templates/Consulting.astro
src/components/contract/templates/EmploymentOffer.astro
```

---

## 12) Future Enhancements

- Eâ€‘signature integrations.  
- Redlining/trackâ€‘changes and comments.  
- Jurisdictionâ€‘aware clause suggestions.  
- Multiâ€‘party share with roles.  
- Crossâ€‘app clause sync (Proposal â†” Contract).

---

**End of Requirements â€” ready for Codex implementation.**
# ðŸ§¾ Invoice & Receipt Maker â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/invoice`  
**Category:** Career & Professional  
**Stack:** Astro + Tailwind (islands as needed), Astro SSR routes, Astro DB / Supabase, optional currency/exchange API  
**Goal:** Let users **create, send, and export** professional invoices & receipts with itemized lines, taxes/discounts, branding, and simple tracking â€” with optional AI assistance for descriptions and polite payment reminders.

> âš ï¸ **Note:** This app is not a payment processor. For live payments, integrate external gateways in v2.

---

## 1) Objectives & Nonâ€‘Goals

### Objectives
- Create invoices (and receipts) from templates with **items, taxes, discounts, notes, and terms**.  
- **Branding** (logo, business info, color accent) and **template styles** (Classic, Modern, Minimal).  
- **Currency support** with auto-exchange display (optional).  
- **Status tracking** (draft, sent, viewed, paid, void).  
- **Exports**: PDF, HTML; shareable **public view link**.  
- **AI helpers**: write line item descriptions; write polite reminders; summarize invoice.  
- **Receipts**: generate receipt from paid invoice or standalone simple receipt.

### Nonâ€‘Goals (v1)
- No integrated online payments (links only).  
- No full accounting suite (journals, double-entry).  
- No multi-user roles/collaboration.

---

## 2) User Stories (with Acceptance Criteria)

1. **Create Invoice**
   - *As a user*, I can create a new invoice with my business details and client details.  
   - **AC:** Draft created with ID and number pattern; open `/invoice/builder?id=<uuid>`.

2. **Add Items & Totals**
   - *As a user*, I can add items with qty, unit price, tax %, and discount %.  
   - **AC:** Subtotal, tax, discount, and **grand total** auto-calculate; currency symbol correct.

3. **Branding & Template**
   - *As a user*, I can upload a logo, set accent color, and pick a template.  
   - **AC:** Preview updates instantly; settings persist per invoice and default profile.

4. **Issue & Send**
   - *As a user*, I can mark an invoice as **sent**, and get a public share link.  
   - **AC:** Status changes to `sent`; `/invoice/view/<slug>` is readable on mobile and desktop.

5. **Record Payment & Receipt**
   - *As a user*, I can record a **full or partial payment** with date and method.  
   - **AC:** Balance updates; status becomes `paid` when fully settled; **generate receipt** PDF with payment details.

6. **Reminders (Manual in v1)**
   - *As a user*, I can copy a polite reminder email/message with due amount and link.  
   - **AC:** AI suggestion endpoint returns 2â€“3 variants; user copies manually.

7. **Export**
   - *As a user*, I can export invoices/receipts to **PDF** or **HTML ZIP**.  
   - **AC:** Layout consistent with preview; correct totals; watermark on Free plan.

8. **Plan Gating**
   - Free: up to 5 invoices, 1 template, watermark.  
   - Pro: unlimited invoices, all templates, no watermark, receipts, multiple currencies.

---

## 3) Information Architecture & Routes

- `/invoice` â€” Dashboard (list + â€œNew Invoiceâ€)  
- `/invoice/builder` â€” Main editor (form + live preview)  
- `/invoice/templates` â€” Template gallery  
- `/invoice/view/[slug].astro` â€” Public read-only view  
- `/invoice/receipt/[id].astro` â€” Public receipt view (optional)

**API (SSR):**  
- `POST /invoice/api/create`  
- `POST /invoice/api/save` (patch; autosave)  
- `POST /invoice/api/ai-copy` (descriptions/reminders)  
- `POST /invoice/api/export` (pdf/html)  
- `POST /invoice/api/send` (mark as sent; create slug)  
- `POST /invoice/api/payment` (record payment)  
- `POST /invoice/api/duplicate`  
- `POST /invoice/api/delete`

---

## 4) Database Model (Astro DB / SQL)

**User**  
- `id` (pk), `email` (unique), `plan`, `businessName`, `businessAddress`, `defaultCurrency`, `logoUrl`, `createdAt`

**Client** (optional for reuse)  
- `id` (pk), `userId` (fk), `name`, `email`, `company`, `address`, `createdAt`

**Invoice**  
- `id` (pk uuid), `userId` (fk), `clientId` (fk nullable), `number` (string), `slug` (string),  
  `issueDate` (date), `dueDate` (date), `currency` (string, ISO 4217), `status` ('draft'|'sent'|'viewed'|'partial'|'paid'|'void'),  
  `templateKey` (string), `branding` (json), `notes` (text), `terms` (text),  
  `items` (json), `totals` (json), `payments` (json), `lastSavedAt` (datetime), `createdAt`

**Receipt**  
- `id` (pk), `invoiceId` (fk), `number` (string), `date` (date), `amount` (numeric), `method` (string), `notes` (text), `createdAt`

### JSON: `Invoice.items` (example)
```json
[
  {"description": "Design Sprint", "qty": 1, "unitPrice": 1200, "taxPct": 5, "discountPct": 0},
  {"description": "Frontend Implementation", "qty": 20, "unitPrice": 45, "taxPct": 5, "discountPct": 10}
]
```

### JSON: `Invoice.totals` (computed)
```json
{
  "subtotal": 2100,
  "taxTotal": 105,
  "discountTotal": 90,
  "grandTotal": 2115,
  "paidTotal": 1000,
  "balanceDue": 1115
}
```

### JSON: `Invoice.payments` (example)
```json
[
  {"date": "2025-10-22", "amount": 1000, "method": "Bank Transfer", "note": "Advance"}
]
```

### JSON: `Invoice.branding` (example)
```json
{
  "logoUrl": "/uploads/invoice/logo.png",
  "accent": "#4f46e5",
  "company": {
    "name": "Ansiversa",
    "address": "Dubai, UAE",
    "email": "billing@ansiversa.com"
  }
}
```

---

## 5) UI / Pages

### `/invoice` (Dashboard)
- Table/cards: number, client, issue date, due date, amount, status, balance, actions (**Open / Send / Duplicate / Delete**).  
- Filters: status, client, date range.  
- CTA: â€œNew Invoiceâ€.

### `/invoice/builder` (Editor)
- **Left Form** (accordion): Business Info, Client Info, Items, Taxes & Discounts, Notes, Terms, Payments, Branding.  
- **Right Preview**: Live invoice; template switcher; currency selector.  
- Toolbar: Send (create public link), Export (PDF/HTML), Add Payment, Duplicate, Delete.  
- Autosave indicator and last saved timestamp.

### `/invoice/templates`
- Template previews with â€œUse Templateâ€. Pro templates marked.  
- Options: paper size (A4/Letter), font family, accent color.

### `/invoice/view/[slug]`
- Public invoice view (readâ€‘only) with **Pay / Download** buttons (Pay = external link placeholder).  
- Footer: â€œGenerated with Ansiversaâ€ watermark (Free plan).

### `/invoice/receipt/[id]` (optional public)
- Public receipt view with payment details and invoice reference.

---

## 6) API Contracts

### `POST /invoice/api/create`
Req: `{ "clientId": "<id|null>", "currency":"AED" }`  
Res: `{ "id":"<uuid>", "number":"INV-2025-001", "slug":"inv-2025-001" }`

### `POST /invoice/api/save`
Req: `{ "id":"<uuid>", "patch": { "path":"items[0].qty", "value": 2 } }`  
Res: `{ "ok": true, "totals": { ... }, "lastSavedAt":"<ISO>" }`

### `POST /invoice/api/ai-copy`
Req: `{ "mode":"item|reminder", "text":"raw context", "tone":"polite|professional|friendly" }`  
Res: `{ "text":"refined description or reminder" }`

### `POST /invoice/api/export`
Req: `{ "id":"<uuid>", "format":"pdf|html" }`  
Res: `{ "url": "/exports/Invoice_INV-2025-001.pdf" }`

### `POST /invoice/api/send`
Req: `{ "id":"<uuid>" }`  
Res: `{ "url": "/invoice/view/inv-2025-001", "status": "sent" }`

### `POST /invoice/api/payment`
Req: `{ "id":"<uuid>", "payment": { "date":"2025-10-23", "amount": 500, "method":"Bank Transfer", "note":"" } }`  
Res: `{ "ok": true, "totals": { "paidTotal":1500, "balanceDue":615 }, "status":"partial|paid" }`

### `POST /invoice/api/duplicate`
Req: `{ "id":"<uuid>" }`  
Res: `{ "id":"<newUuid>", "number":"INV-2025-002" }`

### `POST /invoice/api/delete`
Req: `{ "id":"<uuid>" }`  
Res: `{ "ok": true }`

---

## 7) Validation Rules

- **Invoice number format**: `INV-YYYY-###` by default (configurable).  
- **Currency**: ISO 4217 (AED, USD, INR, EUR...).  
- **Items**: qty â‰¥ 0, unitPrice â‰¥ 0; description 1â€“280 chars.  
- **Totals**: computed server-side; cannot be negative.  
- **Dates**: issueDate â‰¤ dueDate.  
- **Payments**: amount > 0; total paid â‰¤ grandTotal.  
- **Client & business info**: required fields must be present for send/export.

---

## 8) Export & Rendering

- **PDF**: SSR (consistent fonts, page numbers, table layout, totals).  
- **HTML ZIP**: static bundle with CSS/fonts/images.  
- **Receipt PDF**: compact layout with payment reference.  
- **Watermark**: â€œGenerated with Ansiversaâ€ on Free plan.

---

## 9) Plans & Rate Limits

| Feature | Free | Pro |
|--------|------|-----|
| Invoices | Up to 5 | Unlimited |
| Templates | 1 basic | All |
| Receipts | From paid invoices | Standalone + from invoices |
| Currencies | 1 default | Multiple |
| AI Helpers | 5/day | Unlimited (fair-use) |
| Exports | PDF with watermark | PDF/HTML without watermark |

Rate limit keys: by `userId` + day for AI; `userId` + month for create/send.

---

## 10) Security & Privacy

- Private by default; **public only when sent/published**.  
- Do not store payment instrument details.  
- Sanitize free-text notes; no scripts.  
- Obfuscate email addresses on public page unless permitted.

---

## 11) Analytics & Events

- `invoice.create`, `invoice.save`, `invoice.send`, `invoice.view`, `invoice.payment`, `invoice.export`, `invoice.delete`, `invoice.duplicate`, `invoice.reminder`.  
- Track template usage and currency spread.

---

## 12) Accessibility & SEO

- Keyboard-friendly forms; visible focus; aria labels for tables.  
- Public view with SEO meta and OpenGraph preview; `noindex` for drafts.

---

## 13) Suggested File Layout

```
src/pages/invoice/index.astro
src/pages/invoice/builder.astro
src/pages/invoice/templates.astro
src/pages/invoice/view/[slug].astro
src/pages/invoice/receipt/[id].astro

src/pages/invoice/api/create.ts
src/pages/invoice/api/save.ts
src/pages/invoice/api/ai-copy.ts
src/pages/invoice/api/export.ts
src/pages/invoice/api/send.ts
src/pages/invoice/api/payment.ts
src/pages/invoice/api/duplicate.ts
src/pages/invoice/api/delete.ts

src/components/invoice/Form/*.astro or .tsx
src/components/invoice/Preview/*.astro
src/components/invoice/templates/Classic.astro
src/components/invoice/templates/Modern.astro
src/components/invoice/templates/Minimal.astro
```

---

## 14) Future Enhancements (v2+)

- Payment links (Stripe, Razorpay, PayPal) and automatic paid status on webhook.  
- Recurring invoices & subscriptions.  
- Tax profiles (VAT/GST) with per-item tax.  
- Multi-language and RTL templates (Arabic).  
- Email sending from app (SMTP/Mail API).  
- Bulk import/export (CSV).

---

**End of Requirements â€” ready for Codex implementation.**
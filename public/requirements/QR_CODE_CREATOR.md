# â—¼ï¸ QR Code Creator â€” Full Requirements (Ansiversa)

Codexâ€‘ready specification for building the **QR Code Creator** mini app. Target stack: **Astro (SSR)** + **Tailwind** + **Alpine.js** + **Astro DB**, deployed on **Vercel**.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### What it does
Create **static** and **dynamic** QR codes for many content types (URL, text, Wiâ€‘Fi, contact, event, payment link, etc.), with rich **styling** (colors, gradients, logos, custom â€œeyesâ€), **vector exports** (SVG/PDF), **batch generation** from CSV, and (for dynamic QRs) **short links + analytics** + **expiration/password**.

### Core Features
- **Content types**: URL, Text, Email (mailto), Phone (tel), SMS, WhatsApp, **Wiâ€‘Fi** (WPA/WPA2/WEP/None), **vCard / meCard**, Geo (`geo:`), Event (iCal), App links (Android/iOS), Payment links (generic), Social links bundle.
- **Static vs Dynamic**:  
  - **Static**: data encoded directly; immutable; no analytics.  
  - **Dynamic**: short URL redirects to target; target can be changed without reprinting; analytics & access rules.
- **Styling**: size, margin/quiet zone, error correction **L/M/Q/H**, dot shape (square/rounded/circle), **finder â€œeyesâ€** variations, foreground/background (solid/gradient), **logo overlay** with safe area, background image fit (optional).
- **Export**: **SVG** (preferred), PNG (1x/2x/4x), PDF; ZIP for batches; share link.
- **Batch**: CSV/JSON import; templated fields; sequential filenames; ZIP export; perâ€‘row status.
- **Analytics (dynamic)**: scan count, last scan, scans over time; country/locale/city (approx via IP), device family (via UA).
- **Access rules (dynamic)**: expiration date, password, allowed countries (include/exclude), UTM appending, campaign tags.
- **Safety**: target URL validation (scheme allowlist), phishing/malware blacklist check (basic), limit large payloads.
- **Integrations**: use **Unit & Currency Converter** for payments if needed; can embed in **Visiting Card Maker** & **Presentation Designer**.

### Key Pages
- `/qr` â€” Create & style (static by default).  
- `/qr/dynamic` â€” Create dynamic QR (target + rules + analytics preview).  
- `/qr/batch` â€” Batch generator from CSV.  
- `/qr/[id]` â€” Manage a QR (preview, download, analytics if dynamic).  
- `/qr/settings` â€” Defaults, branding, domains.  
- `/r/:code` â€” **Redirect endpoint** for dynamic QRs (server route).

### Minimal Data Model
`QR`, `QRTarget`, `QRStyle`, `QRScan`, `BatchJob`, `ShortDomain`, `Profile`, `Tag`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Static QR | âœ… | âœ… |
| Dynamic QR | â€” | âœ… |
| Analytics | â€” | âœ… |
| Vector (SVG/PDF) | SVG only | SVG + PDF |
| Logo overlay | â€” | âœ… |
| Gradients/custom eyes | Basic | Advanced |
| Batch rows/job | 25 | 10,000 |
| Custom short domain | â€” | âœ… |
| Access rules (password/expire/geo) | â€” | âœ… |
| History retention | 30 days | Unlimited |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Information Architecture & Routes

**Pages**
- `/qr` â€” Singleâ€‘page creator: choose **content type**, **payload fields**, **style**, preview & **download**.
- `/qr/dynamic` â€” Target (URL or rich types), UTM, access rules, style, create â†’ **short link + QR**.
- `/qr/batch` â€” CSV upload (headers vary by type), mapping UI, preview grid, ZIP export.
- `/qr/[id]` â€” Details page: preview, download in formats, style edit (**nonâ€‘destructive**), analytics (if dynamic).
- `/qr/settings` â€” Defaults for size, ECC level, brand colors, logo, short domain selection.
- `/qr/samples` â€” Optional gallery of presets.

**API (SSR)**
- Generate: `POST /qr/api/generate` (payload, style, variant='static'|'dynamic')
- Download: `GET /qr/api/download?id=&fmt=svg|png|pdf&scale=1|2|4`
- Batch: `POST /qr/api/batch/create` Â· `GET /qr/api/batch/status?id=`
- Manage dynamic: `POST /qr/api/target/update`, `POST /qr/api/rules/update`
- Analytics: `GET /qr/api/analytics?id=&span=7|30|90`
- Redirect: `GET /r/:code` (server only; logs scan + applies rules)

---

### 2) Content Types & Encoding

| Type | Fields | Encoding Notes |
|-----|--------|-----------------|
| URL | `url` | Allow `https://` and `http://` (warn on http). |
| Text | `text` | UTFâ€‘8, length guard (e.g., â‰¤ 1,200 chars). |
| Email | `to`, `subject`, `body` | `mailto:` URI; URLâ€‘encode params. |
| Phone | `number` | `tel:` URI. |
| SMS | `number`, `message` | `sms:` URI (device dependent). |
| WhatsApp | `phone`, `message` | `https://wa.me/<phone>?text=...` |
| Wiâ€‘Fi | `ssid`, `auth`, `password`, `hidden?` | `WIFI:T:WPA;S:<ssid>;P:<pwd>;H:true;;` |
| vCard | `firstName`, `lastName`, `org`, `title`, `email`, `phone`, `url`, `address`, `note` | Generate **vCard 3.0** text. |
| meCard | subset of vCard | `MECARD:N:...;TEL:...;EMAIL:...;;` |
| Geo | `lat`, `lng` | `geo:lat,lng` |
| Event | `title`, `start`, `end`, `location`, `desc` | iCal VEVENT text. |
| App Link | `ios`, `android`, `fallback` | Switch based on UA at redirect (dynamic). |
| Payment | `link` | Generic link; (future: add UPI/PayPal schemes). |

**Error Correction (ECC)**: L(7%), M(15%), Q(25%), H(30%). Default: **M**. Larger logos require higher ECC.

---

### 3) Styling System

- **Size (px)**: 256, 512, 1024 (PNG); SVG is resolution independent.
- **Quiet zone**: 2â€“6 modules (default 4).  
- **Dots**: square, rounded, circle (percent corner radius).  
- **Eyes**: outer/inner styles (square/rounded/circle/diamond).  
- **Colors**: solid or **linear/radial gradient** (angle, stops); BG color or transparent.  
- **Logo**: upload SVG/PNG; size % (10â€“30), rounded corners, **autoâ€‘contrast** halo; forbid covering finder eyes.  
- **Background image** (optional): autoâ€‘QR tint for readability; only with high ECC.  
- **Accessibility**: contrast check (Î”E or WCAGâ€‘like heuristic) to warn if unreadable.

Presets: **Classic Black**, **Brand Primary**, **Duotone Gradient**, **With Logo**, **Poster on Photo**.

---

### 4) Dynamic QR: Redirect & Rules

- **Short link** `/r/:code` resolves to the current target (server 302).  
- **Rules** (evaluated on redirect):  
  - **Password** (hash & salt; prompt page).  
  - **Expiration** (after date â†’ disabled page).  
  - **Geo allow/deny** by country (from IP).  
  - **UTM**: autoâ€‘append `utm_source=qr&utm_campaign=...`  
  - **Device routing** (iOS/Android/Web) â€” optional.

- **Analytics logging** (asynchronous): timestamp, code, IP (hashed), country/region/city (GeoIP), UA family (mobile/desktop/os/browser). Store **no PII** beyond hashed IP. Respect Doâ€‘Notâ€‘Track if sent.

---

### 5) Data Model (Astro DB / SQL)

**QR**  
- `id` (uuid pk), `userId` (fk), `kind` ('static'|'dynamic'), `name` (text), `contentType` (text), `payload` (json), `styleId` (fk|null), `shortCode` (text unique|null), `createdAt`, `updatedAt`

**QRTarget** (dynamic only)  
- `id` (pk), `qrId` (fk), `url` (text), `params` (json), `rules` (json:{passwordHash,expireAt,geo:{allow,deny},utm,campaign,deviceRouting}), `active` (bool), `createdAt`, `updatedAt`

**QRStyle**  
- `id` (pk), `userId` (fk), `name` (text), `config` (json:{size,ecc,quiet,colors,gradient,eyes,dots,logo})

**QRScan**  
- `id` (pk), `qrId` (fk), `at` (datetime), `country` (text|null), `region`(text|null), `city`(text|null), `device`(text|null), `ua`(text|null)

**BatchJob**  
- `id` (pk), `userId` (fk), `status` ('queued'|'running'|'done'|'error'), `rows` (int), `resultUrl` (text|null), `createdAt`

**ShortDomain**  
- `id` (pk), `domain` (text), `verified` (bool), `userId` (fk|null)  # custom domains (Pro)

**Profile**  
- `id` (pk), `userId` (fk), `defaults` (json:{size,ecc,quiet,colors,domain}), `limits` (json)

Indexes: `QR.shortCode` unique, `QRScan.qrId+at`, `QR.userId+createdAt`.

---

### 6) UX / UI

- **Twoâ€‘column**: left (form: content type & fields), right (live preview).  
- **Style drawer** with presets & advanced controls; contrast warnings.  
- **Download bar** with SVG/PNG/PDF buttons and size multipliers.  
- **Batch**: CSV mapping wizard + progress + ZIP download.  
- **Dynamic**: analytics chart (bar/line for scans by day), last 10 scans list.

Shortcuts: `Cmd/Ctrl+S` save QR, `Cmd/Ctrl+D` download, `G` toggle grid, `L` toggle logo, `E` cycle ECC.

---

### 7) Validation & Safety

- URL **allowlist** protocols: `https`, `http` (warn), `mailto`, `tel`, `sms`, `geo`, `wifi`, custom app links if configured.  
- **Phishing/malware** basic reputation check (serverâ€‘side).  
- Payload length limits per type; show ECC/size recommendation when near limits.  
- Logo size guard; prevent covering finder eyes.  
- For dynamic rules: password stored as **argon2id hash**; do not store plaintext.  
- Respect **DNT** header; allow user to disable analytics per QR.

---

### 8) Plans & Limits

| Feature | Free | Pro |
|---|---|---|
| Static QR | âœ… | âœ… |
| Dynamic QR | â€” | âœ… |
| Analytics retention | â€” | 365 days |
| Batch rows/job | 25 | 10,000 |
| SVG export | âœ… | âœ… |
| PDF export | â€” | âœ… |
| Logo overlay | â€” | âœ… |
| Custom short domain | â€” | âœ… |

Rate limits: generate 200/day (Free), 5,000/day (Pro).

---

## ðŸ§© PART 3 â€” TECH NOTES (for Codex)

### Libraries (server)
- **QR generation**: node options include `qrcode`, `qr-image`, or **SVGâ€‘first** like `@nuintun/qrcode` or `qrcode-generator`. Prefer an API that supports **ECC levels** and **raw module matrix** so we can render our custom styles (eyes/dots) to SVG.
- **SVG rendering**: compose shapes for dots/eyes; apply gradient fills; keep quietâ€‘zone.
- **PNG/PDF**: rasterize SVG to PNG (sharp/resvg) and SVGâ€‘toâ€‘PDF (pdfkit/resvg).

### Pseudocode (server SVG)
```ts
const matrix = encodeQR(payload, { ecc: 'M' }); // boolean[][]
const svg = renderSVG(matrix, { size, quiet, dots:'rounded', eyes:'rounded', fg:'#111', bg:'transparent', logo });
return svg;
```

### Redirect handler
```ts
// /r/:code
const qr = await db.QR.findByShortCode(code);
if (!qr || qr.kind !== 'dynamic') return notFound();
if (isExpired(qr.rules)) return renderDisabled();
if (requiresPassword(qr.rules) && !validPassword(request)) return promptPassword();
logScanAsync(qr.id, request);
return redirect(withUTM(qr.target.url, qr.rules.utm));
```

---

## ðŸ“¦ FILE LAYOUT

```
src/pages/qr/index.astro
src/pages/qr/dynamic.astro
src/pages/qr/batch.astro
src/pages/qr/[id].astro
src/pages/qr/settings.astro

src/pages/qr/api/generate.ts
src/pages/qr/api/download.ts
src/pages/qr/api/batch/create.ts
src/pages/qr/api/batch/status.ts
src/pages/qr/api/target/update.ts
src/pages/qr/api/rules/update.ts
src/pages/qr/api/analytics.ts

src/pages/r/[code].ts                     # redirect endpoint (dynamic)

src/lib/qr/encode.ts                      # payload encoders per type
src/lib/qr/render-svg.ts                  # matrix â†’ styled SVG
src/lib/qr/rasterize.ts                   # svg â†’ png/pdf
src/lib/qr/shortcode.ts                   # short code generator
src/lib/qr/validators.ts                  # URL/payload validation
src/lib/qr/analytics.ts                   # scan logging helpers
```

---

## âœ… ACCEPTANCE CRITERIA

- [ ] Static QR generation works for all content types with **SVG/PNG** downloads and styling.  
- [ ] Dynamic QR issues a working **short link** that can be **retargeted** after creation.  
- [ ] Analytics page shows **scan counts** and **recent scans** for dynamic QRs.  
- [ ] Batch job supports CSV â†’ ZIP with perâ€‘row status and filename rules.  
- [ ] Styling system supports **gradients**, **custom eyes**, **logo overlay** with contrast checks.  
- [ ] Security: phishing/URL allowlist, password hashing, DNT respect, PIIâ€‘aware analytics.  
- [ ] Clean file layout with SSR endpoints and DB schema in place.

---

**End of Requirements â€” Ready for Codex Implementation.**
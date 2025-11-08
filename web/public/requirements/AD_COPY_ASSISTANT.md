# ðŸª„ Ad Copy Assistant â€” Full Requirements (Ansiversa)

This document provides a **Codex-friendly summary** plus a **complete technical specification** to implement the Ad Copy Assistant mini app.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### Overview
**Ad Copy Assistant** helps founders and marketers create **highâ€‘performing, channelâ€‘specific ad creatives** in minutes. It turns a simple **campaign brief** (offer, audience, goals) into **platformâ€‘ready copy variants** (Google Search, Performance Max, Facebook/Instagram, LinkedIn, X, TikTok, YouTube), respecting **character limits**, **policies**, **brand voice**, and **localization**. It supports **A/B multivariants**, **UTM tagging**, **keyword insertion**, and **quick compliance checks**, with exports to **CSV/JSON** for bulk uploads.

### Core Features
- **Brief to Ads**: one brief â†’ multiple channels, formats, and tones.  
- **Channel presets** with **hard character limits** and field schemas (e.g., Google headlines 30 chars, descriptions 90; FB primary text, headline, description).  
- **Variant generation**: A/B/C per channel; tone sliders (professional â†” playful), angles (price, scarcity, social proof, pain relief).  
- **Compliance assistant**: flags risky wording (medical/financial claims, superlatives, banned words) and suggests compliant rewrites.  
- **Keyword and audience hooks**: insert keywords, pain points, benefits; dynamic keyword insertion (DKI) stubs for search.  
- **Creative hints**: autoâ€‘suggest image/video specs, hooks, and CTAs per platform.  
- **Localization**: translate + culturally adapt; multiâ€‘locale bundles.  
- **Tracking**: UTM builder + template library; shortlinks field.  
- **Analytics notes**: hypothesis + success metric template; preâ€‘filled A/B matrix.  
- **Exports**: CSV (bulk upload), JSON (API), PDF (creative sheet).  
- **Integrations**: **Social Caption Generator**, **Presentation Designer** (ad mockups), **Email Polisher** (drip followâ€‘ups), **Prompt Builder**, **Research Assistant** (audience/competitor insights).

### Key Pages
- `/ads` â€” Dashboard (recent campaigns)  
- `/ads/new` â€” Campaign brief wizard  
- `/ads/campaign/[id]` â€” Workspace: generate, edit, variants, checks  
- `/ads/export/[id]` â€” Export center (CSV/JSON/PDF)  
- `/ads/settings` â€” Brand voice, banned words, defaults

### Minimal Data Model
`Campaign`, `Brief`, `Persona`, `ChannelSpec`, `CreativeSet`, `Creative`, `ComplianceIssue`, `UTMTemplate`, `ExportJob`, `Tag`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Campaigns | 3 | Unlimited |
| Variants per channel | 2 | 10 |
| Localization | 1 locale | Multiple locales |
| Exports | CSV | CSV + JSON + PDF |
| Compliance check | Basic | Full w/ rewrite |
| Integrations | View-only | Oneâ€‘click pushes |
| History retention | 60 days | Unlimited |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives and Nonâ€‘Goals
**Objectives**
- Produce **uploadâ€‘ready** creatives tailored to each ad platform with **real limits** and **compliance hints**.  
- Accelerate experimentation via **multiâ€‘angle variants** and **clear A/B matrices**.  
- Keep **brand voice** consistent across locales/channels.

**Nonâ€‘Goals (v1)**
- No media asset generation (images/videos) â€” provide **spec suggestions** only.  
- No direct adâ€‘platform API pushes (v2).

---

### 2) Information Architecture and Routes

**Pages**
- `/ads` â€” Card list of campaigns; search, tags, status.  
- `/ads/new` â€” Brief wizard: product, audience, pain/benefit, offer, CTA, channels, locales, budget notes, KPIs.  
- `/ads/campaign/[id]` â€” Workspace: tabs for **Overview**, **Variants**, **Compliance**, **Localization**, **Settings**.  
- `/ads/export/[id]` â€” Export presets (Google CSV, Meta CSV, JSON bundle, PDF sheet).  
- `/ads/settings` â€” Brand voice and tone sliders; banned words; default UTMs; locales.

**API (SSR)**
- Campaigns/briefs:  
  - `POST /ads/api/campaign/create`  
  - `GET  /ads/api/campaign?id=`  
  - `POST /ads/api/campaign/update`  
  - `POST /ads/api/campaign/archive`
- Generation and editing:  
  - `POST /ads/api/generate` (brief â†’ multiâ€‘channel creative sets)  
  - `POST /ads/api/variant/add` `.../edit` `.../delete`  
  - `POST /ads/api/angle/apply` (price/scarcity/social proof/problem/benefit/testimonial/urgency)  
- Compliance and checks:  
  - `POST /ads/api/compliance/check`  
  - `POST /ads/api/compliance/auto_rewrite`
- Localization and voice:  
  - `POST /ads/api/localize` (targets locales, honor tone/voice)  
  - `POST /ads/api/voice/save`
- Tracking and export:  
  - `POST /ads/api/utm/apply`  
  - `POST /ads/api/export` (csv|json|pdf) Â· `GET /ads/api/export/status?id=`
- Specs and references:  
  - `GET  /ads/api/channelspec?platform=facebook|google|linkedin|x|tiktok|youtube`

Optional WebSocket `/ads/ws` for live characterâ€‘limit meters and autosave notices.

---

### 3) Channel Schemas and Limits (v1 Targets)

**Google Search/PMAX**
- Headlines (up to 15 Ã— **30 chars**), Descriptions (up to 4 Ã— **90 chars**), Path (2 Ã— 15), Final URL, Business name; optional callouts/sitelinks (v2).

**Meta (Facebook/Instagram)**
- Primary text (**125 rec**, hard trim > **2,200**), Headline (**40 rec**), Description (**30 rec**), CTA (enum).

**LinkedIn**
- Intro text (**150 rec**, hard ~**600**), Headline (**70 rec**), Description (**100 rec**), CTA (enum).

**X (Twitter)**
- Text (**280 chars**), optional headline for card (v2), URL.

**TikTok**
- Primary text (**34 chars** rec; hard ~**100**), Display name, CTA (enum), URL.

**YouTube (Video action / discovery text elements)**
- Headline (**15**), Long headline (**90**), Description (**70**).

> Implement **hard counters** + **recommended** hints; block save on hard exceed, warn on recommended exceed.

---

### 4) Generation Logic

- **Angles:** price/value, scarcity/urgency (FOMO), social proof (ratings, users), credibility (awards, certifications), painâ€‘relief, benefitâ€‘first, curiosity, comparison, guarantee.  
- **Tone sliders:** formal â†” friendly, playful â†” serious, minimalist â†” descriptive.  
- **Brand voice memory:** store 3â€“5 canonical phrases; avoid banned words; required disclaimers per industry (editable).  
- **Keyword insertion:** for Search; support `{KeyWord:Default}` stubs; ensure headline casing.  
- **CTA library:** â€œStart Free Trialâ€, â€œBook Demoâ€, â€œShop Nowâ€, â€œLearn Moreâ€, â€œGet Quoteâ€, â€œApply Nowâ€, â€œSubscribeâ€.  
- **Policy guardrails:** detect superlatives (â€œbestâ€, â€œ#1â€) and sensitive claims (health/finance/weight loss); suggest compliant substitutes.  
- **Creative hints:** per platform recommend asset ratios (e.g., 1:1, 4:5), safeâ€‘text zones, and video durations.

---

### 5) Data Model (Astro DB / SQL)

**Campaign**  
- `id` (uuid pk), `userId`, `name`, `objective` ('traffic'|'leads'|'sales'|'awareness'), `budgetNote` (text|null), `locales` (json), `channels` (json), `status` ('draft'|'ready'|'archived'), `createdAt`, `updatedAt`

**Brief**  
- `id` (pk), `campaignId` (fk), `product` (text), `audience` (json: personas), `painPoints` (json), `benefits` (json), `offer` (text), `cta` (text), `keywords` (json), `landingUrl` (text), `notes` (text)

**Persona**  
- `id` (pk), `campaignId` (fk), `name`, `demographics` (json), `goals` (json), `objections` (json), `tonePrefs` (json)

**ChannelSpec**  
- `id` (pk), `platform` ('google'|'facebook'|'instagram'|'linkedin'|'x'|'tiktok'|'youtube'), `fields` (json schema with limits), `recommendations` (json)

**CreativeSet** (per platform)  
- `id` (pk), `campaignId` (fk), `platform`, `angle` (enum), `tone` (json), `locale` (string 'en-US','ar-AE','ta-IN',...), `utms` (json), `status` ('draft'|'approved'), `score` (float|null)

**Creative** (individual asset)  
- `id` (pk), `setId` (fk), `field` ('headline'|'primary'|'description'|'path1'|'path2'|'cta'|...), `value` (text), `chars` (int), `policyFlags` (json), `notes` (text)

**ComplianceIssue**  
- `id` (pk), `setId` (fk), `severity` ('warn'|'block'), `message`, `location` (field ref), `suggestion` (text)

**UTMTemplate**  
- `id` (pk), `name`, `pattern` (`utm_source={platform}&utm_medium=cpc&utm_campaign={campaign}&utm_content={angle}-{variant}`)

**ExportJob**  
- `id` (pk), `campaignId` (fk), `format` ('csv'|'json'|'pdf'), `options` (json), `status` ('queued'|'running'|'done'|'error'), `url` (string|null), `createdAt`

**Tag**  
- `id` (pk), `name`, `color`

Indexes: `Campaign.userId`, `CreativeSet.campaignId`, `Creative.setId`, `ComplianceIssue.setId`.

---

### 6) UX / UI

- **Brief wizard** with smart defaults; inline examples.  
- **Workspace**: left sidebar (channels, locales); main canvas shows the **active platform** with fields + live char counters; right panel for **Angles/Tone/Compliance**.  
- **Variant table**: grid of A/B/C with scores and quick edit; copy row to clipboard.  
- **Compliance** tab: issues list with â€œapply safe rewriteâ€ buttons and explanations.  
- **Localization**: sideâ€‘byâ€‘side sourceâ†’target; cultural notes; numerals/date formats.  
- **Export center**: choose platform export schema; preview CSV/JSON columns.  
- Accessibility: keyboard nav; high contrast; RTL (Arabic), Indic scripts; reduced motion.

Shortcuts: `Ctrl/Cmd+Enter` generate, `Ctrl/Cmd+.` cycle angle, `Ctrl/Cmd+L` localize, `Ctrl/Cmd+E` export.

---

### 7) API Contracts (Examples)

**Create campaign**  
`POST /ads/api/campaign/create`  
```json
{ "name":"Ansiversa Pro Launch", "objective":"leads", "channels":["google","facebook","linkedin"], "locales":["en-US","ar-AE"] }
```
Res: `{ "campaignId":"cmp_101" }`

**Generate creatives**  
`POST /ads/api/generate`  
```json
{
  "campaignId":"cmp_101",
  "angles":["benefit","social_proof","scarcity"],
  "variantsPerChannel":3,
  "respectLimits":true
}
```
Res: `{ "sets":[{"platform":"google","locale":"en-US","angle":"benefit","items":[{"field":"headline","value":"Build 100 AI Miniâ€‘Apps Fast","chars":28}]}] }`

**Compliance check**  
`POST /ads/api/compliance/check`  
```json
{ "setId":"set_33" }
```
Res: `{ "issues":[{"severity":"warn","location":"headline","message":"Superlative 'best'"}] }`

**Localize**  
`POST /ads/api/localize`  
```json
{ "setId":"set_33", "targetLocale":"ar-AE", "keepBrandVoice":true }
```
Res: `{ "ok":true }`

**Apply UTM**  
`POST /ads/api/utm/apply`  
```json
{ "campaignId":"cmp_101", "templateId":"utm_default", "shortener":"none" }
```
Res: `{ "updated": 4 }`

**Export**  
`POST /ads/api/export`  
```json
{ "campaignId":"cmp_101", "format":"csv", "options":{"platform":"google"} }
```
Res: `{ "jobId":"e55" }`

---

### 8) Validation Rules

- Enforce **hard character limits** per platform/field; compute `chars` serverâ€‘side.  
- Required fields per platform must be present before export.  
- UTM pattern must resolve all placeholders.  
- Localization must preserve regulated terms from the brand glossary.  
- Block export if any `ComplianceIssue.severity == 'block'` unresolved.  
- CSVs must match the platformâ€™s column order/spec (unit tests for schema).

---

### 9) Plans and Limits

| Feature | Free | Pro |
|---|---|---|
| Campaigns | 3 | Unlimited |
| Variants/channel | 2 | 10 |
| Locales | 1 | Many |
| Exports | CSV | CSV/JSON/PDF |
| Compliance | Basic | Full + rewrite |
| History | 60 days | Unlimited |

Rate limits: `/generate` 60/day (Free) 400/day (Pro); `/localize` 40/day (Free) 300/day (Pro); `/export` 10/day.

---

### 10) Suggested File Layout

```
src/pages/ads/index.astro
src/pages/ads/new.astro
src/pages/ads/campaign/[id].astro
src/pages/ads/export/[id].astro
src/pages/ads/settings.astro

src/pages/ads/api/campaign/create.ts
src/pages/ads/api/campaign/index.ts
src/pages/ads/api/campaign/update.ts
src/pages/ads/api/campaign/archive.ts
src/pages/ads/api/generate.ts
src/pages/ads/api/variant/add.ts
src/pages/ads/api/variant/edit.ts
src/pages/ads/api/variant/delete.ts
src/pages/ads/api/angle/apply.ts
src/pages/ads/api/compliance/check.ts
src/pages/ads/api/compliance/auto_rewrite.ts
src/pages/ads/api/localize.ts
src/pages/ads/api/voice/save.ts
src/pages/ads/api/utm/apply.ts
src/pages/ads/api/export.ts
src/pages/ads/api/export/status.ts
src/pages/ads/api/channelspec.ts

src/components/ads/Workspace/*.astro
src/components/ads/Variants/*.astro
src/components/ads/Compliance/*.astro
src/components/ads/Export/*.astro
```

---

### 11) Future Enhancements (v2+)

- **Direct pushes** to Google Ads/Meta/LinkedIn via API connectors.  
- **Creative image generator** prompts and autoâ€‘crop with safeâ€‘zone overlays.  
- **Live policy updates** per platform; test account sandboxes.  
- **Performance feedback loop**: import results (CTR/CVR) to autoâ€‘rank angles and suggest next experiments.  
- **Audience research builder** using Research Assistant + web signals.  
- **Autoâ€‘landing page section drafts** based on winning angles.

---

**End of Requirements â€” Ready for Codex Implementation.**
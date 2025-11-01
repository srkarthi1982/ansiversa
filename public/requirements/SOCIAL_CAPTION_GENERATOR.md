# ðŸ“£ Social Caption Generator â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/social-caption-generator`  
**Category:** Writing and Creativity / Marketing  
**Stack:** Astro + Tailwind (islands where needed), Astro SSR API routes, Astro DB / Supabase  
**Goal:** Help users quickly **generate, A/B test, and localize** social media captions for multiple platforms with brand voice, hashtags, emojis, CTAs, and link tracking â€” ready to paste into their social tools.

> ðŸ” **Privacy:** Content may be processed by AI. Provide **ephemeral mode** (â€œdo not retain after outputâ€) and clearly mark any saved drafts.

---

## 1) Objectives and Nonâ€‘Goals

### Objectives
- Generate captions for **Instagram, X (Twitter), LinkedIn, Facebook, TikTok, YouTube (Shorts description), Pinterest**.  
- Enforce **platform constraints** (length, line breaks, links, hashtags) with live counters.  
- **Brand Voice profiles** (tone, phrases to use/avoid, emoji policy).  
- **Hashtag helper** (suggest, group, and rotate); **emoji suggestions** and **CTA builder**.  
- **A/B variants** (2â€“5) with quick scoring (clarity, punch, compliance).  
- **Localization/Translation** with localeâ€‘aware hashtags; RTL support.  
- **Campaigns** (group posts by theme/launch); track assets/links; export schedule CSV.  
- **UTM link builder** + (optional) link shortener placeholder field.  
- Export **CSV/MD/JSON**; copy-per-platform with formatting.

### Nonâ€‘Goals (v1)
- No direct publishing or scheduling to social networks (Phase 2).  
- No live trending hashtags or analytics ingestion (Phase 2).  
- No image/video editing (refer to other apps).

---

## 2) User Stories (Acceptance Criteria)

1. **Create Caption**
   - *As a user*, I enter a post idea and select target platforms; I get 2â€“5 caption variants.  
   - **AC:** `/social-caption-generator/api/generate` returns variants per platform with counters and compliance flags.

2. **Brand Voice**
   - *As a user*, I choose a brand voice (or create one) and regenerate captions.  
   - **AC:** Captions reflect tone, preferred vocabulary, and emoji policy.

3. **Hashtags and Emojis**
   - *As a user*, I get **hashtag suggestions** by topic + an option to create **hashtag sets** (reusable).  
   - **AC:** `/social-caption-generator/api/hashtags` returns ranked tags with counts (static heuristics v1). Emoji suggestions appear inline.

4. **CTA and Links**
   - *As a user*, I add a CTA from presets (â€œLearn moreâ€, â€œShop nowâ€, â€œApply todayâ€) and build a **UTM** tracking link.  
   - **AC:** `/social-caption-generator/api/utm` returns a full URL; characters counted accordingly.

5. **Localization**
   - *As a user*, I translate a chosen variant to selected languages while keeping brand voice.  
   - **AC:** `/social-caption-generator/api/translate` returns localized variants; RTL layout respected.

6. **A/B Compare**
   - *As a user*, I select 2 variants to compare sideâ€‘byâ€‘side with simple scores (clarity, engagement, compliance).  
   - **AC:** `/social-caption-generator/api/score` returns scores (0â€“100) + quick suggestions.

7. **Platform Presets**
   - *As a user*, I pick platformâ€‘specific options (e.g., LinkedIn no emojis; Instagram line breaks; X with 1â€“2 hashtags).  
   - **AC:** Presets are applied before generation and validated after edits.

8. **Export and Copy**
   - *As a user*, I export a **CSV** (platform, caption, hashtags, link, publish date) or copy a single version in platformâ€‘friendly formatting.  
   - **AC:** Newlines and special characters preserved; CSV opens in Google Sheets/Excel.

9. **Campaigns**
   - *As a user*, I create a **campaign** with multiple posts and due dates; export the batch to CSV/JSON.  
   - **AC:** `/social-caption-generator/api/campaign/save` persists items; `/social-caption-generator/api/campaign/export` returns files.

10. **Plan Gating**
    - Free: 20 generations/month, 1 brand voice, 2 hashtag sets, watermark on exports.  
    - Pro: unlimited generations (fairâ€‘use), unlimited brand voices and sets, no watermark, localization unlocked.

---

## 3) Information Architecture and Routes

- `/social-caption-generator` â€” Dashboard and quick generator  
- `/social-caption-generator/editor` â€” Full editor (variants, A/B, hashtags, voice, localization, UTM)  
- `/social-caption-generator/campaigns` â€” Campaign manager  
- `/social-caption-generator/templates` â€” Prompt templates (product launch, event, hiring, announcement)  
- `/social-caption-generator/view/[slug].astro` â€” Optional readâ€‘only share page

**API (SSR):**  
- `POST /social-caption-generator/api/create` (create draft/campaign item)  
- `POST /social-caption-generator/api/generate` (multiâ€‘platform variants)  
- `POST /social-caption-generator/api/hashtags` (suggest/curate sets)  
- `POST /social-caption-generator/api/translate`  
- `POST /social-caption-generator/api/score` (A/B scoring with heuristics)  
- `POST /social-caption-generator/api/utm` (build UTM link)  
- `POST /social-caption-generator/api/save` (patch; autosave)  
- `POST /social-caption-generator/api/campaign/save`  
- `POST /social-caption-generator/api/campaign/export` (csv/json/md)  
- `POST /social-caption-generator/api/export` (csv/json/md)  
- `POST /social-caption-generator/api/publish` (share page)  
- `POST /social-caption-generator/api/delete`  
- `POST /social-caption-generator/api/duplicate`

---

## 4) Database Model (Astro DB / SQL)

**User**  
- `id` (pk), `email` (unique), `plan`, `createdAt`

**BrandVoice**  
- `id` (pk), `userId` (fk), `name`, `tone` ('friendly'|'professional'|'playful'|'bold'|'minimal'),  
  `guidelines` (text), `preferred` (json), `avoid` (json), `emojiPolicy` ('none'|'light'|'rich'), `createdAt`

**HashtagSet**  
- `id` (pk), `userId` (fk), `name`, `tags` (json), `createdAt`

**CaptionDraft**  
- `id` (pk uuid), `userId` (fk), `title`, `slug` (unique per user), `status` ('draft'|'published'),  
  `idea` (text), `platforms` (json), `voiceId` (fk nullable),  
  `variants` (json), `chosen` (json), `hashtags` (json), `emojiHints` (json),  
  `utm` (json), `languages` (json), `counters` (json), `compliance` (json),  
  `lastSavedAt`, `publishedAt`, `createdAt`

**Campaign**  
- `id` (pk uuid), `userId` (fk), `title`, `description`, `items` (json list of {captionId|inline draft}), `startOn`, `endOn`, `createdAt`

**Asset** (optional link to media)  
- `id` (pk), `userId` (fk), `url`, `alt`, `platformHint` ('insta'|'x'|'linkedin'|'tiktok'|'youtube'|'fb'|'pin'), `createdAt`

### JSON Examples

**CaptionDraft.platforms**  
```json
["insta","x","linkedin"]
```

**CaptionDraft.variants** (per platform)  
```json
{
  "insta": [
    {"id":"v1","text":"Big news ðŸŽ‰ We just launched... #ansiversa #buildinpublic","tags":["ansiversa","buildinpublic"],"score":{"clarity":82,"compliance":100}},
    {"id":"v2","text":"Launching today! Tap to try â€” link in bio.","tags":["startup","product"],"score":{"clarity":76,"compliance":100}}
  ],
  "x": [
    {"id":"a1","text":"We just launched Ansiversa â€” 100 mini apps under one roof. Try it â†’ https://ansiversa.com","tags":["startup"],"score":{"clarity":88,"compliance":100}}
  ]
}
```

**CaptionDraft.utm**  
```json
{
  "base":"https://ansiversa.com",
  "source":"instagram",
  "medium":"social",
  "campaign":"launch_oct",
  "content":"hero_video_v1",
  "url":"https://ansiversa.com?utm_source=instagram&utm_medium=social&utm_campaign=launch_oct&utm_content=hero_video_v1"
}
```

---

## 5) Editor UI / Pages

### `/social-caption-generator` (Quick Generator)
- Input: **Post idea**, **Platforms**, **Brand Voice**, **Hashtag set**, **CTA**, **Link/UTM**.  
- Output: cards per platform with 2â€“5 variants, counters, **Copy** buttons, Regenerate.

### `/social-caption-generator/editor`
- **Left**: Variant list per platform + live counter + platform notes (limits, link rules).  
- **Center**: Active editor (inline text with hashtag/emoji suggestions + compliance flags).  
- **Right**: Brand Voice manager, Hashtag sets, CTA presets, UTM builder, Localization panel.  
- Toolbar: Generate, Translate, Score (A/B), Export, Publish; autosave status.

### `/social-caption-generator/campaigns`
- List and Kanban calendar; items show platform icons, due date, asset/link badges.  
- Export batch to CSV/JSON or MD brief.

### `/social-caption-generator/templates`
- Templates: Product Launch, Feature Update, Event, Hiring, Giveaway, Quote, Carousel.  
- â€œUse Templateâ€ pre-fills idea, CTA, platform presets.

### `/social-caption-generator/view/[slug]`
- Readâ€‘only share page with selected variants per platform; **Copy** buttons + QR (optional).

---

## 6) API Contracts

### `POST /social-caption-generator/api/create`
Req: `{ "title":"Launch Teaser", "platforms":["insta","x"] }`  
Res: `{ "id":"<uuid>", "slug":"launch-teaser" }`

### `POST /social-caption-generator/api/generate`
Req: `{ "idea":"We launched...", "platforms":["insta","x","linkedin"], "voiceId":"<id|null>", "cta":"learn_more", "hashtagSetId":"<id|null>", "maxVariants":3 }`  
Res: `{ "variants": {...per platform arrays...}, "counters": {...}, "compliance": {...} }`

### `POST /social-caption-generator/api/hashtags`
Req: `{ "topic":"startup launch", "platform":"insta", "limit":20 }`  
Res: `{ "tags": ["startup","buildinpublic","productlaunch", "..."] }`

### `POST /social-caption-generator/api/translate`
Req: `{ "text":"...", "to":["ar","hi","ta"], "keepTone":true }`  
Res: `{ "localized": [{"lang":"ar","text":"..."}, {"lang":"hi","text":"..."}] }`

### `POST /social-caption-generator/api/score`
Req: `{ "variantA":"...", "variantB":"...", "platform":"x" }`  
Res: `{ "scores": {"A":{"clarity":82,"compliance":100}, "B":{"clarity":77,"compliance":100}}, "suggestions":["Try a clearer CTA"] }`

### `POST /social-caption-generator/api/utm`
Req: `{ "base":"https://ansiversa.com", "source":"instagram", "medium":"social", "campaign":"launch_oct", "content":"hero_v1" }`  
Res: `{ "url":"https://ansiversa.com?utm_source=instagram&utm_medium=social&utm_campaign=launch_oct&utm_content=hero_v1" }`

### `POST /social-caption-generator/api/save`
Req: `{ "id":"<uuid>", "patch": { "path":"chosen.insta", "value": {"id":"v2","text":"..."} } }`  
Res: `{ "ok": true, "lastSavedAt":"<ISO>" }`

### `POST /social-caption-generator/api/export`
Req: `{ "id":"<uuid>", "format":"csv|json|md" }`  
Res: `{ "url": "/exports/Captions_Launch_Teaser.csv" }`

### `POST /social-caption-generator/api/campaign/save`
Req: `{ "id":"<uuid|null>", "campaign":{ "title":"Launch", "items":[{"captionId":"<uuid>","dueOn":"2025-10-29"}] } }`  
Res: `{ "id":"<uuid>", "ok": true }`

### `POST /social-caption-generator/api/campaign/export`
Req: `{ "id":"<uuid>", "format":"csv|json|md" }`  
Res: `{ "url": "/exports/Campaign_Launch.csv" }`

### `POST /social-caption-generator/api/publish`
Req: `{ "id":"<uuid>" }`  
Res: `{ "url": "/social-caption-generator/view/launch-teaser" }`

### `POST /social-caption-generator/api/delete`
Req: `{ "id":"<uuid>" }` â†’ `{ "ok": true }`  
### `POST /social-caption-generator/api/duplicate`
Req: `{ "id":"<uuid>" }` â†’ `{ "id":"<newUuid>" }`

---

## 7) Validation and Platform Notes (v1 defaults)

- **X (Twitter)**: recommend â‰¤ 280 chars; 0â€“2 hashtags; 1 link.  
- **Instagram**: â‰¤ ~2200 chars; line breaks allowed; 3â€“15 hashtags common; â€œlink in bioâ€ warning if URL included.  
- **LinkedIn**: recommend â‰¤ ~3000 chars; emojis optional; professional tone.  
- **TikTok**: â‰¤ ~2200 chars; hashtags relevant to video; avoid excessive links.  
- **YouTube (Shorts description)**: recommend â‰¤ 5000 chars; include hashtags near end.  
- **Facebook**: long captions allowed; keep first 125 chars punchy; hashtags optional.  
- **Pinterest**: â‰¤ ~500 chars recommended; keywords matter; links in destination URL, not caption.

General: strip double spaces; normalize line breaks; ensure URL-encoding for UTM. Counters must recalc after every edit.

---

## 8) Exports

- **CSV**: columns â†’ platform, caption, hashtags, link, UTM, language, due date.  
- **Markdown**: campaign brief with sections per platform.  
- **JSON**: machineâ€‘readable for import into tools.

---

## 9) Plans and Rate Limits

| Feature | Free | Pro |
|--------|------|-----|
| Generations / month | 20 | Unlimited (fairâ€‘use) |
| Brand Voices | 1 | Unlimited |
| Hashtag Sets | 2 | Unlimited |
| Localization | â€” | Yes |
| Exports | CSV/MD (watermark) | CSV/MD/JSON (no watermark) |
| Share Page | Watermark | No watermark |

Rate limit keys: `userId` + day for generate/translate; `userId` + month for exports.

---

## 10) Security and Privacy

- Drafts private by default; public share is optâ€‘in.  
- Sanitize user text; escape markdown on export; block script tags.  
- Do not log raw captions in production; store sizes and metrics only (configurable).

---

## 11) Analytics and Events

- `caption.create`, `caption.generate`, `caption.save`, `caption.translate`, `caption.score`,  
  `caption.export`, `caption.publish`, `caption.delete`, `caption.duplicate`, `campaign.save/export`.

---

## 12) Accessibility and UX

- Keyboard shortcuts (Generate = Cmd/Ctrl+Enter; Copy = Cmd/Ctrl+C).  
- Clear focus states; colorâ€‘blind safe counters and flags.  
- RTL support for Arabic in editor and preview.

---

## 13) Suggested File Layout

```
src/pages/social-caption-generator/index.astro
src/pages/social-caption-generator/editor.astro
src/pages/social-caption-generator/campaigns.astro
src/pages/social-caption-generator/templates.astro
src/pages/social-caption-generator/view/[slug].astro

src/pages/social-caption-generator/api/create.ts
src/pages/social-caption-generator/api/generate.ts
src/pages/social-caption-generator/api/hashtags.ts
src/pages/social-caption-generator/api/translate.ts
src/pages/social-caption-generator/api/score.ts
src/pages/social-caption-generator/api/utm.ts
src/pages/social-caption-generator/api/save.ts
src/pages/social-caption-generator/api/campaign/save.ts
src/pages/social-caption-generator/api/campaign/export.ts
src/pages/social-caption-generator/api/export.ts
src/pages/social-caption-generator/api/publish.ts
src/pages/social-caption-generator/api/delete.ts
src/pages/social-caption-generator/api/duplicate.ts

src/components/social-caption-generator/Editor/*.astro or .tsx
src/components/social-caption-generator/Variants/*.astro
src/components/social-caption-generator/Voice/*.astro
src/components/social-caption-generator/Hashtags/*.astro
src/components/social-caption-generator/UTM/*.astro
```

---

## 14) Future Enhancements (v2+)

- Social scheduling and direct publishing integrations.  
- Trending hashtag discovery and performance analytics.  
- Image ALTâ€‘text suggestions and thumbnail title helper (YouTube).  
- Team collaboration with approvals and comment threads.  
- AI â€œhookâ€ generator and firstâ€‘line scorers specific to each platform.

---

**End of Requirements â€” ready for Codex implementation.**
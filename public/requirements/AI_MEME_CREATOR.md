# ðŸ˜‚ AI Meme Creator â€” Full Requirements (Ansiversa)

This document includes a **Codexâ€‘friendly summary** and a **full technical specification** for implementing the AI Meme Creator mini app.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### Overview
**AI Meme Creator** lets users produce **instant, onâ€‘trend memes** from prompts, images, or templates. It supports classic formats (Drake Hotline, Distracted Boyfriend, Expanding Brainâ€¦), **custom image uploads**, **auto text layout**, **multiâ€‘panel comics**, **object labels**, **brandâ€‘safe filters**, and **batch creation** for campaigns. Export as **PNG/JPEG/WebP**, **MP4/GIF** for motion captions, and **square/vertical** sizes for social. Integrates with **Ad Copy Assistant** (campaign hooks), **Creative Title Maker** (caption brainstorming), and **Presentation Designer** (slide memes).

### Core Features
- **Template library** with search and trending tags; **custom upload** (transparent PNG/JPG/WebP).  
- **Smart text engine**: automatic font sizing, stroke/outline, text wrap, top/bottom captions, **objectâ€‘label arrows**, and **speech bubbles**.  
- **Prompt â†’ meme**: enter idea; generate suggested captions + pick a template automatically.  
- **Multiâ€‘panel and comics**: 2â€“6 panels; perâ€‘panel captions; grid layout; spacing/gutters.  
- **Style controls**: Impact/Anton/Inter, outline width, shadow, color theme, watermark logo, brand palette.  
- **Safety and brand mode**: profanity filter, sensitiveâ€‘topic guard, face blurring toggle.  
- **Batch mode**: create N variants for A/B tests; bulk export with filenames/UTM in caption.  
- **AI explain**: rationale for why a meme works; alt punchlines.  
- **Exports**: PNG/JPEG/WebP; GIF/MP4 for animated text; ZIP bundle; copy to clipboard (web).  
- **Integrations**: push to **Presentation Designer**, **Ad Copy Assistant**, **Social Caption Generator**.

### Key Pages
- `/meme` â€” Dashboard/library  
- `/meme/new` â€” Wizard (idea â†’ template â†’ captioning)  
- `/meme/project/[id]` â€” Canvas editor (layers, text, stickers, arrows)  
- `/meme/export/[id]` â€” Export center (PNG/GIF/MP4/ZIP)  
- `/meme/settings` â€” Defaults (brand fonts/colors, watermark, safety level)

### Minimal Data Model
`MemeProject`, `Template`, `Layer`, `Caption`, `Panel`, `Sticker`, `RenderJob`, `ExportJob`, `BrandPreset`, `Tag`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Projects | 5 | Unlimited |
| Batch variants | 3 | 30 |
| Multiâ€‘panel | Up to 3 | Up to 6 |
| Animated/GIF export | â€” | âœ… |
| Brand presets and watermark | 1 | Unlimited |
| Max export size | 1080px | 2048px |
| History retention | 30 days | Unlimited |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives and Nonâ€‘Goals
**Objectives**
- Provide a **fast, delightful** meme creation flow with **auto layout** and **safe defaults**.  
- Support **templates + custom images** and **multiâ€‘panel** storytelling.  
- Enable **batch generation** and **brandâ€‘safe** usage for marketing teams.

**Nonâ€‘Goals (v1)**
- No celebrity face swaps or deepfakes.  
- No public gallery feed (v2).  
- No external template scraping in v1 (ship with local curated set).

---

### 2) Information Architecture and Routes

**Pages**
- `/meme` â€” Library with search (by tag/template), filters (size, animated, multiâ€‘panel), and recent projects.  
- `/meme/new` â€” Wizard: choose **Template** or **Upload**; optionally enter a **prompt** to suggest captions and template.  
- `/meme/project/[id]` â€” Canvas with left sidebar (templates, stickers), main artboard, right sidebar (layers, properties, brand).  
- `/meme/export/[id]` â€” Export presets (PNG/WebP, GIF/MP4); ZIP batch.  
- `/meme/settings` â€” Brand fonts/colors, watermark logo position, default safety mode and profanity list.

**API (SSR)**
- Projects:  
  - `POST /meme/api/project/create`  
  - `GET  /meme/api/project?id=`  
  - `POST /meme/api/project/update`  
  - `POST /meme/api/project/archive`
- Templates and assets:  
  - `GET  /meme/api/template/list?query=&tag=`  
  - `POST /meme/api/template/create` (admin only)  
  - `POST /meme/api/upload` (image; validates dimensions and size)
- Generation and editing:  
  - `POST /meme/api/suggest` (prompt â†’ {template, captions})  
  - `POST /meme/api/caption/generate` (alt punchlines)  
  - `POST /meme/api/layer/add` `.../update` `.../delete` `.../reorder`  
  - `POST /meme/api/panel/add` `.../remove` `.../reflow`  
  - `POST /meme/api/brand/apply` (font/colors/watermark)
- Safety and checks:  
  - `POST /meme/api/safety/check` (profanity/sensitive topics/NSFW heuristic)  
  - `POST /meme/api/face/blur` (toggle and strength)
- Rendering and export:  
  - `POST /meme/api/render` (static)  
  - `POST /meme/api/animate` (caption entrance; bounce/fade/slide; perâ€‘panel timing)  
  - `POST /meme/api/export` (png|jpg|webp|gif|mp4|zip) Â· `GET /meme/api/export/status?id=`
- Brand presets: `POST /meme/api/brand/save` Â· `GET /meme/api/brand/list`

Optional WebSocket `/meme/ws` for render progress, live charâ€‘fit meter, and animation preview sync.

---

### 3) Canvas and Layout Engine

**Layers**: Background (image/template), Text (caption/speech bubble/object label), Sticker/Emoji, Shape (box/arrow/line), Watermark Logo.  
**Autoâ€‘fit text**: shrinkâ€‘toâ€‘fit within bounding box; **Impactâ€‘style outline** (stroke), shadow toggle; vertical and horizontal align.  
**Captions**: Top/Bottom classic, Freeâ€‘position, **speech bubble** with tail orientation, **object label** with arrow and anchor.  
**Multiâ€‘panel**: 2â€“6 panels; gutter, border radius, panel aspect options (1:1, 4:5, 9:16, 16:9).  
**Smart contrast**: automatic white/black text swap or add outline for legibility.  
**Snap and guides**: edges, center lines, equal spacing; **safe zones** for platform overlays.  
**Undo/Redo**, **duplicate**, **lock**, **group/ungroup** layers.

---

### 4) Caption Intelligence

- **Prompt assist**: given a scenario (`"When deploy fails on Friday"`), propose 5â€“15 punchlines and pick templates.  
- **Alt punchlines**: generate familyâ€‘friendly, sarcastic, wholesome, businessâ€‘safe variants.  
- **Pattern bank**: setups like *Expectation vs Reality*, *Drake Approves/Disapproves*, *Galaxy Brain*, *Two Buttons*, *Change My Mind*, *Surprised Pikachu* (generic placeholders for nonâ€‘copyrighted lookâ€‘alikes).  
- **Tone sliders**: wholesome â†” savage, corporate â†” casual, simple â†” absurd.  
- **Hashtag/Caption helper**: provide 3â€“8 post captions + 5â€“10 hashtags (handoff to Social Caption Generator).

> **Note:** Use **lookâ€‘alike, copyrightâ€‘safe templates** where necessary (generic compositions) and avoid using trademarked logos by default.

---

### 5) Data Model (Astro DB / SQL)

**MemeProject**  
- `id` (uuid pk), `userId`, `title`, `size` ('square'|'vertical'|'landscape'), `animated` (bool), `panels` (int), `brandPresetId` (fk|null), `status` ('draft'|'ready'|'archived'), `createdAt`, `updatedAt`

**Template**  
- `id` (pk), `name`, `tags` (json), `thumbnailUrl`, `backgroundUrl`, `composition` (json: default panels, layer positions), `copyrightSafe` (bool)

**Panel**  
- `id` (pk), `projectId` (fk), `index` (int), `bgUrl` (text|null), `color` (text|null)

**Layer**  
- `id` (pk), `projectId` (fk), `panelId` (fk), `type` ('text'|'sticker'|'shape'|'watermark'), `bounds` (json: x,y,w,h), `style` (json: font, size, color, stroke, shadow, align), `content` (json/text), `z` (int), `locked` (bool)

**Caption**  
- `id` (pk), `projectId` (fk), `panelId` (fk|null), `text` (text), `tone` (text), `safetyFlags` (json), `alt` (json)

**Sticker**  
- `id` (pk), `name`, `url`, `tags` (json), `license` (text)

**BrandPreset**  
- `id` (pk), `userId`, `name`, `fonts` (json), `colors` (json), `watermarkUrl` (text), `position` (json)

**RenderJob / ExportJob**  
- common: `id`, `projectId`, `type`, `options` (json), `status`, `url`, `createdAt`

**Tag**  
- `id` (pk), `name`, `color`

Indexes: `MemeProject.userId`, `Layer.projectId+panelId`, `Caption.projectId`, `Template.name`.

---

### 6) UX / UI

- **Canvas editor**: layers list, properties panel, alignment tools, color picker, font chooser, outline/shadow sliders, **charâ€‘fit meter**.  
- **Template picker** with live preview and tags; **Recently used** section.  
- **Batch mode**: table of N variants; quick edit captions; render queue view.  
- **Safety inspector**: flags risky text with oneâ€‘click safe rewrite; face blur toggle.  
- **Export center**: choose size, format, quality, file naming pattern, ZIP bundle.  
- Accessibility: keyboard shortcuts (move nudge, scale, rotate), high contrast, RTL text, reduced motion.

Shortcuts: arrows to nudge; `Shift`+arrows bigâ€‘nudge; `Ctrl/Cmd+D` duplicate; `Del` delete; `Ctrl/Cmd+G` group; `Ctrl/Cmd+Shift+A` autoâ€‘fit caption.

---

### 7) Rendering and Animation

- **Static render**: rasterize canvas at selected size (1x/2x) with PNG transparency when needed.  
- **Animated text**: perâ€‘caption entrance (fade, slide, bounce); duration per panel; loop flag for GIF; export **MP4 (H.264)** and **GIF**.  
- **Safe margins**: Instagram Stories (1080Ã—1920), Reels (safe text zones), YouTube (1280Ã—720), Twitter/X (1200Ã—675).  
- **Watermark**: optional brand logo with opacity and corner selection.

---

### 8) Safety, Copyright and Policy Guards

- **Profanity and sensitive topic filter** (userâ€‘configurable levels).  
- **Face blur** control (Gaussian or mosaic) for uploaded faces.  
- **Trademark/brand usage warning**; disallow default inclusion of known logos.  
- **Template sourcing**: use **copyrightâ€‘safe, lookâ€‘alike** graphics for famous formats.  
- **Report reasons** for blocked exports and provide **safe rewrites**.

---

### 9) API Contracts (Examples)

**Create project**  
`POST /meme/api/project/create`  
```json
{ "title":"Deploy Friday", "size":"square", "animated":false, "panels":1 }
```  
Res: `{ "projectId":"mp_77" }`

**Suggest from prompt**  
`POST /meme/api/suggest`  
```json
{ "prompt":"When the CI passes locally but fails on prod", "tone":"wholesome" }
```
Res: `{ "template":"two_buttons_lookalike", "captions":["Local âœ… / Prod âŒ", "works_on_my_machine()"] }`

**Add caption layer**  
`POST /meme/api/layer/add`  
```json
{ "projectId":"mp_77", "panelId":"p_1", "type":"text", "bounds":{"x":0.1,"y":0.05,"w":0.8,"h":0.2}, "style":{"font":"Impact","stroke":4,"align":"center"}, "content":"WHEN CI PASSES LOCALLY" }
```
Res: `{ "layerId":"l_12" }`

**Render and export**  
`POST /meme/api/render` â†’ `{ "renderId":"r_9" }`  
`POST /meme/api/export`  
```json
{ "projectId":"mp_77", "format":"png", "options":{"size":1080,"quality":0.9,"zip":false} }
```
Res: `{ "jobId":"e_22" }`

**Safety check**  
`POST /meme/api/safety/check` â†’ `{ "issues":["profanity_flag"], "suggest":"replace with 'heck'"] }`

---

### 10) Validation Rules

- Max canvas size Free 1080px, Pro 2048px; animated exports only for Pro.  
- Caption text length must fit within bounds after autoâ€‘fit; block if still overflowing.  
- Uploaded images: â‰¤ 15 MB Free, 50 MB Pro; supported mime types: PNG/JPEG/WebP.  
- No logos/celebrity likenesses in templates by default; warn on upload.  
- Batch exports limited to 10 (Free) / 100 (Pro) per job.

---

### 11) Plans and Limits

| Feature | Free | Pro |
|---|---|---|
| Projects | 5 | Unlimited |
| Batch variants | 3 | 30 |
| Multiâ€‘panel | Up to 3 | Up to 6 |
| Animated export | â€” | GIF/MP4 |
| Brand presets | 1 | Unlimited |
| Max size | 1080px | 2048px |
| Exports/day | 10 | 100 |
| History retention | 30 days | Unlimited |

Rate limits: `/suggest` 120/day (Free) 600/day (Pro); `/render` 60/day (Free) 400/day (Pro).

---

### 12) Suggested File Layout

```
src/pages/meme/index.astro
src/pages/meme/new.astro
src/pages/meme/project/[id].astro
src/pages/meme/export/[id].astro
src/pages/meme/settings.astro

src/pages/meme/api/project/create.ts
src/pages/meme/api/project/index.ts
src/pages/meme/api/project/update.ts
src/pages/meme/api/project/archive.ts
src/pages/meme/api/template/list.ts
src/pages/meme/api/template/create.ts
src/pages/meme/api/upload.ts
src/pages/meme/api/suggest.ts
src/pages/meme/api/caption/generate.ts
src/pages/meme/api/layer/add.ts
src/pages/meme/api/layer/update.ts
src/pages/meme/api/layer/delete.ts
src/pages/meme/api/layer/reorder.ts
src/pages/meme/api/panel/add.ts
src/pages/meme/api/panel/remove.ts
src/pages/meme/api/panel/reflow.ts
src/pages/meme/api/brand/apply.ts
src/pages/meme/api/safety/check.ts
src/pages/meme/api/face/blur.ts
src/pages/meme/api/render.ts
src/pages/meme/api/animate.ts
src/pages/meme/api/export.ts
src/pages/meme/api/export/status.ts

src/components/meme/Canvas/*.astro
src/components/meme/Properties/*.astro
src/components/meme/TemplatePicker/*.astro
src/components/meme/Batch/*.astro
src/components/meme/Safety/*.astro
```

---

### 13) Future Enhancements (v2+)

- **Template marketplace** (creator submissions with moderation).  
- **Autoâ€‘background remover** for uploads.  
- **Sticker packs** with seasonal content.  
- **Live social posting** via platform APIs.  
- **Promptâ€‘toâ€‘image** gen (with strong content guardrails).  
- **Collaboration and comments**; team watermark per user.

---

**End of Requirements â€” Ready for Codex Implementation.**
# ðŸ§¼ Image Background Remover â€” Full Requirements (Ansiversa)

Codexâ€‘ready specification for building the **Image Background Remover** mini app.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### What it does
Removes or replaces image backgrounds with **highâ€‘quality cutâ€‘outs** using **AI matting** + optional **classical refinements**. Supports **single & batch uploads**, **transparent PNG/WebP export**, **solid/gradient/color/blur backgrounds**, **custom backdrops**, **edge refinement (hair/fur)**, **shadow synthesis**, and **subjectâ€‘only downloads**. Integrates with **File Converter**, **Visiting Card Maker**, **Presentation Designer**, and **Snippet Generator** (image URLs in snippets).

### Core Features
- **Segmentation models**: general subject, portrait/hair, product (clean edges), document (white background cleanup).  
- **Refinement**: trimap brushing (keep/remove/unknown), edge feather %, smart dehalo, matting radius, defringe, hair detail boost.  
- **Postâ€‘processing**: add drop shadow/long shadow, ambient occlusion fake, background blur/gradient/solid, perspective floor, border radius, stroke/outline, autoâ€‘center & scale.  
- **Batch**: multiâ€‘file queue with perâ€‘item overrides, presets, progress.  
- **Input types**: PNG, JPG, WebP, HEIC*, TIFF.  
- **Output**: PNG (transparent), WebP (lossy/lossless), JPG (on solid bg), SVG mask (optional), mask alpha PNG, `.zip` for batch.  
- **Canvas tools**: move/scale/rotate subject, crop ratios (1:1, 3:4, 4:3, 9:16, custom), smart fit for marketplaces (Amazon/Etsy/eBay).  
- **Color management**: sRGB enforce, ICC strip/keep, 300 DPI option for print.  
- **Safety**: max resolution & size caps, EXIF removal, face blurring toggle, NSFW block (basic).

*HEIC support can be delegated to File Converter if not native.

### Key Pages
- `/bgremove` â€” Workspace (Upload â†’ Editor â†’ Export)  
- `/bgremove/new` â€” Quick preset builder  
- `/bgremove/history` â€” Batches & presets used  
- `/bgremove/settings` â€” Defaults (export type, DPI, shadows, safety caps)

### Minimal Data Model
`BGJob`, `BGItem`, `Preset`, `Mask`, `ResultAsset`, `Profile`, `RateLimit`, `Tag`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Max input resolution | 4 MP | 36 MP |
| Batch items/job | 5 | 200 |
| Presets | 3 | Unlimited |
| HEIC/TIFF | â€” | âœ… |
| SVG mask export | â€” | âœ… |
| Smart shadow | Basic | Advanced (AO + direction) |
| History retention | 30 days | Unlimited |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives & Nonâ€‘Goals
**Objectives**
- Deliver **clean, productionâ€‘ready cutâ€‘outs** with quick defaults and **proâ€‘level controls** when needed.  
- Ensure **repeatable results** via presets and nonâ€‘destructive edits.  
- Keep processing **fast, safe, and privacyâ€‘aware**.

**Nonâ€‘Goals (v1)**
- Not a full Photoshop replacement; no multiâ€‘layer compositing beyond 1 subject + 1 background layer.  
- No generative fill in v1 (can be v2).

---

### 2) Information Architecture & Routes

**Pages**
- `/bgremove` â€” Upload area, queue list, editor canvas, rightâ€‘side controls (Background, Mask, Effects, Export).  
- `/bgremove/new` â€” Preset wizard.  
- `/bgremove/history` â€” Past jobs with filters.  
- `/bgremove/settings` â€” Defaults, safety, color mgmt, marketplace kits.

**API (SSR)**
- Jobs: `POST /bgremove/api/job/create` Â· `GET /bgremove/api/job?id=` Â· `POST /bgremove/api/job/cancel` Â· `GET /bgremove/api/job/list`  
- Items: `POST /bgremove/api/item/add` Â· `POST /bgremove/api/item/remove` Â· `POST /bgremove/api/item/override`  
- Run: `POST /bgremove/api/run` (start workers) Â· `GET /bgremove/api/progress?id=`  
- Mask: `POST /bgremove/api/mask/generate` Â· `POST /bgremove/api/mask/refine` (points/brush/trimap) Â· `GET /bgremove/api/mask/get?id=`  
- Export: `POST /bgremove/api/export` (png|webp|jpg|zip|svg-mask|alpha-png) Â· `GET /bgremove/api/export/status?id=`  
- Presets: `POST /bgremove/api/preset/save` Â· `POST /bgremove/api/preset/delete` Â· `GET /bgremove/api/preset/list`  
- Settings: `POST /bgremove/api/settings/save`  
- Safety: `POST /bgremove/api/safety/scan` (nsfw|pii|exif)

Optional WebSocket `/bgremove/ws` for live progress and canvas state sync.

---

### 3) Editing Controls

- **Background**: transparent, solid color, gradient (linear/radial), blur (Gaussian), custom image upload, preset backdrops (paper, studio, abstract), marketplace size templates.  
- **Mask/Matting**: sliders (threshold, feather, dehalo, radius), **Refine hair/fur** checkbox, edge color decontamination.  
- **Canvas**: crop (1:1, 4:5, 5:4, 16:9, 9:16, 3:2), snap to center, padding % controls, grid overlay, safe area for marketplaces.  
- **Effects**: drop shadow (angle, distance, softness, opacity), long shadow, outline/stroke (px & color), background noise (subtle), perspective floor fake (size/blur).  
- **Color mgmt**: enforce sRGB, keep/strip ICC; DPI entry for export.  
- **Face tools** (optional): blur faces (privacy) toggle.  
- **Batch overrides**: perâ€‘item background color/image, crop preset, outline thickness.

---

### 4) Presets

A **Preset** captures: `segModel`, `refine{feather,dehalo,radius,hairBoost}`, `bg{type,color,gradient,blur,image}`, `effects{shadow:{...},outline:{...}}`, `canvas{size,ratio,pad}`, `export{format,quality,dpi,icc}`, `marketplaceTemplate`.

Builtâ€‘ins:
- **Simple Transparent** (default).  
- **Product White** (255,255,255 bg, light shadow).  
- **Portrait Soft Gray** (bg #F5F5F5, subtle AO).  
- **Marketplace Amazon Main** (2000Ã—2000, white, centered, 85% fill).  
- **Social Story 9:16** (gradient + blur).

---

### 5) Data Model (Astro DB / SQL)

**BGJob**  
- `id` (uuid pk), `userId`, `presetId` (fk|null), `status` ('queued'|'running'|'done'|'error'|'canceled'), `stats` (json:{items,ok,fail}), `createdAt`, `updatedAt`

**BGItem**  
- `id` (pk), `jobId` (fk), `srcName` (text), `srcType` (mime), `w` (int), `h` (int), `ops` (json), `status` ('queued'|'running'|'done'|'error'|'skipped'), `progress` (float), `error` (text|null)

**Preset**  
- `id` (pk), `userId`, `name`, `recipe` (json), `public` (bool)

**Mask**  
- `id` (pk), `itemId` (fk), `url` (text), `format` ('alpha-png'|'svg'), `meta` (json:{feather,threshold})

**ResultAsset**  
- `id` (pk), `jobId` (fk), `itemId` (fk), `filename` (text), `mime` (text), `size` (int), `url` (text), `meta` (json:{bg,effects,canvas,export})

**Profile**  
- `id` (pk), `userId`, `defaults` (json:{export,icc,dpi,shadow}), `limits` (json)

**RateLimit**  
- `id` (pk), `userId`, `window` (text), `counts` (json)

**Tag**  
- `id` (pk), `name`, `color`

Indexes: `BGItem.jobId+status`, `ResultAsset.jobId`, `BGJob.userId+createdAt`.

---

### 6) UX / UI

- **Threeâ€‘panel layout**: left (queue & history), center (canvas), right (controls).  
- **Brush tools**: keep/remove/unknown with size & hardness; undo/redo; zoom/pan; quick mask toggle.  
- **Preview toggles**: transparency checkerboard, solid fill, different backdrops.  
- **Export drawer**: format, quality, DPI, ICC, filename pattern (`{name}_{preset}`), batch ZIP.  
- **Accessibility**: keyboard shortcuts, highâ€‘contrast UI, tooltips, screenâ€‘reader labels.

Shortcuts: `B` brush, `E` eraser, `X` toggle keep/remove, `Cmd/Ctrl+=` zoom in, `Cmd/Ctrl+-` zoom out, `Space` pan, `Cmd/Ctrl+Enter` export current, `Shift+Enter` export all.

---

### 7) Validation & Safety

- Enforce max resolution by plan; downscale with warning if exceeded.  
- Only allow images (block executables, archives).  
- Strip EXIF/GPS by default; allow keepâ€‘date toggle.  
- NSFW/violent content detector (basic) â†’ block or warn.  
- Color profile handling: convert to sRGB for web unless user keeps ICC.  
- Retention: purge assets after planâ€‘based window; allow immediate purge.

---

### 8) Plans & Limits

| Feature | Free | Pro |
|---|---|---|
| Max input resolution | 4 MP | 36 MP |
| Batch items/job | 5 | 200 |
| ZIP downloads/day | 5 | 50 |
| HEIC/TIFF | â€” | âœ… |
| SVG mask | â€” | âœ… |
| History | 30 days | Unlimited |

Rate limits: `/run` 20 images/day (Free) 2,000/day (Pro); `/export` 50/day (Free) 5,000/day (Pro).

---

### 9) Suggested File Layout

```
src/pages/bgremove/index.astro
src/pages/bgremove/new.astro
src/pages/bgremove/history.astro
src/pages/bgremove/settings.astro

src/pages/bgremove/api/job/create.ts
src/pages/bgremove/api/job/index.ts
src/pages/bgremove/api/job/cancel.ts
src/pages/bgremove/api/job/list.ts
src/pages/bgremove/api/item/add.ts
src/pages/bgremove/api/item/remove.ts
src/pages/bgremove/api/item/override.ts
src/pages/bgremove/api/run.ts
src/pages/bgremove/api/progress.ts
src/pages/bgremove/api/mask/generate.ts
src/pages/bgremove/api/mask/refine.ts
src/pages/bgremove/api/mask/get.ts
src/pages/bgremove/api/export.ts
src/pages/bgremove/api/export/status.ts
src/pages/bgremove/api/preset/save.ts
src/pages/bgremove/api/preset/delete.ts
src/pages/bgremove/api/preset/list.ts
src/pages/bgremove/api/settings/save.ts

src/components/bgremove/Canvas/*.astro
src/components/bgremove/Controls/*.astro
src/components/bgremove/Queue/*.astro
src/components/bgremove/Export/*.astro
```

---

### 10) Worker Notes (Implementation Hints for Codex)

- Pipeline: `detect subject â†’ segment â†’ matte â†’ refine (trimap/brush) â†’ compose background â†’ effects â†’ export`.  
- Keep models pluggable (portrait/product/document).  
- Use **tiling** for large images to limit memory; process on workers; stream results.  
- Save masks separately for nonâ€‘destructive reâ€‘edits; include in ZIP.  
- Ensure deterministic preset application; include preset snapshot in ResultAsset.meta.

---

### 11) Future Enhancements (v2+)

- **Generative background** (textâ€‘toâ€‘image) with safety filter.  
- **Multiâ€‘subject** selection; object reâ€‘arrange.  
- **Edgeâ€‘aware superâ€‘resolution** upscaler.  
- **Auto product alignment** for marketplace rules.  
- **Mobile quick tool** for onâ€‘device cutâ€‘outs.

---

**End of Requirements â€” Ready for Codex Implementation.**
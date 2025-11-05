# ðŸ–¼ï¸ Screenshot Editor â€” Full Requirements (Ansiversa)

Codexâ€‘ready specification for building the **Screenshot Editor** mini app. Target stack: **Astro (SSR)** + **Tailwind** + **Alpine.js** + **Astro DB**, deployed on **Vercel**. Privacyâ€‘first; runs most edits in the browser; supports redaction, annotations, device frames, and export presets for app stores and social media.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### What it does
Import or paste a screenshot and quickly **annotate**, **redact**, **blur**, **highlight**, **crop/resize**, and **export** in common formats and **storeâ€‘ready presets** (App Store / Google Play). Includes **layers**, **history/undo**, **smart tools** (autoâ€‘redact detected emails/phones), **device frames**, **margins/backgrounds**, and **batch exports**.

### Core Features
- Import: file upload, **paste from clipboard**, dragâ€‘drop, **URL fetch** (server proxy), multiâ€‘page PDF â†’ pages as images.  
- Edit tools: **Crop**, **Resize**, **Rotate/Flip**, **Canvas size** (with background), **Rounded corners**, **Drop shadow**.  
- Annotations: **Text**, **Arrow**, **Line**, **Rectangle/Ellipse**, **Callout/Sticky note**, **Highlighter**, **Pen**, **Step number** (autoâ€‘increment), **Stamp** (Done/Warning/Info).  
- Redaction: **Blur**, **Pixelate**, **Solid block**, **Smart redact** (auto detect emails, phones, faces â€” client first; server optional).  
- Effects: **Mosaic**, **Spotlight** (darken outside region), **Drop shadow**, **Outline/Stroke**, **Background blur**.  
- Device Frames & Mockups: iPhone/Android/Laptop/Browser chrome; **safe area guides**; captions.  
- Presets: sizes for **App Store**, **Google Play**, **Twitter/X**, **LinkedIn**, **Instagram**, **YouTube thumbnail**; custom presets.  
- Export: **PNG**, **JPEG**, **WebP**, **PDF**; **copy to clipboard**; **batch export** (multiple sizes/backgrounds).  
- Layers: reorder, lock, hide, group; **snap to grid/guides**; alignment tools.  
- History: undo/redo; **version snapshots** with notes.  
- Accessibility: keyboard shortcuts, highâ€‘contrast UI, screenâ€‘reader labels.  
- Integrations: use **Image Background Remover** for cutouts (optional); send to **Presentation Designer** or **Blog Writer**.

### Key Pages
- `/shot` â€” Editor: canvas + tools + layers + export.  
- `/shot/presets` â€” Manage export and canvas presets.  
- `/shot/batch` â€” Batch export/resize/format on a set of images.  
- `/shot/projects/[id]` â€” Project dashboard (assets, versions).  
- `/shot/settings` â€” Defaults (fonts/colors), privacy, grid/ruler.

### Minimal Data Model
`ShotProject`, `ShotImage`, `ShotLayer`, `ShotPreset`, `ShotExport`, `ShotVersion`, `Asset`, `Profile`, `Quota`, `ShareLink`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Max image size | 4K | 8K |
| Smart redact (auto detect) | basic | advanced (faces + OCR hints) |
| Device frames | limited | full gallery + custom |
| Batch export | â€” | âœ… |
| PDF export | âœ… (single) | âœ… (multi with vector text) |
| Versions per project | 5 | 100 |
| Share links | 5 active | 100 active |
| Cloud assets | 200 MB | 10 GB |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Information Architecture & Routes

**Pages**
- `/shot` â€” Editor with canvas, toolbars (top/left), right panel (layers/properties), bottom (zoom/history).  
- `/shot/presets` â€” Preset manager (create/edit/delete); import/export JSON.  
- `/shot/batch` â€” Drop multiple images â†’ select preset(s) â†’ run â†’ ZIP.  
- `/shot/projects/[id]` â€” List images, versions, exports; open in editor.  
- `/shot/settings` â€” Theme, default font/size/colors, grid/ruler/snapping, privacy defaults.

**API (SSR)**
- `POST /shot/api/project/save` Â· `GET /shot/api/project/get?id=`  
- `POST /shot/api/image/upload` (multipart) â†’ returns `imageId`  
- `POST /shot/api/image/fetch` (url) â†’ fetch via server and store (CORS safe)  
- `POST /shot/api/export` â†’ returns artifact(s)  
- `GET /shot/api/export/download?id=&fmt=png|jpg|webp|pdf`  
- `POST /shot/api/preset/save` Â· `POST /shot/api/preset/delete` Â· `GET /shot/api/preset/list`  
- `POST /shot/api/share/create` Â· `POST /shot/api/share/revoke` Â· `GET /shot/api/share/get?id=`

**Workers / Queue**
- `shot:export` â€” serverâ€‘side export for big canvases or batches; returns ZIP/artifacts.  
- `shot:cleanup` â€” delete expired artifacts per retention/quota.

---

### 2) Canvas & Rendering

- Use **HTML5 Canvas** + **SVG overlay** for crisp vector annotations.  
- Keep edits as **layer graph** (objects with properties) â€” nonâ€‘destructive; rasterize only on export.  
- Zoom: 10%â€“800%; pan with Space+drag; pixel preview at high zoom.  
- Grid/ruler: configurable units (px), **snap to** grid/guides and object bounds.  
- Guides: safe areas and device aspect ratios; show bleed/margins for store presets.

**Layer Types**: Background, Image, Text, Shape (rect/ellipse/line/arrow/callout), Redaction (blur/pixelate/solid), Highlight, StepNumber, Sticker/Stamp, Overlay (spotlight).

**Properties (examples)**: x, y, w, h, rotation, opacity, fill, stroke, radius, blur size, pixel size, font family/weight/size, align, shadow, zâ€‘index, locked, hidden, meta (tag).

---

### 3) Tools & Smart Features

- **Crop/Resize**: fixed aspect (1:1, 16:9, 9:16, 4:3), freeform, **contentâ€‘aware padding** (v2).  
- **Text**: fonts (system + bundled), styles (bold/italic), shadow, background, auto contrast.  
- **Arrows/Shapes**: arrowheads, thickness, dashed lines, corner radius.  
- **Step Number**: sequential circles/squares; auto increment; theme presets.  
- **Highlighter**: additive blend; adjustable softness.  
- **Redaction**: blur/pixelate/solid; **smart suggestion**: detect emails, phone numbers, credit cards via regex + OCR; face boxes via onâ€‘device model (e.g., BlazeFace).  
- **Spotlight**: darken outside selected region; adjustable vignette.  
- **Mockups**: add device/browser frame; scale to fit; notch safe area.  
- **Backgrounds**: solid color, gradient, pattern, or **transparent**; canvas shadow & rounded corners.  
- **Measure tool**: distance/pixel values between points; color picker (eyedropper).  
- **Magic erase (v2)**: contentâ€‘aware fill using WebGL/WASM if feasible.

---

### 4) Presets & Exports

**Builtâ€‘in Presets**
- **App Store**: 6.7" iPhone (1290Ã—2796), 6.1" iPhone (1179Ã—2556), 12.9" iPad (2048Ã—2732).  
- **Google Play**: Phone (1080Ã—1920), 7â€‘inch tablet (600Ã—1024), 10â€‘inch tablet (800Ã—1280).  
- **Social**: Twitter/X post (1200Ã—675), LinkedIn (1200Ã—627), Instagram post (1080Ã—1080), Story (1080Ã—1920), YouTube thumbnail (1280Ã—720).  
- **General**: 4K UHD (3840Ã—2160), 1440p, 1080p, 1Ã—/2Ã— web banners.

**Export Options**
- Format: PNG (transparent), JPEG (quality slider), WebP (lossless/lossy), PDF (vector text where possible).  
- Background: transparent/solid/gradient/pattern; include **device frame** and **drop shadow**.  
- Margins: inner padding; outer canvas; **auto center**.  
- Metadata: strip EXIF; include **watermark** (Pro) or **brand footer** (Ansiversa).  
- Batch: multiâ€‘preset selection; ZIP; filename templating (`{project}_{preset}_{index}`).  
- Clipboard: copy rendered image to system clipboard.

---

### 5) Data Model (Astro DB / SQL)

**ShotProject**  
- `id` (uuid pk), `userId` (fk), `name` (text), `description` (text|null), `createdAt`, `updatedAt`

**ShotImage**  
- `id` (pk), `projectId` (fk|null), `path` (text), `width` (int), `height` (int), `bytes` (int), `mime` (text), `createdAt`

**ShotLayer**  
- `id` (pk), `imageId` (fk), `type` (text), `props` (json), `z` (int), `locked` (bool), `hidden` (bool), `createdAt`, `updatedAt`

**ShotPreset**  
- `id` (pk), `userId` (fk|null), `name` (text), `config` (json:{size,background,frame,margin,watermark}), `createdAt`

**ShotVersion**  
- `id` (pk), `imageId` (fk), `note` (text|null), `snapshot` (json), `createdAt`

**ShotExport**  
- `id` (pk), `imageId` (fk), `presetId` (fk|null), `fmt` (text), `path` (text), `bytes` (int), `createdAt`

**Asset**  
- `id` (pk), `userId` (fk), `kind` ('font'|'frame'|'sticker'|'pattern'), `name` (text), `path` (text), `meta` (json), `createdAt`

**ShareLink**  
- `id` (pk), `imageId` (fk), `token` (text unique), `expiresAt` (datetime|null), `oneTime` (bool), `createdAt`

Indexes: `ShotLayer.imageId+z`, `ShotExport.imageId+createdAt`, `ShareLink.token`, `Asset.userId+kind`.

---

### 6) UX / UI

- **Left toolbar**: Move/Select, Crop, Text, Arrow, Shape, Highlighter, Redact, Step#, Spotlight, Eyedropper, Measure, Frame, Background.  
- **Top bar**: Undo/Redo, Zoom %, Canvas size, Preset, Export, Share.  
- **Right panel**: Layers list (drag reorder, lock/hide, group), Properties (color, stroke, shadow, opacity, blur, fonts), Alignment tools.  
- **Bottom**: Zoom slider, History timeline (snapshots), File info.  
- **Keyboard**:  
  - `V` move, `C` crop, `T` text, `A` arrow, `R` rectangle, `O` ellipse, `H` highlighter, `B` blur, `P` pixelate, `S` step, `G` grid toggle.  
  - `Cmd/Ctrl+Z` undo, `Shift+Cmd/Ctrl+Z` redo, `Cmd/Ctrl+G` group, `Cmd/Ctrl+Shift+G` ungroup, `âŒ˜/Ctrl+C` copy layer.  
  - `Shift` for constrain, `Alt` to duplicate on drag.

---

### 7) Processing Strategy

- **Clientâ€‘first** rendering with Canvas/SVG; use **OffscreenCanvas/WebWorker** for heavy filters.  
- **WASM** filters for blur/pixelate/mosaic if needed for performance; fallback to Canvas.  
- Server export path for very large canvases or batch ZIP using `sharp`/`resvg` and `pdfkit`.  
- OCR (for smart redact) via lightweight onâ€‘device OCR (Tesseract WASM) for short texts; **server optional** for long/Arabic if needed (respect privacy).  
- Face detection via onâ€‘device models; never send image off device unless user enables server OCR.

---

### 8) Security, Privacy & Limits

- Default to **clientâ€‘side** editing; server used only for fetch/export/large images.  
- Never store images unless user saves/exports; ephemeral canvas state otherwise.  
- Tokenized share links; optional **oneâ€‘time** view; revoke anytime.  
- Strip metadata on export; warn if sensitive data is detected by smart redact.  
- Limits: Free up to **4K** images and 200 MB cloud assets; Pro up to **8K** and 10 GB.  
- Rate limit server endpoints; virus scan disabled (images only), validate MIME/sniff magic numbers.

---

## ðŸ§© PART 3 â€” TECH NOTES (for Codex)

### Suggested File Layout

```
src/pages/shot/index.astro
src/pages/shot/presets.astro
src/pages/shot/batch.astro
src/pages/shot/projects/[id].astro
src/pages/shot/settings.astro

src/pages/shot/api/project/save.ts
src/pages/shot/api/project/get.ts
src/pages/shot/api/image/upload.ts
src/pages/shot/api/image/fetch.ts
src/pages/shot/api/export.ts
src/pages/shot/api/export/download.ts
src/pages/shot/api/preset/save.ts
src/pages/shot/api/preset/delete.ts
src/pages/shot/api/preset/list.ts
src/pages/shot/api/share/create.ts
src/pages/shot/api/share/revoke.ts
src/pages/shot/api/share/get.ts

src/lib/shot/canvas.ts              # canvas/SVG engine
src/lib/shot/layers.ts              # layer graph & transforms
src/lib/shot/filters.ts             # blur/pixelate/mosaic
src/lib/shot/ocr.ts                 # OCR helpers (WASM)
src/lib/shot/face.ts                # face detect (on-device)
src/lib/shot/presets.ts             # built-in presets
src/lib/shot/export.ts              # render â†’ png/jpg/webp/pdf
```

### Pseudocode: Export
```ts
// /shot/api/export.ts
const { imageId, presetId, fmt } = await readJson(request);
const image = await db.image.get(imageId);
const layers = await db.layers.list(imageId);
const canvas = renderServer(image, layers, preset);
const artifact = await writeArtifact(canvas, fmt);
return json({ ok: true, exportId: artifact.id });
```

### Pseudocode: Smart Redact (client)
```ts
const textBoxes = await ocrDetect(canvasRegion);
const matches = textBoxes.filter(t => /\b\+?\d{7,}\b|[A-Z0-9._%+-]+@[A-Z0-9.-]+/i.test(t.text));
for (const m of matches) addRedactionLayer(m.bbox, { mode:'pixelate', size: 12 });
```

---

## âœ… ACCEPTANCE CRITERIA

- [ ] Paste/dragâ€‘drop works; editor shows canvas and layers.  
- [ ] Annotate with arrows, text, shapes, highlights; step numbers autoâ€‘increment.  
- [ ] Redaction tools (blur/pixelate/solid) and **smart redact** detect common sensitive text.  
- [ ] Device frames and preset sizes render correctly; safeâ€‘area guides visible.  
- [ ] Export PNG/JPEG/WebP/PDF; **copy to clipboard** works; batch export via ZIP.  
- [ ] Layers can be reordered/locked/hidden; snap to grid/guides works.  
- [ ] History/undo and version snapshots with notes.  
- [ ] All heavy processing stays clientâ€‘side unless user opts into server export/ocr.

---

**End of Requirements â€” Ready for Codex Implementation.**
# ðŸŽ¬ Comic Storyboarder â€” Full Requirements (Ansiversa)

Codexâ€‘ready specification for building the **Comic Storyboarder** mini app.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### What it does
**Comic Storyboarder** turns scripts or ideas into **paginated comic layouts** and **animatic storyboards**. It supports **panel grids & freeform layouts**, **shot types & camera moves**, **speech/thought balloons**, **SFX lettering**, **gutter control**, **layered drawing**, and **export to print and video**. Works great as a preâ€‘viz tool for comics, webtoons, explainer videos, and presentations.

### Core Features
- **Project wizard**: choose format (print comic, manga, webtoon vertical, strip), page size (A4/US, custom), DPI, bleed & safeâ€‘area.  
- **Script import** (from **Script Formatter**) or prompt â†’ **beat â†’ panel** suggestions.  
- **Layouts**: preset grids (3Ã—3, 2Ã—3, manga diagonals, splash), freeform panels, smart **gutter spacing** and **snap guides**.  
- **Panel editor**: shot type (WS/MS/CU/ECU), camera (pan/tilt/dolly/zoom markers), angle (low/high/eye), **ruleâ€‘ofâ€‘thirds** and **goldenâ€‘ratio** overlays.  
- **Balloons & captions**: speech, thought, narration, shout, whisper; tail anchors; auto text fit; font & stroke controls; RTL support.  
- **SFX lettering**: onomatopoeia styles with warp/arc; outlines and drop shadows.  
- **Layers**: roughs, inks, tones, color flats, overlays; perâ€‘panel and perâ€‘page layers; **transform**, **flip**, **opacity**.  
- **Asset library**: stickers, props, backgrounds; import PNG/SVG; perâ€‘project favorites.  
- **Timing & animatic**: perâ€‘panel duration; basic transitions (cut/dissolve/pan); export **GIF/MP4**.  
- **Review**: thumbnails/contact sheet; comments & change requests; version snapshots.  
- **Exports**: PDF (print with bleed), PNGs, Webtoon long strip, **MP4/GIF animatic**, **Presentation Designer** handâ€‘off (slides).

### Key Pages
- `/storyboard` â€” Library  
- `/storyboard/new` â€” Project wizard  
- `/storyboard/project/[id]` â€” Workspace (Pages, Panels, Balloons/SFX, Layers, Assets, Timing)  
- `/storyboard/export/[id]` â€” Export center  
- `/storyboard/settings` â€” Defaults (fonts, balloons, SFX styles, page presets)

### Minimal Data Model
`BoardProject`, `Page`, `Panel`, `FrameLayer`, `Balloon`, `Caption`, `Sfx`, `Asset`, `Shot`, `ScriptLink`, `Timeline`, `Comment`, `ExportJob`, `Tag`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Projects | 2 | Unlimited |
| Max pages | 12 | 200 |
| Export | PNG | + PDF/Webtoon/MP4/GIF |
| Script import | Basic | Full (scenes/lines) |
| Asset packs | Starter | Extended |
| Version history | Last 3 | Unlimited |
| History retention | 60 days | Unlimited |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives & Nonâ€‘Goals
**Objectives**
- Provide a **fast panel layout and lettering workflow** with **good defaults** for print and web.  
- Make it easy to **map script beats to panels** and preview timing via animatics.  
- Enable **export for production** (PDF with bleed) and **presentation** (slides/video).

**Nonâ€‘Goals (v1)**
- No 3D posing or skeletal rigs (may integrate later).  
- No multiâ€‘user live editing (v1.1 can add comments only).  
- No advanced paint engine (basic brush/eraser is enough).

---

### 2) Information Architecture & Routes

**Pages**
- `/storyboard` â€” Library with search/tags; recent projects.  
- `/storyboard/new` â€” Format & page settings wizard.  
- `/storyboard/project/[id]` â€” Tabs: **Pages**, **Panels**, **Balloons/SFX**, **Layers**, **Assets**, **Timing**, **Settings**.  
- `/storyboard/export/[id]` â€” Export presets.  
- `/storyboard/settings` â€” Fonts, styles, page presets, default DPI/bleed.

**API (SSR)**
- Projects: `POST /storyboard/api/project/create` Â· `GET /storyboard/api/project?id=` Â· `POST /storyboard/api/project/update` Â· `POST /storyboard/api/project/archive`
- Pages & panels:  
  - `POST /storyboard/api/page/create` `.../reorder` `.../delete`  
  - `POST /storyboard/api/panel/create` `.../split` `.../merge` `.../reorder` `.../resize`
- Shots & beats:  
  - `POST /storyboard/api/shot/suggest` (beat â†’ shot list)  
  - `POST /storyboard/api/shot/update` (type, angle, camera)  
  - `POST /storyboard/api/script/import` (from Script Formatter or text)
- Balloons & SFX:  
  - `POST /storyboard/api/balloon/add` `.../update` `.../delete`  
  - `POST /storyboard/api/sfx/add` `.../update` `.../delete`
- Layers & assets:  
  - `POST /storyboard/api/layer/add` `.../update` `.../delete`  
  - `POST /storyboard/api/asset/upload` `.../assign` `.../favorite`
- Timing & animatic:  
  - `POST /storyboard/api/timeline/set` (perâ€‘panel duration, transition)  
  - `POST /storyboard/api/animatic/render` (gif|mp4) Â· `GET /storyboard/api/animatic/status?id=`
- Review & comments:  
  - `POST /storyboard/api/comment/add` `.../resolve`  
  - `POST /storyboard/api/version/snapshot`
- Export: `POST /storyboard/api/export` (png|pdf|webtoon|gif|mp4) Â· `GET /storyboard/api/export/status?id=`  
- Settings: `POST /storyboard/api/settings/save`

Optional WebSocket `/storyboard/ws` for live panel layout previews and animatic progress.

---

### 3) Layout & Panel Engine

- **Presets**: grid templates (1â€“12 panels), splash page, diagonal manga cuts, insets, borderless panels.  
- **Freeform**: draw polygonal panel frames; **zâ€‘order** for overlays; **auto gutters** with lockable sizes.  
- **Safe areas**: bleed, trim, live, and caption safety; on/off overlays.  
- **Guides**: rule of thirds, center lines, perspective grid (basic).  
- **Transforms**: move/scale/rotate panels; snap to guides; **magnetic alignment** with neighboring panels.

---

### 4) Shot & Script Intelligence

- **Shot types**: WS/MS/MCU/CU/ECU, OTS, twoâ€‘shot, crowd; **angles**: low/high/dutch.  
- **Camera moves** (animatic only): pan, tilt, zoom, dolly; arrow overlays.  
- **Beat mapping**: script scene â†’ beats â†’ suggested panels with shot type & length; **dialogue balloons autoâ€‘placed** with tails to characters (manual drag fineâ€‘tunes).  
- **Auto text fit**: balloon resizes and font size adapts to content within max lines; overflow warning.  
- **Reading order**: manage **Zâ€‘path** (for manga RTL, western LTR) and balloon numbering.  
- **SFX presets**: BOOM/WHOOSH/THUD; style packs (comic, manga, sciâ€‘fi).

---

### 5) Drawing & Layers

- **Brush** (size/opacity), **eraser**, **shape tools** (rectangle/ellipse/polygon/line/arrow), **bucket fill** (flats), **lasso transform**.  
- **Perâ€‘panel layers**: roughs/inks/tones/color/FX; lock/hide; opacity; rename.  
- **Perâ€‘page overlays**: grids/guides; watermark; page numbers.  
- **Assets**: dragâ€‘drop PNG/SVG; resize; flip; tint; **link to panel** so it stays inside frame.  
- **Text**: balloon fonts (Impact, Anime Aceâ€“style lookâ€‘alike), captions serif/sans; kerning and leading controls.

---

### 6) Data Model (Astro DB / SQL)

**BoardProject**  
- `id` (uuid pk), `userId`, `title`, `format` ('print'|'webtoon'|'strip'), `pageSize` (json), `dpi` (int), `bleed` (mm), `rtl` (bool), `status` ('draft'|'review'|'final'), `createdAt`, `updatedAt`

**Page**  
- `id` (pk), `projectId` (fk), `index` (int), `canvas` (json: width/height/bleed/safe), `bgColor` (text), `notes` (text)

**Panel**  
- `id` (pk), `pageId` (fk), `index` (int), `shape` (json: polygon points or rect), `z` (int), `shotId` (fk|null), `durationMs` (int|null), `transition` (text|null), `notes` (text)

**FrameLayer**  
- `id` (pk), `panelId` (fk), `kind` ('rough'|'ink'|'tone'|'color'|'overlay'), `contentUrl` (text|null), `transform` (json), `opacity` (float), `locked` (bool), `order` (int)

**Balloon**  
- `id` (pk), `panelId` (fk), `type` ('speech'|'thought'|'narration'|'whisper'|'shout'), `text` (longtext), `font` (text), `size` (int), `stroke` (int), `tail` (json: anchor x/y, style), `bbox` (json), `order` (int), `rtl` (bool)

**Caption**  
- `id` (pk), `panelId` (fk), `text` (longtext), `style` (json), `bbox` (json), `order` (int)

**Sfx**  
- `id` (pk), `panelId` (fk), `text` (text), `style` (json: warp, outline, shadow), `bbox` (json), `order` (int)

**Asset**  
- `id` (pk), `projectId` (fk), `name` (text), `url` (text), `tags` (json), `license` (text)

**Shot**  
- `id` (pk), `panelId` (fk|null), `type` (text), `angle` (text), `camera` (json), `focus` (json)

**ScriptLink**  
- `id` (pk), `projectId` (fk), `scene` (text), `beat` (text), `panelId` (fk|null)

**Timeline**  
- `id` (pk), `projectId` (fk), `panels` (json:[{panelId,durationMs,transition}])

**Comment**  
- `id` (pk), `projectId` (fk), `target` (page|panel|balloon|sfx|layer), `targetId` (text), `text` (longtext), `status` ('open'|'resolved'), `createdAt`

**ExportJob**  
- `id` (pk), `projectId` (fk), `format` ('png'|'pdf'|'webtoon'|'gif'|'mp4'), `options` (json), `status` ('queued'|'running'|'done'|'error'), `url` (string|null), `createdAt`

**Tag**  
- `id` (pk), `name`, `color`

Indexes: `Page.projectId+index`, `Panel.pageId+index`, `Balloon.panelId`, `Sfx.panelId`, `Timeline.projectId`.

---

### 7) UX / UI

- **Workspace**: Page thumbnail strip; main canvas; right properties panel (panel, balloon/SFX, shot, layers).  
- **Snapping**: panels snap to grid and neighbors; balloons snap to safe zones.  
- **Reading order overlay**: numbers arrows for balloon sequence; toggle RTL/LTR.  
- **Contact sheet**: autoâ€‘generate PDF with page thumbnails and metadata.  
- **Animatic preview**: play/pause; perâ€‘panel timing; quick trim by dragging edges.  
- Accessibility: keyboard ops (arrows nudge, Shift+nudge big), high contrast, screenâ€‘reader labels.

Shortcuts: `P` new panel, `B` balloon, `X` SFX, `L` new layer, `G` toggle gutters, `T` timing, `E` export, `R` layout guides.

---

### 8) Validation Rules

- Page must have at least one panel unless splash.  
- Panel shapes must be nonâ€‘selfâ€‘intersecting; gutter min â‰¥ 2 mm (print) or â‰¥ 8 px (webtoon).  
- Balloon overflow errors: enforce max lines or auto split into multiâ€‘balloons.  
- SFX warp bounds must remain inside panel.  
- Export DPI â‰¥ 300 for print PDF; MP4 H.264, 24 or 30 fps only.  
- Webtoon export: max strip width 1080 px; auto slice by platform limits.

---

### 9) Plans & Limits

| Feature | Free | Pro |
|---|---|---|
| Projects | 2 | Unlimited |
| Pages/project | 12 | 200 |
| Exports/day | 3 | 20 |
| Asset storage | 200 MB | 5 GB |
| Animatic | GIF only | + MP4, transitions |
| Versioning | Last 3 | Unlimited |

Rate limits: `/shot/suggest` 50/day (Free) 300/day (Pro); `/animatic/render` 5/day (Free) 40/day (Pro).

---

### 10) Suggested File Layout

```
src/pages/storyboard/index.astro
src/pages/storyboard/new.astro
src/pages/storyboard/project/[id].astro
src/pages/storyboard/export/[id].astro
src/pages/storyboard/settings.astro

src/pages/storyboard/api/project/create.ts
src/pages/storyboard/api/project/index.ts
src/pages/storyboard/api/project/update.ts
src/pages/storyboard/api/project/archive.ts
src/pages/storyboard/api/page/create.ts
src/pages/storyboard/api/page/reorder.ts
src/pages/storyboard/api/page/delete.ts
src/pages/storyboard/api/panel/create.ts
src/pages/storyboard/api/panel/split.ts
src/pages/storyboard/api/panel/merge.ts
src/pages/storyboard/api/panel/reorder.ts
src/pages/storyboard/api/panel/resize.ts
src/pages/storyboard/api/shot/suggest.ts
src/pages/storyboard/api/shot/update.ts
src/pages/storyboard/api/script/import.ts
src/pages/storyboard/api/balloon/add.ts
src/pages/storyboard/api/balloon/update.ts
src/pages/storyboard/api/balloon/delete.ts
src/pages/storyboard/api/sfx/add.ts
src/pages/storyboard/api/sfx/update.ts
src/pages/storyboard/api/sfx/delete.ts
src/pages/storyboard/api/layer/add.ts
src/pages/storyboard/api/layer/update.ts
src/pages/storyboard/api/layer/delete.ts
src/pages/storyboard/api/asset/upload.ts
src/pages/storyboard/api/asset/assign.ts
src/pages/storyboard/api/asset/favorite.ts
src/pages/storyboard/api/timeline/set.ts
src/pages/storyboard/api/animatic/render.ts
src/pages/storyboard/api/animatic/status.ts
src/pages/storyboard/api/comment/add.ts
src/pages/storyboard/api/comment/resolve.ts
src/pages/storyboard/api/version/snapshot.ts
src/pages/storyboard/api/export.ts
src/pages/storyboard/api/export/status.ts

src/components/storyboard/Pages/*.astro
src/components/storyboard/Panels/*.astro
src/components/storyboard/Balloons/*.astro
src/components/storyboard/Sfx/*.astro
src/components/storyboard/Layers/*.astro
src/components/storyboard/Assets/*.astro
src/components/storyboard/Timing/*.astro
```

---

### 11) Integrations & Future (v2+)

- **Novel Outliner** import (beats â†’ panel plan).  
- **Presentation Designer** push (each panel â†’ slide).  
- **Pose reference** integration (later).  
- **Team review** with threaded comments and approvals.  
- **Color scripting** (mood palette per scene).

---

**End of Requirements â€” Ready for Codex Implementation.**
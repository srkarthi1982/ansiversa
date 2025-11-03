# ðŸ”„ File Converter â€” Full Requirements (Ansiversa)

Codexâ€‘ready specification for building the **File Converter** mini app.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### What it does
**File Converter** converts, compresses, and optimizes files across common **document, image, audio, video, archive, and data** formats. It supports **batch uploads**, **queue & progress**, **metadata controls**, **page/time ranges**, **split/merge**, **watermarking**, **OCR for images/PDFs**, **subtitle mux/demux**, and **safe sandboxed processing**. Exports can be **downloaded as individual files or a single ZIP** with a machineâ€‘readable job report (JSON).

### Core Capabilities
- **Documents**: DOCX â‡„ PDF, PPTX â†’ PDF, XLSX â‡„ CSV, ODT/ODS/ODP, HTML/Markdown â†’ PDF/DOCX.  
- **Images**: PNG/JPEG/WebP/AVIF/SVG/ICO â‡„ each other, resize, crop, DPI, background removal (optional), sprite sheets â†’ frames.  
- **Audio**: MP3/WAV/FLAC/OGG/AAC/M4A â‡„ each other, bitrate/sampleâ€‘rate/channel map, trim & normalize.  
- **Video**: MP4/MOV/MKV/WebM/GIF â‡„ target, resolution/fps/bitrate presets, trim, thumbnail sheet.  
- **Subtitles**: SRT â‡„ VTT; **mux/demux** with video (burnâ€‘in optional).  
- **Archives**: ZIP/TAR/TAR.GZ/7Z; compress, extract, reâ€‘package with include/exclude masks.  
- **Data/Code**: JSON â‡„ YAML â‡„ TOML â‡„ XML; CSV â‡„ JSON Lines; minify/prettyâ€‘print; schema validation.  
- **PDF tools**: split/merge, rotate, reorder, watermark (text/image), protect (owner password), remove password (if provided), compress, extract images, to grayscale.  
- **OCR**: image/PDF â†’ searchable PDF or TXT (languages: EN, TA, AR, HI, ES).  
- **Batch**: process many files with the same preset; perâ€‘file overrides; ZIP export.  
- **Safety**: size/type validation, **DRMâ€‘protected files blocked**, basic malware signature check, sandboxed workers, quotas.

### Key Pages
- `/convert` â€” Workspace (Upload, Presets, Queue, Results)  
- `/convert/new` â€” Quick recipe builder  
- `/convert/history` â€” Job history  
- `/convert/settings` â€” Defaults (quality, paths, OCR packs, watermark templates)

### Minimal Data Model
`ConvJob`, `ConvItem`, `Preset`, `FormatMap`, `Profile`, `ResultAsset`, `Audit`, `RateLimit`, `Tag`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Max file size (each) | 25 MB | 5 GB |
| Batch items/job | 5 | 200 |
| OCR | EN only | + TA/AR/HI/ES |
| Video burnâ€‘in subs | â€” | âœ… |
| Archive 7z | â€” | âœ… |
| Presets | 3 | Unlimited |
| History retention | 30 days | Unlimited |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives & Nonâ€‘Goals
**Objectives**
- Provide **fast, safe, and predictable** conversions with clear controls and reproducible **presets**.  
- Keep processing **portable** (download links + JSON report) and **composable** with other mini apps.

**Nonâ€‘Goals (v1)**
- No media **streaming/transcoding pipeline** for longâ€‘running live video.  
- No cloud storage sync (drive/dropbox) in v1; local upload/download only.

---

### 2) Information Architecture & Routes

**Pages**
- `/convert` â€” Main workspace: dragâ€‘andâ€‘drop upload, preset selector, queue table, progress, result gallery.  
- `/convert/new` â€” Recipe builder: choose **input types â†’ target format(s) â†’ operations â†’ quality**.  
- `/convert/history` â€” Past jobs with filters (date, preset, status, type).  
- `/convert/settings` â€” Global defaults, OCR language packs, watermark templates, rateâ€‘limit view.

**API (SSR)**  
- Jobs: `POST /convert/api/job/create` Â· `GET /convert/api/job?id=` Â· `POST /convert/api/job/cancel` Â· `GET /convert/api/job/list`  
- Items: `POST /convert/api/item/add` Â· `POST /convert/api/item/remove` Â· `POST /convert/api/item/override`  
- Presets: `POST /convert/api/preset/save` Â· `POST /convert/api/preset/delete` Â· `GET /convert/api/preset/list`  
- Ops: `POST /convert/api/ops/plan` (resolve recipe to steps)  
- Run: `POST /convert/api/run` (start workers) Â· `GET /convert/api/progress?id=` (per item)  
- Export: `GET /convert/api/download?assetId=` Â· `GET /convert/api/zip?id=` Â· `GET /convert/api/report?id=`  
- Safety: `POST /convert/api/scan` (mime, signatures)  
- Settings: `POST /convert/api/settings/save`

Optional WebSocket `/convert/ws` for live progress events and throttled logs.

---

### 3) Supported Operations & Options

**Documents**
- Convert: DOCX â‡„ PDF, PPTX â†’ PDF, XLSX â‡„ CSV, MD/HTML â†’ PDF/DOCX.  
- Options: page range, orientation, margins, header/footer, TOC, fonts embed, image quality, **flatten form fields**, accessibility tags (if available).

**Images**
- Convert: PNG/JPEG/WebP/AVIF/SVG/ICO/BMP/TIFF.  
- Options: width/height (keep aspect), **fit/cover/contain**, DPI, quality %, background color, remove metadata, **watermark** (pos/opacity), transparent â†’ white/keep, **strip ICC** or keep.  
- Batch resize; create favicon set and thumbnails.

**Audio**
- Convert: WAV/MP3/OGG/FLAC/AAC/M4A.  
- Options: bitrate, sample rate, channels (mono/stereo), normalize, trim (start/end), fade in/out, silence remove.

**Video**
- Convert: MP4/MOV/MKV/WebM/GIF.  
- Options: resolution/fps presets, CRF/bitrate, codec (H.264/H.265/VP9/AV1* if available), keyframe interval, crop/pad, **thumbnail sheet**, start/end trim.  
- Subtitles: burnâ€‘in (Pro), mux/demux SRT/VTT, default track flag.

**Subtitles**
- Convert: SRT â‡„ VTT; shift timings; merge/split by time.

**Archives**
- Create: ZIP/TAR/7Z (Pro); Extract: ZIP/TAR/TAR.GZ/7Z; selective include/exclude masks; password zip (AESâ€‘256).

**Data/Code**
- Convert: JSON â‡„ YAML â‡„ TOML â‡„ XML; CSV â‡„ JSON/NDJSON; minify/pretty; **schema validate** (userâ€‘provided JSON Schema); sort keys; dedupe rows.  

**PDF tooling**
- Split/merge, rotate, reorder pages, **watermark**, optimize (images downsample), grayscale, extract images, protect/unprotect (owner password), redact boxes (manual).

**OCR**
- Image/PDF â†’ searchable PDF/TXT; language packs; **layoutâ€‘aware** for multiâ€‘column; deskew & denoise.

---

### 4) Presets (Recipes)

A **Preset** captures: `inputTypes[]`, `targetFormat`, `operations[]`, `options{}` (including quality, ranges, watermark template, OCR language, etc.).  
Examples:
- **Web Image Optimizer**: any â†’ WebP 80%, max 1600px, strip metadata, generate 1x/2x.  
- **Slide to PDF**: PPTX â†’ PDF, A4, margins 10mm, include notes.  
- **YouTube Thumb Kit**: MP4 â†’ JPG thumbnails, 6 columns x 4 rows, at 10/30/60 sec.  
- **CSV to JSON Lines**: CSV â†’ NDJSON, trim header, infer schema.  
- **Scan â†’ Searchable PDF**: TIFF/PNG â†’ PDF+OCR (EN+AR), deskew, 300 DPI.

---

### 5) Data Model (Astro DB / SQL)

**ConvJob**  
- `id` (uuid pk), `userId`, `presetId` (fk|null), `status` ('queued'|'running'|'done'|'error'|'canceled'), `stats` (json:{items,ok,fail,bytesIn,bytesOut}), `createdAt`, `updatedAt`

**ConvItem**  
- `id` (pk), `jobId` (fk), `srcName` (text), `srcType` (mime), `size` (int), `hash` (text), `ops` (json), `status` ('queued'|'running'|'done'|'error'|'skipped'), `progress` (float), `error` (text|null)

**Preset**  
- `id` (pk), `userId`, `name`, `recipe` (json), `public` (bool)

**FormatMap**  
- `id` (pk), `from` (mime), `to` (mime), `opsDefault` (json), `enabled` (bool)

**Profile**  
- `id` (pk), `userId`, `defaults` (json:{quality,ocrLangs,watermarkTemplates,videoProfiles}), `limits` (json)

**ResultAsset**  
- `id` (pk), `jobId` (fk), `itemId` (fk), `filename` (text), `mime` (text), `size` (int), `url` (text), `meta` (json)

**Audit**  
- `id` (pk), `userId`, `action` (text), `meta` (json), `createdAt`

**RateLimit**  
- `id` (pk), `userId`, `window` (text), `counts` (json)

**Tag**  
- `id` (pk), `name`, `color`

Indexes: `ConvItem.jobId+status`, `ResultAsset.jobId`, `ConvJob.userId+createdAt`.

---

### 6) UX / UI

- **Workspace**: leftâ€”Uploads & Preset; centerâ€”Queue with perâ€‘item progress; rightâ€”Options drawer (overrides + preview).  
- **Result gallery** with tabs (Converted, Logs, Report JSON).  
- **Dragâ€‘andâ€‘drop**; **paste from clipboard** for images; sample files.  
- **Progress**: job % + each item %; error row with retry.  
- **Accessibility**: keyboardâ€‘first controls, focus rings, large file indicators, screenâ€‘reader announcements for progress.

Shortcuts: `Ctrl/Cmd+U` upload, `Ctrl/Cmd+Enter` run, `Ctrl/Cmd+J` download ZIP, `Del` remove selected item.

---

### 7) Validation & Safety

- **MIME sniff + extension** verification; block mismatches.  
- File size & count limits by plan; hard server cap.  
- **DRMâ€‘protected media**: detect and refuse; show help text.  
- Malware signature scan (basic) on archives and executables; refuse `.exe/.pkg/.apk`.  
- Redaction/watermark operations must not leak EXIF or hidden layers when **strip metadata** is on.  
- Sandbox conversion tools; restrict CPU/GPU time; kill hung processes; rate limit jobs.  
- **Privacy**: delete uploads & results after retention; show countdown; allow immediate purge.

---

### 8) Plans & Limits

| Feature | Free | Pro |
|---|---|---|
| Max file size | 25 MB | 5 GB |
| Batch items/job | 5 | 200 |
| Video length per item | 10 min | 2 hr |
| OCR languages | EN | + TA/AR/HI/ES |
| ZIP downloads/day | 5 | 50 |
| History | 30 days | Unlimited |

Rate limits: `/run` 10 jobs/day (Free) 100/day (Pro); `/upload` 200 files/day (Free) 5,000/day (Pro).

---

### 9) Suggested File Layout

```
src/pages/convert/index.astro
src/pages/convert/new.astro
src/pages/convert/history.astro
src/pages/convert/settings.astro

src/pages/convert/api/job/create.ts
src/pages/convert/api/job/index.ts
src/pages/convert/api/job/cancel.ts
src/pages/convert/api/job/list.ts
src/pages/convert/api/item/add.ts
src/pages/convert/api/item/remove.ts
src/pages/convert/api/item/override.ts
src/pages/convert/api/preset/save.ts
src/pages/convert/api/preset/delete.ts
src/pages/convert/api/preset/list.ts
src/pages/convert/api/ops/plan.ts
src/pages/convert/api/run.ts
src/pages/convert/api/progress.ts
src/pages/convert/api/download.ts
src/pages/convert/api/zip.ts
src/pages/convert/api/report.ts
src/pages/convert/api/scan.ts
src/pages/convert/api/settings/save.ts

src/components/convert/Upload/*.astro
src/components/convert/Queue/*.astro
src/components/convert/Options/*.astro
src/components/convert/Results/*.astro
```

---

### 10) Worker Notes (Implementation Hints for Codex)

- Use **task queue** abstraction with perâ€‘item steps; emit progress events via WebSocket.  
- Keep converters modular: adapters for **documents, images, audio, video, data, archive**; compose pipelines.  
- Ensure **streaming** uploads/downloads (no large memory buffers).  
- Validate **ranges** (pages/timecodes) before running external tools; cap time.  
- Always generate a **job report JSON** capturing inputs, options, results, errors, and timing.

---

### 11) Future Enhancements (v2+)

- Cloud storage connectors (Drive/Dropbox/S3).  
- **Heavier AI**: background removal, upscaler (SR), denoise, speechâ€‘toâ€‘text (ASR).  
- **PDF form fill** with CSV.  
- **HEIC** image support and camera RAW â†’ DNG/JPEG.  
- **Preset sharing** and marketplace.  
- **CLI** worker for onâ€‘prem batch jobs.

---

**End of Requirements â€” Ready for Codex Implementation.**
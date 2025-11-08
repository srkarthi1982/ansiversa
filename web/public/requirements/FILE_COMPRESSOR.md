# ðŸ—œï¸ File Compressor â€” Full Requirements (Ansiversa)

Codexâ€‘ready specification for building the **File Compressor** mini app. Target: **Astro (SSR)** + **Tailwind** + **Alpine.js** + **Astro DB** on **Vercel**. Privacyâ€‘first, supports browserâ€‘side compression for small files and serverâ€‘side jobs for large/secure tasks.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### What it does
Compresses and optimizes **single files** and **bundles** into popular archive formats, plus **lossless/lossy** optimizations for images, PDFs, and text. Supports **passwordâ€‘protected archives**, **split volumes**, **deduplication**, **metadata stripping**, and **oneâ€‘click share/download**. Batch mode with **dragâ€‘drop** and **progress**.

### Core Features
- **Archive formats** (create/extract): **ZIP (Deflate/Deflate64/ZSTD)**, **TAR.GZ** (gzip), **TAR.BZ2**, **TAR.ZSTD**, **7Z** (server), **RAR extract only** (where legally allowed; no create).
- **Password protection**: ZIP **AESâ€‘256** (server); clientâ€‘side ZIP crypto for small files (WASM).
- **Split archives** (e.g., `archive.zip.001` â€¦) and **rejoin**.
- **Image optimization**: PNG quantize, JPEG quality/mozjpeg, **WebP/AVIF** conversion, EXIF strip.
- **PDF optimization**: object stream recompress, image downsample, subset fonts, remove metadata.
- **Text/binary compression**: gzip/brotli/zstd for assets (js/css/json/csv).
- **Deduplication**: identify identical files by hash inside bundle, store once (tar+hardlink style; emulate in ZIP by duplicate entries with same data descriptor if lib supports).
- **Dragâ€‘drop UI**, **progress bars**, **cancel/resume (server jobs)**, **share link** with expiration.
- **Clientâ€‘first**: use **WASM** encoders for small/medium files to keep data local when possible.

### Key Pages
- `/compress` â€” Quick compress (drop files â†’ choose format â†’ options â†’ download).  
- `/compress/optimize` â€” Image/PDF/text optimizers (fine controls).  
- `/compress/extract` â€” Drop an archive to extract/preview.  
- `/compress/jobs` â€” Monitor large jobs, resume, download artifacts.  
- `/compress/settings` â€” Defaults (format/level), privacy, limits.  

### Minimal Data Model
`CompressJob`, `Artifact`, `SourceFile`, `Profile`, `Preset`, `ShareLink`, `Quota`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Max upload/job | 200 MB | 5 GB |
| Split archives | â€” | âœ… |
| Password AESâ€‘256 | âœ… (â‰¤200MB) | âœ… (all) |
| 7z / zstd | â€” | âœ… |
| Image AVIF/WebP | âœ… | âœ… (batch + advanced) |
| PDF optimizer | basic | advanced (OCR image downsample, font subset) |
| Share links | 3 active | 100 active |
| Job retention | 24h | 7â€“30 days |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Information Architecture & Routes

**Pages**
- `/compress` â€” Bundle creator: select **format**, **level**, **password**, **split size**, **dedupe**, **strip metadata**.  
- `/compress/optimize` â€” Perâ€‘type optimizers (image/PDF/text) with previews.  
- `/compress/extract` â€” Upload an archive, preview tree, selective extract.  
- `/compress/jobs` â€” Job list with statuses and actions.  
- `/compress/settings` â€” Defaults, presets, storage/retention.

**API (SSR)**
- `POST /compress/api/job/create` (files, settings) â†’ returns `jobId`
- `GET  /compress/api/job/status?id=`
- `GET  /compress/api/job/download?id=&artifact=archive|report`
- `POST /compress/api/job/cancel`  
- `POST /compress/api/preset/save` Â· `POST /compress/api/preset/delete`
- `POST /compress/api/extract` (archive file) â†’ list/tree + optional download selection
- `POST /compress/api/share/create` Â· `POST /compress/api/share/revoke`
- `GET  /compress/api/share/get?id=`

**Workers / Queue**
- `compress:run` â€” performs server compression using streams; supports resume on chunked uploads.
- `compress:cleanup` â€” deletes expired artifacts.

---

### 2) Formats, Libraries & Strategy

**Clientâ€‘side (WASM) â€“ small files / privacy mode**
- ZIP: `fflate` or `zip.js` (WASM backed); password (store, method AESâ€‘256 via WASM build).
- gzip/brotli: `fflate` brotli/gzip.
- Image: `squoosh` codecs (mozjpeg, oxipng, webp, avif) via WebAssembly.
- PDF: light optimization via `pdf-lib` (remove metadata, recompress embedded images when possible).

**Serverâ€‘side (Node) â€“ large/batch/secure**
- Archive: `archiver` (zip/tar) + `7zip-bin`/`node-7z` for 7z; `@zip.js/zip.js` server build for AESâ€‘256; `tar-stream` + `zlib`/`@mongodb-js/zstd` for zstd.  
- Image: `sharp` (JPEG/WebP/AVIF, metadata).
- PDF: `ghostscript` (if available) or `qpdf`/`pdfcpu` via binaries; fallback to `pdf-lib` transforms.
- Dedup: compute `sha256` of each input; reuse data streams.
- Split volumes: write fixedâ€‘size parts; manifest `artifact.json`.

**Extraction**
- Use pureâ€‘JS libs for browser extract (zip.js) for small archives; server for big/7z/rar.

> Note: RAR creation is not supported (license). Extraction supported via external binary only if allowed on platform; otherwise disable RAR.

---

### 3) Options & Defaults

**Archive options**
- Format: ZIP (default), TAR.GZ, TAR.BZ2, TAR.ZSTD (Pro), 7Z (Pro).
- Level: Fast, Balanced (default), Max.
- Password: off / AESâ€‘256; remember â€œdo not store passwordâ€ option.
- Split size: off / 10MB / 100MB / 1GB / custom.
- Deduplicate identical files: on (default).
- Store paths: keep folder structure (default) / flatten.
- Include manifest & checksums (sha256).

**Optimizers**
- **Images**: 
  - Mode: Lossless (PNG quant/oxipng), Lossy (JPG/WebP/AVIF quality slider).  
  - Strip EXIF: on (default).  
  - Resize: max width/height.  
- **PDF**:
  - Image downsample: 300/150/96 DPI.  
  - Recompress: yes.  
  - Remove metadata, page thumbnails, unused objects.  
- **Text/assets**:
  - gzip / brotli / zstd; keep original + compressed variants.  
  - Set `Contentâ€‘Encoding` hint in report.

---

### 4) Data Model (Astro DB / SQL)

**CompressJob**  
- `id` (uuid pk), `userId` (fk|null), `status` ('queued'|'running'|'done'|'error'|'canceled'), `mode` ('archive'|'optimize'|'extract'), `settings` (json), `bytesIn` (int), `bytesOut` (int|null), `progress` (int 0â€‘100), `error` (text|null), `createdAt`, `updatedAt`

**SourceFile**  
- `id` (pk), `jobId` (fk), `name` (text), `path` (text), `bytes` (int), `sha256` (text), `mime` (text), `createdAt`

**Artifact**  
- `id` (pk), `jobId` (fk), `kind` ('archive'|'report'|'preview'|'part'), `path` (text), `bytes` (int), `parts` (json|null), `createdAt`

**Preset**  
- `id` (pk), `userId` (fk), `name` (text), `config` (json)

**ShareLink**  
- `id` (pk), `jobId` (fk), `token` (text unique), `expiresAt` (datetime|null), `oneTime` (bool), `createdAt`

**Quota**  
- `userId` (pk), `bytesUsed` (bigint), `jobsCount` (int), `updatedAt`

Indexes: `CompressJob.userId+createdAt`, `Artifact.jobId`, `ShareLink.token`, `SourceFile.sha256`.

---

### 5) UX / UI

- **Dropzone** with file list (name, size, type, status), **reorder**, and **remove**.
- **Option panel** with sensible defaults and tooltips explaining tradeâ€‘offs.
- **Progress** per file and overall; **ETA**; cancel button (server jobs).  
- After completion: **summary card** (input bytes â†’ output bytes, ratio, saved %, time, report link).
- **Extract** view: tree explorer, select specific paths, download as ZIP.
- **Accessibility**: keyboard flow, large drop targets, screenâ€‘reader labels.

Shortcuts: `Enter` start, `Backspace` remove selected, `Cmd/Ctrl+S` save preset, `?` help.

---

### 6) Security & Privacy

- Prefer **clientâ€‘side** processing for â‰¤200MB (Free) to avoid uploads; server only if needed/features require (e.g., 7z, split volumes).  
- **Password handling**: never store plaintext; for server jobs, encrypt in memory or derive a key from password and only keep during process lifetime.  
- **Share links**: tokenized with expiry/oneâ€‘time options.  
- **Antivirus** (basic): compute hashes; optionally check blocklist; never execute files.  
- **PII risk**: warn when archives contain EXIF/location metadata and offer stripping.  
- **Rate limiting** on upload & job creation; perâ€‘user quotas.

---

### 7) Limits & Billing

| Limit | Free | Pro |
|---|---|---|
| Upload/job | 200 MB | 5 GB |
| Concurrent jobs | 1 | 5 |
| Retention | 24h | 7â€“30 days |
| Share links | 3 active | 100 active |

Overâ€‘limit behavior: fail with helpful message; suggest switching to server job or Pro.

---

## ðŸ§© PART 3 â€” TECH NOTES (for Codex)

### Suggested File Layout

```
src/pages/compress/index.astro
src/pages/compress/optimize.astro
src/pages/compress/extract.astro
src/pages/compress/jobs.astro
src/pages/compress/settings.astro

src/pages/compress/api/job/create.ts
src/pages/compress/api/job/status.ts
src/pages/compress/api/job/download.ts
src/pages/compress/api/job/cancel.ts
src/pages/compress/api/extract.ts
src/pages/compress/api/share/create.ts
src/pages/compress/api/share/revoke.ts
src/pages/compress/api/share/get.ts

src/lib/compress/client/zip.ts           # WASM/fflate wrappers
src/lib/compress/client/image.ts         # squoosh codecs
src/lib/compress/client/pdf.ts           # pdf-lib trims

src/lib/compress/server/archive.ts       # archiver/7z/tar/zstd pipelines
src/lib/compress/server/image.ts         # sharp pipeline
src/lib/compress/server/pdf.ts           # qpdf/ghostscript wrappers
src/lib/compress/server/extract.ts       # safe extract + path traversal guard
src/lib/compress/server/chunk-upload.ts  # resumable uploads
src/lib/compress/server/checksum.ts      # sha256, manifest
```

### Pseudocode: Create Archive (server)
```ts
const job = await db.job.start(userId, settings);
for await (const file of uploadStream) {
  const hash = await sha256(file.stream);
  await db.source.add(job.id, {name:file.name, bytes:file.size, sha256:hash, mime:file.type});
  addToArchive(archive, file.stream, file.name, {storePath, dedupe, password});
}
await finalizeArchive(archive, {splitSize});
await db.job.finish(job.id, {bytesOut, artifacts});
```

### Pseudocode: Clientâ€‘side ZIP (small files)
```ts
const zip = new ZipWriter({ password, level });
for (const f of files) {
  const data = await f.arrayBuffer();
  await zip.add(f.name, new Uint8Array(data));
}
const blob = await zip.close();
downloadBlob(blob, "archive.zip");
```

### Pseudocode: Safe Extract
```ts
const tree = await listArchive(archive);
const safe = tree.filter(p => !p.path.includes("..") && !isAbsolute(p.path));
const blob = await makeZipFromSelection(safe);
return blob;
```

---

## âœ… ACCEPTANCE CRITERIA

- [ ] Dragâ€‘drop multiple files; create **ZIP** with chosen level; download works.  
- [ ] **Passwordâ€‘protected ZIP AESâ€‘256** creation (server) and extraction (client/server).  
- [ ] **Image** optimizer produces visibly smaller outputs with chosen quality.  
- [ ] **PDF** optimizer reduces size while preserving text/searchability.  
- [ ] **Extract** supports ZIP/TAR.GZ (Free) and 7z/ZSTD (Pro/server).  
- [ ] **Split volumes** creation & rejoin works (Pro).  
- [ ] Job system shows progress, permits cancel, and provides artifact downloads.  
- [ ] Quotas/limits enforced; share links work with expiry.  

---

**End of Requirements â€” Ready for Codex Implementation.**
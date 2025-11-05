# ðŸŽ™ï¸ Speechâ€‘toâ€‘Text (STT) Converter â€” Full Requirements (Ansiversa)

Codexâ€‘ready specification for building the **Speechâ€‘toâ€‘Text Converter** mini app. Target stack: **Astro (SSR)** + **Tailwind** + **Alpine.js** + **Astro DB**, deployed on **Vercel**. Supports streaming and batch transcription, multiâ€‘engine backends, smart diarization, timestamps, custom vocabulary, subtitle exports, and an inâ€‘browser transcript editor.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### What it does
Turn **audio/video** into accurate, punctuated **text** with **timestamps**, **speaker labels**, **wordâ€‘level confidence**, and **subtitle files** (SRT/VTT). Includes **live streaming** (web mic), **batch uploads**, **language detection**, **domain glossary boosts**, and a **review editor** to fix or redact segments, then export to multiple formats.

### Core Features
- **Engines** (pluggable): OpenAI Whisper (API), Azure Speech, Google STT, Deepgram/AssemblyAI (optional), and **local fallback** (Vosk/whisper.cpp) for privacy (v2).  
- **Streaming**: realâ€‘time transcription from mic with partial hypotheses and latency under ~1â€“2s.  
- **Batch**: upload audio/video; chunking with **VAD** (voice activity detection); parallel processing; resume on failure.  
- **Smart formatting**: punctuation, capitalization, numbers/dates; profanity masking toggle.  
- **Timestamps**: utteranceâ€‘level + **wordâ€‘level** alignment; **confidence** scores.  
- **Diarization**: automatic speaker separation or manual merge/split in the editor.  
- **Language**: autoâ€‘detect or force; **codeâ€‘switch** tolerant; multiâ€‘language in one file (tagged).  
- **Custom vocabulary / hints**: per project; boost brand names, jargon, contacts.  
- **Editor**: timeline scrubbing, keyboard controls, search & replace, redact (beep/bleep), split/merge segments, speaker rename, **reâ€‘sync after edits**.  
- **Exports**: TXT, DOCX (v2), SRT, VTT, JSON (segments & words), CSV (timestamped rows).  
- **Integrations**: handoff to **Blog Writer**, **Meeting Minutes AI**, **Email Polisher**, **Presentation Designer**.  
- **Compliance**: consent reminders, PII redaction helpers, audit trail for edits (Pro).

### Key Pages
- `/stt` â€” Oneâ€‘shot: upload or record and get a transcript with quick export.  
- `/stt/editor/[id]` â€” Full transcript editor with audio/video preview and timeline.  
- `/stt/batch` â€” Multiâ€‘file batch with perâ€‘file status and ZIP export.  
- `/stt/dictionary` â€” Custom vocabulary & phrase boosts (per language).  
- `/stt/projects/[id]` â€” Project view: files, transcripts, versions, exports.  
- `/stt/settings` â€” Defaults (engine, language), retention, profanity, consent banners.

### Minimal Data Model
`STTProject`, `STTAudio`, `STTTask`, `STTTranscript`, `STTSegment`, `STTWord`, `STTVocabRule`, `STTArtifact`, `Profile`, `Quota`, `Preset`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Monthly audio minutes | 30 | 1,000+ |
| Max file length | 30 min | 6 hrs |
| Streaming | 10 min/session | Unlimited |
| Wordâ€‘level timing | âœ… | âœ… |
| Diarization | Basic (auto) | Advanced editor tools |
| Exports | TXT/SRT/VTT | + JSON/CSV/DOCX bundle |
| Custom vocabulary | 50 entries | 5,000 entries (+weights) |
| PII redaction | Manual | Auto suggestions |
| Team projects | â€” | âœ… |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Information Architecture & Routes

**Pages**
- `/stt` â€” dragâ€‘drop or record; language & engine selector; quick export.  
- `/stt/editor/[id]` â€” waveform/timeline, segment list, speaker labels, text editor, find/replace, playback controls.  
- `/stt/batch` â€” queue multiple files; show progress; pause/resume; ZIP of results.  
- `/stt/dictionary` â€” vocabulary rules; import/export JSON/CSV; perâ€‘lang weighting.  
- `/stt/projects/[id]` â€” project dashboard with files, transcripts, versions, and activity.  
- `/stt/settings` â€” defaults, retention, profanity masking, consent toggles.

**API (SSR)**  
- Upload: `POST /stt/api/upload` (resumable/chunked) â†’ `audioId`  
- Start task: `POST /stt/api/transcribe` (`audioId`, `engine`, `lang`, `hints`, `diarize`) â†’ `taskId`  
- Status: `GET /stt/api/task/status?id=`  
- Transcript: `GET /stt/api/transcript?id=`  
- Save edits: `POST /stt/api/transcript/save`  
- Export: `GET /stt/api/export?id=&fmt=txt|srt|vtt|json|csv|docx`  
- Dictionary: `POST /stt/api/dict/save` Â· `POST /stt/api/dict/delete` Â· `GET /stt/api/dict/list`  
- Streaming: `GET /stt/api/stream/token` (auth ws token) Â· `WS /stt/api/stream` (audio in, events out)

**Workers / Queue**
- `stt:run` â€” runs batch transcriptions, handles chunking/VAD, retries.  
- `stt:align` â€” optional reâ€‘alignment to produce word timings if engine lacks them.  
- `stt:cleanup` â€” removes expired audio/artifacts per retention policy.

---

### 2) Engines & Abstraction

Create a unified interface so engines are swappable.

```ts
interface STTEngine {
  name: string
  transcribe(req: {
    audioPath: string
    lang?: string
    diarize?: boolean
    hints?: string[]
    timestamps?: 'segment'|'word'|'both'
    profanityFilter?: boolean
  }): Promise<{
    segments: Array<{
      start: number, end: number, speaker?: string,
      text: string, words?: Array<{ w: string, s: number, e: number, conf?: number }>
    }>
    detectedLanguage?: string
    confidence?: number
  }>
  stream?: (ws: WebSocket, opts: { lang?: string, hints?: string[] }) => void
}
```

**Supported Formats**: WAV/FLAC/MP3/MP4/M4A/WEBM/OGG/OPUS; resample to 16â€“48 kHz mono for best results.

**Chunking/VAD**: Split long audio on silence; overlap ~0.25s for context; crossâ€‘fade merge; keep absolute timestamps.

---

### 3) Transcript Editor

- **Waveform** (peaks) + **cursor** + **zoom**; seek by clicking; play/pause (`Space`).  
- **Segment list** with start/end, speaker, text, confidence; **split** (`S`), **merge** (`M`), **join with next**.  
- **Speaker tools**: autoâ€‘label `SPEAKER_1..N`, rename to `Karthik`, color chips; bulk apply across ranges.  
- **Search & Replace** with wholeâ€‘word, case, regex.  
- **Redaction**: mark ranges â†’ replace text with `[REDACTED]` and optionally **bleep audio** (server reâ€‘render).  
- **Reâ€‘sync** after edits: push words in a segment to gentle/ctcâ€‘alignment (v2) to maintain accurate timings.  
- **Shortcuts**:  
  - `Space` Play/Pause, `â†/â†’` Seek Â±1s, `Shift+â†/â†’` Â±5s, `Cmd/Ctrl+K` Command palette, `S` Split, `M` Merge, `R` Redact.

---

### 4) Data Model (Astro DB / SQL)

**STTProject**  
- `id` (uuid pk), `userId` (fk), `name` (text), `lang` (text|null), `notes` (text|null), `createdAt`

**STTAudio**  
- `id` (pk), `projectId` (fk|null), `path` (text), `bytes` (int), `durationMs` (int|null), `mime` (text), `sampleRate` (int|null), `channels` (int|null), `createdAt`

**STTTask**  
- `id` (pk), `audioId` (fk), `engine` (text), `status` ('queued'|'running'|'done'|'error'|'canceled'), `settings` (json), `error` (text|null), `createdAt`, `updatedAt`

**STTTranscript**  
- `id` (pk), `audioId` (fk), `detectedLang` (text|null), `confidence` (real|null), `text` (longtext), `version` (int default 1), `createdAt`

**STTSegment**  
- `id` (pk), `transcriptId` (fk), `idx` (int), `start` (real), `end` (real), `speaker` (text|null), `text` (text), `confidence` (real|null)

**STTWord**  
- `id` (pk), `segmentId` (fk), `idx` (int), `start` (real), `end` (real), `text` (text), `confidence` (real|null)

**STTVocabRule**  
- `id` (pk), `userId` (fk), `lang` (text), `phrase` (text), `weight` (real default 1.0), `notes` (text|null), `createdAt`

**STTArtifact**  
- `id` (pk), `transcriptId` (fk), `kind` ('srt'|'vtt'|'json'|'csv'|'docx'|'audio-bleeped'), `path` (text), `bytes` (int), `createdAt`

**Preset**, **Profile**, **Quota** similar to other apps.

Indexes: `STTTask.audioId+createdAt`, `STTSegment.transcriptId+idx`, `STTWord.segmentId+idx`, FTS5 on `STTTranscript.text`.

---

### 5) UX / UI

- **Oneâ€‘shot**: drop/record; select engine & language; show progress and quick exports.  
- **Editor**: collapsible left panel (segments), center (waveform + text), right (properties/actions).  
- **Batch**: table with file name, duration, status, errors; resume & retry.  
- **Dictionary**: phrase list with weight (0.1â€“20), language tag; test box shows boosted recognition.  
- **Accessibility**: full keyboard control; screenâ€‘reader labels; highâ€‘contrast theme toggle.

---

### 6) Processing Pipeline

1. **Ingest**: validate file; compute hash; probe duration and audio params (ffprobe).  
2. **Preprocess**: resample to target sample rate; mono; noise reduction (RNNoise or sox); VAD to find chunks.  
3. **Transcribe**: send chunks to engine; include `hints` and language; get segments/words.  
4. **Merge**: stitch with overlap compensation; renumber; infer speakers if diarization enabled.  
5. **Postâ€‘process**: punctuation/casing; profanity masking; number/date formatting.  
6. **Align (optional)**: refine word timings via CTC/phoneme aligner if engine lacks word timings.  
7. **Artifacts**: build SRT, VTT, JSON, CSV; PR review flags (low confidence segments).

---

### 7) Exports

- **TXT**: plain text transcript.  
- **SRT/VTT**: subtitle files from segments; configurable max line length and reading rate (chars/sec).  
- **JSON**: `{ segments: [...], words: [...] }`.  
- **CSV**: rows with `start,end,speaker,text,confidence`.  
- **DOCX (v2)**: styled document with speaker blocks.  
- **Audio with beeps** (optional): generate redacted audio artifact.

---

### 8) Limits, Quotas & Billing

| Metric | Free | Pro |
|---|---|---|
| Monthly minutes | 30 | 1,000+ |
| Max file length | 30m | 6h |
| Concurrent tasks | 1 | 5 |
| Retention | 7 days | 30â€“90 days |
| Dictionary entries | 50 | 5,000 |

Quota charges count **audio minutes processed**; retries within 24h donâ€™t bill again.

---

### 9) Security & Compliance

- Consent reminder before recording; **no background recording**.  
- Tokenâ€‘gated downloads; signed URLs for artifacts.  
- Optional **onâ€‘device** mode (v2) for short files via WASM/local models.  
- PII handling: redaction tools; ability to purge all data for a project.  
- Rate limiting on uploads & streaming WS; CSRF for stateâ€‘changing endpoints.  
- Logs exclude transcript text; only IDs and timings.

---

## ðŸ§© PART 3 â€” TECH NOTES (for Codex)

### Suggested File Layout

```
src/pages/stt/index.astro
src/pages/stt/editor/[id].astro
src/pages/stt/batch.astro
src/pages/stt/dictionary.astro
src/pages/stt/projects/[id].astro
src/pages/stt/settings.astro

src/pages/stt/api/upload.ts
src/pages/stt/api/transcribe.ts
src/pages/stt/api/task/status.ts
src/pages/stt/api/transcript.ts
src/pages/stt/api/transcript/save.ts
src/pages/stt/api/export.ts
src/pages/stt/api/dict/save.ts
src/pages/stt/api/dict/delete.ts
src/pages/stt/api/dict/list.ts
src/pages/stt/api/stream/index.ts    # WS handler
src/pages/stt/api/stream/token.ts

src/lib/stt/engines/base.ts
src/lib/stt/engines/openai.ts
src/lib/stt/engines/azure.ts
src/lib/stt/engines/google.ts
src/lib/stt/engines/local.ts           # v2

src/lib/stt/pipeline.ts                # ingest â†’ preprocess â†’ transcribe â†’ merge â†’ post
src/lib/stt/vad.ts                     # voice activity detection helpers
src/lib/stt/align.ts                   # optional aligner
src/lib/stt/format.ts                  # punctuation, normalize, profanity
src/lib/stt/exports.ts                 # srt/vtt/json/csv builders
src/lib/stt/waveform.ts                # peaks generation for UI
```

### Pseudocode: Batch Transcribe
```ts
// /stt/api/transcribe.ts
const { audioId, engine, lang, hints, diarize } = await readJson(request);
const task = await db.task.start({ audioId, engine, settings:{ lang, hints, diarize }});
queue('stt:run', { taskId: task.id });
return json({ ok:true, taskId: task.id });
```

```ts
// worker stt:run
const audio = await db.audio.get(task.audioId);
const chunks = await vadChunk(audio.path);
const all = [];
for (const ch of chunks) {
  const out = await engine.transcribe({ audioPath: ch.path, lang, diarize, hints, timestamps:'both' });
  all.push(out.segments);
}
const merged = mergeSegments(all.flat());
const transcript = await db.transcript.save(task.audioId, merged);
await buildArtifacts(transcript.id);
await db.task.finish(task.id);
```

### Pseudocode: Streaming Handler
```ts
// WS /stt/api/stream
ws.on('audio', async (pcmChunk) => {
  const partial = await engine.stream?.(ws, { lang, hints });
  // send back interim hypotheses: { type:'partial', text, start, end }
});
```

---

## âœ… ACCEPTANCE CRITERIA

- [ ] Oneâ€‘shot upload or recording produces a punctuated transcript with timestamps.  
- [ ] Wordâ€‘level timings and confidence are available (engineâ€‘provided or aligned).  
- [ ] Diarization labels (auto) and can be edited/merged in the editor.  
- [ ] Exports include TXT, SRT, VTT, JSON, and CSV; ZIP bundle for batch.  
- [ ] Streaming mode shows partial transcripts and final segments with <2s latency.  
- [ ] Custom vocabulary boosts recognition measurably on test phrases.  
- [ ] Redaction & beeps generate a downloadable â€œcleanâ€ audio artifact.  
- [ ] Quotas & limits enforced; retention respected; secure artifact URLs.

---

**End of Requirements â€” Ready for Codex Implementation.**
# ðŸ—£ï¸ Textâ€‘toâ€‘Speech Converter â€” Full Requirements (Ansiversa)

Codexâ€‘ready specification for building the **Textâ€‘toâ€‘Speech (TTS) Converter** mini app. Target stack: **Astro (SSR)** + **Tailwind** + **Alpine.js** + **Astro DB**, deployed on **Vercel**. Supports multiâ€‘voice synthesis, SSML, pronunciations, batching, captions, and audio postâ€‘processing.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### What it does
Convert text/SSML into **natural speech** in multiple **languages/voices**, with controls for speed, pitch, emotion, and style. Export **MP3/WAV/OGG**, generate **captions** (VTT/SRT), **wordâ€‘level timestamps**, and **visemes/phonemes** (for lipâ€‘sync). Includes **batch mode**, **pronunciation dictionary**, and **audio postâ€‘FX** (silence trim, normalize, fade).

### Core Features
- **Voices & Languages**: curated voice library (male/female/neutral, ages, styles: narrator, conversational, newscaster, assistant).  
- **Controls**: speaking **rate**, **pitch**, **volume**, **style** (friendly/news/marketing), **emotion** (calm/cheerful/serious).  
- **Input**: plain text or **SSML** (breaks, prosody, emphasis, sayâ€‘as, audio tags).  
- **Outputs**: **MP3**, **WAV (16â€‘bit PCM)**, **OGG (Opus)**; sample rates 22.05â€“48 kHz; mono/stereo.  
- **Captions & Timing**: **SRT/VTT**, JSON with **word timings**; **phoneme/viseme** stream for lipâ€‘sync.  
- **Postâ€‘FX**: loudness normalize (â€‘16 LUFS streaming target), noise gate, silence trim, head/tail fades, reverb (light), speed retime without pitch shift.  
- **Batch**: CSV/JSON import â†’ multiple clips with shared settings; ZIP export; perâ€‘row status.  
- **Pronunciation Dictionary**: perâ€‘language IPA/ARPAbet rules and word replacements; projectâ€‘level overrides.  
- **Projects**: group related scripts; version clips; reorder and merge to a **single audio** with cue sheet.  
- **API Access (Pro)**: REST endpoints to synthesize and retrieve assets programmatically.  
- **Compliance**: safeâ€‘use guardrails for cloned voices (v2), consent tracking, watermarking toggle (where supported).

### Key Pages
- `/tts` â€” Oneâ€‘shot synth (text â†’ audio + captions).  
- `/tts/studio` â€” Multiâ€‘clip â€œstudioâ€ with timeline, perâ€‘clip voice/effects, merge & export.  
- `/tts/batch` â€” Bulk synthesis from CSV/JSON.  
- `/tts/dictionary` â€” Pronunciation dictionary manager.  
- `/tts/projects/[id]` â€” Project view with clips, versions, and exports.  
- `/tts/settings` â€” Defaults, API keys, usage/quota.  

### Minimal Data Model
`TTSProject`, `TTSClip`, `TTSVoice`, `TTSDictRule`, `TTSTask`, `TTSArtifact`, `Profile`, `Quota`, `Preset`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Monthly synth time | 10 mins | 300â€“1,000 mins |
| Max clip length | 60 sec | 15 min |
| Batch rows/job | 20 | 5,000 |
| Captions | VTT only | VTT + SRT + JSON timings |
| Visemes/phonemes | â€” | âœ… |
| Studio timeline | Basic | Full (perâ€‘clip FX, merge) |
| API access | â€” | âœ… |
| Pronunciation dictionary | User | User + Project + Import/Export |
| Postâ€‘FX | Normalize/trim | Full suite |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Information Architecture & Routes

**Pages**
- `/tts` â€” Input (text/SSML), voice/language selector, sliders (rate/pitch/volume), preview player, download, save as clip.  
- `/tts/studio` â€” Timeline with clips; dragâ€‘reorder; perâ€‘clip voice & FX; merge/export; cue sheet view.  
- `/tts/batch` â€” CSV/JSON mapping (columns: text, voice, lang, rate, pitch, filename); progress; ZIP results.  
- `/tts/dictionary` â€” Rule list; add/edit (word â†’ phoneme/IPA or replacement text); priority; import/export JSON.  
- `/tts/projects/[id]` â€” Project overview; clip table; versions; artifacts; notes.  
- `/tts/settings` â€” Defaults (voice/rate), output formats, captions default, API tokens, quota usage.

**API (SSR)**
- `POST /tts/api/synthesize` â†’ returns `taskId`
- `GET  /tts/api/task/status?id=`
- `GET  /tts/api/task/download?id=&kind=audio|vtt|srt|json`  
- `POST /tts/api/clip/save` Â· `POST /tts/api/project/save`
- `POST /tts/api/dict/save` Â· `POST /tts/api/dict/delete` Â· `GET /tts/api/dict/list`
- `POST /tts/api/batch/create` Â· `GET /tts/api/batch/status?id=`
- `POST /tts/api/merge` (studio merge/export)

**Workers / Queue**
- `tts:run` â€” executes synthesis with provider SDK; builds artifacts and timings.  
- `tts:merge` â€” concatenates clips with crossfades; writes cue sheet and combined captions.  
- `tts:cleanup` â€” deletes expired artifacts; enforces quota.

---

### 2) Synthesis Engine Abstraction

Create a providerâ€‘agnostic interface so you can plug in different TTS backends (OpenAI TTS, Azure, Amazon Polly, Google, local TTS).

```ts
interface TTSEngine {
  listVoices(lang?: string): Promise<VoiceInfo[]>
  synthesize(req: {
    textOrSsml: string
    lang: string
    voice: string
    format: 'mp3'|'wav'|'ogg'
    sampleRate: 22050|24000|44100|48000
    rate?: number       // -50..+100 (%)
    pitch?: number      // -12..+12 (semitones) or %
    volume?: number     // -12..+12 dB
    style?: string      // 'narration'|'chat'|'news'|...
    emotion?: string    // 'neutral'|'cheerful'|...
    dict?: DictRule[]
    wantTimings?: boolean
    wantVisemes?: boolean
  }): Promise<{ audioPath: string, timings?: Timing[], visemes?: Viseme[] }>
}
```

**Timing/Viseme JSON**
```ts
type Timing = { word: string, start: number, end: number, charStart?: number, charEnd?: number }
type Viseme = { id: string, start: number, end: number } // or phoneme symbol
```

---

### 3) SSML Support (v1)

Allowed tags/attrs: `<speak>`, `<p>`, `<s>`, `<break time="500ms">`, `<prosody rate="90%" pitch="+2st" volume="+1dB">`, `<emphasis level="strong">`, `<say-as interpret-as="characters|digits|cardinal|ordinal|date|time|telephone|address">`, `<lang xml:lang="...">`, `<voice name="...">`.  
Sanitize SSML; strip unsupported tags; fallback to plain text.

---

### 4) Audio Postâ€‘Processing

- Normalize to target loudness (**â€‘16 LUFS** for streaming, **â€‘23 LUFS** optional).  
- Silence trim (head/tail threshold & min duration).  
- Optional: noise gate, deâ€‘ess (simple), compressor (makeâ€‘up gain), EQ presets (narration/phone).  
- Fades (in/out); **timeâ€‘stretch** (Â±15%) without pitch shift.  
- Export sample rate conversion with highâ€‘quality resampler.  
- Peak limiter at â€‘1 dBFS.

Server libs: `ffmpeg`/`sox`/node wrappers; client: WebAudio for previews only.

---

### 5) Data Model (Astro DB / SQL)

**TTSProject**  
- `id` (uuid pk), `userId` (fk), `name` (text), `lang` (text|null), `defaultVoice` (text|null), `notes` (text|null), `createdAt`, `updatedAt`

**TTSClip**  
- `id` (pk), `projectId` (fk|null), `text` (text), `ssml` (text|null), `lang` (text), `voice` (text), `rate` (int), `pitch` (int), `volume` (int), `style` (text|null), `emotion` (text|null), `durationMs` (int|null), `version` (int default 1), `createdAt`

**TTSTask**  
- `id` (pk), `clipId` (fk), `status` ('queued'|'running'|'done'|'error'|'canceled'), `provider` (text), `settings` (json), `error` (text|null), `createdAt`, `updatedAt`

**TTSArtifact**  
- `id` (pk), `taskId` (fk), `kind` ('audio'|'vtt'|'srt'|'json'|'merged'), `path` (text), `bytes` (int), `createdAt`

**TTSVoice** (cache)  
- `id` (pk), `provider` (text), `name` (text), `lang` (text), `gender` (text|null), `styleTags` (json), `sampleUrl` (text|null), `updatedAt`

**TTSDictRule**  
- `id` (pk), `userId` (fk), `lang` (text), `match` (text), `replacement` (text|null), `phoneme` (text|null), `alphabet` ('ipa'|'arpabet'|null), `priority` (int), `createdAt`

**Preset**, **Profile**, **Quota** like other apps (limits, defaults, usage).

Indexes: `TTSClip.projectId`, `TTSTask.clipId+createdAt`, `TTSVoice.lang+name`, `TTSDictRule.userId+lang+priority`.

---

### 6) UX / UI

- **Oneâ€‘shot** page: editor with **live character count**, SSML syntax highlight, **validate** button, **preview** player.  
- **Voice browser**: filter by language, gender, style; play samples; favorite voices.  
- **Studio**: tracklist/timeline; perâ€‘clip settings; quick split by sentence; **merge & export**.  
- **Batch**: CSV column mapper with validation; resumable uploads; progress & errors table.  
- **Dictionary**: rule list with test input & preview; import/export JSON.  
- **Accessibility**: full keyboard control, screenâ€‘reader labels, clear contrast.

Shortcuts: `Cmd/Ctrl+Enter` synthesize, `Cmd/Ctrl+S` save clip, `[` `]` trim start/end, `M` add marker, `P` preview.

---

### 7) Limits, Quotas & Billing

| Metric | Free | Pro |
|---|---|---|
| Monthly minutes | 10 | 300â€“1,000 |
| Max clip duration | 60s | 15m |
| Concurrent tasks | 1 | 5 |
| Retention | 7 days | 30â€“90 days |
| Batch size | 20 | 5,000 |

Quota accounting: charge per **synthesized second**; include retries; exclude failed tasks.

---

### 8) Security & Compliance

- Sanitize HTML/SSML; block `<audio src>` to external domains unless allowâ€‘listed.  
- Rateâ€‘limit synth and batch endpoints; perâ€‘user quotas enforced serverâ€‘side.  
- Tokenize downloads via `TTSArtifact` with permission checks.  
- PII: discourage sensitive text; optionally redact emails/phones in logs.  
- **Voice cloning (v2)** requires explicit consent capture & audit log; watermark if provider supports.

---

## ðŸ§© PART 3 â€” TECH NOTES (for Codex)

### Suggested File Layout

```
src/pages/tts/index.astro
src/pages/tts/studio.astro
src/pages/tts/batch.astro
src/pages/tts/dictionary.astro
src/pages/tts/projects/[id].astro
src/pages/tts/settings.astro

src/pages/tts/api/synthesize.ts
src/pages/tts/api/task/status.ts
src/pages/tts/api/task/download.ts
src/pages/tts/api/clip/save.ts
src/pages/tts/api/project/save.ts
src/pages/tts/api/dict/save.ts
src/pages/tts/api/dict/delete.ts
src/pages/tts/api/dict/list.ts
src/pages/tts/api/batch/create.ts
src/pages/tts/api/batch/status.ts
src/pages/tts/api/merge.ts

src/lib/tts/engine.ts            # provider abstraction
src/lib/tts/providers/openai.ts  # OpenAI TTS
src/lib/tts/providers/azure.ts   # Azure (optional)
src/lib/tts/providers/polly.ts   # AWS (optional)
src/lib/tts/ssml.ts              # validation/sanitization
src/lib/tts/postfx.ts            # ffmpeg/sox chain
src/lib/tts/captions.ts          # srt/vtt/timings builder
src/lib/tts/merge.ts             # concatenate + cue sheet
```

### Pseudocode: Synthesize
```ts
// /tts/api/synthesize.ts
const req = await readJson(request)
validate(req.textOrSsml)
const engine = selectEngine(req.provider || 'openai')
const dict = await loadDict(userId, req.lang)
const { audioPath, timings, visemes } = await engine.synthesize({
  ...req, dict, wantTimings: req.wantTimings !== false
})
const task = await db.task.finish({ clipId, artifacts:[
  { kind:'audio', path: audioPath },
  { kind:'vtt', path: buildVtt(timings) },
  { kind:'json', path: jsonTimings(timings, visemes) }
]})
return json({ ok:true, taskId: task.id })
```

### Pseudocode: Merge
```ts
// /tts/api/merge.ts
const clips = await db.clips.list(projectId, { order:'createdAt' })
const audio = await ffmpegMerge(clips.map(c => c.latestAudio), { crossfadeMs: 60 })
const captions = mergeVTT(clips.map(c => c.vtt))
return artifact(projectId, { audio, captions })
```

---

## âœ… ACCEPTANCE CRITERIA

- [ ] Oneâ€‘shot page synthesizes text to MP3/WAV/OGG with chosen voice, rate, pitch.  
- [ ] Captions (VTT/SRT) and JSON **word timings** generated and downloadable.  
- [ ] Studio timeline merges multiple clips with crossfades and produces a single export.  
- [ ] Batch CSV/JSON runs, with perâ€‘row status and ZIP of results.  
- [ ] Pronunciation dictionary rules apply deterministically and can be imported/exported.  
- [ ] Quotas enforced by synthesized seconds; clear error messages for limits.  
- [ ] Secure tokenized downloads and sanitation of SSML.  

---

**End of Requirements â€” Ready for Codex Implementation.**
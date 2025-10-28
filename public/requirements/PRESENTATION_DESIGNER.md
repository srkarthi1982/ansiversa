# ðŸ–¼ï¸ Presentation Designer â€” Detailed Requirements (Ansiversa)

**Owner:** Ansiversa (Karthik)  
**Module Path:** `/presentation`  
**Category:** Career & Professional  
**Stack:** Astro + Tailwind (islands for editors), Astro SSR API routes, Astro DB / Supabase, PPTX/PDF export via server runtime (e.g., pptxgen or node-pptx + headless PDF)  
**Goal:** Let users turn ideas (outline, prompt, or imported doc) into polished slide decks fast, with themes, brand kits, smart layouts, media helpers, charts/tables, notes, and oneâ€‘click export (PPTX/PDF).

---

## 1) Objectives & Nonâ€‘Goals

### Objectives
- **Create from:** prompt, outline bullets, uploaded doc (txt/md), or imported Ansiversa app output (Resume, Blog, Concept Explainer, Lesson Builder).
- **Design system:** themes, palettes, fonts, layout packs, iconography.
- **Smart slides:** title, section, bullets, comparison, image grid, quote, agenda, chart, table, KPI, timeline, steps, pros/cons, Q&A, thank you.
- **Brand kit:** logo, brand colors, fonts, spacing, default footer & watermark.
- **Assets:** media search placeholder (user uploads/URLs), SVG/PNG icons, screenshots.
- **Data viz:** charts (bar/line/pie/donut/scatter) from pasted CSV/JSON; simple tables.
- **Editing:** slide reorder/duplicate, drag media, edit text blocks, style overrides.
- **Assistants:** rewrite tone (concise/professional/story), summarize/expand, spell/grammar.
- **Notes & timing:** presenter notes, slide timing estimates.
- **Export & share:** PPTX/PDF export, share readâ€‘only link, version history.

### Nonâ€‘Goals (v1)
- No online live collaboration cursors (singleâ€‘user editing only).  
- No external stock API integration (use placeholder URLs/upload only).  
- No embedded video export to PDF (PPTX supports media links).

---

## 2) User Stories (Acceptance Criteria)

1. **Generate from Prompt**
   - *As a user*, I enter a topic + target audience + length.  
   - **AC:** `/presentation/api/generate` creates a deck skeleton with title, agenda, and N slides following an outline.

2. **Import from Outline / Doc**
   - *As a user*, I paste bullets or upload .md/.txt.  
   - **AC:** `/presentation/api/import` converts to slides with suitable layouts.

3. **Apply Theme / Brand Kit**
   - *As a user*, I select a theme or my brand kit.  
   - **AC:** deck palettes, typography, and default layouts update consistently.

4. **Add Chart from CSV**
   - *As a user*, I paste CSV â†’ select chart type.  
   - **AC:** `/presentation/api/chart/preview` returns a render spec; slide shows chart.

5. **Rewrite Content**
   - *As a user*, I click â€œMake conciseâ€ on a crowded slide.  
   - **AC:** `/presentation/api/assist/rewrite` returns tightened bullets while keeping keywords.

6. **Export PPTX/PDF**
   - *As a user*, I export the deck.  
   - **AC:** `/presentation/api/export` returns a downloadable PPTX or PDF URL.

7. **Versioning**
   - *As a user*, I duplicate a deck and see version history.  
   - **AC:** `/presentation/api/duplicate` creates a new version linked to the original.

8. **Plan Gating**
   - Free: up to 10 slides/export, watermarked PDF, basic themes.  
   - Pro: unlimited slides, PPTX/PDF without watermark, brand kits, chart tables, custom themes.

---

## 3) Routes & Information Architecture

- `/presentation` â€” Hub: New from Prompt/Outline/Import; Recent decks; Templates.  
- `/presentation/new` â€” Wizard: Topic, audience, length, style, theme, brand kit.  
- `/presentation/editor/[deckId]` â€” Slide editor (canvas, left slide list, right inspector).  
- `/presentation/templates` â€” Theme gallery & layout packs.  
- `/presentation/brand` â€” Brand Kit manager.  
- `/presentation/view/[deckId]` â€” Readâ€‘only viewer (for sharing).

**API (SSR):**  
- `POST /presentation/api/generate` (from prompt/outline)  
- `POST /presentation/api/import` (txt/md)  
- `POST /presentation/api/slide/add` Â· `POST /presentation/api/slide/update` Â· `POST /presentation/api/slide/delete` Â· `POST /presentation/api/reorder`  
- `POST /presentation/api/theme/apply` Â· `POST /presentation/api/brand/apply`  
- `POST /presentation/api/asset/upload` Â· `POST /presentation/api/asset/link`  
- `POST /presentation/api/chart/preview` (returns chart spec) Â· `POST /presentation/api/chart/commit`  
- `POST /presentation/api/assist/rewrite` Â· `POST /presentation/api/assist/summary` Â· `POST /presentation/api/assist/expand`  
- `POST /presentation/api/export` (pptx|pdf)  
- `POST /presentation/api/duplicate` Â· `POST /presentation/api/delete`  
- `GET  /presentation/api/list` (recent decks) Â· `GET /presentation/api/view` (public view payload)

---

## 4) Data Model (Astro DB / SQL)

**User**  
- `id` (pk), `email`, `plan`, `timezone`, `language`, `createdAt`

**Deck**  
- `id` (pk uuid), `userId` (fk), `title`, `subtitle`, `description`, `themeId` (fk), `brandId` (fk nullable), `coverImageUrl` (nullable),  
  `slideCount` (int), `publicShare` (bool), `createdAt`, `updatedAt`, `version` (int)

**Slide**  
- `id` (pk uuid), `deckId` (fk), `index` (int), `layout` ('title'|'section'|'bullets'|'image'|'image_grid'|'quote'|'comparison'|'kpi'|'timeline'|'steps'|'pros_cons'|'table'|'chart'|'qna'|'thankyou'),  
  `content` (json), `notes` (text), `timingSec` (int|null), `bg` (json|null)

**Theme**  
- `id` (pk uuid), `name`, `palette` (json), `fonts` (json), `layoutDefaults` (json), `shapes` (json), `coverStyle` (json), `isBuiltin` (bool)

**BrandKit**  
- `id` (pk uuid), `userId` (fk), `name`, `logoUrl` (nullable), `palette` (json), `fonts` (json), `footer` (json), `watermark` (json|null)

**Asset**  
- `id` (pk uuid), `userId` (fk), `deckId` (fk nullable), `type` ('image'|'icon'|'svg'|'csv'|'json'), `name`, `url`, `meta` (json), `createdAt`

**ChartSpec**  
- `id` (pk uuid), `deckId` (fk), `slideId` (fk), `type` ('bar'|'line'|'pie'|'donut'|'scatter'), `data` (json), `enc` (json), `options` (json)

**TemplatePack**  
- `id` (pk uuid), `title`, `description`, `cover`, `slides` (json schema), `isBuiltin` (bool)

**ExportJob**  
- `id` (pk), `deckId` (fk), `format` ('pptx'|'pdf'), `status` ('queued'|'done'|'error'), `url`, `createdAt`

---

## 5) Content JSON (Slide Content Examples)

**Bullets**  
```json
{
  "heading": "Why Ansiversa?",
  "bullets": ["100+ AI mini apps", "Unified UX", "One subscription", "Fast & fun"]
}
```

**Image Grid**  
```json
{
  "heading": "Product Screens",
  "images": [{"url": "/uploads/s1.png", "alt": "Home"}, {"url": "/uploads/s2.png", "alt": "Quiz"}],
  "captions": true
}
```

**Chart**  
```json
{
  "title": "Monthly Users",
  "type": "line",
  "data": [{"month": "Jan", "users": 1200}, {"month": "Feb", "users": 1600}],
  "enc": {"x": "month", "y": "users"}
}
```

**Table**  
```json
{
  "title": "Plan Comparison",
  "columns": ["Feature", "Free", "Pro"],
  "rows": [["Slides per export", "10", "Unlimited"], ["Watermark", "Yes", "No"]]
}
```

---

## 6) Editor UX (Key Interactions)

- Left: **slide navigator** with thumbnails (reorder by drag).  
- Center: **canvas** with layout handles (resize text/image boxes, grid snapping).  
- Right: **inspector** tabs â†’ Content Â· Style Â· Notes Â· Data.  
- **Theme switcher** modal; **Brand kit** picker.  
- **Add slide** menu with smart suggestions (â€œYou often add KPI after Timelineâ€).  
- **Assist** actions on text blocks (rewrite, summarize, bulletize, fix grammar).  
- **Data tab**: paste CSV/JSON â†’ preview chart/table â†’ insert to current slide.

Keyboard: `N` new slide, `D` duplicate, `Del` delete, `Ctrl/Cmd+K` quick add, `Ctrl/Cmd+S` save, `Ctrl/Cmd+P` export.

---

## 7) API Contracts (examples)

### `POST /presentation/api/generate`
Req:  
```json
{
  "source": "prompt",
  "topic": "Pitch: Ansiversa Miniâ€‘App Platform",
  "audience": "Investors",
  "length": 10,
  "tone": "professional",
  "themeId": "builtin-modern"
}
```  
Res: `{ "deckId":"<uuid>", "slideCount":10 }`

### `POST /presentation/api/slide/update`
Req: `{ "deckId":"<uuid>", "slideId":"<uuid>", "content":{ "heading":"Overview", "bullets":["â€¦"] } }`  
Res: `{ "ok":true }`

### `POST /presentation/api/chart/preview`
Req: `{ "deckId":"<uuid>", "slideId":"<uuid>", "type":"bar", "csv":"month,users\nJan,1200\nFeb,1600" }`  
Res: `{ "specId":"<uuid>", "previewUrl":"/previews/<id>.png" }`

### `POST /presentation/api/export`
Req: `{ "deckId":"<uuid>", "format":"pptx" }`  
Res: `{ "url":"/exports/ansiversa_pitch.pptx" }`

### `POST /presentation/api/assist/rewrite`
Req: `{ "text":"Our platform is very very good and amazing..." , "mode":"concise" }`  
Res: `{ "text":"Our platform unifies 100+ AI miniâ€‘apps for faster results." }`

---

## 8) Validation Rules

- Title 2â€“120 chars.  
- Max slides per deck: Free=10, Pro=300.  
- Image size â‰¤ 10 MB; CSV/JSON â‰¤ 2 MB.  
- Allowed slide layouts from whitelist; unknown fields stripped on save.  
- Export jobs expire URLs after 24h (reâ€‘export to regenerate).

---

## 9) Plans & Limits

| Feature | Free | Pro |
|--------|------|-----|
| Generate from prompt | Yes | Yes |
| Templates & themes | Basic | All + custom |
| Brand kit | â€” | Yes (multiple) |
| Slides/export | 10 | Unlimited |
| Export watermark | Yes | No |
| PPTX export | â€” | Yes |
| Charts & tables | Basic | Full options |
| Public share | Readâ€‘only | Readâ€‘only + theme lock |

Rate limits: `userId`+day for generate/export; `userId`+hour for assist calls.

---

## 10) Accessibility & UX

- Large text & highâ€‘contrast modes; focus outlines; ARIA labels for canvas controls.  
- Keyboard shortcuts for all key actions; undo/redo history.  
- RTL support for Arabic; localeâ€‘aware fonts.

---

## 11) Suggested File Layout

```
src/pages/presentation/index.astro
src/pages/presentation/new.astro
src/pages/presentation/editor/[deckId].astro
src/pages/presentation/templates.astro
src/pages/presentation/brand.astro
src/pages/presentation/view/[deckId].astro

src/pages/presentation/api/generate.ts
src/pages/presentation/api/import.ts
src/pages/presentation/api/slide/add.ts
src/pages/presentation/api/slide/update.ts
src/pages/presentation/api/slide/delete.ts
src/pages/presentation/api/reorder.ts
src/pages/presentation/api/theme/apply.ts
src/pages/presentation/api/brand/apply.ts
src/pages/presentation/api/asset/upload.ts
src/pages/presentation/api/asset/link.ts
src/pages/presentation/api/chart/preview.ts
src/pages/presentation/api/chart/commit.ts
src/pages/presentation/api/assist/rewrite.ts
src/pages/presentation/api/assist/summary.ts
src/pages/presentation/api/assist/expand.ts
src/pages/presentation/api/export.ts
src/pages/presentation/api/duplicate.ts
src/pages/presentation/api/delete.ts
src/pages/presentation/api/list.ts
src/pages/presentation/api/view.ts

src/components/presentation/Editor/*.astro
src/components/presentation/Slides/*.astro
src/components/presentation/Inspector/*.astro
src/components/presentation/Chart/*.astro
src/components/presentation/Templates/*.astro
src/components/presentation/Brand/*.astro
```

---

## 12) Future Enhancements (v2+)

- **Collaborative editing** (multiâ€‘cursor) via WebSockets/CRDT.  
- **Speaker view** with timers during presentation.  
- **Template marketplace** (moderated).  
- **Theme inference** from uploaded brand guidelines or website URL.  
- **Image search integration** and AI chart design suggestions.  
- **PWA** for offline editing + drafts.

---

**End of Requirements â€” ready for Codex implementation.**
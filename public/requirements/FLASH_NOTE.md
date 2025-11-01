# Ansiversa FlashNote - Product and Technical Requirements

**Document owner:** Ansiversa Core Apps Team  \
**Last updated:** 17 October 2025  \
**Related apps:** Resume Builder, Cover Letter Writer  \
**Tech stack:** Astro, Alpine.js, Tailwind CSS, astro:db, astro:actions, OpenAI API

---

## 1. Vision and Success Metrics
- **Purpose:** Deliver a lightning-fast workspace for short-form learning notes that can be reorganised, summarised, and rehearsed in minutes.
- **Primary persona:** Students and professionals preparing for certifications who already use Ansiversa for career assets.
- **Success signals:**
  - Users can create and review a flash note set in under 5 minutes.
  - >=70% of engaged sessions trigger at least one AI assist action (summarise, simplify, explain, quiz).
  - Export-to-shared-link flow converts at >=30% of sessions that enter review mode.

---

## 2. Scope Overview
- **In scope:** note CRUD, tag management, AI-assisted transformations, flashcard review, exports (PDF, Markdown, TXT), authenticated sharing, responsive layout, accessibility baseline, analytics events.
- **Out of scope (Phase 2+):** spaced repetition scheduler, collaborative editing, audio prompts, offline PWA sync, payment gating, mobile native app.

---

## 3. User Experience Blueprint
### 3.1 Navigation map
`/flashnote` -> Dashboard -> Note editor -> Review mode -> Export drawer.

### 3.2 Core flows
| Flow | Trigger | Happy-path steps | Key validations |
| --- | --- | --- | --- |
| Create note | "New Note" button | Prefill blank note -> autosave draft -> show toast | Title required, body >= 10 chars |
| Summarise | AI toolbar | Send trimmed content to AI -> stream response -> inject into summary panel | 2k character max, handle API failure |
| Review | "Study" toggle | Snapshot filtered notes -> shuffle -> card navigation | Ensure at least one note selected |
| Export | Export menu | Choose format -> server action generates artifact -> download/share | Format whitelist, download tokens expire |

### 3.3 Empty and edge states
- Empty dashboard displays illustrated prompt, "Import sample deck" CTA populates mock data.
- If AI fails, show inline warning with retry + "Copy note content" fallback.
- When user has >200 notes, default filter to latest updated and surface "Refine by tag" helper.

---

## 4. UI Implementation (Astro + Tailwind)
- **Page:** `src/pages/flashnote.astro` using `src/layouts/Layout.astro`.
- **Sections:** header (app title + quick actions), note grid (responsive CSS columns), inspector panel (editor + AI output), review overlay (full-screen modal), footer (export/share status).
- **Key components:**
  - `FlashNoteDashboard.astro` - fetches list data via `astro:actions` and displays cards with tag chips.
  - `FlashNoteEditor.astro` - two-pane editor (Markdown input + preview) with autosave indicator and AI output slot.
  - `FlashNoteAIControls.astro` - toolbar for AI actions with loading states and rate-limit guard messaging.
  - `FlashNoteReview.astro` - card carousel with keyboard shortcuts (<-/->, space to flip).
  - `FlashNoteTagFilter.astro` - tag pills, search, and "Create new tag" dialog.
  - `Loader.astro` - shared spinner toggled by store loading flags.
- **Styling:** adhere to CSS variables defined in `src/styles/tokens.css`. Provide dark-mode variants, focus outlines, and 12/16/24px spacing scale.
- **Responsiveness:**
  - >=1024px: three-column grid (tags/sidebar, notes list, inspector).
  - 768-1023px: two-column stack (notes, inspector) with collapsible tag panel.
  - <768px: single column with slide-over inspector and review overlay occupying full viewport.

---

## 5. Client State (Alpine.js store `src/alpineStores/flashnote.ts`)
- **State shape:**
  ```ts
  interface FlashNoteState {
    notes: FlashNote[];
    filteredNotes: FlashNote[];
    activeNoteId: string | null;
    draft: { title: string; content: string; tags: string[] } | null;
    aiSummary: string;
    aiMode: "idle" | "summarising" | "simplifying" | "explaining" | "quizzing";
    filterTag: string | null;
    reviewMode: boolean;
    loading: boolean;
    error: string | null;
  }
  ```
- **Actions:** `init`, `selectNote`, `saveDraft`, `commit`, `destroy`, `triggerAI(mode)`, `completeAI(text)`, `toggleReview`, `applyFilter(tag)`, `clearError`.
- Maintain optimistic updates; rollback on server failure with toast messaging via shared notifier.
- Persist last active note and filter using `localStorage` helper under `src/utils/storage.ts`.

---

## 6. Server Actions and API Contracts (`src/actions/flashnote/`)
- Namespace exported as `server.flashnote` in `src/actions/flashnote/index.ts` for tree-shakable imports.
- **Actions and payloads:**
  - `list` (`GET` equivalent): `{ sessionId }` -> `{ notes: FlashNote[] }`.
  - `create`: `{ sessionId, title, content, tags }` -> `{ note }`.
  - `update`: `{ sessionId, id, title?, content?, tags?, summary? }` -> `{ note }`.
  - `delete`: `{ sessionId, id }` -> `{ success: true }`.
  - `summarise`: `{ sessionId, id, mode, promptOverride? }` -> `{ resultText }`.
  - `review`: `{ sessionId, tag?, limit? }` -> `{ cards: FlashNote[] }`.
  - `export`: `{ sessionId, format, noteIds }` -> `{ downloadUrl, expiresAt }`.
- All handlers enforce:
  - Session validation via `server.auth.requireUser(sessionId)`.
  - Input schemas defined with Zod under `src/actions/flashnote/schemas.ts`.
  - Rate limiting (5 AI requests per minute) using Redis-backed utility `server.rateLimit`.
  - Structured error responses: `{ error: { code, message, retryAfter? } }`.

---

## 7. Data Model (`astro:db`)
```ts
export const FlashNote = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text(),
    title: column.text(),
    content: column.text(),
    tags: column.json(),
    summary: column.text().optional(),
    createdAt: column.date({ default: now() }),
    updatedAt: column.date({ default: now() })
  },
  foreignKeys: [{ columns: ["userId"], references: [User.id] }],
  indexes: [
    { on: ["userId", "updatedAt"] },
    { on: ["userId"], where: sql`json_array_length(tags) > 0` }
  ]
});
```
- `tags` stored as JSON array to support multi-tag queries; provide helper to serialise for export.
- Add derived view `FlashNoteSearch` to precompute trigram search tokens (Phase 2).

---

## 8. AI Integration Strategy
- **Model:** default `gpt-4o-mini`; allow override via `AI_MODEL` env.
- **Prompt template:** stored at `src/ai/prompts/flashnotePrompt.ts` with slots for mode, audience, tone.
- **Safeguards:**
  - Strip PII-like patterns before sending to OpenAI (use `sanitizeForAI` util).
  - Enforce 2,000 character hard limit, with front-end counter.
  - Use streaming responses; if streaming unsupported, fall back to polling via action.
  - Cache last AI result per note for 30 minutes in Redis (`flashnote:ai:{noteId}`) to reduce cost.
  - Log prompt + completion metadata (sans raw content) to analytics bus for cost tracking.

---

## 9. Export and Sharing
- Server generates assets via `server.flashnote.export` using unified `renderDocument` helper in `src/utils/exporter.ts`.
- Supported formats:
  - `pdf`: uses headless Chromium; enforce max 50 notes per export.
  - `md` and `txt`: plain text streams.
- Download URLs signed with `createSignedUrl` (valid 10 minutes). Stored in S3-compatible bucket `ansiversa-shares`.
- Share links expose read-only view at `/flashnote/share/[token]`; require `ShareToken` table (reuse from Resume Builder) for expiration and revoke.

---

## 10. Security and Compliance
- All actions behind `server.auth` session; anonymous sessions redirected to `/auth/login?redirect=/flashnote`.
- Validate ownership on every DB query (`where userId = session.userId`).
- Store audit log entries for create/update/delete in `AuditTrail` table with action, noteId, diff summary.
- PII handling: do not send user profile data to AI. Respect user deletion requests via background job that purges notes and signed URLs.
- Secrets retrieved through Astro runtime `import.meta.env`-never commit keys.

---

## 11. Accessibility and Internationalisation
- WCAG 2.2 AA targets: keyboard access for all controls, high-contrast theme toggle, ARIA labels on toolbar buttons, screen-reader friendly flashcard flipping.
- Support locale switching via existing `i18n` plugin; copy resides in `src/i18n/flashnote/en.json` with fallback to `en` if missing.
- Provide text-alternatives for icons, and ensure announcements through `aria-live` region when AI completes.

---

## 12. Analytics and Observability
- Instrument events via `src/utils/analytics.ts`: `flashnote_note_created`, `flashnote_ai_triggered`, `flashnote_review_started`, `flashnote_export_completed`.
- Capture performance metrics (load, interaction ready) through Web Vitals integration already used by Resume Builder.
- Server logs route to Logtail; include correlation IDs (`x-ans-request-id`) in both client and server logs.

---

## 13. Testing and QA Strategy
- **Unit tests:** store reducers (`src/alpineStores/__tests__/flashnote.test.ts`), utility functions, exporter helpers.
- **Integration tests:** astro:actions executed via Vitest using test DB.
- **E2E smoke:** Playwright script covering create -> AI -> review -> export happy path.
- QA checklist includes responsive breakpoints, accessibility audit (axe), and AI failure fallback.

---

## 14. Performance Targets
- Initial page load <= 2.5s on 3G Fast (hydration limited to essential Alpine stores).
- Client bundle budget: <=180 KB gzipped for `/flashnote` route.
- API response time: <400 ms p95 for CRUD actions, <1,500 ms p95 for AI completion (excluding model latency).
- Use incremental loading for note list when >50 items (virtualised list or pagination).

---

## 15. Roadmap (Post-MVP)
1. Spaced repetition scheduler with streak tracking.
2. Collaborative decks with real-time cursors.
3. AI "Study Coach" conversational mode.
4. Mobile PWA with offline cache and push reminders.
5. Notebook import (Notion, Google Docs) via connectors.

---

## 16. Open Questions
- Should shared decks allow recipient-generated notes? (Product decision pending.)
- Do we need AI usage quotas surfaced to end users? (Depends on pricing model.)
- Will exporting Markdown preserve embedded images? (Tech investigation required.)

---

## 17. Developer Checklist
- [ ] Create astro:db migrations for FlashNote table + indexes.
- [ ] Scaffold server actions with shared validation utilities.
- [ ] Build Alpine store and ensure optimistic UI updates.
- [ ] Implement AI toolbar with streaming UX and error fallback.
- [ ] Wire analytics events and confirm data in staging dashboards.
- [ ] Complete QA checklist and capture screenshots for design review.

*Document generated for Ansiversa Engineering Codex.*

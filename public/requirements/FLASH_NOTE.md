# âš¡ Ansiversa FlashNote --- Technical Requirement Document

**Date:** October 17, 2025\
**App Code:** `flashnote`\
**Parent Project:** [Ansiversa](https://ansiversa.com)\
**Framework:** Astro + Alpine.js + Tailwind CSS + astro:db + OpenAI API

------------------------------------------------------------------------

## ðŸŽ¯ Overview

The **FlashNote** mini app allows users to create, organize, summarize,
and review short notes or flashcards for fast learning and retention. It
serves as a bridge between quick notetaking and structured revision,
with AI-powered summarization and quiz generation.

------------------------------------------------------------------------

## ðŸ§© Architecture Layers

### 1. **UI & Pages (Astro)**

-   **Primary Page:** `src/pages/flashnote.astro`
-   **Layout:** Inherits from `src/layouts/Layout.astro`
-   **Sections:**
    -   Dashboard displaying all notes grouped by subject or tag.
    -   Note Editor with AI-enhanced features.
    -   Review mode with flashcard-like swiping.
    -   Export and share functionality.

#### Components

-   `FlashNoteDashboard.astro` --- List of notes and categories.\
-   `FlashNoteEditor.astro` --- Editor with formatting and tags.\
-   `AIControls.astro` --- Buttons for "Summarize", "Simplify",
    "Explain", "Quiz Me".\
-   `ReviewMode.astro` --- Displays flashcards for quick recall
    sessions.\
-   `TagManager.astro` --- Create and filter by tags.\
-   `Loader.astro` --- Loading indicator for async actions.

All follow Tailwind tokens (`--ans-primary`, `--ans-bg`) and support
dark mode.

------------------------------------------------------------------------

### 2. **Client State (Alpine.js)**

-   **Store File:** `src/alpineStores/flashnote.ts`
-   **State Keys:**
    -   `notes`: Array of all user notes.
    -   `activeNote`: Current open note.
    -   `aiSummary`: AI-generated text.
    -   `filterTag`: Active tag for filtering.
    -   `reviewMode`: Whether user is reviewing.
    -   `loading`: Operation status.
-   **Methods:**
    -   `loadNotes()` â†’ Fetch all notes.
    -   `createNote()` â†’ Add new note.
    -   `updateNote()` â†’ Edit existing note.
    -   `deleteNote()` â†’ Remove note.
    -   `summarize()` â†’ Call AI summarization.
    -   `toggleReview()` â†’ Switch between editor/review modes.

------------------------------------------------------------------------

### 3. **Server Actions (astro:actions)**

-   **Namespace:** `server.flashnote`
-   **Path:** `src/actions/flashnote/index.ts`

  Action        File             Description
  ------------- ---------------- -----------------------------------------
  `list`        `list.ts`        Retrieve notes for authenticated user.
  `create`      `create.ts`      Add a new note to DB.
  `update`      `update.ts`      Modify existing note.
  `delete`      `delete.ts`      Delete a note by ID.
  `summarize`   `summarize.ts`   AI summarization of note content.
  `review`      `review.ts`      Fetch random subset of notes for study.
  `export`      `export.ts`      Generate and deliver export files.

All inputs validated via **Zod**, and each action requires valid
`sessionId`.

------------------------------------------------------------------------

### 4. **Database (astro:db)**

Schema in `db/config.ts`:

``` ts
export const FlashNote = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text(),
    title: column.text(),
    content: column.text(),
    tags: column.text(),
    summary: column.text(),
    createdAt: column.date({ default: now() }),
    updatedAt: column.date({ default: now() })
  },
  foreignKeys: [
    { columns: ["userId"], references: [User.id] }
  ]
});
```

Indexes recommended on `tags` and `updatedAt` for faster lookup.

------------------------------------------------------------------------

### 5. **AI Integration**

-   **Model:** GPTâ€‘4oâ€‘mini or GPTâ€‘5â€‘turbo (when available)
-   **Capabilities:**
    -   Summarize large notes into concise flash summaries.
    -   Simplify complex text for easier recall.
    -   Explain difficult topics interactively.
    -   Generate quiz questions from note content.

#### Prompt Template

    You are a learning assistant. Summarize or simplify this text for a student.
    Make it easy to recall and accurate.

    Text: {content}

Fallback templates exist under `src/templates/flashnote/`.

------------------------------------------------------------------------

### 6. **Export & Sharing**

-   Supported formats: `.pdf`, `.txt`, `.md`
-   Export grouped notes into a single document
-   Public share links with read-only access
-   Clipboard copy option for Markdown text

Handled by `server.flashnote.export()` using secure signed URLs.

------------------------------------------------------------------------

### 7. **Security & Session Handling**

-   Authentication required for all CRUD and AI endpoints.
-   Uses `server.auth` session middleware.
-   Notes isolated per `userId`.
-   Optional encryption for future premium tier.

------------------------------------------------------------------------

### 8. **Extensibility & Roadmap**

-   Add scheduling for spaced repetition.\
-   Integrate with Quiz Institute for quiz generation.\
-   Add folder structure (subjects).\
-   Enable AI "Study Coach" chat mode.\
-   Add mobile PWA offline sync.

------------------------------------------------------------------------

## âœ… Developer Notes

-   Match component structure to Resume Builder and Cover Letter apps.\
-   Use Tailwind responsive utilities for grid-based note layouts.\
-   Include test mock data under `src/data/mockFlashnotes.json`.\
-   Accessibility: focus rings, keyboard shortcuts, ARIA roles.\
-   All async calls toggle global loader store.

------------------------------------------------------------------------

**End of Document**\
*Authored for Ansiversa Engineering Codex by ChatGPT (GPTâ€‘5)*
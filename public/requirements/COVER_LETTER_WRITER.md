# ðŸ“ Ansiversa Cover Letter Writer --- Technical Specification

**Date:** October 17, 2025\
**App Code:** `cover-letter-writer`\
**Parent Project:** [Ansiversa](https://ansiversa.com)\
**Framework:** Astro + Alpine.js + Tailwind CSS + astro:db + OpenAI API

------------------------------------------------------------------------

## ðŸŽ¯ Overview

The **Cover Letter Writer** is a mini app within Ansiversa designed to
help users automatically generate, customize, and export professional
cover letters using AI. It complements the Resume Builder app and shares
schema and session logic for user authentication, profile management,
and document export.

------------------------------------------------------------------------

## ðŸ§© Architecture Layers

### 1. **UI & Pages (Astro)**

-   **Primary Page:** `src/pages/cover-letter-writer.astro`
-   **Layout:** Inherits from `src/layouts/Layout.astro`
-   **Sections:**
    -   Hero section with short intro and CTA to start writing.
    -   Editor section with AI input prompts and customization panel.
    -   Export/download panel for PDF or Word format.

#### Components

-   `CoverLetterEditor.astro` --- main editable form interface.
-   `TemplateSelector.astro` --- dropdown to choose between templates
    (Formal, Modern, Minimalist).
-   `AIControls.astro` --- buttons for "Generate", "Improve", "Rewrite
    Tone", and "Summarize".
-   `ExportPanel.astro` --- handles export options for PDF/DOCX and save
    to user library.
-   `Loader.astro` --- shows loading animation during AI actions.

All components follow Tailwind-based design tokens defined in
`global.css` and support dark mode via CSS variables.

------------------------------------------------------------------------

### 2. **Client State (Alpine.js)**

-   **Store File:** `src/alpineStores/coverLetter.ts`
-   **State Keys:**
    -   `userInput`: position, company, skills, achievements
    -   `aiOutput`: generated letter text
    -   `selectedTemplate`: current template key
    -   `loading`: boolean for AI fetch state
    -   `tone`: formal, casual, friendly
-   **Methods:**
    -   `generate()`: sends data to `server.coverLetter.generate`
    -   `improve()`: sends data to `server.coverLetter.improve`
    -   `rewriteTone(tone)`: updates text style accordingly
    -   `saveLetter()`: persists final version to DB

------------------------------------------------------------------------

### 3. **Server Actions (astro:actions)**

-   **Action Registry Path:** `src/actions/coverLetter/index.ts`
-   **Namespace:** `server.coverLetter`

#### Actions Table

  ------------------------------------------------------------------------
  Name              File              Description
  ----------------- ----------------- ------------------------------------
  `generate`        `generate.ts`     Uses OpenAI to draft a first version
                                      from user prompts.

  `improve`         `improve.ts`      Refines tone, grammar, and
                                      structure.

  `rewriteTone`     `tone.ts`         Adjusts tone (formal, friendly,
                                      confident).

  `save`            `save.ts`         Persists data to DB via typed
                                      helpers.

  `export`          `export.ts`       Generates downloadable PDF/DOCX.
  ------------------------------------------------------------------------

All actions use Zod for input validation and can fall back to heuristic
templates if the OpenAI API key is missing.

------------------------------------------------------------------------

### 4. **Database (astro:db)**

Schema additions in `db/config.ts`:

``` ts
export const CoverLetter = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text(),
    title: column.text(),
    content: column.text(),
    tone: column.text(),
    createdAt: column.date({ default: now() })
  },
  foreignKeys: [
    { columns: ["userId"], references: [User.id] }
  ]
});
```

Seed not required (user-generated).

------------------------------------------------------------------------

### 5. **AI Integration**

-   **Model:** OpenAI GPTâ€‘4o-mini (or equivalent)

-   **Prompt Structure:**

        You are a professional HR assistant.
        Generate a concise, tailored cover letter for the position of {position} at {company}.
        Emphasize skills: {skills}, achievements: {achievements}, and tone: {tone}.

-   **Fallback Mode:** Uses predefined templates stored in
    `src/templates/coverLetters/*.txt` if API unavailable.

------------------------------------------------------------------------

### 6. **Export & File Handling**

Supported formats: - `.pdf` via `reportlab` (server-side) - `.docx` via
`python-docx` or Astro action calling node module - Saved drafts stored
in `CoverLetter` table with metadata

Download buttons trigger `server.coverLetter.export()` which sends a
signed download link to the user.

------------------------------------------------------------------------

### 7. **Security & Session Handling**

-   Requires login via `server.auth.session` before writing or saving
-   Session validated in middleware (`src/middleware.ts`)
-   Each letter linked to authenticated `userId`
-   Rate limit AI calls per user to avoid misuse

------------------------------------------------------------------------

### 8. **Extensibility & Future Plans**

-   Add "Import from Resume" integration to auto-pull job titles and
    achievements
-   Add collaborative editing with live preview
-   Integrate grammar checker via LanguageTool API
-   Allow direct email sending via `email.server.ts`

------------------------------------------------------------------------

## âœ… Developer Notes

-   Keep actions and UI modular---mirror the same folder structure as
    Resume Builder.
-   Use common styling utilities and design tokens for visual
    consistency.
-   Include test data and mock mode for development without OpenAI API.
-   Ensure accessibility (labels, ARIA roles, keyboard navigation).

------------------------------------------------------------------------

**End of Document**\
*Authored for Ansiversa Engineering Codex by ChatGPT (GPTâ€‘5)*
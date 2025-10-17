# ðŸ’³ Ansiversa Visiting Card Maker --- Technical Requirement Document

**Date:** October 17, 2025\
**App Code:** `visiting-card-maker`\
**Parent Project:** [Ansiversa](https://ansiversa.com)\
**Framework:** Astro + Alpine.js + Tailwind CSS + astro:db + OpenAI API

------------------------------------------------------------------------

## ðŸŽ¯ Overview

The **Visiting Card Maker** mini app enables users to design, customize,
and export professional digital or printable business cards. It
integrates templates, themes, and AI-assisted tagline generation for
sleek, personalized designs.\
This tool supports creative professionals, entrepreneurs, and students
who want to generate a modern visiting card quickly without using
external design software.

------------------------------------------------------------------------

## ðŸ§© Architecture Layers

### 1. **UI & Pages (Astro)**

-   **Primary Page:** `src/pages/visiting-card.astro`
-   **Layout:** Extends `src/layouts/Layout.astro`
-   **Sections:**
    -   Template Gallery (grid of default card templates)
    -   Customization Form (fields and theme settings)
    -   Live Card Preview (instant update on edit)
    -   Export & Share panel

#### Components

-   `CardPreview.astro` --- Displays live-rendered preview of card data.
-   `TemplateSelector.astro` --- Grid view of available template
    designs.
-   `CardForm.astro` --- Input form (Name, Title, Company, Email, Phone,
    Address, Website).
-   `ThemeSelector.astro` --- Allows color and typography adjustments.
-   `AIControls.astro` --- Generates AI-powered taglines or slogans.
-   `ExportPanel.astro` --- Handles PDF/PNG exports and save operations.
-   `Loader.astro` --- Displays during AI generation or export tasks.

All components follow **Tailwind design tokens** and Ansiversa's
`--ans-primary` theme consistency.

------------------------------------------------------------------------

### 2. **Client State (Alpine.js)**

-   **Store File:** `src/alpineStores/visitingCard.ts`
-   **State Keys:**
    -   `cardData`: {"name": "","title": "","company": "","email":
        "","phone": "","address": "","tagline": ""}
    -   `theme`: selected theme name or palette
    -   `template`: chosen template key
    -   `aiTagline`: string (AI-generated tagline)
    -   `preview`: rendered preview image URL
    -   `loading`: boolean state
-   **Methods:**
    -   `generateTagline()`: calls `server.card.generateTagline()`
    -   `updatePreview()`: re-renders preview based on form updates
    -   `exportCard(format)`: triggers export (PDF/PNG/SVG)
    -   `saveCard()`: persists design to DB
    -   `resetCard()`: clears user input and resets defaults

------------------------------------------------------------------------

### 3. **Server Actions (astro:actions)**

-   **Namespace:** `server.card`
-   **Path:** `src/actions/visitingCard/index.ts`

  -------------------------------------------------------------------------
  Action                File             Description
  --------------------- ---------------- ----------------------------------
  `generateTagline`     `aiTagline.ts`   Generates creative taglines using
                                         OpenAI API.

  `save`                `save.ts`        Saves user design to database.

  `list`                `list.ts`        Lists saved designs for the user.

  `delete`              `delete.ts`      Deletes saved designs.

  `export`              `export.ts`      Exports card design to PDF/PNG/SVG
                                         format.
  -------------------------------------------------------------------------

All server actions require authenticated sessions and use **Zod** for
validation.

------------------------------------------------------------------------

### 4. **Database (astro:db)**

Schema snippet for `db/config.ts`:

``` ts
export const VisitingCard = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text(),
    name: column.text(),
    title: column.text(),
    company: column.text(),
    email: column.text(),
    phone: column.text(),
    address: column.text(),
    tagline: column.text(),
    theme: column.text(),
    template: column.text(),
    createdAt: column.date({ default: now() }),
    updatedAt: column.date({ default: now() })
  },
  foreignKeys: [
    { columns: ["userId"], references: [User.id] }
  ]
});
```

No seed data required; all cards are user-generated.

------------------------------------------------------------------------

### 5. **AI Integration**

-   **Model:** GPTâ€‘4o-mini or GPTâ€‘5-turbo.\

-   **Purpose:** Generate concise and professional taglines/slogans.\

-   **Prompt Example:**

        You are a creative branding assistant.  
        Write a short, professional tagline for the following business card details:  
        Name: {name}, Company: {company}, Role: {title}.  
        The tagline should sound modern and confident.

-   **Fallback:** Uses locally stored tagline templates
    (`src/templates/taglines.txt`) if no API key.

------------------------------------------------------------------------

### 6. **Export & File Handling**

-   Supported formats: `.pdf`, `.png`, `.svg`
-   Server action `server.card.export()` converts preview to
    downloadable file using `puppeteer` or `html-to-image`.
-   Option to embed QR codes linking to company or user profile.
-   Stored exports saved temporarily in `/public/exports/` before
    cleanup.

------------------------------------------------------------------------

### 7. **Security & Session Handling**

-   Authentication enforced for save/export operations.
-   Session validated through `server.auth.session`.
-   All card records isolated by `userId`.
-   API rate limit: 10 AI generations per user/day (configurable).

------------------------------------------------------------------------

### 8. **Extensibility & Future Roadmap**

-   Add support for **logo uploads** and drag-to-position controls.
-   Add double-sided card templates (front/back view).
-   Enable QR color customization.
-   Allow community template uploads with moderation.
-   Integrate with FlashNote/Resume for unified identity tools.
-   Provide "Save as Template" for business branding reuse.

------------------------------------------------------------------------

## âœ… Developer Notes

-   Mirror structure of Resume Builder app for consistency.
-   Maintain responsive grid (2--3 columns for templates).
-   Ensure print exports use vector-based fonts for clarity.
-   Use Alpine `loader` store for smooth user feedback.
-   Apply ARIA roles for accessibility compliance.

------------------------------------------------------------------------

**End of Document**\
*Authored for Ansiversa Engineering Codex by ChatGPT (GPTâ€‘5)*
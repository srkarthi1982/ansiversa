# Ansiversa Application Architecture Overview

This document explains how the Ansiversa Astro application is organized across the UI, state management, server actions, and database layers. It is designed to help AI agents and engineers quickly understand the moving pieces of the project.

## 1. Technology Stack at a Glance
- **Framework:** [Astro](https://astro.build) with server-side rendering for pages and actions.
- **Styling:** Tailwind CSS utility classes for layout, color, and component styling.
- **Client State:** [Alpine.js](https://alpinejs.dev) stores registered globally for lightweight interactivity.
- **Server Actions:** `astro:actions` for typed, server-side mutations and queries.
- **Database:** `astro:db` with schema definitions in TypeScript and optional seed data.
- **AI Integrations:** OpenAI completions for resume content improvements.

## 2. UI Composition
### Layout and Pages
- **Entry Layout:** `src/layouts/Layout.astro` (imported by most pages) wraps content with the global `<head>` settings and site chrome.
- **Home Page:** `src/pages/index.astro` renders marketing copy, pricing tiers, and deep links for the 100 mini-app experiences. Data for categories and plans is prepared in frontmatter before being rendered inside a Tailwind-styled `<main>` layout.
- **Mini Apps:** Each app has its own page under `src/pages/` (e.g., `/quiz`, `/resume-builder`), which can import shared components and Alpine stores as needed.

### Reusable Components
- Components live in `src/components/` (e.g., `Button.astro`, `Dropdown.astro`, `Modal.astro`).
- Components accept typed props in the frontmatter script block and merge Tailwind class variants to produce consistent styling. For example, `Button.astro` builds variant and size class maps before rendering either an anchor or button element based on the presence of `href`.

## 3. Client State with Alpine Stores
- **Bootstrap:** `src/alpineStores/index.ts` imports every store module once so they register globally with Alpine as soon as the bundle loads.
- **Loader Store:** `src/alpineStores/loader.ts` keeps a reference count of in-flight operations, exposing a `visible` getter that becomes `true` when any consumer calls `show()` without a matching `hide()`.
- **Page-Specific Stores:** Modules such as `src/alpineStores/home.ts` orchestrate per-page UI state (e.g., toggling the loader during initialization). Additional folders under `src/alpineStores/` group logic by feature domains like authentication, quiz management, resume editing, documentation, and admin tooling.

## 4. Server Actions and API Surface
- **Action Registry:** `src/actions/index.ts` exports a `server` object that organizes actions into `auth`, `quiz`, and `resume` namespaces. This allows Astro pages and client scripts to call `server.auth.login`, `server.quiz.fetchPlatforms`, etc.
- **Auth Actions:** Defined in `src/actions/auth/`. The `login` action validates credentials with Zod, verifies hashed passwords, and issues new sessions via helper utilities. Other actions cover registration, password resets, and logout flows.
- **Quiz Actions:** `src/actions/quiz/platform.ts` and `src/actions/quiz/subject.ts` manage CRUD and filtering logic against the Astro DB tables using SQL helpers like `eq`, `and`, and `count`.
- **Resume Actions:** `src/actions/resume/` exposes CRUD helpers, export tooling, AI-assisted improvements, and default resume management. AI improvement (`ai-improve.ts`) can fall back to local heuristics when an OpenAI API key is absent.
- **Shared Helpers:** `src/actions/auth/helpers.ts` and `src/actions/resume/utils.ts` contain password hashing, token creation, session cookies, access guards, and row normalization.

## 5. Database Layer (`astro:db`)
- **Schema Definition:** `db/config.ts` declares tables for `User`, `Session`, authentication tokens, quiz `Platform` and `Subject` catalogs, and resume entities (`Resume`, `ResumeExport`). Relationships use foreign key references where appropriate.
- **Seed Data:** `db/seed.ts` inserts canonical quiz platform rows (e.g., "Medical", "Engineering", "Programming") to provide immediate content for listing screens. Extend this seed to add subjects or additional datasets.

## 6. Utilities, Middleware, and Cross-Cutting Concerns
- **Session Utilities:** `src/utils/session.server.ts` hashes session tokens, looks up active sessions, and fetches the associated user row. Both actions and middleware rely on these helpers.
- **Middleware:** `src/middleware.ts` runs before page rendering to guard routes like `/dashboard` and `/settings`, redirecting unauthenticated users to the login page while skipping API/action requests.
- **Email Support:** `src/utils/email.server.ts` (placeholder) can be expanded for transactional emails such as verification or reset links.

## 7. Data and Control Flow Summary
1. **Client Interaction:** Pages render via Astro components and Alpine stores initialize to handle local UI (loaders, forms, feature dashboards).
2. **Server Actions:** Client scripts or forms submit to `astro:actions` endpoints, which validate input with Zod and manipulate the database through typed helpers.
3. **State Persistence:** Authentication uses hashed tokens stored in the `Session` table and signed cookies. Quiz and resume features read/write to their respective tables, often normalizing data before returning it to the client.
4. **AI Assistance:** When available, resume actions call OpenAI to rewrite content; otherwise they return deterministic fallback text to keep UX functional offline.

## 8. Extending the App
- Add new features by creating a page under `src/pages/`, defining supporting Alpine stores in `src/alpineStores/feature/`, and registering the store in `src/alpineStores/index.ts`.
- Implement server-side logic with a new action file in `src/actions/<feature>/` and export it via `src/actions/index.ts`.
- Update the database schema in `db/config.ts` and rerun Astro DB migrations/seeds when persistent storage changes are required.
- Reuse components in `src/components/` or add new ones to maintain consistent design across the 100 mini apps.


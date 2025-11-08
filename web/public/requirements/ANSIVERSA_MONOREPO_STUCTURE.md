
# Ansiversa Monorepo Structure & Migration Guide
**Status:** November 2025  
**Audience:** Codex and contributors  
**Goal:** Clearly document the new repo layout and provide exact rules to split code currently under `/web` into the dedicated projects: **web**, **core**, **admin**, and **components**.

---

## 1) Repository Layout (Topâ€‘Level)

```
/
â”œâ”€ web/         # Public facing site (ansiversa.com) â€” Astro app (SSR + islands)
â”œâ”€ core/        # Backend/API (core.ansiversa.com) â€” Astro API project (server actions, endpoints)
â”œâ”€ admin/       # Internal admin app (admin.ansiversa.com) â€” Astro app
â”œâ”€ components/  # Shared UI library (component.ansiversa.com) â€” Astro + Tailwind + Alpine components
â”œâ”€ package.json # Optional workspaces root (if using pnpm/npm workspaces)
â”œâ”€ turbo.json   # Optional (if using Turborepo for pipelines)
â””â”€ README.md
```

> Each folder is a **separate project** with its own `package.json`, `astro.config.mjs`, and build output.  
> Domains (assumed):
> - **web/** â†’ `https://www.ansiversa.com`
> - **core/** â†’ `https://core.ansiversa.com` (API)
> - **admin/** â†’ `https://admin.ansiversa.com`
> - **components/** â†’ `https://component.ansiversa.com` (component gallery/docs)

---

## 2) Project Purposes & Responsibilities

### `web/` (Public App)
- Marketing pages, pricing, docs, public dashboards (nonâ€‘admin).
- Client interactivity via Alpine stores.
- Reads data via **server actions** or public API calls to **core**.
- **No** admin routes, **no** private dashboards here.

### `core/` (API & Server)
- Central server actions, REST endpoints under `src/pages/api/*`, and worker-style jobs.
- Owns **Astro DB** schema & migrations (or external DB client).
- Security boundary: all privileged logic belongs here.
- Issues/read/writes for Quiz, Accounts, Payments, etc.

### `admin/` (Back Office)
- Authâ€‘gated admin UI, CMSâ€‘like tools, data editing panels.
- Calls into **core** via server actions or private API endpoints.
- Zero public marketing content.

### `components/` (Design System)
- Reusable UI components (Astro + Tailwind + Alpine), tokens, utilities.
- Ship as a local package (e.g., `@ansiversa/components`) consumed by `web` and `admin`.
- Host a component catalog/demo site.

---

## 3) Workspace Basics (optional but recommended)

At the repo root, enable workspaces to share dependencies and speed CI:

**`package.json` (root)**
```json
{
  "name": "ansiversa",
  "private": true,
  "workspaces": ["web", "core", "admin", "components"]
}
```

If using **pnpm**, replace with `pnpm-workspace.yaml`:

```yaml
packages:
  - "web"
  - "core"
  - "admin"
  - "components"
```

> You can also add `turbo.json` to orchestrate builds/test/lint across apps.

---

## 4) Environment Variables (by project)

| Var | web | core | admin | components |
| --- | --- | ---- | ----- | ---------- |
| `ASTRO_DB_URL` | â€” | âœ” | â€” | â€” |
| `ASTRO_DB_AUTH_TOKEN` | â€” | âœ” | â€” | â€” |
| `PUBLIC_API_BASE` | âœ” (points to core) | â€” | âœ” (points to core) | â€” |
| `AUTH_*` | (public flows) | (token/secret mgmt) | (admin auth) | â€” |
| `PAYMENTS_*` | â€” | âœ” | â€” | â€” |

> **Rule:** Secrets live in **core**. `web`/`admin` receive only the public base URL and nonâ€‘secret config.

---

## 5) Dependency Graph

```
components  â†’  web
components  â†’  admin
core        â†  web (calls API/actions)
core        â†  admin (calls API/actions)
```

- **components** must have **no** imports from other projects (pure UI).
- **web/admin** never import serverâ€‘only code directly from **core**; they call via actions/API.

---

## 6) Splitting Files Out of `/web` â€” Precise Rules

Codex, follow these rules to move code currently under `web/` to the proper targets.

### 6.1 Admin vs Public Routes
- **Move** any route that requires admin authentication or data management UIs to `admin/src/pages/**`.
  - Examples: `/admin/**`, `/dashboard/**` (if staffâ€‘only), `/cms/**`, `/manage/**`.
- **Keep** public marketing and userâ€‘facing routes in `web/src/pages/**`.
  - Examples: `/`, `/pricing`, `/features`, `/quiz/**` (endâ€‘user play).

### 6.2 API Endpoints & Server Actions
- **Move** all `src/pages/api/**` endpoints to **core**: `core/src/pages/api/**`.
- **Move** server actions that perform privileged logic (DB writes, secrets, payments) to `core/src/actions/**` or `core/src/pages/**` (actions).
- **Keep** thin, UIâ€‘bound actions in `web` only if they **do not** touch secrets or DB directly; otherwise **refactor** them to call corresponding **core** actions/API.

**Before (web):**
```
web/src/pages/api/quiz/create.ts
web/src/actions/payments/charge.ts
```

**After:**
```
core/src/pages/api/quiz/create.ts
core/src/actions/payments/charge.ts
web/src/actions/quiz/create.ts  # thin proxy that calls core
```

### 6.3 Database & Schema
- **Relocate** Astro DB (or DB client) ownership to **core**:
  - `web/src/db/**` â†’ `core/src/db/**`
  - `web/db/config/*` â†’ `core/db/config/*`
- **Replace** any direct DB imports in `web/admin` with API/action calls to **core**.

### 6.4 Shared UI & Utilities
- **Promote** reusable UI components to `components/src/*`.
  - Tokens, Tailwind plugin/config snippets, Alpine helpers, Astro components.
- **Refactor** imports in `web` and `admin` to consume `@ansiversa/components` (local workspace dep).
- Keep appâ€‘specific pages, layouts, and feature components within `web` or `admin` as appropriate.

**Before (web):**
```
web/src/components/Button.astro
web/src/components/Card.astro
web/src/components/forms/*
web/src/styles/tokens.css
```

**After:**
```
components/src/Button.astro
components/src/Card.astro
components/src/forms/*
components/src/tokens.css
(web/admin import from @ansiversa/components)
```

### 6.5 Config & Tailwind
- Consolidate **design tokens** and **tailwind config presets** in `components`.
  - Create `components/tailwind-preset.cjs` and import it in `web` & `admin` `tailwind.config.cjs`.
- Keep perâ€‘app Tailwind overrides local to each app.

### 6.6 Public Assets
- Appâ€‘specific assets remain with each app: `web/public/**`, `admin/public/**`.
- Shared brand assets can be copied or published from `components/public/**` if you want a single source.

### 6.7 Auth
- **core**: token issuing/verification, secrets, identity providers.
- **web/admin**: frontdoor routes and middleware that call into **core** for checks.

---

## 7) Import Path Changes

Configure local workspace dependency for the component library:

**`components/package.json`**
```json
{
  "name": "@ansiversa/components",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

**`web/package.json` & `admin/package.json`**
```json
{
  "dependencies": {
    "@ansiversa/components": "workspace:*"
  }
}
```

Then replace imports:

**Before**
```ts
import Button from "../components/Button.astro";
```

**After**
```ts
import Button from "@ansiversa/components/Button.astro";
```

(Or expose a barrel in `components/src/index.ts`.)

---

## 8) Network Boundaries (How `web/admin` call `core`)

1) **Server Actions to Server Actions**
- Create thin actions in `web/admin` that forward to `core` via fetch:
```ts
const res = await fetch(`${import.meta.env.PUBLIC_API_BASE}/actions/quiz/create`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payload)
});
return await res.json();
```

2) **REST Endpoints**
- Public/private endpoints live under `core/src/pages/api/**`.
- `web/admin` consume via `PUBLIC_API_BASE`.

> Ensure CORS and auth headers are configured on **core**.

---

## 9) Build & Deploy

- Each app has its own Vercel/host project:
  - `web` â†’ ansiversa.com
  - `core` â†’ core.ansiversa.com
  - `admin` â†’ admin.ansiversa.com
  - `components` â†’ component.ansiversa.com
- CI can be orchestrated by Turborepo (optional):
  - Pipelines: `build` on changed packages; cache `node_modules` & `.astro`

---

## 10) Exact Move Plan (Stepâ€‘byâ€‘Step for Codex)

> Starting point: All code currently in `web/`.

1. **Create Empty Scaffolds** (if not already present): `core/`, `admin/`, `components/` with their own `package.json` and `astro.config.mjs`.
2. **Move Admin UI**
   - Move `web/src/pages/admin/**` â†’ `admin/src/pages/**`
   - Move any staff dashboards from `web/src/pages/**` that are not public â†’ `admin/src/pages/**`
3. **Move API/Privileged Actions**
   - Move `web/src/pages/api/**` â†’ `core/src/pages/api/**`
   - Move `web/src/actions/**` that touch DB/secrets/payments â†’ `core/src/actions/**`
4. **Move Database Layer**
   - Move `web/src/db/**` and schema/migrations â†’ `core/src/db/**`
   - Replace direct DB imports in `web/admin` with calls to **core**
5. **Promote Shared UI**
   - Move reusable UI from `web/src/components/**` & `web/src/styles/**` â†’ `components/src/**`
   - Create `components/src/index.ts` barrel; expose key components
6. **Rewrite Imports**
   - In `web/` and `admin/`, change imports from relative `../components/*` to `@ansiversa/components/*`
7. **Introduce API Base**
   - Add `PUBLIC_API_BASE` to `web` and `admin` `.env` (points to **core** base URL)
8. **Refactor Thin Proxies**
   - For any former inâ€‘app actions, create thin proxies that call **core** and keep UIâ€‘specific validation/messages local
9. **Tailwind & Tokens**
   - Move tokens/preset into `components`; have `web/admin` `tailwind.config` extend from it
10. **Smoke Test**
    - Build each project individually: `pnpm -F web build`, `pnpm -F core build`, etc.
    - Run e2e happy paths: public pages load, admin auth wall, API endpoints respond

---

## 11) Acceptance Criteria

- `web` contains only public UI and thin nonâ€‘privileged actions. No direct DB imports.
- `admin` contains only admin UI. No direct DB imports.
- `core` owns DB, secrets, privileged actions, and API endpoints.
- `components` compiles and is consumable by both `web` and `admin`.
- Local builds and deploys succeed per project.
- Import paths reference `@ansiversa/components` where applicable.
- `.env` separation is respected and secrets are not present in `web`/`admin`.

---

## 12) Appendix â€” Suggested Files

**components/**
```
src/
  index.ts
  tokens.css
  forms/
  buttons/
  cards/
  layouts/
tailwind-preset.cjs
```

**core/**
```
src/
  db/
    schema.ts
    client.ts
  actions/
    quiz/
    payments/
  pages/
    api/
      quiz/
      auth/
```

**web/**
```
src/
  pages/
    index.astro
    pricing.astro
    quiz/*
  actions/   # thin proxies only
```

**admin/**
```
src/
  pages/
    index.astro
    dashboard/*
    content/*
  actions/   # thin proxies only
```

---

## 13) Notes & Assumptions

- **API host name** is assumed to be `core.ansiversa.com`. If it differs, update `PUBLIC_API_BASE` accordingly.
- Projects are Astroâ€‘based; adapt paths if a project uses a different framework.
- Use Alpine stores in `web/admin`; keep business logic in `core`.
- If legacy endpoints exist under `web`, they must be migrated or wrapped to forward to `core`.
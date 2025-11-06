
# Ansiversa Component Library â€” Requirements & Specification

**Version:** 0.1  
**Target repos:** `component.ansiversa` (npm package: `@ansiversa/components`)  
**Consumers:** `ansiversa.com` (public app) & `admin.ansiversa.com` (admin app)  
**Stack:** Astro + Alpine.js + Tailwind CSS

---

## 1) Goals & Nonâ€‘Goals

### Goals
- Provide a **shared, consistent** UI system used by both public and admin apps.
- Be **Tailwind-first** with **minimal client JS** and **Alpine-friendly** behavior.
- Ship **tree-shakeable** `.astro` components and **theming via CSS variables**.
- Publish as an **npm package** with a Tailwind **preset** and **global CSS tokens**.
- Include a small set of **Alpine directives** for behaviors (e.g., click-outside).

### Nonâ€‘Goals
- No React/Svelte dependencies.
- No heavy JS frameworks; keep interactivity via Alpine or native browser APIs.
- No tightly coupled business logic; components are **presentational + small UX logic**.

---

## 2) Design System & Theming

### 2.1 Tokens (CSS Variables)
Define all semantic tokens in `src/styles/tokens.css`:
```css
:root {
  --ans-color-brand: 79 70 229;         /* #4f46e5 */
  --ans-color-brand-fg: 255 255 255;
  --ans-color-surface: 255 255 255;
  --ans-color-text: 15 23 42;           /* slate-900 */
  --ans-radius: .75rem;
  --ans-gap: .75rem;
  --ans-focus: 59 130 246;              /* sky-500 */
}
```

### 2.2 Tailwind Preset
Expose a preset at `@ansiversa/components/tailwind-preset` with color bindings to the CSS vars.
Consumers add:
```js
// tailwind.config.cjs in apps
const ansPreset = require('@ansiversa/components/tailwind-preset');
module.exports = { content: ["./src/**/*.{astro,js,ts}"], presets: [ansPreset] };
```

### 2.3 Base Styles
Provide resets and accessibility defaults in `src/styles/base.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root { color-scheme: light; }
  *:focus-visible {
    outline: 2px solid rgb(var(--ans-focus));
    outline-offset: 2px;
  }
}
```

---

## 3) API & Conventions

### 3.1 Props & Names
- `class`: String to extend styling (always last in class merge).
- `as`: Optional tag switch (`'button' | 'a' | 'div'`).
- `variant`, `size`: Limited, documented enums.
- Use **slots** for flexible composition.
- All boolean props default to `false` (unless otherwise stated).

### 3.2 Accessibility
- All interactive components must be keyboard-navigable.
- Modals, Dialogs, Menus: focus trapping, `Esc` close, `aria-*` attributes.
- Use proper semantics: `<button>`, `<label for>`, `<nav>`, `<dialog>` etc.
- Provide `sr-only` text for icon-only buttons.

### 3.3 Performance
- No global JS by default; Alpine is initialized by the consumer app.
- Components that need behavior expose **data-attributes** or **Alpine snippets**.
- Tree-shakeable exports; no side-effectful imports except CSS (declared in `package.json`).

### 3.4 Testing & QA
- Visual: basic screenshots (Story-like examples inside `/examples`).  
- Behavior: â€œhappy-pathâ€ E2E checks using Playwright in the consumer apps.  
- Lint/style: run `astro check` + `tsc --noEmit` in CI.

---

## 4) Component Inventory (Priority & Usage)

Legend: **P0 Core**, **P1 Recommended**, **P2 Niceâ€‘toâ€‘Have**  
Apps: **A** = Admin, **P** = Public (ansiversa.com)

### 4.1 Primitives
| Component | Priority | Apps | Description & Notes |
|---|---|---|---|
| Button | P0 | A,P | Variants: `primary`, `secondary`, `ghost`; Sizes: `sm, md, lg`; `<a>` or `<button>`. |
| Badge | P1 | A,P | Small status labels. Variants: `neutral, success, warning, danger`. |
| Tag | P2 | A,P | Removable chips with optional leading/trailing icons. |
| Icon | P2 | A,P | Wrapper for SVG icons; supports `title` for a11y. |

### 4.2 Form Controls
| Component | Priority | Apps | Description & Notes |
|---|---|---|---|
| Input | P0 | A,P | Text, email, password; with `prefix`/`suffix` slots. |
| Textarea | P0 | A,P | Resizable; character counter (optional). |
| Select | P0 | A,P | Native `<select>` styled; supports `hint`/`error`. |
| Checkbox | P0 | A,P | Indeterminate support. |
| RadioGroup / Radio | P1 | A,P | For grouped choices. |
| Switch (Toggle) | P1 | A | Accessible checkbox under the hood. |
| InputGroup | P1 | A,P | Label + control + help + error layout. |
| FileUpload | P2 | A | Basic styled file input; dragâ€‘nâ€‘drop optional. |
| DateInput (native) | P2 | A | Style the native input; avoid heavy datepicker. |

### 4.3 Feedback
| Component | Priority | Apps | Description & Notes |
|---|---|---|---|
| Alert | P0 | A,P | Inline info/success/warning/danger. |
| Toast | P1 | A,P | Simple Alpine store for transient messages. |
| Skeleton | P1 | A,P | Loading placeholder blocks. |
| Spinner | P1 | A,P | Minimal CSS spinner. |

### 4.4 Data Display
| Component | Priority | Apps | Description & Notes |
|---|---|---|---|
| Card | P0 | A,P | Surface container with padding/shadow. |
| Table | P0 | A | Basic table + responsive wrapper; sortable headers (optional). |
| KeyValue | P1 | A,P | 2â€‘column descriptive list. |
| Avatar | P2 | A,P | Round images, initials fallback. |
| Stat | P2 | A,P | KPI blocks (value + label + trend). |
| Progress | P2 | A,P | Linear progress bar. |

### 4.5 Navigation
| Component | Priority | Apps | Description & Notes |
|---|---|---|---|
| Navbar | P0 | P | Top navigation (logo, links, CTA). |
| Sidebar | P0 | A | Collapsible; nested items; active state. |
| Breadcrumbs | P1 | A,P | Simple separator style. |
| Tabs | P1 | A,P | Alpineâ€‘controlled; keyboard nav. |
| Pagination | P1 | A,P | Compact; page numbers + next/prev. |

### 4.6 Overlays & Menus
| Component | Priority | Apps | Description & Notes |
|---|---|---|---|
| Modal (Dialog) | P0 | A,P | Focus trap, ESC close, `x-on:click.outside`. |
| Drawer | P1 | A | Slideâ€‘in panel for admin forms. |
| Dropdown | P1 | A,P | Positioning near trigger; dismiss on outside click. |
| ConfirmDialog | P1 | A,P | Reusable confirmation pattern using Modal. |

### 4.7 Layout Primitives
| Component | Priority | Apps | Description & Notes |
|---|---|---|---|
| Container | P0 | A,P | Centers content, sets maxâ€‘widths. |
| Stack | P0 | A,P | Vertical spacing utility with CSS var gap. |
| Grid | P1 | A,P | Simple responsive grid helpers. |
| Section | P1 | P | Page sections with consistent padding/headings. |
| Toolbar | P1 | A | Actions row with spacing & wrap. |

### 4.8 Utilities (Alpine helpers)
| Item | Priority | Apps | Description & Notes |
|---|---|---|---|
| `x-outside` directive | P0 | A,P | Click outside to dismiss. |
| Toast store | P1 | A,P | Alpine store: `Toast.show({title, message, type})`. |
| Modal store | P2 | A,P | Programmatic open/close. |

---

## 5) Component Specifications (Key P0s)

### 5.1 Button
**Props**
- `as?: 'button' | 'a'` (default: `'button'`)
- `href?: string` (when `as='a'`)
- `variant?: 'primary' | 'secondary' | 'ghost'` (default: `'primary'`)
- `size?: 'sm' | 'md' | 'lg'` (default: `'md'`)
- `disabled?: boolean` (default: `false`)
- `class?: string`

**Behavior**
- Active state: shrink on press (`active:scale-[.98]`).
- Focus-visible outline via tokens.

**Example**
```astro
<Button variant="secondary" size="sm">Cancel</Button>
```

---

### 5.2 Input
**Props**
- `id?: string`, `type?: string` (default `'text'`), `placeholder?: string`, `value?: string`
- `error?: string`, `hint?: string`, `class?: string`
- Slots: `prefix`, `suffix`

**Example**
```astro
<Input id="email" type="email" placeholder="you@example.com" />
```

---

### 5.3 Modal (Dialog)
**Requirements**
- `x-data="{ open: boolean }"`; `x-show="open"`
- Close on `Esc`, and on outside click
- Trap focus (use a tiny utility or keep content simple)

**Slots**
- `title`, default, `actions`

**Example**
```astro
<Modal open={false}>
  <h3 slot="title">Delete item</h3>
  <p>Are you sure?</p>
  <div slot="actions">
    <Button variant="secondary">Cancel</Button>
    <Button>Delete</Button>
  </div>
</Modal>
```

---

### 5.4 Table
**Features**
- Base: styled `<table>` with `<thead>`, `<tbody>`
- Optional: sortable headers via Alpine ordering state
- Responsive: wrapper with horizontal scroll on small screens

**Example**
```astro
<Table>
  <thead>...</thead>
  <tbody>...</tbody>
</Table>
```

---

## 6) Project Structure

```
src/
  index.ts
  styles/
    tokens.css
    base.css
    components.css
  tailwind/
    preset.js
  alpine/
    directives.ts  # x-outside
    stores/
      toast.ts     # optional
  components/
    primitives/
      Button.astro
      Badge.astro
      Card.astro
      Input.astro
      Checkbox.astro
      Radio.astro
      Switch.astro
    feedback/
      Alert.astro
      Spinner.astro
      Skeleton.astro
      Toast.astro
    data/
      Table.astro
      KeyValue.astro
      Progress.astro
      Stat.astro
    nav/
      Navbar.astro
      Sidebar.astro
      Tabs.astro
      Breadcrumbs.astro
      Pagination.astro
    overlay/
      Modal.astro
      Drawer.astro
      Dropdown.astro
      ConfirmDialog.astro
    layout/
      Container.astro
      Stack.astro
      Grid.astro
      Section.astro
      Toolbar.astro
examples/
  *.astro
```

---

## 7) Consumer Integration Steps (Both Apps)

1. **Install**
   ```bash
   npm i @ansiversa/components alpinejs
   ```

2. **Tailwind preset**
   ```js
   // tailwind.config.cjs
   const ansPreset = require('@ansiversa/components/tailwind-preset');
   module.exports = {
     content: ["./src/**/*.{astro,js,ts}"],
     presets: [ansPreset],
   };
   ```

3. **Global CSS imports**
   ```css
   /* src/styles/global.css */
   @import "@ansiversa/components/tokens.css";
   @import "@ansiversa/components/base.css";
   /* optional */
   @import "@ansiversa/components/components.css";
   ```

4. **Alpine init (once)**
   ```ts
   // src/scripts/alpine.ts
   import Alpine from 'alpinejs';
   import { registerAlpineDirectives } from '@ansiversa/components/alpine';
   registerAlpineDirectives(Alpine);
   (window as any).Alpine = Alpine;
   Alpine.start();
   ```

5. **Use components**
   ```astro
   ---
   import { Button, Card, Input, Modal } from '@ansiversa/components';
   ---
   <Card class="p-4">
     <h3 class="text-lg font-semibold">Login</h3>
     <div class="mt-3 space-y-2">
       <Input placeholder="Email" />
       <Input placeholder="Password" type="password" />
     </div>
     <div class="mt-4">
       <Button>Sign in</Button>
     </div>
   </Card>
   ```

---

## 8) Publishing & Versioning

- **Package name:** `@ansiversa/components`
- **Access:** public
- **Commands:**
  ```bash
  npm version patch|minor|major
  npm publish --access public
  ```
- Adopt **Changesets** or **semantic-release** later for automated releases.

---

## 9) Acceptance Criteria (per component)

For each component to be **â€œdoneâ€**:
- âœ… Props documented in component JSDoc.
- âœ… At least one example in `/examples`.
- âœ… Keyboard + screen reader friendly (a11y notes in md).
- âœ… Visual states: hover, active, disabled, focus-visible.
- âœ… Theming works via tokens; no hard-coded brand colors.
- âœ… Zero or minimal Alpine dependence (unless interactive).

---

## 10) Work Plan for Codex

**Phase 1 â€” Core (P0)**  
- Primitives: Button, Card  
- Forms: Input, Checkbox, Select, Textarea  
- Layout: Container, Stack  
- Overlays: Modal  
- Data: Table  
- Feedback: Alert, Spinner

**Phase 2 â€” Recommended (P1)**  
- Navigation: Sidebar, Navbar, Tabs, Breadcrumbs, Pagination  
- Feedback: Toast, Skeleton  
- Forms: RadioGroup, Switch, InputGroup

**Phase 3 â€” Nice-to-Have (P2)**  
- Overlays: Drawer, Dropdown, ConfirmDialog  
- Data: Progress, Stat, KeyValue  
- Visuals: Avatar, Tag, Grid, Section, Toolbar

---

## 11) Example Component Specs (Quick Templates)

### 11.1 Button.astro (Template)
```astro
---
interface Props {
  as?: 'button' | 'a';
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  class?: string;
  disabled?: boolean;
}
const { as='button', href, variant='primary', size='md', class:className='', disabled=false } = Astro.props;
const base='inline-flex items-center justify-center rounded-[var(--ans-radius)] font-medium transition active:scale-[.98] focus-visible:outline-none';
const sizes={ sm:'h-8 px-3 text-sm', md:'h-10 px-4 text-sm', lg:'h-12 px-5 text-base' }[size];
const variants={ primary:'bg-brand text-brand-fg hover:opacity-95 shadow', secondary:'bg-slate-100 text-slate-900 hover:bg-slate-200', ghost:'bg-transparent text-slate-900 hover:bg-slate-100' }[variant];
const cls=`${base} ${sizes} ${variants} ${className}`;
---
{as==='a' ? <a href={href} class={cls}><slot /></a> : <button class={cls} disabled={disabled}><slot /></button>}
```

### 11.2 Modal.astro (Template)
```astro
---
interface Props { open?: boolean; class?: string; }
const { open=false, class:className='' } = Astro.props;
---
<div x-data="{ open: !!${open} }">
  <div x-show="open" x-transition.opacity class="fixed inset-0 bg-black/50"></div>
  <div x-show="open" x-transition x-on:keydown.escape.window="open=false" class="fixed inset-0 grid place-items-center p-4">
    <div class={`w-full max-w-lg rounded-[var(--ans-radius)] bg-white p-4 shadow ${className}`} x-on:click.outside="open=false">
      <slot name="title" />
      <slot />
      <div class="mt-4 flex justify-end gap-2"><slot name="actions" /></div>
    </div>
  </div>
</div>
```

---

## 12) Migration Notes (if replacing ad-hoc UI)

- Replace existing Tailwind classes incrementally, starting with **Buttons + Inputs + Card**.
- Keep existing Alpine logic; swap the DOM structure to the new components.
- Audit colors and replace hard-coded values with tokens.
- Update app Tailwind config to include the preset & content globs.

---

## 13) Checklist

- [ ] Repo scaffolded with structure in Â§6
- [ ] Tailwind preset exported
- [ ] tokens.css + base.css added and imported in both apps
- [ ] Alpine `x-outside` directive implemented
- [ ] Phase 1 components implemented with examples
- [ ] Publish `0.1.0` to npm
- [ ] Integrate into both apps; smoke test critical flows
- [ ] Tag release + write CHANGELOG

---

**End of document.**
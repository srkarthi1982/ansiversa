# ðŸŽ¨ Color Palette Generator â€” Full Requirements (Ansiversa)

Codexâ€‘ready specification for building the **Color Palette Generator** mini app. Target stack: **Astro (SSR)** + **Tailwind** + **Alpine.js** + **Astro DB**, deployed on **Vercel**. Generates accessible, brandâ€‘ready color systems with export to CSS/Tailwind/designâ€‘tool formats and imageâ€‘based extraction.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### What it does
Create beautiful, **accessible** color palettes from **seed colors**, **keywords**, or **images**. Supports **harmony rules** (analogous, triad, complementary), **shades/tints/tones**, **semantic tokens** (primary/success/warn), **dark/light themes**, **contrast checks** (WCAG 2.2 AA/AAA), **colorâ€‘blind simulators**, and exports (CSS variables, Tailwind config, JSON, **ASE**, **GPL**, SVG swatches).

### Core Features
- Inputs: seed color (#hex/rgb/hsl), multiple seeds, **image pick** (eyedropper + kâ€‘means extraction), or prompt keyword (e.g., â€œdesert duskâ€).  
- Generation: harmony sets (mono/analogous/triad/tetrad/comp/splitâ€‘comp), **10â€‘step scales** (50â€¦950), tints/tones/shades, neutral ramp, **accent pairs**, gradient pairs.  
- Accessibility: **WCAG contrast** matrix (AA/AAA for text & UI), automated **fixâ€‘ups** (adjust L*), **colorâ€‘blindness** (Prot/Deut/Trit) simulation with warnings.  
- Semantics: map to **design tokens** (`--color-primary-500`, `--surface-50`, `--text-strong`), generate **light/dark** themes with adaptive contrast.  
- Tools: hue/brightness/contrast sliders, **lock colors**, **harmonize** to brand base, **randomize** with constraints, **naming** (x11â€‘like/AI naming), **palette merge/split**.  
- Exports: CSS vars, Tailwind `theme.extend.colors`, SCSS map, JSON, **Adobe ASE**, **GIMP GPL**, **SVG** swatch sheet, **PNG** chips; **import** from JSON/ASE/GPL.  
- Integrations: push tokens to **Screenshot Editor**, **Presentation Designer**, **Visiting Card Maker**, and **Ansiversa theme**.

### Key Pages
- `/colors` â€” Generator (seed â†’ palette â†’ checks â†’ export).  
- `/colors/image` â€” Extract from image/logo (drop or paste; pick colors).  
- `/colors/tokens` â€” Semantic token editor & theme preview.  
- `/colors/presets` â€” Gallery (Materialâ€‘like ramps, pastel/neon sets, industry palettes).  
- `/colors/projects/[id]` â€” Project view (versions, exports, tokens).  
- `/colors/settings` â€” Defaults (contrast targets, format), brand locks.

### Minimal Data Model
`ColorProject`, `Palette`, `Color`, `Token`, `ExportArtifact`, `Preset`, `Profile`, `Quota`, `BrandLock`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Image extraction | âœ… (â‰¤4K) | âœ… (8K + advanced picker) |
| Palette size | up to 5 ramps | up to 12 ramps |
| Export formats | CSS/Tailwind/JSON | + ASE/GPL/SVG/PNG bundles |
| Contrast tools | Matrix | Matrix + autoâ€‘fix & batch validate |
| Colorâ€‘blind sim | Basic | Full (all types + severity) |
| Projects | 5 | 100 |
| Versions | 5 per project | 100 per project |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Information Architecture & Routes

**Pages**
- `/colors` â€” left: inputs & tools; center: ramps; right: contrast/tokens/preview; footer: export bar.  
- `/colors/image` â€” upload/paste; kâ€‘means clusters; eyedropper; background/foreground inference.  
- `/colors/tokens` â€” map palette to semantic tokens; preview components (buttons, cards, charts).  
- `/colors/presets` â€” browse, search, import/export presets.  
- `/colors/projects/[id]` â€” versions, diffs, exports.  
- `/colors/settings` â€” brand locks (primary hue, min contrast), default ramp size, naming style.

**API (SSR)**
- `POST /colors/api/generate` (seed(s), rules, options) â†’ `paletteId`  
- `POST /colors/api/extract` (image) â†’ seed candidates + suggested palette  
- `POST /colors/api/token/save` Â· `GET /colors/api/token/list?projectId=`  
- `GET  /colors/api/export?id=&fmt=css|tailwind|json|ase|gpl|svg|png`  
- `POST /colors/api/preset/save` Â· `POST /colors/api/preset/delete` Â· `GET /colors/api/preset/list`  
- `POST /colors/api/project/save` Â· `GET /colors/api/project/get?id=`

---

### 2) Generation Engine

- Color space: **OKLCH/OKLAB** for perceptual adjustments; convert to HEX/RGB/HSL for display.  
- Ramps: generate 10 stops by moving L* & C with easing (e.g., `easeOutCubic` for highlights).  
- Harmony rules: compute related hues with fixed/smart offsets; **lockable** seed(s) remain unchanged.  
- Neutral ramp: low chroma curve based on seed hue; ensure neutral grays still harmonize.  
- Gradient pairs: pick two distant but harmonious stops; output CSS linear/radial definitions.  
- Naming: assign friendly names (e.g., â€œOcean 500â€) and technical names (`--ocean-500`).

**Pseudocode**
```ts
function makeRamp(seed, steps=10) {
  const { l, c, h } = toOKLCH(seed);
  const ramp = [];
  for (let i=0;i<steps;i++){
    const t = i/(steps-1);
    ramp.push( fromOKLCH({ l: curveL(t, l), c: curveC(t, c), h }) );
  }
  return ramp;
}
```

---

### 3) Accessibility & Simulation

- **Contrast Matrix**: compute contrast ratio for each ramp stop vs text colors; flag pass/fail AA/AAA.  
- **Autoâ€‘fix**: adjust lightness (and minimally chroma) to reach target ratio without hue drift; never overâ€‘correct locked colors.  
- **Colorâ€‘blind Simulation**: protanopia/deuteranopia/tritanopia with severity slider; preview UI with simulated colors.  
- **Safe Pair Suggestions**: recommend text/background pairs that pass chosen target (AA/AAA).

---

### 4) Tokens & Theming

- Token groups: `background`, `surface`, `text`, `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `border`, `muted`, `accent`.  
- **Light/Dark** themes: derive dark tokens by inverting lightness curve and checking contrast; ensure component previews (buttons/links/cards/alerts/chips) pass targets.  
- **Tailwind Export**: generate `theme.extend.colors` and `:root` CSS variables for easy use.  
- **Semantic Map**: connect UI states (hover/focus/disabled) with adjusted stops.

---

### 5) Data Model (Astro DB / SQL)

**ColorProject**  
- `id` (uuid pk), `userId` (fk), `name` (text), `notes` (text|null), `createdAt`, `updatedAt`

**Palette**  
- `id` (pk), `projectId` (fk), `name` (text), `mode` ('generated'|'extracted'|'imported'), `seeds` (json), `rules` (json), `rampSize` (int), `createdAt`

**Color**  
- `id` (pk), `paletteId` (fk), `group` (text:'primary'|'secondary'|'neutral'|label), `step` (int:50..950), `hex` (text), `oklch` (json:{l,c,h}), `name` (text|null), `locked` (bool), `createdAt`

**Token**  
- `id` (pk), `projectId` (fk), `key` (text unique per project), `value` (text), `theme` ('light'|'dark'|'both'), `meta` (json)

**Preset**  
- `id` (pk), `userId` (fk|null), `name` (text), `config` (json)

**ExportArtifact**  
- `id` (pk), `projectId` (fk), `fmt` (text), `path` (text), `bytes` (int), `createdAt`

**BrandLock**  
- `id` (pk), `userId` (fk), `rules` (json:{primaryHue, minContrast, forbiddenHues[], allowedHues[]})

Indexes: `Palette.projectId`, `Color.paletteId+group+step`, `Token.projectId+key`, `ExportArtifact.projectId+fmt`.

---

### 6) UX / UI

- **Left panel**: seed inputs (HEX/RGB/HSL), harmony selector, sliders (hue/luma/chroma), locks, randomize; image upload with kâ€‘means clusters & eyedropper.  
- **Center**: ramp chips (50..950) with copyâ€‘hex; neutral ramp; gradient pairs; click to open color editor.  
- **Right**: contrast matrix (AA/AAA), colorâ€‘blind sim toggle, token mapping with live **component preview**.  
- **Footer**: export buttons (CSS/Tailwind/JSON/ASE/GPL/SVG/PNG); â€œcopy palette link.â€

Shortcuts: `R` randomize, `L` lock, `[` `]` step brightness, `C` copy hex, `T` toggle theme, `/` focus search.

---

### 7) Imports/Exports

- **Import**: JSON (palette + tokens), ASE, GPL. Validate and map to internal model.  
- **Export**:  
  - **CSS**: `:root { --color-primary-50: #... }` (light & dark).  
  - **Tailwind**: boilerplate `theme.extend.colors` and plugin snippet for CSS variables.  
  - **JSON**: full project (palettes + tokens).  
  - **ASE/GPL**: binary/text according to specs.  
  - **SVG/PNG**: swatch sheet with labels, contrast scores, and gradients.  

---

### 8) Processing & Performance

- Color math in **OKLAB/OKLCH** via JS library; conversions cached; heavy tasks in **WebWorker**.  
- Kâ€‘means extraction in worker; limit clusters (e.g., k=5..12); palette dedup via Î”E threshold.  
- Persist minimal state until user saves; big exports handled serverâ€‘side as needed (ZIP).  
- All contrast checks vectorized for speed; memoize results per token/theme.

---

### 9) Security, Privacy & Limits

- Images stay clientâ€‘side unless user opts to save/extract serverâ€‘side; strip EXIF on save.  
- Tokenized exports; signed URLs; purge artifacts after retention.  
- Limits: Free projects (5), ramps (â‰¤5), image size (â‰¤4K). Pro expands limits as above.  
- Rate limits for export endpoints; sanitize names to avoid code injection in CSS/JSON.

---

## ðŸ§© PART 3 â€” TECH NOTES (for Codex)

### Suggested File Layout

```
src/pages/colors/index.astro
src/pages/colors/image.astro
src/pages/colors/tokens.astro
src/pages/colors/presets.astro
src/pages/colors/projects/[id].astro
src/pages/colors/settings.astro

src/pages/colors/api/generate.ts
src/pages/colors/api/extract.ts
src/pages/colors/api/token/save.ts
src/pages/colors/api/token/list.ts
src/pages/colors/api/export.ts
src/pages/colors/api/preset/save.ts
src/pages/colors/api/preset/delete.ts
src/pages/colors/api/preset/list.ts
src/pages/colors/api/project/save.ts
src/pages/colors/api/project/get.ts

src/lib/colors/oklab.ts          # color math & conversions
src/lib/colors/harmony.ts        # harmony rules & ramps
src/lib/colors/contrast.ts       # WCAG & auto-fix
src/lib/colors/kmeans.ts         # image extraction
src/lib/colors/naming.ts         # friendly name generation
src/lib/colors/export.ts         # css/tailwind/json/ase/gpl/svg/png
src/lib/colors/tokens.ts         # semantic token mapping
```

### Pseudocode: Contrast Autoâ€‘Fix
```ts
function ensureContrast(fg, bg, target=4.5) {
  let {l,c,h} = toOKLCH(fg);
  for (let i=0;i<24;i++) {
    if (contrast(fromOKLCH({l,c,h}), bg) >= target) break;
    l = clamp(l + (isLight(bg) ? -0.02 : +0.02), 0, 1); // nudge lightness
  }
  return fromOKLCH({l,c,h});
}
```

### Pseudocode: Tailwind Export
```ts
export function tailwindConfig(palette) {
  return {
    theme: {
      extend: {
        colors: {
          primary: mapRamp(palette.primary), // {50:'#...',100:'#...',...}
          neutral: mapRamp(palette.neutral)
        }
      }
    }
  }
}
```

---

## âœ… ACCEPTANCE CRITERIA

- [ ] Generate 10â€‘stop ramps from one or more seed colors using harmony rules.  
- [ ] Extract dominant colors from an image/logo and create a harmonized palette.  
- [ ] Show WCAG contrast matrix with AA/AAA flags and suggest **autoâ€‘fix** options.  
- [ ] Simulate colorâ€‘blindness types and warn for risky pairs.  
- [ ] Map palette to semantic tokens and preview on UI components (light & dark).  
- [ ] Export CSS variables, Tailwind config, JSON, ASE/GPL, and SVG/PNG swatch sheet.  
- [ ] Import JSON/ASE/GPL into a new or existing project.  
- [ ] Persist projects with versions; allow brand locks and naming.  

---

**End of Requirements â€” Ready for Codex Implementation.**
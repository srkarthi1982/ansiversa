# ðŸ”¢ Unit & Currency Converter â€” Full Requirements (Ansiversa)

Codexâ€‘ready specification for building the **Unit & Currency Converter** mini app.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### What it does
Converts **units** (length, mass, time, area, volume, speed, temperature, energy, power, pressure, angles, data, flow, density, illumination, frequency, torque, viscosity, etc.) and **currencies** with **precise math, smart parsing, localeâ€‘aware formatting, and live exchange rates**. Supports **composite expressions** (e.g., `km/h â†’ m/s`, `lb/ftÂ³ â†’ kg/mÂ³`), **SI prefixes**, **dimensional analysis**, **batch tables**, **history & favorites**, and **developer API** for embedding conversions in other mini apps.

### Core Features
- **Smart input parser**: "12.5 km to miles", "3e8 m/s in mph", "70Â°F â†’ Â°C", "USD 129.99 â†’ AED", "15lb/ft^3 â†’ kg/m^3".
- **Dimensional engine**: base SI dimensions; reduce **compound units**; verify equivalence; warn on mismatched dimensions.
- **Exact factors** for defined constants (inches, feet, nautical mile, pound, atm, liter, etc.); **highâ€‘precision decimals** (BigInt/decimal lib).
- **Rounding & sig figs**: scientific/engineering modes; banker's rounding for currencies; configurable **decimal places** & **significant figures**.
- **Locale**: `enâ€‘US`, `enâ€‘GB`, `arâ€‘AE`, `taâ€‘IN`, etc.; digit shaping; group separators; currency symbol placement; rightâ€‘toâ€‘left support.
- **Currency**: live/nearâ€‘realâ€‘time **FX rates**, **historical rates**, **fee/margin** modeling, **inverse/display** toggles, weekend handling.
- **Batch**: spreadsheetâ€‘like grid; paste CSV; perâ€‘row unit/currency; export results.
- **Favorites & presets**: pin pairs; quick selectors (Cooking, Science lab, Construction, Travel).
- **Developer API**: internal SSR endpoints for conversions; can be used from **Price Checker**, **Expense Tracker**, **Invoice Maker**, etc.

### Key Pages
- `/convertor` â€” Quick converter (unit/currency, search, keyboardâ€‘first).
- `/convertor/advanced` â€” Composite & batch conversions, table editor.
- `/convertor/history` â€” Recent, favorites, pinned presets.
- `/convertor/settings` â€” Precision, locale, rounding, default pairs, fee % for currency.

### Minimal Data Model
`Conversion`, `Preset`, `Favorite`, `CurrencyRate`, `CurrencyMeta`, `UnitMeta`, `BatchJob`, `ExportJob`, `Profile`, `Tag`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Precision | up to 6 decimals | up to 16 decimals |
| Historical FX | â€” | âœ… (last 10 years) |
| Batch rows/job | 50 | 10,000 |
| Custom units | â€” | âœ… |
| Developer API | readâ€‘only | read/write + bulk |
| Alerts (FX) | â€” | âœ… (targets & % change) |
| History retention | 30 days | Unlimited |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Objectives & Nonâ€‘Goals
**Objectives**
- Deliver **trustworthy conversions** with **reproducible math** and clear rounding rules.
- Provide **fast UX** for casual users and **power tools** for engineers/finance.
- Keep logic **shared & testable** so other apps can reuse conversion services.

**Nonâ€‘Goals (v1)**
- No offlineâ€‘first PWA caching beyond recent rates & local unit tables.
- No portfolio/FX trading; the app is informational, not a broker.

---

### 2) Information Architecture & Routes

**Pages**
- `/convertor` â€” Singleâ€‘line input (`[value] [unit] â†’ [unit]`), results card, quick swap, keypad on mobile.
- `/convertor/advanced` â€” Expression builder for composites, batch grid (paste/CSV upload), and a live preview.
- `/convertor/history` â€” List grouped by date; filters: category, currency, unit system.
- `/convertor/settings` â€” Precision, significantâ€‘figures, rounding mode, locale, default currency pair, fee %, unit system (SI/Imperial/US).

**API (SSR)**
- Units: `POST /convertor/api/unit/convert` (value, from, to, options), `GET /convertor/api/unit/search?q=`
- Currency: `POST /convertor/api/fx/convert`, `GET /convertor/api/fx/rates?base=`, `GET /convertor/api/fx/history?base=&date=`
- Batch: `POST /convertor/api/batch/convert` (rows[]), `GET /convertor/api/batch/status?id=`
- Presets/Favorites: `POST /convertor/api/preset/save`, `POST /convertor/api/preset/delete`, `POST /convertor/api/favorite/toggle`
- Exports: `POST /convertor/api/export` (csv|json|md), `GET /convertor/api/export/status?id=`
- Settings: `POST /convertor/api/settings/save`
- Alerts (Pro): `POST /convertor/api/fx/alert/set`, `POST /convertor/api/fx/alert/delete`, `GET /convertor/api/fx/alert/list`

Optional WebSocket `/convertor/ws` for streaming FX ticks & alert triggers.

---

### 3) Unit Coverage

**Base categories (v1)**
- Length, Area, Volume, Mass/Weight, Time, Speed, Acceleration, Temperature, Energy, Power, Pressure, Force, Angle, Data (bit/byte with binary/decimal prefixes), Data Rate, Frequency, Density, Flow (volumetric/mass), Illumination (lux/footâ€‘candle), Fuel Economy, Torque, Viscosity (dynamic/kinematic), Luminous Intensity, Radiation (Gy/Sv/Rem), Currency.

**Systems & rules**
- SI with **prefixes** (y..Y); Imperial & US Customary; common industry units (psi, bar, mmHg, inHâ‚‚O, BTU, kcal, kWh, hp, NÂ·m, lbâ€‘ft, galâ€‘US/galâ€‘UK, tbsp/tsp).
- **Temperature** uses affine transforms (Â°C, Â°F, K, Â°R); guard against scale vs difference (Î”Â°C vs Â°C).
- **Exact definitions**: e.g., inch = 0.0254 m, pound = 0.45359237 kg, liter = 0.001 mÂ³.
- **Composite parsing**: `NÂ·m`, `kg/m^3`, `kWÂ·h`, `mi/h`, `L/100km` â†” `km/L`.

**Validation**
- Dimension mismatch â†’ error with hints.
- Ambiguous symbols (ton: metric vs short/long) â†’ disambiguation UI.

---

### 4) Currency (FX) Requirements

- **Providerâ€‘agnostic** fetcher for FX rates (HTTPS JSON). Cache **latest** per base; store **historical** (daily). 
- **Weekend/holiday handling**: roll forward/back; display **asâ€‘of timestamp** and market status.
- **Rounding**: perâ€‘currency minor unit (e.g., JPY 0 decimals). Custom **bankerâ€™s rounding** option.
- **Fees & margins**: allow user fee % or fixed markup; show **effective rate** and cost.
- **Formatting**: symbol/ISO code, nonâ€‘breaking spaces, accounting negatives `( )`, Arabic RTL numerals option.
- **Pairs**: favorite pairs; invert button; quick list (AEDâ†”USD/EUR/INR/GBP).
- **Historical mode**: convert as of date; mini chart (sparklines) on result card (v2).
Security & privacy: rate calls signed with server secret; never expose provider keys to client.

---

### 5) Data Model (Astro DB / SQL)

**Conversion**  
- `id` (uuid pk), `userId`, `kind` ('unit'|'fx'), `input` (json:{value, from, to}), `output` (json:{value, precision, steps}), `asOf` (datetime|null), `options` (json), `createdAt`

**Preset**  
- `id` (pk), `userId`, `name`, `kind` ('unit'|'fx'), `definition` (json), `pinned` (bool)

**Favorite**  
- `id` (pk), `userId`, `pairOrUnit` (text), `meta` (json)

**CurrencyRate**  
- `id` (pk), `base` (char3), `date` (date), `rates` (json), `fetchedAt` (datetime), unique `(base,date)`

**CurrencyMeta**  
- `code` (char3 pk), `name` (text), `symbol` (text), `minorUnit` (int), `localeDefaults` (json)

**UnitMeta**  
- `id` (pk), `symbol` (text), `name` (text), `dimension` (text), `factor` (decimal), `offset` (decimal|null), `system` (text), `aliases` (json), `precisionHint` (int)

**BatchJob**  
- `id` (pk), `userId`, `status` ('queued'|'running'|'done'|'error'), `rows` (json), `resultUrl` (text|null)

**ExportJob**  
- `id` (pk), `userId`, `format` ('csv'|'json'|'md'), `status` ('queued'|'running'|'done'|'error'), `url` (text|null)

**Profile**  
- `id` (pk), `userId`, `locale` (text), `precision` (int), `sigFigs` (int|null), `rounding` ('standard'|'bankers'|'ceil'|'floor'), `defaultPairs` (json), `fees` (json)

**Tag**  
- `id` (pk), `name`, `color`

Indexes: `Conversion.userId+createdAt`, `CurrencyRate.base+date` unique, `UnitMeta.symbol`, `Favorite.userId`.

---

### 6) Math & Engine Notes

- Use an exact **base SI** representation with rational coefficients for unit factors (fractions) where possible; fallback to highâ€‘precision decimal.
- **Temperature**: implement affine transform pipeline (convert to Kelvin, apply offsets); distinguish **absolute** vs **delta** units (e.g., Î”Â°F â‰  Â°F).
- **Composite**: parse numerator/denominator trees; simplify exponent rules; canonicalize units internally.
- **Precision policy**: if user supplies **sig figs**, propagate; else default per category; clamp to plan limits.
- Provide stepâ€‘byâ€‘step derivation for advanced view (e.g., `1 mph = 0.44704 m/s`).

---

### 7) UX / UI

- **Searchâ€‘first bar** with suggestions and recent pairs; keyboard shortcuts.
- **Result card** with **copy**, **swap**, **pin**, and **explain math** (toggle).
- **Advanced table** for batch: inline validation, perâ€‘row status, export.
- **Category browser**: tiles for common categories; quick keypad on mobile.
- **Accessibility**: RTL layout support, highâ€‘contrast theme, ARIA labels, large number keypad.

Shortcuts: `Tab` move between fields, `Cmd/Ctrl+K` focus input, `Cmd/Ctrl+S` swap, `Enter` convert.

---

### 8) Validation & Safety

- Reject unsupported/ambiguous units; show disambiguation (e.g., `ton`).
- FX: if **stale rates**, show warning banner with **asâ€‘of**; block conversions if older than policy threshold (e.g., 7 days for Free, 1 day for Pro).
- Clamp extreme values; detect numeric overflow; show scientific notation where needed.
- Enforce **serverâ€‘side** calculation to prevent tampering; sign results for API consumers.
- Respect locale privacy (do not infer region from currency alone).

---

### 9) Plans & Limits

| Feature | Free | Pro |
|---|---|---|
| API calls/day | 500 | 10,000 |
| FX updates | hourly | every 5 min |
| Historical range | â€” | 10 years |
| Batch rows/job | 50 | 10,000 |
| Custom units | â€” | âœ… |
| Alerts | â€” | âœ… |

Rate limits: `/unit/convert` 2,000/day (Free) 50,000/day (Pro); `/fx/convert` 1,000/day (Free) 20,000/day (Pro).

---

### 10) Suggested File Layout

```
src/pages/convertor/index.astro
src/pages/convertor/advanced.astro
src/pages/convertor/history.astro
src/pages/convertor/settings.astro

src/pages/convertor/api/unit/convert.ts
src/pages/convertor/api/unit/search.ts
src/pages/convertor/api/fx/convert.ts
src/pages/convertor/api/fx/rates.ts
src/pages/convertor/api/fx/history.ts
src/pages/convertor/api/batch/convert.ts
src/pages/convertor/api/batch/status.ts
src/pages/convertor/api/preset/save.ts
src/pages/convertor/api/preset/delete.ts
src/pages/convertor/api/favorite/toggle.ts
src/pages/convertor/api/export.ts
src/pages/convertor/api/export/status.ts
src/pages/convertor/api/settings/save.ts

src/components/convertor/Quick/*.astro
src/components/convertor/Advanced/*.astro
src/components/convertor/Table/*.astro
src/components/convertor/Result/*.astro
```

---

### 11) Future Enhancements (v2+)

- **Widgets/embeds** for other pages (inline converter in Blog/Docs).
- **Graphing**: historical FX sparkline with tooltips; unit equivalence explorer.
- **Voice input**: â€œconvert 5 gallons to litersâ€ (speechâ€‘toâ€‘text).
- **Camera capture**: read labels and convert units instantly.
- **Developer SDK** for Node/TS with treeâ€‘shakable unit packs.

---

**End of Requirements â€” Ready for Codex Implementation.**
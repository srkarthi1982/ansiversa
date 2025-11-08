# ðŸ§¾ JSON Formatter â€” Full Requirements (Ansiversa)

Codexâ€‘ready specification for building the **JSON Formatter** mini app. Target stack: **Astro (SSR)** + **Tailwind** + **Alpine.js** + **Astro DB**, deployed on **Vercel**. Provides fast **format/validate/transform** for JSON with largeâ€‘file support, JSON Schema validation, JSONPath queries, diff/merge, CSV/YAML/TOML conversion, and safe presets.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### What it does
Paste, upload, or fetch JSON to **prettyâ€‘print** or **minify**, **validate** against **JSON Schema**, **query** with **JSONPath**, **diff/merge** two JSON blobs, and **convert** to/from **CSV/TSV**, **YAML**, **TOML**. Includes **tree view**, **search**, **sort keys**, **canonicalization**, **JSONC** (comments) support, **jqâ€‘like transforms** (WASM), and **streaming** for large inputs.

### Core Features
- **Format**: Pretty/compact with custom indent, EOL (\n/\r\n), trailing comma toggle (where allowed), key **sort** (stable), **canonicalize** (RFCâ€‘8785â€‘like).  
- **Validate**: Syntax (JSON & **JSONC** stripping), schema (AJV 2020â€‘12), show exact error paths with jumpâ€‘to highlights.  
- **Query**: **JSONPath** (`$.store.book[*].author`) with results view; quick filters; count/unique helpers.  
- **Transform**: jqâ€‘like operators via **JMESPath** + optional **jqâ€‘wasm**; builtâ€‘in macros (pick/omit/rename/map/flatten/groupBy).  
- **Diff/Merge**: sideâ€‘byâ€‘side and unified diff; structural diff (JSON Patch **RFCâ€‘6902** & **Merge Patch RFCâ€‘7386**); apply patch.  
- **Convert**: JSON â†” YAML/TOML; JSON â†” CSV/TSV (schema infer; array/object mapping); **newlineâ€‘delimited JSON (NDJSON)** support.  
- **Large files**: stream/parse **up to ~50â€“200 MB** depending on browser; chunked server path for bigger (Pro).  
- **Safety**: sandboxed parsing, size/time guards, object depth limits, redaction of secrets on share/export.  
- **Share**: permalink with compressed payload (LZâ€‘string in hash) for small docs, or tokenized artifact link for big ones.  
- **Presets**: formatting presets (indent/eol/sort), schema libraries, saved queries/transforms.

### Key Pages
- `/json` â€” Main formatter (editor + tree + actions).  
- `/json/diff` â€” Sideâ€‘byâ€‘side/unified diff; create/apply patch.  
- `/json/schema` â€” Schema validator; library of saved schemas; live validate.  
- `/json/convert` â€” Convert between JSON/CSV/YAML/TOML/NDJSON.  
- `/json/transform` â€” Run JSONPath/JMESPath/jq transforms; save presets.  
- `/json/settings` â€” Defaults (indent/eol), limits, redaction keys.  
- `/json/projects/[id]` â€” Optional saved workspaces (Pro): versions, artifacts.

### Minimal Data Model
`JsonProject`, `JsonArtifact`, `JsonSchema`, `JsonPreset`, `JsonQuery`, `JsonTransform`, `Profile`, `Quota`, `ShareLink`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Max inâ€‘browser size | ~50 MB | ~200 MB |
| Server processing | â€” | âœ… (chunked, stream) |
| Saved projects | â€” | âœ… |
| Schema library | 10 | 200 |
| jqâ€‘wasm | basic | full + batch |
| Share links | 5 active | 100 active |
| Batch convert | â€” | âœ… |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Information Architecture & Routes

**Pages**
- `/json` â€” Twoâ€‘pane: left editor (Monacoâ€‘lite with JSON/JSONC), right **tree view** with expand/collapse, search, and **stats** (size, keys). Toolbar: Format, Minify, Sort Keys, Canonicalize, Validate, JSONPath, Copy, Download.  
- `/json/diff` â€” Left/Right editors; view modes (sideâ€‘byâ€‘side/unified); generate **JSON Patch** and **Merge Patch**; **apply** patch.  
- `/json/schema` â€” Drop/paste JSON + pick a schema (upload URL/file or choose saved); realâ€‘time AJV errors; **$ref** resolver; drafts selection.  
- `/json/convert` â€” Tabs: JSONâ†”YAML/TOML, JSONâ†”CSV/TSV (mapping UI: array path, columns, header row), JSONâ†”NDJSON.  
- `/json/transform` â€” JSONPath/JMESPath field; jq (Pro) with examples; output preview + export.  
- `/json/settings` â€” Indent/EOL defaults, max depth, redaction keys (e.g., `password`, `token`, `secret`), theme.  
- `/json/projects/[id]` â€” Saved blobs, schemas, queries, transforms, versions (Pro).

**API (SSR)**
- `POST /json/api/format` (json, opts) â†’ formatted text + stats  
- `POST /json/api/validate` (json, schema?) â†’ errors list  
- `POST /json/api/diff` (a, b, mode) â†’ patch + stats  
- `POST /json/api/convert` (data, from, to, mapping?) â†’ artifact/text  
- `POST /json/api/transform` (json, kind, expr) â†’ result  
- `POST /json/api/schema/save|delete` Â· `GET /json/api/schema/list`  
- `POST /json/api/preset/save` Â· `GET /json/api/preset/list`  
- `POST /json/api/share/create|revoke` Â· `GET /json/api/share/get?id=`

**Workers / Queue (Pro)**
- `json:stream` â€” Server streaming parse/convert for big files.  
- `json:cleanup` â€” Purge expired artifacts.

---

### 2) Parsing, Validation & Safety

- Use **fast JSON parser** with **reviver** depth limits; detect **circular** when handling JS objects (transform stage only).  
- Support **JSONC** by stripping comments/trailing commas before parsing (notice to user).  
- Validation via **AJV v8** with draftâ€‘2020â€‘12 by default; support 4/6/7/2019â€‘09; load remote `$ref` with safe fetch and caching.  
- **Error UX**: show `instancePath`, `schemaPath`, message; click to jump in editor and blink node in tree.  
- **Canonicalization**: stable sort of object keys, number formatting, Unicode normalization (NFC); produce deterministic output.

---

### 3) Query & Transform

- **JSONPath** executor with results as table/tree; allow selecting path from tree (rightâ€‘click â†’ copy JSONPath).  
- **JMESPath** for simple transforms; snippets gallery (pluck fields, groupBy, sum).  
- **jqâ€‘wasm (Pro)**: run jq filters in a WASM sandbox; CPU/time cap; diagnostics stream.  
- **Saved queries/transforms** with name, description, tags; run on current doc.

---

### 4) Diffing & Patching

- Structural diff that emits **RFCâ€‘6902** operations (`add`, `remove`, `replace`, `move`, `copy`, `test`).  
- Also support **RFCâ€‘7386** Merge Patch.  
- **Apply Patch**: apply to left or right; validate result; undo support.  
- Visual diff with colorâ€‘coded additions/removals/changes; collapse equal blocks.

---

### 5) Conversions

- **YAML/TOML** using robust parsers; preserve order when roundâ€‘tripping if possible.  
- **CSV/TSV**: map **array path** (e.g., `$.rows[*]`); column mapping to object keys; type inference (string/number/bool/null/date).  
- **NDJSON**: split/join with safe handling of blank lines and errors per line; show progress.  
- **Pretty print** options for all targets; BOM toggle for CSV/TSV; delimiter config; quote/escape rules.

---

### 6) Data Model (Astro DB / SQL)

**JsonProject**  
- `id` (uuid pk), `userId` (fk), `name` (text), `notes` (text|null), `createdAt`, `updatedAt`

**JsonArtifact**  
- `id` (pk), `projectId` (fk|null), `kind` ('json'|'yaml'|'toml'|'csv'|'ndjson'|'patch'), `path` (text), `bytes` (int), `createdAt`

**JsonSchema**  
- `id` (pk), `userId` (fk), `name` (text), `draft` (text), `url` (text|null), `text` (longtext|null), `createdAt`, `updatedAt`

**JsonPreset**  
- `id` (pk), `userId` (fk), `name` (text), `config` (json:{indent,eol,sort,canon}), `createdAt`

**JsonQuery**  
- `id` (pk), `userId` (fk), `kind` ('jsonpath'|'jmespath'|'jq'), `expr` (text), `desc` (text|null), `createdAt`

**JsonTransform** (optional if merges with queries)  
- `id` (pk), `userId` (fk), `script` (text), `lang` ('jmes'|'jq'), `createdAt`

**ShareLink**, **Profile**, **Quota** as shared modules.

Indexes: `JsonSchema.userId+name`, `JsonPreset.userId+name`, `JsonQuery.userId+createdAt`, `JsonArtifact.projectId+createdAt`.

---

### 7) UX / UI

- **Editor**: Monacoâ€‘lite with JSON/JSONC mode; lint markers; **format on save**; **autoâ€‘detect indent**.  
- **Tree**: virtualized tree for big docs; **collapse/expand all**; copy path; copy value; **edit inline** (optional).  
- **Search**: regex toggle; highlight matches; jump to next/prev.  
- **Status bar**: byte size, node count, depth, detected encoding, caret path (JSONPath).  
- **Keyboard**: `Cmd/Ctrl+Shift+F` format, `Alt+Shift+F` minify, `Cmd/Ctrl+P` JSONPath focus, `Cmd/Ctrl+D` diff.  
- **Theme**: light/dark; high contrast; follow system.

---

### 8) Performance & Limits

- Clientâ€‘first for â‰¤50MB with streaming tokenizer; **debounce** heavy ops; WebWorker for validation/diff/jq.  
- Server fallback (Pro) for very large files; chunked upload; stream transform; progress & cancellation.  
- Depth and key count guards; graceful errors with hints.

---

### 9) Security & Privacy

- No remote fetch of schemas unless user enables; cache & show CORS warnings.  
- Redact keys on share/export based on user list (e.g., `password`, `secret`, `token`, `authorization`).  
- Tokenized share links; signed URLs for artifacts; purge on retention expiry.  
- Disable dangerous evals; sandbox jq/JMESPath; timeouts for scripts.

---

## ðŸ§© PART 3 â€” TECH NOTES (for Codex)

### Suggested File Layout

```
src/pages/json/index.astro
src/pages/json/diff.astro
src/pages/json/schema.astro
src/pages/json/convert.astro
src/pages/json/transform.astro
src/pages/json/settings.astro
src/pages/json/projects/[id].astro

src/pages/json/api/format.ts
src/pages/json/api/validate.ts
src/pages/json/api/diff.ts
src/pages/json/api/convert.ts
src/pages/json/api/transform.ts
src/pages/json/api/schema/save.ts
src/pages/json/api/schema/list.ts
src/pages/json/api/preset/save.ts
src/pages/json/api/preset/list.ts
src/pages/json/api/share/create.ts
src/pages/json/api/share/revoke.ts
src/pages/json/api/share/get.ts

src/lib/json/parse.ts        # json/jsonc parser & guards
src/lib/json/format.ts       # pretty/minify/sort/canonicalize
src/lib/json/validate.ts     # ajv setup + $ref resolver
src/lib/json/jsonpath.ts     # queries
src/lib/json/jmes.ts         # transforms
src/lib/json/jq_wasm.ts      # jq wasm wrapper (Pro)
src/lib/json/diff.ts         # rfc6902/7386 patch
src/lib/json/convert.ts      # yaml/toml/csv/ndjson
src/lib/json/redact.ts       # redaction helpers
```

### Pseudocode: Canonicalize
```ts
export function canonicalize(obj){
  if (Array.isArray(obj)) return obj.map(canonicalize);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const k of Object.keys(obj).sort()) {
      out[k] = canonicalize(obj[k]);
    }
    return out;
  }
  if (typeof obj === 'number' && Number.isFinite(obj)) {
    return JSON.parse(JSON.stringify(obj)); // normalize -0, NaN not allowed anyway
  }
  return obj;
}
```

### Pseudocode: JSON â†’ CSV
```ts
export function jsonToCsv(arr, columns){
  const rows = [columns.map(c => c.header).join(',')];
  for (const item of arr){
    rows.push(columns.map(c => escapeCsv(get(item, c.path))).join(','));
  }
  return rows.join('\n');
}
```

---

## âœ… ACCEPTANCE CRITERIA

- [ ] Pretty/minified output with custom indent & EOL; optional key sort & canonicalization.  
- [ ] JSONC comments/trailing commas accepted and stripped for parse.  
- [ ] Schema validation displays precise AJV errors and links to offending nodes.  
- [ ] JSONPath queries return correct subsets; JMESPath/jq transforms work with limits and timeouts.  
- [ ] Diff view generates valid RFCâ€‘6902 & Merge Patch; apply patch updates JSON correctly.  
- [ ] Converts between JSON/CSV/YAML/TOML/NDJSON with mapping UI and roundâ€‘trip sanity.  
- [ ] Handles large inputs (client â‰¤50MB, server â‰¤200MB Pro) with progress and without freezing the UI.  
- [ ] Share links/tokenized artifacts work; redaction keys are respected on export.  

---

**End of Requirements â€” Ready for Codex Implementation.**
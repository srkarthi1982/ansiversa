# ðŸ§ª API Tester â€” Full Requirements (Ansiversa)

Codexâ€‘ready specification for building the **API Tester** mini app. Target stack: **Astro (SSR)** + **Tailwind** + **Alpine.js** + **Astro DB**, deployed on **Vercel**. A lightweight, privacyâ€‘first alternative to Postman/Insomnia focused on **REST**, **GraphQL**, **WebSocket**, and **gRPC (via proxy)**, with environments, variables, pre/post scripts, assertions, collections, and a runner.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### What it does
Send requests to APIs, view pretty **responses** (JSON/XML/HTML/raw), and **save** them in collections. Supports **authentication** (API key, Bearer, Basic, OAuth2, AWS SigV4, HMAC), **variables/environments**, **preâ€‘request & test scripts** (sandboxed), **assertions**, **history**, **collection runner** (series/parallel), **CSV dataâ€‘driven runs**, **mock server**, **OpenAPI import**, and **codeâ€‘snippet export** (curl/fetch/axios).

### Core Features
- Protocols: **HTTP/HTTPS** (REST), **GraphQL** (query/mutations + variables), **WebSocket** (send/receive frames), **gRPC** via gateway/proxy (v1: reflect/proto upload).
- Request builder: method, URL, path/query params, headers, **body** (none/formâ€‘urlencoded/multipart/JSON/XML/raw), file upload, auth helpers.
- Response viewer: status/time/size, headers, **JSON pretty** with folding, syntax highlight, **search**, **preview HTML**, **timeline** (DNSâ†’TLSâ†’TTFBâ†’total).
- Auth: No auth, **API Key**, **Bearer**, **Basic**, **OAuth 2.0** (Auth Code/PKCE & Client Credentials), **AWS SigV4**, **HMAC** (SHAâ€‘256).
- Environments & variables: **{{var}}** substitution; scoped variables (global â†’ workspace â†’ environment â†’ collection â†’ request); secrets stored encrypted.
- Scripts: **Preâ€‘request** and **Tests** with a safe JS sandbox (no network, capped CPU/time); utility API similar to Postman (`pm.*`) to set vars, add test results, etc.
- Assertions: `status == 200`, JSON path values, header exists, schema validation (AJV), response time thresholds.
- Runner: run a **collection** with an **environment** and **data file** (CSV/JSON); supports delays, iteration data, parallelism, retries, and export of **run reports** (JUnit/JSON).
- Mock server: turn a collection into a simple **mock** with rules (match by method+path+query+headers) and dynamic templates (mustache) using env vars.
- Import/Export: **OpenAPI 3.0/3.1** (generate collection), Postman collection v2.1 JSON, cURL; export collection/envs as JSON.
- Codegen: snippets for **curl**, **fetch**, **Axios**, **Node `http`**, **Python `requests`**.
- Team (v2): share collections with roles; comments; versioning (for now singleâ€‘user focus).

### Key Pages
- `/apitester` â€” Request builder & response viewer.
- `/apitester/collections` â€” Collections & requests manager.
- `/apitester/environments` â€” Environment and variables (with secrets).
- `/apitester/runner` â€” Configure and run collections (dataâ€‘driven runs).
- `/apitester/mock` â€” Mock server manager and rules.
- `/apitester/history` â€” Recent requests & diffs.
- `/apitester/settings` â€” Scripting limits, proxies, TLS options, downloads.
- `/apitester/docs/[id]` â€” Auto docs view for a collection (shareable).

### Minimal Data Model
`ApiWorkspace`, `ApiCollection`, `ApiRequest`, `ApiFolder`, `ApiEnv`, `ApiVar`, `ApiSecret`, `ApiHistory`, `ApiRun`, `ApiRunResult`, `ApiMock`, `ApiDoc`, `Attachment`, `Profile`, `Quota`

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Protocols | REST, GraphQL, WS | + gRPC proxy, OAuth2 PKCE, SigV4 |
| Collections | 5 | 100 |
| Runner iterations | 100 | 100k |
| Mock servers | 1 | 20 |
| Secrets | local only | encrypted cloud |
| Reports | JSON | + JUnit + HTML |
| Import | cURL | + OpenAPI + Postman |
| Codegen | curl/fetch | + Axios/Python/Node |
| History retention | 7 days | 90 days |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Information Architecture & Routes

**Pages**
- `/apitester` â€” Split view: left (collections/envs), center (request builder), right (response viewer).
- `/apitester/collections` â€” Tree of collections/folders/requests; CRUD; dragâ€‘drop reorder.
- `/apitester/environments` â€” Table of environments; inline edit variables & secrets; import/export JSON.
- `/apitester/runner` â€” Select collection, env, data file; options (delay, parallel, retries); run & live logs.
- `/apitester/mock` â€” Enable mock on subdomain/path; define rules & responses; start/stop; logs.
- `/apitester/history` â€” List of requests with filters; diff two responses; save to collection.
- `/apitester/settings` â€” proxy URL, certs (upload PEM) for mTLS (Pro), script CPU/time limits, redirects, cookie jar.
- `/apitester/docs/[id]` â€” Readâ€‘only documentation generated from collection with examples.

**API (SSR)**
- Collections: `POST /apitester/api/collection/save|delete|list`
- Requests: `POST /apitester/api/request/save|delete|duplicate`, `GET /apitester/api/request/get?id=`
- Environments: `POST /apitester/api/env/save|delete`, `GET /apitester/api/env/list`
- Send: `POST /apitester/api/send` (executes the request with env & pre/post scripts)
- History: `GET /apitester/api/history/list`, `POST /apitester/api/history/clear`
- Runner: `POST /apitester/api/runner/start`, `GET /apitester/api/runner/status?id=`, `GET /apitester/api/runner/report?id=`
- Mock: `POST /apitester/api/mock/save|delete|toggle`, `GET /apitester/api/mock/logs?id=`
- Import/Export: `POST /apitester/api/import` (openapi/postman/curl), `GET /apitester/api/export?collectionId=`
- Codegen: `GET /apitester/api/codegen?requestId=&lang=`
- Attachments: `POST /apitester/api/attach` (for multipart body files)

**Workers / Queue**
- `apitester:runner` â€” executes collection runs with isolation per step (preâ†’sendâ†’tests); writes run results & report.
- `apitester:mock` â€” lightweight handler for mock routing (can run within SSR function).

---

### 2) Request Builder & Execution

**Builder UI**
- Method dropdown; URL input with variable autocomplete (`{{baseUrl}}/users/{{id}}`); query builder; path param helper.
- Headers list with enable/disable toggles and common presets (JSON, gzip, nocache, CORS preflight).
- Body tabs: none, formâ€‘urlencoded, multipart (file pickers), raw (JSON/XML/HTML/text), GraphQL (query + variables); auto prettify.
- Auth tab: choose type and fill fields; preview header/signature (readâ€‘only).
- Scripts tab: preâ€‘request & tests editor (monaco-lite), with linting and snippets; **sandboxed** at run time.

**Execution**
- Build final URL/body (apply **variables** and **auth**).
- Collect cookies (cookie jar per workspace).
- Timings: DNS, TCP, TLS, TTFB, download (where available).
- Response: show **status, time, size, protocol**, raw headers, **pretty renderer** (JSON/XML/HTML/Raw/Binary with save).
- Save responses: save last N per request; diff view; mark as example for docs.

**GraphQL**
- Supports `POST` to endpoint; editor with syntax highlight; execute with variables; operation name detection; schema introspection (optional).

**WebSocket**
- Connect, send frames, show messages with timestamps; JSON highlight; ping/pong; autoâ€‘reconnect; export conversation.

**gRPC (Pro)**
- Upload `.proto` or use reflection via proxy; list services/methods; build message JSON; send via grpcâ€‘web proxy; display response & metadata.

---

### 3) Variables, Environments, and Secrets

- Variable scopes: **global â†’ workspace â†’ environment â†’ collection â†’ request** (closest wins).
- Types: string, number, boolean, secret (encrypted), computed (runâ€‘time script).
- Secret storage: encrypt using perâ€‘user key; never logged in history; masked in UI.
- Environment switcher at top; **quick edit** and **bulk find/replace** across collection.
- **Dynamic variables**: `{{$timestamp}}`, `{{$uuid}}`, `{{$randomInt}}`, etc.

---

### 4) Scripting & Assertions

- Safe JS sandbox (`vm2`â€‘like) with a **limited `pm` API**:
  - `pm.variables.get/set/unset` (scoped)
  - `pm.request` (readâ€‘only built request)
  - `pm.response` (status, headers, json())
  - `pm.test(name, fn)` collect test results
  - `pm.expect` (chaiâ€‘like minimal assertions)
  - `pm.environment`, `pm.collectionVariables`
  - **No** network, fs, or long timers; time limit ~500ms.
- Examples:
```js
pm.test("Status is 200", () => pm.response.status === 200)
pm.test("Has JSON body", () => !!pm.response.json())
pm.test("user.id present", () => pm.response.json().id)
```
- Schema validation via AJV; load schema from file/URL (cached).

---

### 5) Runner & Dataâ€‘Driven Tests

- Select collection + environment + data file (CSV/JSON).  
- Variable substitution per iteration; e.g., `{{userEmail}}` from CSV.  
- Options: **delay** between requests, **parallel** per folder, **max retries**, **bail on fail**.  
- Output: live console; perâ€‘request result; summary with passed/failed tests; export **report (JSON/JUnit/HTML)**.

---

### 6) Mock Server

- Define **routes** derived from a collection or added manually.  
- Matching rules: method, path (wildcards), headers, query; priority order.  
- Response: status, headers, body (raw/JSON); **templating** with `{{vars}}`; optional **rules** (random delay, failure rate).  
- Logs: recent hits with request/response pairs; copy as cURL.

---

### 7) Import / Export / Codegen

- **OpenAPI**: parse and generate a collection with tags â†’ folders; servers â†’ environments; schemas attached.  
- **Postman v2.1**: import collection and envs.  
- **cURL**: parse into a request.  
- **Export**: collection/envs as JSON; **Docs** page autoâ€‘generated from collection (with tryâ€‘it curl/fetch).  
- **Codegen**: build code snippets for curl/fetch/Axios/Python/Node from a saved request with resolved variables (placeholders left as `{{ }}`).

---

### 8) Data Model (Astro DB / SQL)

**ApiWorkspace**  
- `id` (uuid pk), `userId` (fk), `name` (text), `createdAt`

**ApiCollection**  
- `id` (pk), `workspaceId` (fk), `name` (text), `description` (text|null), `order` (int), `createdAt`

**ApiFolder**  
- `id` (pk), `collectionId` (fk), `name` (text), `order` (int)

**ApiRequest**  
- `id` (pk), `collectionId` (fk), `folderId` (fk|null), `name` (text), `protocol` ('http'|'graphql'|'ws'|'grpc'), `method` (text|null), `url` (text), `pathParams` (json), `query` (json), `headers` (json), `auth` (json), `body` (json), `preScript` (text|null), `testScript` (text|null), `examples` (json), `createdAt`, `updatedAt`

**ApiEnv**  
- `id` (pk), `workspaceId` (fk), `name` (text), `createdAt`

**ApiVar**  
- `id` (pk), `envId` (fk|null), `scope` ('global'|'workspace'|'environment'|'collection'|'request'), `ownerId` (text|null), `key` (text), `value` (text), `type` ('string'|'number'|'boolean'|'secret'), `createdAt`, `updatedAt`

**ApiSecret**  
- `id` (pk), `userId` (fk), `ciphertext` (blob), `meta` (json), `createdAt`

**ApiHistory**  
- `id` (pk), `workspaceId` (fk), `requestId` (fk|null), `name` (text), `url` (text), `method` (text), `status` (int), `timeMs` (int), `reqHeaders` (json), `reqBody` (blob|null), `resHeaders` (json), `resBody` (blob|null), `sizeBytes` (int), `createdAt`

**ApiRun**  
- `id` (pk), `workspaceId` (fk), `collectionId` (fk), `envId` (fk|null), `status` ('queued'|'running'|'done'|'error'|'canceled'), `options` (json), `report` (json|null), `createdAt`, `updatedAt`

**ApiRunResult**  
- `id` (pk), `runId` (fk), `requestId` (fk|null), `name` (text), `status` (int|null), `timeMs` (int|null), `tests` (json), `error` (text|null), `createdAt`

**ApiMock**  
- `id` (pk), `workspaceId` (fk), `name` (text), `basePath` (text), `enabled` (bool), `rules` (json), `createdAt`

**ApiDoc**  
- `id` (pk), `collectionId` (fk), `public` (bool), `token` (text unique), `createdAt`

**Attachment** for uploaded files in multipart or certs: `id`, `userId`, `path`, `mime`, `bytes`, `createdAt`

Indexes: `ApiRequest.collectionId+order`, `ApiHistory.workspaceId+createdAt`, `ApiVar.scope+ownerId+key`, `ApiRun.collectionId+createdAt`.

---

### 9) Security & Privacy

- **Never** log secrets; mask in UI and reports.  
- TLS options: allow uploading client certs (mTLS, Pro); toggle follow redirects; validate/untrusted certs warning.  
- Rateâ€‘limit send/runner endpoints; perâ€‘user quotas.  
- CORS: only Ansiversa origins; CSRF on mutations.  
- Data retention: response bodies older than retention may purge (configurable).  
- Mock server is **optâ€‘in**; random URLs for public mocks.

---

### 10) Performance & Limits

- Stream large responses; cap preview at e.g., 10 MB (download full as file).  
- JSON viewer virtualizes large trees; search within displayed chunk.  
- Runner uses concurrency control to avoid overloading target APIs.  
- WebSocket console keeps last N messages (e.g., 1,000).

---

## ðŸ§© PART 3 â€” TECH NOTES (for Codex)

### Suggested File Layout

```
src/pages/apitester/index.astro
src/pages/apitester/collections.astro
src/pages/apitester/environments.astro
src/pages/apitester/runner.astro
src/pages/apitester/mock.astro
src/pages/apitester/history.astro
src/pages/apitester/settings.astro
src/pages/apitester/docs/[id].astro

src/pages/apitester/api/collection/save.ts
src/pages/apitester/api/collection/delete.ts
src/pages/apitester/api/collection/list.ts
src/pages/apitester/api/request/save.ts
src/pages/apitester/api/request/delete.ts
src/pages/apitester/api/request/get.ts
src/pages/apitester/api/env/save.ts
src/pages/apitester/api/env/delete.ts
src/pages/apitester/api/env/list.ts
src/pages/apitester/api/send.ts
src/pages/apitester/api/history/list.ts
src/pages/apitester/api/history/clear.ts
src/pages/apitester/api/runner/start.ts
src/pages/apitester/api/runner/status.ts
src/pages/apitester/api/runner/report.ts
src/pages/apitester/api/mock/save.ts
src/pages/apitester/api/mock/delete.ts
src/pages/apitester/api/mock/toggle.ts
src/pages/apitester/api/mock/logs.ts
src/pages/apitester/api/import.ts
src/pages/apitester/api/export.ts
src/pages/apitester/api/codegen.ts
```

### Pseudocode: Send Request
```ts
// /apitester/api/send.ts
const { requestId, envId, runtimeVars } = await readJson(request);
const req = await buildRequest(requestId, envId, runtimeVars); // apply vars & auth
const pre = await runScript(req.preScript, { req, env });
const { response, timings } = await httpSend(pre.req || req);
const tests = await runScript(req.testScript, { req, response, env });
await saveHistory({ req, response, timings, tests });
return json({ status: response.status, headers: response.headers, body: previewBody(response), tests, timings });
```

### Pseudocode: Runner
```ts
// worker apitester:runner
for (const item of expandCollection(collectionId)) {
  const { status, tests } = await sendWithEnv(item, env, dataRow);
  record(item.id, { status, tests });
}
writeReport(runId, results, { fmt: 'json|junit|html' });
```

---

## âœ… ACCEPTANCE CRITERIA

- [ ] Build and send HTTP requests with bodies, headers, auth; view pretty responses with timings.  
- [ ] GraphQL tab executes queries with variables and shows result JSON.  
- [ ] WebSocket console connects and exchanges frames.  
- [ ] Variables/environments resolve correctly; secrets masked and encrypted at rest (Pro).  
- [ ] Preâ€‘request and test scripts run in a sandbox and can set variables and assertions.  
- [ ] Collections organize requests; Runner executes a collection with data file and produces a run report.  
- [ ] OpenAPI/Postman import works; code snippets generate correctly.  
- [ ] Mock server can serve defined routes and logs recent hits.  
- [ ] History lists previous requests; can diff and save examples to docs.

---

**End of Requirements â€” Ready for Codex Implementation.**
# ðŸ” Password Generator â€” Full Requirements (Ansiversa)

Codexâ€‘ready specification for building the **Password Generator** mini app. Target stack: **Astro (SSR)** + **Tailwind** + **Alpine.js** + **Astro DB**, deployed on **Vercel**. **Privacyâ€‘first, clientâ€‘side generation** with policy presets, entropy display, passphrase modes, and optional breach checks.

---

## âš¡ PART 1 â€” SUMMARY (for Codex Onboarding)

### What it does
Generate **strong, unique passwords and passphrases** that meet **custom policies**. Provides entropy and crackâ€‘time estimates, avoids personal words, supports **Diceware** passphrases, **pronounceable** strings, **API keys** format, and **batch generation**. Includes **policy presets** (e.g., NIST/OWASP, PCI), **copy/QR**, and **export**.

### Core Features
- **Modes**: 
  - **Random password** (character sets). 
  - **Passphrase** (Diceware/wordlist; separators; titleâ€‘case; number/symbol inject). 
  - **Pronounceable** (Markov/syllable model). 
  - **API token** (groups like `ABCD-1234-...`, Crockford base32, URLâ€‘safe).  
- **Character sets**: lowercase, uppercase, digits, symbols, spaces, **ambiguous removal** (`0O1lI|`), **custom** include/exclude.  
- **Length**: 8â€“128 (password), 3â€“12 words (passphrase).  
- **Entropy**: bits estimate + **zxcvbn** strength score; live feedback and **policy validation**.  
- **Breach check** (optional): kâ€‘anonymity API (prefix hash); optâ€‘in only.  
- **Personal dictionary**: exclude tokens from user profile (name, email domain, company) clientâ€‘side.  
- **Batch**: generate N passwords with same policy; export CSV/JSON/print sheet; **oneâ€‘time view** links (Pro).  
- **Clipboard & QR**: copy, **copy as masked**, and show QR for device transfer (local render).  
- **History**: **off by default**; if enabled, store **encrypted** with passphrase (Pro) or **hashed** preview for validation only.  
- **Policy presets**: NISTâ€‘inspired (min 8 chars, no mandatory composition), OWASP typical (â‰¥12, 3 sets), PCIâ€‘like (â‰¥12, rotation hint).  

### Key Pages
- `/passwords` â€” Generator with modes, policy, entropy, and results.  
- `/passwords/policies` â€” Create/edit **saved policies** and presets.  
- `/passwords/batch` â€” Bulk generation and export.  
- `/passwords/settings` â€” Defaults, wordlists, breachâ€‘check toggle, history encryption.  
- `/passwords/help` â€” Guidance (best practices, storage tips, doâ€™s & donâ€™ts).

### Minimal Data Model
`PwdPolicy`, `PwdPreset`, `PwdBatchJob`, `PwdArtifact`, `Profile`, `Quota`, `Wordlist`

> **No plaintext passwords stored serverâ€‘side**. Results exist only in client memory unless user explicitly exports or enables encrypted history.

### Plan Gating
| Feature | Free | Pro |
|---|---|---|
| Modes | all | all |
| Batch count | 20 | 10,000 |
| Custom wordlists | local only | cloud + shared |
| Encrypted history | â€” | âœ… |
| Oneâ€‘time view links | â€” | âœ… |
| QR export | âœ… | âœ… |
| Breach check | âœ… (manual) | âœ… (auto w/ rate limit) |

---

## ðŸ§  PART 2 â€” DETAILED REQUIREMENTS

### 1) Information Architecture & Routes

**Pages**
- `/passwords` â€” Mode tabs (Random / Passphrase / Pronounceable / API Token); policy controls; entropy panel; results list with copy buttons and QR.  
- `/passwords/policies` â€” Saved policies table; create/edit; import/export JSON.  
- `/passwords/batch` â€” Configure count + policy â†’ generate â†’ CSV/JSON export; printâ€‘friendly sheet.  
- `/passwords/settings` â€” defaults (length, sets), breach check toggle, personal dictionary (from Profile), enable **encrypted history** (Pro) with passphrase.  
- `/passwords/help` â€” best practices and integration notes.

**API (SSR)**
- Policies: `POST /passwords/api/policy/save`, `POST /passwords/api/policy/delete`, `GET /passwords/api/policy/list`
- Batch: `POST /passwords/api/batch/create` (clientâ€‘side preferred; server only for huge N), `GET /passwords/api/batch/download?id=`
- Wordlists: `POST /passwords/api/wordlist/upload` (Pro), `GET /passwords/api/wordlist/list`
- History (Pro): `POST /passwords/api/history/save` (stores **ciphertext only**), `GET /passwords/api/history/list` (returns encrypted blobs)
- Oneâ€‘time links (Pro): `POST /passwords/api/otl/create`, `POST /passwords/api/otl/revoke`, `GET /passwords/api/otl/get?id=`

**Workers / Queue**
- `passwords:cleanup` â€” deletes expired artifacts and oneâ€‘time links.

---

### 2) Generator Engine (Clientâ€‘First)

- **Random mode**: cryptoâ€‘secure RNG (`crypto.getRandomValues`).  
- Ensure **at least one char** from each **required** set only if policy requests; otherwise purely random from union set.  
- Avoid **lookâ€‘alikes** if â€œremove ambiguousâ€ on.  
- **No sequential or repeating patterns** check if policy requires (reject and reâ€‘draw).  
- **Personal dictionary**: reject candidates containing caseâ€‘folded tokens (name, email user, domains, recent app names).  
- **Entropy**: `H = log2(|alphabet|^length)` corrected for mandatoryâ€‘set rules; display **bits** and crackâ€‘time estimate (offline slow hash & online).  
- **zxcvbn**: compute score 0â€“4 and feedback.

**Passphrase mode (Diceware)**
- Use bundled **wordlists** (EN base) + userâ€‘provided (Pro).  
- Select 3â€“12 words using crypto RNG; configurable separators (`-`, `_`, space, emoji), titleâ€‘case toggle, inject digit/symbol rules.  
- Entropy = `log2(wordlist_size^words)` (e.g., 7776^6 â‰ˆ 77.6 bits).

**Pronounceable mode**
- Syllable templates (CVC, CVCC, etc.) with weighted consonant/vowel sets; optional numbers/symbols at ends; ensure entropy target.

**API Token mode**
- Formats: Base32 (Crockford), Base58, URLâ€‘safe Base64 (no `+` `/` `=`), segmented groups (e.g., `XXXX-XXXX-...`).  
- Optional embedded checksum (Mod 11â€‘2 style) for each segment.

---

### 3) Policy System

Policy fields:
- `minLength`, `maxLength`  
- `requireSets`: lowercase/uppercase/digits/symbols/spaces  
- `forbidAmbiguous` (O,0,1,l,I,|,`'` etc.)  
- `forbidRepeats` (â‰¥3 same), `forbidSequences` (abcd, 1234, qwerty)  
- `mustContain` / `mustNotContain` regex lists  
- `minEntropyBits` (e.g., â‰¥ 60)  
- Rotation metadata (days) and history size (no reuse) â€” **clientâ€‘side only** guidance; we donâ€™t manage credentials.

Presets shipped:
- **NISTâ€‘like** (min 8, high entropy encouraged, allow all sets, block known compromised via breach check).  
- **OWASP typical** (min 12, require 3 sets).  
- **PCIâ€‘ish** (min 12â€“14, 3 sets, no repeats/sequences).  
- **Humanâ€‘friendly** (passphrase 4â€“6 words).

---

### 4) UX / UI

- **Live entropy** and **zxcvbn** strength bar with textual guidance (â€œStrong / 92 bitsâ€).  
- **Policy checklist** (ticks/crosses) updates in real time.  
- **Copy** buttons: â€œCopyâ€, â€œCopy maskedâ€ (reveals for 8s then reâ€‘masks), **Show QR** modal.  
- **Batch**: table with index, password/passphrase (masked), actions to copy/download; export CSV/JSON.  
- **Personal dictionary** panel pulls tokens from user Profile; allow edits/toggles.  
- **Accessibility**: keyboardâ€‘first, tooltips for policies, safe color contrast.

Shortcuts: `Enter` generate, `Cmd/Ctrl+C` copy selected row, `R` regenerate, `S` save policy, `Q` QR toggle.

---

### 5) Data Model (Astro DB / SQL)

**PwdPolicy**  
- `id` (uuid pk), `userId` (fk), `name` (text), `config` (json), `createdAt`, `updatedAt`

**PwdPreset**  
- `id` (pk), `key` (text unique), `label` (text), `config` (json)

**Wordlist** (Pro)  
- `id` (pk), `userId` (fk), `name` (text), `lang` (text), `size` (int), `path` (text), `createdAt`

**PwdBatchJob**  
- `id` (pk), `userId` (fk), `policyId` (fk|null), `count` (int), `status` ('queued'|'running'|'done'|'error'), `createdAt`

**PwdArtifact**  
- `id` (pk), `jobId` (fk), `fmt` ('csv'|'json'|'txt'|'pdf'), `path` (text), `bytes` (int), `expiresAt` (datetime)

**Profile**, **Quota** as shared modules.

_No password storage tables._ If user enables â€œencrypted historyâ€ (Pro), store ciphertext blobs bound to a local key derived from a user passphrase using Argon2id; server never sees the key.

Indexes: `PwdPolicy.userId+updatedAt`, `PwdArtifact.jobId`, `Wordlist.userId+name`.

---

### 6) Security & Privacy

- **Clientâ€‘side generation** with `crypto.getRandomValues` is the default path.  
- Optional breach check uses **kâ€‘anonymity**: send only SHAâ€‘1 prefix; rateâ€‘limit and optâ€‘in.  
- **Never** log generated secrets. Disable analytics on result components.  
- Clipboard: write only on explicit user action; clear masked display after 8 seconds; provide **â€œcopy as maskedâ€** that puts `â€¢â€¢â€¢â€¢â€¢â€¢` in clipboard when demoing.  
- Oneâ€‘time view links (Pro): encrypt at rest; autoâ€‘expire after first open or at `expiresAt`.  
- Export artifacts are **local blobs** unless user opts to upload for share link.  
- Provide **disclaimer**: we do not store or recover passwords; encourage use of a password manager.

---

### 7) Limits & Quotas

| Metric | Free | Pro |
|---|---|---|
| Batch count | 20 | 10,000 |
| Oneâ€‘time links | â€” | 200 active |
| Custom wordlists | local only | 10 uploaded (â‰¤5MB each) |
| Artifacts retention | local only | 7â€“30 days |

Rateâ€‘limit server endpoints; client generation unlimited within browser constraints.

---

## ðŸ§© PART 3 â€” TECH NOTES (for Codex)

### Suggested File Layout

```
src/pages/passwords/index.astro
src/pages/passwords/policies.astro
src/pages/passwords/batch.astro
src/pages/passwords/settings.astro
src/pages/passwords/help.astro

src/pages/passwords/api/policy/save.ts
src/pages/passwords/api/policy/delete.ts
src/pages/passwords/api/policy/list.ts
src/pages/passwords/api/batch/create.ts
src/pages/passwords/api/batch/download.ts
src/pages/passwords/api/wordlist/upload.ts
src/pages/passwords/api/wordlist/list.ts
src/pages/passwords/api/history/save.ts        # Pro (encrypted blobs)
src/pages/passwords/api/history/list.ts        # Pro
src/pages/passwords/api/otl/create.ts          # Pro
src/pages/passwords/api/otl/revoke.ts          # Pro
src/pages/passwords/api/otl/get.ts             # Pro

src/lib/passwords/random.ts        # crypto RNG, charsets, generators
src/lib/passwords/policy.ts        # policy validation & presets
src/lib/passwords/entropy.ts       # bits & crack-time estimates
src/lib/passwords/zxcvbn.ts        # score wrapper (lazy-load)
src/lib/passwords/diceware.ts      # passphrase generator
src/lib/passwords/pronounceable.ts # syllable engine
src/lib/passwords/api-token.ts     # base32/base58/urlsafe formats
src/lib/passwords/filters.ts       # personal dictionary, sequences
src/lib/passwords/qr.ts            # local QR render for transfer
```

### Pseudocode: Random Password
```ts
export function genRandom(len, sets, opts){
  const alphabet = buildAlphabet(sets, opts);
  let out = '';
  while (out.length < len){
    const ch = pick(alphabet);
    if (opts.forbidAmbiguous && isAmbiguous(ch)) continue;
    out += ch;
  }
  if (requiresEachSet(opts)){
    if (!coversAllSets(out, sets)) return genRandom(len, sets, opts);
  }
  if (opts.forbidSequences && hasSequence(out)) return genRandom(len, sets, opts);
  if (opts.personal && hasPersonalTokens(out, opts.personal)) return genRandom(len, sets, opts);
  return out;
}
```

### Pseudocode: Diceware
```ts
export function genDiceware(words, list, sep='-', inject={}){
  const picks = Array.from({length: words}, () => list[randInt(0, list.length)]);
  let result = picks.join(sep);
  if (inject.number) result += randDigit();
  if (inject.symbol) result += pick('!@#$%^&*');
  return inject.title ? titleCase(result, sep) : result;
}
```

---

## âœ… ACCEPTANCE CRITERIA

- [ ] Generates strong random passwords (8â€“128) with configurable character sets and policies.  
- [ ] Passphrase mode (3â€“12 words) using Diceware wordlists with separators and optional injections.  
- [ ] Pronounceable mode creates humanâ€‘readable strings that still meet entropy targets.  
- [ ] Displays **entropy bits**, **zxcvbn score**, and policy checklist with live updates.  
- [ ] Batch generation exports CSV/JSON; QR copy and masked copy work.  
- [ ] No secrets stored serverâ€‘side by default; breach check is optâ€‘in and kâ€‘anonymity based.  
- [ ] Policies can be saved/loaded; presets for NIST/OWASP/PCI available.  
- [ ] Optional encrypted history and oneâ€‘time view links (Pro) function correctly.

---

**End of Requirements â€” Ready for Codex Implementation.**
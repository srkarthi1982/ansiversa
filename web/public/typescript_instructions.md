# Codex Instructions — Use Astro DB Type Safety

Goal: reuse Astro DB's generated schema and types. Avoid duplicating row shapes or hard-coding interfaces. Applies to pages, components, server actions, API routes, seeds, utilities, and tests.

---

## Golden Rules

1. Import tables, the `db` instance, and query helpers from `astro:db`.
2. Use `typeof Table.$inferSelect` for read types and `typeof Table.$inferInsert` for write payloads.
3. Validate any external input (forms, JSON) with Zod before touching the database.
4. Keep query builders typed; avoid raw SQL unless absolutely necessary.
5. Derive helper types with utilities like `Pick` or `Omit` instead of retyping columns.

---

## Canonical Sources

- Schema entry point: `db/config.ts`
- Table definitions: `db/**/tables.ts`
- Seed data: `db/**/seed.ts`
- Shared helpers: `src/actions/baseRepository.ts`, `src/utils/session.server.ts`, etc.

`astro:db` automatically exposes `db`, every defined table, and helpers such as `eq`, `and`, `asc`, `desc`, `sql`.

```ts
// Example table (db/auth/tables.ts)
import { column, defineTable, NOW } from 'astro:db';

export const User = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    username: column.text({ unique: true }),
    email: column.text({ unique: true }),
    passwordHash: column.text(),
    plan: column.text({ default: 'free' }),
    emailVerifiedAt: column.date({ optional: true }),
    createdAt: column.date({ default: NOW }),
    roleId: column.number(),
  },
});
```

---

## Import Pattern

```ts
import { db, Proposal, eq, desc } from 'astro:db';
```

No manual path aliases are required today. If a convenience wrapper ever becomes necessary, centralize it in a single module (for example `src/lib/db.ts`) and update this guide.

---

## Inferred Types

```ts
type ProposalRow = typeof Proposal.$inferSelect;
type NewProposal = typeof Proposal.$inferInsert;

// Narrow writable columns if needed
type ProposalUpdates = Pick<NewProposal, 'title' | 'status' | 'currency'>;
```

Never re-declare full interfaces for database rows. Compose from the inferred types instead.

---

## Server Actions (astro:actions) Pattern

```ts
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { Proposal, eq } from 'astro:db';
import { proposalRepository } from './repositories';

const payloadSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
});

export const renameProposal = defineAction({
  accept: 'json',
  input: payloadSchema,
  async handler({ id, title }, ctx) {
    await proposalRepository.update(
      { title } satisfies Partial<typeof Proposal.$inferInsert>,
      (table) => eq(table.id, id),
    );
    return { id, title };
  },
});
```

Key points:
- Parse inputs with Zod **before** constructing insert/update payloads.
- Payloads and return values must reference `.$inferInsert`/`.$inferSelect`.
- Encapsulate reusable logic inside repositories/helpers that keep typing intact.

---

## API Route Pattern

```ts
import type { APIRoute } from 'astro';
import { db, Proposal, desc } from 'astro:db';

export const GET: APIRoute = async () => {
  const rows = await db.select().from(Proposal).orderBy(desc(Proposal.updatedAt));
  return new Response(JSON.stringify(rows), {
    headers: { 'content-type': 'application/json' },
  });
};
```

`rows` is automatically typed as `typeof Proposal.$inferSelect[]`.

---

## UI Components

```tsx
import type { Component } from 'solid-js';
import type { VisitingCard } from 'astro:db';

type VisitingCardRow = typeof VisitingCard.$inferSelect;

const VisitingCardPreview: Component<{ card: VisitingCardRow }> = ({ card }) => (
  <section>
    <h2>{card.name}</h2>
    <p>{card.role}</p>
  </section>
);

export default VisitingCardPreview;
```

UI props that depend on database results should use inferred row types (or narrower picks) to stay aligned with schema changes.

---

## Updates and Inserts

```ts
const draft: typeof Proposal.$inferInsert = {
  id,
  userId,
  title,
  templateKey: 'business',
  status: 'draft',
  currency: 'USD',
  data,
  lastSavedAt: new Date(),
};

await db.insert(Proposal).values(draft);

await db
  .update(Proposal)
  .set({ status: 'published' } satisfies Partial<typeof Proposal.$inferInsert>)
  .where(eq(Proposal.id, id));
```

When only a subset of columns is mutable, create helper types with `Pick` or `Partial`.

---

## Seeds / Fixtures

```ts
// db/proposal/seed.ts
import { db } from 'astro:db';
import { Proposal } from './tables';

export async function seedProposal() {
  const exists = await db.select().from(Proposal).limit(1);
  if (exists.length > 0) return;

  await db.insert(Proposal).values({
    id: crypto.randomUUID(),
    userId: 'demo-user-id',
    title: 'Website Redesign Proposal',
    slug: 'website-redesign-proposal-demo',
    templateKey: 'business',
    status: 'draft',
    currency: 'USD',
    data: createEmptyProposalData(),
    lastSavedAt: new Date(),
    createdAt: new Date(),
  } satisfies typeof Proposal.$inferInsert);
}
```

Seeds should rely on the same insert types as runtime code.

---

## Utilities

```ts
import { BaseRepository } from '../baseRepository';
import { Minutes } from 'astro:db';

export const minutesRepository = new BaseRepository(Minutes);

export const listMinutes = async (userId: string) => {
  const rows = await minutesRepository.getData({
    where: (table) => eq(table.userId, userId),
    orderBy: (table) => desc(table.updatedAt),
  });
  return rows satisfies typeof Minutes.$inferSelect[];
};
```

Repositories should preserve the type information returned by `astro:db`.

---

## Do / Don't

| Do | Don't |
| --- | --- |
| Import `db`, tables, and helpers from `astro:db`. | Import tables via relative paths or duplicate schema definitions. |
| Derive row/payload types with `typeof Table.$infer...`. | Re-declare interfaces that mirror database columns. |
| Validate inputs with Zod before mutating the database. | Accept `any` or unvalidated objects from client code. |
| Use typed helpers (`Pick`, `Omit`, `Partial`) to narrow shapes. | Mutate `.$inferSelect` objects directly when preparing writes. |
| Return inferred types from actions and APIs. | Cast to `any` to bypass safety checks. |

---

## tsconfig Notes

The project currently relies on the default Astro `tsconfig`. If you add path aliases, document them here and update imports consistently. Always keep `strict` mode on.

---

## Error Handling and Guards

- Prefer explicit type guards when narrowing unknown values.
- Wrap DB calls that can fail inside `try/catch` blocks and return typed fallbacks.
- Use exhaustiveness checks for discriminated unions.

```ts
function isProposal(row: unknown): row is typeof Proposal.$inferSelect {
  return !!row && typeof (row as any).id === 'string' && typeof (row as any).title === 'string';
}
```

---

## Security and Input Rules

- Never trust client data; validate and sanitize on the server.
- Enforce authorization checks (see `src/utils/session.server.ts`) before writes.
- Avoid leaking internal identifiers when not required.

---

## Quick Checklist (run through every time Codex generates code)

- [ ] Imports come from `astro:db` (or approved wrappers) only.
- [ ] No custom interfaces duplicating DB shapes.
- [ ] `.$inferInsert` used for writes.
- [ ] `.$inferSelect` (or derived picks) used for reads and returns.
- [ ] External input validated with Zod.
- [ ] No unchecked `any` casts or loose JSON parsing.

---

## End-to-End Example

```ts
// Action
export const createFlashnote = defineAction({
  accept: 'json',
  input: FlashnoteSchema,
  async handler(input, ctx) {
    const payload = FlashnoteSchema.parse(input) satisfies typeof FlashNote.$inferInsert;
    const [created] = await flashnoteRepository.insert(payload);
    return { flashnote: created };
  },
});

// API Route
export const GET: APIRoute = async () => {
  const notes = await flashnoteRepository.getData();
  return new Response(JSON.stringify(notes));
};

// Component
type FlashnoteRow = typeof FlashNote.$inferSelect;
const FlashnoteCard = ({ note }: { note: FlashnoteRow }) => <article>{note.title}</article>;
```

---

## Final Rule

If a type exists in Astro DB, import and reuse it instead of recreating the shape manually.

# ðŸ§© Codex Instructions â€” Use Astro DBâ€™s Builtâ€‘In Type Safety

**Goal:** Generate code that **reuses** Astro DBâ€™s schema and **builtâ€‘in types** (no manual interfaces, no duplication).  
**Applies to:** pages, components, server actions, API routes, seeds, utilities.

---

## âœ… Golden Rules

1. **Never** redeclare interfaces for database rows.  
2. **Always** import tables and the `db` instance from the **canonical schema module**.  
3. Use **inferred types**:
   - `typeof Table.$inferSelect` for **reads**
   - `typeof Table.$inferInsert` for **writes**
4. Prefer **strict, typed queries** over raw SQL.
5. Validate external input (forms / JSON) with **Zod**, then map to `.$inferInsert` shapes.
6. Keep **file paths and imports stable**. Use path alias `@` pointing to `src/`.

---

## ðŸ“ Canonical Files & Imports

- **Schema & DB:** `src/db/config.ts`
- **(Optional) Re-exports for convenience:** `src/types.ts`

```ts
// src/db/config.ts (example)
import { defineDb, defineTable, column } from "astro:db";

export const User = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    email: column.text(),
    createdAt: column.date(),
  },
});

export const db = defineDb({ tables: { User } });
```

```ts
// src/types.ts (optional convenience)
import { User } from "@/db/config";
export type UserSelect = typeof User.$inferSelect;
export type UserInsert = typeof User.$inferInsert;
```

**Use these exact imports in generated code:**
```ts
import { db, User } from "@/db/config";
// or, when convenient:
import type { UserSelect, UserInsert } from "@/types";
```

---

## ðŸ§  Inferred Types â€” How to Use

```ts
// Read result type (array when using .select().from())
type TUser = typeof User.$inferSelect;

// Insert payload type (id/createdAt typically omitted or optional)
type NewUser = typeof User.$inferInsert;
```

**Do:** rely on these throughout pages, actions, utilities, and tests.  
**Donâ€™t:** write `interface User { ... }` or `type User = { ... }` for DB rows.

---

## ðŸ›  Server Actions (astro:actions) â€” Pattern

```ts
// src/actions/users.ts
import { z } from "zod";
import { db, User } from "@/db/config";
import { action } from "astro:actions";

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export const createUser = action(async (input) => {
  const data = CreateUserSchema.parse(input);
  const payload: typeof User.$inferInsert = {
    name: data.name,
    email: data.email,
    // createdAt is optional if defaulted in DB, otherwise set here
  };

  await db.insert(User).values(payload);
  const [created] = await db.select().from(User).where(User.email.eq(data.email)).limit(1);
  return created satisfies typeof User.$inferSelect;
});
```

**Rules:**  
- Always validate external input (`zod`) **before** constructing `.$inferInsert`.  
- Use inferred types on both the **payload** and the **return value**.

---

## ðŸŒ API Routes â€” Pattern

```ts
// src/pages/api/users.json.ts
import type { APIRoute } from "astro";
import { db, User } from "@/db/config";

export const GET: APIRoute = async () => {
  const rows = await db.select().from(User).orderBy(User.createdAt.desc());
  // rows: typeof User.$inferSelect[]
  return new Response(JSON.stringify(rows), { headers: { "content-type": "application/json" } });
};
```

---

## ðŸ§© UI Components â€” Typed Props from DB

```tsx
// src/components/UserCard.tsx
import type { UserSelect } from "@/types";

type Props = { user: UserSelect };

export default function UserCard({ user }: Props) {
  return (
    <div className="rounded-2xl p-4 shadow">
      <div className="font-semibold">{user.name}</div>
      <div className="text-sm opacity-70">{user.email}</div>
    </div>
  );
}
```

---

## ðŸ”„ Updates & Inserts â€” Safe by Construction

```ts
// Insert
const payload: typeof User.$inferInsert = { name, email };
await db.insert(User).values(payload);

// Update (only updatable fields)
await db.update(User).set({ name: "New" }).where(User.id.eq(userId));
```

**Tip:** Narrow mutable fields in local helper types if needed:
```ts
type UserMutable = Pick<typeof User.$inferInsert, "name" | "email">;
```

---

## ðŸ§ª Seeds / Fixtures â€” Reuse Insert Types

```ts
// src/db/seed.ts
import { db, User } from "@/db/config";

const seedUsers: (typeof User.$inferInsert)[] = [
  { name: "Alice", email: "alice@example.com" },
  { name: "Bob", email: "bob@example.com" },
];

await db.insert(User).values(seedUsers);
```

---

## ðŸ§° Utilities â€” Keep Types Flowing

```ts
// src/lib/users.ts
import { db, User } from "@/db/config";
export async function getUserById(id: number) {
  const [row] = await db.select().from(User).where(User.id.eq(id)).limit(1);
  return row as typeof User.$inferSelect | undefined;
}
```

---

## ðŸš¦ Do / Donâ€™t

| âœ… Do | âŒ Donâ€™t |
| --- | --- |
| Import `db`, tables, and **inferred types** from the schema | Create custom row interfaces (`interface User { ... }`) |
| Validate inputs with Zod then map to `.$inferInsert` | Accept untyped/any payloads from forms or JSON |
| Return `.$inferSelect` from actions/API | Cast/`any` to bypass type checking |
| Keep imports consistent with `@/db/config` | Import from deep private paths or duplicate modules |
| Use helper types (`Pick`, `Omit`, etc.) if needed | Mutate read types (`$inferSelect`) for write payloads |

---

## âš™ï¸ tsconfig / Paths (Assumptions)

Ensure `@` path alias is configured:

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

---

## ðŸ§¯ Error Handling & Narrowing

- Use exhaustive checks where applicable.
- Prefer typed guards over `any`.
- Wrap DB calls that can fail with try/catch and return typed fallbacks.

```ts
function isUser(x: unknown): x is typeof User.$inferSelect {
  return !!x && typeof (x as any).email === "string";
}
```

---

## ðŸ” Security & Input Rules

- Never trust client input; **validate** with Zod.
- Enforce **access checks** server-side before DB mutations.
- Avoid leaking internal IDs where not needed.

---

## ðŸ§­ Quick Checklist (for every file Codex generates)

- [ ] Imports from `@/db/config` (and `@/types` if used) only
- [ ] No custom interfaces duplicating DB shapes
- [ ] `.$inferInsert` used for writes
- [ ] `.$inferSelect` used for reads/returns
- [ ] External input validated with Zod
- [ ] Paths use `@/...` alias
- [ ] No `any` or unsafe casts

---

## ðŸ“Œ Example: End-to-End Flow

```ts
// 1) Action
export const createUser = action(async (input) => {
  const data = CreateUserSchema.parse(input);
  const payload: typeof User.$inferInsert = { name: data.name, email: data.email };
  await db.insert(User).values(payload);
});

// 2) Read in API route
export const GET: APIRoute = async () => {
  const users = await db.select().from(User);
  return new Response(JSON.stringify(users), { headers: { "content-type": "application/json" } });
};

// 3) UI component typed by DB row
type UserRow = typeof User.$inferSelect;
function List({ users }: { users: UserRow[] }) { /* ... */ }
```

---

## ðŸ“ Final Rule for Codex

> **If a type exists in Astro DB, import and use it. Do not recreate it.**
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { db, Contract, eq } from 'astro:db';
import { requireUser, findContractOrThrow, normalizeContractRow, sanitizeContractTitle } from './utils';

export const duplicate = defineAction({
  accept: 'json',
  input: z.object({ id: z.string().uuid() }),
  async handler({ id }, ctx) {
    const user = await requireUser(ctx);
    const existing = await findContractOrThrow(id, user.id);
    const now = new Date();
    const duplicateId = crypto.randomUUID();

    await db.insert(Contract).values({
      id: duplicateId,
      userId: user.id,
      title: sanitizeContractTitle(`${existing.title} copy`),
      templateKey: existing.templateKey,
      type: existing.type,
      status: 'draft',
      variables: existing.variables,
      clauses: existing.clauses,
      versions: existing.versions,
      options: existing.options,
      notes: existing.notes ?? undefined,
      lastSavedAt: now,
      createdAt: now,
    });

    const rows = await db.select().from(Contract).where(eq(Contract.id, duplicateId));
    const contract = rows[0];
    return { contract: contract ? normalizeContractRow(contract) : null };
  },
});

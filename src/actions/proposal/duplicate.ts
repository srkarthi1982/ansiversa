import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { db, Proposal, eq } from 'astro:db';
import { requireUser, findProposalOrThrow, normalizeProposalRow, sanitizeTitle } from './utils';

export const duplicate = defineAction({
  accept: 'json',
  input: z.object({ id: z.string().uuid(), title: z.string().optional() }),
  async handler({ id, title }, ctx) {
    const user = await requireUser(ctx);
    const original = await findProposalOrThrow(id, user.id);
    const now = new Date();
    const duplicateId = crypto.randomUUID();

    const duplicatedTitle = title ? sanitizeTitle(title) : `${original.title} (Copy)`;

    await db.insert(Proposal).values({
      id: duplicateId,
      userId: user.id,
      title: duplicatedTitle,
      templateKey: original.templateKey,
      status: 'draft',
      currency: original.currency,
      data: JSON.parse(JSON.stringify(original.data ?? {})),
      lastSavedAt: now,
      createdAt: now,
    });

    const rows = await db.select().from(Proposal).where(eq(Proposal.id, duplicateId));
    return { proposal: normalizeProposalRow(rows[0]) };
  },
});

import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { db, Proposal, eq } from 'astro:db';
import { requireUser, findProposalOrThrow } from './utils';

export const remove = defineAction({
  accept: 'json',
  input: z.object({ id: z.string().uuid() }),
  async handler({ id }, ctx) {
    const user = await requireUser(ctx);
    await findProposalOrThrow(id, user.id);
    await db.delete(Proposal).where(eq(Proposal.id, id));
    return { ok: true };
  },
});

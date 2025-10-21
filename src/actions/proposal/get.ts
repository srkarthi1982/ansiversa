import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { requireUser, findProposalOrThrow, normalizeProposalRow } from './utils';

export const get = defineAction({
  accept: 'json',
  input: z.object({ id: z.string().uuid() }),
  async handler({ id }, ctx) {
    const user = await requireUser(ctx);
    const proposal = await findProposalOrThrow(id, user.id);
    return { proposal: normalizeProposalRow(proposal) };
  },
});

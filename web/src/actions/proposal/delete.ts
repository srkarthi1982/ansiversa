import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { eq } from 'astro:db';
import { requireUser, findProposalOrThrow } from './utils';
import { proposalRepository } from './repositories';

export const remove = defineAction({
  accept: 'json',
  input: z.object({ id: z.string().uuid() }),
  async handler({ id }, ctx) {
    const user = await requireUser(ctx);
    await findProposalOrThrow(id, user.id);
    await proposalRepository.delete((table) => eq(table.id, id));
    return { ok: true };
  },
});

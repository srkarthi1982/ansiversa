import { defineAction } from 'astro:actions';
import { requireUser, listProposalsForUser } from './utils';

export const list = defineAction({
  accept: 'json',
  async handler(_input, ctx) {
    const user = await requireUser(ctx);
    const proposals = await listProposalsForUser(user.id);
    return { items: proposals };
  },
});

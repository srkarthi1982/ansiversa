import { defineAction } from 'astro:actions';
import { requireUser, listContractsForUser } from './utils';

export const list = defineAction({
  accept: 'json',
  async handler(_input, ctx) {
    const user = await requireUser(ctx);
    const items = await listContractsForUser(user.id);
    return { items };
  },
});

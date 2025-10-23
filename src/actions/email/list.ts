import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { listDraftsForUser, requireUser } from './utils';

export const list = defineAction({
  accept: 'json',
  input: z.object({}).optional(),
  async handler(_input, ctx) {
    const user = await requireUser(ctx);
    const items = await listDraftsForUser(user.id, user.plan);
    return { items, plan: user.plan };
  },
});

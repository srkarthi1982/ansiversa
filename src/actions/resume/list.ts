import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { requireUser, listResumesForUser } from './utils';

export const list = defineAction({
  accept: 'json',
  input: z.object({}).optional(),
  async handler(_, ctx) {
    const user = await requireUser(ctx);
    const items = await listResumesForUser(user.id);
    return { items };
  },
});

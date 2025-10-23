import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { listTemplatesForUser, requireUser } from './utils';

export const templates = defineAction({
  accept: 'json',
  input: z.object({}).optional(),
  async handler(_input, ctx) {
    const user = await requireUser(ctx);
    const items = await listTemplatesForUser(user.id);
    return { items };
  },
});

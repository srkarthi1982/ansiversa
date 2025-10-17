import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { requireUser, listResumesForUser } from './utils';

type Plan = 'free' | 'pro' | 'elite';

export const list = defineAction({
  accept: 'json',
  input: z.object({}).optional(),
  async handler(_, ctx) {
    const user = await requireUser(ctx);
    const items = await listResumesForUser(user.id);
    const plan = (user.plan as Plan | undefined) ?? 'free';
    return { items, plan };
  },
});

import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { requireUser, listCoverLettersForUser, countTodaysAiComposes } from './utils';

export const list = defineAction({
  accept: 'json',
  input: z.void().optional(),
  async handler(_input, ctx) {
    const user = await requireUser(ctx);
    const items = await listCoverLettersForUser(user.id);
    const used = await countTodaysAiComposes(user.id);
    const plan = (user.plan as 'free' | 'pro' | 'elite' | undefined) ?? 'free';
    const limit = plan === 'free' ? 3 : null;

    return {
      items,
      plan,
      aiUsage: {
        used,
        limit,
      },
    };
  },
});

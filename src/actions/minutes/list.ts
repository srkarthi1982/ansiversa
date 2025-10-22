import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { requireUser, listMinutesForUser } from './utils';

export const list = defineAction({
  accept: 'json',
  input: z
    .object({
      includeSummary: z.boolean().default(true),
    })
    .optional(),
  async handler(_input, ctx) {
    const user = await requireUser(ctx);
    const minutes = await listMinutesForUser(user.id);

    const metrics = minutes.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.status === 'published') acc.published += 1;
        const open = item.summary.actionItems.filter((action) => action.status !== 'done').length;
        acc.openActions += open;
        if (item.summary.actionItems.length > 0) {
          acc.totalActions += item.summary.actionItems.length;
        }
        return acc;
      },
      { total: 0, published: 0, openActions: 0, totalActions: 0 },
    );

    return {
      items: minutes,
      metrics,
      plan: (user.plan ?? 'free') as 'free' | 'pro',
    };
  },
});


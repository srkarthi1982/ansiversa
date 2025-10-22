import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { MinutesActionItem, db, eq } from 'astro:db';
import { requireUser, findMinutesOrThrow, normalizeMinutesRow } from './utils';

export const get = defineAction({
  accept: 'json',
  input: z.object({ id: z.string().uuid() }),
  async handler({ id }, ctx) {
    const user = await requireUser(ctx);
    const row = await findMinutesOrThrow(id, user.id);
    const minutes = normalizeMinutesRow(row);

    const items = await db
      .select()
      .from(MinutesActionItem)
      .where(eq(MinutesActionItem.minutesId, id));

    const actionItems = items.map((item) => ({
      id: item.id,
      minutesId: item.minutesId,
      task: item.task,
      assignee: item.assignee ?? '',
      due: item.due ? item.due.toISOString().slice(0, 10) : null,
      priority: item.priority ?? 'med',
      status: item.status ?? 'open',
      createdAt: item.createdAt ? item.createdAt.toISOString() : null,
    }));

    return {
      minutes,
      actionItems,
      plan: (user.plan ?? 'free') as 'free' | 'pro',
    };
  },
});


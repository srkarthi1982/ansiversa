import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { db, Minutes, MinutesActionItem, MinutesMedia, eq } from 'astro:db';
import { requireUser, findMinutesOrThrow } from './utils';

export const remove = defineAction({
  accept: 'json',
  input: z.object({ id: z.string().uuid() }),
  async handler({ id }, ctx) {
    const user = await requireUser(ctx);
    await findMinutesOrThrow(id, user.id);

    await db.delete(MinutesActionItem).where(eq(MinutesActionItem.minutesId, id));
    await db.delete(MinutesMedia).where(eq(MinutesMedia.minutesId, id));
    await db.delete(Minutes).where(eq(Minutes.id, id));

    return { ok: true };
  },
});


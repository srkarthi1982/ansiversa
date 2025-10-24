import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { eq } from 'astro:db';
import { requireUser, findMinutesOrThrow } from './utils';
import {
  minutesActionItemRepository,
  minutesMediaRepository,
  minutesRepository,
} from './repositories';

export const remove = defineAction({
  accept: 'json',
  input: z.object({ id: z.string().uuid() }),
  async handler({ id }, ctx) {
    const user = await requireUser(ctx);
    await findMinutesOrThrow(id, user.id);

    await minutesActionItemRepository.delete((table) => eq(table.minutesId, id));
    await minutesMediaRepository.delete((table) => eq(table.minutesId, id));
    await minutesRepository.delete((table) => eq(table.id, id));

    return { ok: true };
  },
});


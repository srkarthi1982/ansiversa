import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { eq } from 'astro:db';
import { requireUser, findDraftOrThrow } from './utils';
import { emailDraftRepository } from './repositories';

export const remove = defineAction({
  accept: 'json',
  input: z.object({ id: z.string().uuid() }),
  async handler({ id }, ctx) {
    const user = await requireUser(ctx);
    await findDraftOrThrow(id, user.id);
    await emailDraftRepository.delete((table) => eq(table.id, id));
    return { ok: true };
  },
});

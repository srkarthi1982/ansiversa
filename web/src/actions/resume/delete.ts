import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { requireUser, findResumeOrThrow, deleteResumeCascade } from './utils';

export const remove = defineAction({
  accept: 'json',
  input: z.object({
    id: z.string().uuid(),
  }),
  async handler({ id }, ctx) {
    const user = await requireUser(ctx);
    await findResumeOrThrow(id, user.id);
    await deleteResumeCascade(id, user.id);
    return { ok: true };
  },
});

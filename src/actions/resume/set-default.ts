import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { requireUser, findResumeOrThrow, setDefaultResume } from './utils';

export const setDefault = defineAction({
  accept: 'json',
  input: z.object({
    id: z.string().uuid(),
  }),
  async handler({ id }, ctx) {
    const user = await requireUser(ctx);
    await findResumeOrThrow(id, user.id);
    await setDefaultResume(id, user.id);
    return { ok: true, id };
  },
});

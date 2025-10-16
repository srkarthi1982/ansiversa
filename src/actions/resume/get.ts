import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { requireUser, findResumeOrThrow, normalizeResumeRow } from './utils';

export const get = defineAction({
  accept: 'json',
  input: z.object({
    id: z.string().uuid(),
  }),
  async handler({ id }, ctx) {
    const user = await requireUser(ctx);
    const resume = await findResumeOrThrow(id, user.id);
    if (resume.userId !== user.id) {
      throw new ActionError({ code: 'FORBIDDEN', message: 'Access denied' });
    }
    return { resume: normalizeResumeRow(resume) };
  },
});

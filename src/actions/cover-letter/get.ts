import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { requireUser, findCoverLetterOrThrow, normalizeCoverLetterRow } from './utils';

export const get = defineAction({
  accept: 'json',
  input: z.object({ id: z.string().uuid() }),
  async handler(input, ctx) {
    const user = await requireUser(ctx);
    if (!input?.id) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Missing cover letter id' });
    }
    const row = await findCoverLetterOrThrow(input.id, user.id);
    return { letter: normalizeCoverLetterRow(row) };
  },
});

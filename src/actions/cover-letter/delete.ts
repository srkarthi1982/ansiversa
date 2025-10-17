import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { requireUser, removeCoverLetterCascade } from './utils';

export const deleteLetter = defineAction({
  accept: 'json',
  input: z.object({ id: z.string().uuid() }),
  async handler(input, ctx) {
    const user = await requireUser(ctx);
    await removeCoverLetterCascade(input.id, user.id);
    return { success: true };
  },
});

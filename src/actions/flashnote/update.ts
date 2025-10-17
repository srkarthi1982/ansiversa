import { defineAction } from 'astro:actions';
import { updateInputSchema } from './schemas';
import { requireUser, updateNoteRecord } from './utils';

export const update = defineAction({
  accept: 'json',
  input: updateInputSchema,
  async handler(input, ctx) {
    const user = await requireUser(ctx, input.sessionId);
    const note = await updateNoteRecord(user.id, input);
    return { note };
  },
});

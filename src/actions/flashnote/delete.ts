import { defineAction } from 'astro:actions';
import { deleteInputSchema } from './schemas';
import { deleteNoteRecord, requireUser } from './utils';

export const destroy = defineAction({
  accept: 'json',
  input: deleteInputSchema,
  async handler(input, ctx) {
    const user = await requireUser(ctx, input.sessionId);
    await deleteNoteRecord(user.id, input.id);
    return { success: true } as const;
  },
});

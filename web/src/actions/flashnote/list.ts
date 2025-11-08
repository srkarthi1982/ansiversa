import { defineAction } from 'astro:actions';
import { listInputSchema } from './schemas';
import { listNotes, requireUser } from './utils';

export const list = defineAction({
  accept: 'json',
  input: listInputSchema,
  async handler(input, ctx) {
    const user = await requireUser(ctx, input?.sessionId);
    const notes = await listNotes(user.id);
    return { notes };
  },
});

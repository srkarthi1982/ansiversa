import { defineAction } from 'astro:actions';
import { createInputSchema } from './schemas';
import { createNoteRecord, requireUser } from './utils';

export const create = defineAction({
  accept: 'json',
  input: createInputSchema,
  async handler(input, ctx) {
    const user = await requireUser(ctx, input.sessionId);
    const note = await createNoteRecord(user.id, input);
    return { note };
  },
});

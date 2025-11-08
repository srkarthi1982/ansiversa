import { defineAction } from 'astro:actions';
import { summariseInputSchema } from './schemas';
import {
  enforceAIRateLimit,
  ensureOwnership,
  requireUser,
  runAIMode,
  updateNoteRecord,
} from './utils';

export const summarise = defineAction({
  accept: 'json',
  input: summariseInputSchema,
  async handler(input, ctx) {
    const user = await requireUser(ctx, input.sessionId);
    enforceAIRateLimit(user.id);
    const note = await ensureOwnership(input.id, user.id);
    const text = runAIMode(input.mode, note.content, input.promptOverride);
    await updateNoteRecord(user.id, {
      id: note.id,
      summary: text,
    });
    return { resultText: text };
  },
});

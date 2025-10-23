import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { rewriteEmail } from '../../lib/email/generator';
import { recordHistory, requireUser, rewriteEnum, toneEnum } from './utils';

export const rewrite = defineAction({
  accept: 'json',
  input: z.object({
    text: z.string().min(1).max(20000),
    mode: rewriteEnum.default('clarify'),
    tone: toneEnum.default('professional'),
    language: z.string().default('en'),
    draftId: z.string().uuid().optional(),
  }),
  async handler({ text, mode, tone, language, draftId }, ctx) {
    const user = await requireUser(ctx);
    const rewritten = rewriteEmail({ text, mode, tone, language });

    if (draftId) {
      await recordHistory({
        draftId,
        action: 'rewrite',
        inputSize: text.length,
        outputSize: rewritten.length,
      });
    }

    return { text: rewritten };
  },
});

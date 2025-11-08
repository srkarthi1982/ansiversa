import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { translateEmail } from '../../lib/email/generator';
import { recordHistory, requireUser, translateEnum } from './utils';

export const translate = defineAction({
  accept: 'json',
  input: z.object({
    text: z.string().min(1).max(20000),
    to: translateEnum,
    preserveTone: z.boolean().default(true),
    draftId: z.string().uuid().optional(),
  }),
  async handler({ text, to, preserveTone, draftId }, ctx) {
    const user = await requireUser(ctx);
    const translated = translateEmail({ text, target: to, preserveTone });

    if (draftId) {
      await recordHistory({
        draftId,
        action: 'translate',
        inputSize: text.length,
        outputSize: translated.length,
      });
    }

    return { text: translated };
  },
});

import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { generatePolishedEmail } from '../../lib/email/generator';
import { formalityEnum, toneEnum, requireUser, findSignatureForUser, recordHistory } from './utils';

export const polish = defineAction({
  accept: 'json',
  input: z.object({
    text: z.string().min(1).max(20000),
    tone: toneEnum.default('professional'),
    formality: formalityEnum.default('medium'),
    language: z.string().default('en'),
    needSubject: z.boolean().default(false),
    signatureEnabled: z.boolean().default(true),
    draftId: z.string().uuid().optional(),
  }),
  async handler({ text, tone, formality, language, needSubject, signatureEnabled, draftId }, ctx) {
    const user = await requireUser(ctx);
    const signature = signatureEnabled ? await findSignatureForUser(user.id) : null;
    const result = generatePolishedEmail({
      text,
      tone,
      formality,
      language,
      needSubject,
      signature: signature?.enabled ? signature.display : null,
    });

    if (draftId) {
      await recordHistory({
        draftId,
        action: 'polish',
        inputSize: text.length,
        outputSize: result.text.length,
      });
    }

    return result;
  },
});

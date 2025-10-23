import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { generateReplyVariants } from '../../lib/email/generator';
import { relationshipEnum, requireUser, toneEnum, urgencyEnum, recordHistory } from './utils';

export const reply = defineAction({
  accept: 'json',
  input: z.object({
    incoming: z.string().min(1).max(20000),
    tone: toneEnum.default('professional'),
    variants: z.number().int().min(1).max(5).default(3),
    relationship: relationshipEnum.default('existing'),
    urgency: urgencyEnum.default('normal'),
    draftId: z.string().uuid().optional(),
  }),
  async handler({ incoming, tone, variants, relationship, urgency, draftId }, ctx) {
    const user = await requireUser(ctx);
    const replies = generateReplyVariants({ incoming, tone, variants, relationship, urgency });

    if (draftId) {
      const longest = replies.reduce((max, reply) => Math.max(max, reply.body.length), 0);
      await recordHistory({
        draftId,
        action: 'reply',
        inputSize: incoming.length,
        outputSize: longest,
      });
    }

    return { replies };
  },
});

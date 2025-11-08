import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { summarizeThread } from '../../lib/email/generator';
import { requireUser, recordHistory } from './utils';

export const summarize = defineAction({
  accept: 'json',
  input: z.object({
    thread: z.string().min(1).max(40000),
    prefer: z.array(z.enum(['action_items', 'open_questions', 'bullets'])).default(['bullets', 'action_items']),
    draftId: z.string().uuid().optional(),
  }),
  async handler({ thread, prefer, draftId }, ctx) {
    const user = await requireUser(ctx);
    const summary = summarizeThread({ thread, focus: prefer });

    if (draftId) {
      const combinedLength =
        summary.bullets.join(' ').length +
        summary.actionItems.map((item) => item.task).join(' ').length +
        summary.openQuestions.join(' ').length;
      await recordHistory({
        draftId,
        action: 'summarize',
        inputSize: thread.length,
        outputSize: combinedLength,
      });
    }

    return { summary };
  },
});

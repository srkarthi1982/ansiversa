import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { proposalToneOptions } from '../../lib/proposal/schema';
import { requireUser } from './utils';

const toneEnum = z.enum(proposalToneOptions);

const toneTransforms: Record<typeof proposalToneOptions[number], (text: string) => string> = {
  professional: (text) => `In summary, ${text.trim()}`,
  friendly: (text) => `Let's ${text.trim().replace(/^we\s+/i, '').replace(/^let's\s+/i, '')}`,
  concise: (text) => text.replace(/\s+/g, ' ').trim(),
  bold: (text) => `${text.trim()} — and we will deliver beyond expectations.`,
  empathetic: (text) => `${text.trim()} We appreciate the context and will partner closely throughout.`,
};

export const aiImprove = defineAction({
  accept: 'json',
  input: z.object({ text: z.string().min(10), tone: toneEnum.default('professional') }),
  async handler({ text, tone }, ctx) {
    await requireUser(ctx);
    const transform = toneTransforms[tone];
    return {
      text: transform(text),
    };
  },
});

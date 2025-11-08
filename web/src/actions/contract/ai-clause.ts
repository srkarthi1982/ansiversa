import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { contractToneOptions } from '../../lib/contract/schema';
import { requireUser } from './utils';

const modeEnum = z.enum(['tighten', 'draft', 'translate', 'simplify']);
const toneEnum = z.enum(contractToneOptions);

const modeCopy: Record<z.infer<typeof modeEnum>, string> = {
  tighten: 'refined for clarity and legal tone',
  draft: 'expanded into a complete clause',
  translate: 'translated into plain language',
  simplify: 'simplified for readability',
};

export const aiClause = defineAction({
  accept: 'json',
  input: z.object({
    text: z.string().min(4),
    mode: modeEnum.default('tighten'),
    tone: toneEnum.default('formal'),
  }),
  async handler({ text, mode, tone }, ctx) {
    await requireUser(ctx);

    const prefix = tone === 'friendly' ? 'Let’s ensure' : tone === 'direct' ? 'Ensure' : 'This clause ensures';
    const suggestion = `${prefix} that ${text.trim()}`;
    const enhanced = `${suggestion}. This version is ${modeCopy[mode]}.`;

    return {
      text: enhanced,
      notes: `Generated in ${tone} tone (${mode}). Always review with legal counsel.`,
    };
  },
});

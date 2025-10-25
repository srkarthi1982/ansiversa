import { defineAction } from 'astro:actions';
import { VisitingCardTaglineSchema } from '../../lib/visiting-card-maker/schema';
import { callOpenAITagline, createFallbackTagline, requireUser } from './utils';

export const generateTagline = defineAction({
  accept: 'json',
  input: VisitingCardTaglineSchema,
  async handler(input, ctx) {
    await requireUser(ctx);
    const aiResult = await callOpenAITagline(input);
    if (aiResult) {
      return {
        tagline: aiResult.tagline,
        source: 'openai' as const,
        usage: aiResult.usage,
      };
    }

    const fallback = await createFallbackTagline(input);
    return {
      tagline: fallback,
      source: 'template' as const,
      usage: { inputTokens: 0, outputTokens: 0 },
    };
  },
});

import { defineAction } from 'astro:actions';
import { CoverLetterGenerationSchema } from '../../lib/cover-letter-writer/schema';
import { callOpenAICoverLetter, renderFallbackLetter, requireUser } from './utils';

export const generate = defineAction({
  accept: 'json',
  input: CoverLetterGenerationSchema,
  async handler(input, ctx) {
    await requireUser(ctx);
    const aiResult = await callOpenAICoverLetter(input);
    if (aiResult) {
      return {
        letter: aiResult.letter,
        metadata: {
          tone: input.tone,
          templateKey: input.templateKey,
          source: 'openai' as const,
          usage: aiResult.usage,
        },
      };
    }

    const fallback = await renderFallbackLetter(input.templateKey, {
      position: input.position,
      company: input.company,
      intro: input.intro,
      skills: input.skills,
      achievements: input.achievements,
    });

    return {
      letter: fallback,
      metadata: {
        tone: input.tone,
        templateKey: input.templateKey,
        source: 'template' as const,
        usage: { inputTokens: 0, outputTokens: 0 },
      },
    };
  },
});

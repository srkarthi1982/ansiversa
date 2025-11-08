import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { requireUser } from './utils';

const toneSchema = z.enum(['concise', 'professional', 'friendly']).default('professional');

const sanitize = (value: string) => value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const buildFallback = (text: string, tone: string) => {
  const safe = sanitize(text);
  if (!safe) {
    return 'Provide content to improve and try again.';
  }
  return `${tone === 'concise' ? 'Concise' : tone === 'friendly' ? 'Friendly' : 'Professional'} rewrite: ${safe.slice(0, 200)}${safe.length > 200 ? '…' : ''}`;
};

export const aiImprove = defineAction({
  accept: 'json',
  input: z.object({
    text: z.string().optional().default(''),
    tone: toneSchema.optional(),
  }),
  async handler({ text = '', tone = 'professional' }, ctx) {
    await requireUser(ctx);
    const apiKey = import.meta.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        suggestion: buildFallback(text, tone),
        tone,
        usage: { inputTokens: 0, outputTokens: 0 },
        source: 'fallback',
      };
    }

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You rewrite resume content. Keep it professional, results oriented, and under 120 words. Avoid HTML. Return plain text only.',
        },
        {
          role: 'user',
          content: `Rewrite this resume content with a ${tone} tone:\n\n${text}`,
        },
      ],
      temperature: tone === 'friendly' ? 0.8 : 0.4,
      max_tokens: 220,
    };

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return {
          suggestion: buildFallback(text, tone),
          tone,
          usage: { inputTokens: 0, outputTokens: 0 },
          source: 'fallback',
        };
      }

      const data = await response.json();
      const suggestion =
        sanitize(data?.choices?.[0]?.message?.content ?? '') || buildFallback(text, tone);
      const usage = data?.usage ?? { input_tokens: 0, output_tokens: 0 };
      return {
        suggestion,
        tone,
        usage: { inputTokens: usage.input_tokens ?? 0, outputTokens: usage.output_tokens ?? 0 },
        source: 'openai',
      };
    } catch (error) {
      console.error('AI improve failed', error);
      return {
        suggestion: buildFallback(text, tone),
        tone,
        usage: { inputTokens: 0, outputTokens: 0 },
        source: 'fallback',
      };
    }
  },
});

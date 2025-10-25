import { defineAction } from 'astro:actions';
import { CoverLetterToneSchema } from '../../lib/cover-letter-writer/schema';
import { requireUser } from './utils';

const sanitize = (value: string) => value.replace(/<[^>]*>/g, '').trim();

const callToneModel = async (content: string, tone: string) => {
  const apiKey = import.meta.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const messages = [
    {
      role: 'system',
      content:
        'You rewrite cover letters into the requested tone. Keep the structure professional, limit to three paragraphs, and include a confident closing.',
    },
    {
      role: 'user',
      content: [`Desired tone: ${tone}`, 'Rewrite the following letter:', sanitize(content)].join('\n\n'),
    },
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: tone === 'friendly' ? 0.75 : tone === 'confident' ? 0.55 : 0.4,
        max_tokens: 360,
        messages,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== 'string' || !text.trim()) {
      return null;
    }

    return {
      letter: text.trim(),
      usage: {
        inputTokens: data?.usage?.input_tokens ?? 0,
        outputTokens: data?.usage?.output_tokens ?? 0,
      },
    };
  } catch (error) {
    console.error('Cover letter tone rewrite failed', error);
    return null;
  }
};

export const rewriteTone = defineAction({
  accept: 'json',
  input: CoverLetterToneSchema,
  async handler({ content, tone }, ctx) {
    await requireUser(ctx);
    const aiResult = await callToneModel(content, tone);
    if (aiResult) {
      return {
        letter: aiResult.letter,
        metadata: {
          tone,
          source: 'openai' as const,
          usage: aiResult.usage,
        },
      };
    }

    return {
      letter: sanitize(content),
      metadata: {
        tone,
        source: 'original' as const,
        usage: { inputTokens: 0, outputTokens: 0 },
      },
    };
  },
});

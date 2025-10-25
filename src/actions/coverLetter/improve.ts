import { defineAction } from 'astro:actions';
import { CoverLetterImproveSchema } from '../../lib/cover-letter-writer/schema';
import { requireUser } from './utils';

const sanitize = (value: string) => value.replace(/<[^>]*>/g, '').trim();

const callImproveModel = async (content: string, tone: string, focus?: string) => {
  const apiKey = import.meta.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const messages = [
    {
      role: 'system',
      content:
        'You refine professional cover letters. Preserve key facts, tighten language, and keep the tone aligned with the request. Return plain text paragraphs.',
    },
    {
      role: 'user',
      content: [
        `Tone: ${tone}`,
        focus ? `Focus areas: ${focus}` : null,
        'Original letter:',
        sanitize(content),
      ]
        .filter(Boolean)
        .join('\n\n'),
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
        temperature: tone === 'friendly' ? 0.7 : tone === 'confident' ? 0.5 : 0.4,
        max_tokens: 380,
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
    console.error('Cover letter improve request failed', error);
    return null;
  }
};

export const improve = defineAction({
  accept: 'json',
  input: CoverLetterImproveSchema,
  async handler({ content, focus, tone }, ctx) {
    await requireUser(ctx);
    const aiResult = await callImproveModel(content, tone, focus);
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

    const cleaned = sanitize(content);
    return {
      letter: cleaned,
      metadata: {
        tone,
        source: 'original' as const,
        usage: { inputTokens: 0, outputTokens: 0 },
      },
    };
  },
});

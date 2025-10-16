import type { APIRoute } from 'astro';

// TODO: Connect to hosted LLM provider and enforce safety filters per requirements.

const sanitize = (text: string) =>
  text
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const buildSuggestion = (text: string, tone: string) => {
  const trimmed = sanitize(text);
  if (!trimmed) {
    return 'Provide some context so we can suggest an improvement.';
  }

  const suggestions = {
    concise: `Condensed: ${trimmed.slice(0, 160)}${trimmed.length > 160 ? '…' : ''}`,
    professional: `Professional: ${trimmed.slice(0, 160)}${trimmed.length > 160 ? '…' : ''}`,
    friendly: `Friendly: ${trimmed.slice(0, 160)}${trimmed.length > 160 ? '…' : ''}`,
  } as const;

  return suggestions[tone as keyof typeof suggestions] ?? suggestions.professional;
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json().catch(() => ({}));
    const { text = '', tone = 'professional' } = payload ?? {};
    const suggestion = buildSuggestion(String(text), String(tone));

    return new Response(
      JSON.stringify({
        ok: true,
        suggestion,
        tone,
        usage: {
          inputTokens: Math.ceil(String(text).length / 4),
          outputTokens: Math.ceil(suggestion.length / 4),
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Failed to process AI improve request', error);
    return new Response(JSON.stringify({ error: 'Unable to generate suggestion' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

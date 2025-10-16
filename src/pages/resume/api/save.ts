import type { APIRoute } from 'astro';

// TODO: Persist partial updates to Astro DB and handle optimistic concurrency.

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json().catch(() => ({}));
    const { id, patch, autosave } = payload ?? {};
    if (!id || typeof id !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing resume id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        id,
        autosave: Boolean(autosave),
        patch,
        savedAt: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Failed to save resume', error);
    return new Response(JSON.stringify({ error: 'Unable to save resume' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

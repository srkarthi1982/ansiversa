import type { APIRoute } from 'astro';

// TODO: Implement duplication via database copy including nested JSON data.

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json().catch(() => ({}));
    const { id, title } = payload ?? {};
    if (!id || typeof id !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing resume id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cloneId = crypto.randomUUID();
    return new Response(
      JSON.stringify({
        ok: true,
        id: cloneId,
        sourceId: id,
        title: title ? `${title} (Copy)` : 'Untitled resume (Copy)',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Failed to duplicate resume', error);
    return new Response(JSON.stringify({ error: 'Unable to duplicate resume' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

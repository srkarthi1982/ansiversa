import type { APIRoute } from 'astro';

// TODO: Cascade delete exports in DB once persistence layer is wired.

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json().catch(() => ({}));
    const { id } = payload ?? {};
    if (!id || typeof id !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing resume id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to delete resume', error);
    return new Response(JSON.stringify({ error: 'Unable to delete resume' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

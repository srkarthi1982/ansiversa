import type { APIRoute } from 'astro';

// TODO: Replace with Astro DB create logic once persistence layer is ready.

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json().catch(() => ({}));
    const { title = 'Untitled resume', templateKey = 'modern' } = payload ?? {};
    const id = crypto.randomUUID();

    return new Response(
      JSON.stringify({
        id,
        title,
        templateKey,
        status: 'draft',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Failed to handle resume create request', error);
    return new Response(JSON.stringify({ error: 'Unable to create resume' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

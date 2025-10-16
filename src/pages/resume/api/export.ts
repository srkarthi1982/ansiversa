import type { APIRoute } from 'astro';

// TODO: Render PDF/DOCX via dedicated render pipeline and stream file response.

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json().catch(() => ({}));
    const { id, format = 'pdf', templateKey = 'modern' } = payload ?? {};
    if (!id || typeof id !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing resume id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const filePath = `/exports/${id}.${format}`;
    return new Response(
      JSON.stringify({
        ok: true,
        id,
        format,
        templateKey,
        filePath,
        message: 'Export queued (stub)',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Failed to queue resume export', error);
    return new Response(JSON.stringify({ error: 'Unable to export resume' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

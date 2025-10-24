import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  await request.json().catch(() => ({}));
  const timestamp = new Date().toISOString();
  return new Response(
    JSON.stringify({ ok: true, lastSavedAt: timestamp }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
};

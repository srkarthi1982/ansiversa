import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => ({}));
  const id = typeof body?.id === "string" ? body.id : `cmp-${Date.now().toString(36)}`;
  return new Response(
    JSON.stringify({ id, ok: true }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
};

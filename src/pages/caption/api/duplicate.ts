import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => ({}));
  const id = typeof body?.id === "string" ? body.id : "draft";
  const newId = `${id}-copy-${Date.now().toString(36).slice(-4)}`;
  return new Response(
    JSON.stringify({ id: newId }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
};

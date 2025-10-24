import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => ({}));
  const slug = typeof body?.id === "string" ? body.id : `share-${Date.now().toString(36)}`;
  return new Response(
    JSON.stringify({ url: `/caption/view/${slug}` }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
};

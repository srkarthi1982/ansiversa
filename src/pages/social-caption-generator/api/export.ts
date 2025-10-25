import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => ({}));
  const format = typeof body?.format === "string" ? body.format : "csv";
  const id = typeof body?.id === "string" ? body.id : "draft";
  const url = `/exports/social-caption-generator_${id}.${format}`;
  return new Response(
    JSON.stringify({ url }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
};

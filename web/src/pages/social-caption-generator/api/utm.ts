import type { APIRoute } from "astro";

const buildUrl = (base: string, params: Record<string, string>) => {
  const url = new URL(base || "https://ansiversa.com");
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  return url.toString();
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => ({}));
  const base = typeof body?.base === "string" ? body.base : "https://ansiversa.com";
  const url = buildUrl(base, {
    utm_source: body?.source ?? "social",
    utm_medium: body?.medium ?? "social",
    utm_campaign: body?.campaign ?? "launch",
    utm_content: body?.content ?? "primary",
  });

  return new Response(
    JSON.stringify({ url }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
};

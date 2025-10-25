import type { APIRoute } from "astro";

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => ({}));
  const variantA = typeof body?.variantA === "string" ? body.variantA : "";
  const variantB = typeof body?.variantB === "string" ? body.variantB : "";

  const scoreFor = (text: string) => ({
    clarity: clamp(60 + text.length % 40),
    compliance: clamp(70 + (text.match(/http/g)?.length ?? 0) * 5),
    punch: clamp(65 + (text.split("!").length - 1) * 8),
  });

  return new Response(
    JSON.stringify({
      scores: {
        A: scoreFor(variantA),
        B: scoreFor(variantB),
      },
      suggestions: [
        "Try front-loading the hook for variant A",
        "Keep hashtags concise for variant B",
      ],
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
};

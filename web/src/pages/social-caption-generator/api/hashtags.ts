import type { APIRoute } from "astro";
import { captionHashtagSets } from "../../../data/captionSamples";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => ({}));
  const sets = captionHashtagSets();
  const tags = sets.flatMap((set) => set.tags);
  const unique = Array.from(new Set(tags));
  const limited = typeof body?.limit === "number" ? unique.slice(0, body.limit) : unique.slice(0, 10);

  return new Response(
    JSON.stringify({
      tags: limited,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
};

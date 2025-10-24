import type { APIRoute } from "astro";
import { createDraftFromGenerator, generatorDefaultPayload } from "../../../data/captionSamples";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => ({}));
  const payload = generatorDefaultPayload();
  if (Array.isArray(body?.platforms)) {
    payload.platforms = body.platforms;
  }
  if (typeof body?.idea === "string") {
    payload.idea = body.idea;
  }

  const draft = createDraftFromGenerator(payload);
  return new Response(
    JSON.stringify({
      id: draft.id,
      slug: draft.slug,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
};

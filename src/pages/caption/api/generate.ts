import type { APIRoute } from "astro";
import {
  createDraftFromGenerator,
  generatorDefaultPayload,
} from "../../../data/captionSamples";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => ({}));
  const payload = generatorDefaultPayload();

  if (typeof body?.idea === "string") payload.idea = body.idea;
  if (Array.isArray(body?.platforms)) payload.platforms = body.platforms;
  if (typeof body?.voiceId === "string" || body?.voiceId === null) payload.voiceId = body.voiceId;
  if (typeof body?.hashtagSetId === "string" || body?.hashtagSetId === null) payload.hashtagSetId = body.hashtagSetId;
  if (typeof body?.cta === "string") payload.ctaId = body.cta;
  if (typeof body?.link === "string") payload.link = body.link;

  const draft = createDraftFromGenerator(payload);

  const counters = Object.fromEntries(
    draft.platforms.map((platformId) => [
      platformId,
      draft.variants[platformId].map((variant) => variant.counters),
    ]),
  );

  const compliance = Object.fromEntries(
    draft.platforms.map((platformId) => [
      platformId,
      draft.variants[platformId].map((variant) => variant.compliance),
    ]),
  );

  return new Response(
    JSON.stringify({
      id: draft.id,
      variants: draft.variants,
      counters,
      compliance,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
};

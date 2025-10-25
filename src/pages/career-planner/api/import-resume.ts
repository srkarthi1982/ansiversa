import type { APIRoute } from 'astro';
import { getSamplePlanDetail } from '../../../lib/career/mock';
import { jsonResponse } from '../../../utils/actions-api';

export const prerender = false;

type ImportPayload = {
  text?: string;
};

export const POST: APIRoute = async ({ request }) => {
  await request.json().catch(() => ({})) as ImportPayload;
  const sample = getSamplePlanDetail();
  return jsonResponse({
    success: true,
    data: {
      skillsCurrent: sample.skillsCurrent,
      highlights: sample.resumeBullets,
    },
  });
};

import type { APIRoute } from 'astro';
import { findPlanBySlug, getSamplePlanDetail } from '../../../lib/career/mock';
import { jsonResponse } from '../../../utils/actions-api';

export const prerender = false;

type PublishPayload = {
  id?: string;
};

export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json().catch(() => ({}))) as PublishPayload;
  const plan = body.id ? findPlanBySlug('frontend-engineer-transition') ?? getSamplePlanDetail() : getSamplePlanDetail();
  return jsonResponse({ success: true, data: { url: `/career/view/${plan.slug}` } });
};

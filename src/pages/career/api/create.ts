import type { APIRoute } from 'astro';
import { createDraftPlan } from '../../../lib/career/mock';
import type { CareerPlanBuilderState, CareerPlanSummary } from '../../../types/career';
import { jsonResponse } from '../../../utils/actions-api';

export const prerender = false;

type CreatePayload = {
  title?: string;
};

const toSummary = (plan: CareerPlanBuilderState): CareerPlanSummary => ({
  id: plan.id ?? crypto.randomUUID(),
  title: plan.title,
  slug: plan.slug,
  status: plan.status,
  targetRoleId: plan.targets[0]?.roleId ?? 'unknown',
  progress: 0,
  tasksDue: 0,
  lastSavedAt: plan.lastSavedAt ?? new Date().toISOString(),
  createdAt: plan.createdAt ?? new Date().toISOString(),
  nextReviewAt: null,
});

export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json().catch(() => ({}))) as CreatePayload;
  const { plan, redirectTo } = createDraftPlan(body.title);
  const summary = toSummary(plan);
  return jsonResponse({ success: true, data: { plan: summary, redirectTo } });
};

import type { APIRoute } from 'astro';
import { generateSprintPlan } from '../../../../lib/career/mock';
import { jsonResponse } from '../../../../utils/actions-api';

export const prerender = false;

type SprintPayload = {
  learningPlan?: unknown;
  jobsPerWeek?: number;
  networkingPerWeek?: number;
};

export const POST: APIRoute = async ({ request }) => {
  await request.json().catch(() => ({})) as SprintPayload;
  const sprintPlan = generateSprintPlan();
  return jsonResponse({ success: true, data: { sprintPlan } });
};

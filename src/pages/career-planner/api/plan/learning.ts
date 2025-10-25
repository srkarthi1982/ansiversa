import type { APIRoute } from 'astro';
import { generateLearningPlan } from '../../../../lib/career/mock';
import { jsonResponse } from '../../../../utils/actions-api';

export const prerender = false;

type LearningPayload = {
  skillsCurrent?: Record<string, number>;
  skillsRequired?: Record<string, number>;
  hoursPerWeek?: number;
};

export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json().catch(() => ({}))) as LearningPayload;
  const plan = generateLearningPlan(body.skillsCurrent ?? {}, body.skillsRequired ?? {});
  const hoursPerWeek = Math.max(body.hoursPerWeek ?? 6, 1);
  const etaWeeks = Math.max(4, Math.ceil(plan.totalHours / Math.max(hoursPerWeek, 1)));
  plan.etaWeeks = etaWeeks;
  return jsonResponse({ success: true, data: { learningPlan: plan, etaWeeks } });
};

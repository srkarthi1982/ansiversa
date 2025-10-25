import type { APIRoute } from 'astro';
import { buildAssessmentSummary } from '../../../lib/career/mock';
import type { CareerPlanProfile } from '../../../types/career';
import { jsonResponse } from '../../../utils/actions-api';

export const prerender = false;

type AssessPayload = {
  profile?: CareerPlanProfile;
};

export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json().catch(() => ({}))) as AssessPayload;
  const profile = body.profile ?? {
    currentRole: '',
    experienceYears: 0,
    industries: [],
    interests: [],
    constraints: { remote: true, hoursPerWeek: 6 },
  };
  const assessment = buildAssessmentSummary(profile);
  return jsonResponse({ success: true, data: assessment });
};

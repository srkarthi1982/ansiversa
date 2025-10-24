import type { APIRoute } from 'astro';
import { generateResumeBullets } from '../../../lib/career/mock';
import { jsonResponse } from '../../../utils/actions-api';

export const prerender = false;

type ResumePayload = {
  profile?: Record<string, unknown>;
  projects?: unknown[];
  targetRole?: string;
};

export const POST: APIRoute = async ({ request }) => {
  await request.json().catch(() => ({})) as ResumePayload;
  const bullets = generateResumeBullets();
  return jsonResponse({ success: true, data: { bullets } });
};

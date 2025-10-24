import type { APIRoute } from 'astro';
import { generateProjects } from '../../../lib/career/mock';
import { jsonResponse } from '../../../utils/actions-api';

export const prerender = false;

type ProjectsPayload = {
  targetRole?: string;
  level?: string;
};

export const POST: APIRoute = async ({ request }) => {
  await request.json().catch(() => ({})) as ProjectsPayload;
  const projects = generateProjects();
  return jsonResponse({ success: true, data: { projects } });
};

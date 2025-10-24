import type { APIRoute } from 'astro';
import { jsonResponse } from '../../../utils/actions-api';

export const prerender = false;

type SavePayload = {
  id?: string | null;
  payload?: Record<string, unknown>;
};

export const POST: APIRoute = async ({ request }) => {
  await request.json().catch(() => ({})) as SavePayload;
  const lastSavedAt = new Date().toISOString();
  return jsonResponse({ success: true, data: { lastSavedAt } });
};

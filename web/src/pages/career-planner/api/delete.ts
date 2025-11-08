import type { APIRoute } from 'astro';
import { jsonResponse } from '../../../utils/actions-api';

export const prerender = false;

type DeletePayload = {
  id?: string;
};

export const POST: APIRoute = async ({ request }) => {
  await request.json().catch(() => ({})) as DeletePayload;
  return jsonResponse({ success: true, data: { ok: true } });
};

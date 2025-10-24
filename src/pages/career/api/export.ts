import type { APIRoute } from 'astro';
import { jsonResponse } from '../../../utils/actions-api';

export const prerender = false;

type ExportPayload = {
  id?: string;
  format?: 'pdf' | 'docx' | 'md' | 'csv';
};

export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json().catch(() => ({}))) as ExportPayload;
  const filename = `CareerPlan_${body.id ?? 'draft'}.${body.format ?? 'pdf'}`;
  return jsonResponse({ success: true, data: { url: `/exports/${filename}` } });
};

import type { APIRoute } from 'astro';
import { getApplications } from '../../../lib/career/mock';
import type { CareerApplication } from '../../../types/career';
import { jsonResponse } from '../../../utils/actions-api';

export const prerender = false;

type ApplicationsPayload = {
  op?: 'create' | 'update' | 'delete';
  item?: Partial<CareerApplication>;
};

const normalizeApplication = (item: Partial<CareerApplication>): CareerApplication => {
  const template = getApplications()[0];
  const now = new Date().toISOString();
  return {
    id: item.id ?? crypto.randomUUID(),
    planId: item.planId ?? template.planId,
    company: item.company ?? template.company,
    role: item.role ?? template.role,
    source: item.source ?? 'LinkedIn',
    link: item.link ?? template.link,
    status: item.status ?? 'wishlist',
    appliedOn: item.appliedOn ?? null,
    nextStepOn: item.nextStepOn ?? null,
    notes: item.notes,
    createdAt: item.createdAt ?? now,
  };
};

export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json().catch(() => ({}))) as ApplicationsPayload;
  const op = body.op ?? 'update';

  if (op === 'delete') {
    return jsonResponse({ success: true, data: { ok: true } });
  }

  const normalized = normalizeApplication(body.item ?? {});
  return jsonResponse({ success: true, data: { item: normalized } });
};

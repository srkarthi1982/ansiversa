import type { APIRoute } from 'astro';
import { billing } from '../../../actions/billing';
import { createJsonActionRoute } from '../../../utils/actions-api';

export const prerender = false;

export const GET: APIRoute = createJsonActionRoute(billing.listPlans, {
  allowedMethods: ['GET'],
  parseBody: false,
});

export const POST: APIRoute = createJsonActionRoute(billing.listPlans);

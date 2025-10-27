import type { APIRoute } from 'astro';
import { billing } from '../../../actions/billing';
import { createJsonActionRoute } from '../../../utils/actions-api';

export const prerender = false;

export const POST: APIRoute = createJsonActionRoute(billing.createPortalSession);

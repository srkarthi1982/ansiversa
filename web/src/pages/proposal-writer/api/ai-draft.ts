import type { APIRoute } from 'astro';
import { proposal } from '../../../actions/proposal';
import { createJsonActionRoute } from '../../../utils/actions-api';

export const prerender = false;

export const POST: APIRoute = createJsonActionRoute(proposal.aiDraft);

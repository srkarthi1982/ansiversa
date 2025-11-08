import type { APIRoute } from 'astro';
import { email } from '../../../actions/email';
import { createJsonActionRoute } from '../../../utils/actions-api';

export const prerender = false;

export const POST: APIRoute = createJsonActionRoute(email.translate);

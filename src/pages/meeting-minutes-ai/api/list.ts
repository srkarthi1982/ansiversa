import type { APIRoute } from 'astro';
import { minutes } from '../../../actions/minutes';
import { createJsonActionRoute } from '../../../utils/actions-api';

export const prerender = false;

export const POST: APIRoute = createJsonActionRoute(minutes.list);


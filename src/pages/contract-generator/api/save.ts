import type { APIRoute } from 'astro';
import { contract } from '../../../actions/contract';
import { createJsonActionRoute } from '../../../utils/actions-api';

export const prerender = false;

export const POST: APIRoute = createJsonActionRoute(contract.save);

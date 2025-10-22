import type { APIRoute } from 'astro';
import { contract } from '../../../actions/contract';
import { createJsonActionRoute } from '../../../utils/actions-api';

export const prerender = false;

export const GET: APIRoute = createJsonActionRoute(contract.library, {
  allowedMethods: ['GET'],
  parseBody: false,
});

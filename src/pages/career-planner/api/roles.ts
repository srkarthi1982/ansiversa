import type { APIRoute } from 'astro';
import { getRoleLibrary } from '../../../lib/career/mock';
import { jsonResponse } from '../../../utils/actions-api';

export const prerender = false;

export const GET: APIRoute = async () => {
  const items = getRoleLibrary();
  return jsonResponse({ success: true, data: { items } });
};

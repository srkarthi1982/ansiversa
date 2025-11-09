import type { MiddlewareHandler } from 'astro';
import { corsHeaders, getCorsOrigin, preflightHeaders } from './lib/api/cors';

export const onRequest: MiddlewareHandler = async (context, next) => {
  const origin = getCorsOrigin(context.request);

  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: new Headers(preflightHeaders(origin)),
    });
  }

  const response = await next();
  const headers = new Headers(response.headers);
  const cors = corsHeaders(origin);
  Object.entries(cors).forEach(([key, value]) => headers.set(key, value));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

import type { MiddlewareHandler } from 'hono';
import { ENV } from '../utils/env.js';

export const cors = (): MiddlewareHandler => {
  const origin = ENV.CORS_ORIGIN;

  return async (c, next) => {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Vary', 'Origin');
    c.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    c.header('Access-Control-Max-Age', '86400'); // 1 day

    if (c.req.method === 'OPTIONS') return c.body(null, 204);
    await next();
  };
};

import type { MiddlewareHandler } from 'hono';
import { jwtVerify } from 'jose';
import { ENV } from '../utils/env.js';

export const requireAuth = (): MiddlewareHandler => {
  return async (c, next) => {
    const authHeader = c.req.header('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: 'Missing or invalid token' }, 401);
    }

    const token = authHeader.split(' ')[1];
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(ENV.JWT_SECRET)
      );
      c.set('user', payload);
      await next();
    } catch {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }
  };
};

import type { MiddlewareHandler } from 'hono';

export const errorHandler = (): MiddlewareHandler => {
  return async (c, next) => {
    try {
      await next();
    } catch (err: any) {
      console.error('Unhandled error:', err);
      const status = err?.status ?? 500;
      return c.json({ error: err?.message ?? 'Internal Server Error' }, status);
    }
  };
};

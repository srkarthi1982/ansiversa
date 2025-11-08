import type { MiddlewareHandler } from 'hono';
import { ZodSchema } from 'zod';

export const validateBody = <T>(schema: ZodSchema<T>): MiddlewareHandler => {
  return async (c, next) => {
    const json = await c.req.json().catch(() => null);
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
    }
    c.set('body', parsed.data as T);
    await next();
  };
};

export const validateQuery = <T>(schema: ZodSchema<T>): MiddlewareHandler => {
  return async (c, next) => {
    const qs = Object.fromEntries(new URL(c.req.url).searchParams.entries());
    const parsed = schema.safeParse(qs);
    if (!parsed.success) {
      return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
    }
    c.set('query', parsed.data as T);
    await next();
  };
};

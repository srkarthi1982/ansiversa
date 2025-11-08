import type { MiddlewareHandler } from 'hono';

export const secureHeaders = (): MiddlewareHandler => {
  return async (c, next) => {
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('Referrer-Policy', 'no-referrer');
    c.header('X-XSS-Protection', '0');
    c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    c.header('Cross-Origin-Opener-Policy', 'same-origin');
    c.header('Cross-Origin-Resource-Policy', 'same-origin');
    await next();
  };
};

// src/middleware.ts
import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { url, cookies } = context;
  const isAuthed = cookies.get('session')?.value;
  const protectedPaths = ['/dashboard', '/settings'];

  if (!isAuthed && protectedPaths.some((p) => url.pathname.startsWith(p))) {
    return context.redirect('/login');
  }
  return next();
};

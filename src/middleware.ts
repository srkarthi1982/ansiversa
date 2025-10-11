// src/middleware.ts
import type { MiddlewareHandler } from 'astro';
import { SESSION_COOKIE_NAME, findActiveSessionByToken } from './utils/session';

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { url, cookies } = context;
  const token = cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await findActiveSessionByToken(token);
  const isAuthed = Boolean(session);
  const protectedPaths = ['/dashboard', '/settings'];

  if (!isAuthed && protectedPaths.some((p) => url.pathname.startsWith(p))) {
    return context.redirect('/login');
  }
  return next();
};

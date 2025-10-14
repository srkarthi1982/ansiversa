// src/middleware.ts
import type { MiddlewareHandler } from 'astro';
import { SESSION_COOKIE_NAME, findActiveSessionByToken } from './utils/session.server';

export const onRequest: MiddlewareHandler = async ({ locals, url, cookies, redirect }, next) => {
  if (url.toString().includes('/api/') || url.toString().includes('/_actions/')) return next();
  const token = cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await findActiveSessionByToken(token);
  const isAuthed = Boolean(session);
  const protectedPaths = ['/dashboard', '/settings'];

  if (!isAuthed && protectedPaths.some((p) => url.pathname.startsWith(p))) {
    return redirect('/login');
  }
  return next();
};

// src/middleware.ts
import type { MiddlewareHandler } from 'astro';
import { getSessionWithUser } from './utils/session.server';

export const onRequest: MiddlewareHandler = async ({ locals, url, cookies, redirect }, next) => {
  const result = await getSessionWithUser(cookies);
  const session = result?.session ?? null;
  const user = result?.user ?? null;
  const isAuthed = Boolean(session);
  const protectedPaths = ['/dashboard', '/settings', '/change-password'];
  const includesAdminSegment = url.pathname.split('/').filter(Boolean).includes('admin');
  const requiresAuth = protectedPaths.some((p) => url.pathname.startsWith(p)) || includesAdminSegment;

  if (!isAuthed && requiresAuth) {
    return redirect('/login');
  }

  if (session) {
    locals.session = session;
  }
  if (user) {
    locals.user = user;
    if (includesAdminSegment && user.roleId !== 1) {
      return redirect('/unauthorized');
    }
  }
  return next();
};

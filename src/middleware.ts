// src/middleware.ts
import type { MiddlewareHandler } from 'astro';
import {
  SESSION_COOKIE_NAME,
  deleteUserCookie,
  findActiveSessionByToken,
  getSessionWithUser,
  getUserFromCookies,
  setUserCookie,
} from './utils/session.server';

export const onRequest: MiddlewareHandler = async ({ locals, url, cookies, redirect }, next) => {
  const sessionToken = cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await findActiveSessionByToken(sessionToken);
  let user = getUserFromCookies(cookies);

  if (session && !user) {
    const result = await getSessionWithUser(cookies);
    if (result?.user) {
      user = result.user;
      const remainingMs = result.session.expiresAt.getTime() - Date.now();
      const maxAge = Math.max(0, Math.floor(remainingMs / 1000));
      if (maxAge > 0) {
        setUserCookie(cookies, user, maxAge);
      }
    }
  }

  if (!session && user) {
    deleteUserCookie(cookies);
    user = null;
  }

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

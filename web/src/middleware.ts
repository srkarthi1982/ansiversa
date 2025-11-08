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
import { MINI_APP_PROTECTED_PATHS } from './data/miniApps';

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

  const protectedPrefixes = ['/app/dashboard', '/app/settings', '/app/change-password'];
  const normalizedPathname = url.pathname.replace(/\/+$/, '') || '/';
  const normalizedPath = normalizedPathname.toLowerCase();
  const pathSegments = normalizedPath.split('/').filter(Boolean);
  const includesAdminSegment = pathSegments.includes('admin');

  const matchesPrefix = (path: string, prefix: string) => path === prefix || path.startsWith(`${prefix}/`);

  const requiresMiniAppAuth = MINI_APP_PROTECTED_PATHS.some((route) => matchesPrefix(normalizedPath, `/${route}`));

  const requiresAuth =
    protectedPrefixes.some((prefix) => matchesPrefix(normalizedPath, prefix)) ||
    includesAdminSegment ||
    requiresMiniAppAuth;

  const isAuthed = Boolean(session);

  if (!isAuthed && requiresAuth) {
    return redirect('/app/login');
  }

  if (session) {
    locals.session = session;
  }
  if (user) {
    locals.user = user;
    if (includesAdminSegment && user.roleId !== 1) {
      return redirect('/app/unauthorized');
    }
  }
  return next();
};

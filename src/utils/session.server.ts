import type { AstroCookies } from 'astro';
import { db, Session, User, eq } from 'astro:db';

const { createHash } = await import('node:crypto');

import type { SessionUser } from '../types/session-user';

type MaybeCookies = {
  get(name: string): { value?: string } | undefined;
};

const SESSION_COOKIE_NAME = 'session';
const USER_COOKIE_NAME = 'session_user';

function encodeSessionUser(user: SessionUser) {
  return Buffer.from(JSON.stringify(user), 'utf8').toString('base64url');
}

function decodeSessionUser(encoded: string | undefined): SessionUser | null {
  if (!encoded) return null;
  try {
    const json = Buffer.from(encoded, 'base64url').toString('utf8');
    const parsed = JSON.parse(json);
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.id === 'string' &&
      typeof parsed.username === 'string' &&
      typeof parsed.email === 'string' &&
      typeof parsed.roleId === 'number'
    ) {
      return {
        id: parsed.id,
        username: parsed.username,
        email: parsed.email,
        roleId: parsed.roleId,
        plan: parsed.plan ?? null,
      } satisfies SessionUser;
    }
  } catch (error) {
    console.warn('Failed to decode session user cookie', error);
  }
  return null;
}

export function getUserFromCookies(cookies: MaybeCookies | undefined): SessionUser | null {
  if (!cookies) return null;
  const value = cookies.get(USER_COOKIE_NAME)?.value;
  return decodeSessionUser(value);
}

export function setUserCookie(cookies: AstroCookies, user: SessionUser, maxAge: number) {
  cookies.set(USER_COOKIE_NAME, encodeSessionUser(user), {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: true,
    maxAge,
  });
}

export function deleteUserCookie(cookies: AstroCookies) {
  cookies.delete(USER_COOKIE_NAME, { path: '/' });
}

export function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function findActiveSessionByToken(token: string | undefined | null) {
  if (!token) return null;

  const tokenHash = hashSessionToken(token);
  const rows = await db.select().from(Session).where(eq(Session.tokenHash, tokenHash));
  const session = rows[0];
  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await db.delete(Session).where(eq(Session.id, session.id));
    return null;
  }

  return session;
}

export async function getSessionWithUser(cookies: MaybeCookies | undefined) {
  const token = cookies?.get(SESSION_COOKIE_NAME)?.value;
  const session = await findActiveSessionByToken(token);
  if (!session) {
    return null;
  }

  const cookieUser = getUserFromCookies(cookies);
  if (cookieUser) {
    return { session, user: cookieUser };
  }

  const userRows = await db.select().from(User).where(eq(User.id, session.userId));
  const user = userRows[0];
  if (!user) {
    await db.delete(Session).where(eq(Session.id, session.id));
    return null;
  }

  return {
    session,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      roleId: user.roleId ?? 2,
      plan: user.plan ?? null,
    },
  } satisfies { session: typeof session; user: SessionUser };
}

export async function deleteSessionByToken(token: string | undefined | null) {
  if (!token) return;
  const tokenHash = hashSessionToken(token);
  await db.delete(Session).where(eq(Session.tokenHash, tokenHash));
}

export { SESSION_COOKIE_NAME, USER_COOKIE_NAME };

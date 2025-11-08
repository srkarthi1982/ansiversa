import type { AstroCookies } from 'astro';
import { db, Session, User, eq } from 'astro:db';

const { createHash, createCipheriv, createDecipheriv, randomBytes } = await import('node:crypto');

import type { SessionUser } from '../types/session-user';

type MaybeCookies = {
  get(name: string): { value?: string } | undefined;
};

const SESSION_COOKIE_NAME = 'session';
const USER_COOKIE_NAME = 'session_user';

const USER_COOKIE_ALGORITHM = 'aes-256-gcm';
const USER_COOKIE_IV_LENGTH = 12;
const USER_COOKIE_AUTH_TAG_LENGTH = 16;

let cachedUserCookieKey: Buffer | null = null;
let cachedUserCookieSecret: string | null = null;
let hasWarnedForMissingSecret = false;

function resolveUserCookieSecret() {
  if (cachedUserCookieSecret) {
    return cachedUserCookieSecret;
  }

  const secret =
    import.meta.env.USER_COOKIE_SECRET || process.env.USER_COOKIE_SECRET || null;

  if (!secret) {
    if (import.meta.env.PROD) {
      throw new Error('USER_COOKIE_SECRET is not configured.');
    }
    if (!hasWarnedForMissingSecret) {
      console.warn(
        'USER_COOKIE_SECRET is not configured. Falling back to a development-only secret. Do not use this fallback in production.'
      );
      hasWarnedForMissingSecret = true;
    }
    cachedUserCookieSecret = 'development-only-user-cookie-secret';
    return cachedUserCookieSecret;
  }

  cachedUserCookieSecret = secret;
  return cachedUserCookieSecret;
}

function getUserCookieKey() {
  if (!cachedUserCookieKey) {
    const secret = resolveUserCookieSecret();
    cachedUserCookieKey = createHash('sha256').update(secret).digest();
  }
  return cachedUserCookieKey;
}

function encodeSessionUser(user: SessionUser) {
  const json = JSON.stringify(user);
  const iv = randomBytes(USER_COOKIE_IV_LENGTH);
  const cipher = createCipheriv(USER_COOKIE_ALGORITHM, getUserCookieKey(), iv);
  const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64url');
}

function decodeSessionUser(encoded: string | undefined): SessionUser | null {
  if (!encoded) return null;
  try {
    const raw = Buffer.from(encoded, 'base64url');
    if (raw.length <= USER_COOKIE_IV_LENGTH + USER_COOKIE_AUTH_TAG_LENGTH) {
      return null;
    }
    const iv = raw.subarray(0, USER_COOKIE_IV_LENGTH);
    const authTag = raw.subarray(USER_COOKIE_IV_LENGTH, USER_COOKIE_IV_LENGTH + USER_COOKIE_AUTH_TAG_LENGTH);
    const ciphertext = raw.subarray(USER_COOKIE_IV_LENGTH + USER_COOKIE_AUTH_TAG_LENGTH);
    const decipher = createDecipheriv(USER_COOKIE_ALGORITHM, getUserCookieKey(), iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
    const parsed = JSON.parse(decrypted);
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

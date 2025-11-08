import type { AstroCookies } from 'astro';
import { User, eq, or } from 'astro:db';

const { randomUUID, randomBytes, scryptSync, timingSafeEqual } = await import('node:crypto');
import {
  deleteSessionByToken,
  deleteUserCookie,
  hashSessionToken,
  SESSION_COOKIE_NAME,
  setUserCookie,
} from '../../utils/session.server';
import type { SessionUser } from '../../types/session-user';
import {
  emailVerificationRepository,
  sessionRepository,
  userRepository,
} from './repositories';

const SESSION_TTL_SECONDS = 60 * 60 * 24;
const SESSION_TTL_REMEMBER_SECONDS = SESSION_TTL_SECONDS * 30;
const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const key = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${key}`;
}

export function verifyPassword(password: string, hash: string) {
  const [salt, keyHex] = hash.split(':');
  if (!salt || !keyHex) return false;
  const derived = scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(keyHex, 'hex');
  if (keyBuf.length !== derived.length) return false;
  return timingSafeEqual(derived, keyBuf);
}

export function toBool(v: unknown) {
  return v === 'on' || v === true || v === 'true';
}

export async function findUserByIdentifier(identifier: string) {
  const rows = await userRepository.getData({
    where: (table) => or(eq(table.username, identifier), eq(table.email, identifier)),
    limit: 1,
  });
  return rows[0];
}

export async function findUserByUsername(username: string) {
  const rows = await userRepository.getData({
    where: (table) => eq(table.username, username),
    limit: 1,
  });
  return rows[0];
}

export async function findUserByEmail(email: string) {
  const rows = await userRepository.getData({
    where: (table) => eq(table.email, email),
    limit: 1,
  });
  return rows[0];
}

export async function createSession(user: SessionUser, remember: boolean, ctx: { cookies: AstroCookies }) {
  const previousToken = ctx.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (previousToken) {
    await deleteSessionByToken(previousToken);
  }

  const rawToken = randomUUID();
  const tokenHash = hashSessionToken(rawToken);
  const maxAge = remember ? SESSION_TTL_REMEMBER_SECONDS : SESSION_TTL_SECONDS;
  const expiresAt = new Date(Date.now() + maxAge * 1000);

  await sessionRepository.insert({
    id: randomUUID(),
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  ctx.cookies.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: true,
    maxAge,
  });

  setUserCookie(ctx.cookies, user, maxAge);
}

export async function clearSession(ctx: { cookies: AstroCookies }) {
  const token = ctx.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await deleteSessionByToken(token);
  }
  ctx.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
  deleteUserCookie(ctx.cookies);
}

export { randomUUID, randomBytes };

export async function createEmailVerificationToken(userId: string) {
  // Remove any existing unused tokens for this user
  await emailVerificationRepository.delete((table) => eq(table.userId, userId));

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);

  await emailVerificationRepository.insert({
    id: randomUUID(),
    userId,
    token,
    expiresAt,
  });

  return token;
}

type VerifyEmailResult =
  | { ok: true; userId: string }
  | { ok: false; reason: 'invalid' | 'expired' | 'used' | 'user_missing' };

export async function consumeEmailVerificationToken(token: string): Promise<VerifyEmailResult> {
  const rows = await emailVerificationRepository.getData({
    where: (table) => eq(table.token, token),
    limit: 1,
  });
  const record = rows[0];

  if (!record) {
    return { ok: false, reason: 'invalid' };
  }

  if (record.usedAt) {
    return { ok: false, reason: 'used' };
  }

  if (record.expiresAt < new Date()) {
    return { ok: false, reason: 'expired' };
  }

  const userRows = await userRepository.getData({
    where: (table) => eq(table.id, record.userId),
    limit: 1,
  });
  const user = userRows[0];
  if (!user) {
    await emailVerificationRepository.delete((table) => eq(table.id, record.id));
    return { ok: false, reason: 'user_missing' };
  }

  const now = new Date();
  await userRepository.update({ emailVerifiedAt: now }, (table) => eq(table.id, user.id));
  await emailVerificationRepository.update({ usedAt: now }, (table) => eq(table.id, record.id));

  return { ok: true, userId: user.id };
}

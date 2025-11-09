import type { AstroCookies } from 'astro';
import { eq, or } from 'astro:db';
import { randomUUID } from 'node:crypto';
import { ApiError } from '../api/errors';
import { hashPassword, verifyPassword } from './password';
import { sessionRepository, userRepository } from './repositories';
import { hashToken, signAccessToken, signRefreshToken, tokenTtls, verifyRefreshToken } from './tokens';

export type UserRecord = Awaited<ReturnType<typeof userRepository.getById>>;

export const REFRESH_COOKIE_NAME = 'ansv_refresh';
const refreshCookieMeta = {
  path: '/',
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
};

const SHORT_REFRESH_TTL = Number(process.env.REFRESH_TOKEN_TTL_SECONDS_SHORT ?? 60 * 60 * 24);
export const toPublicUser = (user: NonNullable<UserRecord>) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  roleId: user.roleId,
  plan: user.plan,
  emailVerified: Boolean(user.emailVerifiedAt),
  createdAt: user.createdAt,
});

export async function findUserByIdentifier(identifier: string) {
  const users = await userRepository.getData({
    where: (table) => or(eq(table.username, identifier), eq(table.email, identifier)),
    limit: 1,
  });
  return users[0];
}

export async function registerUser(input: {
  username: string;
  email: string;
  password: string;
}) {
  const existing = await userRepository.getData({
    where: (table) => or(eq(table.username, input.username), eq(table.email, input.email)),
    limit: 1,
  });
  if (existing[0]) {
    throw ApiError.conflict('Username or email already exists');
  }

  const userId = randomUUID();
  const [user] = await userRepository.insert({
    id: userId,
    username: input.username,
    email: input.email,
    passwordHash: hashPassword(input.password),
    roleId: 2,
    plan: 'free',
  });

  return user;
}

export async function authenticateUser(identifier: string, password: string) {
  const user = await findUserByIdentifier(identifier);
  if (!user) {
    throw ApiError.unauthorized('Invalid credentials');
  }
  if (!verifyPassword(password, user.passwordHash)) {
    throw ApiError.unauthorized('Invalid credentials');
  }
  return user;
}

const buildAccessPayload = (user: NonNullable<UserRecord>) => ({
  sub: user.id,
  username: user.username,
  email: user.email,
  roleId: user.roleId ?? 2,
  plan: user.plan ?? 'free',
});

async function persistRefreshToken(userId: string, refreshToken: string, ttlSeconds: number, sessionId: string) {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  const tokenHash = hashToken(refreshToken);
  await sessionRepository.delete((table) => eq(table.userId, userId));
  await sessionRepository.insert({
    id: sessionId,
    userId,
    tokenHash,
    expiresAt,
  });
  return expiresAt;
}

export async function issueTokens(user: NonNullable<UserRecord>, options: { remember?: boolean } = {}) {
  const refreshTtl = options.remember ? tokenTtls.refresh : SHORT_REFRESH_TTL;
  const { token: accessToken } = signAccessToken(buildAccessPayload(user));
  const sessionId = randomUUID();
  const { token: refreshToken } = signRefreshToken({
    sub: user.id,
    sessionId,
  }, refreshTtl);
  const refreshExpiresAt = await persistRefreshToken(user.id, refreshToken, refreshTtl, sessionId);

  return {
    accessToken,
    refreshToken,
    accessExpiresIn: tokenTtls.access,
    refreshExpiresIn: refreshTtl,
    refreshExpiresAt,
    user: toPublicUser(user),
  };
}

export async function rotateRefreshToken(refreshToken: string) {
  try {
    verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const tokenHash = hashToken(refreshToken);
  const existing = await sessionRepository.getData({
    where: (table) => eq(table.tokenHash, tokenHash),
    limit: 1,
  });
  const session = existing[0];

  if (!session) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  if (session.expiresAt < new Date()) {
    await sessionRepository.delete((table) => eq(table.id, session.id));
    throw ApiError.unauthorized('Refresh token expired');
  }

  const user = await userRepository.getById((table) => table.id, session.userId);
  if (!user) {
    await sessionRepository.delete((table) => eq(table.id, session.id));
    throw ApiError.unauthorized('User not found');
  }

  await sessionRepository.delete((table) => eq(table.id, session.id));
  return issueTokens(user);
}

export async function revokeRefreshToken(refreshToken: string) {
  const tokenHash = hashToken(refreshToken);
  await sessionRepository.delete((table) => eq(table.tokenHash, tokenHash));
}

export const setRefreshCookie = (cookies: AstroCookies, token: string, maxAgeSeconds: number) => {
  cookies.set(REFRESH_COOKIE_NAME, token, { ...refreshCookieMeta, maxAge: maxAgeSeconds });
};

export const clearRefreshCookie = (cookies: AstroCookies) => {
  cookies.delete(REFRESH_COOKIE_NAME, { path: refreshCookieMeta.path });
};

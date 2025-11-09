import jwt from 'jsonwebtoken';

const { createHash } = await import('node:crypto');

const ACCESS_TOKEN_TTL_SECONDS = Number(process.env.ACCESS_TOKEN_TTL_SECONDS ?? 15 * 60);
const REFRESH_TOKEN_TTL_SECONDS = Number(process.env.REFRESH_TOKEN_TTL_SECONDS ?? 60 * 60 * 24 * 30);

const getAccessSecret = () => {
  const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
  if (secret) return secret;
  console.warn('[auth] ACCESS_TOKEN_SECRET is not set. Falling back to DEV_ACCESS_TOKEN_SECRET.');
  return 'DEV_ACCESS_TOKEN_SECRET';
};

const getRefreshSecret = () => {
  const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
  if (secret) return secret;
  console.warn('[auth] REFRESH_TOKEN_SECRET is not set. Falling back to DEV_REFRESH_TOKEN_SECRET.');
  return 'DEV_REFRESH_TOKEN_SECRET';
};

export type AccessTokenPayload = {
  sub: string;
  username: string;
  email: string;
  roleId: number;
  plan: string | null;
};

export const signAccessToken = (payload: AccessTokenPayload, expiresIn = ACCESS_TOKEN_TTL_SECONDS) => {
  const token = jwt.sign(payload, getAccessSecret(), {
    expiresIn,
  });
  return { token, expiresIn };
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, getAccessSecret()) as AccessTokenPayload;
};

export type RefreshTokenPayload = {
  sub: string;
  sessionId: string;
};

export const signRefreshToken = (payload: RefreshTokenPayload, expiresIn = REFRESH_TOKEN_TTL_SECONDS) => {
  const token = jwt.sign(payload, getRefreshSecret(), {
    expiresIn,
  });
  return { token, expiresIn };
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, getRefreshSecret()) as RefreshTokenPayload;
};

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export const tokenTtls = {
  access: ACCESS_TOKEN_TTL_SECONDS,
  refresh: REFRESH_TOKEN_TTL_SECONDS,
};

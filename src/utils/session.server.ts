import { db, Session, User, eq } from 'astro:db';

const { createHash } = await import('node:crypto');

type MaybeCookies = {
  get(name: string): { value?: string } | undefined;
};

const SESSION_COOKIE_NAME = 'session';

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
  if (!session) return null;

  const userRows = await db.select().from(User).where(eq(User.id, session.userId));
  const user = userRows[0];
  if (!user) {
    await db.delete(Session).where(eq(Session.id, session.id));
    return null;
  }

  return { session, user };
}

export async function deleteSessionByToken(token: string | undefined | null) {
  if (!token) return;
  const tokenHash = hashSessionToken(token);
  await db.delete(Session).where(eq(Session.tokenHash, tokenHash));
}

export { SESSION_COOKIE_NAME };

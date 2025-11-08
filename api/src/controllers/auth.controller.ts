import type { Context } from 'hono';
import { SignJWT } from 'jose';
import { ENV } from '../utils/env.js';
import { authenticate, createUser } from '../services/auth.service.js';

export async function register(c: Context) {
  const { email, password } = c.get('body') as { email: string; password: string };
  await createUser(email, password);
  return c.json({ ok: true });
}

export async function login(c: Context) {
  const { email, password } = c.get('body') as { email: string; password: string };
  const user = await authenticate(email, password);
  if (!user) return c.json({ error: 'Invalid credentials' }, 401);

  const token = await new SignJWT({ sub: String(user.id), role: user.role, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(ENV.JWT_SECRET));

  return c.json({ token, user });
}

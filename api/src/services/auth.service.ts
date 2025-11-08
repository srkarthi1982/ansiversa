import { db } from '../db/client.js';
import { hash, verify } from './crypto.service.js';

export async function createUser(email: string, password: string) {
  const password_hash = await hash(password);
  await db.execute({
    sql: 'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    args: [email, password_hash],
  });
}

export async function authenticate(email: string, password: string) {
  const res = await db.execute({
    sql: 'SELECT id, email, password_hash, role FROM users WHERE email = ?',
    args: [email],
  });
  if (res.rows.length === 0) return null;
  const row = res.rows[0] as any;
  const ok = await verify(password, row.password_hash as string);
  if (!ok) return null;
  return { id: Number(row.id), email: String(row.email), role: String(row.role) };
}

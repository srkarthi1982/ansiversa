import { db, Role, User } from 'astro:db';
import { randomBytes, scryptSync } from 'node:crypto';

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const key = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${key}`;
}

export async function seedAuth() {
  await db.insert(Role).values([
    { id: 1, name: 'Administrator' },
    { id: 2, name: 'User' },
  ]);

  await db.insert(User).values([
    {
      id: '00000000-0000-4000-8000-000000000001',
      username: 'admin',
      email: 'ansiversa@gmail.com',
      passwordHash: hashPassword('admin123'),
      plan: 'elite',
      emailVerifiedAt: new Date(),
      roleId: 1,
    },
    {
      id: '00000000-0000-4000-8000-000000000002',
      username: 'user',
      email: 'srkarthi1982@gmail.com',
      passwordHash: hashPassword('user123'),
      plan: 'free',
      emailVerifiedAt: new Date(),
      roleId: 2,
    },
  ]);
}

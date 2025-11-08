import { db, Role, User } from 'astro:db';
import { randomBytes, scryptSync } from 'node:crypto';

type SeedUser = {
  id: string;
  username: string;
  email: string;
  roleId: number;
  plan: 'free' | 'elite';
  password: string;
};

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const key = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${key}`;
}

export async function seedAuth() {
  const roles = [
    { id: 1, name: 'Administrator' },
    { id: 2, name: 'User' },
  ];

  const existingRoles = await db.select({ id: Role.id }).from(Role);
  const existingRoleIds = new Set(existingRoles.map((role) => role.id));
  const rolesToInsert = roles.filter((role) => !existingRoleIds.has(role.id));

  if (rolesToInsert.length > 0) {
    await db.insert(Role).values(rolesToInsert);
  }

  const baseUsers: SeedUser[] = [
    {
      id: '00000000-0000-4000-8000-000000000001',
      username: 'admin',
      email: 'ansiversa@gmail.com',
      plan: 'elite',
      roleId: 1,
      password: 'admin123',
    },
    {
      id: '00000000-0000-4000-8000-000000000002',
      username: 'user',
      email: 'srkarthi1982@gmail.com',
      plan: 'free',
      roleId: 2,
      password: 'user123',
    },
  ];

  const existingUsers = await db.select({ id: User.id }).from(User);
  const existingUserIds = new Set(existingUsers.map((user) => user.id));
  const usersToInsert = baseUsers
    .filter((user) => !existingUserIds.has(user.id))
    .map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      plan: user.plan,
      roleId: user.roleId,
      passwordHash: hashPassword(user.password),
      emailVerifiedAt: new Date(),
    }));

  if (usersToInsert.length > 0) {
    await db.insert(User).values(usersToInsert);
  }
}

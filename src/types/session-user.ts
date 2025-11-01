import { User } from 'astro:db';

type UserRow = typeof User.$inferSelect;

export type SessionUser = Pick<UserRow, 'id' | 'username' | 'email' | 'roleId'> and {
  plan: UserRow['plan'] | null;
};

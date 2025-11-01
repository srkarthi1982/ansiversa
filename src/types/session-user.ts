import { User } from 'astro:db';

type UserRow = typeof User.$inferSelect;

export type SessionUser = Pick<UserRow, 'id' | 'username' | 'email' | 'roleId'> & {
  plan: UserRow['plan'] | null;
};

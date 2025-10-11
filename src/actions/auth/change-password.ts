import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { db, User, eq } from 'astro:db';
import { findUserByIdentifier, hashPassword, verifyPassword } from './helpers';

export const changePassword = defineAction({
  accept: 'form',
  input: z
    .object({
      identifier: z.string().min(1, 'Enter username or email'),
      oldPassword: z.string().min(6),
      newPassword: z.string().min(6, 'Password must be at least 6 characters'),
      confirm: z.string().min(6),
    })
    .refine((d) => d.newPassword === d.confirm, {
      path: ['confirm'],
      message: 'Passwords do not match',
    }),
  async handler({ identifier, oldPassword, newPassword }) {
    const user = await findUserByIdentifier(identifier);
    if (!user || !verifyPassword(oldPassword, user.passwordHash)) {
      throw new ActionError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
    }
    const newHash = hashPassword(newPassword);
    await db.update(User).set({ passwordHash: newHash }).where(eq(User.id, user.id));
    return { ok: true };
  },
});

import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { db, PasswordResetToken, User, eq } from 'astro:db';
import { hashPassword } from './helpers';

export const resetPassword = defineAction({
  accept: 'form',
  input: z
    .object({
      token: z.string().min(1, 'Missing token'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      confirm: z.string().min(6),
    })
    .refine((d) => d.password === d.confirm, {
      path: ['confirm'],
      message: 'Passwords do not match',
    }),
  async handler({ token, password }) {
    const rows = await db
      .select()
      .from(PasswordResetToken)
      .where(eq(PasswordResetToken.token, token));
    const record = rows[0];

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new ActionError({ code: 'UNAUTHORIZED', message: 'Invalid or expired token' });
    }

    const userRows = await db.select().from(User).where(eq(User.id, record.userId));
    const user = userRows[0];
    if (!user) {
      throw new ActionError({ code: 'NOT_FOUND', message: 'User not found' });
    }

    const newHash = hashPassword(password);
    await db.update(User).set({ passwordHash: newHash }).where(eq(User.id, user.id));
    await db
      .update(PasswordResetToken)
      .set({ usedAt: new Date() })
      .where(eq(PasswordResetToken.id, record.id));

    return { ok: true };
  },
});

import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { eq } from 'astro:db';
import { hashPassword } from './helpers';
import { passwordResetRepository, userRepository } from './repositories';

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
    const rows = await passwordResetRepository.getData({
      where: (table) => eq(table.token, token),
      limit: 1,
    });
    const record = rows[0];

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new ActionError({ code: 'UNAUTHORIZED', message: 'Invalid or expired token' });
    }

    const userRows = await userRepository.getData({
      where: (table) => eq(table.id, record.userId),
      limit: 1,
    });
    const user = userRows[0];
    if (!user) {
      throw new ActionError({ code: 'NOT_FOUND', message: 'User not found' });
    }

    const newHash = hashPassword(password);
    await userRepository.update({ passwordHash: newHash }, (table) => eq(table.id, user.id));
    await passwordResetRepository.update({ usedAt: new Date() }, (table) => eq(table.id, record.id));

    return { ok: true };
  },
});

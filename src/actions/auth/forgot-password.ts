import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { db, PasswordResetToken, User, eq } from 'astro:db';
import { randomBytes } from 'node:crypto';
import { findUserByEmail, hashPassword } from './helpers';
import { sendTemporaryPasswordEmail } from '../../utils/email';

function generateTemporaryPassword(length = 12) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = randomBytes(length);
  let password = '';
  for (let i = 0; i < length; i += 1) {
    password += alphabet[bytes[i] % alphabet.length];
  }
  return password;
}

export const forgotPassword = defineAction({
  accept: 'form',
  input: z.object({
    email: z.string().email('Please enter a valid email'),
  }),
  async handler({ email }) {
    const user = await findUserByEmail(email);
    if (user) {
      const temporaryPassword = generateTemporaryPassword();
      const newHash = hashPassword(temporaryPassword);
      await db.update(User).set({ passwordHash: newHash }).where(eq(User.id, user.id));
      await db.delete(PasswordResetToken).where(eq(PasswordResetToken.userId, user.id));
      await sendTemporaryPasswordEmail({
        to: email,
        username: user.username,
        temporaryPassword,
      });
    }
    return { ok: true };
  },
});

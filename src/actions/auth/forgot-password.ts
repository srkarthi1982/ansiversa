import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { eq } from 'astro:db';
import { findUserByEmail, hashPassword, randomBytes } from './helpers';
import { sendTemporaryPasswordEmail } from '../../utils/email.server';
import { passwordResetRepository, userRepository } from './repositories';

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
      await userRepository.update({ passwordHash: newHash }, (table) => eq(table.id, user.id));
      await passwordResetRepository.delete((table) => eq(table.userId, user.id));
      await sendTemporaryPasswordEmail({
        to: email,
        username: user.username,
        temporaryPassword,
      });
    }
    return { ok: true };
  },
});

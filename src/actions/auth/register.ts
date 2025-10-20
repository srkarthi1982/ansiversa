import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { db, User } from 'astro:db';
import {
  randomUUID,
  createSession,
  createEmailVerificationToken,
  findUserByEmail,
  findUserByUsername,
  hashPassword,
  toBool,
} from './helpers';
import type { SessionUser } from '../../types/session-user';
import { sendVerificationEmail } from '../../utils/email.server';

export const register = defineAction({
  accept: 'form',
  input: z
    .object({
      username: z.string().min(3, 'Username must be at least 3 characters'),
      email: z.string().email('Please enter a valid email'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      confirm: z.string().min(6),
      remember: z.preprocess(toBool, z.boolean()).optional().default(false),
      terms: z.preprocess(toBool, z.boolean()).optional().default(false),
    })
    .refine((data) => data.password === data.confirm, {
      path: ['confirm'],
      message: 'Passwords do not match',
    })
    .refine((data) => data.terms, {
      path: ['terms'],
      message: 'You must accept the Terms',
    }),
  async handler({ username, email, password, remember }, ctx) {
    if (await findUserByUsername(username)) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Username already exists' });
    }
    if (await findUserByEmail(email)) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Email already in use' });
    }

    const userId = randomUUID();
    const passwordHash = hashPassword(password);
    await db.insert(User).values({ id: userId, username, email, passwordHash });

    const sessionUser: SessionUser = {
      id: userId,
      username,
      email,
      roleId: 2,
      plan: 'free',
    };

    await createSession(sessionUser, remember, ctx);

    const verificationToken = await createEmailVerificationToken(userId);
    const verificationUrl = new URL(`/verify-email?token=${verificationToken}`, ctx.url).toString();
    await sendVerificationEmail({ to: email, username, verificationUrl });

    return {
      ok: true,
      user: { id: sessionUser.id, username: sessionUser.username, email: sessionUser.email },
    };
  },
});

import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import {
  createSession,
  findUserByIdentifier,
  toBool,
  verifyPassword,
} from './helpers';

export const login = defineAction({
  accept: 'form',
  input: z.object({
    identifier: z.string().min(1, 'Enter username or email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    remember: z.preprocess(toBool, z.boolean()).optional().default(false),
  }),
  async handler({ identifier, password, remember }, ctx) {
    const user = await findUserByIdentifier(identifier);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new ActionError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
    }

    await createSession(user.id, remember, ctx);

    return { ok: true, user: { id: user.id, username: user.username, email: user.email } };
  },
});

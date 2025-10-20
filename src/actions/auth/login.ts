import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { createSession, findUserByIdentifier, toBool, verifyPassword } from './helpers';
import type { SessionUser } from '../../types/session-user';

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

    const sessionUser: SessionUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      roleId: user.roleId ?? 2,
      plan: user.plan ?? null,
    };

    await createSession(sessionUser, remember, ctx);

    return {
      ok: true,
      user: {
        id: sessionUser.id,
        username: sessionUser.username,
        email: sessionUser.email,
      },
    };
  },
});

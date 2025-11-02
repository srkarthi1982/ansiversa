import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { createSession, findUserByIdentifier, toBool, verifyPassword } from './helpers';
import { getSafeRedirect } from '../../utils/safe-redirect';
import type { SessionUser } from '../../types/session-user';

export const login = defineAction({
  accept: 'form',
  input: z.object({
    identifier: z.string().min(1, 'Enter username or email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    remember: z.preprocess(toBool, z.boolean()).optional().default(false),
    redirect: z.string().optional(),
  }),
  async handler({ identifier, password, remember, redirect }, ctx) {
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

    const redirectTo = getSafeRedirect(redirect);

    return {
      ok: true,
      redirectTo,
      user: {
        id: sessionUser.id,
        username: sessionUser.username,
        email: sessionUser.email,
      },
    };
  },
});

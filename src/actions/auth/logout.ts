import { defineAction } from 'astro:actions';
import { clearSession } from './helpers';

export const logout = defineAction({
  accept: 'form',
  async handler(_, ctx) {
    await clearSession(ctx);
    return ctx.redirect('/');
  },
});

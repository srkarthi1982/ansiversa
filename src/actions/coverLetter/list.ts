import { defineAction } from 'astro:actions';
import { requireUser, listCoverLetters } from './utils';

export const list = defineAction({
  accept: 'json',
  async handler(_input, ctx) {
    const user = await requireUser(ctx);
    const items = await listCoverLetters(user.id);
    return { items };
  },
});

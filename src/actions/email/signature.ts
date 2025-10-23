import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { findSignatureForUser, requireUser } from './utils';

export const signature = defineAction({
  accept: 'json',
  input: z.object({}).optional(),
  async handler(_input, ctx) {
    const user = await requireUser(ctx);
    const sig = await findSignatureForUser(user.id);
    return { signature: sig };
  },
});

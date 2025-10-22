import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { requireUser, findContractOrThrow, normalizeContractRow } from './utils';

export const get = defineAction({
  accept: 'json',
  input: z.object({ id: z.string().uuid() }),
  async handler({ id }, ctx) {
    const user = await requireUser(ctx);
    const contract = await findContractOrThrow(id, user.id);
    return { contract: normalizeContractRow(contract) };
  },
});

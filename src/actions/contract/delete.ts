import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { eq } from 'astro:db';
import { requireUser, findContractOrThrow } from './utils';
import { contractRepository } from './repositories';

export const remove = defineAction({
  accept: 'json',
  input: z.object({ id: z.string().uuid() }),
  async handler({ id }, ctx) {
    const user = await requireUser(ctx);
    await findContractOrThrow(id, user.id);
    await contractRepository.delete((table) => eq(table.id, id));
    return { ok: true };
  },
});

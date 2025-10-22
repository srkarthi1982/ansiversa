import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { db, Contract, eq } from 'astro:db';
import { requireUser, findContractOrThrow } from './utils';

export const remove = defineAction({
  accept: 'json',
  input: z.object({ id: z.string().uuid() }),
  async handler({ id }, ctx) {
    const user = await requireUser(ctx);
    await findContractOrThrow(id, user.id);
    await db.delete(Contract).where(eq(Contract.id, id));
    return { ok: true };
  },
});

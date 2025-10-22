import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { db, Contract, eq } from 'astro:db';
import { requireUser, findContractOrThrow, ensureContractSlug, normalizeContractRow } from './utils';
import { slugifyContractTitle } from '../../lib/contract/utils';

export const publish = defineAction({
  accept: 'json',
  input: z
    .object({
      id: z.string().uuid(),
      slug: z.string().optional(),
    })
    .strict(),
  async handler({ id, slug }, ctx) {
    const user = await requireUser(ctx);
    const contract = await findContractOrThrow(id, user.id);
    const now = new Date();

    const desiredSlug = slug ? slugifyContractTitle(slug) : slugifyContractTitle(contract.title);
    const finalSlug = await ensureContractSlug(desiredSlug, user.id, id);

    await db
      .update(Contract)
      .set({
        slug: finalSlug,
        status: 'published',
        publishedAt: now,
        lastSavedAt: now,
      })
      .where(eq(Contract.id, id));

    const updated = await findContractOrThrow(id, user.id);
    return {
      contract: normalizeContractRow(updated),
      url: `/contract/view/${finalSlug}`,
    };
  },
});

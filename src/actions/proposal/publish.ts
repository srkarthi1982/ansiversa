import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { eq } from 'astro:db';
import { requireUser, findProposalOrThrow, ensureProposalSlug, normalizeProposalRow } from './utils';
import { proposalRepository } from './repositories';
import { slugifyProposalTitle } from '../../lib/proposal/utils';

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
    const proposal = await findProposalOrThrow(id, user.id);
    const now = new Date();

    const desiredSlug = slug ? slugifyProposalTitle(slug) : slugifyProposalTitle(proposal.title);
    const finalSlug = await ensureProposalSlug(desiredSlug, user.id, id);

    await proposalRepository.update(
      {
        slug: finalSlug,
        status: 'published',
        publishedAt: now,
        lastSavedAt: now,
      },
      (table) => eq(table.id, id),
    );

    const updated = await findProposalOrThrow(id, user.id);
    return {
      proposal: normalizeProposalRow(updated),
      url: `/proposal/view/${finalSlug}`,
    };
  },
});

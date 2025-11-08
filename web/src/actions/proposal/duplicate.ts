import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { requireUser, findProposalOrThrow, normalizeProposalRow, sanitizeTitle } from './utils';
import { proposalRepository } from './repositories';

export const duplicate = defineAction({
  accept: 'json',
  input: z.object({ id: z.string().uuid(), title: z.string().optional() }),
  async handler({ id, title }, ctx) {
    const user = await requireUser(ctx);
    const original = await findProposalOrThrow(id, user.id);
    const now = new Date();
    const duplicateId = crypto.randomUUID();

    const duplicatedTitle = title ? sanitizeTitle(title) : `${original.title} (Copy)`;

    const inserted = await proposalRepository.insert({
      id: duplicateId,
      userId: user.id,
      title: duplicatedTitle,
      templateKey: original.templateKey,
      status: 'draft',
      currency: original.currency,
      data: JSON.parse(JSON.stringify(original.data ?? {})),
      lastSavedAt: now,
      createdAt: now,
    });

    return { proposal: normalizeProposalRow(inserted[0]) };
  },
});

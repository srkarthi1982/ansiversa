import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { createEmptyProposalData, ProposalDataSchema } from '../../lib/proposal/schema';
import { requireUser, templateKeyEnum, sanitizeTitle, normalizeProposalRow } from './utils';
import { proposalRepository } from './repositories';

export const create = defineAction({
  accept: 'json',
  input: z
    .object({
      title: z.string().optional(),
      templateKey: templateKeyEnum.optional(),
      currency: z.string().optional(),
    })
    .optional(),
  async handler(input, ctx) {
    const user = await requireUser(ctx);
    const payload = input ?? {};
    const id = crypto.randomUUID();
    const now = new Date();

    const data = createEmptyProposalData();
    if (payload.currency) {
      data.budget.currency = payload.currency;
    }

    const inserted = await proposalRepository.insert({
      id,
      userId: user.id,
      title: sanitizeTitle(payload.title),
      templateKey: payload.templateKey ?? 'business',
      status: 'draft',
      currency: payload.currency ?? 'USD',
      data: ProposalDataSchema.parse(data),
      lastSavedAt: now,
      createdAt: now,
    });
    const proposal = inserted[0];
    return {
      proposal: normalizeProposalRow(proposal),
    };
  },
});

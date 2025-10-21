import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { db, Proposal, eq } from 'astro:db';
import { createEmptyProposalData, ProposalDataSchema } from '../../lib/proposal/schema';
import { requireUser, templateKeyEnum, sanitizeTitle, normalizeProposalRow } from './utils';

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

    await db.insert(Proposal).values({
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

    const rows = await db.select().from(Proposal).where(eq(Proposal.id, id));
    const proposal = rows[0];
    return {
      proposal: normalizeProposalRow(proposal),
    };
  },
});

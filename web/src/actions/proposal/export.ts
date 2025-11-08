import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { requireUser, findProposalOrThrow } from './utils';

export const exportProposal = defineAction({
  accept: 'json',
  input: z.object({
    id: z.string().uuid(),
    format: z.enum(['pdf', 'docx', 'md']).default('pdf'),
  }),
  async handler({ id, format }, ctx) {
    const user = await requireUser(ctx);
    const proposal = await findProposalOrThrow(id, user.id);
    const filename = `Proposal_${proposal.slug ?? proposal.id}_${new Date().toISOString().split('T')[0]}.${format}`;

    return {
      ok: true,
      url: `/exports/${filename}`,
      message: 'Export generation pipeline will deliver the file shortly.',
    };
  },
});

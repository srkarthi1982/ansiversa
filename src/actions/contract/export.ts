import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { requireUser, findContractOrThrow } from './utils';

export const exportContract = defineAction({
  accept: 'json',
  input: z.object({
    id: z.string().uuid(),
    format: z.enum(['pdf', 'docx', 'md']).default('pdf'),
  }),
  async handler({ id, format }, ctx) {
    const user = await requireUser(ctx);
    const contract = await findContractOrThrow(id, user.id);
    const filename = `Contract_${contract.slug ?? contract.id}_${new Date().toISOString().split('T')[0]}.${format}`;

    return {
      ok: true,
      url: `/exports/${filename}`,
      message: 'Export is being generated. You will be notified when it is ready.',
    };
  },
});

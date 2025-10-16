import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { requireUser, findResumeOrThrow } from './utils';

export const exportResume = defineAction({
  accept: 'json',
  input: z.object({
    id: z.string().uuid(),
    format: z.enum(['pdf', 'docx', 'md', 'html']).default('pdf'),
    templateKey: z.string().optional(),
  }),
  async handler({ id, format, templateKey }, ctx) {
    const user = await requireUser(ctx);
    await findResumeOrThrow(id, user.id);
    const filename = `Resume_${user.id}_${templateKey ?? 'modern'}_${new Date()
      .toISOString()
      .split('T')[0]}.${format}`;
    return {
      ok: true,
      filePath: `/exports/${filename}`,
      message: 'Export pipeline is queued (coming soon).',
    };
  },
});

import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { requireUser, findResumeOrThrow, normalizeResumeRow } from './utils';
import { resumeRepository } from './repositories';

export const duplicate = defineAction({
  accept: 'json',
  input: z.object({
    id: z.string().uuid(),
  }),
  async handler({ id }, ctx) {
    const user = await requireUser(ctx);
    const resume = await findResumeOrThrow(id, user.id);
    const now = new Date();
    const cloneId = crypto.randomUUID();

    const inserted = await resumeRepository.insert({
      id: cloneId,
      userId: user.id,
      title: `${resume.title} (Copy)`,
      templateKey: resume.templateKey,
      locale: resume.locale,
      status: 'draft',
      data: resume.data,
      createdAt: now,
      lastSavedAt: now,
      isDefault: false,
    });

    return { resume: normalizeResumeRow(inserted[0]) };
  },
});

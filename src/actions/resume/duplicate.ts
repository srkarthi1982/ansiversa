import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { db, Resume, eq } from 'astro:db';
import {
  requireUser,
  findResumeOrThrow,
  normalizeResumeRow,
} from './utils';

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

    await db.insert(Resume).values({
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

    const inserted = await db.select().from(Resume).where(eq(Resume.id, cloneId));
    return { resume: normalizeResumeRow(inserted[0]) };
  },
});

import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { db, Resume, count, eq } from 'astro:db';
import {
  createEmptyResumeData,
} from '../../lib/resume/schema';
import {
  templateKeyEnum,
  localeEnum,
  requireUser,
  normalizeResumeRow,
} from './utils';

export const create = defineAction({
  accept: 'json',
  input: z
    .object({
      title: z.string().optional(),
      templateKey: templateKeyEnum.optional(),
      locale: localeEnum.optional(),
    })
    .optional(),
  async handler(input, ctx) {
    const payload = input ?? {};
    const user = await requireUser(ctx);
    const now = new Date();
    const resumeId = crypto.randomUUID();

    const existingDefault = await db
      .select({ count: count() })
      .from(Resume)
      .where(eq(Resume.userId, user.id));

    const title = payload.title?.trim() || 'Untitled resume';
    const record = {
      id: resumeId,
      userId: user.id,
      title,
      templateKey: payload.templateKey ?? 'modern',
      locale: payload.locale ?? 'en',
      status: 'draft',
      data: createEmptyResumeData(),
      lastSavedAt: now,
      createdAt: now,
      isDefault: existingDefault[0]?.count === 0,
    };

    await db.insert(Resume).values(record);

    const inserted = await db.select().from(Resume).where(eq(Resume.id, resumeId));
    return { resume: normalizeResumeRow(inserted[0]) };
  },
});

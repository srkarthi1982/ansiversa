import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { eq } from 'astro:db';
import {
  createEmptyResumeData,
} from '../../lib/resume/schema';
import { templateKeyEnum, localeEnum, requireUser, normalizeResumeRow } from './utils';
import { resumeRepository } from './repositories';

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

    const existingDefault = await resumeRepository.getPaginatedData({
      where: (table) => eq(table.userId, user.id),
      page: 1,
      pageSize: 1,
    });

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
      isDefault: existingDefault.total === 0,
    };

    const inserted = await resumeRepository.insert(record);
    return { resume: normalizeResumeRow(inserted[0]) };
  },
});

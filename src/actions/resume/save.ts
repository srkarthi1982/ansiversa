import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { db, Resume, eq } from 'astro:db';
import {
  ResumeDataSchema,
} from '../../lib/resume/schema';
import {
  templateKeyEnum,
  localeEnum,
  statusEnum,
  requireUser,
  findResumeOrThrow,
  normalizeResumeRow,
  setDefaultResume,
} from './utils';

export const save = defineAction({
  accept: 'json',
  input: z.object({
    id: z.string().uuid(),
    title: z.string().optional(),
    templateKey: templateKeyEnum.optional(),
    locale: localeEnum.optional(),
    status: statusEnum.optional(),
    data: ResumeDataSchema.optional(),
    setDefault: z.boolean().optional(),
  }),
  async handler({ id, title, templateKey, locale, status, data, setDefault }, ctx) {
    const user = await requireUser(ctx);
    const plan = (user.plan as 'free' | 'pro' | 'elite' | undefined) ?? 'free';
    const resume = await findResumeOrThrow(id, user.id);

    const updates: Partial<typeof Resume.$inferInsert> = {
      lastSavedAt: new Date(),
    };

    if (typeof title === 'string') {
      updates.title = title.trim() || 'Untitled resume';
    }
    if (templateKey) {
      if (plan === 'free' && templateKey !== 'modern') {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'Upgrade to Pro to use premium templates.',
        });
      }
      updates.templateKey = templateKey;
    }
    if (locale) {
      updates.locale = locale;
    }
    if (status) {
      updates.status = status;
    }
    if (data) {
      updates.data = ResumeDataSchema.parse(data);
    }

    if (plan === 'free' && (resume.templateKey ?? 'modern') !== 'modern') {
      updates.templateKey = 'modern';
    }

    if (Object.keys(updates).length > 0) {
      await db.update(Resume).set(updates).where(eq(Resume.id, id));
    }

    if (setDefault) {
      await setDefaultResume(id, user.id);
    }

    const updated = await findResumeOrThrow(id, user.id);
    return { resume: normalizeResumeRow(updated) };
  },
});

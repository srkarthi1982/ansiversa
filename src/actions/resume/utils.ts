import { ActionError } from 'astro:actions';
import { Resume, ResumeExport, eq, desc, and, ne } from 'astro:db';
import { z } from 'astro:schema';
import {
  ResumeDataSchema,
  resumeTemplateKeys,
  resumeLocales,
  resumeStatuses,
  createEmptyResumeData,
} from '../../lib/resume/schema';
import { getSessionWithUser } from '../../utils/session.server';
import { resumeExportRepository, resumeRepository } from './repositories';

export const templateKeyEnum = z.enum(resumeTemplateKeys);
export const localeEnum = z.enum(resumeLocales);
export const statusEnum = z.enum(resumeStatuses);

export type ResumeRow = typeof Resume.$inferSelect;

export const normalizeResumeRow = (row: ResumeRow) => ({
  id: row.id,
  userId: row.userId,
  title: row.title,
  templateKey: row.templateKey,
  locale: row.locale,
  status: row.status,
  data: ResumeDataSchema.parse(row.data ?? createEmptyResumeData()),
  lastSavedAt: row.lastSavedAt ? row.lastSavedAt.toISOString() : null,
  createdAt: row.createdAt ? row.createdAt.toISOString() : null,
  isDefault: Boolean(row.isDefault),
});

export const requireUser = async (ctx: { cookies: unknown }) => {
  const session = await getSessionWithUser(ctx.cookies as any);
  if (!session?.user) {
    throw new ActionError({ code: 'UNAUTHORIZED', message: 'Sign in to continue' });
  }
  return session.user;
};

export async function findResumeOrThrow(id: string, userId: string) {
  const rows = await resumeRepository.getData({
    where: (table) => and(eq(table.id, id), eq(table.userId, userId)),
    limit: 1,
  });
  const resume = rows[0];
  if (!resume) {
    throw new ActionError({ code: 'NOT_FOUND', message: 'Resume not found' });
  }
  return resume;
}

export async function setDefaultResume(id: string, userId: string) {
  await resumeRepository.update(
    { isDefault: false },
    (table) => and(eq(table.userId, userId), ne(table.id, id)),
  );
  await resumeRepository.update({ isDefault: true }, (table) => and(eq(table.id, id), eq(table.userId, userId)));
}

export async function deleteResumeCascade(id: string, userId: string) {
  await resumeExportRepository.delete((table) => eq(table.resumeId, id));
  await resumeRepository.delete((table) => and(eq(table.id, id), eq(table.userId, userId)));
}

export async function listResumesForUser(userId: string) {
  const rows = await resumeRepository.getData({
    where: (table) => eq(table.userId, userId),
    orderBy: (table) => [desc(table.lastSavedAt), desc(table.createdAt)],
  });
  return rows.map(normalizeResumeRow);
}

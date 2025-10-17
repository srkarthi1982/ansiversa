import { ActionError } from 'astro:actions';
import { db, CoverLetter, CoverLetterExport, CoverLetterHistory, and, count, desc, eq, gte, lt } from 'astro:db';
import { z } from 'astro:schema';
import {
  CoverLetterDocumentSchema,
  CoverLetterPromptsSchema,
  coverLetterTemplates,
  coverLetterTones,
  coverLetterLengths,
  coverLetterStatuses,
} from '../../lib/coverLetter/schema';
import { requireUser as requireResumeUser } from '../resume/utils';

export const templateKeyEnum = z.enum(coverLetterTemplates);
export const toneEnum = z.enum(coverLetterTones);
export const lengthEnum = z.enum(coverLetterLengths);
export const statusEnum = z.enum(coverLetterStatuses);

export type CoverLetterRow = typeof CoverLetter.$inferSelect;

export const requireUser = requireResumeUser;

export const normalizeCoverLetterRow = (row: CoverLetterRow) => {
  const parsed = CoverLetterDocumentSchema.parse({
    ...row,
    prompts: row.prompts ?? {},
    lastSavedAt: row.lastSavedAt ? row.lastSavedAt.toISOString() : null,
    createdAt: row.createdAt ? row.createdAt.toISOString() : null,
  });
  return parsed;
};

export async function findCoverLetterOrThrow(id: string, userId: string) {
  const rows = await db
    .select()
    .from(CoverLetter)
    .where(and(eq(CoverLetter.id, id), eq(CoverLetter.userId, userId)));
  const letter = rows[0];
  if (!letter) {
    throw new ActionError({ code: 'NOT_FOUND', message: 'Cover letter not found' });
  }
  return letter;
}

export async function listCoverLettersForUser(userId: string) {
  const rows = await db
    .select()
    .from(CoverLetter)
    .where(eq(CoverLetter.userId, userId))
    .orderBy(desc(CoverLetter.lastSavedAt), desc(CoverLetter.createdAt));
  return rows.map(normalizeCoverLetterRow);
}

export async function recordHistoryEntry(
  letterId: string,
  userId: string,
  body: string,
  generatedBy: 'user' | 'ai',
) {
  await db.insert(CoverLetterHistory).values({
    id: crypto.randomUUID(),
    letterId,
    userId,
    body,
    generatedBy,
    createdAt: new Date(),
  });
}

export async function countTodaysAiComposes(userId: string) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const [{ value = 0 } = {}] = await db
    .select({ value: count() })
    .from(CoverLetterHistory)
    .where(
      and(
        eq(CoverLetterHistory.userId, userId),
        eq(CoverLetterHistory.generatedBy, 'ai'),
        gte(CoverLetterHistory.createdAt, start),
        lt(CoverLetterHistory.createdAt, end),
      ),
    );
  return value ?? 0;
}

export async function removeCoverLetterCascade(id: string, userId: string) {
  await db.delete(CoverLetterExport).where(eq(CoverLetterExport.letterId, id));
  await db.delete(CoverLetterHistory).where(eq(CoverLetterHistory.letterId, id));
  await db.delete(CoverLetter).where(and(eq(CoverLetter.id, id), eq(CoverLetter.userId, userId)));
}

export const promptsInputSchema = CoverLetterPromptsSchema.extend({
  valueProps: z.array(z.string().max(160)).max(8).default([]),
  achievements: z
    .array(
      z.object({
        headline: z.string().max(120).optional().or(z.literal('')).default(''),
        metric: z.string().max(80).optional().or(z.literal('')).default(''),
        description: z.string().max(220).optional().or(z.literal('')).default(''),
      }),
    )
    .max(6)
    .default([]),
});

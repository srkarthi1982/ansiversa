import { ActionError } from 'astro:actions';
import { Minutes, MinutesActionItem, and, desc, eq } from 'astro:db';
import { z } from 'astro:schema';
import type { MinutesRecord, MinutesSummary } from '../../lib/minutes/schema';
import {
  minutesTemplateKeys,
  minutesStatuses,
  minutesPrivacyModes,
  minutesActionPriorities,
  minutesActionStatuses,
} from '../../lib/minutes/schema';
import {
  mergeMinutesRecord,
  sanitizeMinutesTitle,
  slugifyMinutesTitle,
  toMinutesAttendees,
  toMinutesSummary,
  toMinutesTranscript,
} from '../../lib/minutes/utils';
import { getSessionWithUser } from '../../utils/session.server';
import {
  minutesActionItemRepository,
  minutesRepository,
} from './repositories';

export const templateKeyEnum = z.enum(minutesTemplateKeys);
export const statusEnum = z.enum(minutesStatuses);
export const privacyEnum = z.enum(minutesPrivacyModes);
export const actionPriorityEnum = z.enum(minutesActionPriorities);
export const actionStatusEnum = z.enum(minutesActionStatuses);

export type MinutesRow = typeof Minutes.$inferSelect;

export const normalizeMinutesRow = (row: MinutesRow): MinutesRecord => {
  const attendees = toMinutesAttendees(row.attendees);
  const summary = toMinutesSummary(row.summary);
  const transcript = toMinutesTranscript(row.transcript);
  return {
    id: row.id,
    userId: row.userId,
    title: row.title ?? 'Untitled meeting',
    slug: row.slug ?? null,
    status: statusEnum.parse(row.status ?? 'draft'),
    templateKey: templateKeyEnum.parse(row.templateKey ?? 'standup'),
    meetingDate: row.meetingDate ? row.meetingDate.toISOString() : null,
    attendees,
    transcript,
    summary,
    privacy: privacyEnum.parse(row.privacy ?? 'standard'),
    durationSec: typeof row.durationSec === 'number' ? row.durationSec : null,
    plan: (row.plan === 'pro' ? 'pro' : 'free') as 'free' | 'pro',
    lastSavedAt: row.lastSavedAt ? row.lastSavedAt.toISOString() : null,
    createdAt: row.createdAt ? row.createdAt.toISOString() : null,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
  } satisfies MinutesRecord;
};

export const requireUser = async (ctx: { cookies: unknown }) => {
  const session = await getSessionWithUser(ctx.cookies as any);
  if (!session?.user) {
    throw new ActionError({ code: 'UNAUTHORIZED', message: 'Sign in to manage meeting minutes.' });
  }
  return session.user;
};

export async function findMinutesOrThrow(id: string, userId: string) {
  const rows = await minutesRepository.getData({
    where: (table) => and(eq(table.id, id), eq(table.userId, userId)),
    limit: 1,
  });
  const record = rows[0];
  if (!record) {
    throw new ActionError({ code: 'NOT_FOUND', message: 'Meeting not found' });
  }
  return record;
}

export async function listMinutesForUser(userId: string) {
  const rows = await minutesRepository.getData({
    where: (table) => eq(table.userId, userId),
    orderBy: (table) => [desc(table.lastSavedAt), desc(table.createdAt)],
  });
  return rows.map(normalizeMinutesRow);
}

export async function ensureMinutesSlug(title: string, userId: string, currentId?: string | null) {
  const base = slugifyMinutesTitle(title);
  let candidate = base;
  let attempt = 1;
  while (true) {
    const matches = await minutesRepository.getData({
      where: (table) => eq(table.slug, candidate),
    });
    const conflict = matches.find((row) => !currentId || row.id !== currentId);
    if (!conflict) {
      return candidate;
    }
    attempt += 1;
    candidate = `${base}-${attempt}`;
  }
}

export async function syncActionItems(minutesId: string, summary: MinutesSummary) {
  await minutesActionItemRepository.delete((table) => eq(table.minutesId, minutesId));
  if (!summary.actionItems.length) {
    return;
  }
  await minutesActionItemRepository.insert(
    summary.actionItems.map((item) => ({
      id: item.id,
      minutesId,
      task: item.task,
      assignee: item.assignee ?? null,
      due: item.due ? new Date(item.due) : null,
      priority: item.priority,
      status: item.status,
      createdAt: new Date(),
    })),
  );
}

export const mergeMinutesPayload = (row: MinutesRow, patch: Partial<MinutesRecord>) =>
  mergeMinutesRecord(normalizeMinutesRow(row), patch);

export const parseAttendees = (value: unknown) => toMinutesAttendees(value);
export const parseSummary = (value: unknown) => toMinutesSummary(value);
export const parseTranscript = (value: unknown) => toMinutesTranscript(value);


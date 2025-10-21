import { ActionError } from 'astro:actions';
import { db, Proposal, and, desc, eq } from 'astro:db';
import { z } from 'astro:schema';
import {
  ProposalDataSchema,
  proposalStatuses,
  proposalTemplateKeys,
  createEmptyProposalData,
  defaultProposalTitle,
} from '../../lib/proposal/schema';
import { slugifyProposalTitle } from '../../lib/proposal/utils';
import { getSessionWithUser } from '../../utils/session.server';

export const templateKeyEnum = z.enum(proposalTemplateKeys);
export const statusEnum = z.enum(proposalStatuses);

export type ProposalRow = typeof Proposal.$inferSelect;

export const normalizeProposalRow = (row: ProposalRow) => ({
  id: row.id,
  userId: row.userId,
  title: row.title,
  templateKey: row.templateKey,
  status: row.status as (typeof proposalStatuses)[number],
  currency: row.currency ?? 'USD',
  slug: row.slug ?? null,
  data: ProposalDataSchema.parse(row.data ?? createEmptyProposalData()),
  lastSavedAt: row.lastSavedAt ? row.lastSavedAt.toISOString() : null,
  createdAt: row.createdAt ? row.createdAt.toISOString() : null,
  publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
});

export const requireUser = async (ctx: { cookies: unknown }) => {
  const session = await getSessionWithUser(ctx.cookies as any);
  if (!session?.user) {
    throw new ActionError({ code: 'UNAUTHORIZED', message: 'Sign in to work on proposals.' });
  }
  return session.user;
};

export async function findProposalOrThrow(id: string, userId: string) {
  const rows = await db.select().from(Proposal).where(and(eq(Proposal.id, id), eq(Proposal.userId, userId)));
  const proposal = rows[0];
  if (!proposal) {
    throw new ActionError({ code: 'NOT_FOUND', message: 'Proposal not found' });
  }
  return proposal;
}

export async function listProposalsForUser(userId: string) {
  const rows = await db
    .select()
    .from(Proposal)
    .where(eq(Proposal.userId, userId))
    .orderBy(desc(Proposal.lastSavedAt), desc(Proposal.createdAt));
  return rows.map(normalizeProposalRow);
}

export async function ensureProposalSlug(title: string, userId: string, currentId?: string | null) {
  const base = slugifyProposalTitle(title || defaultProposalTitle);
  let candidate = base;
  let attempt = 1;
  while (true) {
    const matches = await db.select({ id: Proposal.id, userId: Proposal.userId }).from(Proposal).where(eq(Proposal.slug, candidate));
    const conflict = matches.find((row) => row.userId !== userId || (currentId && row.id !== currentId));
    if (!conflict) {
      return candidate;
    }
    attempt += 1;
    candidate = `${base}-${attempt}`;
  }
}

export function mergeProposalData(original: any, patch: any) {
  const draft = ProposalDataSchema.parse(original ?? createEmptyProposalData());
  return ProposalDataSchema.parse({ ...draft, ...patch });
}

export const sanitizeTitle = (title?: string | null) => {
  const fallback = defaultProposalTitle;
  if (!title) return fallback;
  const value = title.trim();
  return value.length ? value : fallback;
};

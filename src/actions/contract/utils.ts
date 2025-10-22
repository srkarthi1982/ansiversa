import { ActionError } from 'astro:actions';
import { db, Contract, ContractClauseLibrary, and, desc, eq } from 'astro:db';
import { z } from 'astro:schema';
import {
  ContractClausesSchema,
  ContractDataSchema,
  ContractVariablesSchema,
  ContractVersionSchema,
  contractStatuses,
  contractTemplateKeys,
  createEmptyContractData,
  defaultContractTitle,
} from '../../lib/contract/schema';
import type { ContractData } from '../../lib/contract/schema';
import { slugifyContractTitle } from '../../lib/contract/utils';
import { getSessionWithUser } from '../../utils/session.server';

export const templateKeyEnum = z.enum(contractTemplateKeys);
export const statusEnum = z.enum(contractStatuses);

export type ContractRow = typeof Contract.$inferSelect;

export const normalizeContractRow = (row: ContractRow) => {
  const base = createEmptyContractData();
  const variables = ContractVariablesSchema.parse(row.variables ?? base.variables);
  const clauses = ContractClausesSchema.parse(row.clauses ?? base.clauses);
  const versions = ContractVersionSchema.array().parse(row.versions ?? base.versions);
  const options = ContractDataSchema.shape.options.parse(row.options ?? base.options);
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    templateKey: row.templateKey,
    type: row.type,
    status: row.status as (typeof contractStatuses)[number],
    slug: row.slug ?? null,
    variables,
    clauses,
    versions,
    options,
    notes: row.notes ?? null,
    lastSavedAt: row.lastSavedAt ? row.lastSavedAt.toISOString() : null,
    createdAt: row.createdAt ? row.createdAt.toISOString() : null,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
  };
};

export const requireUser = async (ctx: { cookies: unknown }) => {
  const session = await getSessionWithUser(ctx.cookies as any);
  if (!session?.user) {
    throw new ActionError({ code: 'UNAUTHORIZED', message: 'Sign in to manage contracts.' });
  }
  return session.user;
};

export async function findContractOrThrow(id: string, userId: string) {
  const rows = await db.select().from(Contract).where(and(eq(Contract.id, id), eq(Contract.userId, userId)));
  const contract = rows[0];
  if (!contract) {
    throw new ActionError({ code: 'NOT_FOUND', message: 'Contract not found' });
  }
  return contract;
}

export async function listContractsForUser(userId: string) {
  const rows = await db
    .select()
    .from(Contract)
    .where(eq(Contract.userId, userId))
    .orderBy(desc(Contract.lastSavedAt), desc(Contract.createdAt));
  return rows.map(normalizeContractRow);
}

export async function ensureContractSlug(title: string, userId: string, currentId?: string | null) {
  const base = slugifyContractTitle(title || defaultContractTitle);
  let candidate = base;
  let attempt = 1;
  while (true) {
    const matches = await db.select({ id: Contract.id, userId: Contract.userId }).from(Contract).where(eq(Contract.slug, candidate));
    const conflict = matches.find((row) => row.userId !== userId || (currentId && row.id !== currentId));
    if (!conflict) {
      return candidate;
    }
    attempt += 1;
    candidate = `${base}-${attempt}`;
  }
}

export function sanitizeContractTitle(title?: string | null) {
  const fallback = defaultContractTitle;
  if (!title) return fallback;
  const value = title.trim();
  return value.length ? value : fallback;
}

export function mergeContractData(original: ContractData | null | undefined, patch: any) {
  const draft = ContractDataSchema.parse(original ?? createEmptyContractData());
  return ContractDataSchema.parse({ ...draft, ...patch });
}

export async function loadClauseLibrary(locale = 'en') {
  const rows = await db
    .select()
    .from(ContractClauseLibrary)
    .where(eq(ContractClauseLibrary.locale, locale))
    .orderBy(ContractClauseLibrary.title);
  return rows.map((row) => ({
    id: row.id,
    category: row.category,
    title: row.title,
    body: row.body,
    locale: row.locale,
  }));
}

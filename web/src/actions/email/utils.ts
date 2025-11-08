import { ActionError } from 'astro:actions';
import { EmailDraft, EmailTemplate, EmailSignature, EmailHistory, and, desc, eq } from 'astro:db';
import { z } from 'astro:schema';
import {
  EmailDraftSchema,
  EmailTemplateSchema,
  createBlankDraft,
  createTemplate,
  createSignature,
  defaultEmailVariables,
  emailToneOptions,
  emailFormalityLevels,
  emailRewriteModes,
  emailTranslateTargets,
  emailRelationshipOptions,
  emailUrgencyOptions,
  type EmailDraft as EmailDraftType,
  type EmailTemplate as EmailTemplateType,
} from '../../lib/email/schema';
import { systemEmailTemplates } from '../../lib/email/templates';
import { getSessionWithUser } from '../../utils/session.server';
import {
  emailDraftRepository,
  emailHistoryRepository,
  emailSignatureRepository,
  emailTemplateRepository,
} from './repositories';

export const toneEnum = z.enum(emailToneOptions);
export const formalityEnum = z.enum(emailFormalityLevels);
export const rewriteEnum = z.enum(emailRewriteModes);
export const translateEnum = z.enum(emailTranslateTargets);
export const relationshipEnum = z.enum(emailRelationshipOptions);
export const urgencyEnum = z.enum(emailUrgencyOptions);

export type EmailDraftRow = typeof EmailDraft.$inferSelect;
export type EmailTemplateRow = typeof EmailTemplate.$inferSelect;
export type EmailSignatureRow = typeof EmailSignature.$inferSelect;

export const requireUser = async (ctx: { cookies: unknown }) => {
  const session = await getSessionWithUser(ctx.cookies as any);
  if (!session?.user) {
    throw new ActionError({ code: 'UNAUTHORIZED', message: 'Sign in to use Email Polisher.' });
  }

  return {
    ...session.user,
    plan: session.user.plan === 'pro' ? 'pro' : 'free',
  } as { id: string; email: string; username: string; roleId: number; plan: 'free' | 'pro' };
};

export const normalizeDraftRow = (row: EmailDraftRow, plan: 'free' | 'pro') =>
  EmailDraftSchema.parse({
    id: row.id,
    userId: row.userId,
    title: row.title ?? 'Untitled email',
    status: (row.status ?? 'draft') as 'draft' | 'final',
    subject: row.subject ?? null,
    input: row.input ?? '',
    output: row.output ?? '',
    tone: (row.tone ?? 'professional') as (typeof emailToneOptions)[number],
    formality: (row.formality ?? 'medium') as (typeof emailFormalityLevels)[number],
    language: row.language ?? 'en',
    variables: row.variables ?? defaultEmailVariables,
    signatureEnabled: row.signatureEnabled ?? true,
    ephemeral: row.ephemeral ?? false,
    needSubject: true,
    plan,
    lastSavedAt: row.lastSavedAt ? row.lastSavedAt.toISOString() : new Date().toISOString(),
    createdAt: row.createdAt ? row.createdAt.toISOString() : new Date().toISOString(),
  });

export const normalizeTemplateRow = (row: EmailTemplateRow) =>
  EmailTemplateSchema.parse({
    id: row.id,
    userId: row.userId,
    name: row.name,
    category: (row.category ?? 'Outreach') as EmailTemplateType['category'],
    subject: row.subject ?? null,
    body: row.body ?? '',
    language: row.language ?? 'en',
    isSystem: row.isSystem ?? false,
    createdAt: row.createdAt ? row.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : new Date().toISOString(),
  });

export async function listDraftsForUser(userId: string, plan: 'free' | 'pro') {
  const rows = await emailDraftRepository.getData({
    where: (table) => eq(table.userId, userId),
    orderBy: (table) => [desc(table.lastSavedAt), desc(table.createdAt)],
  });

  return rows.map((row) => normalizeDraftRow(row, plan));
}

export async function findDraftOrThrow(id: string, userId: string) {
  const rows = await emailDraftRepository.getData({
    where: (table) => and(eq(table.id, id), eq(table.userId, userId)),
    limit: 1,
  });
  const draft = rows[0];
  if (!draft) {
    throw new ActionError({ code: 'NOT_FOUND', message: 'Draft not found' });
  }
  return draft;
}

export async function upsertDraft(row: EmailDraftRow) {
  const existing = await emailDraftRepository.getById((table) => table.id, row.id);

  if (!existing) {
    await emailDraftRepository.insert(row);
    return;
  }

  await emailDraftRepository.update(
    {
      title: row.title,
      status: row.status,
      subject: row.subject,
      input: row.input,
      output: row.output,
      language: row.language,
      tone: row.tone,
      formality: row.formality,
      variables: row.variables,
      signatureEnabled: row.signatureEnabled,
      ephemeral: row.ephemeral,
      plan: row.plan,
      lastSavedAt: row.lastSavedAt,
    },
    (table) => eq(table.id, row.id),
  );
}

export async function listTemplatesForUser(userId: string) {
  const rows = await emailTemplateRepository.getData({
    where: (table) => eq(table.userId, userId),
    orderBy: (table) => desc(table.updatedAt),
  });

  const userTemplates = rows.map((row) => normalizeTemplateRow(row));
  return [...systemEmailTemplates, ...userTemplates];
}

export async function findTemplateForUser(id: string, userId: string) {
  const userRows = await emailTemplateRepository.getData({
    where: (table) => and(eq(table.id, id), eq(table.userId, userId)),
    limit: 1,
  });

  const record = userRows[0];
  if (record) {
    return normalizeTemplateRow(record);
  }

  const systemTemplate = systemEmailTemplates.find((template) => template.id === id);
  if (systemTemplate) {
    return systemTemplate;
  }

  throw new ActionError({ code: 'NOT_FOUND', message: 'Template not found' });
}

export async function findSignatureForUser(userId: string) {
  const rows = await emailSignatureRepository.getData({
    where: (table) => eq(table.userId, userId),
    limit: 1,
  });
  const signature = rows[0];
  if (!signature) {
    const fallback = createSignature({ userId });
    await emailSignatureRepository.insert({
      id: fallback.id,
      userId,
      display: fallback.display,
      enabled: fallback.enabled,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return fallback;
  }

  const base = createSignature({ id: signature.id, userId: signature.userId });
  return createSignature({
    id: signature.id,
    userId: signature.userId,
    display: signature.display ?? base.display,
    enabled: signature.enabled ?? true,
    createdAt: signature.createdAt?.toISOString(),
    updatedAt: signature.updatedAt?.toISOString(),
  });
}

export async function recordHistory(entry: {
  draftId: string;
  action: string;
  inputSize: number;
  outputSize: number;
  cost?: number;
}) {
  try {
    await emailHistoryRepository.insert({
      id: crypto.randomUUID(),
      draftId: entry.draftId,
      action: entry.action,
      inputSize: entry.inputSize,
      outputSize: entry.outputSize,
      cost: entry.cost ?? null,
      createdAt: new Date(),
    });
  } catch (error) {
    console.warn('[email-history] Unable to log history entry', error);
  }
}

export const createDraftRecord = (input: Partial<EmailDraftType> & { userId: string; plan: 'free' | 'pro' }) => {
  const draft = createBlankDraft({ ...input });
  return {
    id: draft.id,
    userId: draft.userId,
    title: draft.title,
    status: draft.status,
    subject: draft.subject,
    input: draft.input,
    output: draft.output,
    language: draft.language,
    tone: draft.tone,
    formality: draft.formality,
    variables: draft.variables,
    signatureEnabled: draft.signatureEnabled,
    ephemeral: draft.ephemeral,
    plan: draft.plan,
    lastSavedAt: new Date(draft.lastSavedAt ?? new Date()),
    createdAt: new Date(draft.createdAt ?? new Date()),
  } satisfies EmailDraftRow;
};

export const createTemplateRecord = (input: Partial<EmailTemplateType> & { userId: string }) => {
  const template = createTemplate({ ...input });
  return {
    id: template.id,
    userId: template.userId,
    name: template.name,
    category: template.category,
    subject: template.subject,
    body: template.body,
    language: template.language,
    isSystem: template.isSystem,
    createdAt: new Date(template.createdAt ?? new Date()),
    updatedAt: new Date(template.updatedAt ?? new Date()),
  } satisfies EmailTemplateRow;
};

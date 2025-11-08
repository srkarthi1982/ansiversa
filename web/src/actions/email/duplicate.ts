import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { findDraftOrThrow, normalizeDraftRow, requireUser, upsertDraft } from './utils';

export const duplicate = defineAction({
  accept: 'json',
  input: z.object({ id: z.string().uuid() }),
  async handler({ id }, ctx) {
    const user = await requireUser(ctx);
    const existing = await findDraftOrThrow(id, user.id);
    const normalized = normalizeDraftRow(existing, user.plan);
    const now = new Date();
    const duplicateId = crypto.randomUUID();

    await upsertDraft({
      id: duplicateId,
      userId: normalized.userId,
      title: `${normalized.title} (Copy)`.slice(0, 180),
      status: 'draft',
      subject: normalized.subject,
      input: normalized.input,
      output: normalized.output,
      language: normalized.language,
      tone: normalized.tone,
      formality: normalized.formality,
      variables: normalized.variables,
      signatureEnabled: normalized.signatureEnabled,
      ephemeral: normalized.ephemeral,
      plan: normalized.plan,
      lastSavedAt: now,
      createdAt: now,
    });

    const duplicateDraft = await findDraftOrThrow(duplicateId, user.id);
    return { draft: normalizeDraftRow(duplicateDraft, user.plan) };
  },
});

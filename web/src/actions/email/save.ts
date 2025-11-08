import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { EmailDraftSchema, EmailVariablesSchema } from '../../lib/email/schema';
import {
  findDraftOrThrow,
  formalityEnum,
  normalizeDraftRow,
  requireUser,
  toneEnum,
  upsertDraft,
} from './utils';

export const save = defineAction({
  accept: 'json',
  input: z.object({
    id: z.string().uuid(),
    draft: z.object({
      title: z.string().max(180).optional(),
      subject: z.string().max(120).optional().nullable(),
      input: z.string().max(20000).optional(),
      output: z.string().max(20000).optional(),
      tone: toneEnum.optional(),
      formality: formalityEnum.optional(),
      language: z.string().optional(),
      variables: EmailVariablesSchema.optional(),
      signatureEnabled: z.boolean().optional(),
      ephemeral: z.boolean().optional(),
      status: z.enum(['draft', 'final']).optional(),
    }),
  }),
  async handler({ id, draft }, ctx) {
    const user = await requireUser(ctx);
    const existing = await findDraftOrThrow(id, user.id);
    const normalized = normalizeDraftRow(existing, user.plan);
    const merged = EmailDraftSchema.parse({
      ...normalized,
      ...draft,
      plan: user.plan,
      lastSavedAt: new Date().toISOString(),
    });

    const now = new Date();
    await upsertDraft({
      id: merged.id,
      userId: merged.userId,
      title: merged.title,
      status: merged.status,
      subject: merged.subject,
      input: merged.input,
      output: merged.output,
      language: merged.language,
      tone: merged.tone,
      formality: merged.formality,
      variables: merged.variables,
      signatureEnabled: merged.signatureEnabled,
      ephemeral: merged.ephemeral,
      plan: merged.plan,
      lastSavedAt: now,
      createdAt: existing.createdAt ?? now,
    });

    const updated = await findDraftOrThrow(id, user.id);
    return { draft: normalizeDraftRow(updated, user.plan) };
  },
});

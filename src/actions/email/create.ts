import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { createDraftRecord, formalityEnum, requireUser, toneEnum, upsertDraft } from './utils';

export const create = defineAction({
  accept: 'json',
  input: z
    .object({
      title: z.string().max(180).optional(),
      tone: toneEnum.optional(),
      formality: formalityEnum.optional(),
      language: z.string().optional(),
      subject: z.string().max(120).optional().nullable(),
    })
    .optional(),
  async handler(input, ctx) {
    const user = await requireUser(ctx);
    const payload = input ?? {};
    const record = createDraftRecord({
      userId: user.id,
      plan: user.plan,
      title: payload.title,
      tone: payload.tone,
      formality: payload.formality,
      language: payload.language,
      subject: payload.subject ?? null,
      input: '',
      output: '',
    });

    await upsertDraft({ ...record, lastSavedAt: new Date(), createdAt: new Date() });
    return { id: record.id };
  },
});

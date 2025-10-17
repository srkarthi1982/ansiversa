import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { db, CoverLetter, eq } from 'astro:db';
import {
  requireUser,
  findCoverLetterOrThrow,
  normalizeCoverLetterRow,
  templateKeyEnum,
  toneEnum,
  lengthEnum,
  statusEnum,
  promptsInputSchema,
  recordHistoryEntry,
} from './utils';

export const save = defineAction({
  accept: 'json',
  input: z.object({
    id: z.string().uuid(),
    title: z.string().optional(),
    role: z.string().optional(),
    company: z.string().optional(),
    greeting: z.string().optional(),
    tone: toneEnum.optional(),
    length: lengthEnum.optional(),
    templateKey: templateKeyEnum.optional(),
    body: z.string().optional(),
    status: statusEnum.optional(),
    prompts: promptsInputSchema.optional(),
  }),
  async handler(input, ctx) {
    const user = await requireUser(ctx);
    const existing = await findCoverLetterOrThrow(input.id, user.id);
    const plan = (user.plan as 'free' | 'pro' | 'elite' | undefined) ?? 'free';
    const templateKey = input.templateKey ?? existing.templateKey;
    if (plan === 'free' && templateKey !== 'minimal') {
      throw new ActionError({ code: 'FORBIDDEN', message: 'Upgrade to Pro to use this template.' });
    }

    const now = new Date();
    const prompts = input.prompts ? promptsInputSchema.parse(input.prompts) : existing.prompts;
    const update = {
      title: input.title?.trim() || existing.title,
      role: input.role?.trim() ?? existing.role,
      company: input.company?.trim() ?? existing.company,
      greeting: input.greeting?.trim() ?? existing.greeting,
      tone: input.tone ?? existing.tone,
      length: input.length ?? existing.length,
      templateKey,
      body: input.body ?? existing.body ?? '',
      status: input.status ?? existing.status,
      prompts,
      lastSavedAt: now,
    };

    await db.update(CoverLetter).set(update).where(eq(CoverLetter.id, existing.id));
    await recordHistoryEntry(existing.id, user.id, update.body ?? '', 'user');

    const rows = await findCoverLetterOrThrow(existing.id, user.id);
    return { letter: normalizeCoverLetterRow(rows) };
  },
});

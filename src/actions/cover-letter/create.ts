import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { db, CoverLetter } from 'astro:db';
import { createBlankCoverLetter, createEmptyPrompts } from '../../lib/coverLetter/schema';
import { requireUser, templateKeyEnum, toneEnum, lengthEnum } from './utils';

export const create = defineAction({
  accept: 'json',
  input: z
    .object({
      title: z.string().optional(),
      role: z.string().optional(),
      company: z.string().optional(),
      greeting: z.string().optional(),
      tone: toneEnum.optional(),
      length: lengthEnum.optional(),
      templateKey: templateKeyEnum.optional(),
    })
    .optional(),
  async handler(input, ctx) {
    const payload = input ?? {};
    const user = await requireUser(ctx);
    const plan = (user.plan as 'free' | 'pro' | 'elite' | undefined) ?? 'free';
    const now = new Date();
    const id = crypto.randomUUID();

    const templateKey = plan === 'free' ? 'minimal' : payload.templateKey ?? 'minimal';
    if (plan === 'free' && templateKey !== 'minimal') {
      throw new ActionError({ code: 'FORBIDDEN', message: 'Upgrade to Pro to unlock additional templates.' });
    }

    const record = {
      id,
      userId: user.id,
      title: payload.title?.trim() || 'Untitled cover letter',
      role: payload.role?.trim() ?? '',
      company: payload.company?.trim() ?? '',
      greeting: payload.greeting?.trim() ?? '',
      tone: payload.tone ?? 'professional',
      length: payload.length ?? 'medium',
      templateKey,
      prompts: createEmptyPrompts(),
      body: '',
      status: 'draft',
      lastSavedAt: now,
      createdAt: now,
    };

    await db.insert(CoverLetter).values(record);
    const letter = createBlankCoverLetter(record);
    return { letter };
  },
});

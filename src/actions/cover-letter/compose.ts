import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { db, CoverLetter, eq } from 'astro:db';
import {
  requireUser,
  findCoverLetterOrThrow,
  normalizeCoverLetterRow,
  promptsInputSchema,
  countTodaysAiComposes,
  recordHistoryEntry,
  toneEnum,
  lengthEnum,
} from './utils';
import type { CoverLetterPrompts } from '../../lib/coverLetter/schema';

const composeDraft = (
  prompts: CoverLetterPrompts,
  options: { tone: 'professional' | 'confident' | 'friendly'; length: 'short' | 'medium' | 'long'; role?: string; company?: string },
): string => {
  const paragraphs: string[] = [];
  const intro = prompts.introduction?.trim();
  const roleLine = [options.role, options.company].filter(Boolean).join(' at ');
  const prefixByTone = {
    professional: 'I am writing to express my interest',
    confident: 'I am thrilled to share how I can contribute',
    friendly: "I'm excited to reach out",
  }[options.tone];

  if (intro) {
    paragraphs.push(intro);
  } else if (roleLine) {
    paragraphs.push(`${prefixByTone} in the ${roleLine} opportunity.`);
  }

  if (prompts.motivation?.trim()) {
    paragraphs.push(prompts.motivation.trim());
  }

  if (prompts.valueProps.length > 0) {
    const lead =
      options.tone === 'friendly'
        ? "Here's why I'll make an impact:"
        : options.tone === 'confident'
        ? 'My core strengths include:'
        : 'Key strengths I would bring include:';
    paragraphs.push(`${lead} ${prompts.valueProps.map((value) => value.trim()).filter(Boolean).join(', ')}.`);
  }

  if (prompts.achievements.length > 0) {
    const lines = prompts.achievements
      .map((achievement) => {
        const headline = achievement.headline?.trim();
        const metric = achievement.metric?.trim();
        const description = achievement.description?.trim();
        return [headline, metric, description].filter(Boolean).join(' — ');
      })
      .filter(Boolean);
    if (lines.length > 0) {
      paragraphs.push(`Highlights: ${lines.join('; ')}.`);
    }
  }

  if (prompts.closing?.trim()) {
    paragraphs.push(prompts.closing.trim());
  } else {
    paragraphs.push('I would welcome the chance to discuss how I can help your team achieve its goals.');
  }

  const targetParagraphs = options.length === 'short' ? 2 : options.length === 'medium' ? 3 : 4;
  if (paragraphs.length > targetParagraphs) {
    return paragraphs.slice(0, targetParagraphs).join('\n\n');
  }
  return paragraphs.join('\n\n');
};

export const compose = defineAction({
  accept: 'json',
  input: z.object({
    id: z.string().uuid(),
    prompts: promptsInputSchema.optional(),
    tone: toneEnum.optional(),
    length: lengthEnum.optional(),
  }),
  async handler(input, ctx) {
    const user = await requireUser(ctx);
    const plan = (user.plan as 'free' | 'pro' | 'elite' | undefined) ?? 'free';
    const usage = await countTodaysAiComposes(user.id);
    const limit = plan === 'free' ? 3 : plan === 'pro' ? 20 : Number.POSITIVE_INFINITY;
    if (usage >= limit) {
      throw new ActionError({
        code: 'FORBIDDEN',
        message: 'Daily AI compose limit reached. Upgrade to Pro for unlimited writes.',
      });
    }

    const existing = await findCoverLetterOrThrow(input.id, user.id);
    const prompts = input.prompts ? promptsInputSchema.parse(input.prompts) : existing.prompts;
    const tone = input.tone ?? existing.tone;
    const length = input.length ?? existing.length;

    const body = composeDraft(prompts, { tone, length, role: existing.role, company: existing.company });
    const now = new Date();

    await db
      .update(CoverLetter)
      .set({
        prompts,
        tone,
        length,
        body,
        lastSavedAt: now,
      })
      .where(eq(CoverLetter.id, existing.id));

    await recordHistoryEntry(existing.id, user.id, body, 'ai');

    const row = await findCoverLetterOrThrow(existing.id, user.id);
    return {
      letter: normalizeCoverLetterRow(row),
      usage: {
        used: usage + 1,
        limit,
      },
    };
  },
});

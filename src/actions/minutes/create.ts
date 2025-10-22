import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { db, Minutes, eq } from 'astro:db';
import {
  buildDemoSummary,
  buildDemoTranscript,
  sanitizeMinutesTitle,
} from '../../lib/minutes/utils';
import { minutesPlanLimits } from '../../lib/minutes/schema';
import { listMinutesForUser, normalizeMinutesRow, requireUser, templateKeyEnum, syncActionItems } from './utils';

export const create = defineAction({
  accept: 'json',
  input: z
    .object({
      title: z.string().optional(),
      templateKey: templateKeyEnum.optional(),
      meetingDate: z.string().optional(),
    })
    .optional(),
  async handler(input, ctx) {
    const user = await requireUser(ctx);
    const payload = input ?? {};
    const plan = (user.plan ?? 'free') as 'free' | 'pro';
    const existing = await listMinutesForUser(user.id);
    const limits = minutesPlanLimits[plan];
    if (Number.isFinite(limits.maxMinutes) && existing.length >= limits.maxMinutes) {
      throw new ActionError({
        code: 'FORBIDDEN',
        message: 'You have reached the meeting limit for the free plan. Upgrade to create more minutes.',
      });
    }

    const id = crypto.randomUUID();
    const templateKey = payload.templateKey ?? templateKeyEnum.enum.standup;
    const meetingDate = payload.meetingDate ? new Date(payload.meetingDate) : null;
    const summary = buildDemoSummary(templateKey);
    const transcript = buildDemoTranscript(templateKey);

    await db.insert(Minutes).values({
      id,
      userId: user.id,
      title: sanitizeMinutesTitle(payload.title),
      slug: null,
      status: 'draft',
      templateKey,
      meetingDate: meetingDate ?? undefined,
      attendees: [],
      summary,
      transcript,
      privacy: 'standard',
      durationSec: null,
      plan,
      lastSavedAt: new Date(),
      createdAt: new Date(),
    });

    await syncActionItems(id, summary);

    const rows = await db.select().from(Minutes).where(eq(Minutes.id, id));
    const minutes = rows[0] ? normalizeMinutesRow(rows[0]) : null;

    return { minutes };
  },
});


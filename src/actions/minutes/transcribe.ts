import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { db, Minutes, MinutesMedia, eq } from 'astro:db';
import { minutesPlanLimits } from '../../lib/minutes/schema';
import { buildDemoTranscript } from '../../lib/minutes/utils';
import { requireUser, findMinutesOrThrow, normalizeMinutesRow } from './utils';

export const transcribe = defineAction({
  accept: 'json',
  input: z.object({
    id: z.string().uuid(),
    fileName: z.string().optional(),
    durationSec: z.number().min(1).optional(),
    diarize: z.boolean().optional(),
    language: z.string().optional(),
  }),
  async handler({ id, fileName, durationSec }, ctx) {
    const user = await requireUser(ctx);
    const row = await findMinutesOrThrow(id, user.id);
    const plan = (user.plan ?? 'free') as 'free' | 'pro';
    const limits = minutesPlanLimits[plan];

    if (durationSec && Number.isFinite(limits.audioDurationLimit) && durationSec / 60 > limits.audioDurationLimit) {
      throw new ActionError({
        code: 'FORBIDDEN',
        message: `Audio uploads on the ${plan} plan are limited to ${limits.audioDurationLimit} minutes.`,
      });
    }

    const minutes = normalizeMinutesRow(row);
    const transcript = buildDemoTranscript(minutes.templateKey);

    await db
      .update(Minutes)
      .set({
        transcript,
        durationSec: durationSec ?? minutes.durationSec ?? null,
        lastSavedAt: new Date(),
      })
      .where(eq(Minutes.id, id));

    if (durationSec) {
      await db.insert(MinutesMedia).values({
        id: crypto.randomUUID(),
        minutesId: id,
        type: 'audio',
        filePath: fileName ?? `uploads/${id}.mp3`,
        durationSec,
        createdAt: new Date(),
      });
    }

    return {
      transcript,
      durationSec: durationSec ?? minutes.durationSec ?? null,
    };
  },
});


import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { db, CoverLetter } from 'astro:db';
import { requireUser, findCoverLetterOrThrow, normalizeCoverLetterRow, recordMetricEvent } from './utils';

export const duplicate = defineAction({
  accept: 'json',
  input: z.object({ id: z.string().uuid() }),
  async handler(input, ctx) {
    const user = await requireUser(ctx);
    const existing = await findCoverLetterOrThrow(input.id, user.id);
    const now = new Date();
    const id = crypto.randomUUID();

    const record = {
      ...existing,
      id,
      title: `${existing.title} (Copy)`.slice(0, 180),
      status: 'draft',
      lastSavedAt: now,
      createdAt: now,
    };

    await db.insert(CoverLetter).values(record);
    await recordMetricEvent(user.id, 'coverLetter.duplicate', id, { sourceId: existing.id });
    const duplicated = await findCoverLetterOrThrow(id, user.id);
    return { letter: normalizeCoverLetterRow(duplicated) };
  },
});

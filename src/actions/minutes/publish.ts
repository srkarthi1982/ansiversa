import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { eq } from 'astro:db';
import { requireUser, findMinutesOrThrow, ensureMinutesSlug, normalizeMinutesRow } from './utils';
import { minutesRepository } from './repositories';

export const publish = defineAction({
  accept: 'json',
  input: z
    .object({
      id: z.string().uuid(),
      slug: z.string().optional(),
    })
    .optional(),
  async handler(input, ctx) {
    const payload = input ?? {};
    if (!payload.id) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Minutes id required' });
    }

    const user = await requireUser(ctx);
    const row = await findMinutesOrThrow(payload.id, user.id);
    const minutes = normalizeMinutesRow(row);

    if (!minutes.meetingDate) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Set a meeting date before publishing.' });
    }
    if (!minutes.summary || minutes.summary.keyPoints.length === 0) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Add at least one key point before publishing.' });
    }

    const slug = await ensureMinutesSlug(payload.slug ?? minutes.title, user.id, minutes.id);

    await minutesRepository.update(
      {
        slug,
        status: 'published',
        publishedAt: new Date(),
        lastSavedAt: new Date(),
      },
      (table) => eq(table.id, minutes.id),
    );

    return {
      slug,
      url: `/minutes/view/${slug}`,
    };
  },
});


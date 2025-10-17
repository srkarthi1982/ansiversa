import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { requireUser, findCoverLetterOrThrow, getOrCreateShareToken, recordMetricEvent } from './utils';

export const share = defineAction({
  accept: 'json',
  input: z.object({ id: z.string().uuid() }),
  async handler({ id }, ctx) {
    const user = await requireUser(ctx);
    await findCoverLetterOrThrow(id, user.id);

    const record = await getOrCreateShareToken(id, user.id);
    const origin = ctx.request?.url ? new URL(ctx.request.url).origin : 'https://ansiversa.app';
    const url = `${origin}/cover-letter-writer/share/${record.token}`;

    await recordMetricEvent(user.id, 'coverLetter.share', id, {
      token: record.token,
      expiresAt: record.expiresAt instanceof Date ? record.expiresAt.toISOString() : String(record.expiresAt),
    });

    return {
      url,
      expiresAt: record.expiresAt instanceof Date ? record.expiresAt.toISOString() : new Date(record.expiresAt).toISOString(),
    };
  },
});

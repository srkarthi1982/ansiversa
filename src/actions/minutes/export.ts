import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { minutesExportFormats, minutesPlanLimits } from '../../lib/minutes/schema';
import { requireUser, findMinutesOrThrow, normalizeMinutesRow } from './utils';

const formatEnum = z.enum(minutesExportFormats);

export const exportMinutes = defineAction({
  accept: 'json',
  input: z.object({
    id: z.string().uuid(),
    format: formatEnum,
  }),
  async handler({ id, format }, ctx) {
    const user = await requireUser(ctx);
    const row = await findMinutesOrThrow(id, user.id);
    const minutes = normalizeMinutesRow(row);

    const plan = (user.plan ?? 'free') as 'free' | 'pro';
    const limits = minutesPlanLimits[plan];
    if (!limits.exports.includes(format)) {
      throw new ActionError({
        code: 'FORBIDDEN',
        message: `The ${plan} plan does not include ${format.toUpperCase()} exports.`,
      });
    }

    const url = `/meeting-minutes-ai/download/${minutes.slug ?? minutes.id}.${format}`;

    return {
      url,
      format,
      watermark: limits.watermarkExports,
    };
  },
});

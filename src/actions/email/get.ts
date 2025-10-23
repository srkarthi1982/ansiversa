import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { findDraftOrThrow, normalizeDraftRow, requireUser } from './utils';

export const get = defineAction({
  accept: 'json',
  input: z.object({ id: z.string().uuid() }),
  async handler({ id }, ctx) {
    const user = await requireUser(ctx);
    const draft = await findDraftOrThrow(id, user.id);
    return { draft: normalizeDraftRow(draft, user.plan) };
  },
});

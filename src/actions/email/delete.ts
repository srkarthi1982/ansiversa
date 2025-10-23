import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { db, EmailDraft, eq } from 'astro:db';
import { requireUser, findDraftOrThrow } from './utils';

export const remove = defineAction({
  accept: 'json',
  input: z.object({ id: z.string().uuid() }),
  async handler({ id }, ctx) {
    const user = await requireUser(ctx);
    await findDraftOrThrow(id, user.id);
    await db.delete(EmailDraft).where(eq(EmailDraft.id, id));
    return { ok: true };
  },
});

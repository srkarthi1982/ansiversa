import { defineAction } from 'astro:actions';
import { and, eq } from 'astro:db';
import { VisitingCardDeleteSchema } from '../../lib/visiting-card-maker/schema';
import { visitingCardRepository } from './repositories';
import { findVisitingCardOrThrow, requireUser } from './utils';

export const remove = defineAction({
  accept: 'json',
  input: VisitingCardDeleteSchema,
  async handler(input, ctx) {
    const user = await requireUser(ctx);
    await findVisitingCardOrThrow(input.id, user.id);
    await visitingCardRepository.delete((table) => and(eq(table.id, input.id), eq(table.userId, user.id)));
    return { success: true };
  },
});

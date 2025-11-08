import { defineAction } from 'astro:actions';
import { VisitingCardListSchema } from '../../lib/visiting-card-maker/schema';
import { listVisitingCards, requireUser } from './utils';

export const list = defineAction({
  accept: 'json',
  input: VisitingCardListSchema,
  async handler(_input, ctx) {
    const user = await requireUser(ctx);
    const cards = await listVisitingCards(user.id);
    return { items: cards };
  },
});

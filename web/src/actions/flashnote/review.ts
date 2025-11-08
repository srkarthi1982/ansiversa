import { defineAction } from 'astro:actions';
import { reviewInputSchema } from './schemas';
import { createReviewDeck, requireUser } from './utils';

export const review = defineAction({
  accept: 'json',
  input: reviewInputSchema,
  async handler(input, ctx) {
    const user = await requireUser(ctx, input.sessionId);
    const cards = await createReviewDeck(user.id, input);
    return { cards };
  },
});

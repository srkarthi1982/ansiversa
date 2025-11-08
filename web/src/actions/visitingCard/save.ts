import { defineAction } from 'astro:actions';
import { and, eq } from 'astro:db';
import { VisitingCardSaveSchema } from '../../lib/visiting-card-maker/schema';
import { visitingCardRepository } from './repositories';
import { createVisitingCardId, findVisitingCardOrThrow, normalizeVisitingCard, requireUser } from './utils';

export const save = defineAction({
  accept: 'json',
  input: VisitingCardSaveSchema,
  async handler(input, ctx) {
    const user = await requireUser(ctx);
    const now = new Date();

    if (input.id) {
      await findVisitingCardOrThrow(input.id, user.id);
      const rows = await visitingCardRepository.update(
        {
          name: input.name,
          title: input.title,
          company: input.company,
          email: input.email,
          phone: input.phone,
          address: input.address,
          website: input.website,
          tagline: input.tagline,
          template: input.template,
          theme: input.theme,
          updatedAt: now,
        },
        (table) => and(eq(table.id, input.id!), eq(table.userId, user.id)),
      );
      return { card: normalizeVisitingCard(rows[0]!) };
    }

    const id = createVisitingCardId();
    const rows = await visitingCardRepository.insert({
      id,
      userId: user.id,
      name: input.name,
      title: input.title,
      company: input.company,
      email: input.email,
      phone: input.phone,
      address: input.address,
      website: input.website,
      tagline: input.tagline,
      template: input.template,
      theme: input.theme,
      createdAt: now,
      updatedAt: now,
    });

    return { card: normalizeVisitingCard(rows[0]!) };
  },
});

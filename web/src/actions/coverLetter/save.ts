import { defineAction } from 'astro:actions';
import { CoverLetterSaveSchema } from '../../lib/cover-letter-writer/schema';
import { coverLetterRepository } from './repositories';
import {
  createCoverLetterId,
  findCoverLetterOrThrow,
  normalizeCoverLetter,
  requireUser,
} from './utils';
import { and, eq } from 'astro:db';

export const save = defineAction({
  accept: 'json',
  input: CoverLetterSaveSchema,
  async handler(input, ctx) {
    const user = await requireUser(ctx);
    const now = new Date();
    if (input.id) {
      await findCoverLetterOrThrow(input.id, user.id);
      await coverLetterRepository.update(
        {
          title: input.title,
          templateKey: input.templateKey,
          tone: input.tone,
          content: input.content,
          updatedAt: now,
        },
        (table) => and(eq(table.id, input.id!), eq(table.userId, user.id)),
      );
      const rows = await coverLetterRepository.getData({
        where: (table) => and(eq(table.id, input.id!), eq(table.userId, user.id)),
        limit: 1,
      });
      return { letter: normalizeCoverLetter(rows[0]!) };
    }

    const id = createCoverLetterId();
    const inserted = await coverLetterRepository.insert({
      id,
      userId: user.id,
      title: input.title,
      templateKey: input.templateKey,
      tone: input.tone,
      content: input.content,
      createdAt: now,
      updatedAt: now,
    });
    return { letter: normalizeCoverLetter(inserted[0]!) };
  },
});

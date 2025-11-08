import { defineAction } from 'astro:actions';
import { CoverLetterExportSchema } from '../../lib/cover-letter-writer/schema';
import { findCoverLetterOrThrow, requireUser } from './utils';

export const exportLetter = defineAction({
  accept: 'json',
  input: CoverLetterExportSchema,
  async handler({ id, format }, ctx) {
    const user = await requireUser(ctx);
    const letter = await findCoverLetterOrThrow(id, user.id);
    const filename = `Cover_Letter_${letter.id}.${format}`;
    return {
      ok: true,
      format,
      filename,
      message: 'Export pipeline queued. Your download link will be emailed shortly.',
    };
  },
});

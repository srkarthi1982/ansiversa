import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { Buffer } from 'node:buffer';
import { db, CoverLetterExport } from 'astro:db';
import {
  requireUser,
  findCoverLetterOrThrow,
  normalizeCoverLetterRow,
  recordMetricEvent,
} from './utils';
import { renderCoverLetterMarkdown } from '../../lib/coverLetter/render/markdown';
import { renderCoverLetterPlainText } from '../../lib/coverLetter/render/text';
import { renderCoverLetterPdf } from '../../lib/coverLetter/render/pdf';
import { renderCoverLetterDocx } from '../../lib/coverLetter/render/docx';

const formatEnum = z.enum(['pdf', 'docx', 'md', 'txt']);

const filename = (role: string, company: string, extension: string) => {
  const date = new Date().toISOString().slice(0, 10);
  const safe = (value: string) =>
    value
      .trim()
      .replace(/[^a-z0-9]+/gi, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40) || 'Draft';
  const parts = ['CoverLetter', safe(role), safe(company), date].filter(Boolean);
  return `${parts.join('_')}.${extension}`;
};

export const exportLetter = defineAction({
  accept: 'json',
  input: z.object({
    id: z.string().uuid(),
    format: formatEnum,
  }),
  async handler(input, ctx) {
    const user = await requireUser(ctx);
    const plan = (user.plan as 'free' | 'pro' | 'elite' | undefined) ?? 'free';
    const existing = await findCoverLetterOrThrow(input.id, user.id);
    const letter = normalizeCoverLetterRow(existing);

    const format = input.format;
    const name = filename(letter.role, letter.company, format);

    let data: string | null = null;
    let mimeType = 'text/plain';
    let size: number | undefined;

    if (format === 'md') {
      data = renderCoverLetterMarkdown(letter);
      mimeType = 'text/markdown';
    } else if (format === 'txt') {
      data = renderCoverLetterPlainText(letter);
    } else if (format === 'pdf') {
      const pdfBytes = renderCoverLetterPdf(letter, {
        watermark: plan === 'free' ? 'Created with Ansiversa' : null,
      });
      data = Buffer.from(pdfBytes).toString('base64');
      size = pdfBytes.length;
      mimeType = 'application/pdf';
    } else if (format === 'docx') {
      const docxBytes = renderCoverLetterDocx(letter);
      data = Buffer.from(docxBytes).toString('base64');
      size = docxBytes.length;
      mimeType =
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    if (!data) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Unsupported export format.' });
    }

    if (format === 'md' || format === 'txt') {
      data = Buffer.from(data, 'utf8').toString('base64');
    }

    const exportId = crypto.randomUUID();
    await db.insert(CoverLetterExport).values({
      id: exportId,
      letterId: letter.id,
      format,
      filePath: name,
      createdAt: new Date(),
    });

    await recordMetricEvent(user.id, 'coverLetter.export', letter.id, { format, exportId });

    return {
      exportId,
      file: {
        filename: name,
        mimeType,
        data,
        size,
      },
      message: plan === 'free' && format === 'pdf' ? 'PDF includes a subtle watermark for Free plan.' : undefined,
    };
  },
});

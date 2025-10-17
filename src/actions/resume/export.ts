import { Buffer } from 'node:buffer';
import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { db, ResumeExport } from 'astro:db';
import { renderResumeToPdf } from '../../lib/resume/render/pdf';
import { renderResumeToDocx } from '../../lib/resume/render/docx';
import { renderResumeToMarkdown, renderResumeToHtml } from '../../lib/resume/render/text';
import { requireUser, findResumeOrThrow, normalizeResumeRow } from './utils';

type SupportedFormat = 'pdf' | 'docx' | 'md' | 'html';

const mimeByFormat: Record<SupportedFormat, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  md: 'text/markdown',
  html: 'text/html',
};

const sanitizeSegment = (input: string): string => {
  const base = input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
  return base || 'Resume';
};

const toBuffer = (value: ArrayBuffer | Uint8Array | string): Buffer => {
  if (typeof value === 'string') {
    return Buffer.from(value, 'utf8');
  }
  if (value instanceof ArrayBuffer) {
    return Buffer.from(value);
  }
  if (ArrayBuffer.isView(value)) {
    return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
  }
  return Buffer.from(value as Uint8Array);
};

export const exportResume = defineAction({
  accept: 'json',
  input: z.object({
    id: z.string().uuid(),
    format: z.enum(['pdf', 'docx', 'md', 'html']).default('pdf'),
    templateKey: z.string().optional(),
  }),
  async handler({ id, format, templateKey }, ctx) {
    const user = await requireUser(ctx);
    const plan = (user.plan as 'free' | 'pro' | 'elite' | undefined) ?? 'free';
    const row = await findResumeOrThrow(id, user.id);
    const resume = normalizeResumeRow(row);

    const chosenTemplate = templateKey ?? resume.templateKey ?? 'modern';
    const nameSegment = sanitizeSegment(resume.data.basics.fullName || resume.title || 'Resume');
    const templateSegment = sanitizeSegment(chosenTemplate);
    const dateSegment = new Date().toISOString().split('T')[0];
    const filename = `Resume_${nameSegment}_${templateSegment}_${dateSegment}.${format}`;

    let fileData: Buffer;
    const mimeType = mimeByFormat[format];

    const includeWatermark = plan === 'free' && format === 'pdf';

    try {
      if (format === 'pdf') {
        const binary = await renderResumeToPdf(resume, {
          watermark: includeWatermark ? 'Ansiversa Free Plan' : undefined,
        });
        fileData = toBuffer(binary);
      } else if (format === 'docx') {
        const binary = await renderResumeToDocx(resume);
        fileData = toBuffer(binary);
      } else if (format === 'md') {
        fileData = toBuffer(renderResumeToMarkdown(resume));
      } else if (format === 'html') {
        fileData = toBuffer(renderResumeToHtml(resume));
      } else {
        throw new ActionError({ code: 'BAD_REQUEST', message: 'Unsupported export format.' });
      }
    } catch (error) {
      console.error('Resume export failed', error);
      throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'Unable to generate export.' });
    }

    const exportId = crypto.randomUUID();
    await db.insert(ResumeExport).values({
      id: exportId,
      resumeId: id,
      format,
      filePath: `inline:${filename}`,
    });

    const message = includeWatermark
      ? 'Export generated with Ansiversa watermark. Upgrade to remove it.'
      : 'Export generated successfully.';

    return {
      ok: true,
      exportId,
      file: {
        filename,
        mimeType,
        size: fileData.byteLength,
        data: fileData.toString('base64'),
      },
      message,
    };
  },
});

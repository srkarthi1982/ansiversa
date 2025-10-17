import { Buffer } from 'node:buffer';
import { buildCoverLetterRenderModel } from './helpers';
import type { CoverLetterDocument } from '../schema';

const escapePdfText = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const chunkLines = (lines: Array<{ text: string; size?: number }>, maxLinesPerPage = 42) => {
  const pages: Array<Array<{ text: string; size?: number }>> = [];
  for (let i = 0; i < lines.length; i += maxLinesPerPage) {
    pages.push(lines.slice(i, i + maxLinesPerPage));
  }
  return pages.length > 0 ? pages : [[]];
};

const buildLines = (document: CoverLetterDocument): Array<{ text: string; size?: number }> => {
  const render = buildCoverLetterRenderModel(document);
  const lines: Array<{ text: string; size?: number }> = [];

  const push = (text: string, size = 12) => {
    lines.push({ text, size });
  };

  push(render.title || 'Cover Letter', 18);
  lines.push({ text: '', size: 12 });
  push(render.recipientLine, 12);
  lines.push({ text: '', size: 12 });

  render.paragraphs.forEach((paragraph) => {
    paragraph.split(/\n+/).forEach((line) => push(line, 12));
    lines.push({ text: '', size: 12 });
  });

  push(render.closing, 12);
  render.signature.split('\n').forEach((line) => push(line, 12));

  return lines;
};

const buildPageStream = (
  lines: Array<{ text: string; size?: number }>,
  options: { watermark?: string | null } = {},
): string => {
  const commands: string[] = [];

  if (options.watermark) {
    commands.push('BT');
    commands.push('/F1 58 Tf');
    commands.push('0.9 g');
    commands.push('1 0 0 1 120 420 Tm');
    commands.push(`(${escapePdfText(options.watermark)}) Tj`);
    commands.push('ET');
    commands.push('0 g');
  }

  commands.push('BT');
  commands.push('1 0 0 1 72 760 Tm');
  commands.push('16 TL');
  commands.push('/F1 12 Tf');
  let currentSize = 12;

  lines.forEach((line, index) => {
    const size = line.size ?? 12;
    if (size !== currentSize) {
      commands.push(`/F1 ${size} Tf`);
      currentSize = size;
    }
    const text = line.text ? escapePdfText(line.text) : ' ';
    commands.push(`(${text}) Tj`);
    if (index < lines.length - 1) {
      commands.push('T*');
    }
  });

  commands.push('ET');
  return commands.join('\n');
};

const buildPdfDocument = (pages: string[]): Uint8Array => {
  const objects: Record<number, string> = {};
  const addObject = (id: number, content: string) => {
    objects[id] = `${id} 0 obj\n${content}\nendobj`;
  };

  addObject(1, '<</Type /Catalog /Pages 2 0 R>>');
  addObject(2, `<</Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 2} 0 R`).join(' ')}] /Count ${
    pages.length
  }>>`);

  pages.forEach((page, index) => {
    const contentId = 4 + index * 2;
    const contentStream = Buffer.from(page, 'utf8');
    addObject(3 + index * 2, `<</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentId} 0 R /Resources <</Font <</F1  ${
      3 + pages.length * 2
    } 0 R>>>>`);
    addObject(contentId, `<</Length ${contentStream.length}>>\nstream\n${page}\nendstream`);
  });

  addObject(3 + pages.length * 2, '<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>');

  const offsets: number[] = [];
  let position = 0;
  const chunks: Buffer[] = [];

  const writeChunk = (chunk: string | Buffer) => {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, 'utf8');
    chunks.push(buffer);
    position += buffer.length;
  };

  writeChunk('%PDF-1.4\n');
  Object.keys(objects)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((id) => {
      offsets[id] = position;
      writeChunk(`${objects[id]}\n`);
    });

  const xrefOffset = position;
  writeChunk(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`);
  Object.keys(objects)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((id) => {
      const offset = offsets[id] ?? 0;
      writeChunk(`${offset.toString().padStart(10, '0')} 00000 n \n`);
    });
  writeChunk(`trailer\n<</Size ${objects.length + 1} /Root 1 0 R>>\nstartxref\n${xrefOffset}\n%%EOF`);

  return Buffer.concat(chunks);
};

export const renderCoverLetterPdf = (
  document: CoverLetterDocument,
  options: { watermark?: string | null } = {},
): Uint8Array => {
  const lines = buildLines(document);
  const pages = chunkLines(lines).map((pageLines) => buildPageStream(pageLines, options));
  return buildPdfDocument(pages);
};

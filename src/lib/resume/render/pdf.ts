import { Buffer } from 'node:buffer';
import type { ResumeDocument } from '../schema';
import { buildRenderModel } from './helpers';

const escapePdfText = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

type PdfLine = {
  text: string;
  size: number;
};

type PdfRenderOptions = {
  watermark?: string | null;
};

const chunkLines = (lines: PdfLine[], maxLinesPerPage = 40): PdfLine[][] => {
  const pages: PdfLine[][] = [];
  for (let i = 0; i < lines.length; i += maxLinesPerPage) {
    pages.push(lines.slice(i, i + maxLinesPerPage));
  }
  return pages.length > 0 ? pages : [[]];
};

const buildPdfLines = (document: ResumeDocument): PdfLine[] => {
  const render = buildRenderModel(document);
  const lines: PdfLine[] = [];

  const push = (text: string, size = 12) => {
    lines.push({ text, size });
  };

  push(render.fullName || 'Untitled Resume', 18);
  if (render.title) {
    push(render.title, 12);
  }
  if (render.contactLine) {
    push(render.contactLine, 11);
  }
  lines.push({ text: '', size: 12 });

  if (render.summary) {
    push('Summary', 14);
    push(render.summary, 11);
    lines.push({ text: '', size: 12 });
  }

  if (render.experiences.length > 0) {
    push('Experience', 14);
    render.experiences.forEach((experience) => {
      const headingParts = [experience.heading, experience.organization, experience.location]
        .filter(Boolean)
        .join(' · ');
      push(headingParts || 'Role', 12);
      if (experience.timeframe) {
        push(experience.timeframe, 10);
      }
      experience.bullets.forEach((bullet) => push(`• ${bullet}`, 10));
      lines.push({ text: '', size: 12 });
    });
  }

  if (render.skills.length > 0) {
    push('Skills', 14);
    push(render.skills.join(', '), 10);
    lines.push({ text: '', size: 12 });
  }

  if (render.educations.length > 0) {
    push('Education', 14);
    render.educations.forEach((education) => {
      const headingParts = [education.heading, education.institution]
        .filter(Boolean)
        .join(' · ');
      push(headingParts || 'Education', 12);
      if (education.timeframe) {
        push(education.timeframe, 10);
      }
      education.details.forEach((detail) => push(`• ${detail}`, 10));
      lines.push({ text: '', size: 12 });
    });
  }

  if (render.projects.length > 0) {
    push('Projects', 14);
    render.projects.forEach((project) => {
      push(project.heading || 'Project', 12);
      if (project.description) {
        push(project.description, 10);
      }
      if (project.url) {
        push(project.url, 10);
      }
      lines.push({ text: '', size: 12 });
    });
  }

  if (render.certificates.length > 0) {
    push('Certificates', 14);
    render.certificates.forEach((certificate) => {
      const line = [certificate.heading, certificate.issuer, certificate.year]
        .filter(Boolean)
        .join(' · ');
      push(line, 10);
      if (certificate.url) {
        push(certificate.url, 10);
      }
    });
    lines.push({ text: '', size: 12 });
  }

  if (render.links.length > 0) {
    push('Links', 14);
    render.links.forEach((link) => {
      push(`${link.label}: ${link.url}`, 10);
    });
  }

  return lines;
};

const buildPageStream = (lines: PdfLine[], options: PdfRenderOptions = {}): string => {
  const commands: string[] = [];

  if (options.watermark) {
    commands.push('BT');
    commands.push('/F1 60 Tf');
    commands.push('0.85 g');
    commands.push('1 0 0 1 120 420 Tm');
    commands.push(`(${escapePdfText(options.watermark)}) Tj`);
    commands.push('ET');
    commands.push('0 g');
  }

  commands.push('BT');
  commands.push('1 0 0 1 50 760 Tm');
  commands.push('16 TL');

  commands.push('/F1 12 Tf');
  let currentFontSize = 12;
  lines.forEach((line, index) => {
    const size = line.size || 12;
    if (size !== currentFontSize) {
      commands.push(`/F1 ${size} Tf`);
      currentFontSize = size;
    }
    const text = line.text ? escapePdfText(line.text) : ' ';
    commands.push(`(${text}) Tj`);
    if (index < lines.length - 1) {
      commands.push('T*');
    }
  });

  commands.push('ET');
  const content = commands.join('\n');
  return content;
};

const buildPdfDocument = (pages: string[]): Uint8Array => {
  const objects: Record<number, string> = {};
  let currentId = 0;
  const nextId = () => {
    currentId += 1;
    return currentId;
  };

  const catalogId = nextId();
  const pagesId = nextId();
  const fontId = nextId();

  const pageIds: number[] = [];
  const contentIds: number[] = [];

  pages.forEach((content) => {
    const stream = `<< /Length ${Buffer.byteLength(content, 'utf8')} >>\nstream\n${content}\nendstream`;
    const contentId = nextId();
    objects[contentId] = stream;
    contentIds.push(contentId);

    const pageId = nextId();
    objects[pageId] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents [${contentId} 0 R] >>`;
    pageIds.push(pageId);
  });

  objects[fontId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Name /F1 >>';
  objects[pagesId] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
  objects[catalogId] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;

  let body = '';
  const offsets: number[] = [0];
  let offset = 0;

  for (let id = 1; id <= currentId; id += 1) {
    const object = `${id} 0 obj\n${objects[id]}\nendobj\n`;
    offsets.push(offset);
    body += object;
    offset += Buffer.byteLength(object, 'utf8');
  }

  const header = '%PDF-1.4\n';
  const xrefOffset = Buffer.byteLength(header + body, 'utf8');

  let xref = `xref\n0 ${currentId + 1}\n`;
  xref += '0000000000 65535 f \n';
  for (let id = 1; id <= currentId; id += 1) {
    const position = String(offsets[id]).padStart(10, '0');
    xref += `${position} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size ${currentId + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  const pdfString = header + body + xref + trailer;
  return new TextEncoder().encode(pdfString);
};

export async function renderResumeToPdf(
  document: ResumeDocument,
  options: PdfRenderOptions = {},
): Promise<Uint8Array> {
  const lines = buildPdfLines(document);
  const pages = chunkLines(lines);
  const pageStreams = pages.map((pageLines) => buildPageStream(pageLines, options));
  return buildPdfDocument(pageStreams);
}

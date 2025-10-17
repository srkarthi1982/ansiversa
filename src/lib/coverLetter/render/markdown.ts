import { buildCoverLetterRenderModel } from './helpers';
import type { CoverLetterDocument } from '../schema';

export const renderCoverLetterMarkdown = (document: CoverLetterDocument): string => {
  const render = buildCoverLetterRenderModel(document);
  const lines: string[] = [];

  lines.push(`# ${render.title}`);
  lines.push('');
  lines.push(render.recipientLine);
  lines.push('');
  render.paragraphs.forEach((paragraph) => {
    lines.push(paragraph);
    lines.push('');
  });
  lines.push(render.closing);
  lines.push('');
  lines.push(render.signature);

  return lines.join('\n').trim();
};

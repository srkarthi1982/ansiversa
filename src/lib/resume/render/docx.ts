import type { ResumeDocument } from '../schema';

export async function renderResumeToDocx(document: ResumeDocument): Promise<ArrayBuffer> {
  // TODO: Integrate docx package to map structured sections into paragraphs and lists.
  throw new Error('renderResumeToDocx is not implemented yet.');
}

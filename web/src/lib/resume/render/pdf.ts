import type { ResumeDocument } from '../schema';

export async function renderResumeToPdf(document: ResumeDocument): Promise<Uint8Array> {
  // TODO: Integrate headless Chromium or @react-pdf/renderer for high-fidelity output.
  throw new Error('renderResumeToPdf is not implemented yet.');
}

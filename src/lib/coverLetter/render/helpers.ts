import type { CoverLetterDocument, CoverLetterPrompts } from '../schema';

export type CoverLetterRenderModel = {
  title: string;
  recipientLine: string;
  tone: CoverLetterDocument['tone'];
  length: CoverLetterDocument['length'];
  paragraphs: string[];
  closing: string;
  signature: string;
};

const sanitize = (value: string): string => value.replace(/\s+/g, ' ').trim();

const buildParagraphs = (prompts: CoverLetterPrompts, body: string): string[] => {
  if (body && body.trim().length > 0) {
    return body
      .split(/\n{2,}/)
      .map((paragraph) => sanitize(paragraph))
      .filter(Boolean);
  }

  const paragraphs: string[] = [];

  if (prompts.introduction) {
    paragraphs.push(sanitize(prompts.introduction));
  }

  if (prompts.motivation) {
    paragraphs.push(sanitize(prompts.motivation));
  }

  if (prompts.valueProps.length > 0) {
    paragraphs.push(
      `Key strengths: ${prompts.valueProps
        .map((value) => sanitize(value))
        .filter(Boolean)
        .join(', ')}`,
    );
  }

  const achievementLines = prompts.achievements
    .map((achievement) => {
      const headline = sanitize(achievement.headline ?? '');
      const metric = sanitize(achievement.metric ?? '');
      const description = sanitize(achievement.description ?? '');
      const pieces = [headline, metric, description].filter(Boolean);
      return pieces.join(' — ');
    })
    .filter(Boolean);

  if (achievementLines.length > 0) {
    paragraphs.push(`Highlighted achievements: ${achievementLines.join('; ')}`);
  }

  if (prompts.closing) {
    paragraphs.push(sanitize(prompts.closing));
  }

  return paragraphs;
};

const deriveSignature = (document: CoverLetterDocument): string => {
  const title = sanitize(document.title ?? '');
  if (title && !/cover letter/i.test(title)) {
    return `Sincerely,\n${title}`;
  }

  const intro = sanitize(document.prompts?.introduction ?? '');
  const maybeName = intro.split(/[,\.]\s*/).find((segment) => segment.split(' ').length <= 4 && segment.length > 0);
  if (maybeName) {
    return `Sincerely,\n${maybeName}`;
  }

  return 'Sincerely,\nYour Name';
};

export const buildCoverLetterRenderModel = (document: CoverLetterDocument): CoverLetterRenderModel => {
  const prompts = document.prompts;
  const paragraphs = buildParagraphs(prompts, document.body);
  const company = sanitize(document.company ?? '');
  const role = sanitize(document.role ?? '');
  const recipientLine = document.greeting?.trim() ? sanitize(document.greeting) : 'Dear Hiring Manager';
  const closing = prompts.closing?.trim() ? sanitize(prompts.closing) : 'Thank you for your consideration.';
  const enhancedParagraphs = [...paragraphs];

  if (company || role) {
    enhancedParagraphs.unshift(
      [`I am excited to apply for the`, role || 'open role', company ? `at ${company}` : ''].filter(Boolean).join(' '),
    );
  }

  return {
    title: document.title?.trim() || 'Untitled cover letter',
    recipientLine,
    tone: document.tone,
    length: document.length,
    paragraphs: enhancedParagraphs.length > 0 ? enhancedParagraphs : ['Start composing your story by filling the prompts.'],
    closing,
    signature: deriveSignature(document),
  };
};

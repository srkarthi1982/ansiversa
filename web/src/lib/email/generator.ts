import { sentenceCase } from '../text';
import {
  type EmailFormality,
  type EmailRewriteMode,
  type EmailTone,
  type EmailTranslateTarget,
  defaultEmailVariables,
  supportedLanguages,
} from './schema';

const politeOpeners: Record<EmailTone, string> = {
  professional: 'I hope this message finds you well.',
  friendly: 'Hope you are doing well!',
  concise: 'Sharing a quick update.',
  assertive: 'I want to move this forward promptly.',
  empathetic: 'I appreciate your time and consideration.',
};

const closingStatements: Record<EmailTone, string> = {
  professional: 'Please let me know if you have any questions.',
  friendly: 'Let me know how this sounds on your side!',
  concise: 'Happy to confirm next steps.',
  assertive: 'Looking forward to your confirmation.',
  empathetic: 'Thanks again for your support.',
};

const formalitySignOff: Record<EmailFormality, string> = {
  low: 'Cheers,',
  medium: 'Best regards,',
  high: 'Sincerely,',
};

const fillerWords = [
  'just',
  'really',
  'very',
  'actually',
  'literally',
  'kind of',
  'sort of',
  'a little',
  'maybe',
  'perhaps',
];

const politePhrases = [
  'please',
  'would you mind',
  'when convenient',
  'thank you',
  'appreciate',
  'happy to',
];

const emphasizeClarity = (text: string) =>
  text
    .replace(/\bETA\b/gi, 'estimated timeline')
    .replace(/\bFYI\b/gi, 'for your information')
    .replace(/\bASAP\b/gi, 'as soon as possible');

const normalizeParagraph = (paragraph: string) => {
  const trimmed = paragraph.trim();
  if (!trimmed) return '';
  const cleaned = trimmed.replace(/\s+/g, ' ');
  const withSentenceCase = sentenceCase(cleaned);
  return /[.!?]$/.test(withSentenceCase) ? withSentenceCase : `${withSentenceCase}.`;
};

const removeFillerWords = (text: string) =>
  fillerWords.reduce((acc, word) => acc.replace(new RegExp(`\\b${word}\\b`, 'gi'), ''), text).replace(/\s+/g, ' ');

const addPoliteness = (text: string) => {
  if (politePhrases.some((phrase) => text.toLowerCase().includes(phrase))) {
    return text;
  }
  return `${text} Thank you for your time.`.trim();
};

const ensureSubjectFromBody = (body: string) => {
  const firstSentence = body.split(/(?<=[.!?])\s+/)[0] ?? '';
  if (!firstSentence) {
    return 'Quick update';
  }
  const cleaned = firstSentence.replace(/^(hi|hello|dear)\s+[\w-]+,?\s*/i, '').trim();
  const subject = cleaned.length > 6 ? cleaned : 'Quick update';
  return subject.length > 120 ? `${subject.slice(0, 117)}...` : subject;
};

export type PolishOptions = {
  text: string;
  tone: EmailTone;
  formality: EmailFormality;
  language: string;
  needSubject?: boolean;
  signature?: string | null;
};

export const generatePolishedEmail = ({ text, tone, formality, needSubject, signature }: PolishOptions) => {
  const paragraphs = text.split(/\n{2,}/);
  const polishedParagraphs = paragraphs
    .map((paragraph, index) => {
      const normalized = normalizeParagraph(paragraph);
      if (index === 0 && normalized) {
        return `${politeOpeners[tone]} ${normalized}`.trim();
      }
      return normalized;
    })
    .filter(Boolean);

  if (polishedParagraphs.length === 0) {
    polishedParagraphs.push(politeOpeners[tone]);
  }

  const body = `${polishedParagraphs.join('\n\n')}\n\n${closingStatements[tone]}\n\n${formalitySignOff[formality]}`.trim();
  const withSignature = signature ? `${body}\n${signature}` : body;

  return {
    text: withSignature,
    subject: needSubject ? ensureSubjectFromBody(withSignature) : undefined,
  };
};

type RewriteOptions = {
  text: string;
  mode: EmailRewriteMode;
  tone: EmailTone;
  language: string;
};

export const rewriteEmail = ({ text, mode, tone }: RewriteOptions) => {
  const normalized = normalizeParagraph(text);

  switch (mode) {
    case 'shorten':
      return removeFillerWords(normalized).trim();
    case 'expand':
      return `${normalized} Additionally, I am happy to clarify any detail or provide supporting context if needed.`;
    case 'polite':
      return addPoliteness(`${politeOpeners[tone]} ${normalized}`.trim());
    case 'clarify':
      return emphasizeClarity(normalized);
    case 'grammar':
    default:
      return normalized;
  }
};

export type ReplyOptions = {
  incoming: string;
  tone: EmailTone;
  variants: number;
  relationship: 'new' | 'existing';
  urgency: 'low' | 'normal' | 'high';
};

const relationshipPhrases: Record<'new' | 'existing', string> = {
  new: 'I appreciate you reaching out and introducing the opportunity.',
  existing: 'Thanks for the continued collaboration and trust.',
};

const urgencyClosers: Record<'low' | 'normal' | 'high', string> = {
  low: 'Feel free to reply when convenient.',
  normal: 'Let me know how this sounds.',
  high: 'Please let me know if we can align today so we keep momentum.',
};

export const generateReplyVariants = ({ incoming, tone, variants, relationship, urgency }: ReplyOptions) => {
  const baseSummary = summarizeThread({ thread: incoming, focus: ['bullets'] }).bullets.join(' ');
  const bodies = Array.from({ length: Math.min(Math.max(variants, 1), 5) }, (_, index) => {
    const variantTone = tone;
    const opener = politeOpeners[variantTone];
    const body = `${opener} ${relationshipPhrases[relationship]} ${baseSummary ||
      'I wanted to follow up with a quick response.'}`.trim();
    const variantNote = index === 0 ? '' : `\n\nVariant ${index + 1}: Tailored suggestion.`;
    return {
      subject: ensureSubjectFromBody(body),
      body: `${body}\n\n${urgencyClosers[urgency]}${variantNote}`.trim(),
    };
  });

  return bodies;
};

export type SummarizeOptions = {
  thread: string;
  focus?: Array<'action_items' | 'open_questions' | 'bullets'>;
};

export const summarizeThread = ({ thread, focus = ['bullets', 'action_items'] }: SummarizeOptions) => {
  const lines = thread
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const bullets = lines.slice(0, 5).map((line) => sentenceCase(line).replace(/\s+/g, ' '));
  const actionItems = bullets
    .filter((line) => /\b(please|need|action|required|due)\b/i.test(line))
    .map((line, index) => ({
      id: `action-${index}`,
      task: line,
      owner: /@([\w.-]+)/.exec(line)?.[1] ?? null,
      due: /\bby ([\w\s]+)\b/i.exec(line)?.[1] ?? null,
    }));
  const openQuestions = bullets.filter((line) => /\?$/.test(line));

  const summary = {
    bullets,
    actionItems,
    openQuestions,
  };

  return {
    bullets: focus.includes('bullets') ? summary.bullets : [],
    actionItems: focus.includes('action_items') ? summary.actionItems : [],
    openQuestions: focus.includes('open_questions') ? summary.openQuestions : [],
    suggestedSubject: ensureSubjectFromBody(bullets[0] ?? ''),
  };
};

type TranslateOptions = {
  text: string;
  target: EmailTranslateTarget;
  preserveTone?: boolean;
};

export const translateEmail = ({ text, target, preserveTone = true }: TranslateOptions) => {
  const languageLabel = supportedLanguages[target];
  const base = normalizeParagraph(text);
  const prefix = preserveTone ? 'Tone preserved' : 'Adapted for local nuance';
  return `${prefix} — ${languageLabel}: ${base}`;
};

type TemplateRenderOptions = {
  subject?: string | null;
  body: string;
  variables?: Record<string, string>;
  signature?: string | null;
};

export const renderTemplate = ({ subject, body, variables, signature }: TemplateRenderOptions) => {
  const merged = { ...defaultEmailVariables, ...(variables ?? {}) };
  const interpolate = (value: string | null | undefined) => {
    if (!value) return value ?? null;
    return value.replace(/\{([^}]+)\}/g, (_, key: string) => merged[key.trim()] ?? `{${key}}`);
  };

  const resolvedBody = interpolate(body) ?? '';
  const resolvedSubject = interpolate(subject ?? null);
  const finalBody = signature ? `${resolvedBody}\n\n${signature}`.trim() : resolvedBody.trim();

  return {
    subject: resolvedSubject ?? ensureSubjectFromBody(finalBody),
    body: finalBody,
  };
};

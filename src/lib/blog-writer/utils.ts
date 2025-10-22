import type { BlogOutlineNode, BlogPostRecord } from './schema';

const WORDS_PER_MINUTE = 200;

export const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

export const wordCountFromMarkdown = (content: string): number => {
  if (!content) return 0;
  const withoutCode = content.replace(/```[\s\S]*?```/g, ' ');
  const stripped = withoutCode.replace(/[#>*_`~\-\[\]()]/g, ' ');
  const words = stripped
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);
  return words.length;
};

export const estimateReadingMinutes = (wordCount: number): number => {
  if (!Number.isFinite(wordCount) || wordCount <= 0) return 0;
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
};

export const formatRelativeTime = (input?: string | null): string => {
  if (!input) return 'never';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return 'unknown';
  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute');
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 48) return rtf.format(diffHours, 'hour');
  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 90) return rtf.format(diffDays, 'day');
  const diffMonths = Math.round(diffDays / 30);
  return rtf.format(diffMonths, 'month');
};

export const formatDate = (input?: string | null): string => {
  if (!input) return '—';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const slugify = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const summarizeContent = (content: string, fallback = 'Draft summary pending.'): string => {
  if (!content) return fallback;
  const sentences = content
    .replace(/```[\s\S]*?```/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  return sentences.slice(0, 2).join(' ') || fallback;
};

export const outlineToHeadings = (outline: BlogOutlineNode[]): string[] => {
  const headings: string[] = [];
  const walk = (nodes: BlogOutlineNode[]) => {
    nodes.forEach((node) => {
      headings.push(node.title);
      if (node.children?.length) {
        walk(node.children);
      }
    });
  };
  walk(outline);
  return headings;
};

export const computePostStats = (post: BlogPostRecord) => {
  const wordCount = wordCountFromMarkdown(post.contentMd);
  return {
    wordCount,
    readingMinutes: estimateReadingMinutes(wordCount),
  };
};

export const describeTemplateDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced'): string => {
  switch (difficulty) {
    case 'beginner':
      return 'Friendly structure for quick publishing';
    case 'intermediate':
      return 'Balanced mix of storytelling and strategy';
    case 'advanced':
      return 'Data-heavy story that leans on deeper research';
    default:
      return 'Flexible structure';
  }
};

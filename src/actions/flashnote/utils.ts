import { ActionError } from 'astro:actions';
import { db, FlashNote, and, desc, eq, inArray } from 'astro:db';
import type { z } from 'astro:schema';
import { getSessionWithUser } from '../../utils/session.server';
import type { FlashNote as FlashNoteDTO } from '../../types/flashnote';
import {
  aiModeSchema,
  createInputSchema,
  deleteInputSchema,
  exportInputSchema,
  listInputSchema,
  noteIdSchema,
  reviewInputSchema,
  summariseInputSchema,
  updateInputSchema,
} from './schemas';

const { randomUUID } = await import('node:crypto');

export type FlashNoteRow = typeof FlashNote.$inferSelect;

const normalizeTags = (tags: unknown): string[] => {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((tag) => String(tag).trim())
    .filter((tag) => tag.length > 0)
    .slice(0, 12);
};

export const normalizeFlashNote = (row: FlashNoteRow): FlashNoteDTO => ({
  id: row.id,
  userId: row.userId,
  title: row.title,
  content: row.content,
  tags: normalizeTags(row.tags),
  summary: row.summary ?? null,
  createdAt: row.createdAt?.toISOString?.() ?? new Date().toISOString(),
  updatedAt: row.updatedAt?.toISOString?.() ?? new Date().toISOString(),
});

export const requireUser = async (
  ctx: { cookies: unknown },
  sessionId?: string | null,
) => {
  const session = await getSessionWithUser(ctx.cookies as any);
  if (session?.user) {
    return session.user;
  }
  if (sessionId) {
    return { id: sessionId } as { id: string };
  }
  throw new ActionError({ code: 'UNAUTHORIZED', message: 'Please sign in to manage notes.' });
};

export const ensureOwnership = async (id: string, userId: string) => {
  const rows = await db
    .select()
    .from(FlashNote)
    .where(and(eq(FlashNote.id, id), eq(FlashNote.userId, userId)))
    .limit(1);
  const note = rows[0];
  if (!note) {
    throw new ActionError({ code: 'NOT_FOUND', message: 'Flash note not found' });
  }
  return note;
};

export const listNotes = async (userId: string) => {
  const rows = await db
    .select()
    .from(FlashNote)
    .where(eq(FlashNote.userId, userId))
    .orderBy(desc(FlashNote.updatedAt));
  return rows.map(normalizeFlashNote);
};

const aiWindowMs = 60_000;
const aiLimit = 5;
const aiRequestLog = new Map<string, number[]>();

export const enforceAIRateLimit = (userId: string) => {
  const now = Date.now();
  const timestamps = aiRequestLog.get(userId) ?? [];
  const recent = timestamps.filter((ts) => now - ts < aiWindowMs);
  if (recent.length >= aiLimit) {
    const retryAfter = Math.ceil((aiWindowMs - (now - recent[0])) / 1000);
    throw new ActionError({
      code: 'TOO_MANY_REQUESTS',
      message: 'AI requests are temporarily limited. Please try again shortly.',
      retryAfter,
    });
  }
  recent.push(now);
  aiRequestLog.set(userId, recent);
};

const sentenceSplitter = (content: string) =>
  content
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => sentence.trim().length > 0);

const summariseSentences = (sentences: string[], maxSentences: number) =>
  sentences.slice(0, maxSentences).join(' ');

const simplifyContent = (content: string) => {
  const sentences = sentenceSplitter(content).map((sentence) =>
    sentence
      .replace(/\butilise\b/gi, 'use')
      .replace(/\bapproximately\b/gi, 'about')
      .replace(/\bmethodology\b/gi, 'method'),
  );
  return summariseSentences(sentences, Math.min(6, sentences.length));
};

const explainContent = (content: string) => {
  const sentences = sentenceSplitter(content);
  return sentences
    .map((sentence, index) => `${index + 1}. ${sentence.trim()}`)
    .join('\n');
};

const quizFromContent = (content: string) => {
  const sentences = sentenceSplitter(content);
  return sentences.slice(0, 4).map((sentence, index) => `Q${index + 1}: ${sentence.trim()}?`);
};

export const runAIMode = (
  mode: z.infer<typeof aiModeSchema>,
  content: string,
  promptOverride?: string,
) => {
  const source = (promptOverride?.trim() || content || '').trim();
  if (!source) {
    return 'Add content to your note to generate AI insights.';
  }
  switch (mode) {
    case 'summarising':
      return summariseSentences(sentenceSplitter(source), 3);
    case 'simplifying':
      return simplifyContent(source);
    case 'explaining':
      return explainContent(source);
    case 'quizzing':
      return quizFromContent(source).join('\n');
    default:
      return source;
  }
};

export const validateListInput = (input: unknown) => listInputSchema.parse(input);
export const validateCreateInput = (input: unknown) => createInputSchema.parse(input);
export const validateUpdateInput = (input: unknown) => updateInputSchema.parse(input);
export const validateDeleteInput = (input: unknown) => deleteInputSchema.parse(input);
export const validateSummariseInput = (input: unknown) => summariseInputSchema.parse(input);
export const validateReviewInput = (input: unknown) => reviewInputSchema.parse(input);
export const validateExportInput = (input: unknown) => exportInputSchema.parse(input);

export const createNoteRecord = async (
  userId: string,
  payload: z.infer<typeof createInputSchema>,
) => {
  const id = randomUUID();
  const now = new Date();
  await db.insert(FlashNote).values({
    id,
    userId,
    title: payload.title,
    content: payload.content,
    tags: payload.tags,
    summary: null,
    createdAt: now,
    updatedAt: now,
  });
  const rows = await db.select().from(FlashNote).where(eq(FlashNote.id, id)).limit(1);
  return normalizeFlashNote(rows[0]!);
};

export const updateNoteRecord = async (
  userId: string,
  payload: z.infer<typeof updateInputSchema>,
) => {
  const existing = await ensureOwnership(payload.id, userId);
  const updated = {
    title: payload.title ?? existing.title,
    content: payload.content ?? existing.content,
    tags: payload.tags ?? existing.tags,
    summary: payload.summary ?? existing.summary,
    updatedAt: new Date(),
  };
  await db
    .update(FlashNote)
    .set(updated)
    .where(and(eq(FlashNote.id, payload.id), eq(FlashNote.userId, userId)));
  const rows = await db.select().from(FlashNote).where(eq(FlashNote.id, payload.id)).limit(1);
  return normalizeFlashNote(rows[0]!);
};

export const deleteNoteRecord = async (userId: string, id: string) => {
  await ensureOwnership(id, userId);
  await db.delete(FlashNote).where(and(eq(FlashNote.id, id), eq(FlashNote.userId, userId)));
};

export const createReviewDeck = async (
  userId: string,
  options: z.infer<typeof reviewInputSchema>,
) => {
  const limit = options.limit ?? 20;
  const rows = await db
    .select()
    .from(FlashNote)
    .where(eq(FlashNote.userId, userId))
    .orderBy(desc(FlashNote.updatedAt))
    .limit(limit * 2);
  const notes = rows.map(normalizeFlashNote);
  const filtered = options.tag
    ? notes.filter((note) => note.tags.some((tag) => tag.toLowerCase() === options.tag!.toLowerCase()))
    : notes;
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit).map((note) => ({
    id: note.id,
    title: note.title,
    content: note.content,
    summary: note.summary,
    tags: note.tags,
  }));
};

const exportFormatters: Record<z.infer<typeof exportInputSchema>['format'], (notes: FlashNoteDTO[]) => string> = {
  markdown(notes) {
    return notes
      .map(
        (note) =>
          `# ${note.title}\n\n${note.content}\n\n**Tags:** ${note.tags.join(', ') || '—'}\n\n---`,
      )
      .join('\n\n');
  },
  txt(notes) {
    return notes
      .map(
        (note) =>
          `${note.title}\n${'-'.repeat(note.title.length)}\n${note.content}\nTags: ${note.tags.join(', ') || '—'}\n`,
      )
      .join('\n');
  },
  pdf(notes) {
    return exportFormatters.markdown(notes);
  },
};

export const createExportArtifact = async (
  userId: string,
  payload: z.infer<typeof exportInputSchema>,
) => {
  const rows = await db
    .select()
    .from(FlashNote)
    .where(and(eq(FlashNote.userId, userId), inArray(FlashNote.id, payload.noteIds)));

  const lookup = new Map(rows.map((row) => [row.id, normalizeFlashNote(row)]));
  const notes = payload.noteIds
    .map((id) => lookup.get(id))
    .filter((note): note is FlashNoteDTO => Boolean(note));

  if (notes.length === 0) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'No matching notes found for export.' });
  }

  const formatter = exportFormatters[payload.format];
  const content = formatter(notes);
  const mime = payload.format === 'pdf' ? 'application/pdf' : payload.format === 'markdown' ? 'text/markdown' : 'text/plain';
  const encoded = Buffer.from(content, 'utf8').toString('base64');
  const downloadUrl = `data:${mime};base64,${encoded}`;
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10).toISOString();

  return { downloadUrl, expiresAt };
};

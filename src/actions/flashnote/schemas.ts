import { z } from 'astro:schema';

export const noteIdSchema = z.string().min(1, 'Note id is required');

export const tagSchema = z
  .string()
  .trim()
  .min(1, 'Tag cannot be empty')
  .max(32, 'Tag must be 32 characters or fewer')
  .regex(/^[\w\s-]+$/, 'Only letters, numbers, spaces, underscores, and dashes are allowed');

export const tagsSchema = z.array(tagSchema).max(12, 'A note can have up to 12 tags');

export const noteContentSchema = z
  .string()
  .max(8000, 'Notes are limited to 8,000 characters');

export const noteTitleSchema = z
  .string()
  .trim()
  .min(1, 'Title is required')
  .max(120, 'Title must be 120 characters or fewer');

export const aiModeSchema = z.enum(['summarising', 'simplifying', 'explaining', 'quizzing']);

export const listInputSchema = z
  .object({
    sessionId: z.string().optional(),
  })
  .optional();

export const createInputSchema = z.object({
  sessionId: z.string().optional(),
  title: noteTitleSchema,
  content: noteContentSchema,
  tags: tagsSchema.default([]),
});

export const summarySchema = z.string().max(1200).optional();

export const updateInputSchema = z.object({
  sessionId: z.string().optional(),
  id: noteIdSchema,
  title: noteTitleSchema.optional(),
  content: noteContentSchema.optional(),
  tags: tagsSchema.optional(),
  summary: summarySchema,
});

export const deleteInputSchema = z.object({
  sessionId: z.string().optional(),
  id: noteIdSchema,
});

export const summariseInputSchema = z.object({
  sessionId: z.string().optional(),
  id: noteIdSchema,
  mode: aiModeSchema,
  promptOverride: z.string().max(400).optional(),
});

export const reviewInputSchema = z.object({
  sessionId: z.string().optional(),
  tag: tagSchema.optional(),
  limit: z.number().min(1).max(60).optional(),
});

export const exportInputSchema = z.object({
  sessionId: z.string().optional(),
  format: z.enum(['pdf', 'markdown', 'txt']),
  noteIds: z.array(noteIdSchema).min(1, 'Select at least one note to export'),
});

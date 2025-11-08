import { z } from 'astro:schema';

export const coverLetterTemplateKeys = ['formal', 'modern', 'minimalist'] as const;
export const coverLetterTones = ['formal', 'friendly', 'confident'] as const;

export type CoverLetterTemplateKey = (typeof coverLetterTemplateKeys)[number];
export type CoverLetterTone = (typeof coverLetterTones)[number];

export const coverLetterToneLabels: Record<CoverLetterTone, string> = {
  formal: 'Formal',
  friendly: 'Friendly',
  confident: 'Confident',
};

export const coverLetterTemplateLabels: Record<CoverLetterTemplateKey, string> = {
  formal: 'Classic Formal',
  modern: 'Modern Professional',
  minimalist: 'Minimalist Focused',
};

export const CoverLetterRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  title: z.string().min(1).max(140),
  templateKey: z.enum(coverLetterTemplateKeys),
  tone: z.enum(coverLetterTones),
  content: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CoverLetterRecord = z.infer<typeof CoverLetterRecordSchema>;

export const CoverLetterGenerationSchema = z.object({
  position: z.string().min(2).max(140),
  company: z.string().min(2).max(160),
  intro: z.string().max(600).optional(),
  skills: z.array(z.string().min(1).max(80)).max(12).default([]),
  achievements: z.array(z.string().min(1).max(200)).max(10).default([]),
  tone: z.enum(coverLetterTones).default('formal'),
  templateKey: z.enum(coverLetterTemplateKeys).default('formal'),
});

export const CoverLetterImproveSchema = z.object({
  content: z.string().min(20),
  focus: z.string().max(400).optional(),
  tone: z.enum(coverLetterTones).default('formal'),
});

export const CoverLetterToneSchema = z.object({
  content: z.string().min(20),
  tone: z.enum(coverLetterTones),
});

export const CoverLetterSaveSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(140),
  content: z.string().min(20),
  tone: z.enum(coverLetterTones),
  templateKey: z.enum(coverLetterTemplateKeys),
});

export const CoverLetterExportSchema = z.object({
  id: z.string().uuid(),
  format: z.enum(['pdf', 'docx', 'txt']).default('pdf'),
});

export const coverLetterDefaults = () => ({
  position: '',
  company: '',
  intro: '',
  skills: [] as string[],
  achievements: [] as string[],
  tone: 'formal' as CoverLetterTone,
  templateKey: 'formal' as CoverLetterTemplateKey,
});

export const parseListInput = (value: string): string[] =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

import { z } from 'astro:schema';

export const coverLetterTemplates = ['minimal', 'classic', 'bold'] as const;
export const coverLetterTones = ['professional', 'confident', 'friendly'] as const;
export const coverLetterLengths = ['short', 'medium', 'long'] as const;
export const coverLetterStatuses = ['draft', 'final'] as const;

export const CoverLetterPromptsSchema = z.object({
  introduction: z.string().max(400).optional().or(z.literal('')).default(''),
  motivation: z.string().max(400).optional().or(z.literal('')).default(''),
  valueProps: z.array(z.string().max(160)).max(8).default([]),
  achievements: z
    .array(
      z
        .object({
          headline: z.string().max(120).optional().or(z.literal('')).default(''),
          metric: z.string().max(80).optional().or(z.literal('')).default(''),
          description: z.string().max(220).optional().or(z.literal('')).default(''),
        })
        .default({ headline: '', metric: '', description: '' }),
    )
    .max(6)
    .default([]),
  closing: z.string().max(320).optional().or(z.literal('')).default(''),
});

export const CoverLetterDocumentSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  title: z.string().min(1).max(180),
  role: z.string().max(160).default(''),
  company: z.string().max(160).default(''),
  greeting: z.string().max(160).default(''),
  tone: z.enum(coverLetterTones).default('professional'),
  length: z.enum(coverLetterLengths).default('medium'),
  templateKey: z.enum(coverLetterTemplates).default('minimal'),
  prompts: CoverLetterPromptsSchema,
  body: z.string().default(''),
  status: z.enum(coverLetterStatuses).default('draft'),
  lastSavedAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime().nullable().optional(),
});

export type CoverLetterPrompts = z.infer<typeof CoverLetterPromptsSchema>;
export type CoverLetterDocument = z.infer<typeof CoverLetterDocumentSchema>;

export const createEmptyPrompts = (): CoverLetterPrompts => ({
  introduction: '',
  motivation: '',
  valueProps: [],
  achievements: [],
  closing: '',
});

export const createBlankCoverLetter = (
  input: Partial<CoverLetterDocument> & { id?: string; userId?: string } = {},
): CoverLetterDocument => {
  const base: CoverLetterDocument = {
    id: input.id ?? crypto.randomUUID(),
    userId: input.userId ?? 'anonymous',
    title: input.title?.trim() || 'Untitled cover letter',
    role: input.role ?? '',
    company: input.company ?? '',
    greeting: input.greeting ?? '',
    tone: input.tone ?? 'professional',
    length: input.length ?? 'medium',
    templateKey: input.templateKey ?? 'minimal',
    prompts: input.prompts ? CoverLetterPromptsSchema.parse(input.prompts) : createEmptyPrompts(),
    body: input.body ?? '',
    status: input.status ?? 'draft',
    lastSavedAt: input.lastSavedAt ?? new Date().toISOString(),
    createdAt: input.createdAt ?? new Date().toISOString(),
  };

  return CoverLetterDocumentSchema.parse(base);
};

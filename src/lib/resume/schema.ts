import { z } from 'astro:schema';

export const resumeTemplateKeys = ['modern', 'classic', 'minimal', 'creative'] as const;
export const resumeLocales = ['en', 'ar', 'ta'] as const;
export const resumeStatuses = ['draft', 'final'] as const;
export const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'] as const;

const emptyStringAllowed = (schema: z.ZodString) => schema.or(z.literal('')).default('');

export const ResumeBasicsSchema = z.object({
  fullName: emptyStringAllowed(z.string().max(120)),
  title: emptyStringAllowed(z.string().max(120)),
  email: emptyStringAllowed(z.string().email('Enter a valid email')),
  phone: emptyStringAllowed(z.string().max(40)),
  location: emptyStringAllowed(z.string().max(120)),
});

export const ResumeExperienceSchema = z.object({
  id: z.string().uuid().optional(),
  company: z.string().max(160).optional().or(z.literal('')),
  position: z.string().max(160).optional().or(z.literal('')),
  location: z.string().max(120).optional().or(z.literal('')),
  start: z.string().max(10).optional().or(z.literal('')),
  end: z.string().max(10).nullable().optional(),
  current: z.boolean().optional().default(false),
  description: z.string().max(220).optional().or(z.literal('')),
});

export const ResumeEducationSchema = z.object({
  id: z.string().uuid().optional(),
  school: z.string().max(160).optional().or(z.literal('')),
  degree: z.string().max(160).optional().or(z.literal('')),
  field: z.string().max(160).optional().or(z.literal('')),
  start: z.string().max(10).optional().or(z.literal('')),
  end: z.string().max(10).optional().or(z.literal('')),
  description: z.string().max(220).optional().or(z.literal('')),
});

export const ResumeProjectSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().max(160).optional().or(z.literal('')),
  description: z.string().max(220).optional().or(z.literal('')),
  url: z.string().url().optional().or(z.literal('')),
});

export const ResumeCertificateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().max(160).optional().or(z.literal('')),
  issuer: z.string().max(160).optional().or(z.literal('')),
  year: z.string().max(10).optional().or(z.literal('')),
  url: z.string().url().optional().or(z.literal('')),
});

export const ResumeLinkSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().max(80).optional().or(z.literal('')),
  url: z.string().url('Enter a valid URL'),
});

export const ResumeSkillSchema = z.object({
  name: z.string().min(1).max(60),
  level: z.enum(skillLevels).default('intermediate'),
});

export const ResumeDataSchema = z.object({
  basics: ResumeBasicsSchema,
  summary: z.string().max(1200).optional().or(z.literal('')),
  experience: z.array(ResumeExperienceSchema).max(20).default([]),
  education: z.array(ResumeEducationSchema).max(20).default([]),
  skills: z.array(ResumeSkillSchema).max(30).default([]),
  projects: z.array(ResumeProjectSchema).max(20).default([]),
  certificates: z.array(ResumeCertificateSchema).max(20).default([]),
  links: z.array(ResumeLinkSchema).max(20).default([]),
});

export const ResumeDocumentSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  title: z.string().min(1).max(180),
  templateKey: z.enum(resumeTemplateKeys).default('modern'),
  locale: z.enum(resumeLocales).default('en'),
  status: z.enum(resumeStatuses).default('draft'),
  data: ResumeDataSchema,
  lastSavedAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime().nullable().optional(),
  isDefault: z.boolean().optional().default(false),
});

export type ResumeBasics = z.infer<typeof ResumeBasicsSchema>;
export type ResumeExperience = z.infer<typeof ResumeExperienceSchema>;
export type ResumeEducation = z.infer<typeof ResumeEducationSchema>;
export type ResumeProject = z.infer<typeof ResumeProjectSchema>;
export type ResumeCertificate = z.infer<typeof ResumeCertificateSchema>;
export type ResumeSkill = z.infer<typeof ResumeSkillSchema>;
export type ResumeLink = z.infer<typeof ResumeLinkSchema>;
export type ResumeData = z.infer<typeof ResumeDataSchema>;
export type ResumeDocument = z.infer<typeof ResumeDocumentSchema>;

const emptyBasics: ResumeBasics = {
  fullName: '',
  title: '',
  email: '',
  phone: '',
  location: '',
};

export const createEmptyResumeData = (): ResumeData => ({
  basics: { ...emptyBasics },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certificates: [],
  links: [],
});

export const createBlankResumeDocument = (input: Partial<ResumeDocument> = {}): ResumeDocument => {
  const base: ResumeDocument = {
    id: input.id ?? crypto.randomUUID(),
    userId: input.userId ?? 'anonymous',
    title: input.title?.trim() || 'Untitled resume',
    templateKey: input.templateKey ?? 'modern',
    locale: input.locale ?? 'en',
    status: input.status ?? 'draft',
    data: input.data ? ResumeDataSchema.parse(input.data) : createEmptyResumeData(),
    lastSavedAt: input.lastSavedAt ?? new Date().toISOString(),
    createdAt: input.createdAt ?? new Date().toISOString(),
    isDefault: input.isDefault ?? false,
  };

  return ResumeDocumentSchema.parse(base);
};

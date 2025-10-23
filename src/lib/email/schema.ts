import { z } from 'astro:schema';

export const emailToneOptions = ['professional', 'friendly', 'concise', 'assertive', 'empathetic'] as const;
export const emailFormalityLevels = ['low', 'medium', 'high'] as const;
export const emailRewriteModes = ['shorten', 'expand', 'polite', 'clarify', 'grammar'] as const;
export const emailTranslateTargets = ['en', 'ar', 'hi', 'ta', 'es', 'fr', 'de'] as const;
export const emailStatuses = ['draft', 'final'] as const;

export const emailTemplateCategories = [
  'Outreach',
  'Follow-up',
  'Status Update',
  'Apology',
  'Introduction',
  'Networking',
  'Sales',
  'Customer Success',
] as const;

export const emailRelationshipOptions = ['new', 'existing'] as const;
export const emailUrgencyOptions = ['low', 'normal', 'high'] as const;

export const EmailVariablesSchema = z
  .record(z.string(), z.string().max(240))
  .transform((value) => Object.fromEntries(Object.entries(value).map(([key, val]) => [key.trim(), val.trim()])));

export const EmailDraftSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  title: z.string().min(1).max(180),
  status: z.enum(emailStatuses).default('draft'),
  subject: z.string().max(120).optional().nullable(),
  input: z.string().max(20000).default(''),
  output: z.string().max(20000).default(''),
  tone: z.enum(emailToneOptions).default('professional'),
  formality: z.enum(emailFormalityLevels).default('medium'),
  language: z.string().default('en'),
  variables: EmailVariablesSchema.default({}),
  signatureEnabled: z.boolean().default(true),
  ephemeral: z.boolean().default(false),
  needSubject: z.boolean().default(false),
  plan: z.enum(['free', 'pro']).default('free'),
  lastSavedAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime().nullable().optional(),
});

export const EmailTemplateSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  name: z.string().min(1).max(160),
  category: z.enum(emailTemplateCategories).default('Outreach'),
  subject: z.string().max(120).optional().nullable(),
  body: z.string().max(20000),
  language: z.string().default('en'),
  isSystem: z.boolean().default(false),
  createdAt: z.string().datetime().nullable().optional(),
  updatedAt: z.string().datetime().nullable().optional(),
});

export const EmailSignatureSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  display: z.string().max(4000),
  enabled: z.boolean().default(true),
  createdAt: z.string().datetime().nullable().optional(),
  updatedAt: z.string().datetime().nullable().optional(),
});

export const EmailContactSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  firstName: z.string().max(80).optional().or(z.literal('')),
  lastName: z.string().max(80).optional().or(z.literal('')),
  company: z.string().max(120).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  role: z.string().max(120).optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
  createdAt: z.string().datetime().nullable().optional(),
});

export const EmailHistorySchema = z.object({
  id: z.string().uuid(),
  draftId: z.string().uuid(),
  action: z.enum(['polish', 'rewrite', 'reply', 'translate', 'summarize']),
  inputSize: z.number().int().nonnegative(),
  outputSize: z.number().int().nonnegative(),
  cost: z.number().nonnegative().optional(),
  createdAt: z.string().datetime().nullable().optional(),
});

export type EmailDraft = z.infer<typeof EmailDraftSchema>;
export type EmailTemplate = z.infer<typeof EmailTemplateSchema>;
export type EmailSignature = z.infer<typeof EmailSignatureSchema>;
export type EmailContact = z.infer<typeof EmailContactSchema>;
export type EmailHistory = z.infer<typeof EmailHistorySchema>;

export type EmailTone = (typeof emailToneOptions)[number];
export type EmailFormality = (typeof emailFormalityLevels)[number];
export type EmailRewriteMode = (typeof emailRewriteModes)[number];
export type EmailTranslateTarget = (typeof emailTranslateTargets)[number];
export type EmailTemplateCategory = (typeof emailTemplateCategories)[number];
export type EmailRelationship = (typeof emailRelationshipOptions)[number];
export type EmailUrgency = (typeof emailUrgencyOptions)[number];

export const defaultEmailVariables: Record<string, string> = {
  FirstName: 'Aisha',
  Company: 'Acme FZ-LLC',
  Role: 'Product Manager',
  MyName: 'Karthik',
  MyTitle: 'Founder, Ansiversa',
  MyPhone: '+971-000-0000',
  MyLink: 'https://ansiversa.com',
};

export const createBlankDraft = (input: Partial<EmailDraft> = {}): EmailDraft => {
  const base: EmailDraft = {
    id: input.id ?? crypto.randomUUID(),
    userId: input.userId ?? 'anonymous',
    title: input.title?.trim() || 'Untitled email',
    status: input.status ?? 'draft',
    subject: input.subject ?? null,
    input: input.input ?? '',
    output: input.output ?? '',
    tone: input.tone ?? 'professional',
    formality: input.formality ?? 'medium',
    language: input.language ?? 'en',
    variables: { ...defaultEmailVariables, ...(input.variables ?? {}) },
    signatureEnabled: input.signatureEnabled ?? true,
    ephemeral: input.ephemeral ?? false,
    needSubject: input.needSubject ?? true,
    plan: input.plan ?? 'free',
    lastSavedAt: input.lastSavedAt ?? new Date().toISOString(),
    createdAt: input.createdAt ?? new Date().toISOString(),
  };

  return EmailDraftSchema.parse(base);
};

export const createTemplate = (input: Partial<EmailTemplate>): EmailTemplate => {
  const base: EmailTemplate = {
    id: input.id ?? crypto.randomUUID(),
    userId: input.userId ?? 'anonymous',
    name: input.name ?? 'Untitled template',
    category: input.category ?? 'Outreach',
    subject: input.subject ?? null,
    body: input.body ?? 'Hello {FirstName},\n\nHope you are well.',
    language: input.language ?? 'en',
    isSystem: input.isSystem ?? false,
    createdAt: input.createdAt ?? new Date().toISOString(),
    updatedAt: input.updatedAt ?? new Date().toISOString(),
  };

  return EmailTemplateSchema.parse(base);
};

export const createSignature = (input: Partial<EmailSignature>): EmailSignature => {
  const base: EmailSignature = {
    id: input.id ?? crypto.randomUUID(),
    userId: input.userId ?? 'anonymous',
    display:
      input.display ??
      'Best regards,\nKarthik Narayan\nFounder, Ansiversa\ncontact@ansiversa.com\nhttps://ansiversa.com',
    enabled: input.enabled ?? true,
    createdAt: input.createdAt ?? new Date().toISOString(),
    updatedAt: input.updatedAt ?? new Date().toISOString(),
  };

  return EmailSignatureSchema.parse(base);
};

export const supportedLanguages: Record<EmailTranslateTarget, string> = {
  en: 'English',
  ar: 'Arabic',
  hi: 'Hindi',
  ta: 'Tamil',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
};

export const toneLabels: Record<EmailTone, string> = {
  professional: 'Professional',
  friendly: 'Friendly',
  concise: 'Concise',
  assertive: 'Assertive',
  empathetic: 'Empathetic',
};

export const formalityLabels: Record<EmailFormality, string> = {
  low: 'Casual',
  medium: 'Balanced',
  high: 'Formal',
};

import { z } from 'astro:schema';

export const visitingCardTemplates = [
  {
    key: 'minimal',
    name: 'Minimal Serif',
    description: 'Clean typographic layout with confident serif headings.',
    badge: 'Top pick',
    accent: 'from-slate-900 via-slate-700 to-indigo-600',
  },
  {
    key: 'horizon',
    name: 'Horizon Split',
    description: 'Bold horizontal split with contrasting brand bar.',
    badge: 'Bold',
    accent: 'from-indigo-600 via-sky-500 to-emerald-500',
  },
  {
    key: 'elevate',
    name: 'Elevate Card',
    description: 'Vertical accent bar for creative professionals.',
    badge: 'Creative',
    accent: 'from-purple-600 via-indigo-500 to-sky-500',
  },
  {
    key: 'monoline',
    name: 'Monoline Grid',
    description: 'Structured grid emphasizing clarity and contact info.',
    badge: 'Modern',
    accent: 'from-emerald-600 via-teal-500 to-sky-500',
  },
] as const;

export type VisitingCardTemplateKey = (typeof visitingCardTemplates)[number]['key'];

export const visitingCardThemes = [
  {
    id: 'aurora',
    name: 'Aurora Indigo',
    description: 'Vibrant blues with subtle gradients for premium brands.',
    colors: {
      primary: 'bg-indigo-600',
      primaryText: 'text-indigo-600',
      secondary: 'bg-indigo-100',
      surface: 'bg-white',
      border: 'border-indigo-100',
      text: 'text-slate-900',
      accent: 'text-indigo-500',
    },
  },
  {
    id: 'ember',
    name: 'Ember Copper',
    description: 'Warm copper glow paired with deep charcoal text.',
    colors: {
      primary: 'bg-amber-500',
      primaryText: 'text-amber-500',
      secondary: 'bg-amber-100',
      surface: 'bg-white',
      border: 'border-amber-100',
      text: 'text-slate-900',
      accent: 'text-amber-600',
    },
  },
  {
    id: 'zen',
    name: 'Zen Sage',
    description: 'Calming sage palette for wellness and lifestyle brands.',
    colors: {
      primary: 'bg-emerald-500',
      primaryText: 'text-emerald-500',
      secondary: 'bg-emerald-100',
      surface: 'bg-white',
      border: 'border-emerald-100',
      text: 'text-slate-900',
      accent: 'text-emerald-500',
    },
  },
  {
    id: 'slate',
    name: 'Slate Mono',
    description: 'Neutral greys and high contrast for tech-forward teams.',
    colors: {
      primary: 'bg-slate-900',
      primaryText: 'text-slate-900',
      secondary: 'bg-slate-100',
      surface: 'bg-white',
      border: 'border-slate-200',
      text: 'text-slate-900',
      accent: 'text-slate-700',
    },
  },
] as const;

export type VisitingCardThemeId = (typeof visitingCardThemes)[number]['id'];

const trimmed = (max: number) => z.string().trim().max(max);

export const VisitingCardDataSchema = z.object({
  name: trimmed(120).optional().default(''),
  title: trimmed(160).optional().default(''),
  company: trimmed(160).optional().default(''),
  email: trimmed(160).optional().default(''),
  phone: trimmed(80).optional().default(''),
  address: trimmed(240).optional().default(''),
  website: trimmed(160).optional().default(''),
  tagline: trimmed(160).optional().default(''),
});

export type VisitingCardData = z.infer<typeof VisitingCardDataSchema>;

export const VisitingCardRecordSchema = VisitingCardDataSchema.extend({
  id: z.string().uuid(),
  userId: z.string().min(1),
  theme: z.enum(visitingCardThemes.map((theme) => theme.id) as [VisitingCardThemeId, ...VisitingCardThemeId[]]),
  template: z.enum(
    visitingCardTemplates.map((template) => template.key) as [VisitingCardTemplateKey, ...VisitingCardTemplateKey[]],
  ),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type VisitingCardRecord = z.infer<typeof VisitingCardRecordSchema>;

export const VisitingCardSaveSchema = VisitingCardDataSchema.extend({
  id: z.string().uuid().optional(),
  theme: z.enum(visitingCardThemes.map((theme) => theme.id) as [VisitingCardThemeId, ...VisitingCardThemeId[]]),
  template: z.enum(
    visitingCardTemplates.map((template) => template.key) as [VisitingCardTemplateKey, ...VisitingCardTemplateKey[]],
  ),
});

export const VisitingCardDeleteSchema = z.object({
  id: z.string().uuid(),
});

export const VisitingCardListSchema = z.object({});

export const VisitingCardTaglineSchema = z.object({
  name: trimmed(120).min(1),
  company: trimmed(160).min(1),
  title: trimmed(160).optional().default(''),
});

export const VisitingCardExportSchema = z
  .object({
    id: z.string().uuid().optional(),
    format: z.enum(['pdf', 'png', 'svg']).default('pdf'),
    card: VisitingCardSaveSchema.partial({ id: true }).optional(),
  })
  .refine((value) => Boolean(value.id || value.card), {
    message: 'Provide either a card payload or saved card id.',
    path: ['card'],
  });

export const defaultCardData = (): VisitingCardData => ({
  name: 'Taylor Morgan',
  title: 'Brand Strategist',
  company: 'Northwind Studio',
  email: 'taylor@northwind.studio',
  phone: '+1 (555) 123-4567',
  address: '200 Market Street, Suite 40, Portland, OR',
  website: 'northwind.studio',
  tagline: 'Designing unforgettable brand identities.',
});

export const visitingCardFallbackTaglines = [
  'Crafting memorable identities for bold brands.',
  'Strategic design that elevates every introduction.',
  'Professional impact, distilled into a single card.',
  'Modern visuals and messaging for ambitious founders.',
  'Your brand story — clear, confident, and concise.',
];

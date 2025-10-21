import { z } from 'astro:schema';

export const proposalTemplateKeys = ['business', 'agency', 'startup', 'grant', 'rfp'] as const;
export const proposalStatuses = ['draft', 'published'] as const;
export const proposalToneOptions = ['professional', 'friendly', 'concise', 'bold', 'empathetic'] as const;

export type ProposalTemplateKey = (typeof proposalTemplateKeys)[number];
export type ProposalStatus = (typeof proposalStatuses)[number];
export type ProposalTone = (typeof proposalToneOptions)[number];

export const proposalSectionOrder = [
  'client',
  'overview',
  'goals',
  'scope',
  'deliverables',
  'outOfScope',
  'assumptions',
  'timeline',
  'budget',
  'team',
  'caseStudies',
  'risks',
  'mitigations',
  'terms',
  'branding',
  'notes',
] as const;

const TimelineItemSchema = z.object({
  milestone: z.string().default(''),
  start: z.string().default(''),
  end: z.string().default(''),
  description: z.string().default(''),
});

const BudgetItemSchema = z.object({
  label: z.string().default(''),
  qty: z.number().min(0).default(1),
  unitPrice: z.number().min(0).default(0),
  total: z.number().min(0).default(0),
  notes: z.string().default(''),
});

const TeamMemberSchema = z.object({
  name: z.string().default(''),
  role: z.string().default(''),
  bio: z.string().default(''),
  email: z.string().default(''),
  phone: z.string().default(''),
});

const CaseStudySchema = z.object({
  title: z.string().default(''),
  summary: z.string().default(''),
  url: z.string().default(''),
});

const BriefInsightsSchema = z.object({
  goals: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  timelineHints: z.array(z.string()).default([]),
});

const ChecklistSchema = z.object({
  goalsConfirmed: z.boolean().default(false),
  scopeConfirmed: z.boolean().default(false),
  budgetConfirmed: z.boolean().default(false),
  legalReviewed: z.boolean().default(false),
});

const BrandingSchema = z.object({
  logoUrl: z.string().default(''),
  accentColor: z.string().default('#4f46e5'),
  accentLabel: z.string().default('Indigo'),
  coverImageUrl: z.string().default(''),
  footerNote: z.string().default(''),
});

const ProposalAIDraftSchema = z.object({
  section: z.string(),
  message: z.string(),
  createdAt: z.string(),
});

export const ProposalDataSchema = z.object({
  client: z
    .object({
      name: z.string().default(''),
      contact: z.string().default(''),
      company: z.string().default(''),
      email: z.string().default(''),
      phone: z.string().default(''),
      website: z.string().default(''),
      industry: z.string().default(''),
      location: z.string().default(''),
    })
    .default({
      name: '',
      contact: '',
      company: '',
      email: '',
      phone: '',
      website: '',
      industry: '',
      location: '',
    }),
  overview: z.string().default(''),
  goals: z.array(z.string()).default([]),
  scope: z.array(z.string()).default([]),
  deliverables: z.array(z.string()).default([]),
  outOfScope: z.array(z.string()).default([]),
  assumptions: z.array(z.string()).default([]),
  timeline: z.array(TimelineItemSchema).default([]),
  budget: z
    .object({
      currency: z.string().default('USD'),
      items: z.array(BudgetItemSchema).default([]),
      subtotal: z.number().default(0),
      tax: z.number().default(0),
      discount: z.number().default(0),
      total: z.number().default(0),
      notes: z.string().default(''),
    })
    .default({
      currency: 'USD',
      items: [],
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      notes: '',
    }),
  team: z.array(TeamMemberSchema).default([]),
  caseStudies: z.array(CaseStudySchema).default([]),
  risks: z.array(z.string()).default([]),
  mitigations: z.array(z.string()).default([]),
  terms: z.array(z.string()).default([]),
  branding: BrandingSchema.default({
    logoUrl: '',
    accentColor: '#4f46e5',
    accentLabel: 'Indigo',
    coverImageUrl: '',
    footerNote: '',
  }),
  notes: z.string().default(''),
  briefInsights: BriefInsightsSchema.default({
    goals: [],
    requirements: [],
    risks: [],
    timelineHints: [],
  }),
  checklist: ChecklistSchema.default({
    goalsConfirmed: false,
    scopeConfirmed: false,
    budgetConfirmed: false,
    legalReviewed: false,
  }),
  aiSuggestions: z.array(ProposalAIDraftSchema).default([]),
});

export type ProposalData = z.infer<typeof ProposalDataSchema>;
export type ProposalTimelineItem = z.infer<typeof TimelineItemSchema>;
export type ProposalBudgetItem = z.infer<typeof BudgetItemSchema>;
export type ProposalTeamMember = z.infer<typeof TeamMemberSchema>;
export type ProposalCaseStudy = z.infer<typeof CaseStudySchema>;
export type ProposalBriefInsights = z.infer<typeof BriefInsightsSchema>;

export const createEmptyProposalData = (): ProposalData => ({
  client: {
    name: '',
    contact: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    location: '',
  },
  overview: '',
  goals: ['Clarify project objectives', 'Outline deliverables and timeline'],
  scope: ['Requirement analysis', 'Design workshop'],
  deliverables: ['Project roadmap', 'Design mockups'],
  outOfScope: ['Post-launch maintenance'],
  assumptions: ['Client will provide timely feedback'],
  timeline: [
    { milestone: 'Discovery', start: '', end: '', description: '' },
    { milestone: 'Design', start: '', end: '', description: '' },
  ],
  budget: {
    currency: 'USD',
    items: [
      { label: 'Discovery & research', qty: 1, unitPrice: 1200, total: 1200, notes: '' },
      { label: 'Design sprint', qty: 1, unitPrice: 1800, total: 1800, notes: '' },
    ],
    subtotal: 3000,
    tax: 0,
    discount: 0,
    total: 3000,
    notes: '',
  },
  team: [
    { name: 'Lead Strategist', role: 'Project Lead', bio: '', email: '', phone: '' },
  ],
  caseStudies: [
    { title: 'SaaS Redesign', summary: 'Improved conversion by 28%', url: 'https://ansiversa.com/case/saas' },
  ],
  risks: ['Tight timeline'],
  mitigations: ['Weekly checkpoints to stay aligned'],
  terms: [
    'Payment terms: 50% upfront, 50% on completion',
    'Intellectual property transfers upon final payment',
  ],
  branding: {
    logoUrl: '',
    accentColor: '#4f46e5',
    accentLabel: 'Indigo',
    coverImageUrl: '',
    footerNote: 'Confidential — For client review only',
  },
  notes: '',
  briefInsights: {
    goals: [],
    requirements: [],
    risks: [],
    timelineHints: [],
  },
  checklist: {
    goalsConfirmed: false,
    scopeConfirmed: false,
    budgetConfirmed: false,
    legalReviewed: false,
  },
  aiSuggestions: [],
});

export const calculateBudgetTotals = (budget: ProposalData['budget']) => {
  const subtotal = budget.items.reduce((sum, item) => sum + (item.total || item.qty * item.unitPrice), 0);
  const tax = Number.isFinite(budget.tax) ? budget.tax : 0;
  const discount = Number.isFinite(budget.discount) ? budget.discount : 0;
  const total = subtotal + tax - discount;
  return { subtotal, tax, discount, total };
};

export type ProposalListItem = {
  id: string;
  title: string;
  clientName: string;
  templateKey: ProposalTemplateKey;
  status: ProposalStatus;
  currency: string;
  slug: string | null;
  lastSavedAt: string | null;
  createdAt: string | null;
};

export const proposalTemplateOptions: Array<{
  key: ProposalTemplateKey;
  label: string;
  icon: string;
  plan: 'free' | 'pro';
  description: string;
}> = [
  {
    key: 'business',
    label: 'Business Standard',
    icon: 'fas fa-briefcase',
    plan: 'free',
    description: 'Structured layout suited for consulting and service engagements.',
  },
  {
    key: 'agency',
    label: 'Creative Agency',
    icon: 'fas fa-palette',
    plan: 'pro',
    description: 'Vibrant visuals for design and marketing studios.',
  },
  {
    key: 'startup',
    label: 'Startup Pitch',
    icon: 'fas fa-rocket',
    plan: 'pro',
    description: 'Highlights traction, product roadmap, and investment ask.',
  },
  {
    key: 'grant',
    label: 'Grant Application',
    icon: 'fas fa-hand-holding-heart',
    plan: 'pro',
    description: 'Compliance-ready format with outcomes and measurement.',
  },
  {
    key: 'rfp',
    label: 'RFP Response',
    icon: 'fas fa-file-contract',
    plan: 'free',
    description: 'Map deliverables, compliance, and differentiation for RFPs.',
  },
];

export const defaultProposalTitle = 'Untitled proposal';

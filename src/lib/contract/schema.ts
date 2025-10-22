import { z } from 'astro:schema';

export const contractTemplateKeys = [
  'freelance',
  'nda',
  'service',
  'consulting',
  'employment',
  'custom',
] as const;

export const contractStatuses = ['draft', 'published'] as const;
export const contractClauseCategories = [
  'preamble',
  'scope',
  'payment',
  'intellectual_property',
  'confidentiality',
  'liability',
  'termination',
  'dispute_resolution',
  'general',
] as const;

export const contractToneOptions = ['formal', 'friendly', 'direct', 'concise'] as const;

export type ContractTemplateKey = (typeof contractTemplateKeys)[number];
export type ContractStatus = (typeof contractStatuses)[number];
export type ContractClauseCategory = (typeof contractClauseCategories)[number];
export type ContractTone = (typeof contractToneOptions)[number];

export const contractVariableKeys = [
  'ClientName',
  'ProviderName',
  'ClientAddress',
  'ProviderAddress',
  'StartDate',
  'EndDate',
  'ServiceFee',
  'PaymentSchedule',
  'Jurisdiction',
  'Currency',
  'ScopeSummary',
  'DeliverableSummary',
  'NoticeEmail',
] as const;

export type ContractVariableKey = (typeof contractVariableKeys)[number];

export const contractClauseKeys = [
  'preamble',
  'services',
  'deliverables',
  'payment',
  'expenses',
  'intellectual_property',
  'confidentiality',
  'liability',
  'termination',
  'dispute_resolution',
  'governing_law',
  'signatures',
] as const;

export type ContractClauseKey = (typeof contractClauseKeys)[number];

export const ContractVariablesSchema = z.object(
  Object.fromEntries(
    contractVariableKeys.map((key) => [key, z.string().nullable().optional()]),
  ) as Record<ContractVariableKey, z.ZodTypeAny>,
);

export const ContractClausesSchema = z.object(
  Object.fromEntries(contractClauseKeys.map((key) => [key, z.string().default('')])) as Record<
    ContractClauseKey,
    z.ZodTypeAny
  >,
);

export const ContractVersionSchema = z.object({
  id: z.string().uuid(),
  label: z.string(),
  createdAt: z.string(),
  clauses: ContractClausesSchema,
});

export const ContractDataSchema = z.object({
  variables: ContractVariablesSchema,
  clauses: ContractClausesSchema,
  notes: z.string().nullable().optional(),
  versions: z.array(ContractVersionSchema).default([]),
  options: z
    .object({
      watermark: z.boolean().default(true),
      locale: z.string().default('en'),
      includeSignatureBlock: z.boolean().default(true),
    })
    .default({ watermark: true, locale: 'en', includeSignatureBlock: true }),
});

export type ContractVariables = z.infer<typeof ContractVariablesSchema>;
export type ContractClauses = z.infer<typeof ContractClausesSchema>;
export type ContractVersion = z.infer<typeof ContractVersionSchema>;
export type ContractData = z.infer<typeof ContractDataSchema>;

export type ContractTemplateDefinition = {
  key: ContractTemplateKey;
  label: string;
  headline: string;
  description: string;
  recommendedFor: string[];
  defaultVariables?: Partial<ContractVariables>;
  defaultClauses?: Partial<ContractClauses>;
};

export type ContractClauseLibraryEntry = {
  id: string;
  category: ContractClauseCategory;
  title: string;
  body: string;
  locale: string;
};

const sharedClauses: Partial<Record<ContractClauseKey, string>> = {
  preamble:
    'This Agreement ("Agreement") is entered into on {StartDate} between {ClientName}, located at {ClientAddress}, and {ProviderName}, located at {ProviderAddress}.',
  services:
    '{ProviderName} agrees to perform the services described in Exhibit A ("Services"). {ScopeSummary}',
  deliverables:
    '{ProviderName} will deliver the following deliverables to {ClientName}: {DeliverableSummary}.',
  payment:
    '{ClientName} agrees to pay {ServiceFee} {Currency} according to the following schedule: {PaymentSchedule}.',
  expenses:
    'Out-of-pocket expenses pre-approved by {ClientName} will be reimbursed within fifteen (15) days of invoice receipt.',
  intellectual_property:
    'Unless otherwise agreed in writing, all intellectual property arising from the Services will be owned by {ClientName} upon full payment.',
  confidentiality:
    'Both parties agree to keep confidential any proprietary or sensitive information disclosed during the course of this Agreement.',
  liability:
    'Neither party will be liable for indirect or consequential damages. Liability is limited to the total amounts paid under this Agreement.',
  termination:
    'Either party may terminate this Agreement with fourteen (14) days written notice if the other party materially breaches and fails to cure such breach.',
  dispute_resolution:
    'Any disputes will be resolved through good-faith negotiation. If unresolved, the dispute will be submitted to binding arbitration in {Jurisdiction}.',
  governing_law: 'This Agreement is governed by the laws of {Jurisdiction}.',
  signatures: 'IN WITNESS WHEREOF, the parties have executed this Agreement as of the date written above.',
};

const ndaSpecificClauses: Partial<Record<ContractClauseKey, string>> = {
  services:
    '{ProviderName} and {ClientName} wish to explore a potential business opportunity and exchange certain confidential information.',
  deliverables: '{ProviderName} will use Confidential Information solely to evaluate the potential opportunity.',
  intellectual_property:
    'All Confidential Information remains the exclusive property of the disclosing party. No license or rights are granted except as expressly provided.',
  confidentiality:
    'The receiving party will protect Confidential Information with the same level of care it uses to protect its own confidential information, and not less than reasonable care.',
  termination:
    'Either party may terminate this Agreement on ten (10) days written notice. Obligations related to Confidential Information survive termination for three (3) years.',
  dispute_resolution: 'Any disputes will be resolved in the courts of {Jurisdiction}.',
};

const consultingClauses: Partial<Record<ContractClauseKey, string>> = {
  services:
    '{ProviderName} will provide consulting services focused on strategy, planning, and advisory sessions with key stakeholders of {ClientName}.',
  deliverables:
    'Deliverables include workshop reports, executive presentations, and prioritized action roadmaps.',
  payment:
    'Engagement fees are billed monthly in arrears at the agreed day rate. Invoices are due within fifteen (15) days of receipt.',
  termination:
    'Either party may terminate the engagement with thirty (30) days notice. Fees earned up to the termination date remain payable.',
};

const employmentClauses: Partial<Record<ContractClauseKey, string>> = {
  services:
    '{ProviderName} accepts employment with {ClientName} as described in the attached job description.',
  deliverables:
    '{ProviderName} will perform duties diligently, reporting to the designated manager and following company policies.',
  payment: '{ClientName} will pay an annual salary of {ServiceFee} {Currency}, payable in accordance with company payroll practices.',
  termination:
    '{ClientName} may terminate employment with cause immediately or without cause with statutory notice. {ProviderName} may resign with thirty (30) days notice.',
  liability: 'Employees are covered by company policies and applicable labour laws.',
};

const serviceClauses: Partial<Record<ContractClauseKey, string>> = {
  services: '{ProviderName} will deliver professional services as outlined in Exhibit A with agreed milestones.',
  deliverables:
    'Key deliverables include status reports, documented deliverables, and implementation support as needed.',
  payment: '{ClientName} will pay a project fee of {ServiceFee} {Currency} in line with the invoicing schedule.',
  termination:
    'Either party may terminate with thirty (30) days written notice. Upon termination, {ClientName} will pay for services rendered.',
};

const freelanceClauses: Partial<Record<ContractClauseKey, string>> = {
  services:
    '{ProviderName} will provide freelance services including design, build, and delivery of agreed assets for {ClientName}.',
  deliverables:
    'Deliverables will be provided in mutually agreed formats with two (2) rounds of revisions included.',
  payment:
    '{ClientName} agrees to pay {ServiceFee} {Currency} with fifty percent (50%) due upfront and the balance upon completion.',
  intellectual_property:
    'Upon full payment, {ClientName} receives ownership of all project deliverables excluding {ProviderName}\'s pre-existing materials.',
};

export const contractTemplates: ContractTemplateDefinition[] = [
  {
    key: 'freelance',
    label: 'Freelance services',
    headline: 'Flexible agreements for independent work',
    description:
      'Balance clarity and protection for project-based freelance engagements with milestone-based payments and scope clarity.',
    recommendedFor: ['Designers', 'Developers', 'Independent consultants'],
    defaultClauses: { ...sharedClauses, ...freelanceClauses },
  },
  {
    key: 'service',
    label: 'Service agreement',
    headline: 'Professional services & retainers',
    description:
      'Create structured service agreements with clear deliverables, payment cadence, and IP transfer conditions.',
    recommendedFor: ['Agencies', 'Studios', 'Specialist vendors'],
    defaultClauses: { ...sharedClauses, ...serviceClauses },
  },
  {
    key: 'consulting',
    label: 'Consulting engagement',
    headline: 'Advisory and consulting retainers',
    description:
      'Outline advisory goals, cadence, and reporting for on-going consulting relationships.',
    recommendedFor: ['Strategy consultants', 'Advisory teams'],
    defaultClauses: { ...sharedClauses, ...consultingClauses },
  },
  {
    key: 'nda',
    label: 'Mutual NDA',
    headline: 'Confidentiality-first collaboration',
    description:
      'Protect sensitive information while exploring partnerships or pilot projects with reciprocal obligations.',
    recommendedFor: ['Partnership discussions', 'Product previews'],
    defaultClauses: { ...sharedClauses, ...ndaSpecificClauses },
  },
  {
    key: 'employment',
    label: 'Employment offer',
    headline: 'Offers & onboarding documentation',
    description:
      'Prepare employment offers with compensation, obligations, and policy alignment for new hires.',
    recommendedFor: ['Hiring managers', 'People ops'],
    defaultClauses: { ...sharedClauses, ...employmentClauses },
  },
  {
    key: 'custom',
    label: 'Blank agreement',
    headline: 'Start from a clean document',
    description:
      'Build bespoke contracts with complete control over structure, tone, and clauses.',
    recommendedFor: ['Advanced users', 'Legal teams'],
    defaultClauses: { ...sharedClauses },
  },
];

export const defaultContractVariables: ContractVariables = {
  ClientName: 'Acme Corp',
  ProviderName: 'Ansiversa Studio',
  ClientAddress: '100 Innovation Drive, Dubai',
  ProviderAddress: '405 Palm Avenue, Dubai',
  StartDate: new Date().toISOString().split('T')[0],
  EndDate: '',
  ServiceFee: '12000',
  PaymentSchedule: '50% upfront, 50% on delivery',
  Jurisdiction: 'Dubai, UAE',
  Currency: 'AED',
  ScopeSummary: 'including discovery, build, and launch support',
  DeliverableSummary: 'final assets, documentation, and training materials',
  NoticeEmail: 'contracts@ansiversa.com',
};

export const defaultContractClauses: ContractClauses = ContractClausesSchema.parse(
  contractClauseKeys.reduce<Record<string, string>>((acc, key) => {
    acc[key] = sharedClauses[key] ?? '';
    return acc;
  }, {}),
);

export const defaultContractTitle = 'Untitled contract';

export function getTemplateDefinition(key: ContractTemplateKey) {
  return contractTemplates.find((template) => template.key === key) ?? contractTemplates[0];
}

export function createEmptyContractData(templateKey: ContractTemplateKey = 'freelance'): ContractData {
  const template = getTemplateDefinition(templateKey);
  const clauses = { ...defaultContractClauses, ...(template.defaultClauses ?? {}) };
  const variables: ContractVariables = {
    ...defaultContractVariables,
    ...(template.defaultVariables ?? {}),
  };

  return {
    variables,
    clauses: ContractClausesSchema.parse(clauses),
    notes: null,
    versions: [],
    options: { watermark: true, locale: 'en', includeSignatureBlock: true },
  } satisfies ContractData;
}

export const clauseLibrarySeed: ContractClauseLibraryEntry[] = [
  {
    id: 'lib-preamble-standard',
    category: 'preamble',
    title: 'Standard introduction',
    body: 'This Agreement is entered into on {StartDate} between {ClientName} and {ProviderName}.',
    locale: 'en',
  },
  {
    id: 'lib-scope-digital',
    category: 'scope',
    title: 'Digital services scope',
    body: '{ProviderName} will provide strategy, design, and implementation services covering {ScopeSummary}.',
    locale: 'en',
  },
  {
    id: 'lib-payment-milestone',
    category: 'payment',
    title: 'Milestone-based payment',
    body: 'Fees will be invoiced per milestone completion and payable within fifteen (15) days of invoice date.',
    locale: 'en',
  },
  {
    id: 'lib-ip-work-for-hire',
    category: 'intellectual_property',
    title: 'Work-for-hire clause',
    body: 'Upon full payment, all Work Product shall be deemed “work for hire” owned exclusively by {ClientName}.',
    locale: 'en',
  },
  {
    id: 'lib-confidentiality-mutual',
    category: 'confidentiality',
    title: 'Mutual confidentiality',
    body: 'Both parties agree to protect confidential information and use it solely for fulfilling this Agreement.',
    locale: 'en',
  },
  {
    id: 'lib-liability-cap',
    category: 'liability',
    title: 'Liability cap',
    body: 'Each party’s aggregate liability shall not exceed the total fees paid under this Agreement.',
    locale: 'en',
  },
  {
    id: 'lib-termination-notice',
    category: 'termination',
    title: 'Termination with notice',
    body: 'Either party may terminate this Agreement with thirty (30) days written notice. Outstanding invoices remain payable.',
    locale: 'en',
  },
  {
    id: 'lib-dispute-mediation',
    category: 'dispute_resolution',
    title: 'Mediation first',
    body: 'Parties agree to attempt resolution through mediation before escalating to arbitration in {Jurisdiction}.',
    locale: 'en',
  },
  {
    id: 'lib-general-notices',
    category: 'general',
    title: 'Notice clause',
    body: 'All notices must be in writing and delivered to the addresses listed in this Agreement with a copy to {NoticeEmail}.',
    locale: 'en',
  },
];

import { z } from 'astro:schema';

const randomId = () =>
  typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `minutes-${Math.random().toString(16).slice(2)}-${Date.now()}`;

export const minutesTemplateKeys = [
  'standup',
  'sprint_review',
  'client_call',
  'sales_discovery',
] as const;

export const minutesStatuses = ['draft', 'published'] as const;
export const minutesPrivacyModes = ['standard', 'ephemeral'] as const;
export const minutesActionStatuses = ['open', 'in-progress', 'done'] as const;
export const minutesActionPriorities = ['low', 'med', 'high'] as const;
export const minutesExportFormats = ['pdf', 'docx', 'md', 'csv'] as const;

export type MinutesTemplateKey = (typeof minutesTemplateKeys)[number];
export type MinutesStatus = (typeof minutesStatuses)[number];
export type MinutesPrivacyMode = (typeof minutesPrivacyModes)[number];
export type MinutesActionStatus = (typeof minutesActionStatuses)[number];
export type MinutesActionPriority = (typeof minutesActionPriorities)[number];
export type MinutesExportFormat = (typeof minutesExportFormats)[number];

export const MinutesAttendeeSchema = z.object({
  id: z.string().default(randomId),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional(),
  role: z.string().optional(),
  optional: z.boolean().default(false),
});

export const MinutesTranscriptSegmentSchema = z.object({
  id: z.string().default(randomId),
  t0: z.number().min(0).default(0),
  t1: z.number().min(0).default(0),
  speaker: z.string().default('Speaker 1'),
  text: z.string().default(''),
});

export const MinutesTranscriptSchema = z.object({
  language: z.string().default('en'),
  speakers: z.array(z.string()).default([]),
  segments: z.array(MinutesTranscriptSegmentSchema).default([]),
});

export const MinutesActionItemSchema = z.object({
  id: z.string().default(randomId),
  task: z.string().min(1).max(1200),
  assignee: z.string().optional().default(''),
  due: z.string().optional().nullable(),
  priority: z.enum(minutesActionPriorities).default('med'),
  status: z.enum(minutesActionStatuses).default('open'),
});

export const MinutesSummarySchema = z.object({
  agenda: z.array(z.string()).default([]),
  decisions: z.array(z.string()).default([]),
  keyPoints: z.array(z.string()).default([]),
  actionItems: z.array(MinutesActionItemSchema).default([]),
  risks: z.array(z.string()).default([]),
  parkingLot: z.array(z.string()).default([]),
});

export type MinutesAttendee = z.infer<typeof MinutesAttendeeSchema>;
export type MinutesTranscriptSegment = z.infer<typeof MinutesTranscriptSegmentSchema>;
export type MinutesTranscript = z.infer<typeof MinutesTranscriptSchema>;
export type MinutesActionItem = z.infer<typeof MinutesActionItemSchema>;
export type MinutesSummary = z.infer<typeof MinutesSummarySchema>;

export const MinutesRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().default('Untitled meeting'),
  slug: z.string().nullable().default(null),
  status: z.enum(minutesStatuses).default('draft'),
  templateKey: z.enum(minutesTemplateKeys).default('standup'),
  meetingDate: z.string().nullable().default(null),
  attendees: z.array(MinutesAttendeeSchema).default([]),
  transcript: MinutesTranscriptSchema.default({ language: 'en', speakers: [], segments: [] }),
  summary: MinutesSummarySchema.default({
    agenda: [],
    decisions: [],
    keyPoints: [],
    actionItems: [],
    risks: [],
    parkingLot: [],
  }),
  privacy: z.enum(minutesPrivacyModes).default('standard'),
  durationSec: z.number().optional().nullable(),
  plan: z.enum(['free', 'pro']).default('free'),
  lastSavedAt: z.string().nullable().default(null),
  createdAt: z.string().nullable().default(null),
  publishedAt: z.string().nullable().default(null),
});

export type MinutesRecord = z.infer<typeof MinutesRecordSchema>;

export const defaultMinutesTitle = 'Untitled meeting';

export type MinutesTemplateDefinition = {
  key: MinutesTemplateKey;
  label: string;
  description: string;
  agendaExamples: string[];
  summaryHighlights: string[];
  aiPrompt: string;
  recommendedQuestions: string[];
  bestFor: string;
};

export const minutesTemplates: MinutesTemplateDefinition[] = [
  {
    key: 'standup',
    label: 'Daily Standup',
    description: 'Quick sync for agile teams to unblock work.',
    agendaExamples: ["Yesterday's progress", "Today's focus", 'Blockers'],
    summaryHighlights: [
      'Call out blockers with owners and escalation path.',
      'Summarize sprint health in one or two bullets.',
      'Capture follow-ups with due dates when possible.',
    ],
    aiPrompt:
      'Summarize the standup notes clearly and concisely. Group blockers and add action items with owners and due dates.',
    recommendedQuestions: [
      'What progress did we make since last standup?',
      'Where are the blockers or risks?',
      'What changes to priorities are we making today?',
    ],
    bestFor: 'Scrum teams running daily syncs.',
  },
  {
    key: 'sprint_review',
    label: 'Sprint Review',
    description: 'Share completed work, demos, and feedback.',
    agendaExamples: ['Sprint goals recap', 'Demo highlights', 'Stakeholder feedback', 'Retrospective themes'],
    summaryHighlights: [
      'Capture released features with links to demos or artifacts.',
      'Document stakeholder feedback and decisions.',
      'List follow-ups for QA, design, or analytics.',
    ],
    aiPrompt:
      'Summarize sprint review discussions with emphasis on delivered value, feedback, and follow-up actions.',
    recommendedQuestions: [
      'Which goals were met or at risk?',
      'What feedback do stakeholders have?',
      'What actions are required before the next sprint?',
    ],
    bestFor: 'Product and engineering teams closing a sprint.',
  },
  {
    key: 'client_call',
    label: 'Client Call',
    description: 'Capture notes from client status or discovery calls.',
    agendaExamples: ['Introductions', 'Status updates', 'Opportunities', 'Risks and blockers'],
    summaryHighlights: [
      'Record commitments made to the client with owners.',
      'Note concerns or escalations raised.',
      'Highlight next touchpoint and materials promised.',
    ],
    aiPrompt:
      'Create a client-ready summary with status, decisions, and clear commitments. Include risks and next steps.',
    recommendedQuestions: [
      'What did the client confirm or request?',
      'What deliverables are due and by when?',
      'Who owns each follow-up item?',
    ],
    bestFor: 'Account managers and consultants keeping client history aligned.',
  },
  {
    key: 'sales_discovery',
    label: 'Sales Discovery',
    description: 'Organize discovery calls and qualification notes.',
    agendaExamples: ['Pain points', 'Current solutions', 'Budget and timeline', 'Stakeholders'],
    summaryHighlights: [
      'Map pain points to product capabilities.',
      'Identify buying committee members.',
      'Document follow-up demos or proposals.',
    ],
    aiPrompt:
      'Summarize discovery insights and align on next sales steps. Highlight stakeholders, budget, and urgency.',
    recommendedQuestions: [
      'What problems is the prospect trying to solve?',
      'Who else needs to approve this purchase?',
      'What timeline or budget constraints exist?',
    ],
    bestFor: 'Sales teams qualifying opportunities.',
  },
];

export const minutesTemplateMap = Object.fromEntries(minutesTemplates.map((template) => [template.key, template]));

export const minutesPlanLimits = {
  free: {
    maxMinutes: 5,
    maxUploadsPerMonth: 3,
    audioDurationLimit: 30,
    availableTemplates: ['standup'] as MinutesTemplateKey[],
    exports: ['pdf', 'md'] as MinutesExportFormat[],
    watermarkExports: true,
  },
  pro: {
    maxMinutes: Infinity,
    maxUploadsPerMonth: Infinity,
    audioDurationLimit: 120,
    availableTemplates: minutesTemplateKeys as MinutesTemplateKey[],
    exports: minutesExportFormats as MinutesExportFormat[],
    watermarkExports: false,
  },
} as const;

export const minutesPlanLabels: Record<'free' | 'pro', string> = {
  free: 'Free',
  pro: 'Pro',
};

export const createEmptyMinutesSummary = (): MinutesSummary => ({
  agenda: [],
  decisions: [],
  keyPoints: [],
  actionItems: [],
  risks: [],
  parkingLot: [],
});

export const createEmptyMinutesTranscript = (): MinutesTranscript => ({
  language: 'en',
  speakers: [],
  segments: [],
});

export const createEmptyMinutesAttendee = (): MinutesAttendee => ({
  id: randomId(),
  name: '',
  email: undefined,
  role: undefined,
  optional: false,
});

export const createEmptyMinutesRecord = (templateKey: MinutesTemplateKey = 'standup'): MinutesRecord => ({
  id: randomId(),
  userId: 'local-user',
  title: defaultMinutesTitle,
  slug: null,
  status: 'draft',
  templateKey,
  meetingDate: null,
  attendees: [],
  transcript: createEmptyMinutesTranscript(),
  summary: createEmptyMinutesSummary(),
  privacy: 'standard',
  durationSec: null,
  plan: 'free',
  lastSavedAt: null,
  createdAt: new Date().toISOString(),
  publishedAt: null,
});

export const getMinutesTemplateDefinition = (key: MinutesTemplateKey): MinutesTemplateDefinition => {
  const template = minutesTemplateMap[key];
  if (!template) {
    return minutesTemplates[0];
  }
  return template;
};

export const minutesSummarySections = [
  { key: 'agenda', label: 'Agenda' },
  { key: 'keyPoints', label: 'Key Points' },
  { key: 'decisions', label: 'Decisions' },
  { key: 'actionItems', label: 'Action Items' },
  { key: 'risks', label: 'Risks' },
  { key: 'parkingLot', label: 'Parking Lot' },
] as const;

export type MinutesSummarySectionKey = (typeof minutesSummarySections)[number]['key'];

export const minutesActionStatusLabel: Record<MinutesActionStatus, string> = {
  open: 'Open',
  'in-progress': 'In Progress',
  done: 'Done',
};

export const minutesActionPriorityLabel: Record<MinutesActionPriority, string> = {
  low: 'Low',
  med: 'Medium',
  high: 'High',
};


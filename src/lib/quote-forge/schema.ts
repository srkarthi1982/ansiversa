import { clone } from '../../alpineStores/base';

export type QuotePlan = 'free' | 'pro';

export type QuoteLengthPreset = 'micro' | 'short' | 'tweet' | 'poster';

export type QuoteTone =
  | 'uplifting'
  | 'stoic'
  | 'humorous'
  | 'poetic'
  | 'reflective'
  | 'bold'
  | 'gentle'
  | 'academic';

export type QuoteDeviceKey =
  | 'contrast'
  | 'parallelism'
  | 'rule_of_three'
  | 'antimetabole'
  | 'alliteration'
  | 'metaphor'
  | 'anaphora'
  | 'antithesis';

export type QuotePersona =
  | 'coach'
  | 'teacher'
  | 'monk'
  | 'scientist'
  | 'ceo'
  | 'athlete'
  | 'artist'
  | 'parent';

export type QuoteLanguage = 'en' | 'es' | 'ta' | 'ar';

export type QuoteStatus = 'draft' | 'ready' | 'archived';

export type QuoteVariantStatus = 'candidate' | 'approved' | 'archived';

export type QuoteAttributionModeKey =
  | 'anonymous'
  | 'pen_name'
  | 'real_name'
  | 'brand'
  | 'none';

export type QuoteAttributionMode = {
  key: QuoteAttributionModeKey;
  label: string;
  description: string;
  example: string;
  plan?: QuotePlan;
};

export type QuoteAttribution = {
  mode: QuoteAttributionModeKey;
  display: 'prefix' | 'suffix' | 'inline';
  name?: string;
  handle?: string;
};

export type QuoteScore = {
  clarity: number;
  punch: number;
  originality: number;
  clicheRisk: number;
  reasons: string[];
  suggestions: string[];
};

export type QuoteUniquenessSnapshot = {
  score: number;
  badge: 'excellent' | 'strong' | 'watch' | 'risk';
  overlaps: Array<{ phrase: string; similarity: number }>;
};

export type QuoteFlag = {
  id: string;
  kind: 'length' | 'cliche' | 'tone' | 'safety';
  severity: 'info' | 'warning' | 'critical';
  message: string;
};

export type QuoteRefinementType =
  | 'tighten'
  | 'simplify'
  | 'punch'
  | 'poetic'
  | 'faith_safe'
  | 'kid_friendly'
  | 'formal'
  | 'paraphrase';

export type QuoteRefinement = {
  id: string;
  type: QuoteRefinementType;
  before: string;
  after: string;
  summary: string;
  createdAt: string;
  notes?: string;
};

export type QuoteVariant = {
  id: string;
  text: string;
  language: QuoteLanguage;
  tone: QuoteTone;
  persona: QuotePersona;
  length: QuoteLengthPreset;
  tags: string[];
  deviceHints: QuoteDeviceKey[];
  attribution: QuoteAttribution;
  status: QuoteVariantStatus;
  score: QuoteScore;
  uniqueness: QuoteUniquenessSnapshot;
  flags: QuoteFlag[];
  refinements: QuoteRefinement[];
  caption: string;
  hashtags: string[];
};

export type QuotePackItem = {
  quoteId: string;
  channel: 'instagram' | 'linkedin' | 'threads' | 'newsletter' | 'tiktok';
  caption: string;
  hashtags: string[];
  scheduledAt?: string;
};

export type QuotePack = {
  id: string;
  title: string;
  description: string;
  theme: string;
  colorway: string;
  plan: QuotePlan;
  template: 'square' | 'vertical' | 'landscape';
  items: QuotePackItem[];
  metrics: { ready: number; scheduled: number };
};

export type QuoteScheduleItem = {
  id: string;
  quoteId: string;
  date: string;
  channel: QuotePackItem['channel'];
  status: 'queued' | 'sent';
  note?: string;
};

export type QuoteSchedule = {
  cadence: 'daily' | 'weekly' | 'custom';
  timezone: string;
  startDate: string;
  items: QuoteScheduleItem[];
};

export type QuoteExportRecord = {
  id: string;
  format: 'csv' | 'json';
  status: 'queued' | 'ready' | 'error';
  createdAt: string;
  includeCaptions: boolean;
  includePacks: boolean;
};

export type QuoteBrief = {
  id: string;
  projectId: string;
  topics: string[];
  tone: QuoteTone;
  lengthPreset: QuoteLengthPreset;
  devices: QuoteDeviceKey[];
  persona: QuotePersona;
  count: number;
  notes: string;
  createdAt: string;
};

export type QuoteProject = {
  id: string;
  name: string;
  topicTags: string[];
  language: QuoteLanguage;
  attribution: QuoteAttribution;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
  defaultLength: QuoteLengthPreset;
  defaultTone: QuoteTone;
  defaultPersona: QuotePersona;
  planLocks?: {
    languages?: boolean;
    packs?: boolean;
    designerPush?: boolean;
    uniqueness?: boolean;
  };
  briefs: QuoteBrief[];
  quotes: QuoteVariant[];
  packs: QuotePack[];
  schedule: QuoteSchedule | null;
  exports: QuoteExportRecord[];
  aiUsage: {
    variants: number;
    refinements: number;
    checks: number;
    exports: number;
    designerPushes: number;
    paraphrases: number;
    languagesUsed: QuoteLanguage[];
  };
};

export type QuoteActivityItem = {
  id: string;
  message: string;
  detail: string;
  timestamp: string;
  tone: 'success' | 'info' | 'warning';
  icon: string;
};

export type QuotePlanLimits = {
  projects: number | 'unlimited';
  variantsPerPrompt: number;
  languages: QuoteLanguage[];
  packItems: number;
  exportFormats: ('csv' | 'json')[];
  designerPush: boolean;
  uniqueness: 'basic' | 'advanced';
};

export type QuoteLibraryMetrics = {
  totalProjects: number;
  activeProjects: number;
  quotesGenerated: number;
  approvalRate: number;
  avgOriginality: number;
  scheduledThisMonth: number;
};

export type QuoteGenerationMode = {
  id: 'daily' | 'campaign' | 'micro_poem' | 'debate';
  label: string;
  description: string;
  presetLength: QuoteLengthPreset;
  recommendedCount: number;
  highlight: string;
  proOnly?: boolean;
};

export type QuoteDeviceGuide = {
  key: QuoteDeviceKey;
  label: string;
  description: string;
  example: string;
};

export type QuoteApiEndpoint = {
  id:
    | 'createProject'
    | 'generate'
    | 'refine'
    | 'paraphrase'
    | 'score'
    | 'checkCliche'
    | 'checkUniqueness'
    | 'createPack'
    | 'schedule'
    | 'export'
    | 'designerPush';
  method: 'GET' | 'POST';
  path: string;
  summary: string;
  sampleRequest: Record<string, unknown>;
  sampleResponse: Record<string, unknown>;
};

export type QuoteExportPreset = {
  id: string;
  label: string;
  description: string;
  format: 'csv' | 'json';
  includes: string[];
  recommendedFor: string;
  plan: QuotePlan;
  integration?: string;
};

const iso = (value: string) => new Date(value).toISOString();

export const quotePlanLimits: Record<QuotePlan, QuotePlanLimits> = {
  free: {
    projects: 3,
    variantsPerPrompt: 10,
    languages: ['en'],
    packItems: 10,
    exportFormats: ['csv'],
    designerPush: false,
    uniqueness: 'basic',
  },
  pro: {
    projects: 'unlimited',
    variantsPerPrompt: 100,
    languages: ['en', 'es', 'ta', 'ar'],
    packItems: 200,
    exportFormats: ['csv', 'json'],
    designerPush: true,
    uniqueness: 'advanced',
  },
};

export const quoteGenerationModes: QuoteGenerationMode[] = [
  {
    id: 'daily',
    label: 'Daily discipline drip',
    description:
      'Generate a week of concise, motivational quotes anchored to habit and focus prompts. Perfect for morning newsletters.',
    presetLength: 'micro',
    recommendedCount: 7,
    highlight: 'Micro length + uplifting tone',
  },
  {
    id: 'campaign',
    label: 'Campaign storytelling',
    description:
      'Blend leadership, product, and customer win angles. Mix tones across bold, reflective, and gentle to suit social carousels.',
    presetLength: 'tweet',
    recommendedCount: 15,
    highlight: 'Supports multilingual output and device layering',
    proOnly: true,
  },
  {
    id: 'micro_poem',
    label: 'Micro-poem sequence',
    description:
      'Compose two-line poetic aphorisms using metaphor and parallelism for wellness and mindfulness packs.',
    presetLength: 'short',
    recommendedCount: 12,
    highlight: 'Poetic tone with metaphor focus',
  },
  {
    id: 'debate',
    label: 'Contrasting perspectives',
    description:
      'Produce paired quotes that frame a tension (optimist vs realist) for thought-leadership threads and debate posts.',
    presetLength: 'tweet',
    recommendedCount: 8,
    highlight: 'Alternates personas for contrast',
    proOnly: true,
  },
];

export const quoteDeviceGuides: QuoteDeviceGuide[] = [
  {
    key: 'contrast',
    label: 'Contrast',
    description: 'Juxtapose two opposing ideas to create tension and resolution.',
    example: 'Discipline is choosing purpose over impulse when the thrill fades.',
  },
  {
    key: 'parallelism',
    label: 'Parallelism',
    description: 'Mirror structure or rhythm across clauses for cadence.',
    example: 'Build calm in your schedule, build courage in your choices.',
  },
  {
    key: 'rule_of_three',
    label: 'Rule of three',
    description: 'Group ideas in threes to increase memorability.',
    example: 'Plan the work, practice the work, protect the work.',
  },
  {
    key: 'antimetabole',
    label: 'Antimetabole',
    description: 'Invert wording in the second clause for a punchy reversal.',
    example: 'We change our routines until our routines change us.',
  },
  {
    key: 'alliteration',
    label: 'Alliteration',
    description: 'Repeat starting sounds to create musicality.',
    example: 'Quiet courage quietly compounds.',
  },
  {
    key: 'metaphor',
    label: 'Metaphor',
    description: 'Map your topic to a vivid comparison.',
    example: 'Focus is a lens that refuses every extra light.',
  },
  {
    key: 'anaphora',
    label: 'Anaphora',
    description: 'Repeat a starting phrase for emphasis.',
    example: 'Choose to begin. Choose to continue. Choose to finish.',
  },
  {
    key: 'antithesis',
    label: 'Antithesis',
    description: 'Pair opposites to highlight a central idea.',
    example: 'Rest is not the rival of drive; it is its root.',
  },
];

export const quoteAttributionModes: QuoteAttributionMode[] = [
  {
    key: 'anonymous',
    label: 'Anonymous',
    description: 'Keep the author invisible while hinting at the series or community voice.',
    example: '— Quote Forge Collective',
  },
  {
    key: 'pen_name',
    label: 'Pen name',
    description: 'Write under a persona or fictional guide.',
    example: '— The Focus Scribe',
  },
  {
    key: 'real_name',
    label: 'Real name',
    description: 'Display an expert or team member for authority.',
    example: 'Aanya Raman — Performance Coach',
  },
  {
    key: 'brand',
    label: 'Brand handle',
    description: 'Attach your brand or product handle and optionally the channel hashtag.',
    example: '@ansiversa · #QuoteForge',
  },
  {
    key: 'none',
    label: 'Public domain style',
    description: 'Deliver the quote without attribution for a timeless aphorism feel.',
    example: 'No attribution displayed',
    plan: 'pro',
  },
];

export const quoteRefinementPasses: Array<{
  key: QuoteRefinementType;
  label: string;
  description: string;
  focus: string;
  gating: QuotePlan;
  prompt: string;
}> = [
  {
    key: 'tighten',
    label: 'Tighten wording',
    description: 'Remove filler and strengthen verbs while preserving tone.',
    focus: 'Clarity + brevity',
    gating: 'free',
    prompt: 'Trim softeners, swap concrete nouns, keep length ≤ preset.',
  },
  {
    key: 'simplify',
    label: 'Simplify language',
    description: 'Reduce jargon and keep vocabulary accessible for broad audiences.',
    focus: 'Accessibility',
    gating: 'free',
    prompt: 'Swap complex metaphors for plain imagery; keep rhythm intact.',
  },
  {
    key: 'punch',
    label: 'Punch up impact',
    description: 'Sharpen contrast, add cadence devices, and end with a kicker.',
    focus: 'Punch score',
    gating: 'pro',
    prompt: 'Heighten tension in clause two, test with rule-of-three cadence.',
  },
  {
    key: 'poetic',
    label: 'Poetic pass',
    description: 'Lean into lyrical imagery with metaphor and parallel structure.',
    focus: 'Imagery + tone',
    gating: 'pro',
    prompt: 'Blend metaphor + sensory language; ensure meter stays balanced.',
  },
  {
    key: 'faith_safe',
    label: 'Faith-safe tone',
    description: 'Remove absolutist commands and keep interfaith respectful language.',
    focus: 'Safety filter',
    gating: 'free',
    prompt: 'Swap dogmatic verbs for invitational phrasing and inclusive nouns.',
  },
  {
    key: 'kid_friendly',
    label: 'Kid-friendly version',
    description: 'Translate idea into playful, age-appropriate language.',
    focus: 'Age filters',
    gating: 'pro',
    prompt: 'Use simple syntax, positive encouragement, and vivid objects.',
  },
  {
    key: 'formal',
    label: 'Formal polish',
    description: 'Adjust diction for corporate comms or leadership memos.',
    focus: 'Register',
    gating: 'free',
    prompt: 'Replace colloquialisms with professional tone and varied cadence.',
  },
  {
    key: 'paraphrase',
    label: 'Paraphrase variants',
    description: 'Spin multiple phrasings to avoid repetition across channels.',
    focus: 'Originality',
    gating: 'pro',
    prompt: 'Provide three meaning-preserving rewrites with varied openings.',
  },
];

export const quoteExportPresets: QuoteExportPreset[] = [
  {
    id: 'csv_basic',
    label: 'CSV — Scheduler ready',
    description: 'Exports quote text, attribution, caption, and hashtags for scheduling tools.',
    format: 'csv',
    includes: ['Quote text', 'Caption', 'Hashtags', 'Language'],
    recommendedFor: 'Buffer, Hypefury, Later uploads',
    plan: 'free',
  },
  {
    id: 'json_full',
    label: 'JSON — Automation bundle',
    description: 'Structured payload with variants, packs, schedule hints, and scoring breakdowns.',
    format: 'json',
    includes: ['Scores', 'Uniqueness', 'Packs', 'Schedule'],
    recommendedFor: 'Zaps, internal dashboards',
    plan: 'pro',
  },
  {
    id: 'designer_push',
    label: 'Presentation Designer handoff',
    description: 'Send selected packs with preferred template, aspect ratios, and colorway.',
    format: 'json',
    includes: ['Pack items', 'Template', 'Colorway'],
    recommendedFor: 'Image card automation',
    plan: 'pro',
    integration: 'Presentation Designer',
  },
];

export const quoteApiEndpoints: QuoteApiEndpoint[] = [
  {
    id: 'createProject',
    method: 'POST',
    path: '/quotes/api/project/create',
    summary: 'Create a new Quote Forge project with default attribution and topics.',
    sampleRequest: {
      name: 'Discipline Daily',
      topicTags: ['habits', 'focus'],
      language: 'en',
      attribution: { mode: 'brand', display: 'suffix', name: 'Ansiversa' },
    },
    sampleResponse: { projectId: 'qp_focus' },
  },
  {
    id: 'generate',
    method: 'POST',
    path: '/quotes/api/generate',
    summary: 'Generate quote variants for a brief and length preset.',
    sampleRequest: {
      projectId: 'qp_focus',
      count: 10,
      tone: 'stoic',
      lengthPreset: 'micro',
      devices: ['contrast', 'rule_of_three'],
    },
    sampleResponse: { created: 10, queued: 0 },
  },
  {
    id: 'refine',
    method: 'POST',
    path: '/quotes/api/refine',
    summary: 'Run a refinement pass on a selected quote.',
    sampleRequest: {
      quoteId: 'q_focus_anchor',
      type: 'punch',
      notes: 'Sharpen contrast, keep ≤ 120 chars',
    },
    sampleResponse: { ok: true, after: 'Discipline makes easy the work panic makes urgent.' },
  },
  {
    id: 'paraphrase',
    method: 'POST',
    path: '/quotes/api/paraphrase',
    summary: 'Request paraphrase variants for distribution variety.',
    sampleRequest: { quoteId: 'q_focus_anchor', variants: 3 },
    sampleResponse: { variants: 3, queued: true },
  },
  {
    id: 'score',
    method: 'POST',
    path: '/quotes/api/score',
    summary: 'Get clarity, punch, originality, and cliché risk scores.',
    sampleRequest: { quoteId: 'q_focus_anchor' },
    sampleResponse: {
      clarity: 0.84,
      punch: 0.76,
      originality: 0.81,
      clicheRisk: 0.11,
    },
  },
  {
    id: 'checkCliche',
    method: 'POST',
    path: '/quotes/api/check/cliche',
    summary: 'Check a quote against the cliché blacklist.',
    sampleRequest: { text: 'Believe in yourself and anything is possible.' },
    sampleResponse: { flagged: true, matches: ['anything is possible'] },
  },
  {
    id: 'checkUniqueness',
    method: 'POST',
    path: '/quotes/api/check/uniqueness',
    summary: 'Compute similarity score against saved corpus and blacklist.',
    sampleRequest: { quoteId: 'q_focus_anchor' },
    sampleResponse: { similarity: 0.07, status: 'pass' },
  },
  {
    id: 'createPack',
    method: 'POST',
    path: '/quotes/api/pack/create',
    summary: 'Create a themed pack and assign quote IDs.',
    sampleRequest: {
      projectId: 'qp_focus',
      title: 'Discipline x30',
      items: ['q_focus_anchor', 'q_focus_sparks'],
    },
    sampleResponse: { packId: 'pack_focus_30' },
  },
  {
    id: 'schedule',
    method: 'POST',
    path: '/quotes/api/schedule/create',
    summary: 'Schedule quotes on a cadence with timezone awareness.',
    sampleRequest: {
      projectId: 'qp_focus',
      cadence: 'daily',
      timezone: 'America/New_York',
      items: [
        { quoteId: 'q_focus_anchor', date: '2024-05-12', channel: 'instagram' },
      ],
    },
    sampleResponse: { scheduled: 7 },
  },
  {
    id: 'export',
    method: 'POST',
    path: '/quotes/api/export',
    summary: 'Queue an export job for CSV or JSON bundles.',
    sampleRequest: {
      projectId: 'qp_focus',
      format: 'csv',
      includeCaptions: true,
      includePacks: false,
    },
    sampleResponse: { jobId: 'export_focus_may', status: 'queued' },
  },
  {
    id: 'designerPush',
    method: 'POST',
    path: '/quotes/api/designer/push',
    summary: 'Send a pack to Presentation Designer with template preferences.',
    sampleRequest: {
      packId: 'pack_focus_launch',
      template: 'square_clean',
      colorway: 'slate',
    },
    sampleResponse: { ok: true },
  },
];

export const quoteActivityLog: QuoteActivityItem[] = [
  {
    id: 'act_01',
    message: 'Queued 12 stoic variants',
    detail: 'Brief “Focus anchor" · tone stoic · devices contrast + rule_of_three',
    timestamp: iso('2024-04-18T09:32:00Z'),
    tone: 'success',
    icon: 'fa-wand-magic-sparkles',
  },
  {
    id: 'act_02',
    message: 'Ran punch refinement',
    detail: 'Quote “Routines rescue energy” · pass punch',
    timestamp: iso('2024-04-18T10:05:00Z'),
    tone: 'info',
    icon: 'fa-bolt',
  },
  {
    id: 'act_03',
    message: 'Uniqueness check flagged overlap',
    detail: '“Dreams demand deadlines” matched 42% with blacklist',
    timestamp: iso('2024-04-17T17:20:00Z'),
    tone: 'warning',
    icon: 'fa-triangle-exclamation',
  },
  {
    id: 'act_04',
    message: 'Pushed pack to Presentation Designer',
    detail: 'Pack “Launch Countdown” → template square_clean',
    timestamp: iso('2024-04-16T15:42:00Z'),
    tone: 'success',
    icon: 'fa-paper-plane',
  },
];

const makeRefinement = (
  id: string,
  type: QuoteRefinementType,
  before: string,
  after: string,
  summary: string,
  createdAt: string,
  notes?: string,
): QuoteRefinement => ({ id, type, before, after, summary, createdAt: iso(createdAt), notes });

const makeQuote = (quote: QuoteVariant): QuoteVariant => ({
  ...quote,
  refinements: quote.refinements.map((refine) => ({
    ...refine,
    createdAt: iso(refine.createdAt),
  })),
});

export const sampleQuoteProjects: QuoteProject[] = [
  {
    id: 'qp_focus',
    name: 'Discipline Daily',
    topicTags: ['habits', 'focus', 'creative practice'],
    language: 'en',
    attribution: { mode: 'brand', display: 'suffix', name: 'Ansiversa' },
    status: 'ready',
    createdAt: iso('2024-03-02T08:30:00Z'),
    updatedAt: iso('2024-04-18T10:10:00Z'),
    defaultLength: 'micro',
    defaultTone: 'stoic',
    defaultPersona: 'coach',
    briefs: [
      {
        id: 'brief_focus_01',
        projectId: 'qp_focus',
        topics: ['discipline', 'delayed gratification'],
        tone: 'stoic',
        lengthPreset: 'micro',
        devices: ['contrast', 'rule_of_three'],
        persona: 'coach',
        count: 12,
        notes: 'For 30-day bootcamp welcome series',
        createdAt: iso('2024-04-12T09:00:00Z'),
      },
      {
        id: 'brief_focus_02',
        projectId: 'qp_focus',
        topics: ['maker energy', 'deep work'],
        tone: 'reflective',
        lengthPreset: 'short',
        devices: ['parallelism', 'metaphor'],
        persona: 'artist',
        count: 8,
        notes: 'Mix in craft imagery for Reels overlay captions',
        createdAt: iso('2024-04-05T12:10:00Z'),
      },
    ],
    quotes: [
      makeQuote({
        id: 'q_focus_anchor',
        text: 'Discipline is the quiet vote you cast before anyone is watching.',
        language: 'en',
        tone: 'stoic',
        persona: 'coach',
        length: 'micro',
        tags: ['discipline', 'habits'],
        deviceHints: ['contrast', 'rule_of_three'],
        attribution: { mode: 'brand', display: 'suffix', name: 'Ansiversa' },
        status: 'approved',
        score: {
          clarity: 0.88,
          punch: 0.8,
          originality: 0.83,
          clicheRisk: 0.09,
          reasons: ['Strong verb + concrete noun', 'Contrast between quiet and public'],
          suggestions: ['Offer optional cadence beat for audio overlay'],
        },
        uniqueness: {
          score: 0.92,
          badge: 'excellent',
          overlaps: [
            { phrase: 'vote you cast', similarity: 0.18 },
            { phrase: 'before anyone is watching', similarity: 0.11 },
          ],
        },
        flags: [],
        refinements: [
          {
            id: 'ref_focus_tighten',
            type: 'tighten',
            before: 'Discipline is the silent vote you cast long before anyone watches.',
            after: 'Discipline is the quiet vote you cast before anyone is watching.',
            summary: 'Shortened clause and swapped “silent" for “quiet" to soften harshness.',
            createdAt: '2024-04-12T10:00:00Z',
          },
          {
            id: 'ref_focus_punch',
            type: 'punch',
            before: 'Discipline is the quiet vote you cast before anyone is watching.',
            after: 'Discipline is the quiet vote you cast before the crowd ever cares.',
            summary: 'Punch pass tested urgency-focused ending.',
            createdAt: '2024-04-12T10:12:00Z',
            notes: 'Kept original due to stronger universality.',
          },
        ],
        caption: 'Cast your vote for the work long before applause arrives.',
        hashtags: ['#Discipline', '#Focus', '#QuoteForge'],
      }),
      makeQuote({
        id: 'q_focus_sparks',
        text: 'Protect your focus like a flame: shield it, feed it, move it from room to room.',
        language: 'en',
        tone: 'reflective',
        persona: 'artist',
        length: 'short',
        tags: ['focus', 'creative'],
        deviceHints: ['metaphor', 'rule_of_three'],
        attribution: { mode: 'pen_name', display: 'suffix', name: 'The Focus Scribe' },
        status: 'candidate',
        score: {
          clarity: 0.82,
          punch: 0.74,
          originality: 0.79,
          clicheRisk: 0.15,
          reasons: ['Metaphor extends across clauses', 'Rule of three gives cadence'],
          suggestions: ['Consider shorter third clause to tighten rhythm'],
        },
        uniqueness: {
          score: 0.71,
          badge: 'strong',
          overlaps: [
            { phrase: 'like a flame', similarity: 0.26 },
          ],
        },
        flags: [
          {
            id: 'flag_focus_metaphor',
            kind: 'tone',
            severity: 'info',
            message: 'Metaphor flagged for review to ensure not overused in pack.',
          },
        ],
        refinements: [
          {
            id: 'ref_focus_poetic',
            type: 'poetic',
            before: 'Protect your focus like a flame: shield it, feed it, move it from room to room.',
            after: 'Treat focus like fire: shelter it, stoke it, carry it carefully.',
            summary: 'Poetic pass leaned into alliteration and meter.',
            createdAt: '2024-04-11T17:22:00Z',
          },
        ],
        caption: 'Creative energy survives when we guard and guide it.',
        hashtags: ['#Makers', '#DeepWork', '#QuoteForge'],
      }),
      makeQuote({
        id: 'q_focus_reset',
        text: 'Rest is a skill that rebuilds the strength ambition spends.',
        language: 'en',
        tone: 'gentle',
        persona: 'coach',
        length: 'micro',
        tags: ['rest', 'performance'],
        deviceHints: ['antithesis', 'contrast'],
        attribution: { mode: 'brand', display: 'suffix', name: 'Ansiversa' },
        status: 'approved',
        score: {
          clarity: 0.9,
          punch: 0.69,
          originality: 0.85,
          clicheRisk: 0.05,
          reasons: ['Balanced antithesis between rest and ambition', 'Plain diction keeps accessibility high'],
          suggestions: ['Optional kid-friendly adaptation available'],
        },
        uniqueness: {
          score: 0.88,
          badge: 'excellent',
          overlaps: [
            { phrase: 'rest is a skill', similarity: 0.19 },
          ],
        },
        flags: [],
        refinements: [
          {
            id: 'ref_focus_formal',
            type: 'formal',
            before: 'Rest is a skill that rebuilds the strength ambition spends.',
            after: 'Rest is a practice that restores the strength ambition invests.',
            summary: 'Formal pass swapped verbs to fit leadership memo.',
            createdAt: '2024-04-10T08:11:00Z',
          },
        ],
        caption: 'Performance includes recovery, not just acceleration.',
        hashtags: ['#Performance', '#Leadership', '#QuoteForge'],
      }),
    ],
    packs: [
      {
        id: 'pack_focus_launch',
        title: 'Focus Launch Week',
        description: 'Seven-quote carousel for product launch countdown.',
        theme: 'launch',
        colorway: 'violet',
        plan: 'pro',
        template: 'square',
        items: [
          {
            quoteId: 'q_focus_anchor',
            channel: 'linkedin',
            caption: 'Launch discipline means casting the vote before metrics move.',
            hashtags: ['#LaunchReady', '#Focus'],
            scheduledAt: iso('2024-05-01T14:00:00Z'),
          },
          {
            quoteId: 'q_focus_reset',
            channel: 'instagram',
            caption: 'Recovery fuels creative sprints.',
            hashtags: ['#CreatorEnergy', '#Rest'],
            scheduledAt: iso('2024-05-02T14:00:00Z'),
          },
        ],
        metrics: { ready: 7, scheduled: 5 },
      },
      {
        id: 'pack_focus_micro',
        title: 'Micro discipline drip',
        description: 'Daily reminder pack for internal Slack bot.',
        theme: 'daily',
        colorway: 'slate',
        plan: 'free',
        template: 'vertical',
        items: [
          {
            quoteId: 'q_focus_reset',
            channel: 'threads',
            caption: 'Recovery is a craft, not an afterthought.',
            hashtags: ['#DeepWork', '#Recovery'],
          },
        ],
        metrics: { ready: 10, scheduled: 0 },
      },
    ],
    schedule: {
      cadence: 'daily',
      timezone: 'America/New_York',
      startDate: iso('2024-05-01T09:00:00Z'),
      items: [
        {
          id: 'sched_focus_01',
          quoteId: 'q_focus_anchor',
          date: iso('2024-05-01T13:00:00Z'),
          channel: 'linkedin',
          status: 'queued',
        },
        {
          id: 'sched_focus_02',
          quoteId: 'q_focus_reset',
          date: iso('2024-05-02T13:00:00Z'),
          channel: 'instagram',
          status: 'queued',
        },
        {
          id: 'sched_focus_03',
          quoteId: 'q_focus_sparks',
          date: iso('2024-05-03T13:00:00Z'),
          channel: 'threads',
          status: 'queued',
        },
      ],
    },
    exports: [
      {
        id: 'export_focus_csv',
        format: 'csv',
        status: 'ready',
        createdAt: iso('2024-04-15T06:20:00Z'),
        includeCaptions: true,
        includePacks: true,
      },
      {
        id: 'export_focus_json',
        format: 'json',
        status: 'queued',
        createdAt: iso('2024-04-18T10:09:00Z'),
        includeCaptions: true,
        includePacks: true,
      },
    ],
    aiUsage: {
      variants: 48,
      refinements: 26,
      checks: 34,
      exports: 6,
      designerPushes: 3,
      paraphrases: 9,
      languagesUsed: ['en'],
    },
  },
  {
    id: 'qp_wellness',
    name: 'Wellness Weaves',
    topicTags: ['wellness', 'mindfulness', 'rest'],
    language: 'en',
    attribution: { mode: 'pen_name', display: 'suffix', name: 'Calm Founder' },
    status: 'draft',
    createdAt: iso('2024-02-18T07:10:00Z'),
    updatedAt: iso('2024-04-14T18:33:00Z'),
    defaultLength: 'short',
    defaultTone: 'gentle',
    defaultPersona: 'monk',
    planLocks: {
      designerPush: true,
      languages: true,
    },
    briefs: [
      {
        id: 'brief_wellness_01',
        projectId: 'qp_wellness',
        topics: ['evening rituals', 'mindful rest'],
        tone: 'gentle',
        lengthPreset: 'short',
        devices: ['parallelism', 'metaphor'],
        persona: 'monk',
        count: 10,
        notes: 'Focus on bedtime stories for parents',
        createdAt: iso('2024-04-08T21:12:00Z'),
      },
    ],
    quotes: [
      makeQuote({
        id: 'q_wellness_moon',
        text: 'Treat tonight like a moonrise: dim the noise, deepen the breath, invite the hush.',
        language: 'en',
        tone: 'gentle',
        persona: 'monk',
        length: 'short',
        tags: ['evening', 'ritual'],
        deviceHints: ['metaphor', 'parallelism'],
        attribution: { mode: 'pen_name', display: 'suffix', name: 'Calm Founder' },
        status: 'candidate',
        score: {
          clarity: 0.78,
          punch: 0.63,
          originality: 0.86,
          clicheRisk: 0.08,
          reasons: ['Rich metaphor supporting sensory detail'],
          suggestions: ['Test micro version for SMS drip'],
        },
        uniqueness: {
          score: 0.83,
          badge: 'excellent',
          overlaps: [
            { phrase: 'dim the noise', similarity: 0.17 },
          ],
        },
        flags: [],
        refinements: [
          makeRefinement(
            'ref_wellness_simplify',
            'simplify',
            'Treat tonight like a moonrise: dim the noise, deepen the breath, invite the hush.',
            'Let night fall like a moonrise: dim the noise, deepen the breath, welcome the hush.',
            'Simplify pass swapped “invite" with “welcome" for calm tone.',
            '2024-04-09T07:40:00Z',
          ),
        ],
        caption: 'Night rituals start when we choose quiet over catch-up.',
        hashtags: ['#MindfulEvening', '#QuoteForge'],
      }),
      makeQuote({
        id: 'q_wellness_window',
        text: 'Open a window for your thoughts: let the weather of worry move through.',
        language: 'en',
        tone: 'reflective',
        persona: 'teacher',
        length: 'micro',
        tags: ['mindfulness'],
        deviceHints: ['metaphor'],
        attribution: { mode: 'pen_name', display: 'suffix', name: 'Calm Founder' },
        status: 'candidate',
        score: {
          clarity: 0.81,
          punch: 0.68,
          originality: 0.78,
          clicheRisk: 0.12,
          reasons: ['Metaphor extends with “weather of worry"'],
          suggestions: ['Check with faith-safe filter for spiritual contexts'],
        },
        uniqueness: {
          score: 0.7,
          badge: 'strong',
          overlaps: [
            { phrase: 'window for your thoughts', similarity: 0.22 },
          ],
        },
        flags: [
          {
            id: 'flag_wellness_faith',
            kind: 'safety',
            severity: 'info',
            message: 'Faith-safe review recommended before publishing to Sunday digest.',
          },
        ],
        refinements: [
          makeRefinement(
            'ref_wellness_faith',
            'faith_safe',
            'Open a window for your thoughts: let the weather of worry move through.',
            'Open a window for your thoughts so the weather of worry can move through.',
            'Faith-safe pass softened imperative tone.',
            '2024-04-10T08:20:00Z',
          ),
        ],
        caption: 'Let thoughts move like weather — present but passing.',
        hashtags: ['#Mindfulness', '#Calm'],
      }),
    ],
    packs: [
      {
        id: 'pack_wellness_evening',
        title: 'Evening reset',
        description: 'Gentle reminders for parents to slow evenings.',
        theme: 'evening',
        colorway: 'rose',
        plan: 'free',
        template: 'vertical',
        items: [
          {
            quoteId: 'q_wellness_moon',
            channel: 'instagram',
            caption: 'Moonrise rituals for modern parents.',
            hashtags: ['#EveningRitual', '#CalmParent'],
          },
        ],
        metrics: { ready: 6, scheduled: 0 },
      },
    ],
    schedule: {
      cadence: 'weekly',
      timezone: 'Europe/London',
      startDate: iso('2024-05-05T19:00:00Z'),
      items: [
        {
          id: 'sched_wellness_01',
          quoteId: 'q_wellness_moon',
          date: iso('2024-05-05T19:00:00Z'),
          channel: 'newsletter',
          status: 'queued',
        },
      ],
    },
    exports: [
      {
        id: 'export_wellness_csv',
        format: 'csv',
        status: 'ready',
        createdAt: iso('2024-04-08T22:10:00Z'),
        includeCaptions: true,
        includePacks: false,
      },
    ],
    aiUsage: {
      variants: 32,
      refinements: 18,
      checks: 21,
      exports: 4,
      designerPushes: 0,
      paraphrases: 6,
      languagesUsed: ['en', 'es'],
    },
  },
];

export const cloneQuoteProjects = (): QuoteProject[] =>
  sampleQuoteProjects.map((project) => clone(project));

export const computeQuoteMetrics = (projects: QuoteProject[]): QuoteLibraryMetrics => {
  const totals = projects.reduce(
    (
      acc,
      project,
    ) => {
      const approved = project.quotes.filter((quote) => quote.status === 'approved').length;
      const totalQuotes = project.quotes.length;
      const originalitySum = project.quotes.reduce((sum, quote) => sum + quote.score.originality, 0);
      const scheduled = project.schedule?.items.filter((item) => item.status === 'queued').length ?? 0;

      acc.projects += 1;
      acc.activeProjects += project.status !== 'archived' ? 1 : 0;
      acc.quotesGenerated += totalQuotes;
      acc.approved += approved;
      acc.originality += originalitySum;
      acc.scheduled += scheduled;
      return acc;
    },
    { projects: 0, activeProjects: 0, quotesGenerated: 0, approved: 0, originality: 0, scheduled: 0 },
  );

  const approvalRate = totals.quotesGenerated
    ? Number((totals.approved / totals.quotesGenerated).toFixed(2))
    : 0;
  const avgOriginality = totals.quotesGenerated
    ? Number((totals.originality / totals.quotesGenerated).toFixed(2))
    : 0;

  return {
    totalProjects: totals.projects,
    activeProjects: totals.activeProjects,
    quotesGenerated: totals.quotesGenerated,
    approvalRate,
    avgOriginality,
    scheduledThisMonth: totals.scheduled,
  };
};

export const aggregateQuoteUsage = (projects: QuoteProject[]) => {
  return projects.reduce(
    (acc, project) => {
      acc.variants += project.aiUsage.variants;
      acc.refinements += project.aiUsage.refinements;
      acc.checks += project.aiUsage.checks;
      acc.exports += project.aiUsage.exports;
      acc.designerPushes += project.aiUsage.designerPushes;
      acc.paraphrases += project.aiUsage.paraphrases;
      return acc;
    },
    { variants: 0, refinements: 0, checks: 0, exports: 0, designerPushes: 0, paraphrases: 0 },
  );
};

export type QuoteUsageSummary = ReturnType<typeof aggregateQuoteUsage>;

export const quoteLengthLabels: Record<QuoteLengthPreset, string> = {
  micro: '≤80 characters',
  short: '≤140 characters',
  tweet: '≤240 characters',
  poster: '≤16 words',
};

export type PromptPlanKey = 'free' | 'pro';

type PromptVariableOption = { label: string; value: string };

export type PromptBuilderVariable = {
  id: string;
  name: string;
  label: string;
  type: 'string' | 'enum' | 'number';
  defaultValue: string;
  description: string;
  required: boolean;
  options?: PromptVariableOption[];
  min?: number;
  max?: number;
};

export type PromptBuilderExample = {
  id: string;
  label: string;
  enabled: boolean;
  input: string;
  output: string;
};

export type PromptVariantBlock = {
  system: string;
  instruction: string;
  toolHints: string;
  notes?: string;
  examples: PromptBuilderExample[];
};

export type PromptBuilderVariant = {
  id: 'A' | 'B';
  label: string;
  description: string;
  enabled: boolean;
  blocks: PromptVariantBlock;
};

export type PromptBuilderTestCase = {
  id: string;
  label: string;
  persona: string;
  input: Record<string, string>;
  expectedTraits: string[];
  tags: string[];
  enabled: boolean;
  lastRunAt: string | null;
};

export type PromptBuilderRun = {
  id: string;
  caseId: string | null;
  variantId: 'A' | 'B';
  output: string;
  tokensPrompt: number;
  tokensOutput: number;
  cost: number;
  latencyMs: number;
  pass: boolean;
  createdAt: string;
  modelName: string;
  tags: string[];
  inputSummary: string;
};

export type PromptLintIssue = {
  id: string;
  severity: 'info' | 'warn' | 'error';
  field: 'system' | 'instruction' | 'examples' | 'variables' | 'test' | 'model';
  message: string;
  quickFix?: string;
};

export type PromptModelSettings = {
  model: string;
  temperature: number;
  maxOutputTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
};

export type PromptVersionSnapshot = {
  variants: PromptBuilderVariant[];
  variables: PromptBuilderVariable[];
  model: PromptModelSettings;
  activeVariantId: 'A' | 'B';
};

export type PromptBuilderVersion = {
  id: string;
  version: number;
  label: string;
  notes: string;
  createdAt: string;
  author: string;
  diffSummary: string;
  payload: PromptVersionSnapshot;
};

export type PromptBuilderProject = {
  id: string;
  slug: string;
  title: string;
  status: 'draft' | 'published';
  plan: PromptPlanKey;
  description: string;
  tags: string[];
  createdAt: string;
  lastSavedAt: string;
  lastRunAt: string | null;
  runsToday: number;
  runsTotal: number;
  watermark: boolean;
  activeVariantId: 'A' | 'B';
  variants: PromptBuilderVariant[];
  variables: PromptBuilderVariable[];
  testCases: PromptBuilderTestCase[];
  runs: PromptBuilderRun[];
  lintIssues: PromptLintIssue[];
  versions: PromptBuilderVersion[];
  model: PromptModelSettings;
  shareSlug: string | null;
};

export type PromptBuilderTemplate = {
  key: string;
  title: string;
  category: 'Email' | 'Support' | 'Marketing' | 'Product' | 'Engineering' | 'Operations';
  description: string;
  useCases: string[];
  tags: string[];
  estimatedTokens: number;
  recommendedModel: string;
  variables: PromptBuilderVariable[];
  blocks: Pick<PromptVariantBlock, 'system' | 'instruction' | 'toolHints'>;
};

export type PromptPlanDetail = {
  key: PromptPlanKey;
  label: string;
  projects: string;
  runsPerDay: string;
  features: string[];
  perks: string[];
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const baseModel: PromptModelSettings = {
  model: 'gpt-4o-mini',
  temperature: 0.5,
  maxOutputTokens: 600,
  topP: 0.9,
  frequencyPenalty: 0.2,
  presencePenalty: 0.1,
};

export const defaultPromptModel = () => clone(baseModel);

const plans: PromptPlanDetail[] = [
  {
    key: 'free',
    label: 'Free',
    projects: 'Up to 5 projects',
    runsPerDay: '50 runs / day',
    features: [
      'Single model profile',
      'Prompt lint suggestions',
      'Export as JSON or Markdown',
    ],
    perks: ['Watermark on share pages', 'Email support within 48 hours'],
  },
  {
    key: 'pro',
    label: 'Pro',
    projects: 'Unlimited projects',
    runsPerDay: '1,000 runs / day',
    features: [
      'Multiple model profiles',
      'A/B compare test bench',
      'Exports for JSON, Markdown, .prompt, and code',
    ],
    perks: ['No watermark on shares', 'Priority support in < 8 hours'],
  },
];

const projectProductLaunch: PromptBuilderProject = {
  id: 'proj-product-launch',
  slug: 'product-launch-email',
  title: 'Product Launch Email Composer',
  status: 'draft',
  plan: 'pro',
  description:
    'Narrative-driven launch emails that adapt to tone, audience segment, and the feature you want to spotlight.',
  tags: ['marketing', 'email', 'launch'],
  createdAt: '2025-02-18T10:12:00.000Z',
  lastSavedAt: '2025-03-05T08:45:00.000Z',
  lastRunAt: '2025-03-05T08:30:00.000Z',
  runsToday: 4,
  runsTotal: 132,
  watermark: false,
  activeVariantId: 'A',
  variants: [
    {
      id: 'A',
      label: 'Variant A',
      description: 'Concise GTM announcement tailored for early adopters.',
      enabled: true,
      blocks: {
        system:
          'You are an award-winning SaaS copywriter. Craft clear, energizing product launch emails that balance storytelling with sharp positioning.',
        instruction:
          'Write an announcement email for {product} aimed at {audience}. Use a {tone} tone, highlight the {feature}, and conclude with {call_to_action}.',
        toolHints: 'Focus on benefits before features. Include one proof point when possible.',
        notes: 'Variant A is optimized for newsletter-style sends and short hero sections.',
        examples: [
          {
            id: 'ex-a1',
            label: 'Launch to growth leads',
            enabled: true,
            input: 'Product: Signalboard | Audience: growth_marketers | Tone: excited',
            output:
              'Subject: Signalboard catches funnel issues before your spend leaks\n\nHey growth team — Signalboard just went live...\n\nStart your free trial today.',
          },
          {
            id: 'ex-a2',
            label: 'Enterprise sample',
            enabled: true,
            input: 'Product: Helios Analytics | Audience: enterprise_accounts | Tone: professional',
            output:
              'Subject: Helios keeps every exec report audit-ready\n\nHello team — Helios now assembles SOC2-ready dashboards in minutes...\n\nSchedule a discovery call.',
          },
        ],
      },
    },
    {
      id: 'B',
      label: 'Variant B',
      description: 'Story-driven launch narrative for fans and community releases.',
      enabled: true,
      blocks: {
        system:
          'You are a narrative marketer. Paint vivid before-and-after stories that make new features feel inevitable.',
        instruction:
          'Craft a story-led launch email for {product}. Begin with the problem {audience} faces, weave in how {feature} resolves it, and close with {call_to_action}. Keep the tone {tone}.',
        toolHints: 'Use sensory details, highlight transformation, and avoid more than three sentences per paragraph.',
        notes: 'Variant B is ideal for community updates and founder-led send lists.',
        examples: [
          {
            id: 'ex-b1',
            label: 'Narrative sample',
            enabled: true,
            input: 'Product: Aurora Analytics | Audience: founders | Tone: inspirational',
            output:
              'Subject: When your dashboard becomes a co-founder\n\nFounders tell us the same story: dashboards shouting after the damage is done...\n\nBook a live demo.',
          },
        ],
      },
    },
  ],
  variables: [
    {
      id: 'var-product',
      name: 'product',
      label: 'Product',
      type: 'string',
      defaultValue: 'Aurora Analytics',
      description: 'Name of the product being announced.',
      required: true,
    },
    {
      id: 'var-audience',
      name: 'audience',
      label: 'Audience',
      type: 'enum',
      defaultValue: 'product_marketers',
      description: 'Primary segment receiving the email.',
      required: true,
      options: [
        { label: 'Product marketers', value: 'product_marketers' },
        { label: 'Founders', value: 'founders' },
        { label: 'Customer success leads', value: 'cs_leads' },
      ],
    },
    {
      id: 'var-tone',
      name: 'tone',
      label: 'Tone',
      type: 'enum',
      defaultValue: 'excited',
      description: 'Desired voice for the announcement.',
      required: true,
      options: [
        { label: 'Excited', value: 'excited' },
        { label: 'Professional', value: 'professional' },
        { label: 'Inspiring', value: 'inspiring' },
      ],
    },
    {
      id: 'var-feature',
      name: 'feature',
      label: 'Headline feature',
      type: 'string',
      defaultValue: 'Realtime anomaly alerts',
      description: 'One hero capability to anchor the messaging.',
      required: false,
    },
    {
      id: 'var-cta',
      name: 'call_to_action',
      label: 'Call to action',
      type: 'string',
      defaultValue: 'Start your free trial',
      description: 'Closing line prompting action.',
      required: true,
    },
  ],
  testCases: [
    {
      id: 'case-launch-1',
      label: 'Early adopters',
      persona: 'Growth marketing lead at a SaaS startup',
      input: {
        product: 'Aurora Analytics',
        audience: 'product_marketers',
        tone: 'excited',
        call_to_action: 'Book a live demo',
        feature: 'Realtime anomaly alerts',
      },
      expectedTraits: ['Highlights metrics', 'Strong CTA'],
      tags: ['email', 'launch'],
      enabled: true,
      lastRunAt: '2025-03-05T08:30:00.000Z',
    },
    {
      id: 'case-launch-2',
      label: 'Enterprise accounts',
      persona: 'Director of Business Intelligence at an enterprise',
      input: {
        product: 'Aurora Analytics Enterprise',
        audience: 'enterprise_accounts',
        tone: 'professional',
        call_to_action: 'Schedule a discovery call',
        feature: 'SOC2 compliant reporting',
      },
      expectedTraits: ['Formal tone', 'Value propositions up front'],
      tags: ['enterprise'],
      enabled: true,
      lastRunAt: '2025-03-04T17:10:00.000Z',
    },
  ],
  runs: [
    {
      id: 'run-aurora-1',
      caseId: 'case-launch-1',
      variantId: 'A',
      output:
        'Subject: Introducing Aurora Analytics — alerts before churn spikes\n\nAurora now flags funnel anomalies hours before they become churn...\n\nBook a live demo today.',
      tokensPrompt: 312,
      tokensOutput: 436,
      cost: 0.092,
      latencyMs: 2100,
      pass: true,
      createdAt: '2025-03-05T08:30:00.000Z',
      modelName: 'gpt-4o-mini',
      tags: ['passes', 'tone:excited'],
      inputSummary: 'Aurora Analytics → product_marketers',
    },
    {
      id: 'run-aurora-2',
      caseId: 'case-launch-2',
      variantId: 'B',
      output:
        'Subject: When reporting finally answers itself\n\nEvery quarter ends with the same scramble. Aurora Analytics Enterprise now assembles SOC2-ready decks in minutes...\n\nSchedule a discovery call.',
      tokensPrompt: 348,
      tokensOutput: 501,
      cost: 0.102,
      latencyMs: 2380,
      pass: false,
      createdAt: '2025-03-04T17:10:00.000Z',
      modelName: 'gpt-4o',
      tags: ['needs-review', 'too-long'],
      inputSummary: 'Aurora Analytics Enterprise → enterprise_accounts',
    },
  ],
  lintIssues: [
    {
      id: 'lint-launch-1',
      severity: 'warn',
      field: 'instruction',
      message: 'Placeholder {cta} is undefined. Did you mean {call_to_action}?',
      quickFix: 'Replace {cta} with {call_to_action} in the instruction block.',
    },
    {
      id: 'lint-launch-2',
      severity: 'info',
      field: 'examples',
      message: 'Variant B has only one example enabled. Consider adding another for better coverage.',
    },
  ],
  versions: [],
  model: { ...baseModel },
  shareSlug: null,
};

projectProductLaunch.versions = [
  {
    id: 'ver-launch-3',
    version: 3,
    label: 'v3 · Persona CTA upgrade',
    notes: 'Added persona-specific CTA and tightened the opening paragraph for variant A.',
    createdAt: '2025-03-02T14:10:00.000Z',
    author: 'Karthik',
    diffSummary: 'Renamed CTA variable and refined variant A instructions.',
    payload: clone({
      variants: projectProductLaunch.variants,
      variables: projectProductLaunch.variables,
      model: projectProductLaunch.model,
      activeVariantId: projectProductLaunch.activeVariantId,
    }),
  },
  {
    id: 'ver-launch-2',
    version: 2,
    label: 'v2 · Added enterprise persona',
    notes: 'Introduced an enterprise-focused example and tool hint.',
    createdAt: '2025-02-24T10:30:00.000Z',
    author: 'Aanya',
    diffSummary: 'New example plus proof point guidance in tool hints.',
    payload: clone({
      variants: projectProductLaunch.variants,
      variables: projectProductLaunch.variables,
      model: projectProductLaunch.model,
      activeVariantId: projectProductLaunch.activeVariantId,
    }),
  },
];

const projectSupportTriage: PromptBuilderProject = {
  id: 'proj-support-triage',
  slug: 'support-triage-agent',
  title: 'Customer Support Triage Coach',
  status: 'published',
  plan: 'free',
  description:
    'Turn raw support tickets into structured summaries, suggested replies, and priority tags with one click.',
  tags: ['support', 'operations'],
  createdAt: '2024-11-12T09:00:00.000Z',
  lastSavedAt: '2025-02-27T15:20:00.000Z',
  lastRunAt: '2025-02-27T15:15:00.000Z',
  runsToday: 8,
  runsTotal: 412,
  watermark: true,
  activeVariantId: 'A',
  variants: [
    {
      id: 'A',
      label: 'Variant A',
      description: 'Summaries and reply drafts for inbound tickets.',
      enabled: true,
      blocks: {
        system:
          'You are an empathetic customer support assistant. Triage, summarize, and propose action items for incoming tickets.',
        instruction:
          'Summarize the ticket, classify severity, and suggest a reply tone for {product_area}. Highlight if {is_vip} is true. Use {preferred_language}.',
        toolHints: 'Return JSON with keys summary, severity, reply, tone, tags. Always ask for missing details.',
        examples: [
          {
            id: 'ex-support-1',
            label: 'Delayed shipment',
            enabled: true,
            input: 'Issue: Shipment delayed by 6 days | VIP: true | Language: en',
            output: 'Severity: high | Summary: Customer waiting for package, apologetic tone recommended.',
          },
        ],
      },
    },
  ],
  variables: [
    {
      id: 'var-issue',
      name: 'product_area',
      label: 'Product area',
      type: 'enum',
      defaultValue: 'shipping',
      description: 'Ticket area used to route suggestions.',
      required: true,
      options: [
        { label: 'Shipping', value: 'shipping' },
        { label: 'Billing', value: 'billing' },
        { label: 'Product bug', value: 'bug' },
      ],
    },
    {
      id: 'var-vip',
      name: 'is_vip',
      label: 'VIP customer',
      type: 'enum',
      defaultValue: 'false',
      description: 'Whether the customer is on a VIP plan.',
      required: true,
      options: [
        { label: 'No', value: 'false' },
        { label: 'Yes', value: 'true' },
      ],
    },
    {
      id: 'var-language',
      name: 'preferred_language',
      label: 'Response language',
      type: 'enum',
      defaultValue: 'en',
      description: 'Language to produce the reply in.',
      required: true,
      options: [
        { label: 'English', value: 'en' },
        { label: 'Spanish', value: 'es' },
        { label: 'French', value: 'fr' },
      ],
    },
  ],
  testCases: [
    {
      id: 'case-support-1',
      label: 'Refund request',
      persona: 'Support specialist reviewing billing issues',
      input: {
        product_area: 'billing',
        is_vip: 'false',
        preferred_language: 'en',
      },
      expectedTraits: ['Shows empathy', 'Includes refund policy reminder'],
      tags: ['billing', 'refund'],
      enabled: true,
      lastRunAt: '2025-02-27T15:15:00.000Z',
    },
  ],
  runs: [
    {
      id: 'run-support-1',
      caseId: 'case-support-1',
      variantId: 'A',
      output:
        'Summary: Customer double charged. Severity: medium. Suggested reply: apologize, confirm refund timeline, share invoice portal link.',
      tokensPrompt: 210,
      tokensOutput: 260,
      cost: 0.041,
      latencyMs: 1540,
      pass: true,
      createdAt: '2025-02-27T15:15:00.000Z',
      modelName: 'gpt-4o-mini',
      tags: ['passes'],
      inputSummary: 'Billing refund request',
    },
  ],
  lintIssues: [
    {
      id: 'lint-support-1',
      severity: 'info',
      field: 'instruction',
      message: 'Consider clarifying what to do when {preferred_language} is not supported.',
    },
  ],
  versions: [],
  model: { ...baseModel },
  shareSlug: 'support-triage-agent',
};

projectSupportTriage.versions = [
  {
    id: 'ver-support-1',
    version: 1,
    label: 'v1 · Initial release',
    notes: 'Baseline prompt for triage and suggested reply.',
    createdAt: '2024-11-12T09:00:00.000Z',
    author: 'Priya',
    diffSummary: 'Initial structure with JSON output and severity tags.',
    payload: clone({
      variants: projectSupportTriage.variants,
      variables: projectSupportTriage.variables,
      model: baseModel,
      activeVariantId: 'A',
    }),
  },
];

const projectSqlAuthor: PromptBuilderProject = {
  id: 'proj-sql-author',
  slug: 'sql-query-author',
  title: 'SQL Query Author & Explainer',
  status: 'draft',
  plan: 'pro',
  description: 'Generate SQL queries, plain-language explanations, and safe guards for analysts.',
  tags: ['engineering', 'data'],
  createdAt: '2025-01-14T11:22:00.000Z',
  lastSavedAt: '2025-03-01T07:40:00.000Z',
  lastRunAt: '2025-03-01T07:32:00.000Z',
  runsToday: 3,
  runsTotal: 96,
  watermark: false,
  activeVariantId: 'A',
  variants: [
    {
      id: 'A',
      label: 'Variant A',
      description: 'Direct SQL query generation with summary.',
      enabled: true,
      blocks: {
        system:
          'You are a senior analytics engineer. Generate safe SQL and explain how it works in plain language.',
        instruction:
          'Write a SQL query for {question}. Use the {dialect} dialect and limit results to {row_limit} rows. Include a short explanation.',
        toolHints: 'Return JSON with keys sql, explanation, tablesUsed. Reject dangerous statements.',
        examples: [
          {
            id: 'ex-sql-1',
            label: 'Orders summary',
            enabled: true,
            input: 'Question: Monthly revenue by plan | Dialect: postgres',
            output: 'SQL: SELECT date_trunc(...); Explanation: Calculates monthly revenue grouped by plan.',
          },
        ],
      },
    },
    {
      id: 'B',
      label: 'Variant B',
      description: 'Adds guardrails and query cost estimate.',
      enabled: false,
      blocks: {
        system:
          'You are a data governance specialist. Provide SQL plus runtime considerations and guardrails.',
        instruction:
          'Generate SQL for {question}. Include warnings if tables are sensitive. Output JSON with sql, explanation, warnings, estimatedCost.',
        toolHints: 'Check for unbounded scans. Encourage using date filters when missing.',
        examples: [],
      },
    },
  ],
  variables: [
    {
      id: 'var-question',
      name: 'question',
      label: 'Analysis question',
      type: 'string',
      defaultValue: 'What is the 7-day retention by plan?',
      description: 'Plain language description of the desired query.',
      required: true,
    },
    {
      id: 'var-dialect',
      name: 'dialect',
      label: 'SQL dialect',
      type: 'enum',
      defaultValue: 'postgres',
      description: 'SQL dialect to output.',
      required: true,
      options: [
        { label: 'Postgres', value: 'postgres' },
        { label: 'BigQuery', value: 'bigquery' },
        { label: 'Snowflake', value: 'snowflake' },
      ],
    },
    {
      id: 'var-limit',
      name: 'row_limit',
      label: 'Row limit',
      type: 'number',
      defaultValue: '100',
      description: 'Maximum number of rows to return.',
      required: false,
      min: 10,
      max: 1000,
    },
  ],
  testCases: [
    {
      id: 'case-sql-1',
      label: 'Active users',
      persona: 'Analytics engineer verifying daily active users query',
      input: {
        question: 'How many active users each day last week?',
        dialect: 'postgres',
        row_limit: '100',
      },
      expectedTraits: ['Includes date filter', 'Uses indexed columns'],
      tags: ['analytics'],
      enabled: true,
      lastRunAt: '2025-03-01T07:32:00.000Z',
    },
  ],
  runs: [
    {
      id: 'run-sql-1',
      caseId: 'case-sql-1',
      variantId: 'A',
      output: 'SQL: SELECT date_trunc(...). Explanation: Aggregates active users by day for last 7 days.',
      tokensPrompt: 250,
      tokensOutput: 310,
      cost: 0.061,
      latencyMs: 1820,
      pass: true,
      createdAt: '2025-03-01T07:32:00.000Z',
      modelName: 'gpt-4o-mini',
      tags: ['passes'],
      inputSummary: 'Daily active users last week',
    },
  ],
  lintIssues: [],
  versions: [],
  model: { ...baseModel, temperature: 0.2 },
  shareSlug: null,
};

projectSqlAuthor.versions = [
  {
    id: 'ver-sql-1',
    version: 1,
    label: 'v1 · SQL baseline',
    notes: 'Initial schema-aware query generator.',
    createdAt: '2025-01-14T11:22:00.000Z',
    author: 'Miguel',
    diffSummary: 'Baseline variant with explanation output.',
    payload: clone({
      variants: projectSqlAuthor.variants,
      variables: projectSqlAuthor.variables,
      model: baseModel,
      activeVariantId: 'A',
    }),
  },
];

const sampleProjects: PromptBuilderProject[] = [
  projectProductLaunch,
  projectSupportTriage,
  projectSqlAuthor,
];

const sampleTemplates: PromptBuilderTemplate[] = [
  {
    key: 'product-launch-email',
    title: 'Product Launch Email',
    category: 'Marketing',
    description: 'Announce new features with flexible tone, CTA, and persona variables.',
    useCases: ['Product updates', 'Feature releases', 'Launch campaigns'],
    tags: ['email', 'marketing'],
    estimatedTokens: 780,
    recommendedModel: 'gpt-4o-mini',
    variables: projectProductLaunch.variables,
    blocks: {
      system: projectProductLaunch.variants[0].blocks.system,
      instruction: projectProductLaunch.variants[0].blocks.instruction,
      toolHints: projectProductLaunch.variants[0].blocks.toolHints,
    },
  },
  {
    key: 'support-triage',
    title: 'Support Triage',
    category: 'Support',
    description: 'Summarize tickets, assign severity, and propose replies with empathy toggles.',
    useCases: ['Customer support', 'Helpdesk automation'],
    tags: ['support', 'operations'],
    estimatedTokens: 520,
    recommendedModel: 'gpt-4o-mini',
    variables: projectSupportTriage.variables,
    blocks: {
      system: projectSupportTriage.variants[0].blocks.system,
      instruction: projectSupportTriage.variants[0].blocks.instruction,
      toolHints: projectSupportTriage.variants[0].blocks.toolHints,
    },
  },
  {
    key: 'sql-author',
    title: 'SQL Author & Explainer',
    category: 'Engineering',
    description: 'Generate safe SQL with natural language explanations and guardrails.',
    useCases: ['Analytics engineering', 'Self-serve BI'],
    tags: ['data', 'engineering'],
    estimatedTokens: 640,
    recommendedModel: 'gpt-4o-mini',
    variables: projectSqlAuthor.variables,
    blocks: {
      system: projectSqlAuthor.variants[0].blocks.system,
      instruction: projectSqlAuthor.variants[0].blocks.instruction,
      toolHints: projectSqlAuthor.variants[0].blocks.toolHints,
    },
  },
  {
    key: 'blog-outline',
    title: 'Thought Leadership Blog Outline',
    category: 'Marketing',
    description: 'Build detailed blog outlines with hooks, SEO keywords, and tone options.',
    useCases: ['Blog planning', 'Content marketing'],
    tags: ['writing'],
    estimatedTokens: 680,
    recommendedModel: 'gpt-4o-mini',
    variables: [
      {
        id: 'var-topic',
        name: 'topic',
        label: 'Blog topic',
        type: 'string',
        defaultValue: 'Responsible AI for product teams',
        description: 'Main topic for the outline.',
        required: true,
      },
      {
        id: 'var-keywords',
        name: 'keywords',
        label: 'SEO keywords',
        type: 'string',
        defaultValue: 'ai safety, ai roadmap',
        description: 'Comma separated keywords to weave in.',
        required: false,
      },
      {
        id: 'var-tone-blog',
        name: 'tone',
        label: 'Tone',
        type: 'enum',
        defaultValue: 'authoritative',
        description: 'Voice for the outline.',
        required: true,
        options: [
          { label: 'Authoritative', value: 'authoritative' },
          { label: 'Playful', value: 'playful' },
          { label: 'Practical', value: 'practical' },
        ],
      },
    ],
    blocks: {
      system:
        'You are an editorial strategist. Build thoughtful blog outlines with catchy hooks, well-ordered sections, and SEO awareness.',
      instruction:
        'Create a blog outline about {topic}. Include an intro hook, at least five sections, and recommendations for {tone} voice. Weave in {keywords}.',
      toolHints: 'Return Markdown with headings H2/H3. Include bullet points under each section.',
    },
  },
  {
    key: 'sales-discovery',
    title: 'Sales Discovery Call Planner',
    category: 'Operations',
    description: 'Generate call agendas, qualification questions, and follow-up templates.',
    useCases: ['Sales', 'CSM enablement'],
    tags: ['sales'],
    estimatedTokens: 560,
    recommendedModel: 'gpt-4o-mini',
    variables: [
      {
        id: 'var-solution',
        name: 'solution',
        label: 'Solution focus',
        type: 'string',
        defaultValue: 'Workflow automation platform',
        description: 'What you are selling or supporting.',
        required: true,
      },
      {
        id: 'var-persona',
        name: 'buyer_persona',
        label: 'Buyer persona',
        type: 'enum',
        defaultValue: 'operations_lead',
        description: 'Role you are meeting with.',
        required: true,
        options: [
          { label: 'Operations lead', value: 'operations_lead' },
          { label: 'Finance director', value: 'finance_director' },
          { label: 'IT manager', value: 'it_manager' },
        ],
      },
    ],
    blocks: {
      system:
        'You are a seasoned sales strategist. Design call agendas, qualification frameworks, and follow-up recommendations.',
      instruction:
        'Prepare a discovery call for {solution}. Outline agenda steps, five discovery questions for {buyer_persona}, and next-step suggestions.',
      toolHints: 'Return JSON with agenda, questions, recap, and objections to expect.',
    },
  },
];

export const promptBuilderPlans = () => clone(plans);
export const samplePromptBuilderProjects = () => clone(sampleProjects);
export const samplePromptBuilderTemplates = () => clone(sampleTemplates);

export const findSamplePromptProjectById = (id: string) =>
  clone(sampleProjects.find((project) => project.id === id) ?? null);

export const findSamplePromptProjectBySlug = (slug: string) =>
  clone(sampleProjects.find((project) => project.slug === slug) ?? null);

export const toPromptSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'prompt';

export const createPromptProjectSkeleton = (
  overrides: Partial<PromptBuilderProject> = {},
): PromptBuilderProject => {
  const base: PromptBuilderProject = {
    id: overrides.id ?? `prompt-${Date.now()}`,
    slug: overrides.slug ?? toPromptSlug(overrides.title ?? 'untitled-prompt'),
    title: overrides.title ?? 'Untitled prompt',
    status: overrides.status ?? 'draft',
    plan: overrides.plan ?? 'free',
    description:
      overrides.description ??
      'Compose prompts with system, instruction, few-shot examples, variables, and a rigorous test bench.',
    tags: overrides.tags ?? ['workspace'],
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    lastSavedAt: overrides.lastSavedAt ?? new Date().toISOString(),
    lastRunAt: overrides.lastRunAt ?? null,
    runsToday: overrides.runsToday ?? 0,
    runsTotal: overrides.runsTotal ?? 0,
    watermark: overrides.watermark ?? overrides.plan === 'free',
    activeVariantId: overrides.activeVariantId ?? 'A',
    variants: overrides.variants ?? [
      {
        id: 'A',
        label: 'Variant A',
        description: 'Primary prompt variant',
        enabled: true,
        blocks: {
          system: 'You are a thoughtful assistant focused on clarity and safety.',
          instruction: 'Describe what the assistant should do using the provided variables.',
          toolHints: 'Mention model, constraints, and formatting expectations.',
          examples: [],
        },
      },
    ],
    variables: overrides.variables ?? [
      {
        id: 'var-subject',
        name: 'subject',
        label: 'Subject',
        type: 'string',
        defaultValue: '',
        description: 'Primary subject or topic for the prompt.',
        required: true,
      },
    ],
    testCases: overrides.testCases ?? [
      {
        id: 'case-default',
        label: 'Sample test case',
        persona: 'Example user persona',
        input: { subject: 'Sample topic' },
        expectedTraits: ['Clear', 'Helpful'],
        tags: ['sample'],
        enabled: true,
        lastRunAt: null,
      },
    ],
    runs: overrides.runs ?? [],
    lintIssues: overrides.lintIssues ?? [],
    versions: overrides.versions ?? [],
    model: overrides.model ?? { ...baseModel },
    shareSlug: overrides.shareSlug ?? null,
  };

  return base;
};

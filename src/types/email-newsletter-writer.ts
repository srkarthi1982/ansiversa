export type NewsletterKpi = {
  label: string;
  target: string;
  progress: number;
  trend: 'up' | 'steady' | 'down';
};

export type NewsletterBlockField = {
  label: string;
  value: string;
  tone?: string;
  emphasis?: 'primary' | 'secondary';
};

export type NewsletterBlock = {
  id: string;
  type: string;
  label: string;
  summary: string;
  metrics: {
    wordCount: number;
    links: number;
    media?: number;
  };
  fields: NewsletterBlockField[];
  warnings?: string[];
};

export type NewsletterAbVariant = {
  id: string;
  label: string;
  value: string;
  uplift?: number;
  tone?: string;
};

export type NewsletterAbTest = {
  id: string;
  target: 'subject' | 'preheader' | 'hero';
  hypothesis: string;
  variants: NewsletterAbVariant[];
  chosen: string | null;
};

export type NewsletterQaWarning = {
  id: string;
  category: 'spam' | 'accessibility' | 'compliance' | 'deliverability';
  message: string;
  suggestion: string;
  severity: 'low' | 'medium' | 'high';
};

export type NewsletterChecklistItem = {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'todo';
  note?: string;
};

export type NewsletterTheme = {
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    darkMode: string;
  };
  typography: {
    headings: string;
    body: string;
  };
  buttonShape: 'rounded' | 'pill' | 'square';
  spacing: 'cozy' | 'standard' | 'relaxed';
};

export type NewsletterIssueTimeline = {
  step: string;
  description: string;
  completed: boolean;
};

export type NewsletterIssue = {
  id: string;
  title: string;
  goal: string;
  audience: string;
  sendWindow: {
    start: string;
    end: string;
    timezone: string;
  };
  status: 'draft' | 'scheduled';
  kpis: NewsletterKpi[];
  subjectTests: NewsletterAbTest[];
  blocks: NewsletterBlock[];
  qa: {
    spamScore: number;
    accessibilityScore: number;
    deliverabilityStatus: 'pass' | 'warn' | 'fail';
    warnings: NewsletterQaWarning[];
    checklist: NewsletterChecklistItem[];
  };
  theme: NewsletterTheme;
  metrics: {
    readingTime: string;
    imageTextRatio: string;
    altCoverage: string;
    totalLinks: number;
    totalWords: number;
  };
  utmPreset: {
    name: string;
    parameters: {
      source: string;
      medium: string;
      campaign: string;
      term: string;
      content: string;
    };
    enabled: boolean;
  };
  timeline: NewsletterIssueTimeline[];
};

export type NewsletterBlockLibraryGroup = {
  id: string;
  title: string;
  icon: string;
  description: string;
  blocks: {
    id: string;
    name: string;
    summary: string;
    bestFor: string;
    fields: string[];
  }[];
};

export type NewsletterTemplate = {
  id: string;
  name: string;
  persona: string;
  highlights: string[];
  bestFor: string;
  timeToShip: string;
  tone: string;
};

export type NewsletterAutomation = {
  id: string;
  title: string;
  trigger: string;
  actions: string[];
  status: 'draft' | 'active';
  plan: 'free' | 'pro';
};

export type NewsletterIntegration = {
  id: string;
  name: string;
  category: string;
  capability: string;
  status: 'beta' | 'stable';
};

export type NewsletterExportJob = {
  id: string;
  format: 'html' | 'md' | 'json' | 'zip';
  status: 'queued' | 'running' | 'done' | 'error';
  startedAt: string;
  completedAt?: string;
  link?: string | null;
  notes?: string;
};

export type NewsletterPlanMatrixRow = {
  feature: string;
  free: string;
  pro: string;
};

export type NewsletterApiContract = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  requiresAuth: boolean;
  rateLimit: string;
};

export type NewsletterAiAssistant = {
  id: string;
  name: string;
  description: string;
  modes: string[];
  plan: 'free' | 'pro';
};

export type NewsletterQaHighlight = {
  title: string;
  items: {
    label: string;
    value: string;
    status: 'good' | 'warn';
    icon: string;
  }[];
};

export type NewsletterRoadmapStage = {
  quarter: string;
  items: string[];
};

export type EmailNewsletterWriterSample = {
  plan: 'free' | 'pro';
  usage: {
    issuesUsed: number;
    issuesLimit: number;
    exportsUsed: number;
    exportsLimit: number;
    lastExportAt: string;
  };
  issue: NewsletterIssue;
  blockLibrary: NewsletterBlockLibraryGroup[];
  templates: NewsletterTemplate[];
  automations: NewsletterAutomation[];
  integrations: NewsletterIntegration[];
  aiAssistants: NewsletterAiAssistant[];
  exportHistory: NewsletterExportJob[];
  planMatrix: NewsletterPlanMatrixRow[];
  apiContracts: NewsletterApiContract[];
  qaHighlights: NewsletterQaHighlight[];
  roadmap: NewsletterRoadmapStage[];
};

import Alpine from 'alpinejs';
import { BaseStore, clone } from '../../../alpineStores/base';

type FeedbackSentiment = 'positive' | 'neutral' | 'negative';
type FeedbackUrgency = 'low' | 'medium' | 'high';
type FeedbackImpact = 'low' | 'medium' | 'high';
type FeedbackAspect =
  | 'pricing'
  | 'support'
  | 'ux'
  | 'performance'
  | 'reliability'
  | 'features'
  | 'content'
  | 'onboarding'
  | 'docs';

type FeedbackEntry = {
  id: string;
  author: string;
  message: string;
  sentiment: FeedbackSentiment;
  aspect: FeedbackAspect;
  topic: string;
  themeId: string;
  urgency: FeedbackUrgency;
  impact: FeedbackImpact;
  source: 'csv' | 'paste' | 'form';
  cohort: { plan: string; region: string; version: string };
  createdAt: string;
  language: string;
  masked: boolean;
};

type ThemeInsight = {
  id: string;
  label: string;
  summary: string;
  sentiment: number;
  change: number;
  volume: number;
  urgent: number;
  share: number;
  sampleQuote: string;
  drivers: string[];
};

type AspectInsight = {
  key: FeedbackAspect;
  label: string;
  sentiment: number;
  change: number;
  coverage: number;
  highlights: string[];
};

type KeywordInsight = {
  term: string;
  weight: number;
};

type TimelinePoint = {
  label: string;
  total: number;
  negative: number;
  urgent: number;
};

type FeedbackAction = {
  id: string;
  title: string;
  impact: number;
  effort: number;
  priority: 'p0' | 'p1' | 'p2';
  status: 'todo' | 'doing' | 'done';
  owner: string | null;
  due: string | null;
  linkedTheme: string;
};

type FeedbackJob = {
  id: string;
  type: 'full' | 'refresh' | 'urgent';
  status: 'queued' | 'running' | 'done' | 'error';
  queuedAt: string;
  completedAt: string | null;
  summary: string | null;
};

type CohortBreakdown = Array<{ label: string; value: number; trend: number }>

type FeedbackProject = {
  id: string;
  name: string;
  description: string;
  plan: 'free' | 'pro';
  metrics: {
    total: number;
    newSince: number;
    timeframe: string;
    positive: number;
    neutral: number;
    negative: number;
    urgent: number;
    churnRisk: number;
    nps: number;
    csat: number;
  };
  cohorts: {
    plan: CohortBreakdown;
    region: CohortBreakdown;
    version: CohortBreakdown;
  };
  analysis: {
    lastRun: string;
    jobId: string;
    coverage: string;
    topThemes: ThemeInsight[];
    aspects: AspectInsight[];
    keywords: KeywordInsight[];
    urgentQueue: FeedbackEntry['id'][];
    timeline: TimelinePoint[];
    actions: FeedbackAction[];
    exports: Array<{ label: string; href: string }>;
  };
  feedback: FeedbackEntry[];
};

type FilterKey = 'sentiment' | 'aspect' | 'urgency' | 'cohort' | 'search';

type FilterValue =
  | FeedbackSentiment
  | FeedbackAspect
  | FeedbackUrgency
  | 'all'
  | string;

type HubState = {
  initialized: boolean;
  loading: boolean;
  projects: FeedbackProject[];
  activeProjectId: string;
  filters: Record<FilterKey, FilterValue>;
  filtered: FeedbackEntry[];
  selectedThemeId: string | null;
};

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const percentFormatter = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });

const sampleProjects: FeedbackProject[] = [
  {
    id: 'launchpad',
    name: 'Launchpad CX Pulse',
    description:
      'Aggregated product feedback from web, in-app, and concierge surveys focused on the Launchpad suite.',
    plan: 'pro',
    metrics: {
      total: 1248,
      newSince: 342,
      timeframe: 'Last 30 days',
      positive: 52,
      neutral: 27,
      negative: 21,
      urgent: 18,
      churnRisk: 12,
      nps: 36,
      csat: 4.2,
    },
    cohorts: {
      plan: [
        { label: 'Pro', value: 46, trend: -6 },
        { label: 'Growth', value: 32, trend: 4 },
        { label: 'Free', value: 22, trend: 2 },
      ],
      region: [
        { label: 'North America', value: 41, trend: -3 },
        { label: 'Europe', value: 28, trend: -8 },
        { label: 'APAC', value: 21, trend: 6 },
        { label: 'LATAM', value: 10, trend: 5 },
      ],
      version: [
        { label: '2.4.1', value: 36, trend: -11 },
        { label: '2.4.0', value: 27, trend: 8 },
        { label: 'Beta 2.5', value: 18, trend: 6 },
        { label: 'Legacy', value: 19, trend: -3 },
      ],
    },
    analysis: {
      lastRun: '2024-05-21T09:30:00Z',
      jobId: 'JOB-5823',
      coverage: 'Rolling 30 days · Multi-language (en, es, fr)',
      topThemes: [
        {
          id: 'theme-support-latency',
          label: 'Support response delays',
          summary: 'Tickets sit for 20+ hours without first reply, especially escalations routed through Tier 1.',
          sentiment: -0.72,
          change: -12,
          volume: 68,
          urgent: 14,
          share: 0.24,
          sampleQuote:
            'Still waiting 2 days later for an answer. For urgent billing outages, we need a human on the line faster.',
          drivers: ['Escalation queue hand-offs', 'Weekend coverage gaps', 'Billing outage playbooks'],
        },
        {
          id: 'theme-navigation-friction',
          label: 'Navigation friction in dashboard',
          summary: 'Teams get lost in the redesigned sidebar and can’t find analytics views without search.',
          sentiment: -0.31,
          change: -4,
          volume: 52,
          urgent: 6,
          share: 0.18,
          sampleQuote: 'I love the new look but keep clicking 5 times to reach team usage analytics.',
          drivers: ['Analytics entry point buried', 'Collapsed workspace defaults', 'Limited breadcrumbs'],
        },
        {
          id: 'theme-billing-clarity',
          label: 'Billing clarity for annual renewals',
          summary: 'Finance admins ask for clearer invoices and reminders about renewal windows.',
          sentiment: -0.45,
          change: 9,
          volume: 44,
          urgent: 3,
          share: 0.16,
          sampleQuote: 'Invoice PDF lacks PO reference which finance requires. Renewal email landed on the wrong contact.',
          drivers: ['Missing PO fields', 'Renewal reminders misrouted', 'Need localized invoices'],
        },
        {
          id: 'theme-ai-accuracy',
          label: 'AI accuracy wins',
          summary: 'Positive lift after last release — summaries and ticket routing now match expectations.',
          sentiment: 0.64,
          change: 18,
          volume: 36,
          urgent: 0,
          share: 0.12,
          sampleQuote: 'Agent assist is finally suggesting the same resolution the team uses — huge time saver.',
          drivers: ['Retraining on fresh dataset', 'Confidence thresholds tuned', 'Feedback loop instrumentation'],
        },
      ],
      aspects: [
        {
          key: 'support',
          label: 'Support',
          sentiment: -0.42,
          change: -8,
          coverage: 0.28,
          highlights: ['First response time +38%', 'Escalation policy confusing', 'Weekend gap called out 12×'],
        },
        {
          key: 'ux',
          label: 'UX',
          sentiment: -0.08,
          change: 6,
          coverage: 0.22,
          highlights: ['Navigation restructure trending', 'Accessibility wins called out', 'Need keyboard shortcuts'],
        },
        {
          key: 'pricing',
          label: 'Pricing',
          sentiment: -0.12,
          change: 4,
          coverage: 0.17,
          highlights: ['Annual vs monthly confusion', 'Value vs competitor noted', 'Need volume discounts for LATAM'],
        },
        {
          key: 'features',
          label: 'Features',
          sentiment: 0.21,
          change: 11,
          coverage: 0.19,
          highlights: ['AI routing praised', 'Need export templates', 'Automation builder asks'],
        },
      ],
      keywords: [
        { term: 'response time', weight: 0.82 },
        { term: 'renewal invoice', weight: 0.66 },
        { term: 'navigation', weight: 0.54 },
        { term: 'escalation', weight: 0.49 },
        { term: 'agent assist', weight: 0.38 },
      ],
      urgentQueue: ['FB-1021', 'FB-1042', 'FB-1066'],
      timeline: [
        { label: 'Week 1', total: 302, negative: 76, urgent: 22 },
        { label: 'Week 2', total: 318, negative: 64, urgent: 18 },
        { label: 'Week 3', total: 326, negative: 58, urgent: 16 },
        { label: 'Week 4', total: 302, negative: 48, urgent: 12 },
      ],
      actions: [
        {
          id: 'ACT-91',
          title: 'Accelerate support escalations with 24/7 rota + pager',
          impact: 5,
          effort: 3,
          priority: 'p0',
          status: 'doing',
          owner: 'Gina (Support)',
          due: '2024-05-31',
          linkedTheme: 'theme-support-latency',
        },
        {
          id: 'ACT-92',
          title: 'Ship dashboard quick-launch links and tutorial spotlight',
          impact: 4,
          effort: 2,
          priority: 'p1',
          status: 'todo',
          owner: 'Drew (Design)',
          due: '2024-06-07',
          linkedTheme: 'theme-navigation-friction',
        },
        {
          id: 'ACT-94',
          title: 'Add PO and tax fields to invoices + multi-contact reminder flow',
          impact: 4,
          effort: 3,
          priority: 'p1',
          status: 'todo',
          owner: 'Lina (Billing)',
          due: '2024-06-14',
          linkedTheme: 'theme-billing-clarity',
        },
      ],
      exports: [
        { label: 'Download PDF report', href: '#' },
        { label: 'Export CSV', href: '#' },
        { label: 'Copy Markdown digest', href: '#' },
      ],
    },
    feedback: [
      {
        id: 'FB-1021',
        author: '<email_1021>',
        message:
          'Billing outage on Friday and we only got a bot response until Monday. Need a hotline for enterprise incidents.',
        sentiment: 'negative',
        aspect: 'support',
        topic: 'Escalations',
        themeId: 'theme-support-latency',
        urgency: 'high',
        impact: 'high',
        source: 'csv',
        cohort: { plan: 'Pro', region: 'North America', version: '2.4.1' },
        createdAt: '2024-05-17T13:04:00Z',
        language: 'en',
        masked: true,
      },
      {
        id: 'FB-1034',
        author: '<email_1034>',
        message:
          'The redesigned navigation hides workspace analytics behind three clicks. We onboard managers every week and this slows us down.',
        sentiment: 'negative',
        aspect: 'ux',
        topic: 'Navigation',
        themeId: 'theme-navigation-friction',
        urgency: 'medium',
        impact: 'medium',
        source: 'form',
        cohort: { plan: 'Growth', region: 'Europe', version: '2.4.0' },
        createdAt: '2024-05-19T08:33:00Z',
        language: 'en',
        masked: true,
      },
      {
        id: 'FB-1039',
        author: '<email_1039>',
        message: 'Renewal invoice arrived without PO reference. Finance rejected it and the renewal is stuck.',
        sentiment: 'negative',
        aspect: 'pricing',
        topic: 'Invoicing',
        themeId: 'theme-billing-clarity',
        urgency: 'high',
        impact: 'high',
        source: 'csv',
        cohort: { plan: 'Pro', region: 'Europe', version: '2.4.1' },
        createdAt: '2024-05-18T10:15:00Z',
        language: 'en',
        masked: true,
      },
      {
        id: 'FB-1042',
        author: '<email_1042>',
        message:
          'Agent assist is finally getting our macros right. Negative sentiment tickets were triaged twice as fast this week.',
        sentiment: 'positive',
        aspect: 'features',
        topic: 'AI assist',
        themeId: 'theme-ai-accuracy',
        urgency: 'medium',
        impact: 'medium',
        source: 'paste',
        cohort: { plan: 'Growth', region: 'North America', version: '2.4.0' },
        createdAt: '2024-05-16T17:44:00Z',
        language: 'en',
        masked: false,
      },
      {
        id: 'FB-1055',
        author: '<email_1055>',
        message:
          'Need localized invoices for Brazil with tax IDs. Currently exporting manually and editing which is error prone.',
        sentiment: 'negative',
        aspect: 'pricing',
        topic: 'Localization',
        themeId: 'theme-billing-clarity',
        urgency: 'medium',
        impact: 'medium',
        source: 'form',
        cohort: { plan: 'Growth', region: 'LATAM', version: '2.4.0' },
        createdAt: '2024-05-15T12:11:00Z',
        language: 'en',
        masked: true,
      },
      {
        id: 'FB-1066',
        author: '<email_1066>',
        message:
          'Weekend coverage is still missing. We lost a client because a Saturday outage wasn’t acknowledged until Monday.',
        sentiment: 'negative',
        aspect: 'support',
        topic: 'Weekend coverage',
        themeId: 'theme-support-latency',
        urgency: 'high',
        impact: 'high',
        source: 'csv',
        cohort: { plan: 'Pro', region: 'North America', version: '2.4.1' },
        createdAt: '2024-05-12T09:27:00Z',
        language: 'en',
        masked: true,
      },
      {
        id: 'FB-1071',
        author: '<email_1071>',
        message:
          'Our product ops team appreciates the summaries — the aspect breakdown made our triage faster.',
        sentiment: 'positive',
        aspect: 'features',
        topic: 'Summaries',
        themeId: 'theme-ai-accuracy',
        urgency: 'low',
        impact: 'medium',
        source: 'form',
        cohort: { plan: 'Free', region: 'North America', version: '2.4.1' },
        createdAt: '2024-05-11T14:52:00Z',
        language: 'en',
        masked: false,
      },
    ],
  },
  {
    id: 'education-beta',
    name: 'EduFlow Beta Feedback',
    description: 'Early adopter program for EduFlow, our learning analytics workspace.',
    plan: 'free',
    metrics: {
      total: 312,
      newSince: 78,
      timeframe: 'Last 14 days',
      positive: 61,
      neutral: 23,
      negative: 16,
      urgent: 5,
      churnRisk: 3,
      nps: 48,
      csat: 4.6,
    },
    cohorts: {
      plan: [
        { label: 'Academia', value: 58, trend: 5 },
        { label: 'Bootcamps', value: 27, trend: 3 },
        { label: 'Corporate', value: 15, trend: -2 },
      ],
      region: [
        { label: 'North America', value: 44, trend: 2 },
        { label: 'Europe', value: 31, trend: 4 },
        { label: 'APAC', value: 17, trend: -1 },
        { label: 'LATAM', value: 8, trend: 2 },
      ],
      version: [
        { label: 'Beta 1.2', value: 45, trend: 7 },
        { label: 'Beta 1.1', value: 33, trend: -4 },
        { label: 'Legacy', value: 22, trend: -2 },
      ],
    },
    analysis: {
      lastRun: '2024-05-20T18:00:00Z',
      jobId: 'JOB-5614',
      coverage: 'Last 14 days · English + Spanish',
      topThemes: [
        {
          id: 'theme-insights-depth',
          label: 'Deeper learner insights requested',
          summary: 'Instructors want cohort drilldowns and exportable visuals directly from the dashboard.',
          sentiment: -0.18,
          change: -5,
          volume: 28,
          urgent: 2,
          share: 0.21,
          sampleQuote: 'Love the trending charts but need to export cohort-level CSVs for our LMS sync.',
          drivers: ['Cohort filters limited', 'No CSV export yet', 'Need API hooks'],
        },
        {
          id: 'theme-reports-love',
          label: 'Positive response to weekly pulse reports',
          summary: 'Automated weekly digest emails praised for saving time on manual reporting.',
          sentiment: 0.58,
          change: 14,
          volume: 24,
          urgent: 0,
          share: 0.18,
          sampleQuote: 'Weekly digest email is perfect. No more Sunday night reporting.',
          drivers: ['Digest email format', 'In-app summary parity', 'Shareable PDF export'],
        },
      ],
      aspects: [
        {
          key: 'content',
          label: 'Content',
          sentiment: 0.32,
          change: 9,
          coverage: 0.18,
          highlights: ['Lessons auto-tagged correctly', 'Quiz breakdowns loved', 'Need more rubric templates'],
        },
        {
          key: 'ux',
          label: 'UX',
          sentiment: 0.22,
          change: 5,
          coverage: 0.24,
          highlights: ['Navigation simplified', 'Dark mode requested', 'Mobile view improvements'],
        },
        {
          key: 'features',
          label: 'Features',
          sentiment: 0.11,
          change: 7,
          coverage: 0.27,
          highlights: ['Need API exports', 'Want custom KPIs', 'Celebrate pulse reports'],
        },
      ],
      keywords: [
        { term: 'pulse reports', weight: 0.71 },
        { term: 'cohort export', weight: 0.52 },
        { term: 'dark mode', weight: 0.33 },
      ],
      urgentQueue: ['FB-2104'],
      timeline: [
        { label: 'Week 1', total: 148, negative: 32, urgent: 7 },
        { label: 'Week 2', total: 164, negative: 28, urgent: 5 },
      ],
      actions: [
        {
          id: 'ACT-31',
          title: 'Ship cohort CSV export endpoint',
          impact: 4,
          effort: 2,
          priority: 'p1',
          status: 'todo',
          owner: 'Harper (Engineering)',
          due: '2024-06-05',
          linkedTheme: 'theme-insights-depth',
        },
      ],
      exports: [
        { label: 'Download latest digest', href: '#' },
        { label: 'View API schema', href: '#' },
      ],
    },
    feedback: [
      {
        id: 'FB-2104',
        author: '<email_2104>',
        message:
          'Need API exports for cohort engagement. Right now we manually copy charts into our LMS reports.',
        sentiment: 'negative',
        aspect: 'features',
        topic: 'Exports',
        themeId: 'theme-insights-depth',
        urgency: 'medium',
        impact: 'medium',
        source: 'paste',
        cohort: { plan: 'Academia', region: 'North America', version: 'Beta 1.2' },
        createdAt: '2024-05-19T10:17:00Z',
        language: 'en',
        masked: true,
      },
      {
        id: 'FB-2107',
        author: '<email_2107>',
        message: 'Weekly pulse report is saving me a ton of time. Please never remove it.',
        sentiment: 'positive',
        aspect: 'features',
        topic: 'Pulse reports',
        themeId: 'theme-reports-love',
        urgency: 'low',
        impact: 'medium',
        source: 'form',
        cohort: { plan: 'Bootcamps', region: 'Europe', version: 'Beta 1.2' },
        createdAt: '2024-05-18T08:20:00Z',
        language: 'en',
        masked: false,
      },
      {
        id: 'FB-2110',
        author: '<email_2110>',
        message: 'Loving the quiz analytics but still need rubric templates for project-based grading.',
        sentiment: 'neutral',
        aspect: 'content',
        topic: 'Rubrics',
        themeId: 'theme-insights-depth',
        urgency: 'low',
        impact: 'medium',
        source: 'form',
        cohort: { plan: 'Academia', region: 'North America', version: 'Beta 1.1' },
        createdAt: '2024-05-16T16:46:00Z',
        language: 'en',
        masked: false,
      },
    ],
  },
];

const initialJobs: FeedbackJob[] = [
  {
    id: 'JOB-5823',
    type: 'full',
    status: 'done',
    queuedAt: '2024-05-21T09:29:00Z',
    completedAt: '2024-05-21T09:30:00Z',
    summary: 'Sentiment -0.12 • 3 urgent clusters • RICE-backed actions ready',
  },
  {
    id: 'JOB-5741',
    type: 'urgent',
    status: 'done',
    queuedAt: '2024-05-18T21:03:00Z',
    completedAt: '2024-05-18T21:03:45Z',
    summary: 'Urgent queue refreshed • 2 high-risk accounts flagged',
  },
  {
    id: 'JOB-5688',
    type: 'refresh',
    status: 'done',
    queuedAt: '2024-05-15T12:00:00Z',
    completedAt: '2024-05-15T12:01:10Z',
    summary: 'Aspect calibration updated with AI accuracy wins',
  },
];

class FeedbackStore extends BaseStore {
  hub: HubState = {
    initialized: false,
    loading: false,
    projects: sampleProjects.map((project) => clone(project)),
    activeProjectId: sampleProjects[0]?.id ?? '',
    filters: {
      sentiment: 'all',
      aspect: 'all',
      urgency: 'all',
      cohort: 'all',
      search: '',
    },
    filtered: [],
    selectedThemeId: sampleProjects[0]?.analysis.topThemes[0]?.id ?? null,
  };

  jobs: FeedbackJob[] = initialJobs.map((job) => ({ ...job }));

  onInit(location: Location) {
    if (location.pathname.startsWith('/client-feedback-analyzer')) {
      this.initHub();
    }
  }

  get activeProject(): FeedbackProject | null {
    const { activeProjectId, projects } = this.hub;
    return projects.find((project) => project.id === activeProjectId) ?? null;
  }

  get activeAnalysis() {
    return this.activeProject?.analysis ?? null;
  }

  get activeTheme(): ThemeInsight | null {
    const analysis = this.activeAnalysis;
    if (!analysis) return null;
    return analysis.topThemes.find((theme) => theme.id === this.hub.selectedThemeId) ?? null;
  }

  get themeSampleFeedback(): FeedbackEntry[] {
    const project = this.activeProject;
    const themeId = this.hub.selectedThemeId;
    if (!project || !themeId) return [];
    return project.feedback.filter((entry) => entry.themeId === themeId);
  }

  initHub() {
    if (this.hub.initialized) return;
    this.hub.initialized = true;
    this.refreshFiltered();
  }

  setActiveProject(id: string) {
    if (this.hub.activeProjectId === id) return;
    this.hub.activeProjectId = id;
    const project = this.activeProject;
    this.hub.selectedThemeId = project?.analysis.topThemes[0]?.id ?? null;
    this.refreshFiltered();
  }

  updateFilter(key: FilterKey, value: FilterValue) {
    if (this.hub.filters[key] === value) return;
    this.hub.filters[key] = value;
    this.refreshFiltered();
  }

  clearFilters() {
    this.hub.filters = { sentiment: 'all', aspect: 'all', urgency: 'all', cohort: 'all', search: '' };
    this.refreshFiltered();
  }

  selectTheme(id: string) {
    this.hub.selectedThemeId = id;
  }

  runAnalysis(type: FeedbackJob['type'] = 'full') {
    const project = this.activeProject;
    if (!project) return;
    const jobId = `JOB-${Math.floor(Math.random() * 9000 + 1000)}`;
    const newJob: FeedbackJob = {
      id: jobId,
      type,
      status: 'running',
      queuedAt: new Date().toISOString(),
      completedAt: null,
      summary: null,
    };
    this.jobs = [newJob, ...this.jobs];
    this.setLoaderVisible(true);
    setTimeout(() => {
      newJob.status = 'done';
      newJob.completedAt = new Date().toISOString();
      newJob.summary = `${numberFormatter.format(project.metrics.total)} rows analysed • ${percentFormatter.format(
        project.metrics.negative / 100
      )} negative • ${project.analysis.topThemes[0]?.label ?? 'No themes yet'}`;
      this.setLoaderVisible(false);
      this.refreshFiltered();
    }, 600);
  }

  private refreshFiltered() {
    const project = this.activeProject;
    if (!project) {
      this.hub.filtered = [];
      return;
    }
    const { filters } = this.hub;
    const filtered = project.feedback.filter((entry) => {
      if (filters.sentiment !== 'all' && entry.sentiment !== filters.sentiment) return false;
      if (filters.aspect !== 'all' && entry.aspect !== filters.aspect) return false;
      if (filters.urgency !== 'all' && entry.urgency !== filters.urgency) return false;
      if (filters.cohort !== 'all') {
        const match = [entry.cohort.plan, entry.cohort.region, entry.cohort.version]
          .map((value) => value.toLowerCase())
          .some((value) => value.includes(String(filters.cohort).toLowerCase()));
        if (!match) return false;
      }
      if (filters.search) {
        const query = String(filters.search).toLowerCase();
        const haystack = `${entry.message} ${entry.topic} ${entry.themeId}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
    this.hub.filtered = filtered;
    this.ensureSelectedTheme();
  }

  private ensureSelectedTheme() {
    const analysis = this.activeAnalysis;
    if (!analysis) {
      this.hub.selectedThemeId = null;
      return;
    }
    const currentId = this.hub.selectedThemeId;
    const exists = currentId && analysis.topThemes.some((theme) => theme.id === currentId);
    if (!exists) {
      this.hub.selectedThemeId = analysis.topThemes[0]?.id ?? null;
    }
  }
}

declare global {
  interface Window {
    feedbackStore?: FeedbackStore;
  }
}

document.addEventListener('alpine:init', () => {
  const store = new FeedbackStore();
  Alpine.store('feedback', store);
  window.feedbackStore = store;
});


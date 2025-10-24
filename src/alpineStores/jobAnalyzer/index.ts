import Alpine from 'alpinejs';
import { BaseStore } from '../base';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

type AnalysisStepStatus = 'pending' | 'running' | 'done';

type AnalysisStep = {
  key: string;
  label: string;
  status: AnalysisStepStatus;
};

type SkillCategory = {
  label: string;
  items: string[];
};

type KeywordSuggestion = {
  term: string;
  priority: 'required' | 'optional';
  frequency: string;
  context: string;
};

type GapModule = {
  title: string;
  hours: number;
  resource: string;
  link: string;
};

type MatchBreakdown = {
  key: string;
  label: string;
  weight: number;
  score: number;
  description: string;
};

type HistoryRecord = {
  id: string;
  title: string;
  company: string;
  location: string;
  planRequired: 'free' | 'pro';
  score: number;
  createdAt: string;
  resumeTitle: string;
  published: boolean;
  publishedUrl?: string | null;
  tags: string[];
};

type TemplateRecord = {
  id: string;
  role: string;
  difficulty: 'entry' | 'mid' | 'senior';
  focus: string;
  summary: string;
  keywords: string[];
  hiringSignals: string[];
};

type MatchReport = {
  id: string;
  jdId: string;
  jd: {
    title: string;
    company: string;
    location: string;
    seniority: string;
    employmentType: string;
    remote: string;
    normalized: {
      summary: string;
      responsibilities: string[];
      requirements: string[];
      niceToHave: string[];
      benefits: string[];
    };
    skills: SkillCategory[];
    constraints: {
      visa: string[];
      clearance: string[];
      travel: string[];
      onsitePercent: number | null;
    };
    rawText: string;
    sourceUrl: string | null;
  };
  resumeTitle: string;
  profileUsed: boolean;
  scoreTotal: number;
  scoreLabel: string;
  scoreBreakdown: MatchBreakdown[];
  coverage: {
    matched: string[];
    partial: string[];
    missing: string[];
  };
  keywordSuggestions: KeywordSuggestion[];
  bullets: { context: string; text: string; emphasis: string }[];
  gapPlan: {
    modules: GapModule[];
    totalHours: number;
    summary: string;
  };
  integrations: {
    resumeBuilder: string;
    careerPlanner: string;
    coverLetter: string;
  };
  atsHighlights: {
    high: string[];
    medium: string[];
    low: string[];
  };
  planCapabilities: {
    pdf: 'free' | 'pro';
    markdown: 'free' | 'pro';
    json: 'pro';
  };
  savedAt: string;
};

const baseMatchReport: MatchReport = {
  id: 'aurora-senior-frontend',
  jdId: 'jd-aurora',
  jd: {
    title: 'Senior Frontend Engineer',
    company: 'Aurora Analytics',
    location: 'Remote · North America overlap',
    seniority: 'senior',
    employmentType: 'Full-time',
    remote: 'Hybrid-friendly · 1 onsite per quarter',
    normalized: {
      summary:
        'Aurora Analytics builds observability tools for data-intensive product teams. The role owns the frontend platform, ensuring accessible, high-performing interfaces for enterprise users.',
      responsibilities: [
        'Own the React/TypeScript architecture for analytics dashboards and admin consoles.',
        'Collaborate with design to deliver accessible, responsive experiences with Tailwind and design tokens.',
        'Lead performance initiatives across GraphQL and REST integrations with measurable targets.',
        'Mentor mid-level engineers, run design reviews, and co-own hiring loops.',
        'Partner with product to translate roadmap briefs into actionable milestones and success metrics.',
      ],
      requirements: [
        '7+ years of professional frontend experience with React and modern TypeScript.',
        'Advanced proficiency with state management (React Query, Zustand, or Redux Toolkit).',
        'Experience shipping data visualization with D3, Recharts, or ECharts.',
        'Comfort working with GraphQL APIs, schema evolution, and caching strategies.',
        'Evidence of building accessible UI (WCAG 2.1 AA) and instituting automated tests.',
      ],
      niceToHave: [
        'Experience with design systems (Storybook, Chromatic).',
        'Background in analytics or developer tooling products.',
        'Exposure to CI pipelines (GitHub Actions) and infrastructure-as-code.',
      ],
      benefits: [
        'Remote-first team with quarterly retreats.',
        'Education stipend for conferences and certifications.',
        'Equity refreshers tied to impact.',
      ],
    },
    skills: [
      { label: 'Required', items: ['React', 'TypeScript', 'React Query', 'GraphQL', 'Accessibility', 'Automated Testing'] },
      { label: 'Nice-to-have', items: ['Storybook', 'Design Systems', 'AWS CDK'] },
      { label: 'Tools', items: ['Figma', 'Jira', 'Playwright', 'GitHub Actions'] },
      { label: 'Soft skills', items: ['Mentorship', 'Cross-functional leadership', 'Roadmapping'] },
      { label: 'Certifications', items: ['WCAG 2.1 AA fundamentals'] },
      { label: 'Education', items: ['BS Computer Science or equivalent experience'] },
    ],
    constraints: {
      visa: ['US work authorization or TN eligible'],
      clearance: [],
      travel: ['Quarterly onsite in Austin, TX'],
      onsitePercent: 15,
    },
    rawText:
      'Aurora Analytics is hiring a Senior Frontend Engineer to own the React and TypeScript experience across our analytics suite... Responsibilities include leading component architecture, partnering with design, and mentoring teammates. Requirements include deep React/TypeScript expertise, data visualization experience, and a track record of accessibility.',
    sourceUrl: 'https://aurora-analytics.com/careers/senior-frontend',
  },
  resumeTitle: 'Product-Focused Frontend Resume',
  profileUsed: false,
  scoreTotal: 82,
  scoreLabel: 'Strong fit',
  scoreBreakdown: [
    {
      key: 'skills',
      label: 'Skills coverage',
      weight: 0.6,
      score: 84,
      description: 'Most required skills covered; add GraphQL caching and Storybook governance.',
    },
    {
      key: 'seniority',
      label: 'Seniority fit',
      weight: 0.15,
      score: 80,
      description: 'Seven years documented with leadership bullets; highlight hiring contributions.',
    },
    {
      key: 'domain',
      label: 'Domain alignment',
      weight: 0.1,
      score: 76,
      description: 'Great analytics and developer tooling overlap; mention telemetry initiative explicitly.',
    },
    {
      key: 'responsibilities',
      label: 'Responsibility match',
      weight: 0.1,
      score: 78,
      description: 'Bullets map well to architecture ownership and mentoring; call out roadmap planning wins.',
    },
    {
      key: 'location',
      label: 'Location & legal',
      weight: 0.05,
      score: 100,
      description: 'North America remote with quarterly travel matches stated preference.',
    },
  ],
  coverage: {
    matched: ['React', 'TypeScript', 'Accessibility', 'Mentorship', 'Data Visualization'],
    partial: ['GraphQL Caching', 'Storybook Governance'],
    missing: ['WCAG 2.1 AA Certification', 'Playwright CI integration'],
  },
  keywordSuggestions: [
    { term: 'GraphQL caching strategies', priority: 'required', frequency: '2 mentions', context: 'Mention query cache invalidation in project bullets.' },
    { term: 'Storybook visual regression', priority: 'optional', frequency: '1 mention', context: 'Tie to design system stability.' },
    { term: 'WCAG 2.1 AA', priority: 'required', frequency: '1 mention', context: 'Add to summary or key project to satisfy compliance scans.' },
    { term: 'Playwright', priority: 'optional', frequency: '1 mention', context: 'Reference automated end-to-end testing improvements.' },
  ],
  bullets: [
    {
      context: 'Architecture ownership',
      text: 'Led the rebuild of a React/TypeScript analytics suite for 9K enterprise users, driving a 28% faster median dashboard load time.',
      emphasis: 'Showcase performance impact with metrics.',
    },
    {
      context: 'Design collaboration',
      text: 'Partnered with design to codify a Figma-to-Storybook pipeline, reducing design QA churn by 35%.',
      emphasis: 'Great proof of system thinking; keep quantification.',
    },
    {
      context: 'Mentorship',
      text: 'Mentored five engineers through promotion packets and instituted weekly pairing focused on accessibility debt.',
      emphasis: 'Aligns perfectly with leadership expectations.',
    },
  ],
  gapPlan: {
    modules: [
      {
        title: 'Advanced GraphQL caching & performance',
        hours: 6,
        resource: 'Apollo Odyssey Performance Lab',
        link: 'https://apollographql.com/odyssey/performance',
      },
      {
        title: 'Storybook visual regression & Chromatic workflows',
        hours: 4,
        resource: 'Chromatic Academy',
        link: 'https://www.chromatic.com/academy',
      },
      {
        title: 'Playwright CI patterns for accessibility',
        hours: 5,
        resource: 'Microsoft Playwright recipes',
        link: 'https://playwright.dev/docs/test-recipes',
      },
    ],
    totalHours: 15,
    summary: 'Cover GraphQL caching, visual regression governance, and Playwright-based accessibility checks over three focused weeks.',
  },
  integrations: {
    resumeBuilder: 'Push two refreshed bullets and keyword hints into your Aurora-focused resume draft.',
    careerPlanner: 'Schedule the GraphQL caching lab and Playwright CI deep dive over the next month.',
    coverLetter: 'Open with architecture ownership, highlight analytics product wins, and close on accessibility leadership.',
  },
  atsHighlights: {
    high: ['React', 'TypeScript', 'Accessibility', 'Mentorship'],
    medium: ['GraphQL', 'Storybook', 'Playwright'],
    low: ['AWS CDK'],
  },
  planCapabilities: {
    pdf: 'free',
    markdown: 'free',
    json: 'pro',
  },
  savedAt: '2024-01-12T14:20:00.000Z',
};

const sampleHistory: HistoryRecord[] = [
  {
    id: 'aurora-senior-frontend',
    title: 'Senior Frontend Engineer',
    company: 'Aurora Analytics',
    location: 'Remote · North America',
    planRequired: 'free',
    score: 82,
    createdAt: '2024-01-12T14:20:00.000Z',
    resumeTitle: 'Product-Focused Frontend Resume',
    published: false,
    publishedUrl: null,
    tags: ['React', 'Analytics', 'Mentorship'],
  },
  {
    id: 'northwind-staff-platform',
    title: 'Staff Platform Engineer',
    company: 'Northwind Labs',
    location: 'Hybrid · Seattle',
    planRequired: 'pro',
    score: 74,
    createdAt: '2024-01-04T09:10:00.000Z',
    resumeTitle: 'Platform Engineering Narrative',
    published: true,
    publishedUrl: '/job-analyzer/result/northwind-staff-platform',
    tags: ['Platform', 'SRE', 'Leadership'],
  },
  {
    id: 'lumen-product-designer',
    title: 'Senior Product Designer',
    company: 'Lumen Finance',
    location: 'Remote · US only',
    planRequired: 'free',
    score: 69,
    createdAt: '2023-12-28T17:45:00.000Z',
    resumeTitle: 'Fintech Product Design CV',
    published: false,
    publishedUrl: null,
    tags: ['Design Systems', 'Fintech'],
  },
  {
    id: 'atlas-data-analyst',
    title: 'Data Analyst II',
    company: 'Atlas Freight',
    location: 'Onsite · Chicago',
    planRequired: 'free',
    score: 63,
    createdAt: '2023-12-19T11:30:00.000Z',
    resumeTitle: 'Operations Analytics Resume',
    published: false,
    publishedUrl: null,
    tags: ['SQL', 'Logistics'],
  },
  {
    id: 'zenith-devrel',
    title: 'Developer Advocate',
    company: 'Zenith Cloud',
    location: 'Remote · Americas',
    planRequired: 'pro',
    score: 77,
    createdAt: '2023-12-11T15:05:00.000Z',
    resumeTitle: 'Developer Relations Resume',
    published: true,
    publishedUrl: '/job-analyzer/result/zenith-devrel',
    tags: ['Developer Tools', 'Content'],
  },
];

const templates: TemplateRecord[] = [
  {
    id: 'frontend-senior',
    role: 'Senior Frontend Engineer',
    difficulty: 'senior',
    focus: 'React + GraphQL SaaS platforms',
    summary:
      'Focuses on architecture ownership, design system stewardship, accessibility, and product discovery partnership.',
    keywords: ['React', 'TypeScript', 'Design systems', 'Accessibility'],
    hiringSignals: ['Architecture ownership', 'Mentorship', 'Performance metrics', 'Cross-functional leadership'],
  },
  {
    id: 'data-analyst-mid',
    role: 'Data Analyst II',
    difficulty: 'mid',
    focus: 'Logistics & operations analytics',
    summary:
      'Highlights SQL modelling, dashboard storytelling, and stakeholder enablement inside supply chain environments.',
    keywords: ['SQL', 'dbt', 'Tableau', 'Logistics'],
    hiringSignals: ['Process automation', 'Root cause analysis', 'Exception reporting'],
  },
  {
    id: 'product-designer-senior',
    role: 'Senior Product Designer',
    difficulty: 'senior',
    focus: 'Fintech onboarding & servicing flows',
    summary:
      'Covers accessibility, design operations, KPI-driven experiments, and compliance collaboration.',
    keywords: ['Figma', 'Design tokens', 'Fintech compliance'],
    hiringSignals: ['Experiments', 'Compliance partnership', 'Journey mapping'],
  },
  {
    id: 'devrel-advocate',
    role: 'Developer Advocate',
    difficulty: 'mid',
    focus: 'Cloud platforms & SDK adoption',
    summary:
      'Emphasises product storytelling, community programs, and technical content metrics.',
    keywords: ['SDKs', 'Community', 'Conference speaking'],
    hiringSignals: ['Content metrics', 'Feedback loops', 'Launch coordination'],
  },
  {
    id: 'security-engineer',
    role: 'Security Engineer',
    difficulty: 'senior',
    focus: 'Cloud infrastructure hardening',
    summary:
      'Targets incident response, threat modelling, and compliance readiness for SOC2 / ISO environments.',
    keywords: ['Threat modelling', 'AWS Security Hub', 'SIEM'],
    hiringSignals: ['Incident drills', 'Compliance audits', 'Purple team'],
  },
];

class JobAnalyzerStore extends BaseStore {
  state = {
    plan: 'free' as 'free' | 'pro',
    usage: {
      analysesUsed: 4,
      analysesLimit: 10,
      savedReports: 1,
      savedReportsLimit: 1,
      lastAnalyzedAt: baseMatchReport.savedAt,
    },
    analyzeForm: {
      inputType: 'text' as 'text' | 'pdf' | 'url',
      text: baseMatchReport.jd.rawText,
      url: baseMatchReport.jd.sourceUrl ?? '',
      fileName: null as string | null,
      pdfSizeMb: null as number | null,
      usingProfile: false,
    },
    resumeOptions: [
      {
        id: 'resume-product',
        title: 'Product-Focused Frontend Resume',
        lastUpdated: '2023-12-20',
        focus: 'Analytics SaaS · Accessibility',
        summary: 'Highlights React platform rebuild, design ops collaboration, and mentoring programs.',
      },
      {
        id: 'resume-delivery',
        title: 'Delivery Optimization Resume',
        lastUpdated: '2023-11-08',
        focus: 'Logistics dashboards · React Native',
        summary: 'Mix of mobile and dashboard work; fewer GraphQL callouts.',
      },
      {
        id: 'resume-growth',
        title: 'Growth Experimentation Resume',
        lastUpdated: '2023-10-14',
        focus: 'Experiment platforms · A/B testing',
        summary: 'Good for product analytics roles; missing accessibility leadership bullets.',
      },
    ],
    selectedResumeId: 'resume-product',
    analysisSteps: [
      { key: 'ingest', label: 'Normalize job description', status: 'pending' as AnalysisStepStatus },
      { key: 'extract', label: 'Extract skills & constraints', status: 'pending' as AnalysisStepStatus },
      { key: 'compare', label: 'Compare resume/profile', status: 'pending' as AnalysisStepStatus },
      { key: 'suggest', label: 'Generate keywords & actions', status: 'pending' as AnalysisStepStatus },
    ] as AnalysisStep[],
    busy: false,
    progressLabel: null as string | null,
    lastStepCompletedAt: null as string | null,
    toast: null as { type: 'success' | 'error'; message: string } | null,
    matchReport: clone(baseMatchReport),
    history: clone(sampleHistory),
    historyFilters: {
      plan: 'all' as 'all' | 'free' | 'pro',
      score: 'all' as 'all' | 'strong' | 'moderate' | 'developing',
      search: '',
    },
    historyFiltered: clone(sampleHistory),
    historyStats: {
      saved: sampleHistory.length,
      published: sampleHistory.filter((item) => item.published).length,
    },
    templates: clone(templates),
    activeReport: clone(baseMatchReport),
    activeReportId: baseMatchReport.id,
    step: 1,
  };

  private timers: Array<ReturnType<typeof setTimeout>> = [];

  initLanding(): void {
    this.applyHistoryFilters();
  }

  initUpload(): void {
    this.clearTimers();
    this.state.step = 1;
    this.state.busy = false;
    this.state.progressLabel = null;
    this.state.analyzeForm.text = this.state.matchReport.jd.rawText;
    this.state.analyzeForm.url = this.state.matchReport.jd.sourceUrl ?? '';
    this.state.analyzeForm.inputType = 'text';
    this.state.analyzeForm.fileName = null;
    this.state.analyzeForm.pdfSizeMb = null;
    this.state.analysisSteps = this.state.analysisSteps.map((step) => ({ ...step, status: 'pending' }));
    this.state.toast = null;
  }

  initHistory(): void {
    this.applyHistoryFilters();
  }

  initTemplates(): void {
    this.state.toast = null;
  }

  initReport(location?: Location): void {
    const pathname = location?.pathname ?? window.location.pathname;
    const id = pathname.split('/').pop() || baseMatchReport.id;
    this.setActiveReport(id);
  }

  setInputType(type: 'text' | 'pdf' | 'url'): void {
    this.state.analyzeForm.inputType = type;
  }

  handleFileUpload(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const file = target?.files?.[0];
    if (!file) return;
    const sizeMb = Math.round((file.size / (1024 * 1024)) * 10) / 10;
    this.state.analyzeForm.fileName = file.name;
    this.state.analyzeForm.pdfSizeMb = sizeMb;
    this.state.analyzeForm.inputType = 'pdf';
  }

  removeUpload(): void {
    this.state.analyzeForm.fileName = null;
    this.state.analyzeForm.pdfSizeMb = null;
    if (this.state.analyzeForm.inputType === 'pdf') {
      this.state.analyzeForm.inputType = 'text';
    }
  }

  selectResume(id: string): void {
    this.state.selectedResumeId = id;
    this.state.analyzeForm.usingProfile = false;
  }

  toggleProfile(): void {
    this.state.analyzeForm.usingProfile = !this.state.analyzeForm.usingProfile;
  }

  goToStep(step: number): void {
    this.state.step = step;
  }

  startAnalysis(): void {
    if (this.state.busy) return;
    this.state.busy = true;
    this.state.toast = null;
    this.state.progressLabel = 'Parsing job description';
    this.state.analysisSteps = this.state.analysisSteps.map((step, index) => ({
      ...step,
      status: index === 0 ? 'running' : 'pending',
    }));
    this.clearTimers();
    this.scheduleStepProgress(0);
  }

  private scheduleStepProgress(index: number): void {
    const timer = setTimeout(() => {
      this.state.analysisSteps[index].status = 'done';
      if (index < this.state.analysisSteps.length - 1) {
        this.state.analysisSteps[index + 1].status = 'running';
        this.state.progressLabel = this.progressLabelForIndex(index + 1);
        this.scheduleStepProgress(index + 1);
      } else {
        this.finishAnalysis();
      }
    }, 600 + index * 150);
    this.timers.push(timer);
  }

  private progressLabelForIndex(index: number): string {
    switch (index) {
      case 1:
        return 'Extracting requirements and skills';
      case 2:
        return 'Computing resume match score';
      case 3:
      default:
        return 'Preparing suggestions and gap plan';
    }
  }

  private finishAnalysis(): void {
    this.state.busy = false;
    this.state.progressLabel = null;
    this.state.lastStepCompletedAt = new Date().toISOString();
    this.state.step = 3;
    this.state.usage.analysesUsed = Math.min(this.state.usage.analysesUsed + 1, this.state.usage.analysesLimit);
    this.state.usage.lastAnalyzedAt = this.state.lastStepCompletedAt;
    this.pushHistory(this.state.matchReport);
    this.state.toast = {
      type: 'success',
      message: 'Analysis ready — review the match report below.',
    };
  }

  private pushHistory(report: MatchReport): void {
    const existingIndex = this.state.history.findIndex((item) => item.id === report.id);
    const record: HistoryRecord = {
      id: report.id,
      title: report.jd.title,
      company: report.jd.company,
      location: report.jd.location,
      planRequired: report.planCapabilities.json === 'pro' ? 'pro' : 'free',
      score: report.scoreTotal,
      createdAt: new Date().toISOString(),
      resumeTitle: report.resumeTitle,
      published: false,
      publishedUrl: null,
      tags: report.jd.skills[0]?.items.slice(0, 3) ?? [],
    };
    if (existingIndex === -1) {
      this.state.history.unshift(record);
    } else {
      this.state.history.splice(existingIndex, 1, record);
    }
    this.applyHistoryFilters();
  }

  requestExport(format: 'pdf' | 'markdown' | 'json'): void {
    const capability = this.state.activeReport.planCapabilities[format];
    if (capability === 'pro' && this.state.plan !== 'pro') {
      this.state.toast = {
        type: 'error',
        message: `${format.toUpperCase()} export is a Pro feature. Upgrade to unlock JSON exports and watermark-free files.`,
      };
      return;
    }
    this.state.toast = {
      type: 'success',
      message: `${format.toUpperCase()} export is queued. We will notify you when the download is ready.`,
    };
  }

  publishActiveReport(): void {
    const url = `/job-analyzer/result/${this.state.activeReport.id}`;
    this.state.activeReport.savedAt = new Date().toISOString();
    const historyIndex = this.state.history.findIndex((item) => item.id === this.state.activeReport.id);
    if (historyIndex !== -1) {
      this.state.history[historyIndex].published = true;
      this.state.history[historyIndex].publishedUrl = url;
    }
    this.state.toast = {
      type: 'success',
      message: 'Report published with a read-only link.',
    };
    this.applyHistoryFilters();
  }

  setActiveReport(id: string): void {
    const record = this.state.history.find((item) => item.id === id) ?? this.state.history[0];
    if (!record) {
      this.state.activeReport = clone(baseMatchReport);
      this.state.activeReportId = baseMatchReport.id;
      return;
    }
    const report = clone(baseMatchReport);
    report.id = record.id;
    report.jd.title = record.title;
    report.jd.company = record.company;
    report.jd.location = record.location;
    report.resumeTitle = record.resumeTitle;
    report.savedAt = record.createdAt;
    this.state.activeReport = report;
    this.state.activeReportId = record.id;
  }

  applyHistoryFilters(): void {
    const { plan, score, search } = this.state.historyFilters;
    const filtered = this.state.history.filter((item) => {
      if (plan !== 'all' && item.planRequired !== plan) {
        return false;
      }
      if (score !== 'all') {
        if (score === 'strong' && item.score < 75) return false;
        if (score === 'moderate' && (item.score < 60 || item.score >= 75)) return false;
        if (score === 'developing' && item.score >= 60) return false;
      }
      if (search) {
        const haystack = `${item.title} ${item.company} ${item.tags.join(' ')}`.toLowerCase();
        if (!haystack.includes(search.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
    this.state.historyFiltered = filtered;
    this.state.historyStats = {
      saved: this.state.history.length,
      published: this.state.history.filter((item) => item.published).length,
    };
  }

  setHistoryFilter(key: 'plan' | 'score', value: string): void {
    (this.state.historyFilters as Record<string, string>)[key] = value;
    this.applyHistoryFilters();
  }

  setHistorySearch(value: string): void {
    this.state.historyFilters.search = value;
    this.applyHistoryFilters();
  }

  clearToast(): void {
    this.state.toast = null;
  }

  private clearTimers(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers = [];
  }
}

Alpine.store('jobAnalyzer', new JobAnalyzerStore());

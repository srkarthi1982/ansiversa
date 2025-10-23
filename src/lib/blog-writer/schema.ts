export type BlogTemplateKey =
  | 'tutorial'
  | 'listicle'
  | 'case-study'
  | 'opinion'
  | 'release-notes';

export type BlogPostStatus = 'draft' | 'published';

export type BlogOutlineNode = {
  id: string;
  title: string;
  summary?: string;
  depth: 1 | 2 | 3;
  wordGoal?: number;
  children?: BlogOutlineNode[];
};

export type BlogSeoInternalLink = {
  label: string;
  url: string;
};

export type BlogSeo = {
  title: string;
  slug: string;
  description: string;
  keywords: string[];
  internalLinks: BlogSeoInternalLink[];
  score: number;
  readability: 'A' | 'B' | 'C' | 'D';
  tone: 'professional' | 'friendly' | 'technical' | 'casual';
};

export type BlogMediaItem = {
  id: string;
  filename: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  sizeKb: number;
  createdAt: string;
  caption?: string;
};

export type BlogVersionRecord = {
  id: string;
  label: string;
  createdAt: string;
  wordCount: number;
  diffSummary: string;
};

export type BlogAiIdea = {
  id: string;
  topic: string;
  headline: string;
  angle: 'beginner' | 'advanced' | 'trend';
  summary: string;
};

export type BlogAiPrompt = {
  id: string;
  description: string;
  aspect: 'hero' | 'inline' | 'diagram';
};

export type BlogPostRecord = {
  id: string;
  userId: string;
  title: string;
  summary: string;
  templateKey: BlogTemplateKey;
  status: BlogPostStatus;
  contentMd: string;
  outline: BlogOutlineNode[];
  tags: string[];
  wordCount: number;
  readingMinutes: number;
  seo: BlogSeo;
  hero: { url: string | null; alt: string };
  media: BlogMediaItem[];
  versions: BlogVersionRecord[];
  ideaTopic: string | null;
  lastIdeaGeneratedAt: string | null;
  lastSavedAt: string | null;
  publishedAt: string | null;
  createdAt: string;
};

export type BlogTemplate = {
  key: BlogTemplateKey;
  label: string;
  description: string;
  audience: string;
  defaultTags: string[];
  outline: BlogOutlineNode[];
  voice: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
};

const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

const createOutline = (titles: string[]): BlogOutlineNode[] =>
  titles.map((title, index) => ({
    id: newId(),
    title,
    depth: 2,
    summary: '',
    wordGoal: index === 0 ? 200 : 180,
  }));

export const blogTemplates: BlogTemplate[] = [
  {
    key: 'tutorial',
    label: 'Tutorial',
    description: 'Teach a process or workflow with prerequisites, steps, and final checklist.',
    audience: 'Learners or practitioners new to the topic',
    defaultTags: ['guide', 'how-to'],
    outline: [
      { id: newId(), title: 'Introduction & prerequisites', depth: 2, summary: '', wordGoal: 180 },
      { id: newId(), title: 'Step-by-step walkthrough', depth: 2, summary: '', wordGoal: 400 },
      { id: newId(), title: 'Troubleshooting tips', depth: 2, summary: '', wordGoal: 160 },
      { id: newId(), title: 'Wrap-up & next steps', depth: 2, summary: '', wordGoal: 150 },
    ],
    voice: 'Supportive and instructive',
    difficulty: 'beginner',
  },
  {
    key: 'listicle',
    label: 'Listicle',
    description: 'Highlight curated insights or recommendations with numbered sections.',
    audience: 'Readers skimming for quick takeaways',
    defaultTags: ['list', 'curation'],
    outline: createOutline([
      'Why this topic matters now',
      'Top recommendation #1',
      'Top recommendation #2',
      'Top recommendation #3',
      'How to put these ideas into action',
    ]),
    voice: 'Friendly and concise',
    difficulty: 'beginner',
  },
  {
    key: 'case-study',
    label: 'Case Study',
    description: 'Share a before/after story with data, wins, and lessons learned.',
    audience: 'Stakeholders evaluating results',
    defaultTags: ['case-study', 'results'],
    outline: createOutline([
      'Client background and challenge',
      'Approach & timeline',
      'Key results and metrics',
      'Lessons learned & next steps',
    ]),
    voice: 'Authoritative and data-backed',
    difficulty: 'advanced',
  },
  {
    key: 'opinion',
    label: 'Opinion',
    description: 'Present a point of view with supporting arguments and counterpoints.',
    audience: 'Community peers and decision makers',
    defaultTags: ['opinion', 'analysis'],
    outline: createOutline([
      'The stance in one sentence',
      'Evidence that supports this stance',
      'Addressing the counterarguments',
      'What this means for the reader',
    ]),
    voice: 'Confident and persuasive',
    difficulty: 'intermediate',
  },
  {
    key: 'release-notes',
    label: 'Release Notes',
    description: 'Announce product updates with highlights, improvements, and known issues.',
    audience: 'Existing customers and power users',
    defaultTags: ['product', 'updates'],
    outline: createOutline([
      'What shipped this cycle',
      'Why these updates matter',
      'Improvements & fixes',
      'Next up on the roadmap',
    ]),
    voice: 'Clear and customer-centric',
    difficulty: 'beginner',
  },
];

const defaultSeo = (): BlogSeo => ({
  title: '',
  slug: '',
  description: '',
  keywords: [],
  internalLinks: [],
  score: 0,
  readability: 'B',
  tone: 'professional',
});

export const createEmptyBlogPost = (templateKey: BlogTemplateKey = 'tutorial'): BlogPostRecord => {
  const template = blogTemplates.find((item) => item.key === templateKey) ?? blogTemplates[0]!;
  return {
    id: newId(),
    userId: 'demo-user',
    title: 'Untitled post',
    summary: '',
    templateKey: template.key,
    status: 'draft',
    contentMd: '',
    outline: template.outline.map((node) => ({ ...node, id: newId() })),
    tags: [...template.defaultTags],
    wordCount: 0,
    readingMinutes: 0,
    seo: defaultSeo(),
    hero: { url: null, alt: '' },
    media: [],
    versions: [],
    ideaTopic: null,
    lastIdeaGeneratedAt: null,
    lastSavedAt: null,
    publishedAt: null,
    createdAt: new Date().toISOString(),
  };
};

const sampleContent = `# Astro vs Next.js for Content-Rich Sites\n\nAstro and Next.js both help teams ship performant web experiences, but they make different tradeoffs around data fetching, island hydration, and hosting. This guide explores when Astro excels and how to migrate incrementally.\n\n## Astro's sweet spot\n- Partial hydration keeps payloads tiny\n- Content collections streamline authoring\n- File-based routing stays approachable as sites grow\n\n## When to choose Next.js\n- Dynamic dashboards and authenticated experiences\n- Edge rendering with middleware and API routes\n- Large component ecosystems with React tooling\n\n## Migration game plan\n1. Audit current routes and data dependencies\n2. Identify static-friendly sections to offload\n3. Split monolith repos into content and app shells\n\nWrapping up with a checklist helps teams plan their next iteration.`;

const sampleSeo = (title: string, slug: string, keywords: string[]): BlogSeo => ({
  title,
  slug,
  description: `${title} — a deep dive into tradeoffs, best practices, and rollout strategy for modern teams.`,
  keywords,
  internalLinks: [
    { label: 'Astro docs', url: 'https://docs.astro.build' },
    { label: 'Ansiversa features', url: '/features' },
  ],
  score: 82,
  readability: 'A',
  tone: 'technical',
});

export const sampleBlogPosts: BlogPostRecord[] = [
  {
    ...createEmptyBlogPost('tutorial'),
    id: 'post-astro-next',
    title: 'Astro vs Next.js for content-rich sites',
    summary: 'Compare Astro and Next.js for marketing sites, including build speed, data fetching, and migration strategy.',
    tags: ['astro', 'nextjs', 'jamstack'],
    status: 'published',
    contentMd: sampleContent,
    wordCount: 780,
    readingMinutes: 4,
    seo: sampleSeo('Astro vs Next.js for content-rich sites', 'astro-vs-nextjs-content-sites', ['astro', 'next.js', 'jamstack']),
    hero: {
      url: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1400&q=80',
      alt: 'Developer workstation with code editor and diagrams',
    },
    media: [
      {
        id: newId(),
        filename: 'astro-next-dashboard.png',
        url: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1200&q=80',
        alt: 'Benchmark comparison chart between Astro and Next.js',
        width: 1600,
        height: 900,
        sizeKb: 420,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
        caption: 'Build time comparison between frameworks.',
      },
    ],
    versions: [
      {
        id: newId(),
        label: 'Launch draft',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        wordCount: 640,
        diffSummary: 'Initial outline to full draft with migration checklist added.',
      },
      {
        id: newId(),
        label: 'SEO polish',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
        wordCount: 720,
        diffSummary: 'Updated meta description, added internal links, and inserted diagrams.',
      },
    ],
    ideaTopic: 'Jamstack framework comparison',
    lastIdeaGeneratedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    lastSavedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
  },
  {
    ...createEmptyBlogPost('listicle'),
    id: 'post-content-systems',
    title: '7 newsletter systems that keep content teams shipping',
    summary: 'Reusable templates, editorial calendars, and QA checklists to keep marketing teams publishing consistently.',
    tags: ['newsletter', 'systems', 'workflow'],
    status: 'draft',
    wordCount: 520,
    readingMinutes: 3,
    contentMd:
      '# Newsletter systems that scale\n\nContent ops teams need dependable routines. This list rounds up seven systems to consider before the next campaign launch.\n\n## Editorial standup\nKeep shipping by aligning on priorities and blockers every Monday.\n\n## Evergreen refresh cycle\nRotate top performers back to the front of the queue with smart updates.\n\n## QA checklist\nBake in approvals and brand guardrails with living documentation.',
    seo: sampleSeo('Newsletter systems that scale', 'newsletter-systems-that-scale', [
      'newsletter',
      'content ops',
      'workflow',
    ]),
    versions: [
      {
        id: newId(),
        label: 'Idea to outline',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
        wordCount: 260,
        diffSummary: 'Generated outline for seven systems and added supporting bullets.',
      },
    ],
    ideaTopic: 'Newsletter operations best practices',
    lastIdeaGeneratedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    lastSavedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1.5).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
  },
  {
    ...createEmptyBlogPost('case-study'),
    id: 'post-onboarding-cs',
    title: 'How onboarding playbooks cut churn for FlowSync',
    summary: 'A retention-focused case study outlining onboarding experiments, KPI impact, and the rollout playbook.',
    tags: ['customer-success', 'onboarding', 'case-study'],
    status: 'draft',
    contentMd:
      '# Onboarding playbooks that win renewals\n\nFlowSync reduced churn by 28% with segmented education, in-app guidance, and CS automation. This case study covers the rollout and results.\n\n## Segmented onboarding\nMapping persona-specific journeys kept feature discovery relevant.\n\n## Lifecycle nudges\nTimely, behavior-based nudges nudged trial conversion from 32% to 44%.\n\n## Renewals runbook\nQuarterly business reviews put the right stories in front of executive buyers.',
    wordCount: 610,
    readingMinutes: 3,
    seo: sampleSeo('Onboarding playbooks that win renewals', 'onboarding-playbooks-cut-churn', [
      'customer success',
      'onboarding',
      'retention',
    ]),
    versions: [],
    media: [
      {
        id: newId(),
        filename: 'flowsync-activation-chart.png',
        url: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80',
        alt: 'Activation funnel improvements after onboarding changes',
        width: 1400,
        height: 900,
        sizeKb: 512,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      },
    ],
    ideaTopic: 'Customer onboarding outcomes',
    lastIdeaGeneratedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    lastSavedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 0.5).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2.5).toISOString(),
  },
];

export const sampleIdeas: BlogAiIdea[] = [
  {
    id: newId(),
    topic: 'Product onboarding',
    headline: '5 onboarding checkpoints that actually reduce churn',
    angle: 'beginner',
    summary: 'A checklist for PMs launching onboarding improvements with quick wins.',
  },
  {
    id: newId(),
    topic: 'Jamstack marketing',
    headline: 'Astro vs Next.js beyond static sites',
    angle: 'advanced',
    summary: 'When dynamic teams should choose one framework over the other.',
  },
  {
    id: newId(),
    topic: 'Content operations',
    headline: 'The 3 editorial rituals of consistent content teams',
    angle: 'trend',
    summary: 'How high-performing teams pair analytics with rituals to stay on schedule.',
  },
];

export const sampleImagePrompts: BlogAiPrompt[] = [
  {
    id: newId(),
    description: 'Isometric dashboard comparing site performance metrics before and after Astro migration, vibrant gradients, UI design',
    aspect: 'hero',
  },
  {
    id: newId(),
    description: 'Illustrated checklist pinned to a corkboard with sticky notes for onboarding playbook tasks',
    aspect: 'inline',
  },
  {
    id: newId(),
    description: 'Customer journey flowchart with arrows showing activation, adoption, retention stages in bold colors',
    aspect: 'diagram',
  },
];

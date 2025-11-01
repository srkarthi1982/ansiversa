import type {
  CareerApplication,
  CareerDashboardSnapshot,
  CareerLearningPlan,
  CareerPlanDetail,
  CareerProject,
  CareerRole,
} from '../types/career';

const now = new Date();

const iso = (date: Date) => date.toISOString();

const daysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return iso(date);
};

export const careerRoles: CareerRole[] = [
  {
    id: 'frontend_engineer',
    title: 'Frontend Engineer',
    category: 'Engineering',
    summary:
      'Build engaging web experiences with modern JavaScript frameworks, collaborate with designers, and own UI quality from prototypes to production.',
    skills: ['javascript', 'typescript', 'react', 'css', 'testing', 'design-systems'],
    sampleJD:
      'Own the experience layer for our SaaS dashboard. Ship accessible, high-performing React features, partner with design on component systems, and collaborate with backend teams on GraphQL integrations.',
    medianRange: { currency: 'USD', low: 95000, high: 135000 },
    demandLevel: 'high',
    level: 'mid',
    relatedRoles: ['ui_engineer', 'product_engineer', 'design_systems_engineer'],
  },
  {
    id: 'data_analyst',
    title: 'Data Analyst',
    category: 'Analytics',
    summary:
      'Transform product and business data into insight dashboards, models, and experiments that guide decision-making across teams.',
    skills: ['sql', 'python', 'tableau', 'experimentation', 'storytelling'],
    sampleJD:
      'Design dashboards and ad-hoc analyses across growth experiments. Translate ambiguous stakeholder questions into actionable SQL/Python queries and present trends clearly.',
    medianRange: { currency: 'USD', low: 78000, high: 110000 },
    demandLevel: 'med',
    level: 'mid',
    relatedRoles: ['analytics_engineer', 'product_analyst'],
  },
  {
    id: 'product_manager',
    title: 'Product Manager',
    category: 'Product',
    summary:
      'Lead discovery, prioritisation, and delivery for new capabilities. Align customers, stakeholders, and engineers through clear problem framing.',
    skills: ['roadmapping', 'user-research', 'analytics', 'communication', 'leadership'],
    sampleJD:
      'Drive roadmap for onboarding flows. Run discovery with customers, define north-star metrics, coordinate delivery squads, and measure impact post-launch.',
    medianRange: { currency: 'USD', low: 105000, high: 160000 },
    demandLevel: 'med',
    level: 'mid',
    relatedRoles: ['product_owner', 'growth_product_manager'],
  },
  {
    id: 'ux_researcher',
    title: 'UX Researcher',
    category: 'Design',
    summary:
      'Plan and synthesise research studies that reveal user needs and opportunities for product improvement across the lifecycle.',
    skills: ['qualitative-research', 'quantitative-research', 'insight-synthesis', 'storytelling'],
    sampleJD:
      'Own generative and evaluative research for core product surfaces. Plan studies, run interviews, synthesise insights, and communicate narratives that shape roadmap decisions.',
    medianRange: { currency: 'USD', low: 90000, high: 130000 },
    demandLevel: 'low',
    level: 'mid',
    relatedRoles: ['design-strategist', 'ux-writer'],
  },
  {
    id: 'ai_product_specialist',
    title: 'AI Product Specialist',
    category: 'Emerging Tech',
    summary:
      'Prototype AI-powered features, evaluate model performance, and bridge product discovery with applied machine learning teams.',
    skills: ['prompt-design', 'python', 'llm-evaluation', 'analytics', 'experimentation'],
    sampleJD:
      'Partner with PMs to ideate AI copilots, prototype workflows with GPT-style models, measure success, and coordinate rollouts with GTM teams.',
    medianRange: { currency: 'USD', low: 115000, high: 155000 },
    demandLevel: 'high',
    level: 'mid',
    relatedRoles: ['ml_product_manager', 'ai_program_manager'],
  },
];

const sampleLearningPlan: CareerLearningPlan = {
  modules: [
    {
      id: 'react-foundations',
      title: 'React Foundations',
      hours: 12,
      resources: ['react_docs', 'scrimba_react_starter'],
      checkpoint: 'Ship a todo app with routing and tests',
      difficulty: 'intro',
    },
    {
      id: 'typescript-for-react',
      title: 'TypeScript for React',
      hours: 10,
      resources: ['typescript_handbook', 'react_typescript_cheatsheet'],
      checkpoint: 'Convert the project to TypeScript with strict mode',
      difficulty: 'core',
    },
    {
      id: 'testing-for-ui',
      title: 'Testing modern UIs',
      hours: 8,
      resources: ['testing_library_docs', 'cypress_intro'],
      checkpoint: 'Add component and e2e coverage for key flows',
      difficulty: 'core',
    },
    {
      id: 'design-systems',
      title: 'Design systems fundamentals',
      hours: 6,
      resources: ['design_systems_figma', 'storybook_essentials'],
      checkpoint: 'Create a Storybook with reusable primitives',
      difficulty: 'stretch',
    },
  ],
  totalHours: 36,
  etaWeeks: 12,
};

const sampleProjects: CareerProject[] = [
  {
    id: 'project-job-tracker',
    title: 'Job Tracker Dashboard',
    skills: ['react', 'testing', 'data-visualisation'],
    brief:
      'Build a full-featured job application tracker with filters, saved searches, and a Kanban workflow for pipeline visibility.',
    acceptance: [
      'Supports CRUD for applications and notes',
      'Includes analytics widgets for weekly progress',
      'Ships with responsive design and accessibility checklist',
    ],
    impact: 'Showcases product thinking and real-world workflow automation.',
  },
  {
    id: 'project-design-system',
    title: 'Personal Design System Library',
    skills: ['design-systems', 'typescript', 'storybook'],
    brief:
      'Create a reusable component system with tokens, documentation, and unit tests that demonstrates craftsmanship.',
    acceptance: [
      'Components documented in Storybook with controls',
      'Tokenised styling with dark mode support',
      'Integration example in a marketing landing page',
    ],
  },
  {
    id: 'project-ai-portfolio',
    title: 'AI Portfolio Companion',
    skills: ['nextjs', 'prompt-design', 'ux'],
    brief:
      'Prototype a portfolio assistant that curates highlights, generates copy, and tracks viewer engagement.',
    acceptance: [
      'Supports AI-assisted summary generation',
      'Records views and feedback in Supabase',
      'Includes onboarding walkthrough',
    ],
  },
];

const createdAt = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
const lastSavedAt = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2);

export const careerPlanDetail: CareerPlanDetail = {
  id: 'plan-frontend-engineer',
  title: 'Frontend Engineer Transition',
  slug: 'frontend-engineer-transition',
  status: 'draft',
  profile: {
    currentRole: 'Support Engineer',
    experienceYears: 5,
    industries: ['SaaS', 'Customer Success'],
    education: 'B.Tech Computer Science',
    interests: ['frontend', 'design systems', 'data storytelling'],
    constraints: {
      location: 'Dubai',
      remote: true,
      hoursPerWeek: 8,
      timezone: 'Asia/Dubai',
    },
    summary:
      'Support engineer moving into product-facing frontend engineering with strong customer empathy and systems thinking.',
  },
  targets: [
    { roleId: 'frontend_engineer', priority: 1, label: 'Primary role', level: 'mid' },
    { roleId: 'data_analyst', priority: 2, label: 'Secondary explore', level: 'junior' },
  ],
  skillsCurrent: {
    javascript: 3,
    'html_css': 4,
    sql: 2,
    'customer_success': 5,
    react: 1,
    typescript: 1,
    testing: 2,
  },
  skillsRequired: {
    javascript: 4,
    react: 3,
    typescript: 3,
    testing: 3,
    git: 3,
    'design_systems': 2,
  },
  gapMatrix: [
    { skill: 'react', current: 1, target: 3, priority: 'high' },
    { skill: 'typescript', current: 1, target: 3, priority: 'high' },
    { skill: 'testing', current: 2, target: 3, priority: 'med' },
    { skill: 'design_systems', current: 0, target: 2, priority: 'med' },
  ],
  learningPlan: sampleLearningPlan,
  sprintPlan: {
    weeks: [
      {
        week: 1,
        focus: 'React foundations',
        tasks: ['Complete React Foundations module', 'Pair on React patterns with mentor'],
        milestone: 'Todo app v1 shipped',
      },
      {
        week: 2,
        focus: 'TypeScript habits',
        tasks: ['Convert project to TypeScript', 'Review TS generics cheat sheet'],
        milestone: 'Strict TS build passes',
      },
      {
        week: 3,
        focus: 'Testing and automation',
        tasks: ['Add testing pipeline', 'Set up GitHub Actions'],
        milestone: '80% coverage with integration tests',
      },
      {
        week: 4,
        focus: 'Design systems demo',
        tasks: ['Document components in Storybook', 'Record Loom walkthrough'],
        milestone: 'Design system published',
      },
    ],
  },
  projects: sampleProjects,
  resumeBullets: [
    'Partnered with product to design AI-powered support copilot adopted by 12 teams.',
    'Rolled out automation scripts reducing ticket triage by 35% across EMEA operations.',
  ],
  notes: 'Plan focuses on storytelling via design systems and measurable learning loops.',
  lastSavedAt: iso(lastSavedAt),
  createdAt: iso(createdAt),
  publishedAt: null,
};

export const careerDashboardSnapshot: CareerDashboardSnapshot = {
  plans: [
    {
      id: careerPlanDetail.id,
      title: careerPlanDetail.title,
      slug: careerPlanDetail.slug,
      status: careerPlanDetail.status,
      targetRoleId: 'frontend_engineer',
      progress: 58,
      tasksDue: 3,
      lastSavedAt: careerPlanDetail.lastSavedAt,
      createdAt: careerPlanDetail.createdAt,
      nextReviewAt: daysFromNow(5),
    },
    {
      id: 'plan-product-ops',
      title: 'Product Operations Uplevel',
      slug: 'product-operations-uplevel',
      status: 'published',
      targetRoleId: 'product_manager',
      progress: 92,
      tasksDue: 1,
      lastSavedAt: daysFromNow(-7),
      createdAt: daysFromNow(-80),
      nextReviewAt: daysFromNow(14),
    },
  ],
  tasks: [
    {
      id: 'task-learning-react',
      title: 'Finish React Foundations module',
      dueOn: daysFromNow(2),
      type: 'learning',
      status: 'in-progress',
    },
    {
      id: 'task-portfolio',
      title: 'Draft portfolio case study outline',
      dueOn: daysFromNow(4),
      type: 'project',
      status: 'pending',
    },
    {
      id: 'task-networking',
      title: 'Reach out to 2 mentors on ADPList',
      dueOn: daysFromNow(1),
      type: 'networking',
      status: 'pending',
    },
    {
      id: 'task-application',
      title: 'Apply to two target companies',
      dueOn: daysFromNow(0),
      type: 'application',
      status: 'pending',
    },
  ],
  metrics: {
    activePlans: 2,
    aiCallsUsed: 4,
    aiLimit: 20,
    applicationsThisWeek: 3,
    interviewsScheduled: 1,
  },
  applications: {
    total: 14,
    byStatus: {
      wishlist: 2,
      applied: 7,
      interview: 3,
      offer: 1,
      rejected: 1,
    },
  },
  highlights: [
    'Learning velocity trending +12% week over week',
    'New AI quota resets in 3 days',
    'Portfolio project feedback score 4.6/5',
  ],
};

export const careerApplications: CareerApplication[] = [
  {
    id: 'app-aurora',
    planId: careerPlanDetail.id,
    company: 'Aurora Analytics',
    role: 'Frontend Engineer',
    source: 'Referral',
    link: 'https://aurora.example/jobs/frontend-engineer',
    status: 'interview',
    appliedOn: daysFromNow(-10),
    nextStepOn: daysFromNow(3),
    notes: 'Final panel scheduled — prepare system design story.',
    createdAt: daysFromNow(-15),
  },
  {
    id: 'app-nimbus',
    planId: careerPlanDetail.id,
    company: 'Nimbus Suite',
    role: 'Product Engineer',
    source: 'LinkedIn',
    link: 'https://jobs.nimbus.example',
    status: 'applied',
    appliedOn: daysFromNow(-4),
    nextStepOn: daysFromNow(1),
    notes: 'Followed up with recruiter on Tuesday.',
    createdAt: daysFromNow(-6),
  },
  {
    id: 'app-harbor',
    planId: careerPlanDetail.id,
    company: 'Harbor OS',
    role: 'Frontend Developer',
    source: 'Company site',
    link: 'https://harbor.example/careers/frontend-developer',
    status: 'wishlist',
    appliedOn: null,
    nextStepOn: null,
    createdAt: daysFromNow(-2),
  },
  {
    id: 'app-signal',
    planId: careerPlanDetail.id,
    company: 'Signal Metrics',
    role: 'Frontend Engineer',
    source: 'AngelList',
    link: 'https://signal.example/jobs/fe',
    status: 'rejected',
    appliedOn: daysFromNow(-30),
    nextStepOn: null,
    notes: 'Request feedback on assignment.',
    createdAt: daysFromNow(-33),
  },
];

export const careerResources = {
  react_docs: {
    id: 'react_docs',
    title: 'React docs',
    url: 'https://react.dev/learn',
    type: 'doc',
    durationHrs: 6,
    provider: 'Meta',
  },
  scrimba_react_starter: {
    id: 'scrimba_react_starter',
    title: 'Scrimba React Starter',
    url: 'https://scrimba.com/learn/learnreact',
    type: 'course',
    durationHrs: 12,
    provider: 'Scrimba',
  },
  typescript_handbook: {
    id: 'typescript_handbook',
    title: 'TypeScript handbook',
    url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    type: 'doc',
    durationHrs: 5,
    provider: 'Microsoft',
  },
  react_typescript_cheatsheet: {
    id: 'react_typescript_cheatsheet',
    title: 'React TypeScript Cheatsheets',
    url: 'https://react-typescript-cheatsheet.netlify.app/',
    type: 'doc',
    durationHrs: 2,
    provider: 'Community',
  },
  testing_library_docs: {
    id: 'testing_library_docs',
    title: 'Testing Library Docs',
    url: 'https://testing-library.com/docs/',
    type: 'doc',
    durationHrs: 3,
    provider: 'Testing Library',
  },
  cypress_intro: {
    id: 'cypress_intro',
    title: 'Cypress component testing',
    url: 'https://docs.cypress.io/guides/component-testing/introduction',
    type: 'doc',
    durationHrs: 4,
    provider: 'Cypress',
  },
  design_systems_figma: {
    id: 'design_systems_figma',
    title: 'Design Systems with Figma',
    url: 'https://www.figma.com/community/file/876476337898752215/design-system-template',
    type: 'doc',
    durationHrs: 3,
    provider: 'Figma',
  },
  storybook_essentials: {
    id: 'storybook_essentials',
    title: 'Storybook essentials tutorial',
    url: 'https://storybook.js.org/tutorials/intro-to-storybook/react/en/get-started/',
    type: 'doc',
    durationHrs: 4,
    provider: 'Storybook',
  },
};

export type CareerResourceMap = typeof careerResources;

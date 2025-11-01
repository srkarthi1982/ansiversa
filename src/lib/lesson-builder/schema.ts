import type {
  LessonAccommodation,
  LessonAiPlaybook,
  LessonBlock,
  LessonDocument,
  LessonModule,
  LessonModuleRecord,
  LessonObjective,
  LessonPlanTier,
  LessonResource,
  LessonTemplateKey,
  LessonWorkspaceItem,
} from '../../types/lesson';

export const lessonTemplates: Array<{
  key: LessonTemplateKey;
  label: string;
  description: string;
  icon: string;
  plan: LessonPlanTier;
  subject: string;
  gradeBand: string;
  recommendedDuration: number;
}> = [
  {
    key: 'blank',
    label: 'Blank lesson',
    description: 'Start fresh with your own sections, objectives, and pacing.',
    icon: 'fas fa-circle-dot',
    plan: 'free',
    subject: 'Any subject',
    gradeBand: 'Flexible',
    recommendedDuration: 45,
  },
  {
    key: 'stem-lab',
    label: 'STEM Lab Investigation',
    description: '5E inquiry arc with lab safety reminders and data capture sheets.',
    icon: 'fas fa-flask',
    plan: 'free',
    subject: 'Science',
    gradeBand: 'Grades 6-8',
    recommendedDuration: 55,
  },
  {
    key: 'language-arts',
    label: 'Language Arts Workshop',
    description: 'Mini lesson, mentor text analysis, guided practice, and author share.',
    icon: 'fas fa-book-open-reader',
    plan: 'free',
    subject: 'Language Arts',
    gradeBand: 'Grades 4-6',
    recommendedDuration: 45,
  },
  {
    key: 'coding-workshop',
    label: 'Coding Workshop',
    description: 'Warm-up debugging challenge, explicit teach, pair programming, and retrospective.',
    icon: 'fas fa-code',
    plan: 'pro',
    subject: 'Computer Science',
    gradeBand: 'Grades 8-10',
    recommendedDuration: 60,
  },
  {
    key: 'business-strategy',
    label: 'Business Strategy Sprint',
    description: 'Case study, collaborative canvas, pitch practice, and feedback rubrics.',
    icon: 'fas fa-chart-line',
    plan: 'pro',
    subject: 'Business and Entrepreneurship',
    gradeBand: 'Higher Ed / Corporate',
    recommendedDuration: 75,
  },
  {
    key: 'soft-skills',
    label: 'Soft Skills Studio',
    description: 'Role-play, reflection prompts, and peer feedback loops with SEL alignment.',
    icon: 'fas fa-comments',
    plan: 'free',
    subject: 'Soft Skills',
    gradeBand: 'Grades 9-12',
    recommendedDuration: 50,
  },
];

export const lessonTemplateKeys = lessonTemplates.map((template) => template.key);

const defaultObjectives = (): LessonObjective[] => [
  {
    id: crypto.randomUUID(),
    statement: 'Define the central concept and explain its real-world application.',
    successCriteria: 'Given a scenario, learners describe the concept with one authentic example.',
    bloomsLevel: 'understand',
  },
];

const defaultBlocks = (): LessonBlock[] => [
  {
    id: crypto.randomUUID(),
    type: 'warmup',
    title: 'Do now',
    minutes: 5,
    objectiveId: null,
    instructions: 'Prompt learners with an activating question to surface prior knowledge.',
    resources: [],
    aiSuggested: true,
  },
  {
    id: crypto.randomUUID(),
    type: 'teach',
    title: 'Direct instruction',
    minutes: 15,
    objectiveId: null,
    instructions: 'Introduce the concept with visuals and a quick demonstration.',
    resources: [],
    aiSuggested: false,
  },
  {
    id: crypto.randomUUID(),
    type: 'practice',
    title: 'Guided practice',
    minutes: 15,
    objectiveId: null,
    instructions: 'Learners work in pairs to apply the concept to a scaffolded task.',
    resources: [],
    aiSuggested: false,
  },
  {
    id: crypto.randomUUID(),
    type: 'wrapup',
    title: 'Exit ticket',
    minutes: 10,
    objectiveId: null,
    instructions: 'Collect evidence of understanding and plan for next steps.',
    resources: [],
    aiSuggested: false,
  },
];

const defaultResources = (): LessonResource[] => [
  {
    id: crypto.randomUUID(),
    type: 'slide',
    label: 'Slide deck template',
    url: 'https://assets.ansiversa.com/templates/lesson-slides',
    notes: 'Duplicate and customise before publishing to learners.',
    plan: 'free',
  },
];

const defaultAccommodations = (): LessonAccommodation[] => [
  {
    id: crypto.randomUUID(),
    type: 'support',
    audience: 'ELL learners',
    description: 'Pre-teach vocabulary with visuals and sentence starters.',
  },
];

const defaultPlan = (plan?: LessonPlanTier): LessonPlanTier => plan ?? 'free';

export const createLessonDocument = (
  overrides: Partial<LessonDocument> = {},
): LessonDocument => {
  const now = new Date().toISOString();
  const plan = defaultPlan(overrides.plan);

  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? 'Untitled lesson',
    slug: overrides.slug ?? 'untitled-lesson',
    subject: overrides.subject ?? 'Interdisciplinary',
    gradeBand: overrides.gradeBand ?? 'Grades 6-8',
    status: overrides.status ?? 'draft',
    templateKey: overrides.templateKey ?? 'blank',
    duration: overrides.duration ?? 45,
    tags: overrides.tags ?? ['general'],
    plan,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    moduleId: overrides.moduleId ?? null,
    aiUsage: {
      outline: overrides.aiUsage?.outline ?? false,
      objectives: overrides.aiUsage?.objectives ?? false,
      activities: overrides.aiUsage?.activities ?? false,
      materials: overrides.aiUsage?.materials ?? false,
      quiz: overrides.aiUsage?.quiz ?? false,
      translation: overrides.aiUsage?.translation ?? false,
      tokensUsed: overrides.aiUsage?.tokensUsed ?? 0,
      lastRunAt: overrides.aiUsage?.lastRunAt ?? null,
    },
    objectives: overrides.objectives ?? defaultObjectives(),
    blocks: overrides.blocks ?? defaultBlocks(),
    resources: overrides.resources ?? defaultResources(),
    accommodations: overrides.accommodations ?? defaultAccommodations(),
    schedule: {
      targetDate: overrides.schedule?.targetDate ?? null,
      pacing: overrides.schedule?.pacing ?? 'single',
      totalMinutes: overrides.schedule?.totalMinutes ?? (overrides.duration ?? 45),
      calendarExported: overrides.schedule?.calendarExported ?? false,
    },
    quiz: {
      quizId: overrides.quiz?.quizId ?? null,
      title: overrides.quiz?.title ?? null,
      status: overrides.quiz?.status ?? 'not-linked',
      questionCount: overrides.quiz?.questionCount ?? 0,
      lastSyncedAt: overrides.quiz?.lastSyncedAt ?? null,
    },
  };
};

export const createLessonWorkspaceItem = (
  overrides: Partial<LessonWorkspaceItem> = {},
): LessonWorkspaceItem => {
  const base = createLessonDocument(overrides);
  const analyticsDefaults = {
    exports: 0,
    aiRuns: 0,
    learnersImpacted: 0,
    notes: 'Ready for review.',
  };

  return {
    ...base,
    ...overrides,
    analytics: {
      ...analyticsDefaults,
      ...(overrides.analytics ?? {}),
    },
    timelineStatus: overrides.timelineStatus ?? 'on-track',
  };
};

export const createLessonModule = (
  overrides: Partial<LessonModule> = {},
): LessonModule => {
  const now = new Date().toISOString();

  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? 'Untitled module',
    slug: overrides.slug ?? 'untitled-module',
    subject: overrides.subject ?? 'Interdisciplinary',
    gradeBand: overrides.gradeBand ?? 'Grades 6-8',
    status: overrides.status ?? 'draft',
    description:
      overrides.description ?? 'Sequence lessons with clear prerequisites, pacing, and export-ready overview.',
    outcomes: overrides.outcomes ?? [
      'Learners demonstrate mastery across the module outcomes.',
    ],
    prerequisites: overrides.prerequisites ?? ['Confirm baseline knowledge assessment.'],
    plan: overrides.plan ?? 'free',
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    sequence: overrides.sequence ?? [],
    pacing: {
      weeks: overrides.pacing?.weeks ?? 2,
      hoursPerWeek: overrides.pacing?.hoursPerWeek ?? 2,
      totalMinutes: overrides.pacing?.totalMinutes ?? 180,
      calendarExported: overrides.pacing?.calendarExported ?? false,
    },
    lessonIds: overrides.lessonIds ?? [],
    leadInstructor: overrides.leadInstructor ?? 'Curriculum Team',
  };
};

export const createLessonModuleRecord = (
  overrides: Partial<LessonModuleRecord> = {},
): LessonModuleRecord => {
  const base = createLessonModule(overrides);
  const analyticsDefaults = {
    publishedLessons: 0,
    drafts: 0,
    exports: 0,
    shareUrl: null,
  };

  return {
    ...base,
    ...overrides,
    analytics: {
      ...analyticsDefaults,
      ...(overrides.analytics ?? {}),
    },
  };
};

export const aiPlaybooks: LessonAiPlaybook[] = [
  {
    key: 'outline',
    title: 'Generate outline',
    description: 'Create 5E or workshop-style structure with timings and transitions.',
    icon: 'fas fa-timeline',
    plan: 'free',
  },
  {
    key: 'objectives',
    title: 'Draft SMART objectives',
    description: 'Produce measurable outcomes aligned to Bloom and success criteria.',
    icon: 'fas fa-bullseye',
    plan: 'free',
  },
  {
    key: 'activities',
    title: 'Design activities',
    description: 'Get warm-up, explore, and practice ideas matched to your learners.',
    icon: 'fas fa-person-chalkboard',
    plan: 'pro',
  },
  {
    key: 'materials',
    title: 'Build resource list',
    description: 'Compile slides, handouts, and differentiation supports automatically.',
    icon: 'fas fa-folder-tree',
    plan: 'pro',
  },
  {
    key: 'quiz',
    title: 'Generate quiz questions',
    description: 'Draft formative checks or exit tickets with answer keys.',
    icon: 'fas fa-list-check',
    plan: 'pro',
  },
  {
    key: 'translation',
    title: 'Localise and translate',
    description: 'Provide dual-language exports and RTL-friendly layouts.',
    icon: 'fas fa-language',
    plan: 'pro',
  },
];

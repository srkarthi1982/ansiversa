import { clone } from '../../../utils/clone';

export interface StudyMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  delta: string;
  icon: string;
}

export interface StudySubjectTopic {
  name: string;
  status: 'scheduled' | 'in-progress' | 'mastered';
  nextSession: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface StudySubject {
  id: string;
  name: string;
  board: string;
  gradeBand: string;
  icon: string;
  mastery: number;
  weeklyHours: number;
  upcomingAssessment: string;
  topics: StudySubjectTopic[];
}

export interface StudyTask {
  id: string;
  title: string;
  subjectId: string;
  topic: string;
  estimatedMinutes: number;
  difficulty: 'Light' | 'Moderate' | 'Intense';
  priorityScore: number;
  due: string;
  urgencyLabel: string;
  linkedDeck: string | null;
  integrationSource: string | null;
  notes: string;
}

export interface StudyPlanSlot {
  id: string;
  taskId: string;
  type: 'study' | 'review' | 'buffer';
  subjectId: string;
  focus: string;
  day: string;
  start: string;
  end: string;
  durationMinutes: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'missed';
  energy: 'peak' | 'steady' | 'light';
  notes: string;
}

export interface AvailabilityBlock {
  start: string;
  end: string;
  tag?: string;
}

export interface AvailabilityDay {
  id: string;
  label: string;
  enabled: boolean;
  dailyCapHours: number;
  focusTheme: string;
  blocks: AvailabilityBlock[];
}

export interface StudyHighlightPillar {
  title: string;
  description: string;
  icon: string;
  chips: string[];
}

export interface StudyHighlightGuardrail {
  title: string;
  description: string;
  icon: string;
}

export interface StudyHighlights {
  pillars: StudyHighlightPillar[];
  guardrails: StudyHighlightGuardrail[];
}

export interface StudyRevisionDeck {
  id: string;
  name: string;
  subjectId: string;
  dueCards: number;
  dueLabel: string;
  interval: string;
  confidence: 'Low' | 'Medium' | 'High';
  nextReview: string;
  lastScore: string;
  source: string;
}

export interface StudyRevisionQueueItem {
  id: string;
  label: string;
  due: string;
  workload: string;
  focus: string;
}

export interface StudyRevisionStat {
  label: string;
  value: string;
  description: string;
  icon: string;
}

export interface StudyRevisionData {
  decks: StudyRevisionDeck[];
  queue: StudyRevisionQueueItem[];
  stats: StudyRevisionStat[];
}

export interface WeeklyFocusBreakdownItem {
  subjectId: string;
  subjectName: string;
  hours: number;
  target: number;
  trend: 'up' | 'down' | 'steady';
}

export interface MasteryMilestone {
  label: string;
  progress: number;
  description: string;
}

export interface RiskSignal {
  id: string;
  title: string;
  detail: string;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface StudyAnalytics {
  weeklyFocus: WeeklyFocusBreakdownItem[];
  velocity: { thisWeek: number; lastWeek: number; trendLabel: string };
  masteryMilestones: MasteryMilestone[];
  riskSignals: RiskSignal[];
}

export interface PlanComparisonRow {
  capability: string;
  free: string;
  pro: string;
}

export interface IntegrationCard {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: string;
}

const studyMetrics: StudyMetric[] = [
  {
    id: 'hours-planned',
    label: 'Hours scheduled',
    value: 18.5,
    unit: 'hrs this week',
    delta: '+2.0 vs last week',
    icon: 'fas fa-calendar-check',
  },
  {
    id: 'reviews-due',
    label: 'Reviews due today',
    value: 12,
    unit: 'cards',
    delta: '5 completed already',
    icon: 'fas fa-rotate-right',
  },
  {
    id: 'streak',
    label: 'Focus streak',
    value: 8,
    unit: 'days',
    delta: 'Best 12-day record',
    icon: 'fas fa-fire',
  },
];

const studySubjects: StudySubject[] = [
  {
    id: 'mathematics',
    name: 'Mathematics',
    board: 'CBSE',
    gradeBand: 'Class 12',
    icon: 'fas fa-square-root-variable',
    mastery: 72,
    weeklyHours: 6.5,
    upcomingAssessment: 'JEE mock on 12 Oct',
    topics: [
      { name: 'Integration techniques', status: 'in-progress', nextSession: 'Thu · 90m', priority: 'High' },
      { name: 'Differential equations', status: 'scheduled', nextSession: 'Sat · 60m', priority: 'Medium' },
      { name: 'Probability', status: 'mastered', nextSession: 'Review Sun', priority: 'Low' },
    ],
  },
  {
    id: 'physics',
    name: 'Physics',
    board: 'CBSE',
    gradeBand: 'Class 12',
    icon: 'fas fa-atom',
    mastery: 64,
    weeklyHours: 5.5,
    upcomingAssessment: 'Board practical on 9 Oct',
    topics: [
      { name: 'Wave optics', status: 'in-progress', nextSession: 'Fri · 75m', priority: 'High' },
      { name: 'Electrostatics', status: 'scheduled', nextSession: 'Sun · 50m', priority: 'Medium' },
      { name: 'Modern physics', status: 'scheduled', nextSession: 'Tue · 45m', priority: 'Low' },
    ],
  },
  {
    id: 'english',
    name: 'English',
    board: 'CBSE',
    gradeBand: 'Class 12',
    icon: 'fas fa-book-open-reader',
    mastery: 81,
    weeklyHours: 3.2,
    upcomingAssessment: 'Internal assessment on 14 Oct',
    topics: [
      { name: 'Novel commentary', status: 'in-progress', nextSession: 'Thu · 45m', priority: 'Medium' },
      { name: 'Listening skills', status: 'scheduled', nextSession: 'Sat · 30m', priority: 'Low' },
      { name: 'Grammar drills', status: 'mastered', nextSession: 'Self-check Tue', priority: 'Low' },
    ],
  },
  {
    id: 'computer-science',
    name: 'Computer Science',
    board: 'CBSE',
    gradeBand: 'Class 12',
    icon: 'fas fa-code',
    mastery: 76,
    weeklyHours: 3.3,
    upcomingAssessment: 'Project viva on 11 Oct',
    topics: [
      { name: 'Stacks & queues', status: 'in-progress', nextSession: 'Fri · 60m', priority: 'Medium' },
      { name: 'SQL joins', status: 'scheduled', nextSession: 'Sat · 45m', priority: 'High' },
      { name: 'Cyber ethics', status: 'mastered', nextSession: 'Review Mon', priority: 'Low' },
    ],
  },
];

const studyTasks: StudyTask[] = [
  {
    id: 'task-integration-drill',
    title: 'Solve definite integration drill (Set 04)',
    subjectId: 'mathematics',
    topic: 'Integration techniques',
    estimatedMinutes: 90,
    difficulty: 'Intense',
    priorityScore: 87,
    due: 'Fri · 6 Oct',
    urgencyLabel: 'Due in 2 days',
    linkedDeck: 'FlashNote · Calculus booster',
    integrationSource: 'Homework Helper snapshot',
    notes: 'Focus on substitution and parts. Mark tricky steps for Homework Helper recap.',
  },
  {
    id: 'task-wave-optics',
    title: 'Concept map: Wave optics interference patterns',
    subjectId: 'physics',
    topic: 'Wave optics',
    estimatedMinutes: 60,
    difficulty: 'Moderate',
    priorityScore: 78,
    due: 'Sat · 7 Oct',
    urgencyLabel: 'Buffer 3 days',
    linkedDeck: 'FlashNote · Physics 12 — Optics',
    integrationSource: 'Quiz Institute practice #2311',
    notes: 'Translate quiz mistakes into targeted flashcards and mark lab observation points.',
  },
  {
    id: 'task-english-essay',
    title: 'Essay rehearsal: The Rattrap (Board style)',
    subjectId: 'english',
    topic: 'Novel commentary',
    estimatedMinutes: 45,
    difficulty: 'Moderate',
    priorityScore: 65,
    due: 'Sun · 8 Oct',
    urgencyLabel: 'Draft this weekend',
    linkedDeck: null,
    integrationSource: 'Lesson Builder outline',
    notes: 'Use PEEL framework, note textual evidence, and send to Concept Explainer for tone check.',
  },
  {
    id: 'task-sql-lab',
    title: 'SQL join lab — normalise library dataset',
    subjectId: 'computer-science',
    topic: 'SQL joins',
    estimatedMinutes: 50,
    difficulty: 'Moderate',
    priorityScore: 82,
    due: 'Sat · 7 Oct',
    urgencyLabel: 'Practice before lab',
    linkedDeck: 'FlashNote · DBMS quick checks',
    integrationSource: 'Course Tracker sprint',
    notes: 'Run queries in the sandbox, export summary to Project Log when complete.',
  },
  {
    id: 'task-electrostatics-practice',
    title: 'Electrostatics derivation walkthrough',
    subjectId: 'physics',
    topic: 'Electrostatics',
    estimatedMinutes: 40,
    difficulty: 'Light',
    priorityScore: 58,
    due: 'Tue · 10 Oct',
    urgencyLabel: 'Early preview',
    linkedDeck: null,
    integrationSource: 'Homework Helper hint ladder',
    notes: 'Use Homework Helper to reveal hint tiers, then capture reasoning for revision deck.',
  },
];

const studyPlanSlots: StudyPlanSlot[] = [
  {
    id: 'slot-thu-focus-1',
    taskId: 'task-integration-drill',
    type: 'study',
    subjectId: 'mathematics',
    focus: 'Calculus drill — substitution focus',
    day: 'Thu',
    start: '17:30',
    end: '19:00',
    durationMinutes: 90,
    status: 'scheduled',
    energy: 'peak',
    notes: 'Prime time block; auto-scheduled from priority ranking.',
  },
  {
    id: 'slot-thu-review-1',
    taskId: 'deck-calculus',
    type: 'review',
    subjectId: 'mathematics',
    focus: 'FlashNote — Calculus booster reviews',
    day: 'Thu',
    start: '19:15',
    end: '19:45',
    durationMinutes: 30,
    status: 'scheduled',
    energy: 'steady',
    notes: 'SM-2 spacing after drill block.',
  },
  {
    id: 'slot-fri-physics',
    taskId: 'task-wave-optics',
    type: 'study',
    subjectId: 'physics',
    focus: 'Wave optics concept map',
    day: 'Fri',
    start: '18:00',
    end: '19:15',
    durationMinutes: 75,
    status: 'scheduled',
    energy: 'peak',
    notes: 'Linked to Quiz Institute miss-analysis.',
  },
  {
    id: 'slot-sat-sql',
    taskId: 'task-sql-lab',
    type: 'study',
    subjectId: 'computer-science',
    focus: 'SQL joins lab rehearsal',
    day: 'Sat',
    start: '10:00',
    end: '10:50',
    durationMinutes: 50,
    status: 'scheduled',
    energy: 'peak',
    notes: 'Course Tracker sprint item.',
  },
  {
    id: 'slot-sat-essay',
    taskId: 'task-english-essay',
    type: 'study',
    subjectId: 'english',
    focus: 'Essay rehearsal — The Rattrap',
    day: 'Sat',
    start: '17:30',
    end: '18:15',
    durationMinutes: 45,
    status: 'scheduled',
    energy: 'steady',
    notes: 'Time-block with Pomodoro support.',
  },
  {
    id: 'slot-sun-buffer',
    taskId: 'buffer-weekly-review',
    type: 'buffer',
    subjectId: 'mathematics',
    focus: 'Weekly buffer & catch-up',
    day: 'Sun',
    start: '09:30',
    end: '10:30',
    durationMinutes: 60,
    status: 'scheduled',
    energy: 'light',
    notes: 'Protects rest day but keeps light checkpoint.',
  },
];

const availabilityTemplate: AvailabilityDay[] = [
  {
    id: 'mon',
    label: 'Monday',
    enabled: true,
    dailyCapHours: 3.5,
    focusTheme: 'After-school refresh',
    blocks: [
      { start: '17:30', end: '19:00', tag: 'Core subjects' },
      { start: '19:30', end: '20:15', tag: 'Revision' },
    ],
  },
  {
    id: 'tue',
    label: 'Tuesday',
    enabled: true,
    dailyCapHours: 3,
    focusTheme: 'STEM focus',
    blocks: [
      { start: '18:00', end: '19:30', tag: 'Physics / Math' },
    ],
  },
  {
    id: 'wed',
    label: 'Wednesday',
    enabled: true,
    dailyCapHours: 2.5,
    focusTheme: 'Clubs & light review',
    blocks: [
      { start: '20:00', end: '21:00', tag: 'Revision only' },
    ],
  },
  {
    id: 'thu',
    label: 'Thursday',
    enabled: true,
    dailyCapHours: 3.5,
    focusTheme: 'Double stack practice',
    blocks: [
      { start: '17:30', end: '19:45', tag: 'Math + FlashNote' },
    ],
  },
  {
    id: 'fri',
    label: 'Friday',
    enabled: true,
    dailyCapHours: 3,
    focusTheme: 'Physics lab prep',
    blocks: [
      { start: '18:00', end: '19:30', tag: 'Wave optics' },
    ],
  },
  {
    id: 'sat',
    label: 'Saturday',
    enabled: true,
    dailyCapHours: 4,
    focusTheme: 'Deep work + reflections',
    blocks: [
      { start: '10:00', end: '12:00', tag: 'Labs & projects' },
      { start: '17:00', end: '18:30', tag: 'Language arts' },
    ],
  },
  {
    id: 'sun',
    label: 'Sunday',
    enabled: false,
    dailyCapHours: 1,
    focusTheme: 'Rest + catch-up buffer',
    blocks: [
      { start: '09:30', end: '10:30', tag: 'Weekly review (optional)' },
    ],
  },
];

const studyHighlights: StudyHighlights = {
  pillars: [
    {
      title: 'Smart scheduler',
      description:
        'Blends deadlines, daily caps, energy levels, and board-specific pacing guides to auto-distribute your backlog.',
      icon: 'fas fa-calendar-star',
      chips: ['Daily cap aware', 'Energy-based blocks', 'Conflicts resolved'],
    },
    {
      title: 'Spaced repetition',
      description:
        'Links FlashNote decks with SM-2 intervals, letting you convert Quiz Institute errors into review cards instantly.',
      icon: 'fas fa-clone',
      chips: ['Linked decks', 'Confidence scoring', 'Session notes'],
    },
    {
      title: 'Focus habits',
      description:
        'Built-in Pomodoro with mood check-ins, break nudges, and reflections to preserve your streaks across busy weeks.',
      icon: 'fas fa-stopwatch',
      chips: ['25-5 cadence', 'Focus analytics', 'Reflective journaling'],
    },
  ],
  guardrails: [
    {
      title: 'Board-aligned syllabi',
      description: 'CBSE and international syllabi mapped to subjects, ensuring coverage without duplication.',
      icon: 'fas fa-graduation-cap',
    },
    {
      title: 'Healthy workload caps',
      description: 'Daily and weekly workload caps protect rest days while leaving buffer blocks for catch-up.',
      icon: 'fas fa-heart-pulse',
    },
    {
      title: 'Integrity-first reviews',
      description: 'Review prompts encourage explanations and citations—no direct answer dumps from integrated apps.',
      icon: 'fas fa-shield-check',
    },
  ],
};

const revisionData: StudyRevisionData = {
  decks: [
    {
      id: 'deck-calculus',
      name: 'FlashNote · Calculus booster',
      subjectId: 'mathematics',
      dueCards: 18,
      dueLabel: 'Due tonight',
      interval: 'SM-2 · 2.4 days avg',
      confidence: 'Medium',
      nextReview: 'Fri · 6 Oct, 19:30',
      lastScore: 'Retention 78%',
      source: 'FlashNote sync',
    },
    {
      id: 'deck-optics',
      name: 'FlashNote · Physics 12 — Optics',
      subjectId: 'physics',
      dueCards: 9,
      dueLabel: 'Due tomorrow',
      interval: 'SM-2 · 1.6 days avg',
      confidence: 'Low',
      nextReview: 'Sat · 7 Oct, 18:30',
      lastScore: 'Retention 62%',
      source: 'Quiz Institute misses',
    },
    {
      id: 'deck-sql',
      name: 'FlashNote · DBMS quick checks',
      subjectId: 'computer-science',
      dueCards: 6,
      dueLabel: 'In 3 days',
      interval: 'SM-2 · 3.5 days avg',
      confidence: 'High',
      nextReview: 'Mon · 9 Oct, 20:00',
      lastScore: 'Retention 88%',
      source: 'Course Tracker sprint',
    },
  ],
  queue: [
    {
      id: 'queue-evening',
      label: 'Evening flash review',
      due: 'Today · 19:15',
      workload: '24 cards · 18 mins',
      focus: 'Calculus booster, Essay key quotes',
    },
    {
      id: 'queue-morning',
      label: 'Morning quick stack',
      due: 'Tomorrow · 07:45',
      workload: '11 cards · 9 mins',
      focus: 'Optics error fixes, SQL syntax',
    },
  ],
  stats: [
    {
      label: 'Reviews cleared this week',
      value: '63 cards',
      description: 'Consistency unlocked 82% retention score.',
      icon: 'fas fa-chart-line',
    },
    {
      label: 'Streak',
      value: '8 days',
      description: 'Break-friendly weekends still count when buffer sessions logged.',
      icon: 'fas fa-fire',
    },
    {
      label: 'Deck limit',
      value: '2 / 2 linked',
      description: 'Upgrade to Pro for unlimited deck automations.',
      icon: 'fas fa-link',
    },
  ],
};

const analyticsSnapshot: StudyAnalytics = {
  weeklyFocus: [
    { subjectId: 'mathematics', subjectName: 'Mathematics', hours: 6.5, target: 6, trend: 'up' },
    { subjectId: 'physics', subjectName: 'Physics', hours: 5, target: 5.5, trend: 'down' },
    { subjectId: 'english', subjectName: 'English', hours: 3, target: 2.5, trend: 'steady' },
    { subjectId: 'computer-science', subjectName: 'Computer Science', hours: 4, target: 3.5, trend: 'up' },
  ],
  velocity: { thisWeek: 14, lastWeek: 11, trendLabel: '+3 sessions completed' },
  masteryMilestones: [
    {
      label: 'Calculus — definite integrals',
      progress: 68,
      description: 'Homework Helper ladders logged and linked to FlashNote for retention.',
    },
    {
      label: 'Wave optics — interference',
      progress: 54,
      description: 'Needs one more concept map + Quiz Institute reinforcement.',
    },
    {
      label: 'SQL joins — optimisation',
      progress: 72,
      description: 'Lab rehearsal scheduled; export to Portfolio Creator after completion.',
    },
  ],
  riskSignals: [
    {
      id: 'risk-physics-gap',
      title: 'Physics pacing slip',
      detail: 'You are 0.5 hrs behind the board pacing for Electrostatics.',
      severity: 'medium',
      recommendation: 'Promote the derivation walkthrough or add a Sun buffer block.',
    },
    {
      id: 'risk-breaks',
      title: 'Break debt accruing',
      detail: 'Two focus blocks exceeded 90 minutes without logging a recovery break.',
      severity: 'low',
      recommendation: 'Use Pomodoro auto-breaks or schedule a light walk block.',
    },
  ],
};

const planComparison: PlanComparisonRow[] = [
  { capability: 'Tasks & subtasks', free: 'Up to 200 active tasks', pro: 'Unlimited subjects, tasks, and templates' },
  { capability: 'Auto-scheduler', free: 'Basic: deadlines + daily caps', pro: 'Advanced: energy, labs, commute, blockers' },
  { capability: 'Pomodoro timer', free: 'Timer + streak tracking', pro: 'Timer + CSV export + focus heatmaps' },
  { capability: 'Spaced repetition', free: 'Link up to 2 FlashNote decks', pro: 'Unlimited decks + adaptive SM-2 tuning' },
  { capability: 'Analytics', free: 'Daily brief & weekly digest', pro: 'Full analytics, CSV export, counselor view' },
  { capability: 'Calendar export', free: '—', pro: 'ICS export + Google Classroom sync' },
  { capability: 'Integrations', free: 'View-only from FlashNote & Quiz', pro: 'Two-way sync with FlashNote, Homework Helper, Course Tracker' },
];

const integrationCards: IntegrationCard[] = [
  {
    id: 'flashnote',
    name: 'FlashNote decks',
    description: 'Sync due cards, retention scores, and difficulty ratings straight into Study Planner reviews.',
    icon: 'fas fa-clone',
    status: 'Synced — 2 decks linked',
  },
  {
    id: 'quiz-institute',
    name: 'Quiz Institute',
    description: 'Auto-import wrong answers as backlog tasks with recommended remedial sessions.',
    icon: 'fas fa-trophy',
    status: 'Connected · last sync 1h ago',
  },
  {
    id: 'homework-helper',
    name: 'Homework Helper',
    description: 'Convert scaffolded solutions into stepwise study tasks with integrity checkpoints.',
    icon: 'fas fa-lightbulb',
    status: 'Active · 3 tasks generated',
  },
  {
    id: 'course-tracker',
    name: 'Course Tracker',
    description: 'Pull sprint goals and convert them into calendar-ready study sessions.',
    icon: 'fas fa-layer-group',
    status: 'Connected · 1 sprint in progress',
  },
];

export const getStudyMetrics = (): StudyMetric[] => clone(studyMetrics);
export const getStudySubjects = (): StudySubject[] => clone(studySubjects);
export const getStudyBacklog = (): StudyTask[] => clone(studyTasks);
export const getStudySchedule = (): StudyPlanSlot[] => clone(studyPlanSlots);
export const getStudyAvailability = (): AvailabilityDay[] => clone(availabilityTemplate);
export const getStudyHighlights = (): StudyHighlights => clone(studyHighlights);
export const getStudyRevisionData = (): StudyRevisionData => clone(revisionData);
export const getStudyAnalytics = (): StudyAnalytics => clone(analyticsSnapshot);
export const getPlanComparisonRows = (): PlanComparisonRow[] => clone(planComparison);
export const getIntegrationCards = (): IntegrationCard[] => clone(integrationCards);

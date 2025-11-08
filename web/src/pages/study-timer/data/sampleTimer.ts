import type {
  StudyTimerGoalSnapshot,
  StudyTimerHistoryDay,
  StudyTimerIntegrationCard,
  StudyTimerPlanFeature,
  StudyTimerPreset,
  StudyTimerStatHighlight,
  StudyTimerTag,
  StudyTimerTrendPoint,
} from '../../../types/study-timer';

export const getStudyTimerPresets = (): StudyTimerPreset[] => [
  {
    id: 'preset-pomodoro',
    name: 'Pomodoro 25/5',
    description: 'Four focus cycles with short breathers and a restorative long break.',
    mode: 'pomodoro',
    workMin: 25,
    shortBreakMin: 5,
    longBreakMin: 15,
    longEvery: 4,
    cycles: 4,
    sound: 'bell',
    color: 'from-rose-500 via-orange-500 to-amber-500',
  },
  {
    id: 'preset-long-focus',
    name: 'Long Focus 50/10',
    description: 'Deep focus blocks for heavy study sessions or project sprints.',
    mode: 'long-pom',
    workMin: 50,
    shortBreakMin: 10,
    longBreakMin: 20,
    longEvery: 3,
    cycles: 3,
    sound: 'focus',
    color: 'from-indigo-500 via-sky-500 to-purple-500',
  },
  {
    id: 'preset-custom-review',
    name: 'Revision Burst',
    description: 'Short review cycles to keep spaced repetition lively.',
    mode: 'custom',
    workMin: 15,
    shortBreakMin: 3,
    longBreakMin: 10,
    longEvery: 5,
    cycles: 5,
    sound: 'chime',
    color: 'from-emerald-500 via-teal-500 to-cyan-500',
  },
  {
    id: 'preset-countup',
    name: 'Free Flow Count-up',
    description: 'Track open-ended focus time, perfect for reading or labs.',
    mode: 'countup',
    workMin: 0,
    shortBreakMin: 0,
    longBreakMin: 0,
    longEvery: 0,
    cycles: 1,
    sound: 'silence',
    color: 'from-slate-500 via-slate-600 to-slate-800',
  },
];

export const getStudyTimerTags = (): StudyTimerTag[] => [
  { id: 'tag-physics', label: 'Physics', color: 'bg-sky-100 text-sky-700', usageMinutes: 240 },
  { id: 'tag-math', label: 'Math', color: 'bg-indigo-100 text-indigo-700', usageMinutes: 180 },
  { id: 'tag-chem', label: 'Chemistry', color: 'bg-rose-100 text-rose-700', usageMinutes: 95 },
  { id: 'tag-history', label: 'History', color: 'bg-amber-100 text-amber-700', usageMinutes: 60 },
  { id: 'tag-flash', label: 'FlashNote', color: 'bg-emerald-100 text-emerald-700', usageMinutes: 40 },
  { id: 'tag-quiz', label: 'Quiz Drill', color: 'bg-fuchsia-100 text-fuchsia-700', usageMinutes: 32 },
];

export const getStudyTimerGoalSnapshot = (): StudyTimerGoalSnapshot => ({
  targetDailyMinutes: 210,
  completedDailyMinutes: 162,
  targetDailyPomos: 8,
  completedDailyPomos: 6,
  weeklyTargetMinutes: 1260,
  weeklyCompletedMinutes: 980,
  streakDays: 12,
  longestStreak: 19,
});

export const getStudyTimerHighlights = (): StudyTimerStatHighlight[] => [
  {
    label: 'Today focus',
    value: '2h 42m',
    delta: '+18%',
    icon: 'fas fa-stopwatch',
    trend: 'up',
  },
  {
    label: 'Interruptions/hour',
    value: '0.6',
    delta: '-0.2',
    icon: 'fas fa-person-walking-arrow-right',
    trend: 'down',
  },
  {
    label: 'Tag streak',
    value: 'Physics · 6 days',
    delta: '+2',
    icon: 'fas fa-atom',
    trend: 'up',
  },
];

export const getStudyTimerTrend = (): StudyTimerTrendPoint[] => [
  { label: 'Mon', minutes: 180, pomodoros: 6, interruptions: 5 },
  { label: 'Tue', minutes: 210, pomodoros: 7, interruptions: 3 },
  { label: 'Wed', minutes: 156, pomodoros: 5, interruptions: 2 },
  { label: 'Thu', minutes: 198, pomodoros: 6, interruptions: 4 },
  { label: 'Fri', minutes: 225, pomodoros: 7, interruptions: 3 },
  { label: 'Sat', minutes: 142, pomodoros: 4, interruptions: 1 },
  { label: 'Sun', minutes: 120, pomodoros: 4, interruptions: 2 },
];

export const getStudyTimerHistory = (): StudyTimerHistoryDay[] => [
  {
    date: '2025-02-16',
    totalMinutes: 182,
    pomodoros: 6,
    interruptions: 3,
    sessions: [
      {
        id: 'session-physics-1',
        subject: 'Physics — Optics practice',
        durationMinutes: 55,
        pomodoros: 2,
        endedAt: '2025-02-16T10:30:00Z',
        tags: ['Physics', 'Quiz Drill'],
        interruptions: 1,
        note: 'Linked to Quiz Institute practice set on Snell\'s law.',
      },
      {
        id: 'session-math-1',
        subject: 'Math — Calculus revision',
        durationMinutes: 40,
        pomodoros: 2,
        endedAt: '2025-02-16T12:10:00Z',
        tags: ['Math'],
        interruptions: 1,
      },
      {
        id: 'session-flash-1',
        subject: 'FlashNote review sprint',
        durationMinutes: 32,
        pomodoros: 1,
        endedAt: '2025-02-16T15:45:00Z',
        tags: ['FlashNote'],
        interruptions: 0,
        note: 'Exported summary to Research Assistant for follow-up.',
      },
    ],
  },
  {
    date: '2025-02-15',
    totalMinutes: 204,
    pomodoros: 7,
    interruptions: 2,
    sessions: [
      {
        id: 'session-chem-1',
        subject: 'Chemistry — Organic synthesis notes',
        durationMinutes: 65,
        pomodoros: 2,
        endedAt: '2025-02-15T09:20:00Z',
        tags: ['Chemistry'],
        interruptions: 0,
      },
      {
        id: 'session-history-1',
        subject: 'History — Cold War prep',
        durationMinutes: 50,
        pomodoros: 2,
        endedAt: '2025-02-15T13:40:00Z',
        tags: ['History'],
        interruptions: 1,
        note: 'Flagged for Study Planner follow-up.',
      },
      {
        id: 'session-physics-2',
        subject: 'Physics — Lab write-up',
        durationMinutes: 45,
        pomodoros: 2,
        endedAt: '2025-02-15T17:25:00Z',
        tags: ['Physics'],
        interruptions: 1,
      },
    ],
  },
];

export const getStudyTimerIntegrations = (): StudyTimerIntegrationCard[] => [
  {
    id: 'integration-planner',
    name: 'Study Planner',
    description: 'Sync sessions into your weekly plan and auto-schedule unfinished tasks.',
    icon: 'fas fa-calendar-check',
    actionLabel: 'Send to Planner',
    badge: 'Pro',
  },
  {
    id: 'integration-quiz',
    name: 'Quiz Institute',
    description: 'Attach question banks or auto-launch drills when the timer starts.',
    icon: 'fas fa-person-chalkboard',
    actionLabel: 'Link practice set',
  },
  {
    id: 'integration-flashnote',
    name: 'FlashNote',
    description: 'Convert session notes into condensed flashcards or spaced review prompts.',
    icon: 'fas fa-clone',
    actionLabel: 'Export to FlashNote',
  },
  {
    id: 'integration-research',
    name: 'Research Assistant',
    description: 'Send follow-up questions and reading lists straight to your research workspace.',
    icon: 'fas fa-flask',
    actionLabel: 'Add to Research',
  },
];

export const getStudyTimerPlanFeatures = (): StudyTimerPlanFeature[] => [
  { label: 'Custom presets', free: '2 saved presets', pro: 'Unlimited saved cycles + import/export' },
  { label: 'Goals and streaks', free: 'Daily minutes target', pro: 'Daily + weekly + Pomodoro streaks' },
  { label: 'Interruptions log', free: 'Manual quick log', pro: 'Auto-tag reasons + analytics' },
  { label: 'Exports', free: '—', pro: 'CSV + ICS calendar download' },
  { label: 'Integrations', free: 'Links to Planner/Quiz/FlashNote', pro: 'One-click attach + automation' },
  { label: 'History retention', free: '60 days', pro: 'Unlimited with advanced filters' },
];

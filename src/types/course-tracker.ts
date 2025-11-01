export type CourseStatus = 'active' | 'completed' | 'planning' | 'archived';

export type StudySessionType = 'deep-work' | 'review' | 'catch-up';

export type PlanSessionStatus = 'scheduled' | 'completed' | 'overdue';

export type CourseTimelineType = 'session' | 'milestone' | 'note' | 'reminder';

export type CoursePlanPace = 'steady' | 'intensive' | 'flex';

export type ReminderCadence = 'Daily' | 'Weekly' | 'Biweekly' | 'Custom';

export type ReminderChannel = 'Email' | 'Push' | 'SMS';

export type CourseFocusArea =
  | 'Data and AI'
  | 'Product and Strategy'
  | 'Creative'
  | 'Productivity'
  | 'Wellness'
  | 'Career';

export interface LessonRecord {
  id: string;
  courseId: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  durationMin: number;
  resourceUrl: string;
  position: number;
  completed: boolean;
  scheduledFor: string | null;
  dueAt: string | null;
  noteCount: number;
  quizAttached: boolean;
  tags: string[];
}

export interface ModuleRecord {
  id: string;
  title: string;
  description: string;
  position: number;
  lessons: LessonRecord[];
}

export interface PlanSession {
  id: string;
  day: string;
  focus: string;
  start: string;
  end: string;
  lessonIds: string[];
  type: 'study' | 'review' | 'buffer';
  status: PlanSessionStatus;
}

export interface PlanMilestone {
  id: string;
  label: string;
  date: string;
  type: 'checkpoint' | 'exam' | 'project';
}

export interface ReminderSetting {
  id: string;
  label: string;
  cadence: ReminderCadence;
  time: string;
  channel: ReminderChannel;
  active: boolean;
}

export interface QuizAttachment {
  id: string;
  lessonId: string;
  title: string;
  url: string;
  status: 'draft' | 'published';
}

export interface CourseResourceLink {
  label: string;
  url: string;
}

export interface CourseNotesOverview {
  lessonId: string;
  title: string;
  excerpt: string;
  updatedAt: string;
}

export interface CourseHighlightSummary {
  wins: string[];
  blockers: string[];
  focusQuestion: string;
}

export interface CourseMetrics {
  totalLessons: number;
  completedLessons: number;
  minutesLogged: number;
  minutesThisWeek: number;
  overdueLessons: number;
}

export interface CoursePlan {
  weeklyGoalHours: number;
  preferredPace: CoursePlanPace;
  streakDays: number;
  longestStreak: number;
  studyDays: string[];
  nextReminderAt: string;
  autoAdjust: boolean;
  sessions: PlanSession[];
  upcomingMilestones: PlanMilestone[];
}

export interface CourseRecord {
  id: string;
  title: string;
  slug: string;
  provider: string;
  url: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  focusArea: CourseFocusArea;
  status: CourseStatus;
  estimatedHours: number;
  progressPct: number;
  startedAt: string;
  targetEndDate: string;
  modules: ModuleRecord[];
  plan: CoursePlan;
  reminders: ReminderSetting[];
  quizLinks: QuizAttachment[];
  resources: CourseResourceLink[];
  notesOverview: CourseNotesOverview[];
  highlight: CourseHighlightSummary;
  metrics: CourseMetrics;
}

export interface StudySessionRecord {
  id: string;
  courseId: string;
  lessonId: string;
  startedAt: string;
  endedAt: string;
  minutes: number;
  type: StudySessionType;
}

export interface NoteRecord {
  id: string;
  courseId: string;
  lessonId: string;
  title: string;
  body: string;
  updatedAt: string;
  tags: string[];
}

export interface ExportStatus {
  id: string;
  format: 'Markdown' | 'CSV' | 'PDF' | 'ICS';
  lastRunAt: string | null;
  status: 'ready' | 'pro' | 'needs-upgrade';
  description: string;
}

export interface CourseTimelineEvent {
  id: string;
  courseId: string;
  date: string;
  type: CourseTimelineType;
  label: string;
  detail: string;
}

export interface CourseTrackerSampleData {
  courses: CourseRecord[];
  sessions: StudySessionRecord[];
  notes: NoteRecord[];
  exports: ExportStatus[];
  timeline: CourseTimelineEvent[];
}

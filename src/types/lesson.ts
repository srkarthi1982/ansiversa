export type LessonPlanTier = 'free' | 'pro';

export type LessonStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export type LessonTemplateKey =
  | 'blank'
  | 'stem-lab'
  | 'language-arts'
  | 'coding-workshop'
  | 'business-strategy'
  | 'soft-skills';

export type LessonBlockType = 'warmup' | 'teach' | 'explore' | 'practice' | 'assess' | 'wrapup';

export type LessonAiActionKey = 'outline' | 'objectives' | 'activities' | 'materials' | 'quiz' | 'translation';

export type LessonTimelineStatus = 'on-track' | 'attention' | 'completed';

export interface LessonObjective {
  id: string;
  statement: string;
  successCriteria: string;
  bloomsLevel: 'remember' | 'understand' | 'apply' | 'analyse' | 'evaluate' | 'create';
}

export interface LessonBlock {
  id: string;
  type: LessonBlockType;
  title: string;
  minutes: number;
  objectiveId: string | null;
  instructions: string;
  resources: string[];
  aiSuggested: boolean;
}

export type LessonResourceType = 'slide' | 'worksheet' | 'video' | 'link' | 'document';

export interface LessonResource {
  id: string;
  type: LessonResourceType;
  label: string;
  url: string;
  notes: string;
  plan: LessonPlanTier;
}

export type LessonAccommodationType = 'support' | 'extension' | 'accessibility';

export interface LessonAccommodation {
  id: string;
  type: LessonAccommodationType;
  audience: string;
  description: string;
}

export interface LessonSchedule {
  targetDate: string | null;
  pacing: 'single' | 'double' | 'flex';
  totalMinutes: number;
  calendarExported: boolean;
}

export interface LessonQuizLink {
  quizId: string | null;
  title: string | null;
  status: 'not-linked' | 'linked' | 'generated';
  questionCount: number;
  lastSyncedAt: string | null;
}

export interface LessonDocument {
  id: string;
  title: string;
  slug: string;
  subject: string;
  gradeBand: string;
  status: LessonStatus;
  templateKey: LessonTemplateKey;
  duration: number;
  tags: string[];
  plan: LessonPlanTier;
  createdAt: string;
  updatedAt: string;
  moduleId: string | null;
  aiUsage: {
    outline: boolean;
    objectives: boolean;
    activities: boolean;
    materials: boolean;
    quiz: boolean;
    translation: boolean;
    tokensUsed: number;
    lastRunAt: string | null;
  };
  objectives: LessonObjective[];
  blocks: LessonBlock[];
  resources: LessonResource[];
  accommodations: LessonAccommodation[];
  schedule: LessonSchedule;
  quiz: LessonQuizLink;
}

export interface LessonWorkspaceItem extends LessonDocument {
  analytics: {
    exports: number;
    aiRuns: number;
    learnersImpacted: number;
    notes: string;
  };
  timelineStatus: LessonTimelineStatus;
}

export interface LessonModulePacing {
  weeks: number;
  hoursPerWeek: number;
  totalMinutes: number;
  calendarExported: boolean;
}

export interface LessonModuleSequenceItem {
  lessonId: string;
  title: string;
  duration: number;
  status: LessonStatus;
  day: number;
  focus: string;
}

export interface LessonModule {
  id: string;
  title: string;
  slug: string;
  subject: string;
  gradeBand: string;
  status: 'draft' | 'published';
  description: string;
  outcomes: string[];
  prerequisites: string[];
  plan: LessonPlanTier;
  createdAt: string;
  updatedAt: string;
  sequence: LessonModuleSequenceItem[];
  pacing: LessonModulePacing;
  lessonIds: string[];
  leadInstructor: string;
}

export interface LessonModuleRecord extends LessonModule {
  analytics: {
    publishedLessons: number;
    drafts: number;
    exports: number;
    shareUrl: string | null;
  };
}

export interface LessonTimelineEvent {
  id: string;
  lessonId: string;
  title: string;
  targetDate: string;
  status: LessonTimelineStatus;
  notes: string;
}

export interface LessonInsight {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  icon: string;
  timestamp: string;
}

export interface LessonAiPlaybook {
  key: LessonAiActionKey;
  title: string;
  description: string;
  icon: string;
  plan: LessonPlanTier;
}

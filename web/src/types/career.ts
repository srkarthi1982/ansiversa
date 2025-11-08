export type CareerPlanStatus = 'draft' | 'published';

export type SkillLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type CareerPlanProfile = {
  currentRole: string;
  experienceYears: number;
  industries: string[];
  education?: string;
  interests: string[];
  constraints: {
    location?: string;
    remote: boolean;
    hoursPerWeek: number;
    timezone?: string;
  };
  summary?: string;
};

export type CareerPlanTarget = {
  roleId: string;
  priority: number;
  label?: string;
  level?: 'junior' | 'mid' | 'senior';
};

export type GapPriority = 'low' | 'med' | 'high';

export type CareerGapItem = {
  skill: string;
  current: SkillLevel;
  target: SkillLevel;
  priority: GapPriority;
};

export type CareerLearningResourceType = 'course' | 'doc' | 'video' | 'book' | 'practice';

export type CareerLearningResource = {
  id: string;
  title: string;
  url: string;
  type: CareerLearningResourceType;
  durationHrs?: number;
  provider?: string;
};

export type CareerLearningModule = {
  id: string;
  title: string;
  hours: number;
  resources: CareerLearningResource['id'][];
  checkpoint: string;
  difficulty: 'intro' | 'core' | 'stretch';
};

export type CareerLearningPlan = {
  modules: CareerLearningModule[];
  totalHours: number;
  etaWeeks: number;
};

export type CareerSprintWeek = {
  week: number;
  focus: string;
  tasks: string[];
  milestone: string;
};

export type CareerSprintPlan = {
  weeks: CareerSprintWeek[];
};

export type CareerProject = {
  id: string;
  title: string;
  skills: string[];
  brief: string;
  acceptance: string[];
  impact?: string;
};

export type CareerResumeBullet = string;

export type CareerApplicationStatus = 'wishlist' | 'applied' | 'interview' | 'offer' | 'rejected';

export type CareerApplication = {
  id: string;
  planId: string;
  company: string;
  role: string;
  source: string;
  link: string;
  status: CareerApplicationStatus;
  appliedOn: string | null;
  nextStepOn: string | null;
  notes?: string;
  createdAt: string;
};

export type CareerPlanSummary = {
  id: string;
  title: string;
  slug: string;
  status: CareerPlanStatus;
  targetRoleId: string;
  progress: number;
  tasksDue: number;
  lastSavedAt: string;
  createdAt: string;
  nextReviewAt: string | null;
};

export type CareerPlanDetail = {
  id: string;
  title: string;
  slug: string;
  status: CareerPlanStatus;
  profile: CareerPlanProfile;
  targets: CareerPlanTarget[];
  skillsCurrent: Record<string, SkillLevel>;
  skillsRequired: Record<string, SkillLevel>;
  gapMatrix: CareerGapItem[];
  learningPlan: CareerLearningPlan;
  sprintPlan: CareerSprintPlan;
  projects: CareerProject[];
  resumeBullets: CareerResumeBullet[];
  notes?: string;
  lastSavedAt: string;
  createdAt: string;
  publishedAt?: string | null;
};

export type CareerRoleDemand = 'low' | 'med' | 'high';

export type CareerRole = {
  id: string;
  title: string;
  category: string;
  summary: string;
  skills: string[];
  sampleJD: string;
  medianRange: { currency: string; low: number; high: number };
  demandLevel: CareerRoleDemand;
  level: 'entry' | 'mid' | 'senior';
  relatedRoles: string[];
};

export type CareerPlanTask = {
  id: string;
  title: string;
  dueOn: string;
  type: 'learning' | 'project' | 'application' | 'networking';
  status: 'pending' | 'in-progress' | 'done';
};

export type CareerDashboardSnapshot = {
  plans: CareerPlanSummary[];
  tasks: CareerPlanTask[];
  metrics: {
    activePlans: number;
    aiCallsUsed: number;
    aiLimit: number;
    applicationsThisWeek: number;
    interviewsScheduled: number;
  };
  applications: {
    total: number;
    byStatus: Record<CareerApplicationStatus, number>;
  };
  highlights: string[];
};

export type CareerAssessment = {
  summary: string;
  suggestedRoles: Array<{ roleId: string; reason: string }>;
};

export type CareerPlanAutosave = {
  status: 'idle' | 'saving' | 'saved' | 'error';
  label: string | null;
};

export type CareerPlanBuilderState = {
  id: string | null;
  title: string;
  slug: string;
  status: CareerPlanStatus;
  profile: CareerPlanProfile;
  targets: CareerPlanTarget[];
  skillsCurrent: Record<string, SkillLevel>;
  skillsRequired: Record<string, SkillLevel>;
  gapMatrix: CareerGapItem[];
  learningPlan: CareerLearningPlan;
  sprintPlan: CareerSprintPlan;
  projects: CareerProject[];
  resumeBullets: CareerResumeBullet[];
  notes: string;
  autosave: CareerPlanAutosave;
  assessment: CareerAssessment | null;
  activeStep: string;
  lastSavedAt: string | null;
  createdAt: string | null;
};

export type CareerRoleFilter = {
  query: string;
  category: 'all' | string;
  demand: 'all' | CareerRoleDemand;
};

export type CareerTrackerState = {
  planId: string;
  applications: CareerApplication[];
  filters: {
    status: 'all' | CareerApplicationStatus;
    search: string;
  };
};

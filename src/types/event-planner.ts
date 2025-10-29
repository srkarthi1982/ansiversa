export type EventPlannerTemplateKey =
  | 'birthday'
  | 'wedding'
  | 'workshop'
  | 'meetup'
  | 'webinar'
  | 'custom';

export interface EventPlannerTemplate {
  key: EventPlannerTemplateKey;
  title: string;
  icon: string;
  description: string;
  bestFor: string[];
  deliverables: string[];
  automationHighlights: string[];
  recommendedDuration: string;
}

export interface EventPlannerEventLocation {
  label: string;
  address: string;
  type: 'in-person' | 'virtual' | 'hybrid';
  mapUrl?: string;
  virtualUrl?: string;
}

export type EventPlannerAgendaCategory = 'program' | 'logistics' | 'break' | 'prep';

export interface EventPlannerAgendaItem {
  id: string;
  dayLabel: string;
  start: string;
  end: string;
  title: string;
  owner: string;
  category: EventPlannerAgendaCategory;
  dependsOn?: string[];
  status: 'confirmed' | 'draft';
  location?: string;
  notes?: string;
}

export type EventPlannerTaskStatus = 'todo' | 'in-progress' | 'done';
export type EventPlannerTaskPriority = 'p0' | 'p1' | 'p2';

export interface EventPlannerTask {
  id: string;
  title: string;
  assignee: string;
  status: EventPlannerTaskStatus;
  due: string;
  priority: EventPlannerTaskPriority;
  tags: string[];
  category: 'logistics' | 'marketing' | 'content' | 'ops';
}

export interface EventPlannerBudgetLine {
  id: string;
  category: 'venue' | 'food' | 'decor' | 'travel' | 'marketing' | 'misc';
  vendor: string;
  planned: number;
  actual: number;
  status: 'quoted' | 'confirmed' | 'paid';
}

export interface EventPlannerGuestSegment {
  label: string;
  count: number;
  status: 'invited' | 'confirmed' | 'vip' | 'team';
}

export interface EventPlannerGuestOverview {
  total: number;
  invited: number;
  responded: number;
  yes: number;
  no: number;
  maybe: number;
  checkIns: number;
  segments: EventPlannerGuestSegment[];
}

export type EventPlannerVendorType =
  | 'venue'
  | 'caterer'
  | 'photographer'
  | 'sound'
  | 'decor'
  | 'transport'
  | 'other';

export type EventPlannerVendorStatus = 'prospect' | 'shortlisted' | 'booked' | 'paid';

export interface EventPlannerVendorContact {
  name: string;
  email: string;
  phone?: string;
}

export interface EventPlannerVendor {
  id: string;
  name: string;
  type: EventPlannerVendorType;
  status: EventPlannerVendorStatus;
  contact: EventPlannerVendorContact;
  notes?: string;
}

export type EventPlannerMilestoneStatus = 'upcoming' | 'at-risk' | 'done';

export interface EventPlannerMilestone {
  id: string;
  label: string;
  due: string;
  status: EventPlannerMilestoneStatus;
  owner: string;
}

export type EventPlannerExportFormat = 'pdf' | 'md' | 'ics' | 'csv';

export interface EventPlannerExportOption {
  id: string;
  format: EventPlannerExportFormat;
  label: string;
  description: string;
  recommendedFor: string;
}

export interface EventPlannerEvent {
  id: string;
  title: string;
  type: EventPlannerTemplateKey | 'custom';
  status: 'planning' | 'active' | 'done';
  plan: 'free' | 'pro';
  timezone: string;
  start: string;
  end: string;
  location: EventPlannerEventLocation;
  countdownLabel: string;
  countdownDays: number;
  lastUpdated: string;
  runSheetLink: string;
  rsvpLink: string;
  summary: string;
  metrics: {
    timelineConfidence: number;
    budgetHealth: number;
    rsvpRate: number;
    tasksOnTrack: number;
  };
  highlights: string[];
  timeline: EventPlannerAgendaItem[];
  tasks: EventPlannerTask[];
  budgets: EventPlannerBudgetLine[];
  guests: EventPlannerGuestOverview;
  vendors: EventPlannerVendor[];
  milestones: EventPlannerMilestone[];
  exports: EventPlannerExportOption[];
}

export interface EventPlannerAutomation {
  id: string;
  label: string;
  description: string;
  trigger: string;
  channel: 'email' | 'sms' | 'webhook';
  plan: 'free' | 'pro';
}

export interface EventPlannerReminder {
  id: string;
  label: string;
  description: string;
  schedule: string;
  channel: 'email' | 'sms' | 'push';
  audience: 'guests' | 'team' | 'vendors';
}

export interface EventPlannerIntegration {
  id: string;
  name: string;
  description: string;
  status: 'available' | 'coming-soon';
  category: 'calendar' | 'communications' | 'productivity' | 'files';
}

export interface EventPlannerPlanFeature {
  feature: string;
  free: string;
  pro: string;
}

export interface EventPlannerRoadmapStageItem {
  label: string;
  done: boolean;
}

export interface EventPlannerRoadmapStage {
  id: string;
  title: string;
  description: string;
  items: EventPlannerRoadmapStageItem[];
}

export interface EventPlannerSampleData {
  templates: EventPlannerTemplate[];
  events: EventPlannerEvent[];
  automations: EventPlannerAutomation[];
  reminders: EventPlannerReminder[];
  integrations: EventPlannerIntegration[];
  planFeatures: EventPlannerPlanFeature[];
  roadmap: EventPlannerRoadmapStage[];
}

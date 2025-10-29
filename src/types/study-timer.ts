export type StudyTimerPhase = 'idle' | 'work' | 'short_break' | 'long_break' | 'countup' | 'countdown';

export type StudyTimerMode = 'pomodoro' | 'long-pom' | 'custom' | 'countup' | 'countdown';

export interface StudyTimerPreset {
  id: string;
  name: string;
  description: string;
  mode: StudyTimerMode;
  workMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  longEvery: number;
  cycles: number;
  isPro?: boolean;
  sound: 'bell' | 'focus' | 'chime' | 'silence';
  color: string;
}

export interface StudyTimerTag {
  id: string;
  label: string;
  color: string;
  usageMinutes: number;
}

export interface StudyTimerGoalSnapshot {
  targetDailyMinutes: number;
  completedDailyMinutes: number;
  targetDailyPomos: number;
  completedDailyPomos: number;
  weeklyTargetMinutes: number;
  weeklyCompletedMinutes: number;
  streakDays: number;
  longestStreak: number;
}

export interface StudyTimerInterruption {
  id: string;
  at: string;
  reason: 'phone' | 'chat' | 'door' | 'break' | 'fatigue' | 'other';
  note?: string;
}

export interface StudyTimerHistorySession {
  id: string;
  subject: string;
  durationMinutes: number;
  pomodoros: number;
  endedAt: string;
  tags: string[];
  interruptions: number;
  note?: string;
}

export interface StudyTimerHistoryDay {
  date: string;
  totalMinutes: number;
  pomodoros: number;
  interruptions: number;
  sessions: StudyTimerHistorySession[];
}

export interface StudyTimerStatHighlight {
  label: string;
  value: string;
  delta: string;
  icon: string;
  trend: 'up' | 'down' | 'steady';
}

export interface StudyTimerTrendPoint {
  label: string;
  minutes: number;
  pomodoros: number;
  interruptions: number;
}

export interface StudyTimerIntegrationCard {
  id: string;
  name: string;
  description: string;
  icon: string;
  actionLabel: string;
  badge?: string;
}

export interface StudyTimerPlanFeature {
  label: string;
  free: string;
  pro: string;
}

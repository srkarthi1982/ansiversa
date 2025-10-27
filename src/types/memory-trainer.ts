export type MemoryExerciseType = 'nback' | 'span' | 'pairs' | 'grid' | 'srs';

export interface PlanBlock {
  id: string;
  phase: 'warmup' | 'focus' | 'cooldown';
  title: string;
  description: string;
  durationMinutes: number;
  exercises: MemoryExerciseType[];
  status: 'pending' | 'in-progress' | 'completed';
  targetAccuracy: number;
  notes: string;
}

export interface PlanSummary {
  totalMinutes: number;
  focusMinutes: number;
  cooldownMinutes: number;
}

export interface StreakSummary {
  current: number;
  best: number;
  longestBreak: number;
  lastCompleted: string;
}

export interface ReminderSetting {
  enabled: boolean;
  time: string;
  timezone: string;
  days: string[];
}

export interface ExerciseSummary {
  type: MemoryExerciseType;
  title: string;
  description: string;
  mode: string;
  levelLabel: string;
  level: number;
  accuracy: number;
  bestAccuracy: number;
  averageResponseMs: number;
  streak: number;
  badges: string[];
  recommendedNext: string;
  lastReactionMs?: number;
}

export interface TrendPoint {
  label: string;
  value: number;
}

export interface ReactionPoint {
  label: string;
  milliseconds: number;
}

export interface ForgettingCurvePoint {
  day: number;
  retention: number;
}

export interface AnalyticsSnapshot {
  accuracyTrend: TrendPoint[];
  levelTrend: TrendPoint[];
  reactionTimes: ReactionPoint[];
  forgettingCurve: ForgettingCurvePoint[];
}

export interface DeckSummary {
  id: string;
  name: string;
  tag: string;
  dueToday: number;
  newCount: number;
  totalCards: number;
  streak: number;
  nextDue: string;
}

export type SrsGrade = 1 | 2 | 3 | 4 | 5;

export interface SrsCard {
  id: string;
  front: string;
  back: string;
  easeFactor: number;
  intervalDays: number;
  dueOn: string;
  lapses: number;
}

export interface SrsQueueState {
  activeDeckId: string;
  queue: SrsCard[];
  completed: SrsCard[];
}

export interface ExportLogEntry {
  id: string;
  format: 'csv' | 'markdown' | 'pdf';
  createdAt: string;
  sizeKb: number;
  includeWatermark: boolean;
}

export interface MemoryTrainerSampleData {
  plan: PlanBlock[];
  planSummary: PlanSummary;
  streak: StreakSummary;
  reminder: ReminderSetting;
  exercises: ExerciseSummary[];
  analytics: AnalyticsSnapshot;
  decks: DeckSummary[];
  srs: SrsQueueState;
  exports: ExportLogEntry[];
}

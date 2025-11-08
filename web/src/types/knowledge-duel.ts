export interface DuelModeCard {
  id: 'realtime' | 'turn' | 'solo';
  name: string;
  tagline: string;
  summary: string;
  questionCount: string;
  timePerQuestion: string;
  highlights: string[];
}

export interface DuelMatchFlowStep {
  id: string;
  title: string;
  summary: string;
  icon: string;
  badge?: string;
}

export interface DuelScoringRule {
  title: string;
  description: string;
  delta: string;
  icon: string;
}

export interface DuelSpeedTier {
  label: string;
  bonus: string;
  window: string;
}

export interface DuelLeaderboardTab {
  id: string;
  name: string;
  description: string;
  metrics: string[];
}

export interface DuelSeasonMilestone {
  phase: string;
  detail: string;
  icon: string;
}

export interface DuelAntiCheatMeasure {
  title: string;
  description: string;
  icon: string;
}

export interface DuelRewardTrackItem {
  name: string;
  description: string;
  icon: string;
}

export interface DuelPlanBenefit {
  feature: string;
  free: string;
  pro: string;
}

export interface PuzzleTypeDifficulty {
  level: 'Easy' | 'Medium' | 'Hard';
  targetTime: string;
  highlight: string;
  supports: string[];
}

export interface PuzzleBoardPreview {
  label: string;
  rows: string[];
}

export interface PuzzleTypeDefinition {
  id: string;
  name: string;
  tagline: string;
  description: string;
  board: PuzzleBoardPreview;
  generator: string;
  validator: string;
  bestFor: string[];
  difficulties: PuzzleTypeDifficulty[];
  hintExamples: string[];
}

export interface PuzzleModeDefinition {
  id: 'solo' | 'daily' | 'packs' | 'timeattack';
  name: string;
  description: string;
  highlights: string[];
  cta: string;
  icon: string;
}

export interface PuzzleDailyLeaderboardEntry {
  user: string;
  timeMs: number;
  accuracy: number;
  hintsUsed: number;
}

export interface PuzzleDailyChallenge {
  date: string;
  typeId: string;
  difficulty: PuzzleTypeDifficulty['level'];
  seed: string;
  unlockedAt: string;
  leaderboard: PuzzleDailyLeaderboardEntry[];
}

export interface PuzzlePackSummary {
  id: string;
  title: string;
  description: string;
  theme: string;
  puzzlesTotal: number;
  puzzlesCompleted: number;
  difficultyMix: ('Easy' | 'Medium' | 'Hard')[];
  reward: string;
  featuredTypeIds: string[];
}

export interface PuzzleTimeAttackRound {
  id: string;
  title: string;
  puzzleTypeId: string;
  durationSeconds: number;
  bestScore: number;
  examplePrompt: string;
}

export interface PuzzleTimeAttackState {
  rounds: PuzzleTimeAttackRound[];
  activeRoundId: string | null;
  score: number;
  remainingSeconds: number;
  streak: number;
}

export interface PuzzleStatsSnapshot {
  streakDays: number;
  bestStreak: number;
  completionRate: number;
  puzzlesSolved: number;
  averageTimeMs: number;
  accuracy: number;
  hintsUsed: number;
  errorsResolved: number;
}

export interface PuzzleIntegrationHighlight {
  id: string;
  title: string;
  description: string;
  relatedApp: string;
  icon: string;
  actions: string[];
}

export interface PuzzlePlanBenefit {
  plan: 'Free' | 'Pro';
  features: string[];
}

export interface PuzzleZoneSampleData {
  types: PuzzleTypeDefinition[];
  modes: PuzzleModeDefinition[];
  daily: PuzzleDailyChallenge;
  packs: PuzzlePackSummary[];
  stats: PuzzleStatsSnapshot;
  timeAttack: PuzzleTimeAttackState;
  integrations: PuzzleIntegrationHighlight[];
  planBenefits: PuzzlePlanBenefit[];
}

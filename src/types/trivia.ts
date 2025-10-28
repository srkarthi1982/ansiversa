export type TriviaMode = 'solo' | 'daily' | 'arena' | 'live' | 'tournament';

export type TriviaQuestionType = 'single' | 'multi' | 'boolean' | 'fill' | 'image';

export type TriviaDifficulty = 'easy' | 'medium' | 'hard';

export interface TriviaModeDefinition {
  key: TriviaMode;
  label: string;
  tagline: string;
  description: string;
  highlights: readonly string[];
  cta?: string;
  badge?: string;
  status?: 'available' | 'coming-soon';
}

export interface TriviaPowerUpDefinition {
  key: 'fiftyFifty' | 'addTime' | 'doublePoints' | 'hint';
  label: string;
  description: string;
  icon: string;
  limit: number;
  availableFor: readonly ('free' | 'pro')[];
}

export interface TriviaQuestionOption {
  id: string;
  label: string;
  text: string;
}

export interface TriviaQuestion {
  id: string;
  prompt: string;
  type: TriviaQuestionType;
  category: string;
  difficulty: TriviaDifficulty;
  timeLimitMs: number;
  options?: readonly TriviaQuestionOption[];
  answer: string | readonly string[];
  explanation?: string;
  imageUrl?: string | null;
}

export interface TriviaLeaderboardEntry {
  rank: number;
  player: string;
  score: number;
  timeMs: number;
  streak: number;
  plan: 'free' | 'pro';
}

export interface TriviaLeaderboardSnapshot {
  scope: 'daily' | 'global' | 'friends';
  label: string;
  updatedAt: string;
  entries: readonly TriviaLeaderboardEntry[];
  highlightRank?: number;
}

export interface TriviaQuestionPack {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: TriviaDifficulty | 'mixed';
  size: number;
  visibility: 'builtin' | 'public' | 'private';
  source: 'builtin' | 'import' | 'quiz-institute';
}

export interface TriviaStatSnapshot {
  accuracy: number;
  averageTimeMs: number;
  streak: number;
  totalGames: number;
  categoryStrengths: readonly { category: string; rating: number }[];
  powerUpsUsed: number;
  rating: number;
}

export interface TriviaArenaMatchSummary {
  id: string;
  opponent: string;
  status: 'open' | 'playing' | 'finished';
  yourScore: number;
  opponentScore: number;
  expiresAt: string;
}

export interface TriviaPlanFeature {
  label: string;
  free: boolean | string;
  pro: boolean | string;
}

export interface TriviaImportResult {
  id: string;
  fileName: string;
  added: number;
  duplicates: number;
  errors: number;
  startedAt: string;
  finishedAt: string;
}

export interface TriviaDailyChallengeMeta {
  deadline: string;
  questionCount: number;
  seed: string;
  yourRank: number;
  totalParticipants: number;
}

export type TriviaAnswerStatus = 'idle' | 'pending' | 'correct' | 'incorrect' | 'revealed';

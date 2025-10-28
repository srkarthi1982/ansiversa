export interface EmojiHeroMetric {
  label: string;
  value: string;
  helper?: string;
}

export interface EmojiHeroSummary {
  tagline: string;
  description: string;
  metrics: EmojiHeroMetric[];
  integrations: string[];
}

export interface EmojiPuzzlePreview {
  id: string;
  emojis: string;
  answer: string;
  aliases: string[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
  keyboardBank?: string;
  clue: string;
}

export interface EmojiModeHighlight {
  id: string;
  name: string;
  tagline: string;
  durationLabel: string;
  description: string;
  highlights: string[];
  scoring: { label: string; value: string }[];
  recommendedFor: string[];
}

export interface EmojiHintOption {
  id: string;
  name: string;
  penalty: string;
  description: string;
  sample: string;
  icon: string;
}

export interface EmojiPackSummary {
  id: string;
  title: string;
  language: string;
  category: string;
  size: number;
  visibility: 'builtin' | 'community' | 'imported';
  difficultyMix: string[];
  features: string[];
  featuredEmojis: string[];
}

export interface EmojiDailyLeaderboardEntry {
  rank: number;
  handle: string;
  score: number;
  time: string;
  streak: number;
}

export interface EmojiDailyPuzzleSummary {
  date: string;
  puzzleId: string;
  emojis: string;
  difficulty: 'easy' | 'medium' | 'hard';
  clue: string;
  explanation: string;
  leaderboard: EmojiDailyLeaderboardEntry[];
  solved: number;
  medianTimeSeconds: number;
}

export interface EmojiStatSnapshot {
  streakDays: number;
  bestStreak: number;
  accuracy: number;
  averageSolveSeconds: number;
  puzzlesSolved: number;
  hintsUsed: number;
  preferredLanguage: string;
  topCategory: string;
}

export interface EmojiPlanTier {
  id: 'free' | 'pro';
  name: string;
  price: string;
  highlight: string;
  includes: string[];
  inviteLimit: string;
}

export interface EmojiCreatorTool {
  id: string;
  name: string;
  description: string;
  features: string[];
}

export interface EmojiVersusHighlight {
  matchId: string;
  challenger: string;
  opponent: string;
  mode: string;
  packTitle: string;
  challengerScore: number;
  opponentScore: number;
  status: 'awaiting' | 'completed';
  summary: string;
  steps: { label: string; detail: string }[];
  inviteUrl: string;
}

export interface GuessTheEmojiSampleData {
  hero: EmojiHeroSummary;
  puzzlePreview: EmojiPuzzlePreview;
  modes: EmojiModeHighlight[];
  hints: EmojiHintOption[];
  packs: EmojiPackSummary[];
  daily: EmojiDailyPuzzleSummary;
  stats: EmojiStatSnapshot;
  planTiers: EmojiPlanTier[];
  creatorTools: EmojiCreatorTool[];
  versus: EmojiVersusHighlight;
}

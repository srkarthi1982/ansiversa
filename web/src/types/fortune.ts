export type FortuneThemeKey = 'classic' | 'myth' | 'sci-fi' | 'minimal';

export type FortuneReadingView = 'daily' | 'yesno' | 'spread' | 'zodiac' | 'numsum';

export type FortuneMoodKey = 'curious' | 'hopeful' | 'overwhelmed' | 'grounded' | 'energised';

export type FortuneIntentKey =
  | 'general'
  | 'love'
  | 'career'
  | 'study'
  | 'health'
  | 'money'
  | 'creativity';

export type FortuneOrientation = 'upright' | 'reversed';

export type FortuneYesNoOutcome = 'yes' | 'no' | 'maybe';

export interface FortuneCardFace {
  keywords: readonly string[];
  guidance: string;
  affirmation: string;
}

export interface FortuneCardDefinition {
  id: string;
  title: string;
  emoji: string;
  theme: FortuneThemeKey;
  upright: FortuneCardFace;
  reversed: FortuneCardFace;
  domains: Record<FortuneIntentKey, string>;
}

export interface FortuneDailyReading {
  cardId: string;
  cardTitle: string;
  orientation: FortuneOrientation;
  summary: string;
  action: string;
  luckyFocus: string;
  keywords: readonly string[];
  affirmation: string;
  theme: FortuneThemeKey;
  seed: string;
  intent: FortuneIntentKey;
  mood: FortuneMoodKey;
}

export interface FortuneYesNoReading {
  question: string;
  outcome: FortuneYesNoOutcome;
  oneLiner: string;
  theme: FortuneThemeKey;
  seed: string;
  askedAt: number;
  cooldownRemaining: number;
}

export interface FortuneSpreadCardDetail {
  position: string;
  cardTitle: string;
  orientation: FortuneOrientation;
  text: string;
}

export interface FortuneSpreadReading {
  spread: '3-card' | '5-card';
  domain: FortuneIntentKey;
  theme: FortuneThemeKey;
  cards: readonly FortuneSpreadCardDetail[];
  actions: readonly string[];
  seed: string;
}

export interface FortuneZodiacReading {
  sign: string;
  period: 'daily' | 'weekly';
  title: string;
  text: string;
  highlights: readonly string[];
  mantra: string;
  theme: FortuneThemeKey;
}

export interface FortuneZodiacPeriod {
  title: string;
  text: string;
  highlights: readonly string[];
  mantra: string;
  theme: FortuneThemeKey;
}

export interface FortuneZodiacProfile {
  sign: string;
  label: string;
  element: 'fire' | 'earth' | 'air' | 'water';
  icon: string;
  daily: FortuneZodiacPeriod;
  weekly: FortuneZodiacPeriod;
}

export interface FortuneNumerologyReading {
  birthdate: string;
  lifePath: number;
  archetype: string;
  summary: string;
  strengths: readonly string[];
  growth: readonly string[];
  mantra: string;
  theme: FortuneThemeKey;
}

export interface FortuneNumerologyProfile {
  lifePath: number;
  archetype: string;
  summary: string;
  strengths: readonly string[];
  growth: readonly string[];
  mantra: string;
  theme: FortuneThemeKey;
}

export interface FortuneThemeDefinition {
  key: FortuneThemeKey;
  name: string;
  tagline: string;
  palette: string;
  accentGradient: string;
  bestFor: readonly string[];
  previewKeywords: readonly string[];
  cardBack: string;
}

export interface FortunePlanFeature {
  label: string;
  free: boolean | string;
  pro: boolean | string;
}

export interface FortuneSafetyGuideline {
  icon: string;
  title: string;
  description: string;
  linkLabel?: string;
  linkHref?: string;
}

export interface FortuneRoadmapMilestone {
  timeframe: 'Now' | 'Next' | 'Later';
  title: string;
  status: 'available' | 'in-progress' | 'planned';
  items: readonly string[];
}

export interface FortuneIntentOption {
  key: FortuneIntentKey;
  label: string;
  description: string;
  emoji: string;
}

export interface FortuneMoodOption {
  key: FortuneMoodKey;
  label: string;
  description: string;
  emoji: string;
}

export interface FortuneYesNoSample {
  outcome: FortuneYesNoOutcome;
  oneLiner: string;
  tone: 'gentle' | 'direct' | 'cautious';
}

export interface FortuneJournalPrompt {
  id: string;
  prompt: string;
  mood: FortuneMoodKey | null;
}

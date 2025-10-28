import Alpine from 'alpinejs';
import { BaseStore } from '../../../alpineStores/base';
import { getGuessTheEmojiSampleData } from '../../../lib/emoji/sample';
import type {
  EmojiCreatorTool,
  EmojiDailyPuzzleSummary,
  EmojiHintOption,
  EmojiModeHighlight,
  EmojiPackSummary,
  EmojiPlanTier,
  EmojiPuzzlePreview,
  EmojiStatSnapshot,
  EmojiVersusHighlight,
  GuessTheEmojiSampleData,
  EmojiHeroSummary,
} from '../../../types/emoji';

type GuessStatus = 'idle' | 'correct' | 'incorrect';

interface GuessTheEmojiState {
  loading: boolean;
  hero: EmojiHeroSummary | null;
  puzzlePreview: EmojiPuzzlePreview | null;
  modes: EmojiModeHighlight[];
  hints: EmojiHintOption[];
  packs: EmojiPackSummary[];
  daily: EmojiDailyPuzzleSummary | null;
  stats: EmojiStatSnapshot | null;
  planTiers: EmojiPlanTier[];
  creatorTools: EmojiCreatorTool[];
  versus: EmojiVersusHighlight | null;
  activeModeId: string | null;
  activePackId: string | null;
  hintTokens: number;
  lastAction: string | null;
  guessInput: string;
  guessStatus: GuessStatus;
  recentHint: string | null;
}

const normaliseAnswer = (value: string): string => {
  const trimmed = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/&/g, 'and')
    .replace(/\+/g, 'plus')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return trimmed;
};

class GuessTheEmojiStore extends BaseStore {
  state: GuessTheEmojiState = {
    loading: false,
    hero: null,
    puzzlePreview: null,
    modes: [],
    hints: [],
    packs: [],
    daily: null,
    stats: null,
    planTiers: [],
    creatorTools: [],
    versus: null,
    activeModeId: null,
    activePackId: null,
    hintTokens: 4,
    lastAction: null,
    guessInput: '',
    guessStatus: 'idle',
    recentHint: null,
  };

  private initialised = false;

  init(): void {
    if (this.initialised) return;
    this.initialised = true;
    this.hydrate();
  }

  private hydrate(): void {
    this.state.loading = true;
    this.setLoaderVisible(true);
    try {
      const sample: GuessTheEmojiSampleData = getGuessTheEmojiSampleData();
      this.state.hero = sample.hero;
      this.state.puzzlePreview = sample.puzzlePreview;
      this.state.modes = sample.modes.map((mode) => ({
        ...mode,
        highlights: [...mode.highlights],
        scoring: mode.scoring.map((item) => ({ ...item })),
        recommendedFor: [...mode.recommendedFor],
      }));
      this.state.hints = sample.hints.map((hint) => ({ ...hint }));
      this.state.packs = sample.packs.map((pack) => ({
        ...pack,
        difficultyMix: [...pack.difficultyMix],
        features: [...pack.features],
        featuredEmojis: [...pack.featuredEmojis],
      }));
      this.state.daily = { ...sample.daily, leaderboard: sample.daily.leaderboard.map((entry) => ({ ...entry })) };
      this.state.stats = { ...sample.stats };
      this.state.planTiers = sample.planTiers.map((tier) => ({ ...tier, includes: [...tier.includes] }));
      this.state.creatorTools = sample.creatorTools.map((tool) => ({ ...tool, features: [...tool.features] }));
      this.state.versus = {
        ...sample.versus,
        steps: sample.versus.steps.map((step) => ({ ...step })),
      };
      this.state.activeModeId = sample.modes[0]?.id ?? null;
      this.state.activePackId = sample.packs[0]?.id ?? null;
      this.state.hintTokens = 4;
      this.state.lastAction = 'Guess the Emoji ready — decode the burger house preview to begin!';
      this.state.guessInput = '';
      this.state.guessStatus = 'idle';
      this.state.recentHint = null;
    } finally {
      this.state.loading = false;
      this.setLoaderVisible(false);
    }
  }

  get activeMode(): EmojiModeHighlight | null {
    if (!this.state.activeModeId) return null;
    return this.state.modes.find((mode) => mode.id === this.state.activeModeId) ?? null;
  }

  get activePack(): EmojiPackSummary | null {
    if (!this.state.activePackId) return null;
    return this.state.packs.find((pack) => pack.id === this.state.activePackId) ?? null;
  }

  updateGuess(value: string): void {
    this.state.guessInput = value;
    if (this.state.guessStatus !== 'idle') {
      this.state.guessStatus = 'idle';
    }
  }

  submitGuess(): void {
    const puzzle = this.state.puzzlePreview;
    if (!puzzle) return;
    const attempt = normaliseAnswer(this.state.guessInput);
    if (!attempt) {
      this.state.lastAction = 'Enter a guess to check your answer.';
      return;
    }
    const valid = [puzzle.answer, ...puzzle.aliases].some((value) => normaliseAnswer(value) === attempt);
    if (valid) {
      this.state.guessStatus = 'correct';
      this.state.lastAction = `Correct — ${puzzle.answer} unlocked! ${puzzle.explanation}`;
      if (this.state.stats) {
        const solved = this.state.stats.puzzlesSolved + 1;
        const accuracy = (this.state.stats.accuracy * this.state.stats.puzzlesSolved + 1) / solved;
        this.state.stats = {
          ...this.state.stats,
          puzzlesSolved: solved,
          accuracy,
        };
      }
    } else {
      this.state.guessStatus = 'incorrect';
      this.state.lastAction = 'Not quite. Try spacing, synonyms, or peek at a hint token.';
    }
  }

  resetGuess(): void {
    this.state.guessInput = '';
    this.state.guessStatus = 'idle';
    this.state.recentHint = null;
    this.state.lastAction = 'Guess reset — ready for another attempt.';
  }

  setActiveMode(modeId: string): void {
    if (this.state.activeModeId === modeId) return;
    const mode = this.state.modes.find((item) => item.id === modeId);
    if (!mode) return;
    this.state.activeModeId = modeId;
    this.state.lastAction = `${mode.name} mode highlighted — ${mode.tagline}`;
  }

  setActivePack(packId: string): void {
    if (this.state.activePackId === packId) return;
    const pack = this.state.packs.find((item) => item.id === packId);
    if (!pack) return;
    this.state.activePackId = packId;
    this.state.lastAction = `${pack.title} pack armed — ${pack.category} focus.`;
  }

  useHint(hintId: string): void {
    const hint = this.state.hints.find((item) => item.id === hintId);
    if (!hint) return;
    if (this.state.hintTokens <= 0) {
      this.state.lastAction = 'No hint tokens remaining — solve a pack or streak daily to earn more.';
      return;
    }
    this.state.hintTokens -= 1;
    this.state.recentHint = hint.sample;
    this.state.lastAction = `${hint.name} activated (${hint.penalty}). ${hint.sample}`;
    if (this.state.stats) {
      this.state.stats = {
        ...this.state.stats,
        hintsUsed: this.state.stats.hintsUsed + 1,
      };
    }
  }

  refreshDailySummary(): void {
    const daily = this.state.daily;
    if (!daily) return;
    this.state.lastAction = `Daily Emoji ${daily.puzzleId} — ${daily.solved.toLocaleString()} solvers, median ${daily.medianTimeSeconds}s.`;
  }

  generateVersusInvite(): void {
    const versus = this.state.versus;
    if (!versus) return;
    this.state.lastAction = `Share invite ${versus.inviteUrl} — expires after validation.`;
  }
}

Alpine.store('guessTheEmoji', new GuessTheEmojiStore());

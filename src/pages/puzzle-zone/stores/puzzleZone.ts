import Alpine from 'alpinejs';
import { BaseStore } from '../../../alpineStores/base';
import { getPuzzleZoneSampleData } from '../../../lib/puzzle-zone/sample';
import type {
  PuzzleDailyChallenge,
  PuzzleIntegrationHighlight,
  PuzzleModeDefinition,
  PuzzlePackSummary,
  PuzzlePlanBenefit,
  PuzzleStatsSnapshot,
  PuzzleTimeAttackRound,
  PuzzleTimeAttackState,
  PuzzleTypeDefinition,
  PuzzleTypeDifficulty,
} from '../../../types/puzzle-zone';

type HintScope = 'cell' | 'word' | 'board';

type DifficultyLevel = PuzzleTypeDifficulty['level'];

type ModeId = PuzzleModeDefinition['id'];

interface PuzzleZoneState {
  loading: boolean;
  types: PuzzleTypeDefinition[];
  activeTypeId: string | null;
  activeDifficulty: DifficultyLevel;
  modes: PuzzleModeDefinition[];
  activeModeId: ModeId;
  daily: PuzzleDailyChallenge | null;
  packs: PuzzlePackSummary[];
  activePackId: string | null;
  stats: PuzzleStatsSnapshot;
  timeAttack: PuzzleTimeAttackState;
  integrations: PuzzleIntegrationHighlight[];
  planBenefits: PuzzlePlanBenefit[];
  hintsRemaining: number;
  checksPerformed: number;
  lastAction: string | null;
}

const formatSeconds = (seconds: number) => Math.max(0, Math.round(seconds));

class PuzzleZoneStore extends BaseStore {
  state: PuzzleZoneState = {
    loading: false,
    types: [],
    activeTypeId: null,
    activeDifficulty: 'Easy',
    modes: [],
    activeModeId: 'solo',
    daily: null,
    packs: [],
    activePackId: null,
    stats: {
      streakDays: 0,
      bestStreak: 0,
      completionRate: 0,
      puzzlesSolved: 0,
      averageTimeMs: 0,
      accuracy: 0,
      hintsUsed: 0,
      errorsResolved: 0,
    },
    timeAttack: {
      rounds: [],
      activeRoundId: null,
      score: 0,
      remainingSeconds: 0,
      streak: 0,
    },
    integrations: [],
    planBenefits: [],
    hintsRemaining: 6,
    checksPerformed: 0,
    lastAction: null,
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
      const sample = getPuzzleZoneSampleData();
      this.state.types = sample.types.map((type) => ({
        ...type,
        bestFor: [...type.bestFor],
        board: { ...type.board, rows: [...type.board.rows] },
        difficulties: type.difficulties.map((difficulty) => ({
          ...difficulty,
          supports: [...difficulty.supports],
        })),
        hintExamples: [...type.hintExamples],
      }));
      this.state.modes = sample.modes.map((mode) => ({
        ...mode,
        highlights: [...mode.highlights],
      }));
      this.state.daily = {
        ...sample.daily,
        leaderboard: sample.daily.leaderboard.map((entry) => ({ ...entry })),
      };
      this.state.packs = sample.packs.map((pack) => ({
        ...pack,
        difficultyMix: [...pack.difficultyMix],
        featuredTypeIds: [...pack.featuredTypeIds],
      }));
      this.state.stats = { ...sample.stats };
      this.state.timeAttack = {
        ...sample.timeAttack,
        rounds: sample.timeAttack.rounds.map((round) => ({ ...round })),
      };
      this.state.integrations = sample.integrations.map((integration) => ({
        ...integration,
        actions: [...integration.actions],
      }));
      this.state.planBenefits = sample.planBenefits.map((benefit) => ({
        ...benefit,
        features: [...benefit.features],
      }));
      this.state.activeTypeId = this.state.types[0]?.id ?? null;
      this.state.activeDifficulty = this.state.types[0]?.difficulties[1]?.level ?? 'Easy';
      this.state.activePackId = this.state.packs[0]?.id ?? null;
      this.state.hintsRemaining = 6;
      this.state.checksPerformed = 0;
      this.state.activeModeId = 'solo';
      this.state.lastAction = 'Puzzle Zone ready — choose a puzzle type to begin.';
    } finally {
      this.state.loading = false;
      this.setLoaderVisible(false);
    }
  }

  get activeType(): PuzzleTypeDefinition | null {
    if (!this.state.activeTypeId) return null;
    return this.state.types.find((type) => type.id === this.state.activeTypeId) ?? null;
  }

  get activeDifficultyDefinition(): PuzzleTypeDifficulty | null {
    const type = this.activeType;
    if (!type) return null;
    return type.difficulties.find((difficulty) => difficulty.level === this.state.activeDifficulty) ?? null;
  }

  get activeMode(): PuzzleModeDefinition | null {
    return this.state.modes.find((mode) => mode.id === this.state.activeModeId) ?? null;
  }

  get activePack(): PuzzlePackSummary | null {
    if (!this.state.activePackId) return null;
    return this.state.packs.find((pack) => pack.id === this.state.activePackId) ?? null;
  }

  selectType(typeId: string): void {
    if (this.state.activeTypeId === typeId) return;
    const type = this.state.types.find((item) => item.id === typeId);
    if (!type) return;
    this.state.activeTypeId = typeId;
    this.state.activeDifficulty = type.difficulties[0]?.level ?? 'Easy';
    this.state.lastAction = `${type.name} focus loaded.`;
  }

  setDifficulty(level: DifficultyLevel): void {
    const type = this.activeType;
    if (!type) return;
    if (!type.difficulties.some((difficulty) => difficulty.level === level)) return;
    this.state.activeDifficulty = level;
    this.state.lastAction = `${type.name} difficulty set to ${level}.`;
  }

  cycleDifficulty(direction: 1 | -1): void {
    const type = this.activeType;
    if (!type) return;
    const index = type.difficulties.findIndex((difficulty) => difficulty.level === this.state.activeDifficulty);
    if (index === -1) return;
    const nextIndex = (index + direction + type.difficulties.length) % type.difficulties.length;
    this.state.activeDifficulty = type.difficulties[nextIndex]?.level ?? this.state.activeDifficulty;
    this.state.lastAction = `${type.name} difficulty switched to ${this.state.activeDifficulty}.`;
  }

  requestHint(scope: HintScope): void {
    if (this.state.hintsRemaining <= 0) {
      this.state.lastAction = 'No hint tokens remaining — complete a puzzle to earn more.';
      return;
    }
    this.state.hintsRemaining -= 1;
    this.state.stats.hintsUsed += 1;
    this.state.lastAction = `Hint delivered for the ${scope} — accuracy penalty applied.`;
  }

  checkProgress(scope: HintScope): void {
    this.state.checksPerformed += 1;
    this.state.stats.errorsResolved += scope === 'board' ? 3 : scope === 'word' ? 2 : 1;
    this.state.lastAction = `Board check (${scope}) complete.`;
  }

  logSolve({
    mode,
    timeMs,
    accuracy,
    hintsUsed,
  }: {
    mode: ModeId;
    timeMs: number;
    accuracy: number;
    hintsUsed: number;
  }): void {
    const { stats } = this.state;
    const previousSolved = stats.puzzlesSolved;
    stats.puzzlesSolved += 1;
    stats.streakDays += mode === 'daily' ? 1 : 0;
    stats.bestStreak = Math.max(stats.bestStreak, stats.streakDays);
    stats.hintsUsed += Math.max(0, hintsUsed);
    const smoothingFactor = Math.min(0.35, 1 / Math.max(1, stats.puzzlesSolved));
    stats.averageTimeMs = Math.round(
      stats.averageTimeMs * (1 - smoothingFactor) + timeMs * smoothingFactor,
    );
    stats.accuracy = Number(
      (
        (stats.accuracy * previousSolved + accuracy) /
        Math.max(1, stats.puzzlesSolved)
      ).toFixed(2),
    );
    stats.completionRate = Math.min(0.99, Number((stats.completionRate + 0.01).toFixed(2)));
    this.state.hintsRemaining += hintsUsed > 0 ? 0 : 1;
    this.state.lastAction = `${mode === 'timeattack' ? 'Time Attack' : 'Puzzle'} solve logged in ${Math.round(
      timeMs / 1000,
    )}s.`;
  }

  setActiveMode(modeId: ModeId): void {
    if (!this.state.modes.some((mode) => mode.id === modeId)) return;
    this.state.activeModeId = modeId;
    this.state.lastAction = `${this.state.activeMode?.name ?? 'Mode'} selected.`;
  }

  selectPack(packId: string): void {
    if (!this.state.packs.some((pack) => pack.id === packId)) return;
    this.state.activePackId = packId;
    const pack = this.activePack;
    this.state.lastAction = pack ? `${pack.title} pack opened.` : 'Pack focus changed.';
  }

  advancePack(packId: string): void {
    const pack = this.state.packs.find((item) => item.id === packId);
    if (!pack) return;
    if (pack.puzzlesCompleted >= pack.puzzlesTotal) {
      this.state.lastAction = `${pack.title} already complete — share the certificate!`;
      return;
    }
    pack.puzzlesCompleted += 1;
    const completionRatio = pack.puzzlesCompleted / pack.puzzlesTotal;
    if (completionRatio >= 0.6 && this.state.hintsRemaining < 6) {
      this.state.hintsRemaining += 1;
    }
    this.state.lastAction = `${pack.title} progress updated (${pack.puzzlesCompleted}/${pack.puzzlesTotal}).`;
  }

  refreshDailySeed(): void {
    if (!this.state.daily) return;
    const seed = `${this.state.daily.typeId}-${Date.now()}`;
    this.state.daily.seed = seed;
    this.state.daily.unlockedAt = new Date().toISOString();
    this.state.daily.leaderboard = this.state.daily.leaderboard
      .map((entry) => ({ ...entry }))
      .sort((a, b) => a.timeMs - b.timeMs);
    this.state.lastAction = 'Daily puzzle refreshed with a new secure seed.';
  }

  recordDailyResult(timeMs: number, accuracy: number, hintsUsed: number): void {
    if (!this.state.daily) return;
    const entry = {
      user: 'You',
      timeMs,
      accuracy,
      hintsUsed,
    };
    this.state.daily.leaderboard = [entry, ...this.state.daily.leaderboard]
      .map((item) => ({ ...item }))
      .sort((a, b) => a.timeMs - b.timeMs)
      .slice(0, 5);
    this.logSolve({ mode: 'daily', timeMs, accuracy, hintsUsed });
    this.state.lastAction = 'Daily Spotlight result submitted.';
  }

  startTimeAttack(roundId: string): void {
    const round = this.state.timeAttack.rounds.find((item) => item.id === roundId);
    if (!round) return;
    this.state.timeAttack.activeRoundId = roundId;
    this.state.timeAttack.remainingSeconds = round.durationSeconds;
    this.state.timeAttack.score = 0;
    this.state.lastAction = `${round.title} primed — sprint begins now.`;
    this.setActiveMode('timeattack');
  }

  updateTimeAttack(deltaSeconds: number): void {
    if (!this.state.timeAttack.activeRoundId) return;
    this.state.timeAttack.remainingSeconds = formatSeconds(
      this.state.timeAttack.remainingSeconds - deltaSeconds,
    );
    if (this.state.timeAttack.remainingSeconds <= 0) {
      const round = this.activeTimeAttackRound;
      if (round) {
        this.state.lastAction = `${round.title} expired — log your score.`;
      }
      this.state.timeAttack.activeRoundId = null;
      this.state.timeAttack.remainingSeconds = 0;
    }
  }

  completeTimeAttack(scoreDelta: number, accuracy: number): void {
    const round = this.activeTimeAttackRound;
    if (!round) return;
    this.state.timeAttack.score += Math.max(0, Math.round(scoreDelta));
    this.state.timeAttack.streak += accuracy >= 0.9 ? 1 : 0;
    if (this.state.timeAttack.score > round.bestScore) {
      round.bestScore = this.state.timeAttack.score;
    }
    const elapsed = (round.durationSeconds - this.state.timeAttack.remainingSeconds) * 1000;
    this.logSolve({ mode: 'timeattack', timeMs: Math.max(10000, elapsed), accuracy, hintsUsed: 0 });
    this.state.timeAttack.activeRoundId = null;
    this.state.timeAttack.remainingSeconds = 0;
    this.state.lastAction = `${round.title} sprint logged at ${this.state.timeAttack.score} pts.`;
  }

  get activeTimeAttackRound(): PuzzleTimeAttackRound | null {
    const id = this.state.timeAttack.activeRoundId;
    if (!id) return null;
    return this.state.timeAttack.rounds.find((round) => round.id === id) ?? null;
  }

  grantHintToken(count = 1): void {
    this.state.hintsRemaining = Math.min(9, this.state.hintsRemaining + count);
    this.state.lastAction = `Received ${count} hint token${count === 1 ? '' : 's'} from your streak.`;
  }
}

Alpine.store('puzzleZone', new PuzzleZoneStore());

import Alpine from 'alpinejs';
import { BaseStore, clone } from '../../../alpineStores/base';
import {
  triviaArenaMatches,
  triviaDailyMeta,
  triviaLeaderboardSnapshots,
  triviaModes,
  triviaPlanFeatures,
  triviaPowerUps,
  triviaQuestionPacks,
  triviaSampleQuestions,
  triviaStatSnapshot,
} from '../../../data/triviaSamples';
import type {
  TriviaAnswerStatus,
  TriviaMode,
  TriviaModeDefinition,
  TriviaPlanFeature,
  TriviaPowerUpDefinition,
  TriviaQuestion,
  TriviaLeaderboardSnapshot,
  TriviaQuestionPack,
  TriviaStatSnapshot,
  TriviaArenaMatchSummary,
  TriviaDailyChallengeMeta,
} from '../../../types/trivia';

interface PowerUpState extends TriviaPowerUpDefinition {
  used: number;
}

interface TriviaTimerState {
  totalMs: number;
  remainingMs: number;
}

interface TriviaSessionState {
  score: number;
  streak: number;
  answered: number;
  correct: number;
  answerStatus: TriviaAnswerStatus;
  doublePointsActive: boolean;
  hintActive: boolean;
  hiddenOptionIds: string[];
  timer: TriviaTimerState;
  lastExplanation: string | null;
}

interface TriviaArenaState {
  loading: boolean;
  modes: TriviaModeDefinition[];
  powerUps: PowerUpState[];
  questions: TriviaQuestion[];
  activeIndex: number;
  selections: Record<string, string[]>;
  fillAnswers: Record<string, string>;
  session: TriviaSessionState;
  activeMode: TriviaMode;
  leaderboards: TriviaLeaderboardSnapshot[];
  questionPacks: TriviaQuestionPack[];
  stats: TriviaStatSnapshot;
  matches: TriviaArenaMatchSummary[];
  daily: TriviaDailyChallengeMeta;
  planFeatures: TriviaPlanFeature[];
  lastAction: string | null;
}

const difficultyBasePoints: Record<string, number> = {
  easy: 100,
  medium: 150,
  hard: 200,
};

const cap = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const normaliseString = (value: string) => value.trim().toLowerCase();

class TriviaArenaStore extends BaseStore {
  state: TriviaArenaState = {
    loading: false,
    modes: [],
    powerUps: [],
    questions: [],
    activeIndex: 0,
    selections: {},
    fillAnswers: {},
    session: {
      score: 1280,
      streak: 4,
      answered: 0,
      correct: 0,
      answerStatus: 'idle',
      doublePointsActive: false,
      hintActive: false,
      hiddenOptionIds: [],
      timer: { totalMs: 20000, remainingMs: 18500 },
      lastExplanation: null,
    },
    activeMode: 'solo',
    leaderboards: [],
    questionPacks: [],
    stats: triviaStatSnapshot(),
    matches: [],
    daily: triviaDailyMeta(),
    planFeatures: triviaPlanFeatures(),
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
      this.state.modes = triviaModes();
      this.state.powerUps = triviaPowerUps().map((powerUp) => ({ ...powerUp, used: 0 }));
      this.state.questions = triviaSampleQuestions().map((question) => clone(question));
      this.state.activeIndex = 0;
      this.state.selections = {};
      this.state.fillAnswers = {};
      this.resetSession();
      this.state.leaderboards = triviaLeaderboardSnapshots();
      this.state.questionPacks = triviaQuestionPacks();
      this.state.matches = triviaArenaMatches();
      this.state.daily = triviaDailyMeta();
      this.state.lastAction = 'Trivia Arena ready — pick a mode to begin';
    } finally {
      this.state.loading = false;
      this.setLoaderVisible(false);
    }
  }

  get activeQuestion(): TriviaQuestion | null {
    return this.state.questions[this.state.activeIndex] ?? null;
  }

  get visibleOptions(): readonly string[] {
    const question = this.activeQuestion;
    if (!question?.options) return [];
    const hidden = new Set(this.state.session.hiddenOptionIds);
    return question.options.filter((option) => !hidden.has(option.id)).map((option) => option.id);
  }

  get selection(): string[] {
    const question = this.activeQuestion;
    if (!question) return [];
    return this.state.selections[question.id] ?? [];
  }

  get fillAnswer(): string {
    const question = this.activeQuestion;
    if (!question) return '';
    return this.state.fillAnswers[question.id] ?? '';
  }

  get timerProgress(): number {
    const { totalMs, remainingMs } = this.state.session.timer;
    if (totalMs <= 0) return 0;
    return cap(remainingMs / totalMs, 0, 1);
  }

  startMode(mode: TriviaMode): void {
    if (this.state.activeMode === mode && this.state.session.answered === 0) return;
    this.state.activeMode = mode;
    this.state.questions = triviaSampleQuestions().map((question, index) => ({
      ...question,
      timeLimitMs: cap(question.timeLimitMs + index * 1000, 18000, 30000),
    }));
    this.state.activeIndex = 0;
    this.state.selections = {};
    this.state.fillAnswers = {};
    this.state.powerUps = triviaPowerUps().map((powerUp) => ({ ...powerUp, used: 0 }));
    this.resetSession();
    const label = this.state.modes.find((item) => item.key === mode)?.label ?? 'Solo Drills';
    this.state.lastAction = `${label} mode loaded with ${this.state.questions.length} questions`;
  }

  private resetSession(): void {
    const question = this.state.questions[0];
    this.state.session = {
      score: 1280,
      streak: 4,
      answered: 0,
      correct: 0,
      answerStatus: 'idle',
      doublePointsActive: false,
      hintActive: false,
      hiddenOptionIds: [],
      timer: {
        totalMs: question?.timeLimitMs ?? 20000,
        remainingMs: question?.timeLimitMs ? Math.round(question.timeLimitMs * 0.9) : 18500,
      },
      lastExplanation: null,
    };
  }

  selectOption(optionId: string): void {
    const question = this.activeQuestion;
    if (!question || question.type === 'fill') return;
    const current = new Set(this.selection);
    if (question.type === 'multi') {
      if (current.has(optionId)) {
        current.delete(optionId);
      } else {
        current.add(optionId);
      }
      this.state.selections[question.id] = Array.from(current);
    } else {
      this.state.selections[question.id] = [optionId];
    }
    this.state.session.answerStatus = 'pending';
    this.state.lastAction = `Selected ${optionId.toUpperCase()} for ${question.prompt.slice(0, 24)}…`;
  }

  updateFillAnswer(value: string): void {
    const question = this.activeQuestion;
    if (!question || question.type !== 'fill') return;
    this.state.fillAnswers[question.id] = value;
    this.state.session.answerStatus = 'pending';
  }

  usePowerUp(key: PowerUpState['key']): void {
    const powerUp = this.state.powerUps.find((item) => item.key === key);
    if (!powerUp) return;
    const maxUses = powerUp.limit;
    if (powerUp.used >= maxUses) return;

    const question = this.activeQuestion;
    if (!question) return;

    if (key === 'fiftyFifty' && question.options) {
      const correctIds = this.asArray(question.answer).map((id) => String(id));
      const incorrectOptions = question.options.filter((option) => !correctIds.includes(option.id));
      const toHide = incorrectOptions.slice(0, Math.max(0, incorrectOptions.length - 1)).map((option) => option.id);
      this.state.session.hiddenOptionIds = Array.from(new Set([...this.state.session.hiddenOptionIds, ...toHide]));
      this.state.lastAction = '50/50 applied — two incorrect options removed';
    }

    if (key === 'addTime') {
      const timer = this.state.session.timer;
      const nextRemaining = cap(timer.remainingMs + 10000, 0, 45000);
      const nextTotal = cap(timer.totalMs + 10000, 0, 45000);
      this.state.session.timer = { totalMs: nextTotal, remainingMs: nextRemaining };
      this.state.lastAction = 'Timer extended by 10 seconds';
    }

    if (key === 'doublePoints') {
      this.state.session.doublePointsActive = true;
      this.state.lastAction = 'Double points armed for this question';
    }

    if (key === 'hint') {
      this.state.session.hintActive = true;
      const explanation = this.activeQuestion?.explanation ?? 'Focus on the core concept to unlock the answer.';
      const preview = explanation.split('.').slice(0, 1).join('.');
      this.state.session.lastExplanation = preview || explanation;
      this.state.lastAction = 'Hint revealed with a 25 point tradeoff';
    }

    powerUp.used += 1;
  }

  submitAnswer(): void {
    const question = this.activeQuestion;
    if (!question) return;

    const correctness = this.evaluateAnswer(question);
    const timer = this.state.session.timer;
    const basePoints = difficultyBasePoints[question.difficulty] ?? 100;
    const timeBonus = Math.ceil(this.timerProgress * 100);
    const streakMultiplier = cap(1 + this.state.session.streak * 0.05, 1, 2);
    let total = correctness ? Math.round((basePoints + timeBonus) * streakMultiplier) : 0;

    if (this.state.session.doublePointsActive && correctness) {
      total *= 2;
    }

    if (this.state.session.hintActive && correctness) {
      total = Math.max(0, total - 25);
    }

    if (!correctness) {
      total = Math.max(0, Math.round(basePoints * 0.2));
      this.state.session.streak = 0;
    } else {
      this.state.session.streak += 1;
    }

    this.state.session.score += total;
    this.state.session.answered += 1;
    if (correctness) {
      this.state.session.correct += 1;
    }
    const accuracy = this.state.session.answered
      ? this.state.session.correct / this.state.session.answered
      : 0;
    this.state.stats.accuracy = cap(Number(accuracy.toFixed(2)), 0, 1);
    this.state.stats.streak = Math.max(this.state.stats.streak, this.state.session.streak);
    this.state.stats.powerUpsUsed = this.state.powerUps.reduce((totalUsed, item) => totalUsed + item.used, 0);
    this.state.stats.rating = cap(Math.round(this.state.session.score / 10), 800, 2200);
    this.state.session.answerStatus = correctness ? 'correct' : 'incorrect';
    this.state.session.lastExplanation = question.explanation ?? null;
    this.state.session.doublePointsActive = false;
    this.state.session.hintActive = false;
    this.state.session.hiddenOptionIds = [];
    timer.remainingMs = Math.max(0, timer.remainingMs - Math.round(timer.totalMs * 0.35));
    this.state.lastAction = correctness
      ? `Correct! +${total} pts (${Math.round(accuracy * 100)}% accuracy)`
      : 'Not quite — review explanation and keep streak alive';
  }

  nextQuestion(): void {
    if (this.state.activeIndex >= this.state.questions.length - 1) {
      this.state.lastAction = 'Session complete — switch modes or retry!';
      return;
    }
    this.state.activeIndex += 1;
    const question = this.activeQuestion;
    if (!question) return;
    this.state.session.answerStatus = 'idle';
    this.state.session.doublePointsActive = false;
    this.state.session.hintActive = false;
    this.state.session.hiddenOptionIds = [];
    this.state.session.lastExplanation = null;
    this.state.session.timer = {
      totalMs: question.timeLimitMs,
      remainingMs: Math.round(question.timeLimitMs * 0.9),
    };
    this.state.lastAction = `Question ${this.state.activeIndex + 1} of ${this.state.questions.length}`;
  }

  revealAnswer(): void {
    const question = this.activeQuestion;
    if (!question) return;
    this.state.session.answerStatus = 'revealed';
    this.state.session.lastExplanation = question.explanation ?? null;
    this.state.lastAction = 'Answer revealed';
  }

  answerArray(question: TriviaQuestion | null = null): string[] {
    const target = question ?? this.activeQuestion;
    if (!target) return [];
    return this.asArray(target.answer);
  }

  private evaluateAnswer(question: TriviaQuestion): boolean {
    if (question.type === 'fill') {
      const provided = normaliseString(this.fillAnswer);
      if (!provided) return false;
      if (Array.isArray(question.answer)) {
        return question.answer.map((value) => normaliseString(String(value))).some((value) => value === provided);
      }
      return normaliseString(String(question.answer)) === provided;
    }

    const selection = this.selection;
    if (selection.length === 0) return false;

    if (question.type === 'multi') {
      const correct = this.asArray(question.answer).map((value) => String(value));
      const sortedSelection = [...selection].sort();
      const sortedCorrect = [...correct].sort();
      return sortedSelection.length === sortedCorrect.length &&
        sortedSelection.every((value, index) => value === sortedCorrect[index]);
    }

    if (Array.isArray(question.answer)) {
      return selection[0] === String(question.answer[0]);
    }
    return selection[0] === String(question.answer);
  }

  private asArray(answer: TriviaQuestion['answer']): string[] {
    return Array.isArray(answer) ? answer.map((value) => String(value)) : [String(answer)];
  }
}

if (!Alpine.store('triviaArena')) {
  Alpine.store('triviaArena', new TriviaArenaStore());
}

export type TriviaArenaStoreType = TriviaArenaStore;

import Alpine from 'alpinejs';
import { BaseStore } from '../../../alpineStores/base';
import { getSampleMemoryTrainerData } from '../../../lib/memory-trainer/sample';
import type {
  AnalyticsSnapshot,
  DeckSummary,
  ExerciseSummary,
  MemoryTrainerSampleData,
  PlanBlock,
  ReminderSetting,
  SrsCard,
  SrsGrade,
  SrsQueueState,
  StreakSummary,
} from '../../../types/memory-trainer';

interface MemoryTrainerState {
  loading: boolean;
  plan: PlanBlock[];
  planSummary: MemoryTrainerSampleData['planSummary'];
  activeBlockId: string | null;
  streak: StreakSummary;
  reminder: ReminderSetting;
  exercises: ExerciseSummary[];
  analytics: AnalyticsSnapshot;
  decks: DeckSummary[];
  srs: SrsQueueState;
  exports: MemoryTrainerSampleData['exports'];
  lastAction?: string | null;
}

const msPerDay = 24 * 60 * 60 * 1000;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const roundTo = (value: number, digits: number) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const createNextDueIso = (days: number) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + Math.max(1, Math.round(days)));
  return date.toISOString();
};

class MemoryTrainerStore extends BaseStore {
  state: MemoryTrainerState = {
    loading: false,
    plan: [],
    planSummary: { totalMinutes: 0, focusMinutes: 0, cooldownMinutes: 0 },
    activeBlockId: null,
    streak: { current: 0, best: 0, longestBreak: 0, lastCompleted: new Date().toISOString() },
    reminder: { enabled: false, time: '08:00', timezone: 'UTC', days: [] },
    exercises: [],
    analytics: { accuracyTrend: [], levelTrend: [], reactionTimes: [], forgettingCurve: [] },
    decks: [],
    srs: { activeDeckId: '', queue: [], completed: [] },
    exports: [],
    lastAction: null,
  };

  private initialised = false;

  init(): void {
    this.ensureLoaded();
  }

  ensureLoaded(): void {
    if (this.initialised) return;
    this.initialised = true;
    void this.loadSample();
  }

  private async loadSample(): Promise<void> {
    this.state.loading = true;
    this.setLoaderVisible(true);
    try {
      const sample = getSampleMemoryTrainerData();
      this.hydrateFromSample(sample);
      this.state.lastAction = 'Sample memory workspace ready';
    } finally {
      this.state.loading = false;
      this.setLoaderVisible(false);
    }
  }

  private hydrateFromSample(sample: MemoryTrainerSampleData): void {
    this.state.plan = sample.plan.map((block) => ({ ...block }));
    this.state.planSummary = { ...sample.planSummary };
    this.state.activeBlockId = null;
    this.state.streak = { ...sample.streak };
    this.state.reminder = { ...sample.reminder, days: [...sample.reminder.days] };
    this.state.exercises = sample.exercises.map((exercise) => ({ ...exercise, badges: [...exercise.badges] }));
    this.state.analytics = {
      accuracyTrend: sample.analytics.accuracyTrend.map((point) => ({ ...point })),
      levelTrend: sample.analytics.levelTrend.map((point) => ({ ...point })),
      reactionTimes: sample.analytics.reactionTimes.map((point) => ({ ...point })),
      forgettingCurve: sample.analytics.forgettingCurve.map((point) => ({ ...point })),
    };
    this.state.decks = sample.decks.map((deck) => ({ ...deck }));
    this.state.srs = {
      activeDeckId: sample.srs.activeDeckId,
      queue: sample.srs.queue.map((card) => ({ ...card })),
      completed: sample.srs.completed.map((card) => ({ ...card })),
    };
    this.state.exports = sample.exports.map((entry) => ({ ...entry }));
  }

  get activeBlock(): PlanBlock | null {
    if (!this.state.activeBlockId) return null;
    return this.state.plan.find((block) => block.id === this.state.activeBlockId) ?? null;
  }

  startBlock(blockId: string): void {
    const block = this.state.plan.find((item) => item.id === blockId);
    if (!block) return;
    this.state.plan.forEach((item) => {
      if (item.id !== blockId && item.status === 'in-progress') {
        item.status = 'pending';
      }
    });
    block.status = 'in-progress';
    this.state.activeBlockId = blockId;
    this.state.lastAction = `${block.title} started`;
    this.bumpReactionTime('Focus', -30);
  }

  completeBlock(blockId: string): void {
    const block = this.state.plan.find((item) => item.id === blockId);
    if (!block) return;
    block.status = 'completed';
    if (this.state.activeBlockId === blockId) {
      this.state.activeBlockId = null;
    }
    this.state.streak.current += 1;
    this.state.streak.best = Math.max(this.state.streak.best, this.state.streak.current);
    this.state.streak.lastCompleted = new Date().toISOString();
    this.state.lastAction = `${block.title} logged as complete`;
    this.bumpAccuracy(block.targetAccuracy * 100, 2);
  }

  resetPlan(): void {
    this.state.plan.forEach((block) => {
      block.status = 'pending';
    });
    this.state.activeBlockId = null;
    this.state.lastAction = 'Plan reset for today';
  }

  toggleReminder(day: string): void {
    const { days } = this.state.reminder;
    if (days.includes(day)) {
      this.state.reminder.days = days.filter((existing) => existing !== day);
    } else {
      this.state.reminder.days = [...days, day].sort((a, b) => this.weekdayIndex(a) - this.weekdayIndex(b));
    }
    this.state.lastAction = `Reminder days updated (${this.state.reminder.days.join(', ')})`;
  }

  setReminderTime(time: string): void {
    this.state.reminder.time = time;
    this.state.lastAction = `Reminder set for ${time}`;
  }

  toggleReminderEnabled(): void {
    this.state.reminder.enabled = !this.state.reminder.enabled;
    this.state.lastAction = this.state.reminder.enabled ? 'Daily reminder enabled' : 'Daily reminder paused';
  }

  updateTimezone(timezone: string): void {
    this.state.reminder.timezone = timezone;
    this.state.lastAction = `Timezone updated to ${timezone}`;
  }

  nudgeExerciseLevel(type: ExerciseSummary['type'], delta: number): void {
    const exercise = this.state.exercises.find((item) => item.type === type);
    if (!exercise) return;
    const newLevel = clamp(exercise.level + delta, 1, 50);
    exercise.level = newLevel;
    exercise.levelLabel = exercise.levelLabel;
    exercise.recommendedNext = delta > 0 ? 'Maintain focus block for stability' : 'Repeat warm-up block';
    exercise.streak = delta > 0 ? exercise.streak + 1 : Math.max(0, exercise.streak - 1);
    this.state.lastAction = `${exercise.title} adjusted to level ${newLevel}`;
    this.bumpLevelTrend(exercise.title, newLevel);
  }

  recordTrialResult(type: ExerciseSummary['type'], correct: boolean, reactionMs: number): void {
    const exercise = this.state.exercises.find((item) => item.type === type);
    if (!exercise) return;
    const delta = correct ? 0.02 : -0.03;
    exercise.accuracy = clamp(roundTo(exercise.accuracy + delta, 2), 0.35, 0.98);
    exercise.bestAccuracy = Math.max(exercise.bestAccuracy, exercise.accuracy);
    exercise.averageResponseMs = clamp(Math.round((exercise.averageResponseMs + reactionMs) / 2), 380, 2400);
    exercise.lastReactionMs = reactionMs;
    exercise.badges = Array.from(new Set([...exercise.badges, correct ? 'Perfect recall' : 'Retry scheduled']));
    this.state.lastAction = `${exercise.title} trial ${correct ? 'success' : 'retry'} recorded`;
    this.bumpAccuracy(exercise.accuracy * 100, correct ? 1 : -2);
    this.bumpReactionTime(exercise.title, correct ? -12 : 24);
  }

  switchDeck(deckId: string): void {
    if (this.state.srs.activeDeckId === deckId) return;
    const deck = this.state.decks.find((item) => item.id === deckId);
    if (!deck) return;
    this.state.srs.activeDeckId = deckId;
    this.state.srs.queue = this.generateDeckQueue(deckId);
    this.state.srs.completed = [];
    this.state.lastAction = `${deck.name} deck activated`;
  }

  gradeCard(grade: SrsGrade): void {
    const queue = this.state.srs.queue;
    if (queue.length === 0) return;
    const [card, ...rest] = queue;
    const adjustment = this.calculateEaseAdjustment(grade);
    const newEase = clamp(roundTo(card.easeFactor + adjustment, 2), 1.3, 2.8);
    const newInterval = this.calculateNextInterval(card.intervalDays, grade, newEase);
    const updatedCard: SrsCard = {
      ...card,
      easeFactor: newEase,
      intervalDays: newInterval,
      dueOn: createNextDueIso(newInterval),
      lapses: grade <= 2 ? card.lapses + 1 : card.lapses,
    };
    this.state.srs.queue = rest;
    this.state.srs.completed = [updatedCard, ...this.state.srs.completed].slice(0, 10);
    this.decrementDeckDue(this.state.srs.activeDeckId);
    this.bumpAccuracy(grade >= 4 ? 95 : grade === 3 ? 82 : 58, grade >= 4 ? 2 : grade === 3 ? 1 : -4);
    this.state.lastAction = `Card graded ${grade}`;
  }

  private calculateEaseAdjustment(grade: SrsGrade): number {
    if (grade === 1) return -0.3;
    if (grade === 2) return -0.15;
    if (grade === 3) return -0.05;
    if (grade === 4) return 0.05;
    return 0.15;
  }

  private calculateNextInterval(currentInterval: number, grade: SrsGrade, easeFactor: number): number {
    if (grade <= 2) return 1;
    if (grade === 3) return Math.max(1, roundTo(currentInterval * easeFactor * 0.9, 2));
    if (grade === 4) return Math.max(2, roundTo(currentInterval * easeFactor * 1.05, 2));
    return Math.max(3, roundTo(currentInterval * easeFactor * 1.3, 2));
  }

  private decrementDeckDue(deckId: string): void {
    const deck = this.state.decks.find((item) => item.id === deckId);
    if (!deck) return;
    deck.dueToday = Math.max(0, deck.dueToday - 1);
    deck.streak += 1;
    deck.nextDue = createNextDueIso(deck.streak % 5 === 0 ? 2 : 1);
  }

  private generateDeckQueue(deckId: string): SrsCard[] {
    const deck = this.state.decks.find((item) => item.id === deckId);
    if (!deck) return [];
    const baseDue = Math.max(1, deck.dueToday);
    return Array.from({ length: Math.min(3, baseDue) }).map((_, index) => ({
      id: `${deckId}-card-${index + 1}`,
      front: `Deck ${deck.tag} prompt ${index + 1}`,
      back: `Detailed answer for ${deck.name} item ${index + 1}.`,
      easeFactor: 2.4 - index * 0.05,
      intervalDays: 2 + index,
      dueOn: new Date(Date.now() - index * msPerDay).toISOString(),
      lapses: index % 2,
    }));
  }

  private bumpAccuracy(target: number, delta: number): void {
    const trend = this.state.analytics.accuracyTrend;
    if (!trend.length) return;
    const last = trend[trend.length - 1];
    last.value = clamp(Math.round(last.value + delta), 40, 100);
    const average = trend.reduce((sum, point) => sum + point.value, 0) / trend.length;
    this.state.exercises.forEach((exercise) => {
      if (exercise.type !== 'srs') return;
      exercise.accuracy = clamp(roundTo(average / 100, 2), 0.6, 0.99);
    });
  }

  private bumpReactionTime(label: string, delta: number): void {
    const reaction = this.state.analytics.reactionTimes.find((item) => item.label === label);
    if (!reaction) return;
    reaction.milliseconds = clamp(reaction.milliseconds + delta, 420, 2400);
  }

  private bumpLevelTrend(label: string, level: number): void {
    const trend = this.state.analytics.levelTrend.find((item) => item.label === label);
    if (!trend) return;
    trend.value = level;
  }

  private weekdayIndex(day: string): number {
    const order = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const index = order.indexOf(day);
    return index === -1 ? order.length : index;
  }
}

if (!Alpine.store('memoryTrainer')) {
  Alpine.store('memoryTrainer', new MemoryTrainerStore());
}

export type MemoryTrainerStoreType = MemoryTrainerStore;

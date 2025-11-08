import Alpine from 'alpinejs';
import { BaseStore } from '../../../alpineStores/base';
import {
  getStudyTimerGoalSnapshot,
  getStudyTimerHighlights,
  getStudyTimerHistory,
  getStudyTimerIntegrations,
  getStudyTimerPlanFeatures,
  getStudyTimerPresets,
  getStudyTimerTags,
  getStudyTimerTrend,
} from '../data/sampleTimer';
import type {
  StudyTimerGoalSnapshot,
  StudyTimerHistoryDay,
  StudyTimerIntegrationCard,
  StudyTimerPhase,
  StudyTimerPlanFeature,
  StudyTimerPreset,
  StudyTimerStatHighlight,
  StudyTimerTag,
  StudyTimerTrendPoint,
} from '../../../types/study-timer';

interface StudyTimerState {
  presets: StudyTimerPreset[];
  activePresetId: string;
  phase: StudyTimerPhase;
  isRunning: boolean;
  elapsedSeconds: number;
  sessionSeconds: number;
  targetSeconds: number;
  completedCycles: number;
  completedPomodorosToday: number;
  totalFocusMinutesToday: number;
  focusSecondsToday: number;
  longBreakEvery: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  upcomingPhaseLabel: string;
  upcomingPhaseDurationMinutes: number;
  goal: StudyTimerGoalSnapshot;
  tags: StudyTimerTag[];
  selectedTagIds: string[];
  note: string;
  interruptions: {
    id: string;
    at: string;
    reason: string;
    note?: string;
  }[];
  highlights: StudyTimerStatHighlight[];
  trend: StudyTimerTrendPoint[];
  history: StudyTimerHistoryDay[];
  integrations: StudyTimerIntegrationCard[];
  planFeatures: StudyTimerPlanFeature[];
  distractionReasons: { id: string; label: string; icon: string }[];
  goalCelebration: boolean;
  lastAction: string;
}

const ONE_SECOND = 1000;

class StudyTimerStore extends BaseStore {
  state: StudyTimerState;
  private initialised = false;
  private tickHandle: number | null = null;
  private lastTickAt: number | null = null;

  constructor() {
    super();
    const presets = getStudyTimerPresets();
    const activePresetId = presets[0]?.id ?? '';
    const activePreset = presets.find((preset) => preset.id === activePresetId) ?? null;
    const goal = getStudyTimerGoalSnapshot();

    this.state = {
      presets,
      activePresetId,
      phase: 'idle',
      isRunning: false,
      elapsedSeconds: 0,
      sessionSeconds: 0,
      targetSeconds: (activePreset?.workMin ?? 0) * 60,
      completedCycles: 0,
      completedPomodorosToday: 6,
      totalFocusMinutesToday: 162,
      focusSecondsToday: 162 * 60,
      longBreakEvery: activePreset?.longEvery ?? 4,
      autoStartBreaks: true,
      autoStartWork: false,
      upcomingPhaseLabel: 'Next · Short break',
      upcomingPhaseDurationMinutes: activePreset?.shortBreakMin ?? 5,
      goal,
      tags: getStudyTimerTags(),
      selectedTagIds: ['tag-physics'],
      note: '',
      interruptions: [],
      highlights: getStudyTimerHighlights(),
      trend: getStudyTimerTrend(),
      history: getStudyTimerHistory(),
      integrations: getStudyTimerIntegrations(),
      planFeatures: getStudyTimerPlanFeatures(),
      distractionReasons: [
        { id: 'phone', label: 'Phone ping', icon: 'fas fa-mobile-screen-button' },
        { id: 'chat', label: 'Chat message', icon: 'fas fa-comments' },
        { id: 'door', label: 'Door knock', icon: 'fas fa-door-open' },
        { id: 'break', label: 'Stretch break', icon: 'fas fa-person-running' },
        { id: 'fatigue', label: 'Lost focus', icon: 'fas fa-face-sleeping' },
        { id: 'other', label: 'Other', icon: 'fas fa-circle-question' },
      ],
      goalCelebration: goal.completedDailyMinutes >= goal.targetDailyMinutes,
      lastAction: 'Timer ready. Pick a preset to begin.',
    };
  }

  get activePreset(): StudyTimerPreset | null {
    return this.state.presets.find((preset) => preset.id === this.state.activePresetId) ?? null;
  }

  get remainingSeconds(): number {
    if (this.state.phase === 'idle') return this.state.targetSeconds;
    if (this.state.targetSeconds === 0) return 0;
    return Math.max(this.state.targetSeconds - this.state.elapsedSeconds, 0);
  }

  get phaseProgress(): number {
    if (this.state.targetSeconds === 0) {
      return this.state.phase === 'countup' ? 0 : 1;
    }
    const progress = this.state.elapsedSeconds / this.state.targetSeconds;
    return Number.isFinite(progress) ? Math.min(Math.max(progress, 0), 1) : 0;
  }

  init(): void {
    if (this.initialised) return;
    this.initialised = true;
    this.lastAction = 'Focus ready. Space to start, I to log an interruption.';
  }

  togglePreset(id: string): void {
    if (this.state.activePresetId === id) return;
    const preset = this.state.presets.find((item) => item.id === id);
    if (!preset) return;
    this.stopTimer();
    this.state.activePresetId = id;
    this.state.targetSeconds = preset.mode === 'countup' ? 0 : preset.workMin * 60;
    this.state.longBreakEvery = preset.longEvery;
    this.state.phase = preset.mode === 'countup' ? 'countup' : 'idle';
    this.state.elapsedSeconds = 0;
    this.state.sessionSeconds = 0;
    this.state.completedCycles = 0;
    this.state.upcomingPhaseLabel = preset.longBreakMin
      ? `Next · ${preset.shortBreakMin} min break`
      : 'Next · Wrap up';
    this.state.upcomingPhaseDurationMinutes = preset.shortBreakMin;
    this.state.lastAction = `${preset.name} preset armed. Press start when ready.`;
  }

  toggleTimer(): void {
    if (this.state.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer(): void {
    if (this.state.isRunning) return;
    const preset = this.activePreset;
    if (!preset) return;

    if (this.state.phase === 'idle') {
      this.beginPhase(preset.mode === 'countup' ? 'countup' : 'work');
    }

    this.state.isRunning = true;
    this.lastTickAt = Date.now();
    this.scheduleTick();
    this.state.lastAction = 'Timer running. Stay focused!';
  }

  pauseTimer(): void {
    if (!this.state.isRunning) return;
    this.state.isRunning = false;
    this.clearTick();
    this.state.lastAction = 'Timer paused. Resume when ready.';
  }

  resetTimer(): void {
    this.stopTimer();
    const preset = this.activePreset;
    this.state.phase = preset?.mode === 'countup' ? 'countup' : 'idle';
    this.state.elapsedSeconds = 0;
    this.state.sessionSeconds = 0;
    this.state.targetSeconds = preset?.mode === 'countup' ? 0 : (preset?.workMin ?? 0) * 60;
    this.state.completedCycles = 0;
    this.state.upcomingPhaseLabel = preset?.shortBreakMin
      ? `Next · ${preset.shortBreakMin} min break`
      : 'Next · Wrap up';
    this.state.upcomingPhaseDurationMinutes = preset?.shortBreakMin ?? 0;
    this.state.lastAction = 'Session reset.';
  }

  private stopTimer(): void {
    this.state.isRunning = false;
    this.clearTick();
    this.lastTickAt = null;
  }

  private scheduleTick(): void {
    if (typeof window === 'undefined') return;
    this.clearTick();
    this.tickHandle = window.setInterval(() => this.handleTick(), ONE_SECOND);
  }

  private clearTick(): void {
    if (this.tickHandle !== null && typeof window !== 'undefined') {
      window.clearInterval(this.tickHandle);
    }
    this.tickHandle = null;
  }

  private handleTick(): void {
    if (!this.state.isRunning) return;
    const now = Date.now();
    const last = this.lastTickAt ?? now;
    this.lastTickAt = now;
    const diffSeconds = Math.max(Math.round((now - last) / ONE_SECOND), 1);

    this.state.elapsedSeconds += diffSeconds;
    this.state.sessionSeconds += diffSeconds;

    if (this.state.phase === 'work' || this.state.phase === 'countup' || this.state.phase === 'countdown') {
      this.state.focusSecondsToday += diffSeconds;
      const minutes = Math.floor(this.state.focusSecondsToday / 60);
      this.state.totalFocusMinutesToday = minutes;
      this.state.goal.completedDailyMinutes = minutes;
      this.refreshGoalCelebration();
    }

    if (this.state.targetSeconds > 0 && this.state.elapsedSeconds >= this.state.targetSeconds) {
      this.advancePhase();
    }
  }

  private beginPhase(phase: StudyTimerPhase): void {
    const preset = this.activePreset;
    this.state.phase = phase;
    this.state.elapsedSeconds = 0;
    if (!preset) {
      this.state.targetSeconds = 0;
      return;
    }

    switch (phase) {
      case 'work':
        this.state.targetSeconds = preset.mode === 'countup' ? 0 : preset.workMin * 60;
        break;
      case 'short_break':
        this.state.targetSeconds = preset.shortBreakMin * 60;
        break;
      case 'long_break':
        this.state.targetSeconds = preset.longBreakMin * 60;
        break;
      case 'countup':
        this.state.targetSeconds = 0;
        break;
      case 'countdown':
        this.state.targetSeconds = preset.workMin * 60;
        break;
      default:
        this.state.targetSeconds = 0;
    }

    if (phase === 'work') {
      this.state.lastAction = 'Focus phase running.';
    } else if (phase === 'short_break' || phase === 'long_break') {
      this.state.lastAction = `${phase === 'long_break' ? 'Long break' : 'Short break'} started.`;
    }
  }

  private advancePhase(): void {
    const preset = this.activePreset;
    if (!preset) return;

    if (this.state.phase === 'work' || this.state.phase === 'countdown') {
      this.state.completedPomodorosToday += 1;
      this.state.goal.completedDailyPomos = Math.max(this.state.goal.completedDailyPomos, this.state.completedPomodorosToday);
      this.state.completedCycles += 1;
      const useLongBreak = preset.longBreakMin > 0 && this.state.completedCycles % this.state.longBreakEvery === 0;
      this.beginPhase(useLongBreak ? 'long_break' : 'short_break');
      this.state.upcomingPhaseLabel = 'Next · Focus session';
      this.state.upcomingPhaseDurationMinutes = preset.workMin;
      if (!this.state.autoStartBreaks) {
        this.pauseTimer();
      }
    } else if (this.state.phase === 'short_break' || this.state.phase === 'long_break') {
      this.beginPhase('work');
      this.state.upcomingPhaseLabel = preset.shortBreakMin
        ? `Next · ${preset.shortBreakMin} min break`
        : 'Next · Wrap up';
      this.state.upcomingPhaseDurationMinutes = preset.shortBreakMin;
      if (!this.state.autoStartWork) {
        this.pauseTimer();
      }
    } else if (this.state.phase === 'countup') {
      // Count-up runs indefinitely; do nothing.
      this.state.elapsedSeconds = 0;
    }
  }

  toggleTag(id: string): void {
    const selected = new Set(this.state.selectedTagIds);
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    this.state.selectedTagIds = Array.from(selected);
  }

  setNote(value: string): void {
    this.state.note = value;
  }

  logInterruption(reason: string, note = ''): void {
    const interruption = {
      id: `interrupt-${Date.now()}`,
      at: new Date().toISOString(),
      reason,
      note: note.trim() ? note.trim() : undefined,
    };
    this.state.interruptions = [interruption, ...this.state.interruptions].slice(0, 6);
    this.state.lastAction = `Logged interruption: ${reason}.`;
  }

  describePreset(preset: StudyTimerPreset | null = this.activePreset): string {
    if (!preset) return '';
    if (preset.mode === 'countup') return 'Count-up timer';
    return `${preset.workMin}m focus • ${preset.shortBreakMin}m break • long break every ${preset.longEvery}`;
  }

  formatTime(seconds: number): string {
    const safeSeconds = Math.max(0, Math.round(seconds));
    const minutes = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  private refreshGoalCelebration(): void {
    const goalMet = this.state.goal.completedDailyMinutes >= this.state.goal.targetDailyMinutes;
    this.state.goalCelebration = goalMet;
  }
}

const studyTimer = new StudyTimerStore();
Alpine.store('studyTimer', studyTimer);

export { studyTimer };

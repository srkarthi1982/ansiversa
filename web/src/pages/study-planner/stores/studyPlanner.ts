import Alpine from 'alpinejs';
import { BaseStore, clone } from '../../../alpineStores/base';
import {
  getIntegrationCards,
  getPlanComparisonRows,
  getStudyAnalytics,
  getStudyAvailability,
  getStudyBacklog,
  getStudyHighlights,
  getStudyMetrics,
  getStudyRevisionData,
  getStudySchedule,
  getStudySubjects,
  type AvailabilityDay,
  type IntegrationCard,
  type PlanComparisonRow,
  type RiskSignal,
  type StudyAnalytics,
  type StudyHighlights,
  type StudyMetric,
  type StudyPlanSlot,
  type StudyRevisionData,
  type StudySubject,
  type StudyTask,
  type WeeklyFocusBreakdownItem,
} from '../data/sampleStudyPlan';

interface PlannerPlanState {
  tier: 'free' | 'pro';
  tasksCreated: number;
  taskLimit: number;
  autoScheduleMode: 'basic' | 'advanced';
  statusMessage: string;
}

interface TimerState {
  mode: 'focus' | 'short-break' | 'long-break';
  totalMinutes: number;
  remainingMinutes: number;
  isRunning: boolean;
  activeTaskId: string | null;
  completedPomodoros: number;
  upcoming: string;
  status: string;
}

class StudyPlannerStore extends BaseStore {
  metrics: StudyMetric[];
  subjects: StudySubject[];
  backlog: StudyTask[];
  filteredBacklog: StudyTask[];
  calendar: StudyPlanSlot[];
  availability: AvailabilityDay[];
  highlights: StudyHighlights;
  revision: StudyRevisionData;
  analytics: StudyAnalytics;
  integrations: IntegrationCard[];
  planComparison: PlanComparisonRow[];
  plan: PlannerPlanState;
  timer: TimerState;
  agenda: StudyPlanSlot[] = [];
  activeDay: string;
  focusSubjectId: string;
  readonly weekDays: readonly string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  lastAction: string;
  private initialised = false;

  constructor() {
    super();
    this.metrics = getStudyMetrics();
    this.subjects = getStudySubjects();
    this.backlog = getStudyBacklog();
    this.filteredBacklog = clone(this.backlog);
    this.calendar = getStudySchedule();
    this.availability = getStudyAvailability();
    this.highlights = getStudyHighlights();
    this.revision = getStudyRevisionData();
    this.analytics = getStudyAnalytics();
    this.integrations = getIntegrationCards();
    this.planComparison = getPlanComparisonRows();
    this.plan = {
      tier: 'free',
      tasksCreated: 112,
      taskLimit: 200,
      autoScheduleMode: 'basic',
      statusMessage: 'Free plan: 200 task slots, basic auto-scheduler, 2 linked decks.',
    };
    this.timer = {
      mode: 'focus',
      totalMinutes: 25,
      remainingMinutes: 25,
      isRunning: false,
      activeTaskId: this.calendar[0]?.taskId ?? null,
      completedPomodoros: 3,
      upcoming: 'Short break · 5m',
      status: 'Timer paused — choose a task to focus on.',
    };
    this.activeDay = 'Thu';
    this.focusSubjectId = 'all';
    this.lastAction = 'Planner ready. Import from Course Tracker or add a new subject.';
    this.refreshBacklog();
    this.refreshAgenda();
  }

  init(): void {
    if (this.initialised) return;
    this.initialised = true;
    this.lastAction = 'Smart suggestions loaded. Use Auto-schedule to rebalance the week.';
  }

  setFocusSubject(subjectId: string): void {
    this.focusSubjectId = subjectId;
    this.refreshBacklog();
    const subjectName = subjectId === 'all' ? 'all subjects' : this.subjects.find((subject) => subject.id === subjectId)?.name;
    this.lastAction = `Focus switched to ${subjectName ?? 'selected subject'}. Backlog reordered.`;
  }

  private refreshBacklog(): void {
    const filtered = this.focusSubjectId === 'all'
      ? this.backlog
      : this.backlog.filter((task) => task.subjectId === this.focusSubjectId);
    const sorted = [...filtered].sort((a, b) => b.priorityScore - a.priorityScore);
    this.filteredBacklog = sorted;
  }

  setActiveDay(day: string): void {
    if (!this.weekDays.includes(day)) return;
    this.activeDay = day;
    this.refreshAgenda();
    const firstSlot = this.agenda[0];
    if (firstSlot) {
      this.timer.activeTaskId = firstSlot.taskId;
      this.timer.status = `Ready for ${firstSlot.focus}.`;
    }
    this.lastAction = `Agenda switched to ${day}.`;
  }

  private refreshAgenda(): void {
    const slots = this.calendar.filter((slot) => slot.day === this.activeDay);
    this.agenda = slots.sort((a, b) => a.start.localeCompare(b.start));
  }

  autoScheduleWeek(): void {
    this.withLoader(() => {
      const priorityTasks = this.filteredBacklog.slice(0, 2);
      const dayIndex = this.weekDays.indexOf(this.activeDay);
      let cursor = dayIndex >= 0 ? dayIndex : 0;
      const updated = [...this.calendar];

      priorityTasks.forEach((task, index) => {
        cursor = (cursor + 1) % this.weekDays.length;
        const day = this.weekDays[cursor];
        const id = `auto-${task.id}-${index}`;
        const existingIndex = updated.findIndex((slot) => slot.id === id);
        const slot: StudyPlanSlot = {
          id,
          taskId: task.id,
          type: 'study',
          subjectId: task.subjectId,
          focus: `${task.topic} focus block`,
          day,
          start: '18:30',
          end: '19:30',
          durationMinutes: 60,
          status: 'scheduled',
          energy: 'steady',
          notes: 'Auto-scheduled with Smart scheduler (basic mode).',
        };
        if (existingIndex >= 0) {
          updated.splice(existingIndex, 1, slot);
        } else {
          updated.push(slot);
        }
      });

      this.calendar = updated;
      this.refreshAgenda();
      this.plan.statusMessage =
        this.plan.tier === 'pro'
          ? 'Advanced scheduler applied energy, commute, and lab constraints.'
          : 'Basic scheduler balanced deadlines. Upgrade for advanced constraints.';
      this.lastAction = 'Smart scheduler rebalanced your week around top priorities.';
    });
  }

  toggleAvailability(dayId: string): void {
    const day = this.availability.find((item) => item.id === dayId);
    if (!day) return;
    day.enabled = !day.enabled;
    this.lastAction = day.enabled
      ? `${day.label} re-enabled with ${day.dailyCapHours} hr cap.`
      : `${day.label} marked as rest day. Scheduler will respect this.`;
  }

  boostTask(taskId: string): void {
    const task = this.backlog.find((item) => item.id === taskId);
    if (!task) return;
    task.priorityScore = Math.min(100, task.priorityScore + 6);
    this.refreshBacklog();
    this.lastAction = `Priority increased for ${task.title}. Auto-scheduler will place it sooner.`;
  }

  markSlotComplete(slotId: string): void {
    const slot = this.calendar.find((item) => item.id === slotId);
    if (!slot) return;
    if (slot.status === 'completed') {
      this.lastAction = `${slot.focus} was already marked complete.`;
      return;
    }
    slot.status = 'completed';
    slot.notes = 'Completed manually from dashboard.';
    if (slot.type === 'review') {
      const reviewsMetric = this.metrics.find((metric) => metric.id === 'reviews-due');
      if (reviewsMetric) {
        reviewsMetric.value = Math.max(0, reviewsMetric.value - Math.round(slot.durationMinutes / 5));
      }
    }
    const velocity = this.analytics.velocity;
    velocity.thisWeek += 1;
    this.lastAction = `Marked ${slot.focus} as complete. Progress logged.`;
    this.refreshAgenda();
  }

  startPomodoro(taskId: string | null): void {
    this.timer.activeTaskId = taskId;
    this.timer.mode = 'focus';
    this.timer.remainingMinutes = this.timer.totalMinutes;
    this.timer.isRunning = true;
    this.timer.status = taskId ? `Focusing on ${this.getTaskTitle(taskId)}.` : 'Focus timer running.';
    this.lastAction = 'Pomodoro started. Break nudges will trigger automatically.';
  }

  toggleTimer(): void {
    this.timer.isRunning = !this.timer.isRunning;
    this.timer.status = this.timer.isRunning ? 'Timer running — stay in flow.' : 'Timer paused.';
  }

  completePomodoroCycle(): void {
    this.timer.isRunning = false;
    this.timer.completedPomodoros += 1;
    const isLongBreak = this.timer.completedPomodoros % 4 === 0;
    this.timer.mode = isLongBreak ? 'long-break' : 'short-break';
    this.timer.remainingMinutes = isLongBreak ? 15 : 5;
    this.timer.upcoming = isLongBreak ? 'Long break · 15m' : 'Short break · 5m';
    this.timer.status = 'Cycle complete. Log reflection and start break.';
    this.lastAction = 'Pomodoro cycle logged. Take a break before the next block.';
  }

  scheduleReview(deckId: string): void {
    const deck = this.revision.decks.find((item) => item.id === deckId);
    if (!deck) return;
    deck.dueCards = Math.max(0, deck.dueCards - 5);
    deck.dueLabel = 'Queued for tonight';
    deck.nextReview = 'Today · 19:45';
    deck.confidence = deck.confidence === 'Low' ? 'Medium' : deck.confidence;
    const reviewsMetric = this.metrics.find((metric) => metric.id === 'reviews-due');
    if (reviewsMetric) {
      reviewsMetric.value = Math.max(0, reviewsMetric.value - 5);
    }
    this.lastAction = `Review session locked for ${deck.name}.`;
  }

  upgradePlan(): void {
    if (this.plan.tier === 'pro') {
      this.lastAction = 'You already have Pro unlocked. Enjoy unlimited scheduling.';
      return;
    }
    this.plan.tier = 'pro';
    this.plan.autoScheduleMode = 'advanced';
    this.plan.statusMessage = 'Pro unlocked: unlimited tasks, advanced constraints, ICS export.';
    const deckStat = this.revision.stats.find((stat) => stat.label.startsWith('Deck limit'));
    if (deckStat) {
      deckStat.value = 'Unlimited decks';
      deckStat.description = 'Auto-link every FlashNote deck and import CSV history.';
    }
    this.lastAction = 'Ansiversa Pro activated. Advanced analytics and exports ready.';
  }

  getTaskTitle(taskId: string | null): string {
    if (!taskId) return 'No task selected';
    const fromCalendar = this.calendar.find((slot) => slot.taskId === taskId);
    if (fromCalendar) return fromCalendar.focus;
    const fromBacklog = this.backlog.find((task) => task.id === taskId);
    return fromBacklog?.title ?? 'Custom focus block';
  }

  getFocusShare(subjectId: string): WeeklyFocusBreakdownItem | undefined {
    return this.analytics.weeklyFocus.find((item) => item.subjectId === subjectId);
  }

  getRiskBadge(signal: RiskSignal): string {
    if (signal.severity === 'high') return 'text-rose-600 bg-rose-100';
    if (signal.severity === 'medium') return 'text-amber-600 bg-amber-100';
    return 'text-emerald-600 bg-emerald-100';
  }
}

const studyPlanner = new StudyPlannerStore();

Alpine.store('studyPlanner', studyPlanner);

export type StudyPlannerAlpineStore = StudyPlannerStore;
export { studyPlanner };

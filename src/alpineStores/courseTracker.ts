import Alpine from 'alpinejs';
import { BaseStore } from './base';
import { getSampleCourseTrackerData } from '../lib/course-tracker/sample';
import type {
  CourseRecord,
  CourseTimelineEvent,
  ExportStatus,
  LessonRecord,
  NoteRecord,
  PlanSession,
  ReminderSetting,
  StudySessionRecord,
} from '../types/course-tracker';

type StatusFilter = 'all' | 'active' | 'completed' | 'planning' | 'archived';

type PlanView = 'week' | 'milestones';

interface TimerState {
  running: boolean;
  lessonId: string | null;
  startedAt: number | null;
  accumulatedMinutes: number;
}

interface DashboardMetrics {
  totalCourses: number;
  activeCourses: number;
  planningCourses: number;
  hoursPlannedThisWeek: number;
  minutesLoggedThisWeek: number;
  bestStreak: number;
  remindersDueToday: number;
}

class CourseTrackerStore extends BaseStore {
  state: {
    loading: boolean;
    courses: CourseRecord[];
    filteredCourses: CourseRecord[];
    sessions: StudySessionRecord[];
    notes: NoteRecord[];
    exports: ExportStatus[];
    timeline: CourseTimelineEvent[];
    filters: { status: StatusFilter; provider: string; focus: string };
    search: string;
    todayIso: string;
    selectedCourseId: string | null;
    planView: PlanView;
    timer: TimerState;
    metrics: DashboardMetrics;
    lastActionMessage: string | null;
  } = {
    loading: false,
    courses: [],
    filteredCourses: [],
    sessions: [],
    notes: [],
    exports: [],
    timeline: [],
    filters: { status: 'active', provider: 'all', focus: 'all' },
    search: '',
    todayIso: new Date().toISOString(),
    selectedCourseId: null,
    planView: 'week',
    timer: { running: false, lessonId: null, startedAt: null, accumulatedMinutes: 0 },
    metrics: {
      totalCourses: 0,
      activeCourses: 0,
      planningCourses: 0,
      hoursPlannedThisWeek: 0,
      minutesLoggedThisWeek: 0,
      bestStreak: 0,
      remindersDueToday: 0,
    },
    lastActionMessage: null,
  };

  private initialised = false;

  onInit(): void {
    this.ensureLoaded();
  }

  ensureLoaded(): void {
    if (this.initialised) return;
    this.initialised = true;
    void this.loadWorkspace();
  }

  notify(message: string): void {
    this.state.lastActionMessage = message;
  }

  createCourseDraft(): void {
    this.state.lastActionMessage = 'Starter course draft prepared';
  }

  openPlanWizard(): void {
    this.state.lastActionMessage = 'Study plan wizard opened';
  }

  requestBlogDraft(): void {
    const course = this.selectedCourse;
    if (!course) return;
    this.state.lastActionMessage = `Blog Writer draft queued for ${course.title}`;
  }

  async loadWorkspace(): Promise<void> {
    this.state.loading = true;
    this.loader?.show();
    try {
      const sample = getSampleCourseTrackerData();
      this.state.courses = sample.courses;
      this.state.sessions = sample.sessions;
      this.state.notes = sample.notes;
      this.state.exports = sample.exports;
      this.state.timeline = sample.timeline;
      this.recalculateDashboardMetrics();
      this.applyFilters();
      if (!this.state.selectedCourseId && this.state.filteredCourses.length > 0) {
        this.state.selectedCourseId = this.state.filteredCourses[0].id;
      }
    } finally {
      this.state.loading = false;
      this.loader?.hide();
    }
  }

  private recalculateDashboardMetrics(): void {
    const { courses, sessions } = this.state;
    const today = new Date(this.state.todayIso);
    const startOfWeek = new Date(today);
    startOfWeek.setUTCHours(0, 0, 0, 0);
    startOfWeek.setUTCDate(today.getUTCDate() - today.getUTCDay());

    const minutesLoggedThisWeek = sessions
      .filter((session) => new Date(session.startedAt) >= startOfWeek)
      .reduce((total, session) => total + session.minutes, 0);

    const hoursPlanned = courses
      .flatMap((course) => course.plan.sessions)
      .filter((session) => session.status !== 'completed')
      .reduce((total, session) => total + this.sessionDuration(session) / 60, 0);

    const remindersDueToday = courses
      .flatMap((course) => course.reminders)
      .filter((reminder) => this.isReminderDueToday(reminder, today))
      .length;

    const bestStreak = courses.reduce((max, course) => Math.max(max, course.plan.longestStreak), 0);

    this.state.metrics = {
      totalCourses: courses.length,
      activeCourses: courses.filter((course) => course.status === 'active').length,
      planningCourses: courses.filter((course) => course.status === 'planning').length,
      hoursPlannedThisWeek: parseFloat(hoursPlanned.toFixed(1)),
      minutesLoggedThisWeek,
      bestStreak,
      remindersDueToday,
    };
  }

  get providers(): string[] {
    const collection = new Set<string>();
    this.state.courses.forEach((course) => collection.add(course.provider));
    return Array.from(collection).sort();
  }

  get focusAreas(): string[] {
    const collection = new Set<string>();
    this.state.courses.forEach((course) => collection.add(course.focusArea));
    return Array.from(collection).sort();
  }

  applyFilters(): void {
    const { courses, search, filters } = this.state;
    const query = search.trim().toLowerCase();
    const filtered = courses.filter((course) => {
      if (filters.status !== 'all' && course.status !== filters.status) return false;
      if (filters.provider !== 'all' && course.provider !== filters.provider) return false;
      if (filters.focus !== 'all' && course.focusArea !== filters.focus) return false;
      if (!query) return true;
      return [course.title, course.provider, course.focusArea, course.level]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });

    this.state.filteredCourses = filtered;
    if (filtered.length === 0) {
      this.state.selectedCourseId = null;
      return;
    }

    if (!this.state.selectedCourseId || !filtered.some((course) => course.id === this.state.selectedCourseId)) {
      this.state.selectedCourseId = filtered[0].id;
    }
  }

  setSearch(value: string): void {
    this.state.search = value;
    this.applyFilters();
  }

  setStatusFilter(value: StatusFilter): void {
    this.state.filters.status = value;
    this.applyFilters();
  }

  setProviderFilter(provider: string): void {
    this.state.filters.provider = provider;
    this.applyFilters();
  }

  setFocusFilter(focus: string): void {
    this.state.filters.focus = focus;
    this.applyFilters();
  }

  selectCourse(id: string): void {
    this.state.selectedCourseId = id;
    this.state.planView = 'week';
  }

  get selectedCourse(): CourseRecord | null {
    if (!this.state.selectedCourseId) return null;
    return this.state.courses.find((course) => course.id === this.state.selectedCourseId) ?? null;
  }

  get selectedCourseSessions(): StudySessionRecord[] {
    const course = this.selectedCourse;
    if (!course) return [];
    return this.state.sessions.filter((session) => session.courseId === course.id);
  }

  get selectedCourseTimeline(): CourseTimelineEvent[] {
    const course = this.selectedCourse;
    if (!course) return [];
    return this.state.timeline
      .filter((event) => event.courseId === course.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  get todaysPlan(): PlanSession[] {
    const course = this.selectedCourse;
    if (!course) return [];
    const todayLabel = this.weekdayLabel(new Date(this.state.todayIso));
    return course.plan.sessions.filter((session) => session.day === todayLabel);
  }

  get overdueLessons(): LessonRecord[] {
    const course = this.selectedCourse;
    if (!course) return [];
    const now = new Date(this.state.todayIso);
    return course.modules
      .flatMap((module) => module.lessons)
      .filter((lesson) => !lesson.completed && !!lesson.dueAt && new Date(lesson.dueAt) < now);
  }

  get suggestedNextLessons(): LessonRecord[] {
    const course = this.selectedCourse;
    if (!course) return [];
    return course.modules
      .flatMap((module) => module.lessons)
      .filter((lesson) => !lesson.completed)
      .slice(0, 3);
  }

  get selectedCourseNotes(): NoteRecord[] {
    const course = this.selectedCourse;
    if (!course) return [];
    return this.state.notes
      .filter((note) => note.courseId === course.id)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  get timerMinutes(): number {
    if (this.state.timer.running) {
      return Math.floor(this.calculateElapsedMinutes());
    }
    return Math.floor(this.state.timer.accumulatedMinutes);
  }

  get activeTimerLesson(): LessonRecord | null {
    if (!this.state.timer.lessonId) return null;
    const course = this.selectedCourse;
    if (!course) return null;
    return (
      course.modules
        .flatMap((module) => module.lessons)
        .find((lesson) => lesson.id === this.state.timer.lessonId) ?? null
    );
  }

  toggleReminder(reminderId: string): void {
    const course = this.selectedCourse;
    if (!course) return;
    const reminder = course.reminders.find((item) => item.id === reminderId);
    if (!reminder) return;
    reminder.active = !reminder.active;
    this.state.lastActionMessage = reminder.active
      ? `Reminder “${reminder.label}” turned on`
      : `Reminder “${reminder.label}” paused`;
    this.recalculateDashboardMetrics();
  }

  markLessonComplete(lessonId: string): void {
    const course = this.selectedCourse;
    if (!course) return;
    const lesson = course.modules.flatMap((module) => module.lessons).find((item) => item.id === lessonId);
    if (!lesson) return;
    lesson.completed = true;
    lesson.scheduledFor = null;
    course.metrics.completedLessons = course.modules
      .flatMap((module) => module.lessons)
      .filter((item) => item.completed).length;
    course.metrics.overdueLessons = course.modules
      .flatMap((module) => module.lessons)
      .filter((item) => !item.completed && item.dueAt && new Date(item.dueAt) < new Date(this.state.todayIso)).length;
    course.progressPct = Math.round((course.metrics.completedLessons / Math.max(course.metrics.totalLessons, 1)) * 100);
    this.state.lastActionMessage = 'Lesson marked complete';
  }

  setPlanView(view: PlanView): void {
    this.state.planView = view;
  }

  startTimer(lessonId: string): void {
    const now = Date.now();
    this.state.timer = {
      running: true,
      lessonId,
      startedAt: now,
      accumulatedMinutes: this.state.timer.lessonId === lessonId ? this.state.timer.accumulatedMinutes : 0,
    };
    this.state.lastActionMessage = 'Session timer started';
  }

  pauseTimer(): void {
    if (!this.state.timer.running || !this.state.timer.startedAt) return;
    const elapsedMinutes = this.calculateElapsedMinutes();
    this.state.timer = {
      running: false,
      lessonId: this.state.timer.lessonId,
      startedAt: null,
      accumulatedMinutes: elapsedMinutes,
    };
    this.state.lastActionMessage = 'Session paused';
  }

  stopTimer(logSession = true): void {
    if (!this.state.timer.lessonId) return;
    const elapsed = this.calculateElapsedMinutes();
    const lessonId = this.state.timer.lessonId;
    const course = this.selectedCourse;
    this.state.timer = { running: false, lessonId: null, startedAt: null, accumulatedMinutes: 0 };

    if (logSession && course) {
      const minutes = Math.max(5, Math.round(elapsed));
      const session: StudySessionRecord = {
        id: `session-${Date.now()}`,
        courseId: course.id,
        lessonId,
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        minutes,
        type: 'deep-work',
      };
      this.state.sessions.unshift(session);
      course.metrics.minutesLogged += minutes;
      course.metrics.minutesThisWeek += minutes;
      course.plan.streakDays += 1;
      if (course.plan.streakDays > course.plan.longestStreak) {
        course.plan.longestStreak = course.plan.streakDays;
      }
      this.state.lastActionMessage = `Logged ${minutes} minutes`; // update metrics
      this.recalculateDashboardMetrics();
    } else {
      this.state.lastActionMessage = 'Timer cleared';
    }
  }

  private calculateElapsedMinutes(): number {
    if (!this.state.timer.startedAt) return this.state.timer.accumulatedMinutes;
    const now = Date.now();
    const elapsedMs = now - this.state.timer.startedAt;
    const elapsedMinutes = elapsedMs / 60000;
    return this.state.timer.accumulatedMinutes + elapsedMinutes;
  }

  private sessionDuration(session: PlanSession): number {
    const [startHour, startMinute] = session.start.split(':').map(Number);
    const [endHour, endMinute] = session.end.split(':').map(Number);
    return (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
  }

  private isReminderDueToday(reminder: ReminderSetting, today: Date): boolean {
    if (!reminder.active) return false;
    if (reminder.cadence === 'Daily') return true;
    if (reminder.cadence === 'Weekly') return today.getUTCDay() === 1; // Monday default
    if (reminder.cadence === 'Biweekly') return today.getUTCDay() === 6; // Saturday pulse
    return false;
  }

  private weekdayLabel(date: Date): string {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getUTCDay()];
  }
}

if (!Alpine.store('course-tracker')) {
  Alpine.store('course-tracker', new CourseTrackerStore());
}

export type CourseTrackerStoreType = CourseTrackerStore;

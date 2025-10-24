import Alpine from 'alpinejs';
import { BaseStore } from '../base';
import {
  getSampleAiPlaybooks,
  getSampleInsights,
  getSampleLessons,
  getSampleModules,
  getSampleTimelineEvents,
} from '../../lib/lesson-builder/sample';
import { createLessonWorkspaceItem, lessonTemplates } from '../../lib/lesson-builder/schema';
import type {
  LessonAiActionKey,
  LessonAiPlaybook,
  LessonInsight,
  LessonModuleRecord,
  LessonPlanTier,
  LessonStatus,
  LessonTemplateKey,
  LessonTimelineEvent,
  LessonWorkspaceItem,
} from '../../types/lesson';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

type LessonTabKey = 'lessons' | 'modules';

type LessonSortKey = 'recent' | 'duration-asc' | 'duration-desc' | 'title';

type ModuleSortKey = 'recent' | 'lessons-desc' | 'lessons-asc';

const generateSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

class LessonBuilderStore extends BaseStore {
  state: {
    loading: boolean;
    plan: LessonPlanTier;
    tab: LessonTabKey;
    templates: typeof lessonTemplates;
    lessons: LessonWorkspaceItem[];
    filteredLessons: LessonWorkspaceItem[];
    modules: LessonModuleRecord[];
    filteredModules: LessonModuleRecord[];
    selectedLessonId: string | null;
    selectedModuleId: string | null;
    filters: {
      status: 'all' | LessonStatus;
      subject: 'all' | string;
      gradeBand: 'all' | string;
      sort: LessonSortKey;
    };
    moduleFilters: {
      status: 'all' | 'draft' | 'published';
      subject: 'all' | string;
      sort: ModuleSortKey;
    };
    search: string;
    moduleSearch: string;
    aiPlaybooks: LessonAiPlaybook[];
    aiUsage: { used: number; limit: number; unlimited: boolean };
    metrics: {
      totalLessons: number;
      totalModules: number;
      totalMinutes: number;
      publishedLessons: number;
      scheduledLessons: number;
      aiTokens: number;
    };
    timeline: LessonTimelineEvent[];
    insights: LessonInsight[];
    showPlanModal: boolean;
  } = {
    loading: false,
    plan: 'free',
    tab: 'lessons',
    templates: lessonTemplates,
    lessons: [],
    filteredLessons: [],
    modules: [],
    filteredModules: [],
    selectedLessonId: null,
    selectedModuleId: null,
    filters: {
      status: 'all',
      subject: 'all',
      gradeBand: 'all',
      sort: 'recent',
    },
    moduleFilters: {
      status: 'all',
      subject: 'all',
      sort: 'recent',
    },
    search: '',
    moduleSearch: '',
    aiPlaybooks: getSampleAiPlaybooks(),
    aiUsage: { used: 0, limit: 5, unlimited: false },
    metrics: {
      totalLessons: 0,
      totalModules: 0,
      totalMinutes: 0,
      publishedLessons: 0,
      scheduledLessons: 0,
      aiTokens: 0,
    },
    timeline: [],
    insights: [],
    showPlanModal: false,
  };

  private initialised = false;

  onInit(): void {
    this.initDashboard();
  }

  initDashboard(): void {
    this.ensureLoaded();
  }

  ensureLoaded(): void {
    if (this.initialised) return;
    this.initialised = true;
    void this.loadWorkspace();
  }

  async loadWorkspace(): Promise<void> {
    this.state.loading = true;
    this.loader?.show();
    try {
      const lessons = getSampleLessons();
      const modules = getSampleModules();
      const timeline = getSampleTimelineEvents();
      const insights = getSampleInsights();

      this.state.lessons = lessons.map((lesson) => clone(lesson));
      this.state.modules = modules.map((module) => clone(module));
      this.state.timeline = timeline.map((entry) => clone(entry));
      this.state.insights = insights.map((entry) => clone(entry));

      this.updateMetrics();
      this.recalculateAiUsage();
      this.applyFilters();
      this.applyModuleFilters();
    } finally {
      this.state.loading = false;
      this.loader?.hide();
    }
  }

  get selectedLesson(): LessonWorkspaceItem | null {
    if (!this.state.selectedLessonId) return null;
    return this.state.lessons.find((lesson) => lesson.id === this.state.selectedLessonId) ?? null;
  }

  get selectedModule(): LessonModuleRecord | null {
    if (!this.state.selectedModuleId) return null;
    return this.state.modules.find((module) => module.id === this.state.selectedModuleId) ?? null;
  }

  get subjects(): string[] {
    const collection = new Set<string>();
    this.state.lessons.forEach((lesson) => collection.add(lesson.subject));
    return Array.from(collection).sort();
  }

  get gradeBands(): string[] {
    const collection = new Set<string>();
    this.state.lessons.forEach((lesson) => collection.add(lesson.gradeBand));
    return Array.from(collection).sort();
  }

  get moduleSubjects(): string[] {
    const collection = new Set<string>();
    this.state.modules.forEach((module) => collection.add(module.subject));
    return Array.from(collection).sort();
  }

  switchTab(tab: LessonTabKey): void {
    this.state.tab = tab;
    if (tab === 'modules' && this.state.filteredModules.length === 0) {
      this.applyModuleFilters();
    }
  }

  setSearch(value: string): void {
    this.state.search = value;
    this.applyFilters();
  }

  setModuleSearch(value: string): void {
    this.state.moduleSearch = value;
    this.applyModuleFilters();
  }

  setFilter(key: keyof typeof this.state.filters, value: string): void {
    if (key === 'status') {
      this.state.filters.status = value as typeof this.state.filters.status;
    } else if (key === 'subject') {
      this.state.filters.subject = value as typeof this.state.filters.subject;
    } else if (key === 'gradeBand') {
      this.state.filters.gradeBand = value as typeof this.state.filters.gradeBand;
    } else if (key === 'sort') {
      this.state.filters.sort = value as LessonSortKey;
    }
    this.applyFilters();
  }

  setModuleFilter(key: keyof typeof this.state.moduleFilters, value: string): void {
    if (key === 'status') {
      this.state.moduleFilters.status = value as typeof this.state.moduleFilters.status;
    } else if (key === 'subject') {
      this.state.moduleFilters.subject = value as typeof this.state.moduleFilters.subject;
    } else if (key === 'sort') {
      this.state.moduleFilters.sort = value as ModuleSortKey;
    }
    this.applyModuleFilters();
  }

  applyFilters(): void {
    const { status, subject, gradeBand, sort } = this.state.filters;
    let collection = [...this.state.lessons];

    if (status !== 'all') {
      collection = collection.filter((lesson) => lesson.status === status);
    }
    if (subject !== 'all') {
      collection = collection.filter((lesson) => lesson.subject === subject);
    }
    if (gradeBand !== 'all') {
      collection = collection.filter((lesson) => lesson.gradeBand === gradeBand);
    }
    if (this.state.search.trim().length > 0) {
      const query = this.state.search.toLowerCase();
      collection = collection.filter((lesson) =>
        [lesson.title, lesson.subject, lesson.gradeBand, lesson.tags.join(' ')].some((value) =>
          value.toLowerCase().includes(query),
        ),
      );
    }

    if (sort === 'recent') {
      collection.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } else if (sort === 'duration-asc') {
      collection.sort((a, b) => a.duration - b.duration);
    } else if (sort === 'duration-desc') {
      collection.sort((a, b) => b.duration - a.duration);
    } else if (sort === 'title') {
      collection.sort((a, b) => a.title.localeCompare(b.title));
    }

    this.state.filteredLessons = collection;

    if (!collection.some((lesson) => lesson.id === this.state.selectedLessonId)) {
      this.state.selectedLessonId = collection.length > 0 ? collection[0].id : null;
    }
  }

  applyModuleFilters(): void {
    const { status, subject, sort } = this.state.moduleFilters;
    let collection = [...this.state.modules];

    if (status !== 'all') {
      collection = collection.filter((module) => module.status === status);
    }
    if (subject !== 'all') {
      collection = collection.filter((module) => module.subject === subject);
    }
    if (this.state.moduleSearch.trim().length > 0) {
      const query = this.state.moduleSearch.toLowerCase();
      collection = collection.filter((module) =>
        [module.title, module.subject, module.gradeBand].some((value) => value.toLowerCase().includes(query)),
      );
    }

    if (sort === 'recent') {
      collection.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } else if (sort === 'lessons-desc') {
      collection.sort((a, b) => b.lessonIds.length - a.lessonIds.length);
    } else if (sort === 'lessons-asc') {
      collection.sort((a, b) => a.lessonIds.length - b.lessonIds.length);
    }

    this.state.filteredModules = collection;

    if (!collection.some((module) => module.id === this.state.selectedModuleId)) {
      this.state.selectedModuleId = collection.length > 0 ? collection[0].id : null;
    }
  }

  selectLesson(id: string): void {
    this.state.selectedLessonId = id;
  }

  selectModule(id: string): void {
    this.state.selectedModuleId = id;
  }

  private nextLessonIndex(): number {
    return this.state.lessons.length + 1;
  }

  private hasReachedLessonLimit(): boolean {
    return this.state.plan === 'free' && this.state.lessons.length >= 10;
  }

  private hasReachedModuleLimit(): boolean {
    return this.state.plan === 'free' && this.state.modules.length >= 2;
  }

  createLesson(templateKey: LessonTemplateKey = 'blank'): void {
    const template = lessonTemplates.find((entry) => entry.key === templateKey);
    const definition = template ?? lessonTemplates[0];

    if (definition.plan === 'pro' && this.state.plan === 'free') {
      this.openPlanUpsell();
      return;
    }
    if (this.hasReachedLessonLimit()) {
      this.openPlanUpsell();
      return;
    }

    const timestamp = new Date().toISOString();
    const baseTitle = `${definition.label} ${this.nextLessonIndex()}`;
    const lesson = createLessonWorkspaceItem({
      title: baseTitle,
      slug: `${generateSlug(definition.label)}-${Date.now().toString(36).slice(-4)}`,
      subject: definition.subject === 'Any subject' ? 'Interdisciplinary' : definition.subject,
      gradeBand: definition.gradeBand === 'Flexible' ? 'Grades 6-8' : definition.gradeBand,
      templateKey: definition.key,
      plan: this.state.plan,
      createdAt: timestamp,
      updatedAt: timestamp,
      duration: definition.recommendedDuration,
      analytics: {
        exports: 0,
        aiRuns: 0,
        learnersImpacted: 0,
        notes: 'New draft ready for outline generation.',
      },
      aiUsage: {
        outline: false,
        objectives: false,
        activities: false,
        materials: false,
        quiz: false,
        translation: false,
        tokensUsed: 0,
        lastRunAt: null,
      },
      schedule: {
        targetDate: null,
        pacing: 'single',
        totalMinutes: definition.recommendedDuration,
        calendarExported: false,
      },
      quiz: {
        quizId: null,
        title: null,
        status: 'not-linked',
        questionCount: 0,
        lastSyncedAt: null,
      },
      timelineStatus: 'on-track',
    });

    this.state.lessons.unshift(lesson);
    this.updateMetrics();
    this.applyFilters();
    this.state.selectedLessonId = lesson.id;
  }

  duplicateLesson(id: string): void {
    const existing = this.state.lessons.find((lesson) => lesson.id === id);
    if (!existing) return;
    if (this.hasReachedLessonLimit()) {
      this.openPlanUpsell();
      return;
    }

    const copy = createLessonWorkspaceItem({
      ...clone(existing),
      id: crypto.randomUUID(),
      title: `${existing.title} (Copy)`,
      slug: `${existing.slug}-copy-${Date.now().toString(36).slice(-3)}`,
      status: 'draft',
      aiUsage: {
        ...existing.aiUsage,
        lastRunAt: null,
      },
      analytics: {
        ...existing.analytics,
        exports: 0,
        aiRuns: 0,
        notes: 'Duplicated from existing lesson.',
      },
      schedule: {
        ...existing.schedule,
        targetDate: null,
        calendarExported: false,
      },
      quiz: {
        quizId: null,
        title: null,
        status: 'not-linked',
        questionCount: 0,
        lastSyncedAt: null,
      },
    });

    this.state.lessons.unshift(copy);
    this.updateMetrics();
    this.applyFilters();
    this.state.selectedLessonId = copy.id;
  }

  deleteLesson(id: string): void {
    this.state.lessons = this.state.lessons.filter((lesson) => lesson.id !== id);
    this.state.filteredLessons = this.state.filteredLessons.filter((lesson) => lesson.id !== id);
    if (this.state.selectedLessonId === id) {
      this.state.selectedLessonId = this.state.filteredLessons.length > 0 ? this.state.filteredLessons[0].id : null;
    }
    this.state.modules = this.state.modules.map((module) => ({
      ...module,
      lessonIds: module.lessonIds.filter((lessonId) => lessonId !== id),
      sequence: module.sequence.filter((item) => item.lessonId !== id),
    }));
    this.applyModuleFilters();
    this.updateMetrics();
  }

  publishLesson(id: string): void {
    const lesson = this.state.lessons.find((item) => item.id === id);
    if (!lesson) return;
    lesson.status = 'published';
    lesson.updatedAt = new Date().toISOString();
    lesson.timelineStatus = 'completed';
    this.updateMetrics();
    this.applyFilters();
  }

  scheduleLesson(id: string, targetDate: string): void {
    const lesson = this.state.lessons.find((item) => item.id === id);
    if (!lesson) return;
    lesson.status = 'scheduled';
    lesson.schedule.targetDate = targetDate;
    lesson.timelineStatus = 'on-track';
    lesson.updatedAt = new Date().toISOString();
    this.updateMetrics();
    this.applyFilters();
  }

  linkQuiz(id: string, quizId: string, quizTitle: string): void {
    const lesson = this.state.lessons.find((item) => item.id === id);
    if (!lesson) return;
    lesson.quiz = {
      quizId,
      title: quizTitle,
      status: 'linked',
      questionCount: lesson.quiz.questionCount || 5,
      lastSyncedAt: new Date().toISOString(),
    };
    lesson.updatedAt = new Date().toISOString();
  }

  generateQuiz(id: string): void {
    const lesson = this.state.lessons.find((item) => item.id === id);
    if (!lesson) return;
    if (this.state.plan === 'free') {
      this.openPlanUpsell();
      return;
    }
    lesson.quiz = {
      quizId: `quiz-${lesson.slug}`,
      title: `${lesson.title} — Draft Quiz`,
      status: 'generated',
      questionCount: Math.max(lesson.quiz.questionCount, 6),
      lastSyncedAt: new Date().toISOString(),
    };
    lesson.aiUsage.quiz = true;
    this.recalculateAiUsage();
  }

  runAi(action: LessonAiActionKey): void {
    const playbook = this.state.aiPlaybooks.find((entry) => entry.key === action);
    if (!playbook) return;
    if (playbook.plan === 'pro' && this.state.plan === 'free') {
      this.openPlanUpsell();
      return;
    }
    if (!this.state.aiUsage.unlimited && this.state.aiUsage.used >= this.state.aiUsage.limit) {
      this.openPlanUpsell();
      return;
    }

    const lesson = this.selectedLesson;
    if (!lesson) return;

    const now = new Date().toISOString();
    const increment = 900;

    lesson.aiUsage = {
      ...lesson.aiUsage,
      [action]: true,
      tokensUsed: lesson.aiUsage.tokensUsed + increment,
      lastRunAt: now,
    } as LessonWorkspaceItem['aiUsage'];
    lesson.analytics.aiRuns += 1;
    lesson.updatedAt = now;

    this.state.metrics.aiTokens += increment;
    this.state.aiUsage.used += 1;

    this.state.insights.unshift({
      id: `insight-ai-${action}-${Date.now()}`,
      message: `AI ${playbook.title} completed for ${lesson.title}. Review suggestions in the editor.`,
      type: 'success',
      icon: 'fas fa-wand-magic-sparkles',
      timestamp: 'Just now',
    });
  }

  openLessonEditor(id?: string): void {
    const targetId = id ?? this.state.selectedLessonId;
    if (!targetId) return;
    window.location.assign(`/lesson/editor?id=${targetId}`);
  }

  openModuleBuilder(id?: string): void {
    const targetId = id ?? this.state.selectedModuleId;
    if (!targetId) return;
    window.location.assign(`/lesson/module?id=${targetId}`);
  }

  openTemplates(): void {
    window.location.assign('/lesson/templates');
  }

  private recalculateAiUsage(): void {
    const used = this.state.lessons.reduce((count, lesson) => {
      const flags = [
        lesson.aiUsage.outline,
        lesson.aiUsage.objectives,
        lesson.aiUsage.activities,
        lesson.aiUsage.materials,
        lesson.aiUsage.quiz,
        lesson.aiUsage.translation,
      ];
      return count + flags.filter(Boolean).length;
    }, 0);

    const tokens = this.state.lessons.reduce((sum, lesson) => sum + lesson.aiUsage.tokensUsed, 0);

    this.state.aiUsage.used = used;
    this.state.aiUsage.unlimited = this.state.plan === 'pro';
    this.state.aiUsage.limit = this.state.plan === 'pro' ? 9999 : 5;
    this.state.metrics.aiTokens = tokens;
  }

  private updateMetrics(): void {
    const totalMinutes = this.state.lessons.reduce((sum, lesson) => sum + lesson.duration, 0);
    const published = this.state.lessons.filter((lesson) => lesson.status === 'published').length;
    const scheduled = this.state.lessons.filter((lesson) => lesson.status === 'scheduled').length;

    this.state.metrics = {
      totalLessons: this.state.lessons.length,
      totalModules: this.state.modules.length,
      totalMinutes,
      publishedLessons: published,
      scheduledLessons: scheduled,
      aiTokens: this.state.metrics.aiTokens,
    };
  }

  formatDate(value: string | null): string {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return value;
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  }

  formatTimeAgo(value: string | null): string {
    if (!value) return 'Not run yet';
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return value;
    const diff = Date.now() - date.getTime();
    const minutes = Math.round(diff / 60000);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.round(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  formatMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    if (hours === 0) return `${minutes} min`;
    if (remainder === 0) return `${hours} hr`;
    return `${hours} hr ${remainder} min`;
  }

  openPlanUpsell(): void {
    this.state.showPlanModal = true;
  }

  closePlanUpsell(): void {
    this.state.showPlanModal = false;
  }

  upgradeToPro(): void {
    this.state.plan = 'pro';
    this.state.showPlanModal = false;
    this.recalculateAiUsage();
  }
}

const store = new LessonBuilderStore();
Alpine.store('lesson-builder', store);
Alpine.store('lessonBuilder', store);

export type LessonBuilderStoreType = LessonBuilderStore;

import Alpine from 'alpinejs';
import { actions } from 'astro:actions';
import type { LoaderStore } from '../loader';

type QuestionRecord = {
  id: number;
  platformId: number;
  subjectId: number;
  topicId: number;
  roadmapId: number | null;
  questionText: string;
  options: string[];
  answer: string | null;
  answerKey: string;
  explanation: string;
  level: string;
  isActive: boolean;
  platformName: string | null;
  subjectName: string | null;
  topicName: string | null;
  roadmapName: string | null;
};

type PlatformOption = {
  id: number;
  name: string;
};

type SubjectOption = {
  id: number;
  name: string;
  platformId: number;
};

type TopicOption = {
  id: number;
  name: string;
  platformId: number;
  subjectId: number;
};

type RoadmapOption = {
  id: number;
  name: string;
  platformId: number;
  subjectId: number;
  topicId: number;
};

type QuestionForm = {
  platformId: string;
  subjectId: string;
  topicId: string;
  roadmapId: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number | null;
  explanation: string;
  level: string;
  isActive: boolean;
};

type QuestionFilters = {
  questionText: string;
  platformId: string;
  subjectId: string;
  topicId: string;
  roadmapId: string;
  level: string;
  status: 'all' | 'active' | 'inactive';
};

type QuestionFiltersPayload = {
  questionText?: string;
  platformId?: number;
  subjectId?: number;
  topicId?: number;
  roadmapId?: number;
  level?: string;
  status?: 'active' | 'inactive';
};

type QuestionSortColumn =
  | 'questionText'
  | 'level'
  | 'platformName'
  | 'subjectName'
  | 'topicName'
  | 'roadmapName'
  | 'platformId'
  | 'subjectId'
  | 'topicId'
  | 'roadmapId'
  | 'status'
  | 'id';

type SortState = {
  column: QuestionSortColumn;
  direction: 'asc' | 'desc';
};

const parseNumber = (value: string): number | null => {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
    return null;
  }
  const floored = Math.floor(parsed);
  return floored > 0 ? floored : null;
};

class QuestionsStoreImpl {
  questions: QuestionRecord[] = [];
  loading = false;
  error: string | null = null;
  page = 1;
  pageSize = 10;
  totalItems = 0;
  mutating = false;
  form: QuestionForm;
  editingId: number | null = null;
  modalMode: 'create' | 'edit' = 'create';
  showModal = false;
  filters: QuestionFilters;
  sort: SortState | null = null;
  private filterDebounce: ReturnType<typeof setTimeout> | null = null;
  private readonly allowedSortColumns: QuestionSortColumn[] = [
    'questionText',
    'level',
    'platformName',
    'subjectName',
    'topicName',
    'roadmapName',
    'platformId',
    'subjectId',
    'topicId',
    'roadmapId',
    'status',
    'id',
  ];
  platformOptions: PlatformOption[] = [];
  private platformOptionsLoaded = false;
  private subjectOptionsCache = new Map<number, SubjectOption[]>();
  private topicOptionsCache = new Map<number, TopicOption[]>();
  private roadmapOptionsCache = new Map<number, RoadmapOption[]>();
  private filterPlatformOptionsLoaded = false;
  private filterSubjectOptionsCache = new Map<number, SubjectOption[]>();
  private filterTopicOptionsCache = new Map<number, TopicOption[]>();
  private filterRoadmapOptionsCache = new Map<number, RoadmapOption[]>();
  private readonly loader: LoaderStore;

  constructor() {
    this.loader = Alpine.store('loader') as LoaderStore;
    this.form = this.createDefaultForm();
    this.filters = this.createDefaultFilters();
  }

  get platformOptionList(): PlatformOption[] {
    return this.platformOptions;
  }

  get subjectOptionList(): SubjectOption[] {
    const platformId = parseNumber(this.form.platformId.trim());
    if (!platformId) {
      return [];
    }
    return this.subjectOptionsCache.get(platformId) ?? [];
  }

  get filterPlatformOptions(): PlatformOption[] {
    return this.platformOptions;
  }

  get filterSubjectOptions(): SubjectOption[] {
    const platformId = parseNumber(this.filters.platformId.trim());
    if (!platformId) {
      return [];
    }
    return this.filterSubjectOptionsCache.get(platformId) ?? [];
  }

  get filterTopicOptions(): TopicOption[] {
    const subjectId = parseNumber(this.filters.subjectId.trim());
    if (!subjectId) {
      return [];
    }
    return this.filterTopicOptionsCache.get(subjectId) ?? [];
  }

  get filterRoadmapOptions(): RoadmapOption[] {
    const topicId = parseNumber(this.filters.topicId.trim());
    if (!topicId) {
      return [];
    }
    return this.filterRoadmapOptionsCache.get(topicId) ?? [];
  }

  get topicOptionList(): TopicOption[] {
    const subjectId = parseNumber(this.form.subjectId.trim());
    if (!subjectId) {
      return [];
    }
    return this.topicOptionsCache.get(subjectId) ?? [];
  }

  get roadmapOptionList(): RoadmapOption[] {
    const topicId = parseNumber(this.form.topicId.trim());
    if (!topicId) {
      return [];
    }
    return this.roadmapOptionsCache.get(topicId) ?? [];
  }

  private normalizeOptionName(id: number, name: unknown, fallback: string): string {
    if (typeof name === 'string') {
      const trimmed = name.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
    return `${fallback} #${id}`;
  }

  private async ensurePlatformOptions(): Promise<void> {
    if (this.platformOptionsLoaded && this.platformOptions.length > 0) {
      return;
    }
    try {
      const collected: PlatformOption[] = [];
      const pageSize = 48;
      let page = 1;
      let total = 0;
      while (page <= 100) {
        const { data, error } = await actions.quiz.fetchPlatforms({
          page,
          pageSize,
          filters: { status: 'all' },
        });
        if (error) {
          throw error;
        }
        const payload = data ?? { items: [], total: 0 };
        const items = Array.isArray(payload.items) ? payload.items : [];
        collected.push(
          ...items.map((item: any) => ({
            id: Number(item.id),
            name: this.normalizeOptionName(Number(item.id), item.name, 'Platform'),
          })),
        );
        const rawTotal = payload.total;
        total =
          typeof rawTotal === 'number'
            ? rawTotal
            : typeof rawTotal === 'bigint'
              ? Number(rawTotal)
              : collected.length;
        if (collected.length >= total || items.length < pageSize) {
          break;
        }
        page += 1;
      }
      this.platformOptions = collected;
      this.platformOptionsLoaded = true;
    } catch (err) {
      console.error('Failed to load platform options', err);
      this.platformOptions = [];
      this.platformOptionsLoaded = false;
    }
  }

  private async ensureSubjectOptions(platformId: number): Promise<void> {
    if (this.subjectOptionsCache.has(platformId)) {
      return;
    }
    try {
      const collected: SubjectOption[] = [];
      const pageSize = 48;
      let page = 1;
      let total = 0;
      while (page <= 100) {
        const { data, error } = await actions.quiz.fetchSubjects({
          page,
          pageSize,
          filters: { platformId, status: 'all' },
        });
        if (error) {
          throw error;
        }
        const payload = data ?? { items: [], total: 0 };
        const items = Array.isArray(payload.items) ? payload.items : [];
        collected.push(
          ...items.map((item: any) => ({
            id: Number(item.id),
            name: this.normalizeOptionName(Number(item.id), item.name, 'Subject'),
            platformId: Number(item.platformId),
          })),
        );
        const rawTotal = payload.total;
        total =
          typeof rawTotal === 'number'
            ? rawTotal
            : typeof rawTotal === 'bigint'
              ? Number(rawTotal)
              : collected.length;
        if (collected.length >= total || items.length < pageSize) {
          break;
        }
        page += 1;
      }
      this.subjectOptionsCache.set(platformId, collected);
      if (
        this.form.subjectId &&
        !collected.some((option) => String(option.id) === this.form.subjectId.trim())
      ) {
        this.form.subjectId = '';
      }
    } catch (err) {
      console.error('Failed to load subject options', err);
      this.subjectOptionsCache.delete(platformId);
      this.form.subjectId = '';
    }
  }

  private async ensureTopicOptions(platformId: number, subjectId: number): Promise<void> {
    if (this.topicOptionsCache.has(subjectId)) {
      return;
    }
    try {
      const collected: TopicOption[] = [];
      const pageSize = 48;
      let page = 1;
      let total = 0;
      while (page <= 100) {
        const { data, error } = await actions.quiz.fetchTopics({
          page,
          pageSize,
          filters: { platformId, subjectId, status: 'all' },
        });
        if (error) {
          throw error;
        }
        const payload = data ?? { items: [], total: 0 };
        const items = Array.isArray(payload.items) ? payload.items : [];
        collected.push(
          ...items.map((item: any) => ({
            id: Number(item.id),
            name: this.normalizeOptionName(Number(item.id), item.name, 'Topic'),
            platformId: Number(item.platformId),
            subjectId: Number(item.subjectId),
          })),
        );
        const rawTotal = payload.total;
        total =
          typeof rawTotal === 'number'
            ? rawTotal
            : typeof rawTotal === 'bigint'
              ? Number(rawTotal)
              : collected.length;
        if (collected.length >= total || items.length < pageSize) {
          break;
        }
        page += 1;
      }
      this.topicOptionsCache.set(subjectId, collected);
      if (
        this.form.topicId &&
        !collected.some((option) => String(option.id) === this.form.topicId.trim())
      ) {
        this.form.topicId = '';
      }
    } catch (err) {
      console.error('Failed to load topic options', err);
      this.topicOptionsCache.delete(subjectId);
      this.form.topicId = '';
    }
  }

  private async ensureRoadmapOptions(platformId: number, subjectId: number, topicId: number): Promise<void> {
    if (this.roadmapOptionsCache.has(topicId)) {
      return;
    }
    try {
      const collected: RoadmapOption[] = [];
      const pageSize = 48;
      let page = 1;
      let total = 0;
      while (page <= 100) {
        const { data, error } = await actions.quiz.fetchRoadmaps({
          page,
          pageSize,
          filters: { platformId, subjectId, topicId, status: 'all' },
        });
        if (error) {
          throw error;
        }
        const payload = data ?? { items: [], total: 0 };
        const items = Array.isArray(payload.items) ? payload.items : [];
        collected.push(
          ...items.map((item: any) => ({
            id: Number(item.id),
            name: this.normalizeOptionName(Number(item.id), item.name, 'Roadmap'),
            platformId: Number(item.platformId),
            subjectId: Number(item.subjectId),
            topicId: Number(item.topicId),
          })),
        );
        const rawTotal = payload.total;
        total =
          typeof rawTotal === 'number'
            ? rawTotal
            : typeof rawTotal === 'bigint'
              ? Number(rawTotal)
              : collected.length;
        if (collected.length >= total || items.length < pageSize) {
          break;
        }
        page += 1;
      }
      this.roadmapOptionsCache.set(topicId, collected);
      if (
        this.form.roadmapId &&
        !collected.some((option) => String(option.id) === this.form.roadmapId.trim())
      ) {
        this.form.roadmapId = '';
      }
    } catch (err) {
      console.error('Failed to load roadmap options', err);
      this.roadmapOptionsCache.delete(topicId);
      this.form.roadmapId = '';
    }
  }

  async onPlatformChange(): Promise<void> {
    const platformId = parseNumber(this.form.platformId.trim());
    this.form.subjectId = '';
    this.form.topicId = '';
    this.form.roadmapId = '';
    if (!platformId) {
      return;
    }
    await this.ensureSubjectOptions(platformId);
  }

  async onSubjectChange(): Promise<void> {
    const platformId = parseNumber(this.form.platformId.trim());
    const subjectId = parseNumber(this.form.subjectId.trim());
    this.form.topicId = '';
    this.form.roadmapId = '';
    if (!platformId || !subjectId) {
      return;
    }
    await this.ensureTopicOptions(platformId, subjectId);
  }

  async onTopicChange(): Promise<void> {
    const platformId = parseNumber(this.form.platformId.trim());
    const subjectId = parseNumber(this.form.subjectId.trim());
    const topicId = parseNumber(this.form.topicId.trim());
    this.form.roadmapId = '';
    if (!platformId || !subjectId || !topicId) {
      return;
    }
    await this.ensureRoadmapOptions(platformId, subjectId, topicId);
  }

  private async ensureFilterPlatformOptions(): Promise<void> {
    if (this.filterPlatformOptionsLoaded && this.platformOptions.length > 0) {
      return;
    }
    await this.ensurePlatformOptions();
    this.filterPlatformOptionsLoaded = this.platformOptions.length > 0;
  }

  private async ensureFilterSubjectOptions(platformId: number): Promise<void> {
    if (this.filterSubjectOptionsCache.has(platformId)) {
      return;
    }
    await this.ensureSubjectOptions(platformId);
    this.filterSubjectOptionsCache.set(platformId, this.subjectOptionsCache.get(platformId) ?? []);
  }

  private async ensureFilterTopicOptions(platformId: number, subjectId: number): Promise<void> {
    if (this.filterTopicOptionsCache.has(subjectId)) {
      return;
    }
    await this.ensureTopicOptions(platformId, subjectId);
    this.filterTopicOptionsCache.set(subjectId, this.topicOptionsCache.get(subjectId) ?? []);
  }

  private async ensureFilterRoadmapOptions(platformId: number, subjectId: number, topicId: number): Promise<void> {
    if (this.filterRoadmapOptionsCache.has(topicId)) {
      return;
    }
    await this.ensureRoadmapOptions(platformId, subjectId, topicId);
    this.filterRoadmapOptionsCache.set(topicId, this.roadmapOptionsCache.get(topicId) ?? []);
  }

  async onFilterPlatformChange(): Promise<void> {
    const platformId = parseNumber(this.filters.platformId.trim());
    this.filters.subjectId = '';
    this.filters.topicId = '';
    this.filters.roadmapId = '';
    if (!platformId) {
      this.onFilterChange();
      return;
    }
    await this.ensureFilterSubjectOptions(platformId);
    this.onFilterChange();
  }

  async onFilterSubjectChange(): Promise<void> {
    const platformId = parseNumber(this.filters.platformId.trim());
    const subjectId = parseNumber(this.filters.subjectId.trim());
    this.filters.topicId = '';
    this.filters.roadmapId = '';
    if (!platformId || !subjectId) {
      this.onFilterChange();
      return;
    }
    await this.ensureFilterTopicOptions(platformId, subjectId);
    this.onFilterChange();
  }

  async onFilterTopicChange(): Promise<void> {
    const platformId = parseNumber(this.filters.platformId.trim());
    const subjectId = parseNumber(this.filters.subjectId.trim());
    const topicId = parseNumber(this.filters.topicId.trim());
    this.filters.roadmapId = '';
    if (!platformId || !subjectId || !topicId) {
      this.onFilterChange();
      return;
    }
    await this.ensureFilterRoadmapOptions(platformId, subjectId, topicId);
    this.onFilterChange();
  }

  get totalPages(): number {
    return this.totalItems === 0 ? 0 : Math.ceil(this.totalItems / this.pageSize);
  }

  get pageNumbers(): (number | string)[] {
    const totalPages = this.totalPages;
    if (totalPages <= 0) {
      return [];
    }
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const current = Math.min(Math.max(1, this.page), totalPages);

    let numbers: number[];
    if (current <= 2) {
      numbers = [1, 2, totalPages];
    } else if (current >= totalPages - 1) {
      numbers = [1, totalPages - 1, totalPages];
    } else {
      numbers = [1, current, totalPages];
    }

    const uniqueNumbers = Array.from(new Set(numbers.filter((value) => value >= 1 && value <= totalPages))).sort(
      (a, b) => a - b,
    );

    const items: (number | string)[] = [];
    let previous: number | null = null;
    for (const value of uniqueNumbers) {
      if (previous !== null && value - previous > 1) {
        items.push(`ellipsis-${previous}-${value}`);
      }
      items.push(value);
      previous = value;
    }

    return items;
  }

  get isEditMode(): boolean {
    return this.modalMode === 'edit';
  }

  get hasActiveFilters(): boolean {
    return Object.keys(this.buildFiltersPayload()).length > 0;
  }

  async onInit(): Promise<void> {
    await this.ensureFilterPlatformOptions();
    const initialPlatformId = parseNumber(this.filters.platformId.trim());
    if (initialPlatformId) {
      await this.ensureFilterSubjectOptions(initialPlatformId);
      const initialSubjectId = parseNumber(this.filters.subjectId.trim());
      if (initialPlatformId && initialSubjectId) {
        await this.ensureFilterTopicOptions(initialPlatformId, initialSubjectId);
        const initialTopicId = parseNumber(this.filters.topicId.trim());
        if (initialPlatformId && initialSubjectId && initialTopicId) {
          await this.ensureFilterRoadmapOptions(initialPlatformId, initialSubjectId, initialTopicId);
        }
      }
    }
    await this.loadQuestions(1);
  }

  async loadQuestions(page = this.page): Promise<void> {
    this.setLoading(true);
    this.error = null;

    try {
      const filtersPayload = this.buildFiltersPayload();
      const { data, error } = await actions.quiz.fetchQuestions({
        page,
        pageSize: this.pageSize,
        filters: filtersPayload,
        sort: this.sort ?? undefined,
      });
      if (error) {
        throw error;
      }
      const payload = data ?? { items: [], total: 0, page: 1, pageSize: this.pageSize };
      this.questions = Array.isArray(payload.items) ? (payload.items as QuestionRecord[]) : [];
      const totalValue = payload.total;
      this.totalItems =
        typeof totalValue === 'number'
          ? totalValue
          : typeof totalValue === 'bigint'
            ? Number(totalValue)
            : this.questions.length;
      this.page = typeof payload.page === 'number' ? payload.page : page;
      this.pageSize = typeof payload.pageSize === 'number' ? payload.pageSize : this.pageSize;
      if (this.totalItems === 0) {
        this.page = 1;
      }
    } catch (err) {
      console.error('Failed to load quiz questions', err);
      this.error = err instanceof Error ? err.message : 'Unable to load questions.';
      this.questions = [];
      this.totalItems = 0;
      this.page = 1;
      this.closeModal(true);
    } finally {
      this.setLoading(false);
    }
  }

  async setSort(column: QuestionSortColumn): Promise<void> {
    if (!this.allowedSortColumns.includes(column)) {
      return;
    }

    const current = this.sort;
    let direction: SortState['direction'] = 'asc';
    if (current?.column === column) {
      direction = current.direction === 'asc' ? 'desc' : 'asc';
    }

    this.sort = { column, direction };
    this.page = 1;
    await this.loadQuestions(1);
  }

  async setPage(page: number): Promise<void> {
    if (!Number.isFinite(page) || page <= 0) return;
    const parsed = Math.floor(page);
    if (parsed === this.page) {
      return;
    }
    this.page = parsed;
    await this.loadQuestions(parsed);
  }

  async setPageSize(size: number): Promise<void> {
    if (!Number.isFinite(size) || size <= 0) return;
    const parsed = Math.floor(size);
    if (parsed === this.pageSize) {
      return;
    }
    this.pageSize = parsed;
    this.page = 1;
    await this.loadQuestions(1);
  }

  async nextPage(): Promise<void> {
    if (this.page >= this.totalPages) return;
    await this.setPage(this.page + 1);
  }

  async firstPage(): Promise<void> {
    if (this.page <= 1) {
      return;
    }
    await this.setPage(1);
  }

  async lastPage(): Promise<void> {
    const totalPages = this.totalPages;
    if (totalPages <= 0 || this.page >= totalPages) {
      return;
    }
    await this.setPage(totalPages);
  }

  async prevPage(): Promise<void> {
    if (this.page <= 1) return;
    await this.setPage(this.page - 1);
  }

  onFilterChange(): void {
    if (this.filterDebounce) {
      clearTimeout(this.filterDebounce);
    }
    this.filterDebounce = setTimeout(() => {
      this.filterDebounce = null;
      this.page = 1;
      void this.loadQuestions(1);
    }, 400);
  }

  clearFilters(): void {
    if (this.filterDebounce) {
      clearTimeout(this.filterDebounce);
      this.filterDebounce = null;
    }
    this.filters = this.createDefaultFilters();
    this.page = 1;
    void this.loadQuestions(1);
  }

  async openCreateModal(): Promise<void> {
    this.error = null;
    this.modalMode = 'create';
    this.editingId = null;
    this.resetForm();
    await this.ensurePlatformOptions();
    this.showModal = true;
  }

  async openEditModal(question: QuestionRecord): Promise<void> {
    this.error = null;
    this.modalMode = 'edit';
    this.editingId = question.id;
    const existingOptions = Array.isArray(question.options) ? [...question.options] : [];
    while (existingOptions.length < 4) {
      existingOptions.push('');
    }
    if (existingOptions.length > 4) {
      existingOptions.length = 4;
    }

    this.form = {
      platformId: String(question.platformId ?? ''),
      subjectId: String(question.subjectId ?? ''),
      topicId: String(question.topicId ?? ''),
      roadmapId: typeof question.roadmapId === 'number' ? String(question.roadmapId) : '',
      questionText: question.questionText ?? '',
      options: existingOptions.map((option) => option ?? ''),
      correctOptionIndex:
        typeof question.answer === 'string'
          ? (() => {
              const answerValue = question.answer?.trim() ?? '';
              if (!answerValue) return null;
              const matchIndex = existingOptions.findIndex((option) => (option ?? '').trim() === answerValue);
              if (matchIndex >= 0) {
                return matchIndex;
              }
              const numericKey = Number.parseInt(question.answerKey, 10);
              if (!Number.isNaN(numericKey) && numericKey >= 0 && numericKey < existingOptions.length) {
                return numericKey;
              }
              const zeroBased = numericKey - 1;
              if (!Number.isNaN(zeroBased) && zeroBased >= 0 && zeroBased < existingOptions.length) {
                return zeroBased;
              }
              return null;
            })()
          : null,
      explanation: question.explanation ?? '',
      level: question.level ?? '',
      isActive: question.isActive,
    };
    await this.ensurePlatformOptions();
    const platformId = parseNumber(this.form.platformId.trim());
    if (platformId) {
      await this.ensureSubjectOptions(platformId);
    }
    const subjectId = parseNumber(this.form.subjectId.trim());
    if (platformId && subjectId) {
      await this.ensureTopicOptions(platformId, subjectId);
    }
    const topicId = parseNumber(this.form.topicId.trim());
    if (platformId && subjectId && topicId) {
      await this.ensureRoadmapOptions(platformId, subjectId, topicId);
    }
    this.showModal = true;
  }

  closeModal(force = false): void {
    if (this.mutating && !force) return;
    this.showModal = false;
    this.editingId = null;
    this.modalMode = 'create';
    this.resetForm();
  }

  async submitModal(): Promise<void> {
    if (this.isEditMode) {
      await this.saveEdit();
    } else {
      await this.createQuestion();
    }
  }

  private async createQuestion(): Promise<void> {
    if (this.mutating) return;

    let payload: ReturnType<QuestionsStoreImpl['buildPayload']>;
    try {
      payload = this.buildPayload(this.form);
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Unable to create question.';
      return;
    }

    this.mutating = true;
    try {
      const { error } = await actions.quiz.createQuestion(payload);
      if (error) {
        throw error;
      }
      this.resetForm();
      await this.loadQuestions(this.page);
      this.closeModal(true);
    } catch (err) {
      console.error('Failed to create quiz question', err);
      this.error = err instanceof Error ? err.message : 'Unable to create question.';
    } finally {
      this.mutating = false;
    }
  }

  private async saveEdit(): Promise<void> {
    if (this.editingId === null || this.mutating) return;

    let payload: ReturnType<QuestionsStoreImpl['buildPayload']>;
    try {
      payload = this.buildPayload(this.form);
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Unable to update question.';
      return;
    }

    this.mutating = true;
    try {
      const { data, error } = await actions.quiz.updateQuestion({
        id: this.editingId,
        ...payload,
      });
      if (error) {
        throw error;
      }

      const updated = data as QuestionRecord | null | undefined;

      if (updated && typeof updated.id === 'number') {
        const idx = this.questions.findIndex((item) => item.id === updated.id);
        if (idx !== -1) {
          this.questions.splice(idx, 1, updated);
        } else {
          await this.loadQuestions(this.page);
        }
      } else {
        await this.loadQuestions(this.page);
      }

      this.closeModal(true);
    } catch (err) {
      console.error('Failed to update quiz question', err);
      this.error = err instanceof Error ? err.message : 'Unable to update question.';
    } finally {
      this.mutating = false;
    }
  }

  async deleteQuestion(id: number): Promise<void> {
    if (this.mutating) return;
    if (typeof window !== 'undefined' && !window.confirm('Delete this question?')) {
      return;
    }

    this.mutating = true;
    try {
      const { error } = await actions.quiz.deleteQuestion({ id });
      if (error) {
        throw error;
      }
      if (this.editingId === id) {
        this.closeModal(true);
      }
      await this.loadQuestions(this.page);
    } catch (err) {
      console.error('Failed to delete quiz question', err);
      this.error = err instanceof Error ? err.message : 'Unable to delete question.';
    } finally {
      this.mutating = false;
    }
  }

  private resetForm(): void {
    this.form = this.createDefaultForm();
  }

  private setLoading(state: boolean): void {
    this.loading = state;
    const loader = this.loader;
    if (loader && typeof loader.show === 'function' && typeof loader.hide === 'function') {
      if (state) {
        loader.show();
      } else {
        loader.hide();
      }
    }
  }

  private createDefaultForm(): QuestionForm {
    return {
      platformId: '',
      subjectId: '',
      topicId: '',
      roadmapId: '',
      questionText: '',
      options: Array.from({ length: 4 }, () => ''),
      correctOptionIndex: null,
      explanation: '',
      level: '',
      isActive: true,
    };
  }

  private createDefaultFilters(): QuestionFilters {
    return {
      questionText: '',
      platformId: '',
      subjectId: '',
      topicId: '',
      roadmapId: '',
      level: '',
      status: 'all',
    };
  }

  private buildPayload(form: QuestionForm) {
    const platformIdValue = parseNumber(form.platformId.trim());
    const subjectIdValue = parseNumber(form.subjectId.trim());
    const topicIdValue = parseNumber(form.topicId.trim());

    const questionText = form.questionText.trim();

    if (!platformIdValue || !subjectIdValue || !topicIdValue || !questionText) {
      throw new Error('Platform, subject, topic, and question text are required.');
    }

    const roadmapValue = parseNumber(form.roadmapId.trim());
    if (!roadmapValue) {
      throw new Error('Roadmap ID is required.');
    }
    const roadmapId = roadmapValue;

    const trimmedOptions = form.options.map((option) => option.trim());

    const correctIndex =
      typeof form.correctOptionIndex === 'number' && Number.isFinite(form.correctOptionIndex)
        ? Math.trunc(form.correctOptionIndex)
        : null;
    if (correctIndex !== null && (correctIndex < 0 || correctIndex >= trimmedOptions.length)) {
      throw new Error('Correct option selection is invalid.');
    }

    const options: string[] = [];
    let sanitizedCorrectIndex: number | null = null;
    trimmedOptions.forEach((option, index) => {
      if (!option) {
        if (index === correctIndex) {
          throw new Error('Correct option cannot be empty.');
        }
        return;
      }
      if (index === correctIndex) {
        sanitizedCorrectIndex = options.length;
      }
      options.push(option);
    });

    if (options.length === 0) {
      throw new Error('Provide at least one option.');
    }

    if (correctIndex === null) {
      throw new Error('Select the correct option.');
    }

    if (sanitizedCorrectIndex === null) {
      throw new Error('Correct option must match one of the provided options.');
    }

    const answerKey = String(sanitizedCorrectIndex);

    const explanation = form.explanation.trim();
    if (!explanation) {
      throw new Error('Explanation is required.');
    }

    const levelRaw = form.level.trim().toUpperCase();
    if (!levelRaw) {
      throw new Error('Level is required.');
    }
    if (!['E', 'M', 'D'].includes(levelRaw)) {
      throw new Error('Level must be one of E, M, or D.');
    }
    const level = levelRaw;
    this.form.level = level;

    return {
      platformId: platformIdValue,
      subjectId: subjectIdValue,
      topicId: topicIdValue,
      roadmapId,
      questionText,
      options,
      answerKey,
      explanation,
      level,
      isActive: !!form.isActive,
    };
  }

  private buildFiltersPayload(): QuestionFiltersPayload {
    const payload: QuestionFiltersPayload = {};

    const questionText = this.filters.questionText.trim();
    if (questionText) {
      payload.questionText = questionText;
    }

    const platformIdValue = parseNumber(this.filters.platformId.trim());
    if (platformIdValue) {
      payload.platformId = platformIdValue;
    }

    const subjectIdValue = parseNumber(this.filters.subjectId.trim());
    if (subjectIdValue) {
      payload.subjectId = subjectIdValue;
    }

    const topicIdValue = parseNumber(this.filters.topicId.trim());
    if (topicIdValue) {
      payload.topicId = topicIdValue;
    }

    const roadmapIdValue = parseNumber(this.filters.roadmapId.trim());
    if (roadmapIdValue) {
      payload.roadmapId = roadmapIdValue;
    }

    const level = this.filters.level.trim().toUpperCase();
    if (level && ['E', 'M', 'D'].includes(level)) {
      payload.level = level;
    }

    if (this.filters.status !== 'all') {
      payload.status = this.filters.status;
    }

    return payload;
  }
}

export type QuestionsStore = QuestionsStoreImpl;

Alpine.store('questions', new QuestionsStoreImpl());

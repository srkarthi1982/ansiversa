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
  answerKey: string | null;
  explanation: string | null;
  difficulty: string | null;
  questionType: string | null;
  tags: string[];
  metadata: Record<string, unknown> | null;
  isActive: boolean;
  platformName: string | null;
  subjectName: string | null;
  topicName: string | null;
  roadmapName: string | null;
};

type QuestionForm = {
  platformId: string;
  subjectId: string;
  topicId: string;
  roadmapId: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number | null;
  answerKey: string;
  explanation: string;
  difficulty: string;
  questionType: string;
  tags: string;
  metadata: string;
  isActive: boolean;
};

type QuestionFilters = {
  questionText: string;
  platformId: string;
  subjectId: string;
  topicId: string;
  roadmapId: string;
  difficulty: string;
  questionType: string;
  status: 'all' | 'active' | 'inactive';
};

type QuestionFiltersPayload = {
  questionText?: string;
  platformId?: number;
  subjectId?: number;
  topicId?: number;
  roadmapId?: number;
  difficulty?: string;
  questionType?: string;
  status?: 'active' | 'inactive';
};

type QuestionSortColumn =
  | 'questionText'
  | 'difficulty'
  | 'questionType'
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
    'difficulty',
    'questionType',
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
  private readonly loader: LoaderStore;

  constructor() {
    this.loader = Alpine.store('loader') as LoaderStore;
    this.form = this.createDefaultForm();
    this.filters = this.createDefaultFilters();
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

  openCreateModal(): void {
    this.error = null;
    this.modalMode = 'create';
    this.editingId = null;
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(question: QuestionRecord): void {
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
      roadmapId: question.roadmapId ? String(question.roadmapId) : '',
      questionText: question.questionText ?? '',
      options: existingOptions.map((option) => option ?? ''),
      correctOptionIndex:
        typeof question.answer === 'string'
          ? (() => {
              const answerValue = question.answer?.trim() ?? '';
              if (!answerValue) return null;
              const matchIndex = existingOptions.findIndex((option) => (option ?? '').trim() === answerValue);
              return matchIndex >= 0 ? matchIndex : null;
            })()
          : null,
      answerKey: question.answerKey ?? '',
      explanation: question.explanation ?? '',
      difficulty: question.difficulty ?? '',
      questionType: question.questionType ?? '',
      tags: (question.tags ?? []).join(', '),
      metadata: question.metadata ? JSON.stringify(question.metadata, null, 2) : '',
      isActive: question.isActive,
    };
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
      answerKey: '',
      explanation: '',
      difficulty: '',
      questionType: '',
      tags: '',
      metadata: '',
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
      difficulty: '',
      questionType: '',
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

    let roadmapId: number | null = null;
    const roadmapValue = parseNumber(form.roadmapId.trim());
    if (roadmapValue) {
      roadmapId = roadmapValue;
    } else if (form.roadmapId.trim()) {
      throw new Error('Roadmap ID must be a positive number.');
    }

    const parseTags = (value: string) =>
      value
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

    const trimmedOptions = form.options.map((option) => option.trim());
    const options = trimmedOptions.filter((option) => option.length > 0);
    const tags = parseTags(form.tags);

    const correctIndex =
      typeof form.correctOptionIndex === 'number' && Number.isFinite(form.correctOptionIndex)
        ? Math.trunc(form.correctOptionIndex)
        : null;
    const selectedAnswer =
      correctIndex !== null && correctIndex >= 0 && correctIndex < trimmedOptions.length
        ? trimmedOptions[correctIndex]
        : '';
    const answerKey = form.answerKey.trim();
    const explanation = form.explanation.trim();
    const difficulty = form.difficulty.trim();
    const questionType = form.questionType.trim();

    let metadata: Record<string, unknown> | undefined;
    const metadataRaw = form.metadata.trim();
    if (metadataRaw) {
      try {
        const parsed = JSON.parse(metadataRaw);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('Metadata must be a JSON object.');
        }
        metadata = parsed as Record<string, unknown>;
      } catch (err) {
        if (err instanceof Error && err.message === 'Metadata must be a JSON object.') {
          throw err;
        }
        throw new Error('Metadata must be valid JSON.');
      }
    }

    return {
      platformId: platformIdValue,
      subjectId: subjectIdValue,
      topicId: topicIdValue,
      roadmapId,
      questionText,
      options: options.length > 0 ? options : undefined,
      answer: selectedAnswer ? selectedAnswer : undefined,
      answerKey: answerKey ? answerKey : undefined,
      explanation: explanation ? explanation : undefined,
      difficulty: difficulty ? difficulty : undefined,
      questionType: questionType ? questionType : undefined,
      tags: tags.length > 0 ? tags : undefined,
      metadata,
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

    const difficulty = this.filters.difficulty.trim();
    if (difficulty) {
      payload.difficulty = difficulty;
    }

    const questionType = this.filters.questionType.trim();
    if (questionType) {
      payload.questionType = questionType;
    }

    if (this.filters.status !== 'all') {
      payload.status = this.filters.status;
    }

    return payload;
  }
}

export type QuestionsStore = QuestionsStoreImpl;

Alpine.store('questions', new QuestionsStoreImpl());


import Alpine from 'alpinejs';
import { actions } from 'astro:actions';
import type { LoaderStore } from '../loader';

type TopicRecord = {
  id: number;
  platformId: number;
  subjectId: number;
  name: string;
  isActive: boolean;
  qCount: number;
  platformName: string | null;
  subjectName: string | null;
};

type TopicForm = {
  platformId: string;
  subjectId: string;
  name: string;
  qCount: number;
  isActive: boolean;
};

type TopicFilters = {
  name: string;
  platformId: string;
  subjectId: string;
  minQuestions: string;
  maxQuestions: string;
  status: 'all' | 'active' | 'inactive';
};

type TopicFiltersPayload = {
  name?: string;
  platformId?: number;
  subjectId?: number;
  minQuestions?: number;
  maxQuestions?: number;
  status?: 'active' | 'inactive';
};

type TopicSortColumn =
  | 'name'
  | 'subjectName'
  | 'platformName'
  | 'platformId'
  | 'subjectId'
  | 'qCount'
  | 'status'
  | 'id';

type SortState = {
  column: TopicSortColumn;
  direction: 'asc' | 'desc';
};

class TopicsStoreImpl {
  topics: TopicRecord[] = [];
  loading = false;
  error: string | null = null;
  page = 1;
  pageSize = 10;
  totalItems = 0;
  mutating = false;
  form: TopicForm;
  editingId: number | null = null;
  modalMode: 'create' | 'edit' = 'create';
  showModal = false;
  filters: TopicFilters;
  sort: SortState | null = null;
  private filterDebounce: ReturnType<typeof setTimeout> | null = null;
  private readonly allowedSortColumns: TopicSortColumn[] = [
    'name',
    'subjectName',
    'platformName',
    'platformId',
    'subjectId',
    'qCount',
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
    await this.loadTopics(1);
  }

  async loadTopics(page = this.page): Promise<void> {
    this.setLoading(true);
    this.error = null;

    try {
      const filtersPayload = this.buildFiltersPayload();
      const { data, error } = await actions.quiz.fetchTopics({
        page,
        pageSize: this.pageSize,
        filters: filtersPayload,
        sort: this.sort ?? undefined,
      });
      if (error) {
        throw error;
      }
      const payload = data ?? { items: [], total: 0, page: 1, pageSize: this.pageSize };
      this.topics = Array.isArray(payload.items) ? payload.items : [];
      const totalValue = payload.total;
      this.totalItems =
        typeof totalValue === 'number'
          ? totalValue
          : typeof totalValue === 'bigint'
            ? Number(totalValue)
            : this.topics.length;
      this.page = typeof payload.page === 'number' ? payload.page : page;
      this.pageSize = typeof payload.pageSize === 'number' ? payload.pageSize : this.pageSize;
      if (this.totalItems === 0) {
        this.page = 1;
      }
    } catch (err) {
      console.error('Failed to load quiz topics', err);
      this.error = err instanceof Error ? err.message : 'Unable to load topics.';
      this.topics = [];
      this.totalItems = 0;
      this.page = 1;
      this.closeModal(true);
    } finally {
      this.setLoading(false);
    }
  }

  async setSort(column: TopicSortColumn): Promise<void> {
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
    await this.loadTopics(1);
  }

  async setPage(page: number): Promise<void> {
    const maxPage = this.totalPages === 0 ? 1 : this.totalPages;
    const clamped = Math.min(Math.max(1, page), maxPage);
    if (clamped === this.page && this.topics.length > 0) {
      return;
    }
    await this.loadTopics(clamped);
  }

  async setPageSize(size: number): Promise<void> {
    const parsed = Math.max(1, Math.min(48, Math.floor(Number(size))));
    if (!Number.isFinite(parsed)) {
      return;
    }
    if (parsed === this.pageSize) {
      return;
    }
    this.pageSize = parsed;
    this.page = 1;
    await this.loadTopics(1);
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
      void this.loadTopics(1);
    }, 400);
  }

  clearFilters(): void {
    if (this.filterDebounce) {
      clearTimeout(this.filterDebounce);
      this.filterDebounce = null;
    }
    this.filters = this.createDefaultFilters();
    this.page = 1;
    void this.loadTopics(1);
  }

  openCreateModal(): void {
    this.error = null;
    this.modalMode = 'create';
    this.editingId = null;
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(topic: TopicRecord): void {
    this.error = null;
    this.modalMode = 'edit';
    this.editingId = topic.id;
    this.form = {
      platformId: String(topic.platformId ?? ''),
      subjectId: String(topic.subjectId ?? ''),
      name: topic.name ?? '',
      qCount: topic.qCount ?? 0,
      isActive: topic.isActive,
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
      await this.createTopic();
    }
  }

  private async createTopic(): Promise<void> {
    if (this.mutating) return;
    const payload = this.buildPayload(this.form);
    if (!payload) {
      this.error = 'Platform, subject, and name are required.';
      return;
    }

    this.mutating = true;
    try {
      const { error } = await actions.quiz.createTopic(payload);
      if (error) {
        throw error;
      }
      this.resetForm();
      await this.loadTopics(this.page);
      this.closeModal(true);
    } catch (err) {
      console.error('Failed to create quiz topic', err);
      this.error = err instanceof Error ? err.message : 'Unable to create topic.';
    } finally {
      this.mutating = false;
    }
  }

  private async saveEdit(): Promise<void> {
    if (this.editingId === null || this.mutating) return;
    const payload = this.buildPayload(this.form);
    if (!payload) {
      this.error = 'Platform, subject, and name are required.';
      return;
    }

    this.mutating = true;
    try {
      const { data, error } = await actions.quiz.updateTopic({
        id: this.editingId,
        ...payload,
      });
      if (error) {
        throw error;
      }

      const updated = data as TopicRecord | null | undefined;

      if (updated && typeof updated.id === 'number') {
        const idx = this.topics.findIndex((item) => item.id === updated.id);
        if (idx !== -1) {
          this.topics.splice(idx, 1, updated);
        } else {
          await this.loadTopics(this.page);
        }
      } else {
        await this.loadTopics(this.page);
      }

      this.closeModal(true);
    } catch (err) {
      console.error('Failed to update quiz topic', err);
      this.error = err instanceof Error ? err.message : 'Unable to update topic.';
    } finally {
      this.mutating = false;
    }
  }

  async deleteTopic(id: number): Promise<void> {
    if (this.mutating) return;
    if (typeof window !== 'undefined' && !window.confirm('Delete this topic?')) {
      return;
    }

    this.mutating = true;
    try {
      const { error } = await actions.quiz.deleteTopic({ id });
      if (error) {
        throw error;
      }
      if (this.editingId === id) {
        this.closeModal(true);
      }
      await this.loadTopics(this.page);
    } catch (err) {
      console.error('Failed to delete quiz topic', err);
      this.error = err instanceof Error ? err.message : 'Unable to delete topic.';
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

  private createDefaultForm(): TopicForm {
    return {
      platformId: '',
      subjectId: '',
      name: '',
      qCount: 0,
      isActive: true,
    };
  }

  private createDefaultFilters(): TopicFilters {
    return {
      name: '',
      platformId: '',
      subjectId: '',
      minQuestions: '',
      maxQuestions: '',
      status: 'all',
    };
  }

  private buildPayload(form: TopicForm) {
    const platformIdValue = Number(form.platformId);
    const subjectIdValue = Number(form.subjectId);
    const hasValidPlatformId = !Number.isNaN(platformIdValue) && platformIdValue > 0;
    const hasValidSubjectId = !Number.isNaN(subjectIdValue) && subjectIdValue > 0;
    const name = form.name.trim();
    if (!hasValidPlatformId || !hasValidSubjectId || !name) {
      return null;
    }
    const qCountValue = Number.isFinite(form.qCount) ? Math.round(form.qCount) : 0;
    return {
      platformId: Math.floor(platformIdValue),
      subjectId: Math.floor(subjectIdValue),
      name,
      qCount: Math.max(0, qCountValue),
      isActive: !!form.isActive,
    };
  }

  private buildFiltersPayload(): TopicFiltersPayload {
    const payload: TopicFiltersPayload = {};
    const name = this.filters.name.trim();
    if (name) {
      payload.name = name;
    }

    const platformIdRaw = this.filters.platformId.trim();
    if (platformIdRaw) {
      const platformIdValue = Number(platformIdRaw);
      if (!Number.isNaN(platformIdValue) && platformIdValue > 0) {
        payload.platformId = Math.floor(platformIdValue);
      }
    }

    const subjectIdRaw = this.filters.subjectId.trim();
    if (subjectIdRaw) {
      const subjectIdValue = Number(subjectIdRaw);
      if (!Number.isNaN(subjectIdValue) && subjectIdValue > 0) {
        payload.subjectId = Math.floor(subjectIdValue);
      }
    }

    const minRaw = this.filters.minQuestions.trim();
    if (minRaw !== '') {
      const minValue = Number(minRaw);
      if (!Number.isNaN(minValue)) {
        payload.minQuestions = Math.max(0, Math.floor(minValue));
      }
    }

    const maxRaw = this.filters.maxQuestions.trim();
    if (maxRaw !== '') {
      const maxValue = Number(maxRaw);
      if (!Number.isNaN(maxValue)) {
        payload.maxQuestions = Math.max(0, Math.floor(maxValue));
      }
    }

    if (
      payload.minQuestions !== undefined &&
      payload.maxQuestions !== undefined &&
      payload.maxQuestions < payload.minQuestions
    ) {
      const originalMin = payload.minQuestions;
      payload.minQuestions = payload.maxQuestions;
      payload.maxQuestions = originalMin;
    }

    if (this.filters.status !== 'all') {
      payload.status = this.filters.status;
    }

    return payload;
  }
}

export type TopicsStore = TopicsStoreImpl;

Alpine.store('topics', new TopicsStoreImpl());

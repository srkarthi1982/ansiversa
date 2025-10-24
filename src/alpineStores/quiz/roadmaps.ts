import Alpine from 'alpinejs';
import { actions } from 'astro:actions';
import { setLoaderVisible } from '../base';

type RoadmapRecord = {
  id: number;
  platformId: number;
  subjectId: number;
  topicId: number;
  name: string;
  isActive: boolean;
  qCount: number;
  platformName: string | null;
  subjectName: string | null;
  topicName: string | null;
};

type RoadmapForm = {
  platformId: string;
  subjectId: string;
  topicId: string;
  name: string;
  qCount: number;
  isActive: boolean;
};

type RoadmapFilters = {
  name: string;
  platformId: string;
  subjectId: string;
  topicId: string;
  minQuestions: string;
  maxQuestions: string;
  status: 'all' | 'active' | 'inactive';
};

type RoadmapFiltersPayload = {
  name?: string;
  platformId?: number;
  subjectId?: number;
  topicId?: number;
  minQuestions?: number;
  maxQuestions?: number;
  status?: 'active' | 'inactive';
};

type RoadmapSortColumn =
  | 'name'
  | 'platformName'
  | 'subjectName'
  | 'topicName'
  | 'platformId'
  | 'subjectId'
  | 'topicId'
  | 'qCount'
  | 'status'
  | 'id';

type SortState = {
  column: RoadmapSortColumn;
  direction: 'asc' | 'desc';
};

class RoadmapsStoreImpl {
  roadmaps: RoadmapRecord[] = [];
  loading = false;
  error: string | null = null;
  page = 1;
  pageSize = 10;
  totalItems = 0;
  mutating = false;
  form: RoadmapForm;
  editingId: number | null = null;
  modalMode: 'create' | 'edit' = 'create';
  showModal = false;
  filters: RoadmapFilters;
  sort: SortState | null = null;
  private filterDebounce: ReturnType<typeof setTimeout> | null = null;
  private readonly allowedSortColumns: RoadmapSortColumn[] = [
    'name',
    'platformName',
    'subjectName',
    'topicName',
    'platformId',
    'subjectId',
    'topicId',
    'qCount',
    'status',
    'id',
  ];
  constructor() {
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
    await this.loadRoadmaps(1);
  }

  async loadRoadmaps(page = this.page): Promise<void> {
    this.setLoading(true);
    this.error = null;

    try {
      const filtersPayload = this.buildFiltersPayload();
      const { data, error } = await actions.quiz.fetchRoadmaps({
        page,
        pageSize: this.pageSize,
        filters: filtersPayload,
        sort: this.sort ?? undefined,
      });
      if (error) {
        throw error;
      }
      const payload = data ?? { items: [], total: 0, page: 1, pageSize: this.pageSize };
      this.roadmaps = Array.isArray(payload.items) ? payload.items : [];
      const totalValue = payload.total;
      this.totalItems =
        typeof totalValue === 'number'
          ? totalValue
          : typeof totalValue === 'bigint'
            ? Number(totalValue)
            : this.roadmaps.length;
      this.page = typeof payload.page === 'number' ? payload.page : page;
      this.pageSize = typeof payload.pageSize === 'number' ? payload.pageSize : this.pageSize;
      if (this.totalItems === 0) {
        this.page = 1;
      }
    } catch (err) {
      console.error('Failed to load quiz roadmaps', err);
      this.error = err instanceof Error ? err.message : 'Unable to load roadmaps.';
      this.roadmaps = [];
      this.totalItems = 0;
      this.page = 1;
      this.closeModal(true);
    } finally {
      this.setLoading(false);
    }
  }

  async setSort(column: RoadmapSortColumn): Promise<void> {
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
    await this.loadRoadmaps(1);
  }

  async setPage(page: number): Promise<void> {
    const maxPage = this.totalPages === 0 ? 1 : this.totalPages;
    const clamped = Math.min(Math.max(1, page), maxPage);
    if (clamped === this.page && this.roadmaps.length > 0) {
      return;
    }
    await this.loadRoadmaps(clamped);
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
    await this.loadRoadmaps(1);
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
      void this.loadRoadmaps(1);
    }, 400);
  }

  clearFilters(): void {
    if (this.filterDebounce) {
      clearTimeout(this.filterDebounce);
      this.filterDebounce = null;
    }
    this.filters = this.createDefaultFilters();
    this.page = 1;
    void this.loadRoadmaps(1);
  }

  openCreateModal(): void {
    this.error = null;
    this.modalMode = 'create';
    this.editingId = null;
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(roadmap: RoadmapRecord): void {
    this.error = null;
    this.modalMode = 'edit';
    this.editingId = roadmap.id;
    this.form = {
      platformId: String(roadmap.platformId ?? ''),
      subjectId: String(roadmap.subjectId ?? ''),
      topicId: String(roadmap.topicId ?? ''),
      name: roadmap.name ?? '',
      qCount: roadmap.qCount ?? 0,
      isActive: roadmap.isActive,
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
      await this.createRoadmap();
    }
  }

  private async createRoadmap(): Promise<void> {
    if (this.mutating) return;
    const payload = this.buildPayload(this.form);
    if (!payload) {
      this.error = 'Platform, subject, topic, and name are required.';
      return;
    }

    this.mutating = true;
    try {
      const { error } = await actions.quiz.createRoadmap(payload);
      if (error) {
        throw error;
      }
      this.resetForm();
      await this.loadRoadmaps(this.page);
      this.closeModal(true);
    } catch (err) {
      console.error('Failed to create quiz roadmap', err);
      this.error = err instanceof Error ? err.message : 'Unable to create roadmap.';
    } finally {
      this.mutating = false;
    }
  }

  private async saveEdit(): Promise<void> {
    if (this.editingId === null || this.mutating) return;
    const payload = this.buildPayload(this.form);
    if (!payload) {
      this.error = 'Platform, subject, topic, and name are required.';
      return;
    }

    this.mutating = true;
    try {
      const { data, error } = await actions.quiz.updateRoadmap({
        id: this.editingId,
        ...payload,
      });
      if (error) {
        throw error;
      }

      const updated = data as RoadmapRecord | null | undefined;

      if (updated && typeof updated.id === 'number') {
        const idx = this.roadmaps.findIndex((item) => item.id === updated.id);
        if (idx !== -1) {
          this.roadmaps.splice(idx, 1, updated);
        } else {
          await this.loadRoadmaps(this.page);
        }
      } else {
        await this.loadRoadmaps(this.page);
      }

      this.closeModal(true);
    } catch (err) {
      console.error('Failed to update quiz roadmap', err);
      this.error = err instanceof Error ? err.message : 'Unable to update roadmap.';
    } finally {
      this.mutating = false;
    }
  }

  async deleteRoadmap(id: number): Promise<void> {
    if (this.mutating) return;
    if (typeof window !== 'undefined' && !window.confirm('Delete this roadmap?')) {
      return;
    }

    this.mutating = true;
    try {
      const { error } = await actions.quiz.deleteRoadmap({ id });
      if (error) {
        throw error;
      }
      if (this.editingId === id) {
        this.closeModal(true);
      }
      await this.loadRoadmaps(this.page);
    } catch (err) {
      console.error('Failed to delete quiz roadmap', err);
      this.error = err instanceof Error ? err.message : 'Unable to delete roadmap.';
    } finally {
      this.mutating = false;
    }
  }

  private resetForm(): void {
    this.form = this.createDefaultForm();
  }

  private setLoading(state: boolean): void {
    this.loading = state;
    setLoaderVisible(state);
  }

  private createDefaultForm(): RoadmapForm {
    return {
      platformId: '',
      subjectId: '',
      topicId: '',
      name: '',
      qCount: 0,
      isActive: true,
    };
  }

  private createDefaultFilters(): RoadmapFilters {
    return {
      name: '',
      platformId: '',
      subjectId: '',
      topicId: '',
      minQuestions: '',
      maxQuestions: '',
      status: 'all',
    };
  }

  private buildPayload(form: RoadmapForm) {
    const platformIdValue = Number(form.platformId);
    const subjectIdValue = Number(form.subjectId);
    const topicIdValue = Number(form.topicId);
    const hasValidPlatformId = !Number.isNaN(platformIdValue) && platformIdValue > 0;
    const hasValidSubjectId = !Number.isNaN(subjectIdValue) && subjectIdValue > 0;
    const hasValidTopicId = !Number.isNaN(topicIdValue) && topicIdValue > 0;
    const name = form.name.trim();
    if (!hasValidPlatformId || !hasValidSubjectId || !hasValidTopicId || !name) {
      return null;
    }
    const qCountValue = Number.isFinite(form.qCount) ? Math.round(form.qCount) : 0;
    return {
      platformId: Math.floor(platformIdValue),
      subjectId: Math.floor(subjectIdValue),
      topicId: Math.floor(topicIdValue),
      name,
      qCount: Math.max(0, qCountValue),
      isActive: !!form.isActive,
    };
  }

  private buildFiltersPayload(): RoadmapFiltersPayload {
    const payload: RoadmapFiltersPayload = {};
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

    const topicIdRaw = this.filters.topicId.trim();
    if (topicIdRaw) {
      const topicIdValue = Number(topicIdRaw);
      if (!Number.isNaN(topicIdValue) && topicIdValue > 0) {
        payload.topicId = Math.floor(topicIdValue);
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

export type RoadmapsStore = RoadmapsStoreImpl;

Alpine.store('roadmaps', new RoadmapsStoreImpl());

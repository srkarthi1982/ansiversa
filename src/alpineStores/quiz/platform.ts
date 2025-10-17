import Alpine from 'alpinejs';
import { actions } from 'astro:actions';

type PlatformRecord = {
  id: number;
  name: string;
  description: string;
  icon: string;
  type: string | null;
  qCount: number;
  isActive: boolean;
};

type PlatformForm = {
  name: string;
  description: string;
  icon: string;
  type: string;
  qCount: number;
  isActive: boolean;
};

type PlatformFilters = {
  name: string;
  description: string;
  type: string;
  minQuestions: string;
  maxQuestions: string;
  status: 'all' | 'active' | 'inactive';
};

type PlatformFiltersPayload = {
  name?: string;
  description?: string;
  type?: string;
  minQuestions?: number;
  maxQuestions?: number;
  status?: 'active' | 'inactive';
};

type PlatformSortColumn = 'name' | 'description' | 'type' | 'qCount' | 'status' | 'id';

type SortState = {
  column: PlatformSortColumn;
  direction: 'asc' | 'desc';
};

class PlatformStoreImpl {
  platforms: PlatformRecord[] = [];
  loading = false;
  error: string | null = null;
  page = 1;
  pageSize = 10;
  totalItems = 0;
  mutating = false;
  newPlatform: PlatformForm;
  editPlatform: PlatformForm;
  editingId: number | null = null;
  showCreateModal = false;
  showEditModal = false;
  filters: PlatformFilters;
  sort: SortState | null = null;
  private filterDebounce: ReturnType<typeof setTimeout> | null = null;
  private readonly allowedSortColumns: PlatformSortColumn[] = ['name', 'description', 'type', 'qCount', 'status', 'id'];

  constructor() {
    this.newPlatform = this.createDefaultForm();
    this.editPlatform = this.createDefaultForm();
    this.filters = this.createDefaultFilters();
  }

  get totalPages(): number {
    return this.totalItems === 0 ? 0 : Math.ceil(this.totalItems / this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  get hasActiveFilters(): boolean {
    return Object.keys(this.buildFiltersPayload()).length > 0;
  }

  async onInit(): Promise<void> {
    await this.loadPlatforms(1);
    console.log('this.platforms', this.platforms)
  }

  async loadPlatforms(page = this.page): Promise<void> {
    this.setLoading(true);
    this.error = null;

    try {
      const filtersPayload = this.buildFiltersPayload();
      const { data, error } = await actions.quiz.fetchPlatforms({
        page,
        pageSize: this.pageSize,
        filters: filtersPayload,
        sort: this.sort ?? undefined,
      });

      if (error) {
        throw error;
      }

      const payload = data ?? { items: [], total: 0, page: 1, pageSize: this.pageSize };
      this.platforms = Array.isArray(payload.items) ? payload.items : [];

      const totalValue = payload.total;
      this.totalItems =
        typeof totalValue === 'number'
          ? totalValue
          : typeof totalValue === 'bigint'
            ? Number(totalValue)
            : this.platforms.length;

      this.page = typeof payload.page === 'number' ? payload.page : page;
      this.pageSize = typeof payload.pageSize === 'number' ? payload.pageSize : this.pageSize;

      if (this.totalItems === 0) {
        this.page = 1;
      }
    } catch (err) {
      console.error('Failed to load platforms', err);
      this.error = err instanceof Error ? err.message : 'Unable to load platforms.';
      this.platforms = [];
      this.totalItems = 0;
      this.page = 1;
      this.resetEditState();
      this.showEditModal = false;
    } finally {
      this.setLoading(false);
    }
  }

  async setSort(column: PlatformSortColumn): Promise<void> {
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
    await this.loadPlatforms(1);
  }

  async setPage(page: number): Promise<void> {
    const maxPage = this.totalPages === 0 ? 1 : this.totalPages;
    const clamped = Math.min(Math.max(1, page), maxPage);
    if (clamped === this.page && this.platforms.length > 0) {
      return;
    }
    await this.loadPlatforms(clamped);
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
    await this.loadPlatforms(1);
  }

  async nextPage(): Promise<void> {
    if (this.page >= this.totalPages) return;
    await this.setPage(this.page + 1);
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
      void this.loadPlatforms(1);
    }, 400);
  }

  clearFilters(): void {
    if (this.filterDebounce) {
      clearTimeout(this.filterDebounce);
      this.filterDebounce = null;
    }
    this.filters = this.createDefaultFilters();
    this.page = 1;
    void this.loadPlatforms(1);
  }

  openCreateModal(): void {
    this.error = null;
    this.resetNewForm();
    this.showCreateModal = true;
  }

  closeCreateModal(force = false): void {
    if (this.mutating && !force) return;
    this.showCreateModal = false;
    this.resetNewForm();
  }

  openEditModal(platform: PlatformRecord): void {
    if (this.loading || this.mutating) return;
    this.error = null;
    this.editingId = platform.id;
    this.editPlatform = {
      name: platform.name ?? '',
      description: platform.description ?? '',
      icon: platform.icon ?? '',
      type: platform.type ?? '',
      qCount: platform.qCount ?? 0,
      isActive: Boolean(platform.isActive),
    };
    this.showEditModal = true;
  }

  closeEditModal(force = false): void {
    if (this.mutating && !force) return;
    this.showEditModal = false;
    this.resetEditState();
  }

  async createPlatform(): Promise<void> {
    if (this.mutating) return;
    this.mutating = true;
    this.error = null;
    try {
      const payload = this.toPayload(this.newPlatform);
      const { error } = await actions.quiz.createPlatform(payload);
      if (error) throw error;
      await this.loadPlatforms(1);
      this.closeCreateModal(true);
    } catch (err) {
      console.error('Failed to create platform', err);
      this.error = err instanceof Error ? err.message : 'Unable to create platform.';
    } finally {
      this.mutating = false;
    }
  }

  async saveEdit(): Promise<void> {
    if (this.mutating || this.editingId == null) return;
    this.mutating = true;
    this.error = null;
    try {
      const payload = this.toPayload(this.editPlatform);
      const { error } = await actions.quiz.updatePlatform({ id: this.editingId, data: payload });
      if (error) throw error;
      await this.loadPlatforms(this.page);
      this.closeEditModal(true);
    } catch (err) {
      console.error('Failed to update platform', err);
      this.error = err instanceof Error ? err.message : 'Unable to update platform.';
    } finally {
      this.mutating = false;
    }
  }

  async deletePlatform(id: number): Promise<void> {
    if (this.mutating) return;
    this.mutating = true;
    this.error = null;
    try {
      const { error } = await actions.quiz.deletePlatform({ id });
      if (error) throw error;
      const nextPage = this.platforms.length === 1 ? this.page - 1 : this.page;
      await this.loadPlatforms(Math.max(nextPage, 1));
    } catch (err) {
      console.error('Failed to delete platform', err);
      this.error = err instanceof Error ? err.message : 'Unable to delete platform.';
    } finally {
      this.mutating = false;
    }
  }

  resetNewForm(): void {
    this.newPlatform = this.createDefaultForm();
  }

  resetEditState(): void {
    this.editPlatform = this.createDefaultForm();
    this.editingId = null;
  }

  private setLoading(value: boolean): void {
    this.loading = value;
  }

  private createDefaultForm(): PlatformForm {
    return {
      name: '',
      description: '',
      icon: '',
      type: '',
      qCount: 0,
      isActive: true,
    };
  }

  private createDefaultFilters(): PlatformFilters {
    return {
      name: '',
      description: '',
      type: '',
      minQuestions: '',
      maxQuestions: '',
      status: 'all',
    };
  }

  private toPayload(form: PlatformForm) {
    const qCount = Number.isFinite(form.qCount) ? form.qCount : 0;
    return {
      name: form.name.trim(),
      description: form.description.trim(),
      icon: form.icon.trim(),
      type: form.type.trim() || null,
      qCount: Math.max(0, qCount),
      isActive: Boolean(form.isActive),
    };
  }

  private buildFiltersPayload(): PlatformFiltersPayload {
    const payload: PlatformFiltersPayload = {};

    if (this.filters.name.trim()) payload.name = this.filters.name.trim();
    if (this.filters.description.trim()) payload.description = this.filters.description.trim();
    if (this.filters.type.trim()) payload.type = this.filters.type.trim();

    const min = Number(this.filters.minQuestions);
    if (Number.isFinite(min) && min >= 0) payload.minQuestions = Math.floor(min);

    const max = Number(this.filters.maxQuestions);
    if (Number.isFinite(max) && max >= 0) payload.maxQuestions = Math.floor(max);

    if (this.filters.status === 'active' || this.filters.status === 'inactive') {
      payload.status = this.filters.status;
    }

    return payload;
  }
}

export type PlatformStore = PlatformStoreImpl;

Alpine.store('platform', new PlatformStoreImpl());

import Alpine from 'alpinejs';
import { actions } from 'astro:actions';
import type { LoaderStore } from '../loader';

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
  form: PlatformForm;
  editingId: number | null = null;
  modalMode: 'create' | 'edit' = 'create';
  showModal = false;
  filters: PlatformFilters;
  sort: SortState | null = null;
  private filterDebounce: ReturnType<typeof setTimeout> | null = null;
  private readonly allowedSortColumns: PlatformSortColumn[] = ['name', 'description', 'type', 'qCount', 'status', 'id'];
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
    await this.loadPlatforms(1);
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
      this.closeModal(true);
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
    this.modalMode = 'create';
    this.editingId = null;
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(platform: PlatformRecord): void {
    if (this.loading || this.mutating) return;
    this.error = null;
    this.modalMode = 'edit';
    this.editingId = platform.id;
    this.form = {
      name: platform.name ?? '',
      description: platform.description ?? '',
      icon: platform.icon ?? '',
      type: platform.type ?? '',
      qCount: platform.qCount ?? 0,
      isActive: Boolean(platform.isActive),
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
      await this.createPlatform();
    }
  }

  private async createPlatform(): Promise<void> {
    if (this.mutating) return;
    this.mutating = true;
    this.error = null;
    try {
      const payload = this.toPayload(this.form);
      const { error } = await actions.quiz.createPlatform(payload);
      if (error) throw error;
      await this.loadPlatforms(1);
      this.closeModal(true);
    } catch (err) {
      console.error('Failed to create platform', err);
      this.error = err instanceof Error ? err.message : 'Unable to create platform.';
    } finally {
      this.mutating = false;
    }
  }

  private async saveEdit(): Promise<void> {
    if (this.mutating || this.editingId == null) return;
    this.mutating = true;
    this.error = null;
    try {
      const payload = this.toPayload(this.form);
      const { error } = await actions.quiz.updatePlatform({ id: this.editingId, data: payload });
      if (error) throw error;
      await this.loadPlatforms(this.page);
      this.closeModal(true);
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
      if (this.editingId === id) {
        this.closeModal(true);
      }
      const nextPage = this.platforms.length === 1 ? this.page - 1 : this.page;
      await this.loadPlatforms(Math.max(nextPage, 1));
    } catch (err) {
      console.error('Failed to delete platform', err);
      this.error = err instanceof Error ? err.message : 'Unable to delete platform.';
    } finally {
      this.mutating = false;
    }
  }

  private setLoading(value: boolean): void {
    this.loading = value;
    const loader = this.loader;
    if (loader && typeof loader.show === 'function' && typeof loader.hide === 'function') {
      if (value) {
        loader.show();
      } else {
        loader.hide();
      }
    }
  }

  private resetForm(): void {
    this.form = this.createDefaultForm();
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

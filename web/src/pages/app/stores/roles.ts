import Alpine from 'alpinejs';
import { actions } from 'astro:actions';
import { BaseStore } from '../../../alpineStores/base';

type RoleRecord = {
  id: number;
  name: string;
  userCount: number;
};

type RolesFilters = {
  name: string;
};

type RolesFiltersPayload = {
  name?: string;
};

type RolesSortColumn = 'name' | 'userCount' | 'id';

type SortState = {
  column: RolesSortColumn;
  direction: 'asc' | 'desc';
};

class RolesStoreImpl extends BaseStore {
  roles: RoleRecord[] = [];
  loading = false;
  error: string | null = null;
  page = 1;
  pageSize = 10;
  totalItems = 0;
  filters: RolesFilters;
  sort: SortState | null = null;
  private filterDebounce: ReturnType<typeof setTimeout> | null = null;
  private readonly allowedSortColumns: RolesSortColumn[] = ['name', 'userCount', 'id'];

  constructor() {
    super();
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

  get hasActiveFilters(): boolean {
    return Object.keys(this.buildFiltersPayload()).length > 0;
  }

  async onInit(): Promise<void> {
    await this.loadRoles(1);
  }

  async loadRoles(page = this.page): Promise<void> {
    this.setLoading(true);
    this.error = null;

    try {
      const filtersPayload = this.buildFiltersPayload();
      const { data, error } = await actions.app.fetchRoles({
        page,
        pageSize: this.pageSize,
        filters: Object.keys(filtersPayload).length > 0 ? filtersPayload : undefined,
        sort: this.sort ?? undefined,
      });

      if (error) {
        throw error;
      }

      const payload = data ?? { items: [], total: 0, page: 1, pageSize: this.pageSize };
      this.roles = Array.isArray(payload.items) ? payload.items : [];

      const totalValue = payload.total;
      this.totalItems = typeof totalValue === 'number' ? totalValue : this.roles.length;

      this.page = typeof payload.page === 'number' ? payload.page : page;
      this.pageSize = typeof payload.pageSize === 'number' ? payload.pageSize : this.pageSize;

      if (this.totalItems === 0) {
        this.page = 1;
      }
    } catch (err) {
      console.error('Failed to load roles', err);
      this.error = err instanceof Error ? err.message : 'Unable to load roles.';
      this.roles = [];
      this.totalItems = 0;
      this.page = 1;
    } finally {
      this.setLoading(false);
    }
  }

  async setSort(column: RolesSortColumn): Promise<void> {
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
    await this.loadRoles(1);
  }

  async setPage(page: number): Promise<void> {
    const maxPage = this.totalPages === 0 ? 1 : this.totalPages;
    const clamped = Math.min(Math.max(1, page), maxPage);
    if (clamped === this.page && this.roles.length > 0) {
      return;
    }
    await this.loadRoles(clamped);
  }

  async setPageSize(size: number): Promise<void> {
    const parsed = Math.max(1, Math.min(100, Math.floor(Number(size))));
    if (!Number.isFinite(parsed)) {
      return;
    }
    if (parsed === this.pageSize) {
      return;
    }
    this.pageSize = parsed;
    this.page = 1;
    await this.loadRoles(1);
  }

  async nextPage(): Promise<void> {
    if (this.page >= this.totalPages) return;
    await this.setPage(this.page + 1);
  }

  async prevPage(): Promise<void> {
    if (this.page <= 1) return;
    await this.setPage(this.page - 1);
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

  onFilterChange(): void {
    if (this.filterDebounce) {
      clearTimeout(this.filterDebounce);
    }
    this.filterDebounce = setTimeout(() => {
      this.filterDebounce = null;
      this.page = 1;
      void this.loadRoles(1);
    }, 400);
  }

  clearFilters(): void {
    if (this.filterDebounce) {
      clearTimeout(this.filterDebounce);
      this.filterDebounce = null;
    }
    this.filters = this.createDefaultFilters();
    this.page = 1;
    void this.loadRoles(1);
  }

  private createDefaultFilters(): RolesFilters {
    return {
      name: '',
    };
  }

  private buildFiltersPayload(): RolesFiltersPayload {
    const payload: RolesFiltersPayload = {};

    if (this.filters.name.trim()) payload.name = this.filters.name.trim();

    return payload;
  }

  private setLoading(value: boolean): void {
    this.loading = value;
    if (value) {
      this.loader?.show();
    } else {
      this.loader?.hide();
    }
  }
}

export type RolesStore = RolesStoreImpl;

Alpine.store('roles', new RolesStoreImpl());

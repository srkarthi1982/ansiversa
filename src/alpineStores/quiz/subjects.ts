import Alpine from 'alpinejs';
import { actions } from 'astro:actions';

type SubjectRecord = {
  id: number;
  platformId: number;
  name: string;
  isActive: boolean;
  qCount: number;
  platformName: string | null;
};

type SubjectForm = {
  platformId: string;
  name: string;
  qCount: number;
  isActive: boolean;
};

type SubjectFilters = {
  name: string;
  platformId: string;
  minQuestions: string;
  maxQuestions: string;
  status: 'all' | 'active' | 'inactive';
};

type SubjectFiltersPayload = {
  name?: string;
  platformId?: number;
  minQuestions?: number;
  maxQuestions?: number;
  status?: 'active' | 'inactive';
};

class SubjectsStoreImpl {
  subjects: SubjectRecord[] = [];
  loading = false;
  error: string | null = null;
  page = 1;
  pageSize = 10;
  totalItems = 0;
  mutating = false;
  newSubject: SubjectForm;
  editSubject: SubjectForm;
  editingId: number | null = null;
  showCreateModal = false;
  showEditModal = false;
  filters: SubjectFilters;
  private filterDebounce: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.newSubject = this.createDefaultForm();
    this.editSubject = this.createDefaultForm();
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
    await this.loadSubjects(1);
  }

  async loadSubjects(page = this.page): Promise<void> {
    this.setLoading(true);
    this.error = null;

    try {
      const filtersPayload = this.buildFiltersPayload();
      const { data, error } = await actions.quiz.fetchSubjects({
        page,
        pageSize: this.pageSize,
        filters: filtersPayload,
      });
      if (error) {
        throw error;
      }
      const payload = data ?? { items: [], total: 0, page: 1, pageSize: this.pageSize };
      this.subjects = Array.isArray(payload.items) ? payload.items : [];
      this.totalItems = typeof payload.total === 'number' ? payload.total : this.subjects.length;
      this.page = typeof payload.page === 'number' ? payload.page : page;
      this.pageSize = typeof payload.pageSize === 'number' ? payload.pageSize : this.pageSize;
      if (this.totalItems === 0) {
        this.page = 1;
      }
    } catch (err) {
      console.error('Failed to load quiz subjects', err);
      this.error = err instanceof Error ? err.message : 'Unable to load subjects.';
      this.subjects = [];
      this.totalItems = 0;
      this.page = 1;
      this.resetEditState();
      this.showEditModal = false;
    } finally {
      this.setLoading(false);
    }
  }

  async setPage(page: number): Promise<void> {
    const maxPage = this.totalPages === 0 ? 1 : this.totalPages;
    const clamped = Math.min(Math.max(1, page), maxPage);
    if (clamped === this.page && this.subjects.length > 0) {
      return;
    }
    await this.loadSubjects(clamped);
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
      void this.loadSubjects(1);
    }, 400);
  }

  clearFilters(): void {
    if (this.filterDebounce) {
      clearTimeout(this.filterDebounce);
      this.filterDebounce = null;
    }
    this.filters = this.createDefaultFilters();
    this.page = 1;
    void this.loadSubjects(1);
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

  openEditModal(subject: SubjectRecord): void {
    this.error = null;
    this.editingId = subject.id;
    this.editSubject = {
      platformId: String(subject.platformId ?? ''),
      name: subject.name ?? '',
      qCount: subject.qCount ?? 0,
      isActive: subject.isActive,
    };
    this.showEditModal = true;
  }

  closeEditModal(force = false): void {
    if (this.mutating && !force) return;
    this.showEditModal = false;
    this.resetEditState();
  }

  async createSubject(): Promise<void> {
    if (this.mutating) return;
    const payload = this.buildPayload(this.newSubject);
    if (!payload) {
      this.error = 'Platform and name are required.';
      return;
    }

    this.mutating = true;
    try {
      const { error } = await actions.quiz.createSubject(payload);
      if (error) {
        throw error;
      }
      this.newSubject = this.createDefaultForm();
      await this.loadSubjects(this.page);
      this.closeCreateModal(true);
    } catch (err) {
      console.error('Failed to create quiz subject', err);
      this.error = err instanceof Error ? err.message : 'Unable to create subject.';
    } finally {
      this.mutating = false;
    }
  }

  async saveEdit(): Promise<void> {
    if (this.editingId === null || this.mutating) return;
    const payload = this.buildPayload(this.editSubject);
    if (!payload) {
      this.error = 'Platform and name are required.';
      return;
    }

    this.mutating = true;
    try {
      const { data, error } = await actions.quiz.updateSubject({
        id: this.editingId,
        ...payload,
      });
      if (error) {
        throw error;
      }

      const updated = data as SubjectRecord | null | undefined;

      if (updated && typeof updated.id === 'number') {
        const idx = this.subjects.findIndex((item) => item.id === updated.id);
        if (idx !== -1) {
          this.subjects.splice(idx, 1, updated);
        } else {
          await this.loadSubjects(this.page);
        }
      } else {
        await this.loadSubjects(this.page);
      }

      this.closeEditModal(true);
    } catch (err) {
      console.error('Failed to update quiz subject', err);
      this.error = err instanceof Error ? err.message : 'Unable to update subject.';
    } finally {
      this.mutating = false;
    }
  }

  async deleteSubject(id: number): Promise<void> {
    if (this.mutating) return;
    if (typeof window !== 'undefined' && !window.confirm('Delete this subject?')) {
      return;
    }

    this.mutating = true;
    try {
      const { error } = await actions.quiz.deleteSubject({ id });
      if (error) {
        throw error;
      }
      if (this.editingId === id) {
        this.closeEditModal(true);
      }
      await this.loadSubjects(this.page);
    } catch (err) {
      console.error('Failed to delete quiz subject', err);
      this.error = err instanceof Error ? err.message : 'Unable to delete subject.';
    } finally {
      this.mutating = false;
    }
  }

  private resetNewForm(): void {
    this.newSubject = this.createDefaultForm();
  }

  private resetEditState(): void {
    this.editingId = null;
    this.editSubject = this.createDefaultForm();
  }

  private setLoading(state: boolean): void {
    this.loading = state;
    const loaderStore = Alpine.store('loader');
    if (!loaderStore) return;
    if (state) {
      loaderStore.show();
    } else {
      loaderStore.hide();
    }
  }

  private createDefaultForm(): SubjectForm {
    return {
      platformId: '',
      name: '',
      qCount: 0,
      isActive: true,
    };
  }

  private createDefaultFilters(): SubjectFilters {
    return {
      name: '',
      platformId: '',
      minQuestions: '',
      maxQuestions: '',
      status: 'all',
    };
  }

  private buildPayload(form: SubjectForm) {
    const platformIdValue = Number(form.platformId);
    const hasValidPlatformId = !Number.isNaN(platformIdValue) && platformIdValue > 0;
    const name = form.name.trim();
    if (!hasValidPlatformId || !name) {
      return null;
    }
    const qCountValue = Number.isFinite(form.qCount) ? Math.round(form.qCount) : 0;
    return {
      platformId: Math.floor(platformIdValue),
      name,
      qCount: Math.max(0, qCountValue),
      isActive: !!form.isActive,
    };
  }

  private buildFiltersPayload(): SubjectFiltersPayload {
    const payload: SubjectFiltersPayload = {};
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

export type SubjectsStore = SubjectsStoreImpl;

Alpine.store('subjects', new SubjectsStoreImpl());

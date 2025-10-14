import Alpine from 'alpinejs';
import { actions } from 'astro:actions';

type PlatformRecord = {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  icon: string;
  type: string | null;
  qCount: number;
};

type PlatformForm = {
  name: string;
  description: string;
  icon: string;
  type: string;
  qCount: number;
  isActive: boolean;
};

class QuizStoreImpl {
  platforms: PlatformRecord[] = [];
  loading = false;
  error: string | null = null;
  page = 1;
  pageSize = 6;
  totalItems = 0;
  mutating = false;
  newPlatform: PlatformForm;
  editPlatform: PlatformForm;
  editingId: number | null = null;
  showCreateModal = false;
  showEditModal = false;

  constructor() {
    this.newPlatform = this.createDefaultForm();
    this.editPlatform = this.createDefaultForm();
  }

  get totalPages(): number {
    return this.totalItems === 0 ? 0 : Math.ceil(this.totalItems / this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  async onInit(): Promise<void> {
    await this.loadPlatforms();
  }

  async loadPlatforms(page = this.page): Promise<void> {
    this.setLoading(true);
    this.error = null;

    try {
      const { data, error } = await actions.quiz.fetchPlatforms({
        page,
        pageSize: this.pageSize,
      });
      if (error) {
        throw error;
      }
      const payload = data ?? { items: [], total: 0, page: 1, pageSize: this.pageSize };
      this.platforms = Array.isArray(payload.items) ? payload.items : [];
      this.totalItems = typeof payload.total === 'number' ? payload.total : this.platforms.length;
      this.page = typeof payload.page === 'number' ? payload.page : page;
      this.pageSize = typeof payload.pageSize === 'number' ? payload.pageSize : this.pageSize;
      if (this.totalItems === 0) {
        this.page = 1;
      }
      console.log('platforms', {
        page: this.page,
        pageSize: this.pageSize,
        totalItems: this.totalItems,
        platforms: this.platforms,
      });
    } catch (err) {
      console.error('Failed to load quiz platforms', err);
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

  async setPage(page: number): Promise<void> {
    const maxPage = this.totalPages === 0 ? 1 : this.totalPages;
    const clamped = Math.min(Math.max(1, page), maxPage);
    if (clamped === this.page && this.platforms.length > 0) {
      return;
    }
    await this.loadPlatforms(clamped);
  }

  async nextPage(): Promise<void> {
    if (this.page >= this.totalPages) return;
    await this.setPage(this.page + 1);
  }

  async prevPage(): Promise<void> {
    if (this.page <= 1) return;
    await this.setPage(this.page - 1);
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
    this.error = null;
    this.editingId = platform.id;
    this.editPlatform = {
      name: platform.name ?? '',
      description: platform.description ?? '',
      icon: platform.icon ?? '',
      type: platform.type ?? '',
      qCount: platform.qCount ?? 0,
      isActive: platform.isActive,
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
    const payload = this.buildPayload(this.newPlatform);
    if (!payload.name) {
      this.error = 'Name is required.';
      return;
    }

    this.mutating = true;
    try {
      const { error } = await actions.quiz.createPlatform(payload);
      if (error) {
        throw error;
      }
      this.newPlatform = this.createDefaultForm();
      await this.loadPlatforms(this.page);
      this.closeCreateModal(true);
    } catch (err) {
      console.error('Failed to create quiz platform', err);
      this.error = err instanceof Error ? err.message : 'Unable to create platform.';
    } finally {
      this.mutating = false;
    }
  }

  async saveEdit(): Promise<void> {
    if (this.editingId === null || this.mutating) return;
    const payload = this.buildPayload(this.editPlatform);
    if (!payload.name) {
      this.error = 'Name is required.';
      return;
    }

    this.mutating = true;
    try {
      const { data, error } = await actions.quiz.updatePlatform({
        id: this.editingId,
        ...payload,
      });
      if (error) {
        throw error;
      }

      const updated = data as PlatformRecord | null | undefined;

      if (updated && typeof updated.id === 'number') {
        const idx = this.platforms.findIndex((item) => item.id === updated.id);
        if (idx !== -1) {
          this.platforms.splice(idx, 1, updated);
        } else {
          await this.loadPlatforms(this.page);
        }
      } else {
        await this.loadPlatforms(this.page);
      }

      this.closeEditModal(true);
    } catch (err) {
      console.error('Failed to update quiz platform', err);
      this.error = err instanceof Error ? err.message : 'Unable to update platform.';
    } finally {
      this.mutating = false;
    }
  }

  async deletePlatform(id: number): Promise<void> {
    if (this.mutating) return;
    if (typeof window !== 'undefined' && !window.confirm('Delete this platform?')) {
      return;
    }

    this.mutating = true;
    try {
      const { error } = await actions.quiz.deletePlatform({ id });
      if (error) {
        throw error;
      }
      if (this.editingId === id) {
        this.closeEditModal(true);
      }
      await this.loadPlatforms(this.page);
    } catch (err) {
      console.error('Failed to delete quiz platform', err);
      this.error = err instanceof Error ? err.message : 'Unable to delete platform.';
    } finally {
      this.mutating = false;
    }
  }

  private resetNewForm(): void {
    this.newPlatform = this.createDefaultForm();
  }

  private resetEditState(): void {
    this.editingId = null;
    this.editPlatform = this.createDefaultForm();
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

  private buildPayload(form: PlatformForm) {
    const qCountValue = Number.isFinite(form.qCount) ? Math.round(form.qCount) : 0;
    const name = form.name.trim();
    return {
      name,
      description: form.description.trim(),
      icon: form.icon.trim(),
      type: form.type.trim() || null,
      qCount: Math.max(0, qCountValue),
      isActive: !!form.isActive,
    };
  }
}

export type QuizStore = QuizStoreImpl;

Alpine.store('quiz', new QuizStoreImpl());

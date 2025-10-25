import Alpine from 'alpinejs';
import { actions } from 'astro:actions';
import { BaseStore } from './base';
import {
  defaultCardData,
  visitingCardTemplates,
  visitingCardThemes,
  type VisitingCardData,
  type VisitingCardTemplateKey,
  type VisitingCardThemeId,
  type VisitingCardRecord,
} from '../lib/visiting-card-maker/schema';

const resolveActions = () => {
  const registry = actions as unknown as Record<string, any>;
  return (
    registry.card ??
    registry['visiting-card-maker'] ??
    registry.visitingCard ??
    registry['visiting-card'] ??
    {}
  );
};

const visitingCardActions = resolveActions();

type ToastState = { type: 'success' | 'error'; message: string } | null;

type ExportState = {
  loading: boolean;
  url: string | null;
  filename: string | null;
  format: string | null;
  requestedFormat: string | null;
  note: string | null;
};

type SavedState = {
  loading: boolean;
  items: VisitingCardRecord[];
  filtered: VisitingCardRecord[];
  filters: {
    search: string;
    template: 'all' | VisitingCardTemplateKey;
  };
};

const createExportState = (): ExportState => ({
  loading: false,
  url: null,
  filename: null,
  format: null,
  requestedFormat: null,
  note: null,
});

const createSavedState = (): SavedState => ({
  loading: false,
  items: [],
  filtered: [],
  filters: {
    search: '',
    template: 'all',
  },
});

class VisitingCardStore extends BaseStore {
  private initialized = false;

  state = {
    loading: false,
    cardData: defaultCardData() as VisitingCardData,
    theme: visitingCardThemes[0]?.id ?? ('aurora' as VisitingCardThemeId),
    template: visitingCardTemplates[0]?.key ?? ('minimal' as VisitingCardTemplateKey),
    aiTagline: '',
    previewVersion: 0,
    toast: null as ToastState,
    export: createExportState(),
    saved: createSavedState(),
  };

  templates = visitingCardTemplates;
  themes = visitingCardThemes;

  onInit(): void {
    this.init();
  }

  init(): void {
    if (this.initialized) return;
    this.initialized = true;
    this.updatePreview();
    void this.loadSavedCards();
  }

  private setToast(type: 'success' | 'error', message: string): void {
    this.state.toast = { type, message };
    setTimeout(() => {
      this.state.toast = null;
    }, 3200);
  }

  resetCard(): void {
    this.state.cardData = defaultCardData();
    this.state.theme = visitingCardThemes[0]?.id ?? this.state.theme;
    this.state.template = visitingCardTemplates[0]?.key ?? this.state.template;
    this.state.aiTagline = '';
    this.updatePreview();
  }

  updatePreview(): void {
    this.state.previewVersion = Date.now();
  }

  updateCardField(field: keyof VisitingCardData, value: string): void {
    this.state.cardData[field] = value;
    if (field !== 'tagline') {
      this.state.aiTagline = '';
    }
    this.updatePreview();
  }

  selectTheme(theme: VisitingCardThemeId): void {
    this.state.theme = theme;
    this.updatePreview();
  }

  selectTemplate(template: VisitingCardTemplateKey): void {
    this.state.template = template;
    this.updatePreview();
  }

  private applySavedFilters(): void {
    const { items, filters } = this.state.saved;
    const normalizedSearch = filters.search.trim().toLowerCase();
    const templateFilter = filters.template;

    const filtered = items.filter((item) => {
      const matchesTemplate = templateFilter === 'all' || item.template === templateFilter;
      if (!matchesTemplate) return false;
      if (!normalizedSearch) return true;
      const haystack = [
        item.name,
        item.company,
        item.title,
        item.email,
        item.phone,
        item.tagline,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });

    this.state.saved.filtered = filtered;
  }

  setFilter(key: 'search' | 'template', value: string): void {
    if (key === 'template') {
      this.state.saved.filters.template = (value || 'all') as 'all' | VisitingCardTemplateKey;
    } else {
      this.state.saved.filters.search = value;
    }
    this.applySavedFilters();
  }

  async loadSavedCards(): Promise<void> {
    if (this.state.saved.loading || typeof visitingCardActions.list !== 'function') {
      return;
    }
    this.state.saved.loading = true;
    this.setLoaderVisible(true);
    try {
      const { data, error } = await visitingCardActions.list({});
      if (error) throw error;
      const items = (data?.items ?? []) as VisitingCardRecord[];
      this.state.saved.items = items;
      this.applySavedFilters();
    } catch (error) {
      console.error('Unable to load visiting cards', error);
      this.state.saved.items = [];
      this.applySavedFilters();
    } finally {
      this.state.saved.loading = false;
      this.setLoaderVisible(false);
    }
  }

  private upsertCard(record: VisitingCardRecord): void {
    const items = this.state.saved.items;
    const existingIndex = items.findIndex((item) => item.id === record.id);
    if (existingIndex === -1) {
      items.unshift(record);
    } else {
      items.splice(existingIndex, 1, record);
    }
    this.applySavedFilters();
  }

  async generateTagline(): Promise<void> {
    if (this.state.loading || typeof visitingCardActions.generateTagline !== 'function') {
      return;
    }
    const { name, company, title } = this.state.cardData;
    if (!name || !company) {
      this.setToast('error', 'Add at least a name and company to generate a tagline.');
      return;
    }
    this.state.loading = true;
    this.setLoaderVisible(true);
    try {
      const { data, error } = await visitingCardActions.generateTagline({
        name,
        company,
        title,
      });
      if (error) throw error;
      const tagline = data?.tagline as string | undefined;
      if (tagline) {
        this.state.cardData.tagline = tagline;
        this.state.aiTagline = tagline;
        this.updatePreview();
        this.setToast('success', 'Tagline generated successfully.');
      }
    } catch (error) {
      console.error('Unable to generate tagline', error);
      this.setToast('error', 'Unable to generate tagline right now.');
    } finally {
      this.state.loading = false;
      this.setLoaderVisible(false);
    }
  }

  async saveCard(): Promise<void> {
    if (typeof visitingCardActions.save !== 'function') {
      return;
    }
    this.state.loading = true;
    this.setLoaderVisible(true);
    try {
      const payload = {
        ...this.state.cardData,
        template: this.state.template,
        theme: this.state.theme,
      };
      const { data, error } = await visitingCardActions.save(payload);
      if (error) throw error;
      const record = data?.card as VisitingCardRecord | undefined;
      if (record) {
        this.upsertCard(record);
        this.setToast('success', 'Card saved to your collection.');
      }
    } catch (error) {
      console.error('Unable to save visiting card', error);
      this.setToast('error', 'Saving failed — try again after refreshing.');
    } finally {
      this.state.loading = false;
      this.setLoaderVisible(false);
    }
  }

  async deleteCard(id: string): Promise<void> {
    if (typeof visitingCardActions.delete !== 'function') {
      return;
    }
    this.state.saved.loading = true;
    try {
      const { error } = await visitingCardActions.delete({ id });
      if (error) throw error;
      this.state.saved.items = this.state.saved.items.filter((item) => item.id !== id);
      this.applySavedFilters();
      this.setToast('success', 'Card removed.');
    } catch (error) {
      console.error('Unable to delete visiting card', error);
      this.setToast('error', 'Could not delete the card.');
    } finally {
      this.state.saved.loading = false;
    }
  }

  async exportCard(format: 'pdf' | 'png' | 'svg'): Promise<void> {
    if (typeof visitingCardActions.export !== 'function') {
      return;
    }
    if (this.state.export.loading) {
      return;
    }
    this.state.export = { ...createExportState(), loading: true };
    this.setLoaderVisible(true);
    try {
      const payload = {
        format,
        card: {
          ...this.state.cardData,
          template: this.state.template,
          theme: this.state.theme,
        },
      };
      const { data, error } = await visitingCardActions.export(payload);
      if (error) throw error;
      this.state.export = {
        loading: false,
        url: (data?.url as string) ?? null,
        filename: (data?.filename as string) ?? null,
        format: (data?.format as string) ?? null,
        requestedFormat: (data?.requestedFormat as string) ?? null,
        note: (data?.note as string | null) ?? null,
      };
      if (this.state.export.url && this.state.export.filename) {
        const link = document.createElement('a');
        link.href = this.state.export.url;
        link.download = this.state.export.filename;
        link.rel = 'noopener';
        link.click();
      }
      if (this.state.export.note) {
        this.setToast('success', this.state.export.note);
      } else {
        this.setToast('success', 'Export ready — check your downloads.');
      }
    } catch (error) {
      console.error('Unable to export visiting card', error);
      this.state.export = { ...createExportState(), loading: false };
      this.setToast('error', 'Export failed — please try again.');
    } finally {
      this.setLoaderVisible(false);
    }
  }

  getSavedCards(): VisitingCardRecord[] {
    return this.state.saved.filtered;
  }

  get hasSavedCards(): boolean {
    return this.state.saved.filtered.length > 0;
  }

  duplicateCard(record: VisitingCardRecord): void {
    this.state.cardData = {
      name: record.name,
      title: record.title,
      company: record.company,
      email: record.email,
      phone: record.phone,
      address: record.address,
      website: record.website,
      tagline: record.tagline,
    };
    this.state.theme = record.theme;
    this.state.template = record.template;
    this.updatePreview();
    this.setToast('success', 'Template loaded into the editor.');
  }
}

Alpine.store('visiting-card-maker', new VisitingCardStore());

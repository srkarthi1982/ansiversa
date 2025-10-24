import Alpine from 'alpinejs';
import { BaseStore, clone } from '../base';
import { actions } from 'astro:actions';
import {
  createEmptyProposalData,
  proposalTemplateOptions,
  calculateBudgetTotals,
  type ProposalData,
  type ProposalTemplateKey,
  type ProposalStatus,
  type ProposalTone,
} from '../../lib/proposal/schema';
import { describeProposalSummary, formatCurrency, ensureHexColor, nowIso } from '../../lib/proposal/utils';

const setByPath = (target: any, path: string, value: any) => {
  const normalized = path.replace(/\[(\w+)\]/g, '.$1');
  const segments = normalized.split('.').filter(Boolean);
  if (segments.length === 0) return target;
  let cursor = target;
  for (let index = 0; index < segments.length - 1; index += 1) {
    const key = segments[index]!;
    if (typeof cursor[key] !== 'object' || cursor[key] === null) {
      const nextKey = segments[index + 1];
      cursor[key] = Number.isInteger(Number(nextKey)) ? [] : {};
    }
    cursor = cursor[key];
  }
  cursor[segments.at(-1)!] = value;
  return target;
};

const formatRelative = (dateString?: string | null) => {
  if (!dateString) return 'never';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'invalid';
  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, 'minute');
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 48) {
    return formatter.format(diffHours, 'hour');
  }
  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, 'day');
};

type ProposalRecord = {
  id: string;
  userId: string;
  title: string;
  templateKey: ProposalTemplateKey;
  status: ProposalStatus;
  currency: string;
  slug: string | null;
  data: ProposalData;
  lastSavedAt: string | null;
  createdAt: string | null;
};

type AutosaveTimer = ReturnType<typeof setTimeout> | null;

type BuilderInitInput = {
  id?: string | null;
};

type ToastState = { message: string; type: 'success' | 'error' } | null;

class ProposalStore extends BaseStore {
  state: {
    loading: boolean;
    proposals: ProposalRecord[];
    filtered: ProposalRecord[];
    filters: {
      template: ProposalTemplateKey | 'all';
      status: ProposalStatus | 'all';
      search: string;
    };
  } = {
    loading: false,
    proposals: [],
    filtered: [],
    filters: {
      template: 'all',
      status: 'all',
      search: '',
    },
  };

  builder = {
    id: null as string | null,
    title: 'Untitled proposal',
    templateKey: 'business' as ProposalTemplateKey,
    status: 'draft' as ProposalStatus,
    currency: 'USD',
    data: createEmptyProposalData(),
    loading: false,
    hasUnsavedChanges: false,
    lastSavedLabel: null as string | null,
    autosaveLabel: null as string | null,
    aiTone: 'professional' as ProposalTone,
    aiBusy: false,
    insightsLoading: false,
    shareUrl: null as string | null,
    toast: null as ToastState,
    briefDraft: '',
  };

  templates = proposalTemplateOptions;

  private autosaveTimer: AutosaveTimer = null;

  onInit(location?: Location) {
    const pathname = location?.pathname ?? window.location.pathname;
    if (pathname.startsWith('/proposal/builder')) {
      return;
    }
    if (pathname.startsWith('/proposal')) {
      this.initDashboard();
    }
  }

  initDashboard() {
    if (!this.state.loading && this.state.proposals.length === 0) {
      void this.loadList();
    }
  }

  async loadList() {
    this.state.loading = true;
    this.loader?.show();
    try {
      const { data, error } = await actions.proposal.list({});
      if (error) throw error;
      const items = (data?.items ?? []) as ProposalRecord[];
      this.state.proposals = items;
      this.applyFilters();
    } catch (error) {
      console.error('Unable to load proposals', error);
      this.state.proposals = [];
      this.state.filtered = [];
    } finally {
      this.state.loading = false;
      this.loader?.hide();
    }
  }

  applyFilters() {
    const { template, status, search } = this.state.filters;
    const query = search.toLowerCase().trim();
    const filtered = this.state.proposals.filter((proposal) => {
      if (template !== 'all' && proposal.templateKey !== template) return false;
      if (status !== 'all' && proposal.status !== status) return false;
      if (query.length > 0) {
        const haystack = `${proposal.title} ${proposal.data.client?.name ?? ''}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
    this.state.filtered = filtered;
  }

  setFilter(key: 'template' | 'status' | 'search', value: any) {
    (this.state.filters as any)[key] = value;
    this.applyFilters();
  }

  describe(proposal: ProposalRecord) {
    return describeProposalSummary(proposal.data);
  }

  formatRelative(dateString?: string | null) {
    return formatRelative(dateString);
  }

  formatCurrency(value: number, currency?: string) {
    return formatCurrency(value, currency ?? this.builder.currency);
  }

  async createDraft(templateKey?: ProposalTemplateKey) {
    try {
      this.loader?.show();
      const { data, error } = await actions.proposal.create(templateKey ? { templateKey } : {});
      if (error) throw error;
      if (data?.proposal) {
        const proposal = data.proposal as ProposalRecord;
        this.state.proposals.unshift(proposal);
        this.applyFilters();
        window.location.assign(`/proposal/builder?id=${proposal.id}`);
      }
    } catch (error) {
      console.error('Unable to create proposal', error);
      this.pushToast('Could not create proposal. Try again.', 'error');
    } finally {
      this.loader?.hide();
    }
  }

  async duplicate(id: string) {
    try {
      this.loader?.show();
      const { data, error } = await actions.proposal.duplicate({ id });
      if (error) throw error;
      if (data?.proposal) {
        this.upsertListRecord(data.proposal as ProposalRecord);
        this.applyFilters();
        this.pushToast('Proposal duplicated', 'success');
      }
    } catch (error) {
      console.error('Unable to duplicate proposal', error);
      this.pushToast('Duplicate failed.', 'error');
    } finally {
      this.loader?.hide();
    }
  }

  async delete(id: string) {
    if (!confirm('Delete this proposal? This action cannot be undone.')) {
      return;
    }
    try {
      this.loader?.show();
      const { error } = await actions.proposal.delete({ id });
      if (error) throw error;
      this.state.proposals = this.state.proposals.filter((item) => item.id !== id);
      this.applyFilters();
      this.pushToast('Proposal deleted', 'success');
    } catch (error) {
      console.error('Unable to delete proposal', error);
      this.pushToast('Delete failed.', 'error');
    } finally {
      this.loader?.hide();
    }
  }

  upsertListRecord(record: ProposalRecord) {
    const existingIndex = this.state.proposals.findIndex((item) => item.id === record.id);
    if (existingIndex >= 0) {
      this.state.proposals.splice(existingIndex, 1, record);
    } else {
      this.state.proposals.unshift(record);
    }
  }

  async initBuilder(options: BuilderInitInput) {
    if (this.builder.loading) return;
    this.builder.loading = true;
    this.loader?.show();
    try {
      if (options.id) {
        const { data, error } = await actions.proposal.get({ id: options.id });
        if (error) throw error;
        if (data?.proposal) {
          this.setBuilderRecord(data.proposal as ProposalRecord);
        }
      } else {
        const { data, error } = await actions.proposal.create({});
        if (error) throw error;
        if (data?.proposal) {
          this.setBuilderRecord(data.proposal as ProposalRecord);
          window.history.replaceState({}, '', `/proposal/builder?id=${data.proposal.id}`);
        }
      }
    } catch (error) {
      console.error('Unable to initialise proposal builder', error);
      this.pushToast('Unable to load proposal.', 'error');
    } finally {
      this.builder.loading = false;
      this.loader?.hide();
    }
  }

  setBuilderRecord(record: ProposalRecord) {
    this.builder.id = record.id;
    this.builder.title = record.title;
    this.builder.templateKey = record.templateKey;
    this.builder.status = record.status;
    this.builder.currency = record.currency ?? 'USD';
    this.builder.data = clone(record.data ?? createEmptyProposalData());
    this.builder.lastSavedLabel = formatRelative(record.lastSavedAt ?? record.createdAt ?? nowIso());
    this.builder.autosaveLabel = null;
    this.builder.hasUnsavedChanges = false;
    this.builder.shareUrl = record.slug ? `/proposal/view/${record.slug}` : null;
    this.recalculateBudget();
    this.upsertListRecord(record);
    this.applyFilters();
  }

  recalculateBudget() {
    const totals = calculateBudgetTotals(this.builder.data.budget);
    this.builder.data.budget = { ...this.builder.data.budget, ...totals };
  }

  markDirty() {
    this.builder.hasUnsavedChanges = true;
    this.builder.autosaveLabel = 'Saving...';
    this.scheduleAutosave();
  }

  scheduleAutosave() {
    if (this.autosaveTimer) {
      clearTimeout(this.autosaveTimer);
    }
    this.autosaveTimer = setTimeout(() => {
      void this.saveNow();
    }, 1200);
  }

  cancelAutosave() {
    if (this.autosaveTimer) {
      clearTimeout(this.autosaveTimer);
      this.autosaveTimer = null;
    }
  }

  async saveNow() {
    if (!this.builder.id) return;
    this.cancelAutosave();
    this.recalculateBudget();
    try {
      const payload = {
        id: this.builder.id,
        title: this.builder.title,
        templateKey: this.builder.templateKey,
        status: this.builder.status,
        currency: this.builder.currency,
        data: this.builder.data,
      };
      const { data, error } = await actions.proposal.save(payload);
      if (error) throw error;
      if (data?.proposal) {
        const record = data.proposal as ProposalRecord;
        this.builder.lastSavedLabel = formatRelative(record.lastSavedAt ?? nowIso());
        this.builder.hasUnsavedChanges = false;
        this.builder.autosaveLabel = 'Saved';
        setTimeout(() => {
          this.builder.autosaveLabel = null;
        }, 1800);
        this.upsertListRecord(record);
        this.applyFilters();
      }
    } catch (error) {
      console.error('Unable to save proposal', error);
      this.pushToast('Autosave failed.', 'error');
      this.builder.autosaveLabel = 'Retrying...';
      this.scheduleAutosave();
    }
  }

  updateField(path: string, value: any) {
    const next = clone(this.builder.data);
    setByPath(next, path, value);
    this.builder.data = next;
    this.recalculateBudget();
    this.markDirty();
  }

  updateBudgetValue(index: number, key: 'label' | 'qty' | 'unitPrice' | 'notes' | 'total', rawValue: string | number) {
    const items = clone(this.builder.data.budget.items ?? []);
    if (!items[index]) return;
    const item = { ...items[index] };
    if (key === 'qty' || key === 'unitPrice' || key === 'total') {
      const numeric = Number(rawValue) || 0;
      item[key] = numeric;
    } else {
      item[key] = String(rawValue ?? '');
    }
    if (key === 'qty' || key === 'unitPrice') {
      const qty = Number(item.qty) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      item.total = Number((qty * unitPrice).toFixed(2));
    }
    items.splice(index, 1, item);
    this.builder.data.budget.items = items;
    this.recalculateBudget();
    this.markDirty();
  }

  updateBudgetMeta(key: 'tax' | 'discount' | 'notes', rawValue: string) {
    if (key === 'notes') {
      this.builder.data.budget.notes = rawValue ?? '';
    } else {
      const numeric = Number(rawValue) || 0;
      (this.builder.data.budget as any)[key] = numeric;
    }
    this.recalculateBudget();
    this.markDirty();
  }

  addListItem(section: keyof ProposalData, value: any) {
    const next = clone(this.builder.data);
    const list = (next as any)[section];
    if (Array.isArray(list)) {
      list.push(value);
      (next as any)[section] = list;
      this.builder.data = next;
      this.recalculateBudget();
      this.markDirty();
    }
  }

  addBudgetItem(value: { label: string; qty: number; unitPrice: number; total: number; notes: string }) {
    const items = clone(this.builder.data.budget.items ?? []);
    items.push(value);
    this.builder.data.budget.items = items;
    this.recalculateBudget();
    this.markDirty();
  }

  removeListItem(section: keyof ProposalData, index: number) {
    const next = clone(this.builder.data);
    const list = (next as any)[section];
    if (Array.isArray(list)) {
      list.splice(index, 1);
      (next as any)[section] = list;
      this.builder.data = next;
      this.recalculateBudget();
      this.markDirty();
    }
  }

  removeBudgetItem(index: number) {
    const items = clone(this.builder.data.budget.items ?? []);
    items.splice(index, 1);
    this.builder.data.budget.items = items;
    this.recalculateBudget();
    this.markDirty();
  }

  updateTitle(value: string) {
    this.builder.title = value;
    this.markDirty();
  }

  updateTemplate(value: ProposalTemplateKey) {
    this.builder.templateKey = value;
    this.markDirty();
  }

  updateStatus(value: ProposalStatus) {
    this.builder.status = value;
    this.markDirty();
  }

  updateCurrency(value: string) {
    this.builder.currency = value.toUpperCase();
    this.builder.data.budget.currency = this.builder.currency;
    this.recalculateBudget();
    this.markDirty();
  }

  async publishCurrent() {
    if (!this.builder.id) return;
    try {
      this.loader?.show();
      const { data, error } = await actions.proposal.publish({ id: this.builder.id });
      if (error) throw error;
      if (data?.proposal) {
        const record = data.proposal as ProposalRecord;
        this.setBuilderRecord(record);
        this.pushToast('Proposal published', 'success');
      }
    } catch (error) {
      console.error('Publish failed', error);
      this.pushToast('Publish failed. Try again.', 'error');
    } finally {
      this.loader?.hide();
    }
  }

  async publishFromList(id: string) {
    try {
      this.loader?.show();
      const { data, error } = await actions.proposal.publish({ id });
      if (error) throw error;
      if (data?.proposal) {
        const record = data.proposal as ProposalRecord;
        this.upsertListRecord(record);
        this.applyFilters();
        if (this.builder.id === record.id) {
          this.setBuilderRecord(record);
        }
        this.pushToast('Proposal published', 'success');
      }
    } catch (error) {
      console.error('Publish failed', error);
      this.pushToast('Publish failed. Try again.', 'error');
    } finally {
      this.loader?.hide();
    }
  }

  async export(format: 'pdf' | 'docx' | 'md') {
    if (!this.builder.id) return;
    try {
      const { data, error } = await actions.proposal.export({ id: this.builder.id, format });
      if (error) throw error;
      if (data?.url) {
        this.pushToast(`Export queued (${format.toUpperCase()})`, 'success');
      }
    } catch (error) {
      console.error('Export failed', error);
      this.pushToast('Export failed.', 'error');
    }
  }

  async runAIDraft(input: { client: string; industry?: string; services?: string[] }) {
    this.builder.aiBusy = true;
    try {
      const payload = {
        client: input.client || this.builder.data.client.name || 'your organisation',
        industry: input.industry || this.builder.data.client.industry || 'general',
        services: input.services ?? this.builder.data.scope.slice(0, 3),
        tone: this.builder.aiTone,
      };
      const { data, error } = await actions.proposal.aiDraft(payload);
      if (error) throw error;
      if (data) {
        const next = clone(this.builder.data);
        next.overview = data.overview ?? next.overview;
        if (Array.isArray(data.scope)) next.scope = data.scope;
        if (Array.isArray(data.deliverables)) next.deliverables = data.deliverables;
        if (Array.isArray(data.timeline)) next.timeline = data.timeline;
        if (data.budget) next.budget = { ...next.budget, ...data.budget };
        this.builder.data = next;
        this.recalculateBudget();
        this.markDirty();
        this.pushToast('AI draft applied', 'success');
      }
    } catch (error) {
      console.error('AI draft failed', error);
      this.pushToast('AI draft unavailable.', 'error');
    } finally {
      this.builder.aiBusy = false;
    }
  }

  async improveSection(text: string) {
    if (!text?.trim()) return undefined;
    this.builder.aiBusy = true;
    try {
      const { data, error } = await actions.proposal.aiImprove({ text, tone: this.builder.aiTone });
      if (error) throw error;
      return data?.text as string | undefined;
    } catch (error) {
      console.error('AI improve failed', error);
      this.pushToast('Could not improve this section.', 'error');
      return undefined;
    } finally {
      this.builder.aiBusy = false;
    }
  }

  async analyzeBrief(text: string) {
    if (!text?.trim()) return;
    this.builder.insightsLoading = true;
    try {
      const { data, error } = await actions.proposal.briefAnalyze({ text, industry: this.builder.data.client.industry });
      if (error) throw error;
      if (data) {
        this.builder.data.briefInsights = {
          goals: data.goals ?? [],
          requirements: data.requirements ?? [],
          risks: data.risks ?? [],
          timelineHints: data.timelineHints ?? [],
        };
        this.markDirty();
        this.pushToast('Brief analysed', 'success');
      }
    } catch (error) {
      console.error('Brief analysis failed', error);
      this.pushToast('Analysis failed.', 'error');
    } finally {
      this.builder.insightsLoading = false;
    }
  }

  setAccentColor(value: string) {
    this.builder.data.branding.accentColor = ensureHexColor(value, '#4f46e5');
    this.markDirty();
  }

  pushToast(message: string, type: 'success' | 'error' = 'success') {
    this.builder.toast = { message, type };
    setTimeout(() => {
      if (this.builder.toast?.message === message) {
        this.builder.toast = null;
      }
    }, 4000);
  }
}

Alpine.store('proposal', new ProposalStore());

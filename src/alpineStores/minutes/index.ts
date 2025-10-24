import Alpine from 'alpinejs';
import { BaseStore } from '../base';
import { actions } from 'astro:actions';
import type {
  MinutesRecord,
  MinutesTemplateKey,
  MinutesSummarySectionKey,
  MinutesActionItem,
} from '../../lib/minutes/schema';
import {
  minutesTemplates,
  createEmptyMinutesSummary,
  createEmptyMinutesTranscript,
  createEmptyMinutesAttendee,
} from '../../lib/minutes/schema';
import {
  formatMeetingDate,
  formatDuration,
  describeSummary,
  getTemplateLabel,
  resolvePlanLimits,
  formatRelativeTime,
  buildDemoSummary,
} from '../../lib/minutes/utils';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

type Toast = { message: string; type: 'success' | 'error' } | null;

type MinutesListItem = MinutesRecord & {
  agendaLabel: string;
  summaryDescription: string;
  openActions: number;
};

type BuilderTab = 'summary' | 'transcript' | 'actions' | 'meta';

type ActionTrackerItem = {
  id: string;
  minutesId: string;
  task: string;
  assignee: string;
  due: string | null;
  status: MinutesActionItem['status'];
  priority: MinutesActionItem['priority'];
  minutesTitle: string;
  templateKey: MinutesTemplateKey;
};

class MinutesStore extends BaseStore {
  state = {
    loading: false,
    plan: 'free' as 'free' | 'pro',
    items: [] as MinutesListItem[],
    filtered: [] as MinutesListItem[],
    filters: {
      status: 'all' as 'all' | MinutesRecord['status'],
      template: 'all' as 'all' | MinutesTemplateKey,
      search: '',
    },
    metrics: { total: 0, published: 0, openActions: 0, totalActions: 0 },
  };

  builder = {
    id: null as string | null,
    loading: false,
    plan: 'free' as 'free' | 'pro',
    title: 'Untitled meeting',
    meetingDate: '',
    templateKey: 'standup' as MinutesTemplateKey,
    status: 'draft' as MinutesRecord['status'],
    privacy: 'standard' as MinutesRecord['privacy'],
    attendees: [] as MinutesRecord['attendees'],
    summary: createEmptyMinutesSummary(),
    transcript: createEmptyMinutesTranscript(),
    durationSec: null as number | null,
    hasUnsavedChanges: false,
    autosaveLabel: null as string | null,
    lastSavedLabel: null as string | null,
    shareUrl: null as string | null,
    tab: 'summary' as BuilderTab,
    aiBusy: false,
    transcribing: false,
    exportBusy: false,
    toast: null as Toast,
  };

  templates = minutesTemplates;

  actionTracker = {
    loading: false,
    items: [] as ActionTrackerItem[],
    filtered: [] as ActionTrackerItem[],
    filters: {
      status: 'all' as 'all' | MinutesActionItem['status'],
      assignee: 'all' as 'all' | string,
      meeting: 'all' as 'all' | string,
      search: '',
      showDone: true,
    },
  };

  private listInitialized = false;
  private autosaveTimer: ReturnType<typeof setTimeout> | null = null;

  onInit(location?: Location) {
    const pathname = location?.pathname ?? window.location.pathname;
    if (pathname.startsWith('/minutes/builder')) {
      const params = new URLSearchParams(location?.search ?? window.location.search);
      const id = params.get('id');
      this.initBuilder({ id });
      return;
    }
    if (pathname.startsWith('/minutes/templates')) {
      this.initTemplates();
      return;
    }
    if (pathname.startsWith('/minutes/actions')) {
      this.initActions();
      return;
    }
    this.initDashboard();
  }

  initDashboard() {
    this.ensureList();
  }

  initTemplates() {
    this.ensureList();
  }

  initActions() {
    this.ensureList();
    this.refreshActionTracker();
  }

  initBuilder(options: { id?: string | null } = {}) {
    this.ensureList();
    void this.loadBuilder(options.id ?? null);
  }

  private ensureList() {
    if (this.listInitialized) return;
    this.listInitialized = true;
    void this.loadList();
  }

  async loadList() {
    this.state.loading = true;
    this.loader?.show();
    try {
      const { data, error } = await actions.minutes.list({});
      if (error) throw error;
      const items = ((data?.items ?? []) as MinutesRecord[]).map((record) => this.decorate(record));
      this.state.items = items;
      this.state.plan = (data?.plan ?? 'free') as 'free' | 'pro';
      this.applyFilters();
      this.updateMetrics();
      this.refreshActionTracker();
    } catch (error) {
      console.error('Failed to load minutes', error);
      this.state.items = [];
      this.state.filtered = [];
      this.updateMetrics();
    } finally {
      this.state.loading = false;
      this.loader?.hide();
    }
  }

  private decorate(record: MinutesRecord): MinutesListItem {
    const openActions = record.summary.actionItems.filter((item) => item.status !== 'done').length;
    return {
      ...record,
      agendaLabel: record.summary.agenda.length ? record.summary.agenda[0] : 'No agenda yet',
      summaryDescription: describeSummary(record.summary),
      openActions,
    };
  }

  applyFilters() {
    const { status, template, search } = this.state.filters;
    const query = search.trim().toLowerCase();
    this.state.filtered = this.state.items.filter((item) => {
      if (status !== 'all' && item.status !== status) return false;
      if (template !== 'all' && item.templateKey !== template) return false;
      if (query) {
        const haystack = `${item.title} ${item.summaryDescription} ${item.summary.agenda.join(' ')}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }

  setFilter(key: 'status' | 'template' | 'search', value: string) {
    // @ts-expect-error dynamic assignment
    this.state.filters[key] = value;
    this.applyFilters();
  }

  private updateMetrics() {
    const metrics = this.state.items.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.status === 'published') acc.published += 1;
        acc.openActions += item.openActions;
        acc.totalActions += item.summary.actionItems.length;
        return acc;
      },
      { total: 0, published: 0, openActions: 0, totalActions: 0 },
    );
    this.state.metrics = metrics;
  }

  async createDraft(templateKey?: MinutesTemplateKey) {
    try {
      this.loader?.show();
      const { data, error } = await actions.minutes.create({ templateKey });
      if (error) throw error;
      const record = data?.minutes as MinutesRecord | undefined;
      if (record) {
        const decorated = this.decorate(record);
        this.state.items.unshift(decorated);
        this.applyFilters();
        this.updateMetrics();
        await this.loadBuilder(record.id);
      }
    } catch (error) {
      console.error('Failed to create minutes', error);
      this.showToast('Unable to create minutes. Try again.', 'error');
    } finally {
      this.loader?.hide();
    }
  }

  async loadBuilder(id: string | null) {
    this.builder.loading = true;
    this.loader?.show();
    try {
      let targetId = id;
      if (!targetId) {
        targetId = this.state.items[0]?.id ?? null;
      }
      if (!targetId) {
        await this.createDraft();
        return;
      }
      const { data, error } = await actions.minutes.get({ id: targetId });
      if (error) throw error;
      const minutes = data?.minutes as MinutesRecord | undefined;
      if (minutes) {
        this.populateBuilder(minutes);
      }
    } catch (error) {
      console.error('Failed to load builder', error);
      this.showToast('Unable to load meeting minutes.', 'error');
    } finally {
      this.builder.loading = false;
      this.loader?.hide();
    }
  }

  private populateBuilder(record: MinutesRecord) {
    this.builder.id = record.id;
    this.builder.plan = this.state.plan;
    this.builder.title = record.title;
    this.builder.meetingDate = record.meetingDate ? record.meetingDate.slice(0, 10) : '';
    this.builder.templateKey = record.templateKey;
    this.builder.status = record.status;
    this.builder.privacy = record.privacy;
    this.builder.attendees = clone(record.attendees);
    this.builder.summary = clone(record.summary);
    this.builder.transcript = clone(record.transcript);
    this.builder.durationSec = record.durationSec ?? null;
    this.builder.hasUnsavedChanges = false;
    this.builder.autosaveLabel = null;
    this.builder.lastSavedLabel = formatRelativeTime(record.lastSavedAt);
    this.builder.shareUrl = record.slug ? `/minutes/view/${record.slug}` : null;
  }

  private async persistBuilder(payload: Record<string, unknown>) {
    if (!this.builder.id) return;
    try {
      const { data, error } = await actions.minutes.save({
        id: this.builder.id,
        data: payload,
      });
      if (error) throw error;
      const minutes = data?.minutes as MinutesRecord | undefined;
      if (minutes) {
        this.populateBuilder(minutes);
        this.replaceListItem(minutes);
        this.refreshActionTracker();
        this.updateMetrics();
      }
      this.builder.hasUnsavedChanges = false;
      this.builder.autosaveLabel = new Date().toLocaleTimeString();
    } catch (error) {
      console.error('Failed to save minutes', error);
      this.showToast('Save failed. Please retry.', 'error');
    }
  }

  private replaceListItem(record: MinutesRecord) {
    const decorated = this.decorate(record);
    const index = this.state.items.findIndex((item) => item.id === record.id);
    if (index >= 0) {
      this.state.items[index] = decorated;
    } else {
      this.state.items.unshift(decorated);
    }
    this.applyFilters();
  }

  private queueAutosave(payload: Record<string, unknown>) {
    if (this.autosaveTimer) {
      clearTimeout(this.autosaveTimer);
    }
    this.builder.hasUnsavedChanges = true;
    this.autosaveTimer = setTimeout(() => {
      void this.persistBuilder(payload);
    }, 1000);
  }

  commitSummary() {
    this.queueAutosave({ summary: this.builder.summary });
  }

  commitTranscript(options: { durationSec?: number } = {}) {
    const payload: Record<string, unknown> = { transcript: this.builder.transcript };
    if (typeof options.durationSec === 'number') {
      payload.durationSec = options.durationSec;
    }
    this.queueAutosave(payload);
  }

  updateTitle(value: string) {
    this.builder.title = value;
    this.queueAutosave({ title: value });
  }

  updateMeetingDate(value: string) {
    this.builder.meetingDate = value;
    this.queueAutosave({ meetingDate: value || null });
  }

  setTemplate(key: MinutesTemplateKey) {
    this.builder.templateKey = key;
    this.queueAutosave({ templateKey: key, summary: buildDemoSummary(key) });
  }

  setPrivacy(value: MinutesRecord['privacy']) {
    this.builder.privacy = value;
    this.queueAutosave({ privacy: value });
  }

  setStatus(value: MinutesRecord['status']) {
    this.builder.status = value;
    this.queueAutosave({ status: value });
  }

  setTab(tab: BuilderTab) {
    this.builder.tab = tab;
  }

  addAttendee() {
    this.builder.attendees.push(createEmptyMinutesAttendee());
    this.queueAutosave({ attendees: this.builder.attendees });
  }

  updateAttendee(index: number, key: 'name' | 'email' | 'role' | 'optional', value: string | boolean) {
    const attendee = this.builder.attendees[index];
    if (!attendee) return;
    // @ts-expect-error dynamic assignment
    attendee[key] = value;
    this.queueAutosave({ attendees: this.builder.attendees });
  }

  removeAttendee(index: number) {
    this.builder.attendees.splice(index, 1);
    this.queueAutosave({ attendees: this.builder.attendees });
  }

  addSummaryItem(section: MinutesSummarySectionKey) {
    if (section === 'actionItems') {
      this.builder.summary.actionItems.push({
        id: crypto.randomUUID(),
        task: '',
        assignee: '',
        due: null,
        priority: 'med',
        status: 'open',
      });
    } else {
      (this.builder.summary as any)[section].push('');
    }
    this.commitSummary();
  }

  updateSummaryItem(section: MinutesSummarySectionKey, index: number, value: string) {
    if (section === 'actionItems') return;
    const list = (this.builder.summary as any)[section] as string[];
    if (!list || typeof list[index] === 'undefined') return;
    list[index] = value;
    this.commitSummary();
  }

  removeSummaryItem(section: MinutesSummarySectionKey, index: number) {
    const list = (this.builder.summary as any)[section];
    if (!Array.isArray(list)) return;
    list.splice(index, 1);
    this.commitSummary();
  }

  updateActionItem(index: number, field: keyof MinutesActionItem, value: string) {
    const item = this.builder.summary.actionItems[index];
    if (!item) return;
    if (field === 'due') {
      (item as any)[field] = value || null;
    } else {
      (item as any)[field] = value;
    }
    this.commitSummary();
  }

  toggleActionStatus(index: number) {
    const item = this.builder.summary.actionItems[index];
    if (!item) return;
    item.status = item.status === 'done' ? 'open' : 'done';
    this.commitSummary();
  }

  removeActionItem(index: number) {
    this.builder.summary.actionItems.splice(index, 1);
    this.commitSummary();
  }

  async summarize() {
    if (!this.builder.id) return;
    this.builder.aiBusy = true;
    try {
      const { data, error } = await actions.minutes.summarize({ id: this.builder.id });
      if (error) throw error;
      const summary = data?.summary as MinutesRecord['summary'] | undefined;
      if (summary) {
        this.builder.summary = clone(summary);
        this.commitSummary();
      }
      this.showToast('Summary updated with AI suggestions.', 'success');
    } catch (error) {
      console.error('Summarize failed', error);
      this.showToast('Unable to summarize. Try again later.', 'error');
    } finally {
      this.builder.aiBusy = false;
    }
  }

  async transcribe(durationSec = 120) {
    if (!this.builder.id) return;
    this.builder.transcribing = true;
    try {
      const { data, error } = await actions.minutes.transcribe({
        id: this.builder.id,
        durationSec,
      });
      if (error) throw error;
      const transcript = data?.transcript as MinutesRecord['transcript'] | undefined;
      if (transcript) {
        this.builder.transcript = clone(transcript);
        this.commitTranscript({ durationSec });
      }
      this.showToast('Audio processed successfully.', 'success');
    } catch (error) {
      console.error('Transcription failed', error);
      this.showToast('Unable to process audio.', 'error');
    } finally {
      this.builder.transcribing = false;
    }
  }

  async export(format: 'pdf' | 'docx' | 'md' | 'csv') {
    if (!this.builder.id) return;
    this.builder.exportBusy = true;
    try {
      const { data, error } = await actions.minutes.export({ id: this.builder.id, format });
      if (error) throw error;
      const url = data?.url as string | undefined;
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Export failed', error);
      this.showToast('Export failed. Check plan limits.', 'error');
    } finally {
      this.builder.exportBusy = false;
    }
  }

  async publish() {
    if (!this.builder.id) return;
    try {
      const { data, error } = await actions.minutes.publish({ id: this.builder.id });
      if (error) throw error;
      const slug = data?.slug as string | undefined;
      if (slug) {
        this.builder.shareUrl = `/minutes/view/${slug}`;
        this.builder.status = 'published';
        this.showToast('Minutes published successfully.', 'success');
        await this.loadList();
      }
    } catch (error) {
      console.error('Publish failed', error);
      this.showToast('Cannot publish yet. Fill in required fields.', 'error');
    }
  }

  async delete(id: string) {
    if (!confirm('Delete these meeting minutes?')) return;
    try {
      const { error } = await actions.minutes.delete({ id });
      if (error) throw error;
      this.state.items = this.state.items.filter((item) => item.id !== id);
      this.applyFilters();
      this.updateMetrics();
      if (this.builder.id === id) {
        this.builder.id = null;
        await this.loadBuilder(null);
      }
      this.refreshActionTracker();
      this.showToast('Minutes deleted.', 'success');
    } catch (error) {
      console.error('Delete failed', error);
      this.showToast('Unable to delete minutes.', 'error');
    }
  }

  private showToast(message: string, type: 'success' | 'error') {
    this.builder.toast = { message, type };
    setTimeout(() => {
      if (this.builder.toast?.message === message) {
        this.builder.toast = null;
      }
    }, 2400);
  }

  refreshActionTracker() {
    const items: ActionTrackerItem[] = [];
    this.state.items.forEach((record) => {
      record.summary.actionItems.forEach((action) => {
        items.push({
          id: action.id,
          minutesId: record.id,
          task: action.task,
          assignee: action.assignee ?? '',
          due: action.due ?? null,
          status: action.status,
          priority: action.priority,
          minutesTitle: record.title,
          templateKey: record.templateKey,
        });
      });
    });
    this.actionTracker.items = items;
    this.applyActionFilters();
  }

  applyActionFilters() {
    const { status, assignee, meeting, search, showDone } = this.actionTracker.filters;
    const query = search.trim().toLowerCase();
    this.actionTracker.filtered = this.actionTracker.items.filter((item) => {
      if (status !== 'all' && item.status !== status) return false;
      if (!showDone && item.status === 'done') return false;
      if (assignee !== 'all' && item.assignee.toLowerCase() !== assignee.toLowerCase()) return false;
      if (meeting !== 'all' && item.minutesId !== meeting) return false;
      if (query) {
        const haystack = `${item.task} ${item.assignee} ${item.minutesTitle}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }

  setActionFilter(key: keyof typeof this.actionTracker.filters, value: any) {
    // @ts-expect-error dynamic
    this.actionTracker.filters[key] = value;
    this.applyActionFilters();
  }

  formatMeetingDate = formatMeetingDate;
  formatDuration = formatDuration;
  describeSummary = describeSummary;
  getTemplateLabel = getTemplateLabel;
  resolvePlanLimits = resolvePlanLimits;
}

if (!Alpine.store('minutes')) {
  Alpine.store('minutes', new MinutesStore());
}

export type MinutesStoreType = MinutesStore;


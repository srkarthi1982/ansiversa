
import Alpine from 'alpinejs';
import { BaseStore } from '../../../alpineStores/base';
import {
  cloneActivity,
  cloneAnalysisMap,
  cloneCollections,
  cloneExports,
  cloneForms,
  clonePasses,
  clonePoems,
  clonePromptSeeds,
  cloneWorkspaceDrafts,
  computeLibraryMetrics,
  now,
  type PoemAnalysisSnapshot,
  type PoemCollection,
  type PoemExportPreset,
  type PoemForm,
  type PoemFormKey,
  type PoemLibraryMetrics,
  type PoemPlan,
  type PoemPromptSeed,
  type PoemRevisionPass,
  type PoemRevisionPassKey,
  type PoemSummary,
  type PoemWorkspaceDraft,
} from '../../../lib/poem-studio/schema';

type PoemFilters = {
  status: 'all' | 'draft' | 'final';
  form: 'all' | PoemFormKey;
  tone: 'all' | string;
  tag: 'all' | string;
  search: string;
};

type AiUsageSnapshot = {
  drafts: number;
  passes: number;
  validations: number;
  exports: number;
};

type WorkspaceTab = 'compose' | 'analysis' | 'revision';

type AnalysisChip = {
  key: 'meter' | 'rhyme' | 'imagery' | 'diction';
  label: string;
  value: string;
  tone: 'good' | 'ok' | 'warn';
};

const formatRelativeTime = (input?: string | null): string => {
  if (!input) return 'moments ago';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return 'moments ago';
  const nowDate = new Date();
  const diffMs = date.getTime() - nowDate.getTime();
  const diffMinutes = Math.round(diffMs / (60 * 1000));
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, 'minute');
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hour');
  }
  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, 'day');
};

const formatDate = (input?: string | null): string => {
  if (!input) return '—';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const sortByRecency = <T extends { timestamp: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

class PoemStudioStore extends BaseStore {
  state: {
    plan: PoemPlan;
    filters: PoemFilters;
    poems: PoemSummary[];
    collections: PoemCollection[];
    metrics: PoemLibraryMetrics;
    aiUsage: AiUsageSnapshot;
  } = {
    plan: 'pro',
    filters: {
      status: 'all',
      form: 'all',
      tone: 'all',
      tag: 'all',
      search: '',
    },
    poems: clonePoems(),
    collections: cloneCollections(),
    metrics: computeLibraryMetrics(clonePoems()),
    aiUsage: {
      drafts: 24,
      passes: 36,
      validations: 14,
      exports: 6,
    },
  };

  private analysisById: Record<string, PoemAnalysisSnapshot> = cloneAnalysisMap();

  private draftsById: Record<string, PoemWorkspaceDraft> = cloneWorkspaceDrafts();

  forms: PoemForm[] = cloneForms();

  passes: PoemRevisionPass[] = clonePasses();

  exportPresets: PoemExportPreset[] = cloneExports();

  promptSeeds: PoemPromptSeed[] = clonePromptSeeds();

  activity = sortByRecency(cloneActivity());

  view: {
    selectedPoemId: string | null;
    activeWorkspaceTab: WorkspaceTab;
    activePassKey: PoemRevisionPassKey;
    highlightedInsightId: string | null;
    selectedCollectionId: string | null;
  } = {
    selectedPoemId: null,
    activeWorkspaceTab: 'compose',
    activePassKey: 'imagery',
    highlightedInsightId: null,
    selectedCollectionId: null,
  };

  constructor() {
    super();
    this.state.metrics = computeLibraryMetrics(this.state.poems);
    this.view.selectedPoemId = this.state.poems[0]?.id ?? null;
    this.view.selectedCollectionId = this.state.collections[0]?.id ?? null;
  }

  get filteredPoems(): PoemSummary[] {
    const { filters } = this.state;
    const search = filters.search.trim().toLowerCase();
    return this.state.poems.filter((poem) => {
      if (filters.status !== 'all' && poem.status !== filters.status) return false;
      if (filters.form !== 'all' && poem.form !== filters.form) return false;
      if (filters.tone !== 'all' && poem.tone !== filters.tone) return false;
      if (filters.tag !== 'all' && !poem.tags.includes(filters.tag)) return false;
      if (search) {
        const haystack = `${poem.title} ${poem.theme} ${poem.tone} ${poem.tags.join(' ')}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  }

  get selectedPoem(): PoemSummary | null {
    const id = this.view.selectedPoemId;
    if (!id) return this.state.poems[0] ?? null;
    return this.state.poems.find((poem) => poem.id === id) ?? this.state.poems[0] ?? null;
  }

  get selectedForm(): PoemForm | null {
    const poem = this.selectedPoem;
    if (!poem) return null;
    return this.forms.find((form) => form.key === poem.form) ?? null;
  }

  get selectedAnalysis(): PoemAnalysisSnapshot | null {
    const poem = this.selectedPoem;
    if (!poem) return null;
    return this.analysisById[poem.id] ?? null;
  }

  get selectedDraft(): PoemWorkspaceDraft | null {
    const poem = this.selectedPoem;
    if (!poem) return null;
    return this.draftsById[poem.id] ?? null;
  }

  get selectedCollection(): PoemCollection | null {
    const id = this.view.selectedCollectionId;
    if (!id) return this.state.collections[0] ?? null;
    return this.state.collections.find((collection) => collection.id === id) ?? this.state.collections[0] ?? null;
  }

  get selectedCollectionPoems(): PoemSummary[] {
    const collection = this.selectedCollection;
    if (!collection) return [];
    const ids = new Set(collection.poemIds);
    return this.state.poems.filter((poem) => ids.has(poem.id));
  }

  get availableForms(): (PoemFilters['form'])[] {
    return ['all', ...this.forms.map((form) => form.key)];
  }

  get availableStatuses(): PoemFilters['status'][] {
    return ['all', 'draft', 'final'];
  }

  get availableTones(): (PoemFilters['tone'])[] {
    const tones = new Set<string>();
    this.state.poems.forEach((poem) => tones.add(poem.tone));
    return ['all', ...Array.from(tones)];
  }

  get availableTags(): (PoemFilters['tag'])[] {
    const tags = new Set<string>();
    this.state.poems.forEach((poem) => poem.tags.forEach((tag) => tags.add(tag)));
    return ['all', ...Array.from(tags)];
  }

  get analysisChips(): AnalysisChip[] {
    const analysis = this.selectedAnalysis;
    const summary = this.selectedPoem?.analysisSummary;
    if (!analysis || !summary) return [];
    const toneForScore = (score: number): AnalysisChip['tone'] => {
      if (score >= 80) return 'good';
      if (score >= 65) return 'ok';
      return 'warn';
    };
    return [
      { key: 'meter', label: 'Meter', value: `${analysis.meterScore}%`, tone: toneForScore(analysis.meterScore) },
      { key: 'rhyme', label: 'Rhyme', value: summary.rhymeScheme, tone: toneForScore(analysis.rhymeScore) },
      { key: 'imagery', label: 'Imagery', value: `${analysis.imageryScore}%`, tone: toneForScore(analysis.imageryScore) },
      { key: 'diction', label: 'Diction', value: `${analysis.dictionScore}%`, tone: toneForScore(analysis.dictionScore) },
    ];
  }

  get activePass(): PoemRevisionPass | null {
    return this.passes.find((pass) => pass.key === this.view.activePassKey) ?? null;
  }

  get isChapbookLocked(): boolean {
    return this.state.plan === 'free';
  }

  get advancedAnalysisLocked(): boolean {
    return this.state.plan === 'free';
  }

  get remainingFreeSlots(): number {
    if (this.state.plan !== 'free') return Infinity;
    const limit = 5;
    return Math.max(0, limit - this.state.poems.length);
  }

  setFilter<TField extends keyof PoemFilters>(field: TField, value: PoemFilters[TField]) {
    this.state.filters = {
      ...this.state.filters,
      [field]: value,
    };
  }

  resetFilters() {
    this.state.filters = {
      status: 'all',
      form: 'all',
      tone: 'all',
      tag: 'all',
      search: '',
    };
  }

  selectPoem(id: string) {
    if (this.view.selectedPoemId === id) return;
    this.view.selectedPoemId = id;
    this.view.highlightedInsightId = null;
  }

  setWorkspaceTab(tab: WorkspaceTab) {
    this.view.activeWorkspaceTab = tab;
  }

  setActivePass(key: PoemRevisionPassKey) {
    if (this.isPassLocked(key)) return;
    this.view.activePassKey = key;
  }

  setHighlightedInsight(id: string | null) {
    this.view.highlightedInsightId = id;
  }

  togglePlan() {
    this.state.plan = this.state.plan === 'free' ? 'pro' : 'free';
  }

  togglePinPoem(poemId: string) {
    const poem = this.state.poems.find((item) => item.id === poemId);
    if (!poem) return;
    poem.pinned = !poem.pinned;
  }

  selectCollection(collectionId: string) {
    this.view.selectedCollectionId = collectionId;
  }

  isFormLocked(formKey: PoemFormKey): boolean {
    const form = this.forms.find((item) => item.key === formKey);
    if (!form) return false;
    return form.gatedFor === 'pro' && this.state.plan === 'free';
  }

  isPoemLocked(poem: PoemSummary): boolean {
    return this.state.plan === 'free' && this.isFormLocked(poem.form);
  }

  isPassLocked(passKey: PoemRevisionPassKey): boolean {
    const pass = this.passes.find((item) => item.key === passKey);
    if (!pass) return false;
    return pass.gating === 'pro' && this.state.plan === 'free';
  }

  isExportLocked(presetId: string): boolean {
    const preset = this.exportPresets.find((item) => item.id === presetId);
    if (!preset) return false;
    return preset.plan === 'pro' && this.state.plan === 'free';
  }

  runPass(passKey: PoemRevisionPassKey) {
    if (this.isPassLocked(passKey)) return;
    const poem = this.selectedPoem;
    if (!poem) return;
    poem.aiPassCounts[passKey] = (poem.aiPassCounts[passKey] ?? 0) + 1;
    this.state.aiUsage.passes += 1;
    const draft = this.selectedDraft;
    if (draft) {
      draft.lastAnalysisAt = now();
    }
    this.pushActivity({
      id: `pass-${passKey}-${Date.now()}`,
      label: `${this.activePass?.label ?? 'Revision pass'} completed`,
      detail: `Ran ${passKey} pass on ${poem.title}.`,
      timestamp: now(),
      icon: 'fa-wand-magic-sparkles',
      tone: 'success',
    });
    this.refreshMetrics();
  }

  refreshAnalysis() {
    const poem = this.selectedPoem;
    if (!poem) return;
    const analysis = this.selectedAnalysis;
    if (analysis) {
      analysis.meterScore = Math.min(99, analysis.meterScore + 1);
      analysis.dictionScore = Math.min(99, analysis.dictionScore + 1);
    }
    this.state.aiUsage.validations += 1;
    this.pushActivity({
      id: `analysis-${poem.id}-${Date.now()}`,
      label: 'Analysis refreshed',
      detail: `Updated metrics for ${poem.title}.`,
      timestamp: now(),
      icon: 'fa-wave-square',
      tone: 'info',
    });
  }

  queueExport(presetId: string) {
    if (this.isExportLocked(presetId)) return;
    const poem = this.selectedPoem;
    if (!poem) return;
    const preset = this.exportPresets.find((item) => item.id === presetId);
    if (!preset) return;
    this.state.aiUsage.exports += 1;
    this.pushActivity({
      id: `export-${poem.id}-${presetId}`,
      label: `${preset.label} queued`,
      detail: `Preparing ${preset.formats.join('/').toUpperCase()} export for ${poem.title}.`,
      timestamp: now(),
      icon: 'fa-cloud-arrow-down',
      tone: 'info',
    });
  }

  generatePrompt(seedId: string) {
    const seed = this.promptSeeds.find((item) => item.id === seedId);
    if (!seed) return;
    this.state.aiUsage.drafts += 1;
    this.pushActivity({
      id: `seed-${seedId}-${Date.now()}`,
      label: 'Prompt seed expanded',
      detail: `Generated fresh draft starting point for ${seed.label}.`,
      timestamp: now(),
      icon: 'fa-sparkles',
      tone: 'success',
    });
  }

  private refreshMetrics() {
    this.state.metrics = computeLibraryMetrics(this.state.poems);
  }

  private pushActivity(activity: {
    id: string;
    label: string;
    detail: string;
    timestamp: string;
    icon: string;
    tone: 'success' | 'info' | 'warning';
  }) {
    this.activity = sortByRecency([activity, ...this.activity]).slice(0, 12);
  }

  formatRelative(input?: string | null) {
    return formatRelativeTime(input);
  }

  formatDate(input?: string | null) {
    return formatDate(input);
  }
}

const init = () => {
  if (Alpine.store('poem-studio')) return;
  Alpine.store('poem-studio', new PoemStudioStore());
};

if (typeof window !== 'undefined') {
  document.addEventListener('alpine:init', init);
  init();
}

export type { PoemSummary };

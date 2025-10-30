import Alpine from 'alpinejs';
import { BaseStore, clone } from '../../../alpineStores/base';
import {
  aggregateQuoteUsage,
  computeQuoteMetrics,
  quoteActivityLog,
  quoteApiEndpoints,
  quoteAttributionModes,
  quoteDeviceGuides,
  quoteExportPresets,
  quoteGenerationModes,
  quoteLengthLabels,
  quotePlanLimits,
  quoteRefinementPasses,
  sampleQuoteProjects,
  type QuoteAttributionModeKey,
  type QuoteDeviceKey,
  type QuoteGenerationMode,
  type QuotePlan,
  type QuoteProject,
  type QuoteRefinement,
  type QuoteRefinementType,
  type QuoteUsageSummary,
  type QuoteVariant,
} from '../../../lib/quote-forge/schema';

type QuoteFilters = {
  search: string;
  status: 'all' | 'draft' | 'ready' | 'archived';
  language: 'all' | QuoteProject['language'];
  tone: 'all' | QuoteVariant['tone'];
  persona: 'all' | QuoteVariant['persona'];
  device: 'all' | QuoteDeviceKey;
  tag: 'all' | string;
};

type QuoteWorkspaceTab = 'variants' | 'refine' | 'bundles' | 'schedule' | 'quality';

type GeneratorState = {
  modeId: QuoteGenerationMode['id'];
  tone: QuoteVariant['tone'];
  persona: QuoteVariant['persona'];
  length: QuoteVariant['length'];
  language: QuoteProject['language'];
  devices: QuoteDeviceKey[];
  attribution: QuoteAttributionModeKey;
  count: number;
};

const formatRelativeTime = (value?: string | null): string => {
  if (!value) return 'moments ago';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'moments ago';
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
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

const formatDate = (value?: string | null): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const defaultProjects = sampleQuoteProjects.map((project) => clone(project));

const aggregateLanguages = (projects: QuoteProject[]): string[] => {
  const languages = new Set<string>();
  projects.forEach((project) => {
    project.aiUsage.languagesUsed.forEach((language) => languages.add(language));
    languages.add(project.language);
  });
  return Array.from(languages);
};

class QuoteForgeStore extends BaseStore {
  state: {
    plan: QuotePlan;
    filters: QuoteFilters;
    projects: QuoteProject[];
    metrics: ReturnType<typeof computeQuoteMetrics>;
    activity: typeof quoteActivityLog;
    aiUsage: QuoteUsageSummary;
  } = {
    plan: 'pro',
    filters: {
      search: '',
      status: 'all',
      language: 'all',
      tone: 'all',
      persona: 'all',
      device: 'all',
      tag: 'all',
    },
    projects: defaultProjects,
    metrics: computeQuoteMetrics(defaultProjects),
    activity: quoteActivityLog.map((item) => clone(item)),
    aiUsage: aggregateQuoteUsage(defaultProjects),
  };

  view: {
    selectedProjectId: string | null;
    activeTab: QuoteWorkspaceTab;
    activeQuoteId: string | null;
    activeRefinementType: QuoteRefinementType;
    selectedPackId: string | null;
    generator: GeneratorState;
  } = {
    selectedProjectId: defaultProjects[0]?.id ?? null,
    activeTab: 'variants',
    activeQuoteId: defaultProjects[0]?.quotes[0]?.id ?? null,
    activeRefinementType: quoteRefinementPasses[0]?.key ?? 'tighten',
    selectedPackId: defaultProjects[0]?.packs[0]?.id ?? null,
    generator: {
      modeId: quoteGenerationModes[0]?.id ?? 'daily',
      tone: defaultProjects[0]?.defaultTone ?? 'uplifting',
      persona: defaultProjects[0]?.defaultPersona ?? 'coach',
      length: quoteGenerationModes[0]?.presetLength ?? 'micro',
      language: defaultProjects[0]?.language ?? 'en',
      devices: quoteGenerationModes[0]?.id === 'daily' ? ['contrast', 'rule_of_three'] : ['contrast'],
      attribution: defaultProjects[0]?.attribution.mode ?? 'brand',
      count: quoteGenerationModes[0]?.recommendedCount ?? 7,
    },
  };

  readonly deviceGuides = quoteDeviceGuides;

  readonly generationModes = quoteGenerationModes;

  readonly refinementPasses = quoteRefinementPasses;

  readonly exportPresets = quoteExportPresets;

  readonly attributionModes = quoteAttributionModes;

  readonly apiEndpoints = quoteApiEndpoints;

  get plan(): QuotePlan {
    return this.state.plan;
  }

  togglePlan(): void {
    this.state.plan = this.state.plan === 'free' ? 'pro' : 'free';
  }

  get planLimits() {
    return quotePlanLimits[this.state.plan];
  }

  get availableStatuses(): QuoteFilters['status'][] {
    return ['all', 'draft', 'ready', 'archived'];
  }

  get availableLanguages(): Array<QuoteFilters['language']> {
    const values = new Set<string>();
    this.state.projects.forEach((project) => {
      values.add(project.language);
      project.aiUsage.languagesUsed.forEach((language) => values.add(language));
    });
    return ['all', ...Array.from(values)];
  }

  get availableTones(): Array<QuoteFilters['tone']> {
    const values = new Set<string>();
    this.state.projects.forEach((project) => {
      project.quotes.forEach((quote) => values.add(quote.tone));
    });
    return ['all', ...Array.from(values)];
  }

  get availablePersonas(): Array<QuoteFilters['persona']> {
    const values = new Set<string>();
    this.state.projects.forEach((project) => {
      project.quotes.forEach((quote) => values.add(quote.persona));
    });
    return ['all', ...Array.from(values)];
  }

  get availableDevices(): Array<QuoteFilters['device']> {
    return ['all', ...this.deviceGuides.map((device) => device.key)];
  }

  get availableTags(): Array<QuoteFilters['tag']> {
    const values = new Set<string>();
    this.state.projects.forEach((project) => {
      project.topicTags.forEach((tag) => values.add(tag));
      project.quotes.forEach((quote) => quote.tags.forEach((tag) => values.add(tag)));
    });
    return ['all', ...Array.from(values)];
  }

  get filteredProjects(): QuoteProject[] {
    const { filters } = this.state;
    const search = filters.search.trim().toLowerCase();

    return this.state.projects.filter((project) => {
      if (filters.status !== 'all' && project.status !== filters.status) {
        return false;
      }
      if (filters.language !== 'all' && project.language !== filters.language) {
        return false;
      }
      if (filters.tag !== 'all' && !project.topicTags.includes(filters.tag)) {
        return false;
      }

      const matchesQuoteFilter = project.quotes.some((quote) => {
        if (filters.tone !== 'all' && quote.tone !== filters.tone) {
          return false;
        }
        if (filters.persona !== 'all' && quote.persona !== filters.persona) {
          return false;
        }
        if (filters.device !== 'all' && !quote.deviceHints.includes(filters.device)) {
          return false;
        }
        if (filters.tag !== 'all' && !quote.tags.includes(filters.tag)) {
          return false;
        }
        if (search) {
          const haystack = `${quote.text} ${quote.tags.join(' ')} ${quote.caption}`.toLowerCase();
          if (!haystack.includes(search)) {
            return false;
          }
        }
        return true;
      });

      if (!matchesQuoteFilter) {
        return false;
      }

      if (search) {
        const haystack = `${project.name} ${project.topicTags.join(' ')} ${project.attribution.name ?? ''}`.toLowerCase();
        if (!haystack.includes(search)) {
          return false;
        }
      }

      return true;
    });
  }

  get selectedProject(): QuoteProject | null {
    const id = this.view.selectedProjectId;
    if (!id) return this.state.projects[0] ?? null;
    return this.state.projects.find((project) => project.id === id) ?? this.state.projects[0] ?? null;
  }

  get selectedQuotes(): QuoteVariant[] {
    return this.selectedProject?.quotes ?? [];
  }

  get selectedQuote(): QuoteVariant | null {
    const project = this.selectedProject;
    if (!project) return null;
    const id = this.view.activeQuoteId;
    if (!id) return project.quotes[0] ?? null;
    return project.quotes.find((quote) => quote.id === id) ?? project.quotes[0] ?? null;
  }

  get selectedPack() {
    const project = this.selectedProject;
    if (!project) return null;
    const id = this.view.selectedPackId;
    if (!id) return project.packs[0] ?? null;
    return project.packs.find((pack) => pack.id === id) ?? project.packs[0] ?? null;
  }

  get selectedSchedule() {
    return this.selectedProject?.schedule ?? null;
  }

  get selectedQuoteRefinements(): QuoteRefinement[] {
    return this.selectedQuote?.refinements ?? [];
  }

  get activeRefinementPass() {
    return this.refinementPasses.find((pass) => pass.key === this.view.activeRefinementType) ?? null;
  }

  get uniquenessSummary() {
    const quote = this.selectedQuote;
    if (!quote) {
      return {
        score: 0,
        badge: 'risk',
        overlaps: [],
        message: 'Select a quote to view uniqueness insights.',
      } as const;
    }
    const tiers: Record<typeof quote.uniqueness.badge, { label: string; description: string; accent: string }> = {
      excellent: {
        label: 'Excellent',
        description: 'Green-light for publishing. Minimal overlap detected.',
        accent: 'text-emerald-300',
      },
      strong: {
        label: 'Strong',
        description: 'Safe to use. Consider a paraphrase to diversify phrasing.',
        accent: 'text-sky-300',
      },
      watch: {
        label: 'Watch',
        description: 'Similar to saved corpus. Run a paraphrase pass before publishing.',
        accent: 'text-amber-300',
      },
      risk: {
        label: 'Risk',
        description: 'Potential cliché or duplicate. Blocked until revised.',
        accent: 'text-rose-300',
      },
    };
    const tier = tiers[quote.uniqueness.badge];
    return {
      score: quote.uniqueness.score,
      badge: tier.label,
      accentClass: tier.accent,
      description: tier.description,
      overlaps: quote.uniqueness.overlaps,
    };
  }

  get qualityAlerts() {
    const quote = this.selectedQuote;
    if (!quote) return [];
    return quote.flags;
  }

  get generatorState(): GeneratorState {
    return this.view.generator;
  }

  setGeneratorMode(modeId: QuoteGenerationMode['id']): void {
    const mode = this.generationModes.find((item) => item.id === modeId);
    if (!mode) return;
    this.view.generator.modeId = mode.id;
    this.view.generator.length = mode.presetLength;
    this.view.generator.count = mode.recommendedCount;
  }

  setGeneratorField<TField extends keyof GeneratorState>(field: TField, value: GeneratorState[TField]): void {
    if (field === 'devices' && Array.isArray(value)) {
      this.view.generator.devices = value as QuoteDeviceKey[];
      return;
    }
    this.view.generator[field] = value;
  }

  toggleGeneratorDevice(device: QuoteDeviceKey): void {
    const devices = new Set(this.view.generator.devices);
    if (devices.has(device)) {
      devices.delete(device);
    } else {
      devices.add(device);
    }
    this.view.generator.devices = Array.from(devices);
  }

  queueGeneration(): void {
    const project = this.selectedProject;
    if (!project) return;
    this.showLoaderBriefly();
    const mode = this.generationModes.find((item) => item.id === this.view.generator.modeId);
    this.state.activity.unshift({
      id: `act_${Date.now()}`,
      message: `Queued ${this.view.generator.count} ${this.view.generator.tone} variants`,
      detail: `${project.name} · ${mode?.label ?? 'Custom'} mode`,
      timestamp: new Date().toISOString(),
      tone: 'success',
      icon: 'fa-wand-magic-sparkles',
    });
  }

  runRefinement(type: QuoteRefinementType): void {
    const project = this.selectedProject;
    const quote = this.selectedQuote;
    if (!project || !quote) return;
    const pass = this.refinementPasses.find((item) => item.key === type);
    if (!pass) return;
    if (pass.gating === 'pro' && this.state.plan === 'free') {
      return;
    }
    this.showLoaderBriefly();
    const newRefinement: QuoteRefinement = {
      id: `ref_${Date.now()}`,
      type,
      before: quote.text,
      after: quote.text,
      summary: `${pass.label} requested (preview only).`,
      createdAt: new Date().toISOString(),
    };
    quote.refinements = [newRefinement, ...quote.refinements];
    this.state.activity.unshift({
      id: `act_ref_${Date.now()}`,
      message: `Ran ${pass.label.toLowerCase()} pass`,
      detail: `${project.name} · ${quote.text.slice(0, 40)}…`,
      timestamp: new Date().toISOString(),
      tone: 'info',
      icon: 'fa-bolt',
    });
  }

  setFilter<TField extends keyof QuoteFilters>(field: TField, value: QuoteFilters[TField]): void {
    this.state.filters[field] = value;
  }

  resetFilters(): void {
    this.state.filters = {
      search: '',
      status: 'all',
      language: 'all',
      tone: 'all',
      persona: 'all',
      device: 'all',
      tag: 'all',
    };
  }

  selectProject(projectId: string): void {
    this.view.selectedProjectId = projectId;
    const project = this.selectedProject;
    this.view.activeQuoteId = project?.quotes[0]?.id ?? null;
    this.view.selectedPackId = project?.packs[0]?.id ?? null;
    this.view.generator.language = project?.language ?? 'en';
    this.view.generator.tone = project?.defaultTone ?? 'uplifting';
    this.view.generator.persona = project?.defaultPersona ?? 'coach';
  }

  selectQuote(quoteId: string): void {
    this.view.activeQuoteId = quoteId;
  }

  setWorkspaceTab(tab: QuoteWorkspaceTab): void {
    this.view.activeTab = tab;
  }

  setActiveRefinement(type: QuoteRefinementType): void {
    this.view.activeRefinementType = type;
  }

  selectPack(packId: string): void {
    this.view.selectedPackId = packId;
  }

  formatRelative(value?: string | null): string {
    return formatRelativeTime(value);
  }

  formatDate(value?: string | null): string {
    return formatDate(value);
  }

  get lengthLabels() {
    return quoteLengthLabels;
  }

  get allActivity() {
    return this.state.activity;
  }

  get generatorLanguageOptions(): string[] {
    return aggregateLanguages(this.state.projects);
  }

  isRefinementLocked(type: QuoteRefinementType): boolean {
    const pass = this.refinementPasses.find((item) => item.key === type);
    if (!pass) return false;
    if (pass.gating === 'pro' && this.state.plan === 'free') {
      return true;
    }
    return false;
  }

  get planIsFree(): boolean {
    return this.state.plan === 'free';
  }
}

Alpine.store('quote-forge', new QuoteForgeStore());

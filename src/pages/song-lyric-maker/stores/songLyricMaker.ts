import Alpine from 'alpinejs';
import { BaseStore, clone } from '../../../alpineStores/base';
import {
  computeLibraryMetrics,
  createProjectFromTemplate,
  sampleSongProjects,
  songActivityLog,
  songExportPresets,
  songPlanLimits,
  songRevisionPasses,
  songStructureTemplates,
  type SongActivityItem,
  type SongPlan,
  type SongProject,
  type SongRevisionPassKey,
  type SongStructureTemplate,
} from '../../../lib/song-lyric-maker/schema';

type SongFilters = {
  search: string;
  status: 'all' | 'draft' | 'final';
  genre: 'all' | string;
  language: 'all' | string;
  tag: 'all' | string;
};

type SongWorkspaceTab = 'lyrics' | 'analysis' | 'structure' | 'exports';

type SongAiUsage = {
  hooksGenerated: number;
  passesRun: number;
  analysesRun: number;
  exportsQueued: number;
};

const formatRelativeTime = (input?: string | null): string => {
  if (!input) return 'moments ago';
  const date = new Date(input);
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

const aggregateUsage = (projects: SongProject[]): SongAiUsage => {
  return projects.reduce(
    (acc, project) => ({
      hooksGenerated: acc.hooksGenerated + project.hookVariants.length,
      passesRun: acc.passesRun + project.aiUsage.passes,
      analysesRun: acc.analysesRun + project.aiUsage.analyses,
      exportsQueued: acc.exportsQueued + project.aiUsage.exports,
    }),
    { hooksGenerated: 0, passesRun: 0, analysesRun: 0, exportsQueued: 0 },
  );
};

class SongLyricMakerStore extends BaseStore {
  state: {
    plan: SongPlan;
    filters: SongFilters;
    projects: SongProject[];
    metrics: ReturnType<typeof computeLibraryMetrics>;
    activity: SongActivityItem[];
    aiUsage: SongAiUsage;
  } = {
    plan: 'pro',
    filters: {
      search: '',
      status: 'all',
      genre: 'all',
      language: 'all',
      tag: 'all',
    },
    projects: sampleSongProjects.map((project) => clone(project)),
    metrics: computeLibraryMetrics(sampleSongProjects),
    activity: songActivityLog.map((item) => clone(item)),
    aiUsage: aggregateUsage(sampleSongProjects),
  };

  view: {
    selectedProjectId: string | null;
    activeTab: SongWorkspaceTab;
    activePassKey: SongRevisionPassKey;
    selectedTemplateId: string;
  } = {
    selectedProjectId: sampleSongProjects[0]?.id ?? null,
    activeTab: 'lyrics',
    activePassKey: songRevisionPasses[0]?.key ?? 'hookPunch',
    selectedTemplateId: songStructureTemplates[0]?.id ?? 'pop-anthem',
  };

  readonly passes = songRevisionPasses;

  readonly templates = songStructureTemplates;

  readonly exportPresets = songExportPresets;

  get filters(): SongFilters {
    return this.state.filters;
  }

  get filteredProjects(): SongProject[] {
    const { filters } = this.state;
    const search = filters.search.trim().toLowerCase();
    return this.state.projects.filter((project) => {
      if (filters.status !== 'all' && project.status !== filters.status) {
        return false;
      }
      if (filters.genre !== 'all' && project.genre !== filters.genre) {
        return false;
      }
      if (filters.language !== 'all' && project.language !== filters.language) {
        return false;
      }
      if (filters.tag !== 'all' && !project.tags.includes(filters.tag)) {
        return false;
      }
      if (search) {
        const haystack = `${project.title} ${project.theme} ${project.tags.join(' ')} ${project.tone}`.toLowerCase();
        if (!haystack.includes(search)) {
          return false;
        }
      }
      return true;
    });
  }

  get selectedProject(): SongProject | null {
    const id = this.view.selectedProjectId;
    if (!id) return this.state.projects[0] ?? null;
    return this.state.projects.find((project) => project.id === id) ?? this.state.projects[0] ?? null;
  }

  get availableStatuses(): SongFilters['status'][] {
    return ['all', 'draft', 'final'];
  }

  get availableGenres(): string[] {
    const values = new Set<string>();
    this.state.projects.forEach((project) => values.add(project.genre));
    return ['all', ...values];
  }

  get availableLanguages(): string[] {
    const values = new Set<string>();
    this.state.projects.forEach((project) => values.add(project.language));
    return ['all', ...values];
  }

  get availableTags(): string[] {
    const values = new Set<string>();
    this.state.projects.forEach((project) => project.tags.forEach((tag) => values.add(tag)));
    return ['all', ...values];
  }

  get planLimits() {
    return songPlanLimits[this.state.plan];
  }

  get remainingFreeSlots(): number | 'unlimited' {
    if (this.state.plan !== 'free') return 'unlimited';
    const limit = songPlanLimits.free.projects;
    if (limit === 'unlimited') return 'unlimited';
    return Math.max(0, limit - this.state.projects.length);
  }

  get selectedTemplate(): SongStructureTemplate | null {
    return this.templates.find((template) => template.id === this.view.selectedTemplateId) ?? null;
  }

  get plan(): SongPlan {
    return this.state.plan;
  }

  togglePlan() {
    this.state.plan = this.state.plan === 'free' ? 'pro' : 'free';
  }

  setFilter<TField extends keyof SongFilters>(field: TField, value: SongFilters[TField]) {
    this.state.filters = {
      ...this.state.filters,
      [field]: value,
    };
  }

  resetFilters() {
    this.state.filters = {
      search: '',
      status: 'all',
      genre: 'all',
      language: 'all',
      tag: 'all',
    };
  }

  selectProject(projectId: string, tab: SongWorkspaceTab = 'lyrics') {
    this.view.selectedProjectId = projectId;
    this.view.activeTab = tab;
    const project = this.selectedProject;
    if (project) {
      project.updatedAt = new Date().toISOString();
    }
  }

  setActiveTab(tab: SongWorkspaceTab) {
    this.view.activeTab = tab;
  }

  setActivePass(key: SongRevisionPassKey) {
    this.view.activePassKey = key;
  }

  createProject(templateId: string) {
    const template = this.templates.find((item) => item.id === templateId);
    if (!template) return;
    if (this.isTemplateLocked(templateId)) return;
    const project = createProjectFromTemplate(templateId);
    this.state.projects = [project, ...this.state.projects];
    this.view.selectedProjectId = project.id;
    this.state.metrics = computeLibraryMetrics(this.state.projects);
    this.state.aiUsage = aggregateUsage(this.state.projects);
    this.pushActivity({
      id: `create-${project.id}`,
      label: 'New lyric workspace',
      detail: `Started ${project.title} from ${template.label}.`,
      timestamp: new Date().toISOString(),
      tone: 'success',
      icon: 'fa-plus',
    });
  }

  queueHookGeneration(projectId: string) {
    const project = this.state.projects.find((item) => item.id === projectId);
    if (!project) return;
    this.state.aiUsage.hooksGenerated += this.planLimits.hooksPerPrompt;
    project.aiUsage.drafts += 1;
    this.pushActivity({
      id: `hooks-${project.id}-${Date.now()}`,
      label: 'Hook variants requested',
      detail: `Queued ${this.planLimits.hooksPerPrompt} hook ideas for ${project.title}.`,
      timestamp: new Date().toISOString(),
      tone: 'info',
      icon: 'fa-sparkles',
    });
  }

  applyHookVariant(projectId: string, variantId: string) {
    const project = this.state.projects.find((item) => item.id === projectId);
    if (!project) return;
    const variant = project.hookVariants.find((item) => item.id === variantId);
    if (!variant) return;
    if (this.isVariantLocked(variant.plan)) return;
    project.hook = {
      text: variant.text,
      variantId: variant.id,
      keywords: variant.keywords,
    };
    project.updatedAt = new Date().toISOString();
    this.pushActivity({
      id: `hook-${project.id}-${variant.id}`,
      label: 'Hook pinned',
      detail: `Selected "${variant.text}" as the active hook.`,
      timestamp: new Date().toISOString(),
      tone: 'success',
      icon: 'fa-thumbtack',
    });
  }

  queueRevisionPass(projectId: string, passKey: SongRevisionPassKey) {
    const project = this.state.projects.find((item) => item.id === projectId);
    if (!project) return;
    const pass = this.passes.find((item) => item.key === passKey);
    if (!pass) return;
    if (this.isPassLocked(passKey)) return;
    project.aiUsage.passes += 1;
    this.state.aiUsage.passesRun += 1;
    this.pushActivity({
      id: `pass-${project.id}-${passKey}-${Date.now()}`,
      label: `${pass.label} queued`,
      detail: `${project.title} · ${pass.description}`,
      timestamp: new Date().toISOString(),
      tone: 'info',
      icon: 'fa-wand-magic-sparkles',
    });
  }

  runAnalysis(projectId: string) {
    const project = this.state.projects.find((item) => item.id === projectId);
    if (!project) return;
    project.aiUsage.analyses += 1;
    this.state.aiUsage.analysesRun += 1;
    project.analysis.rhymeTightness = Math.min(100, project.analysis.rhymeTightness + 2);
    project.analysis.nearRhymes += 1;
    project.analysis.warnings = project.analysis.warnings.slice(0, 3);
    this.pushActivity({
      id: `analysis-${project.id}-${Date.now()}`,
      label: 'Analysis refreshed',
      detail: `Prosody + rhyme map updated for ${project.title}.`,
      timestamp: new Date().toISOString(),
      tone: 'info',
      icon: 'fa-wave-square',
    });
  }

  queueExport(projectId: string, presetId: string) {
    const project = this.state.projects.find((item) => item.id === projectId);
    if (!project) return;
    if (this.isExportLocked(presetId)) return;
    const preset = this.exportPresets.find((item) => item.id === presetId);
    if (!preset) return;
    project.aiUsage.exports += 1;
    this.state.aiUsage.exportsQueued += 1;
    project.exports.push({ format: preset.formats[0], timestamp: new Date().toISOString() });
    this.state.metrics = computeLibraryMetrics(this.state.projects);
    this.pushActivity({
      id: `export-${project.id}-${presetId}-${Date.now()}`,
      label: `${preset.label} queued`,
      detail: `Preparing ${preset.formats.join('/').toUpperCase()} for ${project.title}.`,
      timestamp: new Date().toISOString(),
      tone: 'info',
      icon: 'fa-cloud-arrow-down',
    });
  }

  toggleClean(projectId: string) {
    const project = this.state.projects.find((item) => item.id === projectId);
    if (!project) return;
    project.cleanLyrics = !project.cleanLyrics;
  }

  tapTempo(projectId: string, bpm: number) {
    const project = this.state.projects.find((item) => item.id === projectId);
    if (!project) return;
    project.tempo.bpm = Math.round((project.tempo.bpm + bpm) / 2);
    project.updatedAt = new Date().toISOString();
  }

  setTempo(projectId: string, bpm: number) {
    const project = this.state.projects.find((item) => item.id === projectId);
    if (!project) return;
    project.tempo.bpm = bpm;
    project.updatedAt = new Date().toISOString();
  }

  selectTemplate(templateId: string) {
    this.view.selectedTemplateId = templateId;
  }

  isTemplateLocked(templateId: string): boolean {
    const template = this.templates.find((item) => item.id === templateId);
    if (!template) return false;
    if (template.plan === 'free') return false;
    return this.state.plan !== 'pro';
  }

  isPassLocked(passKey: SongRevisionPassKey): boolean {
    const pass = this.passes.find((item) => item.key === passKey);
    if (!pass) return false;
    if (pass.gating === 'free') return false;
    return this.state.plan !== 'pro';
  }

  isVariantLocked(plan: SongPlan | undefined): boolean {
    if (!plan || plan === 'free') return false;
    return this.state.plan !== 'pro';
  }

  isExportLocked(presetId: string): boolean {
    const preset = this.exportPresets.find((item) => item.id === presetId);
    if (!preset) return false;
    if (preset.plan === 'free') return false;
    return this.state.plan !== 'pro';
  }

  pushActivity(activity: SongActivityItem) {
    this.state.activity = [activity, ...this.state.activity].slice(0, 12);
  }

  formatRelative(input?: string | null) {
    return formatRelativeTime(input);
  }

  formatDate(input?: string | null) {
    return formatDate(input);
  }
}

const init = () => {
  if (Alpine.store('song-lyric-maker')) return;
  Alpine.store('song-lyric-maker', new SongLyricMakerStore());
};

if (typeof window !== 'undefined') {
  document.addEventListener('alpine:init', init);
  init();
}

export type { SongProject };

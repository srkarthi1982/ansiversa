import Alpine from 'alpinejs';
import { BaseStore, clone } from '../../../alpineStores/base';
import {
  computeLibraryMetrics,
  createProjectFromTemplate,
  sampleStoryProjects,
  storyActivityLog,
  storyExportPresets,
  storyFrameworks,
  storyTemplates,
  type StoryActivityItem,
  type StoryFrameworkKey,
  type StoryPanelKey,
  type StoryProject,
  type StoryScene,
  type StoryTemplateKey,
  type StoryWorldFilter,
} from '../../../lib/story-crafter/schema';

const formatNumber = (value: number): string => value.toLocaleString();

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

const nowIso = () => new Date().toISOString();

export type StoryViewState = {
  selectedProjectId: string | null;
  activePanel: StoryPanelKey;
  worldFilter: StoryWorldFilter;
  showCommandPalette: boolean;
};

export type StoryFilters = {
  search: string;
  status: 'all' | 'active' | 'archived';
  genre: 'all' | string;
};

class StoryCrafterStore extends BaseStore {
  state = {
    loading: false,
    plan: 'pro' as 'free' | 'pro',
    filters: {
      search: '',
      status: 'all' as StoryFilters['status'],
      genre: 'all' as StoryFilters['genre'],
    },
    projects: sampleStoryProjects.map((project) => clone(project)),
    metrics: computeLibraryMetrics(sampleStoryProjects),
    activity: storyActivityLog.map((item) => clone(item)),
    aiUsage: {
      outline: 6,
      scene: 4,
      passes: 11,
      canon: 3,
      exports: 1,
    },
  };

  view: StoryViewState = {
    selectedProjectId: sampleStoryProjects[0]?.id ?? null,
    activePanel: 'overview',
    worldFilter: 'all',
    showCommandPalette: false,
  };

  frameworks = storyFrameworks;
  templates = storyTemplates;
  exportPresets = storyExportPresets;

  initDashboard() {
    this.refreshMetrics();
  }

  get filteredProjects(): StoryProject[] {
    const { filters } = this.state;
    const searchValue = filters.search.trim().toLowerCase();
    return this.state.projects.filter((project) => {
      if (filters.status !== 'all' && project.status !== filters.status) {
        return false;
      }
      if (filters.genre !== 'all' && project.genre !== filters.genre) {
        return false;
      }
      if (!searchValue) return true;
      return (
        project.title.toLowerCase().includes(searchValue) ||
        project.logline.toLowerCase().includes(searchValue) ||
        project.tags.some((tag) => tag.toLowerCase().includes(searchValue))
      );
    });
  }

  get genres(): string[] {
    const values = new Set<string>();
    this.state.projects.forEach((project) => values.add(project.genre));
    return ['all', ...values];
  }

  get selectedProject(): StoryProject | null {
    const id = this.view.selectedProjectId;
    if (!id) return this.state.projects[0] ?? null;
    return this.state.projects.find((project) => project.id === id) ?? this.state.projects[0] ?? null;
  }

  get availableWorldFilters(): StoryWorldFilter[] {
    return ['all', 'location', 'faction', 'item', 'rule'];
  }

  refreshMetrics() {
    this.state.metrics = computeLibraryMetrics(this.state.projects);
  }

  selectProject(id: string, panel: StoryPanelKey = 'overview') {
    this.view.selectedProjectId = id;
    this.view.activePanel = panel;
    const project = this.selectedProject;
    if (project) {
      project.lastEdited = nowIso();
    }
  }

  setPanel(panel: StoryPanelKey) {
    this.view.activePanel = panel;
  }

  setWorldFilter(filter: StoryWorldFilter) {
    this.view.worldFilter = filter;
  }

  setFilter<TField extends keyof StoryFilters>(field: TField, value: StoryFilters[TField]) {
    this.state.filters = {
      ...this.state.filters,
      [field]: value,
    };
  }

  togglePlan() {
    this.state.plan = this.state.plan === 'free' ? 'pro' : 'free';
  }

  createProject(templateKey: StoryTemplateKey) {
    const titleBase = this.templates.find((tpl) => tpl.key === templateKey)?.label.split('—')[0]?.trim() ?? 'New Story';
    const title = `${titleBase} ${new Date().getFullYear()}`;
    const project = createProjectFromTemplate(templateKey, title);
    this.state.projects = [project, ...this.state.projects];
    this.selectProject(project.id, 'overview');
    this.refreshMetrics();
    this.pushActivity({
      id: `activity-create-${project.id}`,
      icon: 'fa-plus',
      color: 'text-emerald-500',
      label: 'Project created',
      detail: `Started ${project.title} from ${titleBase} template`,
      timestamp: nowIso(),
    });
  }

  updateSetting(field: keyof StoryProject, value: unknown) {
    const project = this.selectedProject;
    if (!project) return;
    if (field in project) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (project as any)[field] = value;
      project.lastEdited = nowIso();
      this.pushActivity({
        id: `activity-setting-${field}-${project.id}`,
        icon: 'fa-sliders',
        color: 'text-slate-500',
        label: 'Story controls updated',
        detail: `${field} updated for ${project.title}`,
        timestamp: nowIso(),
      });
    }
  }

  generateBeatSheet(framework: StoryFrameworkKey) {
    const project = this.selectedProject;
    if (!project) return;
    const frameworkDefinition = this.frameworks.find((item) => item.key === framework);
    if (!frameworkDefinition) return;
    project.framework = framework;
    project.beats = frameworkDefinition.beats.slice(0, 10).map((beat, index) => ({
      id: `${beat.id}-${index}`,
      title: beat.title,
      summary: beat.question,
      status: index < 3 ? 'drafting' : 'idea',
      wordGoal: Math.round(project.targetWords / (frameworkDefinition.beats.length || 10)),
      relatedSceneIds: [],
    }));
    project.beatSheetVersion += 1;
    project.lastEdited = nowIso();
    this.state.aiUsage.outline += 1;
    this.pushActivity({
      id: `activity-outline-${project.id}-${project.beatSheetVersion}`,
      icon: 'fa-sparkles',
      color: 'text-indigo-500',
      label: 'Beat sheet generated',
      detail: `${frameworkDefinition.name} beats drafted for ${project.title}`,
      timestamp: nowIso(),
    });
  }

  runScenePass(sceneId: string, pass: 'dialogue' | 'show-dont-tell' | 'pacing' | 'style' | 'consistency') {
    const project = this.selectedProject;
    if (!project) return;
    const scene = project.scenes.find((item) => item.id === sceneId);
    if (!scene) return;
    const noteMap: Record<typeof pass, string> = {
      dialogue: 'Dialogue punch-up suggestions delivered.',
      'show-dont-tell': 'Converted exposition into action beats and sensory cues.',
      pacing: 'Suggested trims to tighten pacing and maintain tension.',
      style: 'Rewrote paragraphs in requested voice and cadence.',
      consistency: 'Flagged continuity risks against canon database.',
    };
    const entry = {
      type: pass,
      timestamp: nowIso(),
      note: noteMap[pass],
    } as StoryScene['passes'][number];
    scene.passes = [entry, ...scene.passes];
    this.state.aiUsage.passes += 1;
    this.pushActivity({
      id: `activity-pass-${sceneId}-${entry.timestamp}`,
      icon: 'fa-wand-magic-sparkles',
      color: 'text-purple-500',
      label: `${pass.replace('-', ' ')} pass complete`,
      detail: `AI refined ${scene.title}.`,
      timestamp: entry.timestamp,
    });
  }

  addCanonFact(fact: { key: string; value: string; entityType?: StoryProject['canon'][number]['entityType'] }) {
    const project = this.selectedProject;
    if (!project) return;
    project.canon = [
      {
        id: `canon-${Math.random().toString(36).slice(2, 8)}`,
        entityType: fact.entityType ?? 'misc',
        key: fact.key,
        value: fact.value,
        sources: ['manual-entry'],
        confidence: 0.75,
      },
      ...project.canon,
    ];
    this.pushActivity({
      id: `activity-canon-${project.id}-${Date.now()}`,
      icon: 'fa-shield-heart',
      color: 'text-amber-500',
      label: 'Canon updated',
      detail: `Logged ${fact.key}.`,
      timestamp: nowIso(),
    });
  }

  requestExport(presetId: string) {
    const project = this.selectedProject;
    if (!project) return;
    const preset = this.exportPresets.find((item) => item.id === presetId);
    if (!preset) return;
    project.exports = [
      { id: `export-${Date.now()}`, format: preset.formats[0], createdAt: nowIso() },
      ...project.exports,
    ];
    this.state.aiUsage.exports += 1;
    this.refreshMetrics();
    this.pushActivity({
      id: `activity-export-${project.id}-${Date.now()}`,
      icon: 'fa-cloud-arrow-down',
      color: 'text-sky-500',
      label: 'Export requested',
      detail: `${preset.label} compile queued for ${project.title}.`,
      timestamp: nowIso(),
    });
  }

  addSceneFromBeat(beatId: string) {
    const project = this.selectedProject;
    if (!project) return;
    const beat = project.beats.find((item) => item.id === beatId);
    if (!beat) return;
    const sceneId = `scene-${Math.random().toString(36).slice(2, 8)}`;
    const scene: StoryScene = {
      id: sceneId,
      title: `${beat.title} — Draft`,
      chapterId: null,
      beatId: beat.id,
      summary: beat.summary,
      wordGoal: beat.wordGoal,
      wordCount: 0,
      status: 'idea',
      pov: project.pov,
      tense: project.tense,
      spotlight: 'Drafting',
      lastEdited: nowIso(),
      passes: [],
    };
    project.scenes = [scene, ...project.scenes];
    beat.relatedSceneIds = [...new Set([sceneId, ...beat.relatedSceneIds])];
    project.lastEdited = nowIso();
    this.state.aiUsage.scene += 1;
    this.pushActivity({
      id: `activity-scene-${sceneId}`,
      icon: 'fa-pen-nib',
      color: 'text-emerald-500',
      label: 'Scene drafted',
      detail: `Generated draft stub for ${scene.title}.`,
      timestamp: nowIso(),
    });
  }

  pushActivity(activity: StoryActivityItem) {
    this.state.activity = [activity, ...this.state.activity].slice(0, 12);
  }

  formatNumber(value: number) {
    return formatNumber(value);
  }

  formatRelative(input?: string | null) {
    return formatRelativeTime(input);
  }

  formatDate(input?: string | null) {
    return formatDate(input);
  }
}

const init = () => {
  if (Alpine.store('story-crafter')) return;
  Alpine.store('story-crafter', new StoryCrafterStore());
};

if (typeof window !== 'undefined') {
  document.addEventListener('alpine:init', init);
  init();
}

export type { StoryProject };

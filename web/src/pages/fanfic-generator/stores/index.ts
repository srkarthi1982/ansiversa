import Alpine from 'alpinejs';
import { BaseStore, clone } from '../../../alpineStores/base';
import {
  computeFanficMetrics,
  createFanficProjectFromWizard,
  defaultFanficWizardState,
  fanficActivityLog,
  fanficAuPresets,
  fanficPlanMatrix,
  fanficTropeBundles,
  fanficWorkspaceTabs,
  sampleFanficProjects,
  type FanficActivity,
  type FanficPlan,
  type FanficProject,
  type FanficWorkspaceTab,
  type FanficWizardState,
} from '../../../lib/fanfic-generator/schema';

const formatNumber = (value: number): string => new Intl.NumberFormat('en').format(value);

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

export type FanficFilters = {
  search: string;
  rating: 'all' | 'G' | 'T' | 'M';
  status: 'all' | FanficProject['status'];
  fandom: 'all' | string;
};

type FanficGenerationTask = {
  id: string;
  type: 'outline' | 'beat' | 'chapter' | 'scene';
  label: string;
  status: 'queued' | 'running' | 'ready';
  eta: string;
  note: string;
};

class FanficGeneratorStore extends BaseStore {
  state = {
    plan: 'pro' as FanficPlan,
    filters: {
      search: '',
      rating: 'all' as FanficFilters['rating'],
      status: 'all' as FanficFilters['status'],
      fandom: 'all' as FanficFilters['fandom'],
    },
    projects: sampleFanficProjects.map((project) => clone(project)),
    metrics: computeFanficMetrics(sampleFanficProjects),
    activity: fanficActivityLog.map((item) => clone(item)),
    wizard: clone(defaultFanficWizardState),
    generationQueue: [
      {
        id: 'task-1',
        type: 'chapter',
        label: 'Moonlit Vow draft',
        status: 'running',
        eta: '2m',
        note: 'Tone: angst 3 · fluff 1 · suspense 3',
      },
      {
        id: 'task-2',
        type: 'outline',
        label: 'Debate finals fix-it',
        status: 'queued',
        eta: '4m',
        note: 'Include scholarship stakes + rival banter',
      },
    ] as FanficGenerationTask[],
  };

  view = {
    selectedProjectId: sampleFanficProjects[0]?.id ?? null,
    activePanel: fanficWorkspaceTabs[0]?.id ?? 'overview',
    showWizard: false,
  };

  readonly auPresets = fanficAuPresets;
  readonly tropeBundles = fanficTropeBundles;
  readonly planMatrix = fanficPlanMatrix;
  readonly workspaceTabs = fanficWorkspaceTabs;

  get filteredProjects(): FanficProject[] {
    const { filters } = this.state;
    const searchValue = filters.search.trim().toLowerCase();
    return this.state.projects.filter((project) => {
      if (filters.rating !== 'all' && project.rating !== filters.rating) return false;
      if (filters.status !== 'all' && project.status !== filters.status) return false;
      if (filters.fandom !== 'all' && project.fandom !== filters.fandom) return false;
      if (!searchValue) return true;
      return (
        project.title.toLowerCase().includes(searchValue) ||
        project.fandom.toLowerCase().includes(searchValue) ||
        project.tags.some((tag) => tag.toLowerCase().includes(searchValue))
      );
    });
  }

  get fandoms(): string[] {
    const values = new Set<string>();
    this.state.projects.forEach((project) => values.add(project.fandom));
    return ['all', ...values];
  }

  get selectedProject(): FanficProject | null {
    const id = this.view.selectedProjectId;
    if (!id) return this.state.projects[0] ?? null;
    return this.state.projects.find((project) => project.id === id) ?? this.state.projects[0] ?? null;
  }

  togglePlan() {
    this.state.plan = this.state.plan === 'free' ? 'pro' : 'free';
  }

  setFilter<TField extends keyof FanficFilters>(field: TField, value: FanficFilters[TField]) {
    this.state.filters = {
      ...this.state.filters,
      [field]: value,
    };
  }

  resetWizard() {
    this.state.wizard = clone(defaultFanficWizardState);
  }

  applyAuPreset(presetId: string) {
    const preset = this.auPresets.find((item) => item.id === presetId);
    if (!preset) return;
    this.state.wizard = {
      ...this.state.wizard,
      auPresetId: preset.id,
      customSetting: `${preset.setting}\n\nConflicts: ${preset.conflicts.join(', ')}`,
    };
  }

  applyTropeBundle(bundleId: string) {
    const bundle = this.tropeBundles.find((item) => item.id === bundleId);
    if (!bundle) return;
    this.state.wizard = {
      ...this.state.wizard,
      tropes: Array.from(new Set([...this.state.wizard.tropes, ...bundle.tropes])).slice(0, 8),
    };
  }

  updateWizardField<TField extends keyof FanficWizardState>(field: TField, value: FanficWizardState[TField]) {
    this.state.wizard = {
      ...this.state.wizard,
      [field]: value,
    };
  }

  updateWizardToneField(field: keyof FanficWizardState['tone'], value: FanficWizardState['tone'][typeof field]) {
    this.state.wizard = {
      ...this.state.wizard,
      tone: {
        ...this.state.wizard.tone,
        [field]: value,
      },
    };
  }

  addWizardPairing() {
    this.state.wizard = {
      ...this.state.wizard,
      pairings: [
        ...this.state.wizard.pairings,
        {
          label: 'New pairing',
          type: 'romantic',
          adultsOnly: true,
          consentOk: true,
          dynamic: 'Describe relationship arc',
        },
      ],
    };
  }

  removeWizardPairing(index: number) {
    const pairings = [...this.state.wizard.pairings];
    pairings.splice(index, 1);
    this.state.wizard = {
      ...this.state.wizard,
      pairings: pairings.length ? pairings : defaultFanficWizardState.pairings,
    };
  }

  createProjectFromWizard() {
    const project = createFanficProjectFromWizard(this.state.wizard, this.state.plan);
    this.state.projects = [project, ...this.state.projects];
    this.selectProject(project.id, 'overview');
    this.refreshMetrics();
    this.queueGenerationTask({
      id: `task-${Date.now()}`,
      type: 'outline',
      label: `${project.title} outline`,
      status: 'queued',
      eta: '3m',
      note: 'Wizard auto-drafted beat sheet.',
    });
    this.pushActivity({
      id: `activity-create-${project.id}`,
      icon: 'fa-sparkles',
      color: 'text-indigo-500',
      label: 'New project drafted',
      detail: `${project.title} created from wizard preset.`,
      timestamp: new Date().toISOString(),
    });
  }

  queueGenerationTask(task: FanficGenerationTask) {
    this.state.generationQueue = [task, ...this.state.generationQueue].slice(0, 4);
  }

  selectProject(id: string, panel: FanficWorkspaceTab['id'] = this.view.activePanel) {
    this.view.selectedProjectId = id;
    this.view.activePanel = panel;
    const project = this.selectedProject;
    if (project) {
      project.lastEdited = new Date().toISOString();
    }
  }

  setPanel(panel: FanficWorkspaceTab['id']) {
    this.view.activePanel = panel;
  }

  refreshMetrics() {
    this.state.metrics = computeFanficMetrics(this.state.projects);
  }

  pushActivity(activity: FanficActivity) {
    this.state.activity = [activity, ...this.state.activity].slice(0, 10);
  }

  markSafetyReviewed(checkId: string) {
    const project = this.selectedProject;
    if (!project) return;
    const check = project.safetyChecks.find((item) => item.id === checkId);
    if (!check) return;
    check.status = 'pass';
    check.recommendation = 'Logged as reviewed.';
    this.pushActivity({
      id: `activity-safety-${checkId}`,
      icon: 'fa-shield-heart',
      color: 'text-emerald-500',
      label: 'Safety item cleared',
      detail: `${check.label} marked as resolved.`,
      timestamp: new Date().toISOString(),
    });
  }

  requestExport(format: 'md' | 'docx' | 'epub' | 'html') {
    const project = this.selectedProject;
    if (!project) return;
    project.exportJobs = [
      {
        id: `export-${format}-${Date.now()}`,
        format,
        status: 'queued',
        createdAt: new Date().toISOString(),
        note: `${format.toUpperCase()} compile queued from workspace`,
      },
      ...project.exportJobs,
    ];
    this.refreshMetrics();
    this.pushActivity({
      id: `activity-export-${project.id}-${format}`,
      icon: 'fa-file-export',
      color: 'text-sky-500',
      label: `${format.toUpperCase()} export queued`,
      detail: `${project.title} compile requested.`,
      timestamp: new Date().toISOString(),
    });
  }

  completeGenerationTask(taskId: string) {
    const task = this.state.generationQueue.find((item) => item.id === taskId);
    if (!task) return;
    task.status = 'ready';
    task.eta = 'Ready';
    this.pushActivity({
      id: `activity-generate-${taskId}`,
      icon: 'fa-wand-sparkles',
      color: 'text-purple-500',
      label: `${task.label} ready`,
      detail: `${task.label} finished processing.`,
      timestamp: new Date().toISOString(),
    });
  }

  formatNumber(value: number) {
    return formatNumber(value);
  }

  formatRelative(input?: string | null) {
    return formatRelativeTime(input);
  }
}

const init = () => {
  if (Alpine.store('fanfic-generator')) return;
  Alpine.store('fanfic-generator', new FanficGeneratorStore());
};

if (typeof window !== 'undefined') {
  document.addEventListener('alpine:init', init);
  init();
}

export type { FanficProject };

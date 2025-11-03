import Alpine from 'alpinejs';
import { BaseStore } from '../../../alpineStores/base';
import {
  activityLog,
  apiEndpoints,
  characterRoster,
  defaultWorkspaceMetrics,
  diagnostics,
  exportPresets,
  planLimits,
  sampleProjects,
  sceneBoard,
  snowflakeStages,
  structurePresets,
  threadDefinitions,
  threadHeatmap,
  timelineEvents,
  revisionSnapshots,
  worldAtlas,
  workspacePanels,
  type ActivityEntry,
  type ApiEndpoint,
  type CharacterProfile,
  type Diagnostic,
  type ExportPreset,
  type PlanLimit,
  type PlanTier,
  type SceneLane,
  type SnowflakeStage,
  type StructureKey,
  type StructurePreset,
  type ThreadDefinition,
  type ThreadHeatmapRow,
  type TimelineEvent,
  type NovelProject,
  type WorkspaceMetrics,
  type WorkspacePanelKey,
} from '../../../lib/novel-outliner/schema';

type StatusFilter = 'all' | 'active' | 'draft' | 'archived';
type StructureFilter = 'all' | StructureKey;

type WizardState = {
  genre: string;
  audience: string;
  comps: string[];
  tone: string;
  pov: string;
  tense: string;
  structureKey: StructureKey;
  wordTarget: number;
  elevatorPitch: string;
};

type ExportState = {
  selectedFormat: ExportPreset['format'];
  status: 'idle' | 'queued' | 'complete';
  lastJobId: string | null;
};

type LibraryMetrics = {
  activeProjects: number;
  totalTargetWords: number;
  beatsOutlined: number;
  averageTimelineConfidence: number;
  revisionSnapshots: number;
};

type ThreadSelection = {
  selectedThreadKey: string;
  highlightLevel: 0 | 1 | 2 | 3;
};

type Filters = {
  search: string;
  status: StatusFilter;
  structure: StructureFilter;
  plan: 'all' | PlanTier;
};

const now = () => new Date();

const formatJobId = (format: ExportPreset['format']): string => `export-${format}-${Date.now()}`;

class NovelOutlinerStore extends BaseStore {
  state: {
    plan: PlanTier;
    filters: Filters;
    projects: NovelProject[];
    structurePresets: StructurePreset[];
    snowflakeStages: SnowflakeStage[];
    threadDefinitions: ThreadDefinition[];
    threadHeatmap: ThreadHeatmapRow[];
    timelineEvents: TimelineEvent[];
    diagnostics: Diagnostic[];
    revisionSnapshots: typeof revisionSnapshots;
    exportPresets: ExportPreset[];
    planLimits: PlanLimit[];
    apiEndpoints: ApiEndpoint[];
    activity: ActivityEntry[];
    sceneBoard: SceneLane[];
    characterRoster: CharacterProfile[];
    worldAtlas: typeof worldAtlas;
    workspacePanels: Array<(typeof workspacePanels)[number]>;
    workspaceMetrics: WorkspaceMetrics;
    metrics: LibraryMetrics;
    wizard: WizardState;
    exportState: ExportState;
    threadSelection: ThreadSelection;
    selectedProjectId: string | null;
    selectedStructureKey: StructureKey;
    selectedSnowflakeStep: number;
    selectedPanelKey: WorkspacePanelKey;
    timelineView: 'narrative' | 'chronological';
  };

  private initialised = false;

  constructor() {
    super();
    const initialProject = sampleProjects[0] ?? null;
    const fallbackStructure = structurePresets[0]?.key ?? 'three-act';
    this.state = {
      plan: 'pro',
      filters: {
        search: '',
        status: 'all',
        structure: 'all',
        plan: 'all',
      },
      projects: sampleProjects.map((project) => ({ ...project })),
      structurePresets: structurePresets.map((preset) => ({ ...preset })),
      snowflakeStages: snowflakeStages.map((stage) => ({ ...stage })),
      threadDefinitions: threadDefinitions.map((thread) => ({ ...thread })),
      threadHeatmap: threadHeatmap.map((row) => ({
        ...row,
        intensities: row.intensities.map((intensity) => ({ ...intensity })),
      })),
      timelineEvents: timelineEvents.map((event) => ({ ...event })),
      diagnostics: diagnostics.map((item) => ({ ...item })),
      revisionSnapshots: revisionSnapshots.map((snapshot) => ({ ...snapshot })),
      exportPresets: exportPresets.map((preset) => ({ ...preset })),
      planLimits: planLimits.map((limit) => ({ ...limit })),
      apiEndpoints: apiEndpoints.map((endpoint) => ({ ...endpoint })),
      activity: activityLog.map((entry) => ({ ...entry })),
      sceneBoard: sceneBoard.map((lane) => ({
        ...lane,
        scenes: lane.scenes.map((scene) => ({ ...scene, linkedThreads: [...scene.linkedThreads] })),
      })),
      characterRoster: characterRoster.map((character) => ({
        ...character,
        relationships: character.relationships.map((rel) => ({ ...rel })),
      })),
      worldAtlas: worldAtlas.map((entry) => ({ ...entry, linkedChapters: [...entry.linkedChapters] })),
      workspacePanels: workspacePanels.map((panel) => ({ ...panel })),
      workspaceMetrics: { ...defaultWorkspaceMetrics },
      metrics: {
        activeProjects: 0,
        totalTargetWords: 0,
        beatsOutlined: 0,
        averageTimelineConfidence: 0,
        revisionSnapshots: revisionSnapshots.length,
      },
      wizard: {
        genre: 'Science Fantasy',
        audience: 'Adult',
        comps: ['The Memory Police', 'This Is How You Lose the Time War'],
        tone: 'Lyrical & high-stakes',
        pov: 'Multi-POV',
        tense: 'Past',
        structureKey: initialProject?.structureKey ?? fallbackStructure,
        wordTarget: initialProject?.targetWords ?? 100_000,
        elevatorPitch: initialProject?.logline ?? '',
      },
      exportState: {
        selectedFormat: 'md',
        status: 'idle',
        lastJobId: null,
      },
      threadSelection: {
        selectedThreadKey: threadDefinitions[0]?.key ?? 'time-paradox',
        highlightLevel: 3,
      },
      selectedProjectId: initialProject?.id ?? null,
      selectedStructureKey: initialProject?.structureKey ?? fallbackStructure,
      selectedSnowflakeStep: initialProject?.snowflakeStep ?? 1,
      selectedPanelKey: 'beats',
      timelineView: 'narrative',
    };
    this.refreshMetrics();
    this.refreshWorkspaceMetrics();
  }

  onInit(): void {
    if (this.initialised) return;
    this.initialised = true;
    this.refreshMetrics();
    this.refreshWorkspaceMetrics();
  }

  get plan(): PlanTier {
    return this.state.plan;
  }

  get availableStructures(): StructurePreset[] {
    if (this.plan === 'pro') return this.state.structurePresets;
    return this.state.structurePresets.filter((preset) => preset.plan === 'free');
  }

  get selectedProject(): NovelProject | null {
    const { selectedProjectId } = this.state;
    if (!selectedProjectId) return this.state.projects[0] ?? null;
    return this.state.projects.find((project) => project.id === selectedProjectId) ?? this.state.projects[0] ?? null;
  }

  get selectedStructure(): StructurePreset | null {
    return this.state.structurePresets.find((preset) => preset.key === this.state.selectedStructureKey) ?? null;
  }

  get selectedSnowflake(): SnowflakeStage | null {
    return this.state.snowflakeStages.find((stage) => stage.step === this.state.selectedSnowflakeStep) ?? null;
  }

  get filteredProjects(): NovelProject[] {
    const { filters } = this.state;
    const search = filters.search.trim().toLowerCase();
    return this.state.projects.filter((project) => {
      if (filters.status !== 'all' && project.status !== filters.status) {
        return false;
      }
      if (filters.structure !== 'all' && project.structureKey !== filters.structure) {
        return false;
      }
      if (filters.plan !== 'all' && project.plan !== filters.plan) {
        return false;
      }
      if (!search) return true;
      return (
        project.title.toLowerCase().includes(search) ||
        project.logline.toLowerCase().includes(search) ||
        project.tags.some((tag) => tag.toLowerCase().includes(search))
      );
    });
  }

  get allowedSnowflakeSteps(): number {
    return this.plan === 'pro' ? 7 : 3;
  }

  get snowflakeCompletionPercent(): number {
    const completed = Math.min(this.state.selectedSnowflakeStep, this.allowedSnowflakeSteps);
    return Math.round((completed / this.allowedSnowflakeSteps) * 100);
  }

  get selectedThread(): ThreadDefinition | null {
    return this.state.threadDefinitions.find((thread) => thread.key === this.state.threadSelection.selectedThreadKey) ?? null;
  }

  get selectedPanelDescription(): string {
    const panel = this.state.workspacePanels.find((item) => item.key === this.state.selectedPanelKey);
    return panel?.description ?? '';
  }

  selectProject(id: string): void {
    if (id === this.state.selectedProjectId) return;
    const project = this.state.projects.find((item) => item.id === id);
    if (!project) return;
    this.state.selectedProjectId = id;
    this.state.selectedStructureKey = project.structureKey;
    this.state.selectedSnowflakeStep = project.snowflakeStep;
    this.state.wizard.structureKey = project.structureKey;
    this.state.wizard.wordTarget = project.targetWords;
    this.state.wizard.elevatorPitch = project.logline;
    this.refreshWorkspaceMetrics();
  }

  setFilter<TField extends keyof Filters>(field: TField, value: Filters[TField]): void {
    if (this.state.filters[field] === value) return;
    this.state.filters = {
      ...this.state.filters,
      [field]: value,
    };
  }

  resetFilters(): void {
    this.state.filters = {
      search: '',
      status: 'all',
      structure: 'all',
      plan: 'all',
    };
  }

  updateSearch(value: string): void {
    this.setFilter('search', value);
  }

  togglePlan(): void {
    this.setPlan(this.plan === 'pro' ? 'free' : 'pro');
  }

  setPlan(plan: PlanTier): void {
    if (plan === this.state.plan) return;
    this.state.plan = plan;
    const selectedStructure = this.state.selectedStructureKey;
    if (plan === 'free') {
      const allowedKeys = this.availableStructures.map((preset) => preset.key);
      if (!allowedKeys.includes(selectedStructure)) {
        this.state.selectedStructureKey = allowedKeys[0] ?? this.state.structurePresets[0]?.key ?? 'three-act';
      }
      if (this.state.selectedSnowflakeStep > this.allowedSnowflakeSteps) {
        this.state.selectedSnowflakeStep = this.allowedSnowflakeSteps;
      }
    }
  }

  selectStructure(key: StructureKey): void {
    if (this.state.selectedStructureKey === key) return;
    const preset = this.state.structurePresets.find((item) => item.key === key);
    if (!preset) return;
    if (preset.plan === 'pro' && this.plan === 'free') {
      return;
    }
    this.state.selectedStructureKey = key;
  }

  advanceSnowflake(): void {
    const next = this.state.selectedSnowflakeStep + 1;
    if (next > this.allowedSnowflakeSteps) return;
    this.state.selectedSnowflakeStep = next;
  }

  rewindSnowflake(): void {
    const prev = this.state.selectedSnowflakeStep - 1;
    if (prev < 1) return;
    this.state.selectedSnowflakeStep = prev;
  }

  selectPanel(key: WorkspacePanelKey): void {
    if (this.state.selectedPanelKey === key) return;
    this.state.selectedPanelKey = key;
  }

  selectThread(key: string): void {
    const thread = this.state.threadDefinitions.find((item) => item.key === key);
    if (!thread) return;
    this.state.threadSelection.selectedThreadKey = key;
  }

  setThreadHighlight(level: 0 | 1 | 2 | 3): void {
    if (this.state.threadSelection.highlightLevel === level) return;
    this.state.threadSelection.highlightLevel = level;
  }

  updateWizard<K extends keyof WizardState>(field: K, value: WizardState[K]): void {
    this.state.wizard = {
      ...this.state.wizard,
      [field]: value,
    };
  }

  queueProjectFromWizard(): void {
    const jobId = formatJobId('md');
    const newProject: NovelProject = {
      id: `proj-${Date.now()}`,
      title: `${this.state.wizard.genre} Outline`,
      logline: this.state.wizard.elevatorPitch || 'Draft logline pending.',
      genre: this.state.wizard.genre,
      audience: this.state.wizard.audience,
      status: 'draft',
      plan: this.plan,
      structureKey: this.state.wizard.structureKey,
      pov: this.state.wizard.pov,
      tense: this.state.wizard.tense,
      targetWords: this.state.wizard.wordTarget,
      draftedWords: 0,
      snowflakeStep: 1,
      lastEdited: now().toISOString(),
      tags: ['New project'],
      heatmapCoverage: 0,
      timelineConfidence: 0,
      acts: [],
      chapters: [],
    };
    this.state.projects = [newProject, ...this.state.projects];
    this.state.selectedProjectId = newProject.id;
    this.state.selectedStructureKey = newProject.structureKey;
    this.state.selectedSnowflakeStep = newProject.snowflakeStep;
    this.refreshMetrics();
    this.state.exportState = {
      selectedFormat: 'md',
      status: 'queued',
      lastJobId: jobId,
    };
  }

  selectExportFormat(format: ExportPreset['format']): void {
    if (this.state.exportState.selectedFormat === format) return;
    this.state.exportState.selectedFormat = format;
  }

  queueExport(): void {
    const { selectedFormat } = this.state.exportState;
    const preset = this.state.exportPresets.find((item) => item.format === selectedFormat);
    if (!preset) return;
    if (preset.plan === 'pro' && this.plan === 'free') {
      return;
    }
    const jobId = formatJobId(selectedFormat);
    this.state.exportState = {
      selectedFormat,
      status: 'queued',
      lastJobId: jobId,
    };
  }

  markExportComplete(): void {
    if (this.state.exportState.status !== 'queued') return;
    this.state.exportState.status = 'complete';
  }

  toggleTimelineView(): void {
    this.state.timelineView = this.state.timelineView === 'narrative' ? 'chronological' : 'narrative';
  }

  private refreshMetrics(): void {
    const activeProjects = this.state.projects.filter((project) => project.status === 'active').length;
    const totalTargetWords = this.state.projects.reduce((total, project) => total + project.targetWords, 0);
    let beatsOutlined = 0;
    let timelineSum = 0;
    this.state.projects.forEach((project) => {
      project.acts.forEach((act) => {
        act.beats.forEach((beat) => {
          if (beat.status !== 'idea') {
            beatsOutlined += 1;
          }
        });
      });
      timelineSum += project.timelineConfidence;
    });
    const averageTimelineConfidence = this.state.projects.length
      ? Math.round(timelineSum / this.state.projects.length)
      : 0;
    this.state.metrics = {
      activeProjects,
      totalTargetWords,
      beatsOutlined,
      averageTimelineConfidence,
      revisionSnapshots: this.state.revisionSnapshots.length,
    };
  }

  private refreshWorkspaceMetrics(): void {
    const project = this.selectedProject;
    if (!project) return;
    let beatsOutlined = 0;
    project.acts.forEach((act) => {
      act.beats.forEach((beat) => {
        if (beat.status !== 'idea') {
          beatsOutlined += 1;
        }
      });
    });
    const scenesPlanned = this.state.sceneBoard.reduce((total, lane) => total + lane.scenes.length, 0);
    const timelineWarnings = this.state.diagnostics.filter((diag) => diag.type === 'continuity').length;
    this.state.workspaceMetrics = {
      beatsOutlined,
      scenesPlanned: scenesPlanned || defaultWorkspaceMetrics.scenesPlanned,
      timelineWarnings,
      threadCoverage: project.heatmapCoverage,
      povBalance: 'Lyra 65% · Tarek 25% · Ansel 10%',
    };
  }
}

const novelOutliner = new NovelOutlinerStore();

Alpine.store('novel-outliner', novelOutliner);

export type NovelOutlinerAlpineStore = NovelOutlinerStore;
export { novelOutliner };

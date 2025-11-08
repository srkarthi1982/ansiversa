import Alpine from 'alpinejs';
import { BaseStore } from '../../../alpineStores/base';
import {
  getDataModel,
  getExportPresets,
  getHeroHighlights,
  getInitialStatusFeed,
  getIntegrations,
  getPlanComparison,
  getPracticeTools,
  getQuoteCollections,
  getRhetoricToggles,
  getTeleprompterPresets,
  getTemplates,
  getWorkflowStages,
  getWorkspaceTabs,
  type DataModelEntity,
  type ExportPreset,
  type HeroHighlight,
  type IntegrationCard,
  type PlanComparisonRow,
  type PracticeTool,
  type QuoteCollection,
  type RhetoricToggle,
  type SpeechTemplate,
  type TeleprompterPreset,
  type WorkflowStage,
  type WorkspaceTab,
} from '../data/speechWriterData';

export type StatusEntry = {
  message: string;
  timestamp: string;
};

export type PracticeRun = {
  id: string;
  label: string;
  durationMinutes: number;
  pace: number;
  filler: number;
  note: string;
  timestamp: string;
};

type Metrics = {
  words: number;
  minutes: number;
  wpm: number;
  pauseBudget: number;
  audience: string;
  language: string;
  progressPercent: number;
};

const formatNow = () =>
  new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

class SpeechWriterStore extends BaseStore {
  readonly heroHighlights: HeroHighlight[];
  readonly templates: SpeechTemplate[];
  readonly workflowStages: WorkflowStage[];
  readonly workspaceTabs: WorkspaceTab[];
  readonly rhetoricToggles: RhetoricToggle[];
  readonly practiceTools: PracticeTool[];
  readonly teleprompterPresets: TeleprompterPreset[];
  readonly quoteCollections: QuoteCollection[];
  readonly exportPresets: ExportPreset[];
  readonly planComparison: PlanComparisonRow[];
  readonly dataModel: DataModelEntity[];
  readonly integrations: IntegrationCard[];
  statusFeed: StatusEntry[];
  practiceLog: PracticeRun[];
  metrics: Metrics;
  activeStageId: string | null;
  selectedTemplateId: string | null;
  activeWorkspaceTabId: string | null;
  selectedQuoteCollectionId: string | null;
  selectedTeleprompterPresetId: string | null;
  selectedExportPresetId: string | null;
  private initialised = false;

  constructor() {
    super();
    this.heroHighlights = getHeroHighlights();
    this.templates = getTemplates();
    this.workflowStages = getWorkflowStages();
    this.workspaceTabs = getWorkspaceTabs();
    this.rhetoricToggles = getRhetoricToggles();
    this.practiceTools = getPracticeTools();
    this.teleprompterPresets = getTeleprompterPresets();
    this.quoteCollections = getQuoteCollections();
    this.exportPresets = getExportPresets();
    this.planComparison = getPlanComparison();
    this.dataModel = getDataModel();
    this.integrations = getIntegrations();
    this.statusFeed = getInitialStatusFeed().map((message) => ({ message, timestamp: formatNow() }));
    this.practiceLog = [];
    this.selectedTemplateId = this.templates[0]?.id ?? null;
    this.activeStageId = this.workflowStages[0]?.id ?? null;
    this.activeWorkspaceTabId = this.workspaceTabs[0]?.id ?? null;
    this.selectedQuoteCollectionId = this.quoteCollections[0]?.id ?? null;
    this.selectedTeleprompterPresetId = this.teleprompterPresets[0]?.id ?? null;
    this.selectedExportPresetId = this.exportPresets[0]?.id ?? null;
    this.metrics = {
      words: 0,
      minutes: 0,
      wpm: 0,
      pauseBudget: 0,
      audience: '',
      language: '',
      progressPercent: 0,
    };
    this.recalculateMetrics();
    this.recalculateProgress();
  }

  init(): void {
    if (this.initialised) return;
    this.initialised = true;
    this.logStatus('Speech Writer workspace initialised with saved defaults.');
  }

  get selectedTemplate(): SpeechTemplate | null {
    return this.templates.find((template) => template.id === this.selectedTemplateId) ?? this.templates[0] ?? null;
  }

  get activeStage(): WorkflowStage | null {
    return this.workflowStages.find((stage) => stage.id === this.activeStageId) ?? null;
  }

  get activeWorkspaceTab(): WorkspaceTab | null {
    return this.workspaceTabs.find((tab) => tab.id === this.activeWorkspaceTabId) ?? this.workspaceTabs[0] ?? null;
  }

  get selectedQuoteCollection(): QuoteCollection | null {
    return (
      this.quoteCollections.find((collection) => collection.id === this.selectedQuoteCollectionId) ??
      this.quoteCollections[0] ??
      null
    );
  }

  get selectedTeleprompterPreset(): TeleprompterPreset | null {
    return (
      this.teleprompterPresets.find((preset) => preset.id === this.selectedTeleprompterPresetId) ??
      this.teleprompterPresets[0] ??
      null
    );
  }

  get selectedExportPreset(): ExportPreset | null {
    return (
      this.exportPresets.find((preset) => preset.id === this.selectedExportPresetId) ??
      this.exportPresets[0] ??
      null
    );
  }

  selectTemplate(id: string): void {
    if (id === this.selectedTemplateId) return;
    const template = this.templates.find((item) => item.id === id);
    if (!template) return;
    this.selectedTemplateId = template.id;
    this.recalculateMetrics();
    this.logStatus(`Template switched to ${template.name}. Outline updated for ${template.occasion}.`);
  }

  cycleTemplate(direction: 'next' | 'previous'): void {
    if (!this.templates.length) return;
    const currentIndex = this.templates.findIndex((template) => template.id === this.selectedTemplateId);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const offset = direction === 'next' ? 1 : -1;
    const nextIndex = (safeIndex + offset + this.templates.length) % this.templates.length;
    const nextTemplate = this.templates[nextIndex];
    this.selectTemplate(nextTemplate.id);
  }

  toggleRhetoric(id: string): void {
    const toggle = this.rhetoricToggles.find((item) => item.id === id);
    if (!toggle) return;
    toggle.enabled = !toggle.enabled;
    this.logStatus(`${toggle.label} ${toggle.enabled ? 'enabled' : 'disabled'} for upcoming drafts.`);
  }

  selectWorkspaceTab(id: string): void {
    if (id === this.activeWorkspaceTabId) return;
    const tab = this.workspaceTabs.find((item) => item.id === id);
    if (!tab) return;
    this.activeWorkspaceTabId = tab.id;
    this.logStatus(`${tab.label} workspace opened. ${tab.summary}`);
  }

  selectQuoteCollection(id: string): void {
    if (id === this.selectedQuoteCollectionId) return;
    const collection = this.quoteCollections.find((item) => item.id === id);
    if (!collection) return;
    this.selectedQuoteCollectionId = collection.id;
    this.logStatus(`Quote collection set to ${collection.topic}. Suggestions refreshed.`);
  }

  selectTeleprompterPreset(id: string): void {
    if (id === this.selectedTeleprompterPresetId) return;
    const preset = this.teleprompterPresets.find((item) => item.id === id);
    if (!preset) return;
    this.selectedTeleprompterPresetId = preset.id;
    this.logStatus(`Teleprompter preset switched to ${preset.label}.`);
  }

  selectExportPreset(id: string): void {
    if (id === this.selectedExportPresetId) return;
    const preset = this.exportPresets.find((item) => item.id === id);
    if (!preset) return;
    this.selectedExportPresetId = preset.id;
    this.logStatus(`${preset.label} export queued with ${preset.includes.join(', ')}.`);
  }

  startBrief(): void {
    this.withLoader(() => {
      this.resetWorkflow(false);
      this.logStatus('Brief wizard launched — capture audience, purpose, and pacing preferences.');
    });
  }

  generateOutline(): void {
    this.withLoader(() => {
      this.ensureStageActive('outline');
      this.logStatus('Outline generation requested. Sections will reflect updated brief inputs.');
    });
  }

  generateDraft(): void {
    this.withLoader(() => {
      this.ensureStageActive('draft');
      this.logStatus('Drafting underway with selected rhetorical devices.');
    });
  }

  prepareTeleprompter(): void {
    this.withLoader(() => {
      this.ensureStageActive('teleprompter');
      const preset = this.selectedTeleprompterPreset;
      this.logStatus(
        `Teleprompter script prepared in ${preset?.label ?? 'default'} mode with ${this.metrics.words} words.`
      );
    });
  }

  advanceStage(): void {
    const currentIndex = this.workflowStages.findIndex((stage) => stage.id === this.activeStageId);
    if (currentIndex >= 0) {
      const current = this.workflowStages[currentIndex];
      current.status = 'complete';
      const next = this.workflowStages[currentIndex + 1];
      if (next) {
        next.status = 'active';
        this.activeStageId = next.id;
        this.logStatus(`${next.label} started. ${next.summary}`);
      } else {
        this.activeStageId = current.id;
        this.logStatus('Workflow complete. Ready for export and delivery.');
      }
      this.recalculateProgress();
      return;
    }

    const firstPending = this.workflowStages.find((stage) => stage.status === 'pending');
    if (firstPending) {
      firstPending.status = 'active';
      this.activeStageId = firstPending.id;
      this.logStatus(`${firstPending.label} started. ${firstPending.summary}`);
      this.recalculateProgress();
    }
  }

  resetWorkflow(log = true): void {
    this.workflowStages.forEach((stage, index) => {
      stage.status = index === 0 ? 'active' : 'pending';
    });
    this.activeStageId = this.workflowStages[0]?.id ?? null;
    this.recalculateProgress();
    if (log) {
      this.logStatus('Workflow reset. Begin again from brief intake.');
    }
  }

  logPracticeRun(): void {
    const template = this.selectedTemplate;
    if (!template) return;
    const variancePattern = [-0.5, 0.25, -0.1, 0.4];
    const index = this.practiceLog.length % variancePattern.length;
    const variance = variancePattern[index];
    const duration = Math.max(1, template.targetMinutes + variance);
    const wpm = Math.round((this.metrics.words / (duration * 60)) * 60);
    const filler = Math.max(0, Math.round(variance >= 0 ? 3 - index : 2 + index));
    const run: PracticeRun = {
      id: `run-${Date.now()}`,
      label: `Run ${this.practiceLog.length + 1}`,
      durationMinutes: Number(duration.toFixed(1)),
      pace: wpm,
      filler,
      note:
        variance > 0
          ? 'Slightly over target — tighten transitions and trim anecdotes.'
          : 'Under target — add storytelling detail to core section.',
      timestamp: formatNow(),
    };
    this.practiceLog.unshift(run);
    if (this.practiceLog.length > 6) {
      this.practiceLog.pop();
    }
    this.logStatus(`Practice run logged at ${run.pace} WPM with ${run.filler} filler markers.`);
  }

  adjustTiming(direction: 'tighten' | 'expand'): void {
    const delta = direction === 'tighten' ? -80 : 80;
    this.metrics.words = Math.max(200, this.metrics.words + delta);
    const template = this.selectedTemplate;
    if (template) {
      const minutes = this.metrics.words / template.targetWpm;
      this.metrics.minutes = Number(minutes.toFixed(1));
      this.metrics.pauseBudget = Math.round(this.metrics.minutes * 12);
    }
    this.logStatus(`Timing adjusted to ${this.metrics.minutes} minutes (≈${this.metrics.words} words).`);
  }

  private ensureStageActive(id: WorkflowStage['id']): void {
    const stage = this.workflowStages.find((item) => item.id === id);
    if (!stage) return;
    if (stage.status === 'pending') {
      this.workflowStages.forEach((item) => {
        if (item.id === id) {
          item.status = 'active';
          this.activeStageId = item.id;
        } else if (item.status === 'active') {
          item.status = 'complete';
        }
      });
      this.logStatus(`${stage.label} promoted to active stage.`);
    }
    this.recalculateProgress();
  }

  private recalculateMetrics(): void {
    const template = this.selectedTemplate;
    if (!template) {
      this.metrics = {
        words: 0,
        minutes: 0,
        wpm: 0,
        pauseBudget: 0,
        audience: '',
        language: '',
        progressPercent: this.metrics.progressPercent ?? 0,
      };
      return;
    }

    const estimatedWords = template.targetMinutes * template.targetWpm;
    const pauseBudget = Math.round(template.targetMinutes * 12);
    this.metrics.words = estimatedWords;
    this.metrics.minutes = template.targetMinutes;
    this.metrics.wpm = template.targetWpm;
    this.metrics.pauseBudget = pauseBudget;
    this.metrics.audience = template.occasion;
    this.metrics.language = template.language;
    this.metrics.progressPercent = this.metrics.progressPercent ?? 0;
  }

  private recalculateProgress(): void {
    if (!this.workflowStages.length) {
      this.metrics.progressPercent = 0;
      return;
    }
    const total = this.workflowStages.length;
    const completeCount = this.workflowStages.filter((stage) => stage.status === 'complete').length;
    const activeBonus = this.workflowStages.some((stage) => stage.status === 'active') ? 0.5 : 0;
    this.metrics.progressPercent = Math.round(((completeCount + activeBonus) / total) * 100);
  }

  private logStatus(message: string): void {
    this.statusFeed.unshift({ message, timestamp: formatNow() });
    if (this.statusFeed.length > 8) {
      this.statusFeed.pop();
    }
  }
}

const speechWriterStore = new SpeechWriterStore();

Alpine.store('speechWriter', speechWriterStore);

export type SpeechWriterAlpineStore = SpeechWriterStore;
export { speechWriterStore };

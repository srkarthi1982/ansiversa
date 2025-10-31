import Alpine from 'alpinejs';
import { BaseStore } from '../../../alpineStores/base';
import {
  getArtifacts,
  getCaptureModes,
  getDataModel,
  getExportPresets,
  getIntegrationCards,
  getPipelineStages,
  getPlanComparison,
  getQualityChecks,
  getStatusFeed,
  getWorkspacePages,
  getWorkspaceTabs,
  type ArtifactType,
  type CaptureMode,
  type DataModelEntity,
  type ExportPreset,
  type IntegrationCard,
  type PipelineStage,
  type PlanComparisonRow,
  type QualityCheck,
  type WorkspaceBlock,
  type WorkspacePage,
  type WorkspaceTab,
} from '../data/smartTextbookScannerData';

type PipelineAction = {
  id: string;
  message: string;
  timestamp: string;
};

const formatNow = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

class SmartTextbookScannerStore extends BaseStore {
  readonly captureModes: CaptureMode[];
  readonly pipelineStages: PipelineStage[];
  readonly workspaceTabs: WorkspaceTab[];
  readonly pages: WorkspacePage[];
  readonly artifacts: ArtifactType[];
  readonly exportPresets: ExportPreset[];
  readonly planComparison: PlanComparisonRow[];
  readonly integrations: IntegrationCard[];
  readonly qualityChecks: QualityCheck[];
  readonly dataModel: DataModelEntity[];
  statusFeed: string[];
  pipelineLog: PipelineAction[];
  pipelineProgress = 0;
  activeCaptureModeId: string | null;
  activeWorkspaceTabId: string | null;
  activePageId: string | null;
  selectedBlockId: string | null;
  activeArtifactId: string | null;
  private initialised = false;

  constructor() {
    super();
    this.captureModes = getCaptureModes();
    this.pipelineStages = getPipelineStages();
    this.workspaceTabs = getWorkspaceTabs();
    this.pages = getWorkspacePages();
    this.artifacts = getArtifacts();
    this.exportPresets = getExportPresets();
    this.planComparison = getPlanComparison();
    this.integrations = getIntegrationCards();
    this.qualityChecks = getQualityChecks();
    this.dataModel = getDataModel();
    this.statusFeed = [...getStatusFeed()];
    this.pipelineLog = [];
    this.activeCaptureModeId = this.captureModes[0]?.id ?? null;
    this.activeWorkspaceTabId = this.workspaceTabs[0]?.id ?? null;
    this.activePageId = this.pages[0]?.id ?? null;
    this.selectedBlockId = this.pages[0]?.blocks[0]?.id ?? null;
    this.activeArtifactId = this.artifacts[0]?.id ?? null;
    this.recalculateProgress();
  }

  init(): void {
    if (this.initialised) return;
    this.initialised = true;
    this.logStatus('Scanner workspace ready. Progress updates will stream live.');
  }

  selectCaptureMode(id: string): void {
    if (this.activeCaptureModeId === id) return;
    const mode = this.captureModes.find((item) => item.id === id);
    if (!mode) return;
    this.activeCaptureModeId = id;
    this.logStatus(`${mode.label} selected. Prep your pages and tap capture when ready.`);
  }

  startCapture(): void {
    const mode = this.captureModes.find((item) => item.id === this.activeCaptureModeId);
    this.withLoader(() => {
      const label = mode?.label ?? 'Capture';
      this.logStatus(`${label} started — analysing lighting and alignment.`);
      this.appendPipelineLog(`${label} complete. 12 pages queued for preprocessing.`);
      const firstStage = this.pipelineStages[0];
      if (firstStage && firstStage.status === 'active') {
        this.logStatus('Preprocess & Clean running. Deskew and denoise in progress.');
      } else if (firstStage) {
        firstStage.status = 'active';
        this.logStatus('Preprocess & Clean initialised.');
      }
      this.recalculateProgress();
    });
  }

  advancePipeline(): void {
    const currentIndex = this.pipelineStages.findIndex((stage) => stage.status === 'active');
    if (currentIndex >= 0) {
      const current = this.pipelineStages[currentIndex];
      current.status = 'complete';
      this.appendPipelineLog(`${current.label} finished with ${current.outputs.join(', ')}.`);
      const next = this.pipelineStages[currentIndex + 1];
      if (next) {
        next.status = 'active';
        this.logStatus(`${next.label} started. ${next.summary}`);
      } else {
        this.logStatus('Pipeline complete. Artifacts ready for review.');
      }
      this.recalculateProgress();
      return;
    }

    const nextIndex = this.pipelineStages.findIndex((stage) => stage.status === 'pending');
    if (nextIndex >= 0) {
      const next = this.pipelineStages[nextIndex];
      next.status = 'active';
      this.logStatus(`${next.label} started. ${next.summary}`);
      this.recalculateProgress();
    }
  }

  resetPipeline(): void {
    this.pipelineStages.forEach((stage, index) => {
      stage.status = index === 0 ? 'active' : 'pending';
    });
    this.pipelineLog = [];
    this.pipelineProgress = 0;
    this.logStatus('Pipeline reset. Ready for a fresh scan.');
  }

  selectWorkspaceTab(id: string): void {
    if (this.activeWorkspaceTabId === id) return;
    const tab = this.workspaceTabs.find((item) => item.id === id);
    if (!tab) return;
    this.activeWorkspaceTabId = id;
    this.logStatus(`${tab.label} view loaded. ${tab.summary}`);
  }

  selectPage(id: string): void {
    if (this.activePageId === id) return;
    const page = this.pages.find((item) => item.id === id);
    if (!page) return;
    this.activePageId = id;
    this.selectedBlockId = page.blocks[0]?.id ?? null;
    this.logStatus(`Viewing page ${page.pageNumber} · ${page.chapter}.`);
  }

  selectBlock(id: string): void {
    const block = this.getBlockById(id);
    if (!block) return;
    this.selectedBlockId = id;
    this.logStatus(`${block.heading} selected. Confidence ${(block.confidence * 100).toFixed(0)}%.`);
  }

  toggleBlockFlag(id: string): void {
    const block = this.getBlockById(id);
    if (!block) return;
    block.flagged = !block.flagged;
    this.logStatus(`${block.heading} ${block.flagged ? 'flagged for human review' : 'cleared from review queue'}.`);
  }

  generateArtifact(id: string): void {
    const artifact = this.artifacts.find((item) => item.id === id);
    if (!artifact) return;
    this.activeArtifactId = id;
    this.withLoader(() => {
      artifact.generated += 1;
      this.logStatus(`${artifact.label} regenerated with latest corrections.`);
      this.appendPipelineLog(`${artifact.label} export updated.`);
    });
  }

  queueExport(id: string): void {
    const preset = this.exportPresets.find((item) => item.id === id);
    if (!preset) return;
    this.withLoader(() => {
      preset.lastRun = 'Just now';
      this.logStatus(`${preset.label} queued. We will notify when ready.`);
      this.appendPipelineLog(`${preset.label} export job submitted.`);
    });
  }

  cycleQualityStatus(id: string): void {
    const check = this.qualityChecks.find((item) => item.id === id);
    if (!check) return;
    if (check.status === 'passed') {
      check.status = 'warning';
    } else if (check.status === 'warning') {
      check.status = 'needs-review';
    } else {
      check.status = 'passed';
    }
    this.logStatus(`${check.label} marked as ${check.status}.`);
  }

  get activeTab(): WorkspaceTab | null {
    return this.workspaceTabs.find((item) => item.id === this.activeWorkspaceTabId) ?? null;
  }

  get activePage(): WorkspacePage | null {
    return this.pages.find((item) => item.id === this.activePageId) ?? null;
  }

  get selectedBlock(): WorkspaceBlock | null {
    const page = this.activePage;
    if (!page) return null;
    return page.blocks.find((block) => block.id === this.selectedBlockId) ?? null;
  }

  private getBlockById(id: string): WorkspaceBlock | null {
    for (const page of this.pages) {
      const block = page.blocks.find((item) => item.id === id);
      if (block) {
        return block;
      }
    }
    return null;
  }

  private recalculateProgress(): void {
    const total = this.pipelineStages.length;
    const completed = this.pipelineStages.filter((stage) => stage.status === 'complete').length;
    const active = this.pipelineStages.some((stage) => stage.status === 'active');
    const ratio = total === 0 ? 0 : completed / total;
    this.pipelineProgress = Math.round(ratio * 100 + (active ? 10 : 0));
    if (this.pipelineProgress > 100) {
      this.pipelineProgress = 100;
    }
  }

  private logStatus(message: string): void {
    const feed = this.statusFeed;
    feed.unshift(message);
    if (feed.length > 6) {
      feed.pop();
    }
  }

  private appendPipelineLog(message: string): void {
    this.pipelineLog.unshift({
      id: `log-${this.pipelineLog.length + 1}-${Date.now()}`,
      message,
      timestamp: formatNow(),
    });
    if (this.pipelineLog.length > 5) {
      this.pipelineLog.pop();
    }
  }
}

const smartTextbookScanner = new SmartTextbookScannerStore();

Alpine.store('smartTextbookScanner', smartTextbookScanner);

export type SmartTextbookScannerAlpineStore = SmartTextbookScannerStore;
export { smartTextbookScanner };

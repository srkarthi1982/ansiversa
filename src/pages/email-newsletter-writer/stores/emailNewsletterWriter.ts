import Alpine from 'alpinejs';
import { BaseStore } from '../../../alpineStores/base';
import { getEmailNewsletterWriterSample } from '../../../data/emailNewsletterWriterSamples';
import type {
  EmailNewsletterWriterSample,
  NewsletterApiContract,
  NewsletterAutomation,
  NewsletterBlock,
  NewsletterBlockLibraryGroup,
  NewsletterExportJob,
  NewsletterIssue,
  NewsletterPlanMatrixRow,
  NewsletterQaHighlight,
  NewsletterTemplate,
  NewsletterIntegration,
  NewsletterAiAssistant,
  NewsletterRoadmapStage,
} from '../../../types/email-newsletter-writer';

type PreviewMode = 'desktop' | 'mobile';
type WorkspacePanel = 'properties' | 'qa' | 'export';

type UsageState = EmailNewsletterWriterSample['usage'];

type EmailNewsletterWriterState = {
  loading: boolean;
  plan: EmailNewsletterWriterSample['plan'];
  usage: UsageState;
  issue: NewsletterIssue | null;
  previewMode: PreviewMode;
  activePanel: WorkspacePanel;
  selectedBlockId: string | null;
  blockLibrary: NewsletterBlockLibraryGroup[];
  templates: NewsletterTemplate[];
  automations: NewsletterAutomation[];
  integrations: NewsletterIntegration[];
  aiAssistants: NewsletterAiAssistant[];
  exportHistory: NewsletterExportJob[];
  planMatrix: NewsletterPlanMatrixRow[];
  apiContracts: NewsletterApiContract[];
  qaHighlights: NewsletterQaHighlight[];
  roadmap: NewsletterRoadmapStage[];
  lastAppliedTemplateId: string | null;
};

const PREVIEW_MODE_DEFAULT: PreviewMode = 'desktop';
const PANEL_DEFAULT: WorkspacePanel = 'properties';

class EmailNewsletterWriterStore extends BaseStore {
  state: EmailNewsletterWriterState = {
    loading: false,
    plan: 'free',
    usage: {
      issuesUsed: 0,
      issuesLimit: 0,
      exportsUsed: 0,
      exportsLimit: 0,
      lastExportAt: '',
    },
    issue: null,
    previewMode: PREVIEW_MODE_DEFAULT,
    activePanel: PANEL_DEFAULT,
    selectedBlockId: null,
    blockLibrary: [],
    templates: [],
    automations: [],
    integrations: [],
    aiAssistants: [],
    exportHistory: [],
    planMatrix: [],
    apiContracts: [],
    qaHighlights: [],
    roadmap: [],
    lastAppliedTemplateId: null,
  };

  private initialised = false;

  initLanding(): void {
    if (this.initialised) return;
    this.initialised = true;
    this.hydrate();
  }

  get issue(): NewsletterIssue | null {
    return this.state.issue;
  }

  get selectedBlock(): NewsletterBlock | null {
    const { issue, selectedBlockId } = this.state;
    if (!issue || !selectedBlockId) return null;
    return issue.blocks.find((block) => block.id === selectedBlockId) ?? null;
  }

  setPreviewMode(mode: PreviewMode): void {
    if (this.state.previewMode === mode) return;
    this.state.previewMode = mode;
  }

  setActivePanel(panel: WorkspacePanel): void {
    if (this.state.activePanel === panel) return;
    this.state.activePanel = panel;
  }

  selectBlock(blockId: string): void {
    if (this.state.selectedBlockId === blockId) return;
    this.state.selectedBlockId = blockId;
  }

  chooseVariant(testId: string, variantId: string): void {
    const issue = this.state.issue;
    if (!issue) return;
    const test = issue.subjectTests.find((item) => item.id === testId);
    if (!test) return;
    test.chosen = variantId;
  }

  togglePlan(plan: EmailNewsletterWriterSample['plan']): void {
    if (this.state.plan === plan) return;
    this.state.plan = plan;
  }

  applyTemplate(templateId: string): void {
    const issue = this.state.issue;
    if (!issue) return;
    const template = this.state.templates.find((item) => item.id === templateId);
    if (!template) return;
    issue.title = template.name;
    issue.goal = `Ship the ${template.name.toLowerCase()} playbook for ${template.bestFor.toLowerCase()}.`;
    issue.timeline = issue.timeline.map((stage, index) => ({
      ...stage,
      completed: index <= 1,
    }));
    this.state.lastAppliedTemplateId = templateId;
    this.showLoaderBriefly(360);
  }

  queueExport(format: NewsletterExportJob['format']): void {
    const timestamp = new Date().toISOString();
    const job: NewsletterExportJob = {
      id: `export-${format}-${timestamp}`,
      format,
      status: 'queued',
      startedAt: timestamp,
      link: null,
      notes:
        format === 'zip'
          ? 'Preparing HTML + assets bundle with inline CSS.'
          : 'Queued export from workspace preview.',
    };
    this.state.exportHistory = [job, ...this.state.exportHistory];
    this.state.usage = {
      ...this.state.usage,
      exportsUsed: Math.min(this.state.usage.exportsUsed + 1, this.state.usage.exportsLimit),
      lastExportAt: timestamp,
    };
    this.showLoaderBriefly();
  }

  private hydrate(): void {
    this.state.loading = true;
    this.setLoaderVisible(true);
    try {
      const sample = getEmailNewsletterWriterSample();
      this.state.plan = sample.plan;
      this.state.usage = this.clone(sample.usage);
      this.state.issue = this.clone(sample.issue);
      this.state.previewMode = PREVIEW_MODE_DEFAULT;
      this.state.activePanel = PANEL_DEFAULT;
      this.state.selectedBlockId = sample.issue.blocks[0]?.id ?? null;
      this.state.blockLibrary = sample.blockLibrary.map((group) => this.clone(group));
      this.state.templates = sample.templates.map((template) => this.clone(template));
      this.state.automations = sample.automations.map((automation) => this.clone(automation));
      this.state.integrations = sample.integrations.map((integration) => this.clone(integration));
      this.state.aiAssistants = sample.aiAssistants.map((assistant) => this.clone(assistant));
      this.state.exportHistory = sample.exportHistory.map((job) => this.clone(job));
      this.state.planMatrix = sample.planMatrix.map((row) => this.clone(row));
      this.state.apiContracts = sample.apiContracts.map((contract) => this.clone(contract));
      this.state.qaHighlights = sample.qaHighlights.map((highlight) => this.clone(highlight));
      this.state.roadmap = sample.roadmap.map((stage) => this.clone(stage));
      this.state.lastAppliedTemplateId = null;
    } finally {
      this.state.loading = false;
      this.setLoaderVisible(false);
    }
  }
}

const store = new EmailNewsletterWriterStore();
Alpine.store('emailNewsletterWriter', store);

export type EmailNewsletterWriterStoreType = EmailNewsletterWriterStore;

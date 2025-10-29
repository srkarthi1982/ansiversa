import Alpine from 'alpinejs';
import { BaseStore, clone } from '../../../alpineStores/base';

type PlanTier = 'free' | 'pro';
type SummaryMode = 'concise' | 'detailed' | 'bullet' | 'abstract' | 'action';

type SummaryActionItem = {
  id: string;
  text: string;
  owner: string;
  due: string;
  status: 'pending' | 'in-progress' | 'done';
};

type SummaryHighlight = {
  id: string;
  quote: string;
  context: string;
  tag: string;
  page?: string;
};

type SummaryReference = {
  id: string;
  label: string;
  href: string;
};

type SummaryRecord = {
  id: string;
  noteId: string;
  title: string;
  sourceType: 'text' | 'pdf' | 'transcript';
  mode: SummaryMode;
  tone: 'neutral' | 'professional' | 'academic' | 'creative';
  language: string;
  summaryText: string;
  keyPoints: string[];
  highlights: SummaryHighlight[];
  actionItems: SummaryActionItem[];
  references: SummaryReference[];
  tags: string[];
  sentiment: 'positive' | 'neutral' | 'mixed';
  confidence: number;
  summaryRatio: number;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  originalCharacters: number;
  integration: {
    flashnote: boolean;
    research: boolean;
    meeting: boolean;
  };
  exported: {
    markdown: boolean;
    pdf: boolean;
  };
  shareLink?: string | null;
  pinned: boolean;
  attachments: string[];
  owner: string;
  lastViewedAt: string;
  planRequired: PlanTier;
};

type HistoryFilters = {
  mode: SummaryMode | 'all';
  tag: string | 'all';
  sentiment: 'positive' | 'neutral' | 'mixed' | 'all';
  plan: PlanTier | 'all';
};

type Toast = { type: 'success' | 'error' | 'info'; message: string } | null;

type BuilderState = {
  initialized: boolean;
  noteId: string | null;
  summaryId: string | null;
  title: string;
  inputType: 'text' | 'pdf';
  inputText: string;
  inputChars: number;
  inputLimit: number;
  limitWarning: boolean;
  limitExceeded: boolean;
  pdfName: string | null;
  pdfSizeMb: number | null;
  mode: SummaryMode;
  tone: 'neutral' | 'professional' | 'academic' | 'creative';
  language: string;
  aiBusy: boolean;
  progressLabel: string | null;
  summaryText: string;
  keyPoints: string[];
  highlights: SummaryHighlight[];
  actionItems: SummaryActionItem[];
  references: SummaryReference[];
  tags: string[];
  sentiment: 'positive' | 'neutral' | 'mixed';
  summaryRatio: number;
  confidence: number;
  includeFlashnote: boolean;
  includeResearch: boolean;
  includeMeetingMinutes: boolean;
  shareLink: string | null;
  lastSavedAt: string | null;
  autosaveLabel: string;
  toast: Toast;
};

type SummaryViewTab = 'overview' | 'highlights' | 'actions' | 'metadata';

type SummaryViewState = {
  activeId: string | null;
  record: SummaryRecord | null;
  tab: SummaryViewTab;
};

const sampleSummaries: SummaryRecord[] = [
  {
    id: 'q1-strategy-kickoff',
    noteId: 'note-aurora-01',
    title: 'Q1 Product Strategy Kickoff',
    sourceType: 'transcript',
    mode: 'action',
    tone: 'professional',
    language: 'en',
    summaryText:
      'Leadership aligned on three launch pillars: onboarding refresh, AI assistant beta, and analytics revamp. Marketing will prep enablement while product finalises scope lock by March 22. Key risk is data migration readiness for EU tenants.',
    keyPoints: [
      'Three launch pillars approved with cross-functional sponsors assigned.',
      'Finance cleared incremental budget pending weekly burndown updates.',
      'Migration readiness requires additional QA fire drill before March 15.',
    ],
    highlights: [
      {
        id: 'hl-01',
        quote: 'We need the migration rehearsal to include EU sandboxes and red-team scenarios.',
        context: 'CTO flagged compliance edge cases during infrastructure update discussion.',
        tag: 'risk',
      },
      {
        id: 'hl-02',
        quote: 'Customer advisory board meets April 3 — we need a preview deck ready.',
        context: 'VP of Marketing setting external comms milestone.',
        tag: 'milestone',
      },
    ],
    actionItems: [
      {
        id: 'ai-01',
        text: 'Draft launch brief template and circulate for feedback.',
        owner: 'Maya Singh',
        due: '2024-03-12',
        status: 'in-progress',
      },
      {
        id: 'ai-02',
        text: 'Schedule migration fire drill with EU infra team.',
        owner: 'Dev Ops',
        due: '2024-03-15',
        status: 'pending',
      },
    ],
    references: [
      {
        id: 'ref-01',
        label: 'Roadmap Draft v5',
        href: 'https://ansiversa.app/files/roadmap-draft-v5.pdf',
      },
    ],
    tags: ['Product', 'Strategy', 'Leadership'],
    sentiment: 'positive',
    confidence: 0.92,
    summaryRatio: 0.13,
    createdAt: '2024-03-04T15:20:00Z',
    updatedAt: '2024-03-04T15:34:00Z',
    wordCount: 428,
    originalCharacters: 32874,
    integration: {
      flashnote: true,
      research: false,
      meeting: true,
    },
    exported: {
      markdown: true,
      pdf: true,
    },
    shareLink: 'https://share.ansiversa.ai/summaries/q1-strategy',
    pinned: true,
    attachments: ['roadmap-outline.md'],
    owner: 'Maya Singh',
    lastViewedAt: '2024-03-09T09:12:00Z',
    planRequired: 'pro',
  },
  {
    id: 'lecture-thermo-201',
    noteId: 'note-uni-thermo',
    title: 'Thermodynamics Lecture 7',
    sourceType: 'pdf',
    mode: 'detailed',
    tone: 'academic',
    language: 'en',
    summaryText:
      'Lecture covers entropy change in open systems, introduces Gibbs free energy, and walks through phase equilibrium problems. Key derivations connect Maxwell relations and the Clapeyron equation.',
    keyPoints: [
      'Entropy balance for control volumes with heat transfer and mass flow.',
      'Gibbs free energy minimisation governs spontaneous reactions at constant T,P.',
      'Phase equilibrium case studies for water-steam and ammonia systems.',
    ],
    highlights: [
      {
        id: 'hl-03',
        quote: 'dG = VdP - SdT becomes zero at phase equilibrium — use this to derive the Clapeyron relation.',
        context: 'Professor highlighting derivation importance.',
        tag: 'concept',
        page: '12',
      },
    ],
    actionItems: [
      {
        id: 'ai-03',
        text: 'Solve practice problem set 5 and submit by March 10.',
        owner: 'Student',
        due: '2024-03-10',
        status: 'pending',
      },
    ],
    references: [
      {
        id: 'ref-02',
        label: 'Thermo Textbook Chapter 5',
        href: 'https://ansiversa.app/files/thermo-chapter5.pdf',
      },
    ],
    tags: ['Education', 'Engineering'],
    sentiment: 'neutral',
    confidence: 0.88,
    summaryRatio: 0.1,
    createdAt: '2024-03-02T18:05:00Z',
    updatedAt: '2024-03-02T18:06:00Z',
    wordCount: 512,
    originalCharacters: 42500,
    integration: {
      flashnote: true,
      research: true,
      meeting: false,
    },
    exported: {
      markdown: true,
      pdf: false,
    },
    shareLink: null,
    pinned: false,
    attachments: ['lecture7.pdf'],
    owner: 'Jordan Lee',
    lastViewedAt: '2024-03-07T21:42:00Z',
    planRequired: 'pro',
  },
  {
    id: 'daily-standup-ops',
    noteId: 'note-ops-standup',
    title: 'Operations Daily Stand-up',
    sourceType: 'text',
    mode: 'concise',
    tone: 'neutral',
    language: 'en',
    summaryText:
      'Team cleared overnight incidents, flagged shipment delay for Order 4812, and committed to documenting the new fulfillment checklist. No blockers on staffing.',
    keyPoints: [
      'Overnight incidents closed with no SLA breach.',
      'Shipment 4812 delayed pending customs paperwork follow-up.',
      'Fulfillment checklist draft due before Friday retro.',
    ],
    highlights: [
      {
        id: 'hl-04',
        quote: 'We need the updated customs template to avoid repeating this delay tomorrow.',
        context: 'Logistics lead emphasising urgency.',
        tag: 'follow-up',
      },
    ],
    actionItems: [
      {
        id: 'ai-04',
        text: 'Share updated customs template with logistics queue.',
        owner: 'Ops Team',
        due: '2024-03-05',
        status: 'pending',
      },
    ],
    references: [],
    tags: ['Operations'],
    sentiment: 'mixed',
    confidence: 0.81,
    summaryRatio: 0.08,
    createdAt: '2024-03-05T13:05:00Z',
    updatedAt: '2024-03-05T13:10:00Z',
    wordCount: 210,
    originalCharacters: 1860,
    integration: {
      flashnote: false,
      research: false,
      meeting: true,
    },
    exported: {
      markdown: true,
      pdf: false,
    },
    shareLink: 'https://share.ansiversa.ai/summaries/ops-standup',
    pinned: false,
    attachments: [],
    owner: 'Ops Bot',
    lastViewedAt: '2024-03-06T08:12:00Z',
    planRequired: 'free',
  },
];

const defaultBuilderState = (): BuilderState => ({
  initialized: false,
  noteId: null,
  summaryId: null,
  title: 'Untitled note',
  inputType: 'text',
  inputText: '',
  inputChars: 0,
  inputLimit: 50000,
  limitWarning: false,
  limitExceeded: false,
  pdfName: null,
  pdfSizeMb: null,
  mode: 'concise',
  tone: 'neutral',
  language: 'en',
  aiBusy: false,
  progressLabel: null,
  summaryText: '',
  keyPoints: [],
  highlights: [],
  actionItems: [],
  references: [],
  tags: ['Quick Start'],
  sentiment: 'neutral',
  summaryRatio: 0,
  confidence: 0.8,
  includeFlashnote: true,
  includeResearch: false,
  includeMeetingMinutes: true,
  shareLink: null,
  lastSavedAt: null,
  autosaveLabel: 'Not saved yet',
  toast: null,
});

class NotesSummarizerStore extends BaseStore {
  state: {
    plan: PlanTier;
    usage: {
      summariesUsed: number;
      summariesLimit: number;
      lastSummarizedAt: string;
    };
    builder: BuilderState;
    summaries: SummaryRecord[];
    history: {
      filters: HistoryFilters;
      search: string;
      filtered: SummaryRecord[];
      tags: string[];
      stats: {
        total: number;
        pinned: number;
        integrations: number;
      };
    };
    summaryView: SummaryViewState;
    toast: Toast;
    settings: {
      defaultMode: SummaryMode;
      defaultTone: BuilderState['tone'];
      defaultLanguage: string;
      autosaveEnabled: boolean;
      highlightStrategy: 'balanced' | 'dense' | 'minimal';
      includeReferences: boolean;
      defaultShare: 'private' | 'workspace';
      flashnoteAuto: boolean;
    };
  } = {
    plan: 'pro',
    usage: {
      summariesUsed: 6,
      summariesLimit: 20,
      lastSummarizedAt: '2024-03-09T11:24:00Z',
    },
    builder: defaultBuilderState(),
    summaries: sampleSummaries,
    history: {
      filters: {
        mode: 'all',
        tag: 'all',
        sentiment: 'all',
        plan: 'all',
      },
      search: '',
      filtered: clone(sampleSummaries),
      tags: [],
      stats: {
        total: sampleSummaries.length,
        pinned: sampleSummaries.filter((summary) => summary.pinned).length,
        integrations: sampleSummaries.filter((summary) =>
          summary.integration.flashnote || summary.integration.research || summary.integration.meeting,
        ).length,
      },
    },
    summaryView: {
      activeId: null,
      record: null,
      tab: 'overview',
    },
    toast: null,
    settings: {
      defaultMode: 'detailed',
      defaultTone: 'professional',
      defaultLanguage: 'en',
      autosaveEnabled: true,
      highlightStrategy: 'balanced',
      includeReferences: true,
      defaultShare: 'private',
      flashnoteAuto: false,
    },
  };

  initLanding(): void {
    this.refreshHistoryCollections();
  }

  initBuilder(payload: { id?: string | null } = {}): void {
    const { id = null } = payload;
    const state = this.state.builder;
    if (!state.initialized) {
      state.initialized = true;
    }
    let record: SummaryRecord | null = null;
    if (typeof id === 'string') {
      record = this.state.summaries.find((item) => item.id === id) ?? null;
    }

    if (record) {
      state.noteId = record.noteId;
      state.summaryId = record.id;
      state.title = record.title;
      state.inputType = record.sourceType === 'pdf' ? 'pdf' : 'text';
      state.inputText = record.sourceType === 'text' || record.sourceType === 'transcript' ? record.summaryText : '';
      state.inputChars = state.inputText.length;
      state.limitWarning = state.inputChars > state.inputLimit * 0.9;
      state.limitExceeded = state.inputChars > state.inputLimit;
      state.pdfName = record.sourceType === 'pdf' ? `${record.title.replace(/\s+/g, '-')}.pdf` : null;
      state.pdfSizeMb = record.sourceType === 'pdf' ? 6.2 : null;
      state.mode = record.mode;
      state.tone = record.tone;
      state.language = record.language;
      state.summaryText = record.summaryText;
      state.keyPoints = clone(record.keyPoints);
      state.highlights = clone(record.highlights);
      state.actionItems = clone(record.actionItems);
      state.references = clone(record.references);
      state.tags = clone(record.tags);
      state.sentiment = record.sentiment;
      state.summaryRatio = record.summaryRatio;
      state.confidence = record.confidence;
      state.includeFlashnote = record.integration.flashnote;
      state.includeResearch = record.integration.research;
      state.includeMeetingMinutes = record.integration.meeting;
      state.shareLink = record.shareLink ?? null;
      state.lastSavedAt = record.updatedAt;
      state.autosaveLabel = 'Saved from history';
    } else {
      Object.assign(state, defaultBuilderState());
      state.initialized = true;
      state.mode = this.state.settings.defaultMode;
      state.tone = this.state.settings.defaultTone;
      state.language = this.state.settings.defaultLanguage;
      if (state.includeFlashnote !== this.state.settings.flashnoteAuto) {
        state.includeFlashnote = this.state.settings.flashnoteAuto;
      }
    }
    state.toast = null;
    state.aiBusy = false;
    state.progressLabel = null;
  }

  setBuilderTitle(value: string): void {
    this.state.builder.title = value || 'Untitled note';
  }

  setInputType(type: 'text' | 'pdf'): void {
    const builder = this.state.builder;
    builder.inputType = type;
    if (type === 'text') {
      builder.pdfName = null;
      builder.pdfSizeMb = null;
    }
  }

  updateInputText(value: string): void {
    const builder = this.state.builder;
    builder.inputText = value;
    builder.inputChars = value.length;
    builder.limitWarning = value.length > builder.inputLimit * 0.9;
    builder.limitExceeded = value.length > builder.inputLimit;
    builder.autosaveLabel = 'Draft edited';
  }

  attachPdf(name: string, sizeMb: number): void {
    const builder = this.state.builder;
    builder.inputType = 'pdf';
    builder.pdfName = name;
    builder.pdfSizeMb = sizeMb;
    builder.autosaveLabel = 'PDF attached';
  }

  removePdf(): void {
    const builder = this.state.builder;
    builder.pdfName = null;
    builder.pdfSizeMb = null;
    builder.inputType = 'text';
  }

  setMode(mode: SummaryMode): void {
    this.state.builder.mode = mode;
  }

  setTone(tone: BuilderState['tone']): void {
    this.state.builder.tone = tone;
  }

  setLanguage(language: string): void {
    this.state.builder.language = language;
  }

  toggleIntegration(key: 'flashnote' | 'research' | 'meeting'): void {
    const builder = this.state.builder;
    if (key === 'flashnote') builder.includeFlashnote = !builder.includeFlashnote;
    if (key === 'research') builder.includeResearch = !builder.includeResearch;
    if (key === 'meeting') builder.includeMeetingMinutes = !builder.includeMeetingMinutes;
  }

  addTag(tag: string): void {
    const builder = this.state.builder;
    const normalized = tag.trim();
    if (!normalized || builder.tags.includes(normalized) || builder.tags.length >= 10) return;
    builder.tags = [...builder.tags, normalized];
  }

  removeTag(tag: string): void {
    const builder = this.state.builder;
    builder.tags = builder.tags.filter((item) => item !== tag);
  }

  addActionItem(): void {
    const builder = this.state.builder;
    const id = `ai-${crypto.randomUUID?.() ?? Date.now()}`;
    builder.actionItems = [
      ...builder.actionItems,
      {
        id,
        text: 'New action item',
        owner: 'Unassigned',
        due: new Date().toISOString().slice(0, 10),
        status: 'pending',
      },
    ];
  }

  updateActionItem(id: string, partial: Partial<SummaryActionItem>): void {
    const builder = this.state.builder;
    builder.actionItems = builder.actionItems.map((item) =>
      item.id === id
        ? {
            ...item,
            ...partial,
          }
        : item,
    );
  }

  removeActionItem(id: string): void {
    const builder = this.state.builder;
    builder.actionItems = builder.actionItems.filter((item) => item.id !== id);
  }

  private buildPreviewSummary(): SummaryRecord {
    const builder = this.state.builder;
    const now = new Date().toISOString();
    const seed = builder.inputText.trim() ||
      'No source text provided. The summary uses tagged metadata and previous context to generate structure.';
    const previewText = `${seed.split(/\s+/).slice(0, 55).join(' ')}${seed.length > 0 ? '…' : ''}`;
    return {
      id: builder.summaryId ?? `summary-${crypto.randomUUID?.() ?? Date.now()}`,
      noteId: builder.noteId ?? `note-${crypto.randomUUID?.() ?? Date.now()}`,
      title: builder.title || 'Untitled note',
      sourceType: builder.inputType === 'pdf' ? 'pdf' : 'text',
      mode: builder.mode,
      tone: builder.tone,
      language: builder.language,
      summaryText: previewText,
      keyPoints: builder.keyPoints.length
        ? clone(builder.keyPoints)
        : [
            'Capture the most important decisions and rationale from the source material.',
            'Highlight blockers, dependencies, and supporting evidence to follow up.',
            'Surface quotes or statistics worth sharing across the workspace.',
          ],
      highlights: builder.highlights.length
        ? clone(builder.highlights)
        : [
            {
              id: 'preview-highlight',
              quote: '“Summaries stay within 5–15% of the original length while retaining decisions and sentiment.”',
              context: 'System generated guardrail reminder.',
              tag: 'quality',
            },
          ],
      actionItems: builder.actionItems.length
        ? clone(builder.actionItems)
        : [
            {
              id: 'preview-action',
              text: 'Review generated summary and confirm highlights before exporting.',
              owner: 'You',
              due: now.slice(0, 10),
              status: 'pending',
            },
          ],
      references: builder.references.length
        ? clone(builder.references)
        : [
            {
              id: 'preview-reference',
              label: 'Original note context',
              href: '#',
            },
          ],
      tags: [...builder.tags],
      sentiment: builder.sentiment,
      confidence: builder.confidence,
      summaryRatio: builder.summaryRatio || Math.min(Math.max(builder.inputChars / Math.max(builder.inputLimit, 1), 0.05), 0.15),
      createdAt: builder.lastSavedAt ?? now,
      updatedAt: now,
      wordCount: Math.max(160, Math.round(builder.inputChars / 5.5)),
      originalCharacters: builder.inputChars,
      integration: {
        flashnote: builder.includeFlashnote,
        research: builder.includeResearch,
        meeting: builder.includeMeetingMinutes,
      },
      exported: {
        markdown: true,
        pdf: builder.mode !== 'concise',
      },
      shareLink: builder.shareLink,
      pinned: false,
      attachments: builder.pdfName ? [builder.pdfName] : [],
      owner: 'You',
      lastViewedAt: now,
      planRequired: builder.inputChars > 3000 || builder.inputType === 'pdf' ? 'pro' : 'free',
    };
  }

  async summarize(): Promise<void> {
    const builder = this.state.builder;
    if (builder.aiBusy) return;
    if (builder.limitExceeded) {
      builder.toast = { type: 'error', message: 'Input exceeds the 50,000 character limit.' };
      return;
    }
    builder.aiBusy = true;
    builder.toast = null;
    builder.progressLabel = 'Analyzing note…';
    await new Promise((resolve) => setTimeout(resolve, 600));
    builder.progressLabel = 'Extracting highlights…';
    await new Promise((resolve) => setTimeout(resolve, 400));
    const preview = this.buildPreviewSummary();
    builder.summaryText = preview.summaryText;
    builder.keyPoints = preview.keyPoints;
    builder.highlights = preview.highlights;
    builder.actionItems = preview.actionItems;
    builder.references = preview.references;
    builder.sentiment = preview.sentiment;
    builder.summaryRatio = preview.summaryRatio;
    builder.confidence = preview.confidence;
    builder.lastSavedAt = preview.updatedAt;
    builder.autosaveLabel = 'Autosaved moments ago';
    builder.aiBusy = false;
    builder.progressLabel = null;
    builder.toast = { type: 'success', message: 'Summary generated. Review before exporting.' };
  }

  saveSummary(): void {
    const builder = this.state.builder;
    if (builder.limitExceeded) {
      builder.toast = { type: 'error', message: 'Reduce the input length before saving.' };
      return;
    }
    const record = this.buildPreviewSummary();
    const index = this.state.summaries.findIndex((item) => item.id === record.id);
    if (index >= 0) {
      this.state.summaries[index] = record;
    } else {
      this.state.summaries = [record, ...this.state.summaries];
    }
    builder.summaryId = record.id;
    builder.noteId = record.noteId;
    builder.lastSavedAt = record.updatedAt;
    builder.autosaveLabel = 'Saved just now';
    builder.toast = { type: 'success', message: 'Summary saved to history.' };
    this.refreshHistoryCollections();
  }

  requestExport(format: 'markdown' | 'pdf' | 'flashnote'): void {
    const builder = this.state.builder;
    const requiresPro = format !== 'markdown';
    if (requiresPro && this.state.plan !== 'pro') {
      this.state.toast = {
        type: 'error',
        message: 'Upgrade to Pro to export PDF or FlashNote decks.',
      };
      return;
    }
    const label = format === 'markdown' ? 'Markdown' : format === 'pdf' ? 'PDF' : 'FlashNote deck';
    this.state.toast = {
      type: 'success',
      message: `${label} export queued. We will email you when it is ready.`,
    };
  }

  setPlan(plan: PlanTier): void {
    this.state.plan = plan;
  }

  initHistory(): void {
    this.refreshHistoryCollections();
  }

  private refreshHistoryCollections(): void {
    const tags = new Set<string>();
    this.state.summaries.forEach((summary) => summary.tags.forEach((tag) => tags.add(tag)));
    this.state.history.tags = Array.from(tags).sort((a, b) => a.localeCompare(b));
    this.applyHistoryFilters();
  }

  setHistorySearch(value: string): void {
    this.state.history.search = value;
    this.applyHistoryFilters();
  }

  setHistoryFilter(key: keyof HistoryFilters, value: string): void {
    const filters = this.state.history.filters;
    if (key === 'mode' && value !== 'all' && !['concise', 'detailed', 'bullet', 'abstract', 'action'].includes(value)) return;
    if (key === 'sentiment' && value !== 'all' && !['positive', 'neutral', 'mixed'].includes(value)) return;
    if (key === 'plan' && value !== 'all' && !['free', 'pro'].includes(value)) return;
    filters[key] = value as never;
    this.applyHistoryFilters();
  }

  togglePin(id: string): void {
    this.state.summaries = this.state.summaries.map((summary) =>
      summary.id === id
        ? {
            ...summary,
            pinned: !summary.pinned,
          }
        : summary,
    );
    this.refreshHistoryCollections();
  }

  private applyHistoryFilters(): void {
    const { filters, search } = this.state.history;
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = this.state.summaries
      .slice()
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .filter((summary) => {
        if (filters.mode !== 'all' && summary.mode !== filters.mode) return false;
        if (filters.sentiment !== 'all' && summary.sentiment !== filters.sentiment) return false;
        if (filters.plan !== 'all' && summary.planRequired !== filters.plan) return false;
        if (filters.tag !== 'all' && !summary.tags.includes(filters.tag)) return false;
        if (
          normalizedSearch &&
          ![
            summary.title,
            summary.tags.join(' '),
            summary.keyPoints.join(' '),
          ]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch)
        ) {
          return false;
        }
        return true;
      });
    this.state.history.filtered = filtered;
    this.state.history.stats = {
      total: filtered.length,
      pinned: filtered.filter((summary) => summary.pinned).length,
      integrations: filtered.filter((summary) =>
        summary.integration.flashnote || summary.integration.research || summary.integration.meeting,
      ).length,
    };
  }

  initSummaryView(id: string | null): void {
    const record = id
      ? this.state.summaries.find((summary) => summary.id === id) ?? null
      : this.state.summaries[0] ?? null;
    this.state.summaryView = {
      activeId: record?.id ?? null,
      record: record ? clone(record) : null,
      tab: 'overview',
    };
  }

  setSummaryTab(tab: SummaryViewTab): void {
    this.state.summaryView.tab = tab;
  }

  shareSummary(id: string): void {
    this.state.summaries = this.state.summaries.map((summary) =>
      summary.id === id
        ? {
            ...summary,
            shareLink: summary.shareLink ?? `https://share.ansiversa.ai/summaries/${id}`,
          }
        : summary,
    );
    this.state.toast = {
      type: 'success',
      message: 'Share link generated. Copy and distribute securely.',
    };
    if (this.state.summaryView.record?.id === id) {
      this.state.summaryView.record.shareLink =
        this.state.summaryView.record.shareLink ?? `https://share.ansiversa.ai/summaries/${id}`;
    }
  }

  initSettings(): void {
    // No-op for now; settings are preloaded in state.
  }

  updateSetting<T extends keyof NotesSummarizerStore['state']['settings']>(key: T, value: NotesSummarizerStore['state']['settings'][T]): void {
    this.state.settings[key] = value;
  }

  saveSettings(): void {
    this.state.toast = {
      type: 'success',
      message: 'Preferences saved. New summaries will use these defaults.',
    };
  }
}

Alpine.store('notesSummarizer', new NotesSummarizerStore());

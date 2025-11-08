import Alpine from 'alpinejs';
import { BaseStore } from '../../../alpineStores/base';

type CreationMode = {
  id: 'prompt' | 'outline' | 'import' | 'ansiversa';
  label: string;
  description: string;
  highlight: string;
  inputFields: string[];
  sampleOutline: Array<{ title: string; bullets: string[] }>;
  estimatedSlides: number;
  estimatedDuration: number;
  audienceLabel: string;
};

type SlideLayout = {
  key: 'title' | 'agenda' | 'comparison' | 'visual' | 'summary' | 'timeline';
  name: string;
  description: string;
  usage: string;
  bestFor: string[];
  bullets: string[];
};

type BrandTheme = {
  key: 'aurora' | 'slatewave' | 'ember';
  name: string;
  palette: string[];
  fonts: { heading: string; body: string };
  watermark: string;
  footerNote: string;
};

type AssistantAction = {
  id: 'concise' | 'story' | 'executive';
  label: string;
  description: string;
  tone: string;
  sampleResult: string;
};

type TimelineSegment = {
  id: string;
  label: string;
  minutes: number;
  description: string;
};

type ApiEndpoint = {
  id: 'generate' | 'import' | 'chart' | 'assist' | 'export';
  method: 'POST' | 'GET';
  path: string;
  summary: string;
  sampleRequest: Record<string, unknown>;
  sampleResponse: Record<string, unknown>;
};

type SlidePreview = {
  id: string;
  layoutKey: SlideLayout['key'];
  title: string;
  context: string;
  bullets: string[];
  media?: string;
};

type ActivityEntry = {
  message: string;
  timestamp: string;
};

type AiAction = {
  id: string;
  label: string;
  result: string;
};

type BrandKitState = {
  name: string;
  palette: string[];
  headingFont: string;
  bodyFont: string;
  watermark: string;
  footerNote: string;
};

const creationModes: CreationMode[] = [
  {
    id: 'prompt',
    label: 'Generate from prompt',
    description:
      'Provide a topic, audience, and desired length. Presentation Designer drafts a narrative arc with agenda, sections, and supporting slides.',
    highlight: 'Topic → outline in under 10 seconds',
    inputFields: ['Topic focus', 'Target audience', 'Tone', 'Desired slide count'],
    sampleOutline: [
      { title: 'Vision and stakes', bullets: ['Frame the audience challenge', 'Share desired transformation', 'Set the hook with a bold stat'] },
      { title: 'Solution pillars', bullets: ['Introduce 3 guiding themes', 'Showcase quick wins', 'Flag deeper dives for appendix'] },
      { title: 'Roadmap and next steps', bullets: ['Timeline with milestones', 'Resourcing snapshot', 'Call to action for stakeholders'] },
    ],
    estimatedSlides: 14,
    estimatedDuration: 18,
    audienceLabel: 'Product leadership sync',
  },
  {
    id: 'outline',
    label: 'Structure a pasted outline',
    description:
      'Paste bullet points or headings. The importer recognises hierarchy, infers layout, and balances pacing across slides.',
    highlight: 'Paste docs from Notion or Docs',
    inputFields: ['Outline paste', 'Preferred layout mix', 'Auto-balance depth'],
    sampleOutline: [
      { title: 'Current state', bullets: ['Snapshots by team', 'Open risks and blockers', 'Metrics trending month over month'] },
      { title: 'Opportunities', bullets: ['Quick wins (<90 days)', 'Strategic bets', 'Dependencies and asks'] },
      { title: 'Action plan', bullets: ['Owners and deadlines', 'KPIs to monitor', 'Follow-up cadence'] },
    ],
    estimatedSlides: 12,
    estimatedDuration: 15,
    audienceLabel: 'Operational review',
  },
  {
    id: 'import',
    label: 'Upload a doc or markdown',
    description:
      'Drag and drop .txt or .md files. Headings become sections, tables map to chart-ready data, and quotes get spotlight treatments.',
    highlight: 'Markdown aware',
    inputFields: ['File upload', 'Map headings to sections', 'Auto-detect tables'],
    sampleOutline: [
      { title: 'Executive summary', bullets: ['Key headline with metrics', 'Supporting insight', 'Recommended motion'] },
      { title: 'Evidence pack', bullets: ['Charts from pasted tables', 'Quotes highlighted', 'Appendix auto-linked'] },
      { title: 'Decisions and owners', bullets: ['Decision log', 'Risks to monitor', 'Owner + due date table'] },
    ],
    estimatedSlides: 16,
    estimatedDuration: 22,
    audienceLabel: 'Stakeholder review board',
  },
  {
    id: 'ansiversa',
    label: 'Import from another Ansiversa app',
    description:
      'Pull content from Resume Builder, Blog Writer, Concept Explainer, or Lesson Builder. Presentation Designer maps the content to presentation-ready modules.',
    highlight: 'One-click cross-app import',
    inputFields: ['Select source workspace', 'Choose sections to import', 'Blend with theme'],
    sampleOutline: [
      { title: 'Origin story', bullets: ['Auto-pulled from Resume Builder', 'Highlights professional trajectory', 'Calls out signature achievements'] },
      { title: 'Deep dive', bullets: ['Lesson Builder modules become workshop slides', 'Blog visuals remixed for slides', 'Concept Explainer analogies reused for stories'] },
      { title: 'Next moves', bullets: ['Personalised CTA slide', 'Q and A placeholder', 'Thank-you with brand footer'] },
    ],
    estimatedSlides: 11,
    estimatedDuration: 14,
    audienceLabel: 'Showcase session',
  },
];

const slideLayouts: SlideLayout[] = [
  {
    key: 'title',
    name: 'Title hero',
    description: 'Set context with a confident headline, supporting statement, and branded footer.',
    usage: 'Use for opening slide, key transitions, and final CTA.',
    bestFor: ['Kickoffs', 'Investor decks', 'Vision statements'],
    bullets: ['Large hero title with gradient accent', 'Subtitle zone for mission or promise', 'Footer for watermark + contact'],
  },
  {
    key: 'agenda',
    name: 'Agenda overview',
    description: 'Presents journey and pacing with auto-balanced sections and time estimates.',
    usage: 'First or second slide to set expectations.',
    bestFor: ['Workshops', 'Quarterly reviews', 'Onboarding'],
    bullets: ['Numbered segments with timing chips', 'Highlights critical decision points', 'Optional progress tracker'],
  },
  {
    key: 'comparison',
    name: 'Comparison split',
    description: 'Two-column layout highlighting before/after, option A/B, or pros/cons.',
    usage: 'When weighing approaches or summarising insights.',
    bestFor: ['Strategy reviews', 'Product trade-offs', 'Vendor evaluations'],
    bullets: ['Column badges for quick scanning', 'Auto-generated icons per column', 'Summary callout for recommendation'],
  },
  {
    key: 'visual',
    name: 'Visual spotlight',
    description: 'Grid for screenshots, mockups, or imagery with caption overlays.',
    usage: 'Demonstrate UI, product shots, or media collages.',
    bestFor: ['Product demos', 'Case studies', 'Design showcases'],
    bullets: ['Drag-and-drop media placeholders', 'Auto-generate alt text and captions', 'Optional background blur for focus'],
  },
  {
    key: 'timeline',
    name: 'Roadmap timeline',
    description: 'Milestone ribbon with phases, owners, and health indicators.',
    usage: 'Roadmaps, launch plans, program updates.',
    bestFor: ['Go-to-market', 'Implementation plans', 'Change management'],
    bullets: ['Phase segments with owner avatars', 'Risk badges with tooltips', 'Auto-calculated pacing'],
  },
  {
    key: 'summary',
    name: 'Executive summary',
    description: 'Bring the narrative home with KPIs, learnings, and clear CTA.',
    usage: 'Final summary before Q and A or sign-off.',
    bestFor: ['Leadership updates', 'Investor recaps', 'Client proposals'],
    bullets: ['Metric trio with trend arrows', 'Narrative paragraph slot', 'CTA button with icon'],
  },
];

const brandThemes: BrandTheme[] = [
  {
    key: 'aurora',
    name: 'Aurora Gradient',
    palette: ['#4338CA', '#6366F1', '#0EA5E9', '#F8FAFC'],
    fonts: { heading: 'General Sans', body: 'Inter' },
    watermark: 'Ansiversa • Confidential',
    footerNote: 'Ansiversa Labs — Internal only',
  },
  {
    key: 'slatewave',
    name: 'Slatewave Minimal',
    palette: ['#0F172A', '#1E293B', '#38BDF8', '#F1F5F9'],
    fonts: { heading: 'Neue Montreal', body: 'Work Sans' },
    watermark: 'Ansiversa • Private review',
    footerNote: 'Review build — Do not circulate',
  },
  {
    key: 'ember',
    name: 'Ember Pulse',
    palette: ['#DC2626', '#EA580C', '#FDBA74', '#FFF7ED'],
    fonts: { heading: 'Söhne Breit', body: 'Source Sans Pro' },
    watermark: 'Ansiversa • Client ready',
    footerNote: '© Ansiversa — Presented by the Product team',
  },
];

const assistantActions: AssistantAction[] = [
  {
    id: 'concise',
    label: 'Make it concise',
    description: 'Compress copy to executive-ready bullet points while preserving message clarity.',
    tone: 'Executive brief',
    sampleResult: 'Reduced 78-word section into 4 bullets with outcome-first phrasing.',
  },
  {
    id: 'story',
    label: 'Tell a story',
    description: 'Turn dense information into a narrative with setup, conflict, and resolution beats.',
    tone: 'Narrative coach',
    sampleResult: 'Wove customer quotes into a 3-act story with emotional hook.',
  },
  {
    id: 'executive',
    label: 'Surface executive summary',
    description: 'Distil the slide into headline metric, decision, and direct ask.',
    tone: 'Leadership ready',
    sampleResult: 'Created headline card with KPI trio and call-to-action ribbon.',
  },
];

const timeline: TimelineSegment[] = [
  { id: 'intro', label: 'Opening and stakes', minutes: 3, description: 'Title, agenda, and framing slides.' },
  { id: 'insights', label: 'Insights and evidence', minutes: 7, description: 'Charts, comparisons, and story slides.' },
  { id: 'solution', label: 'Solution and roadmap', minutes: 5, description: 'Roadmap timeline and feature highlights.' },
  { id: 'close', label: 'Close and CTA', minutes: 3, description: 'Summary, Q and A, and thank you slide.' },
];

const apiEndpoints: ApiEndpoint[] = [
  {
    id: 'generate',
    method: 'POST',
    path: '/presentation-designer/api/generate',
    summary: 'Create deck skeleton from prompt inputs.',
    sampleRequest: {
      topic: 'AI launch update',
      audience: 'Product leadership',
      slideTarget: 12,
      tone: 'confident',
    },
    sampleResponse: {
      deckId: 'deck_123',
      slides: [
        { layout: 'title', title: 'AI launch update', notes: 'Frame the stakes and promise.' },
        { layout: 'agenda', title: 'Agenda', notes: 'Outline sections with time estimates.' },
      ],
      estimatedDuration: 18,
    },
  },
  {
    id: 'import',
    method: 'POST',
    path: '/presentation-designer/api/import',
    summary: 'Convert pasted outline or markdown into slides.',
    sampleRequest: {
      format: 'markdown',
      content: '# Q3 Review\n## Highlights\n- Revenue +18%\n- Churn down 4%',
    },
    sampleResponse: {
      deckId: 'deck_456',
      importedSections: 5,
      autoLayouts: ['summary', 'comparison', 'timeline'],
    },
  },
  {
    id: 'chart',
    method: 'POST',
    path: '/presentation-designer/api/chart/preview',
    summary: 'Transform pasted CSV into chart specification preview.',
    sampleRequest: {
      chartType: 'bar',
      data: 'month,value\nJan,120\nFeb,160\nMar,210',
    },
    sampleResponse: {
      spec: { type: 'bar', encoding: { x: 'month', y: 'value' } },
      recommendedLayout: 'visual',
    },
  },
  {
    id: 'assist',
    method: 'POST',
    path: '/presentation-designer/api/assist',
    summary: 'Apply rewrite assistants such as concise, story, or executive tone.',
    sampleRequest: {
      deckId: 'deck_123',
      slideId: 'slide_4',
      action: 'concise',
    },
    sampleResponse: {
      slideId: 'slide_4',
      result: ['Synthesise go-to-market impact.', 'Highlight top three KPIs.', 'Clarify the ask for leadership.'],
    },
  },
  {
    id: 'export',
    method: 'POST',
    path: '/presentation-designer/api/export',
    summary: 'Export deck to PPTX or PDF with theme and brand kit applied.',
    sampleRequest: {
      deckId: 'deck_123',
      format: 'pptx',
      includeNotes: true,
    },
    sampleResponse: {
      url: 'https://cdn.ansiversa.app/exports/deck_123.pptx',
      sizeKb: 2840,
      expiresAt: '2025-01-15T10:30:00.000Z',
    },
  },
];

const sampleSlides: SlidePreview[] = [
  {
    id: 'slide-1',
    layoutKey: 'title',
    title: 'Reimagining onboarding efficiency',
    context: 'Hook leadership on the opportunity and promise.',
    bullets: ['70% faster ramp for new hires', 'Unified toolkit rolled out in 6 markets', 'Guided walkthrough launching this quarter'],
    media: 'hero-gradient.svg',
  },
  {
    id: 'slide-2',
    layoutKey: 'agenda',
    title: 'Today’s path',
    context: 'Set expectations for the deck journey.',
    bullets: ['Why onboarding is the unlock', 'What we shipped this sprint', 'Roadmap to global scale', 'Decisions we need today'],
  },
  {
    id: 'slide-3',
    layoutKey: 'comparison',
    title: 'Before vs. after rollout',
    context: 'Contrast pain points with the improved flow.',
    bullets: ['Paper checklists vs. interactive playbooks', 'Inconsistent mentorship vs. AI nudges', 'Manual tracking vs. analytics pulse'],
  },
  {
    id: 'slide-4',
    layoutKey: 'visual',
    title: 'Workflow preview',
    context: 'Drop in high-fidelity screenshots or mockups.',
    bullets: ['Highlights the new progress tracker', 'Shows assistant checklist overlay', 'Callout labels explain key components'],
    media: 'onboarding-dashboard.png',
  },
  {
    id: 'slide-5',
    layoutKey: 'timeline',
    title: '30-60-90 expansion plan',
    context: 'Roadmap with owners and checkpoints.',
    bullets: ['Phase 1 — Pilot in sales org', 'Phase 2 — Extend to support teams', 'Phase 3 — Roll out to partners'],
  },
  {
    id: 'slide-6',
    layoutKey: 'summary',
    title: 'Decision and next steps',
    context: 'Close with clear asks.',
    bullets: ['Approve enablement budget', 'Nominate cross-functional champions', 'Schedule Q and A follow-up'],
  },
];

const initialAiActions: AiAction[] = [
  {
    id: 'outline-ready',
    label: 'Outline generated',
    result: '12-slide deck scaffold delivered with pacing estimates.',
  },
  {
    id: 'brand-sync',
    label: 'Brand kit applied',
    result: 'Aurora Gradient colours, fonts, and footer active.',
  },
];

const workspaceInsights = {
  decks: 18,
  drafts: 4,
  brandKits: 6,
  exports: 42,
};

class PresentationDesignerStore extends BaseStore {
  state: {
    creationModes: CreationMode[];
    selectedModeId: CreationMode['id'];
    slideLayouts: SlideLayout[];
    selectedLayoutKey: SlideLayout['key'];
    brandThemes: BrandTheme[];
    selectedThemeKey: BrandTheme['key'];
    brandKit: BrandKitState;
    assistants: AssistantAction[];
    selectedAssistantId: AssistantAction['id'];
    deckMetrics: {
      slides: number;
      estimatedDuration: number;
      theme: string;
      audience: string;
      confidence: number;
      lastExport: string;
      shareableLink: string;
    };
    timeline: TimelineSegment[];
    sampleSlides: SlidePreview[];
    selectedSlideId: string;
    workspaceInsights: typeof workspaceInsights;
    activityLog: ActivityEntry[];
    aiActions: AiAction[];
    lastEndpointResponse: { endpointId: ApiEndpoint['id']; response: Record<string, unknown> } | null;
  };

  private readonly creationModes = creationModes;
  private readonly slideLayouts = slideLayouts;
  private readonly brandThemes = brandThemes;
  private readonly assistants = assistantActions;
  private readonly apiEndpoints = apiEndpoints;
  private readonly timelineSegments = timeline;
  private readonly slides = sampleSlides;

  private initialised = false;

  constructor() {
    super();
    const initialTheme = this.brandThemes[0];
    const initialMode = this.creationModes[0];
    this.state = {
      creationModes: this.creationModes,
      selectedModeId: initialMode.id,
      slideLayouts: this.slideLayouts,
      selectedLayoutKey: this.slideLayouts[0].key,
      brandThemes: this.brandThemes,
      selectedThemeKey: initialTheme.key,
      brandKit: this.cloneTheme(initialTheme),
      assistants: this.assistants,
      selectedAssistantId: this.assistants[0].id,
      deckMetrics: {
        slides: initialMode.estimatedSlides,
        estimatedDuration: initialMode.estimatedDuration,
        theme: initialTheme.name,
        audience: initialMode.audienceLabel,
        confidence: 72,
        lastExport: 'Draft export pending',
        shareableLink: 'ansiversa.app/decks/onboarding-kickoff',
      },
      timeline: this.timelineSegments,
      sampleSlides: this.slides,
      selectedSlideId: this.slides[0].id,
      workspaceInsights,
      activityLog: [],
      aiActions: [...initialAiActions],
      lastEndpointResponse: null,
    };
    this.log('Sample deck ready — explore creation modes.');
  }

  init(): void {
    if (this.initialised) return;
    this.initialised = true;
    this.log('Aurora Gradient brand kit loaded.');
  }

  get selectedMode(): CreationMode {
    return (
      this.state.creationModes.find((mode) => mode.id === this.state.selectedModeId) ?? this.state.creationModes[0]
    );
  }

  get selectedLayout(): SlideLayout {
    return (
      this.state.slideLayouts.find((layout) => layout.key === this.state.selectedLayoutKey) ?? this.state.slideLayouts[0]
    );
  }

  get selectedTheme(): BrandTheme {
    return (
      this.state.brandThemes.find((theme) => theme.key === this.state.selectedThemeKey) ?? this.state.brandThemes[0]
    );
  }

  get selectedSlide(): SlidePreview {
    return (
      this.state.sampleSlides.find((slide) => slide.id === this.state.selectedSlideId) ?? this.state.sampleSlides[0]
    );
  }

  get timelineTotalMinutes(): number {
    return this.state.timeline.reduce((total, segment) => total + segment.minutes, 0);
  }

  get endpoints(): ApiEndpoint[] {
    return this.apiEndpoints;
  }

  selectMode(id: CreationMode['id']): void {
    if (id === this.state.selectedModeId) return;
    const mode = this.state.creationModes.find((item) => item.id === id);
    if (!mode) return;
    this.state.selectedModeId = mode.id;
    this.state.deckMetrics.slides = mode.estimatedSlides;
    this.state.deckMetrics.estimatedDuration = mode.estimatedDuration;
    this.state.deckMetrics.audience = mode.audienceLabel;
    this.log(`Creation mode switched to ${mode.label}.`);
  }

  selectLayout(key: SlideLayout['key']): void {
    if (key === this.state.selectedLayoutKey) return;
    const layout = this.state.slideLayouts.find((item) => item.key === key);
    if (!layout) return;
    this.state.selectedLayoutKey = layout.key;
    const matchingSlide = this.state.sampleSlides.find((slide) => slide.layoutKey === layout.key);
    if (matchingSlide) {
      this.state.selectedSlideId = matchingSlide.id;
    }
    this.log(`Layout focus set to ${layout.name}.`);
  }

  selectSlide(id: string): void {
    if (id === this.state.selectedSlideId) return;
    const slide = this.state.sampleSlides.find((item) => item.id === id);
    if (!slide) return;
    this.state.selectedSlideId = slide.id;
    this.state.selectedLayoutKey = slide.layoutKey;
    this.log(`Previewing ${slide.title}.`);
  }

  selectTheme(key: BrandTheme['key']): void {
    if (key === this.state.selectedThemeKey) return;
    const theme = this.state.brandThemes.find((item) => item.key === key);
    if (!theme) return;
    this.state.selectedThemeKey = theme.key;
    this.state.brandKit = this.cloneTheme(theme);
    this.state.deckMetrics.theme = theme.name;
    this.state.deckMetrics.confidence = this.state.deckMetrics.confidence + 4 > 100 ? 100 : this.state.deckMetrics.confidence + 4;
    this.log(`Theme switched to ${theme.name}.`);
  }

  applyAssistant(id: AssistantAction['id']): void {
    const assistant = this.state.assistants.find((item) => item.id === id);
    if (!assistant) return;
    this.state.selectedAssistantId = assistant.id;
    const slide = this.selectedSlide;
    const actionLabel = `${assistant.label} on “${slide.title}”`;
    const resultPreview = assistant.sampleResult;
    this.state.aiActions = [
      { id: `${assistant.id}-${Date.now()}`, label: actionLabel, result: resultPreview },
      ...this.state.aiActions,
    ].slice(0, 5);
    this.log(`${assistant.label} assistant applied to ${slide.title}.`);
  }

  simulateEndpoint(id: ApiEndpoint['id']): void {
    const endpoint = this.apiEndpoints.find((item) => item.id === id);
    if (!endpoint) return;
    this.state.lastEndpointResponse = { endpointId: endpoint.id, response: endpoint.sampleResponse };
    this.log(`Endpoint ${endpoint.path} previewed.`);
  }

  private cloneTheme(theme: BrandTheme): BrandKitState {
    return {
      name: theme.name,
      palette: [...theme.palette],
      headingFont: theme.fonts.heading,
      bodyFont: theme.fonts.body,
      watermark: theme.watermark,
      footerNote: theme.footerNote,
    };
  }

  private log(message: string): void {
    const entry: ActivityEntry = {
      message,
      timestamp: this.formatTimestamp(new Date()),
    };
    this.state.activityLog = [entry, ...this.state.activityLog].slice(0, 6);
  }

  private formatTimestamp(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

const presentationDesigner = new PresentationDesignerStore();

Alpine.store('presentation', presentationDesigner);

export type PresentationDesignerAlpineStore = PresentationDesignerStore;
export { presentationDesigner };

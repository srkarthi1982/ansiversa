export const heroStats = [
  {
    label: 'Summaries generated this week',
    value: '428',
    trend: '+18% vs last week',
  },
  {
    label: 'Average compression',
    value: '12%',
    trend: 'Target 5–15%',
  },
  {
    label: 'Action items extracted',
    value: '1,094',
    trend: 'Sent to Meeting Minutes AI',
  },
];

export const ingestionOptions = [
  {
    icon: 'fas fa-keyboard',
    title: 'Paste or type notes',
    description:
      'Drop in raw notes, transcripts, or docs up to 50k characters with auto cleaning, headings, and metadata detection.',
  },
  {
    icon: 'fas fa-file-pdf',
    title: 'Upload PDF handouts',
    description:
      'Ingest lecture decks, meeting packets, or research PDFs up to 10MB. We retain source pagination for citations.',
  },
  {
    icon: 'fas fa-microphone-lines',
    title: 'Voice & transcript import',
    description:
      'Pull recordings or transcripts from Meeting Minutes AI and Research Assistant with speaker labels intact.',
  },
  {
    icon: 'fas fa-tags',
    title: 'Smart tagging',
    description:
      'Auto-tag topics, teams, and context so history, filters, and integrations stay organized from the start.',
  },
];

export const summaryModes = [
  {
    key: 'concise',
    title: 'Concise brief',
    description: '150-word executive summary with sentiment and risk callouts.',
  },
  {
    key: 'detailed',
    title: 'Detailed narrative',
    description: 'Section-aware summary with narrative, highlights, and references.',
  },
  {
    key: 'bullet',
    title: 'Bullet digest',
    description: 'Hierarchical bullet list organized by theme, ready for slides.',
  },
  {
    key: 'abstract',
    title: 'Academic abstract',
    description: 'Structured abstract with background, methods, findings, and outlook.',
  },
  {
    key: 'action',
    title: 'Action-oriented',
    description: 'Extracts owners, deadlines, blockers, and follow-ups for teams.',
  },
];

export const workflowSteps = [
  {
    step: '1',
    title: 'Ingest',
    description:
      'Normalize pasted text or uploaded PDFs, detect sections, and capture metadata such as meeting date or author.',
  },
  {
    step: '2',
    title: 'Summarize',
    description:
      'Choose a mode, tone, and language. Our engine creates key points, highlights, action items, and sentiment.',
  },
  {
    step: '3',
    title: 'Refine',
    description:
      'Edit inline, reorder bullets, adjust highlights, and request regenerations without losing context.',
  },
  {
    step: '4',
    title: 'Distribute',
    description:
      'Export to Markdown or PDF, push flashcards to FlashNote, or sync tasks with Meeting Minutes AI.',
  },
];

export const summaryOutputs = [
  {
    icon: 'fas fa-list-check',
    title: 'Key takeaways',
    description: 'Pulls the core arguments, decisions, or concepts in under 5 lines.',
  },
  {
    icon: 'fas fa-bolt',
    title: 'Action items',
    description: 'Assign owners, due dates, and urgency levels ready for task sync.',
  },
  {
    icon: 'fas fa-highlighter',
    title: 'Highlights & quotes',
    description: 'Surface memorable quotes, figures, and definitions with citations.',
  },
  {
    icon: 'fas fa-face-smile',
    title: 'Sentiment pulse',
    description: 'Gauge tone and energy to track meeting health or document stance.',
  },
];

export const planMatrix = [
  { feature: 'Input length', free: 'Up to 3,000 characters', pro: 'Up to 50,000 characters + PDFs' },
  { feature: 'Summary modes', free: 'Concise · Bullet', pro: 'All five modes + custom presets' },
  { feature: 'Exports', free: 'Markdown', pro: 'Markdown · PDF · FlashNote deck' },
  { feature: 'History retention', free: 'Latest 5 summaries', pro: 'Full timeline with filters' },
  { feature: 'Integrations', free: 'FlashNote (read-only)', pro: 'FlashNote · Research Assistant · Meeting Minutes AI' },
  { feature: 'Collaboration', free: 'View-only links', pro: 'Shared workspaces & comments' },
];

export const integrations = [
  {
    icon: 'fas fa-flash',
    title: 'FlashNote',
    description: 'Convert summary bullets into spaced-repetition cards in one click.',
  },
  {
    icon: 'fas fa-people-group',
    title: 'Meeting Minutes AI',
    description: 'Sync decisions and action items back to meeting records automatically.',
  },
  {
    icon: 'fas fa-book-open',
    title: 'Research Assistant',
    description: 'Reference annotated sources and maintain citation fidelity.',
  },
];

export const qualitySignals = [
  {
    title: 'Guardrails & validation',
    points: [
      'Character limit enforcement with progress indicator and warnings at 90% capacity.',
      'Duplicate detection ensures repeated summaries reference the same Note ID.',
      'Summary length target between 5–15% of the source with readability scoring.',
      'Role-based access and audit events for every ingest, summarize, and export action.',
    ],
  },
  {
    title: 'Accessibility & UX',
    points: [
      'Keyboard shortcuts: Ctrl/Cmd + Enter to summarize, Ctrl/Cmd + S to save edits.',
      'Responsive layout with high-contrast mode and reduced motion preferences.',
      'Inline diff view shows AI changes when re-summarizing in a new mode.',
    ],
  },
];

export const apiContracts = [
  {
    method: 'POST',
    path: '/notes-summarizer/api/ingest',
    description: 'Accept pasted text or PDF uploads, returning a normalized Note record with metadata.',
  },
  {
    method: 'POST',
    path: '/notes-summarizer/api/summarize',
    description: 'Generate structured summary content, highlights, action items, and sentiment.',
  },
  {
    method: 'POST',
    path: '/notes-summarizer/api/save',
    description: 'Persist edits, tags, and mode selections to the Summary table.',
  },
  {
    method: 'POST',
    path: '/notes-summarizer/api/export',
    description: 'Validate plan entitlements then render Markdown or PDF exports.',
  },
  {
    method: 'GET',
    path: '/notes-summarizer/api/history/list',
    description: 'Return paginated history with filters, tags, and integration metadata.',
  },
];

export const dataModel = [
  {
    name: 'User',
    fields: ['id', 'email', 'plan', 'language', 'createdAt'],
  },
  {
    name: 'Note',
    fields: ['id', 'userId', 'title', 'content', 'sourceType', 'createdAt'],
  },
  {
    name: 'Summary',
    fields: ['id', 'noteId', 'userId', 'mode', 'summaryText', 'wordCount', 'tags', 'createdAt'],
  },
  {
    name: 'Tag',
    fields: ['id', 'userId', 'name', 'color'],
  },
  {
    name: 'History',
    fields: ['id', 'userId', 'noteId', 'summaryId', 'createdAt'],
  },
];

export const uxHighlights = [
  {
    icon: 'fas fa-pen-to-square',
    title: 'Inline editor',
    description: 'Edit AI output inline with autosave, highlighting manual adjustments.',
  },
  {
    icon: 'fas fa-language',
    title: 'Multilingual support',
    description: 'Summaries available in 26 languages with tone presets per workspace.',
  },
  {
    icon: 'fas fa-bell',
    title: 'Progress indicators',
    description: 'Live status updates for ingestion, summarization, and export queues.',
  },
  {
    icon: 'fas fa-clock-rotate-left',
    title: 'History timeline',
    description: 'Filter, pin, and restore previous summaries with audit events.',
  },
];

export const automationFlows = [
  {
    title: 'Research handoff',
    description: 'Push highlight excerpts directly into Research Assistant evidence boards.',
  },
  {
    title: 'Meeting follow-up',
    description: 'Sync action items with Meeting Minutes AI and Slack within seconds.',
  },
  {
    title: 'Study sprint',
    description: 'Create FlashNote decks from key points and schedule spaced review sessions.',
  },
];

export const complianceNotes = [
  'PDF uploads are virus scanned and text extracted using the secure Astro worker sandbox.',
  'Personally identifiable information is masked in share links unless explicit overrides are granted.',
  'Every AI generation stores prompt + response hashes to support reproducibility audits.',
];

export type CaptureMode = {
  id: string;
  label: string;
  icon: string;
  description: string;
  automation: readonly string[];
  limit: string;
  highlight: string;
};

export type PipelineStageStatus = 'pending' | 'active' | 'complete';

export type PipelineStage = {
  id: string;
  label: string;
  summary: string;
  outputs: readonly string[];
  duration: string;
  status: PipelineStageStatus;
};

export type WorkspaceTab = {
  id: string;
  label: string;
  summary: string;
  insights: readonly string[];
};

export type WorkspaceBlock = {
  id: string;
  type: 'text' | 'math' | 'diagram' | 'table' | 'exercise' | 'glossary';
  heading: string;
  confidence: number;
  excerpt: string;
  anchors: readonly string[];
  badges: readonly string[];
  pairedWith?: string;
  flagged?: boolean;
};

export type WorkspacePage = {
  id: string;
  pageNumber: number;
  chapter: string;
  confidence: number;
  anchor: string;
  hasCorrections: boolean;
  blocks: readonly WorkspaceBlock[];
};

export type ArtifactType = {
  id: string;
  label: string;
  description: string;
  generated: number;
  includes: readonly string[];
  sourceBlocks: readonly string[];
};

export type ExportPreset = {
  id: string;
  label: string;
  format: 'md' | 'pdf' | 'docx' | 'csv' | 'apkg' | 'json' | 'tex';
  description: string;
  includes: readonly string[];
  proOnly?: boolean;
  lastRun?: string;
};

export type PlanComparisonRow = {
  feature: string;
  free: string;
  pro: string;
};

export type IntegrationCard = {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'view-only' | 'sync' | 'push';
  highlight: string;
};

export type QualityCheck = {
  id: string;
  label: string;
  status: 'passed' | 'warning' | 'needs-review';
  message: string;
  severity: 'info' | 'medium' | 'high';
};

export type DataModelEntity = {
  name: string;
  description: string;
  fields: readonly {
    name: string;
    type: string;
    notes: string;
  }[];
};

export const getCaptureModes = (): CaptureMode[] => [
  {
    id: 'mobile-camera',
    label: 'Mobile Camera Burst',
    icon: 'fas fa-camera-rotate',
    description: 'Guided capture with auto-alignment, glare detection, and instant dewarp preview.',
    automation: ['Auto-trim margins', 'Adaptive lighting correction', 'Live chapter tagging'],
    limit: 'Up to 30 pages per job (Free) · 300 with Pro',
    highlight: 'Perfect for quick chapter uploads straight from your textbook.',
  },
  {
    id: 'pdf-upload',
    label: 'PDF or Image Upload',
    icon: 'fas fa-file-pdf',
    description: 'Drag in multi-page PDFs or image bundles. Automatically merges, deduplicates, and orders pages.',
    automation: ['Checksum dedupe', 'Page rotation heuristics', 'Auto-split double spreads'],
    limit: 'Accepts PDF, PNG, JPEG · 50 MB Free · 300 MB Pro',
    highlight: 'Best for scanned books and teacher-provided handouts.',
  },
  {
    id: 'cloud-import',
    label: 'Cloud Import (beta)',
    icon: 'fas fa-cloud-arrow-down',
    description: 'Connect Google Drive or Google Photos and stream large scans directly into the pipeline.',
    automation: ['Auto-sync folders nightly', 'Version history', 'Notify when processing completes'],
    limit: 'Requires Ansiversa Pro · OAuth-secured connections',
    highlight: 'Ideal for schools maintaining shared resource drives.',
  },
];

export const getPipelineStages = (): PipelineStage[] => [
  {
    id: 'preprocess',
    label: 'Preprocess & Clean',
    summary:
      'Detects page edges, deskews scans, balances lighting, and prepares a clean canvas for OCR.',
    outputs: ['Deskewed pages', 'Denoised layers', 'Confidence map'],
    duration: '12s for 12 pages',
    status: 'active',
  },
  {
    id: 'layout',
    label: 'Layout & Regions',
    summary: 'Segments multi-column layouts, sidebars, captions, headers, and reading order.',
    outputs: ['Region graph', 'Reading order map'],
    duration: '18s for 12 pages',
    status: 'pending',
  },
  {
    id: 'ocr',
    label: 'OCR + Math',
    summary: 'Applies text OCR with language models and dedicated math parsing into LaTeX.',
    outputs: ['Token stream with bbox', 'Inline and block LaTeX', 'Confidence spans'],
    duration: '32s for 12 pages',
    status: 'pending',
  },
  {
    id: 'structure',
    label: 'Structure & Semantics',
    summary: 'Builds heading hierarchy, detects exercises, theorems, proofs, and glossary terms.',
    outputs: ['TOC tree', 'Semantic labels', 'Exercise ↔ answer links'],
    duration: '25s for 12 pages',
    status: 'pending',
  },
  {
    id: 'artifacts',
    label: 'Artifacts & Exports',
    summary: 'Generates flashcards, quizzes, summaries, and prepares export bundles.',
    outputs: ['Flashcards', 'Quiz JSON', 'Markdown & DOCX bundles'],
    duration: '8s for 12 pages',
    status: 'pending',
  },
];

export const getWorkspaceTabs = (): WorkspaceTab[] => [
  {
    id: 'overview',
    label: 'Overview',
    summary: 'Processing timeline, quality alerts, and quick actions for the entire book.',
    insights: ['92% pipeline confidence', '3 pending human reviews', 'Flashcards ready in 1m'],
  },
  {
    id: 'pages',
    label: 'Pages',
    summary: 'Flip through processed previews and anchor each page with citations.',
    insights: ['Anchors Book:12-18', 'Deskew confidence 99%', '2 suggested re-scans'],
  },
  {
    id: 'blocks',
    label: 'Blocks',
    summary: 'Inspect paragraphs, math zones, diagrams, and tables with semantic labels.',
    insights: ['Math LaTeX success 34/34', 'Tables auto-structured 5/5', 'Diagrams vectorized 80%'],
  },
  {
    id: 'exercises',
    label: 'Exercises',
    summary: 'Review extracted practice problems and paired answer keys.',
    insights: ['18 exercises detected', '14 paired answers', '4 flagged for verification'],
  },
  {
    id: 'artifacts',
    label: 'Artifacts',
    summary: 'Approve flashcards, quizzes, summaries, and export-ready bundles.',
    insights: ['56 flashcards queued', 'MCQ set ready', 'Summary draft complete'],
  },
];

export const getWorkspacePages = (): WorkspacePage[] => [
  {
    id: 'page-1',
    pageNumber: 12,
    chapter: '1. Stoichiometry Foundations',
    confidence: 96,
    anchor: 'Chemistry:12:01',
    hasCorrections: false,
    blocks: [
      {
        id: 'blk-1',
        type: 'text',
        heading: 'Mole Concept Overview',
        confidence: 0.97,
        excerpt:
          'The mole allows chemists to count particles by weighing them, bridging atomic scale counts to lab measurements.',
        anchors: ['Chemistry:12:01:a'],
        badges: ['Definition', 'High confidence'],
      },
      {
        id: 'blk-2',
        type: 'math',
        heading: 'Core Formula',
        confidence: 0.93,
        excerpt: 'n = \\frac{m}{M_r}',
        anchors: ['Chemistry:12:01:b'],
        badges: ['LaTeX compiled', 'Inline'],
      },
      {
        id: 'blk-3',
        type: 'exercise',
        heading: 'Practice 1A',
        confidence: 0.88,
        excerpt: 'Calculate the moles in 12 g of carbon-12.',
        anchors: ['Chemistry:12:01:c'],
        badges: ['Exercise', 'Auto paired'],
        pairedWith: 'blk-6',
      },
      {
        id: 'blk-4',
        type: 'diagram',
        heading: 'Particle Flow Diagram',
        confidence: 0.9,
        excerpt: 'SVG vectorized · 5 labeled nodes',
        anchors: ['Chemistry:12:01:d'],
        badges: ['Vectorized', 'Alt text ready'],
      },
    ],
  },
  {
    id: 'page-2',
    pageNumber: 13,
    chapter: 'Worked Examples',
    confidence: 93,
    anchor: 'Chemistry:13:00',
    hasCorrections: true,
    blocks: [
      {
        id: 'blk-5',
        type: 'text',
        heading: 'Worked Example 1',
        confidence: 0.9,
        excerpt:
          'Given 11.2 L of oxygen at STP, determine the number of molecules present using Avogadro’s law.',
        anchors: ['Chemistry:13:00:a'],
        badges: ['Example'],
      },
      {
        id: 'blk-6',
        type: 'exercise',
        heading: 'Solution 1A',
        confidence: 0.86,
        excerpt: 'Answer: 1 mole · 6.022 × 10^23 molecules.',
        anchors: ['Chemistry:13:00:b'],
        badges: ['Answer', 'Cited'],
        pairedWith: 'blk-3',
      },
      {
        id: 'blk-7',
        type: 'table',
        heading: 'Molar Mass Table',
        confidence: 0.91,
        excerpt: 'Elements with atomic mass, molar mass, and % composition.',
        anchors: ['Chemistry:13:00:c'],
        badges: ['CSV ready'],
      },
    ],
  },
  {
    id: 'page-3',
    pageNumber: 14,
    chapter: 'Key Takeaways',
    confidence: 94,
    anchor: 'Chemistry:14:00',
    hasCorrections: false,
    blocks: [
      {
        id: 'blk-8',
        type: 'glossary',
        heading: 'Glossary — Limiting Reagent',
        confidence: 0.95,
        excerpt: 'The reactant that is fully consumed first, limiting the amount of product formed.',
        anchors: ['Chemistry:14:00:a'],
        badges: ['Glossary', 'Flashcard source'],
      },
      {
        id: 'blk-9',
        type: 'text',
        heading: 'Summary Notes',
        confidence: 0.92,
        excerpt: 'Key checkpoints: convert to moles, compare mole ratios, identify limiting reagent, compute yields.',
        anchors: ['Chemistry:14:00:b'],
        badges: ['Summary'],
      },
    ],
  },
];

export const getArtifacts = (): ArtifactType[] => [
  {
    id: 'flashcards',
    label: 'Flashcards',
    description: 'Spaced repetition decks grouped by chapter with confidence tagging.',
    generated: 56,
    includes: ['Definitions & glossary', 'Worked example highlights', 'Formula drills'],
    sourceBlocks: ['Chemistry:12:01:a', 'Chemistry:14:00:a'],
  },
  {
    id: 'quiz',
    label: 'Quiz Sets',
    description: 'Mixed-format MCQ, short answer, and true/false sets with answer rationales.',
    generated: 24,
    includes: ['MCQ with distractors', 'Short answer prompts', 'Link back to source block'],
    sourceBlocks: ['Chemistry:13:00:b', 'Chemistry:12:01:c'],
  },
  {
    id: 'summary',
    label: 'Summary Notes',
    description: 'Chapter summaries with citations and suggested revision cadence.',
    generated: 3,
    includes: ['Key checkpoints', 'Formula recap', 'Glossary anchors'],
    sourceBlocks: ['Chemistry:14:00:b'],
  },
  {
    id: 'formula-index',
    label: 'Formula Index',
    description: 'Extracted formulas with LaTeX, plain text, and description for quick lookup.',
    generated: 12,
    includes: ['Inline and block formulas', 'Units & context', 'Usage frequency'],
    sourceBlocks: ['Chemistry:12:01:b'],
  },
];

export const getExportPresets = (): ExportPreset[] => [
  {
    id: 'study-markdown',
    label: 'Markdown Study Pack',
    format: 'md',
    description: 'Clean Markdown with headings, text, math, tables, and image references.',
    includes: ['TOC with anchors', 'Inline citations', 'Exercise-answer pairs'],
  },
  {
    id: 'annotated-pdf',
    label: 'Annotated PDF',
    format: 'pdf',
    description: 'Original pages with selectable text layer and highlight overlays.',
    includes: ['Deskewed pages', 'Confidence heatmap overlay', 'Bookmarks'],
  },
  {
    id: 'curriculum-docx',
    label: 'Curriculum-ready DOCX',
    format: 'docx',
    description: 'Word document with heading styles, table formatting, and alt text.',
    includes: ['Heading styles mapped', 'Captioned figures', 'Table grids'],
    proOnly: true,
  },
  {
    id: 'anki-apkg',
    label: 'Anki Deck (APKG)',
    format: 'apkg',
    description: 'Flashcards exported to APKG v1.1 with media assets embedded.',
    includes: ['Cloze deletions', 'Source citation fields', 'Deck level tags'],
    proOnly: true,
  },
  {
    id: 'quiz-json',
    label: 'Quiz JSON for Exam Simulator',
    format: 'json',
    description: 'Question banks ready for import into Ansiversa Exam Simulator.',
    includes: ['MCQ & TF schema', 'Answer rationales', 'Source anchors'],
    proOnly: true,
  },
];

export const getPlanComparison = (): PlanComparisonRow[] => [
  {
    feature: 'Pages per job',
    free: 'Up to 30 pages',
    pro: 'Up to 300 pages',
  },
  {
    feature: 'OCR languages',
    free: 'English only',
    pro: 'English + multi-language (15+)',
  },
  {
    feature: 'Math OCR',
    free: 'Basic inline LaTeX',
    pro: 'Advanced LaTeX with align & matrices',
  },
  {
    feature: 'Diagram vectorization',
    free: 'Raster export only',
    pro: 'SVG vectorization for clean diagrams',
  },
  {
    feature: 'Exports',
    free: 'Markdown & PDF',
    pro: 'Markdown, PDF, DOCX, CSV, LaTeX, APKG, Quiz JSON',
  },
  {
    feature: 'Integrations',
    free: 'View in-app only',
    pro: 'Push to FlashNote, Study Planner, Concept Explainer',
  },
  {
    feature: 'History retention',
    free: '30 days',
    pro: 'Unlimited with version history',
  },
];

export const getIntegrationCards = (): IntegrationCard[] => [
  {
    id: 'flashnote',
    name: 'FlashNote',
    description: 'Sync generated flashcards straight into spaced repetition decks.',
    icon: 'fas fa-clone',
    status: 'push',
    highlight: 'Auto-tag decks by chapter and difficulty.',
  },
  {
    id: 'study-planner',
    name: 'Study Planner',
    description: 'Pipe summary checkpoints and revision cadence into your weekly plan.',
    icon: 'fas fa-calendar-week',
    status: 'push',
    highlight: 'Schedule review loops the moment scans finish.',
  },
  {
    id: 'concept-explainer',
    name: 'Concept Explainer',
    description: 'Send tricky paragraphs for step-by-step explanations and analogies.',
    icon: 'fas fa-lightbulb',
    status: 'sync',
    highlight: 'Links back with citation anchors for each concept.',
  },
  {
    id: 'homework-helper',
    name: 'Homework Helper',
    description: 'Publish exercises with paired answers to guided practice mode.',
    icon: 'fas fa-clipboard-check',
    status: 'push',
    highlight: 'Auto-build hints from worked solutions.',
  },
];

export const getQualityChecks = (): QualityCheck[] => [
  {
    id: 'dpi',
    label: 'DPI Check',
    status: 'passed',
    message: 'All pages above 300 DPI — crisp text and diagrams.',
    severity: 'info',
  },
  {
    id: 'math',
    label: 'Math Compilation',
    status: 'warning',
    message: '2 formulas need review — auto-suggested LaTeX corrections available.',
    severity: 'medium',
  },
  {
    id: 'exercise-pairs',
    label: 'Exercise ↔ Answer Pairs',
    status: 'passed',
    message: '14/18 exercises paired automatically.',
    severity: 'info',
  },
  {
    id: 'diagram',
    label: 'Diagram Vectorization',
    status: 'warning',
    message: '1 complex diagram exported as PNG. Consider manual tracing.',
    severity: 'medium',
  },
  {
    id: 'privacy',
    label: 'Privacy & Access',
    status: 'passed',
    message: 'Private by default. Sharing disabled until explicit export.',
    severity: 'info',
  },
];

export const getDataModel = (): DataModelEntity[] => [
  {
    name: 'BookScan',
    description: 'Top-level entity representing a scanned textbook or handout.',
    fields: [
      { name: 'id', type: 'uuid', notes: 'Primary key' },
      { name: 'userId', type: 'uuid', notes: 'Owner account' },
      { name: 'title', type: 'text', notes: 'Provided during upload' },
      { name: 'subject', type: 'text', notes: 'Optional classification for filtering' },
      { name: 'grade', type: 'text|null', notes: 'Curriculum grade level if provided' },
      { name: 'language', type: 'text', notes: 'ISO language code for OCR' },
      { name: 'pages', type: 'integer', notes: 'Page count processed' },
      { name: 'status', type: "enum('uploaded','processing','done','error')", notes: 'Pipeline state' },
      { name: 'confSummary', type: 'json', notes: 'Confidence snapshot for dashboards' },
      { name: 'createdAt', type: 'timestamp', notes: 'Ingestion timestamp' },
    ],
  },
  {
    name: 'SourceAsset',
    description: 'Uploaded PDF pages or images tied to the BookScan.',
    fields: [
      { name: 'id', type: 'uuid', notes: 'Primary key' },
      { name: 'bookId', type: 'uuid', notes: 'References BookScan' },
      { name: 'type', type: "enum('pdf','image')", notes: 'Original asset type' },
      { name: 'url', type: 'text', notes: 'Storage location' },
      { name: 'pageIndex', type: 'integer|null', notes: 'For PDFs after splitting' },
      { name: 'checksum', type: 'text', notes: 'Used to dedupe uploads' },
      { name: 'dpi', type: 'integer|null', notes: 'Estimated resolution' },
      { name: 'meta', type: 'json', notes: 'Capture metadata & warnings' },
    ],
  },
  {
    name: 'Page',
    description: 'Normalized page representation with preview metadata.',
    fields: [
      { name: 'id', type: 'uuid', notes: 'Primary key' },
      { name: 'bookId', type: 'uuid', notes: 'References BookScan' },
      { name: 'index', type: 'integer', notes: '0-based page order' },
      { name: 'width', type: 'integer', notes: 'Pixels after normalization' },
      { name: 'height', type: 'integer', notes: 'Pixels after normalization' },
      { name: 'rotation', type: 'integer', notes: 'Applied rotation degrees' },
      { name: 'previewUrl', type: 'text', notes: 'Rendered preview path' },
    ],
  },
  {
    name: 'Block',
    description: 'Atomic piece of content: text, math, diagram, table, or exercise.',
    fields: [
      { name: 'id', type: 'uuid', notes: 'Primary key' },
      { name: 'pageId', type: 'uuid', notes: 'References Page' },
      { name: 'type', type: "enum('text','math','diagram','table','exercise','glossary')", notes: 'Block classification' },
      { name: 'content', type: 'json', notes: 'Structured content payload (text, LaTeX, SVG, CSV)' },
      { name: 'anchors', type: 'json', notes: 'Citation anchors and positions' },
      { name: 'confidence', type: 'numeric', notes: 'OCR confidence 0-1' },
      { name: 'labels', type: 'json', notes: 'Semantic tags (Definition, Example, etc.)' },
      { name: 'pairBlockId', type: 'uuid|null', notes: 'Exercise-to-answer linkage' },
    ],
  },
  {
    name: 'Artifact',
    description: 'Generated study materials derived from blocks.',
    fields: [
      { name: 'id', type: 'uuid', notes: 'Primary key' },
      { name: 'bookId', type: 'uuid', notes: 'References BookScan' },
      { name: 'type', type: "enum('flashcard','quiz','summary','formula','glossary')", notes: 'Artifact type' },
      { name: 'sourceBlockIds', type: 'json', notes: 'Traceability for hallucination guard' },
      { name: 'payload', type: 'json', notes: 'Renderable data (cards, questions, notes)' },
      { name: 'status', type: "enum('draft','ready','exported')", notes: 'Approval state' },
      { name: 'createdAt', type: 'timestamp', notes: 'Generation timestamp' },
    ],
  },
];

export const getStatusFeed = (): readonly string[] => [
  'Ready to ingest your book. Choose a capture mode to begin.',
  'Pipeline tuned for STEM textbooks with LaTeX-heavy layouts.',
];

export const heroHighlights = [
  {
    icon: "fas fa-diagram-project",
    label: "Project scaffolding",
    blurb:
      "Spin up research spaces with questions, scope, sources, and bibliography defaults ready to go.",
  },
  {
    icon: "fas fa-highlighter",
    label: "Reader + capture",
    blurb:
      "Split-pane workspace for highlights, quotes, and notes with instant citation cards.",
  },
  {
    icon: "fas fa-scale-balanced",
    label: "Evidence integrity",
    blurb:
      "Claim ↔ evidence matrix, bias checks, and plagiarism guardrails keep insights trustworthy.",
  },
];

export const objectiveHighlights = [
  {
    title: "Projects as evidence hubs",
    description:
      "Each project bundles the research question, scope, sources, notes, claims, citations, and exports for one mission.",
    metricLabel: "Artifacts tracked",
    metricValue: "9 core objects",
  },
  {
    title: "Flexible source intake",
    description:
      "URL fetch, PDF uploads, pasted passages, or manual notes all normalize into searchable source records with metadata.",
    metricLabel: "Source types",
    metricValue: "4 supported",
  },
  {
    title: "Workspace for deep reading",
    description:
      "Reader and notes panes share highlights, tags, auto-summaries, and keyboard shortcuts for fast capture.",
    metricLabel: "Hotkeys",
    metricValue: "H · Q · N · C",
  },
  {
    title: "Synthesis to drafting",
    description:
      "Topic maps, compare views, claim matrices, and draft generators transform findings into structured, cited writing.",
    metricLabel: "Pipelines",
    metricValue: "5 stage flow",
  },
];

export const nonGoals = [
  "No automated web crawling or paywall bypass in v1 — users provide accessible content.",
  "No collaborative editing or multi-user presence yet; single researcher focus.",
  "No medical, legal, or financial advisory positioning — outputs stay neutral and cited.",
];

export const workspaceModules = [
  {
    id: "projects",
    title: "Project dashboard",
    description:
      "Manage the research question, scope, and progress signals while launching new intake or synthesis actions in context.",
    highlights: [
      "Create and list projects with citation style defaults via /research-assistant/api/project/* routes.",
      "Quick stats on sources, highlights, and draft readiness per project.",
      "Plan gating nudges show remaining capacity for Free vs. Pro tiers.",
    ],
  },
  {
    id: "sources",
    title: "Source manager",
    description:
      "Collect URLs, PDFs, pasted text, and manual notes with dedupe fingerprints and parsing status feedback.",
    highlights: [
      "Uniform metadata schema covering author, publisher, publish date, and access date.",
      "Batch uploads queue parsing workers for long-form summarization on Pro plans.",
      "Status chips for added, parsed, or error to guide retries and troubleshooting.",
    ],
  },
  {
    id: "reader",
    title: "Reader & capture",
    description:
      "Split-pane PDF/HTML reader paired with notes, tags, and highlight timeline for every source.",
    highlights: [
      "Selection toolbar with Highlight, Quote, Copy with citation, Note, and Tag actions.",
      "Citation cards auto-fill from source metadata with page/location tracking.",
      "Search, page thumbnails, and keyboard shortcuts keep review speedy.",
    ],
  },
  {
    id: "synthesis",
    title: "Synthesis studio",
    description:
      "Topic maps, compare & contrast views, and claim matrices uncover alignment, gaps, and counter-arguments.",
    highlights: [
      "Evidence coverage meters visualize support, refute, and context links across claims.",
      "Bias checks flag publisher types, funding, and recency differences for balance.",
      "Counter-argument prompts pull credible opposing viewpoints for stronger drafts.",
    ],
  },
  {
    id: "writer",
    title: "Writer & exports",
    description:
      "Convert curated evidence into outlines, drafts, bibliographies, and exports with automatic citation formatting.",
    highlights: [
      "Outline builder with drag-drop from notes and claims, feeding draft generation per section.",
      "Inline citations support APA, MLA, Chicago, and IEEE styles with locale-aware punctuation.",
      "Exports include Markdown, DOCX, PDF, CSV/JSON, plus deck hand-off to Presentation Designer.",
    ],
  },
];

export const userStories = [
  {
    title: "Start a project",
    description:
      "Seed a research workspace with the guiding question, scope, and bibliography style in one API call.",
    acceptanceCriteria:
      "POST /research-assistant/api/project/create returns a project id with defaults for citation style and empty source lists.",
  },
  {
    title: "Add sources",
    description:
      "Bring in URLs, PDFs, pasted text, or manual notes with dedupe hashing and metadata capture.",
    acceptanceCriteria:
      "POST /research-assistant/api/source/add stores core metadata, fetches article text when possible, and fingerprints for duplicates.",
  },
  {
    title: "Read & highlight",
    description:
      "Review each source inside the split-pane reader while capturing highlights, quotes, and linked notes.",
    acceptanceCriteria:
      "Highlight actions create color-coded entries with optional tags, page numbers, and linked notes for context.",
  },
  {
    title: "Summarize & extract",
    description:
      "Generate auto-summaries and key quote callouts with confidence scoring when the user requests it.",
    acceptanceCriteria:
      "POST /research-assistant/api/summary responds with bullets, supporting quotes, citation references, and model confidence levels.",
  },
  {
    title: "Claim ↔ evidence matrix",
    description:
      "Map every claim to supporting or refuting evidence to expose research gaps.",
    acceptanceCriteria:
      "POST /research-assistant/api/claims/link associates claim text with source excerpts and flags missing counter-evidence.",
  },
  {
    title: "Export work",
    description:
      "Deliver essays, fact packs, or datasets with citations intact for downstream tools.",
    acceptanceCriteria:
      "POST /research-assistant/api/export streams Markdown, DOCX, PDF, or structured JSON/CSV along with download URLs.",
  },
];

export const apiSurface = {
  routes: [
    "/research-assistant",
    "/research-assistant/project/[id]",
    "/research-assistant/project/[id]/sources",
    "/research-assistant/project/[id]/reader/[sourceId]",
    "/research-assistant/project/[id]/synthesis",
    "/research-assistant/project/[id]/writer",
    "/research-assistant/settings",
  ],
  endpoints: [
    {
      category: "Project",
      paths: [
        "POST /research-assistant/api/project/create",
        "GET /research-assistant/api/project/list",
        "POST /research-assistant/api/project/delete",
      ],
    },
    {
      category: "Sources",
      paths: [
        "POST /research-assistant/api/source/add",
        "POST /research-assistant/api/source/update",
        "POST /research-assistant/api/source/delete",
        "GET /research-assistant/api/source/list",
      ],
    },
    {
      category: "Content",
      paths: [
        "POST /research-assistant/api/summary",
        "POST /research-assistant/api/compare",
        "POST /research-assistant/api/claims/link",
        "POST /research-assistant/api/claims/suggest",
      ],
    },
    {
      category: "Capture",
      paths: [
        "POST /research-assistant/api/highlight/add",
        "POST /research-assistant/api/note/add",
        "GET /research-assistant/api/highlight/list",
      ],
    },
    {
      category: "Writer",
      paths: [
        "POST /research-assistant/api/outline",
        "POST /research-assistant/api/draft",
        "POST /research-assistant/api/bib/render",
      ],
    },
    {
      category: "Integrity",
      paths: [
        "POST /research-assistant/api/plagiarism/check",
        "POST /research-assistant/api/safety/check",
      ],
    },
    {
      category: "Export",
      paths: ["POST /research-assistant/api/export"],
    },
  ],
};

export const dataModel = [
  {
    entity: "Project",
    fields: [
      "id (uuid)",
      "userId",
      "title",
      "question",
      "scope { timeframe, region, audience }",
      "citationStyle",
      "language",
      "createdAt/updatedAt",
    ],
  },
  {
    entity: "Source",
    fields: [
      "id (uuid)",
      "projectId",
      "type (url|pdf|text|note)",
      "title",
      "authors[]",
      "publisher",
      "pubDate/accessDate",
      "url or fileUrl",
      "fingerprint hash",
      "status",
    ],
  },
  {
    entity: "Excerpt",
    fields: [
      "id (uuid)",
      "sourceId",
      "text",
      "start/end loc",
      "page",
      "meta { selector, context }",
      "createdAt",
    ],
  },
  {
    entity: "Highlight",
    fields: [
      "id (uuid)",
      "sourceId",
      "excerptId",
      "color",
      "tags[]",
      "noteId",
      "createdAt",
    ],
  },
  {
    entity: "Note",
    fields: [
      "id (uuid)",
      "projectId",
      "textMd",
      "links { sourceId, excerptId }",
      "createdAt",
    ],
  },
  {
    entity: "Claim",
    fields: [
      "id (uuid)",
      "projectId",
      "text",
      "stance",
      "confidence",
      "createdAt",
    ],
  },
  {
    entity: "EvidenceLink",
    fields: [
      "id (uuid)",
      "claimId",
      "sourceId",
      "excerptId",
      "role",
      "weight",
    ],
  },
  {
    entity: "Outline",
    fields: ["id", "projectId", "structure", "createdAt"],
  },
  {
    entity: "Draft",
    fields: ["id", "projectId", "outlineId", "contentMd", "citations", "createdAt"],
  },
  {
    entity: "BibliographyItem",
    fields: ["id", "projectId", "sourceId", "style", "text", "createdAt"],
  },
  {
    entity: "PlagiarismReport",
    fields: ["id", "projectId", "status", "score", "matches", "createdAt"],
  },
];

export const integrityPrinciples = [
  {
    title: "Evidence-backed writing",
    description:
      "Every non-obvious sentence in drafts must reference at least one source excerpt, preventing unsourced claims.",
  },
  {
    title: "Bias and recency checks",
    description:
      "Publisher type, funding, and timeline signals encourage balanced reporting with explicit caveats when gaps appear.",
  },
  {
    title: "Plagiarism vigilance",
    description:
      "Near-verbatim matches trigger quote recommendations or rewrites with attribution before export.",
  },
  {
    title: "Privacy and safety",
    description:
      "Uploaded files stay private, exports redact personal data, and safety checks steer away from sensitive claims.",
  },
];

export const planGating = [
  {
    plan: "Free",
    limits: [
      "1 project", "10 sources", "200 highlights", "Basic summaries", "Markdown export"
    ],
  },
  {
    plan: "Pro",
    limits: [
      "Unlimited projects", "2k sources/project", "Long-form summarization", "DOCX/PDF exports", "Plagiarism check", "Outline & draft generator"
    ],
  },
];

export const validationRules = [
  {
    label: "URLs",
    description: "Only accepts secure http(s) links to maintain provenance and avoid unsupported protocols.",
  },
  {
    label: "PDF uploads",
    description: "Files must be 25MB or smaller so parsing queues stay responsive for every plan tier.",
  },
  {
    label: "Notes",
    description: "Individual notes are capped at 20k characters to keep sync snappy across devices.",
  },
  {
    label: "Highlights",
    description: "Highlight spans require 1-2000 characters, reinforcing precise evidence capture.",
  },
  {
    label: "Draft checks",
    description: "Draft sections need citations from at least two sources before export unlocks.",
  },
];

export const accessibilityFeatures = [
  "Keyboard shortcuts for highlight, quote, note, and copy actions.",
  "High-contrast palette options plus dyslexia-friendly typography.",
  "Right-to-left and multi-language layout support for global researchers.",
];

export const integrations = [
  {
    name: "FlashNote",
    description: "Send curated highlights into spaced-repetition decks for long-term retention.",
  },
  {
    name: "Fact Generator",
    description: "Validate claims and extract structured facts from trusted excerpts.",
  },
  {
    name: "Proposal Writer",
    description: "Reuse synthesized sections when preparing stakeholder-ready proposals.",
  },
  {
    name: "Blog Writer",
    description: "Push outlines and citations into publication workflows for content teams.",
  },
  {
    name: "Presentation Designer",
    description: "Transform outlines and key claims into decks without reformatting.",
  },
];

export const exportFormats = [
  "Markdown (MD)",
  "DOCX",
  "PDF",
  "JSON data bundle",
  "CSV matrices",
  "Presentation Designer deck hand-off",
];

export const futureEnhancements = [
  {
    title: "Collaboration and comments",
    description: "Real-time co-authoring, reviewer suggestions, and decision trails for teams.",
  },
  {
    title: "Semantic search across evidence",
    description: "Vector-powered discovery spanning notes, highlights, and claims to close gaps fast.",
  },
  {
    title: "Zotero, Notion, and Drive import",
    description: "Direct connectors pull in existing libraries with citation metadata intact.",
  },
  {
    title: "Argument graphs and contradiction detection",
    description: "Visualize stance networks and surface conflicting evidence before drafting.",
  },
  {
    title: "Video and audio transcript support",
    description: "Ingest multimedia sources with timestamped highlights and searchable captions.",
  },
];

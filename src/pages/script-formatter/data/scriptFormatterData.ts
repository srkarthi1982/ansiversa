export const heroHighlights = [
  {
    icon: "fas fa-align-left",
    label: "Element-aware drafting",
    blurb:
      "Sluglines, dialogue, parentheticals, transitions, lyrics, and shots snap to their presets with tab/enter cycling.",
  },
  {
    icon: "fas fa-file-export",
    label: "Studio-ready exports",
    blurb:
      "Fountain, Final Draft FDX, PDF, DOCX, and CSV pipelines render watermarks, scene numbers, and revision colors correctly.",
  },
  {
    icon: "fas fa-clock",
    label: "Timing intelligence",
    blurb:
      "Auto page/minute estimates and dialogue pace heuristics surface runtime confidence before table reads.",
  },
];

export const formatPresets = [
  {
    id: "screenplay",
    name: "Screenplay",
    icon: "fas fa-film",
    description:
      "Feature and short film formatting for Fountain/FDX imports with Courier Prime, US Letter/A4, and production page numbering.",
    specs: [
      "Elements: Slugline, Action, Character, Dialogue, Parenthetical, Transition, Shot, Lyrics, Notes",
      "Rules: INT./EXT. caps, character caps, CONT'D handling, transitions flush right",
      "Options: Scene numbers toggles, dual page size, watermarking on export",
    ],
  },
  {
    id: "stage",
    name: "Stage Play",
    icon: "fas fa-masks-theater",
    description:
      "Modern stage layout plus Samuel French presets with italics stage directions, centered lyrics, and act/scene headers.",
    specs: [
      "Elements: Act/Scene headers, Character, Dialogue, Stage directions, Lyrics, Notes",
      "Options: Flexible margins, French-style title page, optional scene numbers",
      "Exports: PDF, DOCX with cueing and lyric spacing intact",
    ],
  },
  {
    id: "sitcom",
    name: "Sitcom Multi-cam",
    icon: "fas fa-video",
    description:
      "Writer's room two-column structure with camera cues, action beats, and alternate joke columns ready for shooting drafts.",
    specs: [
      "Elements: Scene header, Action, Character, Dialogue, Parenthetical, Camera",
      "Layout: Double-column alt-line support (v1.1) with tab hotkeys",
      "Exports: PDF, DOCX with table rendering and MORE/CONT'D markers",
    ],
  },
  {
    id: "audio",
    name: "Audio Drama / Podcast",
    icon: "fas fa-headphones",
    description:
      "Cue-based scripting for audio with SCENE, SFX, MUSIC, V.O., and timestamp columns for engineer handoff.",
    specs: [
      "Elements: Scene, SFX, MUSIC, Dialogue, V.O./O.S., TIME",
      "Layout: Left cue labels with inline duration meters",
      "Exports: PDF, DOCX, CSV cue sheets, plus teleprompter mode",
    ],
  },
  {
    id: "adspot",
    name: "Ad Spot (30s/60s)",
    icon: "fas fa-bullhorn",
    description:
      "Two-column A/V layouts that track duration per beat and enforce total runtime for broadcast handoff.",
    specs: [
      "Columns: Video beats (visuals/b-roll) + Audio copy with SFX indicators",
      "Timing: Row-level seconds with cumulative meter",
      "Exports: PDF decks, CSV timing sheet, DOCX client scripts",
    ],
  },
  {
    id: "youtube",
    name: "YouTube / Content Script",
    icon: "fas fa-play",
    description:
      "Hook-to-CTA structures with timestamp annotations, teleprompter pacing, and integration with lyric blocks when needed.",
    specs: [
      "Sections: Hook, Intro, Value beats, CTA with auto timestamp suggestions",
      "Modes: Teleprompter scroll, single-column outline, or shot-by-shot",
      "Exports: PDF rundown, DOCX teleprompter, CSV shot checklist",
    ],
  },
];

export const workflowStages = [
  {
    name: "Library & templates",
    description:
      "Organize projects, select presets, and capture title page metadata before drafting in /script/new.",
    actions: [
      "Preset selector surfaces screenplay, stage, sitcom, audio, ad, and YouTube templates with preview of margins.",
      "Title page captures title, by-line, contact, revision color, and optional scene numbering.",
      "Auto-import Fountain/FDX/TXT/MD with detection preview before editing.",
    ],
  },
  {
    name: "Dual-pane editor",
    description:
      "Source Markdown-style syntax on the left, live formatted preview on the right with pagination and page timers.",
    actions: [
      "Element-aware toolbar toggles slugline, action, character, dialogue, parenthetical, transition, shot, lyric, and notes.",
      "Tab/Enter cycling plus Ctrl/Cmd+1..7 hotkeys maintain writing flow.",
      "Smart quotes, em dash normalization, and spacing cleanup run as-you-type.",
    ],
  },
  {
    name: "Analysis & validation",
    description:
      "Lint for format violations, runtime targets, and orphan lines in /script/[id]/analyze.",
    actions: [
      "Slugline case, character caps, dialogue width, MORE/CONT'D placement, and transition alignment checks.",
      "Timing heuristics convert page count and dialogue syllables into minute estimates.",
      "Scene, character, location, prop, and shot reports display coverage and export to CSV (Pro).",
    ],
  },
  {
    name: "Export center",
    description:
      "Deliver production-ready files with revision watermarks, colored pages, and report bundles.",
    actions: [
      "Export Fountain, FDX, PDF, DOCX, and CSV reports with status polling via /script/api/export.",
      "Revision colors, A-pages, and watermarks align with studio standards.",
      "Package shot lists, character breakdowns, and prop summaries alongside script PDFs.",
    ],
  },
];

export const validationSuite = [
  {
    title: "Format compliance",
    bullets: [
      "Ensures sluglines follow INT./EXT. LOCATION – DAY/NIGHT syntax with optional scene numbers.",
      "Flags lowercase character names, orphan parentheticals, transitions not flush right, and widowed dialogue lines.",
      "Detects missing CONT'D or MORE indicators when dialogue spans pages.",
    ],
  },
  {
    title: "Auto reformatting",
    bullets: [
      "Convert raw text into structured elements with /script/api/reformat including smart caps and spacing fixes.",
      "Normalize quotes, dashes, ellipses, and indentation across imported Fountain, FDX, TXT, or Markdown.",
      "Apply preset-specific margins, fonts, and pagination without manual tweaking.",
    ],
  },
  {
    title: "Rewrite passes",
    bullets: [
      "Dialogue punch-up, action tightening, cut-to-time, and profanity clean passes accessible via /script/api/pass/* routes.",
      "Target runtime adjustments propose trims or expansions based on minute goals and per-character pacing.",
      "Lyric cleaner syncs with Poem Studio and Song Lyric Maker for musical sequences.",
    ],
  },
  {
    title: "Revision tracking",
    bullets: [
      "Colored revisions (Blue, Pink, Yellow, etc.) with page locks, watermarks, and version naming.",
      "A-pages insertion with automatic numbering and history snapshots.",
      "Snapshots diff scenes, highlight changed dialogue, and mark locked pages for downstream departments.",
    ],
  },
];

export const timingReports = [
  {
    title: "Timing intelligence",
    bullets: [
      "Page count × 1 minute baseline plus per-scene overrides and teleprompter pacing for content scripts.",
      "Dialogue syllable heuristics estimate actor read times with slow/normal/fast presets.",
      "Read-through timer uses runtime plus buffer for table read scheduling.",
    ],
  },
  {
    title: "Breakdown reports",
    bullets: [
      "Scene reports track number, heading, page start/end, estimated length, and tags.",
      "Character reports list line counts, words, speaking time, and alias mapping.",
      "Location, prop, and shot lists surface first appearances for production planning.",
    ],
  },
  {
    title: "Exports & sharing",
    bullets: [
      "CSV exports for scenes, characters, locations, props, and shots (Pro).",
      "PDF and DOCX include watermarks, revision color legends, and locked page indicators.",
      "Integrate breakdowns with Presentation Designer pitch decks and Production spreadsheets.",
    ],
  },
];

export const planMatrix = {
  tiers: [
    {
      name: "Free",
      icon: "fas fa-user",
      description: "Get started with two active projects and core exports.",
      features: [
        "2 active projects",
        "Fountain + watermarked PDF exports",
        "Basic revision colors",
        "Scene & character reports",
        "20 AI passes per day",
        "History retention 60 days",
      ],
    },
    {
      name: "Pro",
      icon: "fas fa-user-tie",
      description: "Unlimited productions, unlocked exports, and deep revision control.",
      features: [
        "Unlimited projects",
        "Fountain/FDX/PDF/DOCX/CSV exports",
        "Full revision color set + A-pages",
        "Scene, character, location, prop, shot reports",
        "300 AI passes per day",
        "Unlimited history retention",
      ],
    },
  ],
  comparisons: [
    {
      feature: "Projects",
      free: "2 active",
      pro: "Unlimited",
    },
    {
      feature: "Exports",
      free: "Fountain · PDF (watermarked)",
      pro: "Fountain · FDX · PDF · DOCX · CSV",
    },
    {
      feature: "Revision system",
      free: "Basic colors",
      pro: "Full color set · Watermark · Page locks",
    },
    {
      feature: "Reports",
      free: "Scenes · Characters",
      pro: "+ Locations · Props · Shots",
    },
    {
      feature: "Beat sync",
      free: "View Story Crafter beats",
      pro: "Two-way sync with Story Crafter",
    },
    {
      feature: "AI passes/day",
      free: "20",
      pro: "300",
    },
    {
      feature: "History retention",
      free: "60 days",
      pro: "Unlimited",
    },
  ],
};

export const integrations = [
  {
    name: "Story Crafter",
    icon: "fas fa-waveform",
    description:
      "Import beats to align scenes, push revised scenes back, and maintain traceability between outline and script.",
    actions: [
      "Beat links sync scene slugs with outline beats and flag drift.",
      "Change log highlights new pages needing outline updates.",
    ],
  },
  {
    name: "Presentation Designer",
    icon: "fas fa-display",
    description:
      "Build pitch decks, production bibles, and network one-pagers directly from script metadata.",
    actions: [
      "Send character bios, loglines, and runtime metrics into branded slides.",
      "Auto-generate episode/scene cards for pitch sequences.",
    ],
  },
  {
    name: "Poem Studio & Song Lyric Maker",
    icon: "fas fa-music",
    description:
      "Craft lyrical sections or musical callouts without breaking pagination alignment.",
    actions: [
      "Inline lyric blocks pull from curated stanzas with centered formatting.",
      "Sync updates back to lyric tools for collaborative revisions.",
    ],
  },
  {
    name: "Ad Copy Assistant",
    icon: "fas fa-bullhorn",
    description:
      "Reuse on-brand messaging inside ad spot scripts with tone and timing awareness.",
    actions: [
      "Import approved copy decks into A/V columns.",
      "Measure copy length against 30s/60s runtime constraints.",
    ],
  },
];

export const apiEndpoints = [
  {
    group: "Projects",
    endpoints: [
      "POST /script/api/project/create",
      "GET /script/api/project?id=",
      "POST /script/api/project/update",
      "POST /script/api/project/archive",
    ],
  },
  {
    group: "Import & Export",
    endpoints: [
      "POST /script/api/import (fountain|fdx|txt|md)",
      "POST /script/api/export (fountain|fdx|pdf|docx|csv)",
      "GET /script/api/export/status?id=",
    ],
  },
  {
    group: "Parse & Analyze",
    endpoints: [
      "POST /script/api/parse",
      "POST /script/api/analyze",
      "POST /script/api/report?type=scenes|characters|locations|props|shots",
    ],
  },
  {
    group: "Reformat & Passes",
    endpoints: [
      "POST /script/api/reformat",
      "POST /script/api/pass/dialogue",
      "POST /script/api/pass/action_tighten",
      "POST /script/api/pass/cut_to_time",
      "POST /script/api/pass/profanity_clean",
    ],
  },
  {
    group: "Beats & Sync",
    endpoints: [
      "POST /script/api/beat/link",
      "POST /script/api/beat/sync",
    ],
  },
  {
    group: "Settings & Revisions",
    endpoints: [
      "POST /script/api/settings/save",
      "POST /script/api/revision/apply",
      "POST /script/api/snapshot/create",
      "GET /script/api/snapshot/compare?id1&id2",
    ],
  },
];

export const dataModelEntities = [
  {
    name: "ScriptProject",
    description:
      "Tracks title, type, page size, margins, scene numbering, language, status, createdAt, and updatedAt.",
    fields: [
      "id (uuid)",
      "userId",
      "title",
      "type",
      "pageSize",
      "margins",
      "sceneNumbers",
      "language",
      "status",
      "timestamps",
    ],
  },
  {
    name: "Scene",
    description:
      "Represents ordered scenes with slug, optional title, page timing, and tag metadata.",
    fields: [
      "id",
      "projectId",
      "index",
      "slug",
      "title",
      "pageStart",
      "pageEnd",
      "timingSec",
      "tags",
    ],
  },
  {
    name: "ScriptElement",
    description:
      "Element-level records for sluglines, action, dialogue, parentheticals, transitions, shots, lyrics, or notes.",
    fields: [
      "id",
      "projectId",
      "sceneId",
      "type",
      "text",
      "meta",
      "index",
    ],
  },
  {
    name: "Character",
    description:
      "Catalogues speaking characters, aliases, and notes for reporting and dialogue passes.",
    fields: [
      "id",
      "projectId",
      "name",
      "aliases",
      "notes",
    ],
  },
  {
    name: "Location",
    description:
      "Normalizes INT/EXT locations with day/night attributes for scheduling handoff.",
    fields: [
      "id",
      "projectId",
      "name",
      "type",
      "attributes",
    ],
  },
  {
    name: "BeatLink",
    description:
      "Joins Story Crafter beats to scenes, enabling sync and drift detection.",
    fields: [
      "id",
      "projectId",
      "sceneId",
      "beatId",
      "status",
    ],
  },
  {
    name: "Analysis",
    description:
      "Stores validation results, timing calculations, and recommended fixes per run.",
    fields: [
      "id",
      "projectId",
      "sceneId",
      "issues",
      "timing",
      "reports",
    ],
  },
  {
    name: "Suggestion",
    description:
      "AI-generated edits or rewrite pass outputs with status tracking.",
    fields: [
      "id",
      "projectId",
      "elementId",
      "type",
      "payload",
      "status",
    ],
  },
  {
    name: "Revision",
    description:
      "Captures revision color, page locks, and metadata about distribution watermarks.",
    fields: [
      "id",
      "projectId",
      "color",
      "watermark",
      "lockedPages",
    ],
  },
  {
    name: "Snapshot",
    description:
      "Versioned copies of scripts for comparison and rollback.",
    fields: [
      "id",
      "projectId",
      "label",
      "createdAt",
      "diffAgainst",
    ],
  },
  {
    name: "ImportJob",
    description:
      "Tracks asynchronous parsing of Fountain, FDX, TXT, or Markdown uploads.",
    fields: [
      "id",
      "projectId",
      "source",
      "status",
      "error",
    ],
  },
  {
    name: "ExportJob",
    description:
      "Represents export requests with format, status, download URLs, and timestamps.",
    fields: [
      "id",
      "projectId",
      "format",
      "status",
      "downloadUrl",
      "createdAt",
    ],
  },
  {
    name: "StylePreset",
    description:
      "Stores font, margin, and pagination presets for formats and custom templates.",
    fields: [
      "id",
      "projectId",
      "basePreset",
      "overrides",
    ],
  },
  {
    name: "Report",
    description:
      "Cached breakdown exports for quick re-download without regenerating.",
    fields: [
      "id",
      "projectId",
      "type",
      "payload",
      "generatedAt",
    ],
  },
  {
    name: "Tag",
    description:
      "Flexible tagging applied to scenes, elements, props, or beats for filtering.",
    fields: [
      "id",
      "projectId",
      "scope",
      "value",
    ],
  },
];

import type {
  MemeHeroHighlight,
  MemeHeroStat,
  MemeTemplateCategory,
  MemePromptPreset,
  MemeToneOption,
  MemePromptStage,
  MemeWorkspaceMetric,
  MemeCanvasTool,
  MemePanelPreset,
  MemeBatchPreset,
  MemeExportFormat,
  MemeSafetyControl,
  MemeSafetyAlert,
  MemeIntegration,
  MemeApiEndpoint,
  MemePlanComparisonRow,
} from '../../../types/ai-meme-creator';

const clone = <T>(value: T): T =>
  typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));

const heroHighlights: MemeHeroHighlight[] = [
  {
    icon: 'fas fa-wand-magic-sparkles',
    title: 'Prompt → template pairing',
    description:
      'Drop an idea and we auto-match look-alike, copyright-safe templates with captions that honor tone sliders.',
  },
  {
    icon: 'fas fa-object-ungroup',
    title: 'Smart layout engine',
    description:
      'Speech bubbles, arrows, and multi-panel grids snap to guides with auto-contrast, stroke, and safe-zone hints.',
  },
  {
    icon: 'fas fa-shield-heart',
    title: 'Brand-safe by default',
    description:
      'Profanity filters, sensitive-topic guardrails, face blur, and watermark automation keep campaigns compliant.',
  },
];

const heroStats: MemeHeroStat[] = [
  { label: 'Memes shipped this week', value: '1,248', context: '+52% vs last sprint' },
  { label: 'Batch variants per campaign', value: '12', context: 'Median across teams' },
  { label: 'Safety rewrites auto-resolved', value: '94%', context: 'Without manual edits' },
];

const templateCategories: MemeTemplateCategory[] = [
  {
    id: 'trending',
    title: 'Trending reactions',
    description: 'Rapid-fire formats tuned for social trends with bold typography and quick punchlines.',
    tags: ['#relatable', '#launch', '#reaction'],
    templates: [
      {
        id: 'dual-choice-switch',
        name: 'Dual Choice Switch',
        ratio: '1:1',
        panels: 2,
        animated: false,
        description: 'Side-by-side approval vs. rejection grid inspired by the Drake meme, rebuilt as brand-safe art.',
        tags: ['two-panel', 'decision', 'split'],
        complexity: 'classic',
        recommendedUse: 'Perfect for “expectation vs. reality” or product comparisons.',
      },
      {
        id: 'distracted-focus',
        name: 'Distracted Focus',
        ratio: '4:5',
        panels: 1,
        animated: false,
        description: 'Foreground subject tempted by a new idea, ideal for highlighting switching triggers.',
        tags: ['single', 'character', 'reaction'],
        complexity: 'classic',
        recommendedUse: 'Use for “legacy tool vs. shiny upgrade” narratives.',
      },
      {
        id: 'panel-escalation',
        name: 'Galaxy Escalation',
        ratio: '9:16',
        panels: 4,
        animated: true,
        description: 'Vertical ladder that escalates ideas from mundane to mind-blown with animated glow pulses.',
        tags: ['multi-panel', 'vertical', 'animated'],
        complexity: 'advanced',
        recommendedUse: 'Highlight evolving insights or multi-step revelations.',
      },
    ],
  },
  {
    id: 'corporate',
    title: 'Corporate & brand mode',
    description: 'Clean layouts with ample space for logos, annotations, and CTA captions.',
    tags: ['#b2b', '#product', '#case-study'],
    templates: [
      {
        id: 'slide-commentary',
        name: 'Slide Commentary',
        ratio: '16:9',
        panels: 1,
        animated: false,
        description: 'Presentation-style frame with headline, subhead, and room for brand watermark.',
        tags: ['corporate', 'landscape', 'watermark'],
        complexity: 'classic',
        recommendedUse: 'Campaign recaps, launch stats, or webinar memes.',
      },
      {
        id: 'object-labeler',
        name: 'Object Labeler',
        ratio: '1:1',
        panels: 1,
        animated: false,
        description: 'Photo placeholder with anchored callouts for labeling product features.',
        tags: ['annotations', 'labels', 'infographic'],
        complexity: 'advanced',
        recommendedUse: 'Explain dashboards, UI screens, or product walkthroughs.',
      },
      {
        id: 'boardroom-split',
        name: 'Boardroom Split',
        ratio: '4:5',
        panels: 2,
        animated: false,
        description: 'Two-panel debate with speech bubble overlays and data callouts.',
        tags: ['two-panel', 'speech-bubble', 'debate'],
        complexity: 'advanced',
        recommendedUse: 'Show dueling stakeholder reactions or before/after metrics.',
      },
    ],
  },
  {
    id: 'comic-grid',
    title: 'Comic & multi-panel',
    description: 'Story grids from two to six panels with gutter controls and tone-friendly palettes.',
    tags: ['#series', '#story', '#multi-panel'],
    templates: [
      {
        id: 'three-beat-story',
        name: 'Three Beat Story',
        ratio: '1:1',
        panels: 3,
        animated: false,
        description: 'Square triptych with equal gutters and caption rails for sequential storytelling.',
        tags: ['three-panel', 'story', 'square'],
        complexity: 'classic',
        recommendedUse: 'Set up problem, tension, and punchline in one canvas.',
      },
      {
        id: 'timeline-arc',
        name: 'Timeline Arc',
        ratio: '16:9',
        panels: 4,
        animated: true,
        description: 'Horizontal strip with optional animated connectors and milestone labels.',
        tags: ['timeline', 'animated', 'landscape'],
        complexity: 'advanced',
        recommendedUse: 'Launch milestones, roadmap reveals, or iteration stories.',
      },
      {
        id: 'hex-panel-grid',
        name: 'Hex Panel Grid',
        ratio: '9:16',
        panels: 6,
        animated: false,
        description: 'Vertical comic wall with alternating panel sizes and accent gutters.',
        tags: ['six-panel', 'vertical', 'comic'],
        complexity: 'advanced',
        recommendedUse: 'Deep dives, educational explainers, or feature tours.',
      },
    ],
  },
];

const promptPresets: MemePromptPreset[] = [
  {
    id: 'friday-deploy',
    label: 'Deploying on Friday',
    scenario: 'When the release actually goes out on a Friday afternoon.',
    tone: 'sarcastic',
    recommendedTemplates: ['dual-choice-switch', 'panel-escalation'],
    captionIdeas: [
      'QA: “Ship it.” · PagerDuty: “Wanna see a magic trick?”',
      'Sprint board: Clear · Slack: 187 new pings · PagerDuty: “It’s showtime.”',
      'Dev: “What could go wrong?” · Prod: “Hold my YAML.”',
    ],
    context: 'Great for engineering culture posts or incident retrospectives.',
  },
  {
    id: 'marketing-hand-off',
    label: 'Marketing handoff',
    scenario: 'The moment marketing asks for “just one more variant” before launch.',
    tone: 'playful',
    recommendedTemplates: ['distracted-focus', 'three-beat-story'],
    captionIdeas: [
      'Launch plan: “Final.” · Figma file: “Final_v9_REAL.”',
      'Growth: “Can we A/B/C/D test it?” · Creative: Nervous laughter intensifies.',
      'Deck approved ✅ · 27 Slack threads later: “Tiny tweak?”',
    ],
    context: 'Use for agency collaborations or internal creative ops humor.',
  },
  {
    id: 'ai-safety',
    label: 'AI safety check',
    scenario: 'Show how the safety guardrails keep memes brand-appropriate.',
    tone: 'assuring',
    recommendedTemplates: ['object-labeler', 'boardroom-split'],
    captionIdeas: [
      'Profanity filter: “Nice try.” · Meme: Sanitized & ready.',
      'Sensitive topic guard: Flagged → Auto rewrite → Approved.',
      'Face blur toggle: On. Brand team: Breathing easy.',
    ],
    context: 'Ideal for enterprise rollouts or onboarding communications.',
  },
];

const toneOptions: MemeToneOption[] = [
  {
    id: 'wholesome',
    label: 'Wholesome',
    description: 'Optimistic captions with empathetic punchlines and no snark.',
    sliderPosition: 10,
    icon: 'fas fa-seedling',
  },
  {
    id: 'playful',
    label: 'Playful',
    description: 'Light-hearted humor with memesafe references and emoji accents.',
    sliderPosition: 35,
    icon: 'fas fa-face-grin-stars',
  },
  {
    id: 'corporate',
    label: 'Corporate',
    description: 'Compliance-first voice with jargon translation and CTA-ready copy.',
    sliderPosition: 55,
    icon: 'fas fa-briefcase',
  },
  {
    id: 'absurd',
    label: 'Absurd',
    description: 'Lean into surreal humor, unexpected metaphors, and chaotic energy.',
    sliderPosition: 75,
    icon: 'fas fa-comet',
  },
  {
    id: 'savage',
    label: 'Savage',
    description: 'Borderline roasts with brand-safe guardrails watching your back.',
    sliderPosition: 90,
    icon: 'fas fa-fire',
  },
];

const promptStages: MemePromptStage[] = [
  {
    id: 'idea',
    title: 'Capture the idea',
    description: 'Write a prompt or drop a meeting note. We pull context and keywords automatically.',
    icon: 'fas fa-lightbulb',
    actions: ['Tag the vibe (launch, fail, hype)', 'Highlight brand words to lock in', 'Attach optional reference image'],
  },
  {
    id: 'template',
    title: 'Template match',
    description: 'AI scans the library to suggest look-alike templates and panel counts.',
    icon: 'fas fa-images',
    actions: ['Filter by ratio or animation', 'Preview object labels & speech bubbles', 'Swap palette with brand preset'],
  },
  {
    id: 'captioning',
    title: 'Caption intelligence',
    description: 'Get 5-15 punchlines ranked by tone, audience, and safety confidence.',
    icon: 'fas fa-comment-dots',
    actions: ['Adjust tone slider', 'Add arrow callouts', 'Request alt punchlines on the fly'],
  },
  {
    id: 'safety',
    title: 'Safety guardrail',
    description: 'Profanity, sensitive topics, trademark scan, and face blur suggestions.',
    icon: 'fas fa-shield-check',
    actions: ['Toggle brand safety mode', 'Auto-rewrite flagged lines', 'Log rationale for audit trail'],
  },
  {
    id: 'variants',
    title: 'Batch variants',
    description: 'Spin up campaign-ready packs sized for every channel, complete with filenames and UTMs.',
    icon: 'fas fa-layer-group',
    actions: ['Choose variant count', 'Lock CTA text', 'Generate alt text + captions'],
  },
];

const workspaceMetrics: MemeWorkspaceMetric[] = [
  {
    id: 'projects',
    label: 'Active projects',
    value: '8',
    detail: '3 launch campaigns · 2 evergreen · 3 experiments',
    icon: 'fas fa-chart-simple',
    trend: '+2 this week',
  },
  {
    id: 'variants',
    label: 'Variants rendered',
    value: '64',
    detail: '18 PNG · 12 GIF · 34 MP4/WebP',
    icon: 'fas fa-clone',
    trend: 'Batch mode ×4',
  },
  {
    id: 'safetyScore',
    label: 'Safety score',
    value: '98',
    detail: 'Profanity-free · Sensitive topic cleared',
    icon: 'fas fa-shield-heart',
  },
];

const canvasTools: MemeCanvasTool[] = [
  {
    id: 'caption-stack',
    label: 'Caption stack',
    description: 'Top/bottom captions auto-size to fit with Impact/Anton fonts and stroke controls.',
    icon: 'fas fa-text-height',
    group: 'text',
    shortcuts: ['Shift + Arrow = mega nudge', 'Ctrl/Cmd + G = group layers'],
  },
  {
    id: 'speech-bubble',
    label: 'Speech bubbles',
    description: 'Directional bubbles with tail anchors and auto-contrast text.',
    icon: 'fas fa-comment',
    group: 'text',
    shortcuts: ['Ctrl/Cmd + Shift + A = auto-fit caption'],
  },
  {
    id: 'object-labels',
    label: 'Object labels',
    description: 'Drag arrows with magnetic snap to highlight product UI or chart callouts.',
    icon: 'fas fa-location-arrow',
    group: 'layout',
    shortcuts: ['Hold Shift = straight arrows'],
  },
  {
    id: 'panel-grid',
    label: 'Panel grid',
    description: '2-6 panel presets with gutter, radius, and safe-zone overlays.',
    icon: 'fas fa-grip',
    group: 'layout',
    shortcuts: ['Numbers 1-6 = add panel'],
  },
  {
    id: 'brand-palette',
    label: 'Brand palette',
    description: 'Apply saved palettes, watermarks, and fonts from Brand Presets.',
    icon: 'fas fa-palette',
    group: 'effects',
    shortcuts: ['Ctrl/Cmd + B = apply brand preset'],
  },
  {
    id: 'motion-captions',
    label: 'Motion captions',
    description: 'Animate caption entrances (fade, bounce, slide) with per-panel timing.',
    icon: 'fas fa-wave-square',
    group: 'effects',
    shortcuts: ['Ctrl/Cmd + D = duplicate layer'],
  },
  {
    id: 'safety-guard',
    label: 'Safety guard',
    description: 'Live profanity scan, face blur toggle, and trademark alerts.',
    icon: 'fas fa-user-shield',
    group: 'safety',
    shortcuts: ['Ctrl/Cmd + L = log audit note'],
  },
];

const panelPresets: MemePanelPreset[] = [
  {
    id: 'square-duo',
    name: 'Square duo',
    description: 'Balanced 1:1 grid ideal for comparisons or yes/no punchlines.',
    panels: 2,
    ratio: '1:1',
    gutters: '32px',
    animated: false,
  },
  {
    id: 'vertical-comic',
    name: 'Vertical comic',
    description: 'Tall 9:16 stack with alternating panel heights and story pacing guides.',
    panels: 4,
    ratio: '9:16',
    gutters: '24px',
    animated: true,
  },
  {
    id: 'brand-carousel',
    name: 'Brand carousel',
    description: 'Landscape 16:9 row with brand header, CTA footer, and optional animation.',
    panels: 3,
    ratio: '16:9',
    gutters: '28px',
    animated: true,
  },
];

const batchPresets: MemeBatchPreset[] = [
  {
    id: 'campaign-pack',
    label: 'Campaign pack (6 variants)',
    description: 'Square, vertical, and landscape set with auto-caption variations.',
    variants: 6,
    includes: ['PNG', 'MP4 (caption motion)', 'CSV caption sheet'],
    bestFor: 'Launch campaigns & cross-platform drops',
    plan: 'free',
  },
  {
    id: 'ab-lab',
    label: 'A/B lab (12 variants)',
    description: 'Tone dial sweeps across wholesome → savage with UTM filenames.',
    variants: 12,
    includes: ['PNG', 'WebP', 'GIF loop'],
    bestFor: 'Growth experiments & paid social tests',
    plan: 'pro',
  },
  {
    id: 'enterprise-rollout',
    label: 'Enterprise rollout (24 variants)',
    description: 'Locale-aware captions, audit log export, and bulk watermarking.',
    variants: 24,
    includes: ['PNG', 'MP4', 'ZIP bundle', 'Audit log JSON'],
    bestFor: 'Global comms & enablement teams',
    plan: 'pro',
  },
];

const exportFormats: MemeExportFormat[] = [
  {
    id: 'png-hq',
    label: 'PNG (transparent)',
    format: 'png',
    description: 'Static exports up to 2048px with optional transparent backgrounds.',
    plan: 'free',
    options: ['1x / 2x scale', 'Include watermark', 'Alt text embed'],
  },
  {
    id: 'webp-social',
    label: 'WebP (lightweight)',
    format: 'webp',
    description: 'Optimized for web & chat drops with color profile preservation.',
    plan: 'free',
    options: ['Quality slider', 'Embed metadata'],
  },
  {
    id: 'gif-loop',
    label: 'GIF loop',
    format: 'gif',
    description: 'Animated caption entrances with loop controls.',
    plan: 'pro',
    options: ['Loop count', 'Reduced motion mode'],
  },
  {
    id: 'mp4-pro',
    label: 'MP4 (caption motion)',
    format: 'mp4',
    description: '1080x1080 or 1080x1920 H.264 renders with fade/bounce sequences.',
    plan: 'pro',
    options: ['Safe-zone overlay', 'Burned-in captions', 'Audio reaction stub'],
  },
  {
    id: 'zip-bundle',
    label: 'ZIP bundle',
    format: 'zip',
    description: 'Bundle all variants with caption CSV + UTM-ready filenames.',
    plan: 'pro',
    options: ['Caption CSV', 'Audit log JSON', 'Integrations metadata'],
  },
  {
    id: 'clipboard',
    label: 'Copy to clipboard',
    format: 'clipboard',
    description: 'Instant copy for dropping memes into docs, slides, or chats.',
    plan: 'free',
    options: ['PNG', 'JPEG', 'Rich text caption'],
  },
];

const safetyControls: MemeSafetyControl[] = [
  {
    id: 'profanity-filter',
    label: 'Profanity filter',
    description: 'Blocks NSFW terms with auto-suggested rewrites based on tone.',
    icon: 'fas fa-ban',
    defaultLevel: 'free',
    settings: ['Strict', 'Moderate', 'Custom allowlist'],
  },
  {
    id: 'sensitive-guard',
    label: 'Sensitive topic guard',
    description: 'Detects flagged topics (politics, tragedy, legal) and surfaces brand-friendly rewrites.',
    icon: 'fas fa-eye-slash',
    defaultLevel: 'pro',
    settings: ['Brand policy presets', 'Escalate to reviewer', 'Auto soften tone'],
  },
  {
    id: 'face-blur',
    label: 'Face blur',
    description: 'Auto-detect faces with adjustable mosaic or gaussian blur strength.',
    icon: 'fas fa-user-secret',
    defaultLevel: 'free',
    settings: ['Gaussian', 'Pixelate', 'Manual brush'],
  },
  {
    id: 'watermark-lock',
    label: 'Watermark lock',
    description: 'Applies brand watermark with locked placement, opacity, and legal copy.',
    icon: 'fas fa-stamp',
    defaultLevel: 'pro',
    settings: ['Corner presets', 'Opacity control', 'Legal text macro'],
  },
];

const safetyAlerts: MemeSafetyAlert[] = [
  {
    id: 'tone-mismatch',
    label: 'Tone mismatch',
    severity: 'low',
    description: 'Caption tone drifts from selected slider (corporate vs. savage).',
    resolution: 'Rebalance slider or auto-tune with suggested copy.',
  },
  {
    id: 'nsfw-flag',
    label: 'NSFW flag',
    severity: 'high',
    description: 'Detected profanity or banned phrase. Export temporarily blocked.',
    resolution: 'Accept safe rewrite or mark as approved with reason.',
  },
  {
    id: 'trademark-risk',
    label: 'Trademark risk',
    severity: 'medium',
    description: 'Potential logo or brand mention without clearance.',
    resolution: 'Swap to look-alike asset or attach legal approval note.',
  },
];

const integrations: MemeIntegration[] = [
  {
    id: 'presentation-designer',
    name: 'Presentation Designer',
    description: 'Send memes straight to slide layouts with caption notes and alt text.',
    href: '/presentation-designer',
    icon: 'fas fa-person-chalkboard',
    actionLabel: 'Push to slides',
  },
  {
    id: 'ad-copy-assistant',
    name: 'Ad Copy Assistant',
    description: 'Reuse winning hooks to generate paid social copy variants instantly.',
    href: '/ad-copy-assistant',
    icon: 'fas fa-bullhorn',
    actionLabel: 'Sync hooks',
  },
  {
    id: 'social-caption-generator',
    name: 'Social Caption Generator',
    description: 'Export captions + hashtags aligned with meme tone and channel.',
    href: '/social-caption-generator',
    icon: 'fas fa-hashtag',
    actionLabel: 'Draft captions',
  },
];

const apiEndpoints: MemeApiEndpoint[] = [
  { method: 'POST', path: '/meme/api/project/create', description: 'Create MemeProject with default panels, brand mode, and audit log entry.' },
  { method: 'GET', path: '/meme/api/project', description: 'Fetch project with templates, layers, captions, and render status.' },
  { method: 'POST', path: '/meme/api/suggest', description: 'Prompt-to-template pairing with ranked caption ideas and tone analysis.' },
  { method: 'POST', path: '/meme/api/panel/add', description: 'Add or reflow panels with gutter + safe zone recalculation.' },
  { method: 'POST', path: '/meme/api/layer/update', description: 'Update text, sticker, or annotation layers with auto-fit instructions.' },
  { method: 'POST', path: '/meme/api/safety/check', description: 'Run profanity, sensitive topic, and trademark heuristics.' },
  { method: 'POST', path: '/meme/api/render', description: 'Trigger static render in PNG/WebP with watermark + alt text output.' },
  { method: 'POST', path: '/meme/api/animate', description: 'Request animated caption render for GIF/MP4 exports.' },
  { method: 'POST', path: '/meme/api/export', description: 'Bundle exports (PNG, GIF, MP4, ZIP) and return download URLs.' },
];

const planComparison: MemePlanComparisonRow[] = [
  {
    id: 'projects',
    feature: 'Projects',
    icon: 'fas fa-folder-tree',
    free: 'Up to 5 active MemeProjects',
    pro: 'Unlimited projects & archives',
  },
  {
    id: 'panels',
    feature: 'Multi-panel',
    icon: 'fas fa-table-cells-large',
    free: 'Up to 3 panels · static exports',
    pro: 'Up to 6 panels · animated grids',
  },
  {
    id: 'batch',
    feature: 'Batch variants',
    icon: 'fas fa-layer-group',
    free: '3 variants/run · PNG/WebP',
    pro: '30 variants/run · PNG/WebP/GIF/MP4',
  },
  {
    id: 'safety',
    feature: 'Safety & compliance',
    icon: 'fas fa-user-shield',
    free: 'Profanity filter · Face blur',
    pro: 'Sensitive guard · Watermark lock · Audit log',
  },
  {
    id: 'exports',
    feature: 'Exports',
    icon: 'fas fa-file-export',
    free: 'PNG, WebP, clipboard',
    pro: 'PNG, WebP, GIF, MP4, ZIP bundle',
  },
  {
    id: 'integrations',
    feature: 'Integrations',
    icon: 'fas fa-plug',
    free: 'Manual copy/paste handoff',
    pro: '1-click push to Ansiversa apps',
  },
  {
    id: 'history',
    feature: 'History retention',
    icon: 'fas fa-clock-rotate-left',
    free: '30-day version history',
    pro: 'Unlimited history with audit notes',
  },
];

export const getHeroHighlights = () => clone(heroHighlights);
export const getHeroStats = () => clone(heroStats);
export const getTemplateCategories = () => clone(templateCategories);
export const getPromptPresets = () => clone(promptPresets);
export const getToneOptions = () => clone(toneOptions);
export const getPromptStages = () => clone(promptStages);
export const getWorkspaceMetrics = () => clone(workspaceMetrics);
export const getCanvasTools = () => clone(canvasTools);
export const getPanelPresets = () => clone(panelPresets);
export const getBatchPresets = () => clone(batchPresets);
export const getExportFormats = () => clone(exportFormats);
export const getSafetyControls = () => clone(safetyControls);
export const getSafetyAlerts = () => clone(safetyAlerts);
export const getIntegrations = () => clone(integrations);
export const getApiEndpoints = () => clone(apiEndpoints);
export const getPlanComparison = () => clone(planComparison);

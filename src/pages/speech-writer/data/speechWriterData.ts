import { clone } from '../../../utils/clone';

export type HeroHighlight = {
  icon: string;
  label: string;
  blurb: string;
};

export type SpeechTemplate = {
  id: string;
  name: string;
  occasion: string;
  targetMinutes: number;
  targetWpm: number;
  language: string;
  tone: string;
  highlight: string;
  outline: Array<{ title: string; bullets: string[] }>;
  cues: string[];
  quoteSuggestions: Array<{ text: string; author: string; year?: number; source?: string }>;
};

export type WorkflowStage = {
  id: string;
  label: string;
  summary: string;
  status: 'pending' | 'active' | 'complete';
  actions: string[];
  apiEndpoint: string;
};

export type WorkspaceTab = {
  id: string;
  label: string;
  summary: string;
  panels: Array<{
    title: string;
    bullets: string[];
    accent: string;
  }>;
};

export type RhetoricToggle = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
};

export type PracticeTool = {
  id: string;
  label: string;
  description: string;
  metrics: string[];
};

export type TeleprompterPreset = {
  id: string;
  label: string;
  description: string;
  fontSize: string;
  lineHeight: string;
  scrollSpeed: string;
  highlight: string;
};

export type QuoteCollection = {
  id: string;
  topic: string;
  description: string;
  quotes: Array<{ id: string; text: string; author: string; year?: number; source?: string }>;
};

export type ExportPreset = {
  id: string;
  label: string;
  description: string;
  format: 'md' | 'docx' | 'pdf' | 'txt';
  includes: string[];
};

export type PlanComparisonRow = {
  feature: string;
  free: string;
  pro: string;
};

export type DataModelEntity = {
  name: string;
  fields: string[];
  notes?: string;
};

export type IntegrationCard = {
  id: string;
  name: string;
  icon: string;
  description: string;
  actions: string[];
  status: string;
};

const heroHighlightSource: HeroHighlight[] = [
  {
    icon: 'fas fa-person-rays',
    label: 'Audience-calibrated briefs',
    blurb: 'Purpose, audience, cultural notes, and constraints flow straight into every outline.',
  },
  {
    icon: 'fas fa-stopwatch',
    label: 'Time-accurate drafting',
    blurb: 'Word counts adjust to target minutes with live pause budgeting and pace recommendations.',
  },
  {
    icon: 'fas fa-quote-left',
    label: 'Source-backed rhetoric',
    blurb: 'Quote, stat, and story slots maintain attribution for trustworthy storytelling.',
  },
  {
    icon: 'fas fa-forward',
    label: 'Teleprompter rehearsal',
    blurb: 'Practice logs, filler checks, and mirror mode make delivery rehearsal effortless.',
  },
];

const templateSource: SpeechTemplate[] = [
  {
    id: 'product-keynote',
    name: 'Product Launch Keynote',
    occasion: 'Keynote · 18 minutes',
    targetMinutes: 18,
    targetWpm: 140,
    language: 'English',
    tone: 'Visionary + grounded proof',
    highlight: 'Launch crescendo with live demo cueing and social proof hooks.',
    outline: [
      {
        title: 'Cold open hook',
        bullets: [
          'Short origin story that anchors the mission',
          'Contrasting stat to reveal the gap',
          'Promise statement tied to audience aspiration',
        ],
      },
      {
        title: 'Thesis & pillars',
        bullets: [
          'Name the product positioning clearly',
          'Three pillars with supporting proof points',
          'Audience-specific win stories and metrics',
        ],
      },
      {
        title: 'Demo & proof',
        bullets: [
          'Live demo cue with [SLIDE ▌] markers',
          'Customer quote with attribution + logo',
          'Roadmap teaser with call-back to hook',
        ],
      },
      {
        title: 'Close & CTA',
        bullets: [
          'Echo original promise with stronger stakes',
          'Call-to-action for signups and social amplification',
          'Quote to inspire action with inline citation stub',
        ],
      },
    ],
    cues: ['[APPLAUSE] after reveal', '[PAUSE 3s] for demo reset', '[SLIDE ▌] Product architecture'],
    quoteSuggestions: [
      {
        text: 'The future depends on what you do today.',
        author: 'Mahatma Gandhi',
        year: 1947,
        source: 'Speech to AICC',
      },
      {
        text: 'Innovation distinguishes between a leader and a follower.',
        author: 'Steve Jobs',
        year: 1997,
        source: 'BusinessWeek',
      },
    ],
  },
  {
    id: 'wedding-toast',
    name: 'Wedding Toast',
    occasion: 'Reception · 5 minutes',
    targetMinutes: 5,
    targetWpm: 125,
    language: 'English + Tamil greeting',
    tone: 'Warm, playful, heartfelt',
    highlight: 'Bilingual welcome and personal story slot with gentle humor pacing.',
    outline: [
      {
        title: 'Greeting & hook',
        bullets: [
          'Open with Tamil welcome for family inclusivity',
          'Share how you met the couple using the rule-of-three',
        ],
      },
      {
        title: 'Stories & values',
        bullets: [
          'Two mini-stories highlighting their partnership',
          'Compliment their shared values with callbacks',
        ],
      },
      {
        title: 'Blessing & toast',
        bullets: [
          'Quote from beloved elder with attribution',
          'Invite audience to raise a glass with [PAUSE 2s]',
        ],
      },
    ],
    cues: ['[PAUSE 2s] after laughter', 'Teleprompter mirror mode recommended', 'Insert [APPLAUSE] before toast'],
    quoteSuggestions: [
      {
        text: 'Love recognizes no barriers. It jumps hurdles, leaps fences, penetrates walls to arrive at its destination full of hope.',
        author: 'Maya Angelou',
        source: 'Essays',
      },
      {
        text: 'Where there is love there is life.',
        author: 'Mahatma Gandhi',
        source: 'Collected Works',
      },
    ],
  },
  {
    id: 'investor-pitch',
    name: 'Investor Pitch',
    occasion: 'Seed round · 10 minutes',
    targetMinutes: 10,
    targetWpm: 150,
    language: 'English',
    tone: 'Confident, data-backed, concise',
    highlight: 'Objection handling lane and runway math keep Q&A crisp.',
    outline: [
      {
        title: 'Problem framing',
        bullets: [
          'Data-backed pain point establishing TAM',
          'Personal story establishing founder-market fit',
        ],
      },
      {
        title: 'Solution & traction',
        bullets: [
          'Product snapshot with hook stats',
          'Revenue, retention, and growth metric chips',
        ],
      },
      {
        title: 'Moat & plan',
        bullets: [
          'Competitive map with contrast pairs',
          '18-month roadmap with hiring plan',
        ],
      },
      {
        title: 'Ask & CTA',
        bullets: [
          'Funding ask with use of proceeds pie',
          'Invite investors to deeper diligence session',
        ],
      },
    ],
    cues: ['[SLIDE ▌] Market overview', 'Insert [PAUSE 4s] pre-ask for emphasis', 'Highlight filler detector for rehearsals'],
    quoteSuggestions: [
      {
        text: 'The best way to predict the future is to create it.',
        author: 'Peter Drucker',
        source: 'Management: Tasks, Responsibilities, Practices',
        year: 1973,
      },
      {
        text: 'Nothing great in the world has ever been accomplished without passion.',
        author: 'Georg Hegel',
      },
    ],
  },
  {
    id: 'graduation-address',
    name: 'Graduation Address',
    occasion: 'Commencement · 12 minutes',
    targetMinutes: 12,
    targetWpm: 135,
    language: 'English + Spanish quote',
    tone: 'Motivational, inclusive, hopeful',
    highlight: 'Anaphora toggles and bilingual quotes reinforce the send-off.',
    outline: [
      {
        title: 'Opening reflection',
        bullets: [
          'Present-tense moment to ground the audience',
          'Acknowledgement of faculty, families, support staff',
        ],
      },
      {
        title: 'Story beats',
        bullets: [
          'Two turning points from the cohort journey',
          'Lesson extracted using rule-of-three repetition',
        ],
      },
      {
        title: 'Forward vision',
        bullets: [
          'Quote in Spanish with translation for inclusivity',
          'Challenge to act with purpose and kindness',
        ],
      },
      {
        title: 'Close',
        bullets: [
          'Callback to opening reflection',
          'CTA to celebrate each other loudly',
        ],
      },
    ],
    cues: ['[PAUSE 3s] after acknowledgement', 'Highlight inclusive language suggestions', 'Auto-scroll at 135 WPM'],
    quoteSuggestions: [
      {
        text: 'El futuro pertenece a quienes creen en la belleza de sus sueños.',
        author: 'Eleanor Roosevelt',
        source: 'Speech at Conn. College',
      },
      {
        text: 'Education is the most powerful weapon which you can use to change the world.',
        author: 'Nelson Mandela',
        year: 1990,
      },
    ],
  },
];

const workflowStageSource: WorkflowStage[] = [
  {
    id: 'brief',
    label: 'Brief intake',
    summary: 'Audience, purpose, constraints, and pacing profile captured in /speech/new.',
    status: 'active',
    actions: [
      'Collect purpose, tone, target minutes, and language preferences.',
      'Capture banned phrases and compliance notes.',
      'Set target WPM profile and pause budget per section.',
    ],
    apiEndpoint: 'POST /speech/api/project/create',
  },
  {
    id: 'outline',
    label: 'Outline generation',
    summary: 'Structured sections with hook, context, points, objections, CTA, and close.',
    status: 'pending',
    actions: [
      'Call /speech/api/outline/generate with brief metadata.',
      'Return section cards with estimated word counts and cue suggestions.',
      'Allow manual edits and lock timings before drafting.',
    ],
    apiEndpoint: 'POST /speech/api/outline/generate',
  },
  {
    id: 'draft',
    label: 'Draft writing',
    summary: 'Full prose with rhetorical toggles, quote insertion, and inclusive language pass.',
    status: 'pending',
    actions: [
      'Transform outline into paragraphs matched to pacing goals.',
      'Insert rhetorical devices (rule-of-three, callbacks, metaphors).',
      'Highlight claims needing verification and provide quote stubs.',
    ],
    apiEndpoint: 'POST /speech/api/draft/generate',
  },
  {
    id: 'practice',
    label: 'Practice & rehearsal',
    summary: 'Timing runs, filler word logging, and teleprompter prep.',
    status: 'pending',
    actions: [
      'Use /speech/api/cues/insert to add pause and slide markers.',
      'Log practice runs with /speech/api/practice/log including WPM + filler counts.',
      'Recommend trims or expansions to stay within ±5% of target duration.',
    ],
    apiEndpoint: 'POST /speech/api/practice/log',
  },
  {
    id: 'teleprompter',
    label: 'Teleprompter & export',
    summary: 'Prepare mirror-ready scroll, DOCX/PDF exports, and slide bullets.',
    status: 'pending',
    actions: [
      'Generate teleprompter script via /speech/api/teleprompter/prepare.',
      'Bundle exports through /speech/api/export with md/docx/pdf/txt.',
      'Push slide bullets to Presentation Designer via /speech/api/presentation/push.',
    ],
    apiEndpoint: 'POST /speech/api/teleprompter/prepare',
  },
];

const workspaceTabSource: WorkspaceTab[] = [
  {
    id: 'outline',
    label: 'Outline',
    summary: 'Refine structure, pacing, and rhetorical slots before drafting.',
    panels: [
      {
        title: 'Section tree',
        bullets: [
          'Drag to reorder Hook → Points → CTA blocks with timing chips.',
          'Lock sections to prevent AI overwriting during rewrites.',
          'Add proof assets and quote placeholders per section.',
        ],
        accent: 'from-indigo-500/40 via-slate-900 to-slate-950',
      },
      {
        title: 'Pacing meter',
        bullets: [
          'Displays estimated words and minutes for each section.',
          'Pause budget slider keeps total within ±5% of target time.',
          'Alerts when transitions exceed filler thresholds.',
        ],
        accent: 'from-emerald-500/30 via-indigo-500/20 to-transparent',
      },
    ],
  },
  {
    id: 'draft',
    label: 'Draft',
    summary: 'Compose full speech with inline device toggles and inclusive language prompts.',
    panels: [
      {
        title: 'Rhetorical assistant',
        bullets: [
          'Toggle anaphora, callbacks, metaphors, and statistics inline.',
          'Highlight claims needing citations or brand approval.',
          'One-click rewrite passes: tighten, soften, energise, localise.',
        ],
        accent: 'from-purple-500/30 via-sky-500/30 to-slate-950',
      },
      {
        title: 'Source manager',
        bullets: [
          'Attach quotes with author, source, and year metadata.',
          'Track stat provenance with inline citation stubs.',
          'Run originality scan summary with flagged segments.',
        ],
        accent: 'from-rose-500/20 via-indigo-500/20 to-slate-950',
      },
    ],
  },
  {
    id: 'practice',
    label: 'Practice',
    summary: 'Log rehearsal runs, detect filler words, and compare pacing to goal.',
    panels: [
      {
        title: 'Run tracker',
        bullets: [
          'Record manual timing with auto WPM calculations.',
          'Tag runs with location (desk, stage, rehearsal hall).',
          'Filler counter suggestions for “um”, “uh”, “like”, custom list.',
        ],
        accent: 'from-amber-500/20 via-emerald-500/20 to-slate-950',
      },
      {
        title: 'Feedback coach',
        bullets: [
          'Suggests sections to trim or expand based on run variance.',
          'Flags energy dip moments for story or call-to-action boosts.',
          'Generates applause and pause cues per run analytics.',
        ],
        accent: 'from-sky-500/20 via-indigo-500/20 to-slate-950',
      },
    ],
  },
  {
    id: 'teleprompter',
    label: 'Teleprompter',
    summary: 'Mirror mode, auto-scroll, and contrast controls for stage delivery.',
    panels: [
      {
        title: 'Scroll settings',
        bullets: [
          'Set WPM-based auto-scroll with tap-to-pause shortcuts.',
          'Mirror flip for podium glass with adjustable margins.',
          'Stage lighting presets: dark theatre, bright hall, hybrid.',
        ],
        accent: 'from-slate-900 via-indigo-600 to-slate-900',
      },
      {
        title: 'Cue overlays',
        bullets: [
          'Inline chips for [PAUSE], [APPLAUSE], and [SLIDE ▌].',
          'Countdown timer with haptic-ready prompts.',
          'Confidence monitor for summary bullets on secondary screen.',
        ],
        accent: 'from-emerald-500/20 via-purple-500/30 to-slate-950',
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    summary: 'Default voice, banned phrases, compliance notes, and sharing controls.',
    panels: [
      {
        title: 'Voice & tone profiles',
        bullets: [
          'Store multiple personas with tone descriptors and sample paragraphs.',
          'Upload pronunciation notes and phonetic spellings.',
          'Set preferred rhetorical devices per persona.',
        ],
        accent: 'from-indigo-500/20 via-slate-800/60 to-slate-950',
      },
      {
        title: 'Collaboration & safety',
        bullets: [
          'Invite reviewers with comment-only or edit rights.',
          'Enable inclusive language guardrails and sensitivity flags.',
          'Export audit logs for compliance review.',
        ],
        accent: 'from-rose-500/10 via-emerald-500/10 to-slate-950',
      },
    ],
  },
];

const rhetoricToggleSource: RhetoricToggle[] = [
  {
    id: 'rule-of-three',
    label: 'Rule of three',
    description: 'Creates rhythmic triads for key points and closing sentences.',
    enabled: true,
  },
  {
    id: 'callback',
    label: 'Callbacks',
    description: 'Echo earlier hooks or anecdotes near the close for resonance.',
    enabled: true,
  },
  {
    id: 'anaphora',
    label: 'Anaphora',
    description: 'Repeats opening phrases to build momentum and emphasis.',
    enabled: false,
  },
  {
    id: 'metaphor',
    label: 'Metaphors',
    description: 'Suggests analogies aligned with audience expertise level.',
    enabled: true,
  },
  {
    id: 'statistics',
    label: 'Statistics',
    description: 'Recommends data-backed lines with citation placeholders.',
    enabled: false,
  },
];

const practiceToolSource: PracticeTool[] = [
  {
    id: 'timing-meter',
    label: 'Timing meter',
    description: 'Live pace gauge compares spoken WPM against target range.',
    metrics: ['Current WPM', 'Projected overrun/underrun', 'Pause utilisation'],
  },
  {
    id: 'filler-detector',
    label: 'Filler detector',
    description: 'Manual or assisted logging of filler words with reduction tips.',
    metrics: ['Filler per minute', 'Top filler words', 'Suggested replacements'],
  },
  {
    id: 'confidence-tracker',
    label: 'Confidence tracker',
    description: 'Self-rated confidence and energy levels per section.',
    metrics: ['Energy score', 'Audience response notes', 'CTA clarity'],
  },
];

const teleprompterPresetSource: TeleprompterPreset[] = [
  {
    id: 'premiere-stage',
    label: 'Premiere stage',
    description: 'High-contrast dark mode with large typography for spotlight stages.',
    fontSize: 'XL (32px)',
    lineHeight: '1.8',
    scrollSpeed: 'Auto (target WPM)',
    highlight: 'Great for keynote auditoriums with bright lights.',
  },
  {
    id: 'studio-glass',
    label: 'Studio glass',
    description: 'Mirror-flipped output tuned for teleprompter glass and studio lighting.',
    fontSize: 'L (28px)',
    lineHeight: '1.6',
    scrollSpeed: 'Manual tap tempo',
    highlight: 'Use when a producer controls scroll speed off-stage.',
  },
  {
    id: 'workshop-daylight',
    label: 'Workshop daylight',
    description: 'Bright background with bold text for conference rooms and workshops.',
    fontSize: 'M (24px)',
    lineHeight: '1.5',
    scrollSpeed: 'Adaptive ±10%',
    highlight: 'Best for interactive sessions with frequent pauses.',
  },
];

const quoteCollectionSource: QuoteCollection[] = [
  {
    id: 'inspiration',
    topic: 'Inspiration & leadership',
    description: 'Motivational quotes with strong attribution for keynotes and graduations.',
    quotes: [
      {
        id: 'angelou-hope',
        text: 'You can’t use up creativity. The more you use, the more you have.',
        author: 'Maya Angelou',
        source: 'Conversations with Maya Angelou',
      },
      {
        id: 'roosevelt-courage',
        text: 'Do what you can, with what you have, where you are.',
        author: 'Theodore Roosevelt',
        year: 1901,
      },
      {
        id: 'malala-voice',
        text: 'Raise your words, not voice. It is rain that grows flowers, not thunder.',
        author: 'Rumi',
      },
    ],
  },
  {
    id: 'innovation',
    topic: 'Innovation & change',
    description: 'Quotes suited for product launches, pitches, and transformation talks.',
    quotes: [
      {
        id: 'jobs-innovation',
        text: 'Innovation is saying no to a thousand things.',
        author: 'Steve Jobs',
        year: 1997,
        source: 'WWDC Fireside',
      },
      {
        id: 'bell-lab',
        text: 'The most dangerous phrase in the language is, "We’ve always done it this way."',
        author: 'Grace Hopper',
        source: 'Navy Technology Lecture',
      },
      {
        id: 'dylan-times',
        text: 'For the times they are a-changin’.',
        author: 'Bob Dylan',
        year: 1964,
      },
    ],
  },
  {
    id: 'ceremony',
    topic: 'Ceremony & gratitude',
    description: 'Warm sentiments for weddings, awards, and appreciation moments.',
    quotes: [
      {
        id: 'atticus-love',
        text: 'Love her but leave her wild.',
        author: 'Atticus',
      },
      {
        id: 'tagore-light',
        text: 'Faith is the bird that feels the light and sings when the dawn is still dark.',
        author: 'Rabindranath Tagore',
      },
      {
        id: 'angelou-grateful',
        text: 'This is a wonderful day, I have never seen this one before.',
        author: 'Maya Angelou',
      },
    ],
  },
];

const exportPresetSource: ExportPreset[] = [
  {
    id: 'markdown',
    label: 'Markdown workspace',
    description: 'Outline + draft in portable Markdown with cue annotations.',
    format: 'md',
    includes: ['Outline headings', 'Cue chips as inline shortcodes', 'Practice summary table'],
  },
  {
    id: 'teleprompter',
    label: 'Teleprompter TXT',
    description: 'Plain text with scroll markers, pause cues, and mirrored option metadata.',
    format: 'txt',
    includes: ['All cues', 'Scroll settings snapshot', 'Pause budget totals'],
  },
  {
    id: 'docx',
    label: 'DOCX handout',
    description: 'Formatted document with speaker notes and inline citations.',
    format: 'docx',
    includes: ['Cover page', 'Section headers with timings', 'Quote appendix'],
  },
  {
    id: 'pdf',
    label: 'Stage PDF',
    description: 'High-contrast teleprompter export ready for stage tablets.',
    format: 'pdf',
    includes: ['Mirror mode option', 'Large-type layout', 'Practice run overlay'],
  },
];

const planComparisonSource: PlanComparisonRow[] = [
  {
    feature: 'Active projects',
    free: 'Up to 3 active speeches',
    pro: 'Unlimited projects with archive history',
  },
  {
    feature: 'Length targeting',
    free: 'Up to 8 minutes · single language',
    pro: 'Up to 30 minutes · multilingual & bilingual output',
  },
  {
    feature: 'Teleprompter',
    free: 'Manual scroll, light/dark themes',
    pro: 'Auto-scroll, mirror mode, rehearsal analytics',
  },
  {
    feature: 'Quotes database',
    free: 'Core library with attribution',
    pro: 'Extended library + era filters + source URLs',
  },
  {
    feature: 'Exports',
    free: 'Markdown + Teleprompter TXT',
    pro: 'DOCX, PDF, Slide bullets to Presentation Designer',
  },
  {
    feature: 'Practice history',
    free: 'Last 60 days retained',
    pro: 'Unlimited history with trends and coaching tips',
  },
];

const dataModelSource: DataModelEntity[] = [
  {
    name: 'SpeechProject',
    fields: ['id', 'userId', 'title', 'occasion', 'language', 'targetMinutes', 'wpm', 'pauseBudgetSec', 'status', 'createdAt', 'updatedAt'],
    notes: 'Status transitions: brief → outlined → drafted → rehearsed → final.',
  },
  {
    name: 'Brief',
    fields: ['id', 'projectId', 'audience', 'purpose', 'tone', 'keyPoints', 'mustInclude', 'constraints', 'notes'],
    notes: 'Audience stored as structured JSON for expertise, familiarity, size, and region.',
  },
  {
    name: 'Outline',
    fields: ['id', 'projectId', 'sections', 'estimatedWords'],
  },
  {
    name: 'Section',
    fields: ['id', 'projectId', 'type', 'title', 'content', 'order', 'minutes', 'cues'],
  },
  {
    name: 'Draft',
    fields: ['id', 'projectId', 'content', 'words', 'wpm', 'estimatedMinutes', 'flags'],
  },
  {
    name: 'Cue',
    fields: ['id', 'projectId', 'kind', 'offsetWord', 'payload'],
  },
  {
    name: 'Quote',
    fields: ['id', 'projectId', 'text', 'author', 'source', 'year', 'url', 'tags'],
  },
  {
    name: 'Source',
    fields: ['id', 'projectId', 'type', 'meta'],
  },
  {
    name: 'PracticeLog',
    fields: ['id', 'projectId', 'durationSec', 'wpm', 'fillerCounts', 'notes', 'createdAt'],
  },
  {
    name: 'ExportJob',
    fields: ['id', 'projectId', 'format', 'options', 'status', 'url', 'createdAt'],
  },
  {
    name: 'Tag',
    fields: ['id', 'name', 'color'],
  },
];

const integrationSource: IntegrationCard[] = [
  {
    id: 'presentation-designer',
    name: 'Presentation Designer',
    icon: 'fas fa-display',
    description: 'Send slide bullets, CTA summaries, and pacing notes to deck builders instantly.',
    actions: ['Push outline as slide agenda', 'Sync CTA + metrics into key slides', 'Maintain shared speaker notes across tools'],
    status: 'Live',
  },
  {
    id: 'creative-title-maker',
    name: 'Creative Title Maker',
    icon: 'fas fa-highlighter',
    description: 'Generate headline-worthy titles, taglines, and email subject lines for your speech.',
    actions: ['One-click title generator', 'Tagline + teaser copy sync for marketing', 'Variant testing suggestions'],
    status: 'Live',
  },
  {
    id: 'meeting-minutes',
    name: 'Meeting Minutes AI',
    icon: 'fas fa-clipboard-list',
    description: 'Reuse meeting decisions and action items inside speeches for stakeholder updates.',
    actions: ['Import approved talking points', 'Link follow-up tasks post-speech', 'Export accountability summaries back to minutes'],
    status: 'Beta',
  },
];

const initialStatusFeedSource = [
  'Outline templates warmed up for quick drafting.',
  'Teleprompter presets synced from your last project.',
  'Quote collections curated by tone and audience readiness.',
];

export const getHeroHighlights = (): HeroHighlight[] => clone(heroHighlightSource);
export const getTemplates = (): SpeechTemplate[] => clone(templateSource);
export const getWorkflowStages = (): WorkflowStage[] => clone(workflowStageSource);
export const getWorkspaceTabs = (): WorkspaceTab[] => clone(workspaceTabSource);
export const getRhetoricToggles = (): RhetoricToggle[] => clone(rhetoricToggleSource);
export const getPracticeTools = (): PracticeTool[] => clone(practiceToolSource);
export const getTeleprompterPresets = (): TeleprompterPreset[] => clone(teleprompterPresetSource);
export const getQuoteCollections = (): QuoteCollection[] => clone(quoteCollectionSource);
export const getExportPresets = (): ExportPreset[] => clone(exportPresetSource);
export const getPlanComparison = (): PlanComparisonRow[] => clone(planComparisonSource);
export const getDataModel = (): DataModelEntity[] => clone(dataModelSource);
export const getIntegrations = (): IntegrationCard[] => clone(integrationSource);
export const getInitialStatusFeed = (): string[] => clone(initialStatusFeedSource);

import type {
  TitleAssetType,
  TitleBriefKnob,
  TitleBundle,
  TitleIntegrationCard,
  TitleLocalizationSample,
  TitlePlanLimits,
  TitleScoreExplainer,
  TitleThemeBucket,
  TitleVariant,
  TitleWorkspaceMetric,
  TitleExportPreset,
  TitleApiEndpoint,
} from '../../../types/creative-title-maker';

const clone = <T>(value: T): T =>
  typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));

const heroHighlights = [
  {
    icon: 'fas fa-bolt',
    title: 'Brief to 50+ variants',
    description: 'Generate channel-specific headline packs with tone, POV, keyword, and device controls in seconds.',
  },
  {
    icon: 'fas fa-magnifying-glass-chart',
    title: 'SEO guardrails',
    description: 'Primary keyword placement, SERP preview, slug helper, and warning flags for over-promises.',
  },
  {
    icon: 'fas fa-globe',
    title: 'Localization aware',
    description: 'Translate, adapt cultural references, and preserve brand glossary terms across locales.',
  },
];

const heroStats = [
  { label: 'Titles generated this week', value: '486', trend: '+38% vs last week' },
  { label: 'Average approval score', value: '91', trend: 'Brand-fit weighted' },
  { label: 'Locales supported today', value: '18', trend: 'Auto-adapted packs' },
];

const briefKnobs: TitleBriefKnob[] = [
  {
    id: 'asset-type',
    label: 'Asset type presets',
    description: 'Keep platform-specific length, cadence, and tone defaults ready for each channel.',
    type: 'select',
    icon: 'fas fa-rectangle-ad',
  },
  {
    id: 'tone',
    label: 'Tone & POV',
    description: 'Lock brand personality and point-of-view before generation to maintain voice.',
    type: 'select',
    icon: 'fas fa-pen-nib',
  },
  {
    id: 'devices',
    label: 'Stylistic devices',
    description: 'Toggle numerals, rhyme, alliteration, colon splits, question hooks, and more.',
    type: 'chips',
    icon: 'fas fa-sparkles',
  },
  {
    id: 'seo',
    label: 'SEO placement',
    description: 'Ensure the primary keyword lands within 60 characters and monitor SERP preview live.',
    type: 'toggle',
    icon: 'fas fa-chart-line',
  },
  {
    id: 'syllables',
    label: 'Syllables & readability',
    description: 'Balance cadence with grade-level guardrails for email, video, or long-form titles.',
    type: 'slider',
    icon: 'fas fa-wave-square',
  },
];

const assetTypes: { id: TitleAssetType; label: string; hint: string }[] = [
  { id: 'article', label: 'Article / Blog', hint: '800-1200 words, clarity-first' },
  { id: 'video', label: 'YouTube / Video', hint: 'High CTR, 100 char soft cap' },
  { id: 'short', label: 'Short / Reel', hint: 'Punchy hooks, emoji optional' },
  { id: 'podcast', label: 'Podcast episode', hint: 'Narrative with guest highlight' },
  { id: 'book', label: 'Book / Ebook', hint: 'Series cohesion, evergreen' },
  { id: 'course', label: 'Course / Module', hint: 'Outcome-driven, numbered' },
  { id: 'landingPage', label: 'Landing page', hint: 'Hero + conversion focus' },
  { id: 'email', label: 'Email subject', hint: '≤60 characters, anti-spam' },
  { id: 'ad', label: 'Ad headline', hint: 'Platform-specific comps' },
];

const toneOptions = [
  { id: 'professional', label: 'Professional', description: 'Trustworthy, polished, B2B friendly.' },
  { id: 'playful', label: 'Playful', description: 'Energetic, brand-forward copy.' },
  { id: 'bold', label: 'Bold', description: 'High-impact statements with strong verbs.' },
  { id: 'sincere', label: 'Sincere', description: 'Warm, empathetic voice for community updates.' },
  { id: 'confident', label: 'Confident', description: 'Authority-building phrasing with proof points.' },
];

const povOptions = [
  { id: 'you', label: 'You-focused', description: 'Directly addresses the reader or viewer.' },
  { id: 'we', label: 'We-focused', description: 'Collaborative tone for teams and partners.' },
  { id: 'brand', label: 'Brand voice', description: 'First-person brand statements and announcements.' },
];

const styleDeviceOptions = [
  { id: 'numeral', label: 'Numeral power', icon: 'fas fa-list-ol' },
  { id: 'alliteration', label: 'Alliteration', icon: 'fas fa-feather-pointed' },
  { id: 'rhyme', label: 'Rhyme & cadence', icon: 'fas fa-music' },
  { id: 'pun', label: 'Wordplay & pun', icon: 'fas fa-face-laugh-beam' },
  { id: 'colon', label: 'Colon split', icon: 'fas fa-ellipsis' },
  { id: 'question', label: 'Question hook', icon: 'fas fa-question' },
  { id: 'command', label: 'Command hook', icon: 'fas fa-bullhorn' },
  { id: 'proof', label: 'Proof & numbers', icon: 'fas fa-chart-column' },
  { id: 'emoji', label: 'Emoji accent (shorts)', icon: 'fas fa-face-smile' },
];

const themeBuckets: TitleThemeBucket[] = [
  { id: 'benefit', label: 'Benefit-led', description: 'Lead with the strongest value promise.', icon: 'fas fa-gem' },
  { id: 'curiosity', label: 'Curiosity gap', description: 'Hint at transformation to spark clicks.', icon: 'fas fa-lightbulb' },
  { id: 'contrarian', label: 'Contrarian', description: 'Challenge assumptions to stand out.', icon: 'fas fa-bolt-lightning' },
  { id: 'social', label: 'Social proof', description: 'Lean on community, reviews, and stats.', icon: 'fas fa-users' },
  { id: 'proof', label: 'Evidence-based', description: 'Case studies and data-forward lines.', icon: 'fas fa-chart-line' },
  { id: 'howto', label: 'How-to / Tutorial', description: 'Step-by-step outcomes or guides.', icon: 'fas fa-list-check' },
  { id: 'listicle', label: 'Listicle', description: 'Numbered or ranked reveal structure.', icon: 'fas fa-list-ul' },
  { id: 'timely', label: 'Timely / News', description: 'Anchored to a launch or trend.', icon: 'fas fa-clock' },
];

const workspaceMetrics: TitleWorkspaceMetric[] = [
  {
    id: 'projects',
    label: 'Active projects',
    value: '12',
    detail: '3 launch pads, 4 evergreen, 5 experiments',
    icon: 'fas fa-briefcase',
    trend: '+2 this week',
  },
  {
    id: 'variants',
    label: 'Variants generated',
    value: '182',
    detail: '60% bucket coverage · 18 locales',
    icon: 'fas fa-wand-magic-sparkles',
    trend: '15 in last session',
  },
  {
    id: 'reuse',
    label: 'Reuse rate',
    value: '68%',
    detail: 'Added to library or shipped',
    icon: 'fas fa-arrow-trend-up',
    trend: '+8% vs last month',
  },
];

const variants: TitleVariant[] = [
  {
    id: 'variant-benefit-1',
    text: 'Ansiversa Launch: 50 Mini Apps, One Creative Command Center',
    bucket: 'benefit',
    locale: 'en-US',
    tone: 'bold',
    devices: ['numeral', 'colon'],
    keyword: 'Ansiversa',
    keywordPlacement: 'front',
    chars: 66,
    words: 11,
    syllables: 24,
    slug: 'ansiversa-launch-creative-command-center',
    serpPreview:
      'Ansiversa Launch: 50 mini apps, one creative command center for teams who want on-brand titles instantly.',
    rationale: [
      'Primary keyword lands within the first 18 characters to maximize SEO lift.',
      'Colon structure frames the benefit stack clearly for landing-page usage.',
      'Numeral device reinforces breadth and novelty without sounding gimmicky.',
    ],
    flags: [],
    scores: { clarity: 0.92, novelty: 0.81, seo: 0.94, ctrIntent: 0.88, brandFit: 0.9 },
  },
  {
    id: 'variant-curiosity-1',
    text: 'What If One Workspace Named Every Launch in Under a Minute?',
    bucket: 'curiosity',
    locale: 'en-US',
    tone: 'confident',
    devices: ['question'],
    keyword: 'creative title maker',
    keywordPlacement: 'middle',
    chars: 69,
    words: 14,
    syllables: 27,
    slug: 'what-if-one-workspace-named-every-launch-fast',
    serpPreview:
      'What if one workspace named every launch in under a minute? Creative title maker intelligence built into Ansiversa.',
    rationale: [
      'Question hook taps the curiosity bucket while hinting at time savings.',
      'Keyword appears before 45 characters to satisfy SERP guidance.',
      'Pairs well with campaign teasers and short-form landing cards.',
    ],
    flags: ['curiosity_tease'],
    scores: { clarity: 0.84, novelty: 0.9, seo: 0.89, ctrIntent: 0.86, brandFit: 0.87 },
  },
  {
    id: 'variant-proof-1',
    text: 'Proof in the Headlines: See the 3 Titles That Drove 42% CTR',
    bucket: 'proof',
    locale: 'en-US',
    tone: 'professional',
    devices: ['numeral', 'colon', 'proof'],
    keyword: 'title maker',
    keywordPlacement: 'end',
    chars: 71,
    words: 15,
    syllables: 29,
    slug: 'proof-headlines-drove-ctr',
    serpPreview:
      'Proof in the headlines: see the 3 titles that drove 42% CTR with Ansiversa title maker benchmarks.',
    rationale: [
      'Showcases outcome with quantified proof for campaigns and case studies.',
      'Device blend (numeral + colon) balances intrigue with credibility.',
      'SEO keyword sits near the close yet within 60 characters for SERP compliance.',
    ],
    flags: ['proof_claim'],
    scores: { clarity: 0.9, novelty: 0.83, seo: 0.9, ctrIntent: 0.91, brandFit: 0.88 },
  },
  {
    id: 'variant-local-1',
    text: 'Launch Local: Ansiversa Names Every Market in the Native Voice',
    bucket: 'timely',
    locale: 'en-US',
    tone: 'sincere',
    devices: ['colon'],
    keyword: 'Ansiversa titles',
    keywordPlacement: 'front',
    chars: 70,
    words: 14,
    syllables: 28,
    slug: 'launch-local-ansiversa-names-every-market',
    serpPreview:
      'Launch local: Ansiversa titles every market in the native voice with cultural guardrails baked in.',
    rationale: [
      'Highlights localization differentiator for multi-market campaigns.',
      'Balances sincerity with colon device to frame the promise.',
      'Keyword appears up front while maintaining conversational tone.',
    ],
    flags: [],
    scores: { clarity: 0.88, novelty: 0.79, seo: 0.93, ctrIntent: 0.82, brandFit: 0.9 },
  },
];

const bundles: TitleBundle[] = [
  {
    id: 'benefit-pack',
    label: 'Launch Momentum Pack',
    description: 'Benefit-led variants tuned for landing pages, ads, and hero sections.',
    focus: 'conversion',
    variantIds: ['variant-benefit-1'],
    theme: 'benefit',
    highlight: 'Pairs breadth with tangible outcome messaging.',
  },
  {
    id: 'curiosity-pack',
    label: 'Curiosity & Hook Pack',
    description: 'Teaser-style lines to spark intrigue for teasers and short-form video.',
    focus: 'awareness',
    variantIds: ['variant-curiosity-1'],
    theme: 'curiosity',
    highlight: 'Keeps SEO keyword present without sounding forced.',
  },
  {
    id: 'proof-pack',
    label: 'Proof & Social Pack',
    description: 'Evidence-backed statements leveraging stats and social proof.',
    focus: 'credibility',
    variantIds: ['variant-proof-1'],
    theme: 'proof',
    highlight: 'Great for retargeting and investor updates.',
  },
  {
    id: 'timely-pack',
    label: 'Localization Pack',
    description: 'Timely, multi-market focus tuned for global product announcements.',
    focus: 'localization',
    variantIds: ['variant-local-1'],
    theme: 'timely',
    highlight: 'Signals cultural adaptation and voice preservation.',
  },
];

const scoreExplainers: TitleScoreExplainer[] = [
  {
    metric: 'clarity',
    label: 'Clarity',
    score: 0.92,
    highlights: [
      'Leads with the product name and core promise in the first clause.',
      'Avoids jargon while still signaling the breadth of the launch.',
    ],
    improvements: ['Consider swapping "command center" with "workspace" for certain audiences.'],
  },
  {
    metric: 'novelty',
    label: 'Novelty',
    score: 0.81,
    highlights: ['Numeral + colon framing stands out in SERP comparisons.', 'Avoids overused "ultimate" and "unlock" phrasing.'],
    improvements: ['Test a contrarian variant to challenge category sameness.'],
  },
  {
    metric: 'seo',
    label: 'SEO',
    score: 0.94,
    highlights: ['Primary keyword within first 20 characters.', 'Slug auto-generated with brand-safe hyphenation.'],
    improvements: ['Add secondary keyword "title generator" to a supporting variant.'],
  },
  {
    metric: 'ctrIntent',
    label: 'CTR Intent',
    score: 0.88,
    highlights: ['Value-first phrasing triggers curiosity without clickbait.', 'Pairs well with preview copy referencing 42% CTR stat.'],
    improvements: ['A/B test a version with a question hook for ads.'],
  },
  {
    metric: 'brandFit',
    label: 'Brand Fit',
    score: 0.9,
    highlights: ['Matches Ansiversa’s confident but helpful personality.', 'Respects banned words and tone guardrails.'],
    improvements: ['Explore playful tone for community email audiences.'],
  },
];

const riskFlags = [
  {
    id: 'clickbait_risk',
    label: 'Clickbait risk',
    severity: 'low',
    recommendation: 'Keep proof point in supporting copy to avoid over-promising.',
  },
  {
    id: 'keyword_gap',
    label: 'Keyword placement drift',
    severity: 'medium',
    recommendation: 'Variant cur-1 moves the keyword to position 48 — still compliant but monitor.',
  },
  {
    id: 'duplicate',
    label: 'Near duplicate detected',
    severity: 'low',
    recommendation: 'Merge with existing library entry or mark as intentional variant.',
  },
];

const localizationSamples: TitleLocalizationSample[] = [
  {
    id: 'es-ES',
    locale: 'es-ES',
    language: 'Spanish (Spain)',
    title: 'Ansiversa lanza 50 mini apps: tu centro creativo listo para despegar',
    adaptation:
      'Se mantiene la metáfora de centro de mando, ajustando el tono a un español peninsular natural.',
    preservedTerms: ['Ansiversa'],
    approach: 'Reformulated colon split while preserving rhythm.',
    note: 'Acentúa "despegar" para resonar con lanzamientos tecnológicos locales.',
  },
  {
    id: 'pt-BR',
    locale: 'pt-BR',
    language: 'Português (Brasil)',
    title: 'Ansiversa apresenta 50 mini apps para liderar seus lançamentos criativos',
    adaptation:
      'Troca "command center" por "liderar" para soar mais natural no português brasileiro.',
    preservedTerms: ['Ansiversa'],
    approach: 'Mantém estrutura benefício + prova com verbos no presente.',
    note: 'Sustenta promessa sem soar exagerado para público brasileiro.',
  },
  {
    id: 'de-DE',
    locale: 'de-DE',
    language: 'Deutsch (Deutschland)',
    title: 'Ansiversa bündelt 50 Mini-Apps als kreative Schaltzentrale für Ihre Launches',
    adaptation:
      'Introduce "Schaltzentrale" to mirror command center nuance while respecting German compound style.',
    preservedTerms: ['Ansiversa'],
    approach: 'Adds possessive "Ihre" to align with German formal address.',
    note: 'Verified glossary keeps product name untranslated.',
  },
];

const exportPresets: TitleExportPreset[] = [
  {
    id: 'csv-bulk',
    format: 'csv',
    label: 'CSV bulk export',
    description: 'Download variants with scores, rationale, and locale columns.',
    includes: ['Variant text', 'Scores', 'Bucket', 'Locale', 'Flags'],
    bestFor: 'Spreadsheet editing & import to ad platforms',
    plan: 'free',
  },
  {
    id: 'json-automation',
    format: 'json',
    label: 'JSON automation payload',
    description: 'Structured payload for pushing titles into downstream workflows.',
    includes: ['Variant text', 'Slug', 'Scores', 'Metadata'],
    bestFor: 'Zapier & custom APIs',
    plan: 'pro',
  },
  {
    id: 'pdf-board',
    format: 'pdf',
    label: 'PDF stakeholder board',
    description: 'Curated PDF with rationale, scoring heatmap, and recommendations.',
    includes: ['Variant gallery', 'Score heatmap', 'Risk flags', 'Approvals'],
    bestFor: 'Executive reviews & creative presentations',
    plan: 'pro',
  },
];

const integrationCards: TitleIntegrationCard[] = [
  {
    id: 'blog-writer',
    name: 'Blog Writer',
    description: 'Send selected titles to kick-start outlines and intro paragraphs.',
    href: '/blog-writer',
    icon: 'fas fa-file-pen',
    actionLabel: 'Draft outline',
  },
  {
    id: 'presentation-designer',
    name: 'Presentation Designer',
    description: 'Convert winning titles into slide headlines and talking points.',
    href: '/presentation',
    icon: 'fas fa-display',
    actionLabel: 'Open deck',
  },
  {
    id: 'ad-copy',
    name: 'Ad Copy Assistant',
    description: 'Sync A/B packs into ad headline and description slots.',
    href: '/ad-copy-assistant',
    icon: 'fas fa-bullseye',
    actionLabel: 'Map to ads',
  },
  {
    id: 'story-crafter',
    name: 'StoryCrafter',
    description: 'Flow localized titles into multi-chapter storytelling arcs.',
    href: '/story',
    icon: 'fas fa-book-open',
    actionLabel: 'Build storyline',
  },
  {
    id: 'song-lyric',
    name: 'Song Lyric Maker',
    description: 'Reimagine playful launches as jingles with consistent hooks.',
    href: '/song-lyric-maker',
    icon: 'fas fa-music',
    actionLabel: 'Spin lyrics',
  },
];

const apiEndpoints: TitleApiEndpoint[] = [
  {
    method: 'POST',
    path: '/titles/api/project/create',
    description: 'Create a new title project with asset type, keyword, and locales.',
  },
  {
    method: 'GET',
    path: '/titles/api/project',
    description: 'Fetch project dashboard, variants, scoring, and plan limits.',
  },
  {
    method: 'POST',
    path: '/titles/api/generate',
    description: 'Generate fresh variants based on brief constraints.',
  },
  {
    method: 'POST',
    path: '/titles/api/score',
    description: 'Re-score a single variant for clarity, novelty, SEO, and CTR intent.',
  },
  {
    method: 'POST',
    path: '/titles/api/localize',
    description: 'Translate and culturally adapt a variant while preserving glossary terms.',
  },
  {
    method: 'POST',
    path: '/titles/api/export',
    description: 'Queue an export job for CSV, JSON, or PDF deliverables.',
  },
];

const planLimits: Record<'free' | 'pro', TitlePlanLimits> = {
  free: {
    projects: 3,
    variantsPerBrief: 25,
    seoMode: 'basic',
    localization: 1,
    exports: ['CSV'],
    integrations: 'View-only handoff',
    history: '60 days',
  },
  pro: {
    projects: 'unlimited',
    variantsPerBrief: 200,
    seoMode: 'full',
    localization: 'multi',
    exports: ['CSV', 'JSON', 'PDF'],
    integrations: 'One-click push',
    history: 'Unlimited',
  },
};

export const getHeroHighlights = () => clone(heroHighlights);
export const getHeroStats = () => clone(heroStats);
export const getBriefKnobs = () => clone(briefKnobs);
export const getAssetTypeOptions = () => clone(assetTypes);
export const getToneOptions = () => clone(toneOptions);
export const getPovOptions = () => clone(povOptions);
export const getStyleDeviceOptions = () => clone(styleDeviceOptions);
export const getThemeBuckets = () => clone(themeBuckets);
export const getWorkspaceMetrics = () => clone(workspaceMetrics);
export const getTitleVariants = () => clone(variants);
export const getTitleBundles = () => clone(bundles);
export const getScoreExplainers = () => clone(scoreExplainers);
export const getRiskFlags = () => clone(riskFlags);
export const getLocalizationSamples = () => clone(localizationSamples);
export const getExportPresets = () => clone(exportPresets);
export const getIntegrationCards = () => clone(integrationCards);
export const getApiEndpoints = () => clone(apiEndpoints);
export const getPlanLimits = () => clone(planLimits);

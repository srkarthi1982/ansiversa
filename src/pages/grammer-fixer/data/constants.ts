export type GrammarMode = 'check' | 'auto' | 'teach' | 'proofread';
export type GrammarRulePack =
  | 'grammar'
  | 'spelling'
  | 'punctuation'
  | 'capitalization'
  | 'style'
  | 'clarity'
  | 'inclusive'
  | 'formatting';
export type GrammarDialect = 'en-us' | 'en-uk' | 'en-au' | 'en-in';
export type GrammarStyleGuide = 'academic' | 'business' | 'legal' | 'blog' | 'casual';
export type ReadabilityTarget = 'grade-6' | 'grade-8' | 'grade-10' | 'college';

export const MODES: Array<{
  value: GrammarMode;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    value: 'check',
    label: 'Check-only',
    description:
      'Surface issues without touching the original text. Perfect for compliance reviews or when you only want guidance.',
    icon: 'fas fa-magnifying-glass',
  },
  {
    value: 'auto',
    label: 'Auto-fix (safe rules)',
    description:
      'Automatically applies low-risk fixes such as spacing, punctuation, simple grammar, and spelling corrections.',
    icon: 'fas fa-wand-magic-sparkles',
  },
  {
    value: 'teach',
    label: 'Explain & teach',
    description:
      'Pairs each fix with a quick lesson, rule references, and regional notes so writers understand why changes occur.',
    icon: 'fas fa-lightbulb',
  },
  {
    value: 'proofread',
    label: 'Proofread & rephrase',
    description:
      'Escalate tricky passages into rewrite suggestions with alternate phrasings and clarity-focused rewordings.',
    icon: 'fas fa-pen-fancy',
  },
];

export const RULE_PACKS: Array<{
  id: GrammarRulePack;
  name: string;
  description: string;
  icon: string;
  defaultEnabled: boolean;
}> = [
  {
    id: 'grammar',
    name: 'Grammar & Agreement',
    description: 'Subject-verb agreement, pronouns, tense sequencing, dangling modifiers, and fragments/run-ons.',
    icon: 'fas fa-spell-check',
    defaultEnabled: true,
  },
  {
    id: 'spelling',
    name: 'Spelling & Variants',
    description: 'Typos, homophones, locale variants (color/colour), and customizable brand dictionaries.',
    icon: 'fas fa-font',
    defaultEnabled: true,
  },
  {
    id: 'punctuation',
    name: 'Punctuation & Hyphenation',
    description: 'Serial commas, quotation punctuation, em/en dash usage, hyphenated compounds, and ellipses.',
    icon: 'fas fa-ellipsis-h',
    defaultEnabled: true,
  },
  {
    id: 'capitalization',
    name: 'Capitalization',
    description: 'Title casing, sentence caps, acronyms, and honorifics tuned for locale and selected style guide.',
    icon: 'fas fa-heading',
    defaultEnabled: true,
  },
  {
    id: 'style',
    name: 'Style Guides',
    description: 'APA/MLA, business memo, and legal register presets with tone, voice, and citation cues.',
    icon: 'fas fa-book-open',
    defaultEnabled: true,
  },
  {
    id: 'clarity',
    name: 'Clarity & Readability',
    description: 'Sentence length, filler words, redundancies, passive voice hints, and readability targets.',
    icon: 'fas fa-highlighter',
    defaultEnabled: true,
  },
  {
    id: 'inclusive',
    name: 'Inclusive Language',
    description: 'Flags gendered terms, outdated idioms, and culturally sensitive phrasing with respectful rewrites.',
    icon: 'fas fa-people-group',
    defaultEnabled: true,
  },
  {
    id: 'formatting',
    name: 'Formatting & Numerals',
    description: 'Spacing consistency, bullet alignment, numeral spelling rules, and currency/date formats.',
    icon: 'fas fa-list-ol',
    defaultEnabled: true,
  },
];

export const DIALECTS: Array<{
  value: GrammarDialect;
  label: string;
  description: string;
  example: string;
}> = [
  {
    value: 'en-us',
    label: 'English (United States)',
    description: 'Color, organize, check punctuation inside quotes, and use month/day/year dates with USD currency.',
    example: 'Color-coded checklist, organized hand-off, $5,000.00 on 10/03/2025',
  },
  {
    value: 'en-uk',
    label: 'English (United Kingdom)',
    description: 'Colour, organise, punctuation outside quotes, and day/month/year with GBP formatting.',
    example: 'Colour-coded checklist, organised hand-off, £5,000.00 on 3 October 2025',
  },
  {
    value: 'en-au',
    label: 'English (Australia)',
    description: 'Mixes UK spelling with regional idioms, currency in AUD, and day/month/year dates.',
    example: 'Organise the launch, finalise specs, AU$5,000.00 due 3/10/2025',
  },
  {
    value: 'en-in',
    label: 'English (India)',
    description: 'Honour, organise, hybrid punctuation norms, Indian numbering system, and DD/MM/YYYY dates.',
    example: 'Honour the launch plan, organise specs, ₹5,00,000 due 03-10-2025',
  },
];

export const STYLE_GUIDES: Array<{
  value: GrammarStyleGuide;
  label: string;
  description: string;
  notes: string;
}> = [
  {
    value: 'academic',
    label: 'Academic',
    description: 'APA/MLA-inspired structure with citation prompts, third-person voice, and bias-free phrasing.',
    notes: 'Suggests sentence case titles, discourages contractions, and enforces figure/table references.',
  },
  {
    value: 'business',
    label: 'Business',
    description: 'Concise memos, action-first paragraphs, and polite-yet-direct tone for stakeholders.',
    notes: 'Prefers active voice, limits filler, and highlights CTA clarity for busy readers.',
  },
  {
    value: 'legal',
    label: 'Legal memo',
    description: 'Defines obligations, references clauses, and maintains parallel structure for enumerations.',
    notes: 'Flags ambiguity, ensures defined terms remain capitalized, and keeps citations intact.',
  },
  {
    value: 'blog',
    label: 'Blog/Marketing',
    description: 'Conversational tone, SEO keyword preservation, and readability tuned for skimming.',
    notes: 'Encourages headings, bulletized lists, and CTA placements while preserving brand keywords.',
  },
  {
    value: 'casual',
    label: 'Casual',
    description: 'Friendly, inclusive phrasing with flexibility on contractions and emojis when appropriate.',
    notes: 'Warns on slang overuse and ensures clarity even with informal voice.',
  },
];

export const READABILITY_TARGETS: Array<{
  value: ReadabilityTarget;
  label: string;
  description: string;
  scoreHint: string;
}> = [
  {
    value: 'grade-6',
    label: 'Grade 6 (easy)',
    description: 'Short sentences, everyday vocabulary, ideal for public updates and support docs.',
    scoreHint: 'Aim for Flesch-Kincaid grade ≤ 6.0 and Flesch reading ease ≥ 80.',
  },
  {
    value: 'grade-8',
    label: 'Grade 8 (balanced)',
    description: 'Balanced readability for newsletters and onboarding guides.',
    scoreHint: 'Target grade ≤ 8.0 with 14–18 words per sentence.',
  },
  {
    value: 'grade-10',
    label: 'Grade 10 (specialist)',
    description: 'Suitable for technical briefings and investor updates.',
    scoreHint: 'Grade ≤ 10.0 with precise terminology and defined acronyms.',
  },
  {
    value: 'college',
    label: 'College (advanced)',
    description: 'Dense analysis with citations; expect longer sentences and domain language.',
    scoreHint: 'Grade 12+ with clarity checks to avoid needless jargon.',
  },
];

export const PLAN_GATING_ROWS: Array<{
  feature: string;
  free: string;
  pro: string;
}> = [
  { feature: 'Projects', free: '10', pro: 'Unlimited' },
  { feature: 'Max input per job', free: '2,500 characters', pro: '100,000 characters' },
  { feature: 'Batch CSV', free: '—', pro: 'Included' },
  { feature: 'Dialects', free: 'EN-US', pro: 'EN-US · EN-UK · EN-IN · EN-AU', },
  { feature: 'Style guides', free: 'Basic presets', pro: 'Full library + custom', },
  { feature: 'Auto-apply', free: 'Safe rules only', pro: 'Safe + extended', },
  { feature: 'Exports', free: 'Markdown, HTML', pro: 'DOCX, JSON, Markdown, HTML', },
  { feature: 'History retention', free: '30 days', pro: 'Unlimited', },
];

export const HANDOFF_DESTINATIONS = [
  {
    label: 'Send to Rephrase & Paraphraser',
    href: '/rephrase-paraphraser',
    description: 'Escalate complex rewrites or creative rephrasing after grammar fixes are applied.',
    icon: 'fas fa-shuffle',
  },
  {
    label: 'Open in Email Polisher',
    href: '/email-polisher',
    description: 'Polish tone, enforce templates, and generate quick replies from your corrected text.',
    icon: 'fas fa-envelope-open-text',
  },
  {
    label: 'Export to AI Translator & Tone Fixer',
    href: '/ai-translator-tone-fixer',
    description: 'Translate the clean copy while preserving style, glossaries, and locale formatting.',
    icon: 'fas fa-language',
  },
];

export const WORKSPACE_ROUTES = [
  {
    route: '/grammer-fixer',
    label: 'Workspace (Editor, Issues, Rules, Export)',
    icon: 'fas fa-gauge-high',
  },
  {
    route: '/grammer-fixer/new',
    label: 'Quick wizard (dialect, style, readability targets)',
    icon: 'fas fa-wand-magic-sparkles',
  },
  {
    route: '/grammer-fixer/history',
    label: 'Jobs history with filters and retention policies',
    icon: 'fas fa-clock-rotate-left',
  },
  {
    route: '/grammer-fixer/settings',
    label: 'Defaults for style, dialect, glossary locks, and safe rules',
    icon: 'fas fa-gear',
  },
];

export const BATCH_PLAYBOOKS = [
  {
    title: 'Weekly newsletter QA',
    description: 'Upload Markdown or HTML newsletters, lock terminology, and auto-export polished drafts.',
    icon: 'fas fa-newspaper',
  },
  {
    title: 'Legal memo review',
    description: 'Run clarity, defined-term capitalization, and numbering checks before filing.',
    icon: 'fas fa-scale-balanced',
  },
  {
    title: 'Support macro sweeps',
    description: 'Batch check canned responses for inclusive language and grammar drift each quarter.',
    icon: 'fas fa-headset',
  },
];

export const PRIVACY_FEATURES = [
  {
    title: 'PII masking',
    description: 'Redact emails, phone numbers, IDs, and addresses before content is sent to the model.',
    icon: 'fas fa-user-shield',
  },
  {
    title: 'Audit log & retention',
    description: 'Track who ran each job, what rules were enabled, and enforce 30-day retention on Free plans.',
    icon: 'fas fa-clipboard-check',
  },
  {
    title: 'Safe auto-apply',
    description: 'Preview every change with side-by-side diff and roll back suggestions individually.',
    icon: 'fas fa-helmet-safety',
  },
];

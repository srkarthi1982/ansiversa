
import { clone } from '../../utils/clone';

export const POEM_FORM_KEYS = [
  'free-verse',
  'haiku',
  'tanka',
  'sonnet',
  'villanelle',
  'ghazal',
  'spoken-word',
  'acrostic',
  'blank-verse',
  'limerick',
] as const;

export type PoemFormKey = (typeof POEM_FORM_KEYS)[number];

export type PoemPlan = 'free' | 'pro';

export type PoemConstraint = {
  type: 'syllable-pattern' | 'structure' | 'rhyme-scheme' | 'meter' | 'refrain' | 'acrostic' | 'performance';
  label: string;
  detail: string;
};

export type PoemForm = {
  key: PoemFormKey;
  name: string;
  summary: string;
  difficulty: 'open' | 'structured';
  constraints: PoemConstraint[];
  signatureMoves: string[];
  gatedFor?: PoemPlan;
};

export type PoemRevisionPassKey = 'imagery' | 'verbs' | 'compress' | 'enjambment' | 'breaks' | 'style';

export type PoemRevisionPass = {
  key: PoemRevisionPassKey;
  label: string;
  description: string;
  focus: string;
  bestFor: string[];
  gating: PoemPlan;
  prompt: string;
};

export type PoemSummary = {
  id: string;
  title: string;
  form: PoemFormKey;
  theme: string;
  tone: string;
  status: 'draft' | 'final';
  updatedAt: string;
  lines: number;
  words: number;
  tags: string[];
  pinned?: boolean;
  aiPassCounts: Record<PoemRevisionPassKey, number>;
  analysisSummary: {
    meterScore: number;
    imageryScore: number;
    rhymeScheme: string;
    voice: string;
  };
};

export type PoemWorkspaceDraftLine = {
  number: number;
  text: string;
  emphasis?: 'meter' | 'imagery' | 'rhyme' | 'diction' | 'performance';
  suggestion?: string;
};

export type PoemWorkspaceDraft = {
  poemId: string;
  title: string;
  stage: 'outline' | 'draft' | 'revise' | 'final';
  targetForm: PoemFormKey;
  lineGoal: number;
  readingTime: string;
  voice: string;
  lastAnalysisAt: string;
  lines: PoemWorkspaceDraftLine[];
};

export type PoemAnalysisInsight = {
  id: string;
  label: string;
  value: string;
  detail: string;
  severity: 'info' | 'warning' | 'critical';
};

export type PoemAnalysisSnapshot = {
  poemId: string;
  meterScore: number;
  rhymeScore: number;
  imageryScore: number;
  dictionScore: number;
  tone: string;
  cadence: string;
  flaggedLines: { line: number; issue: string; fix: string }[];
  insights: PoemAnalysisInsight[];
  nearRhymes: { word: string; suggestion: string }[];
  imageryBreakdown: { label: string; percent: number }[];
};

export type PoemCollection = {
  id: string;
  title: string;
  poemIds: string[];
  progress: number;
  status: 'draft' | 'sequencing' | 'ready';
  lastUpdated: string;
  focus: string;
};

export type PoemExportPreset = {
  id: string;
  label: string;
  description: string;
  formats: ('md' | 'pdf' | 'docx')[];
  includes: string[];
  plan: PoemPlan;
};

export type PoemPromptSeed = {
  id: string;
  label: string;
  description: string;
  form: PoemFormKey | 'any';
  tone: string;
};

export type PoemActivityItem = {
  id: string;
  label: string;
  detail: string;
  timestamp: string;
  icon: string;
  tone: 'success' | 'info' | 'warning';
};

export type PoemLibraryMetrics = {
  totalPoems: number;
  activeDrafts: number;
  averageLines: number;
  aiCallsThisWeek: number;
  savedAnalyses: number;
};

const now = () => new Date().toISOString();

export const poemForms: PoemForm[] = [
  {
    key: 'free-verse',
    name: 'Free Verse',
    summary: 'Ear-led cadence with intuitive line breaks and sonic echoes.',
    difficulty: 'open',
    constraints: [
      { type: 'structure', label: 'Line breaks', detail: 'Flow by breath; aim for 3–5 beats per line.' },
      { type: 'meter', label: 'Cadence palette', detail: 'Internal rhythm anchored by recurring stresses.' },
    ],
    signatureMoves: ['Syncopated enjambment', 'Image clusters', 'Echoed consonants'],
  },
  {
    key: 'haiku',
    name: 'Haiku',
    summary: 'Minimal nature snapshot balancing syllables and seasonal turn.',
    difficulty: 'structured',
    constraints: [
      { type: 'syllable-pattern', label: 'Syllables', detail: '5 / 7 / 5 pattern across three lines.' },
      { type: 'structure', label: 'Kireji', detail: 'Include a pivot or cut to juxtapose images.' },
    ],
    signatureMoves: ['Nature kigo', 'Present-tense immediacy', 'Micro imagery'],
  },
  {
    key: 'tanka',
    name: 'Tanka',
    summary: 'Extended haiku with two reflective lines to conclude the scene.',
    difficulty: 'structured',
    constraints: [
      { type: 'syllable-pattern', label: 'Syllables', detail: '5 / 7 / 5 / 7 / 7 syllable scaffolding.' },
      { type: 'structure', label: 'Turn', detail: 'Lines 4–5 pivot from image to interior insight.' },
    ],
    signatureMoves: ['Emotional volta', 'Paired imagery', 'Gentle repetition'],
  },
  {
    key: 'sonnet',
    name: 'Shakespearean Sonnet',
    summary: '14-line argument weaving quatrains into a closing couplet.',
    difficulty: 'structured',
    constraints: [
      { type: 'rhyme-scheme', label: 'Rhyme', detail: 'ABAB CDCD EFEF GG end rhymes.' },
      { type: 'meter', label: 'Meter', detail: 'Iambic pentameter with 10 syllables per line.' },
    ],
    signatureMoves: ['Argumentative turn', 'Heroic couplet close', 'Metaphoric ladder'],
    gatedFor: 'pro',
  },
  {
    key: 'villanelle',
    name: 'Villanelle',
    summary: 'Looping refrains across 19 lines for obsession or mantra.',
    difficulty: 'structured',
    constraints: [
      { type: 'structure', label: 'Stanzas', detail: 'Five tercets plus a quatrain finale.' },
      { type: 'refrain', label: 'Refrains', detail: 'Lines 1 and 3 repeat at set intervals.' },
      { type: 'rhyme-scheme', label: 'Rhyme', detail: 'ABA pattern sustained through each stanza.' },
    ],
    signatureMoves: ['Spiraling refrains', 'Gradual revelation', 'Sound weaving'],
    gatedFor: 'pro',
  },
  {
    key: 'ghazal',
    name: 'Ghazal',
    summary: 'Couplets sharing a refrain and rhyme, each emotionally standalone.',
    difficulty: 'structured',
    constraints: [
      { type: 'refrain', label: 'Radif', detail: 'Final phrase repeated at end of each couplet.' },
      { type: 'rhyme-scheme', label: 'Qaafiya', detail: 'Pre-radif rhyme preceding the refrain.' },
    ],
    signatureMoves: ['Monorhyme shimmer', 'Self-contained couplets', 'Address in maqta'],
    gatedFor: 'pro',
  },
  {
    key: 'spoken-word',
    name: 'Spoken Word',
    summary: 'Performance-driven poetry with pacing and gesture baked in.',
    difficulty: 'open',
    constraints: [
      { type: 'performance', label: 'Timing', detail: 'Target 3-minute performance cadence with breath cues.' },
      { type: 'structure', label: 'Motifs', detail: 'Repeat anchors to support audience recall.' },
    ],
    signatureMoves: ['Call-and-response', 'Stacked refrains', 'Percussive consonance'],
  },
  {
    key: 'acrostic',
    name: 'Acrostic',
    summary: 'Initial letters of each line spell a hidden message or dedication.',
    difficulty: 'structured',
    constraints: [
      { type: 'acrostic', label: 'Initials', detail: 'Line initials map to the acrostic key phrase.' },
      { type: 'structure', label: 'Reveal', detail: 'Hint at hidden message without giving it away early.' },
    ],
    signatureMoves: ['Concealed dedication', 'Vertical resonance', 'Line-initial play'],
  },
  {
    key: 'blank-verse',
    name: 'Blank Verse',
    summary: 'Unrhymed iambic pentameter ideal for dramatic monologues.',
    difficulty: 'structured',
    constraints: [
      { type: 'meter', label: 'Iambs', detail: 'Maintain iambic pentameter with occasional substitutions.' },
      { type: 'structure', label: 'Volta', detail: 'Pivot in argument around lines 7–8.' },
    ],
    signatureMoves: ['Dramatic tension', 'Enjambed argument', 'Classical cadence'],
    gatedFor: 'pro',
  },
  {
    key: 'limerick',
    name: 'Limerick',
    summary: 'Playful five-line rhyme with anapestic bounce.',
    difficulty: 'structured',
    constraints: [
      { type: 'rhyme-scheme', label: 'Rhyme', detail: 'AABBA end rhymes with strong punchline.' },
      { type: 'meter', label: 'Meter', detail: 'Lines 1, 2, 5 anapestic trimeter; 3, 4 dimeter.' },
    ],
    signatureMoves: ['Humorous twist', 'Internal rhymes', 'Rhythmic punchline'],
  },
];

export const poemRevisionPasses: PoemRevisionPass[] = [
  {
    key: 'imagery',
    label: 'Sharpen Imagery',
    description: 'Amplify concrete nouns, sensory detail, and metaphor freshness.',
    focus: 'Specificity and sensory vividness',
    bestFor: ['Free verse pivots', 'Haiku/Tanka revisions', 'Spoken word refrains'],
    gating: 'free',
    prompt: "Highlight abstract nouns and propose concrete replacements anchored in the poem's motif.",
  },
  {
    key: 'verbs',
    label: 'Strengthen Verbs',
    description: 'Replace weak verbs with precise actions and kinetic phrasing.',
    focus: 'Dynamic diction',
    bestFor: ['Narrative poems', 'Sonnet quatrains', 'Performance crescendos'],
    gating: 'free',
    prompt: 'Suggest verb swaps that reinforce tone and meter without distorting meaning.',
  },
  {
    key: 'compress',
    label: 'Compress Language',
    description: 'Trim filler, tighten line length, and remove redundant modifiers.',
    focus: 'Brevity and pacing',
    bestFor: ['Chapbook sequencing', 'Sestina/villanelle refrains', 'Minimalist voices'],
    gating: 'pro',
    prompt: 'Identify lines that can lose 2–3 syllables while preserving imagery and rhyme obligations.',
  },
  {
    key: 'enjambment',
    label: 'Tune Enjambment',
    description: 'Re-balance line breaks for tension, surprise, and breath.',
    focus: 'Lineation and surprise',
    bestFor: ['Free verse', 'Blank verse', 'Narrative poems'],
    gating: 'pro',
    prompt: 'Recommend alternative breaks that heighten tension or double meaning.',
  },
  {
    key: 'breaks',
    label: 'Line Break Variance',
    description: 'Alternate short and long lines to modulate rhythm and emphasis.',
    focus: 'Cadence and emphasis',
    bestFor: ['Spoken word builds', 'Haiku sequences', 'Hybrid forms'],
    gating: 'free',
    prompt: 'Suggest 2–3 spots to vary line length while keeping meter tolerances.',
  },
  {
    key: 'style',
    label: 'Tone and Style Harmoniser',
    description: 'Align diction, figurative language, and register to the selected tone.',
    focus: 'Voice cohesion',
    bestFor: ['Sonnet couplets', 'Ghazal maqta', 'Confessional arcs'],
    gating: 'pro',
    prompt: 'Revise 3 exemplar lines in the requested style and explain the voice adjustments.',
  },
];

export const samplePoems: PoemSummary[] = [
  {
    id: 'poem-aurora-logistics',
    title: 'Aurora Logistics',
    form: 'free-verse',
    theme: 'Urban dawn shift',
    tone: 'confessional',
    status: 'draft',
    updatedAt: '2024-11-18T09:40:00.000Z',
    lines: 22,
    words: 218,
    tags: ['city', 'light', 'family'],
    pinned: true,
    aiPassCounts: {
      imagery: 3,
      verbs: 1,
      compress: 1,
      enjambment: 2,
      breaks: 1,
      style: 0,
    },
    analysisSummary: {
      meterScore: 78,
      imageryScore: 86,
      rhymeScheme: 'Echoed slant',
      voice: 'Lyrical confessional',
    },
  },
  {
    id: 'poem-haiku-lanterns',
    title: 'Lantern Census',
    form: 'haiku',
    theme: 'Autumn festival',
    tone: 'observational',
    status: 'final',
    updatedAt: '2024-11-10T05:22:00.000Z',
    lines: 3,
    words: 28,
    tags: ['seasonal', 'light', 'tradition'],
    aiPassCounts: {
      imagery: 2,
      verbs: 0,
      compress: 0,
      enjambment: 0,
      breaks: 1,
      style: 0,
    },
    analysisSummary: {
      meterScore: 92,
      imageryScore: 94,
      rhymeScheme: 'Syllabic echo',
      voice: 'Minimalist',
    },
  },
  {
    id: 'poem-sonnet-tide',
    title: 'Sonnet for Low Tide Architects',
    form: 'sonnet',
    theme: 'Coastal resilience',
    tone: 'formalist',
    status: 'draft',
    updatedAt: '2024-11-16T14:12:00.000Z',
    lines: 14,
    words: 196,
    tags: ['climate', 'architecture'],
    aiPassCounts: {
      imagery: 1,
      verbs: 2,
      compress: 1,
      enjambment: 1,
      breaks: 0,
      style: 2,
    },
    analysisSummary: {
      meterScore: 71,
      imageryScore: 79,
      rhymeScheme: 'ABAB CDCD EFEF GG',
      voice: 'Formal elegiac',
    },
  },
  {
    id: 'poem-spoken-blueprint',
    title: 'Blueprint for the Open Mic',
    form: 'spoken-word',
    theme: 'Community organising',
    tone: 'galvanising',
    status: 'draft',
    updatedAt: '2024-11-19T01:05:00.000Z',
    lines: 36,
    words: 412,
    tags: ['activism', 'performance'],
    aiPassCounts: {
      imagery: 2,
      verbs: 3,
      compress: 0,
      enjambment: 1,
      breaks: 2,
      style: 1,
    },
    analysisSummary: {
      meterScore: 64,
      imageryScore: 88,
      rhymeScheme: 'Internal slant loop',
      voice: 'Rhythmic orator',
    },
  },
];

export const poemWorkspaceDrafts: Record<string, PoemWorkspaceDraft> = {
  'poem-aurora-logistics': {
    poemId: 'poem-aurora-logistics',
    title: 'Aurora Logistics',
    stage: 'revise',
    targetForm: 'free-verse',
    lineGoal: 24,
    readingTime: '1 min 40 s',
    voice: 'Quiet confessional with electrical imagery',
    lastAnalysisAt: '2024-11-18T09:30:00.000Z',
    lines: [
      {
        number: 1,
        text: 'Forklifts yawn under sodium halos,',
        emphasis: 'imagery',
        suggestion: 'Consider swapping "halos" for "auras" to avoid religious connotation.',
      },
      { number: 2, text: 'my badge blinks amber, remembering wages due.' },
      {
        number: 3,
        text: 'The dawn shift prints its breath on pallet wrap,',
        emphasis: 'imagery',
      },
      { number: 4, text: 'each barcode a promise to leave before noon.' },
      {
        number: 5,
        text: 'Mother texts: spare the sky a photo.',
        emphasis: 'diction',
      },
      { number: 6, text: 'I send steel ribs, river fog, a nest of cranes.' },
      { number: 7, text: 'Somewhere invoices bloom like algae.' },
      { number: 8, text: 'My hands learn the meter of pallet jacks.' },
      { number: 9, text: 'Break room saints tape wishes above the microwave.' },
      {
        number: 10,
        text: 'I clock out humming, feet lit by forklift stars.',
        emphasis: 'meter',
      },
    ],
  },
  'poem-haiku-lanterns': {
    poemId: 'poem-haiku-lanterns',
    title: 'Lantern Census',
    stage: 'final',
    targetForm: 'haiku',
    lineGoal: 3,
    readingTime: '12 s',
    voice: 'Observant, gentle awe',
    lastAnalysisAt: '2024-11-10T05:10:00.000Z',
    lines: [
      { number: 1, text: 'midnight rice fields —', emphasis: 'meter' },
      { number: 2, text: 'volunteers counting lanterns', emphasis: 'imagery' },
      { number: 3, text: 'by breathing alone', emphasis: 'rhyme' },
    ],
  },
  'poem-sonnet-tide': {
    poemId: 'poem-sonnet-tide',
    title: 'Sonnet for Low Tide Architects',
    stage: 'draft',
    targetForm: 'sonnet',
    lineGoal: 14,
    readingTime: '2 min 05 s',
    voice: 'Formal with tidal conceits',
    lastAnalysisAt: '2024-11-16T14:00:00.000Z',
    lines: [
      { number: 1, text: 'Blueprints in chalk dissolve along the quay,', emphasis: 'meter' },
      { number: 2, text: 'harbor-town widows harvest rust for proof.' },
      { number: 3, text: 'Our ribs remember tempests by the sway', emphasis: 'meter' },
      { number: 4, text: 'of pewter bells stitched into weathered roof.' },
      { number: 5, text: 'We draft foundations deep as whale-song wells,' },
      { number: 6, text: 'then beg the moon for leases on the sand.' },
      { number: 7, text: "What ordinance forgives a harbor's knell?" },
      { number: 8, text: 'Which ordinance will steady trembling land?' },
      { number: 9, text: 'At volta, engineers unspool a plea,' },
      { number: 10, text: 'petition inked in tidepool phosphor script.' },
      { number: 11, text: 'We trade in brine and spectral equity,' },
      { number: 12, text: 'installing hope where barnacled beams have slipped.' },
      { number: 13, text: 'So let the couplet moor these scattered piers —' },
      { number: 14, text: 'raise floodproof hymns, unshaken by arrears.' },
    ],
  },
  'poem-spoken-blueprint': {
    poemId: 'poem-spoken-blueprint',
    title: 'Blueprint for the Open Mic',
    stage: 'revise',
    targetForm: 'spoken-word',
    lineGoal: 40,
    readingTime: '3 min 10 s',
    voice: 'Collective call-and-response',
    lastAnalysisAt: '2024-11-19T00:55:00.000Z',
    lines: [
      { number: 1, text: 'Call roll of every folding chair still warm.', emphasis: 'performance' },
      { number: 2, text: 'Beatbox the housing stats between our teeth.' },
      { number: 3, text: 'Let spotlights orbit paper signs that warn', emphasis: 'imagery' },
      { number: 4, text: 'no landlord lyrics overtake this beat.' },
      { number: 5, text: 'Chorus: we own the quiet in this room.' },
      { number: 6, text: 'Bridge: let the sirens modulate to hum.' },
      { number: 7, text: 'Add breakdown: whisper budgets through the broom.' },
      { number: 8, text: 'Tag ending: testify until the future comes.' },
    ],
  },
};

export const poemAnalysesById: Record<string, PoemAnalysisSnapshot> = {
  'poem-aurora-logistics': {
    poemId: 'poem-aurora-logistics',
    meterScore: 78,
    rhymeScore: 62,
    imageryScore: 86,
    dictionScore: 74,
    tone: 'Confessional industrial',
    cadence: 'Loose iambic undercurrent with syncopated enjambment',
    flaggedLines: [
      { line: 2, issue: 'Double modifier softens impact', fix: 'Trim "amber" or replace with concrete detail.' },
      { line: 7, issue: 'Metaphor drift', fix: 'Re-align algae image to logistics motif.' },
    ],
    insights: [
      {
        id: 'insight-imagery-density',
        label: 'Imagery density',
        value: '67% concrete',
        detail: '14 of 21 nouns are sensory-specific; keep momentum in lines 6–7.',
        severity: 'info',
      },
      {
        id: 'insight-meter-break',
        label: 'Meter variance',
        value: '±2 syllables',
        detail: 'Lines 2 and 10 drift from target cadence; consider compression.',
        severity: 'warning',
      },
      {
        id: 'insight-cliche',
        label: 'Cliché risk',
        value: '1 flagged phrase',
        detail: '"Hands learn" appears in 12k corpora hits; offer alternative embodiment.',
        severity: 'info',
      },
    ],
    nearRhymes: [
      { word: 'halos', suggestion: 'cargos / follow' },
      { word: 'cranes', suggestion: 'lanes / remains' },
    ],
    imageryBreakdown: [
      { label: 'Industrial', percent: 46 },
      { label: 'Family', percent: 18 },
      { label: 'Nature', percent: 21 },
      { label: 'Abstract', percent: 15 },
    ],
  },
  'poem-haiku-lanterns': {
    poemId: 'poem-haiku-lanterns',
    meterScore: 92,
    rhymeScore: 88,
    imageryScore: 94,
    dictionScore: 81,
    tone: 'Observational reverence',
    cadence: '5/7/5 syllabic; soft caesura after line 1',
    flaggedLines: [],
    insights: [
      {
        id: 'insight-kigo',
        label: 'Kigo alignment',
        value: 'Season anchored',
        detail: 'Festival imagery signals late autumn; optional to name foliage.',
        severity: 'info',
      },
      {
        id: 'insight-breath',
        label: 'Breath pacing',
        value: 'Ideal',
        detail: 'Audible pause after line 2 matches traditional reading style.',
        severity: 'info',
      },
    ],
    nearRhymes: [],
    imageryBreakdown: [
      { label: 'Festival', percent: 55 },
      { label: 'Nature', percent: 45 },
    ],
  },
  'poem-sonnet-tide': {
    poemId: 'poem-sonnet-tide',
    meterScore: 71,
    rhymeScore: 82,
    imageryScore: 79,
    dictionScore: 76,
    tone: 'Formal resilience',
    cadence: 'Mostly iambic with occasional initial trochee',
    flaggedLines: [
      { line: 6, issue: 'Meter swell', fix: 'Remove "then" or compress clause to 10 syllables.' },
      { line: 9, issue: 'Volta clarity', fix: 'Clarify the plea to emphasise tonal shift.' },
    ],
    insights: [
      {
        id: 'insight-volta',
        label: 'Volta strength',
        value: 'Needs emphasis',
        detail: 'Line 9 setup could foreshadow engineers earlier.',
        severity: 'warning',
      },
      {
        id: 'insight-rhyme',
        label: 'End rhyme integrity',
        value: 'Solid',
        detail: 'All quatrains retain scheme; couplet sticks the landing.',
        severity: 'info',
      },
      {
        id: 'insight-diction',
        label: 'Diction mix',
        value: '62% concrete',
        detail: 'Consider modern lexicon injection to contrast classical tone.',
        severity: 'info',
      },
    ],
    nearRhymes: [
      { word: 'quay', suggestion: 'key / splay' },
      { word: 'proof', suggestion: 'roof / aloof' },
    ],
    imageryBreakdown: [
      { label: 'Maritime', percent: 58 },
      { label: 'Architecture', percent: 30 },
      { label: 'Abstract', percent: 12 },
    ],
  },
  'poem-spoken-blueprint': {
    poemId: 'poem-spoken-blueprint',
    meterScore: 64,
    rhymeScore: 75,
    imageryScore: 88,
    dictionScore: 83,
    tone: 'Community rally',
    cadence: 'Driving trochaic pulse with crowd echoes',
    flaggedLines: [
      { line: 4, issue: 'Rhyme drift', fix: 'Reinforce end beat with assonance to "beat".' },
      { line: 7, issue: 'Alliteration overload', fix: 'Reduce repeated b-sounds to preserve clarity.' },
    ],
    insights: [
      {
        id: 'insight-cadence',
        label: 'Cadence curve',
        value: 'Peaks mid-section',
        detail: 'Consider second crescendo near closing tag for symmetry.',
        severity: 'info',
      },
      {
        id: 'insight-repetition',
        label: 'Repetition balance',
        value: '4 anchors',
        detail: 'Enough hooks for audience call-backs; highlight final chorus.',
        severity: 'info',
      },
      {
        id: 'insight-performance',
        label: 'Performance timer',
        value: '3m 04s',
        detail: 'Add breath marks after lines 5 and 7 for pacing.',
        severity: 'warning',
      },
    ],
    nearRhymes: [
      { word: 'warm', suggestion: 'swarm / storm' },
      { word: 'hum', suggestion: 'drum / come' },
    ],
    imageryBreakdown: [
      { label: 'Community', percent: 44 },
      { label: 'Sound', percent: 28 },
      { label: 'Political', percent: 28 },
    ],
  },
};

export const poemCollections: PoemCollection[] = [
  {
    id: 'collection-shift-notes',
    title: 'Shift Notes',
    poemIds: ['poem-aurora-logistics', 'poem-spoken-blueprint'],
    progress: 0.68,
    status: 'sequencing',
    lastUpdated: '2024-11-19T01:20:00.000Z',
    focus: 'Industrial labor poems for chapbook release',
  },
  {
    id: 'collection-tidal-resilience',
    title: 'Tidal Resilience',
    poemIds: ['poem-sonnet-tide'],
    progress: 0.32,
    status: 'draft',
    lastUpdated: '2024-11-16T14:30:00.000Z',
    focus: 'Coastal infrastructure cycle pairing sonnets and tankas',
  },
];

export const poemExportPresets: PoemExportPreset[] = [
  {
    id: 'export-markdown',
    label: 'Markdown workshop packet',
    description: 'Plain-text layout with workshop annotations and meter map.',
    formats: ['md'],
    includes: ['Draft body', 'Line notes', 'Analysis summary'],
    plan: 'free',
  },
  {
    id: 'export-pdf-chapbook',
    label: 'PDF chapbook spread',
    description: 'Typeset spreads with title pages, section dividers, and folios.',
    formats: ['pdf'],
    includes: ['Section openers', 'Small caps titles', 'Bleed-aware layout'],
    plan: 'pro',
  },
  {
    id: 'export-docx-performance',
    label: 'DOCX performance script',
    description: 'Large-type script with stage directions and pacing marks.',
    formats: ['docx'],
    includes: ['Stage cues', 'Breath marks', 'Prompt notes'],
    plan: 'pro',
  },
];

export const poemPromptSeeds: PoemPromptSeed[] = [
  {
    id: 'seed-kintsugi-dawn',
    label: 'Kintsugi Dawn',
    description: 'Repairing community centres after a storm using golden light metaphors.',
    form: 'free-verse',
    tone: 'hopeful',
  },
  {
    id: 'seed-monsoon-haiku',
    label: 'Monsoon Lights',
    description: 'Power outages counted through paper lanterns in late autumn.',
    form: 'haiku',
    tone: 'observational',
  },
  {
    id: 'seed-assembly-anthem',
    label: 'Assembly Anthem',
    description: 'Union meeting transforms into spoken-word performance with call-backs.',
    form: 'spoken-word',
    tone: 'galvanising',
  },
  {
    id: 'seed-tidal-blueprint',
    label: 'Tidal Blueprint',
    description: 'Architects negotiate tidal charts with ghosted shipwrights.',
    form: 'sonnet',
    tone: 'formalist',
  },
];

export const poemActivityLog: PoemActivityItem[] = [
  {
    id: 'activity-pass-aurora',
    label: 'Imagery pass completed',
    detail: 'Sharpened urban dawn metaphors for "Aurora Logistics".',
    timestamp: '2024-11-18T09:45:00.000Z',
    icon: 'fa-wand-magic-sparkles',
    tone: 'success',
  },
  {
    id: 'activity-export-haiku',
    label: 'Markdown export queued',
    detail: 'Generated workshop packet for "Lantern Census".',
    timestamp: '2024-11-10T05:25:00.000Z',
    icon: 'fa-cloud-arrow-down',
    tone: 'info',
  },
  {
    id: 'activity-analysis-sonnet',
    label: 'Meter analysis refreshed',
    detail: 'Re-scanned lines 6–10 on "Sonnet for Low Tide Architects".',
    timestamp: '2024-11-16T14:15:00.000Z',
    icon: 'fa-wave-square',
    tone: 'info',
  },
  {
    id: 'activity-collection',
    label: 'Chapbook sequencing',
    detail: 'Reordered pieces inside "Shift Notes" collection.',
    timestamp: '2024-11-19T01:24:00.000Z',
    icon: 'fa-book-open',
    tone: 'success',
  },
];

export const computeLibraryMetrics = (poems: PoemSummary[]): PoemLibraryMetrics => {
  if (!poems.length) {
    return {
      totalPoems: 0,
      activeDrafts: 0,
      averageLines: 0,
      aiCallsThisWeek: 0,
      savedAnalyses: 0,
    };
  }

  const totalLines = poems.reduce((sum, poem) => sum + poem.lines, 0);
  const activeDrafts = poems.filter((poem) => poem.status === 'draft').length;
  const savedAnalyses = poems.filter((poem) => poem.analysisSummary.meterScore > 0).length;
  const aiCallsThisWeek = poems.reduce((sum, poem) => {
    const passTotal = Object.values(poem.aiPassCounts).reduce((passSum, value) => passSum + value, 0);
    return sum + passTotal;
  }, 0);

  return {
    totalPoems: poems.length,
    activeDrafts,
    averageLines: Math.round(totalLines / poems.length),
    aiCallsThisWeek,
    savedAnalyses,
  };
};

export const cloneAnalysisMap = () =>
  Object.fromEntries(
    Object.entries(poemAnalysesById).map(([id, snapshot]) => [id, clone(snapshot)])
  ) as Record<string, PoemAnalysisSnapshot>;

export const cloneWorkspaceDrafts = () =>
  Object.fromEntries(
    Object.entries(poemWorkspaceDrafts).map(([id, draft]) => [id, clone(draft)])
  ) as Record<string, PoemWorkspaceDraft>;

export const cloneCollections = () => poemCollections.map((collection) => clone(collection));
export const clonePoems = () => samplePoems.map((poem) => clone(poem));
export const clonePasses = () => poemRevisionPasses.map((pass) => clone(pass));
export const cloneForms = () => poemForms.map((form) => clone(form));
export const cloneExports = () => poemExportPresets.map((preset) => clone(preset));
export const clonePromptSeeds = () => poemPromptSeeds.map((seed) => clone(seed));
export const cloneActivity = () => poemActivityLog.map((entry) => clone(entry));

export { now };

import { clone } from '../../utils/clone';

export type FanficPlan = 'free' | 'pro';
export type FanficRating = 'G' | 'T' | 'M';
export type FanficStatus = 'idea' | 'outline' | 'draft' | 'revisions' | 'final';
export type FanficPairingType = 'romantic' | 'friendship' | 'ensemble';

export type FanficPairing = {
  id: string;
  label: string;
  type: FanficPairingType;
  consentOk: boolean;
  adultsOnly: boolean;
  dynamic: string;
  spotlight: string;
  tags: string[];
};

export type FanficTrope = {
  id: string;
  label: string;
  intensity: 0 | 1 | 2 | 3;
};

export type FanficBeat = {
  id: string;
  label: string;
  summary: string;
  status: 'outline' | 'draft' | 'refine';
  wordTarget: number;
  progress: number;
};

export type FanficChapter = {
  id: string;
  index: number;
  title: string;
  focus: string;
  wordTarget: number;
  draftedWords: number;
  tropes: string[];
  threads: string[];
  status: 'outline' | 'draft' | 'final';
};

export type FanficScene = {
  id: string;
  chapterId: string | null;
  title: string;
  pov: string;
  tone: string[];
  summary: string;
  wordTarget: number;
  wordCount: number;
  status: 'idea' | 'draft' | 'revise' | 'final';
  warnings: string[];
};

export type FanficCharacter = {
  id: string;
  name: string;
  role: 'lead' | 'supporting' | 'antagonist' | 'ensemble';
  age: number | null;
  archetype: string;
  voice: string;
  motivations: string[];
  secrets: string[];
  relationships: { targetId: string; label: string; dynamic: string }[];
};

export type FanficThread = {
  id: string;
  name: string;
  type: 'ship' | 'motif' | 'clue' | 'theme';
  color: string;
  beatCoverage: string[];
  chapterCoverage: { chapterId: string; intensity: 0 | 1 | 2 | 3 }[];
};

export type FanficLoreEntry = {
  id: string;
  type: 'faction' | 'item' | 'location' | 'rule';
  title: string;
  summary: string;
  detail: string;
};

export type FanficSafetyCheck = {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'needs-review';
  detail: string;
  recommendation: string;
};

export type FanficBetaNote = {
  id: string;
  sceneId: string | null;
  type: 'pacing' | 'voice' | 'consistency' | 'style' | 'safety';
  text: string;
  status: 'open' | 'resolved';
  assignedTo: string;
};

export type FanficExportJob = {
  id: string;
  format: 'md' | 'docx' | 'epub' | 'html';
  status: 'queued' | 'rendering' | 'ready' | 'error';
  createdAt: string;
  note: string;
};

export type FanficActivity = {
  id: string;
  icon: string;
  color: string;
  label: string;
  detail: string;
  timestamp: string;
};

export type FanficMetrics = {
  activeProjects: number;
  draftsInQueue: number;
  wordsTracked: number;
  betaNotesOpen: number;
  exportsReady: number;
};

export type FanficProject = {
  id: string;
  title: string;
  fandom: string;
  auPreset: string;
  status: FanficStatus;
  rating: FanficRating;
  language: string;
  tags: string[];
  summary: string;
  warnings: string[];
  triggers: string[];
  targetWords: number;
  wordsWritten: number;
  wordGoalPerChapter: number;
  lastEdited: string;
  planGate: FanficPlan | 'free';
  pairings: FanficPairing[];
  tropes: FanficTrope[];
  beats: FanficBeat[];
  chapters: FanficChapter[];
  scenes: FanficScene[];
  characters: FanficCharacter[];
  threads: FanficThread[];
  lore: FanficLoreEntry[];
  style: {
    pov: string;
    tense: string;
    tone: { fluff: number; angst: number; humor: number; suspense: number };
    pacing: 'slow' | 'medium' | 'fast';
    rating: FanficRating;
  };
  safetyChecks: FanficSafetyCheck[];
  betaNotes: FanficBetaNote[];
  exportJobs: FanficExportJob[];
  timeline: { id: string; label: string; when: string; summary: string; threadIds: string[] }[];
};

export type FanficAuPreset = {
  id: string;
  label: string;
  description: string;
  setting: string;
  conflicts: string[];
  vibe: string;
  plan: FanficPlan | 'free';
};

export type FanficTropeBundle = {
  id: string;
  label: string;
  description: string;
  tropes: string[];
  plan: FanficPlan | 'free';
};

export type FanficPlanMatrixRow = {
  feature: string;
  free: string;
  pro: string;
};

export type FanficWorkspaceTab = {
  id: 'overview' | 'beats' | 'chapters' | 'characters' | 'au' | 'threads' | 'safety' | 'beta' | 'exports';
  label: string;
  icon: string;
  description: string;
};

export type FanficWizardState = {
  fandom: string;
  title: string;
  canonNotes: string;
  auPresetId: string;
  customSetting: string;
  summary: string;
  rating: FanficRating;
  warnings: string[];
  pairings: {
    label: string;
    type: FanficPairingType;
    adultsOnly: boolean;
    consentOk: boolean;
    dynamic: string;
  }[];
  tropes: string[];
  tone: {
    fluff: number;
    angst: number;
    humor: number;
    suspense: number;
    pace: 'slow' | 'medium' | 'fast';
    pov: string;
    tense: string;
  };
  wordTarget: number;
  chapters: number;
};

const isoDaysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

export const fanficWorkspaceTabs: FanficWorkspaceTab[] = [
  { id: 'overview', label: 'Overview', icon: 'fa-chart-simple', description: 'Project health, style, and roadmap snapshot.' },
  { id: 'beats', label: 'Beats Planner', icon: 'fa-timeline', description: 'Canon-aware beats tuned to romance and adventure tropes.' },
  { id: 'chapters', label: 'Chapters', icon: 'fa-book-open', description: 'Chapter grid with trope coverage and word targets.' },
  { id: 'characters', label: 'Characters', icon: 'fa-users-line', description: 'Relationship dynamics, voices, and promises to pay off.' },
  { id: 'au', label: 'AU & Lore', icon: 'fa-planet-ringed', description: 'Alternate universe presets, rules, and lore notebooks.' },
  { id: 'threads', label: 'Threads', icon: 'fa-diagram-project', description: 'Track ships, motifs, and mystery clues across chapters.' },
  { id: 'safety', label: 'Safety', icon: 'fa-shield-heart', description: 'Ratings, warnings, and consent validation.' },
  { id: 'beta', label: 'Beta Notes', icon: 'fa-comments', description: 'Feedback queue with pacing and tone suggestions.' },
  { id: 'exports', label: 'Exports', icon: 'fa-file-export', description: 'Compile Markdown, DOCX, EPUB, and AO3-friendly HTML.' },
];

export const fanficAuPresets: FanficAuPreset[] = [
  {
    id: 'coffee-shop',
    label: 'Coffee Shop Slow Burn',
    description: 'Cozy third-place setting with found family staff and regulars.',
    setting: 'City cafe wedged between a record shop and night market.',
    conflicts: ['Secret identity regular', 'Corporate landlord eviction clock', 'Seasonal event fundraiser'],
    vibe: 'Warm lighting, latte art diplomacy, rainy afternoons.',
    plan: 'free',
  },
  {
    id: 'royalty-au',
    label: 'Royalty Intrigue',
    description: 'Succession struggle with treaties, ballroom politics, and secret heirs.',
    setting: 'Twin kingdoms bound by an uneasy lunar accord.',
    conflicts: ['Arranged betrothal clause', 'Assassin guild whispers', 'Prophecy misinterpretation'],
    vibe: 'Gilded courts, masked galas, duty vs. desire.',
    plan: 'pro',
  },
  {
    id: 'space-opera',
    label: 'Space Opera Fleet',
    description: 'Ragtag crew aboard a diplomatic frigate navigating rebellions.',
    setting: 'Starbridge vessel "Asteria" patrolling the Orion ribbon.',
    conflicts: ['Treaty sabotage', 'Rogue AI co-pilot', 'Forbidden telepath bond'],
    vibe: 'Synthwave glow, EVA confessions, zero-g training deck.',
    plan: 'pro',
  },
  {
    id: 'college-au',
    label: 'College Debate Team',
    description: 'Rivals-to-lovers across academic tournaments and found family dorm life.',
    setting: 'Cosmopolitan university with midnight study den and rooftop greenhouse.',
    conflicts: ['Scholarship jeopardy', 'Viral livestream mishap', 'Old coach politics'],
    vibe: 'Late-night ramen, whiteboard strategies, supportive roommates.',
    plan: 'free',
  },
];

export const fanficTropeBundles: FanficTropeBundle[] = [
  {
    id: 'slow-burn-starter',
    label: 'Slow Burn Starter Pack',
    description: 'Enemies-to-lovers beats with mutual pining and promise/payoff reminders.',
    tropes: ['enemies-to-lovers', 'mutual pining', 'found family', 'late night confidences'],
    plan: 'free',
  },
  {
    id: 'royal-conspiracy',
    label: 'Royal Conspiracy',
    description: 'Masks, court intrigue, secret identity reveals, and midnight garden meetings.',
    tropes: ['secret identity', 'duty vs heart', 'political alliance', 'masked ball'],
    plan: 'pro',
  },
  {
    id: 'sci-fi-drama',
    label: 'Space Opera Drama',
    description: 'Telepathic bonds, time loop, and AI caretaker angst for galaxy-sized stakes.',
    tropes: ['telepath bond', 'time loop', 'sacrificial rescue', 'rebellion spark'],
    plan: 'pro',
  },
];

export const fanficPlanMatrix: FanficPlanMatrixRow[] = [
  { feature: 'Projects', free: '2 active', pro: 'Unlimited' },
  { feature: 'Word cap/project', free: '40k words', pro: '200k words' },
  { feature: 'AU & trope packs', free: 'Starter set', pro: 'Full library + custom' },
  { feature: 'Beta critique', free: 'Lite summaries', pro: 'Line-level with inline comments' },
  { feature: 'Exports', free: 'Markdown', pro: 'Markdown, DOCX, EPUB, AO3 HTML' },
  { feature: 'Continuity history', free: 'Last 3 snapshots', pro: 'Unlimited + branching' },
  { feature: 'Safety automation', free: 'Rating & trigger checklist', pro: 'Consent, age, and canon drift guard' },
];

const samplePairings: FanficPairing[] = [
  {
    id: 'pair-lyra-corin',
    label: 'Lyra/Corin',
    type: 'romantic',
    consentOk: true,
    adultsOnly: true,
    dynamic: 'Enemies-to-allies -> reluctant co-rulers',
    spotlight: 'Heated balcony arguments under lunar eclipse treaties.',
    tags: ['slow burn', 'political intrigue', 'duty vs desire'],
  },
  {
    id: 'pair-crew-found',
    label: 'Crew & Found Family',
    type: 'ensemble',
    consentOk: true,
    adultsOnly: true,
    dynamic: 'Bridge crew loyalty pact',
    spotlight: 'Zero-g karaoke after a narrow treaty run.',
    tags: ['found family', 'ensemble'],
  },
  {
    id: 'pair-caden-juno',
    label: 'Caden/Juno',
    type: 'romantic',
    consentOk: true,
    adultsOnly: true,
    dynamic: 'Debate rivals forced into co-captaincy',
    spotlight: 'Practice round banter turns into truth or dare.',
    tags: ['rivals to lovers', 'college AU'],
  },
];

const sampleCharacters: FanficCharacter[] = [
  {
    id: 'char-lyra',
    name: 'Lyra of House Solenne',
    role: 'lead',
    age: 24,
    archetype: 'Reluctant heir',
    voice: 'Formal cadence softening into playful wit.',
    motivations: ['Protect her sibling', 'Secure fair treaties', 'Find authentic love'],
    secrets: ['Secretly leads night market aid network'],
    relationships: [
      { targetId: 'char-corin', label: 'Political rival', dynamic: 'From icy diplomacy to shared rule' },
      { targetId: 'char-elys', label: 'Younger sibling', dynamic: 'Promise to keep them away from throne games' },
    ],
  },
  {
    id: 'char-corin',
    name: 'Corin of the Eclipse Guard',
    role: 'lead',
    age: 26,
    archetype: 'Stoic strategist',
    voice: 'Measured, dry humor with rare softness.',
    motivations: ['Prevent civil war', 'Protect Lyra in secret', 'Uncover assassin guild'],
    secrets: ['Masked vigilante investigating court corruption'],
    relationships: [{ targetId: 'char-lyra', label: 'Guarded ally', dynamic: 'Vows tested by prophecy' }],
  },
  {
    id: 'char-juno',
    name: 'Juno Park',
    role: 'lead',
    age: 19,
    archetype: 'Prodigy orator',
    voice: 'Rapid-fire insights with heartfelt sincerity.',
    motivations: ['Win nationals', 'Protect team from burnout', 'Heal from viral scandal'],
    secrets: ['Secretly writes fanfic about rival schools'],
    relationships: [{ targetId: 'char-caden', label: 'Academic rival', dynamic: 'Reluctant trust after road trip' }],
  },
];

const sampleThreads: FanficThread[] = [
  {
    id: 'thread-oath',
    name: 'Moonlit Oath',
    type: 'ship',
    color: '#a855f7',
    beatCoverage: ['meet-cute', 'forced-alliance', 'reveal'],
    chapterCoverage: [
      { chapterId: 'chap-1', intensity: 1 },
      { chapterId: 'chap-2', intensity: 2 },
      { chapterId: 'chap-5', intensity: 3 },
    ],
  },
  {
    id: 'thread-rebellion',
    name: 'Velvet Rebellion',
    type: 'theme',
    color: '#f97316',
    beatCoverage: ['inciting', 'pivot', 'climax'],
    chapterCoverage: [
      { chapterId: 'chap-2', intensity: 1 },
      { chapterId: 'chap-4', intensity: 2 },
      { chapterId: 'chap-6', intensity: 2 },
    ],
  },
  {
    id: 'thread-case',
    name: 'Nationals Trophy',
    type: 'motif',
    color: '#14b8a6',
    beatCoverage: ['meet-cute', 'debate-loss', 'championship'],
    chapterCoverage: [
      { chapterId: 'chap-a1', intensity: 1 },
      { chapterId: 'chap-a3', intensity: 3 },
    ],
  },
];

const sampleLore: FanficLoreEntry[] = [
  {
    id: 'lore-accord',
    type: 'rule',
    title: 'Silver Accord Treaty',
    summary: 'Defines 5-year co-rule rotation and eclipse rituals.',
    detail: 'Missing clause reveals clause 13b, enabling annulment if hearts are not aligned under lunar witness.',
  },
  {
    id: 'lore-market',
    type: 'location',
    title: 'Midnight Market',
    summary: 'Neutral ground for houses and commoners to trade favors.',
    detail: 'Hidden passage leads to rebel safehouse and moonstone caches.',
  },
  {
    id: 'lore-campus',
    type: 'location',
    title: 'Aurora University Greenhouse',
    summary: 'After-hours refuge with bioluminescent study pods.',
    detail: 'Debate team uses it as secret practice space with ambient playlists.',
  },
];

const sampleBeats: FanficBeat[] = [
  {
    id: 'meet-cute',
    label: 'Moonlit Debut',
    summary: 'Lyra and Corin forced into a diplomatic dance to save treaty optics.',
    status: 'outline',
    wordTarget: 2800,
    progress: 45,
  },
  {
    id: 'forced-alliance',
    label: 'Forced Alliance',
    summary: 'Council vote ties them as co-regents for 30 days.',
    status: 'draft',
    wordTarget: 3200,
    progress: 72,
  },
  {
    id: 'reveal',
    label: 'Secret Identity Reveal',
    summary: 'Corin confesses vigilante role to prevent Lyra&apos;s execution.',
    status: 'outline',
    wordTarget: 3500,
    progress: 35,
  },
];

const sampleChapters: FanficChapter[] = [
  {
    id: 'chap-1',
    index: 1,
    title: 'Eclipse Gala',
    focus: 'Introduce treaty tensions and balcony promise.',
    wordTarget: 4800,
    draftedWords: 3600,
    tropes: ['masked ball', 'enemies-to-lovers'],
    threads: ['thread-oath'],
    status: 'draft',
  },
  {
    id: 'chap-2',
    index: 2,
    title: 'Night Market Overture',
    focus: 'Alliance negotiations amid rebel rumors.',
    wordTarget: 5200,
    draftedWords: 2800,
    tropes: ['secret identity', 'found family'],
    threads: ['thread-oath', 'thread-rebellion'],
    status: 'outline',
  },
  {
    id: 'chap-5',
    index: 5,
    title: 'Moonlit Vow',
    focus: 'Confession under lunar eclipse countdown.',
    wordTarget: 5400,
    draftedWords: 1500,
    tropes: ['mutual pining', 'oath under stars'],
    threads: ['thread-oath'],
    status: 'outline',
  },
];

const sampleScenes: FanficScene[] = [
  {
    id: 'scene-1',
    chapterId: 'chap-1',
    title: 'Balcony Confrontation',
    pov: 'Lyra',
    tone: ['angst', 'longing'],
    summary: 'Lyra corners Corin about assassination rumor. Sparks fly with veiled threats.',
    wordTarget: 1800,
    wordCount: 1200,
    status: 'draft',
    warnings: ['violence'],
  },
  {
    id: 'scene-2',
    chapterId: 'chap-2',
    title: 'Night Market Stakeout',
    pov: 'Corin',
    tone: ['suspense', 'humor'],
    summary: 'Found family crew reveals hidden safehouse while teasing Lyra.',
    wordTarget: 1500,
    wordCount: 800,
    status: 'outline',
    warnings: ['injury'],
  },
  {
    id: 'scene-a3',
    chapterId: 'chap-a3',
    title: 'Road Trip Confession',
    pov: 'Juno',
    tone: ['fluff', 'humor'],
    summary: 'Debate rivals stuck on bus, share playlists, confess anxieties.',
    wordTarget: 1300,
    wordCount: 1300,
    status: 'final',
    warnings: [],
  },
];

const sampleSafetyChecks: FanficSafetyCheck[] = [
  {
    id: 'safety-rating',
    label: 'Rating alignment',
    status: 'pass',
    detail: 'Content within Teen parameters.',
    recommendation: 'Continue using fade-to-black for intimate scenes.',
  },
  {
    id: 'safety-consent',
    label: 'Consent verification',
    status: 'pass',
    detail: 'All romantic scenes flagged with explicit consent beats.',
    recommendation: 'Log consent cues in chapter summaries.',
  },
  {
    id: 'safety-trigger',
    label: 'Trigger warnings',
    status: 'warn',
    detail: 'Violence spike in Chapter 6 needs warning update.',
    recommendation: 'Add injury/assassination attempt tags before export.',
  },
];

const sampleBetaNotes: FanficBetaNote[] = [
  {
    id: 'beta-1',
    sceneId: 'scene-1',
    type: 'pacing',
    text: 'Consider trimming the second argument to keep tension tight.',
    status: 'open',
    assignedTo: 'Nova',
  },
  {
    id: 'beta-2',
    sceneId: 'scene-2',
    type: 'consistency',
    text: 'Canon check: rebel leader alias spelled differently earlier.',
    status: 'open',
    assignedTo: 'Atlas',
  },
  {
    id: 'beta-3',
    sceneId: null,
    type: 'style',
    text: 'Great use of cadence in chapter tags; keep AO3-friendly formatting.',
    status: 'resolved',
    assignedTo: 'Nova',
  },
];

const sampleExports: FanficExportJob[] = [
  {
    id: 'export-md',
    format: 'md',
    status: 'ready',
    createdAt: isoDaysAgo(1),
    note: 'Markdown package compiled for beta readers.',
  },
  {
    id: 'export-epub',
    format: 'epub',
    status: 'rendering',
    createdAt: isoDaysAgo(0.2),
    note: 'EPUB queued with cover art.',
  },
];

const sampleTimeline = [
  {
    id: 'time-1',
    label: 'Treaty Signing',
    when: 'Month 1 - Eclipse Eve',
    summary: 'Joint decree to co-rule temporarily.',
    threadIds: ['thread-oath', 'thread-rebellion'],
  },
  {
    id: 'time-2',
    label: 'Night Market Fire',
    when: 'Month 1 - Week 2',
    summary: 'Rebel attack foreshadows hidden mastermind.',
    threadIds: ['thread-rebellion'],
  },
  {
    id: 'time-3',
    label: 'Nationals Semifinal',
    when: 'Semester 2 - Finals week',
    summary: 'Juno and Caden forced into impromptu partnership.',
    threadIds: ['thread-case'],
  },
];

export const sampleFanficProjects: FanficProject[] = [
  {
    id: 'ff-starlit-accord',
    title: 'Starlit Accord',
    fandom: 'Stellar Knights',
    auPreset: 'royalty-au',
    status: 'draft',
    rating: 'T',
    language: 'en',
    tags: ['slow burn', 'royalty AU', 'fix-it'],
    summary: 'What if the eclipse treaty forced Lyra and Corin into co-rule? A political slow burn with vigilante confessions.',
    warnings: ['violence', 'injury'],
    triggers: ['assassination attempt', 'political coercion'],
    targetWords: 90000,
    wordsWritten: 24500,
    wordGoalPerChapter: 5000,
    lastEdited: isoDaysAgo(0.3),
    planGate: 'pro',
    pairings: samplePairings.slice(0, 2),
    tropes: [
      { id: 'trope-enemies', label: 'Enemies to lovers', intensity: 3 },
      { id: 'trope-secret', label: 'Secret identity', intensity: 2 },
      { id: 'trope-found', label: 'Found family', intensity: 2 },
    ],
    beats: sampleBeats,
    chapters: sampleChapters,
    scenes: sampleScenes.slice(0, 2),
    characters: sampleCharacters.slice(0, 2),
    threads: sampleThreads.slice(0, 2),
    lore: sampleLore.slice(0, 2),
    style: { pov: '3rd limited (Lyra/Corin)', tense: 'past', tone: { fluff: 1, angst: 3, humor: 1, suspense: 3 }, pacing: 'medium', rating: 'T' },
    safetyChecks: sampleSafetyChecks,
    betaNotes: sampleBetaNotes.slice(0, 2),
    exportJobs: sampleExports,
    timeline: sampleTimeline.slice(0, 2),
  },
  {
    id: 'ff-last-argument',
    title: 'The Last Argument',
    fandom: 'Orion Debate Club',
    auPreset: 'college-au',
    status: 'outline',
    rating: 'T',
    language: 'en',
    tags: ['college AU', 'rivals to lovers', 'found family'],
    summary: 'A collegiate debate team rebuilds after a viral scandal while rivals realize they have always written the same fanfic.',
    warnings: ['anxiety'],
    triggers: ['online harassment (referenced)'],
    targetWords: 65000,
    wordsWritten: 12000,
    wordGoalPerChapter: 3800,
    lastEdited: isoDaysAgo(1.2),
    planGate: 'free',
    pairings: [samplePairings[2]],
    tropes: [
      { id: 'trope-rivals', label: 'Academic rivals', intensity: 3 },
      { id: 'trope-fake', label: 'Fake dating for scholarship', intensity: 2 },
      { id: 'trope-found', label: 'Found family', intensity: 2 },
    ],
    beats: [
      {
        id: 'debate-loss',
        label: 'Opening Loss',
        summary: 'Team loses first invitational due to viral distraction.',
        status: 'outline',
        wordTarget: 2200,
        progress: 20,
      },
      {
        id: 'road-trip',
        label: 'Road Trip Detour',
        summary: 'Bus breakdown forces heart-to-heart with playlist swap.',
        status: 'draft',
        wordTarget: 2600,
        progress: 65,
      },
    ],
    chapters: [
      {
        id: 'chap-a1',
        index: 1,
        title: 'Viral Fallout',
        focus: 'Team damage control and PR plan.',
        wordTarget: 3600,
        draftedWords: 1600,
        tropes: ['found family'],
        threads: ['thread-case'],
        status: 'outline',
      },
      {
        id: 'chap-a3',
        index: 3,
        title: 'Road Trip Ties',
        focus: 'Enemies share vulnerabilities on long ride.',
        wordTarget: 4000,
        draftedWords: 2800,
        tropes: ['mutual pining'],
        threads: ['thread-case'],
        status: 'draft',
      },
    ],
    scenes: [sampleScenes[2]],
    characters: [sampleCharacters[2]],
    threads: [sampleThreads[2]],
    lore: [sampleLore[2]],
    style: { pov: '1st dual POV', tense: 'present', tone: { fluff: 3, angst: 2, humor: 3, suspense: 1 }, pacing: 'fast', rating: 'T' },
    safetyChecks: [
      {
        id: 'safety-rating',
        label: 'Rating alignment',
        status: 'pass',
        detail: 'Teen rating verified. No explicit content flagged.',
        recommendation: 'Keep anxiety depiction to fade-to-black panic attack.',
      },
      {
        id: 'safety-trigger',
        label: 'Trigger warnings',
        status: 'pass',
        detail: 'Warnings logged for online harassment mentions.',
        recommendation: 'Add comfort scene tags for recovery chapters.',
      },
    ],
    betaNotes: [sampleBetaNotes[2]],
    exportJobs: [
      {
        id: 'export-outline',
        format: 'md',
        status: 'ready',
        createdAt: isoDaysAgo(2),
        note: 'Outline package shared with coach.',
      },
    ],
    timeline: sampleTimeline.slice(2),
  },
];

export const fanficActivityLog: FanficActivity[] = [
  {
    id: 'activity-1',
    icon: 'fa-wand-magic-sparkles',
    color: 'text-indigo-500',
    label: 'Beat sheet regenerated',
    detail: 'Applied Royalty Intrigue preset to Starlit Accord.',
    timestamp: isoDaysAgo(0.1),
  },
  {
    id: 'activity-2',
    icon: 'fa-heart-circle-check',
    color: 'text-rose-500',
    label: 'Consent check passed',
    detail: 'Adult verification logged for Moonlit Vow chapter.',
    timestamp: isoDaysAgo(0.2),
  },
  {
    id: 'activity-3',
    icon: 'fa-comments',
    color: 'text-emerald-500',
    label: 'Beta note resolved',
    detail: 'Nova cleared pacing note on Balcony Confrontation.',
    timestamp: isoDaysAgo(0.5),
  },
  {
    id: 'activity-4',
    icon: 'fa-file-export',
    color: 'text-sky-500',
    label: 'Export ready',
    detail: 'Markdown packet compiled for Orion Debate Club.',
    timestamp: isoDaysAgo(1.1),
  },
];

export const defaultFanficWizardState: FanficWizardState = {
  fandom: 'Stellar Knights',
  title: 'Eclipse Pact Rewrite',
  canonNotes: 'Fix-it after season 3 finale. Keep canon couples alive, rescue missing sibling.',
  auPresetId: 'royalty-au',
  customSetting: 'Twin kingdoms share a moonlit market; rebels tunnel under palace observatory.',
  summary: 'Rewrite the finale where Lyra and Corin broker peace via arranged co-rule while uncovering assassin guild plots.',
  rating: 'T',
  warnings: ['violence'],
  pairings: [
    {
      label: 'Lyra/Corin',
      type: 'romantic',
      adultsOnly: true,
      consentOk: true,
      dynamic: 'Enemies-to-lovers slow burn',
    },
    {
      label: 'Crew Found Family',
      type: 'ensemble',
      adultsOnly: true,
      consentOk: true,
      dynamic: 'Bridge crew loyalty + family dinners',
    },
  ],
  tropes: ['enemies-to-lovers', 'found family', 'secret identity'],
  tone: {
    fluff: 1,
    angst: 3,
    humor: 1,
    suspense: 3,
    pace: 'medium',
    pov: '3rd limited dual POV',
    tense: 'past',
  },
  wordTarget: 85000,
  chapters: 18,
};

export const computeFanficMetrics = (projects: FanficProject[]): FanficMetrics => {
  const activeProjects = projects.filter((project) => project.status !== 'final').length;
  const wordsTracked = projects.reduce((total, project) => total + project.wordsWritten, 0);
  const draftsInQueue = projects.reduce((total, project) => total + project.chapters.filter((chapter) => chapter.status !== 'final').length, 0);
  const betaNotesOpen = projects.reduce((total, project) => total + project.betaNotes.filter((note) => note.status === 'open').length, 0);
  const exportsReady = projects.reduce((total, project) => total + project.exportJobs.filter((job) => job.status === 'ready').length, 0);
  return { activeProjects, draftsInQueue, wordsTracked, betaNotesOpen, exportsReady };
};

export const createFanficProjectFromWizard = (wizard: FanficWizardState, plan: FanficPlan): FanficProject => {
  const id = `ff-${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();
  const tropes: FanficTrope[] = wizard.tropes.map((label, index) => ({
    id: `trope-${index}-${label.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`,
    label,
    intensity: (index % 3 + 1) as 1 | 2 | 3,
  }));
  const chapters: FanficChapter[] = Array.from({ length: Math.min(6, wizard.chapters) }).map((_, index) => ({
    id: `chap-${index + 1}-${id}`,
    index: index + 1,
    title: `Chapter ${index + 1}`,
    focus: index === 0 ? 'Inciting incident rewrite' : `Chapter beat ${index + 1}`,
    wordTarget: Math.round(wizard.wordTarget / wizard.chapters),
    draftedWords: index === 0 ? Math.round((wizard.wordTarget / wizard.chapters) * 0.4) : 0,
    tropes: tropes.slice(0, 2).map((trope) => trope.label),
    threads: [],
    status: index === 0 ? 'draft' : 'outline',
  }));

  const beats: FanficBeat[] = [
    {
      id: `beat-hook-${id}`,
      label: 'Canon hook',
      summary: wizard.canonNotes.slice(0, 120),
      status: 'outline',
      wordTarget: Math.round(wizard.wordTarget * 0.05),
      progress: 20,
    },
    {
      id: `beat-pivot-${id}`,
      label: 'AU pivot',
      summary: wizard.customSetting.slice(0, 140),
      status: 'draft',
      wordTarget: Math.round(wizard.wordTarget * 0.08),
      progress: 55,
    },
  ];

  const pairings: FanficPairing[] = wizard.pairings.map((pairing, index) => ({
    id: `pair-${id}-${index}`,
    label: pairing.label,
    type: pairing.type,
    consentOk: pairing.consentOk,
    adultsOnly: pairing.adultsOnly,
    dynamic: pairing.dynamic,
    spotlight: `${pairing.dynamic} — planned scene at Chapter ${index + 2}.`,
    tags: [pairing.dynamic.toLowerCase()],
  }));

  const characters: FanficCharacter[] = pairings.map((pairing, index) => ({
    id: `char-${id}-${index}`,
    name: pairing.label.split(/[\/]/)[0] ?? `Character ${index + 1}`,
    role: index === 0 ? 'lead' : 'supporting',
    age: 20 + index,
    archetype: index === 0 ? 'Protagonist rewrite' : 'Co-lead',
    voice: 'Voice inherits from canon but adjusted for AU palette.',
    motivations: ['Rewrite canon fate', 'Protect found family'],
    secrets: ['Hidden letter in canon timeline'],
    relationships: pairings.map((inner, innerIndex) => ({
      targetId: `char-${id}-${innerIndex}`,
      label: inner.label,
      dynamic: inner.dynamic,
    })),
  }));

  const project: FanficProject = {
    id,
    title: wizard.title,
    fandom: wizard.fandom,
    auPreset: wizard.auPresetId,
    status: 'outline',
    rating: wizard.rating,
    language: 'en',
    tags: wizard.tropes.slice(0, 3),
    summary: wizard.summary,
    warnings: wizard.warnings,
    triggers: wizard.warnings,
    targetWords: wizard.wordTarget,
    wordsWritten: Math.round(wizard.wordTarget * 0.12),
    wordGoalPerChapter: Math.round(wizard.wordTarget / wizard.chapters),
    lastEdited: now,
    planGate: plan,
    pairings,
    tropes,
    beats,
    chapters,
    scenes: [],
    characters,
    threads: [],
    lore: [],
    style: {
      pov: wizard.tone.pov,
      tense: wizard.tone.tense,
      tone: {
        fluff: wizard.tone.fluff,
        angst: wizard.tone.angst,
        humor: wizard.tone.humor,
        suspense: wizard.tone.suspense,
      },
      pacing: wizard.tone.pace,
      rating: wizard.rating,
    },
    safetyChecks: [
      {
        id: 'wizard-safety',
        label: 'Safety checklist initialized',
        status: 'pass',
        detail: 'Template applied from wizard selections.',
        recommendation: 'Log additional warnings per chapter.',
      },
    ],
    betaNotes: [],
    exportJobs: [],
    timeline: [],
  };

  return project;
};

export const cloneFanficProject = (project: FanficProject): FanficProject => clone(project);

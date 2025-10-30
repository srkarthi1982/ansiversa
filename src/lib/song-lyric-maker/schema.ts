import { clone } from '../../alpineStores/base';

export type SongPlan = 'free' | 'pro';

export type SongGenreKey =
  | 'pop'
  | 'hip-hop'
  | 'indie'
  | 'rnb'
  | 'edm'
  | 'kpop'
  | 'country'
  | 'devotional'
  | 'kids';

export type SongStatus = 'draft' | 'final';

export type SongSectionType =
  | 'intro'
  | 'verse'
  | 'pre-chorus'
  | 'chorus'
  | 'bridge'
  | 'breakdown'
  | 'outro';

export type SongLine = {
  number: number;
  text: string;
  syllables: number;
  rhymeKey: string;
  stressPattern?: string;
  note?: string;
  beat?: string;
};

export type SongSection = {
  id: string;
  type: SongSectionType;
  label: string;
  description: string;
  targetSyllables: number[];
  rhymeScheme: string;
  lines: SongLine[];
  emphasis?: 'hook' | 'story' | 'lift';
  prosodyNotes?: string;
};

export type SongHookVariant = {
  id: string;
  text: string;
  syllables: number;
  rhymeKey: string;
  punchScore: number;
  singScore: number;
  stressShape: string;
  keywords: string[];
  plan?: SongPlan;
};

export type SongAnalysisWarning = {
  id: string;
  line: number;
  message: string;
  severity: 'info' | 'warn' | 'critical';
};

export type SongAnalysisSnapshot = {
  projectId: string;
  rhymeTightness: number;
  nearRhymes: number;
  syllableBalance: string;
  stressAlignment: string;
  hookLift: string;
  vocabularyHeat: string;
  warnings: SongAnalysisWarning[];
  motifHighlights: string[];
};

export type SongTempoMap = {
  bpm: number;
  timeSignature: string;
  feel: 'straight' | 'swing' | 'half-time';
  groove: string;
  bars: number;
  key?: string;
};

export type SongRevisionPassKey =
  | 'hookPunch'
  | 'singability'
  | 'imagery'
  | 'tighten'
  | 'clean'
  | 'translation';

export type SongRevisionPass = {
  key: SongRevisionPassKey;
  label: string;
  description: string;
  bestFor: string;
  gating: SongPlan;
  prompt: string;
};

export type SongStructureTemplate = {
  id: string;
  label: string;
  genre: SongGenreKey;
  plan: SongPlan;
  description: string;
  sectionOrder: SongSectionType[];
  syllableTargets: Partial<Record<SongSectionType, number[]>>;
};

export type SongExportPreset = {
  id: string;
  label: string;
  description: string;
  formats: ('md' | 'pdf' | 'docx' | 'csv')[];
  includes: string[];
  plan: SongPlan;
};

export type SongActivityItem = {
  id: string;
  label: string;
  detail: string;
  timestamp: string;
  tone: 'success' | 'info' | 'warning';
  icon: string;
};

export type SongProject = {
  id: string;
  title: string;
  genre: SongGenreKey;
  status: SongStatus;
  language: 'en' | 'es' | 'ta' | 'ar';
  tone: string;
  persona: string;
  theme: string;
  tags: string[];
  chords?: string;
  createdAt: string;
  updatedAt: string;
  hook: { text: string; variantId: string | null; keywords: string[] };
  hookVariants: SongHookVariant[];
  sections: SongSection[];
  analysis: SongAnalysisSnapshot;
  tempo: SongTempoMap;
  exports: { format: string; timestamp: string }[];
  pinned?: boolean;
  aiUsage: { drafts: number; passes: number; analyses: number; exports: number };
  planLocks?: { nearRhyme?: boolean; export?: boolean; multilingual?: boolean };
  structureTemplateId: string;
  customSyllableMap?: boolean;
  cleanLyrics?: boolean;
};

export type SongLibraryMetrics = {
  totalProjects: number;
  activeDrafts: number;
  averageBpm: number;
  averageSections: number;
  exportsThisMonth: number;
};

export type SongPlanLimits = {
  hooksPerPrompt: number;
  projects: number | 'unlimited';
  nearRhyme: 'basic' | 'full';
  exports: readonly ('md' | 'pdf' | 'docx' | 'csv')[];
  multilingual: readonly string[];
};

const iso = (input: string): string => new Date(input).toISOString();

const now = () => new Date().toISOString();

export const songPlanLimits: Record<SongPlan, SongPlanLimits> = {
  free: {
    hooksPerPrompt: 5,
    projects: 3,
    nearRhyme: 'basic',
    exports: ['md'] as const,
    multilingual: ['en'],
  },
  pro: {
    hooksPerPrompt: 30,
    projects: 'unlimited',
    nearRhyme: 'full',
    exports: ['md', 'pdf', 'docx', 'csv'] as const,
    multilingual: ['en', 'es', 'ta', 'ar'],
  },
};

export const songRevisionPasses: SongRevisionPass[] = [
  {
    key: 'hookPunch',
    label: 'Hook punch-up',
    description: 'Sharpen contrast, tighten syllable lift, and foreground the central image.',
    bestFor: 'Hooks that feel flat or overly wordy.',
    gating: 'free',
    prompt: 'Intensify hook imagery, ensure leading stresses land on downbeats, keep under 9 syllables.',
  },
  {
    key: 'singability',
    label: 'Singability smoother',
    description: 'Reduce tongue-twisters and rebalance vowels/consonants for melodic phrasing.',
    bestFor: 'Verses that feel clunky when sung.',
    gating: 'pro',
    prompt: 'Rewrite lines to ease articulation, sustain long vowels on strong beats, keep rhyme shape intact.',
  },
  {
    key: 'imagery',
    label: 'Imagery boost',
    description: 'Swap vague phrases for sensory language and narrative anchors.',
    bestFor: 'Sections needing stronger storytelling.',
    gating: 'free',
    prompt: 'Infuse concrete details tied to the theme while preserving rhythm and rhyme anchors.',
  },
  {
    key: 'tighten',
    label: 'Tighten structure',
    description: 'Compress rambling sections and align syllable counts to the template.',
    bestFor: 'Long verses spilling off the measure.',
    gating: 'pro',
    prompt: 'Condense each line to target syllable count, keep rhyme letters consistent, maintain narrative flow.',
  },
  {
    key: 'clean',
    label: 'Clean version',
    description: 'Automatically soften profanity while keeping rhyme and cadence intact.',
    bestFor: 'Preparing radio edits or school-friendly versions.',
    gating: 'free',
    prompt: 'Replace explicit terms with clean alternatives, keep syllable counts unchanged.',
  },
  {
    key: 'translation',
    label: 'Translation assist',
    description: 'Adapt lyrics into another language with prosody notes and rhyme suggestions.',
    bestFor: 'Multilingual releases or demos.',
    gating: 'pro',
    prompt: 'Translate into the requested language, offer near-rhyme pairs, and note any meter deviations.',
  },
];

export const songStructureTemplates: SongStructureTemplate[] = [
  {
    id: 'pop-anthem',
    label: 'Pop anthem · V1 Pre Ch V2 Ch Br Ch',
    genre: 'pop',
    plan: 'free',
    description: 'Radio-ready arc with lift-heavy choruses and a bridge break.',
    sectionOrder: ['verse', 'pre-chorus', 'chorus', 'verse', 'chorus', 'bridge', 'chorus'],
    syllableTargets: {
      verse: [8, 8, 8, 8],
      'pre-chorus': [7, 7, 7],
      chorus: [6, 6, 6, 6],
      bridge: [8, 8, 8],
    },
  },
  {
    id: 'hip-hop-manifesto',
    label: 'Hip-hop manifesto · V1 Hook V2 Hook Bridge Hook',
    genre: 'hip-hop',
    plan: 'free',
    description: 'Punchline verses with mantra-style hook built for crowd call-backs.',
    sectionOrder: ['intro', 'verse', 'chorus', 'verse', 'chorus', 'bridge', 'chorus'],
    syllableTargets: {
      intro: [4, 4],
      verse: [10, 10, 10, 10],
      chorus: [6, 6, 6, 6],
      bridge: [8, 8, 8, 8],
    },
  },
  {
    id: 'kpop-glow',
    label: 'K-pop glow · Intro V1 Pre Ch Post V2 Pre Ch Bridge Dance Ch',
    genre: 'kpop',
    plan: 'pro',
    description: 'High-energy template with post-chorus chant and dance break.',
    sectionOrder: ['intro', 'verse', 'pre-chorus', 'chorus', 'breakdown', 'verse', 'pre-chorus', 'chorus', 'bridge', 'chorus'],
    syllableTargets: {
      intro: [4, 4, 4],
      verse: [8, 8, 8, 8],
      'pre-chorus': [7, 7, 7],
      chorus: [6, 6, 6, 6],
      breakdown: [4, 4, 4, 4],
      bridge: [8, 8, 8, 8],
    },
  },
  {
    id: 'devotional-chant',
    label: 'Devotional chant · Intro V1 Ch V2 Ch Outro',
    genre: 'devotional',
    plan: 'free',
    description: 'Meditative build with mantra chorus and gentle outro.',
    sectionOrder: ['intro', 'verse', 'chorus', 'verse', 'chorus', 'outro'],
    syllableTargets: {
      intro: [6, 6],
      verse: [7, 7, 7, 7],
      chorus: [5, 5, 5, 5],
      outro: [6, 6],
    },
  },
];

export const songExportPresets: SongExportPreset[] = [
  {
    id: 'lyric-sheet',
    label: 'Lyric sheet (Markdown)',
    description: 'Simple lyric sheet with section headers and chords.',
    formats: ['md'],
    includes: ['sections', 'chords'],
    plan: 'free',
  },
  {
    id: 'stage-kit',
    label: 'Stage kit (PDF)',
    description: 'PDF with line numbers, cues, and chord chart appendix.',
    formats: ['pdf'],
    includes: ['sections', 'line numbers', 'performance notes'],
    plan: 'pro',
  },
  {
    id: 'karaoke-csv',
    label: 'Karaoke cue sheet (CSV)',
    description: 'CSV for DAW markers with timestamps and lyric segments.',
    formats: ['csv'],
    includes: ['timestamp grid', 'rhyme map'],
    plan: 'pro',
  },
  {
    id: 'writers-room',
    label: 'Writers room doc (DOCX)',
    description: 'DOCX with comments, alt lines, and revision log.',
    formats: ['docx'],
    includes: ['alternates', 'analysis summary'],
    plan: 'pro',
  },
];

export const songActivityLog: SongActivityItem[] = [
  {
    id: 'activity-01',
    label: 'Hook board expanded',
    detail: 'Generated 12 hook variants for Neon Skyline Hearts.',
    timestamp: iso('2024-03-11T19:32:00Z'),
    tone: 'success',
    icon: 'fa-sparkles',
  },
  {
    id: 'activity-02',
    label: 'Prosody check',
    detail: 'Flagged stress mismatch on V2 line 3 · Backbeat Manifesto.',
    timestamp: iso('2024-03-12T02:04:00Z'),
    tone: 'warning',
    icon: 'fa-wave-square',
  },
  {
    id: 'activity-03',
    label: 'Export queued',
    detail: 'Stage kit PDF for Starlight Bridge.',
    timestamp: iso('2024-03-12T05:28:00Z'),
    tone: 'info',
    icon: 'fa-cloud-arrow-down',
  },
];

const songProjects: SongProject[] = [
  {
    id: 'slm-001',
    title: 'Neon Skyline Hearts',
    genre: 'pop',
    status: 'draft',
    language: 'en',
    tone: 'wistful',
    persona: 'First-person night driver',
    theme: 'Late-night longing with city imagery',
    tags: ['city pop', 'night drive', 'nostalgia'],
    chords: '| Fmaj7  | Am7  | Dm7  | G13 |',
    createdAt: iso('2024-02-26T21:12:00Z'),
    updatedAt: iso('2024-03-12T03:45:00Z'),
    hook: {
      text: 'Under neon skies I still glow for you',
      variantId: 'hook-001',
      keywords: ['neon', 'glow', 'you'],
    },
    hookVariants: [
      {
        id: 'hook-001',
        text: 'Under neon skies I still glow for you',
        syllables: 10,
        rhymeKey: 'A',
        punchScore: 0.86,
        singScore: 0.81,
        stressShape: '˘ ¯ ˘ ¯ | ˘ ¯ ˘ ¯',
        keywords: ['neon', 'glow', 'you'],
      },
      {
        id: 'hook-002',
        text: 'Midnight skyline paints your name in blue',
        syllables: 10,
        rhymeKey: 'A',
        punchScore: 0.79,
        singScore: 0.84,
        stressShape: '˘ ¯ ˘ ¯ | ˘ ¯ ˘ ¯',
        keywords: ['skyline', 'blue', 'name'],
      },
      {
        id: 'hook-003',
        text: 'City halos hum the promise of you',
        syllables: 10,
        rhymeKey: 'A',
        punchScore: 0.74,
        singScore: 0.8,
        stressShape: '˘ ¯ ˘ ¯ | ˘ ¯ ˘ ¯',
        keywords: ['halo', 'promise'],
        plan: 'pro',
      },
    ],
    sections: [
      {
        id: 'slm-001-v1',
        type: 'verse',
        label: 'Verse 1',
        description: 'Set the night-drive imagery and emotional stakes.',
        targetSyllables: [8, 8, 8, 8],
        rhymeScheme: 'ABCB',
        lines: [
          {
            number: 1,
            text: 'Taxi lights strobe on the river glass',
            syllables: 8,
            rhymeKey: 'A',
            stressPattern: '˘ ¯ ˘ ¯ ˘ ¯ ˘',
            note: 'Matches downbeat with vowel sustain.',
          },
          {
            number: 2,
            text: 'Rearview ghosts keep whispering you back',
            syllables: 8,
            rhymeKey: 'B',
            stressPattern: '˘ ¯ ˘ ¯ ˘ ¯ ˘',
          },
          {
            number: 3,
            text: 'Every amber turn feels like a chance',
            syllables: 8,
            rhymeKey: 'C',
            stressPattern: '˘ ¯ ˘ ¯ ˘ ¯ ˘',
            note: 'Prosody warning: soft consonant on beat four.',
          },
          {
            number: 4,
            text: 'Signal green but I keep looking back',
            syllables: 8,
            rhymeKey: 'B',
            stressPattern: '˘ ¯ ˘ ¯ ˘ ¯ ˘',
          },
        ],
      },
      {
        id: 'slm-001-pre',
        type: 'pre-chorus',
        label: 'Pre-chorus',
        description: 'Build energy with rising syllable tension.',
        targetSyllables: [7, 7, 7],
        rhymeScheme: 'AAA',
        lines: [
          {
            number: 1,
            text: 'Every lane is humming warning signs',
            syllables: 7,
            rhymeKey: 'A',
          },
          {
            number: 2,
            text: 'Hands at two and ten still drift to you',
            syllables: 7,
            rhymeKey: 'A',
          },
          {
            number: 3,
            text: 'Heartbeat syncing with the midnight news',
            syllables: 7,
            rhymeKey: 'A',
          },
        ],
      },
      {
        id: 'slm-001-ch1',
        type: 'chorus',
        label: 'Chorus',
        description: 'Deliver the hook with consistent vowels.',
        targetSyllables: [6, 6, 6, 6],
        rhymeScheme: 'AAAA',
        lines: [
          { number: 1, text: 'Under neon skies I glow for you', syllables: 6, rhymeKey: 'A' },
          { number: 2, text: 'Every passing car becomes your tune', syllables: 6, rhymeKey: 'A' },
          { number: 3, text: 'Dial the radio to midnight blue', syllables: 6, rhymeKey: 'A' },
          { number: 4, text: 'Till the skyline fades I stay with you', syllables: 6, rhymeKey: 'A' },
        ],
      },
    ],
    analysis: {
      projectId: 'slm-001',
      rhymeTightness: 82,
      nearRhymes: 6,
      syllableBalance: 'dialed-in',
      stressAlignment: 'needs polish on verse line 3',
      hookLift: 'Hook lifts +4 LUFS against verse.',
      vocabularyHeat: 'Poetic 62%',
      warnings: [
        { id: 'warn-001', line: 3, message: 'Soft consonant on beat four may undercut lift.', severity: 'warn' },
      ],
      motifHighlights: ['neon imagery', 'motion verbs', 'city soundscape'],
    },
    tempo: {
      bpm: 102,
      timeSignature: '4/4',
      feel: 'straight',
      groove: 'Midnight shimmer',
      bars: 96,
      key: 'F major',
    },
    exports: [
      { format: 'md', timestamp: iso('2024-03-05T14:02:00Z') },
      { format: 'pdf', timestamp: iso('2024-03-10T16:31:00Z') },
    ],
    pinned: true,
    aiUsage: { drafts: 5, passes: 3, analyses: 8, exports: 2 },
    planLocks: { nearRhyme: false, export: false, multilingual: false },
    structureTemplateId: 'pop-anthem',
    customSyllableMap: true,
    cleanLyrics: true,
  },
  {
    id: 'slm-002',
    title: 'Backbeat Manifesto',
    genre: 'hip-hop',
    status: 'draft',
    language: 'en',
    tone: 'defiant',
    persona: 'Rally leader',
    theme: 'Community uprising with rhythmic slogans',
    tags: ['movement', 'anthem', 'spoken cadence'],
    createdAt: iso('2024-01-18T17:24:00Z'),
    updatedAt: iso('2024-03-11T22:11:00Z'),
    hook: {
      text: 'Hands up, backbeat manifesto',
      variantId: 'hook-101',
      keywords: ['backbeat', 'manifesto'],
    },
    hookVariants: [
      {
        id: 'hook-101',
        text: 'Hands up, backbeat manifesto',
        syllables: 8,
        rhymeKey: 'A',
        punchScore: 0.9,
        singScore: 0.76,
        stressShape: '¯ ˘ ¯ ˘ | ¯ ˘ ¯ ˘',
        keywords: ['hands', 'backbeat'],
      },
      {
        id: 'hook-102',
        text: 'Bass drum echoes every credo',
        syllables: 8,
        rhymeKey: 'A',
        punchScore: 0.82,
        singScore: 0.78,
        stressShape: '¯ ˘ ¯ ˘ | ¯ ˘ ¯ ˘',
        keywords: ['bass', 'credo'],
      },
      {
        id: 'hook-103',
        text: 'March line built on vinyl halos',
        syllables: 8,
        rhymeKey: 'A',
        punchScore: 0.75,
        singScore: 0.8,
        stressShape: '¯ ˘ ¯ ˘ | ¯ ˘ ¯ ˘',
        keywords: ['march', 'vinyl'],
      },
    ],
    sections: [
      {
        id: 'slm-002-intro',
        type: 'intro',
        label: 'Intro chant',
        description: 'Crowd energy warm-up with percussive call.',
        targetSyllables: [4, 4],
        rhymeScheme: 'AA',
        lines: [
          { number: 1, text: 'Kick drum, roll call', syllables: 4, rhymeKey: 'A' },
          { number: 2, text: 'Hands rise, we all', syllables: 4, rhymeKey: 'A' },
        ],
      },
      {
        id: 'slm-002-v1',
        type: 'verse',
        label: 'Verse 1',
        description: 'Rap verse with internal rhyme stacking.',
        targetSyllables: [10, 10, 10, 10],
        rhymeScheme: 'AABB',
        lines: [
          {
            number: 1,
            text: 'Snare snap, alleyway cadence on ten toes',
            syllables: 10,
            rhymeKey: 'A',
            note: 'Internal rhyme on cadence/ten.',
          },
          {
            number: 2,
            text: 'We chant manifestos in echo of bent poles',
            syllables: 10,
            rhymeKey: 'A',
          },
          {
            number: 3,
            text: 'Verse lines volley like chalk on the metro',
            syllables: 10,
            rhymeKey: 'B',
            note: 'Stress mismatch flagged for metro.',
          },
          {
            number: 4,
            text: 'Backbeat blueprint from vinyl to megaphone',
            syllables: 10,
            rhymeKey: 'B',
          },
        ],
      },
      {
        id: 'slm-002-ch',
        type: 'chorus',
        label: 'Hook',
        description: 'Slogan-style hook with crowd echo.',
        targetSyllables: [6, 6, 6, 6],
        rhymeScheme: 'AAAA',
        lines: [
          { number: 1, text: 'Hands up, backbeat manifesto', syllables: 6, rhymeKey: 'A' },
          { number: 2, text: 'Bass drum echoes every credo', syllables: 6, rhymeKey: 'A' },
          { number: 3, text: 'Streetlight flickers keep the tempo', syllables: 6, rhymeKey: 'A' },
          { number: 4, text: 'Crowd line built on vinyl halos', syllables: 6, rhymeKey: 'A' },
        ],
      },
    ],
    analysis: {
      projectId: 'slm-002',
      rhymeTightness: 74,
      nearRhymes: 9,
      syllableBalance: 'verse heavy',
      stressAlignment: 'check metro/tempo lines',
      hookLift: 'Hook energy +6 LUFS vs verse.',
      vocabularyHeat: 'Gritty 48%',
      warnings: [
        { id: 'warn-101', line: 3, message: 'Stress mismatch on "metro" vs beat three.', severity: 'warn' },
      ],
      motifHighlights: ['movement verbs', 'vinyl imagery', 'crowd call'],
    },
    tempo: {
      bpm: 92,
      timeSignature: '4/4',
      feel: 'half-time',
      groove: 'Boom-bap with swung hats',
      bars: 88,
      key: 'B♭ minor',
    },
    exports: [{ format: 'md', timestamp: iso('2024-02-20T20:15:00Z') }],
    aiUsage: { drafts: 7, passes: 5, analyses: 6, exports: 1 },
    planLocks: { nearRhyme: true, export: true, multilingual: true },
    structureTemplateId: 'hip-hop-manifesto',
    customSyllableMap: false,
    cleanLyrics: false,
  },
  {
    id: 'slm-003',
    title: 'Starlight Bridge',
    genre: 'kpop',
    status: 'final',
    language: 'en',
    tone: 'hopeful',
    persona: 'Ensemble voices',
    theme: 'Long-distance lovers reuniting on a luminous bridge',
    tags: ['duet', 'dance break', 'sparkle'],
    createdAt: iso('2023-12-08T09:41:00Z'),
    updatedAt: iso('2024-03-08T11:02:00Z'),
    hook: {
      text: 'Meet me on the starlight bridge tonight',
      variantId: 'hook-201',
      keywords: ['starlight', 'bridge', 'tonight'],
    },
    hookVariants: [
      {
        id: 'hook-201',
        text: 'Meet me on the starlight bridge tonight',
        syllables: 10,
        rhymeKey: 'A',
        punchScore: 0.88,
        singScore: 0.9,
        stressShape: '˘ ¯ ˘ ¯ | ˘ ¯ ˘ ¯',
        keywords: ['starlight', 'bridge', 'tonight'],
      },
      {
        id: 'hook-202',
        text: 'We align where constellations write',
        syllables: 9,
        rhymeKey: 'A',
        punchScore: 0.83,
        singScore: 0.88,
        stressShape: '˘ ¯ ˘ ¯ | ˘ ¯ ˘',
        keywords: ['align', 'constellations'],
      },
      {
        id: 'hook-203',
        text: 'Hold the spark till galaxies ignite',
        syllables: 9,
        rhymeKey: 'A',
        punchScore: 0.8,
        singScore: 0.86,
        stressShape: '˘ ¯ ˘ ¯ | ˘ ¯ ˘',
        keywords: ['spark', 'galaxies'],
        plan: 'pro',
      },
    ],
    sections: [
      {
        id: 'slm-003-intro',
        type: 'intro',
        label: 'Intro shimmer',
        description: 'Synth arpeggio with whispered motif.',
        targetSyllables: [4, 4, 4],
        rhymeScheme: 'AAA',
        lines: [
          { number: 1, text: 'Glow rise', syllables: 2, rhymeKey: 'A' },
          { number: 2, text: 'Hands high', syllables: 2, rhymeKey: 'A' },
          { number: 3, text: 'Hearts align', syllables: 3, rhymeKey: 'A' },
        ],
      },
      {
        id: 'slm-003-v1',
        type: 'verse',
        label: 'Verse 1',
        description: 'Trading lines between vocalists.',
        targetSyllables: [8, 8, 8, 8],
        rhymeScheme: 'ABAB',
        lines: [
          { number: 1, text: 'City beams spin halos in the snow', syllables: 8, rhymeKey: 'A' },
          { number: 2, text: 'Postcard messages still glow', syllables: 7, rhymeKey: 'B', note: 'Add filler syllable for meter.' },
          { number: 3, text: 'Countdown echoes cross the radio', syllables: 8, rhymeKey: 'A' },
          { number: 4, text: 'Promise me we chase that glow', syllables: 7, rhymeKey: 'B', note: 'Syllable short by one.' },
        ],
      },
      {
        id: 'slm-003-pre',
        type: 'pre-chorus',
        label: 'Pre-chorus lift',
        description: 'Stacked vocals building to chorus.',
        targetSyllables: [7, 7, 7],
        rhymeScheme: 'AAB',
        lines: [
          { number: 1, text: 'We run with constellations in our sight', syllables: 9, rhymeKey: 'A' },
          { number: 2, text: 'Heartbeat patterns snapping into light', syllables: 9, rhymeKey: 'A' },
          { number: 3, text: 'Every step a promise tonight', syllables: 8, rhymeKey: 'B' },
        ],
      },
      {
        id: 'slm-003-ch',
        type: 'chorus',
        label: 'Chorus',
        description: 'Group chorus with chant post-hook.',
        targetSyllables: [6, 6, 6, 6],
        rhymeScheme: 'AAAA',
        lines: [
          { number: 1, text: 'Meet me on the starlight bridge tonight', syllables: 8, rhymeKey: 'A' },
          { number: 2, text: 'Hold the spark until the skyline writes', syllables: 8, rhymeKey: 'A' },
          { number: 3, text: 'Every constellation knows our light', syllables: 8, rhymeKey: 'A' },
            { number: 4, text: "We belong beyond the city's night", syllables: 8, rhymeKey: 'A' },
        ],
      },
      {
        id: 'slm-003-break',
        type: 'breakdown',
        label: 'Dance break',
        description: 'Instrumental post-chorus cues.',
        targetSyllables: [4, 4, 4, 4],
        rhymeScheme: '----',
        lines: [
          { number: 1, text: '[Instrumental hits]', syllables: 0, rhymeKey: '-' },
          { number: 2, text: '[Vocal chop: starlight]', syllables: 0, rhymeKey: '-' },
          { number: 3, text: '[Chant: hey! hey!]', syllables: 0, rhymeKey: '-' },
          { number: 4, text: '[Build to bridge]', syllables: 0, rhymeKey: '-' },
        ],
        prosodyNotes: 'Map cues to choreo counts 1-e-&-a.',
      },
    ],
    analysis: {
      projectId: 'slm-003',
      rhymeTightness: 88,
      nearRhymes: 11,
      syllableBalance: 'pre-chorus heavy',
      stressAlignment: 'chorus solid, verse needs smoothing',
      hookLift: 'Hook energy +8 LUFS with stacked harmony.',
      vocabularyHeat: 'Sparkle 71%',
      warnings: [
        { id: 'warn-201', line: 2, message: 'Verse line short by one syllable.', severity: 'info' },
        { id: 'warn-202', line: 4, message: 'Verse line short by one syllable.', severity: 'info' },
      ],
      motifHighlights: ['stellar imagery', 'bridge motif', 'dance cues'],
    },
    tempo: {
      bpm: 128,
      timeSignature: '4/4',
      feel: 'straight',
      groove: 'Synth pop drive',
      bars: 120,
      key: 'D major',
    },
    exports: [
      { format: 'md', timestamp: iso('2024-01-15T13:11:00Z') },
      { format: 'pdf', timestamp: iso('2024-01-20T18:23:00Z') },
      { format: 'docx', timestamp: iso('2024-02-02T10:04:00Z') },
      { format: 'csv', timestamp: iso('2024-02-14T09:40:00Z') },
    ],
    aiUsage: { drafts: 11, passes: 9, analyses: 12, exports: 4 },
    planLocks: { nearRhyme: false, export: false, multilingual: false },
    structureTemplateId: 'kpop-glow',
    customSyllableMap: true,
    cleanLyrics: true,
  },
];

export const cloneSongProjects = (): SongProject[] => clone(songProjects);

export const sampleSongProjects = songProjects;

export const computeLibraryMetrics = (projects: SongProject[]): SongLibraryMetrics => {
  if (projects.length === 0) {
    return {
      totalProjects: 0,
      activeDrafts: 0,
      averageBpm: 0,
      averageSections: 0,
      exportsThisMonth: 0,
    };
  }

  const totalProjects = projects.length;
  const activeDrafts = projects.filter((project) => project.status === 'draft').length;
  const averageBpm = Math.round(projects.reduce((sum, project) => sum + project.tempo.bpm, 0) / totalProjects);
  const averageSectionsRaw = projects.reduce((sum, project) => sum + project.sections.length, 0) / totalProjects;
  const averageSections = Math.round(averageSectionsRaw * 10) / 10;
  const nowDate = new Date();
  const exportsThisMonth = projects.reduce((sum, project) => {
    const count = project.exports.filter((entry) => {
      const date = new Date(entry.timestamp);
      return date.getMonth() === nowDate.getMonth() && date.getFullYear() === nowDate.getFullYear();
    }).length;
    return sum + count;
  }, 0);

  return {
    totalProjects,
    activeDrafts,
    averageBpm,
    averageSections,
    exportsThisMonth,
  };
};

export const createProjectFromTemplate = (templateId: string, title?: string): SongProject => {
  const template = songStructureTemplates.find((item) => item.id === templateId) ?? songStructureTemplates[0];
  const idSuffix = Math.random().toString(36).slice(2, 7);
  const baseTitle = title ?? template.label.split('·')[0]?.trim() ?? 'New Song';
  const projectId = `slm-${idSuffix}`;
  const sections: SongSection[] = template.sectionOrder.map((sectionType, index) => {
    const target = template.syllableTargets[sectionType] ?? [8, 8, 8, 8];
    const lines: SongLine[] = target.map((syllables, lineIndex) => ({
      number: lineIndex + 1,
      text: `Line ${lineIndex + 1} placeholder awaiting generation`,
      syllables,
      rhymeKey: String.fromCharCode(65 + ((lineIndex + index) % 4)),
    }));
    return {
      id: `${projectId}-${sectionType}-${index}`,
      type: sectionType,
      label: sectionType.replace('-', ' ').replace(/^\w/, (letter) => letter.toUpperCase()),
      description: 'Generated section awaiting refinement.',
      targetSyllables: target,
      rhymeScheme: target.map((_, idx) => String.fromCharCode(65 + (idx % 4))).join(''),
      lines,
    };
  });

  return {
    id: projectId,
    title: `${baseTitle} ${new Date().getFullYear()}`,
    genre: template.genre,
    status: 'draft',
    language: 'en',
    tone: 'open',
    persona: 'New voice',
    theme: 'Awaiting discovery',
    tags: [template.genre, 'new'],
    createdAt: now(),
    updatedAt: now(),
    hook: {
      text: 'New hook ready for ideation',
      variantId: null,
      keywords: [],
    },
    hookVariants: [],
    sections,
    analysis: {
      projectId,
      rhymeTightness: 0,
      nearRhymes: 0,
      syllableBalance: 'pending',
      stressAlignment: 'pending',
      hookLift: 'pending',
      vocabularyHeat: 'pending',
      warnings: [],
      motifHighlights: [],
    },
    tempo: {
      bpm: template.genre === 'hip-hop' ? 92 : template.genre === 'edm' ? 124 : 108,
      timeSignature: '4/4',
      feel: 'straight',
      groove: 'Awaiting tap tempo',
      bars: sections.length * 8,
    },
    exports: [],
    aiUsage: { drafts: 0, passes: 0, analyses: 0, exports: 0 },
    planLocks: {
      nearRhyme: template.plan === 'pro',
      export: template.plan === 'pro',
      multilingual: template.plan === 'pro',
    },
    structureTemplateId: template.id,
    customSyllableMap: false,
    cleanLyrics: true,
  };
};

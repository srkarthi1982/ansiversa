export type PlanTier = 'free' | 'pro';

export type StructureKey =
  | 'three-act'
  | 'save-the-cat'
  | 'heros-journey'
  | 'kishotenketsu'
  | 'mystery-spine'
  | 'snowflake';

export type BeatDefinition = {
  id: string;
  label: string;
  description: string;
  focus: string;
  targetPercent: number;
  premium?: boolean;
};

export type StructurePreset = {
  key: StructureKey;
  name: string;
  summary: string;
  plan: PlanTier;
  acts: Array<{
    id: string;
    label: string;
    beats: BeatDefinition[];
  }>;
  bestFor: string[];
  pacingNotes: string;
};

export type ProjectBeat = {
  id: string;
  label: string;
  status: 'idea' | 'outlined' | 'draft' | 'needs-revision';
  actualWords: number;
  targetPercent: number;
};

export type ProjectAct = {
  id: string;
  label: string;
  beats: ProjectBeat[];
};

export type NovelProject = {
  id: string;
  title: string;
  logline: string;
  genre: string;
  audience: string;
  status: 'draft' | 'active' | 'archived';
  plan: PlanTier;
  structureKey: StructureKey;
  pov: string;
  tense: string;
  targetWords: number;
  draftedWords: number;
  snowflakeStep: number;
  lastEdited: string;
  tags: string[];
  heatmapCoverage: number;
  timelineConfidence: number;
  acts: ProjectAct[];
  chapters: Array<{
    id: string;
    title: string;
    wordTarget: number;
    status: 'idea' | 'planned' | 'drafted' | 'revised';
  }>;
};

export type SnowflakeStage = {
  step: number;
  label: string;
  description: string;
  deliverable: string;
  inputs: string[];
  proOnly?: boolean;
};

export type CharacterProfile = {
  id: string;
  name: string;
  role: string;
  goal: string;
  flaw: string;
  arc: 'internal' | 'external' | 'both';
  pov: boolean;
  status: 'outline' | 'draft' | 'complete';
  relationships: Array<{ id: string; targetId: string; label: string }>;
};

export type WorldEntry = {
  id: string;
  type: 'location' | 'faction' | 'rule' | 'artifact';
  name: string;
  description: string;
  importance: 'core' | 'supporting';
  linkedChapters: string[];
};

export type ThreadDefinition = {
  key: string;
  label: string;
  category: 'theme' | 'motif' | 'clue' | 'relationship';
  description: string;
  color: string;
};

export type ThreadHeatmapRow = {
  chapterId: string;
  chapterTitle: string;
  intensities: Array<{ threadKey: string; level: 0 | 1 | 2 | 3 }>;
};

export type TimelineEvent = {
  id: string;
  label: string;
  when: string;
  order: 'narrative' | 'chronological';
  location: string;
  pov: string;
  chapter: string;
  durationHours: number;
  warning?: string;
};

export type Diagnostic = {
  id: string;
  type: 'pacing' | 'pov' | 'thread' | 'continuity' | 'representation';
  severity: 'info' | 'warning' | 'critical';
  summary: string;
  suggestion: string;
  relatedIds: string[];
};

export type RevisionSnapshot = {
  id: string;
  label: string;
  timestamp: string;
  summary: string;
  highlights: string[];
};

export type ExportPreset = {
  format: 'md' | 'docx' | 'fdx' | 'json';
  label: string;
  description: string;
  includes: string[];
  plan: PlanTier;
};

export type PlanLimit = {
  feature: string;
  free: string;
  pro: string;
};

export type ApiEndpoint = {
  id: string;
  method: 'GET' | 'POST';
  path: string;
  summary: string;
  sampleRequest?: Record<string, unknown>;
  sampleResponse?: Record<string, unknown>;
};

export type ActivityEntry = {
  id: string;
  icon: string;
  color: string;
  label: string;
  detail: string;
  timestamp: string;
};

export type SceneLane = {
  key: 'idea' | 'planned' | 'drafted' | 'revised';
  label: string;
  description: string;
  scenes: Array<{
    id: string;
    title: string;
    purpose: string;
    pov: string;
    status: 'idea' | 'planned' | 'drafted' | 'revised';
    linkedThreads: string[];
  }>;
};

export const structurePresets: StructurePreset[] = [
  {
    key: 'three-act',
    name: 'Three-Act (12 beats)',
    summary:
      'Classical storytelling structure with setup, confrontation, and resolution — ideal for most genres.',
    plan: 'free',
    acts: [
      {
        id: 'act-i',
        label: 'Act I — Setup',
        beats: [
          {
            id: 'opening-image',
            label: 'Opening Image',
            description: 'Establish protagonist and tone with a compelling visual hook.',
            focus: 'Voice & status quo',
            targetPercent: 5,
          },
          {
            id: 'theme-stated',
            label: 'Theme Stated',
            description: 'Seed the central question or moral tension that will pay off later.',
            focus: 'Foreshadowing',
            targetPercent: 2,
          },
          {
            id: 'setup',
            label: 'Setup',
            description: 'Introduce supporting cast, world rules, and protagonist stakes.',
            focus: 'Cast & world',
            targetPercent: 10,
          },
          {
            id: 'catalyst',
            label: 'Catalyst',
            description: 'Inciting incident that disrupts the status quo.',
            focus: 'Call to adventure',
            targetPercent: 3,
          },
          {
            id: 'debate',
            label: 'Debate',
            description: 'Protagonist questions the path forward before committing.',
            focus: 'Internal conflict',
            targetPercent: 5,
          },
        ],
      },
      {
        id: 'act-ii',
        label: 'Act II — Confrontation',
        beats: [
          {
            id: 'break-into-two',
            label: 'Break into Two',
            description: 'Hero steps into the new world, committing to the goal.',
            focus: 'Point of no return',
            targetPercent: 5,
          },
          {
            id: 'b-story',
            label: 'B Story',
            description: 'Introduce relational or thematic thread that supports growth.',
            focus: 'Theme & relationships',
            targetPercent: 7,
          },
          {
            id: 'fun-and-games',
            label: 'Fun and Games',
            description: 'Promise of the premise — showcase core engine and set-pieces.',
            focus: 'Set-piece exploration',
            targetPercent: 15,
          },
          {
            id: 'midpoint',
            label: 'Midpoint',
            description: 'A victory or defeat that flips the story stakes.',
            focus: 'Twist & escalation',
            targetPercent: 5,
          },
          {
            id: 'bad-guys-close-in',
            label: 'Bad Guys Close In',
            description: 'Antagonistic forces tighten pressure; protagonist falters.',
            focus: 'Rising conflict',
            targetPercent: 10,
          },
          {
            id: 'all-is-lost',
            label: 'All Is Lost',
            description: 'Rock-bottom moment signaling transformation is required.',
            focus: 'Dark night of the soul',
            targetPercent: 5,
          },
        ],
      },
      {
        id: 'act-iii',
        label: 'Act III — Resolution',
        beats: [
          {
            id: 'break-into-three',
            label: 'Break into Three',
            description: 'Hero integrates lessons and launches final plan.',
            focus: 'Synthesis',
            targetPercent: 5,
          },
          {
            id: 'finale',
            label: 'Finale',
            description: 'Execute plan, resolve conflicts, pay off threads and arcs.',
            focus: 'Climactic sequence',
            targetPercent: 18,
          },
          {
            id: 'final-image',
            label: 'Final Image',
            description: 'Mirror the opening with transformed status quo.',
            focus: 'Resolution & theme',
            targetPercent: 5,
          },
        ],
      },
    ],
    bestFor: ['Fantasy', 'Literary fiction', 'Historical'],
    pacingNotes: 'Balance between plot mechanics and character transformation with clean act breaks.',
  },
  {
    key: 'save-the-cat',
    name: 'Save The Cat! (15 beats)',
    summary: 'High-energy commercial blueprint with clear emotional beats and comedic timing.',
    plan: 'pro',
    acts: [
      {
        id: 'stc-act-i',
        label: 'Act I — Set-up',
        beats: [
          {
            id: 'stc-opening',
            label: 'Opening Image',
            description: 'Tone-setter that frames protagonist’s before state.',
            focus: 'Contrast',
            targetPercent: 3,
          },
          {
            id: 'stc-theme',
            label: 'Theme Stated',
            description: 'Another character points to lesson protagonist must learn.',
            focus: 'Foreshadow theme',
            targetPercent: 2,
          },
          {
            id: 'stc-set-up',
            label: 'Set-Up',
            description: 'Introduce supporting cast, stakes, and problems to solve.',
            focus: 'Status quo & flaw',
            targetPercent: 12,
          },
          {
            id: 'stc-catalyst',
            label: 'Catalyst',
            description: 'Life-changing event that launches story.',
            focus: 'Inciting incident',
            targetPercent: 2,
          },
          {
            id: 'stc-debate',
            label: 'Debate',
            description: 'Hero questions mission and stakes, often refusing call.',
            focus: 'Internal doubt',
            targetPercent: 5,
          },
        ],
      },
      {
        id: 'stc-act-ii',
        label: 'Act II — Fun & Games',
        beats: [
          {
            id: 'stc-break2',
            label: 'Break into Two',
            description: 'Hero chooses adventure and enters new world.',
            focus: 'Decision point',
            targetPercent: 3,
          },
          {
            id: 'stc-b-story',
            label: 'B Story',
            description: 'Subplot that reflects theme, often romantic or friendship.',
            focus: 'Emotional counterpoint',
            targetPercent: 5,
          },
          {
            id: 'stc-fun',
            label: 'Fun and Games',
            description: 'The promise of the premise — hero explores new world.',
            focus: 'High concept set pieces',
            targetPercent: 15,
          },
          {
            id: 'stc-midpoint',
            label: 'Midpoint',
            description: 'False victory or defeat that raises stakes.',
            focus: 'Reversal',
            targetPercent: 5,
          },
          {
            id: 'stc-bad',
            label: 'Bad Guys Close In',
            description: 'Internal and external antagonists tighten grip.',
            focus: 'Escalation',
            targetPercent: 12,
          },
          {
            id: 'stc-all-is-lost',
            label: 'All Is Lost',
            description: 'Whiff of death moment showing the cost of failure.',
            focus: 'Lowest point',
            targetPercent: 4,
          },
          {
            id: 'stc-dark-night',
            label: 'Dark Night of the Soul',
            description: 'Hero reflects, integrates lesson, and finds resolve.',
            focus: 'Theme acceptance',
            targetPercent: 4,
          },
        ],
      },
      {
        id: 'stc-act-iii',
        label: 'Act III — Finale',
        beats: [
          {
            id: 'stc-break3',
            label: 'Break into Three',
            description: 'Combine A story and B story to form final plan.',
            focus: 'Integration',
            targetPercent: 3,
          },
          {
            id: 'stc-finale',
            label: 'Finale',
            description: 'Execute plan with transformation and payoff.',
            focus: 'Climax',
            targetPercent: 15,
          },
          {
            id: 'stc-final-image',
            label: 'Final Image',
            description: 'Illustrate new status quo; mirror opening.',
            focus: 'Resolution',
            targetPercent: 4,
          },
        ],
      },
    ],
    bestFor: ['Commercial fiction', 'Romance', 'Screenplay pacing'],
    pacingNotes: 'Keeps energy high with steady midpoint punch and comedic relief beats.',
  },
  {
    key: 'heros-journey',
    name: "Hero's Journey",
    summary: 'Mythic twelve-stage odyssey with mentor figures, ordeals, and transformation.',
    plan: 'pro',
    acts: [
      {
        id: 'hj-ordinary-world',
        label: 'Departure',
        beats: [
          {
            id: 'hj-ordinary',
            label: 'Ordinary World',
            description: 'Introduce hero in familiar setting before adventure.',
            focus: 'Character grounding',
            targetPercent: 5,
          },
          {
            id: 'hj-call',
            label: 'Call to Adventure',
            description: 'Challenge or invitation sparks journey.',
            focus: 'Mission trigger',
            targetPercent: 4,
          },
          {
            id: 'hj-refusal',
            label: 'Refusal of the Call',
            description: 'Hero hesitates or declines, revealing fears.',
            focus: 'Internal resistance',
            targetPercent: 3,
          },
          {
            id: 'hj-mentor',
            label: 'Meeting the Mentor',
            description: 'Guide offers wisdom, gifts, or training.',
            focus: 'Mentor relationship',
            targetPercent: 3,
          },
          {
            id: 'hj-crossing',
            label: 'Crossing the Threshold',
            description: 'Hero commits and enters unknown world.',
            focus: 'New rules',
            targetPercent: 5,
          },
        ],
      },
      {
        id: 'hj-initiation',
        label: 'Initiation',
        beats: [
          {
            id: 'hj-tests',
            label: 'Tests, Allies, Enemies',
            description: 'Hero assembles team, faces trials, and maps stakes.',
            focus: 'Allies & rivals',
            targetPercent: 10,
          },
          {
            id: 'hj-approach',
            label: 'Approach to the Inmost Cave',
            description: 'Strategise before major confrontation.',
            focus: 'Preparation',
            targetPercent: 6,
          },
          {
            id: 'hj-ordeal',
            label: 'Ordeal',
            description: 'Central crisis or death-and-rebirth moment.',
            focus: 'Core trial',
            targetPercent: 7,
          },
          {
            id: 'hj-reward',
            label: 'Reward',
            description: 'Hero claims treasure, knowledge, or reconciliation.',
            focus: 'Transformation',
            targetPercent: 6,
          },
        ],
      },
      {
        id: 'hj-return',
        label: 'Return',
        beats: [
          {
            id: 'hj-road-back',
            label: 'The Road Back',
            description: 'Hero recommits to completing mission.',
            focus: 'Renewed urgency',
            targetPercent: 6,
          },
          {
            id: 'hj-resurrection',
            label: 'Resurrection',
            description: 'Final test that purifies the hero before return.',
            focus: 'Climactic rebirth',
            targetPercent: 8,
          },
          {
            id: 'hj-return',
            label: 'Return with the Elixir',
            description: 'Hero returns transformed, sharing gained wisdom.',
            focus: 'Legacy',
            targetPercent: 4,
          },
        ],
      },
    ],
    bestFor: ['Epic fantasy', 'Adventure', 'YA quest'],
    pacingNotes: 'Balances external trials with internal transformation beats.',
  },
  {
    key: 'kishotenketsu',
    name: 'Kishōtenketsu',
    summary: 'Non-conflict four-part structure emphasising contrast and revelation.',
    plan: 'pro',
    acts: [
      {
        id: 'ki',
        label: 'Ki — Introduction',
        beats: [
          {
            id: 'ki-intro',
            label: 'Introduction',
            description: 'Present characters and setting without strong conflict.',
            focus: 'Everyday rhythm',
            targetPercent: 20,
          },
        ],
      },
      {
        id: 'sho',
        label: 'Shō — Development',
        beats: [
          {
            id: 'sho-development',
            label: 'Development',
            description: 'Extend premise with variations and parallels.',
            focus: 'Echo & contrast',
            targetPercent: 25,
          },
        ],
      },
      {
        id: 'ten',
        label: 'Ten — Twist',
        beats: [
          {
            id: 'ten-twist',
            label: 'Twist',
            description: 'Unexpected turn that recontextualises earlier sections.',
            focus: 'Perspective flip',
            targetPercent: 25,
          },
        ],
      },
      {
        id: 'ketsu',
        label: 'Ketsu — Reconciliation',
        beats: [
          {
            id: 'ketsu-resolution',
            label: 'Resolution',
            description: 'Synthesis that resolves tension through insight.',
            focus: 'Harmony',
            targetPercent: 30,
          },
        ],
      },
    ],
    bestFor: ['Slice of life', 'Literary', 'Mystical allegory'],
    pacingNotes: 'Focus on juxtaposition instead of conflict — emphasise imagery and parallels.',
  },
  {
    key: 'mystery-spine',
    name: 'Mystery Spine',
    summary: 'Investigative arc balancing discovery of clues, red herrings, and reveals.',
    plan: 'pro',
    acts: [
      {
        id: 'mystery-act-i',
        label: 'Act I — Case ignition',
        beats: [
          {
            id: 'hook-crime',
            label: 'Hook Crime',
            description: 'Open with the crime or discovery of anomaly.',
            focus: 'Intrigue',
            targetPercent: 6,
          },
          {
            id: 'detective-intro',
            label: 'Detective Introduced',
            description: 'Establish sleuth skills, flaw, and stake in the case.',
            focus: 'Character & motive',
            targetPercent: 8,
          },
          {
            id: 'case-acceptance',
            label: 'Case Acceptance',
            description: 'Detective commits to solving mystery despite risk.',
            focus: 'Point of commitment',
            targetPercent: 6,
          },
        ],
      },
      {
        id: 'mystery-act-ii',
        label: 'Act II — Investigation',
        beats: [
          {
            id: 'clue-gathering',
            label: 'Clue Gathering',
            description: 'Series of interrogations, research, and revelations.',
            focus: 'Clue discovery',
            targetPercent: 18,
          },
          {
            id: 'red-herring',
            label: 'Red Herring',
            description: 'False lead that creates doubt and tension.',
            focus: 'Misdirection',
            targetPercent: 10,
          },
          {
            id: 'mid-twist',
            label: 'Midpoint Twist',
            description: 'Major reveal or second body recontextualises evidence.',
            focus: 'Escalation',
            targetPercent: 8,
          },
          {
            id: 'darkest-hour',
            label: 'Darkest Hour',
            description: 'Case seems unsolvable; stakes spike.',
            focus: 'Doubt',
            targetPercent: 8,
          },
        ],
      },
      {
        id: 'mystery-act-iii',
        label: 'Act III — Solution',
        beats: [
          {
            id: 'breakthrough',
            label: 'Breakthrough',
            description: 'Insight connects clues and exposes culprit.',
            focus: 'Revelation',
            targetPercent: 8,
          },
          {
            id: 'confrontation',
            label: 'Confrontation',
            description: 'Face antagonist; reveal method and motive.',
            focus: 'Climax',
            targetPercent: 10,
          },
          {
            id: 'denouement',
            label: 'Denouement',
            description: 'Tie loose ends, address moral aftermath.',
            focus: 'Resolution',
            targetPercent: 8,
          },
        ],
      },
    ],
    bestFor: ['Mystery', 'Thriller', 'Detective fiction'],
    pacingNotes: 'Balance clue reveals with red herrings to maintain tension.',
  },
  {
    key: 'snowflake',
    name: 'Snowflake Expansion',
    summary: 'Sentence-to-scene expansion method ideal for meticulous planners.',
    plan: 'free',
    acts: [
      {
        id: 'snowflake-overview',
        label: 'Fractal outline',
        beats: [
          {
            id: 'snowflake-sentence',
            label: 'One-Sentence Story',
            description: 'Capture protagonist, conflict, and stakes in 25 words.',
            focus: 'High-level premise',
            targetPercent: 5,
          },
          {
            id: 'snowflake-paragraph',
            label: 'One-Paragraph Summary',
            description: 'Expand to five sentences covering setup, two major complications, climax, resolution.',
            focus: 'Macro outline',
            targetPercent: 10,
          },
          {
            id: 'snowflake-page',
            label: 'Full Page Synopsis',
            description: 'Detail every major story beat with cause-and-effect logic.',
            focus: 'Narrative logic',
            targetPercent: 25,
          },
        ],
      },
    ],
    bestFor: ['High fantasy', 'Mystery plotting', 'Writers who prefer iteration'],
    pacingNotes: 'Iterative layering ensures each expansion remains consistent with prior steps.',
  },
];

export const snowflakeStages: SnowflakeStage[] = [
  {
    step: 1,
    label: 'Premise sentence',
    description: 'Distil the story into a single compelling line with protagonist, conflict, and stakes.',
    deliverable: '25-word logline',
    inputs: ['Genre', 'Protagonist', 'Central conflict', 'Stakes'],
  },
  {
    step: 2,
    label: 'Paragraph expansion',
    description: 'Expand premise into five-sentence summary covering setup, complications, climax, and resolution.',
    deliverable: '1-paragraph synopsis',
    inputs: ['Opening status quo', 'Two major turns', 'Climactic choice', 'Aftermath'],
  },
  {
    step: 3,
    label: 'Character dossiers',
    description: 'Draft one-page bios tracking goals, flaws, arcs, and relationships for primary cast.',
    deliverable: 'Character roster',
    inputs: ['Goals', 'Flaws', 'Allies', 'Antagonists'],
  },
  {
    step: 4,
    label: 'Expanded synopsis',
    description: 'Turn paragraph into multi-page outline mapping acts and beat progressions.',
    deliverable: '4-page outline',
    inputs: ['Act scaffolding', 'Beat notes', 'Emotional turns'],
    proOnly: true,
  },
  {
    step: 5,
    label: 'Scene spreadsheet',
    description: 'Break outline into scenes with POV, purpose, stakes, and threaded motifs.',
    deliverable: 'Scene tracker',
    inputs: ['Scene purpose', 'POV assignment', 'Thread links', 'Word targets'],
    proOnly: true,
  },
  {
    step: 6,
    label: 'Chapter packages',
    description: 'Group scenes into chapters with pacing metrics and cliffhanger checks.',
    deliverable: 'Chapter plan',
    inputs: ['Chapter objective', 'Timeline anchor', 'Revision status'],
    proOnly: true,
  },
  {
    step: 7,
    label: 'Continuity pass',
    description: 'Verify timeline, POV rotation, and thread coverage before drafting.',
    deliverable: 'Continuity report',
    inputs: ['Timeline deltas', 'POV cadence', 'Thread gaps'],
    proOnly: true,
  },
];

export const sampleProjects: NovelProject[] = [
  {
    id: 'proj-aurora',
    title: 'Aurora Sanctum',
    logline: 'An archivist who remembers alternate timelines must stop a chronomancer from rewriting history.',
    genre: 'Science Fantasy',
    audience: 'Adult',
    status: 'active',
    plan: 'pro',
    structureKey: 'three-act',
    pov: 'Multi-POV',
    tense: 'Past',
    targetWords: 120_000,
    draftedWords: 46_500,
    snowflakeStep: 5,
    lastEdited: '2025-01-04T10:45:00.000Z',
    tags: ['Time travel', 'Found family', 'Archivist heroine'],
    heatmapCoverage: 78,
    timelineConfidence: 84,
    acts: [
      {
        id: 'aurora-act-i',
        label: 'Act I',
        beats: [
          { id: 'opening-image', label: 'Opening Image', status: 'draft', actualWords: 5100, targetPercent: 5 },
          { id: 'theme-stated', label: 'Theme Stated', status: 'outlined', actualWords: 1800, targetPercent: 2 },
          { id: 'setup', label: 'Setup', status: 'draft', actualWords: 12200, targetPercent: 10 },
          { id: 'catalyst', label: 'Catalyst', status: 'draft', actualWords: 3200, targetPercent: 3 },
          { id: 'debate', label: 'Debate', status: 'needs-revision', actualWords: 4400, targetPercent: 5 },
        ],
      },
      {
        id: 'aurora-act-ii',
        label: 'Act II',
        beats: [
          { id: 'break-into-two', label: 'Break into Two', status: 'outlined', actualWords: 2800, targetPercent: 5 },
          { id: 'b-story', label: 'B Story', status: 'outlined', actualWords: 2600, targetPercent: 7 },
          { id: 'fun-and-games', label: 'Fun and Games', status: 'idea', actualWords: 0, targetPercent: 15 },
          { id: 'midpoint', label: 'Midpoint', status: 'idea', actualWords: 0, targetPercent: 5 },
          { id: 'bad-guys-close-in', label: 'Bad Guys Close In', status: 'idea', actualWords: 0, targetPercent: 10 },
          { id: 'all-is-lost', label: 'All Is Lost', status: 'idea', actualWords: 0, targetPercent: 5 },
        ],
      },
      {
        id: 'aurora-act-iii',
        label: 'Act III',
        beats: [
          { id: 'break-into-three', label: 'Break into Three', status: 'idea', actualWords: 0, targetPercent: 5 },
          { id: 'finale', label: 'Finale', status: 'idea', actualWords: 0, targetPercent: 18 },
          { id: 'final-image', label: 'Final Image', status: 'idea', actualWords: 0, targetPercent: 5 },
        ],
      },
    ],
    chapters: [
      { id: 'ch-1', title: 'Archive of Lost Days', wordTarget: 4500, status: 'revised' },
      { id: 'ch-2', title: 'Echoes in Glass', wordTarget: 4200, status: 'drafted' },
      { id: 'ch-3', title: 'Chronomancer Accord', wordTarget: 4700, status: 'planned' },
      { id: 'ch-4', title: 'Splintered Futures', wordTarget: 4800, status: 'planned' },
      { id: 'ch-5', title: 'The Library Burns Twice', wordTarget: 5000, status: 'idea' },
    ],
  },
  {
    id: 'proj-marigold',
    title: 'The Marigold Pact',
    logline: 'A small-town gardener uncovers a magical inheritance that pits her against a secret order.',
    genre: 'Contemporary Fantasy',
    audience: 'New Adult',
    status: 'draft',
    plan: 'free',
    structureKey: 'save-the-cat',
    pov: 'First-person',
    tense: 'Present',
    targetWords: 85_000,
    draftedWords: 28_000,
    snowflakeStep: 3,
    lastEdited: '2025-01-02T18:15:00.000Z',
    tags: ['Cottagecore', 'Secret societies', 'Romantic subplot'],
    heatmapCoverage: 54,
    timelineConfidence: 72,
    acts: [
      {
        id: 'marigold-act-i',
        label: 'Act I',
        beats: [
          { id: 'stc-opening', label: 'Opening Image', status: 'draft', actualWords: 3200, targetPercent: 3 },
          { id: 'stc-theme', label: 'Theme Stated', status: 'outlined', actualWords: 900, targetPercent: 2 },
          { id: 'stc-set-up', label: 'Set-Up', status: 'draft', actualWords: 9600, targetPercent: 12 },
          { id: 'stc-catalyst', label: 'Catalyst', status: 'draft', actualWords: 2100, targetPercent: 2 },
          { id: 'stc-debate', label: 'Debate', status: 'needs-revision', actualWords: 2700, targetPercent: 5 },
        ],
      },
      {
        id: 'marigold-act-ii',
        label: 'Act II',
        beats: [
          { id: 'stc-break2', label: 'Break into Two', status: 'outlined', actualWords: 1800, targetPercent: 3 },
          { id: 'stc-b-story', label: 'B Story', status: 'idea', actualWords: 0, targetPercent: 5 },
          { id: 'stc-fun', label: 'Fun and Games', status: 'idea', actualWords: 0, targetPercent: 15 },
          { id: 'stc-midpoint', label: 'Midpoint', status: 'idea', actualWords: 0, targetPercent: 5 },
          { id: 'stc-bad', label: 'Bad Guys Close In', status: 'idea', actualWords: 0, targetPercent: 12 },
          { id: 'stc-all-is-lost', label: 'All Is Lost', status: 'idea', actualWords: 0, targetPercent: 4 },
          { id: 'stc-dark-night', label: 'Dark Night of the Soul', status: 'idea', actualWords: 0, targetPercent: 4 },
        ],
      },
      {
        id: 'marigold-act-iii',
        label: 'Act III',
        beats: [
          { id: 'stc-break3', label: 'Break into Three', status: 'idea', actualWords: 0, targetPercent: 3 },
          { id: 'stc-finale', label: 'Finale', status: 'idea', actualWords: 0, targetPercent: 15 },
          { id: 'stc-final-image', label: 'Final Image', status: 'idea', actualWords: 0, targetPercent: 4 },
        ],
      },
    ],
    chapters: [
      { id: 'mg-1', title: 'Morning Glories', wordTarget: 3800, status: 'drafted' },
      { id: 'mg-2', title: 'The Pact Letter', wordTarget: 4100, status: 'planned' },
      { id: 'mg-3', title: 'Greenhouse Secrets', wordTarget: 4200, status: 'planned' },
      { id: 'mg-4', title: 'Night Bloom', wordTarget: 4300, status: 'idea' },
    ],
  },
  {
    id: 'proj-vale',
    title: 'Vale of Embers',
    logline: 'A disgraced knight must broker peace between rival dragon clans before war razes the realm.',
    genre: 'Epic Fantasy',
    audience: 'Adult',
    status: 'draft',
    plan: 'pro',
    structureKey: 'heros-journey',
    pov: 'Limited third',
    tense: 'Past',
    targetWords: 150_000,
    draftedWords: 61_000,
    snowflakeStep: 4,
    lastEdited: '2024-12-28T09:15:00.000Z',
    tags: ['Dragons', 'Political intrigue', 'Redemption arc'],
    heatmapCoverage: 62,
    timelineConfidence: 69,
    acts: [
      {
        id: 'vale-act-i',
        label: 'Departure',
        beats: [
          { id: 'hj-ordinary', label: 'Ordinary World', status: 'draft', actualWords: 5400, targetPercent: 5 },
          { id: 'hj-call', label: 'Call to Adventure', status: 'draft', actualWords: 3600, targetPercent: 4 },
          { id: 'hj-refusal', label: 'Refusal of the Call', status: 'needs-revision', actualWords: 2400, targetPercent: 3 },
          { id: 'hj-mentor', label: 'Meeting the Mentor', status: 'outlined', actualWords: 1800, targetPercent: 3 },
          { id: 'hj-crossing', label: 'Crossing the Threshold', status: 'outlined', actualWords: 1900, targetPercent: 5 },
        ],
      },
      {
        id: 'vale-act-ii',
        label: 'Initiation',
        beats: [
          { id: 'hj-tests', label: 'Tests, Allies, Enemies', status: 'outlined', actualWords: 7200, targetPercent: 10 },
          { id: 'hj-approach', label: 'Approach to the Inmost Cave', status: 'idea', actualWords: 0, targetPercent: 6 },
          { id: 'hj-ordeal', label: 'Ordeal', status: 'idea', actualWords: 0, targetPercent: 7 },
          { id: 'hj-reward', label: 'Reward', status: 'idea', actualWords: 0, targetPercent: 6 },
        ],
      },
      {
        id: 'vale-act-iii',
        label: 'Return',
        beats: [
          { id: 'hj-road-back', label: 'The Road Back', status: 'idea', actualWords: 0, targetPercent: 6 },
          { id: 'hj-resurrection', label: 'Resurrection', status: 'idea', actualWords: 0, targetPercent: 8 },
          { id: 'hj-return', label: 'Return with the Elixir', status: 'idea', actualWords: 0, targetPercent: 4 },
        ],
      },
    ],
    chapters: [
      { id: 'vale-1', title: 'Ashfall', wordTarget: 5200, status: 'drafted' },
      { id: 'vale-2', title: 'Dragon Council', wordTarget: 6000, status: 'planned' },
      { id: 'vale-3', title: 'Ember Truce', wordTarget: 6400, status: 'idea' },
    ],
  },
];

export const threadDefinitions: ThreadDefinition[] = [
  {
    key: 'time-paradox',
    label: 'Temporal paradox',
    category: 'clue',
    description: 'Breadcrumbs hinting at fractured timelines and cause loops.',
    color: 'text-indigo-400',
  },
  {
    key: 'found-family',
    label: 'Found family',
    category: 'theme',
    description: 'Moments of trust-building and emotional safety between misfit crew.',
    color: 'text-emerald-400',
  },
  {
    key: 'arc-reckoning',
    label: 'Reckoning arc',
    category: 'relationship',
    description: 'Protagonist confronting mentor betrayal and personal culpability.',
    color: 'text-rose-400',
  },
  {
    key: 'artifact-mystery',
    label: 'Artifact mystery',
    category: 'motif',
    description: 'Recurring relic symbols unlocking hidden library vault.',
    color: 'text-amber-400',
  },
];

export const threadHeatmap: ThreadHeatmapRow[] = [
  {
    chapterId: 'ch-1',
    chapterTitle: 'Archive of Lost Days',
    intensities: [
      { threadKey: 'time-paradox', level: 2 },
      { threadKey: 'found-family', level: 1 },
      { threadKey: 'arc-reckoning', level: 1 },
      { threadKey: 'artifact-mystery', level: 3 },
    ],
  },
  {
    chapterId: 'ch-2',
    chapterTitle: 'Echoes in Glass',
    intensities: [
      { threadKey: 'time-paradox', level: 3 },
      { threadKey: 'found-family', level: 1 },
      { threadKey: 'arc-reckoning', level: 2 },
      { threadKey: 'artifact-mystery', level: 1 },
    ],
  },
  {
    chapterId: 'ch-3',
    chapterTitle: 'Chronomancer Accord',
    intensities: [
      { threadKey: 'time-paradox', level: 1 },
      { threadKey: 'found-family', level: 2 },
      { threadKey: 'arc-reckoning', level: 3 },
      { threadKey: 'artifact-mystery', level: 0 },
    ],
  },
  {
    chapterId: 'ch-4',
    chapterTitle: 'Splintered Futures',
    intensities: [
      { threadKey: 'time-paradox', level: 2 },
      { threadKey: 'found-family', level: 2 },
      { threadKey: 'arc-reckoning', level: 2 },
      { threadKey: 'artifact-mystery', level: 1 },
    ],
  },
];

export const timelineEvents: TimelineEvent[] = [
  {
    id: 'tl-1',
    label: 'Archive fire (loop one)',
    when: '2245-05-17T08:00:00Z',
    order: 'chronological',
    location: 'Verdant Archive',
    pov: 'Lyra',
    chapter: 'Archive of Lost Days',
    durationHours: 1,
    warning: 'Chronology mismatch vs. Chapter 4 flashback',
  },
  {
    id: 'tl-2',
    label: 'Temporal council summit',
    when: '2245-05-19T12:00:00Z',
    order: 'narrative',
    location: 'Council Spire',
    pov: 'Tarek',
    chapter: 'Echoes in Glass',
    durationHours: 3,
  },
  {
    id: 'tl-3',
    label: 'Chronomancer betrayal revealed',
    when: '2245-05-20T21:00:00Z',
    order: 'narrative',
    location: 'Splintered Futures',
    pov: 'Lyra',
    chapter: 'Chronomancer Accord',
    durationHours: 2,
    warning: 'POV mismatch flagged by diagnostic engine',
  },
  {
    id: 'tl-4',
    label: 'Time anchor ritual',
    when: '2245-05-21T06:00:00Z',
    order: 'chronological',
    location: 'Aurora Sanctum',
    pov: 'Lyra',
    chapter: 'Splintered Futures',
    durationHours: 4,
  },
];

export const diagnostics: Diagnostic[] = [
  {
    id: 'diag-1',
    type: 'pacing',
    severity: 'warning',
    summary: 'Act II currently under target by 14%.',
    suggestion: 'Expand Fun and Games beat with additional discovery scene or subplot escalation.',
    relatedIds: ['fun-and-games'],
  },
  {
    id: 'diag-2',
    type: 'pov',
    severity: 'info',
    summary: 'POV rotation leans 70% Lyra, 20% Tarek, 10% Ansel.',
    suggestion: 'Add Ansel reaction scene post-midpoint for balance.',
    relatedIds: ['tl-3'],
  },
  {
    id: 'diag-3',
    type: 'thread',
    severity: 'critical',
    summary: 'Artifact mystery thread absent in Chapters 3-4.',
    suggestion: 'Seed relic clue in Chronomancer Accord to maintain motif coverage.',
    relatedIds: ['artifact-mystery', 'ch-3'],
  },
  {
    id: 'diag-4',
    type: 'continuity',
    severity: 'warning',
    summary: 'Timeline conflict: Archive fire occurs twice within 24 hours.',
    suggestion: 'Adjust chapter order or timeline anchor to avoid overlap.',
    relatedIds: ['tl-1', 'tl-4'],
  },
];

export const revisionSnapshots: RevisionSnapshot[] = [
  {
    id: 'rev-1',
    label: 'Pitch polish',
    timestamp: '2024-12-10T14:00:00.000Z',
    summary: 'Tightened logline and beat blurbs before agent submission.',
    highlights: ['Sharpened hook paragraph', 'Aligned comp titles', 'Added stakes callout'],
  },
  {
    id: 'rev-2',
    label: 'Act I rewrite',
    timestamp: '2024-12-20T16:30:00.000Z',
    summary: 'Reworked catalyst pacing and protagonist motivation.',
    highlights: ['Catalyst occurs earlier', 'Improved debate beat conflict', 'Adjusted timeline anchors'],
  },
  {
    id: 'rev-3',
    label: 'Continuity sync',
    timestamp: '2025-01-03T09:15:00.000Z',
    summary: 'Resolved timeline discrepancies and updated heatmap intensities.',
    highlights: ['Updated chronomancer reveal order', 'Balanced POV rotation', 'Added timeline diagnostics'],
  },
];

export const exportPresets: ExportPreset[] = [
  {
    format: 'md',
    label: 'Markdown outline',
    description: 'Structured Markdown outline with beats, chapters, and scene tables.',
    includes: ['Beats & acts', 'Scene planner fields', 'Thread matrix summary'],
    plan: 'free',
  },
  {
    format: 'docx',
    label: 'Manuscript brief (DOCX)',
    description: 'Industry-standard DOCX with chapter breakdowns and POV rotation charts.',
    includes: ['Chapter synopses', 'POV matrix', 'Revision history'],
    plan: 'pro',
  },
  {
    format: 'fdx',
    label: 'Final Draft outline (FDX)',
    description: 'Exports beats and scenes to Final Draft for screenplay formatting.',
    includes: ['Beat cards', 'Scene headings', 'Timeline metadata'],
    plan: 'pro',
  },
  {
    format: 'json',
    label: 'Structured JSON',
    description: 'API-ready JSON for integrations or custom renderers.',
    includes: ['Projects', 'Characters', 'Threads', 'Timeline'],
    plan: 'pro',
  },
];

export const planLimits: PlanLimit[] = [
  { feature: 'Projects', free: 'Up to 2 active', pro: 'Unlimited projects' },
  { feature: 'Target word count', free: '≤ 60k per project', pro: '≤ 200k per project' },
  { feature: 'Structure presets', free: 'Three-Act & Snowflake', pro: 'All presets + custom builder' },
  { feature: 'Snowflake steps', free: 'Steps 1–3', pro: 'Steps 1–10 with branching' },
  { feature: 'Exports', free: 'Markdown only', pro: 'Markdown, DOCX, FDX, JSON + Presentation handoff' },
  { feature: 'Version history', free: 'Last 3 snapshots', pro: 'Unlimited history & compare' },
  { feature: 'Diagnostics runs/day', free: '20/day', pro: '120/day + automated alerts' },
  { feature: 'Collaboration', free: 'Solo workspace', pro: 'Comment-only collaborators (v1.1)' },
  { feature: 'History retention', free: '60 days', pro: 'Unlimited retention' },
];

export const apiEndpoints: ApiEndpoint[] = [
  {
    id: 'create-project',
    method: 'POST',
    path: '/novel/api/project/create',
    summary: 'Create a new novel project with wizard defaults.',
    sampleRequest: {
      title: 'Aurora Sanctum',
      genre: 'Science Fantasy',
      structure: 'three-act',
      targetWords: 120000,
    },
    sampleResponse: { projectId: 'proj-aurora', status: 'created' },
  },
  {
    id: 'get-project',
    method: 'GET',
    path: '/novel/api/project',
    summary: 'Fetch project workspace including beats, characters, and timeline.',
    sampleResponse: {
      id: 'proj-aurora',
      beats: 32,
      characters: 12,
      scenes: 86,
    },
  },
  {
    id: 'apply-structure',
    method: 'POST',
    path: '/novel/api/beatmodel/apply',
    summary: 'Apply structure preset or custom template to project.',
    sampleRequest: { projectId: 'proj-aurora', structureKey: 'mystery-spine' },
    sampleResponse: { applied: true, beatsCreated: 27 },
  },
  {
    id: 'create-scene',
    method: 'POST',
    path: '/novel/api/scene/create',
    summary: 'Add scene to chapter with planner metadata and thread links.',
    sampleRequest: {
      projectId: 'proj-aurora',
      chapterId: 'ch-3',
      scene: {
        title: 'Ritual rehearsal',
        pov: 'Lyra',
        purpose: 'Prepare for timeline stitching',
        linkedThreads: ['time-paradox', 'artifact-mystery'],
      },
    },
    sampleResponse: { sceneId: 'scene-52', status: 'created' },
  },
  {
    id: 'diagnostics-run',
    method: 'GET',
    path: '/novel/api/diagnostics/run',
    summary: 'Run pacing, POV, thread, and continuity diagnostics.',
    sampleResponse: {
      pacing: { status: 'warning', variance: 0.18 },
      pov: { status: 'info', imbalance: 'Lyra-heavy' },
      continuity: { status: 'warning', conflicts: 2 },
    },
  },
  {
    id: 'export',
    method: 'POST',
    path: '/novel/api/export',
    summary: 'Queue export job for Markdown, DOCX, FDX, or JSON.',
    sampleRequest: { projectId: 'proj-aurora', format: 'docx', includeThreads: true },
    sampleResponse: { exportId: 'export-91', status: 'queued' },
  },
];

export const activityLog: ActivityEntry[] = [
  {
    id: 'activity-1',
    icon: 'fa-wand-magic-sparkles',
    color: 'text-indigo-400',
    label: 'Structure applied',
    detail: 'Applied Hero\'s Journey preset to Vale of Embers.',
    timestamp: '5 minutes ago',
  },
  {
    id: 'activity-2',
    icon: 'fa-code-branch',
    color: 'text-emerald-400',
    label: 'Snowflake branch',
    detail: 'Branched Act II synopsis for alternate timeline.',
    timestamp: '22 minutes ago',
  },
  {
    id: 'activity-3',
    icon: 'fa-chart-line',
    color: 'text-sky-400',
    label: 'Diagnostics run',
    detail: 'Continuity sweep flagged timeline overlap.',
    timestamp: '1 hour ago',
  },
  {
    id: 'activity-4',
    icon: 'fa-file-export',
    color: 'text-amber-400',
    label: 'Export queued',
    detail: 'DOCX export queued for Aurora Sanctum.',
    timestamp: 'Yesterday',
  },
];

export const sceneBoard: SceneLane[] = [
  {
    key: 'idea',
    label: 'Idea bank',
    description: 'High-level prompts and fragments waiting for placement.',
    scenes: [
      {
        id: 'scene-idea-1',
        title: 'Ghost library encounter',
        purpose: 'Introduce spectral archivists hinting at paradox.',
        pov: 'Lyra',
        status: 'idea',
        linkedThreads: ['time-paradox', 'artifact-mystery'],
      },
    ],
  },
  {
    key: 'planned',
    label: 'Planned',
    description: 'Scenes with planner metadata ready to draft.',
    scenes: [
      {
        id: 'scene-plan-1',
        title: 'Council dossier exchange',
        purpose: 'Reveal political factions and alliances.',
        pov: 'Tarek',
        status: 'planned',
        linkedThreads: ['found-family'],
      },
      {
        id: 'scene-plan-2',
        title: 'Ritual rehearsal',
        purpose: 'Test time anchor ritual with stakes introduced.',
        pov: 'Lyra',
        status: 'planned',
        linkedThreads: ['time-paradox', 'arc-reckoning'],
      },
    ],
  },
  {
    key: 'drafted',
    label: 'Drafted',
    description: 'Scenes with completed drafts awaiting revision.',
    scenes: [
      {
        id: 'scene-draft-1',
        title: 'Archive fire',
        purpose: 'Demonstrate antagonist power and escalate stakes.',
        pov: 'Lyra',
        status: 'drafted',
        linkedThreads: ['time-paradox'],
      },
    ],
  },
  {
    key: 'revised',
    label: 'Revised',
    description: 'Scenes polished and ready for manuscript export.',
    scenes: [
      {
        id: 'scene-rev-1',
        title: 'Bonding over timelines',
        purpose: 'Showcase crew cohesion and theme payoff.',
        pov: 'Ansel',
        status: 'revised',
        linkedThreads: ['found-family'],
      },
    ],
  },
];

export const characterRoster: CharacterProfile[] = [
  {
    id: 'char-lyra',
    name: 'Lyra Thorne',
    role: 'Archivist protagonist',
    goal: 'Restore canonical timeline',
    flaw: 'Control obsession',
    arc: 'both',
    pov: true,
    status: 'draft',
    relationships: [
      { id: 'rel-1', targetId: 'char-ansel', label: 'Mentor — strained' },
      { id: 'rel-2', targetId: 'char-tarek', label: 'Allies — trust building' },
    ],
  },
  {
    id: 'char-tarek',
    name: 'Tarek Sol',
    role: 'Disgraced chronomancer',
    goal: 'Prove loyalty and regain timekeeper post',
    flaw: 'Secretive tendencies',
    arc: 'internal',
    pov: true,
    status: 'outline',
    relationships: [
      { id: 'rel-3', targetId: 'char-lyra', label: 'Allies — unresolved history' },
      { id: 'rel-4', targetId: 'char-ansel', label: 'Rivals — ideological clash' },
    ],
  },
  {
    id: 'char-ansel',
    name: 'Ansel Vire',
    role: 'Mentor and antagonist',
    goal: 'Rewrite time to erase failure',
    flaw: 'Messianic complex',
    arc: 'external',
    pov: false,
    status: 'outline',
    relationships: [{ id: 'rel-5', targetId: 'char-lyra', label: 'Mentor — betrayal reveal pending' }],
  },
  {
    id: 'char-mira',
    name: 'Mira Calder',
    role: 'Engineer of time anchors',
    goal: 'Safeguard family from timeline collapse',
    flaw: 'Analysis paralysis',
    arc: 'internal',
    pov: false,
    status: 'draft',
    relationships: [{ id: 'rel-6', targetId: 'char-lyra', label: 'Found family' }],
  },
];

export const worldAtlas: WorldEntry[] = [
  {
    id: 'world-archive',
    type: 'location',
    name: 'Verdant Archive',
    description: 'Living library that records every timeline iteration within luminescent flora.',
    importance: 'core',
    linkedChapters: ['ch-1', 'ch-4'],
  },
  {
    id: 'world-faction',
    type: 'faction',
    name: 'Chronomancers\' Conclave',
    description: 'Guild regulating time anchors, currently fractured by ideological schism.',
    importance: 'core',
    linkedChapters: ['ch-2', 'ch-3'],
  },
  {
    id: 'world-rule',
    type: 'rule',
    name: 'Anchor resonance law',
    description: 'Only one active time anchor per timeline to avoid cascade failures.',
    importance: 'supporting',
    linkedChapters: ['ch-2', 'ch-4'],
  },
  {
    id: 'world-artifact',
    type: 'artifact',
    name: 'Chronoglass sigil',
    description: 'Shard that stores alternate futures; key to unlocking mentor plan.',
    importance: 'core',
    linkedChapters: ['ch-3', 'ch-4'],
  },
];

export const workspacePanels = [
  {
    key: 'beats',
    label: 'Beats',
    icon: 'fa-wave-square',
    description: 'Drag-and-drop beat boards with pacing meters and beat coverage diagnostics.',
  },
  {
    key: 'characters',
    label: 'Characters',
    icon: 'fa-people-group',
    description: 'Cast bios, relationship graph, and arc timelines for each POV character.',
  },
  {
    key: 'world',
    label: 'World',
    icon: 'fa-globe',
    description: 'Location atlas, faction dossiers, and magic system rulebook with backlinks.',
  },
  {
    key: 'timeline',
    label: 'Timeline',
    icon: 'fa-timeline',
    description: 'Chronological vs. narrative order tracker with conflict warnings.',
  },
  {
    key: 'scenes',
    label: 'Scenes',
    icon: 'fa-clapperboard',
    description: 'Scene planner and kanban lanes from idea to revised draft.',
  },
  {
    key: 'threads',
    label: 'Threads',
    icon: 'fa-diagram-project',
    description: 'Heat-map of themes, motifs, clues, and B-plots across chapters.',
  },
  {
    key: 'revisions',
    label: 'Revisions',
    icon: 'fa-code-compare',
    description: 'Version snapshots, diagnostics history, and revision color labels.',
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: 'fa-sliders',
    description: 'Manage custom structures, diagnostics thresholds, and color palettes.',
  },
] as const;

export type WorkspacePanelKey = (typeof workspacePanels)[number]['key'];

export type WorkspaceMetrics = {
  beatsOutlined: number;
  scenesPlanned: number;
  timelineWarnings: number;
  threadCoverage: number;
  povBalance: string;
};

export const defaultWorkspaceMetrics: WorkspaceMetrics = {
  beatsOutlined: 18,
  scenesPlanned: 42,
  timelineWarnings: 2,
  threadCoverage: 74,
  povBalance: 'Lyra 65% · Tarek 25% · Ansel 10%',
};

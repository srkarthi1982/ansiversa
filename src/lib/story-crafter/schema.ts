import { clone } from '../../utils/clone';

export type StoryPlan = 'free' | 'pro';

export type StoryFrameworkKey = 'three-act' | 'save-the-cat';

export type StoryPanelKey =
  | 'overview'
  | 'outline'
  | 'characters'
  | 'world'
  | 'scenes'
  | 'export';

export type StoryWorldFilter = 'all' | 'location' | 'faction' | 'item' | 'rule';

export type StoryTemplateKey = 'short-story' | 'novella' | 'novel';

export type StoryBeatStatus = 'idea' | 'drafting' | 'refined';

export type StorySceneStatus = 'idea' | 'draft' | 'revise' | 'final';

export type StoryPassType =
  | 'dialogue'
  | 'show-dont-tell'
  | 'pacing'
  | 'style'
  | 'consistency';

export type StoryFramework = {
  key: StoryFrameworkKey;
  name: string;
  description: string;
  beats: { id: string; title: string; question: string }[];
};

export type StoryTemplate = {
  key: StoryTemplateKey;
  label: string;
  description: string;
  recommendedFramework: StoryFrameworkKey;
  targetWords: number;
  defaultTone: string;
  defaultPov: string;
  defaultTense: string;
  genres: string[];
};

export type StoryBeat = {
  id: string;
  title: string;
  summary: string;
  status: StoryBeatStatus;
  wordGoal: number;
  relatedSceneIds: string[];
};

export type StoryChapter = {
  id: string;
  title: string;
  summary: string;
  wordGoal: number;
  progress: number;
};

export type StoryScene = {
  id: string;
  title: string;
  chapterId: string | null;
  beatId: string | null;
  summary: string;
  wordGoal: number;
  wordCount: number;
  status: StorySceneStatus;
  pov: string;
  tense: string;
  spotlight: string;
  lastEdited: string;
  passes: { type: StoryPassType; timestamp: string; note: string }[];
};

export type StoryCharacter = {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'ally' | 'other';
  archetype: string;
  bio: string;
  goals: string[];
  arc: {
    type: 'positive' | 'flat' | 'negative';
    need: string;
    wound: string;
    lie: string;
    truth: string;
  };
  relationships: { targetId: string; label: string }[];
};

export type StoryWorldEntry = {
  id: string;
  type: 'location' | 'faction' | 'item' | 'rule';
  name: string;
  summary: string;
  detail: string;
  tags: string[];
};

export type StoryTimelineEvent = {
  id: string;
  label: string;
  when: string;
  summary: string;
  sceneId: string | null;
};

export type StoryCanonFact = {
  id: string;
  entityType: 'character' | 'place' | 'item' | 'date' | 'misc';
  key: string;
  value: string;
  sources: string[];
  confidence: number;
};

export type StoryNote = {
  id: string;
  label: string;
  createdAt: string;
  text: string;
};

export type StoryExportPreset = {
  id: string;
  label: string;
  description: string;
  formats: ('md' | 'docx' | 'epub')[];
  includes: string[];
  gatedFor: StoryPlan[];
};

export type StoryActivityItem = {
  id: string;
  icon: string;
  color: string;
  label: string;
  detail: string;
  timestamp: string;
};

export type StoryProject = {
  id: string;
  title: string;
  subtitle: string;
  logline: string;
  status: 'active' | 'archived';
  tags: string[];
  template: StoryTemplateKey;
  framework: StoryFrameworkKey;
  genre: string;
  subgenre: string;
  tone: string;
  pov: string;
  tense: string;
  audience: string;
  targetWords: number;
  wordsWritten: number;
  chaptersPlanned: number;
  lastEdited: string;
  outlineConfidence: number;
  aiCallsThisWeek: number;
  beatSheetVersion: number;
  characters: StoryCharacter[];
  beats: StoryBeat[];
  chapters: StoryChapter[];
  scenes: StoryScene[];
  world: StoryWorldEntry[];
  timeline: StoryTimelineEvent[];
  canon: StoryCanonFact[];
  notes: StoryNote[];
  exports: { id: string; format: 'md' | 'docx' | 'epub'; createdAt: string }[];
};

export type StoryLibraryMetrics = {
  totalWords: number;
  activeProjects: number;
  archivedProjects: number;
  aiCallsToday: number;
  lastExportAt: string | null;
};

export const storyFrameworks: StoryFramework[] = [
  {
    key: 'three-act',
    name: '3-Act Structure',
    description:
      'Classic setup, confrontation, resolution. Great for mystery, thriller, and literary fiction pacing.',
    beats: [
      { id: 'act1-hook', title: 'Hook', question: 'Why must we care about the opening image?' },
      { id: 'inciting', title: 'Inciting Incident', question: 'What event upends the protagonist\'s status quo?' },
      { id: 'debate', title: 'Debate', question: 'How does the hero hesitate before committing?' },
      { id: 'break-into-two', title: 'Break into Act II', question: 'What choice launches the hero into the new world?' },
      { id: 'midpoint', title: 'Midpoint Shift', question: 'What revelation flips stakes or power dynamics?' },
      { id: 'all-is-lost', title: 'All is Lost', question: 'What is stripped away before the finale?' },
      { id: 'climax', title: 'Climax', question: 'How does the hero resolve the central conflict?' },
      { id: 'denouement', title: 'Denouement', question: 'What new status quo emerges?' },
    ],
  },
  {
    key: 'save-the-cat',
    name: 'Save the Cat',
    description:
      'Fifteen-beat crowd-pleasing framework blending character sympathy with escalating stakes.',
    beats: [
      { id: 'opening-image', title: 'Opening Image', question: 'What snapshot sets tone and genre expectations?' },
      { id: 'theme-stated', title: 'Theme Stated', question: 'Who hints at the thematic lesson?' },
      { id: 'setup', title: 'Setup', question: 'What routines and supporting cast define the hero\'s world?' },
      { id: 'catalyst', title: 'Catalyst', question: 'What surprise forces the hero into action?' },
      { id: 'debate-beat', title: 'Debate', question: 'How does the hero wrestle with the call to adventure?' },
      { id: 'break-into-two-beat', title: 'Break into Two', question: 'Which bold choice launches Act II?' },
      { id: 'b-story', title: 'B Story', question: 'Who anchors the emotional journey?' },
      { id: 'fun-and-games', title: 'Fun & Games', question: 'What promise-of-the-premise moments delight readers?' },
      { id: 'midpoint-beat', title: 'Midpoint', question: 'What victory or defeat raises the stakes?' },
      { id: 'bad-guys-close-in', title: 'Bad Guys Close In', question: 'How do internal and external forces tighten?' },
      { id: 'all-is-lost-beat', title: 'All Is Lost', question: 'What loss crushes hope?' },
      { id: 'dark-night', title: 'Dark Night of the Soul', question: 'How does the hero reckon with failure?' },
      { id: 'break-into-three', title: 'Break into Three', question: 'What synthesis sparks the final plan?' },
      { id: 'finale', title: 'Finale', question: 'How does the hero prove transformation?' },
      { id: 'final-image', title: 'Final Image', question: 'What closing echo shows the change?' },
    ],
  },
];

export const storyTemplates: StoryTemplate[] = [
  {
    key: 'short-story',
    label: 'Short Story — 5k words',
    description: 'Tight focus on a single turning point and emotional punch.',
    recommendedFramework: 'three-act',
    targetWords: 5000,
    defaultTone: 'Lyrical with sharp contrasts',
    defaultPov: 'First-person limited',
    defaultTense: 'Past',
    genres: ['Literary', 'Speculative', 'Mystery'],
  },
  {
    key: 'novella',
    label: 'Novella — 30k words',
    description: 'Layered arcs with one central subplot and compact cast.',
    recommendedFramework: 'three-act',
    targetWords: 30000,
    defaultTone: 'Intimate and hopeful',
    defaultPov: 'Third-person limited',
    defaultTense: 'Past',
    genres: ['Romance', 'Fantasy', 'Mystery'],
  },
  {
    key: 'novel',
    label: 'Novel — 90k words',
    description: 'Robust ensemble, multiple arcs, and sprawling worldbuilding.',
    recommendedFramework: 'save-the-cat',
    targetWords: 90000,
    defaultTone: 'Cinematic and propulsive',
    defaultPov: 'Third-person limited',
    defaultTense: 'Past',
    genres: ['Science Fiction', 'Thriller', 'Fantasy'],
  },
];

const now = () => new Date().toISOString();

const toBeat = (
  key: StoryFrameworkKey,
  overrides: Partial<StoryBeat> & { id: string; title: string },
): StoryBeat => ({
  id: overrides.id,
  title: overrides.title,
  summary: overrides.summary ?? 'Untitled moment awaiting refinement.',
  status: overrides.status ?? 'idea',
  wordGoal: overrides.wordGoal ?? (key === 'save-the-cat' ? 1200 : 800),
  relatedSceneIds: overrides.relatedSceneIds ?? [],
});

const toScene = (overrides: Partial<StoryScene> & { id: string; title: string }): StoryScene => ({
  id: overrides.id,
  title: overrides.title,
  chapterId: overrides.chapterId ?? null,
  beatId: overrides.beatId ?? null,
  summary: overrides.summary ?? 'Outline this scene to keep momentum clear.',
  wordGoal: overrides.wordGoal ?? 1500,
  wordCount: overrides.wordCount ?? 0,
  status: overrides.status ?? 'idea',
  pov: overrides.pov ?? '3rd limited',
  tense: overrides.tense ?? 'Past',
  spotlight: overrides.spotlight ?? 'Tension',
  lastEdited: overrides.lastEdited ?? now(),
  passes:
    overrides.passes?.map((pass) => ({ ...pass })) ??
    [
      {
        type: 'consistency',
        timestamp: now(),
        note: 'Canon check queued.',
      },
    ],
});

const toCharacter = (overrides: Partial<StoryCharacter> & { id: string; name: string }): StoryCharacter => ({
  id: overrides.id,
  name: overrides.name,
  role: overrides.role ?? 'ally',
  archetype: overrides.archetype ?? 'Everyperson',
  bio:
    overrides.bio ??
    'Flesh out voice, physicality, and contradictions to keep them vivid across scenes.',
  goals: overrides.goals ?? ['Short-term: survive the inciting incident'],
  arc: {
    type: overrides.arc?.type ?? 'positive',
    need: overrides.arc?.need ?? 'Accept help from allies',
    wound: overrides.arc?.wound ?? 'Trust shattered by early betrayal',
    lie: overrides.arc?.lie ?? 'Only self-reliance keeps danger away',
    truth: overrides.arc?.truth ?? 'Vulnerability is a strength',
  },
  relationships:
    overrides.relationships?.map((rel) => ({ ...rel })) ??
    [{ targetId: 'char-mentor', label: 'Mentor' }],
});

const toWorldEntry = (
  overrides: Partial<StoryWorldEntry> & { id: string; name: string; type: StoryWorldEntry['type'] },
): StoryWorldEntry => ({
  id: overrides.id,
  type: overrides.type,
  name: overrides.name,
  summary: overrides.summary ?? 'Describe the sensory anchors and narrative role.',
  detail:
    overrides.detail ??
    'Use this space to capture rules, history, and notable conflicts that scenes should respect.',
  tags: overrides.tags ?? ['core'],
});

const toTimelineEvent = (
  overrides: Partial<StoryTimelineEvent> & { id: string; label: string },
): StoryTimelineEvent => ({
  id: overrides.id,
  label: overrides.label,
  when: overrides.when ?? 'Chapter 1',
  summary: overrides.summary ?? 'Track major turning points to keep canon tight.',
  sceneId: overrides.sceneId ?? null,
});

const toCanonFact = (
  overrides: Partial<StoryCanonFact> & { id: string; key: string; value: string },
): StoryCanonFact => ({
  id: overrides.id,
  entityType: overrides.entityType ?? 'misc',
  key: overrides.key,
  value: overrides.value,
  sources: overrides.sources ?? ['scene-1'],
  confidence: overrides.confidence ?? 0.82,
});

const toNote = (overrides: Partial<StoryNote> & { id: string; label: string }): StoryNote => ({
  id: overrides.id,
  label: overrides.label,
  createdAt: overrides.createdAt ?? now(),
  text:
    overrides.text ??
    'Use notes to track revision goals, editorial reminders, or worldbuilding loose ends.',
});

const baseProject = (
  overrides: Partial<StoryProject> & { id: string; title: string },
): StoryProject => ({
  id: overrides.id,
  title: overrides.title,
  subtitle:
    overrides.subtitle ?? 'Use the workspace panels to keep outline, cast, and canon in lockstep.',
  logline:
    overrides.logline ??
    'A determined protagonist confronts an escalating conflict that tests their core belief.',
  status: overrides.status ?? 'active',
  tags: overrides.tags ?? ['draft', 'needs-outline'],
  template: overrides.template ?? 'novel',
  framework: overrides.framework ?? 'save-the-cat',
  genre: overrides.genre ?? 'Science Fiction',
  subgenre: overrides.subgenre ?? 'Solarpunk Thriller',
  tone: overrides.tone ?? 'Hopeful yet tense',
  pov: overrides.pov ?? '3rd limited',
  tense: overrides.tense ?? 'Past',
  audience: overrides.audience ?? 'Adult',
  targetWords: overrides.targetWords ?? 90000,
  wordsWritten: overrides.wordsWritten ?? 24500,
  chaptersPlanned: overrides.chaptersPlanned ?? 28,
  lastEdited: overrides.lastEdited ?? now(),
  outlineConfidence: overrides.outlineConfidence ?? 0.62,
  aiCallsThisWeek: overrides.aiCallsThisWeek ?? 18,
  beatSheetVersion: overrides.beatSheetVersion ?? 3,
  characters: overrides.characters ?? [toCharacter({ id: 'char-protag', name: 'Asha Raman', role: 'protagonist' })],
  beats:
    overrides.beats ??
    [
      toBeat('save-the-cat', {
        id: 'opening-image',
        title: 'Opening Image',
        summary: 'Dawn over the floating barrio; solar kites ripple as protests brew.',
        status: 'refined',
        wordGoal: 1000,
        relatedSceneIds: ['scene-1'],
      }),
      toBeat('save-the-cat', {
        id: 'catalyst',
        title: 'Catalyst',
        summary: 'Energy shield flickers, revealing sabotage that could scorch the enclave.',
        status: 'drafting',
        wordGoal: 1200,
        relatedSceneIds: ['scene-3'],
      }),
      toBeat('save-the-cat', {
        id: 'all-is-lost',
        title: 'All Is Lost',
        summary: 'Hero watches mentor captured; timeline fracture threatens twin city.',
        status: 'idea',
        wordGoal: 1400,
        relatedSceneIds: ['scene-10'],
      }),
    ],
  chapters:
    overrides.chapters ??
    [
      {
        id: 'chapter-1',
        title: 'City of Mirrors',
        summary: 'Introduce enclave politics and hero\'s dual life as engineer and smuggler.',
        wordGoal: 4000,
        progress: 0.55,
      },
      {
        id: 'chapter-2',
        title: 'Fault Lines',
        summary: 'Sabotage ripples through energy grid; mentor hints at deeper plot.',
        wordGoal: 4200,
        progress: 0.3,
      },
    ],
  scenes:
    overrides.scenes ??
    [
      toScene({
        id: 'scene-1',
        title: 'Kite Parade Interrupted',
        chapterId: 'chapter-1',
        beatId: 'opening-image',
        summary: 'Hero monitors solar kites when a blackout cascades through the skyline.',
        wordGoal: 1800,
        wordCount: 1600,
        status: 'draft',
        spotlight: 'Worldbuilding',
      }),
      toScene({
        id: 'scene-3',
        title: 'Saboteur in the Switchyard',
        chapterId: 'chapter-1',
        beatId: 'catalyst',
        summary: 'Chase through maintenance tunnels reveals a faction emblem scorched into steel.',
        wordGoal: 1900,
        wordCount: 900,
        status: 'revise',
        spotlight: 'Action',
        passes: [
          {
            type: 'dialogue',
            timestamp: now(),
            note: 'Sharpened banter and seeded clue about flux drive.',
          },
          {
            type: 'show-dont-tell',
            timestamp: now(),
            note: 'Converted exposition about tunnels into sensory detail.',
          },
        ],
      }),
      toScene({
        id: 'scene-10',
        title: 'Fracture at the Archive',
        chapterId: 'chapter-7',
        beatId: 'all-is-lost',
        summary: 'Timeline rift manifests; mentor caught between split realities.',
        wordGoal: 2200,
        wordCount: 0,
        status: 'idea',
        spotlight: 'Twist',
      }),
    ],
  world:
    overrides.world ??
    [
      toWorldEntry({
        id: 'world-skydocks',
        type: 'location',
        name: 'Skydocks of Kalyana',
        summary: 'Floating logistics hub tethered by carbon filaments.',
        detail: 'Ships swap antimatter cells; union rules forbid AI pilots inside airspace.',
        tags: ['location', 'infrastructure'],
      }),
      toWorldEntry({
        id: 'world-faction',
        type: 'faction',
        name: 'Flux Mendicants',
        summary: 'Rogue scientists stabilising timelines for a price.',
        detail: 'They believe entropy is a moral test; operate via encoded folk songs.',
        tags: ['faction', 'antagonist'],
      }),
      toWorldEntry({
        id: 'world-law',
        type: 'rule',
        name: 'Chrono Concordat',
        summary: 'Legislation forbidding timefold tech within city limits.',
        detail: 'Violations trigger audits from intercity council; hero\'s mentor drafted clause 7.',
        tags: ['rule'],
      }),
    ],
  timeline:
    overrides.timeline ??
    [
      toTimelineEvent({
        id: 'timeline-1',
        label: 'Festival Blackout',
        when: 'Day 1 — Dawn',
        summary: 'Grid fails during kite festival; panic reveals sabotage.',
        sceneId: 'scene-1',
      }),
      toTimelineEvent({
        id: 'timeline-2',
        label: 'Mentor Captured',
        when: 'Day 5 — Night',
        summary: 'Flux Mendicants seize mentor; hero glimpses branching timeline.',
        sceneId: 'scene-10',
      }),
    ],
  canon:
    overrides.canon ??
    [
      toCanonFact({
        id: 'canon-asha-eyes',
        entityType: 'character',
        key: 'Asha Raman — eye colour',
        value: 'Copper-brown with bioluminescent flecks after chronoflux exposure',
        sources: ['scene-1', 'scene-5'],
      }),
      toCanonFact({
        id: 'canon-docks',
        entityType: 'place',
        key: 'Skydocks curfew',
        value: 'Curfew at 02:00 local; patrol drones sweep every 17 minutes.',
        sources: ['scene-2'],
        confidence: 0.9,
      }),
    ],
  notes:
    overrides.notes ??
    [
      toNote({
        id: 'note-1',
        label: 'Theme reminder',
        text: 'Balance community care with technological ambition; keep stakes human.',
      }),
      toNote({
        id: 'note-2',
        label: 'Revision to-do',
        text: 'Layer in mentor\'s secret earlier; foreshadow timeline fracture by Chapter 3.',
      }),
    ],
  exports:
    overrides.exports ?? [
      { id: 'export-1', format: 'md', createdAt: overrides.lastEdited ?? now() },
    ],
});

export const sampleStoryProjects: StoryProject[] = [
  baseProject({ id: 'proj-aurora', title: 'Aurora Divide' }),
  baseProject({
    id: 'proj-marrow',
    title: 'Marrow of the Labyrinth',
    genre: 'Fantasy',
    subgenre: 'Mythic Mystery',
    tone: 'Lush and eerie',
    pov: '1st person',
    targetWords: 75000,
    wordsWritten: 31800,
    outlineConfidence: 0.74,
    tags: ['revision', 'arc-polish'],
    beats: [
      toBeat('three-act', {
        id: 'hook-labyrinth',
        title: 'Whispers in the Labyrinth',
        summary: 'Hero descends into living maze seeking lost sibling.',
        status: 'refined',
        wordGoal: 900,
        relatedSceneIds: ['scene-lyra-1'],
      }),
      toBeat('three-act', {
        id: 'midpoint-echo',
        title: 'Midpoint Echo',
        summary: 'Maze offers bargain: trade memory for knowledge.',
        status: 'drafting',
        wordGoal: 1300,
        relatedSceneIds: ['scene-lyra-4'],
      }),
    ],
    scenes: [
      toScene({
        id: 'scene-lyra-1',
        title: 'Rootbound Entrance',
        chapterId: 'chapter-lyra-1',
        summary: 'Hero performs ritual with bone flute to open living archway.',
        status: 'draft',
        wordCount: 2100,
        wordGoal: 2000,
        pov: '1st person',
        passes: [
          { type: 'style', timestamp: now(), note: 'Laced scene with synesthetic imagery.' },
        ],
      }),
      toScene({
        id: 'scene-lyra-4',
        title: 'The Bargain Mirror',
        chapterId: 'chapter-lyra-3',
        summary: 'Maze conjures sibling\'s voice; hero must relinquish childhood memory.',
        status: 'idea',
        wordGoal: 1800,
        wordCount: 0,
        spotlight: 'Emotional',
      }),
    ],
    characters: [
      toCharacter({
        id: 'char-lyra',
        name: 'Lyra of the Root Choir',
        role: 'protagonist',
        archetype: 'Reluctant heir',
        goals: ['Find sibling', 'Unlock labyrinth\'s heart'],
        arc: {
          type: 'positive',
          need: 'Trust ancestral memories',
          wound: 'Lost in labyrinth as child',
          lie: 'The maze punishes compassion',
          truth: 'Empathy maps the maze',
        },
        relationships: [
          { targetId: 'char-felix', label: 'Missing brother' },
          { targetId: 'char-maze', label: 'Sentient labyrinth' },
        ],
      }),
      toCharacter({
        id: 'char-maze',
        name: 'Labyrinth Avatar',
        role: 'other',
        archetype: 'Trickster guardian',
        arc: {
          type: 'flat',
          need: 'Maintain balance',
          wound: 'Bound by pact to serve root choir',
          lie: 'Mortals cannot change the maze',
          truth: 'Choice reshapes pathways',
        },
      }),
    ],
    world: [
      toWorldEntry({
        id: 'world-chorus',
        type: 'faction',
        name: 'Root Choir',
        summary: 'Order of singers weaving living stone with resonance.',
        tags: ['faction', 'magic'],
      }),
      toWorldEntry({
        id: 'world-echo',
        type: 'rule',
        name: 'Law of Echoes',
        summary: 'Every bargain echoes thrice with increasing cost.',
        tags: ['rule'],
      }),
    ],
    notes: [
      toNote({ id: 'note-lyra', label: 'Subplot thread', text: 'Felix left clue with ivy sigils; pay off in Act III.' }),
    ],
  }),
  baseProject({
    id: 'proj-siren',
    title: 'Signal of the Tidal Siren',
    genre: 'Thriller',
    subgenre: 'Techno-mystery',
    tone: 'Urgent and investigative',
    pov: '3rd limited',
    targetWords: 68000,
    wordsWritten: 12500,
    status: 'active',
    tags: ['outline', 'needs-draft'],
    outlineConfidence: 0.4,
    beats: [
      toBeat('save-the-cat', {
        id: 'theme-stated',
        title: 'Theme Stated',
        summary: 'Partner warns hero: the ocean remembers every lie.',
        status: 'drafting',
        wordGoal: 800,
      }),
      toBeat('save-the-cat', {
        id: 'fun-and-games',
        title: 'Fun & Games',
        summary: 'Investigative montage across decommissioned lighthouses.',
        status: 'idea',
        wordGoal: 2000,
      }),
    ],
    scenes: [
      toScene({
        id: 'scene-siren-1',
        title: 'Drowned Archive',
        summary: 'Diving into sealed server vault to pull old shipping manifests.',
        wordGoal: 1700,
        wordCount: 850,
        status: 'draft',
        spotlight: 'Investigation',
      }),
    ],
    characters: [
      toCharacter({ id: 'char-marco', name: 'Marco Ibarra', role: 'protagonist', archetype: 'Reluctant investigator' }),
      toCharacter({ id: 'char-nai', name: 'Nai the Acousticist', role: 'ally', archetype: 'Sound engineer savant' }),
    ],
    world: [
      toWorldEntry({
        id: 'world-signal-net',
        type: 'item',
        name: 'Signal Net Array',
        summary: 'Undersea mesh that amplifies sonar whispers.',
        tags: ['technology'],
      }),
    ],
    notes: [toNote({ id: 'note-siren', label: 'AI prompt idea', text: 'Ask for dialogue polish for Nai\'s humor.' })],
  }),
];

export const storyActivityLog: StoryActivityItem[] = [
  {
    id: 'activity-1',
    icon: 'fa-sparkles',
    color: 'text-indigo-500',
    label: 'Outline refresh',
    detail: 'Generated Save the Cat beat sheet for Aurora Divide.',
    timestamp: now(),
  },
  {
    id: 'activity-2',
    icon: 'fa-wand-magic-sparkles',
    color: 'text-emerald-500',
    label: 'Dialogue polish',
    detail: 'Improved banter in Saboteur in the Switchyard (scene-3).',
    timestamp: now(),
  },
  {
    id: 'activity-3',
    icon: 'fa-cloud-arrow-down',
    color: 'text-sky-500',
    label: 'Export queued',
    detail: 'DOCX compile requested for Marrow of the Labyrinth.',
    timestamp: now(),
  },
];

export const storyExportPresets: StoryExportPreset[] = [
  {
    id: 'export-draft',
    label: 'Workshop Draft',
    description: 'Clean Markdown with scene headers, beat notes, and revision checklist.',
    formats: ['md'],
    includes: ['Title page', 'Scene separators', 'Revision notes appendix'],
    gatedFor: ['free', 'pro'],
  },
  {
    id: 'export-agent',
    label: 'Agent Submission',
    description: 'DOCX with double-spacing, proper header, and optional synopsis.',
    formats: ['docx'],
    includes: ['Title page', 'Synopsis', 'Chapter breaks'],
    gatedFor: ['pro'],
  },
  {
    id: 'export-epub',
    label: 'Reader Preview',
    description: 'EPUB with cover placeholder and ToC for test readers.',
    formats: ['epub'],
    includes: ['Cover placeholder', 'Table of contents', 'Acknowledgements'],
    gatedFor: ['pro'],
  },
];

export const createProjectFromTemplate = (
  templateKey: StoryTemplateKey,
  title: string,
): StoryProject => {
  const template = storyTemplates.find((tpl) => tpl.key === templateKey) ?? storyTemplates[0];
  const framework = template.recommendedFramework;
  const frameworkDefinition = storyFrameworks.find((item) => item.key === framework);
  return baseProject({
    id: `proj-${Math.random().toString(36).slice(2, 8)}`,
    title,
    template: template.key,
    framework,
    targetWords: template.targetWords,
    tone: template.defaultTone,
    pov: template.defaultPov,
    tense: template.defaultTense,
    genre: template.genres[0] ?? 'Speculative',
    tags: ['new', 'outline'],
    beats:
      frameworkDefinition?.beats.slice(0, 5).map((beat, index) =>
        toBeat(framework, {
          id: `${beat.id}-new-${index}`,
          title: beat.title,
          summary: beat.question,
          status: 'idea',
          wordGoal: Math.round(template.targetWords / (frameworkDefinition?.beats.length ?? 10)),
          relatedSceneIds: [],
        }),
      ) ?? [],
    scenes: [],
    chapters: [],
    world: [],
    characters: [
      toCharacter({
        id: 'char-new-protagonist',
        name: 'Unnamed Protagonist',
        role: 'protagonist',
        bio: 'Sketch motivation, contradictions, and distinctive voice.',
        relationships: [],
      }),
    ],
    notes: [
      toNote({
        id: 'note-new',
        label: 'First steps',
        text: `Outline the central conflict and populate ${frameworkDefinition?.beats.length ?? 10} beats.`,
      }),
    ],
  });
};

export const cloneProjects = (projects: StoryProject[]): StoryProject[] => projects.map((project) => clone(project));

export const computeLibraryMetrics = (projects: StoryProject[]): StoryLibraryMetrics => {
  if (projects.length === 0) {
    return {
      totalWords: 0,
      activeProjects: 0,
      archivedProjects: 0,
      aiCallsToday: 0,
      lastExportAt: null,
    };
  }
  const totalWords = projects.reduce((sum, project) => sum + project.wordsWritten, 0);
  const activeProjects = projects.filter((project) => project.status === 'active').length;
  const archivedProjects = projects.length - activeProjects;
  const lastExportAt = projects
    .flatMap((project) => project.exports)
    .map((exportJob) => exportJob.createdAt)
    .sort()
    .pop() ?? null;
  return {
    totalWords,
    activeProjects,
    archivedProjects,
    aiCallsToday: Math.max(8, Math.round(totalWords / 5000)),
    lastExportAt,
  };
};

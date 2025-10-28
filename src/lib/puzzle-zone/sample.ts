import type { PuzzleZoneSampleData } from '../../types/puzzle-zone';

const isoDate = (offsetDays = 0) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString();
};

const minutesToMs = (minutes: number) => minutes * 60 * 1000;

export const getPuzzleZoneSampleData = (): PuzzleZoneSampleData => ({
  types: [
    {
      id: 'sudoku',
      name: 'Sudoku',
      tagline: 'Adaptive grids that teach human-first solving patterns.',
      description:
        'Train constraint logic with smart candidates, conflict heatmaps, and optional coaching nudges. Generators ensure a single elegant solution every time.',
      board: {
        label: '9×9 Hard Snapshot',
        rows: ['5 · · | · 3 · | 7 · ·', '· 3 7 | 6 · 4 | · 9 ·', '· · · | · · · | 2 · ·', '──────┼──────┼──────', '· 5 · | 3 · · | · · 6', '6 · · | 9 · 2 | · · 1', '──────┼──────┼──────', '· · 3 | · 4 · | · · ·', '1 7 · | 2 · 5 | · 4 ·', '· · · | · 7 · | 6 · 3'],
      },
      generator: 'Diagonal seeding + uniqueness-preserving dig out',
      validator: 'Constraint propagation with backtracking fallback',
      bestFor: ['Logic classrooms', 'Competitive practice', 'Brain-training streaks'],
      difficulties: [
        {
          level: 'Easy',
          targetTime: '4–6 min',
          highlight: 'Trainer calls out singles and hidden singles as you play.',
          supports: ['Candidate overlay', 'Mistake highlighting', 'Row/column hints'],
        },
        {
          level: 'Medium',
          targetTime: '7–10 min',
          highlight: 'Unlocks advanced techniques like X-Wing + Swordfish hints.',
          supports: ['Pattern detector', 'Chain visualiser', 'Undo timeline'],
        },
        {
          level: 'Hard',
          targetTime: '11–16 min',
          highlight: 'Competition timer, analytics, and proof-of-uniqueness exports.',
          supports: ['Pencilmark heatmap', 'Remote pairs warnings', 'Logic step replay'],
        },
      ],
      hintExamples: [
        'Only one candidate fits row 4 column 7 — try digit 8 to unlock the box.',
        'Consider an X-Wing on digit 2 across columns 1 and 7.',
        'Swordfish pattern spotted on digit 5 — eliminate column 6 options.',
      ],
    },
    {
      id: 'crossword',
      name: 'Mini Crossword',
      tagline: 'Publish-ready mini grids with smart clue drafting.',
      description:
        'Blend curated word lists with AI clue rewrites. Build symmetric 5×5 and 9×9 puzzles, export to PUZ, and collaborate with Trivia Arena to source on-theme questions.',
      board: {
        label: '5×5 Theme: Solar Break',
        rows: ['S U N · ·', '· · L E O', '· · A · ·', 'F L A R E', '· · · · R'],
      },
      generator: 'Word-slot backtracking with theme + pangram scoring',
      validator: 'Cross-check dictionary + clue difficulty balancer',
      bestFor: ['Campus newspapers', 'Marketing drops', 'Team standups'],
      difficulties: [
        {
          level: 'Easy',
          targetTime: '3–5 min',
          highlight: 'Auto-fill symmetrical minis with clue drafting coach.',
          supports: ['Auto-validate across/down', 'Smart reveal cell/word', 'Cross-lists import'],
        },
        {
          level: 'Medium',
          targetTime: '6–8 min',
          highlight: 'Theme-aware fill suggestions and alt-clue variants.',
          supports: ['Grid symmetry toggles', 'Autosave drafts', 'Collaborator comments'],
        },
        {
          level: 'Hard',
          targetTime: '9–12 min',
          highlight: 'Story arcs with multi-word entries and cryptic hinting.',
          supports: ['Constraint inspector', 'Difficulty tuner', 'PDF + PUZ export'],
        },
      ],
      hintExamples: [
        'Four-letter big cat that matches the solar theme across row two.',
        'Clue the down entry with a playful homophone for "son".',
        'Consider swapping row three column three for AURAS to keep theme density.',
      ],
    },
    {
      id: 'wordsearch',
      name: 'Word Search',
      tagline: 'Lightning generators with instant classroom printouts.',
      description:
        'Drop in vocabulary lists or import from FlashNote decks. Export printable PDFs, share interactive links, or spin micro puzzles for Time Attack mode.',
      board: {
        label: '8×8 Vocab Sprint',
        rows: ['B R A I N S T', 'A I O L E A O', 'L D N R T I R', 'A E A A C N E', 'N L Y T E N C', 'C E T H S E O', 'E D G I A O D', 'R A S H I F Y'],
      },
      generator: 'Weighted placement with diagonal + reverse scattering',
      validator: 'Word list checksum + duplicate letter guard',
      bestFor: ['Classrooms', 'Icebreakers', 'Time Attack playlists'],
      difficulties: [
        {
          level: 'Easy',
          targetTime: '2–3 min',
          highlight: 'Highlight-first discovery with friendly hints.',
          supports: ['Reveal first letter', 'Shareable GIF replays', 'Teacher analytics'],
        },
        {
          level: 'Medium',
          targetTime: '3–5 min',
          highlight: 'Diagonal placements + overlap scoring challenge.',
          supports: ['Clue-based search', 'Fog-of-war mode', 'Keyboard navigation'],
        },
        {
          level: 'Hard',
          targetTime: '5–7 min',
          highlight: 'Large grids with decoy syllables and hidden quotes.',
          supports: ['Multi-pack import', 'Speed leaderboard', 'Live hints throttling'],
        },
      ],
      hintExamples: [
        'Look diagonally from row five column two — the word "LYRIC" is hidden there.',
        'Flip the grid horizontally to uncover reversed entries like "YIELD".',
        'Time Attack tip: clear the two-letter connectors first to reveal anchors.',
      ],
    },
    {
      id: 'nonogram',
      name: 'Nonogram',
      tagline: 'Paint logic scenes with progressive clue narration.',
      description:
        'Solve pixel art using row and column clues with ambient storytelling. Use guided deduction, contradiction explorer, and accessible high-contrast palettes.',
      board: {
        label: '5×5 Intro Grid',
        rows: ['2 1 | ■ · ■ · ·', '1 1 | · ■ · ■ ·', '3   | ■ ■ ■ · ·', '1 1 | ■ · · ■ ·', '2   | ■ ■ · · ·'],
      },
      generator: 'Line solving heuristics with uniqueness verification',
      validator: 'Row/column contradiction detection with auto-fills',
      bestFor: ['Visual storytelling', 'Accessibility showcases', 'Calm focus sessions'],
      difficulties: [
        {
          level: 'Easy',
          targetTime: '4–6 min',
          highlight: 'Narrated deduction explaining every cross-out.',
          supports: ['Auto cross-empty', 'Color-blind palettes', 'Zen soundtrack'],
        },
        {
          level: 'Medium',
          targetTime: '7–11 min',
          highlight: 'Multi-line inference builder with proof overlay.',
          supports: ['Contradiction explorer', 'Snapshot history', 'Heatmap hints'],
        },
        {
          level: 'Hard',
          targetTime: '12–18 min',
          highlight: 'Large storyboards with segment unlock achievements.',
          supports: ['Batch marking', 'Export to PNG', 'Time-lapse replay'],
        },
      ],
      hintExamples: [
        'Row three requires three consecutive cells — paint columns two to four.',
        'Column four can only support a single filled cell; mark the rest blank.',
        'Use contradiction mode to test the top-left corner fill.',
      ],
    },
  ],
  modes: [
    {
      id: 'solo',
      name: 'Solo Studio',
      description: 'Pick any puzzle and difficulty, add optional coaching overlays, and export your run with annotated steps.',
      highlights: ['Adaptive difficulty dial', 'Coach-style hints with penalties', 'Session exports (PNG/PDF/JSON)'],
      cta: 'Start a focused session',
      icon: 'fa-user-astronaut',
    },
    {
      id: 'daily',
      name: 'Daily Spotlight',
      description: 'A seeded challenge available once per calendar day. Log your solve and see where you land on the live leaderboard.',
      highlights: ['Anti-replay seed signing', 'Fair-play leaderboard', 'Streak boosters with Trivia Arena'],
      cta: 'Play today’s puzzle',
      icon: 'fa-sun-bright',
    },
    {
      id: 'packs',
      name: 'Puzzle Packs',
      description: 'Curated story-driven packs mixing logic, wordplay, and collaboration puzzles with percentage tracking.',
      highlights: ['Themed chapters', 'Shared progress for classrooms', 'Import .puz, JSON, or CSV word lists'],
      cta: 'Browse puzzle packs',
      icon: 'fa-box-archive',
    },
    {
      id: 'timeattack',
      name: 'Time Attack',
      description: 'Rapid-fire micro puzzles. Solve as many as you can in three minutes to climb the streak leaderboard.',
      highlights: ['Streamed micro boards', 'Score multipliers for accuracy', 'Keyboard-first controls'],
      cta: 'Enter sprint mode',
      icon: 'fa-bolt',
    },
  ],
  daily: {
    date: isoDate(),
    typeId: 'nonogram',
    difficulty: 'Medium',
    seed: '2024-09-09-nonogram-dawn',
    unlockedAt: isoDate(-0.5),
    leaderboard: [
      { user: 'Riya', timeMs: minutesToMs(8) + 22 * 1000, accuracy: 0.98, hintsUsed: 1 },
      { user: 'Jamal', timeMs: minutesToMs(9) + 12 * 1000, accuracy: 0.95, hintsUsed: 0 },
      { user: 'Ana', timeMs: minutesToMs(10) + 18 * 1000, accuracy: 0.93, hintsUsed: 2 },
    ],
  },
  packs: [
    {
      id: 'pack-orbit',
      title: 'Orbital Logic Tour',
      description: 'A classroom-friendly tour mixing Sudoku, Nonogram, and Logic Grid puzzles with cosmic lore.',
      theme: 'Galactic',
      puzzlesTotal: 24,
      puzzlesCompleted: 9,
      difficultyMix: ['Easy', 'Medium', 'Medium', 'Hard'],
      reward: 'Unlock the “Gravity Savant” title and a Trivia Arena streak boost.',
      featuredTypeIds: ['sudoku', 'nonogram'],
    },
    {
      id: 'pack-lexicon',
      title: 'Lexicon Legends',
      description: 'Crossword, Word Search, and Riddle gauntlet perfect for editorial teams and spelling bees.',
      theme: 'Wordsmith',
      puzzlesTotal: 18,
      puzzlesCompleted: 12,
      difficultyMix: ['Easy', 'Medium', 'Medium', 'Hard'],
      reward: 'Custom FlashNote deck + printable certificate.',
      featuredTypeIds: ['crossword', 'wordsearch'],
    },
    {
      id: 'pack-logic-grid',
      title: 'Logic Grid Detective',
      description: 'Short-form logic grids with auto-explanation exports for classroom recaps.',
      theme: 'Mystery',
      puzzlesTotal: 15,
      puzzlesCompleted: 6,
      difficultyMix: ['Easy', 'Medium', 'Hard'],
      reward: 'Unlock new deduction templates & case notes.',
      featuredTypeIds: ['sudoku'],
    },
  ],
  stats: {
    streakDays: 14,
    bestStreak: 37,
    completionRate: 0.86,
    puzzlesSolved: 248,
    averageTimeMs: minutesToMs(7.5),
    accuracy: 0.94,
    hintsUsed: 62,
    errorsResolved: 181,
  },
  timeAttack: {
    rounds: [
      {
        id: 'round-mini-sudoku',
        title: 'Mini Sudoku Blitz',
        puzzleTypeId: 'sudoku',
        durationSeconds: 45,
        bestScore: 680,
        examplePrompt: 'Fill remaining digits in this 4×4 grid before the clock expires.',
      },
      {
        id: 'round-word-sprint',
        title: 'Word Search Sprint',
        puzzleTypeId: 'wordsearch',
        durationSeconds: 35,
        bestScore: 540,
        examplePrompt: 'Find 6 science terms hidden diagonally and backwards.',
      },
      {
        id: 'round-logic',
        title: 'Logic Grid Pop Quiz',
        puzzleTypeId: 'sudoku',
        durationSeconds: 60,
        bestScore: 720,
        examplePrompt: 'Deduce seating order with two clues before time runs out.',
      },
    ],
    activeRoundId: null,
    score: 0,
    remainingSeconds: 0,
    streak: 3,
  },
  integrations: [
    {
      id: 'flashnote-sync',
      title: 'FlashNote Vocabulary Sync',
      description: 'Import word lists and surface missed vocab for spaced review after puzzles.',
      relatedApp: 'FlashNote',
      icon: 'fa-notes-medical',
      actions: ['Auto-build decks from puzzle terms', 'Send reflections back to FlashNote', 'Share pack glossaries'],
    },
    {
      id: 'trivia-handshake',
      title: 'Trivia Arena Hand-off',
      description: 'Push streak boosts and puzzle themes into Trivia Arena playlists.',
      relatedApp: 'Trivia Arena',
      icon: 'fa-medal',
      actions: ['Grant streak multipliers', 'Share leaderboard highlights', 'Co-host live trivia nights'],
    },
    {
      id: 'analytics-suite',
      title: 'Unified Analytics',
      description: 'Aggregate stats with Study Planner and Memory Trainer for a holistic learning profile.',
      relatedApp: 'Analytics',
      icon: 'fa-chart-line',
      actions: ['Export puzzle runs to CSV', 'Overlay puzzle time vs. study sessions', 'Spot fatigue patterns'],
    },
  ],
  planBenefits: [
    {
      plan: 'Free',
      features: [
        'Solo mode access for featured puzzle of the week',
        'Daily spotlight with limited hints',
        'Export JSON run history',
      ],
    },
    {
      plan: 'Pro',
      features: [
        'Unlimited puzzle library + packs',
        'Advanced hint engine and Time Attack',
        'Full exports (PNG, PDF) with branding controls',
        'Shared classrooms with progress sync',
      ],
    },
  ],
});

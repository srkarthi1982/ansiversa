import type {
  TriviaArenaMatchSummary,
  TriviaDailyChallengeMeta,
  TriviaLeaderboardSnapshot,
  TriviaModeDefinition,
  TriviaPlanFeature,
  TriviaPowerUpDefinition,
  TriviaQuestion,
  TriviaQuestionPack,
  TriviaStatSnapshot,
  TriviaMode,
} from '../types/trivia';

const modeHighlights = (key: TriviaMode): readonly string[] => {
  switch (key) {
    case 'solo':
      return [
        'Adaptive difficulty ramp powered by accuracy and streaks',
        'Smart timer adjustments keep momentum without burnout',
        'Power-up sandbox lets players practice advanced strategies',
      ];
    case 'daily':
      return [
        'Seeded question set shared by the entire community',
        'Leaderboard locks in daily at midnight UTC',
        'Streak tracking with make-up tokens for Pro players',
      ];
    case 'arena':
      return [
        'Async battles with anti-replay protections',
        'Shareable invite links with optional passcodes',
        'Auto-scoring with breakdown of accuracy and time bonus',
      ];
    case 'live':
      return [
        'Realtime host controls and spectator scoreboard',
        'Live chat reactions with safe-mode moderation',
        'WebSocket sync for timers and results',
      ];
    case 'tournament':
      return [
        'Group stage seeding with bracket auto-generation',
        'Flexible scoring systems (points, time, accuracy weighting)',
        'Sponsor-ready leaderboard theming and exports',
      ];
    default:
      return [];
  }
};

export const triviaModes = (): TriviaModeDefinition[] => [
  {
    key: 'solo',
    label: 'Solo Drills',
    tagline: 'Customize category, difficulty, pacing, and power-ups.',
    description: 'Warm up, sharpen skills, or grind streaks with instant feedback and explanations after every question.',
    highlights: modeHighlights('solo'),
    cta: '/trivia-arena/play',
    badge: 'Core mode',
  },
  {
    key: 'daily',
    label: 'Daily Challenge',
    tagline: 'One curated set per day for the whole community.',
    description: 'Compete for the daily crown with seeded questions, ghost replay, and community leaderboard snapshots.',
    highlights: modeHighlights('daily'),
    cta: '/trivia-arena/daily',
  },
  {
    key: 'arena',
    label: 'Head-to-Head Arena',
    tagline: 'Invite a friend and settle scores asynchronously.',
    description: 'Issue an arena link, play on your own schedule, and compare breakdowns when both players submit.',
    highlights: modeHighlights('arena'),
    cta: '/trivia-arena/arena',
    badge: 'Pro',
  },
  {
    key: 'live',
    label: 'Live Rooms (v2)',
    tagline: 'Host realtime trivia nights with live leaderboards.',
    description: 'Streamlined host console, smart pacing, and low-latency scoring make events easy to run from any device.',
    highlights: modeHighlights('live'),
    status: 'coming-soon',
  },
  {
    key: 'tournament',
    label: 'Tournaments (v2)',
    tagline: 'Seasonal brackets and group showdowns.',
    description: 'Seed players, manage group rounds, and export results to communities, LMS platforms, or sponsors.',
    highlights: modeHighlights('tournament'),
    status: 'coming-soon',
  },
];

export const triviaPowerUps = (): TriviaPowerUpDefinition[] => [
  {
    key: 'fiftyFifty',
    label: '50 / 50',
    description: 'Remove two incorrect options on multiple choice questions.',
    icon: 'fas fa-scissors',
    limit: 1,
    availableFor: ['free', 'pro'],
  },
  {
    key: 'addTime',
    label: 'Add Time',
    description: 'Adds 10 seconds to the active question timer (up to 45s cap).',
    icon: 'fas fa-hourglass-half',
    limit: 1,
    availableFor: ['free', 'pro'],
  },
  {
    key: 'doublePoints',
    label: 'Double Points',
    description: 'Multiply the current question score after bonuses are applied.',
    icon: 'fas fa-xmarks-lines',
    limit: 1,
    availableFor: ['pro'],
  },
  {
    key: 'hint',
    label: 'Hint',
    description: 'Reveal a short clue in exchange for a 25 point deduction.',
    icon: 'fas fa-lightbulb',
    limit: 1,
    availableFor: ['free', 'pro'],
  },
];

export const triviaSampleQuestions = (): TriviaQuestion[] => [
  {
    id: 'q-1',
    prompt: 'Which scientist proposed the three laws of motion?',
    type: 'single',
    category: 'Science',
    difficulty: 'easy',
    timeLimitMs: 20000,
    options: [
      { id: 'a', label: 'A', text: 'Isaac Newton' },
      { id: 'b', label: 'B', text: 'Albert Einstein' },
      { id: 'c', label: 'C', text: 'Marie Curie' },
      { id: 'd', label: 'D', text: 'Nikola Tesla' },
    ],
    answer: 'a',
    explanation: 'Newton published the laws of motion in his 1687 work Philosophiæ Naturalis Principia Mathematica.',
  },
  {
    id: 'q-2',
    prompt: 'Select all countries that are part of Scandinavia.',
    type: 'multi',
    category: 'Geography',
    difficulty: 'medium',
    timeLimitMs: 25000,
    options: [
      { id: 'a', label: 'A', text: 'Norway' },
      { id: 'b', label: 'B', text: 'Finland' },
      { id: 'c', label: 'C', text: 'Denmark' },
      { id: 'd', label: 'D', text: 'Iceland' },
    ],
    answer: ['a', 'c'],
    explanation: 'Scandinavia traditionally includes Norway, Sweden, and Denmark. Finland and Iceland are part of the broader Nordic region.',
  },
  {
    id: 'q-3',
    prompt: 'True or False: The 2020 Summer Olympics were held in Tokyo.',
    type: 'boolean',
    category: 'Sports',
    difficulty: 'easy',
    timeLimitMs: 18000,
    options: [
      { id: 'true', label: 'True', text: 'True' },
      { id: 'false', label: 'False', text: 'False' },
    ],
    answer: 'true',
    explanation: 'The Tokyo 2020 Olympics were postponed to 2021 due to the pandemic but retained the 2020 branding.',
  },
  {
    id: 'q-4',
    prompt: 'Fill in the missing word: The process plants use to convert sunlight into energy is called _____.',
    type: 'fill',
    category: 'Science',
    difficulty: 'easy',
    timeLimitMs: 22000,
    answer: 'photosynthesis',
    explanation: 'Photosynthesis converts light energy into chemical energy stored in glucose.',
  },
  {
    id: 'q-5',
    prompt: 'Identify the landmark shown in the image.',
    type: 'image',
    category: 'History',
    difficulty: 'medium',
    timeLimitMs: 20000,
    imageUrl: 'https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=800&q=80',
    options: [
      { id: 'a', label: 'A', text: 'The Colosseum' },
      { id: 'b', label: 'B', text: 'Machu Picchu' },
      { id: 'c', label: 'C', text: 'Petra' },
      { id: 'd', label: 'D', text: 'Angkor Wat' },
    ],
    answer: 'b',
    explanation: 'The image shows Machu Picchu in Peru, a 15th-century Inca citadel.',
  },
];

export const triviaLeaderboardSnapshots = (): TriviaLeaderboardSnapshot[] => [
  {
    scope: 'daily',
    label: 'Daily Challenge',
    updatedAt: new Date().toISOString(),
    highlightRank: 12,
    entries: [
      { rank: 1, player: 'NovaQuill', score: 1920, timeMs: 68400, streak: 12, plan: 'pro' },
      { rank: 2, player: 'TriviaTactician', score: 1885, timeMs: 70200, streak: 11, plan: 'pro' },
      { rank: 3, player: 'CuriousCoder', score: 1805, timeMs: 71000, streak: 9, plan: 'free' },
      { rank: 12, player: 'You', score: 1540, timeMs: 75600, streak: 6, plan: 'pro' },
    ],
  },
  {
    scope: 'global',
    label: 'Global Season',
    updatedAt: new Date().toISOString(),
    entries: [
      { rank: 1, player: 'QuizLegend', score: 48210, timeMs: 1523000, streak: 42, plan: 'pro' },
      { rank: 42, player: 'You', score: 39280, timeMs: 1821000, streak: 19, plan: 'pro' },
      { rank: 77, player: 'PixelThinker', score: 36420, timeMs: 1914000, streak: 15, plan: 'free' },
    ],
  },
  {
    scope: 'friends',
    label: 'Friends Sprint',
    updatedAt: new Date().toISOString(),
    entries: [
      { rank: 1, player: 'Ava', score: 1420, timeMs: 48000, streak: 5, plan: 'free' },
      { rank: 2, player: 'You', score: 1380, timeMs: 51000, streak: 4, plan: 'pro' },
      { rank: 3, player: 'Liam', score: 1290, timeMs: 54000, streak: 3, plan: 'free' },
    ],
  },
];

export const triviaQuestionPacks = (): TriviaQuestionPack[] => [
  {
    id: 'pack-1',
    title: 'STEM Essentials',
    description: 'Physics, chemistry, and math fundamentals curated for classrooms.',
    category: 'Science',
    difficulty: 'mixed',
    size: 120,
    visibility: 'builtin',
    source: 'builtin',
  },
  {
    id: 'pack-2',
    title: 'World History Spotlight',
    description: 'Major events from the Renaissance to the space age.',
    category: 'History',
    difficulty: 'medium',
    size: 90,
    visibility: 'public',
    source: 'quiz-institute',
  },
  {
    id: 'pack-3',
    title: 'Esports and Gaming',
    description: 'Fast-paced trivia for modern gaming communities.',
    category: 'Tech',
    difficulty: 'hard',
    size: 60,
    visibility: 'private',
    source: 'import',
  },
];

export const triviaStatSnapshot = (): TriviaStatSnapshot => ({
  accuracy: 0.86,
  averageTimeMs: 7200,
  streak: 9,
  totalGames: 128,
  powerUpsUsed: 34,
  rating: 1420,
  categoryStrengths: [
    { category: 'Science', rating: 92 },
    { category: 'History', rating: 88 },
    { category: 'Movies', rating: 74 },
    { category: 'Sports', rating: 68 },
  ],
});

export const triviaArenaMatches = (): TriviaArenaMatchSummary[] => [
  {
    id: 'match-open',
    opponent: 'Invite pending',
    status: 'open',
    yourScore: 0,
    opponentScore: 0,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'match-active',
    opponent: 'Mira',
    status: 'playing',
    yourScore: 1320,
    opponentScore: 1280,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 'match-finished',
    opponent: 'Jordan',
    status: 'finished',
    yourScore: 1580,
    opponentScore: 1490,
    expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
];

export const triviaDailyMeta = (): TriviaDailyChallengeMeta => ({
  deadline: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
  questionCount: 12,
  seed: '2024-03-21-general',
  yourRank: 12,
  totalParticipants: 742,
});

export const triviaPlanFeatures = (): TriviaPlanFeature[] => [
  {
    label: 'Solo drills and smart review',
    free: true,
    pro: true,
  },
  {
    label: 'Daily challenge leaderboard',
    free: 'Top 50 view',
    pro: 'Full leaderboard + history',
  },
  {
    label: 'Power-ups per game',
    free: '1 per power-up',
    pro: '3 per power-up',
  },
  {
    label: 'Custom question pack imports',
    free: false,
    pro: 'CSV, JSON, Quiz Institute',
  },
  {
    label: 'Head-to-head arena',
    free: false,
    pro: true,
  },
  {
    label: 'Advanced analytics and exports',
    free: false,
    pro: true,
  },
  {
    label: 'Live rooms and tournaments (v2)',
    free: false,
    pro: 'Priority beta access',
  },
];

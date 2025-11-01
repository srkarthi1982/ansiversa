import type { GuessTheEmojiSampleData } from '../../types/emoji';

const isoDate = (offsetDays = 0) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
};

export const getGuessTheEmojiSampleData = (): GuessTheEmojiSampleData => ({
  hero: {
    tagline: 'Decode emojis faster than ever with streaks, leaderboards, and packs.',
    description:
      'Guess the Emoji is a family-friendly word game that challenges players to translate emoji strings into phrases, films, food, and more. Pick a mode, earn streak multipliers, and see how your solves stack up on the daily board.',
    metrics: [
      { label: 'Community puzzles', value: '2,450+', helper: 'Moderated and language tagged' },
      { label: 'Daily streak best', value: '28 days', helper: 'Across 3 languages' },
      { label: 'Fastest solve', value: '06.2s', helper: 'Time Attack — pro tier' },
    ],
    integrations: ['Astro DB sessions', 'Supabase leaderboards', 'Realtime anti-cheat pings'],
  },
  puzzlePreview: {
    id: 'emj-hero-demo',
    emojis: '🍔🏠',
    answer: 'burger house',
    aliases: ['burgerhouse', 'burger home'],
    category: 'Food and Places',
    difficulty: 'easy',
    explanation: '🍔 = burger, 🏠 = house. Compound them for burger house.',
    keyboardBank: 'BURGERHOUSEALN',
    clue: 'Fast-food icon meets cozy shelter.'
  },
  modes: [
    {
      id: 'classic',
      name: 'Classic Solo',
      tagline: 'Solve curated packs of 10–20 puzzles with adaptive scoring.',
      durationLabel: '10–20 puzzles',
      description:
        'Pick a category or community pack and clear a set run. Earn streak multipliers, unlock hint boosts, and export results to share.',
      highlights: [
        'Choose built-in or imported packs',
        'Earn hint tokens every perfect streak',
        'Difficulty scales after each solve'
      ],
      scoring: [
        { label: 'Base points', value: '150 · 200 · 260 (easy/med/hard)' },
        { label: 'Streak bonus', value: '+12% per flawless solve' },
        { label: 'Hint penalty', value: '−25 per reveal' }
      ],
      recommendedFor: ['Classrooms', 'Family nights', 'Streamers']
    },
    {
      id: 'daily',
      name: 'Daily Emoji',
      tagline: 'One puzzle, global leaderboard, seed locked per timezone.',
      durationLabel: '24h window',
      description:
        'Log in for a curated emoji puzzle seeded to your locale. Submit once, see how your time compares, and maintain streaks backed by anti-cheat timers.',
      highlights: [
        'Leaderboard snapshots with timezone parity',
        'Email or push streak reminders',
        'Server-side validation with alias matching'
      ],
      scoring: [
        { label: 'Perfect solve', value: '300 pts + streak multiplier' },
        { label: 'Time bonus', value: '+1 pt per second saved vs. median' },
        { label: 'Retry', value: 'One replay for Pro users with penalty' }
      ],
      recommendedFor: ['Morning rituals', 'Clubs and classrooms', 'Lightweight competitions']
    },
    {
      id: 'timeattack',
      name: 'Time Attack',
      tagline: 'Solve as many puzzles as you can in 90–180 seconds.',
      durationLabel: '90/120/180s',
      description:
        'Pick your clock, then race through an endless emoji stream. Smart difficulty ramping keeps the flow challenging without breaking rhythm.',
      highlights: [
        'Adaptive difficulty climbs after every 3 solves',
        'Anti-spam input with cooldown windows',
        'Exportable highlight reels for socials'
      ],
      scoring: [
        { label: 'Combo bonus', value: '+8% after 5 streak solves' },
        { label: 'Speed bonus', value: '+2 pts per second left' },
        { label: 'Miss penalty', value: '−40 pts and streak reset' }
      ],
      recommendedFor: ['Speedrunners', 'Esports watch parties', 'Class icebreakers']
    },
    {
      id: 'versus',
      name: 'Async Versus',
      tagline: 'Challenge friends asynchronously with secure invite links.',
      durationLabel: 'Same set, best score wins',
      description:
        'Spin up a match, share an invite, and compare solving timelines. Server verifies submissions and flags suspicious runs automatically.',
      highlights: [
        'Seeded packs with tamper-proof IDs',
        'Replay viewer showing emoji-by-emoji timing',
        'Shared explanations after both submit'
      ],
      scoring: [
        { label: 'Round points', value: '1,200 total across 12 puzzles' },
        { label: 'Time multiplier', value: 'x1.3 for sub-40s runs' },
        { label: 'Hint trade-off', value: '−40 pts per hint token used' }
      ],
      recommendedFor: ['Friend duels', 'Remote team socials', 'Creator tournaments']
    }
  ],
  hints: [
    {
      id: 'reveal-letter',
      name: 'Reveal Letter',
      penalty: '−15 pts',
      description: 'Reveals the next correct letter in the answer while keeping streak intact.',
      sample: 'Revealed "B" as the opening letter for burger house.',
      icon: 'fa-a'
    },
    {
      id: 'remove-wrong',
      name: 'Remove Wrong Letters',
      penalty: '−20 pts',
      description: 'Strips two distractor letters from the keyboard bank, weighted by difficulty.',
      sample: 'Removed Q and X from the Time Attack bank.',
      icon: 'fa-eraser'
    },
    {
      id: 'get-clue',
      name: 'Get Clue',
      penalty: '−35 pts',
      description: 'Delivers a short textual clue curated to the puzzle’s category.',
      sample: 'Clue: "Fast-food chain with golden arches."',
      icon: 'fa-lightbulb'
    }
  ],
  packs: [
    {
      id: 'builtin-classics',
      title: 'Classics Vol.1',
      language: 'en',
      category: 'Mixed',
      size: 120,
      visibility: 'builtin',
      difficultyMix: ['60% easy', '30% medium', '10% hard'],
      features: ['Leaderboard-ready', 'Curated explanations', 'Teacher mode printable'],
      featuredEmojis: ['🎬🍿', '🐶🚒', '🦸‍♂️🌃']
    },
    {
      id: 'community-world',
      title: 'World Foods Drop',
      language: 'en',
      category: 'Food and Culture',
      size: 80,
      visibility: 'community',
      difficultyMix: ['40% easy', '45% medium', '15% hard'],
      features: ['Community curated', 'Multi-language aliases', 'Moderated submissions'],
      featuredEmojis: ['🍣🚂', '🥐🇫🇷', '🍛🎎']
    },
    {
      id: 'imported-classroom',
      title: 'Spanish Classroom Set',
      language: 'es',
      category: 'Educación',
      size: 55,
      visibility: 'imported',
      difficultyMix: ['70% fácil', '25% medio', '5% difícil'],
      features: ['CSV import via teacher dashboard', 'Accent-insensitive matching', 'Student progress sync'],
      featuredEmojis: ['📚🎓', '🚀🧠', '🎨🏫']
    }
  ],
  daily: {
    date: isoDate(),
    puzzleId: 'daily-' + isoDate(),
    emojis: '🎬🧑‍🚀🌕',
    difficulty: 'medium',
    clue: 'Oscar-winning space survival thriller.',
    explanation: '🎬 film, 🧑‍🚀 astronaut, 🌕 orbit — combined for Gravity.',
    leaderboard: [
      { rank: 1, handle: '@orbitfox', score: 468, time: '00:31', streak: 45 },
      { rank: 2, handle: '@filmnerd', score: 455, time: '00:36', streak: 12 },
      { rank: 3, handle: '@emojiace', score: 440, time: '00:42', streak: 19 }
    ],
    solved: 18452,
    medianTimeSeconds: 54
  },
  stats: {
    streakDays: 12,
    bestStreak: 34,
    accuracy: 0.92,
    averageSolveSeconds: 38,
    puzzlesSolved: 286,
    hintsUsed: 21,
    preferredLanguage: 'English (US)',
    topCategory: 'Movies and TV'
  },
  planTiers: [
    {
      id: 'free',
      name: 'Starter',
      price: '$0',
      highlight: 'Classic + Daily mode access with family-friendly packs.',
      includes: ['Classic Solo and Daily Emoji', 'Base hints (Reveal Letter)', 'Built-in packs and streak tracking'],
      inviteLimit: '3 active friend invites/mo'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$12/mo',
      highlight: 'Unlock Time Attack, Versus, imports, analytics, and moderation tools.',
      includes: [
        'All modes including Time Attack and Versus',
        'CSV/JSON imports + community publishing',
        'Advanced analytics, anti-cheat controls, and pro leaderboards'
      ],
      inviteLimit: 'Unlimited invites + custom vanity links'
    }
  ],
  creatorTools: [
    {
      id: 'importer',
      name: 'CSV/JSON Importer',
      description: 'Bulk upload emoji puzzles with aliases, categories, and explanations.',
      features: ['Hash-based dedupe', 'Alias normalization rules', 'Moderation queue export']
    },
    {
      id: 'pack-builder',
      name: 'Pack Builder',
      description: 'Curate puzzles into themed packs with visibility controls and release scheduling.',
      features: ['Draft/private/public states', 'Language tagging', 'Auto-generated cover art']
    },
    {
      id: 'analytics',
      name: 'Creator Analytics',
      description: 'Track solve rates, rating drift, and leaderboard placements across packs.',
      features: ['Solve funnel dashboard', 'Top solvers export', 'Difficulty heatmap']
    }
  ],
  versus: {
    matchId: 'versus-demo-483',
    challenger: '@orbitfox',
    opponent: '@emojiace',
    mode: 'Versus — 12 puzzle sprint',
    packTitle: 'Space Icons Mini',
    challengerScore: 1240,
    opponentScore: 1195,
    status: 'completed',
    summary: 'Orbitfox clinched the win by banking streak multipliers and skipping hints entirely.',
    steps: [
      { label: 'Invite', detail: 'Generated invite link with 30-minute expiry and anti-replay token.' },
      { label: 'Solve', detail: 'Both players solved asynchronously; system tracked timestamps and hint usage.' },
      { label: 'Verify', detail: 'Server validated answers, applied penalties, and published results to the leaderboard.' }
    ],
    inviteUrl: 'https://ansiversa.app/guess-the-emoji/versus/versus-demo-483'
  }
});

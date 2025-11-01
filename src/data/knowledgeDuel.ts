import type {
  DuelAntiCheatMeasure,
  DuelLeaderboardTab,
  DuelMatchFlowStep,
  DuelModeCard,
  DuelPlanBenefit,
  DuelRewardTrackItem,
  DuelScoringRule,
  DuelSeasonMilestone,
  DuelSpeedTier,
} from '../types/knowledge-duel';

export const duelModes: DuelModeCard[] = [
  {
    id: 'realtime',
    name: 'Real-time Blitz',
    tagline: 'Speed and accuracy collide in live 1v1 battles.',
    summary:
      'Server-timed questions drop simultaneously for both players with second-by-second feedback, lightning streak multipliers, and spectator-ready visuals.',
    questionCount: '5–10 questions',
    timePerQuestion: '10–20 seconds',
    highlights: [
      'Speed bonus up to +5 for sub-5s answers',
      'Sudden-death tie-breaker with Quiz Institute certified questions',
      'Emoji reactions and rematch invites at the end screen',
    ],
  },
  {
    id: 'turn',
    name: 'Turn-based Duel',
    tagline: 'Asynchronous play with fairness locks.',
    summary:
      'Players receive identical question seeds with answers hidden until both turns are complete. Reminders nudge participants within a 24-hour window.',
    questionCount: '7 questions',
    timePerQuestion: '30 second timers with grace period',
    highlights: [
      'Server verifies timestamps for every answer',
      'Replay viewer reveals choices side-by-side',
      'Queue for rematches without leaving the breakdown screen',
    ],
  },
  {
    id: 'solo',
    name: 'Solo Practice',
    tagline: 'Warm up skills before entering the arena.',
    summary:
      'Pull curated sets from Quiz Institute to practice pacing and accuracy. Earn XP and badges without affecting ELO.',
    questionCount: '5 question runs',
    timePerQuestion: '15–25 seconds adjustable',
    highlights: [
      'Adaptive difficulty that climbs with streaks',
      'Precision breakdown across accuracy, time, and categories',
      'Seamless bridge into Trivia Arena for featured events',
    ],
  },
];

export const duelMatchFlow: DuelMatchFlowStep[] = [
  {
    id: 'seed',
    title: 'Deterministic question seed',
    summary:
      'Matches lock a seed with Quiz Institute category, difficulty, and type filters ensuring reproducible replays and anti-tamper checks.',
    icon: 'fas fa-seedling',
    badge: 'Server issued',
  },
  {
    id: 'queue',
    title: 'Smart matchmaking queue',
    summary:
      'ELO-style rating bands, friend invites, and private room codes all funnel into the same state machine for fairness.',
    icon: 'fas fa-sitemap',
    badge: 'Skill balanced',
  },
  {
    id: 'rounds',
    title: 'Round cadence and timers',
    summary:
      'Server ticks reveal each question, broadcast timers, and collect hashed answers to prevent client manipulation.',
    icon: 'fas fa-stopwatch',
    badge: 'Server timed',
  },
  {
    id: 'results',
    title: 'Analytics-rich results',
    summary:
      'Accuracy charts, streak markers, and per-question playback power shareable highlights, XP grants, and rematch hooks.',
    icon: 'fas fa-chart-simple',
    badge: 'Instant recap',
  },
];

export const duelScoringRules: DuelScoringRule[] = [
  {
    title: 'Correct answer',
    description: 'Earn base points for every correct response with optional streak multipliers after three-in-a-row.',
    delta: '+10 base · +3 streak bonus',
    icon: 'fas fa-circle-check',
  },
  {
    title: 'Skip or timeout',
    description: 'Strategic skips keep score neutral but break streaks. Server enforces timeouts to prevent slow play.',
    delta: '0 change',
    icon: 'fas fa-forward-step',
  },
  {
    title: 'Incorrect answer',
    description: 'Wrong submissions deduct points for accuracy discipline with optional negative marking toggle per league.',
    delta: '−3 default penalty',
    icon: 'fas fa-circle-xmark',
  },
  {
    title: 'Speed bonus',
    description: 'Fast responses add extra credit scaling linearly with remaining seconds in real-time mode.',
    delta: 'Up to +5 bonus',
    icon: 'fas fa-bolt',
  },
];

export const duelSpeedTiers: DuelSpeedTier[] = [
  { label: 'Lightning', bonus: '+5', window: '< 5s remaining' },
  { label: 'Quick', bonus: '+3', window: '5–10s remaining' },
  { label: 'Steady', bonus: '+1', window: '10–15s remaining' },
];

export const duelLeaderboardTabs: DuelLeaderboardTab[] = [
  {
    id: 'global',
    name: 'Global Ladder',
    description: 'Everyone ranked by ELO with weekly resets for the top 1,000 players.',
    metrics: ['Rating', 'Win rate', 'Average response time'],
  },
  {
    id: 'season',
    name: 'Season Pass',
    description: 'Climb seasonal tiers for cosmetic unlocks and end-of-season rewards.',
    metrics: ['Season points', 'Tier level', 'Best streak'],
  },
  {
    id: 'friends',
    name: 'Friends and Clubs',
    description: 'Private ladders with invite codes and classroom rosters.',
    metrics: ['Club rank', 'Head-to-head record', 'Participation rate'],
  },
  {
    id: 'category',
    name: 'Category Spotlights',
    description: 'Specialty ladders for STEM, Humanities, Pop Culture, and more.',
    metrics: ['Category ELO', 'Accuracy delta', 'Play volume'],
  },
];

export const duelSeasonMilestones: DuelSeasonMilestone[] = [
  {
    phase: 'Launch Week',
    detail: 'Kickoff tournaments and spotlight categories rotate daily.',
    icon: 'fas fa-rocket',
  },
  {
    phase: 'Mid-season Surge',
    detail: 'Double XP weekends and bonus streak missions for active duellists.',
    icon: 'fas fa-fire',
  },
  {
    phase: 'Finale Weekend',
    detail: 'Top ladder playoffs with live shoutcasting and replay breakdowns.',
    icon: 'fas fa-trophy',
  },
];

export const duelAntiCheat: DuelAntiCheatMeasure[] = [
  {
    title: 'Server-timed windows',
    description: 'Official timers run server-side with drift correction and authoritative lockouts for late submissions.',
    icon: 'fas fa-clock-rotate-left',
  },
  {
    title: 'Answer hashing and audit logs',
    description: 'Client submissions are hashed with salt, stored alongside device fingerprints, and available for anomaly review.',
    icon: 'fas fa-shield-halved',
  },
  {
    title: 'Anomaly detection',
    description: 'Machine-learned baselines watch for impossible streaks, repeated device swaps, or copy-paste macros.',
    icon: 'fas fa-magnifying-glass-chart',
  },
  {
    title: 'Rate limiting and locks',
    description: 'Queue throttles and report workflows halt suspected sessions for manual review without blocking the ecosystem.',
    icon: 'fas fa-lock',
  },
];

export const duelRewards: DuelRewardTrackItem[] = [
  {
    name: 'XP and Mastery badges',
    description: 'Earn persistent XP for every match with badge showcases for perfect accuracy streaks and win milestones.',
    icon: 'fas fa-medal',
  },
  {
    name: 'Seasonal cosmetics',
    description: 'Unlock nameplates, intro animations, and reaction packs through season tiers or top ladder finishes.',
    icon: 'fas fa-stars',
  },
  {
    name: 'Profile integrations',
    description: 'Share wins to Resume Builder, Trivia Arena, and community spaces with embeddable highlight reels.',
    icon: 'fas fa-share-nodes',
  },
];

export const duelPlanBenefits: DuelPlanBenefit[] = [
  { feature: 'Daily matches', free: '10 per day', pro: 'Unlimited' },
  { feature: 'Question sets', free: 'Core difficulty tiers', pro: 'All tiers + custom mixes' },
  { feature: 'Leaderboards', free: 'Global ladder', pro: 'Global + friends + category tabs' },
  { feature: 'Rematches and friend codes', free: 'Restricted access', pro: 'Always on' },
  { feature: 'Replay analytics', free: 'Basic timeline', pro: 'Full breakdown and exports' },
];

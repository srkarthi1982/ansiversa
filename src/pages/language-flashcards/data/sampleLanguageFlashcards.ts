export type CardDifficulty = 'learning' | 'review' | 'mature';

export interface DailySummary {
  readonly target: number;
  completed: number;
  readonly newIntroductions: number;
  dueToday: number;
  readonly dueTomorrow: number;
  readonly timezone: string;
  streak: number;
  readonly bestStreak: number;
  readonly planReviewCap: number;
  lastReviewAt: string;
}

export interface ReviewCard {
  readonly id: string;
  readonly type: 'word' | 'phrase' | 'cloze' | 'image' | 'conjugation' | 'script';
  readonly prompt: string;
  readonly answer: string;
  readonly ipa?: string;
  readonly transliteration?: string;
  readonly exampleBase?: string;
  readonly exampleTarget?: string;
  readonly audioUrl?: string;
  readonly imageUrl?: string;
  readonly tags: readonly string[];
  readonly pos?: string;
  readonly difficulty: CardDifficulty;
  readonly hint?: string;
  stability: number;
}

export interface DeckForecastPoint {
  readonly day: string;
  readonly due: number;
}

export interface DeckSummary {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly baseLang: string;
  readonly targetLang: string;
  readonly level: string;
  readonly tags: readonly string[];
  readonly plan: 'free' | 'pro';
  readonly dueToday: number;
  readonly newToday: number;
  readonly accuracy: number;
  readonly streakDays: number;
  readonly pairLabel: string;
  pinned: boolean;
  readonly tone: string;
  readonly focus: string;
  readonly dueForecast: readonly DeckForecastPoint[];
  readonly sampleQueues: {
    readonly due: readonly ReviewCard[];
    readonly new: readonly ReviewCard[];
  };
}

export interface ReviewMode {
  readonly id: 'standard' | 'listen' | 'speak' | 'cloze' | 'typing';
  readonly label: string;
  readonly description: string;
  readonly icon: string;
  readonly accent: string;
  readonly instructions: readonly string[];
  readonly recommendedFor: string;
}

export interface CardTypeDefinition {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly fields: readonly string[];
  readonly example: {
    readonly front: string;
    readonly back: string;
    readonly meta?: string;
  };
}

export interface GeneratorTokenInsight {
  readonly token: string;
  readonly lemma: string;
  readonly frequencyRank: number;
  readonly alreadyKnown: boolean;
}

export interface GeneratorCandidate {
  readonly id: string;
  readonly type: ReviewCard['type'];
  readonly base: string;
  readonly target: string;
  readonly ipa?: string;
  readonly transliteration?: string;
  readonly pos?: string;
  readonly frequencyRank: number;
  readonly noveltyScore: number;
  readonly exampleBase?: string;
  readonly exampleTarget?: string;
  readonly reason: string;
}

export interface GeneratorSummary {
  readonly baseLang: string;
  readonly targetLang: string;
  readonly detected: string;
  readonly tokens: readonly GeneratorTokenInsight[];
  readonly heuristics: readonly string[];
  readonly candidates: readonly GeneratorCandidate[];
  readonly status: 'idle' | 'ready' | 'applied';
  readonly sourceSnippet: string;
}

export interface MetricPoint {
  readonly label: string;
  readonly value: number;
  readonly delta?: string;
}

export interface ForecastPoint {
  readonly day: string;
  readonly due: number;
}

export interface GradeBucket {
  readonly grade: number;
  readonly count: number;
}

export interface DeckAccuracyBreakdown {
  readonly deckId: string;
  readonly deckName: string;
  readonly accuracy: number;
  readonly due: number;
}

export interface AnalyticsSnapshot {
  readonly retention: readonly MetricPoint[];
  readonly accuracyByTag: readonly MetricPoint[];
  readonly accuracyByPos: readonly MetricPoint[];
  readonly dueForecast: readonly ForecastPoint[];
  readonly gradeDistribution: readonly GradeBucket[];
  readonly timeSpent: readonly MetricPoint[];
  readonly deckBreakdown: readonly DeckAccuracyBreakdown[];
}

export interface PlanComparisonRow {
  readonly feature: string;
  readonly free: string;
  readonly pro: string;
  readonly highlight?: 'free' | 'pro';
}

export interface IntegrationCard {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly accent: string;
  readonly actions: readonly string[];
}

export const getDailySummary = (): DailySummary => ({
  target: 80,
  completed: 42,
  newIntroductions: 6,
  dueToday: 128,
  dueTomorrow: 94,
  timezone: 'Asia/Kolkata',
  streak: 23,
  bestStreak: 45,
  planReviewCap: 100,
  lastReviewAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
});

const createReviewCard = (partial: Omit<ReviewCard, 'stability'> & { stability?: number }): ReviewCard => ({
  stability: partial.stability ?? 2.1,
  ...partial,
});

export const getDeckSummaries = (): DeckSummary[] => [
  {
    id: 'spanish-foundation',
    name: 'Spanish Core A1',
    description:
      'High-frequency Spanish nouns, verbs, and starter phrases paired with IPA, audio, and contextual sentences.',
    baseLang: 'English',
    targetLang: 'Español',
    level: 'A1',
    tags: ['Travel', 'Core', 'Beginner'],
    plan: 'free',
    dueToday: 52,
    newToday: 6,
    accuracy: 88,
    streakDays: 14,
    pairLabel: 'English → Spanish',
    pinned: true,
    tone: 'Friendly tutor',
    focus: 'Daily situations and verbs in present tense',
    dueForecast: [
      { day: 'Today', due: 52 },
      { day: 'Tomorrow', due: 41 },
      { day: '+2', due: 38 },
      { day: '+3', due: 27 },
      { day: '+4', due: 19 },
      { day: '+5', due: 16 },
      { day: '+6', due: 13 },
    ],
    sampleQueues: {
      due: [
        createReviewCard({
          id: 'es-001',
          type: 'word',
          prompt: 'la biblioteca',
          answer: 'the library',
          ipa: '/la βi.βli.oˈte.ka/',
          exampleBase: 'I read books in the library on Sundays.',
          exampleTarget: 'Leo libros en la biblioteca los domingos.',
          tags: ['noun', 'place'],
          pos: 'noun',
          difficulty: 'review',
          stability: 3.4,
          hint: 'Public place with books',
        }),
        createReviewCard({
          id: 'es-002',
          type: 'phrase',
          prompt: '¿Cómo te llamas?',
          answer: 'What is your name?',
          ipa: '/ˈko.mo te ˈʎa.mas/',
          exampleBase: 'Hello! What is your name?',
          exampleTarget: '¡Hola! ¿Cómo te llamas?',
          tags: ['greeting'],
          difficulty: 'mature',
        }),
        createReviewCard({
          id: 'es-003',
          type: 'cloze',
          prompt: 'Yo ____ agua después de correr.',
          answer: 'bebo',
          exampleBase: 'I drink water after running.',
          exampleTarget: 'Bebo agua después de correr.',
          tags: ['verb', 'habit'],
          difficulty: 'learning',
          hint: 'From beber',
        }),
      ],
      new: [
        createReviewCard({
          id: 'es-new-001',
          type: 'word',
          prompt: 'el despertador',
          answer: 'the alarm clock',
          ipa: '/des.peɾ.taˈðoɾ/',
          tags: ['noun', 'home'],
          difficulty: 'learning',
          hint: 'Device that wakes you',
        }),
        createReviewCard({
          id: 'es-new-002',
          type: 'phrase',
          prompt: 'Estoy aprendiendo español.',
          answer: 'I am learning Spanish.',
          ipa: '/esˈtoj a.pɾenˈdjendo espaˈɲol/',
          tags: ['progress'],
          difficulty: 'learning',
        }),
      ],
    },
  },
  {
    id: 'arabic-travel',
    name: 'Arabic Travel Survival',
    description:
      'Essential Arabic phrases and words for navigating markets, transport, and hospitality with transliteration support.',
    baseLang: 'English',
    targetLang: 'العربية',
    level: 'A1-A2',
    tags: ['Travel', 'Survival', 'RTL'],
    plan: 'pro',
    dueToday: 39,
    newToday: 4,
    accuracy: 82,
    streakDays: 9,
    pairLabel: 'English → Arabic',
    pinned: true,
    tone: 'Concise coach',
    focus: 'Transactions and polite phrases',
    dueForecast: [
      { day: 'Today', due: 39 },
      { day: 'Tomorrow', due: 33 },
      { day: '+2', due: 29 },
      { day: '+3', due: 18 },
      { day: '+4', due: 15 },
      { day: '+5', due: 11 },
      { day: '+6', due: 9 },
    ],
    sampleQueues: {
      due: [
        createReviewCard({
          id: 'ar-001',
          type: 'phrase',
          prompt: 'مرحبا، كم السعر؟',
          transliteration: 'marḥabā, kam as-siʻr?',
          answer: 'Hello, how much is the price?',
          tags: ['market'],
          difficulty: 'review',
          hint: 'Bargaining opener',
        }),
        createReviewCard({
          id: 'ar-002',
          type: 'word',
          prompt: 'تذكرة',
          transliteration: 'tadhkara',
          answer: 'ticket',
          tags: ['transport'],
          difficulty: 'review',
        }),
        createReviewCard({
          id: 'ar-003',
          type: 'script',
          prompt: 'اكتب الحرف: ق',
          transliteration: 'qāf',
          answer: 'Follow the stroke order for the letter ق',
          tags: ['script'],
          difficulty: 'learning',
          hint: 'Deep throat sound',
        }),
      ],
      new: [
        createReviewCard({
          id: 'ar-new-001',
          type: 'phrase',
          prompt: 'أحتاج إلى سيارة أجرة.',
          transliteration: 'aḥtāj ilā sayyārat ujra',
          answer: 'I need a taxi.',
          tags: ['transport'],
          difficulty: 'learning',
        }),
      ],
    },
  },
  {
    id: 'tamil-family',
    name: 'Tamil Family & Culture',
    description:
      'Family conversations, festivals, and cultural expressions with transliteration and audio hints for pronunciation.',
    baseLang: 'English',
    targetLang: 'தமிழ்',
    level: 'A2',
    tags: ['Family', 'Culture', 'Heritage'],
    plan: 'pro',
    dueToday: 37,
    newToday: 5,
    accuracy: 86,
    streakDays: 11,
    pairLabel: 'English → Tamil',
    pinned: false,
    tone: 'Community mentor',
    focus: 'Kinship words and festive greetings',
    dueForecast: [
      { day: 'Today', due: 37 },
      { day: 'Tomorrow', due: 30 },
      { day: '+2', due: 24 },
      { day: '+3', due: 21 },
      { day: '+4', due: 16 },
      { day: '+5', due: 12 },
      { day: '+6', due: 11 },
    ],
    sampleQueues: {
      due: [
        createReviewCard({
          id: 'ta-001',
          type: 'word',
          prompt: 'அம்மா',
          transliteration: 'ammā',
          answer: 'mother',
          tags: ['family'],
          difficulty: 'mature',
          hint: 'Parent',
        }),
        createReviewCard({
          id: 'ta-002',
          type: 'phrase',
          prompt: 'நீங்கள் எப்படி இருக்கிறீர்கள்?',
          transliteration: 'nīṅkaḷ eppaṭi irukkiṟīrkaḷ?',
          answer: 'How are you?',
          tags: ['greeting'],
          difficulty: 'review',
        }),
        createReviewCard({
          id: 'ta-003',
          type: 'conjugation',
          prompt: 'வரு (varu) — to come',
          answer: 'நான் வருகிறேன் · நாம் வருகிறோம் · நீ வருகிறாய் · நீங்கள் வருகிறீர்கள்',
          tags: ['verb'],
          difficulty: 'review',
        }),
      ],
      new: [
        createReviewCard({
          id: 'ta-new-001',
          type: 'script',
          prompt: 'ழ',
          transliteration: 'ḻa',
          answer: 'Retroflex lateral approximant; practice loops twice.',
          tags: ['script'],
          difficulty: 'learning',
        }),
      ],
    },
  },
];

export const getReviewModes = (): ReviewMode[] => [
  {
    id: 'standard',
    label: 'Standard SRS',
    description: 'Reveal answer, grade 0-5 with keyboard hotkeys. Supports IPA, transliteration, and notes.',
    icon: 'fa-layer-group',
    accent: 'from-indigo-500 via-purple-500 to-sky-500',
    instructions: ['Show prompt', 'Reveal back', 'Grade with 1-6 keys'],
    recommendedFor: 'Daily reviews and retention tracking',
  },
  {
    id: 'listen',
    label: 'Listen & Type',
    description: 'Play TTS audio and type the answer, with diacritics helper and transliteration hints.',
    icon: 'fa-headphones',
    accent: 'from-emerald-500 via-teal-500 to-indigo-500',
    instructions: ['Play audio', 'Type transliteration or target', 'Check answer'],
    recommendedFor: 'Pronunciation and spelling',
  },
  {
    id: 'speak',
    label: 'Speak & Compare',
    description: 'Record your pronunciation and get a similarity score against the model audio.',
    icon: 'fa-microphone-lines',
    accent: 'from-rose-500 via-fuchsia-500 to-indigo-500',
    instructions: ['Hold to record', 'Auto-trim silence', 'View similarity %'],
    recommendedFor: 'Speaking drills and oral practice',
  },
  {
    id: 'cloze',
    label: 'Cloze Builder',
    description: 'Fill in the blank with grammar-aware validation for verbs, particles, and endings.',
    icon: 'fa-pen',
    accent: 'from-amber-500 via-orange-500 to-pink-500',
    instructions: ['Read sentence', 'Type missing token', 'Get grammar note'],
    recommendedFor: 'Grammar practice',
  },
  {
    id: 'typing',
    label: 'Strict Typing',
    description: 'Type the exact answer with tolerance options and script keyboards (kana, devanagari, arabic).',
    icon: 'fa-keyboard',
    accent: 'from-slate-500 via-indigo-500 to-purple-500',
    instructions: ['Toggle strict/lenient', 'Enable transliteration', 'Submit response'],
    recommendedFor: 'Spelling perfection and exams',
  },
];

export const getCardTypeDefinitions = (): CardTypeDefinition[] => [
  {
    id: 'word',
    title: 'Word Card',
    description: 'Base ↔ target pair with IPA, gender, plural, and example sentence.',
    fields: ['Base term', 'Target term', 'IPA', 'Gender', 'Plural', 'Example sentence'],
    example: {
      front: 'Target: libro',
      back: 'Base: book · IPA: /ˈli.bɾo/ · Example: Este libro es nuevo.',
      meta: 'POS: noun · Tags: A1, reading',
    },
  },
  {
    id: 'phrase',
    title: 'Phrase Card',
    description: 'Full phrases with register notes, context, and alternate responses.',
    fields: ['Phrase', 'Translation', 'Register', 'Context note', 'Audio'],
    example: {
      front: 'Target: ¿Cómo te llamas?',
      back: 'Base: What is your name? · Register: informal',
      meta: 'Audio + example: Hola, ¿cómo te llamas?',
    },
  },
  {
    id: 'cloze',
    title: 'Cloze Card',
    description: 'Sentence with blank(s) plus grammar note and accepted answers.',
    fields: ['Sentence', 'Answer', 'Alternates', 'Hint'],
    example: {
      front: 'Yo ____ café por la mañana.',
      back: 'Answer: tomo · Alternates: bebo',
      meta: 'Hint: Verb tomar present tense',
    },
  },
  {
    id: 'image',
    title: 'Image Hint Card',
    description: 'Show image and optional TTS; answer by typing or speaking the term.',
    fields: ['Image', 'Prompt', 'Answer', 'Notes'],
    example: {
      front: 'Image: bowl of soup',
      back: 'Answer: sopa · Extra: feminine noun',
      meta: 'Supports drag-drop reorder in decks',
    },
  },
  {
    id: 'conjugation',
    title: 'Conjugation Table',
    description: 'Lemma with table of key tenses, moods, and irregular notes.',
    fields: ['Lemma', 'Tenses', 'Irregular notes', 'Audio'],
    example: {
      front: 'Verb: to be (ser)',
      back: 'Present: soy/eres/es/somos/sois/son',
      meta: 'Adds tooltips for pronouns and usage',
    },
  },
  {
    id: 'script',
    title: 'Script Writing',
    description: 'Stroke order images, transliteration, and typing practice for characters.',
    fields: ['Character', 'Stroke order', 'Transliteration', 'Audio'],
    example: {
      front: 'Character: க (ka)',
      back: 'Instruction: Follow 3-stroke order; transliteration: ka',
      meta: 'Supports animated SVG strokes (v2)',
    },
  },
];

export const getGeneratorSummary = (): GeneratorSummary => ({
  baseLang: 'English',
  targetLang: 'Español',
  detected: 'en',
  status: 'ready',
  sourceSnippet:
    'On Sundays I visit the library with my brother and we listen to music before cooking dinner together.',
  tokens: [
    { token: 'library', lemma: 'library', frequencyRank: 820, alreadyKnown: false },
    { token: 'brother', lemma: 'brother', frequencyRank: 910, alreadyKnown: false },
    { token: 'listen', lemma: 'listen', frequencyRank: 640, alreadyKnown: true },
    { token: 'cooking', lemma: 'cook', frequencyRank: 705, alreadyKnown: false },
  ],
  heuristics: [
    'Filtered verbs already mastered in deck',
    'Boosted nouns with CEFR A1 frequency',
    'Kept context sentences under 180 chars',
  ],
  candidates: [
    {
      id: 'cand-001',
      type: 'word',
      base: 'library',
      target: 'biblioteca',
      ipa: '/βi.βlioˈte.ka/',
      pos: 'noun',
      frequencyRank: 820,
      noveltyScore: 0.72,
      exampleBase: 'The library opens at nine.',
      exampleTarget: 'La biblioteca abre a las nueve.',
      reason: 'High frequency noun not yet in deck',
    },
    {
      id: 'cand-002',
      type: 'phrase',
      base: 'We listen to music.',
      target: 'Escuchamos música.',
      ipa: '/es.kuˈtʃa.mos ˈmu.si.ka/',
      pos: 'expression',
      frequencyRank: 610,
      noveltyScore: 0.66,
      exampleBase: 'We listen to music together.',
      exampleTarget: 'Escuchamos música juntos.',
      reason: 'Introduces conjugated verb in 1st person plural',
    },
    {
      id: 'cand-003',
      type: 'cloze',
      base: 'We ____ dinner together.',
      target: 'cook',
      frequencyRank: 705,
      noveltyScore: 0.58,
      exampleBase: 'We cook dinner together.',
      exampleTarget: 'Cocinamos la cena juntos.',
      reason: 'Highlights -amos ending for -ar verbs',
    },
  ],
});

export const getAnalyticsSnapshot = (): AnalyticsSnapshot => ({
  retention: [
    { label: '7-day', value: 92, delta: '+3.2%' },
    { label: '30-day', value: 87, delta: '+1.4%' },
    { label: '90-day', value: 81, delta: '+0.6%' },
  ],
  accuracyByTag: [
    { label: 'Travel', value: 89, delta: '+2%' },
    { label: 'Script', value: 76, delta: '-4%' },
    { label: 'Grammar', value: 83, delta: '+1%' },
  ],
  accuracyByPos: [
    { label: 'Nouns', value: 91 },
    { label: 'Verbs', value: 84 },
    { label: 'Phrases', value: 88 },
    { label: 'Script', value: 74 },
  ],
  dueForecast: [
    { day: 'Mon', due: 78 },
    { day: 'Tue', due: 64 },
    { day: 'Wed', due: 52 },
    { day: 'Thu', due: 48 },
    { day: 'Fri', due: 44 },
    { day: 'Sat', due: 33 },
    { day: 'Sun', due: 29 },
  ],
  gradeDistribution: [
    { grade: 5, count: 42 },
    { grade: 4, count: 38 },
    { grade: 3, count: 21 },
    { grade: 2, count: 9 },
    { grade: 1, count: 3 },
    { grade: 0, count: 2 },
  ],
  timeSpent: [
    { label: 'Week', value: 168, delta: '+12m' },
    { label: 'Avg / day', value: 24, delta: '+4m' },
  ],
  deckBreakdown: [
    { deckId: 'spanish-foundation', deckName: 'Spanish Core A1', accuracy: 88, due: 52 },
    { deckId: 'arabic-travel', deckName: 'Arabic Travel Survival', accuracy: 82, due: 39 },
    { deckId: 'tamil-family', deckName: 'Tamil Family & Culture', accuracy: 86, due: 37 },
  ],
});

export const getPlanComparisonRows = (): PlanComparisonRow[] => [
  { feature: 'Decks', free: '3 personal decks', pro: 'Unlimited decks', highlight: 'pro' },
  { feature: 'Daily reviews', free: 'Up to 100', pro: 'Up to 1000', highlight: 'pro' },
  { feature: 'Auto-generator', free: 'Basic (words only)', pro: 'Full (phrases, POS, frequency)', highlight: 'pro' },
  { feature: 'Audio toolkit', free: 'TTS playback', pro: 'TTS + record & compare', highlight: 'pro' },
  { feature: 'Import/Export', free: 'CSV import/export', pro: 'CSV + JSON + shared links', highlight: 'pro' },
  { feature: 'Share deck', free: '—', pro: 'Read-only links', highlight: 'pro' },
  { feature: 'Integrations', free: 'Study Planner sync', pro: 'All integrations unlocked', highlight: 'pro' },
];

export const getIntegrationCards = (): IntegrationCard[] => [
  {
    id: 'study-planner',
    title: 'Study Planner',
    description: 'Auto-schedule 20 minute review blocks directly into your planner with due counts synced nightly.',
    icon: 'fa-calendar-days',
    accent: 'from-indigo-500 via-sky-500 to-emerald-500',
    actions: ['Push to schedule', 'Update streak in planner'],
  },
  {
    id: 'course-tracker',
    title: 'Course Tracker',
    description: 'Convert syllabus vocabulary lists into decks and map due dates to exam checkpoints.',
    icon: 'fa-route',
    accent: 'from-purple-500 via-indigo-500 to-slate-500',
    actions: ['Import syllabus', 'Sync exam targets'],
  },
  {
    id: 'exam-simulator',
    title: 'Exam Simulator',
    description: 'Embed vocab-only sections in mock tests and log missed cards back into Language Flashcards.',
    icon: 'fa-clipboard-check',
    accent: 'from-emerald-500 via-teal-500 to-indigo-500',
    actions: ['Send missed terms', 'Review exam deck'],
  },
  {
    id: 'research-assistant',
    title: 'Research Assistant',
    description: 'Generate glossaries from highlights and publish to decks for collaborative study groups.',
    icon: 'fa-flask',
    accent: 'from-amber-500 via-pink-500 to-purple-500',
    actions: ['Create glossary deck', 'Share read-only link'],
  },
];

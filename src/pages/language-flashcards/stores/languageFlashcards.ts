import Alpine from 'alpinejs';
import { BaseStore, clone } from '../../../alpineStores/base';
import {
  getAnalyticsSnapshot,
  getCardTypeDefinitions,
  getDailySummary,
  getDeckSummaries,
  getGeneratorSummary,
  getIntegrationCards,
  getPlanComparisonRows,
  getReviewModes,
  type AnalyticsSnapshot,
  type CardTypeDefinition,
  type DailySummary,
  type DeckSummary,
  type GeneratorCandidate,
  type GeneratorSummary,
  type IntegrationCard,
  type PlanComparisonRow,
  type ReviewCard,
  type ReviewMode,
} from '../data/sampleLanguageFlashcards';

type ReviewQueueType = 'due' | 'new';
type WorkspacePanel = 'overview' | 'review' | 'generator' | 'analytics';

interface ReviewHistoryEntry {
  readonly cardId: string;
  readonly grade: number;
  readonly mode: ReviewMode['id'];
  readonly dueInDays: number;
  readonly ease: number;
  readonly reviewedAt: string;
}

interface ReviewSessionState {
  queue: ReviewCard[];
  queueType: ReviewQueueType;
  activeIndex: number;
  showAnswer: boolean;
  typedAnswer: string;
  similarityScore: number;
  status: 'idle' | 'reviewing' | 'done';
  mode: ReviewMode['id'];
  history: ReviewHistoryEntry[];
}

interface GeneratorState {
  summary: GeneratorSummary;
  selectedIds: string[];
  committed: string[];
  statusMessage: string;
}

interface DeckFilterState {
  search: string;
  plan: 'all' | 'free' | 'pro';
  tag: string;
}

interface LanguageFlashcardsState {
  daily: DailySummary;
  decks: DeckSummary[];
  reviewModes: ReviewMode[];
  cardTypes: CardTypeDefinition[];
  analytics: AnalyticsSnapshot;
  planRows: PlanComparisonRow[];
  integrations: IntegrationCard[];
  review: ReviewSessionState;
  generator: GeneratorState;
  deckFilter: DeckFilterState;
  activeDeckId: string;
  activePanel: WorkspacePanel;
  planTier: 'free' | 'pro';
  quickAdd: {
    term: string;
    translation: string;
    tag: string;
  };
  lastAction: string | null;
}

const gradeBoundaries = {
  min: 0,
  max: 5,
} as const;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const computeNextInterval = (card: ReviewCard, grade: number) => {
  const g = clamp(Math.round(grade), gradeBoundaries.min, gradeBoundaries.max);
  let interval = card.difficulty === 'learning' ? 0 : Math.round(card.stability);
  let ease = card.stability || 2.5;

  if (g < 3) {
    interval = 1;
    ease = Math.max(1.3, ease - 0.2);
  } else {
    if (interval === 0) {
      interval = 1;
    } else if (interval === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ease);
    }
    ease = ease + (0.1 - (5 - g) * (0.08 + (5 - g) * 0.02));
  }

  interval = clamp(interval, 1, 3650);
  ease = clamp(ease, 1.3, 3.0);

  return { interval, ease };
};

class LanguageFlashcardsStore extends BaseStore {
  state: LanguageFlashcardsState;
  private initialised = false;

  constructor() {
    super();
    this.state = {
      daily: getDailySummary(),
      decks: getDeckSummaries(),
      reviewModes: getReviewModes(),
      cardTypes: getCardTypeDefinitions(),
      analytics: getAnalyticsSnapshot(),
      planRows: getPlanComparisonRows(),
      integrations: getIntegrationCards(),
      review: {
        queue: [],
        queueType: 'due',
        activeIndex: 0,
        showAnswer: false,
        typedAnswer: '',
        similarityScore: 0,
        status: 'idle',
        mode: 'standard',
        history: [],
      },
      generator: {
        summary: getGeneratorSummary(),
        selectedIds: [],
        committed: [],
        statusMessage: 'Paste any passage and generate deck-ready cards in seconds.',
      },
      deckFilter: { search: '', plan: 'all', tag: 'all' },
      activeDeckId: 'spanish-foundation',
      activePanel: 'overview',
      planTier: 'free',
      quickAdd: { term: '', translation: '', tag: 'General' },
      lastAction: null,
    };
  }

  init(): void {
    if (this.initialised) return;
    this.initialised = true;
    this.prepareReview('due', false);
    this.state.lastAction = 'Language Flashcards workspace ready. Start today\'s queue or explore generator.';
  }

  get activeDeck(): DeckSummary | null {
    return this.state.decks.find((deck) => deck.id === this.state.activeDeckId) ?? null;
  }

  setActiveDeck(deckId: string): void {
    if (deckId === this.state.activeDeckId) return;
    const deck = this.state.decks.find((item) => item.id === deckId);
    if (!deck) return;
    this.state.activeDeckId = deckId;
    this.prepareReview(this.state.review.queueType, false);
    this.state.lastAction = `${deck.name} pinned as active deck.`;
  }

  toggleDeckPinned(deckId: string): void {
    const deck = this.state.decks.find((item) => item.id === deckId);
    if (!deck) return;
    deck.pinned = !deck.pinned;
    this.state.lastAction = `${deck.name} ${deck.pinned ? 'pinned to' : 'removed from'} quick access.`;
  }

  setReviewMode(modeId: ReviewMode['id']): void {
    if (this.state.review.mode === modeId) return;
    const mode = this.state.reviewModes.find((item) => item.id === modeId);
    if (!mode) return;
    this.state.review.mode = modeId;
    this.state.lastAction = `${mode.label} activated for the review session.`;
  }

  prepareReview(queueType: ReviewQueueType, focusPanel = true): void {
    const deck = this.activeDeck;
    if (!deck) return;
    const sourceQueue = queueType === 'due' ? deck.sampleQueues.due : deck.sampleQueues.new;
    this.state.review = {
      queue: clone(sourceQueue),
      queueType,
      activeIndex: 0,
      showAnswer: false,
      typedAnswer: '',
      similarityScore: 0,
      status: sourceQueue.length ? 'reviewing' : 'done',
      mode: this.state.review.mode,
      history: [],
    };
    if (focusPanel) {
      this.state.activePanel = 'review';
    }
    const queueLabel = queueType === 'due' ? 'due cards' : 'new introductions';
    this.state.lastAction = `${sourceQueue.length} ${queueLabel} ready from ${deck.name}.`;
  }

  revealAnswer(): void {
    if (this.state.review.status !== 'reviewing') return;
    this.state.review.showAnswer = true;
  }

  typeAnswer(value: string): void {
    this.state.review.typedAnswer = value;
  }

  simulateSimilarity(): void {
    if (this.state.review.mode !== 'speak') return;
    const randomScore = Math.round(70 + Math.random() * 25);
    this.state.review.similarityScore = clamp(randomScore, 45, 99);
  }

  gradeCurrent(grade: number): void {
    const { review } = this.state;
    if (review.status !== 'reviewing') return;
    const card = review.queue[review.activeIndex];
    if (!card) return;

    const { interval, ease } = computeNextInterval(card, grade);
    card.stability = ease;
    const dueInDays = interval;

    review.history = [
      ...review.history,
      {
        cardId: card.id,
        grade,
        mode: review.mode,
        dueInDays,
        ease,
        reviewedAt: new Date().toISOString(),
      },
    ];

    this.state.daily.completed = clamp(this.state.daily.completed + 1, 0, 9999);
    this.state.daily.lastReviewAt = new Date().toISOString();
    if (review.queueType === 'due' && this.state.daily.dueToday > 0) {
      this.state.daily.dueToday = Math.max(0, this.state.daily.dueToday - 1);
    }

    const nextIndex = review.activeIndex + 1;
    if (nextIndex >= review.queue.length) {
      review.status = 'done';
      review.activeIndex = review.queue.length - 1;
      review.showAnswer = true;
      this.state.lastAction = `Session complete with ${review.history.length} cards reviewed.`;
    } else {
      review.activeIndex = nextIndex;
      review.showAnswer = false;
      review.typedAnswer = '';
      review.similarityScore = 0;
      this.state.lastAction = `Card graded ${grade}. Next card queued.`;
    }
  }

  skipCard(): void {
    const { review } = this.state;
    if (review.status !== 'reviewing') return;
    review.queue = review.queue.slice(0, review.activeIndex).concat(review.queue.slice(review.activeIndex + 1));
    if (!review.queue.length) {
      review.status = 'done';
      review.showAnswer = false;
      this.state.lastAction = 'No more cards in queue.';
      return;
    }
    review.activeIndex = Math.min(review.activeIndex, review.queue.length - 1);
    review.showAnswer = false;
    this.state.lastAction = 'Card skipped for later review.';
  }

  updateDeckFilter(partial: Partial<DeckFilterState>): void {
    this.state.deckFilter = { ...this.state.deckFilter, ...partial };
  }

  clearFilters(): void {
    this.state.deckFilter = { search: '', plan: 'all', tag: 'all' };
    this.state.lastAction = 'Deck filters cleared.';
  }

  get filteredDecks(): DeckSummary[] {
    const { decks, deckFilter } = this.state;
    return decks.filter((deck) => {
      const matchesSearch = deckFilter.search
        ? [deck.name, deck.description, deck.pairLabel]
            .join(' ')
            .toLowerCase()
            .includes(deckFilter.search.toLowerCase())
        : true;
      const matchesPlan = deckFilter.plan === 'all' || deck.plan === deckFilter.plan;
      const matchesTag = deckFilter.tag === 'all' || deck.tags.includes(deckFilter.tag);
      return matchesSearch && matchesPlan && matchesTag;
    });
  }

  updateQuickAdd(partial: Partial<LanguageFlashcardsState['quickAdd']>): void {
    this.state.quickAdd = { ...this.state.quickAdd, ...partial };
  }

  addQuickCard(): void {
    const deck = this.activeDeck;
    if (!deck) return;
    const term = this.state.quickAdd.term.trim();
    const translation = this.state.quickAdd.translation.trim();
    if (!term || !translation) {
      this.state.lastAction = 'Enter both prompt and answer before adding a card.';
      return;
    }

    const newCard: ReviewCard = {
      id: `quick-${Date.now()}`,
      type: 'word',
      prompt: translation,
      answer: term,
      tags: [this.state.quickAdd.tag],
      difficulty: 'learning',
      stability: 2.5,
    };

    deck.sampleQueues.new = [newCard, ...deck.sampleQueues.new].slice(0, 12);
    this.state.daily.newIntroductions += 1;
    this.state.quickAdd = { term: '', translation: '', tag: this.state.quickAdd.tag };
    this.state.lastAction = `${deck.name}: “${translation}” queued as new card.`;
  }

  setPanel(panel: WorkspacePanel): void {
    this.state.activePanel = panel;
  }

  setPlanTier(tier: 'free' | 'pro'): void {
    if (this.state.planTier === tier) return;
    this.state.planTier = tier;
    this.state.lastAction = `${tier === 'pro' ? 'Pro' : 'Free'} plan preview selected.`;
  }

  toggleCandidateSelection(candidateId: string): void {
    const { generator } = this.state;
    generator.selectedIds = generator.selectedIds.includes(candidateId)
      ? generator.selectedIds.filter((id) => id !== candidateId)
      : [...generator.selectedIds, candidateId];
  }

  regenerateCandidates(): void {
    this.withLoader(() => {
      const summary = getGeneratorSummary();
      const randomised = {
        ...summary,
        candidates: summary.candidates.map((candidate) => ({
          ...candidate,
          noveltyScore: Math.round(candidate.noveltyScore * 100) / 100,
        })),
      };
      this.state.generator.summary = randomised;
      this.state.generator.selectedIds = [];
      this.state.generator.statusMessage = 'New candidates generated. Select the ones you want to add to the deck.';
      this.state.lastAction = 'Generator refreshed with updated heuristics.';
    });
  }

  commitSelectedCandidates(): void {
    const deck = this.activeDeck;
    const { generator } = this.state;
    if (!deck) return;
    if (!generator.selectedIds.length) {
      this.state.lastAction = 'Select at least one candidate before adding to the deck.';
      return;
    }

    const selectedCards: GeneratorCandidate[] = generator.summary.candidates.filter((candidate) =>
      generator.selectedIds.includes(candidate.id),
    );
    const newCards: ReviewCard[] = selectedCards.map((candidate) => ({
      id: `${candidate.id}-${Date.now()}`,
      type: candidate.type,
      prompt: candidate.target,
      answer: candidate.base,
      ipa: candidate.ipa,
      transliteration: candidate.transliteration,
      exampleBase: candidate.exampleBase,
      exampleTarget: candidate.exampleTarget,
      tags: [candidate.pos ?? 'lexicon'],
      difficulty: 'learning',
      stability: 2.5,
    }));

    deck.sampleQueues.new = [...newCards, ...deck.sampleQueues.new].slice(0, 20);
    generator.committed = [...generator.committed, ...generator.selectedIds];
    generator.selectedIds = [];
    generator.statusMessage = `${newCards.length} cards staged in “${deck.name}”. Review and publish to make them live.`;
    this.state.daily.newIntroductions += newCards.length;
    this.state.lastAction = `${newCards.length} generated cards added to ${deck.name}.`;
  }

  refreshAnalytics(): void {
    this.withLoader(() => {
      this.state.analytics = getAnalyticsSnapshot();
      this.state.lastAction = 'Analytics snapshot refreshed with latest retention curve.';
    });
  }
}

Alpine.store('languageFlashcards', new LanguageFlashcardsStore());

import Alpine from 'alpinejs';
import { BaseStore } from '../../../alpineStores/base';
import { getFortuneSampleData } from '../../../data/fortuneSamples';
import type {
  FortuneCardDefinition,
  FortuneDailyReading,
  FortuneIntentKey,
  FortuneIntentOption,
  FortuneJournalPrompt,
  FortuneMoodKey,
  FortuneMoodOption,
  FortuneNumerologyProfile,
  FortuneNumerologyReading,
  FortunePlanFeature,
  FortuneReadingView,
  FortuneRoadmapMilestone,
  FortuneSafetyGuideline,
  FortuneSpreadReading,
  FortuneThemeDefinition,
  FortuneThemeKey,
  FortuneYesNoSample,
  FortuneYesNoReading,
  FortuneZodiacProfile,
  FortuneZodiacReading,
} from '../../../types/fortune';

interface FortuneYesNoState extends FortuneYesNoReading {
  error: string | null;
  status: 'ready' | 'cooldown';
}

interface FortuneOracleState {
  loading: boolean;
  activeView: FortuneReadingView;
  activeTheme: FortuneThemeKey;
  activeMood: FortuneMoodKey;
  activeIntent: FortuneIntentKey;
  activeFocus: FortuneIntentKey;
  nickname: string;
  timezone: string;
  daily: FortuneDailyReading | null;
  dailyRerollLimit: number;
  dailyRerollsUsed: number;
  dailyLastRerollReason: string | null;
  yesno: FortuneYesNoState;
  spread: FortuneSpreadReading | null;
  zodiac: FortuneZodiacReading | null;
  numerology: FortuneNumerologyReading | null;
  planFeatures: FortunePlanFeature[];
  safety: FortuneSafetyGuideline[];
  roadmap: FortuneRoadmapMilestone[];
  themes: FortuneThemeDefinition[];
  intents: FortuneIntentOption[];
  moods: FortuneMoodOption[];
  focusAreas: readonly FortuneIntentKey[];
  journalPrompts: FortuneJournalPrompt[];
  disclaimers: readonly string[];
  zodiacProfiles: FortuneZodiacProfile[];
  numerologyProfiles: FortuneNumerologyProfile[];
  availableSpreads: readonly ('3-card' | '5-card')[];
  yesNoCooldownSeconds: number;
  nextYesNoAllowedAt: number;
  lastAction: string | null;
  selectedSign: string;
  selectedPeriod: 'daily' | 'weekly';
  selectedBirthdate: string;
}

const spreadPositions: Record<'3-card' | '5-card', readonly string[]> = {
  '3-card': ['Past', 'Present', 'Future'],
  '5-card': ['Situation', 'Blocks', 'Guidance', 'External', 'Outcome'],
};

const fortuneFocusAreas: readonly FortuneIntentKey[] = [
  'general',
  'career',
  'love',
  'study',
  'health',
  'money',
  'creativity',
];

const hashString = (value: string): string => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

class FortuneOracleStore extends BaseStore {
  state: FortuneOracleState = {
    loading: false,
    activeView: 'daily',
    activeTheme: 'classic',
    activeMood: 'curious',
    activeIntent: 'general',
    activeFocus: 'general',
    nickname: 'Stargazer',
    timezone: 'UTC',
    daily: null,
    dailyRerollLimit: 1,
    dailyRerollsUsed: 0,
    dailyLastRerollReason: null,
    yesno: {
      question: 'Will today surprise me?',
      outcome: 'maybe',
      oneLiner: 'The path is hazy; ask a narrower question or switch angles.',
      theme: 'classic',
      seed: 'preview',
      askedAt: 0,
      cooldownRemaining: 0,
      error: null,
      status: 'ready',
    },
    spread: null,
    zodiac: null,
    numerology: null,
    planFeatures: [],
    safety: [],
    roadmap: [],
    themes: [],
    intents: [],
    moods: [],
    focusAreas: fortuneFocusAreas,
    journalPrompts: [],
    disclaimers: [],
    zodiacProfiles: [],
    numerologyProfiles: [],
    availableSpreads: ['3-card', '5-card'],
    yesNoCooldownSeconds: 10,
    nextYesNoAllowedAt: 0,
    lastAction: null,
    selectedSign: 'leo',
    selectedPeriod: 'daily',
    selectedBirthdate: '1995-07-19',
  };

  private initialised = false;

  private cards: FortuneCardDefinition[] = [];

  private yesNoSamples: FortuneYesNoSample[] = [];

  private dailyActions: readonly string[] = [];

  private luckyFocuses: readonly string[] = [];

  private cooldownTickerStarted = false;

  constructor() {
    super();
  }

  init(): void {
    if (this.initialised) return;
    this.initialised = true;
    this.hydrate();
    this.startCooldownTicker();
  }

  private hydrate(): void {
    this.state.loading = true;
    this.setLoaderVisible(true);
    try {
      const sample = getFortuneSampleData();
      this.state.themes = sample.themes.map((theme) => ({
        ...theme,
        bestFor: [...theme.bestFor],
        previewKeywords: [...theme.previewKeywords],
      }));
      this.state.intents = sample.intents.map((intent) => ({ ...intent }));
      this.state.moods = sample.moods.map((mood) => ({ ...mood }));
      this.cards = sample.cards.map((card) => ({
        ...card,
        upright: { ...card.upright, keywords: [...card.upright.keywords] },
        reversed: { ...card.reversed, keywords: [...card.reversed.keywords] },
        domains: { ...card.domains },
      }));
      this.yesNoSamples = sample.yesNoSamples.map((item) => ({ ...item }));
      this.dailyActions = [...sample.dailyActions];
      this.luckyFocuses = [...sample.luckyFocuses];
      this.state.journalPrompts = sample.journalPrompts.map((prompt) => ({ ...prompt }));
      this.state.planFeatures = sample.planFeatures.map((feature) => ({ ...feature }));
      this.state.safety = sample.safety.map((guideline) => ({ ...guideline }));
      this.state.roadmap = sample.roadmap.map((milestone) => ({
        ...milestone,
        items: [...milestone.items],
      }));
      this.state.disclaimers = [...sample.disclaimers];
      this.state.zodiacProfiles = sample.zodiacProfiles.map((profile) => ({
        ...profile,
        daily: { ...profile.daily, highlights: [...profile.daily.highlights] },
        weekly: { ...profile.weekly, highlights: [...profile.weekly.highlights] },
      }));
      this.state.numerologyProfiles = sample.numerologyProfiles.map((profile) => ({
        ...profile,
        strengths: [...profile.strengths],
        growth: [...profile.growth],
      }));
      this.state.activeTheme = this.state.themes[0]?.key ?? 'classic';
      this.state.activeMood = this.state.moods[0]?.key ?? 'curious';
      this.state.activeIntent = this.state.intents[0]?.key ?? 'general';
      this.state.activeFocus = this.state.activeIntent;
      this.state.selectedSign = this.state.zodiacProfiles[4]?.sign ?? 'leo';
      this.generateDailyReading();
      this.generateSpreadReading('3-card', this.state.activeFocus);
      this.generateYesNoPreview(this.state.yesno.question);
      this.generateZodiacReading(this.state.selectedSign, this.state.selectedPeriod);
      this.generateNumerologyReading(this.state.selectedBirthdate);
      this.state.lastAction = 'Fortune Teller ready — pick a reading to explore.';
    } finally {
      this.state.loading = false;
      this.setLoaderVisible(false);
    }
  }

  private startCooldownTicker(): void {
    if (this.cooldownTickerStarted) return;
    if (typeof window === 'undefined') return;
    this.cooldownTickerStarted = true;
    window.setInterval(() => this.updateCooldowns(), 1000);
  }

  private updateCooldowns(): void {
    const now = Date.now();
    const remainingMs = this.state.nextYesNoAllowedAt - now;
    if (remainingMs <= 0) {
      this.state.yesno.cooldownRemaining = 0;
      this.state.yesno.status = 'ready';
      return;
    }
    this.state.yesno.cooldownRemaining = Math.ceil(remainingMs / 1000);
    this.state.yesno.status = 'cooldown';
  }

  private computeSeed(type: string, ...extras: readonly string[]): string {
    const timestamp = new Date().toISOString().slice(0, 10);
    const payload = [type, this.state.nickname, this.state.activeMood, this.state.activeIntent, this.state.activeTheme, timestamp, ...extras]
      .join('|')
      .toLowerCase();
    return `${type}-${hashString(payload)}`;
  }

  private pickCardByTheme(theme: FortuneThemeKey): FortuneCardDefinition {
    const themed = this.cards.filter((card) => card.theme === theme);
    const pool = themed.length > 0 ? themed : this.cards;
    const index = Math.floor(Math.random() * pool.length);
    return pool[index] ?? pool[0];
  }

  private pickUniqueCards(count: number, theme: FortuneThemeKey): FortuneCardDefinition[] {
    const pool = [...this.cards.filter((card) => card.theme === theme), ...this.cards];
    const unique: FortuneCardDefinition[] = [];
    for (const card of pool) {
      if (!unique.some((item) => item.id === card.id)) {
        unique.push(card);
      }
      if (unique.length >= count) break;
    }
    while (unique.length < count && this.cards.length > 0) {
      unique.push(this.cards[unique.length % this.cards.length]);
    }
    return unique.slice(0, count);
  }

  private randomFrom<T>(source: readonly T[]): T {
    if (source.length === 0) {
      throw new Error('Cannot pick from empty array');
    }
    const index = Math.floor(Math.random() * source.length);
    return source[index] ?? source[0];
  }

  private generateDailyReading(): void {
    const card = this.pickCardByTheme(this.state.activeTheme);
    const orientation = Math.random() > 0.35 ? 'upright' : 'reversed';
    const face = orientation === 'upright' ? card.upright : card.reversed;
    const lucky = this.randomFrom(this.luckyFocuses);
    const action = this.randomFrom(this.dailyActions);
    this.state.daily = {
      cardId: card.id,
      cardTitle: card.title,
      orientation,
      summary: card.domains[this.state.activeIntent],
      action,
      luckyFocus: lucky,
      keywords: [...face.keywords],
      affirmation: face.affirmation,
      theme: this.state.activeTheme,
      seed: this.computeSeed('daily', card.id, orientation, lucky),
      intent: this.state.activeIntent,
      mood: this.state.activeMood,
    };
  }

  private generateYesNoPreview(question: string): void {
    const trimmed = question.trim();
    if (trimmed.length === 0) {
      this.state.yesno.error = 'Ask a question to get a yes, no, or maybe.';
      return;
    }
    const now = Date.now();
    if (now < this.state.nextYesNoAllowedAt) {
      this.updateCooldowns();
      this.state.yesno.error = `Cooldown active — try again in ${this.state.yesno.cooldownRemaining}s.`;
      this.state.lastAction = 'Yes/No cooldown active — please wait before asking again.';
      return;
    }
    const sample = this.randomFrom(this.yesNoSamples);
    this.state.nextYesNoAllowedAt = now + this.state.yesNoCooldownSeconds * 1000;
    this.state.yesno = {
      question: trimmed,
      outcome: sample.outcome,
      oneLiner: sample.oneLiner,
      theme: this.state.activeTheme,
      seed: this.computeSeed('yesno', trimmed, sample.outcome),
      askedAt: now,
      cooldownRemaining: this.state.yesNoCooldownSeconds,
      error: null,
      status: 'cooldown',
    };
    this.state.lastAction = `Yes/No oracle replied: ${sample.outcome.toUpperCase()} — ${sample.oneLiner}`;
  }

  private generateSpreadReading(spreadType: '3-card' | '5-card', domain: FortuneIntentKey): void {
    const positions = spreadPositions[spreadType] ?? spreadPositions['3-card'];
    const cards = this.pickUniqueCards(positions.length, this.state.activeTheme);
    const spreadCards = positions.map((position, index) => {
      const card = cards[index] ?? cards[0];
      const orientation = Math.random() > 0.4 ? 'upright' : 'reversed';
      const face = orientation === 'upright' ? card.upright : card.reversed;
      const domainGuidance = card.domains[domain];
      const text = `${domainGuidance} · ${face.guidance}`;
      return {
        position,
        cardTitle: card.title,
        orientation,
        text,
      };
    });
    const actionPool = [...this.dailyActions];
    const actions: string[] = [];
    while (actions.length < 2 && actionPool.length > 0) {
      const action = actionPool.splice(Math.floor(Math.random() * actionPool.length), 1)[0];
      if (action) actions.push(action);
    }
    this.state.spread = {
      spread: spreadType,
      domain,
      theme: this.state.activeTheme,
      cards: spreadCards,
      actions,
      seed: this.computeSeed(spreadType, domain, spreadCards.map((card) => card.cardTitle).join('-')),
    };
    this.state.activeFocus = domain;
  }

  private findZodiacProfile(sign: string): FortuneZodiacProfile | null {
    return this.state.zodiacProfiles.find((profile) => profile.sign === sign) ?? null;
  }

  private generateZodiacReading(sign: string, period: 'daily' | 'weekly'): void {
    const profile = this.findZodiacProfile(sign) ?? this.state.zodiacProfiles[0] ?? null;
    if (!profile) {
      this.state.zodiac = null;
      return;
    }
    const periodData = period === 'weekly' ? profile.weekly : profile.daily;
    this.state.zodiac = {
      sign: profile.label,
      period,
      title: periodData.title,
      text: periodData.text,
      highlights: [...periodData.highlights],
      mantra: periodData.mantra,
      theme: periodData.theme,
    };
    this.state.selectedSign = profile.sign;
    this.state.selectedPeriod = period;
  }

  private computeLifePath(date: string): number {
    const digits = date.replace(/[^0-9]/g, '');
    if (!digits) return 1;
    let total = digits.split('').reduce((sum, char) => sum + Number.parseInt(char, 10), 0);
    while (total > 9) {
      total = total
        .toString()
        .split('')
        .reduce((sum, char) => sum + Number.parseInt(char, 10), 0);
    }
    return clamp(total, 1, 9);
  }

  private generateNumerologyReading(birthdate: string): void {
    const lifePath = this.computeLifePath(birthdate);
    const profile =
      this.state.numerologyProfiles.find((item) => item.lifePath === lifePath) ?? this.state.numerologyProfiles[0] ?? null;
    if (!profile) {
      this.state.numerology = null;
      return;
    }
    this.state.numerology = {
      birthdate,
      lifePath,
      archetype: profile.archetype,
      summary: profile.summary,
      strengths: [...profile.strengths],
      growth: [...profile.growth],
      mantra: profile.mantra,
      theme: profile.theme,
    };
    this.state.selectedBirthdate = birthdate;
  }

  setActiveView(view: FortuneReadingView): void {
    this.state.activeView = view;
  }

  setTheme(theme: FortuneThemeKey): void {
    if (this.state.activeTheme === theme) return;
    this.state.activeTheme = theme;
    this.generateDailyReading();
    this.generateSpreadReading(this.state.spread?.spread ?? '3-card', this.state.activeFocus);
    this.generateYesNoPreview(this.state.yesno.question);
    this.state.lastAction = `Theme switched to ${this.state.themes.find((item) => item.key === theme)?.name ?? theme}.`;
  }

  setMood(mood: FortuneMoodKey): void {
    if (this.state.activeMood === mood) return;
    this.state.activeMood = mood;
    this.generateDailyReading();
    this.state.lastAction = `Mood tuned to ${this.state.moods.find((item) => item.key === mood)?.label ?? mood}.`;
  }

  setIntent(intent: FortuneIntentKey): void {
    if (this.state.activeIntent === intent) return;
    this.state.activeIntent = intent;
    this.generateDailyReading();
    this.generateSpreadReading(this.state.spread?.spread ?? '3-card', intent);
    this.state.lastAction = `Focus shifted to ${this.state.intents.find((item) => item.key === intent)?.label ?? intent}.`;
  }

  setFocus(domain: FortuneIntentKey): void {
    if (this.state.activeFocus === domain) return;
    this.generateSpreadReading(this.state.spread?.spread ?? '3-card', domain);
    this.state.lastAction = `Spread intent set to ${this.state.intents.find((item) => item.key === domain)?.label ?? domain}.`;
  }

  setSpreadType(spreadType: '3-card' | '5-card'): void {
    if (this.state.spread?.spread === spreadType) return;
    this.generateSpreadReading(spreadType, this.state.activeFocus);
    this.state.lastAction = `${spreadType.toUpperCase()} spread prepared.`;
  }

  setNickname(nickname: string): void {
    this.state.nickname = nickname.trim() || 'Stargazer';
    this.generateDailyReading();
  }

  setTimezone(timezone: string): void {
    this.state.timezone = timezone;
  }

  rerollDaily(reason: string): void {
    if (this.state.dailyRerollsUsed >= this.state.dailyRerollLimit) {
      this.state.lastAction = 'Reroll limit reached — upgrade to Pro for more rerolls.';
      return;
    }
    this.state.dailyRerollsUsed += 1;
    this.state.dailyLastRerollReason = reason.trim() || 'Exploring a new angle';
    this.generateDailyReading();
    this.state.lastAction = `Daily rerolled (${this.state.dailyLastRerollReason}).`;
  }

  askYesNo(question: string): void {
    this.generateYesNoPreview(question);
    this.setActiveView('yesno');
  }

  drawSpread(spreadType: '3-card' | '5-card', domain: FortuneIntentKey): void {
    this.generateSpreadReading(spreadType, domain);
    this.setActiveView('spread');
  }

  updateZodiac(sign: string, period: 'daily' | 'weekly'): void {
    this.generateZodiacReading(sign, period);
    this.setActiveView('zodiac');
    this.state.lastAction = `${period === 'daily' ? 'Daily' : 'Weekly'} horoscope refreshed for ${sign}.`;
  }

  updateNumerology(birthdate: string): void {
    this.generateNumerologyReading(birthdate);
    this.setActiveView('numsum');
    this.state.lastAction = 'Numerology summary updated.';
  }
}

Alpine.store('fortuneOracle', new FortuneOracleStore());

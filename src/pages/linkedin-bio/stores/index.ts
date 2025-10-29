import Alpine from 'alpinejs';
import { BaseStore, clone } from '../../../alpineStores/base';

export type ArtifactType = 'headline' | 'about' | 'featured';

type ToneOption = {
  value: string;
  label: string;
  icon: string;
};

type PersonaOption = {
  value: 'first' | 'third';
  label: string;
};

type LanguageOption = {
  value: string;
  label: string;
  locale: string;
  rtl?: boolean;
};

type VariantScore = {
  coverage: number;
  readability: 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  length: 'OK' | 'Trim' | 'Expand';
  buzzword: 'OK' | 'Review';
  bias: 'OK' | 'Check';
  authenticity: 'verified' | 'needs-evidence';
};

type ArtifactVariant = {
  id: string;
  type: ArtifactType;
  label: string;
  tone: string[];
  persona: 'first' | 'third';
  language: string;
  variant: 'short' | 'long' | 'default';
  text: string;
  chars: number;
  keywords: string[];
  evidenceRefs: string[];
  emoji?: string;
  scores: VariantScore;
  badges?: string[];
};

type EvidenceRecord = {
  id: string;
  claim: string;
  source: string;
  excerpt: string;
};

type KeywordChecklist = {
  covered: string[];
  partial: string[];
  missing: string[];
  suggested: string[];
};

type HistoryEntry = {
  id: string;
  savedAt: string;
  score: number;
  keywordsCovered: number;
  exported: ('md' | 'pdf')[];
  planRequired: 'free' | 'pro';
  note: string;
};

type IntegrationCopy = {
  resumeBuilder: string;
  coverLetter: string;
  portfolioCreator: string;
};

type ProfileRecord = {
  id: string;
  title: string;
  user: { name: string; headline: string; location: string };
  targets: {
    roles: string[];
    industries: string[];
    location: string;
    keywords: string[];
    seniority: string;
    remote: string;
    visa: string[];
  };
  preferences: {
    tone: string[];
    persona: 'first' | 'third';
    language: string;
    emoji: boolean;
  };
  resume: {
    summary: string;
    highlights: string[];
    experience: Array<{ company: string; title: string; impact: string[] }>;
  };
  keywordChecklist: KeywordChecklist;
  artifacts: Record<ArtifactType, ArtifactVariant[]>;
  evidence: EvidenceRecord[];
  history: HistoryEntry[];
  integrations: IntegrationCopy;
};

type HistoryFilter = {
  plan: 'all' | 'free' | 'pro';
  score: 'all' | '80+' | '90+';
  search: string;
};

type UsageState = {
  generations: { used: number; limit: { free: number; pro: number } };
  savedProfiles: { count: number; limit: { free: number; pro: number } };
  lastGeneratedAt: string;
};

type ToneIntensity = {
  professional: number;
  friendly: number;
  confident: number;
  humble: number;
  storyteller: number;
  dataDriven: number;
};

type ScoreSummary = {
  coverage: number;
  coverageLabel: string;
  readability: string;
  length: string;
  buzzword: string;
  bias: string;
  authenticity: string;
};

type HistoryTableRecord = HistoryEntry & {
  profileId: string;
  profileTitle: string;
  persona: 'first' | 'third';
};

class LinkedInBioStore extends BaseStore {
  state: {
    plan: 'free' | 'pro';
    usage: UsageState;
    activeProfileId: string;
    selectedVariants: Record<ArtifactType, string>;
    toneStack: string[];
    persona: 'first' | 'third';
    language: string;
    emoji: boolean;
    toneIntensity: ToneIntensity;
    showEvidenceId: string | null;
    filters: { history: HistoryFilter };
    toneOptions: ToneOption[];
    personaOptions: PersonaOption[];
    languageOptions: LanguageOption[];
    profiles: ProfileRecord[];
  };

  private initializedLanding = false;
  private initializedHistory = false;

  constructor() {
    super();

    const toneOptions: ToneOption[] = [
      { value: 'professional', label: 'Professional', icon: 'fa-briefcase' },
      { value: 'friendly', label: 'Friendly', icon: 'fa-face-smile' },
      { value: 'confident', label: 'Confident', icon: 'fa-bolt' },
      { value: 'humble', label: 'Humble', icon: 'fa-seedling' },
      { value: 'storyteller', label: 'Storyteller', icon: 'fa-book-open' },
      { value: 'data-driven', label: 'Data-driven', icon: 'fa-chart-line' },
    ];

    const personaOptions: PersonaOption[] = [
      { value: 'first', label: 'First person (I/We)' },
      { value: 'third', label: 'Third person (Name/They)' },
    ];

    const languageOptions: LanguageOption[] = [
      { value: 'en', label: 'English', locale: 'en-US' },
      { value: 'ar', label: 'Arabic', locale: 'ar-AE', rtl: true },
      { value: 'ta', label: 'Tamil', locale: 'ta-IN' },
      { value: 'es', label: 'Spanish', locale: 'es-ES' },
    ];

    const profiles: ProfileRecord[] = [this.buildFrontendProfile(), this.buildProductProfile()];

    this.state = {
      plan: 'free',
      usage: {
        generations: { used: 2, limit: { free: 3, pro: 40 } },
        savedProfiles: { count: 1, limit: { free: 1, pro: 25 } },
        lastGeneratedAt: '2024-07-03T09:18:00Z',
      },
      activeProfileId: profiles[0]?.id ?? '',
      selectedVariants: {
        headline: profiles[0]?.artifacts.headline[0]?.id ?? '',
        about: profiles[0]?.artifacts.about[0]?.id ?? '',
        featured: profiles[0]?.artifacts.featured[0]?.id ?? '',
      },
      toneStack: clone(profiles[0]?.preferences.tone ?? ['professional']),
      persona: profiles[0]?.preferences.persona ?? 'first',
      language: profiles[0]?.preferences.language ?? 'en',
      emoji: profiles[0]?.preferences.emoji ?? false,
      toneIntensity: {
        professional: 70,
        friendly: 45,
        confident: 85,
        humble: 30,
        storyteller: 55,
        dataDriven: 90,
      },
      showEvidenceId: null,
      filters: {
        history: { plan: 'all', score: 'all', search: '' },
      },
      toneOptions,
      personaOptions,
      languageOptions,
      profiles,
    };
  }

  get planLabel(): string {
    return this.state.plan === 'pro' ? 'Pro plan' : 'Free plan';
  }

  get planBadgeClass(): string {
    return this.state.plan === 'pro'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-indigo-100 text-indigo-700';
  }

  get generationUsageLabel(): string {
    const { generations } = this.state.usage;
    const limit = this.state.plan === 'pro' ? '∞' : generations.limit.free;
    return `${generations.used}/${limit}`;
  }

  get savedProfilesLabel(): string {
    const { savedProfiles } = this.state.usage;
    const limit = this.state.plan === 'pro' ? 'Unlimited' : String(savedProfiles.limit.free);
    return `${savedProfiles.count} saved · ${limit} allowed`;
  }

  get activeProfile(): ProfileRecord | undefined {
    return this.state.profiles.find((profile) => profile.id === this.state.activeProfileId);
  }

  get activeTargets(): ProfileRecord['targets'] | undefined {
    return this.activeProfile?.targets;
  }

  get keywordTotal(): number {
    return this.activeTargets?.keywords.length ?? 0;
  }

  get toneOptions(): ToneOption[] {
    return this.state.toneOptions;
  }

  get personaOptions(): PersonaOption[] {
    return this.state.personaOptions;
  }

  get languageOptions(): LanguageOption[] {
    return this.state.languageOptions;
  }

  get toneSummary(): string {
    if (!this.state.toneStack.length) return 'Default';
    return this.state.toneStack
      .map((tone) => this.toneOptions.find((option) => option.value === tone)?.label ?? tone)
      .join(' · ');
  }

  get selectedVariants(): Record<ArtifactType, ArtifactVariant | undefined> {
    return {
      headline: this.getSelectedVariant('headline'),
      about: this.getSelectedVariant('about'),
      featured: this.getSelectedVariant('featured'),
    };
  }

  get variantGroups(): Record<ArtifactType, ArtifactVariant[]> {
    const profile = this.activeProfile;
    if (!profile) {
      return { headline: [], about: [], featured: [] };
    }
    return profile.artifacts;
  }

  get scoreSummary(): ScoreSummary {
    const profile = this.activeProfile;
    if (!profile) {
      return {
        coverage: 0,
        coverageLabel: '0% coverage',
        readability: '—',
        length: '—',
        buzzword: '—',
        bias: '—',
        authenticity: '—',
      };
    }

    const { headline, about } = this.selectedVariants;
    const keywords = new Set<string>();
    for (const variant of [headline, about]) {
      variant?.keywords.forEach((keyword) => keywords.add(keyword));
    }

    const totalKeywords = profile.targets.keywords.length || 1;
    const coverage = Math.round((keywords.size / totalKeywords) * 100);

    const summary: ScoreSummary = {
      coverage,
      coverageLabel: `${coverage}% coverage`,
      readability: about?.scores.readability ?? 'B2',
      length:
        headline?.scores.length === 'OK' && about?.scores.length === 'OK'
          ? 'Length OK'
          : about?.scores.length === 'Trim'
          ? 'Trim About'
          : 'Check length',
      buzzword:
        headline?.scores.buzzword === 'OK' && about?.scores.buzzword === 'OK'
          ? 'Buzzword lint · OK'
          : 'Review buzzwords',
      bias: about?.scores.bias ?? 'OK',
      authenticity:
        about?.scores.authenticity === 'verified' && headline?.scores.authenticity === 'verified'
          ? 'All claims verified'
          : 'Verify claims',
    };

    return summary;
  }

  get keywordChecklist(): KeywordChecklist | undefined {
    return this.activeProfile?.keywordChecklist;
  }

  get coverageRemainingLabel(): string {
    const profile = this.activeProfile;
    if (!profile) return '';
    const missing = profile.keywordChecklist.missing.length;
    return missing === 0
      ? 'All target keywords covered'
      : `${missing} keyword${missing === 1 ? '' : 's'} still missing`;
  }

  get evidenceRecords(): EvidenceRecord[] {
    return this.activeProfile?.evidence ?? [];
  }

  get focusedEvidence(): EvidenceRecord | undefined {
    if (!this.state.showEvidenceId) return undefined;
    return this.evidenceRecords.find((record) => record.id === this.state.showEvidenceId);
  }

  get historyRecords(): HistoryTableRecord[] {
    const records: HistoryTableRecord[] = [];
    for (const profile of this.state.profiles) {
      for (const entry of profile.history) {
        records.push({
          ...entry,
          profileId: profile.id,
          profileTitle: profile.title,
          persona: profile.preferences.persona,
        });
      }
    }

    return records.sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt));
  }

  get filteredHistory(): HistoryTableRecord[] {
    const { plan, score, search } = this.state.filters.history;
    return this.historyRecords.filter((record) => {
      if (plan !== 'all' && record.planRequired !== plan) return false;
      if (score === '80+' && record.score < 80) return false;
      if (score === '90+' && record.score < 90) return false;
      if (!search) return true;
      const haystack = `${record.profileTitle} ${record.note}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }

  get planLockedProfiles(): ProfileRecord[] {
    if (this.state.plan === 'pro') return [];
    return this.state.profiles.filter((profile, index) => index > 0);
  }

  initLanding(): void {
    if (this.initializedLanding) return;
    this.initializedLanding = true;
    this.syncPersonaFromProfile();
    this.syncSelections();
  }

  initEditor(profileId?: string | null): void {
    if (profileId) {
      this.setActiveProfile(profileId);
    }
    this.syncPersonaFromProfile();
    this.syncSelections();
  }

  initHistory(): void {
    if (this.initializedHistory) return;
    this.initializedHistory = true;
    this.syncPersonaFromProfile();
  }

  initSettings(): void {
    this.syncPersonaFromProfile();
  }

  setPlan(plan: 'free' | 'pro'): void {
    this.state.plan = plan;
    this.showLoaderBriefly();
  }

  setActiveProfile(profileId: string): void {
    if (!profileId || profileId === this.state.activeProfileId) return;
    const profile = this.state.profiles.find((item) => item.id === profileId);
    if (!profile) return;
    this.state.activeProfileId = profileId;
    this.state.toneStack = clone(profile.preferences.tone);
    this.state.persona = profile.preferences.persona;
    this.state.language = profile.preferences.language;
    this.state.emoji = profile.preferences.emoji;
    this.syncSelections();
  }

  selectVariant(type: ArtifactType, variantId: string): void {
    if (!variantId) return;
    this.state.selectedVariants[type] = variantId;
  }

  toggleTone(tone: string): void {
    const hasTone = this.state.toneStack.includes(tone);
    this.state.toneStack = hasTone
      ? this.state.toneStack.filter((value) => value !== tone)
      : [...this.state.toneStack, tone];
    this.syncSelections();
  }

  setPersona(persona: 'first' | 'third'): void {
    if (this.state.persona === persona) return;
    this.state.persona = persona;
    this.syncSelections();
  }

  setLanguage(language: string): void {
    if (this.state.language === language) return;
    this.state.language = language;
    this.syncSelections();
  }

  toggleEmoji(): void {
    this.state.emoji = !this.state.emoji;
  }

  setToneIntensity(axis: keyof ToneIntensity, value: number): void {
    this.state.toneIntensity[axis] = value;
  }

  revealEvidence(id: string | null): void {
    this.state.showEvidenceId = id;
  }

  setHistoryFilter(field: keyof HistoryFilter, value: HistoryFilter[typeof field]): void {
    this.state.filters.history[field] = value as never;
  }

  setHistorySearch(value: string): void {
    this.state.filters.history.search = value;
  }

  renderVariantText(variant: ArtifactVariant | undefined): string {
    if (!variant) return '';
    if (this.state.emoji && variant.emoji) {
      return `${variant.text} ${variant.emoji}`.trim();
    }
    return variant.text;
  }

  variantBadges(variant: ArtifactVariant | undefined): string[] {
    if (!variant) return [];
    const badges = new Set<string>(variant.badges ?? []);
    badges.add(`${variant.chars} chars`);
    badges.add(variant.variant === 'short' ? 'Short' : variant.variant === 'long' ? 'Long' : 'Standard');
    return Array.from(badges);
  }

  isVariantActive(type: ArtifactType, variantId: string): boolean {
    return this.state.selectedVariants[type] === variantId;
  }

  isToneSelected(tone: string): boolean {
    return this.state.toneStack.includes(tone);
  }

  isLanguageActive(language: string): boolean {
    return this.state.language === language;
  }

  isPersonaActive(persona: 'first' | 'third'): boolean {
    return this.state.persona === persona;
  }

  getSelectedVariant(type: ArtifactType): ArtifactVariant | undefined {
    const profile = this.activeProfile;
    if (!profile) return undefined;
    const variantId = this.state.selectedVariants[type];
    const variants = profile.artifacts[type];
    return variants.find((variant) => variant.id === variantId) ?? variants[0];
  }

  private syncPersonaFromProfile(): void {
    const profile = this.activeProfile;
    if (!profile) return;
    this.state.persona = profile.preferences.persona;
    this.state.language = profile.preferences.language;
    this.state.emoji = profile.preferences.emoji;
    this.state.toneStack = clone(profile.preferences.tone);
  }

  private syncSelections(): void {
    const profile = this.activeProfile;
    if (!profile) return;

    for (const type of ['headline', 'about', 'featured'] as ArtifactType[]) {
      const variants = profile.artifacts[type];
      if (!variants.length) continue;

      const preferred = variants.find((variant) => {
        const toneMatch = this.state.toneStack.every((tone) => variant.tone.includes(tone));
        const personaMatch = variant.persona === this.state.persona;
        const languageMatch = variant.language === this.state.language;
        return toneMatch && personaMatch && languageMatch;
      });

      const fallbackTone = variants.find((variant) =>
        this.state.toneStack.every((tone) => variant.tone.includes(tone)) &&
        variant.persona === this.state.persona
      );

      const fallbackPersona = variants.find((variant) => variant.persona === this.state.persona);

      const selected = preferred ?? fallbackTone ?? fallbackPersona ?? variants[0];
      this.state.selectedVariants[type] = selected.id;
    }
  }

  private buildFrontendProfile(): ProfileRecord {
    const headlineVariants: ArtifactVariant[] = [
      {
        id: 'headline-confident',
        type: 'headline',
        label: 'Confident · Data-driven',
        tone: ['confident', 'data-driven', 'professional'],
        persona: 'first',
        language: 'en',
        variant: 'default',
        text:
          'Frontend Engineer • Astro/React • Cut TTFB 38% | Shipping SSR journeys for 2M learners across Vercel + Tailwind',
        chars: 156,
        keywords: ['Astro', 'React', 'Vercel', 'SSR', 'Tailwind', 'Performance'],
        evidenceRefs: ['claim-ttfb', 'claim-students'],
        emoji: '🚀',
        scores: {
          coverage: 0.86,
          readability: 'B2',
          length: 'OK',
          buzzword: 'OK',
          bias: 'OK',
          authenticity: 'verified',
        },
        badges: ['First person'],
      },
      {
        id: 'headline-friendly',
        type: 'headline',
        label: 'Friendly · Storyteller',
        tone: ['friendly', 'storyteller'],
        persona: 'first',
        language: 'en',
        variant: 'short',
        text: 'I build Astro/React experiences that delight 2M learners and keep SSR blazing fast (38% TTFB drop).',
        chars: 148,
        keywords: ['Astro', 'React', 'SSR', 'Performance'],
        evidenceRefs: ['claim-ttfb'],
        emoji: '✨',
        scores: {
          coverage: 0.72,
          readability: 'B1',
          length: 'OK',
          buzzword: 'OK',
          bias: 'OK',
          authenticity: 'verified',
        },
        badges: ['Story-first'],
      },
      {
        id: 'headline-third',
        type: 'headline',
        label: 'Third-person reference',
        tone: ['professional', 'data-driven'],
        persona: 'third',
        language: 'en',
        variant: 'default',
        text:
          'Karthik — Frontend Engineer | Astro/React | Reduced Vercel SSR TTFB 38% · Mentors teams on accessible DX.',
        chars: 149,
        keywords: ['Astro', 'React', 'Vercel', 'SSR', 'Accessibility'],
        evidenceRefs: ['claim-ttfb', 'claim-mentorship'],
        emoji: '🎯',
        scores: {
          coverage: 0.8,
          readability: 'B2',
          length: 'OK',
          buzzword: 'OK',
          bias: 'OK',
          authenticity: 'verified',
        },
        badges: ['Third person'],
      },
    ];

    const aboutVariants: ArtifactVariant[] = [
      {
        id: 'about-story',
        type: 'about',
        label: 'Story + STAR',
        tone: ['storyteller', 'confident', 'data-driven'],
        persona: 'first',
        language: 'en',
        variant: 'long',
        text:
          'I build performant, human-centered learning platforms. At Aurora Analytics, I led the Astro SSR migration that cut TTFB 38% and lifted quiz completions 22%. I partner with product, design, and data to launch features students actually finish. Highlights:\n\n• Led a cross-functional swarm to rework onboarding, boosting quiz completion by 22%.\n• Architected a component library in Tailwind + Storybook, reducing handoff cycles by 40%.\n• Mentored four engineers to promotion-ready ICs by coaching on DX and accessibility.\n• Spoke at Frontend DX Summit about guiding 800 learners through Astro adoption.\n\nI thrive when I can translate complex requirements into measurable outcomes, and I bring the same rigor to inclusive language, evidence-backed claims, and accessible UI.',
        chars: 1082,
        keywords: [
          'Astro',
          'React',
          'Tailwind',
          'Vercel',
          'SSR',
          'Performance',
          'Accessibility',
          'Mentorship',
          'Design Systems',
        ],
        evidenceRefs: ['claim-ttfb', 'claim-students', 'claim-mentorship', 'claim-speaker'],
        emoji: '📚',
        scores: {
          coverage: 0.9,
          readability: 'B2',
          length: 'OK',
          buzzword: 'OK',
          bias: 'OK',
          authenticity: 'verified',
        },
        badges: ['STAR-ready'],
      },
      {
        id: 'about-concise',
        type: 'about',
        label: 'Concise · Metric-forward',
        tone: ['professional', 'data-driven'],
        persona: 'first',
        language: 'en',
        variant: 'short',
        text:
          'Product-focused frontend engineer building Astro/React experiences for scale. Recent wins: reduced TTFB 38% after leading an Astro SSR migration, increased quiz completions 22% by rebuilding onboarding flows, and mentored four engineers through promotion. Obsessed with accessible DX, Tailwind systems, and measurable impact across EdTech.',
        chars: 478,
        keywords: ['Astro', 'React', 'SSR', 'Tailwind', 'Accessibility', 'Mentorship', 'Performance'],
        evidenceRefs: ['claim-ttfb', 'claim-students', 'claim-mentorship'],
        emoji: '✅',
        scores: {
          coverage: 0.78,
          readability: 'B1',
          length: 'OK',
          buzzword: 'OK',
          bias: 'OK',
          authenticity: 'verified',
        },
        badges: ['Concise'],
      },
      {
        id: 'about-arabic',
        type: 'about',
        label: 'Arabic localization',
        tone: ['professional', 'data-driven'],
        persona: 'first',
        language: 'ar',
        variant: 'long',
        text:
          'أطوّر تجارب تعلم سريعة وقابلة للقياس باستخدام Astro وReact. قُدتُ انتقال منصة Aurora Analytics إلى SSR على Vercel مما خفّض وقت الاستجابة بنسبة 38٪ وزاد إكمال الاختبارات بنسبة 22٪. أركّز على لغة شاملة، وأدعم الفريق بتوجيه أربعة مطورين للوصول إلى ترقٍ كامل، وأشارك خبراتي في مؤتمرات تجربة المطور.',
        chars: 244,
        keywords: ['Astro', 'React', 'Vercel', 'SSR', 'Performance'],
        evidenceRefs: ['claim-ttfb', 'claim-students', 'claim-mentorship'],
        emoji: '🌍',
        scores: {
          coverage: 0.64,
          readability: 'B2',
          length: 'OK',
          buzzword: 'OK',
          bias: 'OK',
          authenticity: 'verified',
        },
        badges: ['RTL ready'],
      },
    ];

    const featuredVariants: ArtifactVariant[] = [
      {
        id: 'featured-aurora-case',
        type: 'featured',
        label: 'Aurora Analytics · SSR Rebuild',
        tone: ['confident', 'data-driven'],
        persona: 'first',
        language: 'en',
        variant: 'default',
        text: 'Case study: Astro SSR migration at Aurora Analytics — 38% faster TTFB, 2M learners served. ansiversa.link/aurora-ssr',
        chars: 148,
        keywords: ['Astro', 'SSR', 'Vercel', 'Performance'],
        evidenceRefs: ['claim-ttfb'],
        emoji: '🛰️',
        scores: {
          coverage: 0.62,
          readability: 'B2',
          length: 'OK',
          buzzword: 'OK',
          bias: 'OK',
          authenticity: 'verified',
        },
      },
      {
        id: 'featured-portfolio',
        type: 'featured',
        label: 'Personal portfolio',
        tone: ['storyteller', 'friendly'],
        persona: 'first',
        language: 'en',
        variant: 'default',
        text: 'Portfolio — UI systems, learning tools, and talk recordings. ansiversa.link/karthik',
        chars: 112,
        keywords: ['Design Systems', 'Accessibility'],
        evidenceRefs: ['claim-mentorship', 'claim-speaker'],
        emoji: '🧭',
        scores: {
          coverage: 0.46,
          readability: 'B1',
          length: 'OK',
          buzzword: 'OK',
          bias: 'OK',
          authenticity: 'verified',
        },
      },
      {
        id: 'featured-talk',
        type: 'featured',
        label: 'Frontend DX Summit talk',
        tone: ['storyteller', 'confident'],
        persona: 'first',
        language: 'en',
        variant: 'default',
        text: 'Slide deck: Teaching Astro SSR adoption to 800 learners — Frontend DX Summit 2024. ansiversa.link/astro-talk',
        chars: 143,
        keywords: ['Astro', 'DX'],
        evidenceRefs: ['claim-speaker'],
        emoji: '🎤',
        scores: {
          coverage: 0.32,
          readability: 'B1',
          length: 'OK',
          buzzword: 'OK',
          bias: 'OK',
          authenticity: 'verified',
        },
      },
    ];

    const profile: ProfileRecord = {
      id: 'profile-frontend-dubai',
      title: 'Frontend Engineer · Astro/React · Dubai/UAE',
      user: {
        name: 'Karthik',
        headline: 'Product-focused frontend engineer',
        location: 'Dubai, UAE',
      },
      targets: {
        roles: ['Frontend Engineer', 'Web Performance Lead'],
        industries: ['EdTech', 'SaaS'],
        location: 'Dubai / Remote',
        keywords: [
          'Astro',
          'React',
          'Tailwind',
          'Vercel',
          'SSR',
          'Performance',
          'Accessibility',
          'Mentorship',
          'Design Systems',
          'DX',
        ],
        seniority: 'Mid-Senior',
        remote: 'Hybrid friendly · 1 onsite per quarter',
        visa: ['UAE Work Visa'],
      },
      preferences: {
        tone: ['confident', 'data-driven'],
        persona: 'first',
        language: 'en',
        emoji: false,
      },
      resume: {
        summary:
          'Product-focused frontend engineer shipping measurable impact across learning and analytics platforms.',
        highlights: [
          'Cut TTFB 38% during Astro SSR migration on Vercel.',
          'Increased quiz completion 22% by redesigning onboarding flows.',
          'Mentored four engineers to promotion through DX coaching.',
        ],
        experience: [
          {
            company: 'Aurora Analytics',
            title: 'Senior Frontend Engineer',
            impact: [
              'Increased quiz completion rate 22% by rebuilding the onboarding funnel with experiment guardrails.',
              'Reduced time-to-first-byte 38% migrating marketing suite to Astro SSR on Vercel with edge caching.',
              'Mentored four engineers to promotion-ready levels via weekly DX reviews and pairing.',
            ],
          },
          {
            company: 'Brightwave Learning',
            title: 'Frontend Engineer',
            impact: ['Spoke at Frontend DX Summit on Astro adoption for 800 attendees.'],
          },
        ],
      },
      keywordChecklist: {
        covered: ['Astro', 'React', 'Tailwind', 'Vercel', 'SSR', 'Performance', 'Accessibility', 'Mentorship'],
        partial: ['Design Systems'],
        missing: ['DX'],
        suggested: ['TypeScript', 'Storybook', 'GraphQL'],
      },
      artifacts: {
        headline: headlineVariants,
        about: aboutVariants,
        featured: featuredVariants,
      },
      evidence: [
        {
          id: 'claim-students',
          claim: 'Lifted quiz completion 22% by rebuilding onboarding flows.',
          source: 'resume.experience[0].impact[0]',
          excerpt: 'Redesigned onboarding with guided experiments that lifted completion 22% across 2M learners.',
        },
        {
          id: 'claim-ttfb',
          claim: 'Cut TTFB 38% after leading an Astro SSR migration on Vercel.',
          source: 'resume.experience[0].impact[1]',
          excerpt: 'Owned architecture and caching for Astro SSR rollout, reducing time-to-first-byte by 38%.',
        },
        {
          id: 'claim-mentorship',
          claim: 'Mentored four engineers to promotion-ready ICs.',
          source: 'resume.experience[0].impact[2]',
          excerpt: 'Ran weekly DX guilds and pair sessions resulting in four engineers reaching promotion checkpoints.',
        },
        {
          id: 'claim-speaker',
          claim: 'Spoke at Frontend DX Summit about Astro adoption.',
          source: 'resume.experience[1].impact[0]',
          excerpt: 'Delivered a 30-minute session guiding 800 attendees through SSR migration lessons.',
        },
      ],
      history: [
        {
          id: 'hist-2024-06-15',
          savedAt: '2024-06-15T08:40:00Z',
          score: 88,
          keywordsCovered: 8,
          exported: ['md'],
          planRequired: 'free',
          note: 'Imported from Resume Builder JSON.',
        },
        {
          id: 'hist-2024-07-02',
          savedAt: '2024-07-02T17:05:00Z',
          score: 92,
          keywordsCovered: 9,
          exported: ['md', 'pdf'],
          planRequired: 'pro',
          note: 'Advanced linting (bias + authenticity) run.',
        },
      ],
      integrations: {
        resumeBuilder: 'Push verified bullets into Resume Builder with evidence references intact.',
        coverLetter: 'Send the winning tone directly to Cover Letter Writer focus sections.',
        portfolioCreator: 'Attach Featured cards to Portfolio Creator modules in one click.',
      },
    };

    return profile;
  }

  private buildProductProfile(): ProfileRecord {
    const headlineVariants: ArtifactVariant[] = [
      {
        id: 'headline-product-pro',
        type: 'headline',
        label: 'Pro persona',
        tone: ['professional', 'confident'],
        persona: 'third',
        language: 'en',
        variant: 'default',
        text:
          'Priya · Product Operations Leader | Scaled GTM ops to $48M ARR | Built visa-friendly remote playbooks',
        chars: 144,
        keywords: ['Product Operations', 'GTM', 'ARR', 'Remote'],
        evidenceRefs: ['claim-pro-ops-growth', 'claim-pro-ops-playbook'],
        emoji: '📈',
        scores: {
          coverage: 0.82,
          readability: 'B2',
          length: 'OK',
          buzzword: 'OK',
          bias: 'OK',
          authenticity: 'verified',
        },
      },
      {
        id: 'headline-product-friendly',
        type: 'headline',
        label: 'Friendly voice',
        tone: ['friendly', 'storyteller'],
        persona: 'first',
        language: 'en',
        variant: 'short',
        text: 'I help product ops teams scale GTM rhythms — $48M ARR, 12-country remote rollout, visa-safe hiring.',
        chars: 137,
        keywords: ['Product Operations', 'GTM', 'ARR', 'Remote'],
        evidenceRefs: ['claim-pro-ops-growth'],
        emoji: '🌍',
        scores: {
          coverage: 0.74,
          readability: 'B1',
          length: 'OK',
          buzzword: 'OK',
          bias: 'OK',
          authenticity: 'verified',
        },
      },
    ];

    const aboutVariants: ArtifactVariant[] = [
      {
        id: 'about-product-default',
        type: 'about',
        label: 'Ops narrative',
        tone: ['professional', 'storyteller'],
        persona: 'third',
        language: 'en',
        variant: 'long',
        text:
          'Priya builds product operations systems that unlock revenue and retention. She scaled GTM cadences across 12 countries, enabling $48M ARR in two years, and codified visa-friendly remote hiring playbooks adopted across three business units. Priya partners with RevOps, Legal, and People to keep launches audit-ready, and her Featured section spotlights the async hub, ops KPI dashboard, and go-to-market retro template used across the org.',
        chars: 522,
        keywords: ['Product Operations', 'GTM', 'ARR', 'Remote', 'Visa'],
        evidenceRefs: ['claim-pro-ops-growth', 'claim-pro-ops-playbook'],
        emoji: '🧭',
        scores: {
          coverage: 0.76,
          readability: 'B2',
          length: 'OK',
          buzzword: 'OK',
          bias: 'OK',
          authenticity: 'verified',
        },
      },
      {
        id: 'about-product-spanish',
        type: 'about',
        label: 'Spanish localization',
        tone: ['professional'],
        persona: 'third',
        language: 'es',
        variant: 'short',
        text:
          'Priya lidera operaciones de producto que sostienen $48M en ARR. Implementó playbooks remotos con cumplimiento de visados y coordina lanzamientos GTM en 12 países con métricas auditables.',
        chars: 219,
        keywords: ['Product Operations', 'ARR', 'Remote', 'Visa'],
        evidenceRefs: ['claim-pro-ops-growth', 'claim-pro-ops-playbook'],
        emoji: '🧾',
        scores: {
          coverage: 0.6,
          readability: 'B2',
          length: 'OK',
          buzzword: 'OK',
          bias: 'OK',
          authenticity: 'verified',
        },
      },
    ];

    const featuredVariants: ArtifactVariant[] = [
      {
        id: 'featured-product-hub',
        type: 'featured',
        label: 'Async operations hub',
        tone: ['professional'],
        persona: 'third',
        language: 'en',
        variant: 'default',
        text: 'Async launch hub — standardized GTM workflows across 12 countries. ansiversa.link/ops-hub',
        chars: 121,
        keywords: ['GTM', 'Remote'],
        evidenceRefs: ['claim-pro-ops-growth'],
        emoji: '🗂️',
        scores: {
          coverage: 0.48,
          readability: 'B1',
          length: 'OK',
          buzzword: 'OK',
          bias: 'OK',
          authenticity: 'verified',
        },
      },
      {
        id: 'featured-product-dashboard',
        type: 'featured',
        label: 'Ops KPI dashboard',
        tone: ['data-driven'],
        persona: 'third',
        language: 'en',
        variant: 'default',
        text: 'Dashboard — GTM cadence metrics, launch ROI, and team health. ansiversa.link/ops-dashboard',
        chars: 119,
        keywords: ['GTM', 'ARR'],
        evidenceRefs: ['claim-pro-ops-growth'],
        emoji: '📊',
        scores: {
          coverage: 0.44,
          readability: 'B1',
          length: 'OK',
          buzzword: 'OK',
          bias: 'OK',
          authenticity: 'verified',
        },
      },
      {
        id: 'featured-product-playbook',
        type: 'featured',
        label: 'Visa-safe remote playbook',
        tone: ['professional'],
        persona: 'third',
        language: 'en',
        variant: 'default',
        text: 'Remote hiring playbook — visa compliance templates + onboarding rituals. ansiversa.link/remote-playbook',
        chars: 134,
        keywords: ['Remote', 'Visa'],
        evidenceRefs: ['claim-pro-ops-playbook'],
        emoji: '🛂',
        scores: {
          coverage: 0.46,
          readability: 'B1',
          length: 'OK',
          buzzword: 'OK',
          bias: 'OK',
          authenticity: 'verified',
        },
      },
    ];

    const profile: ProfileRecord = {
      id: 'profile-product-ops',
      title: 'Product Operations Leader · Remote / Visa-friendly',
      user: {
        name: 'Priya',
        headline: 'Product & revenue operations leader',
        location: 'Remote · Global',
      },
      targets: {
        roles: ['Product Operations Lead', 'Director of GTM Operations'],
        industries: ['SaaS', 'B2B'],
        location: 'Global remote',
        keywords: ['Product Operations', 'GTM', 'ARR', 'Remote', 'Visa'],
        seniority: 'Director',
        remote: 'Fully remote · Async-first',
        visa: ['Open to global talent'],
      },
      preferences: {
        tone: ['professional', 'confident'],
        persona: 'third',
        language: 'en',
        emoji: true,
      },
      resume: {
        summary:
          'Product operations leader scaling GTM systems, compliance, and async collaboration across global teams.',
        highlights: [
          'Scaled GTM operations to $48M ARR.',
          'Created visa-compliant remote playbooks for 12 countries.',
        ],
        experience: [
          {
            company: 'Northstar Platforms',
            title: 'Head of Product Operations',
            impact: [
              'Scaled GTM revenue from $12M to $48M ARR via cadence governance.',
              'Codified visa-safe remote hiring playbooks adopted across 3 BUs.',
            ],
          },
        ],
      },
      keywordChecklist: {
        covered: ['Product Operations', 'GTM', 'ARR', 'Remote'],
        partial: ['Visa'],
        missing: [],
        suggested: ['Enablement', 'RevOps'],
      },
      artifacts: {
        headline: headlineVariants,
        about: aboutVariants,
        featured: featuredVariants,
      },
      evidence: [
        {
          id: 'claim-pro-ops-growth',
          claim: 'Scaled GTM operations to $48M ARR across 12 countries.',
          source: 'resume.experience[0].impact[0]',
          excerpt: 'Built the GTM cadence and KPI reviews underpinning revenue scale to $48M ARR.',
        },
        {
          id: 'claim-pro-ops-playbook',
          claim: 'Codified visa-safe remote hiring playbooks.',
          source: 'resume.experience[0].impact[1]',
          excerpt: 'Published compliance-ready playbooks enabling legal onboarding across 12 countries.',
        },
      ],
      history: [
        {
          id: 'hist-2024-05-20',
          savedAt: '2024-05-20T10:00:00Z',
          score: 85,
          keywordsCovered: 4,
          exported: ['md'],
          planRequired: 'pro',
          note: 'Persona switch to third-person for leadership roles.',
        },
        {
          id: 'hist-2024-07-01',
          savedAt: '2024-07-01T19:15:00Z',
          score: 91,
          keywordsCovered: 5,
          exported: ['md', 'pdf'],
          planRequired: 'pro',
          note: 'Localization pack generated (EN + ES).',
        },
      ],
      integrations: {
        resumeBuilder: 'Sync leadership bullets with Resume Builder’s executive template.',
        coverLetter: 'Preload tone-matched intros for Cover Letter Writer.',
        portfolioCreator: 'Attach Featured cards to the remote operations portfolio deck.',
      },
    };

    return profile;
  }
}

Alpine.store('linkedinBio', new LinkedInBioStore());

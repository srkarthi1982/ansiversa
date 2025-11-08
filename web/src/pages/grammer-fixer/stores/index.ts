import Alpine from 'alpinejs';
import { BaseStore } from '../../../alpineStores/base';
import {
  MODES,
  RULE_PACKS,
  DIALECTS,
  STYLE_GUIDES,
  READABILITY_TARGETS,
  PLAN_GATING_ROWS,
  HANDOFF_DESTINATIONS,
  WORKSPACE_ROUTES,
  BATCH_PLAYBOOKS,
  PRIVACY_FEATURES,
  type GrammarMode,
  type GrammarRulePack,
  type GrammarDialect,
  type GrammarStyleGuide,
  type ReadabilityTarget,
} from '../data/constants';

type Severity = 'info' | 'warn' | 'error';
type SuggestionStatus = 'open' | 'applied' | 'dismissed';

type Suggestion = {
  id: string;
  ruleId: string;
  packId: GrammarRulePack;
  severity: Severity;
  title: string;
  description: string;
  explanation: string;
  before: string;
  after: string;
  autoFixable: boolean;
  status: SuggestionStatus;
  teachReference?: string;
  apply?: (input: string) => string;
};

type GlossaryEntry = {
  term: string;
  replacement: string;
  locked: boolean;
  note?: string;
  caseSensitive: boolean;
};

type Metrics = {
  words: number;
  sentences: number;
  syllables: number;
  readingTimeMinutes: number;
  grade: number;
  readingEase: number;
  targetGrade: number;
  targetLabel: string;
  gradeStatus: 'within' | 'above' | 'below';
  severityCounts: Record<Severity, number>;
};

type Filters = {
  severity: 'all' | Severity;
  packId: 'all' | GrammarRulePack;
  status: 'open' | 'all';
  autoFixOnly: boolean;
};

type RuleToggle = {
  id: GrammarRulePack;
  enabled: boolean;
};

type WorkspaceState = {
  plan: 'free' | 'pro';
  mode: GrammarMode;
  dialect: GrammarDialect;
  styleGuide: GrammarStyleGuide;
  readabilityTarget: ReadabilityTarget;
  inclusiveLanguage: boolean;
  piiMasking: boolean;
  autoApplyMode: 'safe' | 'extended';
  input: string;
  outputPreview: string;
  suggestions: Suggestion[];
  filters: Filters;
  ruleToggles: RuleToggle[];
  metrics: Metrics;
  recommendations: string[];
  lastAnalyzedAt: string | null;
  running: boolean;
  selectedSuggestionId: string | null;
  toast: { message: string; type: 'success' | 'error' } | null;
  glossary: {
    entries: GlossaryEntry[];
    newTerm: string;
    newReplacement: string;
    caseSensitive: boolean;
  };
};

type AnalysisConfig = {
  dialect: GrammarDialect;
  styleGuide: GrammarStyleGuide;
  mode: GrammarMode;
  inclusiveLanguage: boolean;
  enabledRulePacks: Set<GrammarRulePack>;
};

const readabilityTargets: Record<ReadabilityTarget, number> = {
  'grade-6': 6,
  'grade-8': 8,
  'grade-10': 10,
  college: 14,
};

let suggestionCounter = 0;

const createSuggestionId = () => `suggestion-${++suggestionCounter}`;

const countWords = (text: string) => {
  const matches = text.match(/[^\s]+/g);
  return matches ? matches.length : 0;
};

const countSentences = (text: string) => {
  const matches = text.split(/[.!?]+[\s\n]*/).filter((sentence) => sentence.trim().length > 0);
  return matches.length || 1;
};

const countSyllables = (word: string) => {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!cleaned) return 0;
  if (cleaned.length <= 3) return 1;
  const syllableRegex = /([aeiouy]{1,2})/g;
  const matches = cleaned.replace(/e$/g, '').match(syllableRegex);
  return matches ? matches.length : 1;
};

const computeSyllables = (text: string) =>
  text
    .split(/[^a-zA-Z']+/)
    .filter(Boolean)
    .reduce((total, word) => total + countSyllables(word), 0);

const toTitleCase = (value: string) =>
  value
    .split(' ')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

class GrammarStore extends BaseStore {
  state: WorkspaceState;

  readonly modes = MODES;
  readonly rulePacks = RULE_PACKS;
  readonly dialects = DIALECTS;
  readonly styleGuides = STYLE_GUIDES;
  readonly readabilityTargets = READABILITY_TARGETS;
  readonly planRows = PLAN_GATING_ROWS;
  readonly handoffDestinations = HANDOFF_DESTINATIONS;
  readonly routes = WORKSPACE_ROUTES;
  readonly batchPlaybooks = BATCH_PLAYBOOKS;
  readonly privacyFeatures = PRIVACY_FEATURES;

  constructor() {
    super();
    const defaultInput =
      "Hi team,\n\nWe was planning the launch but there is too many moving parts. The colour options havent been finalized and our legal review was completed by Friday but no update were shared. Please revert back to me guys so we can utilize the findings.\n\nThanks,\nAlex";

    this.state = {
      plan: 'free',
      mode: 'teach',
      dialect: 'en-us',
      styleGuide: 'business',
      readabilityTarget: 'grade-8',
      inclusiveLanguage: true,
      piiMasking: false,
      autoApplyMode: 'safe',
      input: defaultInput,
      outputPreview: defaultInput,
      suggestions: [],
      filters: {
        severity: 'all',
        packId: 'all',
        status: 'open',
        autoFixOnly: false,
      },
      ruleToggles: RULE_PACKS.map((pack) => ({ id: pack.id, enabled: pack.defaultEnabled })),
      metrics: {
        words: 0,
        sentences: 0,
        syllables: 0,
        readingTimeMinutes: 0,
        grade: 0,
        readingEase: 0,
        targetGrade: readabilityTargets['grade-8'],
        targetLabel: 'Grade 8 (balanced)',
        gradeStatus: 'within',
        severityCounts: { info: 0, warn: 0, error: 0 },
      },
      recommendations: [],
      lastAnalyzedAt: null,
      running: false,
      selectedSuggestionId: null,
      toast: null,
      glossary: {
        entries: [
          {
            term: 'Ansiversa',
            replacement: 'Ansiversa',
            locked: true,
            note: 'Product name must stay capitalized',
            caseSensitive: true,
          },
          {
            term: 'LaunchPad',
            replacement: 'LaunchPad',
            locked: true,
            note: 'Trademarked product line',
            caseSensitive: true,
          },
        ],
        newTerm: '',
        newReplacement: '',
        caseSensitive: true,
      },
    };
  }

  init() {
    this.analyze();
  }

  get filteredSuggestions() {
    const { suggestions, filters } = this.state;
    return suggestions.filter((suggestion) => {
      if (filters.status === 'open' && suggestion.status !== 'open') return false;
      if (filters.autoFixOnly && !suggestion.autoFixable) return false;
      if (filters.severity !== 'all' && suggestion.severity !== filters.severity) return false;
      if (filters.packId !== 'all' && suggestion.packId !== filters.packId) return false;
      return true;
    });
  }

  get issueSummary() {
    const { severityCounts } = this.state.metrics;
    const total = severityCounts.error + severityCounts.warn + severityCounts.info;
    return { total, ...severityCounts };
  }

  setMode(mode: GrammarMode) {
    this.state.mode = mode;
    if (mode === 'auto' && this.state.autoApplyMode === 'extended' && this.state.plan === 'free') {
      this.state.autoApplyMode = 'safe';
    }
    this.analyze();
  }

  setDialect(dialect: GrammarDialect) {
    this.state.dialect = dialect;
    this.analyze();
  }

  setStyle(styleGuide: GrammarStyleGuide) {
    this.state.styleGuide = styleGuide;
    this.analyze();
  }

  setReadabilityTarget(target: ReadabilityTarget) {
    this.state.readabilityTarget = target;
    this.analyze();
  }

  toggleInclusiveLanguage() {
    this.state.inclusiveLanguage = !this.state.inclusiveLanguage;
    this.analyze();
  }

  togglePiiMasking() {
    this.state.piiMasking = !this.state.piiMasking;
  }

  toggleRulePack(id: GrammarRulePack) {
    const toggle = this.state.ruleToggles.find((item) => item.id === id);
    if (toggle) {
      toggle.enabled = !toggle.enabled;
      this.analyze();
    }
  }

  setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    this.state.filters[key] = value as Filters[K];
  }

  focusSuggestion(id: string | null) {
    this.state.selectedSuggestionId = id;
  }

  applySuggestion(id: string) {
    const suggestion = this.state.suggestions.find((item) => item.id === id);
    if (!suggestion || !suggestion.autoFixable || suggestion.status !== 'open') return;
    this.state.input = suggestion.apply ? suggestion.apply(this.state.input) : this.state.input;
    suggestion.status = 'applied';
    this.buildOutputPreview();
    this.updateMetrics();
    this.state.toast = { message: `Applied ${toTitleCase(suggestion.packId)} fix`, type: 'success' };
  }

  applyAllSafe() {
    const autoFixable = this.state.suggestions.filter((suggestion) => suggestion.autoFixable && suggestion.status === 'open');
    if (!autoFixable.length) {
      this.state.toast = { message: 'No auto-fixable suggestions remaining.', type: 'error' };
      return;
    }
    let text = this.state.input;
    autoFixable.forEach((suggestion) => {
      text = suggestion.apply ? suggestion.apply(text) : text;
      suggestion.status = 'applied';
    });
    this.state.input = text;
    this.buildOutputPreview();
    this.updateMetrics();
    this.state.toast = { message: `Applied ${autoFixable.length} safe fixes.`, type: 'success' };
  }

  dismissSuggestion(id: string) {
    const suggestion = this.state.suggestions.find((item) => item.id === id);
    if (!suggestion || suggestion.status !== 'open') return;
    suggestion.status = 'dismissed';
    this.updateMetrics();
  }

  restoreSuggestion(id: string) {
    const suggestion = this.state.suggestions.find((item) => item.id === id);
    if (!suggestion || suggestion.status !== 'dismissed') return;
    suggestion.status = 'open';
    this.updateMetrics();
  }

  addGlossaryEntry() {
    const term = this.state.glossary.newTerm.trim();
    const replacement = this.state.glossary.newReplacement.trim() || term;
    if (!term) return;
    this.state.glossary.entries.unshift({
      term,
      replacement,
      locked: true,
      note: 'New glossary entry',
      caseSensitive: this.state.glossary.caseSensitive,
    });
    this.state.glossary.newTerm = '';
    this.state.glossary.newReplacement = '';
    this.state.toast = { message: `Added glossary lock for “${term}”`, type: 'success' };
  }

  toggleGlossaryLock(index: number) {
    const entry = this.state.glossary.entries[index];
    if (!entry) return;
    entry.locked = !entry.locked;
  }

  removeGlossaryEntry(index: number) {
    if (index < 0 || index >= this.state.glossary.entries.length) return;
    const [removed] = this.state.glossary.entries.splice(index, 1);
    if (removed) {
      this.state.toast = { message: `Removed glossary entry “${removed.term}”`, type: 'success' };
    }
  }

  clearToast() {
    this.state.toast = null;
  }

  setPlan(plan: 'free' | 'pro') {
    this.state.plan = plan;
    if (plan === 'free' && this.state.autoApplyMode === 'extended') {
      this.state.autoApplyMode = 'safe';
    }
  }

  setAutoApplyMode(mode: 'safe' | 'extended') {
    if (mode === 'extended' && this.state.plan === 'free') {
      this.state.toast = { message: 'Extended auto-apply is a Pro feature.', type: 'error' };
      return;
    }
    this.state.autoApplyMode = mode;
    this.buildOutputPreview();
  }

  analyze() {
    const config = this.getAnalysisConfig();
    const text = this.state.input;
    this.state.running = true;
    const schedule =
      typeof requestAnimationFrame === 'function'
        ? requestAnimationFrame
        : (callback: (time: number) => void) => setTimeout(() => callback(Date.now()), 16);
    schedule(() => {
      this.state.suggestions = this.generateSuggestions(text, config);
      this.buildOutputPreview();
      this.updateMetrics();
      this.state.running = false;
      this.state.lastAnalyzedAt = new Date().toISOString();
      this.focusSuggestion(this.state.suggestions[0]?.id ?? null);
    });
  }

  private getAnalysisConfig(): AnalysisConfig {
    const enabledRulePacks = new Set(
      this.state.ruleToggles.filter((toggle) => toggle.enabled).map((toggle) => toggle.id)
    );
    return {
      dialect: this.state.dialect,
      styleGuide: this.state.styleGuide,
      mode: this.state.mode,
      inclusiveLanguage: this.state.inclusiveLanguage,
      enabledRulePacks,
    };
  }

  private buildOutputPreview() {
    const baseText = this.state.input;
    if (this.state.mode === 'check') {
      this.state.outputPreview = baseText;
      return;
    }
    const autoApply = this.state.suggestions.filter((suggestion) => {
      if (suggestion.status !== 'open') return false;
      if (!suggestion.autoFixable) return false;
      if (this.state.autoApplyMode === 'safe') {
        return suggestion.severity !== 'error';
      }
      return true;
    });
    let preview = baseText;
    autoApply.forEach((suggestion) => {
      preview = suggestion.apply ? suggestion.apply(preview) : preview;
    });
    this.state.outputPreview = preview;
  }

  private updateMetrics() {
    const text = this.state.input;
    const words = countWords(text);
    const sentences = countSentences(text);
    const syllables = computeSyllables(text);
    const grade = this.calculateFleschKincaid(words, sentences, syllables);
    const readingEase = this.calculateFleschReadingEase(words, sentences, syllables);
    const readingTimeMinutes = Math.max(1, Math.round(words / 200));
    const targetGrade = readabilityTargets[this.state.readabilityTarget];
    const targetLabel = this.readabilityTargets.find((target) => target.value === this.state.readabilityTarget)?.label ?? '';
    const gradeStatus: Metrics['gradeStatus'] = grade <= targetGrade + 0.5 ? 'within' : 'above';

    const severityCounts: Record<Severity, number> = { info: 0, warn: 0, error: 0 };
    this.state.suggestions.forEach((suggestion) => {
      if (suggestion.status === 'open') {
        severityCounts[suggestion.severity] += 1;
      }
    });

    this.state.metrics = {
      words,
      sentences,
      syllables,
      readingTimeMinutes,
      grade,
      readingEase,
      targetGrade,
      targetLabel,
      gradeStatus,
      severityCounts,
    };

    const recommendations: string[] = [];
    if (gradeStatus === 'above') {
      recommendations.push(
        `Current readability grade ${grade.toFixed(1)} is above the target of ${targetLabel}. Consider splitting long sentences or simplifying vocabulary.`
      );
    } else if (grade <= Math.max(4, targetGrade - 2)) {
      recommendations.push(
        `Readability grade ${grade.toFixed(1)} is below ${targetLabel}. You can add context or technical detail without harming clarity.`
      );
    }

    if (severityCounts.error > 0) {
      recommendations.push('Resolve all red “Error” issues before exporting to keep the diff clean.');
    }

    const avgSentenceLength = sentences ? Math.round(words / sentences) : words;
    if (avgSentenceLength > 22) {
      recommendations.push('Average sentence length exceeds 22 words. Split long sentences or bulletize steps.');
    }

    if (this.state.inclusiveLanguage) {
      const inclusiveIssues = this.state.suggestions.filter(
        (suggestion) => suggestion.packId === 'inclusive' && suggestion.status === 'open'
      );
      if (inclusiveIssues.length) {
        recommendations.push('Inclusive language issues detected. Review suggested alternatives to keep tone welcoming.');
      }
    }

    this.state.recommendations = recommendations;
  }

  private calculateFleschKincaid(words: number, sentences: number, syllables: number) {
    if (!words || !sentences) return 0;
    const grade = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
    return Number.isFinite(grade) ? Number(grade.toFixed(1)) : 0;
  }

  private calculateFleschReadingEase(words: number, sentences: number, syllables: number) {
    if (!words || !sentences) return 0;
    const ease = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
    return Number.isFinite(ease) ? Number(ease.toFixed(1)) : 0;
  }

  private generateSuggestions(text: string, config: AnalysisConfig): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const lower = text.toLowerCase();

    const addSuggestion = (suggestion: Suggestion) => {
      if (!config.enabledRulePacks.has(suggestion.packId)) return;
      suggestions.push(suggestion);
    };

    const create = (values: Omit<Suggestion, 'id' | 'status'> & { status?: SuggestionStatus }): Suggestion => ({
      id: createSuggestionId(),
      status: values.status ?? 'open',
      ...values,
    });

    if (/ {2,}/.test(text)) {
      addSuggestion(
        create({
          ruleId: 'formatting.double-space',
          packId: 'formatting',
          severity: 'info',
          title: 'Remove extra spaces',
          description: 'Replace double spaces with a single space to keep spacing consistent.',
          explanation: 'Most style guides prefer a single space between words and sentences for clean formatting.',
          before: '  ',
          after: ' ',
          autoFixable: true,
          apply: (input) => input.replace(/ {2,}/g, ' '),
        })
      );
    }

    if (config.dialect === 'en-us' && /colour/.test(lower)) {
      addSuggestion(
        create({
          ruleId: 'spelling.colour',
          packId: 'spelling',
          severity: 'warn',
          title: 'Use “color” for EN-US',
          description: 'Switch to the US spelling “color” to match the selected dialect.',
          explanation: 'Dialects influence spelling. US business copy expects “color” rather than “colour.”',
          before: 'colour',
          after: 'color',
          autoFixable: true,
          apply: (input) => input.replace(/colour/gi, (match) => (match === 'Colour' ? 'Color' : 'color')),
        })
      );
    }

    if (config.dialect === 'en-us' && /organise/.test(lower)) {
      addSuggestion(
        create({
          ruleId: 'spelling.organize',
          packId: 'spelling',
          severity: 'warn',
          title: 'Use “organize” for EN-US',
          description: 'Convert “organise” to “organize” to stay consistent with US spelling.',
          explanation: 'Locale alignment improves professionalism when exporting to clients in specific regions.',
          before: 'organise',
          after: 'organize',
          autoFixable: true,
          apply: (input) => input.replace(/organise/gi, (match) => (match === 'Organise' ? 'Organize' : 'organize')),
        })
      );
    }

    if (/\b(we|they) was\b/i.test(text)) {
      addSuggestion(
        create({
          ruleId: 'grammar.subject-verb-agreement',
          packId: 'grammar',
          severity: 'error',
          title: 'Fix subject-verb agreement',
          description: 'Change “was” to “were” when the subject is plural.',
          explanation:
            'Plural subjects like “we” or “they” require the plural verb “were.” Mismatched agreement can confuse readers.',
          before: 'was',
          after: 'were',
          autoFixable: true,
          apply: (input) => input.replace(/\b(we|they) was\b/gi, (match) => match.replace(/was/i, 'were')),
        })
      );
    }

    if (/\bthere is (too many|many|several)\b/i.test(text)) {
      addSuggestion(
        create({
          ruleId: 'grammar.there-are',
          packId: 'grammar',
          severity: 'error',
          title: 'Use plural verb with plural noun',
          description: 'Replace “there is” with “there are” when referring to plural nouns.',
          explanation: 'Plural nouns like “many moving parts” need the plural verb “are” to stay grammatically correct.',
          before: 'there is',
          after: 'there are',
          autoFixable: true,
          apply: (input) => input.replace(/\bthere is (too many|many|several)\b/gi, (match, group) => `there are ${group}`),
        })
      );
    }

    if (/\bhavent\b/i.test(lower)) {
      addSuggestion(
        create({
          ruleId: 'spelling.apostrophes',
          packId: 'spelling',
          severity: 'warn',
          title: 'Add apostrophe to contraction',
          description: 'Insert the missing apostrophe in “haven’t.”',
          explanation: 'Contractions require apostrophes to mark omitted letters. Without them, spelling checkers flag errors.',
          before: 'havent',
          after: "haven't",
          autoFixable: true,
          apply: (input) => input.replace(/havent/gi, (match) => (match === 'Havent' ? "Haven't" : "haven't")),
        })
      );
    }

    const passiveMatch = text.match(/\bwas [a-z]+ed\b/i);
    if (passiveMatch) {
      addSuggestion(
        create({
          ruleId: 'clarity.passive-voice',
          packId: 'clarity',
          severity: 'warn',
          title: 'Rephrase passive voice',
          description: 'Consider rewriting passive constructions to highlight the actor.',
          explanation:
            'Passive voice hides the responsible party. Rewrite as “Legal reviewed the contract on Friday” for clarity.',
          before: passiveMatch[0],
          after: 'Legal reviewed the contract on Friday',
          autoFixable: false,
          teachReference: 'Chicago Manual of Style 5.115',
        })
      );
    }

    if (config.inclusiveLanguage && /\bguys\b/i.test(text)) {
      addSuggestion(
        create({
          ruleId: 'inclusive.gender-neutral',
          packId: 'inclusive',
          severity: 'warn',
          title: 'Use inclusive alternative to “guys”',
          description: 'Swap “guys” for neutral options like “everyone” or “team.”',
          explanation: 'Inclusive language keeps communications welcoming and professional across audiences.',
          before: 'guys',
          after: 'everyone',
          autoFixable: true,
          apply: (input) => input.replace(/\bguys\b/gi, (match) => (match[0] === 'G' ? 'Everyone' : 'everyone')),
        })
      );
    }

    if (/revert back/i.test(text)) {
      addSuggestion(
        create({
          ruleId: 'style.redundancy',
          packId: 'style',
          severity: 'info',
          title: 'Trim redundant phrase “revert back”',
          description: 'Use “revert” or “reply” — “back” is implied.',
          explanation: 'Redundant expressions slow down readers. Tight phrasing improves clarity in business updates.',
          before: 'revert back',
          after: 'reply',
          autoFixable: true,
          apply: (input) => input.replace(/revert back/gi, (match) => (match[0] === 'R' ? 'Reply' : 'reply')),
        })
      );
    }

    if (/utilize/i.test(text)) {
      addSuggestion(
        create({
          ruleId: 'clarity.wordy',
          packId: 'clarity',
          severity: 'info',
          title: 'Swap “utilize” for “use”',
          description: 'Simplify vocabulary to keep readability on target.',
          explanation: 'Replacing heavy words with simpler alternatives boosts comprehension without losing meaning.',
          before: 'utilize',
          after: 'use',
          autoFixable: true,
          apply: (input) => input.replace(/utilize/gi, (match) => (match[0] === 'U' ? 'Use' : 'use')),
        })
      );
    }

    if (/\b(should of|could of|would of)\b/i.test(text)) {
      addSuggestion(
        create({
          ruleId: 'grammar.modal-have',
          packId: 'grammar',
          severity: 'error',
          title: 'Use “have” after modal verbs',
          description: 'Replace “should of” with “should have.”',
          explanation: 'Modal verbs pair with “have,” not “of.” Correcting this prevents major grammar flags.',
          before: 'should of',
          after: 'should have',
          autoFixable: true,
          apply: (input) => input.replace(/\b(should|could|would) of\b/gi, (match, modal) => `${modal} have`),
        })
      );
    }

    if (/\bteh\b/i.test(lower)) {
      addSuggestion(
        create({
          ruleId: 'spelling.common-typo',
          packId: 'spelling',
          severity: 'error',
          title: 'Fix typo “teh”',
          description: 'Correct the typo “teh” to “the.”',
          explanation: 'Quick typo fixes maintain polish before export.',
          before: 'teh',
          after: 'the',
          autoFixable: true,
          apply: (input) => input.replace(/teh/gi, (match) => (match === 'Teh' ? 'The' : 'the')),
        })
      );
    }

    if (config.styleGuide === 'academic' && /\b(can't|won't|don't)\b/i.test(text)) {
      addSuggestion(
        create({
          ruleId: 'style.academic-contractions',
          packId: 'style',
          severity: 'warn',
          title: 'Expand contractions for academic voice',
          description: 'Expand contractions such as “can’t” to “cannot.”',
          explanation: 'Academic registers avoid contractions to maintain formality. Expanding them keeps tone consistent.',
          before: "can't",
          after: 'cannot',
          autoFixable: false,
          teachReference: 'APA 7, Section 4.7',
        })
      );
    }

    const longSentenceMatch = text.match(/[^.!?]{25,}[.!?]/);
    if (longSentenceMatch && config.enabledRulePacks.has('clarity')) {
      addSuggestion(
        create({
          ruleId: 'clarity.split-sentence',
          packId: 'clarity',
          severity: 'warn',
          title: 'Split long sentence',
          description: 'This sentence exceeds 25 words. Break it into two shorter sentences or add a bullet list.',
          explanation: 'Shorter sentences improve readability and help meet grade targets.',
          before: longSentenceMatch[0].trim(),
          after: '• Break long sentences into clearer steps.\n• Highlight action items separately.',
          autoFixable: false,
          teachReference: 'Plain Language Guidelines',
        })
      );
    }

    return suggestions;
  }
}

Alpine.store('grammar', new GrammarStore());

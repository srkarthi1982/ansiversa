import Alpine from 'alpinejs';
import { BaseStore } from '../../../alpineStores/base';
import { getSampleConceptData } from '../../../lib/concept-explainer/sample';
import type {
  AudienceLevel,
  ConceptWorkspaceOptions,
  ConceptWorkspaceState,
  ExplanationStyle,
} from '../../../types/concept-explainer';

const levelOrder: AudienceLevel[] = ['Kids', 'Teen', 'Undergrad', 'Professional', 'Expert'];
const styleOrder: ExplanationStyle[] = ['Teacher talk', 'Textbook', 'Story', 'Cheatsheet', 'Socratic'];

class ConceptExplainerStore extends BaseStore {
  state: ConceptWorkspaceState;

  private initialised = false;

  constructor() {
    super();
    const sample = getSampleConceptData();
    this.state = {
      loading: false,
      options: {
        concept: sample.snapshot.concept,
        level: sample.defaultContext.level,
        style: sample.defaultContext.style,
        language: sample.defaultContext.language,
        region: sample.defaultContext.region,
        subject: sample.defaultContext.subject,
        examTag: sample.defaultContext.examTag,
        mode: 'generate',
      },
      snapshot: sample.snapshot,
      breakdown: sample.breakdown,
      analogies: sample.analogies,
      visuals: sample.visuals,
      pitfalls: sample.pitfalls,
      miniQuiz: sample.miniQuiz,
      quickChecks: sample.quickChecks,
      exportPresets: sample.exports,
      linkedWorkspaces: sample.linkedWorkspaces,
      lastAction: null,
    };
  }

  init(): void {
    if (this.initialised) return;
    this.initialised = true;
    this.state.lastAction = 'Sample explanation ready to explore';
  }

  updateOption<T extends keyof ConceptWorkspaceOptions>(key: T, value: ConceptWorkspaceOptions[T]): void {
    if (this.state.options[key] === value) return;
    // @ts-expect-error - dynamic assignment
    this.state.options[key] = value;
    this.state.lastAction = `${this.formatKey(key)} set to ${value ?? '—'}`;
  }

  cycleLevel(direction: 'up' | 'down'): void {
    const currentIndex = levelOrder.indexOf(this.state.options.level);
    const offset = direction === 'up' ? 1 : -1;
    const next = levelOrder[(currentIndex + offset + levelOrder.length) % levelOrder.length];
    this.updateOption('level', next);
  }

  cycleStyle(): void {
    const currentIndex = styleOrder.indexOf(this.state.options.style);
    const next = styleOrder[(currentIndex + 1) % styleOrder.length];
    this.updateOption('style', next);
  }

  toggleMode(): void {
    this.updateOption('mode', this.state.options.mode === 'generate' ? 'revise' : 'generate');
  }

  regenerate(): void {
    this.setLoaderVisible(true);
    this.state.loading = true;
    setTimeout(() => {
      this.state.loading = false;
      this.setLoaderVisible(false);
      this.state.lastAction = `${this.state.options.mode === 'generate' ? 'Generated' : 'Revised'} "${this.state.options.concept}" for ${this.state.options.level}`;
    }, 300);
  }

  get filteredAnalogies() {
    return this.state.analogies.filter((item) => item.level.includes(this.state.options.level));
  }

  private formatKey(key: keyof ConceptWorkspaceOptions): string {
    switch (key) {
      case 'concept':
        return 'Concept';
      case 'level':
        return 'Audience level';
      case 'style':
        return 'Style';
      case 'language':
        return 'Language';
      case 'region':
        return 'Region';
      case 'subject':
        return 'Subject';
      case 'examTag':
        return 'Exam tag';
      case 'mode':
        return 'Mode';
      default:
        return String(key);
    }
  }
}

const conceptExplainer = new ConceptExplainerStore();

Alpine.store('concept', conceptExplainer);

export type ConceptExplainerAlpineStore = ConceptExplainerStore;
export { conceptExplainer };

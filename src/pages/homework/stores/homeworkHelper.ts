import Alpine from 'alpinejs';
import { BaseStore, clone } from '../../../alpineStores/base';
import {
  getHomeworkHighlights,
  getSampleHomeworkProblem,
  type HomeworkPracticeProblem,
  type HomeworkProblemSnapshot,
  type HomeworkSubject,
} from '../data/sampleHomework';

interface IntakePreferences {
  mode: 'text' | 'image' | 'link';
  subject: HomeworkSubject;
  gradeBand: '5-8' | '9-10' | '11-12' | 'UG';
  board: 'cbse' | 'intl';
  language: string;
  question: string;
  resourceUrl: string;
  fileName: string | null;
}

interface SolutionState {
  snapshot: HomeworkProblemSnapshot;
  revealedSteps: number;
  activeStep: number;
  showAnswer: boolean;
  showHintFor: number | null;
  lastAction: string;
}

interface PracticeState {
  items: HomeworkPracticeProblem[];
  focusSubject: HomeworkSubject | 'All';
  lastGeneratedAt: string;
}

interface UsageState {
  plan: 'free' | 'pro';
  freeRemaining: number;
  statusMessage: string;
}

class HomeworkHelperStore extends BaseStore {
  intake: IntakePreferences;
  solution: SolutionState;
  practice: PracticeState;
  usage: UsageState;
  highlights = getHomeworkHighlights();
  private initialised = false;

  constructor() {
    super();
    const sample = getSampleHomeworkProblem();
    this.intake = {
      mode: 'text',
      subject: sample.subject,
      gradeBand: sample.gradeBand,
      board: sample.board,
      language: 'English',
      question: sample.prompt,
      resourceUrl: '',
      fileName: null,
    };
    this.solution = {
      snapshot: sample,
      revealedSteps: 1,
      activeStep: sample.steps[0]?.n ?? 1,
      showAnswer: false,
      showHintFor: null,
      lastAction: 'Ready to scaffold your question',
    };
    this.practice = {
      items: clone(sample.practice),
      focusSubject: 'All',
      lastGeneratedAt: 'Just now',
    };
    this.usage = {
      plan: 'free',
      freeRemaining: 9,
      statusMessage: 'Free plan: 10 questions/day, stepwise hints, citations locked after Step 2.',
    };
  }

  init(): void {
    if (this.initialised) return;
    this.initialised = true;
    this.solution.lastAction = 'Sample homework flow loaded — explore steps, hints, and practice sets.';
  }

  setMode(mode: IntakePreferences['mode']): void {
    if (this.intake.mode === mode) return;
    this.intake.mode = mode;
    if (mode === 'image') {
      this.solution.lastAction = 'Upload a worksheet snapshot — OCR kicks in instantly.';
    } else if (mode === 'link') {
      this.solution.lastAction = 'Paste a worksheet URL — we will fetch the text-only version for safety.';
    } else {
      this.solution.lastAction = 'Type or paste the question and choose a subject to begin.';
    }
  }

  setSubject(subject: HomeworkSubject): void {
    if (this.intake.subject === subject) return;
    this.intake.subject = subject;
    this.solution.lastAction = `Subject tuned to ${subject}. Similar practice recommendations updated.`;
    this.refreshPractice();
  }

  setGradeBand(band: IntakePreferences['gradeBand']): void {
    if (this.intake.gradeBand === band) return;
    this.intake.gradeBand = band;
    this.solution.lastAction = `Grade band set to ${band}. Difficulty calibration adjusted.`;
  }

  toggleBoard(): void {
    this.intake.board = this.intake.board === 'cbse' ? 'intl' : 'cbse';
    this.solution.lastAction = `Board preference switched to ${this.intake.board.toUpperCase()}.`;
  }

  cycleLanguage(): void {
    const options = ['English', 'Hindi', 'Spanish'];
    const currentIndex = options.indexOf(this.intake.language);
    this.intake.language = options[(currentIndex + 1) % options.length];
    this.solution.lastAction = `We will explain in ${this.intake.language}.`;
  }

  revealNextStep(): void {
    const total = this.solution.snapshot.steps.length;
    if (this.solution.revealedSteps >= total) {
      this.solution.showAnswer = true;
      this.solution.lastAction = 'Full solution revealed with reasoning.';
      return;
    }
    this.solution.revealedSteps += 1;
    const step = this.solution.snapshot.steps[this.solution.revealedSteps - 1];
    this.solution.activeStep = step?.n ?? this.solution.activeStep;
    this.solution.lastAction = `Revealed Step ${this.solution.revealedSteps}.`;
    this.solution.showHintFor = null;
  }

  toggleHint(stepNumber: number): void {
    if (this.solution.showHintFor === stepNumber) {
      this.solution.showHintFor = null;
    } else {
      this.solution.showHintFor = stepNumber;
      this.solution.lastAction = `Hint ${stepNumber} displayed. Encourage learners to attempt before revealing the step.`;
    }
  }

  setActiveStep(stepNumber: number): void {
    if (this.solution.activeStep === stepNumber) return;
    this.solution.activeStep = stepNumber;
    if (stepNumber <= this.solution.revealedSteps) {
      this.solution.lastAction = `Focusing on Step ${stepNumber}.`;
    } else {
      this.solution.lastAction = 'Preview locked — reveal earlier steps first to maintain scaffolding.';
    }
  }

  showFinalAnswer(): void {
    this.solution.showAnswer = true;
    this.solution.lastAction = 'Final answer and reasoning revealed.';
  }

  attachFile(name: string): void {
    this.intake.fileName = name;
    this.solution.lastAction = `Attached ${name}. Ready for OCR in preview mode.`;
  }

  detachFile(): void {
    this.intake.fileName = null;
    this.solution.lastAction = 'Attachment cleared. Drop a new worksheet photo anytime.';
  }

  updateQuestion(value: string): void {
    this.intake.question = value;
  }

  updateResourceUrl(value: string): void {
    this.intake.resourceUrl = value;
  }

  markAttemptReviewed(index: number): void {
    const attempt = this.solution.snapshot.attempts[index];
    if (!attempt) return;
    this.solution.lastAction = `Shared feedback: ${attempt.recommendation}`;
  }

  refreshPractice(): void {
    const sample = getSampleHomeworkProblem();
    const matching = sample.practice.filter(
      (item) => this.intake.subject === 'Math' || item.subject === this.intake.subject,
    );
    const fallback = matching.length ? matching : sample.practice;
    this.practice.items = clone(fallback);
    this.practice.focusSubject = this.intake.subject === 'Math' ? 'All' : this.intake.subject;
    this.practice.lastGeneratedAt = 'Moments ago';
  }

  generateMorePractice(): void {
    this.showLoaderBriefly();
    const next = this.practice.items.map((item, index) => ({
      ...item,
      id: `${item.id}-variant-${index + 1}`,
      prompt: `${item.prompt} (variant)`,
    }));
    this.practice.items = next;
    this.practice.lastGeneratedAt = 'Just refreshed';
    this.solution.lastAction = 'Generated a new set of differentiated practice problems.';
  }

  upgradePlan(): void {
    this.usage.plan = 'pro';
    this.usage.freeRemaining = Number.POSITIVE_INFINITY;
    this.usage.statusMessage =
      'Pro unlocked: unlimited guided questions, PDF exports, practice sets, teacher dashboard access.';
    this.solution.lastAction = 'Plan upgraded. Advanced exports and dashboards now available.';
  }

  consumeFreeQuestion(): void {
    if (this.usage.plan === 'pro') return;
    if (this.usage.freeRemaining > 0) {
      this.usage.freeRemaining -= 1;
      this.solution.lastAction = `${this.usage.freeRemaining} free questions left today.`;
    } else {
      this.solution.lastAction = 'Daily free quota reached. Upgrade or wait for reset at midnight.';
    }
  }
}

const homeworkHelper = new HomeworkHelperStore();

Alpine.store('homework', homeworkHelper);

export type HomeworkHelperAlpineStore = HomeworkHelperStore;
export { homeworkHelper };

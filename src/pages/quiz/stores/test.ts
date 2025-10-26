import Alpine from 'alpinejs';
import { actions } from 'astro:actions';
import { BaseStore } from '../../../alpineStores/base';

type OptionRecord = {
  id: number;
  name: string;
  icon?: string | null;
  qCount?: number;
  platformId?: number;
  subjectId?: number;
  topicId?: number;
};

type LevelOption = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

type QuestionItem = {
  id: number;
  questionText: string;
  options: string[];
  answerKey: string | null;
  explanation: string | null;
  level: string | null;
  correctIndex: number | null;
};

type SelectionState = {
  platformId: number | null;
  subjectId: number | null;
  topicId: number | null;
  roadmapId: number | null;
  levelId: string;
  answers: (number | null)[];
};

const LEVELS: LevelOption[] = [
  {
    id: 'E',
    name: 'Easy',
    description: 'Foundational questions to warm up',
    icon: 'fa-seedling',
  },
  {
    id: 'M',
    name: 'Medium',
    description: 'Balanced mix of challenge and fundamentals',
    icon: 'fa-signal',
  },
  {
    id: 'D',
    name: 'Difficult',
    description: 'Advanced problems for mastery',
    icon: 'fa-mountain',
  },
];

class QuizTestStore extends BaseStore {
  step = 1;
  loading = false;
  error: string | null = null;
  search = '';
  isCompleted = false;
  mark = 0;
  currentQuestion = 0;
  list = {
    platforms: [] as OptionRecord[],
    subjects: [] as OptionRecord[],
    topics: [] as OptionRecord[],
    roadmaps: [] as OptionRecord[],
    levels: LEVELS,
    questions: [] as QuestionItem[],
  };
  selection: SelectionState = {
    platformId: null,
    subjectId: null,
    topicId: null,
    roadmapId: null,
    levelId: '',
    answers: [],
  };
  constructor() {
    super();
  }

  async onInit(): Promise<void> {
    await this.loadPlatforms();
  }

  get totalQuestions(): number {
    return this.list.questions.length;
  }

  get currentQuestionItem(): QuestionItem | null {
    return this.list.questions[this.currentQuestion] ?? null;
  }

  canNavigateTo(step: number): boolean {
    if (step <= 1) return true;
    if (step === 2) return this.selection.platformId !== null;
    if (step === 3) return this.selection.platformId !== null && this.selection.subjectId !== null;
    if (step === 4) return this.selection.platformId !== null && this.selection.subjectId !== null && this.selection.topicId !== null;
    if (step === 5) return this.selection.platformId !== null && this.selection.subjectId !== null && this.selection.topicId !== null && this.selection.roadmapId !== null;
    if (step === 6) return this.selection.platformId !== null && this.selection.subjectId !== null && this.selection.topicId !== null && this.selection.roadmapId !== null && this.selection.levelId !== '';
    return false;
  }

  async goToStep(step: number): Promise<void> {
    if (!this.canNavigateTo(step)) {
      return;
    }
    if (step < this.step) {
      this.step = step;
      this.isCompleted = false;
      if (step <= 1) {
        this.selection.subjectId = null;
        this.selection.topicId = null;
        this.selection.roadmapId = null;
        this.selection.levelId = '';
      } else if (step === 2) {
        this.selection.topicId = null;
        this.selection.roadmapId = null;
        this.selection.levelId = '';
      } else if (step === 3) {
        this.selection.roadmapId = null;
        this.selection.levelId = '';
      } else if (step === 4) {
        this.selection.levelId = '';
      }
      return;
    }

    if (step === this.step) {
      return;
    }

    switch (step) {
      case 2:
        if (this.selection.platformId) {
          await this.choosePlatform(this.selection.platformId);
        }
        break;
      case 3:
        if (this.selection.subjectId) {
          await this.chooseSubject(this.selection.subjectId);
        }
        break;
      case 4:
        if (this.selection.topicId) {
          await this.chooseTopic(this.selection.topicId);
        }
        break;
      case 5:
        if (this.selection.roadmapId) {
          this.chooseRoadmap(this.selection.roadmapId);
        }
        break;
      case 6:
        if (this.selection.levelId) {
          await this.chooseLevel(this.selection.levelId);
        }
        break;
      default:
        this.step = 1;
    }
  }

  get filteredPlatforms(): OptionRecord[] {
    const term = this.search.trim().toLowerCase();
    if (!term) return this.list.platforms;
    return this.list.platforms.filter((item) => item.name.toLowerCase().includes(term));
  }

  get filteredSubjects(): OptionRecord[] {
    const term = this.search.trim().toLowerCase();
    if (!term) return this.list.subjects;
    return this.list.subjects.filter((item) => item.name.toLowerCase().includes(term));
  }

  get filteredTopics(): OptionRecord[] {
    const term = this.search.trim().toLowerCase();
    if (!term) return this.list.topics;
    return this.list.topics.filter((item) => item.name.toLowerCase().includes(term));
  }

  get filteredRoadmaps(): OptionRecord[] {
    const term = this.search.trim().toLowerCase();
    if (!term) return this.list.roadmaps;
    return this.list.roadmaps.filter((item) => item.name.toLowerCase().includes(term));
  }

  private setLoading(state: boolean): void {
    this.loading = state;
    if (state) {
      this.loader?.show();
    } else {
      this.loader?.hide();
    }
  }

  private resetSelections(afterStep: number): void {
    if (afterStep <= 1) {
      this.selection.platformId = null;
    }
    if (afterStep <= 2) {
      this.selection.subjectId = null;
    }
    if (afterStep <= 3) {
      this.selection.topicId = null;
    }
    if (afterStep <= 4) {
      this.selection.roadmapId = null;
    }
    if (afterStep <= 5) {
      this.selection.levelId = '';
    }
    this.selection.answers = [];
    this.mark = 0;
    this.isCompleted = false;
    this.currentQuestion = 0;
  }

  private shuffleArray<T>(items: T[]): T[] {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private normalizeOptionName(id: number, name: unknown, fallback: string): string {
    if (typeof name === 'string') {
      const trimmed = name.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
    return `${fallback} #${id}`;
  }

  private async fetchAllPlatforms(): Promise<OptionRecord[]> {
    const collected: OptionRecord[] = [];
    const pageSize = 48;
    let page = 1;
    let total = 0;
    while (page <= 100) {
      const { data, error } = await actions.quiz.fetchPlatforms({
        page,
        pageSize,
        filters: { status: 'active' },
      });
      if (error) {
        throw error;
      }
      const payload = data ?? { items: [], total: 0 };
      const items = Array.isArray(payload.items) ? payload.items : [];
      collected.push(
        ...items.map((item: any) => ({
          id: Number(item.id),
          name: this.normalizeOptionName(Number(item.id), item.name, 'Platform'),
          icon: item.icon ?? null,
          qCount: Number(item.qCount ?? 0),
        })),
      );
      const rawTotal = payload.total;
      total = typeof rawTotal === 'number' ? rawTotal : typeof rawTotal === 'bigint' ? Number(rawTotal) : collected.length;
      if (collected.length >= total || items.length < pageSize) {
        break;
      }
      page += 1;
    }
    return collected;
  }

  private async loadSubjects(platformId: number): Promise<OptionRecord[]> {
    const collected: OptionRecord[] = [];
    const pageSize = 48;
    let page = 1;
    let total = 0;
    while (page <= 100) {
      const { data, error } = await actions.quiz.fetchSubjects({
        page,
        pageSize,
        filters: { platformId, status: 'active' },
      });
      if (error) throw error;
      const payload = data ?? { items: [], total: 0 };
      const items = Array.isArray(payload.items) ? payload.items : [];
      collected.push(
        ...items.map((item: any) => ({
          id: Number(item.id),
          name: this.normalizeOptionName(Number(item.id), item.name, 'Subject'),
          platformId: Number(item.platformId),
          qCount: Number(item.qCount ?? 0),
        })),
      );
      const rawTotal = payload.total;
      total = typeof rawTotal === 'number' ? rawTotal : typeof rawTotal === 'bigint' ? Number(rawTotal) : collected.length;
      if (collected.length >= total || items.length < pageSize) {
        break;
      }
      page += 1;
    }
    return collected;
  }

  private async loadTopics(platformId: number, subjectId: number): Promise<OptionRecord[]> {
    const collected: OptionRecord[] = [];
    const pageSize = 48;
    let page = 1;
    let total = 0;
    while (page <= 100) {
      const { data, error } = await actions.quiz.fetchTopics({
        page,
        pageSize,
        filters: { platformId, subjectId, status: 'active' },
      });
      if (error) throw error;
      const payload = data ?? { items: [], total: 0 };
      const items = Array.isArray(payload.items) ? payload.items : [];
      collected.push(
        ...items.map((item: any) => ({
          id: Number(item.id),
          name: this.normalizeOptionName(Number(item.id), item.name, 'Topic'),
          platformId: Number(item.platformId),
          subjectId: Number(item.subjectId),
          qCount: Number(item.qCount ?? 0),
        })),
      );
      const rawTotal = payload.total;
      total = typeof rawTotal === 'number' ? rawTotal : typeof rawTotal === 'bigint' ? Number(rawTotal) : collected.length;
      if (collected.length >= total || items.length < pageSize) {
        break;
      }
      page += 1;
    }
    return collected;
  }

  private async loadRoadmaps(platformId: number, subjectId: number, topicId: number): Promise<OptionRecord[]> {
    const collected: OptionRecord[] = [];
    const pageSize = 48;
    let page = 1;
    let total = 0;
    while (page <= 100) {
      const { data, error } = await actions.quiz.fetchRoadmaps({
        page,
        pageSize,
        filters: { platformId, subjectId, topicId, status: 'active' },
      });
      if (error) throw error;
      const payload = data ?? { items: [], total: 0 };
      const items = Array.isArray(payload.items) ? payload.items : [];
      collected.push(
        ...items.map((item: any) => ({
          id: Number(item.id),
          name: this.normalizeOptionName(Number(item.id), item.name, 'Roadmap'),
          platformId: Number(item.platformId),
          subjectId: Number(item.subjectId),
          topicId: Number(item.topicId),
          qCount: Number(item.qCount ?? 0),
        })),
      );
      const rawTotal = payload.total;
      total = typeof rawTotal === 'number' ? rawTotal : typeof rawTotal === 'bigint' ? Number(rawTotal) : collected.length;
      if (collected.length >= total || items.length < pageSize) {
        break;
      }
      page += 1;
    }
    return collected;
  }

  async loadPlatforms(): Promise<void> {
    this.setLoading(true);
    this.error = null;
    try {
      this.list.platforms = await this.fetchAllPlatforms();
    } catch (err) {
      console.error('Failed to load quiz platforms', err);
      this.error = err instanceof Error ? err.message : 'Unable to load platforms.';
      this.list.platforms = [];
    } finally {
      this.setLoading(false);
    }
  }

  async choosePlatform(platformId: number): Promise<void> {
    this.setLoading(true);
    this.error = null;
    try {
      this.resetSelections(2);
      this.selection.platformId = platformId;
      this.step = 2;
      this.search = '';
      this.list.subjects = await this.loadSubjects(platformId);
    } catch (err) {
      console.error('Failed to load subjects', err);
      this.error = err instanceof Error ? err.message : 'Unable to load subjects.';
      this.list.subjects = [];
    } finally {
      this.setLoading(false);
    }
  }

  async chooseSubject(subjectId: number): Promise<void> {
    if (!this.selection.platformId) return;
    this.setLoading(true);
    this.error = null;
    try {
      this.resetSelections(3);
      this.selection.subjectId = subjectId;
      this.step = 3;
      this.search = '';
      this.list.topics = await this.loadTopics(this.selection.platformId, subjectId);
    } catch (err) {
      console.error('Failed to load topics', err);
      this.error = err instanceof Error ? err.message : 'Unable to load topics.';
      this.list.topics = [];
    } finally {
      this.setLoading(false);
    }
  }

  async chooseTopic(topicId: number): Promise<void> {
    if (!this.selection.platformId || !this.selection.subjectId) return;
    this.setLoading(true);
    this.error = null;
    try {
      this.resetSelections(4);
      this.selection.topicId = topicId;
      this.step = 4;
      this.search = '';
      this.list.roadmaps = await this.loadRoadmaps(this.selection.platformId, this.selection.subjectId, topicId);
    } catch (err) {
      console.error('Failed to load roadmaps', err);
      this.error = err instanceof Error ? err.message : 'Unable to load roadmaps.';
      this.list.roadmaps = [];
    } finally {
      this.setLoading(false);
    }
  }

  chooseRoadmap(roadmapId: number): void {
    this.resetSelections(5);
    this.selection.roadmapId = roadmapId;
    this.step = 5;
    this.search = '';
    this.isCompleted = false;
    this.mark = 0;
  }

  async chooseLevel(levelId: string): Promise<void> {
    if (!this.selection.platformId || !this.selection.subjectId || !this.selection.topicId || !this.selection.roadmapId) {
      return;
    }
    this.setLoading(true);
    this.error = null;
    try {
      this.selection.levelId = levelId;
      await this.loadQuestions();
      this.currentQuestion = 0;
      this.isCompleted = false;
      this.step = 6;
    } catch (err) {
      console.error('Failed to load questions', err);
      this.error = err instanceof Error ? err.message : 'Unable to load questions.';
      this.list.questions = [];
    } finally {
      this.setLoading(false);
    }
  }

  private async loadQuestions(): Promise<void> {
    const platformId = this.selection.platformId;
    const subjectId = this.selection.subjectId;
    const topicId = this.selection.topicId;
    const roadmapId = this.selection.roadmapId;
    const level = this.selection.levelId;
    if (!platformId || !subjectId || !topicId || !roadmapId || !level) {
      throw new Error('Missing quiz selection.');
    }
    const pageSize = 10;
    const requestPayload = {
      page: 1,
      pageSize,
      filters: {
        platformId,
        subjectId,
        topicId,
        roadmapId,
        level,
      },
    } as const;

    const { data, error } = await actions.quiz.fetchQuestions(requestPayload);
    if (error) {
      throw error;
    }

    let payload = data ?? { items: [], total: 0, page: 1 };
    let items = Array.isArray(payload.items) ? payload.items : [];

    const rawTotal = (payload as any).total ?? 0;
    const total = typeof rawTotal === 'number' ? rawTotal : Number(rawTotal);
    const totalPages = Number.isFinite(total) && total > 0 ? Math.ceil(total / pageSize) : 0;

    if (totalPages > 1) {
      const randomPage = Math.floor(Math.random() * totalPages) + 1;
      const currentPage = typeof (payload as any).page === 'number' ? (payload as any).page : 1;
      if (randomPage !== currentPage) {
        const { data: randomData, error: randomError } = await actions.quiz.fetchQuestions({
          ...requestPayload,
          page: randomPage,
        });
        if (!randomError && randomData) {
          payload = randomData;
          items = Array.isArray(randomData.items) ? randomData.items : items;
        }
      }
    }

    const shuffledItems = this.shuffleArray(items);

    this.list.questions = shuffledItems.map((item: any) => {
      const options = Array.isArray(item.options) ? item.options : [];
      const answerKey = typeof item.answerKey === 'string' ? item.answerKey : null;
      return {
        id: Number(item.id),
        questionText: item.questionText ?? '',
        options,
        answerKey,
        explanation: typeof item.explanation === 'string' ? item.explanation : null,
        level: typeof item.level === 'string' ? item.level : null,
        correctIndex: this.resolveCorrectIndex(options, answerKey),
      };
    });
    this.selection.answers = Array.from({ length: this.list.questions.length }, () => null);
  }

  nextQuestion(): void {
    if (this.currentQuestion < this.list.questions.length - 1) {
      this.currentQuestion += 1;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestion > 0) {
      this.currentQuestion -= 1;
    }
  }

  finishQuiz(): void {
    const { questions } = this.list;
    if (questions.length === 0) {
      return;
    }
    let score = 0;
    const responseRecords: { id: number; a: number }[] = [];
    questions.forEach((question, index) => {
      const rawAnswer = this.selection.answers[index];
      const resolvedCorrectIndex =
        typeof question.correctIndex === 'number' && question.correctIndex >= 0
          ? question.correctIndex
          : this.resolveCorrectIndex(question.options ?? [], question.answerKey);
      const storedCorrectIndex =
        typeof resolvedCorrectIndex === 'number' && resolvedCorrectIndex >= 0
          ? resolvedCorrectIndex
          : -1;
      responseRecords.push({
        id: question.id,
        a: storedCorrectIndex,
      });
      if (rawAnswer === null) {
        return;
      }
      const numericAnswer = this.normalizeAnswerIndex(rawAnswer);
      const normalizedKeyValue = (question.answerKey ?? '').trim().toLowerCase();
      const options = question.options ?? [];

      if (
        typeof resolvedCorrectIndex === 'number' &&
        resolvedCorrectIndex >= 0 &&
        numericAnswer !== null
      ) {
        if (numericAnswer === resolvedCorrectIndex) {
          score += 1;
        }
        return;
      }

      if (
        typeof resolvedCorrectIndex === 'number' &&
        resolvedCorrectIndex >= 0 &&
        numericAnswer === null &&
        typeof rawAnswer === 'string'
      ) {
        const selectedValue = rawAnswer.trim().toLowerCase();
        const correctValue = options[resolvedCorrectIndex];
        if (typeof correctValue === 'string' && correctValue.trim().toLowerCase() === selectedValue) {
          score += 1;
        }
        return;
      }

      if (
        numericAnswer !== null &&
        normalizedKeyValue.length > 0 &&
        options[numericAnswer] &&
        options[numericAnswer]?.trim().toLowerCase() === normalizedKeyValue
      ) {
        score += 1;
        return;
      }

      if (
        numericAnswer === null &&
        typeof rawAnswer === 'string' &&
        rawAnswer.trim().length > 0 &&
        normalizedKeyValue.length > 0 &&
        rawAnswer.trim().toLowerCase() === normalizedKeyValue
      ) {
        score += 1;
      }
    });
    this.mark = score;
    this.isCompleted = true;
    void this.persistResult(score, responseRecords);
  }

  reset(): void {
    this.step = 1;
    this.search = '';
    this.resetSelections(1);
    this.list.questions = [];
    this.selection = {
      platformId: null,
      subjectId: null,
      topicId: null,
      roadmapId: null,
      levelId: '',
      answers: [],
    };
  }

  private normalizeAnswerIndex(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = Number.parseInt(value, 10);
      return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  private resolveCorrectIndex(options: string[], answerKey: string | null): number | null {
    if (!Array.isArray(options) || options.length === 0) {
      return null;
    }
    const key = typeof answerKey === 'string' ? answerKey.trim() : '';
    if (!key) {
      return null;
    }
    const numericKey = Number.parseInt(key, 10);
    if (!Number.isNaN(numericKey)) {
      if (numericKey >= 0 && numericKey < options.length) {
        return numericKey;
      }
      const zeroBased = numericKey - 1;
      if (zeroBased >= 0 && zeroBased < options.length) {
        return zeroBased;
      }
    }
    if (key.length === 1) {
      const alphaIndex = key.toLowerCase().charCodeAt(0) - 97;
      if (alphaIndex >= 0 && alphaIndex < options.length) {
        return alphaIndex;
      }
    }
    const lowered = key.toLowerCase();
    const matchIndex = options.findIndex((option) => option.trim().toLowerCase() === lowered);
    return matchIndex !== -1 ? matchIndex : null;
  }

  private async persistResult(mark: number, responses: { id: number; a: number }[]): Promise<void> {
    if (
      !this.selection.platformId ||
      !this.selection.subjectId ||
      !this.selection.topicId ||
      !this.selection.roadmapId ||
      !this.selection.levelId
    ) {
      return;
    }
    try {
      const { error } = await actions.quiz.saveResult({
        platformId: this.selection.platformId,
        subjectId: this.selection.subjectId,
        topicId: this.selection.topicId,
        roadmapId: this.selection.roadmapId,
        level: this.selection.levelId as 'E' | 'M' | 'D',
        mark,
        responses,
      });
      if (error && error.code !== 'UNAUTHORIZED') {
        console.error('Failed to save quiz result', error);
      }
    } catch (error) {
      console.error('Failed to save quiz result', error);
    }
  }
}

Alpine.store('test', new QuizTestStore());

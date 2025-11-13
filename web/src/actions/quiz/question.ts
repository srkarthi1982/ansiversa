import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import type { QuestionRelations } from '@ansiversa/db';
import {
  platformRepository,
  questionRepository,
  quizAdminRepository,
  roadmapRepository,
  subjectRepository,
  topicRepository,
} from './repositories';

type QuestionFiltersInput = {
  questionText?: string;
  platformId?: number;
  subjectId?: number;
  topicId?: number;
  roadmapId?: number;
  level?: string;
  status?: 'all' | 'active' | 'inactive';
};

type QuestionSortInput = {
  column:
    | 'questionText'
    | 'platformName'
    | 'subjectName'
    | 'topicName'
    | 'roadmapName'
    | 'platformId'
    | 'subjectId'
    | 'topicId'
    | 'roadmapId'
    | 'level'
    | 'status'
    | 'id';
  direction: 'asc' | 'desc';
};

const normalizeArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (typeof item === 'number' || typeof item === 'boolean') return String(item);
        return '';
      })
      .filter((item) => item.length > 0);
  }

  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>)
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (typeof item === 'number' || typeof item === 'boolean') return String(item);
        try {
          return JSON.stringify(item);
        } catch {
          return '';
        }
      })
      .filter((item) => item.length > 0);
  }

  return [];
};

const deriveAnswerFromKey = (options: string[], answerKey?: string | null): string | null => {
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
      return options[numericKey];
    }
    const zeroBased = numericKey - 1;
    if (zeroBased >= 0 && zeroBased < options.length) {
      return options[zeroBased];
    }
  }

  if (key.length === 1) {
    const alphaIndex = key.toLowerCase().charCodeAt(0) - 97;
    if (alphaIndex >= 0 && alphaIndex < options.length) {
      return options[alphaIndex];
    }
  }

  const loweredKey = key.toLowerCase();
  for (const option of options) {
    if (option.trim().toLowerCase() === loweredKey) {
      return option;
    }
  }

  return null;
};

const normalizeQuestion = (entry: QuestionRelations) => {
  const question = entry.question;
  const options = normalizeArray(question.options);
  const answerKey = typeof question.answer === 'string' ? question.answer : '';
  const explanation = question.explanation ?? '';

  return {
    id: question.id,
    platformId: question.platformId,
    subjectId: question.subjectId,
    topicId: question.topicId,
    roadmapId: question.roadmapId ?? null,
    questionText: question.question,
    options,
    answer: deriveAnswerFromKey(options, answerKey) ?? answerKey,
    answerKey,
    explanation,
    level: question.level,
    isActive: question.isActive,
    platformName: entry.platformName ?? null,
    subjectName: entry.subjectName ?? null,
    topicName: entry.topicName ?? null,
    roadmapName: entry.roadmapName ?? null,
  };
};

const questionPayloadSchema = z.object({
  platformId: z.number().int().min(1, 'Platform is required'),
  subjectId: z.number().int().min(1, 'Subject is required'),
  topicId: z.number().int().min(1, 'Topic is required'),
  roadmapId: z.number().int().min(1, 'Roadmap is required'),
  questionText: z.string().min(1, 'Question text is required'),
  options: z.array(z.string().min(1, 'Option cannot be empty')).min(1, 'At least one option is required'),
  answerKey: z.string().min(1, 'Answer key is required'),
  explanation: z.string().min(1, 'Explanation is required'),
  level: z.enum(['E', 'M', 'D']),
  isActive: z.boolean().optional(),
});

const questionFiltersSchema = z.object({
  questionText: z.string().optional(),
  platformId: z.number().int().min(1).optional(),
  subjectId: z.number().int().min(1).optional(),
  topicId: z.number().int().min(1).optional(),
  roadmapId: z.number().int().min(1).optional(),
  level: z.string().optional(),
  status: z.enum(['all', 'active', 'inactive']).optional(),
});

const questionSortSchema = z.object({
  column: z.enum([
    'questionText',
    'platformName',
    'subjectName',
    'topicName',
    'roadmapName',
    'platformId',
    'subjectId',
    'topicId',
    'roadmapId',
    'level',
    'status',
    'id',
  ]),
  direction: z.enum(['asc', 'desc']).default('asc'),
});

const normalizeInput = (input: z.infer<typeof questionPayloadSchema>) => {
  const questionText = input.questionText.trim();
  if (!questionText) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Question text is required' });
  }

  const platformId = Math.floor(input.platformId);
  const subjectId = Math.floor(input.subjectId);
  const topicId = Math.floor(input.topicId);

  if (!Number.isFinite(platformId) || platformId <= 0) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Platform is required' });
  }
  if (!Number.isFinite(subjectId) || subjectId <= 0) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Subject is required' });
  }
  if (!Number.isFinite(topicId) || topicId <= 0) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Topic is required' });
  }

  const roadmapId = Math.floor(input.roadmapId);
  if (!Number.isFinite(roadmapId) || roadmapId <= 0) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Roadmap is required' });
  }

  const normalizeArrayField = (value?: string[]) => {
    if (!Array.isArray(value)) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Options are required' });
    }
    const items = value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter((entry) => entry.length > 0);
    if (items.length === 0) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Provide at least one option' });
    }
    return items;
  };

  const normalizeRequiredString = (value: string | null, field: string) => {
    const normalized = typeof value === 'string' ? value.trim() : '';
    if (!normalized) {
      throw new ActionError({ code: 'BAD_REQUEST', message: `${field} is required` });
    }
    return normalized;
  };

  const normalizeLevelField = (value?: string | null) => {
    const normalized = normalizeRequiredString(value ?? null, 'Level');
    const upper = normalized.toUpperCase();
    if (upper !== 'E' && upper !== 'M' && upper !== 'D') {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Level must be E, M, or D' });
    }
    return upper;
  };

  return {
    platformId,
    subjectId,
    topicId,
    roadmapId,
    questionText,
    options: normalizeArrayField(input.options),
    answerKey: normalizeRequiredString(input.answerKey ?? null, 'Answer key'),
    explanation: normalizeRequiredString(input.explanation ?? null, 'Explanation'),
    level: normalizeLevelField(input.level),
    isActive: input.isActive ?? true,
  } as const;
};

const normalizeFilters = (filters?: QuestionFiltersInput) => {
  const safe = filters ?? {};
  const toTrimmed = (value?: string | null) => value?.trim() ?? '';
  const questionText = toTrimmed(safe.questionText);
  const rawLevel = toTrimmed(safe.level).toUpperCase();
  const level = rawLevel === 'E' || rawLevel === 'M' || rawLevel === 'D' ? rawLevel : '';

  const platformId = safe.platformId && Number.isFinite(safe.platformId) ? Math.floor(safe.platformId) : null;
  const subjectId = safe.subjectId && Number.isFinite(safe.subjectId) ? Math.floor(safe.subjectId) : null;
  const topicId = safe.topicId && Number.isFinite(safe.topicId) ? Math.floor(safe.topicId) : null;
  const roadmapId = safe.roadmapId && Number.isFinite(safe.roadmapId) ? Math.floor(safe.roadmapId) : null;

  const status = safe.status ?? 'all';

  return {
    questionText,
    level,
    platformId,
    subjectId,
    topicId,
    roadmapId,
    status,
  };
};

const assertQuestionHierarchy = async (
  platformId: number,
  subjectId: number,
  topicId: number,
  roadmapId: number,
) => {
  const platformRow = await platformRepository.getById(platformId);
  if (!platformRow) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Platform not found' });
  }

  const subjectRow = await subjectRepository.getById(subjectId);
  if (!subjectRow) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Subject not found' });
  }

  if (subjectRow.platformId !== platformId) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Subject does not belong to the selected platform' });
  }

  const topicRow = await topicRepository.getById(topicId);
  if (!topicRow) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Topic not found' });
  }

  if (topicRow.platformId !== platformId || topicRow.subjectId !== subjectId) {
    throw new ActionError({
      code: 'BAD_REQUEST',
      message: 'Topic does not align with the selected platform and subject',
    });
  }

  let roadmapRow = null;
  if (roadmapId !== null) {
    roadmapRow = await roadmapRepository.getById(roadmapId);
    if (!roadmapRow) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Roadmap not found' });
    }

    if (
      roadmapRow.platformId !== platformId ||
      roadmapRow.subjectId !== subjectId ||
      roadmapRow.topicId !== topicId
    ) {
      throw new ActionError({
        code: 'BAD_REQUEST',
        message: 'Roadmap does not align with the selected platform, subject, and topic',
      });
    }
  }

  return {
    platformName: platformRow.name ?? null,
    subjectName: subjectRow.name ?? null,
    topicName: topicRow.name ?? null,
    roadmapName: roadmapRow?.name ?? null,
  };
};

export const fetchQuestions = defineAction({
  input: z.object({
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(48).default(10),
    filters: questionFiltersSchema.optional(),
    sort: questionSortSchema.optional(),
  }),
  async handler({ page, pageSize, filters, sort }) {
    const normalizedFilters = normalizeFilters(filters);
    const normalizedSort = sort ?? null;

    const result = await quizAdminRepository.searchQuestions({
      page,
      pageSize,
      questionText: normalizedFilters.questionText || null,
      platformId: normalizedFilters.platformId,
      subjectId: normalizedFilters.subjectId,
      topicId: normalizedFilters.topicId,
      roadmapId: normalizedFilters.roadmapId,
      level: normalizedFilters.level || null,
      status: normalizedFilters.status,
      sortColumn: normalizedSort?.column,
      sortDirection: normalizedSort?.direction,
    });

    return {
      items: result.data.map((entry) => normalizeQuestion(entry)),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  },
});

export const fetchRandomQuestions = defineAction({
  input: z.object({
    filters: questionFiltersSchema.optional(),
    excludeIds: z.array(z.number().int().min(1)).optional(),
  }),
  async handler({ filters, excludeIds }) {
    const normalizedFilters = normalizeFilters(filters);
    const normalizedExcludeIds = Array.isArray(excludeIds)
      ? Array.from(
          new Set(
            excludeIds
              .map((value) => (Number.isFinite(value) ? Math.floor(value) : Number.NaN))
              .filter((value) => Number.isFinite(value) && value > 0),
          ),
        )
      : [];

    const result = await quizAdminRepository.getRandomQuestions({
      limit: 10,
      filters: {
        questionText: normalizedFilters.questionText || null,
        platformId: normalizedFilters.platformId,
        subjectId: normalizedFilters.subjectId,
        topicId: normalizedFilters.topicId,
        roadmapId: normalizedFilters.roadmapId,
        level: normalizedFilters.level || null,
        status: normalizedFilters.status,
      },
      excludeIds: normalizedExcludeIds,
    });

    return {
      items: result.data.map((entry) => normalizeQuestion(entry)),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  },
});

export const createQuestion = defineAction({
  input: questionPayloadSchema,
  async handler(input) {
    const payload = normalizeInput(input);

    const names = await assertQuestionHierarchy(
      payload.platformId,
      payload.subjectId,
      payload.topicId,
      payload.roadmapId,
    );

    try {
      const inserted = await questionRepository.create({
        platformId: payload.platformId,
        subjectId: payload.subjectId,
        topicId: payload.topicId,
        roadmapId: payload.roadmapId,
        question: payload.questionText,
        options: payload.options,
        answer: payload.answerKey,
        explanation: payload.explanation,
        level: payload.level,
        isActive: payload.isActive,
      });

      const enriched = await quizAdminRepository.getQuestionDetails(inserted.id);
      if (!enriched) {
        return normalizeQuestion({
          question: inserted,
          platformName: names.platformName,
          subjectName: names.subjectName,
          topicName: names.topicName,
          roadmapName: names.roadmapName,
        });
      }

      return normalizeQuestion(enriched);
    } catch (err: unknown) {
      throw new ActionError({
        code: 'BAD_REQUEST',
        message: (err as Error)?.message ?? 'Unable to create question',
      });
    }
  },
});

export const updateQuestion = defineAction({
  input: questionPayloadSchema.extend({
    id: z.number().int().min(1, 'Question id is required'),
  }),
  async handler(input) {
    const payload = normalizeInput(input);
    const { id } = input;

    const names = await assertQuestionHierarchy(
      payload.platformId,
      payload.subjectId,
      payload.topicId,
      payload.roadmapId,
    );

    const updated = await questionRepository.update(id, {
      platformId: payload.platformId,
      subjectId: payload.subjectId,
      topicId: payload.topicId,
      roadmapId: payload.roadmapId,
      question: payload.questionText,
      options: payload.options,
      answer: payload.answerKey,
      explanation: payload.explanation,
      level: payload.level,
      isActive: payload.isActive,
    });

    if (!updated) {
      throw new ActionError({ code: 'NOT_FOUND', message: 'Question not found' });
    }

    const enriched = await quizAdminRepository.getQuestionDetails(updated.id);
    if (!enriched) {
      return normalizeQuestion({
        question: updated,
        platformName: names.platformName,
        subjectName: names.subjectName,
        topicName: names.topicName,
        roadmapName: names.roadmapName,
      });
    }

    return normalizeQuestion(enriched);
  },
});

export const deleteQuestion = defineAction({
  input: z.object({
    id: z.number().int().min(1, 'Question id is required'),
  }),
  async handler({ id }) {
    const deleted = await questionRepository.delete(id);

    if (!deleted) {
      throw new ActionError({ code: 'NOT_FOUND', message: 'Question not found' });
    }

    return { ok: true } as const;
  },
});

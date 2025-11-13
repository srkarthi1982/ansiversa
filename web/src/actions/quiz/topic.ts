import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import type { Topic } from '@ansiversa/db';
import {
  platformRepository,
  quizAdminRepository,
  subjectRepository,
  topicRepository,
} from './repositories';

type TopicFiltersInput = {
  name?: string;
  platformId?: number;
  subjectId?: number;
  minQuestions?: number;
  maxQuestions?: number;
  status?: 'all' | 'active' | 'inactive';
};

type TopicSortInput = {
  column: 'name' | 'subjectName' | 'platformName' | 'platformId' | 'subjectId' | 'qCount' | 'status' | 'id';
  direction: 'asc' | 'desc';
};

const normalizeTopic = (entry: { topic: Topic; subjectName: string | null; platformName: string | null }) => ({
  id: entry.topic.id,
  platformId: entry.topic.platformId,
  subjectId: entry.topic.subjectId,
  name: entry.topic.name,
  isActive: entry.topic.isActive,
  qCount: entry.topic.qCount ?? 0,
  subjectName: entry.subjectName ?? null,
  platformName: entry.platformName ?? null,
});

const topicPayloadSchema = z.object({
  platformId: z.number().int().min(1, 'Platform is required'),
  subjectId: z.number().int().min(1, 'Subject is required'),
  name: z.string().min(1, 'Name is required'),
  isActive: z.boolean().optional(),
  qCount: z.number().int().min(0).optional(),
});

const topicFiltersSchema = z.object({
  name: z.string().optional(),
  platformId: z.number().int().min(1).optional(),
  subjectId: z.number().int().min(1).optional(),
  minQuestions: z.number().int().min(0).optional(),
  maxQuestions: z.number().int().min(0).optional(),
  status: z.enum(['all', 'active', 'inactive']).optional(),
});

const topicSortSchema = z.object({
  column: z.enum(['name', 'subjectName', 'platformName', 'platformId', 'subjectId', 'qCount', 'status', 'id']),
  direction: z.enum(['asc', 'desc']).default('asc'),
});

const normalizeInput = (input: z.infer<typeof topicPayloadSchema>) => {
  const name = input.name.trim();
  if (!name) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Name is required' });
  }

  const platformId = input.platformId;
  if (!Number.isFinite(platformId) || platformId <= 0) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Platform is required' });
  }

  const subjectId = input.subjectId;
  if (!Number.isFinite(subjectId) || subjectId <= 0) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Subject is required' });
  }

  const qCountSource = input.qCount ?? 0;
  const qCount = Math.max(0, Number.isFinite(qCountSource) ? qCountSource : 0);
  const isActive = input.isActive ?? true;

  return { platformId: Math.floor(platformId), subjectId: Math.floor(subjectId), name, qCount, isActive };
};

const normalizeFilters = (filters?: TopicFiltersInput) => {
  const safe = filters ?? {};
  const name = safe.name?.trim() ?? '';
  const platformId = safe.platformId && Number.isFinite(safe.platformId) ? Math.floor(safe.platformId) : null;
  const subjectId = safe.subjectId && Number.isFinite(safe.subjectId) ? Math.floor(safe.subjectId) : null;
  const hasMin = typeof safe.minQuestions === 'number' && Number.isFinite(safe.minQuestions);
  const hasMax = typeof safe.maxQuestions === 'number' && Number.isFinite(safe.maxQuestions);
  let minQuestions = hasMin ? Math.max(0, Math.floor(safe.minQuestions || 0)) : null;
  let maxQuestions = hasMax ? Math.max(0, Math.floor(safe.maxQuestions || 0)) : null;

  if (minQuestions !== null && maxQuestions !== null && maxQuestions < minQuestions) {
    const swapped = minQuestions;
    minQuestions = maxQuestions;
    maxQuestions = swapped;
  }

  const status = safe.status ?? 'all';

  return {
    name,
    platformId,
    subjectId,
    minQuestions,
    maxQuestions,
    status,
  };
};

export const fetchTopics = defineAction({
  input: z.object({
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(48).default(10),
    filters: topicFiltersSchema.optional(),
    sort: topicSortSchema.optional(),
  }),
  async handler({ page, pageSize, filters, sort }) {
    const normalizedFilters = normalizeFilters(filters);
    const normalizedSort = sort ?? null;

    const result = await quizAdminRepository.searchTopics({
      page,
      pageSize,
      name: normalizedFilters.name || null,
      platformId: normalizedFilters.platformId,
      subjectId: normalizedFilters.subjectId,
      minQuestions: normalizedFilters.minQuestions,
      maxQuestions: normalizedFilters.maxQuestions,
      status: normalizedFilters.status,
      sortColumn: normalizedSort?.column,
      sortDirection: normalizedSort?.direction,
    });

    const items = result.data.map((entry) =>
      normalizeTopic({
        topic: entry.topic,
        platformName: entry.platformName ?? null,
        subjectName: entry.subjectName ?? null,
      }),
    );

    return {
      items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  },
});

export const createTopic = defineAction({
  input: topicPayloadSchema,
  async handler(input) {
    const payload = normalizeInput(input);

    const platform = await platformRepository.getById(payload.platformId);

    if (!platform) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Platform not found' });
    }

    const subjectRow = await subjectRepository.getById(payload.subjectId);

    if (!subjectRow) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Subject not found' });
    }

    if (subjectRow.platformId !== payload.platformId) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Subject does not belong to the selected platform' });
    }

    try {
      const inserted = await topicRepository.create({
        platformId: payload.platformId,
        subjectId: payload.subjectId,
        name: payload.name,
        isActive: payload.isActive,
        qCount: payload.qCount,
      });

      const enriched = await quizAdminRepository.getTopicDetails(inserted.id);
      if (!enriched) {
        return normalizeTopic({
          topic: inserted,
          platformName: platform.name ?? null,
          subjectName: subjectRow.name ?? null,
        });
      }

      return normalizeTopic(enriched);
    } catch (err: unknown) {
      throw new ActionError({
        code: 'BAD_REQUEST',
        message: (err as Error)?.message ?? 'Unable to create topic',
      });
    }
  },
});

export const updateTopic = defineAction({
  input: z.object({
    id: z.number().int().min(1),
    data: topicPayloadSchema,
  }),
  async handler({ id, data }) {
    const payload = normalizeInput(data);

    const platform = await platformRepository.getById(payload.platformId);

    if (!platform) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Platform not found' });
    }

    const subjectRow = await subjectRepository.getById(payload.subjectId);

    if (!subjectRow) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Subject not found' });
    }

    if (subjectRow.platformId !== payload.platformId) {
      throw new ActionError({
        code: 'BAD_REQUEST',
        message: 'Subject does not belong to the selected platform',
      });
    }

    const existing = await topicRepository.getById(id);
    if (!existing) {
      throw new ActionError({ code: 'NOT_FOUND', message: 'Topic not found' });
    }

    try {
      const updated = await topicRepository.update(id, {
        platformId: payload.platformId,
        subjectId: payload.subjectId,
        name: payload.name,
        isActive: payload.isActive,
        qCount: payload.qCount,
      });

      if (!updated) {
        throw new ActionError({ code: 'NOT_FOUND', message: 'Topic not found' });
      }

      const enriched = await quizAdminRepository.getTopicDetails(updated.id);
      if (!enriched) {
        return normalizeTopic({
          topic: updated,
          platformName: platform.name ?? null,
          subjectName: subjectRow.name ?? null,
        });
      }

      return normalizeTopic(enriched);
    } catch (err: unknown) {
      if (err instanceof ActionError) {
        throw err;
      }
      throw new ActionError({
        code: 'BAD_REQUEST',
        message: (err as Error)?.message ?? 'Unable to update topic',
      });
    }
  },
});

export const deleteTopic = defineAction({
  input: z.object({ id: z.number().int().min(1) }),
  async handler({ id }) {
    try {
      const deleted = await topicRepository.delete(id);

      if (!deleted) {
        throw new ActionError({ code: 'NOT_FOUND', message: 'Topic not found' });
      }

      return { success: true } as const;
    } catch (err: unknown) {
      if (err instanceof ActionError) {
        throw err;
      }

      throw new ActionError({
        code: 'BAD_REQUEST',
        message: (err as Error)?.message ?? 'Unable to delete topic',
      });
    }
  },
});

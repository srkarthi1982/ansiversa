import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import type { Roadmap } from '@ansiversa/db';
import {
  platformRepository,
  quizAdminRepository,
  roadmapRepository,
  subjectRepository,
  topicRepository,
} from './repositories';

type RoadmapFiltersInput = {
  name?: string;
  platformId?: number;
  subjectId?: number;
  topicId?: number;
  minQuestions?: number;
  maxQuestions?: number;
  status?: 'all' | 'active' | 'inactive';
};

type RoadmapSortInput = {
  column:
    | 'name'
    | 'platformName'
    | 'subjectName'
    | 'topicName'
    | 'platformId'
    | 'subjectId'
    | 'topicId'
    | 'qCount'
    | 'status'
    | 'id';
  direction: 'asc' | 'desc';
};

const normalizeRoadmap = (entry: {
  roadmap: Roadmap;
  platformName: string | null;
  subjectName: string | null;
  topicName: string | null;
}) => ({
  id: entry.roadmap.id,
  platformId: entry.roadmap.platformId,
  subjectId: entry.roadmap.subjectId,
  topicId: entry.roadmap.topicId,
  name: entry.roadmap.name,
  isActive: entry.roadmap.isActive,
  qCount: entry.roadmap.qCount ?? 0,
  platformName: entry.platformName ?? null,
  subjectName: entry.subjectName ?? null,
  topicName: entry.topicName ?? null,
});

const roadmapPayloadSchema = z.object({
  platformId: z.number().int().min(1, 'Platform is required'),
  subjectId: z.number().int().min(1, 'Subject is required'),
  topicId: z.number().int().min(1, 'Topic is required'),
  name: z.string().min(1, 'Name is required'),
  isActive: z.boolean().optional(),
  qCount: z.number().int().min(0).optional(),
});

const roadmapFiltersSchema = z.object({
  name: z.string().optional(),
  platformId: z.number().int().min(1).optional(),
  subjectId: z.number().int().min(1).optional(),
  topicId: z.number().int().min(1).optional(),
  minQuestions: z.number().int().min(0).optional(),
  maxQuestions: z.number().int().min(0).optional(),
  status: z.enum(['all', 'active', 'inactive']).optional(),
});

const roadmapSortSchema = z.object({
  column: z.enum([
    'name',
    'platformName',
    'subjectName',
    'topicName',
    'platformId',
    'subjectId',
    'topicId',
    'qCount',
    'status',
    'id',
  ]),
  direction: z.enum(['asc', 'desc']).default('asc'),
});

const normalizeInput = (input: z.infer<typeof roadmapPayloadSchema>) => {
  const name = input.name.trim();
  if (!name) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Name is required' });
  }

  const platformId = input.platformId;
  const subjectId = input.subjectId;
  const topicId = input.topicId;

  if (!Number.isFinite(platformId) || platformId <= 0) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Platform is required' });
  }
  if (!Number.isFinite(subjectId) || subjectId <= 0) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Subject is required' });
  }
  if (!Number.isFinite(topicId) || topicId <= 0) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Topic is required' });
  }

  const qCountSource = input.qCount ?? 0;
  const qCount = Math.max(0, Number.isFinite(qCountSource) ? qCountSource : 0);
  const isActive = input.isActive ?? true;

  return {
    platformId: Math.floor(platformId),
    subjectId: Math.floor(subjectId),
    topicId: Math.floor(topicId),
    name,
    qCount,
    isActive,
  };
};

const normalizeFilters = (filters?: RoadmapFiltersInput) => {
  const safe = filters ?? {};
  const name = safe.name?.trim() ?? '';
  const platformId = safe.platformId && Number.isFinite(safe.platformId) ? Math.floor(safe.platformId) : null;
  const subjectId = safe.subjectId && Number.isFinite(safe.subjectId) ? Math.floor(safe.subjectId) : null;
  const topicId = safe.topicId && Number.isFinite(safe.topicId) ? Math.floor(safe.topicId) : null;
  const hasMin = typeof safe.minQuestions === 'number' && Number.isFinite(safe.minQuestions);
  const hasMax = typeof safe.maxQuestions === 'number' && Number.isFinite(safe.maxQuestions);
  let minQuestions = hasMin ? Math.max(0, Math.floor(safe.minQuestions)) : null;
  let maxQuestions = hasMax ? Math.max(0, Math.floor(safe.maxQuestions)) : null;

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
    topicId,
    minQuestions,
    maxQuestions,
    status,
  };
};

export const fetchRoadmaps = defineAction({
  input: z.object({
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(48).default(10),
    filters: roadmapFiltersSchema.optional(),
    sort: roadmapSortSchema.optional(),
  }),
  async handler({ page, pageSize, filters, sort }) {
    const normalizedFilters = normalizeFilters(filters);
    const normalizedSort = sort ?? null;
    const result = await quizAdminRepository.searchRoadmaps({
      page,
      pageSize,
      name: normalizedFilters.name || null,
      platformId: normalizedFilters.platformId,
      subjectId: normalizedFilters.subjectId,
      topicId: normalizedFilters.topicId,
      minQuestions: normalizedFilters.minQuestions,
      maxQuestions: normalizedFilters.maxQuestions,
      status: normalizedFilters.status,
      sortColumn: normalizedSort?.column,
      sortDirection: normalizedSort?.direction,
    });

    const items = result.data.map((entry) =>
      normalizeRoadmap({
        roadmap: entry.roadmap,
        platformName: entry.platformName ?? null,
        subjectName: entry.subjectName ?? null,
        topicName: entry.topicName ?? null,
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

const assertHierarchy = async (
  platformId: number,
  subjectId: number,
  topicId: number,
): Promise<{
  platformName: string | null;
  subjectName: string | null;
  topicName: string | null;
}> => {
  const platform = await platformRepository.getById(platformId);
  if (!platform) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Platform not found' });
  }

  const subject = await subjectRepository.getById(subjectId);
  if (!subject) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Subject not found' });
  }

  if (subject.platformId !== platformId) {
    throw new ActionError({
      code: 'BAD_REQUEST',
      message: 'Subject does not belong to the selected platform',
    });
  }

  const topic = await topicRepository.getById(topicId);
  if (!topic) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Topic not found' });
  }

  if (topic.platformId !== platformId || topic.subjectId !== subjectId) {
    throw new ActionError({
      code: 'BAD_REQUEST',
      message: 'Topic does not align with the selected platform and subject',
    });
  }

  return {
    platformName: platform.name ?? null,
    subjectName: subject.name ?? null,
    topicName: topic.name ?? null,
  };
};

export const createRoadmap = defineAction({
  input: roadmapPayloadSchema,
  async handler(input) {
    const payload = normalizeInput(input);
    const names = await assertHierarchy(payload.platformId, payload.subjectId, payload.topicId);

    try {
      const inserted = await roadmapRepository.create({
        platformId: payload.platformId,
        subjectId: payload.subjectId,
        topicId: payload.topicId,
        name: payload.name,
        isActive: payload.isActive,
        qCount: payload.qCount,
      });

      const enriched = await quizAdminRepository.getRoadmapDetails(inserted.id);
      if (!enriched) {
        return normalizeRoadmap({ roadmap: inserted, ...names });
      }

      return normalizeRoadmap(enriched);
    } catch (err: unknown) {
      throw new ActionError({
        code: 'BAD_REQUEST',
        message: (err as Error)?.message ?? 'Unable to create roadmap',
      });
    }
  },
});

export const updateRoadmap = defineAction({
  input: z.object({
    id: z.number().int().min(1),
    data: roadmapPayloadSchema,
  }),
  async handler({ id, data }) {
    const payload = normalizeInput(data);
    const names = await assertHierarchy(payload.platformId, payload.subjectId, payload.topicId);

    const existing = await roadmapRepository.getById(id);
    if (!existing) {
      throw new ActionError({ code: 'NOT_FOUND', message: 'Roadmap not found' });
    }

    try {
      const updated = await roadmapRepository.update(id, {
        platformId: payload.platformId,
        subjectId: payload.subjectId,
        topicId: payload.topicId,
        name: payload.name,
        isActive: payload.isActive,
        qCount: payload.qCount,
      });

      if (!updated) {
        throw new ActionError({ code: 'NOT_FOUND', message: 'Roadmap not found' });
      }

      const enriched = await quizAdminRepository.getRoadmapDetails(updated.id);
      if (!enriched) {
        return normalizeRoadmap({ roadmap: updated, ...names });
      }

      return normalizeRoadmap(enriched);
    } catch (err: unknown) {
      if (err instanceof ActionError) {
        throw err;
      }
      throw new ActionError({
        code: 'BAD_REQUEST',
        message: (err as Error)?.message ?? 'Unable to update roadmap',
      });
    }
  },
});

export const deleteRoadmap = defineAction({
  input: z.object({ id: z.number().int().min(1) }),
  async handler({ id }) {
    try {
      const deleted = await roadmapRepository.delete(id);

      if (!deleted) {
        throw new ActionError({ code: 'NOT_FOUND', message: 'Roadmap not found' });
      }

      return { success: true } as const;
    } catch (err: unknown) {
      if (err instanceof ActionError) {
        throw err;
      }

      throw new ActionError({
        code: 'BAD_REQUEST',
        message: (err as Error)?.message ?? 'Unable to delete roadmap',
      });
    }
  },
});

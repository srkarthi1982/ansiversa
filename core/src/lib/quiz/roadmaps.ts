import { ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { Roadmap, Topic, Subject, Platform, and, asc, desc, eq, gte, lte, sql } from 'astro:db';
import {
  platformRepository,
  roadmapQueryRepository,
  roadmapRepository,
  subjectRepository,
  topicRepository,
} from './repositories';

type SqlCondition = NonNullable<Parameters<typeof and>[number]>;

type RoadmapRow = typeof Roadmap.$inferSelect;

const normalizeRoadmap = (
  row: RoadmapRow & {
    topicName?: string | null;
    subjectName?: string | null;
    platformName?: string | null;
  },
) => ({
  id: row.id,
  platformId: row.platformId,
  subjectId: row.subjectId,
  topicId: row.topicId,
  name: row.name,
  isActive: row.isActive,
  qCount: row.qCount ?? 0,
  platformName: row.platformName ?? null,
  subjectName: row.subjectName ?? null,
  topicName: row.topicName ?? null,
});

export const roadmapPayloadSchema = z.object({
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

type RoadmapFiltersInput = z.infer<typeof roadmapFiltersSchema>;

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

type RoadmapSortInput = z.infer<typeof roadmapSortSchema>;

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

export const fetchRoadmapsInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(48).default(10),
  filters: roadmapFiltersSchema.optional(),
  sort: roadmapSortSchema.optional(),
});

export type FetchRoadmapsInput = z.infer<typeof fetchRoadmapsInputSchema>;
export type RoadmapPayload = z.infer<typeof roadmapPayloadSchema>;

export async function fetchRoadmaps(input: unknown) {
  const { page, pageSize, filters, sort } = await fetchRoadmapsInputSchema.parseAsync(input ?? {});

  const normalizedFilters = normalizeFilters(filters);
  const normalizedSort = sort ?? null;
  const conditions: SqlCondition[] = [];

  if (normalizedFilters.name) {
    conditions.push(sql`lower(${Roadmap.name}) LIKE ${`%${normalizedFilters.name.toLowerCase()}%`}`);
  }

  if (normalizedFilters.platformId !== null) {
    conditions.push(eq(Roadmap.platformId, normalizedFilters.platformId));
  }

  if (normalizedFilters.subjectId !== null) {
    conditions.push(eq(Roadmap.subjectId, normalizedFilters.subjectId));
  }

  if (normalizedFilters.topicId !== null) {
    conditions.push(eq(Roadmap.topicId, normalizedFilters.topicId));
  }

  if (normalizedFilters.minQuestions !== null) {
    conditions.push(gte(Roadmap.qCount, normalizedFilters.minQuestions));
  }

  if (normalizedFilters.maxQuestions !== null) {
    conditions.push(lte(Roadmap.qCount, normalizedFilters.maxQuestions));
  }

  if (normalizedFilters.status === 'active') {
    conditions.push(eq(Roadmap.isActive, true));
  } else if (normalizedFilters.status === 'inactive') {
    conditions.push(eq(Roadmap.isActive, false));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const sortColumnMap: Record<RoadmapSortInput['column'], any> = {
    id: Roadmap.id,
    name: Roadmap.name,
    platformId: Roadmap.platformId,
    subjectId: Roadmap.subjectId,
    topicId: Roadmap.topicId,
    platformName: Platform.name,
    subjectName: Subject.name,
    topicName: Topic.name,
    qCount: Roadmap.qCount,
    status: Roadmap.isActive,
  };

  const orderExpressions: any[] = [];
  if (normalizedSort) {
    const columnExpr = sortColumnMap[normalizedSort.column];
    if (columnExpr) {
      orderExpressions.push(normalizedSort.direction === 'desc' ? desc(columnExpr) : asc(columnExpr));
    }
  }

  if (!normalizedSort || normalizedSort.column !== 'id') {
    orderExpressions.push(asc(Roadmap.id));
  }

  const result = await roadmapQueryRepository.getPaginatedData({
    page,
    pageSize,
    where: () => whereClause,
    orderBy: () => orderExpressions,
  });

  const items = result.data.map(({ roadmap, platformName, subjectName, topicName }) =>
    normalizeRoadmap({
      ...roadmap,
      platformName: platformName ?? null,
      subjectName: subjectName ?? null,
      topicName: topicName ?? null,
    }),
  );

  return {
    items,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  };
}

export async function createRoadmap(input: unknown) {
  const payload = normalizeInput(await roadmapPayloadSchema.parseAsync(input));

  const platform = await platformRepository.getById((table) => table.id, payload.platformId);
  if (!platform) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Platform not found' });
  }

  const subjectRow = await subjectRepository.getById((table) => table.id, payload.subjectId);
  if (!subjectRow) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Subject not found' });
  }

  if (subjectRow.platformId !== payload.platformId) {
    throw new ActionError({
      code: 'BAD_REQUEST',
      message: 'Subject does not belong to the selected platform',
    });
  }

  const topicRow = await topicRepository.getById((table) => table.id, payload.topicId);
  if (!topicRow) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Topic not found' });
  }

  if (topicRow.platformId !== payload.platformId || topicRow.subjectId !== payload.subjectId) {
    throw new ActionError({
      code: 'BAD_REQUEST',
      message: 'Topic does not align with the selected platform and subject',
    });
  }

  try {
    const inserted = await roadmapRepository.insert({
      platformId: payload.platformId,
      subjectId: payload.subjectId,
      topicId: payload.topicId,
      name: payload.name,
      isActive: payload.isActive,
      qCount: payload.qCount,
    });

    const record = inserted?.[0];
    if (!record) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Unable to create roadmap' });
    }

    const enriched = await roadmapQueryRepository.getById((table) => table.id, record.id);
    const result =
      enriched ??
      ({
        roadmap: record,
        platformName: platform.name ?? null,
        subjectName: subjectRow.name ?? null,
        topicName: topicRow.name ?? null,
      } as const);

    return normalizeRoadmap({
      ...result.roadmap,
      platformName: result.platformName ?? null,
      subjectName: result.subjectName ?? null,
      topicName: result.topicName ?? null,
    });
  } catch (err: unknown) {
    if (err instanceof ActionError) {
      throw err;
    }

    throw new ActionError({
      code: 'BAD_REQUEST',
      message: (err as Error)?.message ?? 'Unable to create roadmap',
    });
  }
}

const updateRoadmapSchema = z.object({
  id: z.number().int().min(1),
  data: roadmapPayloadSchema,
});

export type UpdateRoadmapInput = z.infer<typeof updateRoadmapSchema>;

export async function updateRoadmap(input: unknown) {
  const { id, data } = await updateRoadmapSchema.parseAsync(input ?? {});
  const payload = normalizeInput(data);

  const platform = await platformRepository.getById((table) => table.id, payload.platformId);
  if (!platform) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Platform not found' });
  }

  const subjectRow = await subjectRepository.getById((table) => table.id, payload.subjectId);
  if (!subjectRow) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Subject not found' });
  }

  if (subjectRow.platformId !== payload.platformId) {
    throw new ActionError({
      code: 'BAD_REQUEST',
      message: 'Subject does not belong to the selected platform',
    });
  }

  const topicRow = await topicRepository.getById((table) => table.id, payload.topicId);
  if (!topicRow) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Topic not found' });
  }

  if (topicRow.platformId !== payload.platformId || topicRow.subjectId !== payload.subjectId) {
    throw new ActionError({
      code: 'BAD_REQUEST',
      message: 'Topic does not align with the selected platform and subject',
    });
  }

  const updated = await roadmapRepository.update(
    {
      platformId: payload.platformId,
      subjectId: payload.subjectId,
      topicId: payload.topicId,
      name: payload.name,
      isActive: payload.isActive,
      qCount: payload.qCount,
    },
    (table) => eq(table.id, id),
  );

  const record = updated?.[0];
  if (!record) {
    throw new ActionError({ code: 'NOT_FOUND', message: 'Roadmap not found' });
  }

  const enriched = await roadmapQueryRepository.getById((table) => table.id, record.id);
  const result =
    enriched ??
    ({
      roadmap: record,
      platformName: platform.name ?? null,
      subjectName: subjectRow.name ?? null,
      topicName: topicRow.name ?? null,
    } as const);

  return normalizeRoadmap({
    ...result.roadmap,
    platformName: result.platformName ?? null,
    subjectName: result.subjectName ?? null,
    topicName: result.topicName ?? null,
  });
}

const deleteRoadmapSchema = z.object({ id: z.number().int().min(1) });

export type DeleteRoadmapInput = z.infer<typeof deleteRoadmapSchema>;

export async function deleteRoadmap(input: unknown) {
  const { id } = await deleteRoadmapSchema.parseAsync(input ?? {});

  try {
    const deleted = await roadmapRepository.delete((table) => eq(table.id, id));

    if (!deleted?.[0]) {
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
}

const singleRoadmapSchema = z.object({ id: z.number().int().min(1) });

export async function getRoadmapById(input: unknown) {
  const { id } = await singleRoadmapSchema.parseAsync(input ?? {});
  const record = await roadmapQueryRepository.getById((table) => table.id, id);

  if (!record) {
    throw new ActionError({ code: 'NOT_FOUND', message: 'Roadmap not found' });
  }

  return normalizeRoadmap({
    ...record.roadmap,
    platformName: record.platformName ?? null,
    subjectName: record.subjectName ?? null,
    topicName: record.topicName ?? null,
  });
}

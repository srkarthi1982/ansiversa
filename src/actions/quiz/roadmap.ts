import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { db, Roadmap, Topic, Subject, Platform, and, asc, count, desc, eq, gte, lte, sql } from 'astro:db';

type SqlCondition = NonNullable<Parameters<typeof and>[number]>;

type RoadmapRow = typeof Roadmap.$inferSelect;

const normalizeRoadmap = (
  row: RoadmapRow & { topicName?: string | null; subjectName?: string | null; platformName?: string | null }
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

    let totalQuery = db.select({ value: count() }).from(Roadmap);
    if (whereClause) {
      totalQuery = totalQuery.where(whereClause);
    }
    const totalResult = await totalQuery;
    const total = totalResult[0]?.value ?? 0;

    const safePageSize = pageSize;
    const totalPages = total > 0 ? Math.ceil(total / safePageSize) : 0;
    const maxPage = totalPages > 0 ? totalPages : 1;
    const currentPage = Math.min(Math.max(page, 1), maxPage);
    const offset = total === 0 ? 0 : (currentPage - 1) * safePageSize;

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

    let query = db
      .select({
        roadmap: Roadmap,
        platformName: Platform.name,
        subjectName: Subject.name,
        topicName: Topic.name,
      })
      .from(Roadmap)
      .leftJoin(Platform, eq(Roadmap.platformId, Platform.id))
      .leftJoin(Subject, eq(Roadmap.subjectId, Subject.id))
      .leftJoin(Topic, eq(Roadmap.topicId, Topic.id));

    if (whereClause) {
      query = query.where(whereClause);
    }

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

    const roadmaps = await query.orderBy(...orderExpressions).limit(safePageSize).offset(offset);

    const items = roadmaps.map(({ roadmap, platformName, subjectName, topicName }) =>
      normalizeRoadmap({
        ...roadmap,
        platformName: platformName ?? null,
        subjectName: subjectName ?? null,
        topicName: topicName ?? null,
      })
    );

    return {
      items,
      total,
      page: total === 0 ? 1 : currentPage,
      pageSize: safePageSize,
    };
  },
});

export const createRoadmap = defineAction({
  input: roadmapPayloadSchema,
  async handler(input) {
    const payload = normalizeInput(input);

    const platform = await db
      .select({ id: Platform.id, name: Platform.name })
      .from(Platform)
      .where(eq(Platform.id, payload.platformId))
      .limit(1);

    if (!platform[0]) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Platform not found' });
    }

    const subject = await db
      .select({ id: Subject.id, platformId: Subject.platformId, name: Subject.name })
      .from(Subject)
      .where(eq(Subject.id, payload.subjectId))
      .limit(1);

    const subjectRow = subject[0];
    if (!subjectRow) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Subject not found' });
    }

    if (subjectRow.platformId !== payload.platformId) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Subject does not belong to the selected platform' });
    }

    const topic = await db
      .select({ id: Topic.id, platformId: Topic.platformId, subjectId: Topic.subjectId, name: Topic.name })
      .from(Topic)
      .where(eq(Topic.id, payload.topicId))
      .limit(1);

    const topicRow = topic[0];
    if (!topicRow) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Topic not found' });
    }

    if (topicRow.platformId !== payload.platformId || topicRow.subjectId !== payload.subjectId) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Topic does not align with the selected platform and subject' });
    }

    const inserted = await db
      .insert(Roadmap)
      .values({
        platformId: payload.platformId,
        subjectId: payload.subjectId,
        topicId: payload.topicId,
        name: payload.name,
        isActive: payload.isActive,
        qCount: payload.qCount,
      })
      .returning()
      .catch((err) => {
        throw new ActionError({ code: 'BAD_REQUEST', message: err?.message ?? 'Unable to create roadmap' });
      });

    const record = inserted?.[0];
    if (!record) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Unable to create roadmap' });
    }

    return normalizeRoadmap({
      ...record,
      platformName: platform[0]?.name ?? null,
      subjectName: subjectRow?.name ?? null,
      topicName: topicRow?.name ?? null,
    });
  },
});

export const updateRoadmap = defineAction({
  input: roadmapPayloadSchema.extend({
    id: z.number().int().min(1, 'Roadmap id is required'),
  }),
  async handler(input) {
    const payload = normalizeInput(input);
    const { id } = input;

    const platform = await db
      .select({ id: Platform.id, name: Platform.name })
      .from(Platform)
      .where(eq(Platform.id, payload.platformId))
      .limit(1);

    if (!platform[0]) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Platform not found' });
    }

    const subject = await db
      .select({ id: Subject.id, platformId: Subject.platformId, name: Subject.name })
      .from(Subject)
      .where(eq(Subject.id, payload.subjectId))
      .limit(1);

    const subjectRow = subject[0];
    if (!subjectRow) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Subject not found' });
    }

    if (subjectRow.platformId !== payload.platformId) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Subject does not belong to the selected platform' });
    }

    const topic = await db
      .select({ id: Topic.id, platformId: Topic.platformId, subjectId: Topic.subjectId, name: Topic.name })
      .from(Topic)
      .where(eq(Topic.id, payload.topicId))
      .limit(1);

    const topicRow = topic[0];
    if (!topicRow) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Topic not found' });
    }

    if (topicRow.platformId !== payload.platformId || topicRow.subjectId !== payload.subjectId) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Topic does not align with the selected platform and subject' });
    }

    const updated = await db
      .update(Roadmap)
      .set({
        platformId: payload.platformId,
        subjectId: payload.subjectId,
        topicId: payload.topicId,
        name: payload.name,
        isActive: payload.isActive,
        qCount: payload.qCount,
      })
      .where(eq(Roadmap.id, id))
      .returning();

    const record = updated?.[0];
    if (!record) {
      throw new ActionError({ code: 'NOT_FOUND', message: 'Roadmap not found' });
    }

    return normalizeRoadmap({
      ...record,
      platformName: platform[0]?.name ?? null,
      subjectName: subjectRow?.name ?? null,
      topicName: topicRow?.name ?? null,
    });
  },
});

export const deleteRoadmap = defineAction({
  input: z.object({
    id: z.number().int().min(1, 'Roadmap id is required'),
  }),
  async handler({ id }) {
    const deleted = await db.delete(Roadmap).where(eq(Roadmap.id, id)).returning({ id: Roadmap.id });

    if (!deleted?.[0]) {
      throw new ActionError({ code: 'NOT_FOUND', message: 'Roadmap not found' });
    }

    return { ok: true };
  },
});

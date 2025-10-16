import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { db, Subject, Platform, and, count, eq, gte, lte, sql } from 'astro:db';

type SqlCondition = NonNullable<Parameters<typeof and>[number]>;

type SubjectRow = typeof Subject.$inferSelect;

const normalizeSubject = (row: SubjectRow & { platformName?: string | null }) => ({
  id: row.id,
  platformId: row.platformId,
  name: row.name,
  isActive: row.isActive,
  qCount: row.qCount ?? 0,
  platformName: row.platformName ?? null,
});

const subjectPayloadSchema = z.object({
  platformId: z.number().int().min(1, 'Platform is required'),
  name: z.string().min(1, 'Name is required'),
  isActive: z.boolean().optional(),
  qCount: z.number().int().min(0).optional(),
});

const subjectFiltersSchema = z.object({
  name: z.string().optional(),
  platformId: z.number().int().min(1).optional(),
  minQuestions: z.number().int().min(0).optional(),
  maxQuestions: z.number().int().min(0).optional(),
  status: z.enum(['all', 'active', 'inactive']).optional(),
});

type SubjectFiltersInput = z.infer<typeof subjectFiltersSchema>;

const normalizeInput = (input: z.infer<typeof subjectPayloadSchema>) => {
  const name = input.name.trim();
  if (!name) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Name is required' });
  }

  const platformId = input.platformId;
  if (!Number.isFinite(platformId) || platformId <= 0) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Platform is required' });
  }

  const qCountSource = input.qCount ?? 0;
  const qCount = Math.max(0, Number.isFinite(qCountSource) ? qCountSource : 0);
  const isActive = input.isActive ?? true;

  return { platformId: Math.floor(platformId), name, qCount, isActive };
};

const normalizeFilters = (filters?: SubjectFiltersInput) => {
  const safe = filters ?? {};
  const name = safe.name?.trim() ?? '';
  const platformId = safe.platformId && Number.isFinite(safe.platformId) ? Math.floor(safe.platformId) : null;
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
    minQuestions,
    maxQuestions,
    status,
  };
};

export const fetchSubjects = defineAction({
  input: z.object({
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(48).default(10),
    filters: subjectFiltersSchema.optional(),
  }),
  async handler({ page, pageSize, filters }) {
    const normalizedFilters = normalizeFilters(filters);
    const conditions: SqlCondition[] = [];

    if (normalizedFilters.name) {
      conditions.push(sql`lower(${Subject.name}) LIKE ${`%${normalizedFilters.name.toLowerCase()}%`}`);
    }

    if (normalizedFilters.platformId !== null) {
      conditions.push(eq(Subject.platformId, normalizedFilters.platformId));
    }

    if (normalizedFilters.minQuestions !== null) {
      conditions.push(gte(Subject.qCount, normalizedFilters.minQuestions));
    }

    if (normalizedFilters.maxQuestions !== null) {
      conditions.push(lte(Subject.qCount, normalizedFilters.maxQuestions));
    }

    if (normalizedFilters.status === 'active') {
      conditions.push(eq(Subject.isActive, true));
    } else if (normalizedFilters.status === 'inactive') {
      conditions.push(eq(Subject.isActive, false));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let totalQuery = db.select({ value: count() }).from(Subject);
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

    let query = db
      .select({ subject: Subject, platformName: Platform.name })
      .from(Subject)
      .leftJoin(Platform, eq(Subject.platformId, Platform.id));

    if (whereClause) {
      query = query.where(whereClause);
    }

    const subjects = await query
      .orderBy(Subject.id)
      .limit(safePageSize)
      .offset(offset);

    const items = subjects.map(({ subject, platformName }) =>
      normalizeSubject({ ...subject, platformName: platformName ?? null })
    );

    return {
      items,
      total,
      page: total === 0 ? 1 : currentPage,
      pageSize: safePageSize,
    };
  },
});

export const createSubject = defineAction({
  input: subjectPayloadSchema,
  async handler(input) {
    const payload = normalizeInput(input);

    const platform = await db
      .select({ id: Platform.id })
      .from(Platform)
      .where(eq(Platform.id, payload.platformId))
      .limit(1);

    if (!platform[0]) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Platform not found' });
    }

    const inserted = await db
      .insert(Subject)
      .values({
        platformId: payload.platformId,
        name: payload.name,
        isActive: payload.isActive,
        qCount: payload.qCount,
      })
      .returning()
      .catch((err) => {
        throw new ActionError({ code: 'BAD_REQUEST', message: err?.message ?? 'Unable to create subject' });
      });

    const record = inserted?.[0];
    if (!record) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Unable to create subject' });
    }

    return normalizeSubject({ ...record });
  },
});

export const updateSubject = defineAction({
  input: subjectPayloadSchema.extend({
    id: z.number().int().min(1, 'Subject id is required'),
  }),
  async handler(input) {
    const payload = normalizeInput(input);
    const { id } = input;

    const platform = await db
      .select({ id: Platform.id })
      .from(Platform)
      .where(eq(Platform.id, payload.platformId))
      .limit(1);

    if (!platform[0]) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Platform not found' });
    }

    const updated = await db
      .update(Subject)
      .set({
        platformId: payload.platformId,
        name: payload.name,
        isActive: payload.isActive,
        qCount: payload.qCount,
      })
      .where(eq(Subject.id, id))
      .returning();

    const record = updated?.[0];
    if (!record) {
      throw new ActionError({ code: 'NOT_FOUND', message: 'Subject not found' });
    }

    return normalizeSubject({ ...record });
  },
});

export const deleteSubject = defineAction({
  input: z.object({
    id: z.number().int().min(1, 'Subject id is required'),
  }),
  async handler({ id }) {
    const deleted = await db
      .delete(Subject)
      .where(eq(Subject.id, id))
      .returning({ id: Subject.id });

    if (!deleted?.[0]) {
      throw new ActionError({ code: 'NOT_FOUND', message: 'Subject not found' });
    }

    return { ok: true };
  },
});

import { ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { Subject, Platform, and, asc, desc, eq, gte, lte, sql } from 'astro:db';
import { platformRepository, subjectQueryRepository, subjectRepository } from './repositories';

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

export const subjectPayloadSchema = z.object({
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

const subjectSortSchema = z.object({
  column: z.enum(['name', 'platformName', 'platformId', 'qCount', 'status', 'id']),
  direction: z.enum(['asc', 'desc']).default('asc'),
});

type SubjectSortInput = z.infer<typeof subjectSortSchema>;

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

export const fetchSubjectsInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(48).default(10),
  filters: subjectFiltersSchema.optional(),
  sort: subjectSortSchema.optional(),
});

export type FetchSubjectsInput = z.infer<typeof fetchSubjectsInputSchema>;
export type SubjectPayload = z.infer<typeof subjectPayloadSchema>;

export async function fetchSubjects(input: unknown) {
  const { page, pageSize, filters, sort } = await fetchSubjectsInputSchema.parseAsync(input ?? {});

  const normalizedFilters = normalizeFilters(filters);
  const normalizedSort = sort ?? null;
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

  const sortColumnMap: Record<SubjectSortInput['column'], any> = {
    id: Subject.id,
    name: Subject.name,
    platformId: Subject.platformId,
    platformName: Platform.name,
    qCount: Subject.qCount,
    status: Subject.isActive,
  };

  const orderExpressions: any[] = [];
  if (normalizedSort) {
    const columnExpr = sortColumnMap[normalizedSort.column];
    if (columnExpr) {
      orderExpressions.push(normalizedSort.direction === 'desc' ? desc(columnExpr) : asc(columnExpr));
    }
  }

  if (!normalizedSort || normalizedSort.column !== 'id') {
    orderExpressions.push(asc(Subject.id));
  }

  const result = await subjectQueryRepository.getPaginatedData({
    page,
    pageSize,
    where: () => whereClause,
    orderBy: () => orderExpressions,
  });

  const items = result.data.map(({ subject, platformName }) =>
    normalizeSubject({ ...subject, platformName: platformName ?? null }),
  );

  return {
    items,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  };
}

export async function createSubject(input: unknown) {
  const payload = normalizeInput(await subjectPayloadSchema.parseAsync(input));

  const platform = await platformRepository.getById((table) => table.id, payload.platformId);

  if (!platform) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Platform not found' });
  }

  try {
    const inserted = await subjectRepository.insert({
      platformId: payload.platformId,
      name: payload.name,
      isActive: payload.isActive,
      qCount: payload.qCount,
    });

    const record = inserted?.[0];
    if (!record) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Unable to create subject' });
    }

    const enriched = await subjectQueryRepository.getById((table) => table.id, record.id);
    const result = enriched ?? { subject: record, platformName: platform.name ?? null };

    return normalizeSubject({ ...result.subject, platformName: result.platformName ?? null });
  } catch (err: unknown) {
    if (err instanceof ActionError) {
      throw err;
    }

    throw new ActionError({
      code: 'BAD_REQUEST',
      message: (err as Error)?.message ?? 'Unable to create subject',
    });
  }
}

const updateSubjectSchema = z.object({
  id: z.number().int().min(1),
  data: subjectPayloadSchema,
});

export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;

export async function updateSubject(input: unknown) {
  const { id, data } = await updateSubjectSchema.parseAsync(input ?? {});
  const payload = normalizeInput(data);

  const platform = await platformRepository.getById((table) => table.id, payload.platformId);
  if (!platform) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Platform not found' });
  }

  const updated = await subjectRepository.update(
    {
      platformId: payload.platformId,
      name: payload.name,
      isActive: payload.isActive,
      qCount: payload.qCount,
    },
    (table) => eq(table.id, id),
  );

  const record = updated?.[0];
  if (!record) {
    throw new ActionError({ code: 'NOT_FOUND', message: 'Subject not found' });
  }

  const enriched = await subjectQueryRepository.getById((table) => table.id, record.id);
  const result = enriched ?? { subject: record, platformName: platform.name ?? null };

  return normalizeSubject({ ...result.subject, platformName: result.platformName ?? null });
}

const deleteSubjectSchema = z.object({ id: z.number().int().min(1) });

export type DeleteSubjectInput = z.infer<typeof deleteSubjectSchema>;

export async function deleteSubject(input: unknown) {
  const { id } = await deleteSubjectSchema.parseAsync(input ?? {});

  try {
    const deleted = await subjectRepository.delete((table) => eq(table.id, id));

    if (!deleted?.[0]) {
      throw new ActionError({ code: 'NOT_FOUND', message: 'Subject not found' });
    }

    return { success: true } as const;
  } catch (err: unknown) {
    if (err instanceof ActionError) {
      throw err;
    }

    throw new ActionError({
      code: 'BAD_REQUEST',
      message: (err as Error)?.message ?? 'Unable to delete subject',
    });
  }
}

const singleSubjectSchema = z.object({ id: z.number().int().min(1) });

export async function getSubjectById(input: unknown) {
  const { id } = await singleSubjectSchema.parseAsync(input ?? {});
  const record = await subjectQueryRepository.getById((table) => table.id, id);

  if (!record) {
    throw new ActionError({ code: 'NOT_FOUND', message: 'Subject not found' });
  }

  return normalizeSubject({
    ...record.subject,
    platformName: record.platformName ?? null,
  });
}

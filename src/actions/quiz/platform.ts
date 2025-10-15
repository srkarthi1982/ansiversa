import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { and, count, eq, gte, lte, sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { db, Platform } from 'astro:db';

type PlatformRow = typeof Platform.$inferSelect;

const normalizePlatform = (row: PlatformRow) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  isActive: row.isActive,
  icon: row.icon,
  type: row.type,
  qCount: row.qCount ?? 0,
});

const platformPayloadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  icon: z.string().optional(),
  type: z.string().nullable().optional(),
  qCount: z.number().int().min(0).optional(),
});

const platformFiltersSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  type: z.string().optional(),
  minQuestions: z.number().int().min(0).optional(),
  maxQuestions: z.number().int().min(0).optional(),
  status: z.enum(['all', 'active', 'inactive']).optional(),
});

type PlatformFiltersInput = z.infer<typeof platformFiltersSchema>;

const normalizeInput = (input: z.infer<typeof platformPayloadSchema>) => {
  const name = input.name.trim();
  if (!name) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Name is required' });
  }

  const description = (input.description ?? '').trim();
  const icon = (input.icon ?? '').trim();
  const typeRaw = input.type ?? null;
  const type = typeRaw ? typeRaw.trim() : null;
  const qCountSource = input.qCount ?? 0;
  const qCount = Math.max(0, Number.isFinite(qCountSource) ? qCountSource : 0);
  const isActive = input.isActive ?? true;

  return { name, description, icon, type: type || null, qCount, isActive };
};

const normalizeFilters = (filters?: PlatformFiltersInput) => {
  const safe = filters ?? {};
  const name = safe.name?.trim() ?? '';
  const description = safe.description?.trim() ?? '';
  const type = safe.type?.trim() ?? '';
  const hasMin = typeof safe.minQuestions === 'number' && Number.isFinite(safe.minQuestions);
  const hasMax = typeof safe.maxQuestions === 'number' && Number.isFinite(safe.maxQuestions);
  let minQuestions = hasMin ? Math.max(0, Math.floor(safe.minQuestions)) : null;
  let maxQuestions = hasMax ? Math.max(0, Math.floor(safe.maxQuestions)) : null;

  if (minQuestions !== null && maxQuestions !== null && maxQuestions < minQuestions) {
    const swappedMin = minQuestions;
    minQuestions = maxQuestions;
    maxQuestions = swappedMin;
  }

  const status = safe.status ?? 'all';

  return {
    name,
    description,
    type,
    minQuestions,
    maxQuestions,
    status,
  };
};

export const fetchPlatforms = defineAction({
  input: z.object({
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(48).default(6),
    filters: platformFiltersSchema.optional(),
  }),
  async handler({ page, pageSize, filters }) {
    const normalizedFilters = normalizeFilters(filters);
    const conditions: SQL[] = [];

    if (normalizedFilters.name) {
      conditions.push(sql`lower(${Platform.name}) LIKE ${`%${normalizedFilters.name.toLowerCase()}%`}`);
    }

    if (normalizedFilters.description) {
      conditions.push(sql`lower(${Platform.description}) LIKE ${`%${normalizedFilters.description.toLowerCase()}%`}`);
    }

    if (normalizedFilters.type) {
      conditions.push(sql`lower(coalesce(${Platform.type}, '')) LIKE ${`%${normalizedFilters.type.toLowerCase()}%`}`);
    }

    if (normalizedFilters.minQuestions !== null) {
      conditions.push(gte(Platform.qCount, normalizedFilters.minQuestions));
    }

    if (normalizedFilters.maxQuestions !== null) {
      conditions.push(lte(Platform.qCount, normalizedFilters.maxQuestions));
    }

    if (normalizedFilters.status === 'active') {
      conditions.push(eq(Platform.isActive, true));
    } else if (normalizedFilters.status === 'inactive') {
      conditions.push(eq(Platform.isActive, false));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let totalQuery = db.select({ value: count() }).from(Platform);
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

    let query = db.select().from(Platform);
    if (whereClause) {
      query = query.where(whereClause);
    }
    const platforms = await query
      .orderBy((row) => row.id)
      .limit(safePageSize)
      .offset(offset);

    return {
      items: platforms.map(normalizePlatform),
      total,
      page: total === 0 ? 1 : currentPage,
      pageSize: safePageSize,
    };
  },
});

export const createPlatform = defineAction({
  input: platformPayloadSchema,
  async handler(input) {
    const payload = normalizeInput(input);

    const inserted = await db
      .insert(Platform)
      .values({
        name: payload.name,
        description: payload.description,
        icon: payload.icon,
        type: payload.type,
        isActive: payload.isActive,
        qCount: payload.qCount,
      })
      .returning()
      .catch((err) => {
        throw new ActionError({ code: 'BAD_REQUEST', message: err?.message ?? 'Unable to create platform' });
      });

    const record = inserted?.[0];
    if (!record) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Unable to create platform' });
    }

    return normalizePlatform(record);
  },
});

export const updatePlatform = defineAction({
  input: platformPayloadSchema.extend({
    id: z.number().int().min(1, 'Platform id is required'),
  }),
  async handler(input) {
    const payload = normalizeInput(input);
    const { id } = input;

    const updated = await db
      .update(Platform)
      .set({
        name: payload.name,
        description: payload.description,
        icon: payload.icon,
        type: payload.type,
        isActive: payload.isActive,
        qCount: payload.qCount,
      })
      .where(eq(Platform.id, id))
      .returning();

    const record = updated?.[0];
    if (!record) {
      throw new ActionError({ code: 'NOT_FOUND', message: 'Platform not found' });
    }

    return normalizePlatform(record);
  },
});

export const deletePlatform = defineAction({
  input: z.object({
    id: z.number().int().min(1, 'Platform id is required'),
  }),
  async handler({ id }) {
    const deleted = await db
      .delete(Platform)
      .where(eq(Platform.id, id))
      .returning({ id: Platform.id });

    if (!deleted?.[0]) {
      throw new ActionError({ code: 'NOT_FOUND', message: 'Platform not found' });
    }

    return { ok: true };
  },
});

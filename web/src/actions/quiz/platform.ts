import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import type { Platform } from '@ansiversa/db';
import { platformRepository, quizAdminRepository } from './repositories';

type PlatformFiltersInput = {
  name?: string;
  description?: string;
  type?: string;
  minQuestions?: number;
  maxQuestions?: number;
  status?: 'all' | 'active' | 'inactive';
};

type PlatformSortInput = {
  column: 'name' | 'description' | 'type' | 'qCount' | 'status' | 'id';
  direction: 'asc' | 'desc';
};

const normalizePlatform = (row: Platform) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  icon: row.icon,
  type: row.type,
  qCount: row.qCount ?? 0,
  isActive: row.isActive,
});

const platformPayloadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  type: z.string().nullable().optional(),
  qCount: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

const platformFiltersSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  type: z.string().optional(),
  minQuestions: z.number().int().min(0).optional(),
  maxQuestions: z.number().int().min(0).optional(),
  status: z.enum(['all', 'active', 'inactive']).optional(),
});

const platformSortSchema = z.object({
  column: z.enum(['name', 'description', 'type', 'qCount', 'status', 'id']),
  direction: z.enum(['asc', 'desc']).default('asc'),
});

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

  return {
    name,
    description,
    icon,
    type: type || null,
    qCount,
    isActive,
  };
};

const normalizeFilters = (filters?: PlatformFiltersInput) => {
  const safe = filters ?? {};
  const name = safe.name?.trim() ?? '';
  const description = safe.description?.trim() ?? '';
  const type = safe.type?.trim() ?? '';
  const hasMin = typeof safe.minQuestions === 'number' && Number.isFinite(safe.minQuestions) && safe.minQuestions > 0;
  const hasMax = typeof safe.maxQuestions === 'number' && Number.isFinite(safe.maxQuestions) && safe.maxQuestions > 0;
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
    pageSize: z.number().int().min(1).max(48).default(10),
    filters: platformFiltersSchema.optional(),
    sort: platformSortSchema.optional(),
  }),
  async handler({ page, pageSize, filters, sort }) {
    const normalizedFilters = normalizeFilters(filters);
    const normalizedSort = sort ?? null;

    const result = await quizAdminRepository.searchPlatforms({
      page,
      pageSize,
      name: normalizedFilters.name || null,
      description: normalizedFilters.description || null,
      type: normalizedFilters.type || null,
      minQuestions: normalizedFilters.minQuestions,
      maxQuestions: normalizedFilters.maxQuestions,
      status: normalizedFilters.status,
      sortColumn: normalizedSort?.column,
      sortDirection: normalizedSort?.direction,
    });

    return {
      items: result.data.map(normalizePlatform),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  },
});

export const createPlatform = defineAction({
  input: platformPayloadSchema,
  async handler(input) {
    const payload = normalizeInput(input);

    try {
      const inserted = await platformRepository.create({
        name: payload.name,
        description: payload.description,
        icon: payload.icon,
        type: payload.type ?? undefined,
        qCount: payload.qCount,
        isActive: payload.isActive,
      });

      return normalizePlatform(inserted);
    } catch (err: unknown) {
      throw new ActionError({
        code: 'BAD_REQUEST',
        message: (err as Error)?.message ?? 'Unable to create platform',
      });
    }
  },
});

export const updatePlatform = defineAction({
  input: z.object({
    id: z.number().int().min(1),
    data: platformPayloadSchema,
  }),
  async handler({ id, data }) {
    const payload = normalizeInput(data);

    const existing = await platformRepository.getById(id);
    if (!existing) {
      throw new ActionError({ code: 'NOT_FOUND', message: 'Platform not found' });
    }

    try {
      const updated = await platformRepository.update(id, {
        name: payload.name,
        description: payload.description,
        icon: payload.icon,
        type: payload.type ?? undefined,
        qCount: payload.qCount,
        isActive: payload.isActive,
      });

      if (!updated) {
        throw new ActionError({ code: 'NOT_FOUND', message: 'Platform not found' });
      }

      return normalizePlatform(updated);
    } catch (err: unknown) {
      if (err instanceof ActionError) {
        throw err;
      }
      throw new ActionError({
        code: 'BAD_REQUEST',
        message: (err as Error)?.message ?? 'Unable to update platform',
      });
    }
  },
});

export const deletePlatform = defineAction({
  input: z.object({ id: z.number().int().min(1) }),
  async handler({ id }) {
    try {
      const deleted = await platformRepository.delete(id);

      if (!deleted) {
        throw new ActionError({ code: 'NOT_FOUND', message: 'Platform not found' });
      }

      return { success: true } as const;
    } catch (err: unknown) {
      if (err instanceof ActionError) {
        throw err;
      }

      throw new ActionError({
        code: 'BAD_REQUEST',
        message: (err as Error)?.message ?? 'Unable to delete platform',
      });
    }
  },
});

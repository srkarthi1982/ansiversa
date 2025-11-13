import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import type { Subject } from '@ansiversa/db';
import {
  platformRepository,
  quizAdminRepository,
  subjectRepository,
} from './repositories';

type SubjectFiltersInput = {
  name?: string;
  platformId?: number;
  minQuestions?: number;
  maxQuestions?: number;
  status?: 'all' | 'active' | 'inactive';
};

type SubjectSortInput = {
  column: 'name' | 'platformName' | 'platformId' | 'qCount' | 'status' | 'id';
  direction: 'asc' | 'desc';
};

const normalizeSubject = (entry: { subject: Subject; platformName: string | null }) => ({
  id: entry.subject.id,
  platformId: entry.subject.platformId,
  name: entry.subject.name,
  isActive: entry.subject.isActive,
  qCount: entry.subject.qCount ?? 0,
  platformName: entry.platformName ?? null,
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

const subjectSortSchema = z.object({
  column: z.enum(['name', 'platformName', 'platformId', 'qCount', 'status', 'id']),
  direction: z.enum(['asc', 'desc']).default('asc'),
});

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
    sort: subjectSortSchema.optional(),
  }),
  async handler({ page, pageSize, filters, sort }) {
    const normalizedFilters = normalizeFilters(filters);
    const normalizedSort = sort ?? null;

    const result = await quizAdminRepository.searchSubjects({
      page,
      pageSize,
      name: normalizedFilters.name || null,
      platformId: normalizedFilters.platformId,
      minQuestions: normalizedFilters.minQuestions,
      maxQuestions: normalizedFilters.maxQuestions,
      status: normalizedFilters.status,
      sortColumn: normalizedSort?.column,
      sortDirection: normalizedSort?.direction,
    });

    const items = result.data.map((entry) =>
      normalizeSubject({ subject: entry.subject, platformName: entry.platformName ?? null }),
    );

    return {
      items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  },
});

export const createSubject = defineAction({
  input: subjectPayloadSchema,
  async handler(input) {
    const payload = normalizeInput(input);

    const platform = await platformRepository.getById(payload.platformId);

    if (!platform) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Platform not found' });
    }

    try {
      const inserted = await subjectRepository.create({
        platformId: payload.platformId,
        name: payload.name,
        isActive: payload.isActive,
        qCount: payload.qCount,
      });

      const enriched = await quizAdminRepository.getSubjectDetails(inserted.id);
      if (!enriched) {
        return normalizeSubject({ subject: inserted, platformName: platform.name ?? null });
      }

      return normalizeSubject(enriched);
    } catch (err: unknown) {
      throw new ActionError({
        code: 'BAD_REQUEST',
        message: (err as Error)?.message ?? 'Unable to create subject',
      });
    }
  },
});

export const updateSubject = defineAction({
  input: z.object({
    id: z.number().int().min(1),
    data: subjectPayloadSchema,
  }),
  async handler({ id, data }) {
    const payload = normalizeInput(data);

    const platform = await platformRepository.getById(payload.platformId);
    if (!platform) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Platform not found' });
    }

    const existing = await subjectRepository.getById(id);
    if (!existing) {
      throw new ActionError({ code: 'NOT_FOUND', message: 'Subject not found' });
    }

    try {
      const updated = await subjectRepository.update(id, {
        platformId: payload.platformId,
        name: payload.name,
        isActive: payload.isActive,
        qCount: payload.qCount,
      });

      if (!updated) {
        throw new ActionError({ code: 'NOT_FOUND', message: 'Subject not found' });
      }

      const enriched = await quizAdminRepository.getSubjectDetails(updated.id);
      if (!enriched) {
        return normalizeSubject({ subject: updated, platformName: platform.name ?? null });
      }

      return normalizeSubject(enriched);
    } catch (err: unknown) {
      if (err instanceof ActionError) {
        throw err;
      }
      throw new ActionError({
        code: 'BAD_REQUEST',
        message: (err as Error)?.message ?? 'Unable to update subject',
      });
    }
  },
});

export const deleteSubject = defineAction({
  input: z.object({ id: z.number().int().min(1) }),
  async handler({ id }) {
    try {
      const deleted = await subjectRepository.delete(id);

      if (!deleted) {
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
  },
});

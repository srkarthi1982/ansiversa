import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { count, eq } from 'drizzle-orm';
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

export const fetchPlatforms = defineAction({
  input: z.object({
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(48).default(6),
  }),
  async handler({ page, pageSize }) {
    const totalResult = await db.select({ value: count() }).from(Platform);
    const total = totalResult[0]?.value ?? 0;

    const safePageSize = pageSize;
    const totalPages = total > 0 ? Math.ceil(total / safePageSize) : 0;
    const maxPage = totalPages > 0 ? totalPages : 1;
    const currentPage = Math.min(Math.max(page, 1), maxPage);
    const offset = total === 0 ? 0 : (currentPage - 1) * safePageSize;

    const platforms = await db
      .select()
      .from(Platform)
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

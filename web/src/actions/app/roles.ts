import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { Role, User, db, count } from 'astro:db';

const roleFiltersSchema = z.object({
  name: z.string().optional(),
});

type RoleFiltersInput = z.infer<typeof roleFiltersSchema>;

const normalizeFilters = (filters?: RoleFiltersInput) => {
  const safe = filters ?? {};
  return {
    name: safe.name?.trim() ?? '',
  };
};

const roleSortColumns = ['name', 'userCount', 'id'] as const;

const roleSortSchema = z.object({
  column: z.enum(roleSortColumns),
  direction: z.enum(['asc', 'desc']).default('asc'),
});

type RoleSortInput = z.infer<typeof roleSortSchema>;

type RoleRecord = {
  id: number;
  name: string;
  userCount: number;
};

const sortRoles = (items: RoleRecord[], sort?: RoleSortInput | null) => {
  if (!sort) {
    return [...items].sort((a, b) => a.id - b.id);
  }

  const { column, direction } = sort;
  const multiplier = direction === 'desc' ? -1 : 1;

  return [...items].sort((a, b) => {
    if (column === 'name') {
      return a.name.localeCompare(b.name) * multiplier;
    }
    if (column === 'userCount') {
      return (a.userCount - b.userCount) * multiplier;
    }
    return (a.id - b.id) * multiplier;
  });
};

const filterRoles = (items: RoleRecord[], filters: ReturnType<typeof normalizeFilters>) => {
  if (!filters.name) {
    return items;
  }

  const needle = filters.name.toLowerCase();
  return items.filter((role) => role.name.toLowerCase().includes(needle));
};

export const fetchRoles = defineAction({
  input: z.object({
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(100).default(10),
    filters: roleFiltersSchema.optional(),
    sort: roleSortSchema.optional(),
  }),
  async handler({ page, pageSize, filters, sort }) {
    const normalizedFilters = normalizeFilters(filters);

    const roles = await db.select().from(Role);

    const userCounts = await db
      .select({ roleId: User.roleId, total: count(User.id) })
      .from(User)
      .groupBy(User.roleId);

    const countMap = new Map<number, number>();
    for (const item of userCounts) {
      if (typeof item.roleId === 'number') {
        const totalValue = typeof item.total === 'bigint' ? Number(item.total) : Number(item.total ?? 0);
        countMap.set(item.roleId, Number.isFinite(totalValue) ? totalValue : 0);
      }
    }

    const roleRecords: RoleRecord[] = roles.map((role) => ({
      id: role.id,
      name: role.name,
      userCount: countMap.get(role.id) ?? 0,
    }));

    const filtered = filterRoles(roleRecords, normalizedFilters);

    const sorted = sortRoles(filtered, sort ?? null);

    const total = sorted.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
    const safePage = total === 0 ? 1 : Math.min(page, totalPages);
    const offset = Math.max(0, (safePage - 1) * pageSize);
    const items = sorted.slice(offset, offset + pageSize);

    return {
      items,
      total,
      page: safePage,
      pageSize,
    };
  },
});

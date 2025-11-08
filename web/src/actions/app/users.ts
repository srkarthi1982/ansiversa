import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { User, Role, and, asc, count, desc, eq, sql, db } from 'astro:db';

type SqlCondition = NonNullable<Parameters<typeof and>[number]>;

const userFiltersSchema = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
  plan: z.string().optional(),
  role: z.string().optional(),
  status: z.enum(['all', 'verified', 'unverified']).optional(),
});

type UserFiltersInput = z.infer<typeof userFiltersSchema>;

const userSortColumns = ['username', 'email', 'plan', 'role', 'createdAt'] as const;

const userSortSchema = z.object({
  column: z.enum(userSortColumns),
  direction: z.enum(['asc', 'desc']).default('asc'),
});

type UserSortInput = z.infer<typeof userSortSchema>;

type UserRow = {
  id: string;
  username: string;
  email: string;
  plan: string | null;
  emailVerifiedAt: Date | null;
  createdAt: Date | null;
  roleId: number | null;
  roleName: string | null;
};

const normalizeFilters = (filters?: UserFiltersInput) => {
  const safe = filters ?? {};
  return {
    username: safe.username?.trim() ?? '',
    email: safe.email?.trim() ?? '',
    plan: safe.plan?.trim() ?? '',
    role: safe.role?.trim() ?? '',
    status: safe.status ?? 'all',
  };
};

const buildWhereClause = (filters: ReturnType<typeof normalizeFilters>) => {
  const conditions: SqlCondition[] = [];

  if (filters.username) {
    conditions.push(sql`lower(${User.username}) LIKE ${`%${filters.username.toLowerCase()}%`}`);
  }

  if (filters.email) {
    conditions.push(sql`lower(${User.email}) LIKE ${`%${filters.email.toLowerCase()}%`}`);
  }

  if (filters.plan) {
    conditions.push(sql`lower(coalesce(${User.plan}, '')) LIKE ${`%${filters.plan.toLowerCase()}%`}`);
  }

  if (filters.role) {
    conditions.push(sql`lower(coalesce(${Role.name}, '')) LIKE ${`%${filters.role.toLowerCase()}%`}`);
  }

  if (filters.status === 'verified') {
    conditions.push(sql`${User.emailVerifiedAt} IS NOT NULL`);
  } else if (filters.status === 'unverified') {
    conditions.push(sql`${User.emailVerifiedAt} IS NULL`);
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
};

const normalizeUser = (row: UserRow) => ({
  id: row.id,
  username: row.username,
  email: row.email,
  plan: row.plan ?? 'free',
  emailVerifiedAt: row.emailVerifiedAt,
  createdAt: row.createdAt,
  roleId: row.roleId,
  roleName: row.roleName,
});

export const fetchUsers = defineAction({
  input: z.object({
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(100).default(10),
    filters: userFiltersSchema.optional(),
    sort: userSortSchema.optional(),
  }),
  async handler({ page, pageSize, filters, sort }) {
    const normalizedFilters = normalizeFilters(filters);
    const whereClause = buildWhereClause(normalizedFilters);

    const sortColumnMap: Record<UserSortInput['column'], any> = {
      username: User.username,
      email: User.email,
      plan: User.plan,
      role: Role.name,
      createdAt: User.createdAt,
    };

    const orderExpressions: any[] = [];
    if (sort) {
      const columnExpr = sortColumnMap[sort.column];
      if (!columnExpr) {
        throw new ActionError({ code: 'BAD_REQUEST', message: 'Invalid sort column provided.' });
      }
      orderExpressions.push(sort.direction === 'desc' ? desc(columnExpr) : asc(columnExpr));
    }

    if (!orderExpressions.some((expr) => expr === asc(User.id) || expr === desc(User.id))) {
      orderExpressions.push(asc(User.id));
    }

    const offset = Math.max(0, (page - 1) * pageSize);

    let query = db
      .select({
        id: User.id,
        username: User.username,
        email: User.email,
        plan: User.plan,
        emailVerifiedAt: User.emailVerifiedAt,
        createdAt: User.createdAt,
        roleId: User.roleId,
        roleName: Role.name,
      })
      .from(User)
      .leftJoin(Role, eq(User.roleId, Role.id));

    if (whereClause) {
      query = query.where(whereClause);
    }

    if (orderExpressions.length > 0) {
      query = query.orderBy(...orderExpressions);
    }

    query = query.limit(pageSize).offset(offset);

    const rows = (await query) as UserRow[];

    let countQuery = db.select({ value: count() }).from(User).leftJoin(Role, eq(User.roleId, Role.id));
    if (whereClause) {
      countQuery = countQuery.where(whereClause);
    }

    const countResult = await countQuery;
    const rawTotal = countResult[0]?.value ?? 0;
    const total = typeof rawTotal === 'number' ? rawTotal : Number(rawTotal);

    const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
    const safePage = total === 0 ? 1 : Math.min(page, totalPages);

    return {
      items: rows.map(normalizeUser),
      total,
      page: safePage,
      pageSize,
    };
  },
});

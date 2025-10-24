import { db, count, eq } from 'astro:db';
import type { AnyColumn, InferInsertModel, InferSelectModel, SQL, Table } from 'drizzle-orm';

export type WhereBuilder<TTable extends Table> = (table: TTable) => SQL | undefined;

export type OrderExpression = SQL | AnyColumn;
export type OrderByBuilder<TTable extends Table> = (
  table: TTable,
) => OrderExpression | OrderExpression[] | undefined;

export interface QueryOptions<TTable extends Table> {
  where?: WhereBuilder<TTable>;
  orderBy?: OrderByBuilder<TTable>;
  limit?: number;
  offset?: number;
}

export interface PaginationOptions<TTable extends Table> extends QueryOptions<TTable> {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<TData> {
  data: TData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

type UpdateValues<T> = {
  [K in keyof T]?: T[K] | undefined;
};

export class BaseRepository<
  TTable extends Table,
  TSelect extends Record<string, unknown> = InferSelectModel<TTable>,
  TInsert = InferInsertModel<TTable>,
> {
  constructor(protected readonly table: TTable) {}

  protected createSelectQuery() {
    return db.select().from(this.table);
  }

  protected createCountQuery() {
    return db.select({ value: count() }).from(this.table);
  }

  async insert(values: TInsert | TInsert[]): Promise<TSelect[]> {
    const payload = Array.isArray(values) ? values : [values];
    const rows = await db.insert(this.table).values(payload).returning();
    return rows as TSelect[];
  }

  async update(
    values: UpdateValues<TInsert>,
    where: WhereBuilder<TTable>,
  ): Promise<TSelect[]> {
    const condition = where(this.table);
    if (!condition) {
      throw new Error('Update operations require a where clause that returns a condition.');
    }

    const rows = await db.update(this.table).set(values).where(condition).returning();
    return rows as TSelect[];
  }

  async delete(where: WhereBuilder<TTable>): Promise<TSelect[]> {
    const condition = where(this.table);
    if (!condition) {
      throw new Error('Delete operations require a where clause that returns a condition.');
    }

    const rows = await db.delete(this.table).where(condition).returning();
    return rows as TSelect[];
  }

  async getData(options: QueryOptions<TTable> = {}): Promise<TSelect[]> {
    const { where, orderBy, limit, offset } = options;

    let query = this.createSelectQuery();

    const whereClause = where?.(this.table);
    if (whereClause) {
      query = query.where(whereClause);
    }

    const orderClause = orderBy?.(this.table);
    if (orderClause) {
      const clauses = Array.isArray(orderClause) ? orderClause : [orderClause];
      query = query.orderBy(...clauses);
    }

    if (typeof limit === 'number') {
      query = query.limit(limit);
    }

    if (typeof offset === 'number') {
      query = query.offset(offset);
    }

    const rows = await query;
    return rows as TSelect[];
  }

  async getById<TColumn extends AnyColumn>(
    columnSelector: (table: TTable) => TColumn,
    value: TColumn['_']['data'],
  ): Promise<TSelect | undefined> {
    const column = columnSelector(this.table);
    const rows = await this.createSelectQuery().where(eq(column, value)).limit(1);
    return rows[0] as TSelect | undefined;
  }

  async getPaginatedData(options: PaginationOptions<TTable> = {}): Promise<PaginatedResult<TSelect>> {
    const pageSize = Math.max(1, options.pageSize ?? options.limit ?? 20);
    const requestedPage = Math.max(1, options.page ?? 1);
    const whereClause = options.where?.(this.table);

    let totalQuery = this.createCountQuery();
    if (whereClause) {
      totalQuery = totalQuery.where(whereClause);
    }

    const totalResult = await totalQuery;
    const rawTotal = totalResult[0]?.value ?? 0;
    const total = typeof rawTotal === 'number' ? rawTotal : Number(rawTotal);

    const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;
    const maxPage = totalPages > 0 ? totalPages : 1;
    const page = Math.min(requestedPage, maxPage);
    const offset = options.offset ?? (total === 0 ? 0 : (page - 1) * pageSize);

    const data = await this.getData({
      ...options,
      limit: pageSize,
      offset,
    });

    return {
      data,
      total,
      page: total === 0 ? 1 : page,
      pageSize,
      totalPages,
      hasNextPage: totalPages > 0 && page < totalPages,
      hasPreviousPage: totalPages > 0 && page > 1,
    };
  }
}

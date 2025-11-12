import type { DbDriver, QueryParameter } from "../drivers/driver";
import type { PaginatedResult, PaginationOptions } from "../types/pagination";

const extractTotalCount = (row: Record<string, unknown> | undefined): number => {
  if (!row) {
    return 0;
  }

  const possibleKeys = ["total", "count", "value"];
  for (const key of possibleKeys) {
    const raw = row[key];
    if (typeof raw === "number") {
      return raw;
    }
    if (typeof raw === "string" && raw.trim().length > 0) {
      const parsed = Number(raw);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  const firstValue = Object.values(row)[0];
  if (typeof firstValue === "number") {
    return firstValue;
  }
  if (typeof firstValue === "string" && firstValue.trim().length > 0) {
    const parsed = Number(firstValue);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return 0;
};

export interface PaginatedQueryConfig<TRow, TResult> extends PaginationOptions {
  driver: DbDriver;
  countQuery: string;
  dataQuery: string;
  params?: QueryParameter[];
  mapRow: (row: TRow) => TResult;
}

export const runPaginatedQuery = async <TRow, TResult>(
  config: PaginatedQueryConfig<TRow, TResult>,
): Promise<PaginatedResult<TResult>> => {
  const { driver, countQuery, dataQuery, params = [], mapRow, page, pageSize } = config;

  const normalizedPageSize = Math.max(1, Math.trunc(pageSize ?? 20));
  const requestedPage = Math.max(1, Math.trunc(page ?? 1));

  const { rows: countRows } = await driver.query<Record<string, unknown>>(countQuery, params);
  const total = extractTotalCount(countRows[0]);

  const totalPages = total > 0 ? Math.ceil(total / normalizedPageSize) : 0;
  const maxPage = totalPages > 0 ? totalPages : 1;
  const selectedPage = total === 0 ? 1 : Math.min(requestedPage, maxPage);
  const offset = total === 0 ? 0 : (selectedPage - 1) * normalizedPageSize;

  const { rows } = await driver.query<TRow>(dataQuery, [...params, normalizedPageSize, offset]);
  const data = rows.map((row) => mapRow(row));

  return {
    data,
    total,
    page: total === 0 ? 1 : selectedPage,
    pageSize: normalizedPageSize,
    totalPages,
    hasNextPage: totalPages > 0 && selectedPage < totalPages,
    hasPreviousPage: totalPages > 0 && selectedPage > 1,
  };
};

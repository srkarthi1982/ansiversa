import { createClient, type Client, type ResultSet } from "@libsql/client/web";

import type { DbDriver, QueryParameter, QueryResult } from "./driver";

export interface AstroDbDriverOptions {
  url: string;
  authToken?: string;
}

export interface AstroDbDriver extends DbDriver {
  readonly client: Client;
}

const normalizeParams = (params: QueryParameter[] = []): QueryParameter[] =>
  params.map((param) => (param instanceof Date ? param.toISOString() : param));

const normalizeRows = <T>(result: ResultSet): QueryResult<T>["rows"] => {
  if (!result.columns || result.rows.length === 0) {
    return result.rows as unknown as T[];
  }

  return result.rows.map((row) => {
    if (Array.isArray(row)) {
      const record = Object.fromEntries(
        row.map((value, index) => [result.columns?.[index] ?? index.toString(), value]),
      );
      return record as T;
    }

    return row as unknown as T;
  });
};

export const createAstroDbDriver = (options: AstroDbDriverOptions): AstroDbDriver => {
  const { url, authToken } = options;
  const client = createClient({ url, authToken });

  return {
    client,
    async query<T>(sql: string, params: QueryParameter[] = []) {
      const result = await client.execute({ sql, args: normalizeParams(params) });
      const rows = normalizeRows<T>(result);
      return { rows };
    },
    async execute<T>(sql: string, params: QueryParameter[] = []) {
      const result = await client.execute({ sql, args: normalizeParams(params) });
      return result as unknown as T;
    },
  };
};

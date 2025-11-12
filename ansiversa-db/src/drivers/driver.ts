export type QueryParameter =
  | string
  | number
  | boolean
  | null
  | Uint8Array
  | Date;

export interface QueryResult<T = unknown> {
  rows: T[];
}

export interface DbDriver {
  query<T = unknown>(sql: string, params?: QueryParameter[]): Promise<QueryResult<T>>;
  execute<T = unknown>(sql: string, params?: QueryParameter[]): Promise<T>;
}

export type DriverFactory<TDriver extends DbDriver, TOptions = unknown> = (
  options: TOptions,
) => TDriver;

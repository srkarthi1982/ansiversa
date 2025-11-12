export interface PaginationOptions {
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

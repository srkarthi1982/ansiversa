import type { DbDriver, QueryParameter } from "../drivers/driver";
import { runPaginatedQuery } from "../utils/pagination";
import type { PaginatedResult, PaginationOptions } from "../types/pagination";
import {
  NewResultSchema,
  UpdateResultSchema,
  type NewResult,
  type UpdateResult,
  parseResult,
  type Result,
} from "../types/quiz";

export interface ResultListOptions extends PaginationOptions {
  userId?: string;
  platformId?: number;
  subjectId?: number | null;
  topicId?: number | null;
  roadmapId?: number | null;
  level?: Result["level"];
}

export interface ResultsRepo {
  list(): Promise<Result[]>;
  listByUser(userId: string): Promise<Result[]>;
  listByPlatform(platformId: number): Promise<Result[]>;
  listPaginated(options?: ResultListOptions): Promise<PaginatedResult<Result>>;
  getById(id: number): Promise<Result | null>;
  create(input: NewResult): Promise<Result>;
  update(id: number, input: UpdateResult): Promise<Result | null>;
  delete(id: number): Promise<Result | null>;
}

const returningColumns =
  "id, userId, platformId, subjectId, topicId, roadmapId, level, responses, mark, createdAt";
const baseSelect = `SELECT ${returningColumns} FROM Result`;

export const createResultsRepo = (driver: DbDriver): ResultsRepo => {
  const getSingle = async (id: number): Promise<Result | null> => {
    const { rows } = await driver.query(`${baseSelect} WHERE id = ? LIMIT 1`, [id]);
    if (rows.length === 0) {
      return null;
    }
    return parseResult(rows[0]);
  };

  return {
    async list() {
      const { rows } = await driver.query(`${baseSelect} ORDER BY createdAt DESC, id DESC`);
      return rows.map((row) => parseResult(row));
    },
    async listByUser(userId: string) {
      const { rows } = await driver.query(
        `${baseSelect} WHERE userId = ? ORDER BY createdAt DESC, id DESC`,
        [userId],
      );
      return rows.map((row) => parseResult(row));
    },
    async listByPlatform(platformId: number) {
      const { rows } = await driver.query(
        `${baseSelect} WHERE platformId = ? ORDER BY createdAt DESC, id DESC`,
        [platformId],
      );
      return rows.map((row) => parseResult(row));
    },
    async listPaginated(options: ResultListOptions = {}) {
      const conditions: string[] = [];
      const params: QueryParameter[] = [];

      if (options.userId !== undefined) {
        conditions.push("userId = ?");
        params.push(options.userId);
      }
      if (options.platformId !== undefined) {
        conditions.push("platformId = ?");
        params.push(options.platformId);
      }
      if (options.subjectId !== undefined) {
        if (options.subjectId === null) {
          conditions.push("subjectId IS NULL");
        } else {
          conditions.push("subjectId = ?");
          params.push(options.subjectId);
        }
      }
      if (options.topicId !== undefined) {
        if (options.topicId === null) {
          conditions.push("topicId IS NULL");
        } else {
          conditions.push("topicId = ?");
          params.push(options.topicId);
        }
      }
      if (options.roadmapId !== undefined) {
        if (options.roadmapId === null) {
          conditions.push("roadmapId IS NULL");
        } else {
          conditions.push("roadmapId = ?");
          params.push(options.roadmapId);
        }
      }
      if (options.level !== undefined) {
        conditions.push("level = ?");
        params.push(options.level);
      }

      const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";

      return runPaginatedQuery({
        driver,
        countQuery: `SELECT COUNT(*) as total FROM Result${whereClause}`,
        dataQuery: `${baseSelect}${whereClause} ORDER BY createdAt DESC, id DESC LIMIT ? OFFSET ?`,
        params,
        mapRow: parseResult,
        page: options.page,
        pageSize: options.pageSize,
      });
    },
    async getById(id: number) {
      return getSingle(id);
    },
    async create(input: NewResult) {
      const data = NewResultSchema.parse(input);
      const { rows } = await driver.query(
        `INSERT INTO Result (userId, platformId, subjectId, topicId, roadmapId, level, responses, mark)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING ${returningColumns}`,
        [
          data.userId,
          data.platformId,
          data.subjectId ?? null,
          data.topicId ?? null,
          data.roadmapId ?? null,
          data.level,
          data.responses !== undefined ? JSON.stringify(data.responses) : null,
          data.mark,
        ],
      );
      if (rows.length === 0) {
        throw new Error("Failed to insert result record");
      }
      return parseResult(rows[0]);
    },
    async update(id: number, input: UpdateResult) {
      const data = UpdateResultSchema.parse(input ?? {});
      const setClauses: string[] = [];
      const params: QueryParameter[] = [];

      if (data.userId !== undefined) {
        setClauses.push("userId = ?");
        params.push(data.userId);
      }
      if (data.platformId !== undefined) {
        setClauses.push("platformId = ?");
        params.push(data.platformId);
      }
      if (data.subjectId !== undefined) {
        setClauses.push("subjectId = ?");
        params.push(data.subjectId ?? null);
      }
      if (data.topicId !== undefined) {
        setClauses.push("topicId = ?");
        params.push(data.topicId ?? null);
      }
      if (data.roadmapId !== undefined) {
        setClauses.push("roadmapId = ?");
        params.push(data.roadmapId ?? null);
      }
      if (data.level !== undefined) {
        setClauses.push("level = ?");
        params.push(data.level);
      }
      if (data.responses !== undefined) {
        setClauses.push("responses = ?");
        params.push(data.responses !== undefined ? JSON.stringify(data.responses) : null);
      }
      if (data.mark !== undefined) {
        setClauses.push("mark = ?");
        params.push(data.mark);
      }

      if (setClauses.length === 0) {
        return getSingle(id);
      }

      const { rows } = await driver.query(
        `UPDATE Result SET ${setClauses.join(", ")} WHERE id = ? RETURNING ${returningColumns}`,
        [...params, id],
      );
      if (rows.length === 0) {
        return null;
      }
      return parseResult(rows[0]);
    },
    async delete(id: number) {
      const { rows } = await driver.query(
        `DELETE FROM Result WHERE id = ? RETURNING ${returningColumns}`,
        [id],
      );
      if (rows.length === 0) {
        return null;
      }
      return parseResult(rows[0]);
    },
  };
};

import type { DbDriver, QueryParameter } from "../drivers/driver";
import { runPaginatedQuery } from "../utils/pagination";
import { getNextNumericId } from "../utils/ids";
import type { PaginatedResult, PaginationOptions } from "../types/pagination";
import {
  NewTopicSchema,
  UpdateTopicSchema,
  type NewTopic,
  type UpdateTopic,
  parseTopic,
  type Topic,
} from "../types/quiz";

export interface TopicListOptions extends PaginationOptions {
  platformId?: number;
  subjectId?: number;
}

export interface TopicsRepo {
  list(): Promise<Topic[]>;
  listByPlatform(platformId: number): Promise<Topic[]>;
  listBySubject(subjectId: number): Promise<Topic[]>;
  listPaginated(options?: TopicListOptions): Promise<PaginatedResult<Topic>>;
  getById(id: number): Promise<Topic | null>;
  create(input: NewTopic): Promise<Topic>;
  update(id: number, input: UpdateTopic): Promise<Topic | null>;
  delete(id: number): Promise<Topic | null>;
}

const returningColumns = "id, platformId, subjectId, name, isActive, qCount";
const selectClause = `SELECT ${returningColumns} FROM Topic`;

export const createTopicsRepo = (driver: DbDriver): TopicsRepo => {
  const getSingle = async (id: number): Promise<Topic | null> => {
    const { rows } = await driver.query(`${selectClause} WHERE id = ? LIMIT 1`, [id]);
    if (rows.length === 0) {
      return null;
    }
    return parseTopic(rows[0]);
  };

  return {
    async list() {
      const { rows } = await driver.query(`${selectClause} ORDER BY name ASC`);
      return rows.map((row) => parseTopic(row));
    },
    async listByPlatform(platformId: number) {
      const { rows } = await driver.query(
        `${selectClause} WHERE platformId = ? ORDER BY name ASC`,
        [platformId],
      );
      return rows.map((row) => parseTopic(row));
    },
    async listBySubject(subjectId: number) {
      const { rows } = await driver.query(
        `${selectClause} WHERE subjectId = ? ORDER BY name ASC`,
        [subjectId],
      );
      return rows.map((row) => parseTopic(row));
    },
    async listPaginated(options: TopicListOptions = {}) {
      const conditions: string[] = [];
      const params: QueryParameter[] = [];

      if (options.platformId !== undefined) {
        conditions.push("platformId = ?");
        params.push(options.platformId);
      }
      if (options.subjectId !== undefined) {
        conditions.push("subjectId = ?");
        params.push(options.subjectId);
      }

      const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";

      return runPaginatedQuery({
        driver,
        countQuery: `SELECT COUNT(*) as total FROM Topic${whereClause}`,
        dataQuery: `${selectClause}${whereClause} ORDER BY name ASC LIMIT ? OFFSET ?`,
        params,
        mapRow: parseTopic,
        page: options.page,
        pageSize: options.pageSize,
      });
    },
    async getById(id: number) {
      return getSingle(id);
    },
    async create(input: NewTopic) {
      const data = NewTopicSchema.parse(input);
      const id = data.id ?? (await getNextNumericId(driver, "Topic"));
      const { rows } = await driver.query(
        `INSERT INTO Topic (id, platformId, subjectId, name, isActive, qCount)
         VALUES (?, ?, ?, ?, ?, ?)
         RETURNING ${returningColumns}`,
        [id, data.platformId, data.subjectId, data.name, data.isActive ? 1 : 0, data.qCount],
      );
      if (rows.length === 0) {
        throw new Error("Failed to insert topic record");
      }
      return parseTopic(rows[0]);
    },
    async update(id: number, input: UpdateTopic) {
      const data = UpdateTopicSchema.parse(input ?? {});
      const setClauses: string[] = [];
      const params: QueryParameter[] = [];

      if (data.platformId !== undefined) {
        setClauses.push("platformId = ?");
        params.push(data.platformId);
      }
      if (data.subjectId !== undefined) {
        setClauses.push("subjectId = ?");
        params.push(data.subjectId);
      }
      if (data.name !== undefined) {
        setClauses.push("name = ?");
        params.push(data.name);
      }
      if (data.isActive !== undefined) {
        setClauses.push("isActive = ?");
        params.push(data.isActive ? 1 : 0);
      }
      if (data.qCount !== undefined) {
        setClauses.push("qCount = ?");
        params.push(data.qCount);
      }

      if (setClauses.length === 0) {
        return getSingle(id);
      }

      const { rows } = await driver.query(
        `UPDATE Topic SET ${setClauses.join(", ")} WHERE id = ? RETURNING ${returningColumns}`,
        [...params, id],
      );
      if (rows.length === 0) {
        return null;
      }
      return parseTopic(rows[0]);
    },
    async delete(id: number) {
      const { rows } = await driver.query(
        `DELETE FROM Topic WHERE id = ? RETURNING ${returningColumns}`,
        [id],
      );
      if (rows.length === 0) {
        return null;
      }
      return parseTopic(rows[0]);
    },
  };
};

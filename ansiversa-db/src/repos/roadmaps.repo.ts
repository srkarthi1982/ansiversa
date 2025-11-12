import type { DbDriver, QueryParameter } from "../drivers/driver";
import { runPaginatedQuery } from "../utils/pagination";
import type { PaginatedResult, PaginationOptions } from "../types/pagination";
import {
  NewRoadmapSchema,
  UpdateRoadmapSchema,
  type NewRoadmap,
  type UpdateRoadmap,
  parseRoadmap,
  type Roadmap,
} from "../types/quiz";

export interface RoadmapListOptions extends PaginationOptions {
  platformId?: number;
  subjectId?: number;
  topicId?: number;
}

export interface RoadmapsRepo {
  list(): Promise<Roadmap[]>;
  listByPlatform(platformId: number): Promise<Roadmap[]>;
  listBySubject(subjectId: number): Promise<Roadmap[]>;
  listByTopic(topicId: number): Promise<Roadmap[]>;
  listPaginated(options?: RoadmapListOptions): Promise<PaginatedResult<Roadmap>>;
  getById(id: number): Promise<Roadmap | null>;
  create(input: NewRoadmap): Promise<Roadmap>;
  update(id: number, input: UpdateRoadmap): Promise<Roadmap | null>;
  delete(id: number): Promise<Roadmap | null>;
}

const returningColumns = "id, platformId, subjectId, topicId, name, isActive, qCount";
const selectClause = `SELECT ${returningColumns} FROM Roadmap`;

export const createRoadmapsRepo = (driver: DbDriver): RoadmapsRepo => {
  const getSingle = async (id: number): Promise<Roadmap | null> => {
    const { rows } = await driver.query(`${selectClause} WHERE id = ? LIMIT 1`, [id]);
    if (rows.length === 0) {
      return null;
    }
    return parseRoadmap(rows[0]);
  };

  return {
    async list() {
      const { rows } = await driver.query(`${selectClause} ORDER BY name ASC`);
      return rows.map((row) => parseRoadmap(row));
    },
    async listByPlatform(platformId: number) {
      const { rows } = await driver.query(
        `${selectClause} WHERE platformId = ? ORDER BY name ASC`,
        [platformId],
      );
      return rows.map((row) => parseRoadmap(row));
    },
    async listBySubject(subjectId: number) {
      const { rows } = await driver.query(
        `${selectClause} WHERE subjectId = ? ORDER BY name ASC`,
        [subjectId],
      );
      return rows.map((row) => parseRoadmap(row));
    },
    async listByTopic(topicId: number) {
      const { rows } = await driver.query(
        `${selectClause} WHERE topicId = ? ORDER BY name ASC`,
        [topicId],
      );
      return rows.map((row) => parseRoadmap(row));
    },
    async listPaginated(options: RoadmapListOptions = {}) {
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
      if (options.topicId !== undefined) {
        conditions.push("topicId = ?");
        params.push(options.topicId);
      }

      const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";

      return runPaginatedQuery({
        driver,
        countQuery: `SELECT COUNT(*) as total FROM Roadmap${whereClause}`,
        dataQuery: `${selectClause}${whereClause} ORDER BY name ASC LIMIT ? OFFSET ?`,
        params,
        mapRow: parseRoadmap,
        page: options.page,
        pageSize: options.pageSize,
      });
    },
    async getById(id: number) {
      return getSingle(id);
    },
    async create(input: NewRoadmap) {
      const data = NewRoadmapSchema.parse(input);
      const { rows } = await driver.query(
        `INSERT INTO Roadmap (id, platformId, subjectId, topicId, name, isActive, qCount)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         RETURNING ${returningColumns}`,
        [
          data.id,
          data.platformId,
          data.subjectId,
          data.topicId,
          data.name,
          data.isActive ? 1 : 0,
          data.qCount,
        ],
      );
      if (rows.length === 0) {
        throw new Error("Failed to insert roadmap record");
      }
      return parseRoadmap(rows[0]);
    },
    async update(id: number, input: UpdateRoadmap) {
      const data = UpdateRoadmapSchema.parse(input ?? {});
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
      if (data.topicId !== undefined) {
        setClauses.push("topicId = ?");
        params.push(data.topicId);
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
        `UPDATE Roadmap SET ${setClauses.join(", ")} WHERE id = ? RETURNING ${returningColumns}`,
        [...params, id],
      );
      if (rows.length === 0) {
        return null;
      }
      return parseRoadmap(rows[0]);
    },
    async delete(id: number) {
      const { rows } = await driver.query(
        `DELETE FROM Roadmap WHERE id = ? RETURNING ${returningColumns}`,
        [id],
      );
      if (rows.length === 0) {
        return null;
      }
      return parseRoadmap(rows[0]);
    },
  };
};

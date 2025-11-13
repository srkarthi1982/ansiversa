import type { DbDriver, QueryParameter } from "../drivers/driver";
import { runPaginatedQuery } from "../utils/pagination";
import { getNextNumericId } from "../utils/ids";
import type { PaginatedResult, PaginationOptions } from "../types/pagination";
import {
  NewSubjectSchema,
  UpdateSubjectSchema,
  type NewSubject,
  type UpdateSubject,
  parseSubject,
  type Subject,
} from "../types/quiz";

export interface SubjectListOptions extends PaginationOptions {
  platformId?: number;
}

export interface SubjectsRepo {
  list(): Promise<Subject[]>;
  listByPlatform(platformId: number): Promise<Subject[]>;
  listPaginated(options?: SubjectListOptions): Promise<PaginatedResult<Subject>>;
  getById(id: number): Promise<Subject | null>;
  create(input: NewSubject): Promise<Subject>;
  update(id: number, input: UpdateSubject): Promise<Subject | null>;
  delete(id: number): Promise<Subject | null>;
}

const returningColumns = "id, platformId, name, isActive, qCount";
const selectClause = `SELECT ${returningColumns} FROM Subject`;

export const createSubjectsRepo = (driver: DbDriver): SubjectsRepo => {
  const getSingle = async (id: number): Promise<Subject | null> => {
    const { rows } = await driver.query(`${selectClause} WHERE id = ? LIMIT 1`, [id]);
    if (rows.length === 0) {
      return null;
    }
    return parseSubject(rows[0]);
  };

  return {
    async list() {
      const { rows } = await driver.query(`${selectClause} ORDER BY name ASC`);
      return rows.map((row) => parseSubject(row));
    },
    async listByPlatform(platformId: number) {
      const { rows } = await driver.query(
        `${selectClause} WHERE platformId = ? ORDER BY name ASC`,
        [platformId],
      );
      return rows.map((row) => parseSubject(row));
    },
    async listPaginated(options: SubjectListOptions = {}) {
      const conditions: string[] = [];
      const params: QueryParameter[] = [];

      if (options.platformId !== undefined) {
        conditions.push("platformId = ?");
        params.push(options.platformId);
      }

      const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";

      return runPaginatedQuery({
        driver,
        countQuery: `SELECT COUNT(*) as total FROM Subject${whereClause}`,
        dataQuery: `${selectClause}${whereClause} ORDER BY name ASC LIMIT ? OFFSET ?`,
        params,
        mapRow: parseSubject,
        page: options.page,
        pageSize: options.pageSize,
      });
    },
    async getById(id: number) {
      return getSingle(id);
    },
    async create(input: NewSubject) {
      const data = NewSubjectSchema.parse(input);
      const id = data.id ?? (await getNextNumericId(driver, "Subject"));
      const { rows } = await driver.query(
        `INSERT INTO Subject (id, platformId, name, isActive, qCount)
         VALUES (?, ?, ?, ?, ?)
         RETURNING ${returningColumns}`,
        [id, data.platformId, data.name, data.isActive ? 1 : 0, data.qCount],
      );
      if (rows.length === 0) {
        throw new Error("Failed to insert subject record");
      }
      return parseSubject(rows[0]);
    },
    async update(id: number, input: UpdateSubject) {
      const data = UpdateSubjectSchema.parse(input ?? {});
      const setClauses: string[] = [];
      const params: QueryParameter[] = [];

      if (data.platformId !== undefined) {
        setClauses.push("platformId = ?");
        params.push(data.platformId);
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
        `UPDATE Subject SET ${setClauses.join(", ")} WHERE id = ? RETURNING ${returningColumns}`,
        [...params, id],
      );
      if (rows.length === 0) {
        return null;
      }
      return parseSubject(rows[0]);
    },
    async delete(id: number) {
      const { rows } = await driver.query(
        `DELETE FROM Subject WHERE id = ? RETURNING ${returningColumns}`,
        [id],
      );
      if (rows.length === 0) {
        return null;
      }
      return parseSubject(rows[0]);
    },
  };
};

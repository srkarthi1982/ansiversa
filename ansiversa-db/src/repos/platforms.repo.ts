import type { DbDriver, QueryParameter } from "../drivers/driver";
import { runPaginatedQuery } from "../utils/pagination";
import type { PaginatedResult, PaginationOptions } from "../types/pagination";
import {
  NewPlatformSchema,
  UpdatePlatformSchema,
  type NewPlatform,
  type UpdatePlatform,
  parsePlatform,
  type Platform,
} from "../types/quiz";

export interface PlatformsRepo {
  list(): Promise<Platform[]>;
  listPaginated(options?: PaginationOptions): Promise<PaginatedResult<Platform>>;
  getById(id: number): Promise<Platform | null>;
  create(input: NewPlatform): Promise<Platform>;
  update(id: number, input: UpdatePlatform): Promise<Platform | null>;
  delete(id: number): Promise<Platform | null>;
}

const returningColumns = "id, name, description, icon, type, qCount, isActive";
const selectClause = `SELECT ${returningColumns} FROM Platform`;

export const createPlatformsRepo = (driver: DbDriver): PlatformsRepo => {
  const getSingle = async (id: number): Promise<Platform | null> => {
    const { rows } = await driver.query(`${selectClause} WHERE id = ? LIMIT 1`, [id]);
    if (rows.length === 0) {
      return null;
    }
    return parsePlatform(rows[0]);
  };

  return {
    async list() {
      const { rows } = await driver.query(`${selectClause} ORDER BY name ASC`);
      return rows.map(parsePlatform);
    },
    async listPaginated(options: PaginationOptions = {}) {
      return runPaginatedQuery({
        driver,
        countQuery: "SELECT COUNT(*) as total FROM Platform",
        dataQuery: `${selectClause} ORDER BY name ASC LIMIT ? OFFSET ?`,
        mapRow: parsePlatform,
        page: options.page,
        pageSize: options.pageSize,
      });
    },
    async getById(id: number) {
      return getSingle(id);
    },
    async create(input: NewPlatform) {
      const data = NewPlatformSchema.parse(input);
      const { rows } = await driver.query(
        `INSERT INTO Platform (name, description, icon, type, qCount, isActive)
         VALUES (?, ?, ?, ?, ?, ?)
         RETURNING ${returningColumns}`,
        [
          data.name,
          data.description,
          data.icon,
          data.type ?? null,
          data.qCount,
          data.isActive ? 1 : 0,
        ],
      );
      if (rows.length === 0) {
        throw new Error("Failed to insert platform record");
      }
      return parsePlatform(rows[0]);
    },
    async update(id: number, input: UpdatePlatform) {
      const data = UpdatePlatformSchema.parse(input ?? {});
      const setClauses: string[] = [];
      const params: QueryParameter[] = [];

      if (data.name !== undefined) {
        setClauses.push("name = ?");
        params.push(data.name);
      }
      if (data.description !== undefined) {
        setClauses.push("description = ?");
        params.push(data.description);
      }
      if (data.icon !== undefined) {
        setClauses.push("icon = ?");
        params.push(data.icon);
      }
      if (data.type !== undefined) {
        setClauses.push("type = ?");
        params.push(data.type ?? null);
      }
      if (data.qCount !== undefined) {
        setClauses.push("qCount = ?");
        params.push(data.qCount);
      }
      if (data.isActive !== undefined) {
        setClauses.push("isActive = ?");
        params.push(data.isActive ? 1 : 0);
      }

      if (setClauses.length === 0) {
        return getSingle(id);
      }

      const { rows } = await driver.query(
        `UPDATE Platform SET ${setClauses.join(", ")} WHERE id = ? RETURNING ${returningColumns}`,
        [...params, id],
      );
      if (rows.length === 0) {
        return null;
      }
      return parsePlatform(rows[0]);
    },
    async delete(id: number) {
      const { rows } = await driver.query(
        `DELETE FROM Platform WHERE id = ? RETURNING ${returningColumns}`,
        [id],
      );
      if (rows.length === 0) {
        return null;
      }
      return parsePlatform(rows[0]);
    },
  };
};

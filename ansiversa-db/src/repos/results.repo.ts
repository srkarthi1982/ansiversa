import type { DbDriver } from "../drivers/driver";
import { NewResultSchema, type NewResult, parseResult, type Result } from "../types/quiz";

export interface ResultsRepo {
  list(): Promise<Result[]>;
  listByUser(userId: string): Promise<Result[]>;
  listByPlatform(platformId: number): Promise<Result[]>;
  getById(id: number): Promise<Result | null>;
  create(input: NewResult): Promise<Result>;
}

const baseSelect =
  "SELECT id, userId, platformId, subjectId, topicId, roadmapId, level, responses, mark, createdAt FROM Result";

export const createResultsRepo = (driver: DbDriver): ResultsRepo => ({
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
  async getById(id: number) {
    const { rows } = await driver.query(`${baseSelect} WHERE id = ? LIMIT 1`, [id]);
    if (rows.length === 0) {
      return null;
    }
    return parseResult(rows[0]);
  },
  async create(input: NewResult) {
    const data = NewResultSchema.parse(input);
    const { rows } = await driver.query(
      `INSERT INTO Result (userId, platformId, subjectId, topicId, roadmapId, level, responses, mark)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING id, userId, platformId, subjectId, topicId, roadmapId, level, responses, mark, createdAt`,
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
});

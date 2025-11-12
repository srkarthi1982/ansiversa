import type { DbDriver } from "../drivers/driver";
import { NewTopicSchema, type NewTopic, parseTopic, type Topic } from "../types/quiz";

export interface TopicsRepo {
  list(): Promise<Topic[]>;
  listByPlatform(platformId: number): Promise<Topic[]>;
  listBySubject(subjectId: number): Promise<Topic[]>;
  getById(id: number): Promise<Topic | null>;
  create(input: NewTopic): Promise<Topic>;
}

export const createTopicsRepo = (driver: DbDriver): TopicsRepo => ({
  async list() {
    const { rows } = await driver.query(
      `SELECT id, platformId, subjectId, name, isActive, qCount FROM Topic ORDER BY name ASC`,
    );
    return rows.map((row) => parseTopic(row));
  },
  async listByPlatform(platformId: number) {
    const { rows } = await driver.query(
      `SELECT id, platformId, subjectId, name, isActive, qCount FROM Topic WHERE platformId = ? ORDER BY name ASC`,
      [platformId],
    );
    return rows.map((row) => parseTopic(row));
  },
  async listBySubject(subjectId: number) {
    const { rows } = await driver.query(
      `SELECT id, platformId, subjectId, name, isActive, qCount FROM Topic WHERE subjectId = ? ORDER BY name ASC`,
      [subjectId],
    );
    return rows.map((row) => parseTopic(row));
  },
  async getById(id: number) {
    const { rows } = await driver.query(
      `SELECT id, platformId, subjectId, name, isActive, qCount FROM Topic WHERE id = ? LIMIT 1`,
      [id],
    );
    if (rows.length === 0) {
      return null;
    }
    return parseTopic(rows[0]);
  },
  async create(input: NewTopic) {
    const data = NewTopicSchema.parse(input);
    const { rows } = await driver.query(
      `INSERT INTO Topic (id, platformId, subjectId, name, isActive, qCount)
       VALUES (?, ?, ?, ?, ?, ?)
       RETURNING id, platformId, subjectId, name, isActive, qCount`,
      [data.id, data.platformId, data.subjectId, data.name, data.isActive ? 1 : 0, data.qCount],
    );
    if (rows.length === 0) {
      throw new Error("Failed to insert topic record");
    }
    return parseTopic(rows[0]);
  },
});

import type { DbDriver } from "../drivers/driver";
import { NewRoadmapSchema, type NewRoadmap, parseRoadmap, type Roadmap } from "../types/quiz";

export interface RoadmapsRepo {
  list(): Promise<Roadmap[]>;
  listByPlatform(platformId: number): Promise<Roadmap[]>;
  listBySubject(subjectId: number): Promise<Roadmap[]>;
  listByTopic(topicId: number): Promise<Roadmap[]>;
  getById(id: number): Promise<Roadmap | null>;
  create(input: NewRoadmap): Promise<Roadmap>;
}

export const createRoadmapsRepo = (driver: DbDriver): RoadmapsRepo => ({
  async list() {
    const { rows } = await driver.query(
      `SELECT id, platformId, subjectId, topicId, name, isActive, qCount FROM Roadmap ORDER BY name ASC`,
    );
    return rows.map((row) => parseRoadmap(row));
  },
  async listByPlatform(platformId: number) {
    const { rows } = await driver.query(
      `SELECT id, platformId, subjectId, topicId, name, isActive, qCount FROM Roadmap WHERE platformId = ? ORDER BY name ASC`,
      [platformId],
    );
    return rows.map((row) => parseRoadmap(row));
  },
  async listBySubject(subjectId: number) {
    const { rows } = await driver.query(
      `SELECT id, platformId, subjectId, topicId, name, isActive, qCount FROM Roadmap WHERE subjectId = ? ORDER BY name ASC`,
      [subjectId],
    );
    return rows.map((row) => parseRoadmap(row));
  },
  async listByTopic(topicId: number) {
    const { rows } = await driver.query(
      `SELECT id, platformId, subjectId, topicId, name, isActive, qCount FROM Roadmap WHERE topicId = ? ORDER BY name ASC`,
      [topicId],
    );
    return rows.map((row) => parseRoadmap(row));
  },
  async getById(id: number) {
    const { rows } = await driver.query(
      `SELECT id, platformId, subjectId, topicId, name, isActive, qCount FROM Roadmap WHERE id = ? LIMIT 1`,
      [id],
    );
    if (rows.length === 0) {
      return null;
    }
    return parseRoadmap(rows[0]);
  },
  async create(input: NewRoadmap) {
    const data = NewRoadmapSchema.parse(input);
    const { rows } = await driver.query(
      `INSERT INTO Roadmap (id, platformId, subjectId, topicId, name, isActive, qCount)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       RETURNING id, platformId, subjectId, topicId, name, isActive, qCount`,
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
});

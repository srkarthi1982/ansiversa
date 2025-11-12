import type { DbDriver } from "../drivers/driver";
import {
  NewQuestionSchema,
  normalizeQuestion,
  type NewQuestion,
  type Question,
} from "../types/quiz";

export interface QuestionsRepo {
  listByPlatform(platformId: number): Promise<Question[]>;
  listBySubject(subjectId: number): Promise<Question[]>;
  listByTopic(topicId: number): Promise<Question[]>;
  listByRoadmap(roadmapId: number): Promise<Question[]>;
  getById(id: number): Promise<Question | null>;
  getRandomByPlatform(platformId: number, limit?: number): Promise<Question[]>;
  create(input: NewQuestion): Promise<Question>;
}

export const createQuestionsRepo = (driver: DbDriver): QuestionsRepo => ({
  async listByPlatform(platformId: number) {
    const { rows } = await driver.query(
      `SELECT id, platformId, subjectId, topicId, roadmapId, q, o, a, e, l, isActive
       FROM Question
       WHERE platformId = ?
       ORDER BY id ASC`,
      [platformId],
    );
    return rows.map((row) => normalizeQuestion(row));
  },
  async listBySubject(subjectId: number) {
    const { rows } = await driver.query(
      `SELECT id, platformId, subjectId, topicId, roadmapId, q, o, a, e, l, isActive
       FROM Question
       WHERE subjectId = ?
       ORDER BY id ASC`,
      [subjectId],
    );
    return rows.map((row) => normalizeQuestion(row));
  },
  async listByTopic(topicId: number) {
    const { rows } = await driver.query(
      `SELECT id, platformId, subjectId, topicId, roadmapId, q, o, a, e, l, isActive
       FROM Question
       WHERE topicId = ?
       ORDER BY id ASC`,
      [topicId],
    );
    return rows.map((row) => normalizeQuestion(row));
  },
  async listByRoadmap(roadmapId: number) {
    const { rows } = await driver.query(
      `SELECT id, platformId, subjectId, topicId, roadmapId, q, o, a, e, l, isActive
       FROM Question
       WHERE roadmapId = ?
       ORDER BY id ASC`,
      [roadmapId],
    );
    return rows.map((row) => normalizeQuestion(row));
  },
  async getById(id: number) {
    const { rows } = await driver.query(
      `SELECT id, platformId, subjectId, topicId, roadmapId, q, o, a, e, l, isActive
       FROM Question
       WHERE id = ?
       LIMIT 1`,
      [id],
    );
    if (rows.length === 0) {
      return null;
    }
    return normalizeQuestion(rows[0]);
  },
  async getRandomByPlatform(platformId: number, limit = 1) {
    const { rows } = await driver.query(
      `SELECT id, platformId, subjectId, topicId, roadmapId, q, o, a, e, l, isActive
       FROM Question
       WHERE platformId = ?
       ORDER BY RANDOM()
       LIMIT ?`,
      [platformId, limit],
    );

    return rows.map((row) => normalizeQuestion(row));
  },
  async create(input: NewQuestion) {
    const data = NewQuestionSchema.parse(input);
    const { rows } = await driver.query(
      `INSERT INTO Question (platformId, subjectId, topicId, roadmapId, q, o, a, e, l, isActive)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING id, platformId, subjectId, topicId, roadmapId, q, o, a, e, l, isActive`,
      [
        data.platformId,
        data.subjectId ?? null,
        data.topicId ?? null,
        data.roadmapId ?? null,
        data.question,
        JSON.stringify(data.options ?? []),
        data.answer,
        data.explanation ?? null,
        data.level,
        data.isActive ? 1 : 0,
      ],
    );
    if (rows.length === 0) {
      throw new Error("Failed to insert question record");
    }
    return normalizeQuestion(rows[0]);
  },
});

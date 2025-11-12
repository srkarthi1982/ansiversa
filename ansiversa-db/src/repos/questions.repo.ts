import type { DbDriver } from "../drivers/driver";
import { normalizeQuestion, type Question } from "../types/quiz";

export interface QuestionsRepo {
  getRandomByPlatform(platformId: string, limit?: number): Promise<Question[]>;
}

export const createQuestionsRepo = (driver: DbDriver): QuestionsRepo => ({
  async getRandomByPlatform(platformId: string, limit = 1) {
    const { rows } = await driver.query<Question>(
      `SELECT id, platformId, prompt, answer, explanation, choices, createdAt, updatedAt
       FROM questions
       WHERE platformId = ?
       ORDER BY RANDOM()
       LIMIT ?`,
      [platformId, limit],
    );

    return rows.map((row) => normalizeQuestion(row));
  },
});

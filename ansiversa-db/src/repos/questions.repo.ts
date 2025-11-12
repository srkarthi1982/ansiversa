import type { DbDriver, QueryParameter } from "../drivers/driver";
import { runPaginatedQuery } from "../utils/pagination";
import type { PaginatedResult, PaginationOptions } from "../types/pagination";
import {
  NewQuestionSchema,
  UpdateQuestionSchema,
  normalizeQuestion,
  type NewQuestion,
  type Question,
  type UpdateQuestion,
} from "../types/quiz";

export interface QuestionListOptions extends PaginationOptions {
  platformId?: number;
  subjectId?: number | null;
  topicId?: number | null;
  roadmapId?: number | null;
  level?: Question["level"];
  isActive?: boolean;
}

export interface QuestionsRepo {
  listByPlatform(platformId: number): Promise<Question[]>;
  listBySubject(subjectId: number): Promise<Question[]>;
  listByTopic(topicId: number): Promise<Question[]>;
  listByRoadmap(roadmapId: number): Promise<Question[]>;
  listPaginated(options?: QuestionListOptions): Promise<PaginatedResult<Question>>;
  getById(id: number): Promise<Question | null>;
  getRandomByPlatform(platformId: number, limit?: number): Promise<Question[]>;
  create(input: NewQuestion): Promise<Question>;
  update(id: number, input: UpdateQuestion): Promise<Question | null>;
  delete(id: number): Promise<Question | null>;
}

const returningColumns =
  "id, platformId, subjectId, topicId, roadmapId, q, o, a, e, l, isActive";
const selectClause = `SELECT ${returningColumns} FROM Question`;

export const createQuestionsRepo = (driver: DbDriver): QuestionsRepo => {
  const getSingle = async (id: number): Promise<Question | null> => {
    const { rows } = await driver.query(`${selectClause} WHERE id = ? LIMIT 1`, [id]);
    if (rows.length === 0) {
      return null;
    }
    return normalizeQuestion(rows[0]);
  };

  return {
    async listByPlatform(platformId: number) {
      const { rows } = await driver.query(
        `${selectClause} WHERE platformId = ? ORDER BY id ASC`,
        [platformId],
      );
      return rows.map((row) => normalizeQuestion(row));
    },
    async listBySubject(subjectId: number) {
      const { rows } = await driver.query(
        `${selectClause} WHERE subjectId = ? ORDER BY id ASC`,
        [subjectId],
      );
      return rows.map((row) => normalizeQuestion(row));
    },
    async listByTopic(topicId: number) {
      const { rows } = await driver.query(
        `${selectClause} WHERE topicId = ? ORDER BY id ASC`,
        [topicId],
      );
      return rows.map((row) => normalizeQuestion(row));
    },
    async listByRoadmap(roadmapId: number) {
      const { rows } = await driver.query(
        `${selectClause} WHERE roadmapId = ? ORDER BY id ASC`,
        [roadmapId],
      );
      return rows.map((row) => normalizeQuestion(row));
    },
    async listPaginated(options: QuestionListOptions = {}) {
      const conditions: string[] = [];
      const params: QueryParameter[] = [];

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
        conditions.push("l = ?");
        params.push(options.level);
      }
      if (options.isActive !== undefined) {
        conditions.push("isActive = ?");
        params.push(options.isActive ? 1 : 0);
      }

      const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";

      return runPaginatedQuery({
        driver,
        countQuery: `SELECT COUNT(*) as total FROM Question${whereClause}`,
        dataQuery: `${selectClause}${whereClause} ORDER BY id ASC LIMIT ? OFFSET ?`,
        params,
        mapRow: normalizeQuestion,
        page: options.page,
        pageSize: options.pageSize,
      });
    },
    async getById(id: number) {
      return getSingle(id);
    },
    async getRandomByPlatform(platformId: number, limit = 1) {
      const { rows } = await driver.query(
        `${selectClause} WHERE platformId = ? ORDER BY RANDOM() LIMIT ?`,
        [platformId, limit],
      );

      return rows.map((row) => normalizeQuestion(row));
    },
    async create(input: NewQuestion) {
      const data = NewQuestionSchema.parse(input);
      const { rows } = await driver.query(
        `INSERT INTO Question (platformId, subjectId, topicId, roadmapId, q, o, a, e, l, isActive)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING ${returningColumns}`,
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
    async update(id: number, input: UpdateQuestion) {
      const data = UpdateQuestionSchema.parse(input ?? {});
      const setClauses: string[] = [];
      const params: QueryParameter[] = [];

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
      if (data.question !== undefined) {
        setClauses.push("q = ?");
        params.push(data.question);
      }
      if (data.options !== undefined) {
        setClauses.push("o = ?");
        params.push(JSON.stringify(data.options));
      }
      if (data.answer !== undefined) {
        setClauses.push("a = ?");
        params.push(data.answer);
      }
      if (data.explanation !== undefined) {
        setClauses.push("e = ?");
        params.push(data.explanation ?? null);
      }
      if (data.level !== undefined) {
        setClauses.push("l = ?");
        params.push(data.level);
      }
      if (data.isActive !== undefined) {
        setClauses.push("isActive = ?");
        params.push(data.isActive ? 1 : 0);
      }

      if (setClauses.length === 0) {
        return getSingle(id);
      }

      const { rows } = await driver.query(
        `UPDATE Question SET ${setClauses.join(", ")} WHERE id = ? RETURNING ${returningColumns}`,
        [...params, id],
      );
      if (rows.length === 0) {
        return null;
      }
      return normalizeQuestion(rows[0]);
    },
    async delete(id: number) {
      const { rows } = await driver.query(
        `DELETE FROM Question WHERE id = ? RETURNING ${returningColumns}`,
        [id],
      );
      if (rows.length === 0) {
        return null;
      }
      return normalizeQuestion(rows[0]);
    },
  };
};

import type { DbDriver, QueryParameter } from "../drivers/driver";
import type { PaginatedResult, PaginationOptions } from "../types/pagination";
import {
  parsePlatform,
  parseSubject,
  parseTopic,
  parseRoadmap,
  normalizeQuestion,
  type Platform,
  type Subject,
  type Topic,
  type Roadmap,
  type Question,
} from "../types/quiz";
import { runPaginatedQuery } from "../utils/pagination";

export type SortDirection = "asc" | "desc";
export type StatusFilter = "all" | "active" | "inactive";

const normalizeSearchTerm = (value?: string | null): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const appendWhereClause = (conditions: string[]): string =>
  conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";

const buildOrderClause = (
  columnMap: Record<string, string>,
  column: string | undefined,
  direction: SortDirection | undefined,
  fallback: string,
): string => {
  const normalizedDirection = direction === "desc" ? "DESC" : "ASC";
  const normalizedColumn = column ? columnMap[column] ?? fallback : fallback;
  const secondaryOrder = normalizedColumn === fallback ? "" : `, ${fallback}`;
  return ` ORDER BY ${normalizedColumn} ${normalizedDirection}${secondaryOrder}`;
};

export interface PlatformSearchOptions extends PaginationOptions {
  name?: string | null;
  description?: string | null;
  type?: string | null;
  minQuestions?: number | null;
  maxQuestions?: number | null;
  status?: StatusFilter;
  sortColumn?: "id" | "name" | "description" | "type" | "qCount" | "status";
  sortDirection?: SortDirection;
}

export interface SubjectSearchOptions extends PaginationOptions {
  name?: string | null;
  platformId?: number | null;
  minQuestions?: number | null;
  maxQuestions?: number | null;
  status?: StatusFilter;
  sortColumn?: "id" | "name" | "platformName" | "platformId" | "qCount" | "status";
  sortDirection?: SortDirection;
}

export interface TopicSearchOptions extends PaginationOptions {
  name?: string | null;
  platformId?: number | null;
  subjectId?: number | null;
  minQuestions?: number | null;
  maxQuestions?: number | null;
  status?: StatusFilter;
  sortColumn?:
    | "id"
    | "name"
    | "platformName"
    | "subjectName"
    | "platformId"
    | "subjectId"
    | "qCount"
    | "status";
  sortDirection?: SortDirection;
}

export interface RoadmapSearchOptions extends PaginationOptions {
  name?: string | null;
  platformId?: number | null;
  subjectId?: number | null;
  topicId?: number | null;
  minQuestions?: number | null;
  maxQuestions?: number | null;
  status?: StatusFilter;
  sortColumn?:
    | "id"
    | "name"
    | "platformName"
    | "subjectName"
    | "topicName"
    | "platformId"
    | "subjectId"
    | "topicId"
    | "qCount"
    | "status";
  sortDirection?: SortDirection;
}

export interface QuestionSearchOptions extends PaginationOptions {
  questionText?: string | null;
  platformId?: number | null;
  subjectId?: number | null;
  topicId?: number | null;
  roadmapId?: number | null;
  level?: string | null;
  status?: StatusFilter;
  sortColumn?:
    | "id"
    | "questionText"
    | "platformName"
    | "subjectName"
    | "topicName"
    | "roadmapName"
    | "platformId"
    | "subjectId"
    | "topicId"
    | "roadmapId"
    | "level"
    | "status";
  sortDirection?: SortDirection;
}

export interface QuestionRelations {
  question: Question;
  platformName: string | null;
  subjectName: string | null;
  topicName: string | null;
  roadmapName: string | null;
}

export interface SubjectWithPlatform {
  subject: Subject;
  platformName: string | null;
}

export interface TopicWithRelations {
  topic: Topic;
  platformName: string | null;
  subjectName: string | null;
}

export interface RoadmapWithRelations {
  roadmap: Roadmap;
  platformName: string | null;
  subjectName: string | null;
  topicName: string | null;
}

export interface RandomQuestionOptions {
  limit?: number;
  filters?: Omit<QuestionSearchOptions, "page" | "pageSize" | "sortColumn" | "sortDirection">;
  excludeIds?: number[];
}

export interface QuizAdminRepo {
  searchPlatforms(options?: PlatformSearchOptions): Promise<PaginatedResult<Platform>>;
  searchSubjects(options?: SubjectSearchOptions): Promise<PaginatedResult<SubjectWithPlatform>>;
  getSubjectDetails(id: number): Promise<SubjectWithPlatform | null>;
  searchTopics(options?: TopicSearchOptions): Promise<PaginatedResult<TopicWithRelations>>;
  getTopicDetails(id: number): Promise<TopicWithRelations | null>;
  searchRoadmaps(options?: RoadmapSearchOptions): Promise<PaginatedResult<RoadmapWithRelations>>;
  getRoadmapDetails(id: number): Promise<RoadmapWithRelations | null>;
  searchQuestions(options?: QuestionSearchOptions): Promise<PaginatedResult<QuestionRelations>>;
  getQuestionDetails(id: number): Promise<QuestionRelations | null>;
  getRandomQuestions(options?: RandomQuestionOptions): Promise<PaginatedResult<QuestionRelations>>;
}

const mapSubjectRow = (row: Record<string, unknown>): SubjectWithPlatform => ({
  subject: parseSubject(row),
  platformName: typeof row.platformName === "string" ? row.platformName : null,
});

const mapTopicRow = (row: Record<string, unknown>): TopicWithRelations => ({
  topic: parseTopic(row),
  platformName: typeof row.platformName === "string" ? row.platformName : null,
  subjectName: typeof row.subjectName === "string" ? row.subjectName : null,
});

const mapRoadmapRow = (row: Record<string, unknown>): RoadmapWithRelations => ({
  roadmap: parseRoadmap(row),
  platformName: typeof row.platformName === "string" ? row.platformName : null,
  subjectName: typeof row.subjectName === "string" ? row.subjectName : null,
  topicName: typeof row.topicName === "string" ? row.topicName : null,
});

const mapQuestionRow = (row: Record<string, unknown>): QuestionRelations => ({
  question: normalizeQuestion(row),
  platformName: typeof row.platformName === "string" ? row.platformName : null,
  subjectName: typeof row.subjectName === "string" ? row.subjectName : null,
  topicName: typeof row.topicName === "string" ? row.topicName : null,
  roadmapName: typeof row.roadmapName === "string" ? row.roadmapName : null,
});

const normalizeLevel = (value?: string | null): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim().toUpperCase();
  return normalized === "E" || normalized === "M" || normalized === "D" ? normalized : null;
};

export const createQuizAdminRepo = (driver: DbDriver): QuizAdminRepo => {
  const searchPlatforms = async (options: PlatformSearchOptions = {}) => {
    const conditions: string[] = [];
    const params: QueryParameter[] = [];

    const name = normalizeSearchTerm(options.name);
    if (name) {
      conditions.push("LOWER(p.name) LIKE LOWER(?)");
      params.push(`%${name}%`);
    }

    const description = normalizeSearchTerm(options.description);
    if (description) {
      conditions.push("LOWER(p.description) LIKE LOWER(?)");
      params.push(`%${description}%`);
    }

    const type = normalizeSearchTerm(options.type);
    if (type) {
      conditions.push("LOWER(COALESCE(p.type, '')) LIKE LOWER(?)");
      params.push(`%${type}%`);
    }

    if (typeof options.minQuestions === "number" && Number.isFinite(options.minQuestions)) {
      conditions.push("p.qCount >= ?");
      params.push(Math.max(0, Math.trunc(options.minQuestions)));
    }

    if (typeof options.maxQuestions === "number" && Number.isFinite(options.maxQuestions)) {
      conditions.push("p.qCount <= ?");
      params.push(Math.max(0, Math.trunc(options.maxQuestions)));
    }

    if (options.status === "active") {
      conditions.push("p.isActive = 1");
    } else if (options.status === "inactive") {
      conditions.push("p.isActive = 0");
    }

    const whereClause = appendWhereClause(conditions);
    const orderClause = buildOrderClause(
      {
        id: "p.id",
        name: "p.name",
        description: "p.description",
        type: "p.type",
        qCount: "p.qCount",
        status: "p.isActive",
      },
      options.sortColumn,
      options.sortDirection,
      "p.id",
    );

    return runPaginatedQuery({
      driver,
      countQuery: `SELECT COUNT(*) as total FROM Platform p${whereClause}`,
      dataQuery: `SELECT p.id, p.name, p.description, p.icon, p.type, p.qCount, p.isActive FROM Platform p${whereClause}${orderClause} LIMIT ? OFFSET ?`,
      params,
      mapRow: (row) => parsePlatform(row),
      page: options.page,
      pageSize: options.pageSize,
    });
  };

  const searchSubjects = async (options: SubjectSearchOptions = {}) => {
    const conditions: string[] = [];
    const params: QueryParameter[] = [];

    const name = normalizeSearchTerm(options.name);
    if (name) {
      conditions.push("LOWER(s.name) LIKE LOWER(?)");
      params.push(`%${name}%`);
    }

    if (typeof options.platformId === "number" && Number.isFinite(options.platformId)) {
      conditions.push("s.platformId = ?");
      params.push(Math.trunc(options.platformId));
    }

    if (typeof options.minQuestions === "number" && Number.isFinite(options.minQuestions)) {
      conditions.push("s.qCount >= ?");
      params.push(Math.max(0, Math.trunc(options.minQuestions)));
    }

    if (typeof options.maxQuestions === "number" && Number.isFinite(options.maxQuestions)) {
      conditions.push("s.qCount <= ?");
      params.push(Math.max(0, Math.trunc(options.maxQuestions)));
    }

    if (options.status === "active") {
      conditions.push("s.isActive = 1");
    } else if (options.status === "inactive") {
      conditions.push("s.isActive = 0");
    }

    const whereClause = appendWhereClause(conditions);
    const orderClause = buildOrderClause(
      {
        id: "s.id",
        name: "s.name",
        platformId: "s.platformId",
        platformName: "p.name",
        qCount: "s.qCount",
        status: "s.isActive",
      },
      options.sortColumn,
      options.sortDirection,
      "s.id",
    );

    const baseFrom =
      " FROM Subject s LEFT JOIN Platform p ON s.platformId = p.id";

    return runPaginatedQuery({
      driver,
      countQuery: `SELECT COUNT(*) as total${baseFrom}${whereClause}`,
      dataQuery: `SELECT s.id, s.platformId, s.name, s.isActive, s.qCount, p.name as platformName${baseFrom}${whereClause}${orderClause} LIMIT ? OFFSET ?`,
      params,
      mapRow: (row) => mapSubjectRow(row as Record<string, unknown>),
      page: options.page,
      pageSize: options.pageSize,
    });
  };

  const getSubjectDetails = async (id: number) => {
    const { rows } = await driver.query(
      `SELECT s.id, s.platformId, s.name, s.isActive, s.qCount, p.name as platformName
       FROM Subject s
       LEFT JOIN Platform p ON s.platformId = p.id
       WHERE s.id = ?
       LIMIT 1`,
      [id],
    );
    if (rows.length === 0) {
      return null;
    }
    return mapSubjectRow(rows[0] as Record<string, unknown>);
  };

  const searchTopics = async (options: TopicSearchOptions = {}) => {
    const conditions: string[] = [];
    const params: QueryParameter[] = [];

    const name = normalizeSearchTerm(options.name);
    if (name) {
      conditions.push("LOWER(t.name) LIKE LOWER(?)");
      params.push(`%${name}%`);
    }

    if (typeof options.platformId === "number" && Number.isFinite(options.platformId)) {
      conditions.push("t.platformId = ?");
      params.push(Math.trunc(options.platformId));
    }

    if (typeof options.subjectId === "number" && Number.isFinite(options.subjectId)) {
      conditions.push("t.subjectId = ?");
      params.push(Math.trunc(options.subjectId));
    }

    if (typeof options.minQuestions === "number" && Number.isFinite(options.minQuestions)) {
      conditions.push("t.qCount >= ?");
      params.push(Math.max(0, Math.trunc(options.minQuestions)));
    }

    if (typeof options.maxQuestions === "number" && Number.isFinite(options.maxQuestions)) {
      conditions.push("t.qCount <= ?");
      params.push(Math.max(0, Math.trunc(options.maxQuestions)));
    }

    if (options.status === "active") {
      conditions.push("t.isActive = 1");
    } else if (options.status === "inactive") {
      conditions.push("t.isActive = 0");
    }

    const whereClause = appendWhereClause(conditions);
    const orderClause = buildOrderClause(
      {
        id: "t.id",
        name: "t.name",
        platformId: "t.platformId",
        subjectId: "t.subjectId",
        platformName: "p.name",
        subjectName: "s.name",
        qCount: "t.qCount",
        status: "t.isActive",
      },
      options.sortColumn,
      options.sortDirection,
      "t.id",
    );

    const baseFrom =
      " FROM Topic t" +
      " LEFT JOIN Subject s ON t.subjectId = s.id" +
      " LEFT JOIN Platform p ON t.platformId = p.id";

    return runPaginatedQuery({
      driver,
      countQuery: `SELECT COUNT(*) as total${baseFrom}${whereClause}`,
      dataQuery: `SELECT t.id, t.platformId, t.subjectId, t.name, t.isActive, t.qCount, p.name as platformName, s.name as subjectName${baseFrom}${whereClause}${orderClause} LIMIT ? OFFSET ?`,
      params,
      mapRow: (row) => mapTopicRow(row as Record<string, unknown>),
      page: options.page,
      pageSize: options.pageSize,
    });
  };

  const getTopicDetails = async (id: number) => {
    const { rows } = await driver.query(
      `SELECT t.id, t.platformId, t.subjectId, t.name, t.isActive, t.qCount,
              p.name as platformName,
              s.name as subjectName
       FROM Topic t
       LEFT JOIN Subject s ON t.subjectId = s.id
       LEFT JOIN Platform p ON t.platformId = p.id
       WHERE t.id = ?
       LIMIT 1`,
      [id],
    );
    if (rows.length === 0) {
      return null;
    }
    return mapTopicRow(rows[0] as Record<string, unknown>);
  };

  const searchRoadmaps = async (options: RoadmapSearchOptions = {}) => {
    const conditions: string[] = [];
    const params: QueryParameter[] = [];

    const name = normalizeSearchTerm(options.name);
    if (name) {
      conditions.push("LOWER(r.name) LIKE LOWER(?)");
      params.push(`%${name}%`);
    }

    if (typeof options.platformId === "number" && Number.isFinite(options.platformId)) {
      conditions.push("r.platformId = ?");
      params.push(Math.trunc(options.platformId));
    }

    if (typeof options.subjectId === "number" && Number.isFinite(options.subjectId)) {
      conditions.push("r.subjectId = ?");
      params.push(Math.trunc(options.subjectId));
    }

    if (typeof options.topicId === "number" && Number.isFinite(options.topicId)) {
      conditions.push("r.topicId = ?");
      params.push(Math.trunc(options.topicId));
    }

    if (typeof options.minQuestions === "number" && Number.isFinite(options.minQuestions)) {
      conditions.push("r.qCount >= ?");
      params.push(Math.max(0, Math.trunc(options.minQuestions)));
    }

    if (typeof options.maxQuestions === "number" && Number.isFinite(options.maxQuestions)) {
      conditions.push("r.qCount <= ?");
      params.push(Math.max(0, Math.trunc(options.maxQuestions)));
    }

    if (options.status === "active") {
      conditions.push("r.isActive = 1");
    } else if (options.status === "inactive") {
      conditions.push("r.isActive = 0");
    }

    const whereClause = appendWhereClause(conditions);
    const orderClause = buildOrderClause(
      {
        id: "r.id",
        name: "r.name",
        platformId: "r.platformId",
        subjectId: "r.subjectId",
        topicId: "r.topicId",
        platformName: "p.name",
        subjectName: "s.name",
        topicName: "t.name",
        qCount: "r.qCount",
        status: "r.isActive",
      },
      options.sortColumn,
      options.sortDirection,
      "r.id",
    );

    const baseFrom =
      " FROM Roadmap r" +
      " LEFT JOIN Platform p ON r.platformId = p.id" +
      " LEFT JOIN Subject s ON r.subjectId = s.id" +
      " LEFT JOIN Topic t ON r.topicId = t.id";

    return runPaginatedQuery({
      driver,
      countQuery: `SELECT COUNT(*) as total${baseFrom}${whereClause}`,
      dataQuery: `SELECT r.id, r.platformId, r.subjectId, r.topicId, r.name, r.isActive, r.qCount,
                         p.name as platformName,
                         s.name as subjectName,
                         t.name as topicName
                  ${baseFrom}${whereClause}${orderClause} LIMIT ? OFFSET ?`,
      params,
      mapRow: (row) => mapRoadmapRow(row as Record<string, unknown>),
      page: options.page,
      pageSize: options.pageSize,
    });
  };

  const getRoadmapDetails = async (id: number) => {
    const { rows } = await driver.query(
      `SELECT r.id, r.platformId, r.subjectId, r.topicId, r.name, r.isActive, r.qCount,
              p.name as platformName,
              s.name as subjectName,
              t.name as topicName
       FROM Roadmap r
       LEFT JOIN Platform p ON r.platformId = p.id
       LEFT JOIN Subject s ON r.subjectId = s.id
       LEFT JOIN Topic t ON r.topicId = t.id
       WHERE r.id = ?
       LIMIT 1`,
      [id],
    );
    if (rows.length === 0) {
      return null;
    }
    return mapRoadmapRow(rows[0] as Record<string, unknown>);
  };

  const buildQuestionFilters = (
    options: QuestionSearchOptions | RandomQuestionOptions["filters"] = {},
    excludeIds: number[] = [],
  ) => {
    const conditions: string[] = [];
    const params: QueryParameter[] = [];

    const questionText = normalizeSearchTerm(options?.questionText ?? null);
    if (questionText) {
      conditions.push("LOWER(q.q) LIKE LOWER(?)");
      params.push(`%${questionText}%`);
    }

    const platformId = options?.platformId;
    if (typeof platformId === "number" && Number.isFinite(platformId)) {
      conditions.push("q.platformId = ?");
      params.push(Math.trunc(platformId));
    }

    const subjectId = options?.subjectId;
    if (typeof subjectId === "number" && Number.isFinite(subjectId)) {
      conditions.push("q.subjectId = ?");
      params.push(Math.trunc(subjectId));
    }

    const topicId = options?.topicId;
    if (typeof topicId === "number" && Number.isFinite(topicId)) {
      conditions.push("q.topicId = ?");
      params.push(Math.trunc(topicId));
    }

    const roadmapId = options?.roadmapId;
    if (typeof roadmapId === "number" && Number.isFinite(roadmapId)) {
      conditions.push("q.roadmapId = ?");
      params.push(Math.trunc(roadmapId));
    }

    const level = normalizeLevel(options?.level ?? null);
    if (level) {
      conditions.push("UPPER(q.l) = ?");
      params.push(level);
    }

    if (options?.status === "active") {
      conditions.push("q.isActive = 1");
    } else if (options?.status === "inactive") {
      conditions.push("q.isActive = 0");
    }

    const uniqueIds = Array.from(new Set(excludeIds.filter((id) => Number.isFinite(id) && id > 0))).map((id) =>
      Math.trunc(id),
    );
    if (uniqueIds.length > 0) {
      conditions.push(`q.id NOT IN (${uniqueIds.map(() => "?").join(", ")})`);
      params.push(...uniqueIds);
    }

    return { conditions, params };
  };

  const questionBaseFrom =
    " FROM Question q" +
    " LEFT JOIN Platform p ON q.platformId = p.id" +
    " LEFT JOIN Subject s ON q.subjectId = s.id" +
    " LEFT JOIN Topic t ON q.topicId = t.id" +
    " LEFT JOIN Roadmap r ON q.roadmapId = r.id";

  const searchQuestions = async (options: QuestionSearchOptions = {}) => {
    const { conditions, params } = buildQuestionFilters(options);
    const whereClause = appendWhereClause(conditions);
    const orderClause = buildOrderClause(
      {
        id: "q.id",
        questionText: "q.q",
        platformId: "q.platformId",
        subjectId: "q.subjectId",
        topicId: "q.topicId",
        roadmapId: "q.roadmapId",
        platformName: "p.name",
        subjectName: "s.name",
        topicName: "t.name",
        roadmapName: "r.name",
        level: "q.l",
        status: "q.isActive",
      },
      options.sortColumn,
      options.sortDirection,
      "q.id",
    );

    return runPaginatedQuery({
      driver,
      countQuery: `SELECT COUNT(*) as total${questionBaseFrom}${whereClause}`,
      dataQuery: `SELECT q.id, q.platformId, q.subjectId, q.topicId, q.roadmapId, q.q, q.o, q.a, q.e, q.l, q.isActive,
                         p.name as platformName,
                         s.name as subjectName,
                         t.name as topicName,
                         r.name as roadmapName
                  ${questionBaseFrom}${whereClause}${orderClause} LIMIT ? OFFSET ?`,
      params,
      mapRow: (row) => mapQuestionRow(row as Record<string, unknown>),
      page: options.page,
      pageSize: options.pageSize,
    });
  };

  const getQuestionDetails = async (id: number) => {
    const { rows } = await driver.query(
      `SELECT q.id, q.platformId, q.subjectId, q.topicId, q.roadmapId, q.q, q.o, q.a, q.e, q.l, q.isActive,
              p.name as platformName,
              s.name as subjectName,
              t.name as topicName,
              r.name as roadmapName
       ${questionBaseFrom}
       WHERE q.id = ?
       LIMIT 1`,
      [id],
    );
    if (rows.length === 0) {
      return null;
    }
    return mapQuestionRow(rows[0] as Record<string, unknown>);
  };

  const getRandomQuestions = async (options: RandomQuestionOptions = {}) => {
    const limit = Math.max(1, Math.min(50, Math.trunc(options.limit ?? 10)));
    const excludeIds = Array.isArray(options.excludeIds) ? options.excludeIds : [];
    const { conditions, params } = buildQuestionFilters(options.filters ?? {}, excludeIds);
    const whereClause = appendWhereClause(conditions);

    return runPaginatedQuery({
      driver,
      countQuery: `SELECT COUNT(*) as total${questionBaseFrom}${whereClause}`,
      dataQuery: `SELECT q.id, q.platformId, q.subjectId, q.topicId, q.roadmapId, q.q, q.o, q.a, q.e, q.l, q.isActive,
                         p.name as platformName,
                         s.name as subjectName,
                         t.name as topicName,
                         r.name as roadmapName
                  ${questionBaseFrom}${whereClause} ORDER BY RANDOM() LIMIT ? OFFSET ?`,
      params,
      mapRow: (row) => mapQuestionRow(row as Record<string, unknown>),
      page: 1,
      pageSize: limit,
    });
  };

  return {
    searchPlatforms,
    searchSubjects,
    getSubjectDetails,
    searchTopics,
    getTopicDetails,
    searchRoadmaps,
    getRoadmapDetails,
    searchQuestions,
    getQuestionDetails,
    getRandomQuestions,
  };
};

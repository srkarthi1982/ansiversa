// src/drivers/astrodb.ts
import { createClient } from "@libsql/client/web";
var normalizeParams = (params = []) => params.map((param) => param instanceof Date ? param.toISOString() : param);
var normalizeRows = (result) => {
  if (!result.columns || result.rows.length === 0) {
    return result.rows;
  }
  return result.rows.map((row) => {
    if (Array.isArray(row)) {
      const record = Object.fromEntries(
        row.map((value, index) => [result.columns?.[index] ?? index.toString(), value])
      );
      return record;
    }
    return row;
  });
};
var createAstroDbDriver = (options) => {
  const { url, authToken } = options;
  const client = createClient({ url, authToken });
  return {
    client,
    async query(sql, params = []) {
      const result = await client.execute({ sql, args: normalizeParams(params) });
      const rows = normalizeRows(result);
      return { rows };
    },
    async execute(sql, params = []) {
      const result = await client.execute({ sql, args: normalizeParams(params) });
      return result;
    }
  };
};

// src/utils/pagination.ts
var extractTotalCount = (row) => {
  if (!row) {
    return 0;
  }
  const possibleKeys = ["total", "count", "value"];
  for (const key of possibleKeys) {
    const raw = row[key];
    if (typeof raw === "number") {
      return raw;
    }
    if (typeof raw === "string" && raw.trim().length > 0) {
      const parsed = Number(raw);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }
  const firstValue = Object.values(row)[0];
  if (typeof firstValue === "number") {
    return firstValue;
  }
  if (typeof firstValue === "string" && firstValue.trim().length > 0) {
    const parsed = Number(firstValue);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return 0;
};
var runPaginatedQuery = async (config) => {
  const { driver, countQuery, dataQuery, params = [], mapRow, page, pageSize } = config;
  const normalizedPageSize = Math.max(1, Math.trunc(pageSize ?? 20));
  const requestedPage = Math.max(1, Math.trunc(page ?? 1));
  const { rows: countRows } = await driver.query(countQuery, params);
  const total = extractTotalCount(countRows[0]);
  const totalPages = total > 0 ? Math.ceil(total / normalizedPageSize) : 0;
  const maxPage = totalPages > 0 ? totalPages : 1;
  const selectedPage = total === 0 ? 1 : Math.min(requestedPage, maxPage);
  const offset = total === 0 ? 0 : (selectedPage - 1) * normalizedPageSize;
  const { rows } = await driver.query(dataQuery, [...params, normalizedPageSize, offset]);
  const data = rows.map((row) => mapRow(row));
  return {
    data,
    total,
    page: total === 0 ? 1 : selectedPage,
    pageSize: normalizedPageSize,
    totalPages,
    hasNextPage: totalPages > 0 && selectedPage < totalPages,
    hasPreviousPage: totalPages > 0 && selectedPage > 1
  };
};

// src/types/quiz.ts
import { z } from "zod";
var coerceNumber = (value, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }
  return fallback;
};
var coerceInteger = (value, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }
  if (fallback === null) {
    throw new Error(`Expected integer but received ${value}`);
  }
  return fallback;
};
var coerceOptionalInteger = (value) => {
  if (value === null || value === void 0 || value === "") {
    return null;
  }
  try {
    return coerceInteger(value, null);
  } catch {
    return null;
  }
};
var coerceBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "y"].includes(normalized)) {
      return true;
    }
    if (["false", "0", "no", "n"].includes(normalized)) {
      return false;
    }
  }
  return fallback;
};
var coerceString = (value, fallback = "") => {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
};
var coerceNullableString = (value) => {
  if (value === null || value === void 0) {
    return null;
  }
  const str = coerceString(value);
  return str.length === 0 ? null : str;
};
var parseJson = (value) => {
  if (value === null || value === void 0) {
    return null;
  }
  if (typeof value === "object") {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return null;
    }
    try {
      return JSON.parse(trimmed);
    } catch (error) {
      throw new Error(`Failed to parse JSON value: ${error}`);
    }
  }
  throw new Error(`Unsupported JSON value type: ${value}`);
};
var parseDate = (value) => {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }
  throw new Error(`Invalid date value: ${value}`);
};
var toStringArray = (value) => {
  if (value === null || value === void 0) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === "string") {
        return item;
      }
      if (typeof item === "number" || typeof item === "boolean") {
        return String(item);
      }
      if (item && typeof item === "object") {
        return JSON.stringify(item);
      }
      return "";
    }).filter((entry) => entry.length > 0);
  }
  if (typeof value === "object") {
    return Object.values(value).map((entry) => {
      if (typeof entry === "string") {
        return entry;
      }
      if (typeof entry === "number" || typeof entry === "boolean") {
        return String(entry);
      }
      if (entry && typeof entry === "object") {
        return JSON.stringify(entry);
      }
      return "";
    }).filter((entry) => entry.length > 0);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return toStringArray(parsed);
      }
      if (parsed && typeof parsed === "object") {
        return toStringArray(Object.values(parsed));
      }
    } catch {
      return [value];
    }
  }
  return [];
};
var LevelEnum = z.enum(["E", "M", "D"]);
var PlatformRowSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  description: z.union([z.string(), z.null()]).optional(),
  icon: z.union([z.string(), z.null()]).optional(),
  type: z.union([z.string(), z.null()]).optional(),
  qCount: z.union([z.number(), z.string(), z.null()]).optional(),
  isActive: z.union([z.boolean(), z.number(), z.string()]).optional()
});
var SubjectRowSchema = z.object({
  id: z.union([z.number(), z.string()]),
  platformId: z.union([z.number(), z.string()]),
  name: z.string(),
  isActive: z.union([z.boolean(), z.number(), z.string()]).optional(),
  qCount: z.union([z.number(), z.string(), z.null()]).optional()
});
var TopicRowSchema = z.object({
  id: z.union([z.number(), z.string()]),
  platformId: z.union([z.number(), z.string()]),
  subjectId: z.union([z.number(), z.string()]),
  name: z.string(),
  isActive: z.union([z.boolean(), z.number(), z.string()]).optional(),
  qCount: z.union([z.number(), z.string(), z.null()]).optional()
});
var RoadmapRowSchema = z.object({
  id: z.union([z.number(), z.string()]),
  platformId: z.union([z.number(), z.string()]),
  subjectId: z.union([z.number(), z.string()]),
  topicId: z.union([z.number(), z.string()]),
  name: z.string(),
  isActive: z.union([z.boolean(), z.number(), z.string()]).optional(),
  qCount: z.union([z.number(), z.string(), z.null()]).optional()
});
var QuestionRowSchema = z.object({
  id: z.union([z.number(), z.string()]),
  platformId: z.union([z.number(), z.string()]),
  subjectId: z.union([z.number(), z.string(), z.null()]).optional(),
  topicId: z.union([z.number(), z.string(), z.null()]).optional(),
  roadmapId: z.union([z.number(), z.string(), z.null()]).optional(),
  q: z.string(),
  o: z.unknown().optional(),
  a: z.string(),
  e: z.union([z.string(), z.null()]).optional(),
  l: z.union([z.string(), z.null()]).optional(),
  isActive: z.union([z.boolean(), z.number(), z.string()]).optional()
});
var ResultRowSchema = z.object({
  id: z.union([z.number(), z.string()]),
  userId: z.string(),
  platformId: z.union([z.number(), z.string()]),
  subjectId: z.union([z.number(), z.string(), z.null()]).optional(),
  topicId: z.union([z.number(), z.string(), z.null()]).optional(),
  roadmapId: z.union([z.number(), z.string(), z.null()]).optional(),
  level: z.union([z.string(), z.null()]).optional(),
  responses: z.unknown().optional(),
  mark: z.union([z.number(), z.string(), z.null()]).optional(),
  createdAt: z.union([z.string(), z.number(), z.date()])
});
var PlatformSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  type: z.string().nullable(),
  qCount: z.number().int(),
  isActive: z.boolean()
});
var NewPlatformSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(""),
  icon: z.string().optional().default(""),
  type: z.string().nullable().optional(),
  qCount: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true)
});
var UpdatePlatformSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  type: z.string().nullable().optional(),
  qCount: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional()
});
var SubjectSchema = z.object({
  id: z.number().int(),
  platformId: z.number().int(),
  name: z.string(),
  isActive: z.boolean(),
  qCount: z.number().int()
});
var NewSubjectSchema = z.object({
  id: z.number().int().nonnegative().optional(),
  platformId: z.number().int().nonnegative(),
  name: z.string().min(1),
  isActive: z.boolean().default(true),
  qCount: z.number().int().nonnegative().default(0)
});
var UpdateSubjectSchema = z.object({
  platformId: z.number().int().nonnegative().optional(),
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  qCount: z.number().int().nonnegative().optional()
});
var TopicSchema = z.object({
  id: z.number().int(),
  platformId: z.number().int(),
  subjectId: z.number().int(),
  name: z.string(),
  isActive: z.boolean(),
  qCount: z.number().int()
});
var NewTopicSchema = z.object({
  id: z.number().int().nonnegative().optional(),
  platformId: z.number().int().nonnegative(),
  subjectId: z.number().int().nonnegative(),
  name: z.string().min(1),
  isActive: z.boolean().default(true),
  qCount: z.number().int().nonnegative().default(0)
});
var UpdateTopicSchema = z.object({
  platformId: z.number().int().nonnegative().optional(),
  subjectId: z.number().int().nonnegative().optional(),
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  qCount: z.number().int().nonnegative().optional()
});
var RoadmapSchema = z.object({
  id: z.number().int(),
  platformId: z.number().int(),
  subjectId: z.number().int(),
  topicId: z.number().int(),
  name: z.string(),
  isActive: z.boolean(),
  qCount: z.number().int()
});
var NewRoadmapSchema = z.object({
  id: z.number().int().nonnegative().optional(),
  platformId: z.number().int().nonnegative(),
  subjectId: z.number().int().nonnegative(),
  topicId: z.number().int().nonnegative(),
  name: z.string().min(1),
  isActive: z.boolean().default(true),
  qCount: z.number().int().nonnegative().default(0)
});
var UpdateRoadmapSchema = z.object({
  platformId: z.number().int().nonnegative().optional(),
  subjectId: z.number().int().nonnegative().optional(),
  topicId: z.number().int().nonnegative().optional(),
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  qCount: z.number().int().nonnegative().optional()
});
var QuestionSchema = z.object({
  id: z.number().int(),
  platformId: z.number().int(),
  subjectId: z.number().int().nullable(),
  topicId: z.number().int().nullable(),
  roadmapId: z.number().int().nullable(),
  question: z.string(),
  options: z.array(z.string()),
  answer: z.string(),
  explanation: z.string().nullable(),
  level: LevelEnum,
  isActive: z.boolean()
});
var NewQuestionSchema = z.object({
  platformId: z.number().int().nonnegative(),
  subjectId: z.number().int().nonnegative().nullable().optional(),
  topicId: z.number().int().nonnegative().nullable().optional(),
  roadmapId: z.number().int().nonnegative().nullable().optional(),
  question: z.string().min(1),
  options: z.array(z.string()).default([]),
  answer: z.string().min(1),
  explanation: z.string().nullable().optional(),
  level: LevelEnum,
  isActive: z.boolean().default(true)
});
var UpdateQuestionSchema = z.object({
  platformId: z.number().int().nonnegative().optional(),
  subjectId: z.number().int().nonnegative().nullable().optional(),
  topicId: z.number().int().nonnegative().nullable().optional(),
  roadmapId: z.number().int().nonnegative().nullable().optional(),
  question: z.string().min(1).optional(),
  options: z.array(z.string()).optional(),
  answer: z.string().min(1).optional(),
  explanation: z.string().nullable().optional(),
  level: LevelEnum.optional(),
  isActive: z.boolean().optional()
});
var ResultSchema = z.object({
  id: z.number().int(),
  userId: z.string(),
  platformId: z.number().int(),
  subjectId: z.number().int().nullable(),
  topicId: z.number().int().nullable(),
  roadmapId: z.number().int().nullable(),
  level: LevelEnum,
  responses: z.unknown(),
  mark: z.number(),
  createdAt: z.date()
});
var NewResultSchema = z.object({
  userId: z.string().min(1),
  platformId: z.number().int().nonnegative(),
  subjectId: z.number().int().nonnegative().nullable().optional(),
  topicId: z.number().int().nonnegative().nullable().optional(),
  roadmapId: z.number().int().nonnegative().nullable().optional(),
  level: LevelEnum,
  responses: z.unknown().optional(),
  mark: z.number().default(0)
});
var UpdateResultSchema = z.object({
  userId: z.string().min(1).optional(),
  platformId: z.number().int().nonnegative().optional(),
  subjectId: z.number().int().nonnegative().nullable().optional(),
  topicId: z.number().int().nonnegative().nullable().optional(),
  roadmapId: z.number().int().nonnegative().nullable().optional(),
  level: LevelEnum.optional(),
  responses: z.unknown().optional(),
  mark: z.number().optional()
});
var parsePlatform = (row) => {
  const parsed = PlatformRowSchema.parse(row);
  return PlatformSchema.parse({
    id: coerceInteger(parsed.id),
    name: parsed.name,
    description: coerceString(parsed.description ?? ""),
    icon: coerceString(parsed.icon ?? ""),
    type: coerceNullableString(parsed.type),
    qCount: coerceInteger(parsed.qCount ?? 0),
    isActive: coerceBoolean(parsed.isActive, true)
  });
};
var parseSubject = (row) => {
  const parsed = SubjectRowSchema.parse(row);
  return SubjectSchema.parse({
    id: coerceInteger(parsed.id),
    platformId: coerceInteger(parsed.platformId),
    name: parsed.name,
    isActive: coerceBoolean(parsed.isActive, true),
    qCount: coerceInteger(parsed.qCount ?? 0)
  });
};
var parseTopic = (row) => {
  const parsed = TopicRowSchema.parse(row);
  return TopicSchema.parse({
    id: coerceInteger(parsed.id),
    platformId: coerceInteger(parsed.platformId),
    subjectId: coerceInteger(parsed.subjectId),
    name: parsed.name,
    isActive: coerceBoolean(parsed.isActive, true),
    qCount: coerceInteger(parsed.qCount ?? 0)
  });
};
var parseRoadmap = (row) => {
  const parsed = RoadmapRowSchema.parse(row);
  return RoadmapSchema.parse({
    id: coerceInteger(parsed.id),
    platformId: coerceInteger(parsed.platformId),
    subjectId: coerceInteger(parsed.subjectId),
    topicId: coerceInteger(parsed.topicId),
    name: parsed.name,
    isActive: coerceBoolean(parsed.isActive, true),
    qCount: coerceInteger(parsed.qCount ?? 0)
  });
};
var normalizeQuestion = (row) => {
  const parsed = QuestionRowSchema.parse(row);
  const level = coerceString(parsed.l ?? "").toUpperCase();
  const normalizedLevel = LevelEnum.safeParse(level);
  return QuestionSchema.parse({
    id: coerceInteger(parsed.id),
    platformId: coerceInteger(parsed.platformId),
    subjectId: coerceOptionalInteger(parsed.subjectId),
    topicId: coerceOptionalInteger(parsed.topicId),
    roadmapId: coerceOptionalInteger(parsed.roadmapId),
    question: parsed.q,
    options: toStringArray(parsed.o),
    answer: parsed.a,
    explanation: coerceNullableString(parsed.e),
    level: normalizedLevel.success ? normalizedLevel.data : "E",
    isActive: coerceBoolean(parsed.isActive, true)
  });
};
var parseResult = (row) => {
  const parsed = ResultRowSchema.parse(row);
  const level = coerceString(parsed.level ?? "").toUpperCase();
  const normalizedLevel = LevelEnum.safeParse(level);
  return ResultSchema.parse({
    id: coerceInteger(parsed.id),
    userId: parsed.userId,
    platformId: coerceInteger(parsed.platformId),
    subjectId: coerceOptionalInteger(parsed.subjectId),
    topicId: coerceOptionalInteger(parsed.topicId),
    roadmapId: coerceOptionalInteger(parsed.roadmapId),
    level: normalizedLevel.success ? normalizedLevel.data : "E",
    responses: (() => {
      try {
        return parseJson(parsed.responses) ?? null;
      } catch {
        return parsed.responses ?? null;
      }
    })(),
    mark: coerceNumber(parsed.mark ?? 0),
    createdAt: parseDate(parsed.createdAt)
  });
};

// src/repos/platforms.repo.ts
var returningColumns = "id, name, description, icon, type, qCount, isActive";
var selectClause = `SELECT ${returningColumns} FROM Platform`;
var createPlatformsRepo = (driver) => {
  const getSingle = async (id) => {
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
    async listPaginated(options = {}) {
      return runPaginatedQuery({
        driver,
        countQuery: "SELECT COUNT(*) as total FROM Platform",
        dataQuery: `${selectClause} ORDER BY name ASC LIMIT ? OFFSET ?`,
        mapRow: parsePlatform,
        page: options.page,
        pageSize: options.pageSize
      });
    },
    async getById(id) {
      return getSingle(id);
    },
    async create(input) {
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
          data.isActive ? 1 : 0
        ]
      );
      if (rows.length === 0) {
        throw new Error("Failed to insert platform record");
      }
      return parsePlatform(rows[0]);
    },
    async update(id, input) {
      const data = UpdatePlatformSchema.parse(input ?? {});
      const setClauses = [];
      const params = [];
      if (data.name !== void 0) {
        setClauses.push("name = ?");
        params.push(data.name);
      }
      if (data.description !== void 0) {
        setClauses.push("description = ?");
        params.push(data.description);
      }
      if (data.icon !== void 0) {
        setClauses.push("icon = ?");
        params.push(data.icon);
      }
      if (data.type !== void 0) {
        setClauses.push("type = ?");
        params.push(data.type ?? null);
      }
      if (data.qCount !== void 0) {
        setClauses.push("qCount = ?");
        params.push(data.qCount);
      }
      if (data.isActive !== void 0) {
        setClauses.push("isActive = ?");
        params.push(data.isActive ? 1 : 0);
      }
      if (setClauses.length === 0) {
        return getSingle(id);
      }
      const { rows } = await driver.query(
        `UPDATE Platform SET ${setClauses.join(", ")} WHERE id = ? RETURNING ${returningColumns}`,
        [...params, id]
      );
      if (rows.length === 0) {
        return null;
      }
      return parsePlatform(rows[0]);
    },
    async delete(id) {
      const { rows } = await driver.query(
        `DELETE FROM Platform WHERE id = ? RETURNING ${returningColumns}`,
        [id]
      );
      if (rows.length === 0) {
        return null;
      }
      return parsePlatform(rows[0]);
    }
  };
};

// src/repos/questions.repo.ts
var returningColumns2 = "id, platformId, subjectId, topicId, roadmapId, q, o, a, e, l, isActive";
var selectClause2 = `SELECT ${returningColumns2} FROM Question`;
var createQuestionsRepo = (driver) => {
  const getSingle = async (id) => {
    const { rows } = await driver.query(`${selectClause2} WHERE id = ? LIMIT 1`, [id]);
    if (rows.length === 0) {
      return null;
    }
    return normalizeQuestion(rows[0]);
  };
  return {
    async listByPlatform(platformId) {
      const { rows } = await driver.query(
        `${selectClause2} WHERE platformId = ? ORDER BY id ASC`,
        [platformId]
      );
      return rows.map((row) => normalizeQuestion(row));
    },
    async listBySubject(subjectId) {
      const { rows } = await driver.query(
        `${selectClause2} WHERE subjectId = ? ORDER BY id ASC`,
        [subjectId]
      );
      return rows.map((row) => normalizeQuestion(row));
    },
    async listByTopic(topicId) {
      const { rows } = await driver.query(
        `${selectClause2} WHERE topicId = ? ORDER BY id ASC`,
        [topicId]
      );
      return rows.map((row) => normalizeQuestion(row));
    },
    async listByRoadmap(roadmapId) {
      const { rows } = await driver.query(
        `${selectClause2} WHERE roadmapId = ? ORDER BY id ASC`,
        [roadmapId]
      );
      return rows.map((row) => normalizeQuestion(row));
    },
    async listPaginated(options = {}) {
      const conditions = [];
      const params = [];
      if (options.platformId !== void 0) {
        conditions.push("platformId = ?");
        params.push(options.platformId);
      }
      if (options.subjectId !== void 0) {
        if (options.subjectId === null) {
          conditions.push("subjectId IS NULL");
        } else {
          conditions.push("subjectId = ?");
          params.push(options.subjectId);
        }
      }
      if (options.topicId !== void 0) {
        if (options.topicId === null) {
          conditions.push("topicId IS NULL");
        } else {
          conditions.push("topicId = ?");
          params.push(options.topicId);
        }
      }
      if (options.roadmapId !== void 0) {
        if (options.roadmapId === null) {
          conditions.push("roadmapId IS NULL");
        } else {
          conditions.push("roadmapId = ?");
          params.push(options.roadmapId);
        }
      }
      if (options.level !== void 0) {
        conditions.push("l = ?");
        params.push(options.level);
      }
      if (options.isActive !== void 0) {
        conditions.push("isActive = ?");
        params.push(options.isActive ? 1 : 0);
      }
      const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";
      return runPaginatedQuery({
        driver,
        countQuery: `SELECT COUNT(*) as total FROM Question${whereClause}`,
        dataQuery: `${selectClause2}${whereClause} ORDER BY id ASC LIMIT ? OFFSET ?`,
        params,
        mapRow: normalizeQuestion,
        page: options.page,
        pageSize: options.pageSize
      });
    },
    async getById(id) {
      return getSingle(id);
    },
    async getRandomByPlatform(platformId, limit = 1) {
      const { rows } = await driver.query(
        `${selectClause2} WHERE platformId = ? ORDER BY RANDOM() LIMIT ?`,
        [platformId, limit]
      );
      return rows.map((row) => normalizeQuestion(row));
    },
    async create(input) {
      const data = NewQuestionSchema.parse(input);
      const { rows } = await driver.query(
        `INSERT INTO Question (platformId, subjectId, topicId, roadmapId, q, o, a, e, l, isActive)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING ${returningColumns2}`,
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
          data.isActive ? 1 : 0
        ]
      );
      if (rows.length === 0) {
        throw new Error("Failed to insert question record");
      }
      return normalizeQuestion(rows[0]);
    },
    async update(id, input) {
      const data = UpdateQuestionSchema.parse(input ?? {});
      const setClauses = [];
      const params = [];
      if (data.platformId !== void 0) {
        setClauses.push("platformId = ?");
        params.push(data.platformId);
      }
      if (data.subjectId !== void 0) {
        setClauses.push("subjectId = ?");
        params.push(data.subjectId ?? null);
      }
      if (data.topicId !== void 0) {
        setClauses.push("topicId = ?");
        params.push(data.topicId ?? null);
      }
      if (data.roadmapId !== void 0) {
        setClauses.push("roadmapId = ?");
        params.push(data.roadmapId ?? null);
      }
      if (data.question !== void 0) {
        setClauses.push("q = ?");
        params.push(data.question);
      }
      if (data.options !== void 0) {
        setClauses.push("o = ?");
        params.push(JSON.stringify(data.options));
      }
      if (data.answer !== void 0) {
        setClauses.push("a = ?");
        params.push(data.answer);
      }
      if (data.explanation !== void 0) {
        setClauses.push("e = ?");
        params.push(data.explanation ?? null);
      }
      if (data.level !== void 0) {
        setClauses.push("l = ?");
        params.push(data.level);
      }
      if (data.isActive !== void 0) {
        setClauses.push("isActive = ?");
        params.push(data.isActive ? 1 : 0);
      }
      if (setClauses.length === 0) {
        return getSingle(id);
      }
      const { rows } = await driver.query(
        `UPDATE Question SET ${setClauses.join(", ")} WHERE id = ? RETURNING ${returningColumns2}`,
        [...params, id]
      );
      if (rows.length === 0) {
        return null;
      }
      return normalizeQuestion(rows[0]);
    },
    async delete(id) {
      const { rows } = await driver.query(
        `DELETE FROM Question WHERE id = ? RETURNING ${returningColumns2}`,
        [id]
      );
      if (rows.length === 0) {
        return null;
      }
      return normalizeQuestion(rows[0]);
    }
  };
};

// src/utils/ids.ts
var coerceIdValue = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(1, Math.trunc(value));
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      return Math.max(1, parsed);
    }
  }
  return 1;
};
var getNextNumericId = async (driver, tableName) => {
  const { rows } = await driver.query(
    `SELECT COALESCE(MAX(id), 0) + 1 as nextId FROM ${tableName}`
  );
  const raw = rows[0]?.nextId ?? 1;
  return coerceIdValue(raw);
};

// src/repos/subjects.repo.ts
var returningColumns3 = "id, platformId, name, isActive, qCount";
var selectClause3 = `SELECT ${returningColumns3} FROM Subject`;
var createSubjectsRepo = (driver) => {
  const getSingle = async (id) => {
    const { rows } = await driver.query(`${selectClause3} WHERE id = ? LIMIT 1`, [id]);
    if (rows.length === 0) {
      return null;
    }
    return parseSubject(rows[0]);
  };
  return {
    async list() {
      const { rows } = await driver.query(`${selectClause3} ORDER BY name ASC`);
      return rows.map((row) => parseSubject(row));
    },
    async listByPlatform(platformId) {
      const { rows } = await driver.query(
        `${selectClause3} WHERE platformId = ? ORDER BY name ASC`,
        [platformId]
      );
      return rows.map((row) => parseSubject(row));
    },
    async listPaginated(options = {}) {
      const conditions = [];
      const params = [];
      if (options.platformId !== void 0) {
        conditions.push("platformId = ?");
        params.push(options.platformId);
      }
      const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";
      return runPaginatedQuery({
        driver,
        countQuery: `SELECT COUNT(*) as total FROM Subject${whereClause}`,
        dataQuery: `${selectClause3}${whereClause} ORDER BY name ASC LIMIT ? OFFSET ?`,
        params,
        mapRow: parseSubject,
        page: options.page,
        pageSize: options.pageSize
      });
    },
    async getById(id) {
      return getSingle(id);
    },
    async create(input) {
      const data = NewSubjectSchema.parse(input);
      const id = data.id ?? await getNextNumericId(driver, "Subject");
      const { rows } = await driver.query(
        `INSERT INTO Subject (id, platformId, name, isActive, qCount)
         VALUES (?, ?, ?, ?, ?)
         RETURNING ${returningColumns3}`,
        [id, data.platformId, data.name, data.isActive ? 1 : 0, data.qCount]
      );
      if (rows.length === 0) {
        throw new Error("Failed to insert subject record");
      }
      return parseSubject(rows[0]);
    },
    async update(id, input) {
      const data = UpdateSubjectSchema.parse(input ?? {});
      const setClauses = [];
      const params = [];
      if (data.platformId !== void 0) {
        setClauses.push("platformId = ?");
        params.push(data.platformId);
      }
      if (data.name !== void 0) {
        setClauses.push("name = ?");
        params.push(data.name);
      }
      if (data.isActive !== void 0) {
        setClauses.push("isActive = ?");
        params.push(data.isActive ? 1 : 0);
      }
      if (data.qCount !== void 0) {
        setClauses.push("qCount = ?");
        params.push(data.qCount);
      }
      if (setClauses.length === 0) {
        return getSingle(id);
      }
      const { rows } = await driver.query(
        `UPDATE Subject SET ${setClauses.join(", ")} WHERE id = ? RETURNING ${returningColumns3}`,
        [...params, id]
      );
      if (rows.length === 0) {
        return null;
      }
      return parseSubject(rows[0]);
    },
    async delete(id) {
      const { rows } = await driver.query(
        `DELETE FROM Subject WHERE id = ? RETURNING ${returningColumns3}`,
        [id]
      );
      if (rows.length === 0) {
        return null;
      }
      return parseSubject(rows[0]);
    }
  };
};

// src/repos/topics.repo.ts
var returningColumns4 = "id, platformId, subjectId, name, isActive, qCount";
var selectClause4 = `SELECT ${returningColumns4} FROM Topic`;
var createTopicsRepo = (driver) => {
  const getSingle = async (id) => {
    const { rows } = await driver.query(`${selectClause4} WHERE id = ? LIMIT 1`, [id]);
    if (rows.length === 0) {
      return null;
    }
    return parseTopic(rows[0]);
  };
  return {
    async list() {
      const { rows } = await driver.query(`${selectClause4} ORDER BY name ASC`);
      return rows.map((row) => parseTopic(row));
    },
    async listByPlatform(platformId) {
      const { rows } = await driver.query(
        `${selectClause4} WHERE platformId = ? ORDER BY name ASC`,
        [platformId]
      );
      return rows.map((row) => parseTopic(row));
    },
    async listBySubject(subjectId) {
      const { rows } = await driver.query(
        `${selectClause4} WHERE subjectId = ? ORDER BY name ASC`,
        [subjectId]
      );
      return rows.map((row) => parseTopic(row));
    },
    async listPaginated(options = {}) {
      const conditions = [];
      const params = [];
      if (options.platformId !== void 0) {
        conditions.push("platformId = ?");
        params.push(options.platformId);
      }
      if (options.subjectId !== void 0) {
        conditions.push("subjectId = ?");
        params.push(options.subjectId);
      }
      const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";
      return runPaginatedQuery({
        driver,
        countQuery: `SELECT COUNT(*) as total FROM Topic${whereClause}`,
        dataQuery: `${selectClause4}${whereClause} ORDER BY name ASC LIMIT ? OFFSET ?`,
        params,
        mapRow: parseTopic,
        page: options.page,
        pageSize: options.pageSize
      });
    },
    async getById(id) {
      return getSingle(id);
    },
    async create(input) {
      const data = NewTopicSchema.parse(input);
      const id = data.id ?? await getNextNumericId(driver, "Topic");
      const { rows } = await driver.query(
        `INSERT INTO Topic (id, platformId, subjectId, name, isActive, qCount)
         VALUES (?, ?, ?, ?, ?, ?)
         RETURNING ${returningColumns4}`,
        [id, data.platformId, data.subjectId, data.name, data.isActive ? 1 : 0, data.qCount]
      );
      if (rows.length === 0) {
        throw new Error("Failed to insert topic record");
      }
      return parseTopic(rows[0]);
    },
    async update(id, input) {
      const data = UpdateTopicSchema.parse(input ?? {});
      const setClauses = [];
      const params = [];
      if (data.platformId !== void 0) {
        setClauses.push("platformId = ?");
        params.push(data.platformId);
      }
      if (data.subjectId !== void 0) {
        setClauses.push("subjectId = ?");
        params.push(data.subjectId);
      }
      if (data.name !== void 0) {
        setClauses.push("name = ?");
        params.push(data.name);
      }
      if (data.isActive !== void 0) {
        setClauses.push("isActive = ?");
        params.push(data.isActive ? 1 : 0);
      }
      if (data.qCount !== void 0) {
        setClauses.push("qCount = ?");
        params.push(data.qCount);
      }
      if (setClauses.length === 0) {
        return getSingle(id);
      }
      const { rows } = await driver.query(
        `UPDATE Topic SET ${setClauses.join(", ")} WHERE id = ? RETURNING ${returningColumns4}`,
        [...params, id]
      );
      if (rows.length === 0) {
        return null;
      }
      return parseTopic(rows[0]);
    },
    async delete(id) {
      const { rows } = await driver.query(
        `DELETE FROM Topic WHERE id = ? RETURNING ${returningColumns4}`,
        [id]
      );
      if (rows.length === 0) {
        return null;
      }
      return parseTopic(rows[0]);
    }
  };
};

// src/repos/roadmaps.repo.ts
var returningColumns5 = "id, platformId, subjectId, topicId, name, isActive, qCount";
var selectClause5 = `SELECT ${returningColumns5} FROM Roadmap`;
var createRoadmapsRepo = (driver) => {
  const getSingle = async (id) => {
    const { rows } = await driver.query(`${selectClause5} WHERE id = ? LIMIT 1`, [id]);
    if (rows.length === 0) {
      return null;
    }
    return parseRoadmap(rows[0]);
  };
  return {
    async list() {
      const { rows } = await driver.query(`${selectClause5} ORDER BY name ASC`);
      return rows.map((row) => parseRoadmap(row));
    },
    async listByPlatform(platformId) {
      const { rows } = await driver.query(
        `${selectClause5} WHERE platformId = ? ORDER BY name ASC`,
        [platformId]
      );
      return rows.map((row) => parseRoadmap(row));
    },
    async listBySubject(subjectId) {
      const { rows } = await driver.query(
        `${selectClause5} WHERE subjectId = ? ORDER BY name ASC`,
        [subjectId]
      );
      return rows.map((row) => parseRoadmap(row));
    },
    async listByTopic(topicId) {
      const { rows } = await driver.query(
        `${selectClause5} WHERE topicId = ? ORDER BY name ASC`,
        [topicId]
      );
      return rows.map((row) => parseRoadmap(row));
    },
    async listPaginated(options = {}) {
      const conditions = [];
      const params = [];
      if (options.platformId !== void 0) {
        conditions.push("platformId = ?");
        params.push(options.platformId);
      }
      if (options.subjectId !== void 0) {
        conditions.push("subjectId = ?");
        params.push(options.subjectId);
      }
      if (options.topicId !== void 0) {
        conditions.push("topicId = ?");
        params.push(options.topicId);
      }
      const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";
      return runPaginatedQuery({
        driver,
        countQuery: `SELECT COUNT(*) as total FROM Roadmap${whereClause}`,
        dataQuery: `${selectClause5}${whereClause} ORDER BY name ASC LIMIT ? OFFSET ?`,
        params,
        mapRow: parseRoadmap,
        page: options.page,
        pageSize: options.pageSize
      });
    },
    async getById(id) {
      return getSingle(id);
    },
    async create(input) {
      const data = NewRoadmapSchema.parse(input);
      const id = data.id ?? await getNextNumericId(driver, "Roadmap");
      const { rows } = await driver.query(
        `INSERT INTO Roadmap (id, platformId, subjectId, topicId, name, isActive, qCount)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         RETURNING ${returningColumns5}`,
        [
          id,
          data.platformId,
          data.subjectId,
          data.topicId,
          data.name,
          data.isActive ? 1 : 0,
          data.qCount
        ]
      );
      if (rows.length === 0) {
        throw new Error("Failed to insert roadmap record");
      }
      return parseRoadmap(rows[0]);
    },
    async update(id, input) {
      const data = UpdateRoadmapSchema.parse(input ?? {});
      const setClauses = [];
      const params = [];
      if (data.platformId !== void 0) {
        setClauses.push("platformId = ?");
        params.push(data.platformId);
      }
      if (data.subjectId !== void 0) {
        setClauses.push("subjectId = ?");
        params.push(data.subjectId);
      }
      if (data.topicId !== void 0) {
        setClauses.push("topicId = ?");
        params.push(data.topicId);
      }
      if (data.name !== void 0) {
        setClauses.push("name = ?");
        params.push(data.name);
      }
      if (data.isActive !== void 0) {
        setClauses.push("isActive = ?");
        params.push(data.isActive ? 1 : 0);
      }
      if (data.qCount !== void 0) {
        setClauses.push("qCount = ?");
        params.push(data.qCount);
      }
      if (setClauses.length === 0) {
        return getSingle(id);
      }
      const { rows } = await driver.query(
        `UPDATE Roadmap SET ${setClauses.join(", ")} WHERE id = ? RETURNING ${returningColumns5}`,
        [...params, id]
      );
      if (rows.length === 0) {
        return null;
      }
      return parseRoadmap(rows[0]);
    },
    async delete(id) {
      const { rows } = await driver.query(
        `DELETE FROM Roadmap WHERE id = ? RETURNING ${returningColumns5}`,
        [id]
      );
      if (rows.length === 0) {
        return null;
      }
      return parseRoadmap(rows[0]);
    }
  };
};

// src/repos/results.repo.ts
var returningColumns6 = "id, userId, platformId, subjectId, topicId, roadmapId, level, responses, mark, createdAt";
var baseSelect = `SELECT ${returningColumns6} FROM Result`;
var createResultsRepo = (driver) => {
  const getSingle = async (id) => {
    const { rows } = await driver.query(`${baseSelect} WHERE id = ? LIMIT 1`, [id]);
    if (rows.length === 0) {
      return null;
    }
    return parseResult(rows[0]);
  };
  return {
    async list() {
      const { rows } = await driver.query(`${baseSelect} ORDER BY createdAt DESC, id DESC`);
      return rows.map((row) => parseResult(row));
    },
    async listByUser(userId) {
      const { rows } = await driver.query(
        `${baseSelect} WHERE userId = ? ORDER BY createdAt DESC, id DESC`,
        [userId]
      );
      return rows.map((row) => parseResult(row));
    },
    async listByPlatform(platformId) {
      const { rows } = await driver.query(
        `${baseSelect} WHERE platformId = ? ORDER BY createdAt DESC, id DESC`,
        [platformId]
      );
      return rows.map((row) => parseResult(row));
    },
    async listPaginated(options = {}) {
      const conditions = [];
      const params = [];
      if (options.userId !== void 0) {
        conditions.push("userId = ?");
        params.push(options.userId);
      }
      if (options.platformId !== void 0) {
        conditions.push("platformId = ?");
        params.push(options.platformId);
      }
      if (options.subjectId !== void 0) {
        if (options.subjectId === null) {
          conditions.push("subjectId IS NULL");
        } else {
          conditions.push("subjectId = ?");
          params.push(options.subjectId);
        }
      }
      if (options.topicId !== void 0) {
        if (options.topicId === null) {
          conditions.push("topicId IS NULL");
        } else {
          conditions.push("topicId = ?");
          params.push(options.topicId);
        }
      }
      if (options.roadmapId !== void 0) {
        if (options.roadmapId === null) {
          conditions.push("roadmapId IS NULL");
        } else {
          conditions.push("roadmapId = ?");
          params.push(options.roadmapId);
        }
      }
      if (options.level !== void 0) {
        conditions.push("level = ?");
        params.push(options.level);
      }
      const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";
      return runPaginatedQuery({
        driver,
        countQuery: `SELECT COUNT(*) as total FROM Result${whereClause}`,
        dataQuery: `${baseSelect}${whereClause} ORDER BY createdAt DESC, id DESC LIMIT ? OFFSET ?`,
        params,
        mapRow: parseResult,
        page: options.page,
        pageSize: options.pageSize
      });
    },
    async getById(id) {
      return getSingle(id);
    },
    async create(input) {
      const data = NewResultSchema.parse(input);
      const { rows } = await driver.query(
        `INSERT INTO Result (userId, platformId, subjectId, topicId, roadmapId, level, responses, mark)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING ${returningColumns6}`,
        [
          data.userId,
          data.platformId,
          data.subjectId ?? null,
          data.topicId ?? null,
          data.roadmapId ?? null,
          data.level,
          data.responses !== void 0 ? JSON.stringify(data.responses) : null,
          data.mark
        ]
      );
      if (rows.length === 0) {
        throw new Error("Failed to insert result record");
      }
      return parseResult(rows[0]);
    },
    async update(id, input) {
      const data = UpdateResultSchema.parse(input ?? {});
      const setClauses = [];
      const params = [];
      if (data.userId !== void 0) {
        setClauses.push("userId = ?");
        params.push(data.userId);
      }
      if (data.platformId !== void 0) {
        setClauses.push("platformId = ?");
        params.push(data.platformId);
      }
      if (data.subjectId !== void 0) {
        setClauses.push("subjectId = ?");
        params.push(data.subjectId ?? null);
      }
      if (data.topicId !== void 0) {
        setClauses.push("topicId = ?");
        params.push(data.topicId ?? null);
      }
      if (data.roadmapId !== void 0) {
        setClauses.push("roadmapId = ?");
        params.push(data.roadmapId ?? null);
      }
      if (data.level !== void 0) {
        setClauses.push("level = ?");
        params.push(data.level);
      }
      if (data.responses !== void 0) {
        setClauses.push("responses = ?");
        params.push(data.responses !== void 0 ? JSON.stringify(data.responses) : null);
      }
      if (data.mark !== void 0) {
        setClauses.push("mark = ?");
        params.push(data.mark);
      }
      if (setClauses.length === 0) {
        return getSingle(id);
      }
      const { rows } = await driver.query(
        `UPDATE Result SET ${setClauses.join(", ")} WHERE id = ? RETURNING ${returningColumns6}`,
        [...params, id]
      );
      if (rows.length === 0) {
        return null;
      }
      return parseResult(rows[0]);
    },
    async delete(id) {
      const { rows } = await driver.query(
        `DELETE FROM Result WHERE id = ? RETURNING ${returningColumns6}`,
        [id]
      );
      if (rows.length === 0) {
        return null;
      }
      return parseResult(rows[0]);
    }
  };
};

// src/repos/quiz-admin.repo.ts
var normalizeSearchTerm = (value) => {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};
var appendWhereClause = (conditions) => conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";
var buildOrderClause = (columnMap, column, direction, fallback) => {
  const normalizedDirection = direction === "desc" ? "DESC" : "ASC";
  const normalizedColumn = column ? columnMap[column] ?? fallback : fallback;
  const secondaryOrder = normalizedColumn === fallback ? "" : `, ${fallback}`;
  return ` ORDER BY ${normalizedColumn} ${normalizedDirection}${secondaryOrder}`;
};
var mapSubjectRow = (row) => ({
  subject: parseSubject(row),
  platformName: typeof row.platformName === "string" ? row.platformName : null
});
var mapTopicRow = (row) => ({
  topic: parseTopic(row),
  platformName: typeof row.platformName === "string" ? row.platformName : null,
  subjectName: typeof row.subjectName === "string" ? row.subjectName : null
});
var mapRoadmapRow = (row) => ({
  roadmap: parseRoadmap(row),
  platformName: typeof row.platformName === "string" ? row.platformName : null,
  subjectName: typeof row.subjectName === "string" ? row.subjectName : null,
  topicName: typeof row.topicName === "string" ? row.topicName : null
});
var mapQuestionRow = (row) => ({
  question: normalizeQuestion(row),
  platformName: typeof row.platformName === "string" ? row.platformName : null,
  subjectName: typeof row.subjectName === "string" ? row.subjectName : null,
  topicName: typeof row.topicName === "string" ? row.topicName : null,
  roadmapName: typeof row.roadmapName === "string" ? row.roadmapName : null
});
var normalizeLevel = (value) => {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim().toUpperCase();
  return normalized === "E" || normalized === "M" || normalized === "D" ? normalized : null;
};
var createQuizAdminRepo = (driver) => {
  const searchPlatforms = async (options = {}) => {
    const conditions = [];
    const params = [];
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
        status: "p.isActive"
      },
      options.sortColumn,
      options.sortDirection,
      "p.id"
    );
    return runPaginatedQuery({
      driver,
      countQuery: `SELECT COUNT(*) as total FROM Platform p${whereClause}`,
      dataQuery: `SELECT p.id, p.name, p.description, p.icon, p.type, p.qCount, p.isActive FROM Platform p${whereClause}${orderClause} LIMIT ? OFFSET ?`,
      params,
      mapRow: (row) => parsePlatform(row),
      page: options.page,
      pageSize: options.pageSize
    });
  };
  const searchSubjects = async (options = {}) => {
    const conditions = [];
    const params = [];
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
        status: "s.isActive"
      },
      options.sortColumn,
      options.sortDirection,
      "s.id"
    );
    const baseFrom = " FROM Subject s LEFT JOIN Platform p ON s.platformId = p.id";
    return runPaginatedQuery({
      driver,
      countQuery: `SELECT COUNT(*) as total${baseFrom}${whereClause}`,
      dataQuery: `SELECT s.id, s.platformId, s.name, s.isActive, s.qCount, p.name as platformName${baseFrom}${whereClause}${orderClause} LIMIT ? OFFSET ?`,
      params,
      mapRow: (row) => mapSubjectRow(row),
      page: options.page,
      pageSize: options.pageSize
    });
  };
  const getSubjectDetails = async (id) => {
    const { rows } = await driver.query(
      `SELECT s.id, s.platformId, s.name, s.isActive, s.qCount, p.name as platformName
       FROM Subject s
       LEFT JOIN Platform p ON s.platformId = p.id
       WHERE s.id = ?
       LIMIT 1`,
      [id]
    );
    if (rows.length === 0) {
      return null;
    }
    return mapSubjectRow(rows[0]);
  };
  const searchTopics = async (options = {}) => {
    const conditions = [];
    const params = [];
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
        status: "t.isActive"
      },
      options.sortColumn,
      options.sortDirection,
      "t.id"
    );
    const baseFrom = " FROM Topic t LEFT JOIN Subject s ON t.subjectId = s.id LEFT JOIN Platform p ON t.platformId = p.id";
    return runPaginatedQuery({
      driver,
      countQuery: `SELECT COUNT(*) as total${baseFrom}${whereClause}`,
      dataQuery: `SELECT t.id, t.platformId, t.subjectId, t.name, t.isActive, t.qCount, p.name as platformName, s.name as subjectName${baseFrom}${whereClause}${orderClause} LIMIT ? OFFSET ?`,
      params,
      mapRow: (row) => mapTopicRow(row),
      page: options.page,
      pageSize: options.pageSize
    });
  };
  const getTopicDetails = async (id) => {
    const { rows } = await driver.query(
      `SELECT t.id, t.platformId, t.subjectId, t.name, t.isActive, t.qCount,
              p.name as platformName,
              s.name as subjectName
       FROM Topic t
       LEFT JOIN Subject s ON t.subjectId = s.id
       LEFT JOIN Platform p ON t.platformId = p.id
       WHERE t.id = ?
       LIMIT 1`,
      [id]
    );
    if (rows.length === 0) {
      return null;
    }
    return mapTopicRow(rows[0]);
  };
  const searchRoadmaps = async (options = {}) => {
    const conditions = [];
    const params = [];
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
        status: "r.isActive"
      },
      options.sortColumn,
      options.sortDirection,
      "r.id"
    );
    const baseFrom = " FROM Roadmap r LEFT JOIN Platform p ON r.platformId = p.id LEFT JOIN Subject s ON r.subjectId = s.id LEFT JOIN Topic t ON r.topicId = t.id";
    return runPaginatedQuery({
      driver,
      countQuery: `SELECT COUNT(*) as total${baseFrom}${whereClause}`,
      dataQuery: `SELECT r.id, r.platformId, r.subjectId, r.topicId, r.name, r.isActive, r.qCount,
                         p.name as platformName,
                         s.name as subjectName,
                         t.name as topicName
                  ${baseFrom}${whereClause}${orderClause} LIMIT ? OFFSET ?`,
      params,
      mapRow: (row) => mapRoadmapRow(row),
      page: options.page,
      pageSize: options.pageSize
    });
  };
  const getRoadmapDetails = async (id) => {
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
      [id]
    );
    if (rows.length === 0) {
      return null;
    }
    return mapRoadmapRow(rows[0]);
  };
  const buildQuestionFilters = (options = {}, excludeIds = []) => {
    const conditions = [];
    const params = [];
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
    const uniqueIds = Array.from(new Set(excludeIds.filter((id) => Number.isFinite(id) && id > 0))).map(
      (id) => Math.trunc(id)
    );
    if (uniqueIds.length > 0) {
      conditions.push(`q.id NOT IN (${uniqueIds.map(() => "?").join(", ")})`);
      params.push(...uniqueIds);
    }
    return { conditions, params };
  };
  const questionBaseFrom = " FROM Question q LEFT JOIN Platform p ON q.platformId = p.id LEFT JOIN Subject s ON q.subjectId = s.id LEFT JOIN Topic t ON q.topicId = t.id LEFT JOIN Roadmap r ON q.roadmapId = r.id";
  const searchQuestions = async (options = {}) => {
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
        status: "q.isActive"
      },
      options.sortColumn,
      options.sortDirection,
      "q.id"
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
      mapRow: (row) => mapQuestionRow(row),
      page: options.page,
      pageSize: options.pageSize
    });
  };
  const getQuestionDetails = async (id) => {
    const { rows } = await driver.query(
      `SELECT q.id, q.platformId, q.subjectId, q.topicId, q.roadmapId, q.q, q.o, q.a, q.e, q.l, q.isActive,
              p.name as platformName,
              s.name as subjectName,
              t.name as topicName,
              r.name as roadmapName
       ${questionBaseFrom}
       WHERE q.id = ?
       LIMIT 1`,
      [id]
    );
    if (rows.length === 0) {
      return null;
    }
    return mapQuestionRow(rows[0]);
  };
  const getRandomQuestions = async (options = {}) => {
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
      mapRow: (row) => mapQuestionRow(row),
      page: 1,
      pageSize: limit
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
    getRandomQuestions
  };
};

// src/config.ts
import { z as z2 } from "zod";
var AstroDbEnvSchema = z2.object({
  ASTRO_DB_URL: z2.string().url(),
  ASTRO_DB_AUTH_TOKEN: z2.string().optional()
});
var loadAstroDbConfig = (env = typeof process !== "undefined" ? process.env : {}) => {
  const parsed = AstroDbEnvSchema.parse({
    ASTRO_DB_URL: env.ASTRO_DB_URL,
    ASTRO_DB_AUTH_TOKEN: env.ASTRO_DB_AUTH_TOKEN
  });
  return {
    url: parsed.ASTRO_DB_URL,
    authToken: parsed.ASTRO_DB_AUTH_TOKEN
  };
};
export {
  NewPlatformSchema,
  NewQuestionSchema,
  NewResultSchema,
  NewRoadmapSchema,
  NewSubjectSchema,
  NewTopicSchema,
  PlatformSchema,
  QuestionSchema,
  ResultSchema,
  RoadmapSchema,
  SubjectSchema,
  TopicSchema,
  UpdatePlatformSchema,
  UpdateQuestionSchema,
  UpdateResultSchema,
  UpdateRoadmapSchema,
  UpdateSubjectSchema,
  UpdateTopicSchema,
  createAstroDbDriver,
  createPlatformsRepo,
  createQuestionsRepo,
  createQuizAdminRepo,
  createResultsRepo,
  createRoadmapsRepo,
  createSubjectsRepo,
  createTopicsRepo,
  getNextNumericId,
  loadAstroDbConfig,
  normalizeQuestion,
  parsePlatform,
  parseResult,
  parseRoadmap,
  parseSubject,
  parseTopic,
  runPaginatedQuery
};
//# sourceMappingURL=index.mjs.map
import { z } from "zod";

const coerceNumber = (value: unknown, fallback = 0): number => {
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

const coerceInteger = (value: unknown, fallback: number | null = 0): number => {
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

const coerceOptionalInteger = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  try {
    return coerceInteger(value, null);
  } catch {
    return null;
  }
};

const coerceBoolean = (value: unknown, fallback = false): boolean => {
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

const coerceString = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
};

const coerceNullableString = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }
  const str = coerceString(value);
  return str.length === 0 ? null : str;
};

const parseJson = <T>(value: unknown): T | null => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "object") {
    return value as T;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return null;
    }
    try {
      return JSON.parse(trimmed) as T;
    } catch (error) {
      throw new Error(`Failed to parse JSON value: ${error}`);
    }
  }
  throw new Error(`Unsupported JSON value type: ${value}`);
};

const parseDate = (value: unknown): Date => {
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

const toStringArray = (value: unknown): string[] => {
  if (value === null || value === undefined) {
    return [];
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => {
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
      })
      .filter((entry) => entry.length > 0);
  }
  if (typeof value === "object") {
    return Object.values(value)
      .map((entry) => {
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
      })
      .filter((entry) => entry.length > 0);
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

const LevelEnum = z.enum(["E", "M", "D"]);

const PlatformRowSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  description: z.union([z.string(), z.null()]).optional(),
  icon: z.union([z.string(), z.null()]).optional(),
  type: z.union([z.string(), z.null()]).optional(),
  qCount: z.union([z.number(), z.string(), z.null()]).optional(),
  isActive: z.union([z.boolean(), z.number(), z.string()]).optional(),
});

const SubjectRowSchema = z.object({
  id: z.union([z.number(), z.string()]),
  platformId: z.union([z.number(), z.string()]),
  name: z.string(),
  isActive: z.union([z.boolean(), z.number(), z.string()]).optional(),
  qCount: z.union([z.number(), z.string(), z.null()]).optional(),
});

const TopicRowSchema = z.object({
  id: z.union([z.number(), z.string()]),
  platformId: z.union([z.number(), z.string()]),
  subjectId: z.union([z.number(), z.string()]),
  name: z.string(),
  isActive: z.union([z.boolean(), z.number(), z.string()]).optional(),
  qCount: z.union([z.number(), z.string(), z.null()]).optional(),
});

const RoadmapRowSchema = z.object({
  id: z.union([z.number(), z.string()]),
  platformId: z.union([z.number(), z.string()]),
  subjectId: z.union([z.number(), z.string()]),
  topicId: z.union([z.number(), z.string()]),
  name: z.string(),
  isActive: z.union([z.boolean(), z.number(), z.string()]).optional(),
  qCount: z.union([z.number(), z.string(), z.null()]).optional(),
});

const QuestionRowSchema = z.object({
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
  isActive: z.union([z.boolean(), z.number(), z.string()]).optional(),
});

const ResultRowSchema = z.object({
  id: z.union([z.number(), z.string()]),
  userId: z.string(),
  platformId: z.union([z.number(), z.string()]),
  subjectId: z.union([z.number(), z.string(), z.null()]).optional(),
  topicId: z.union([z.number(), z.string(), z.null()]).optional(),
  roadmapId: z.union([z.number(), z.string(), z.null()]).optional(),
  level: z.union([z.string(), z.null()]).optional(),
  responses: z.unknown().optional(),
  mark: z.union([z.number(), z.string(), z.null()]).optional(),
  createdAt: z.union([z.string(), z.number(), z.date()]),
});

export const PlatformSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  type: z.string().nullable(),
  qCount: z.number().int(),
  isActive: z.boolean(),
});

export const NewPlatformSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(""),
  icon: z.string().optional().default(""),
  type: z.string().nullable().optional(),
  qCount: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
});

export const UpdatePlatformSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  type: z.string().nullable().optional(),
  qCount: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

export const SubjectSchema = z.object({
  id: z.number().int(),
  platformId: z.number().int(),
  name: z.string(),
  isActive: z.boolean(),
  qCount: z.number().int(),
});

export const NewSubjectSchema = z.object({
  id: z.number().int().nonnegative(),
  platformId: z.number().int().nonnegative(),
  name: z.string().min(1),
  isActive: z.boolean().default(true),
  qCount: z.number().int().nonnegative().default(0),
});

export const UpdateSubjectSchema = z.object({
  platformId: z.number().int().nonnegative().optional(),
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  qCount: z.number().int().nonnegative().optional(),
});

export const TopicSchema = z.object({
  id: z.number().int(),
  platformId: z.number().int(),
  subjectId: z.number().int(),
  name: z.string(),
  isActive: z.boolean(),
  qCount: z.number().int(),
});

export const NewTopicSchema = z.object({
  id: z.number().int().nonnegative(),
  platformId: z.number().int().nonnegative(),
  subjectId: z.number().int().nonnegative(),
  name: z.string().min(1),
  isActive: z.boolean().default(true),
  qCount: z.number().int().nonnegative().default(0),
});

export const UpdateTopicSchema = z.object({
  platformId: z.number().int().nonnegative().optional(),
  subjectId: z.number().int().nonnegative().optional(),
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  qCount: z.number().int().nonnegative().optional(),
});

export const RoadmapSchema = z.object({
  id: z.number().int(),
  platformId: z.number().int(),
  subjectId: z.number().int(),
  topicId: z.number().int(),
  name: z.string(),
  isActive: z.boolean(),
  qCount: z.number().int(),
});

export const NewRoadmapSchema = z.object({
  id: z.number().int().nonnegative(),
  platformId: z.number().int().nonnegative(),
  subjectId: z.number().int().nonnegative(),
  topicId: z.number().int().nonnegative(),
  name: z.string().min(1),
  isActive: z.boolean().default(true),
  qCount: z.number().int().nonnegative().default(0),
});

export const UpdateRoadmapSchema = z.object({
  platformId: z.number().int().nonnegative().optional(),
  subjectId: z.number().int().nonnegative().optional(),
  topicId: z.number().int().nonnegative().optional(),
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  qCount: z.number().int().nonnegative().optional(),
});

export const QuestionSchema = z.object({
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
  isActive: z.boolean(),
});

export const NewQuestionSchema = z.object({
  platformId: z.number().int().nonnegative(),
  subjectId: z.number().int().nonnegative().nullable().optional(),
  topicId: z.number().int().nonnegative().nullable().optional(),
  roadmapId: z.number().int().nonnegative().nullable().optional(),
  question: z.string().min(1),
  options: z.array(z.string()).default([]),
  answer: z.string().min(1),
  explanation: z.string().nullable().optional(),
  level: LevelEnum,
  isActive: z.boolean().default(true),
});

export const UpdateQuestionSchema = z.object({
  platformId: z.number().int().nonnegative().optional(),
  subjectId: z.number().int().nonnegative().nullable().optional(),
  topicId: z.number().int().nonnegative().nullable().optional(),
  roadmapId: z.number().int().nonnegative().nullable().optional(),
  question: z.string().min(1).optional(),
  options: z.array(z.string()).optional(),
  answer: z.string().min(1).optional(),
  explanation: z.string().nullable().optional(),
  level: LevelEnum.optional(),
  isActive: z.boolean().optional(),
});

export const ResultSchema = z.object({
  id: z.number().int(),
  userId: z.string(),
  platformId: z.number().int(),
  subjectId: z.number().int().nullable(),
  topicId: z.number().int().nullable(),
  roadmapId: z.number().int().nullable(),
  level: LevelEnum,
  responses: z.unknown(),
  mark: z.number(),
  createdAt: z.date(),
});

export const NewResultSchema = z.object({
  userId: z.string().min(1),
  platformId: z.number().int().nonnegative(),
  subjectId: z.number().int().nonnegative().nullable().optional(),
  topicId: z.number().int().nonnegative().nullable().optional(),
  roadmapId: z.number().int().nonnegative().nullable().optional(),
  level: LevelEnum,
  responses: z.unknown().optional(),
  mark: z.number().default(0),
});

export const UpdateResultSchema = z.object({
  userId: z.string().min(1).optional(),
  platformId: z.number().int().nonnegative().optional(),
  subjectId: z.number().int().nonnegative().nullable().optional(),
  topicId: z.number().int().nonnegative().nullable().optional(),
  roadmapId: z.number().int().nonnegative().nullable().optional(),
  level: LevelEnum.optional(),
  responses: z.unknown().optional(),
  mark: z.number().optional(),
});

export type Platform = z.infer<typeof PlatformSchema>;
export type NewPlatform = z.infer<typeof NewPlatformSchema>;
export type UpdatePlatform = z.infer<typeof UpdatePlatformSchema>;
export type Subject = z.infer<typeof SubjectSchema>;
export type NewSubject = z.infer<typeof NewSubjectSchema>;
export type UpdateSubject = z.infer<typeof UpdateSubjectSchema>;
export type Topic = z.infer<typeof TopicSchema>;
export type NewTopic = z.infer<typeof NewTopicSchema>;
export type UpdateTopic = z.infer<typeof UpdateTopicSchema>;
export type Roadmap = z.infer<typeof RoadmapSchema>;
export type NewRoadmap = z.infer<typeof NewRoadmapSchema>;
export type UpdateRoadmap = z.infer<typeof UpdateRoadmapSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type NewQuestion = z.infer<typeof NewQuestionSchema>;
export type UpdateQuestion = z.infer<typeof UpdateQuestionSchema>;
export type Result = z.infer<typeof ResultSchema>;
export type NewResult = z.infer<typeof NewResultSchema>;
export type UpdateResult = z.infer<typeof UpdateResultSchema>;

type PlatformRow = z.infer<typeof PlatformRowSchema>;
type SubjectRow = z.infer<typeof SubjectRowSchema>;
type TopicRow = z.infer<typeof TopicRowSchema>;
type RoadmapRow = z.infer<typeof RoadmapRowSchema>;
type QuestionRow = z.infer<typeof QuestionRowSchema>;
type ResultRow = z.infer<typeof ResultRowSchema>;

export const parsePlatform = (row: unknown): Platform => {
  const parsed = PlatformRowSchema.parse(row);
  return PlatformSchema.parse({
    id: coerceInteger(parsed.id),
    name: parsed.name,
    description: coerceString(parsed.description ?? ""),
    icon: coerceString(parsed.icon ?? ""),
    type: coerceNullableString(parsed.type),
    qCount: coerceInteger(parsed.qCount ?? 0),
    isActive: coerceBoolean(parsed.isActive, true),
  });
};

export const parseSubject = (row: unknown): Subject => {
  const parsed = SubjectRowSchema.parse(row);
  return SubjectSchema.parse({
    id: coerceInteger(parsed.id),
    platformId: coerceInteger(parsed.platformId),
    name: parsed.name,
    isActive: coerceBoolean(parsed.isActive, true),
    qCount: coerceInteger(parsed.qCount ?? 0),
  });
};

export const parseTopic = (row: unknown): Topic => {
  const parsed = TopicRowSchema.parse(row);
  return TopicSchema.parse({
    id: coerceInteger(parsed.id),
    platformId: coerceInteger(parsed.platformId),
    subjectId: coerceInteger(parsed.subjectId),
    name: parsed.name,
    isActive: coerceBoolean(parsed.isActive, true),
    qCount: coerceInteger(parsed.qCount ?? 0),
  });
};

export const parseRoadmap = (row: unknown): Roadmap => {
  const parsed = RoadmapRowSchema.parse(row);
  return RoadmapSchema.parse({
    id: coerceInteger(parsed.id),
    platformId: coerceInteger(parsed.platformId),
    subjectId: coerceInteger(parsed.subjectId),
    topicId: coerceInteger(parsed.topicId),
    name: parsed.name,
    isActive: coerceBoolean(parsed.isActive, true),
    qCount: coerceInteger(parsed.qCount ?? 0),
  });
};

export const normalizeQuestion = (row: unknown): Question => {
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
    isActive: coerceBoolean(parsed.isActive, true),
  });
};

export const parseResult = (row: unknown): Result => {
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
    createdAt: parseDate(parsed.createdAt),
  });
};

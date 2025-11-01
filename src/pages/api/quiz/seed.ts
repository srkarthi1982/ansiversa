import type { APIRoute } from 'astro';
import { Platform, Question, Roadmap, Subject, Topic, db } from 'astro:db';
import {
  loadQuestionDataset,
  questionDatasetDefinitions,
  type QuestionDatasetKey,
} from '../../../utils/questionDatasets';
type RawMedicalQuestion = {
  platform_id?: unknown;
  subject_id?: unknown;
  topic_id?: unknown;
  roadmap_id?: unknown;
  q?: unknown;
  question?: unknown;
  question_text?: unknown;
  prompt?: unknown;
  o?: unknown;
  options?: unknown;
  choices?: unknown;
  a?: unknown;
  answer?: unknown;
  answer_key?: unknown;
  correct_option?: unknown;
  correct_answer?: unknown;
  e?: unknown;
  explanation?: unknown;
  l?: unknown;
  level?: unknown;
  difficulty?: unknown;
  is_active?: unknown;
  isActive?: unknown;
};

type RawQuestionDataset = RawMedicalQuestion[];
type DatasetKey = QuestionDatasetKey;

type InsertableQuestion = typeof Question.$inferInsert;

type LookupCache = {
  platformIds: Set<number>;
  subjectPlatformMap: Map<number, number>;
  topicLookup: Map<number, { platformId: number; subjectId: number }>;
  roadmapLookup: Map<number, { platformId: number; subjectId: number; topicId: number }>;
};

const CHUNK_SIZE = 1000;
const QUESTION_BATCH_SIZE = 200;
const VALID_LEVELS = new Set(['E', 'M', 'D']);

const datasetCache = new Map<DatasetKey, RawQuestionDataset>();

let cachedLookups: LookupCache | null = null;

const isDatasetKey = (value: unknown): value is DatasetKey =>
  typeof value === 'string' && value in questionDatasetDefinitions;

const loadDataset = async (dataset: DatasetKey): Promise<RawQuestionDataset> => {
  if (!datasetCache.has(dataset)) {
    const data = await loadQuestionDataset(dataset);
    const normalized = Array.isArray(data) ? (data as RawQuestionDataset) : [];
    datasetCache.set(dataset, normalized);
  }
  return datasetCache.get(dataset) ?? [];
};

const loadLookups = async (): Promise<LookupCache> => {
  if (cachedLookups) {
    return cachedLookups;
  }

  const [platformRows, subjectRows, topicRows, roadmapRows] = await Promise.all([
    db.select({ id: Platform.id }).from(Platform),
    db.select({ id: Subject.id, platformId: Subject.platformId }).from(Subject),
    db
      .select({ id: Topic.id, platformId: Topic.platformId, subjectId: Topic.subjectId })
      .from(Topic),
    db
      .select({
        id: Roadmap.id,
        platformId: Roadmap.platformId,
        subjectId: Roadmap.subjectId,
        topicId: Roadmap.topicId,
      })
      .from(Roadmap),
  ]);

  cachedLookups = {
    platformIds: new Set(platformRows.map((row) => row.id)),
    subjectPlatformMap: new Map(subjectRows.map((row) => [row.id, row.platformId])),
    topicLookup: new Map(
      topicRows.map((row) => [
        row.id,
        {
          platformId: row.platformId,
          subjectId: row.subjectId,
        },
      ]),
    ),
    roadmapLookup: new Map(
      roadmapRows.map((row) => [
        row.id,
        {
          platformId: row.platformId,
          subjectId: row.subjectId,
          topicId: row.topicId,
        },
      ]),
    ),
  };

  return cachedLookups;
};

const normalizeFlexibleString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return null;
};

const normalizeOptions = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => normalizeFlexibleString(entry))
      .filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
  }

  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>)
      .map((entry) => normalizeFlexibleString(entry))
      .filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
  }

  return [];
};

const normalizeLevel = (value: unknown): string | null => {
  const str = normalizeFlexibleString(value);
  if (!str) {
    return null;
  }
  const upper = str.toUpperCase();
  if (VALID_LEVELS.has(upper)) {
    return upper;
  }
  if (upper === 'EASY') return 'E';
  if (upper === 'MEDIUM') return 'M';
  if (upper === 'HARD' || upper === 'DIFFICULT' || upper === 'DIFFICULTY_HIGH') return 'D';
  return null;
};

const normalizeQuestion = (
  raw: RawMedicalQuestion,
  lookups: LookupCache,
): { record: InsertableQuestion | null; reason?: string } => {
  const platformId = Number(raw.platform_id ?? (raw as { platformId?: unknown }).platformId);
  if (!Number.isFinite(platformId) || !lookups.platformIds.has(platformId)) {
    return { record: null, reason: 'Invalid or missing platform reference' };
  }

  const subjectId = Number(raw.subject_id ?? (raw as { subjectId?: unknown }).subjectId);
  if (!Number.isFinite(subjectId)) {
    return { record: null, reason: 'Invalid or missing subject reference' };
  }
  const subjectPlatformId = lookups.subjectPlatformMap.get(subjectId);
  if (!subjectPlatformId || subjectPlatformId !== platformId) {
    return { record: null, reason: 'Subject does not belong to the referenced platform' };
  }

  const topicId = Number(raw.topic_id ?? (raw as { topicId?: unknown }).topicId);
  if (!Number.isFinite(topicId)) {
    return { record: null, reason: 'Invalid or missing topic reference' };
  }
  const topicEntry = lookups.topicLookup.get(topicId);
  if (!topicEntry || topicEntry.platformId !== platformId || topicEntry.subjectId !== subjectId) {
    return { record: null, reason: 'Topic does not align with platform/subject' };
  }

  const roadmapId = Number(raw.roadmap_id ?? (raw as { roadmapId?: unknown }).roadmapId);
  if (!Number.isFinite(roadmapId)) {
    return { record: null, reason: 'Invalid or missing roadmap reference' };
  }
  const roadmapEntry = lookups.roadmapLookup.get(roadmapId);
  if (
    !roadmapEntry ||
    roadmapEntry.platformId !== platformId ||
    roadmapEntry.subjectId !== subjectId ||
    roadmapEntry.topicId !== topicId
  ) {
    return { record: null, reason: 'Roadmap does not align with platform/subject/topic' };
  }

  const questionText =
    normalizeFlexibleString(raw.q) ??
    normalizeFlexibleString(raw.question) ??
    normalizeFlexibleString(raw.question_text) ??
    normalizeFlexibleString(raw.prompt);
  if (!questionText) {
    return { record: null, reason: 'Missing question text' };
  }

  const options = normalizeOptions(raw.o ?? raw.options ?? raw.choices);
  if (!Array.isArray(options) || options.length === 0) {
    return { record: null, reason: 'Missing options' };
  }

  const answerKeyRaw =
    raw.a ??
    raw.answer ??
    raw.answer_key ??
    raw.correct_option ??
    raw.correct_answer ??
    ((raw as { correctOption?: unknown }).correctOption);
  const answerKeyString = normalizeFlexibleString(answerKeyRaw);
  let answerKey: string | null = null;
  if (answerKeyString !== null) {
    const parsed = Number.parseInt(answerKeyString, 10);
    if (!Number.isNaN(parsed)) {
      if (parsed >= 0 && parsed < options.length) {
        answerKey = String(parsed);
      } else if (parsed > 0 && parsed - 1 < options.length) {
        answerKey = String(parsed - 1);
      }
    } else if (answerKeyString.length === 1) {
      const alphaIndex = answerKeyString.toLowerCase().charCodeAt(0) - 97;
      if (alphaIndex >= 0 && alphaIndex < options.length) {
        answerKey = String(alphaIndex);
      }
    } else if (options.some((option) => option.toLowerCase() === answerKeyString.toLowerCase())) {
      answerKey = String(
        options.findIndex((option) => option.toLowerCase() === answerKeyString.toLowerCase()),
      );
    } else {
      answerKey = answerKeyString;
    }
  } else if (typeof answerKeyRaw === 'number' && Number.isFinite(answerKeyRaw)) {
    if (answerKeyRaw >= 0 && answerKeyRaw < options.length) {
      answerKey = String(answerKeyRaw);
    } else if (answerKeyRaw > 0 && answerKeyRaw - 1 < options.length) {
      answerKey = String(answerKeyRaw - 1);
    }
  }

  if (!answerKey) {
    return { record: null, reason: 'Missing answer key' };
  }

  const explanation =
    normalizeFlexibleString(raw.e) ?? normalizeFlexibleString(raw.explanation) ?? null;
  if (!explanation) {
    return { record: null, reason: 'Missing explanation' };
  }

  const level = normalizeLevel(raw.l ?? raw.level ?? raw.difficulty);
  if (!level) {
    return { record: null, reason: 'Missing or invalid difficulty level' };
  }

  const isActiveInput = raw.is_active ?? raw.isActive;
  const isActive = typeof isActiveInput === 'boolean' ? isActiveInput : true;

  return {
    record: {
      platformId,
      subjectId,
      topicId,
      roadmapId,
      q: questionText,
      o: options,
      a: answerKey,
      e: explanation,
      l: level,
      isActive,
    },
  };
};

const insertQuestions = async (
  records: InsertableQuestion[],
): Promise<{ inserted: number; failures: { record: InsertableQuestion; reason: string }[] }> => {
  let inserted = 0;
  const failures: { record: InsertableQuestion; reason: string }[] = [];

  for (let index = 0; index < records.length; index += QUESTION_BATCH_SIZE) {
    const batch = records.slice(index, index + QUESTION_BATCH_SIZE);
    try {
      await db.insert(Question).values(batch);
      inserted += batch.length;
    } catch (error) {
      for (const entry of batch) {
        try {
          await db.insert(Question).values(entry);
          inserted += 1;
        } catch (singleError) {
          failures.push({
            record: entry,
            reason:
              singleError instanceof Error ? singleError.message : 'Failed to insert question',
          });
        }
      }
    }
  }

  return { inserted, failures };
};

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const datasetParam = url.searchParams.get('dataset');

  if (!datasetParam) {
    return new Response(
      JSON.stringify({ error: 'Dataset parameter is required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const normalized = datasetParam.trim().toLowerCase();
  if (!isDatasetKey(normalized)) {
    return new Response(
      JSON.stringify({ error: `Unknown dataset "${datasetParam}"` }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  try {
    const data = await loadDataset(normalized);
    const definition = questionDatasetDefinitions[normalized];
    const totalRecords = data.length;
    const definedChunkSize = Number(definition?.defaultChunkSize);
    const defaultChunkSize =
      Number.isFinite(definedChunkSize) && definedChunkSize > 0 ? definedChunkSize : CHUNK_SIZE;

    return new Response(
      JSON.stringify({
        dataset: normalized,
        totalRecords,
        defaultChunkSize,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load dataset summary';
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const body = await request
    .json()
    .catch(
      () =>
        ({
          chunk: 0,
          chunkSize: CHUNK_SIZE,
          resetCache: false,
        }) as Record<string, unknown>,
    );

  if (typeof body === 'object' && body && (body as { resetCache?: boolean }).resetCache) {
    cachedLookups = null;
    datasetCache.clear();
  }

  const datasetRaw = (body as { dataset?: unknown }).dataset;
  let datasetKey: DatasetKey = 'medical';
  if (typeof datasetRaw === 'string') {
    const normalized = datasetRaw.trim().toLowerCase();
    if (isDatasetKey(normalized)) {
      datasetKey = normalized;
    } else {
      return new Response(
        JSON.stringify({ error: `Unknown dataset "${datasetRaw}"` }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  }

  const chunk = Number((body as { chunk?: unknown }).chunk ?? 0);

  if (!Number.isInteger(chunk) || chunk < 0) {
    return new Response(
      JSON.stringify({ error: 'Invalid chunk index' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const datasetDefinition = questionDatasetDefinitions[datasetKey];
  const datasetDefaultChunkSize =
    Number(datasetDefinition?.defaultChunkSize) > 0
      ? Number(datasetDefinition.defaultChunkSize)
      : CHUNK_SIZE;

  const chunkSizeInput = Number((body as { chunkSize?: unknown }).chunkSize ?? datasetDefaultChunkSize);
  const effectiveChunkSize =
    Number.isInteger(chunkSizeInput) && chunkSizeInput > 0 ? chunkSizeInput : datasetDefaultChunkSize;
  const start = chunk * effectiveChunkSize;

  const rawQuestions = await loadDataset(datasetKey);
  const totalQuestions = rawQuestions.length;

  if (start >= totalQuestions) {
    return new Response(
      JSON.stringify({
        dataset: datasetKey,
        chunk,
        chunkSize: effectiveChunkSize,
        inserted: 0,
        skipped: 0,
        skippedReasons: [],
        processedRecords: totalQuestions,
        totalRecords: totalQuestions,
        remainingRecords: 0,
        done: true,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      },
    );
  }

  const slice = rawQuestions.slice(start, start + effectiveChunkSize);
  const lookups = await loadLookups();

  const insertable: InsertableQuestion[] = [];
  const skippedReasons: string[] = [];

  for (const raw of slice) {
    const normalized = normalizeQuestion(raw, lookups);
    if (normalized.record) {
      insertable.push(normalized.record);
    } else if (normalized.reason) {
      skippedReasons.push(normalized.reason);
    }
  }

  const { inserted, failures } = await insertQuestions(insertable);

  const processed = start + slice.length >= totalQuestions ? totalQuestions : start + slice.length;
  const done = processed >= totalQuestions;

  const limitedReasons = [...skippedReasons, ...failures.map((failure) => failure.reason)].slice(
    0,
    10,
  );

  return new Response(
    JSON.stringify({
      dataset: datasetKey,
      chunk,
      chunkSize: effectiveChunkSize,
      inserted,
      skipped: skippedReasons.length + failures.length,
      skippedReasons: limitedReasons,
      processedRecords: processed,
      totalRecords: totalQuestions,
      remainingRecords: totalQuestions - processed,
      done,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    },
  );
};

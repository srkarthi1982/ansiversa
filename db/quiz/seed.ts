import { db, Platform, Subject, Topic, Roadmap, Question } from 'astro:db';
import topicsData from './topics.json';
import roadmapsData from './roadmaps.json';
import medicalQuestionsData from './questions/medical.json';
import platformsData from './platforms.json';
import subjectsData from './subjects.json';

type TopicJson = {
  id: number;
  platform_id: number;
  subject_id: number;
  name: string;
  is_active: boolean;
  q_count?: number;
};

type RoadmapJson = {
  id: number;
  platform_id: number;
  subject_id: number;
  topic_id: number;
  name: string;
  is_active: boolean;
  q_count?: number;
};

type QuestionJson = {
  id: number;
  platform_id: number;
  subject_id: number;
  topic_id: number;
  roadmap_id?: number | null;
  is_active?: boolean;
  question?: unknown;
  question_text?: unknown;
  prompt?: unknown;
  answer?: unknown;
  correct_option?: unknown;
  correct_answer?: unknown;
  answer_key?: unknown;
  level?: unknown;
  l?: unknown;
  options?: unknown;
  choices?: unknown;
  explanation?: unknown;
  question_type?: unknown;
  [key: string]: unknown;
};

type PlatformJson = {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  icon: string;
  type: string;
  qCount: number;
};

type SubjectJson = {
  id: number;
  platformId: number;
  name: string;
  isActive: boolean;
  qCount: number;
};

type NormalizedOptions = string[];

type InsertableQuestion = {
  platformId: number;
  subjectId: number;
  topicId: number;
  roadmapId: number;
  q: string;
  o: NormalizedOptions;
  a: string;
  e: string;
  l: string;
  isActive: boolean;
};

const normalizeText = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
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

const normalizeKey = (value: unknown): string | null => normalizeFlexibleString(value);

const normalizeLevel = (value: unknown): string | null => {
  const normalized = normalizeFlexibleString(value);
  if (!normalized) {
    return null;
  }

  const upper = normalized.trim().toUpperCase();
  if (upper === 'EASY' || upper === 'E') return 'E';
  if (upper === 'MEDIUM' || upper === 'M') return 'M';
  if (upper === 'DIFFICULT' || upper === 'HARD' || upper === 'D') return 'D';

  return null;
};

const normalizeOptions = (value: unknown): NormalizedOptions | undefined => {
  if (Array.isArray(value)) {
    const normalized = value
      .map((entry) => {
        if (typeof entry === 'string') {
          const trimmed = entry.trim();
          return trimmed.length > 0 ? trimmed : null;
        }
        if (typeof entry === 'number' || typeof entry === 'boolean') {
          return String(entry);
        }
        if (entry && typeof entry === 'object') {
          try {
            return JSON.stringify(entry);
          } catch {
            return null;
          }
        }
        return null;
      })
      .filter((entry): entry is string => typeof entry === 'string');
    return normalized.length > 0 ? normalized : undefined;
  }

  if (value && typeof value === 'object') {
    const normalized: string[] = [];
    for (const rawValue of Object.values(value as Record<string, unknown>)) {
      const normalizedValue = normalizeFlexibleString(rawValue);
      if (normalizedValue) {
        normalized.push(normalizedValue);
      } else if (rawValue && typeof rawValue === 'object') {
        try {
          normalized.push(JSON.stringify(rawValue));
        } catch {
          continue;
        }
      }
    }
    return normalized.length > 0 ? normalized : undefined;
  }

  return undefined;
};

const deriveAnswerKey = (
  answerKey: string | null,
  answer: string | null,
  options: NormalizedOptions | undefined,
): string | undefined => {
  const normalizedKey = normalizeKey(answerKey ?? undefined);
  if (normalizedKey) {
    return normalizedKey;
  }

  const normalizedAnswer = normalizeFlexibleString(answer);
  if (!normalizedAnswer || !options) {
    return undefined;
  }

  const lowerAnswer = normalizedAnswer.trim().toLowerCase();

  for (let index = 0; index < options.length; index += 1) {
    const option = options[index];
    if (option.trim().toLowerCase() === lowerAnswer) {
      return String(index);
    }
  }

  const parsedIndex = Number.parseInt(normalizedAnswer, 10);
  if (!Number.isNaN(parsedIndex)) {
    if (parsedIndex >= 0 && parsedIndex < options.length) {
      return String(parsedIndex);
    }

    const zeroBasedIndex = parsedIndex - 1;
    if (zeroBasedIndex >= 0 && zeroBasedIndex < options.length) {
      return String(zeroBasedIndex);
    }
  }

  if (lowerAnswer.length === 1) {
    const alphaIndex = lowerAnswer.charCodeAt(0) - 97;
    if (alphaIndex >= 0 && alphaIndex < options.length) {
      return String(alphaIndex);
    }
  }

  return undefined;
};

const normalizeQuestion = (
  item: QuestionJson,
  context: {
    platformIds: Set<number>;
    subjectPlatformMap: Map<number, number>;
    topicLookup: Map<number, { platformId: number; subjectId: number }>;
    roadmapLookup: Map<number, { platformId: number; subjectId: number; topicId: number }>;
  },
): InsertableQuestion | null => {
  if (typeof item.id !== 'number') {
    return null;
  }

  const platformId = item.platform_id;
  if (typeof platformId !== 'number' || !context.platformIds.has(platformId)) {
    return null;
  }

  const subjectId = item.subject_id;
  if (typeof subjectId !== 'number') {
    return null;
  }

  const subjectPlatformId = context.subjectPlatformMap.get(subjectId);
  if (subjectPlatformId !== platformId) {
    return null;
  }

  const topicId = item.topic_id;
  if (typeof topicId !== 'number') {
    return null;
  }

  const topicEntry = context.topicLookup.get(topicId);
  if (!topicEntry || topicEntry.platformId !== platformId || topicEntry.subjectId !== subjectId) {
    return null;
  }

  if (typeof item.roadmap_id !== 'number') {
    return null;
  }

  const roadmapEntry = context.roadmapLookup.get(item.roadmap_id);
  if (!roadmapEntry) {
    return null;
  }
  if (
    roadmapEntry.platformId !== platformId ||
    roadmapEntry.subjectId !== subjectId ||
    roadmapEntry.topicId !== topicId
  ) {
    return null;
  }

  const questionText =
    normalizeText(item.question) ??
    normalizeText(item.question_text) ??
    normalizeText(item.prompt);

  if (!questionText) {
    return null;
  }

  const options = normalizeOptions(item.options ?? item.choices);
  if (!options || options.length === 0) {
    return null;
  }

  const rawAnswer = normalizeFlexibleString(item.answer ?? item.correct_answer);
  const rawAnswerKey = normalizeKey(item.answer_key ?? item.correct_option);
  const answerKey = deriveAnswerKey(rawAnswerKey, rawAnswer, options);
  if (!answerKey) {
    return null;
  }

  const explanation = normalizeText(item.explanation);
  if (!explanation) {
    return null;
  }

  const level = normalizeLevel(item.level ?? item.l ?? item.difficulty);
  if (!level) {
    return null;
  }
  const isActive = typeof item.is_active === 'boolean' ? item.is_active : true;

  const normalized: InsertableQuestion = {
    platformId,
    subjectId,
    topicId,
    roadmapId: item.roadmap_id,
    q: questionText,
    o: options,
    a: answerKey,
    e: explanation,
    l: level,
    isActive,
  };
  return normalized;
};

// https://astro.build/db/seed
export async function seedQuiz() {
  console.log('Seeding quiz data...');

  const platforms = Array.isArray(platformsData)
    ? (platformsData as PlatformJson[]).filter((item): item is PlatformJson => typeof item?.id === 'number')
    : [];

  if (platforms.length > 0) {
    console.log(`Seeding ${platforms.length} platforms`);
    const batchSize = 50;
    let insertedPlatformsCount = 0;
    for (let i = 0; i < platforms.length; i += batchSize) {
      const batch = platforms.slice(i, i + batchSize);
      try {
        await db.insert(Platform).values(batch).onConflictDoNothing();
        insertedPlatformsCount += batch.length;
      } catch (err) {
        for (const entry of batch) {
          try {
            await db.insert(Platform).values(entry).onConflictDoNothing();
            insertedPlatformsCount += 1;
          } catch (singleErr) {
            console.error('Skipping platform during seed', entry.id, singleErr instanceof Error ? singleErr.message : singleErr);
          }
        }
      }
    }
    console.log(`Inserted ${insertedPlatformsCount} platforms`);
  } else {
    console.warn('platforms.json did not contain valid platform records; skipping platform seed');
  }

  const subjects = Array.isArray(subjectsData)
    ? (subjectsData as SubjectJson[])
        .filter((item): item is SubjectJson => typeof item?.id === 'number' && typeof item.platformId === 'number')
    : [];

  if (subjects.length > 0) {
    console.log(`Seeding ${subjects.length} subjects`);
    const batchSize = 100;
    let insertedSubjectsCount = 0;
    for (let i = 0; i < subjects.length; i += batchSize) {
      const batch = subjects.slice(i, i + batchSize);
      try {
        await db.insert(Subject).values(batch).onConflictDoNothing();
        insertedSubjectsCount += batch.length;
      } catch (err) {
        for (const entry of batch) {
          try {
            await db.insert(Subject).values(entry).onConflictDoNothing();
            insertedSubjectsCount += 1;
          } catch (singleErr) {
            console.error('Skipping subject during seed', entry.id, singleErr instanceof Error ? singleErr.message : singleErr);
          }
        }
      }
    }
    console.log(`Inserted ${insertedSubjectsCount} subjects`);
  } else {
    console.warn('subjects.json did not contain valid subject records; skipping subject seed');
  }

  const [subjectRows, platformRows] = await Promise.all([
    db.select({ id: Subject.id, platformId: Subject.platformId }).from(Subject),
    db.select({ id: Platform.id }).from(Platform),
  ]);

  const subjectPlatformMap = new Map<number, number>();
  for (const row of subjectRows) {
    subjectPlatformMap.set(row.id, row.platformId);
  }

  const platformIds = new Set(platformRows.map((row) => row.id));

  const topics = (topicsData as TopicJson[])
    .filter((item): item is TopicJson => typeof item?.id === 'number')
    .filter((item) => {
      if (!platformIds.has(item.platform_id)) {
        return false;
      }
      const subjectPlatformId = subjectPlatformMap.get(item.subject_id);
      return typeof subjectPlatformId === 'number' && subjectPlatformId === item.platform_id;
    })
    .map((item) => ({
      id: item.id,
      platformId: item.platform_id,
      subjectId: item.subject_id,
      name: item.name,
      isActive: item.is_active,
      qCount: item.q_count ?? 0,
    }));

  let insertedTopicsCount = 0;
  if (topics.length > 0) {
    console.log(`Seeding ${topics.length} topics (after validation)`);
    const batchSize = 100;
    for (let i = 0; i < topics.length; i += batchSize) {
      const batch = topics.slice(i, i + batchSize);
      try {
        await db.insert(Topic).values(batch);
        insertedTopicsCount += batch.length;
      } catch (err) {
        for (const entry of batch) {
          try {
            await db.insert(Topic).values(entry);
            insertedTopicsCount += 1;
          } catch (singleErr) {
            console.error('Skipping topic during seed', entry.id, singleErr instanceof Error ? singleErr.message : singleErr);
          }
        }
      }
    }
  }

  if (insertedTopicsCount > 0) {
    console.log(`Inserted ${insertedTopicsCount} topics`);
  }

  const topicRows = await db.select({ id: Topic.id, platformId: Topic.platformId, subjectId: Topic.subjectId }).from(Topic);
  const topicLookup = new Map<number, { platformId: number; subjectId: number }>();
  for (const row of topicRows) {
    topicLookup.set(row.id, { platformId: row.platformId, subjectId: row.subjectId });
  }

  const roadmaps = (roadmapsData as RoadmapJson[])
    .filter((item): item is RoadmapJson => typeof item?.id === 'number')
    .filter((item) => {
      if (!platformIds.has(item.platform_id)) {
        return false;
      }
      const subjectPlatformId = subjectPlatformMap.get(item.subject_id);
      if (typeof subjectPlatformId !== 'number' || subjectPlatformId !== item.platform_id) {
        return false;
      }
      const topicEntry = topicLookup.get(item.topic_id);
      if (!topicEntry) {
        return false;
      }
      return topicEntry.platformId === item.platform_id && topicEntry.subjectId === item.subject_id;
    })
    .map((item) => ({
      id: item.id,
      platformId: item.platform_id,
      subjectId: item.subject_id,
      topicId: item.topic_id,
      name: item.name,
      isActive: item.is_active,
      qCount: item.q_count ?? 0,
    }));

  if (roadmaps.length > 0) {
    console.log(`Seeding ${roadmaps.length} roadmaps (after validation)`);
    const batchSize = 100;
    let insertedRoadmapsCount = 0;
    for (let i = 0; i < roadmaps.length; i += batchSize) {
      const batch = roadmaps.slice(i, i + batchSize);
      try {
        await db.insert(Roadmap).values(batch);
        insertedRoadmapsCount += batch.length;
      } catch (err) {
        for (const entry of batch) {
          try {
            await db.insert(Roadmap).values(entry);
            insertedRoadmapsCount += 1;
          } catch (singleErr) {
            console.error('Skipping roadmap during seed', entry.id, singleErr instanceof Error ? singleErr.message : singleErr);
          }
        }
      }
    }
    console.log(`Inserted ${insertedRoadmapsCount} roadmaps`);
  }

  const roadmapRows = await db
    .select({
      id: Roadmap.id,
      platformId: Roadmap.platformId,
      subjectId: Roadmap.subjectId,
      topicId: Roadmap.topicId,
    })
    .from(Roadmap);

  const roadmapLookup = new Map<number, { platformId: number; subjectId: number; topicId: number }>();
  for (const row of roadmapRows) {
    roadmapLookup.set(row.id, {
      platformId: row.platformId,
      subjectId: row.subjectId,
      topicId: row.topicId,
    });
  }

  let rawQuestionsSource: QuestionJson[] = [];
  if (Array.isArray(medicalQuestionsData)) {
    rawQuestionsSource = (medicalQuestionsData as unknown[]).filter(
      (item): item is QuestionJson => typeof item === 'object' && item !== null,
    );
  } else {
    console.warn('questions/medical.json did not contain an array; skipping question seed');
  }

  const questions = rawQuestionsSource
    .map((item) => normalizeQuestion(item, { platformIds, subjectPlatformMap, topicLookup, roadmapLookup }))
    .filter((item): item is InsertableQuestion => item !== null);

  if (questions.length > 0) {
    console.log(`Seeding ${questions.length} questions (after validation)`);
    const batchSize = 100;
    let insertedQuestionsCount = 0;
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);
      try {
        await db.insert(Question).values(batch);
        insertedQuestionsCount += batch.length;
      } catch (err) {
        for (const entry of batch) {
          try {
            await db.insert(Question).values(entry);
            insertedQuestionsCount += 1;
          } catch (singleErr) {
            console.error(
              'Skipping question during seed',
              entry.q,
              singleErr instanceof Error ? singleErr.message : singleErr,
            );
          }
        }
      }
    }
    console.log(`Inserted ${insertedQuestionsCount} questions`);
  }
}

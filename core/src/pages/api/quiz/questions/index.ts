import type { APIRoute } from 'astro';
import { ActionError } from 'astro:actions';
import {
  createQuestion,
  fetchQuestions,
  type FetchQuestionsInput,
} from '../../../../lib/quiz/questions';

const json = (data: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });

const handleError = (error: unknown) => {
  if (error instanceof ActionError) {
    const status =
      error.code === 'NOT_FOUND'
        ? 404
        : error.code === 'BAD_REQUEST'
          ? 400
          : error.code === 'UNSUPPORTED_MEDIA_TYPE'
            ? 415
            : 500;
    return json({ error: error.message, code: error.code }, { status });
  }

  console.error('Question API error', error);
  return json({ error: 'Internal Server Error' }, { status: 500 });
};

const coerceNumber = (value: string | null) => {
  if (value === null) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseFilters = (searchParams: URLSearchParams) => {
  const filtersJson = searchParams.get('filters');
  if (filtersJson) {
    try {
      return JSON.parse(filtersJson);
    } catch {
      // ignore malformed JSON; schema validation will catch it later
    }
  }

  const filters: Record<string, unknown> = {};
  const stringFields: Array<'questionText' | 'status' | 'level'> = [
    'questionText',
    'status',
    'level',
  ];

  stringFields.forEach((field) => {
    const value = searchParams.get(field);
    if (value) filters[field] = value;
  });

  const platformId = coerceNumber(searchParams.get('platformId'));
  if (typeof platformId === 'number') {
    filters.platformId = platformId;
  }

  const subjectId = coerceNumber(searchParams.get('subjectId'));
  if (typeof subjectId === 'number') {
    filters.subjectId = subjectId;
  }

  const topicId = coerceNumber(searchParams.get('topicId'));
  if (typeof topicId === 'number') {
    filters.topicId = topicId;
  }

  const roadmapId = coerceNumber(searchParams.get('roadmapId'));
  if (typeof roadmapId === 'number') {
    filters.roadmapId = roadmapId;
  }

  return Object.keys(filters).length > 0 ? filters : undefined;
};

const parseSort = (searchParams: URLSearchParams) => {
  const sortJson = searchParams.get('sort');
  if (sortJson) {
    try {
      return JSON.parse(sortJson);
    } catch {
      // fall through to column/direction parsing
    }
  }

  const column = searchParams.get('sortColumn');
  if (!column) return undefined;

  const direction = searchParams.get('sortDirection') ?? 'asc';
  return { column, direction };
};

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const params: Partial<FetchQuestionsInput> = {};

    const page = coerceNumber(url.searchParams.get('page'));
    if (typeof page === 'number') params.page = page;

    const pageSize = coerceNumber(url.searchParams.get('pageSize'));
    if (typeof pageSize === 'number') params.pageSize = pageSize;

    const filters = parseFilters(url.searchParams);
    if (filters) params.filters = filters as FetchQuestionsInput['filters'];

    const sort = parseSort(url.searchParams);
    if (sort) params.sort = sort as FetchQuestionsInput['sort'];

    const result = await fetchQuestions(params);
    return json(result);
  } catch (error) {
    return handleError(error);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json();
    const question = await createQuestion(payload);
    return json(question, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
};

import type { APIRoute } from 'astro';
import { ActionError } from 'astro:actions';
import { deletePlatform, getPlatformById, updatePlatform } from '../../../../lib/quiz/platforms';

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

  console.error('Platform API error', error);
  return json({ error: 'Internal Server Error' }, { status: 500 });
};

export const GET: APIRoute = async ({ params }) => {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id) || id <= 0) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Invalid platform id' });
    }

    const platform = await getPlatformById({ id });
    return json(platform);
  } catch (error) {
    return handleError(error);
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id) || id <= 0) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Invalid platform id' });
    }

    const payload = await request.json();
    const updated = await updatePlatform({ id, data: payload });
    return json(updated);
  } catch (error) {
    return handleError(error);
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id) || id <= 0) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Invalid platform id' });
    }

    const result = await deletePlatform({ id });
    return json(result);
  } catch (error) {
    return handleError(error);
  }
};

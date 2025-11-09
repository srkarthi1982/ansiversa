import { ZodError } from 'zod';
import { ApiError } from './errors';
import { corsHeaders } from './cors';

const defaultHeaders = {
  'content-type': 'application/json',
};

const buildHeaders = (init?: HeadersInit) => {
  const headers = new Headers();
  Object.entries(defaultHeaders).forEach(([key, value]) => headers.set(key, value));
  if (init) {
    const incoming = new Headers(init);
    incoming.forEach((value, key) => headers.set(key, value));
  }
  return headers;
};

export const json = (data: unknown, init: ResponseInit = {}, origin?: string) =>
  new Response(JSON.stringify(data), {
    status: init.status ?? 200,
    headers: buildHeaders({
      ...(origin ? corsHeaders(origin) : {}),
      ...(init.headers ?? {}),
    }),
  });

export const handleApiError = (error: unknown, origin?: string) => {
  if (error instanceof ApiError) {
    return json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.status },
      origin,
    );
  }

  if (error instanceof ZodError) {
    return json(
      {
        error: 'Validation failed',
        code: 'INVALID_INPUT',
        details: error.flatten(),
      },
      { status: 422 },
      origin,
    );
  }

  console.error('[api] unexpected error', error);
  return json(
    { error: 'Internal Server Error', code: 'INTERNAL_ERROR' },
    { status: 500 },
    origin,
  );
};

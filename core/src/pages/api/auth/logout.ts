import type { APIRoute } from 'astro';
import { ApiError } from '../../../lib/api/errors';
import { getCorsOrigin, handleOptions } from '../../../lib/api/cors';
import { handleApiError, json } from '../../../lib/api/responses';
import {
  REFRESH_COOKIE_NAME,
  clearRefreshCookie,
  revokeRefreshToken,
} from '../../../lib/auth/service';

export const OPTIONS: APIRoute = ({ request }) => handleOptions(request);

export const POST: APIRoute = async ({ cookies, request }) => {
  const origin = getCorsOrigin(request);
  try {
    const tokenFromCookie = cookies.get(REFRESH_COOKIE_NAME)?.value;
    const tokenFromBody = tokenFromCookie
      ? null
      : await request
          .json()
          .then((body) => body?.refreshToken as string | undefined)
          .catch(() => undefined);

    const refreshToken = tokenFromCookie ?? tokenFromBody;
    if (!refreshToken) {
      throw ApiError.badRequest('Refresh token is required');
    }

    await revokeRefreshToken(refreshToken);
    clearRefreshCookie(cookies);

    return json({ success: true }, undefined, origin);
  } catch (error) {
    return handleApiError(error, origin);
  }
};

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { ApiError } from '../../../lib/api/errors';
import { getCorsOrigin, handleOptions } from '../../../lib/api/cors';
import { handleApiError, json } from '../../../lib/api/responses';
import {
  authenticateUser,
  issueTokens,
  setRefreshCookie,
} from '../../../lib/auth/service';

const requestSchema = z.object({
  identifier: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

export const OPTIONS: APIRoute = ({ request }) => handleOptions(request);

export const POST: APIRoute = async ({ request, cookies }) => {
  const origin = getCorsOrigin(request);
  try {
    const body = await request.json().catch(() => {
      throw ApiError.badRequest('Invalid JSON body');
    });
    const input = requestSchema.parse(body);
    const user = await authenticateUser(input.identifier, input.password);
    const tokens = await issueTokens(user, { remember: input.remember });
    setRefreshCookie(cookies, tokens.refreshToken, tokens.refreshExpiresIn);

    return json(
      {
        accessToken: tokens.accessToken,
        tokenType: 'Bearer',
        expiresIn: tokens.accessExpiresIn,
        user: tokens.user,
      },
      undefined,
      origin,
    );
  } catch (error) {
    return handleApiError(error, origin);
  }
};

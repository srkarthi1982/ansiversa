import type { APIRoute } from 'astro';
import { z } from 'zod';
import { ApiError } from '../../../lib/api/errors';
import { getCorsOrigin, handleOptions } from '../../../lib/api/cors';
import { handleApiError, json } from '../../../lib/api/responses';
import { issueTokens, registerUser, setRefreshCookie } from '../../../lib/auth/service';

const requestSchema = z
  .object({
    username: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(6).max(100),
    confirmPassword: z.string().min(6).max(100),
    remember: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const OPTIONS: APIRoute = ({ request }) => handleOptions(request);

export const POST: APIRoute = async ({ request, cookies }) => {
  const origin = getCorsOrigin(request);
  try {
    const body = await request.json().catch(() => {
      throw ApiError.badRequest('Invalid JSON body');
    });
    const input = requestSchema.parse(body);
    const user = await registerUser({
      username: input.username.trim(),
      email: input.email.toLowerCase(),
      password: input.password,
    });

    const tokens = await issueTokens(user, { remember: input.remember });
    setRefreshCookie(cookies, tokens.refreshToken, tokens.refreshExpiresIn);

    return json(
      {
        accessToken: tokens.accessToken,
        tokenType: 'Bearer',
        expiresIn: tokens.accessExpiresIn,
        user: tokens.user,
      },
      { status: 201 },
      origin,
    );
  } catch (error) {
    return handleApiError(error, origin);
  }
};

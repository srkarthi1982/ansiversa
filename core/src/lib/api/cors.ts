const FALLBACK_ORIGIN = process.env.CORS_DEFAULT_ORIGIN ?? 'http://localhost:3000';

const parseAllowedOrigins = () => {
  const raw = process.env.CORS_ALLOWED_ORIGINS;
  if (!raw) return [FALLBACK_ORIGIN];
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const allowedOrigins = parseAllowedOrigins();

const isAnsiversaOrigin = (origin: string) => {
  try {
    const { hostname } = new URL(origin);
    return hostname === 'ansiversa.com' || hostname.endsWith('.ansiversa.com');
  } catch {
    return false;
  }
};

export const getCorsOrigin = (request: Request) => {
  const origin = request.headers.get('origin');
  if (!origin) {
    return allowedOrigins[0] ?? FALLBACK_ORIGIN;
  }

  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin) || isAnsiversaOrigin(origin)) {
    return origin;
  }

  return allowedOrigins[0] ?? FALLBACK_ORIGIN;
};

export const corsHeaders = (origin?: string) => ({
  'Access-Control-Allow-Origin': origin ?? allowedOrigins[0] ?? FALLBACK_ORIGIN,
  'Access-Control-Allow-Credentials': 'true',
  Vary: 'Origin',
});

export const preflightHeaders = (origin?: string) => ({
  ...corsHeaders(origin),
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
});

export const handleOptions = (request: Request) => {
  const origin = getCorsOrigin(request);
  const headers = new Headers(preflightHeaders(origin));
  return new Response(null, {
    status: 204,
    headers,
  });
};

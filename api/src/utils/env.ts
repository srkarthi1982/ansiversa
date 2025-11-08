import 'dotenv/config';

function required(name: string, fallback?: string) {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseInt(process.env.PORT ?? '8787', 10),
  CORS_ORIGIN: required('CORS_ORIGIN', '*'),
  JWT_SECRET: required('JWT_SECRET'),
  DATABASE_URL: required('DATABASE_URL'),
  DATABASE_AUTH_TOKEN: required('DATABASE_AUTH_TOKEN'),
};

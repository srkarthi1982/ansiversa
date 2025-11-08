// @ts-ignore: module '@libsql/client' has no type declarations
import { createClient } from '@libsql/client';
import { ENV } from '../utils/env';

export const db = createClient({
  url: ENV.DATABASE_URL,
  authToken: ENV.DATABASE_AUTH_TOKEN,
});

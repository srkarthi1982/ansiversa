// src/actions/index.ts
import { auth } from './auth';
import { flashnote } from './flashnote';
import { quiz } from './quiz';
import { resume } from './resume';

export const server = {
  auth,
  flashnote,
  quiz,
  resume,
};

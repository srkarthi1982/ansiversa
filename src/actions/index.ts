// src/actions/index.ts
import { auth } from './auth';
import { flashnote } from './flashnote';
import { quiz } from './quiz';
import { resume } from './resume';
import { proposal } from './proposal';

export const server = {
  auth,
  flashnote,
  quiz,
  resume,
  proposal,
};

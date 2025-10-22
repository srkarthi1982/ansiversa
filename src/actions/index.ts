// src/actions/index.ts
import { auth } from './auth';
import { flashnote } from './flashnote';
import { quiz } from './quiz';
import { resume } from './resume';
import { proposal } from './proposal';
import { contract } from './contract';
import { minutes } from './minutes';

export const server = {
  auth,
  flashnote,
  quiz,
  resume,
  proposal,
  contract,
  minutes,
};

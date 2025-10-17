// src/actions/index.ts
import { auth } from './auth';
import { quiz } from './quiz';
import { resume } from './resume';
import { coverLetter } from './cover-letter';

export const server = {
  auth,
  quiz,
  resume,
  coverLetter,
};

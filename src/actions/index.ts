// src/actions/index.ts
import { auth } from './auth';
import { flashnote } from './flashnote';
import { quiz } from './quiz';
import { resume } from './resume';
import { proposal } from './proposal';
import { contract } from './contract';
import { minutes } from './minutes';
import { email } from './email';
import { coverLetter } from './coverLetter';

export const server = {
  auth,
  flashnote,
  quiz,
  resume,
  // legacy names retained for backward compatibility
  proposal,
  contract,
  minutes,
  email,
  coverLetter,
  // slug-based names used by the mini-app pages
  'proposal-writer': proposal,
  'contract-generator': contract,
  'meeting-minutes-ai': minutes,
  'email-polisher': email,
  'cover-letter': coverLetter,
  'cover-letter-writer': coverLetter,
};

import { defineDb } from 'astro:db';

import { authTables } from './auth/tables';
import { quizTables } from './quiz/tables';
import { resumeTables } from './resume/tables';
import { flashnoteTables } from './flashnote/tables';
import { proposalTables } from './proposal/tables';
import { contractTables } from './contract/tables';
import { minutesTables } from './minutes/tables';
import { emailTables } from './email/tables';
import { coverLetterTables } from './cover-letter-writer/tables';

export default defineDb({
  tables: {
    ...authTables,
    ...quizTables,
    ...resumeTables,
    ...flashnoteTables,
    ...proposalTables,
    ...contractTables,
    ...minutesTables,
    ...emailTables,
    ...coverLetterTables,
  },
});

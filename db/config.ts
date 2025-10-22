import { defineDb } from 'astro:db';

import { authTables } from './auth/tables';
import { quizTables } from './quiz/tables';
import { resumeTables } from './resume/tables';
import { flashnoteTables } from './flashnote/tables';
import { proposalTables } from './proposal/tables';
import { contractTables } from './contract/tables';

export default defineDb({
  tables: {
    ...authTables,
    ...quizTables,
    ...resumeTables,
    ...flashnoteTables,
    ...proposalTables,
    ...contractTables,
  },
});

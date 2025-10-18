import { seedAuth } from './auth/seed';
import { seedQuiz } from './quiz/seed';
import { seedResume } from './resume/seed';
import { seedFlashnote } from './flashnote/seed';

export default async function seed() {
  await seedAuth();
  await seedQuiz();
  await seedResume();
  await seedFlashnote();
}

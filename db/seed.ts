import { seedAuth } from './auth/seed';
import { seedQuiz } from './quiz/seed';
import { seedResume } from './resume/seed';
import { seedFlashnote } from './flashnote/seed';

export default async function seed() {
  console.log('Seeding auth...');
  await seedAuth();
  console.log('Seeding quiz...');
  await seedQuiz();
  console.log('Seeding resume...');
  await seedResume();
  console.log('Seeding flashnote...');
  await seedFlashnote();
}

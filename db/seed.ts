import { seedAuth } from './auth/seed';
import { seedQuiz } from './quiz/seed';
import { seedResume } from './resume/seed';
import { seedFlashnote } from './flashnote/seed';
import { seedProposal } from './proposal/seed';
import { seedContract } from './contract/seed';
import { seedMinutes } from './minutes/seed';

export default async function seed() {
  console.log('Seeding auth...');
  await seedAuth();
  console.log('Seeding quiz...');
  await seedQuiz();
  console.log('Seeding resume...');
  await seedResume();
  console.log('Seeding flashnote...');
  await seedFlashnote();
  console.log('Seeding proposal...');
  await seedProposal();
  console.log('Seeding contract...');
  await seedContract();
  console.log('Seeding meeting minutes...');
  await seedMinutes();
}

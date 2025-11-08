import { seedAuth } from './auth/seed';
import { seedResume } from './resume/seed';
import { seedFlashnote } from './flashnote/seed';
import { seedProposal } from './proposal/seed';
import { seedContract } from './contract/seed';
import { seedMinutes } from './minutes/seed';
import { seedEmail } from './email/seed';
import { seedBilling } from './billing/seed';

export default async function seed() {
  console.log('Seeding auth...');
  await seedAuth();
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
  console.log('Seeding email workspace...');
  await seedEmail();
  console.log('Seeding billing plans...');
  await seedBilling();
}

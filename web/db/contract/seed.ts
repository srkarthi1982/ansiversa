import { db } from 'astro:db';
import { Contract, ContractClauseLibrary } from './tables';
import {
  clauseLibrarySeed,
  createEmptyContractData,
  getTemplateDefinition,
} from '../../src/lib/contract/schema';
import { slugifyContractTitle } from '../../src/lib/contract/utils';

export async function seedContract() {
  const contracts = await db.select().from(Contract).limit(1);
  if (contracts.length === 0) {
    const template = getTemplateDefinition('freelance');
    const data = createEmptyContractData(template.key);
    data.variables.ClientName = 'Demo Client FZ-LLC';
    data.variables.ProviderName = 'Ansiversa Collective';
    data.variables.ServiceFee = '15000';
    data.variables.ScopeSummary = 'covering discovery, UX, build, and launch readiness';
    data.clauses.services += '\n\nProject includes sprint planning, weekly demos, and stakeholder reviews.';

    await db.insert(Contract).values({
      id: '00000000-0000-5000-9000-000000000001',
      userId: '00000000-0000-4000-8000-000000000002',
      title: 'Sample Freelance Agreement',
      slug: `${slugifyContractTitle('Sample Freelance Agreement')}-demo`,
      templateKey: template.key,
      type: 'freelance',
      status: 'draft',
      variables: data.variables,
      clauses: data.clauses,
      versions: data.versions,
      notes: data.notes ?? undefined,
      options: data.options,
      lastSavedAt: new Date(),
      createdAt: new Date(),
    });
  }

  const existingLibrary = await db.select().from(ContractClauseLibrary).limit(1);
  if (existingLibrary.length === 0) {
    await db.insert(ContractClauseLibrary).values(
      clauseLibrarySeed.map((entry) => ({
        ...entry,
        createdAt: new Date(),
      })),
    );
  }
}

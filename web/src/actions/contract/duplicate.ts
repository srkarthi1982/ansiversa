import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { requireUser, findContractOrThrow, normalizeContractRow, sanitizeContractTitle } from './utils';
import { contractRepository } from './repositories';

export const duplicate = defineAction({
  accept: 'json',
  input: z.object({ id: z.string().uuid() }),
  async handler({ id }, ctx) {
    const user = await requireUser(ctx);
    const existing = await findContractOrThrow(id, user.id);
    const now = new Date();
    const duplicateId = crypto.randomUUID();

    const inserted = await contractRepository.insert({
      id: duplicateId,
      userId: user.id,
      title: sanitizeContractTitle(`${existing.title} copy`),
      templateKey: existing.templateKey,
      type: existing.type,
      status: 'draft',
      variables: existing.variables,
      clauses: existing.clauses,
      versions: existing.versions,
      options: existing.options,
      notes: existing.notes ?? undefined,
      lastSavedAt: now,
      createdAt: now,
    });

    const contract = inserted[0];
    return { contract: contract ? normalizeContractRow(contract) : null };
  },
});

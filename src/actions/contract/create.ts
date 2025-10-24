import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { createEmptyContractData, contractTemplateKeys } from '../../lib/contract/schema';
import { requireUser, templateKeyEnum, normalizeContractRow, listContractsForUser, sanitizeContractTitle } from './utils';
import { contractRepository } from './repositories';

export const create = defineAction({
  accept: 'json',
  input: z
    .object({
      title: z.string().optional(),
      templateKey: templateKeyEnum.optional(),
    })
    .optional(),
  async handler(input, ctx) {
    const user = await requireUser(ctx);
    const payload = input ?? {};

    if ((user.plan ?? 'free') === 'free') {
      const existing = await listContractsForUser(user.id);
      if (existing.length >= 1) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'Free plan allows only one contract. Upgrade to create more.',
        });
      }
    }

    const id = crypto.randomUUID();
    const templateKey = payload.templateKey ?? contractTemplateKeys[0];
    const data = createEmptyContractData(templateKey);

    const inserted = await contractRepository.insert({
      id,
      userId: user.id,
      title: sanitizeContractTitle(payload.title),
      templateKey,
      type: templateKey,
      status: 'draft',
      variables: data.variables,
      clauses: data.clauses,
      versions: data.versions,
      notes: data.notes ?? undefined,
      options: data.options,
      lastSavedAt: new Date(),
      createdAt: new Date(),
    });

    const contract = inserted[0];
    return {
      contract: contract ? normalizeContractRow(contract) : null,
    };
  },
});

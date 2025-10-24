import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { Contract, eq } from 'astro:db';
import {
  ContractClausesSchema,
  ContractDataSchema,
  ContractVariablesSchema,
  ContractVersionSchema,
} from '../../lib/contract/schema';
import {
  requireUser,
  findContractOrThrow,
  templateKeyEnum,
  statusEnum,
  sanitizeContractTitle,
  normalizeContractRow,
} from './utils';
import { contractRepository } from './repositories';

const patchSchema = z.object({
  path: z.string(),
  value: z.any(),
});

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const setByPath = (target: any, path: string, value: any) => {
  const normalized = path.replace(/\[(\w+)\]/g, '.$1');
  const segments = normalized.split('.').filter(Boolean);
  if (segments.length === 0) return target;
  let cursor = target;
  for (let index = 0; index < segments.length - 1; index += 1) {
    const key = segments[index]!;
    if (typeof cursor[key] !== 'object' || cursor[key] === null) {
      const nextKey = segments[index + 1];
      cursor[key] = Number.isInteger(Number(nextKey)) ? [] : {};
    }
    cursor = cursor[key];
  }
  cursor[segments.at(-1)!] = value;
  return target;
};

export const save = defineAction({
  accept: 'json',
  input: z
    .object({
      id: z.string().uuid(),
      title: z.string().optional(),
      templateKey: templateKeyEnum.optional(),
      status: statusEnum.optional(),
      variables: ContractVariablesSchema.optional(),
      clauses: ContractClausesSchema.optional(),
      versions: z.array(ContractVersionSchema).optional(),
      options: ContractDataSchema.shape.options.optional(),
      notes: z.string().nullable().optional(),
      patch: patchSchema.optional(),
    })
    .strict(),
  async handler({ id, title, templateKey, status, variables, clauses, versions, options, notes, patch }, ctx) {
    const user = await requireUser(ctx);
    const existing = await findContractOrThrow(id, user.id);

    let nextData = ContractDataSchema.parse({
      variables: existing.variables ?? {},
      clauses: existing.clauses ?? {},
      versions: existing.versions ?? [],
      notes: existing.notes ?? null,
      options: existing.options ?? {},
    });

    if (variables) {
      nextData.variables = ContractVariablesSchema.parse(variables);
    }

    if (clauses) {
      nextData.clauses = ContractClausesSchema.parse(clauses);
    }

    if (versions) {
      nextData.versions = ContractVersionSchema.array().parse(versions);
    }

    if (options) {
      nextData.options = ContractDataSchema.shape.options.parse(options);
    }

    if (notes !== undefined) {
      nextData.notes = notes ?? null;
    }

    if (patch) {
      const draft = clone(nextData);
      setByPath(draft, patch.path, patch.value);
      nextData = ContractDataSchema.parse(draft);
    }

    const updates: Partial<typeof Contract.$inferInsert> = {
      lastSavedAt: new Date(),
      variables: nextData.variables,
      clauses: nextData.clauses,
      versions: nextData.versions,
      notes: nextData.notes ?? undefined,
      options: nextData.options,
    };

    if (title !== undefined) {
      updates.title = sanitizeContractTitle(title);
    }

    if (templateKey) {
      updates.templateKey = templateKey;
      updates.type = templateKey;
    }

    if (status) {
      updates.status = status;
    }

    await contractRepository.update(updates, (table) => eq(table.id, id));
    const updated = await findContractOrThrow(id, user.id);
    return { contract: normalizeContractRow(updated) };
  },
});

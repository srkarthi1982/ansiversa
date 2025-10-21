import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { db, Proposal, eq } from 'astro:db';
import { ProposalDataSchema, calculateBudgetTotals } from '../../lib/proposal/schema';
import { requireUser, findProposalOrThrow, templateKeyEnum, statusEnum, sanitizeTitle, normalizeProposalRow } from './utils';

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
      currency: z.string().optional(),
      data: ProposalDataSchema.optional(),
      patch: patchSchema.optional(),
    })
    .strict(),
  async handler({ id, title, templateKey, status, currency, data, patch }, ctx) {
    const user = await requireUser(ctx);
    const existing = await findProposalOrThrow(id, user.id);

    let nextData = data
      ? ProposalDataSchema.parse(data)
      : ProposalDataSchema.parse(clone(existing.data ?? {}));

    if (patch) {
      const draft = clone(nextData ?? {});
      setByPath(draft, patch.path, patch.value);
      nextData = ProposalDataSchema.parse(draft);
    }

    const totals = calculateBudgetTotals(nextData.budget);
    nextData.budget = { ...nextData.budget, ...totals };

    const updates: Partial<typeof Proposal.$inferInsert> = {
      lastSavedAt: new Date(),
    };

    if (title !== undefined) {
      updates.title = sanitizeTitle(title);
    }
    if (templateKey) {
      updates.templateKey = templateKey;
    }
    if (status) {
      updates.status = status;
    }
    if (currency) {
      updates.currency = currency;
      nextData.budget.currency = currency;
    }

    updates.data = ProposalDataSchema.parse(nextData);

    await db.update(Proposal).set(updates).where(eq(Proposal.id, id));
    const updated = await findProposalOrThrow(id, user.id);
    return { proposal: normalizeProposalRow(updated) };
  },
});

import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { contractClauseCategories } from '../../lib/contract/schema';
import { requireUser, loadClauseLibrary } from './utils';

const categoryEnum = z.enum(contractClauseCategories).optional();

export const library = defineAction({
  accept: 'json',
  input: z
    .object({
      category: categoryEnum,
      locale: z.string().optional(),
    })
    .optional(),
  async handler(input, ctx) {
    await requireUser(ctx);
    const locale = input?.locale ?? 'en';
    const items = await loadClauseLibrary(locale);
    const filtered = input?.category ? items.filter((item) => item.category === input.category) : items;
    return { items: filtered };
  },
});

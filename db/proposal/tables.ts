import { column, defineTable, NOW, sql } from 'astro:db';
import { User } from '../auth/tables';

export const Proposal = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    title: column.text(),
    slug: column.text({ optional: true }),
    templateKey: column.text({ default: 'business' }),
    status: column.text({ default: 'draft' }),
    currency: column.text({ default: 'USD' }),
    data: column.json(),
    lastSavedAt: column.date({ optional: true }),
    createdAt: column.date({ default: NOW }),
    publishedAt: column.date({ optional: true }),
  },
  indexes: [
    { on: ['userId', 'createdAt'] },
    { on: ['slug'], where: sql`slug IS NOT NULL` },
  ],
});

export const proposalTables = {
  Proposal,
} as const;

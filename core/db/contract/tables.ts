import { column, defineTable, NOW, sql } from 'astro:db';
import { User } from '../auth/tables';

export const Contract = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    title: column.text(),
    slug: column.text({ optional: true }),
    templateKey: column.text({ default: 'freelance' }),
    type: column.text({ default: 'freelance' }),
    status: column.text({ default: 'draft' }),
    variables: column.json({ default: {} }),
    clauses: column.json({ default: {} }),
    versions: column.json({ default: [] }),
    options: column.json({ default: { watermark: true, locale: 'en', includeSignatureBlock: true } }),
    notes: column.text({ optional: true }),
    lastSavedAt: column.date({ optional: true }),
    createdAt: column.date({ default: NOW }),
    publishedAt: column.date({ optional: true }),
  },
  indexes: [
    { on: ['userId', 'createdAt'] },
    { on: ['slug'], where: sql`slug IS NOT NULL` },
  ],
});

export const ContractClauseLibrary = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    category: column.text(),
    title: column.text(),
    body: column.text(),
    locale: column.text({ default: 'en' }),
    createdAt: column.date({ default: NOW }),
  },
  indexes: [{ on: ['category', 'locale'] }],
});

export const contractTables = {
  Contract,
  ContractClauseLibrary,
} as const;

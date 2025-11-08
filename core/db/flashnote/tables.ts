import { column, defineTable, NOW, sql } from 'astro:db';
import { User } from '../auth/tables';

export const FlashNote = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    title: column.text(),
    content: column.text(),
    tags: column.json(),
    summary: column.text({ optional: true }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
  indexes: [
    { on: ['userId', 'updatedAt'] },
    { on: ['userId'], where: sql`json_array_length(tags) > 0` },
  ],
});

export const flashnoteTables = {
  FlashNote,
} as const;

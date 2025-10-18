import { column, defineTable } from 'astro:db';

export const Platform = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    name: column.text(),
    description: column.text(),
    isActive: column.boolean({ default: true }),
    icon: column.text(),
    type: column.text({ optional: true }),
    qCount: column.number({ default: 0 }),
  },
});

export const Subject = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    platformId: column.number({ references: () => Platform.columns.id }),
    name: column.text(),
    isActive: column.boolean({ default: true }),
    qCount: column.number({ default: 0 }),
  },
});

export const quizTables = {
  Platform,
  Subject,
} as const;

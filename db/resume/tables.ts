import { column, defineTable, NOW } from 'astro:db';
import { User } from '../auth/tables';

export const Resume = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    title: column.text(),
    templateKey: column.text({ default: 'modern' }),
    locale: column.text({ default: 'en' }),
    status: column.text({ default: 'draft' }),
    data: column.json(),
    lastSavedAt: column.date({ optional: true }),
    createdAt: column.date({ default: NOW }),
    isDefault: column.boolean({ default: false }),
  },
});

export const ResumeExport = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    resumeId: column.text({ references: () => Resume.columns.id }),
    format: column.text(),
    filePath: column.text(),
    createdAt: column.date({ default: NOW }),
  },
});

export const resumeTables = {
  Resume,
  ResumeExport,
} as const;

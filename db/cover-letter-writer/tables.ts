import { column, defineTable, NOW } from 'astro:db';
import { User } from '../auth/tables';

export const CoverLetter = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    title: column.text({ default: 'Untitled cover letter' }),
    templateKey: column.text({ default: 'formal' }),
    tone: column.text({ default: 'formal' }),
    content: column.text({ default: '' }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
  indexes: [{ on: ['userId', 'createdAt'] }],
});

export const coverLetterTables = {
  CoverLetter,
} as const;

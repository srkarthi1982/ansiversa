import { column, defineTable, NOW } from 'astro:db';
import { User } from '../auth/tables';

export const VisitingCard = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    name: column.text({ default: '' }),
    title: column.text({ default: '' }),
    company: column.text({ default: '' }),
    email: column.text({ default: '' }),
    phone: column.text({ default: '' }),
    address: column.text({ default: '' }),
    website: column.text({ default: '' }),
    tagline: column.text({ default: '' }),
    theme: column.text({ default: 'aurora' }),
    template: column.text({ default: 'minimal' }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
  indexes: [{ on: ['userId', 'createdAt'] }],
});

export const visitingCardTables = {
  VisitingCard,
} as const;

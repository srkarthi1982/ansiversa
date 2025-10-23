import { column, defineTable, NOW, sql } from 'astro:db';
import { User } from '../auth/tables';

export const EmailDraft = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    title: column.text({ default: 'Untitled email' }),
    status: column.text({ default: 'draft' }),
    subject: column.text({ optional: true }),
    input: column.text({ optional: true }),
    output: column.text({ optional: true }),
    language: column.text({ default: 'en' }),
    tone: column.text({ default: 'professional' }),
    formality: column.text({ default: 'medium' }),
    variables: column.json({ optional: true }),
    signatureEnabled: column.boolean({ default: true }),
    ephemeral: column.boolean({ default: false }),
    plan: column.text({ default: 'free' }),
    lastSavedAt: column.date({ optional: true }),
    createdAt: column.date({ default: NOW }),
  },
  indexes: [
    { on: ['userId', 'createdAt'] },
    { on: ['userId'], where: sql`status = 'final'` },
  ],
});

export const EmailTemplate = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    name: column.text(),
    category: column.text({ default: 'Outreach' }),
    subject: column.text({ optional: true }),
    body: column.text(),
    language: column.text({ default: 'en' }),
    isSystem: column.boolean({ default: false }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
  indexes: [{ on: ['userId', 'category'] }],
});

export const EmailSignature = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    display: column.text(),
    enabled: column.boolean({ default: true }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
  indexes: [{ on: ['userId'] }],
});

export const EmailContact = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    firstName: column.text({ optional: true }),
    lastName: column.text({ optional: true }),
    company: column.text({ optional: true }),
    email: column.text({ optional: true }),
    role: column.text({ optional: true }),
    notes: column.text({ optional: true }),
    createdAt: column.date({ default: NOW }),
  },
  indexes: [{ on: ['userId', 'createdAt'] }],
});

export const EmailHistory = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    draftId: column.text({ references: () => EmailDraft.columns.id }),
    action: column.text(),
    inputSize: column.number({ default: 0 }),
    outputSize: column.number({ default: 0 }),
    cost: column.number({ optional: true }),
    createdAt: column.date({ default: NOW }),
  },
  indexes: [{ on: ['draftId', 'createdAt'] }],
});

export const emailTables = {
  EmailDraft,
  EmailTemplate,
  EmailSignature,
  EmailContact,
  EmailHistory,
} as const;

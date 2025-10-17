// db/config.ts  (root of project)
import { defineDb, defineTable, column, NOW } from 'astro:db';

const User = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    username: column.text({ unique: true }),
    email: column.text({ unique: true }),
    passwordHash: column.text(),
    plan: column.text({ default: 'free' }),
    emailVerifiedAt: column.date({ optional: true }),
    createdAt: column.date({ default: NOW }),
  },
});

const PasswordResetToken = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text(),
    token: column.text(),
    expiresAt: column.date(),
    usedAt: column.date({ optional: true }),
    createdAt: column.date({ default: NOW }),
  },
});

const EmailVerificationToken = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text(),
    token: column.text({ unique: true }),
    expiresAt: column.date(),
    usedAt: column.date({ optional: true }),
    createdAt: column.date({ default: NOW }),
  },
});

const Session = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text(),
    tokenHash: column.text({ unique: true }),
    expiresAt: column.date(),
    createdAt: column.date({ default: NOW }),
  },
});

const Platform = defineTable({
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

const Subject = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    platformId: column.number({ references: () => Platform.columns.id }),
    name: column.text(),
    isActive: column.boolean({ default: true }),
    qCount: column.number({ default: 0 }),
  },
});

const Resume = defineTable({
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

const ResumeExport = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    resumeId: column.text({ references: () => Resume.columns.id }),
    format: column.text(),
    filePath: column.text(),
    createdAt: column.date({ default: NOW }),
  },
});

const CoverLetter = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    title: column.text(),
    role: column.text(),
    company: column.text(),
    greeting: column.text(),
    tone: column.text({ default: 'professional' }),
    length: column.text({ default: 'medium' }),
    templateKey: column.text({ default: 'minimal' }),
    prompts: column.json({ optional: true }),
    body: column.text({ default: '' }),
    status: column.text({ default: 'draft' }),
    lastSavedAt: column.date({ optional: true }),
    createdAt: column.date({ default: NOW }),
  },
});

const CoverLetterExport = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    letterId: column.text({ references: () => CoverLetter.columns.id }),
    format: column.text(),
    filePath: column.text(),
    createdAt: column.date({ default: NOW }),
  },
});

const CoverLetterHistory = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    letterId: column.text({ references: () => CoverLetter.columns.id }),
    userId: column.text({ references: () => User.columns.id }),
    body: column.text(),
    generatedBy: column.text({ default: 'user' }),
    createdAt: column.date({ default: NOW }),
  },
});

export default defineDb({
  tables: {
    User,                // ← this exact key is what you import
    PasswordResetToken,  // ← same here
    EmailVerificationToken,
    Session,
    Platform,
    Subject,
    Resume,
    ResumeExport,
    CoverLetter,
    CoverLetterExport,
    CoverLetterHistory,
  },
});

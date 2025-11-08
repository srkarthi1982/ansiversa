import { column, defineTable, NOW } from 'astro:db';

export const Role = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text({ unique: true }),
  },
});

export const User = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    username: column.text({ unique: true }),
    email: column.text({ unique: true }),
    passwordHash: column.text(),
    plan: column.text({ default: 'free' }),
    emailVerifiedAt: column.date({ optional: true }),
    createdAt: column.date({ default: NOW }),
    roleId: column.number({ references: () => Role.columns.id, default: 2 }),
  },
});

export const PasswordResetToken = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text(),
    token: column.text(),
    expiresAt: column.date(),
    usedAt: column.date({ optional: true }),
    createdAt: column.date({ default: NOW }),
  },
});

export const EmailVerificationToken = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text(),
    token: column.text({ unique: true }),
    expiresAt: column.date(),
    usedAt: column.date({ optional: true }),
    createdAt: column.date({ default: NOW }),
  },
});

export const Session = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text(),
    tokenHash: column.text({ unique: true }),
    expiresAt: column.date(),
    createdAt: column.date({ default: NOW }),
  },
});

export const authTables = {
  User,
  PasswordResetToken,
  EmailVerificationToken,
  Session,
  Role,
} as const;

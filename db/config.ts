// db/config.ts  (root of project)
import { defineDb, defineTable, column, NOW } from 'astro:db';

const User = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    username: column.text({ unique: true }),
    email: column.text({ unique: true }),
    passwordHash: column.text(),
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

const Platform = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    name: column.text(),
  },
});

export default defineDb({
  tables: {
    User,                // ← this exact key is what you import
    PasswordResetToken,  // ← same here
    Platform
  },
});

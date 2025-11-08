import { column, defineTable, NOW, sql } from 'astro:db';
import { User } from '../auth/tables';

export const Minutes = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    title: column.text({ default: 'Untitled meeting' }),
    slug: column.text({ optional: true }),
    status: column.text({ default: 'draft' }),
    meetingDate: column.date({ optional: true }),
    templateKey: column.text({ default: 'standup' }),
    attendees: column.json({ default: [] }),
    transcript: column.json({ default: { language: 'en', speakers: [], segments: [] } }),
    summary: column.json({ default: {} }),
    privacy: column.text({ default: 'standard' }),
    durationSec: column.number({ optional: true }),
    plan: column.text({ default: 'free' }),
    lastSavedAt: column.date({ optional: true }),
    createdAt: column.date({ default: NOW }),
    publishedAt: column.date({ optional: true }),
  },
  indexes: [
    { on: ['userId', 'createdAt'] },
    { on: ['slug'], where: sql`slug IS NOT NULL` },
    { on: ['status'] },
  ],
});

export const MinutesActionItem = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    minutesId: column.text({ references: () => Minutes.columns.id }),
    task: column.text(),
    assignee: column.text({ optional: true }),
    due: column.date({ optional: true }),
    priority: column.text({ default: 'med' }),
    status: column.text({ default: 'open' }),
    createdAt: column.date({ default: NOW }),
  },
  indexes: [
    { on: ['minutesId', 'status'] },
    { on: ['assignee'] },
    { on: ['due'], where: sql`due IS NOT NULL` },
  ],
});

export const MinutesMedia = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    minutesId: column.text({ references: () => Minutes.columns.id }),
    type: column.text({ default: 'audio' }),
    filePath: column.text(),
    durationSec: column.number({ optional: true }),
    createdAt: column.date({ default: NOW }),
  },
  indexes: [{ on: ['minutesId', 'createdAt'] }],
});

export const minutesTables = {
  Minutes,
  MinutesActionItem,
  MinutesMedia,
} as const;


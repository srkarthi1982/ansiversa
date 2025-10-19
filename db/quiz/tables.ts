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

export const Topic = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    platformId: column.number({ references: () => Platform.columns.id }),
    subjectId: column.number({ references: () => Subject.columns.id }),
    name: column.text(),
    isActive: column.boolean({ default: true }),
    qCount: column.number({ default: 0 }),
  },
});

export const Roadmap = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    platformId: column.number({ references: () => Platform.columns.id }),
    subjectId: column.number({ references: () => Subject.columns.id }),
    topicId: column.number({ references: () => Topic.columns.id }),
    name: column.text(),
    isActive: column.boolean({ default: true }),
    qCount: column.number({ default: 0 }),
  },
});

export const Question = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    platformId: column.number({ references: () => Platform.columns.id }),
    subjectId: column.number({ references: () => Subject.columns.id }),
    topicId: column.number({ references: () => Topic.columns.id }),
    roadmapId: column.number({ references: () => Roadmap.columns.id, optional: true }),
    questionText: column.text(),
    options: column.json({ optional: true }),
    answer: column.text({ optional: true }),
    answerKey: column.text({ optional: true }),
    explanation: column.text({ optional: true }),
    difficulty: column.text({ optional: true }),
    questionType: column.text({ optional: true }),
    tags: column.json({ optional: true }),
    metadata: column.json({ optional: true }),
    isActive: column.boolean({ default: true }),
  },
});

export const quizTables = {
  Platform,
  Subject,
  Topic,
  Roadmap,
  Question,
} as const;

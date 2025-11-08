import { db } from '../db/client.js';

export const PlatformsService = {
  list: async () => {
    const res = await db.execute('SELECT id, name, description FROM platforms ORDER BY id DESC');
    return res.rows;
  },
  get: async (id: number) => {
    const res = await db.execute({ sql: 'SELECT id, name, description FROM platforms WHERE id = ?', args: [id] });
    return res.rows[0] ?? null;
  },
  create: async (name: string, description = '') => {
    const res = await db.execute({ sql: 'INSERT INTO platforms (name, description) VALUES (?, ?) RETURNING id', args: [name, description] });
    return res.rows[0];
  },
  update: async (id: number, name: string, description = '') => {
    await db.execute({ sql: 'UPDATE platforms SET name=?, description=? WHERE id=?', args: [name, description, id] });
  },
  remove: async (id: number) => {
    await db.execute({ sql: 'DELETE FROM platforms WHERE id=?', args: [id] });
  },
};

export const SubjectsService = {
  list: async (platformId: number) => {
    const res = await db.execute({ sql: 'SELECT id, platform_id as platformId, name, description FROM subjects WHERE platform_id=? ORDER BY id DESC', args: [platformId] });
    return res.rows;
  },
  create: async (platformId: number, name: string, description = '') => {
    const res = await db.execute({ sql: 'INSERT INTO subjects (platform_id, name, description) VALUES (?, ?, ?) RETURNING id', args: [platformId, name, description] });
    return res.rows[0];
  },
};

export const TopicsService = {
  list: async (subjectId: number) => {
    const res = await db.execute({ sql: 'SELECT id, subject_id as subjectId, name, description FROM topics WHERE subject_id=? ORDER BY id DESC', args: [subjectId] });
    return res.rows;
  },
  create: async (subjectId: number, name: string, description = '') => {
    const res = await db.execute({ sql: 'INSERT INTO topics (subject_id, name, description) VALUES (?, ?, ?) RETURNING id', args: [subjectId, name, description] });
    return res.rows[0];
  },
};

export const QuestionsService = {
  bulkInsert: async (items: Array<{ topicId: number; question: string; options: string[]; answerIndex: number; explanation?: string }>) => {
    for (const q of items) {
      await db.execute({
        sql: 'INSERT INTO questions (topic_id, question, options, answer_index, explanation) VALUES (?, ?, ?, ?, ?)',
        args: [q.topicId, q.question, JSON.stringify(q.options), q.answerIndex, q.explanation ?? ''],
      });
    }
  },
  randomByTopic: async (topicId: number, limit: number) => {
    // SQLite random order
    const res = await db.execute({
      sql: 'SELECT id, topic_id as topicId, question, options, answer_index as answerIndex, explanation FROM questions WHERE topic_id = ? ORDER BY RANDOM() LIMIT ?',
      args: [topicId, limit],
    });
    // parse options JSON
    return res.rows.map((r: any) => ({ ...r, options: JSON.parse(String(r.options)) }));
  },
};

import type { Context } from 'hono';
import { PlatformsService, SubjectsService, TopicsService, QuestionsService } from '../services/quiz.service.js';

// Platforms
export async function getPlatforms(c: Context) {
  const list = await PlatformsService.list();
  return c.json({ items: list });
}

export async function getPlatform(c: Context) {
  const id = Number(c.req.param('id'));
  const item = await PlatformsService.get(id);
  if (!item) return c.json({ error: 'Not found' }, 404);
  return c.json(item);
}

export async function createPlatform(c: Context) {
  const { name, description } = c.get('body') as { name: string; description?: string };
  const created = await PlatformsService.create(name, description);
  return c.json(created, 201);
}

export async function updatePlatform(c: Context) {
  const id = Number(c.req.param('id'));
  const { name, description } = c.get('body') as { name: string; description?: string };
  await PlatformsService.update(id, name, description);
  return c.json({ ok: true });
}

export async function deletePlatform(c: Context) {
  const id = Number(c.req.param('id'));
  await PlatformsService.remove(id);
  return c.json({ ok: true });
}

// Subjects
export async function listSubjects(c: Context) {
  const platformId = Number(new URL(c.req.url).searchParams.get('platformId') ?? '0');
  const items = await SubjectsService.list(platformId);
  return c.json({ items });
}

export async function createSubject(c: Context) {
  const { platformId, name, description } = c.get('body') as { platformId: number; name: string; description?: string };
  const created = await SubjectsService.create(platformId, name, description);
  return c.json(created, 201);
}

// Topics
export async function listTopics(c: Context) {
  const subjectId = Number(new URL(c.req.url).searchParams.get('subjectId') ?? '0');
  const items = await TopicsService.list(subjectId);
  return c.json({ items });
}

export async function createTopic(c: Context) {
  const { subjectId, name, description } = c.get('body') as { subjectId: number; name: string; description?: string };
  const created = await TopicsService.create(subjectId, name, description);
  return c.json(created, 201);
}

// Questions
export async function randomQuestions(c: Context) {
  const { topicId, limit } = c.get('query') as { topicId: number; limit: number };
  const items = await QuestionsService.randomByTopic(topicId, limit);
  return c.json({ items });
}

export async function bulkInsertQuestions(c: Context) {
  const items = c.get('body') as Array<{ topicId: number; question: string; options: string[]; answerIndex: number; explanation?: string }>;
  await QuestionsService.bulkInsert(items);
  return c.json({ ok: true }, 201);
}

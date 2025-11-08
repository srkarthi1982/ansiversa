import { Hono } from 'hono';
import { validateBody, validateQuery } from '../utils/zodHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { PlatformSchema, SubjectSchema, TopicSchema, QuestionSchema, RandomQuerySchema } from '../schemas/quiz.js';
import { 
  getPlatforms, getPlatform, createPlatform, updatePlatform, deletePlatform,
  listSubjects, createSubject,
  listTopics, createTopic,
  randomQuestions, bulkInsertQuestions
} from '../controllers/quiz.controller.js';

export const quiz = new Hono();

// Platforms
quiz.get('/platforms', getPlatforms);
quiz.get('/platforms/:id', getPlatform);
quiz.post('/platforms', requireAuth(), validateBody(PlatformSchema), createPlatform);
quiz.put('/platforms/:id', requireAuth(), validateBody(PlatformSchema), updatePlatform);
quiz.delete('/platforms/:id', requireAuth(), deletePlatform);

// Subjects
quiz.get('/subjects', listSubjects);
quiz.post('/subjects', requireAuth(), validateBody(SubjectSchema), createSubject);

// Topics
quiz.get('/topics', listTopics);
quiz.post('/topics', requireAuth(), validateBody(TopicSchema), createTopic);

// Questions
quiz.get('/questions/random', validateQuery(RandomQuerySchema), randomQuestions);
quiz.post('/questions', requireAuth(), validateBody(QuestionSchema.array().min(1)), bulkInsertQuestions);

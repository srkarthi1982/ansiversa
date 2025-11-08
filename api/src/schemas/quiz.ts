import { z } from 'zod';

export const PlatformSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(''),
});

export const SubjectSchema = z.object({
  platformId: z.number().int(),
  name: z.string().min(1),
  description: z.string().optional().default(''),
});

export const TopicSchema = z.object({
  subjectId: z.number().int(),
  name: z.string().min(1),
  description: z.string().optional().default(''),
});

export const QuestionSchema = z.object({
  topicId: z.number().int(),
  question: z.string().min(1),
  options: z.array(z.string()).min(2),
  answerIndex: z.number().int().min(0),
  explanation: z.string().optional().default(''),
});

export const RandomQuerySchema = z.object({
  topicId: z.coerce.number().int(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

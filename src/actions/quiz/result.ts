import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { Result } from 'astro:db';
import { resultRepository } from './repositories';
import { getSessionWithUser } from '../../utils/session.server';
import type { SessionUser } from '../../types/session-user';

const responseSchema = z.object({
  id: z.number().int().min(1),
  a: z.number().int().min(-1),
});

const saveResultInputSchema = z
  .object({
    platformId: z.number().int().min(1, 'Platform is required'),
    subjectId: z.number().int().min(1, 'Subject is required'),
    topicId: z.number().int().min(1, 'Topic is required'),
    roadmapId: z.number().int().min(1, 'Roadmap is required'),
    level: z.enum(['E', 'M', 'D']),
    mark: z.number().int().min(0),
    responses: z.array(responseSchema).min(1, 'Responses are required'),
  })
  .strict();

const requireUser = async (ctx: { cookies: unknown }): Promise<SessionUser> => {
  const session = await getSessionWithUser(ctx.cookies as any);
  if (!session?.user) {
    throw new ActionError({ code: 'UNAUTHORIZED', message: 'Sign in to record quiz results.' });
  }
  return session.user;
};

export const saveResult = defineAction({
  accept: 'json',
  input: saveResultInputSchema,
  async handler(input, ctx) {
    const user = await requireUser(ctx);
    const responses = input.responses.map((response) => ({
      id: response.id,
      a: response.a,
    }));

    const payload: typeof Result.$inferInsert = {
      userId: user.id,
      platformId: input.platformId,
      subjectId: input.subjectId,
      topicId: input.topicId,
      roadmapId: input.roadmapId,
      level: input.level,
      responses,
      mark: input.mark,
    };

    const [result] = await resultRepository.insert(payload);
    return { result };
  },
});

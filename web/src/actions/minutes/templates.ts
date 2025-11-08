import { defineAction } from 'astro:actions';
import { minutesTemplates } from '../../lib/minutes/schema';
import { requireUser } from './utils';

export const templates = defineAction({
  accept: 'json',
  async handler(_input, ctx) {
    await requireUser(ctx);
    return { templates: minutesTemplates };
  },
});


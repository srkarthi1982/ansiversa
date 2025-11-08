import { defineAction } from 'astro:actions';
import { exportInputSchema } from './schemas';
import { createExportArtifact, requireUser } from './utils';

export const exportNotes = defineAction({
  accept: 'json',
  input: exportInputSchema,
  async handler(input, ctx) {
    const user = await requireUser(ctx, input.sessionId);
    const artifact = await createExportArtifact(user.id, input);
    return artifact;
  },
});

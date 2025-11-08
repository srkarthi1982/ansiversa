import { defineAction } from 'astro:actions';
import { Buffer } from 'node:buffer';
import { VisitingCardExportSchema, VisitingCardRecordSchema } from '../../lib/visiting-card-maker/schema';
import { createVisitingCardId, findVisitingCardOrThrow, normalizeVisitingCard, renderCardSvg, requireUser } from './utils';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

export const exportCard = defineAction({
  accept: 'json',
  input: VisitingCardExportSchema,
  async handler(input, ctx) {
    const user = await requireUser(ctx);

    const baseRecord = input.id
      ? normalizeVisitingCard(await findVisitingCardOrThrow(input.id, user.id))
      : VisitingCardRecordSchema.parse({
          id: createVisitingCardId(),
          userId: user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          theme: input.card?.theme ?? 'aurora',
          template: input.card?.template ?? 'minimal',
          name: input.card?.name ?? '',
          title: input.card?.title ?? '',
          company: input.card?.company ?? '',
          email: input.card?.email ?? '',
          phone: input.card?.phone ?? '',
          address: input.card?.address ?? '',
          website: input.card?.website ?? '',
          tagline: input.card?.tagline ?? '',
        });

    const svg = renderCardSvg(baseRecord);
    const encoded = Buffer.from(svg).toString('base64');
    const filenameBase = slugify(baseRecord.name || baseRecord.company || 'visiting-card') || 'visiting-card';
    const requested = input.format ?? 'pdf';

    const downloadUrl = `data:image/svg+xml;base64,${encoded}`;

    return {
      url: downloadUrl,
      filename: `${filenameBase}.svg`,
      format: 'svg' as const,
      requestedFormat: requested,
      note: requested === 'svg' ? null : `SVG export provided as a fallback for ${requested.toUpperCase()} format.`,
    };
  },
});

import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { Minutes, eq } from 'astro:db';
import { MinutesSummarySchema, MinutesTranscriptSchema } from '../../lib/minutes/schema';
import { buildDemoSummary } from '../../lib/minutes/utils';
import { requireUser, findMinutesOrThrow, normalizeMinutesRow } from './utils';
import { minutesRepository } from './repositories';

const truncate = (value: string, max = 140) => {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trim()}…`;
};

export const summarize = defineAction({
  accept: 'json',
  input: z
    .object({
      id: z.string().uuid(),
      transcript: MinutesTranscriptSchema.optional(),
      regenerate: z.boolean().optional(),
    })
    .optional(),
  async handler(input, ctx) {
    const payload = input ?? {};
    if (!payload.id) {
      throw new Error('Minutes id required');
    }
    const user = await requireUser(ctx);
    const row = await findMinutesOrThrow(payload.id, user.id);
    const minutes = normalizeMinutesRow(row);
    const transcript = payload.transcript ? MinutesTranscriptSchema.parse(payload.transcript) : minutes.transcript;

    const templateSummary = buildDemoSummary(minutes.templateKey);
    const sentences = transcript.segments.map((segment) => segment.text).filter(Boolean);

    const keyPoints = sentences.slice(0, 4).map((sentence) => truncate(sentence));
    const decisionCandidates = sentences.filter((sentence) => /will|decid|approved|agree/i.test(sentence));
    const decisions = decisionCandidates.length ? decisionCandidates.slice(0, 3).map((sentence) => truncate(sentence)) : [];

    const summary = MinutesSummarySchema.parse({
      agenda: minutes.summary.agenda.length ? minutes.summary.agenda : templateSummary.agenda,
      keyPoints: keyPoints.length ? keyPoints : minutes.summary.keyPoints,
      decisions: decisions.length ? decisions : minutes.summary.decisions,
      actionItems: minutes.summary.actionItems,
      risks: minutes.summary.risks.length ? minutes.summary.risks : templateSummary.risks,
      parkingLot: minutes.summary.parkingLot.length ? minutes.summary.parkingLot : templateSummary.parkingLot,
    });

    await minutesRepository.update(
      {
        summary,
        transcript,
        lastSavedAt: new Date(),
      },
      (table) => eq(table.id, payload.id),
    );

    return { summary, transcript };
  },
});


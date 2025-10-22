import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { db, Minutes, eq } from 'astro:db';
import {
  MinutesAttendeeSchema,
  MinutesSummarySchema,
  MinutesTranscriptSchema,
} from '../../lib/minutes/schema';
import {
  mergeMinutesPayload,
  parseAttendees,
  parseSummary,
  parseTranscript,
  requireUser,
  findMinutesOrThrow,
  templateKeyEnum,
  privacyEnum,
  statusEnum,
  syncActionItems,
  normalizeMinutesRow,
} from './utils';
import { sanitizeMinutesTitle } from '../../lib/minutes/utils';

const UpdateSchema = z.object({
  title: z.string().optional(),
  meetingDate: z.string().nullable().optional(),
  templateKey: templateKeyEnum.optional(),
  attendees: MinutesAttendeeSchema.array().optional(),
  summary: MinutesSummarySchema.optional(),
  transcript: MinutesTranscriptSchema.optional(),
  privacy: privacyEnum.optional(),
  status: statusEnum.optional(),
});

type UpdateInput = z.infer<typeof UpdateSchema>;

type Patch = { path: string; value: unknown };

const parseSegments = (path: string) =>
  path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean)
    .map((segment) => (/^\d+$/.test(segment) ? Number(segment) : segment));

const setValueAtPath = (target: any, segments: Array<string | number>, value: unknown) => {
  if (!segments.length) return;
  const [head, ...rest] = segments;
  if (rest.length === 0) {
    if (typeof head === 'number') {
      if (!Array.isArray(target)) {
        throw new Error('Cannot set array index on non-array target');
      }
      target[head] = value;
    } else {
      target[head] = value;
    }
    return;
  }
  const nextKey = rest[0];
  if (typeof head === 'number') {
    if (!Array.isArray(target)) {
      throw new Error('Cannot traverse array index on non-array target');
    }
    if (target[head] == null || typeof target[head] !== 'object') {
      target[head] = typeof nextKey === 'number' ? [] : {};
    }
    setValueAtPath(target[head], rest, value);
  } else {
    if (target[head] == null || typeof target[head] !== 'object') {
      target[head] = typeof nextKey === 'number' ? [] : {};
    }
    setValueAtPath(target[head], rest, value);
  }
};

const applyPatch = (target: any, patch: Patch) => {
  const segments = parseSegments(patch.path);
  if (!segments.length) return target;
  const clone = structuredClone(target);
  setValueAtPath(clone, segments, patch.value);
  return clone;
};

export const save = defineAction({
  accept: 'json',
  input: z.object({
    id: z.string().uuid(),
    data: UpdateSchema.optional(),
    patch: z
      .object({
        path: z.string(),
        value: z.unknown(),
      })
      .optional(),
  }),
  async handler({ id, data, patch }, ctx) {
    if (!data && !patch) {
      throw new ActionError({ code: 'BAD_REQUEST', message: 'Provide data or patch to update minutes.' });
    }

    const user = await requireUser(ctx);
    const row = await findMinutesOrThrow(id, user.id);
    let draft = normalizeMinutesRow(row);

    if (data) {
      const parsed = UpdateSchema.parse(data) as UpdateInput;
      draft = mergeMinutesPayload(row, parsed);
      draft.title = sanitizeMinutesTitle(parsed.title ?? draft.title);
      draft.meetingDate = parsed.meetingDate ?? draft.meetingDate;
      if (parsed.summary) {
        draft.summary = parseSummary(parsed.summary);
      }
      if (parsed.transcript) {
        draft.transcript = parseTranscript(parsed.transcript);
      }
      if (parsed.attendees) {
        draft.attendees = parseAttendees(parsed.attendees);
      }
    }

    if (patch) {
      const patched = applyPatch(draft, patch);
      draft = mergeMinutesPayload(row, patched);
      draft.title = sanitizeMinutesTitle(draft.title);
    }

    await db
      .update(Minutes)
      .set({
        title: draft.title,
        meetingDate: draft.meetingDate ? new Date(draft.meetingDate) : null,
        templateKey: draft.templateKey,
        attendees: draft.attendees,
        summary: draft.summary,
        transcript: draft.transcript,
        privacy: draft.privacy,
        status: draft.status,
        durationSec: draft.durationSec ?? null,
        lastSavedAt: new Date(),
      })
      .where(eq(Minutes.id, id));

    await syncActionItems(id, draft.summary);

    const updated = await db.select().from(Minutes).where(eq(Minutes.id, id));
    const minutes = updated[0] ? normalizeMinutesRow(updated[0]) : draft;

    return { minutes };
  },
});


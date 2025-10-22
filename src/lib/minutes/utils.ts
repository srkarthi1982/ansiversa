import {
  MinutesAttendeeSchema,
  MinutesSummarySchema,
  MinutesTranscriptSchema,
  minutesTemplateMap,
  defaultMinutesTitle,
  minutesPlanLimits,
  minutesActionStatusLabel,
  minutesActionPriorityLabel,
  minutesTemplates,
} from './schema';
import type {
  MinutesRecord,
  MinutesSummary,
  MinutesTranscript,
  MinutesTemplateKey,
  MinutesActionItem,
} from './schema';
import { slugify } from '../string-utils';

export const slugifyMinutesTitle = (title: string) => {
  const base = slugify((title || defaultMinutesTitle).trim());
  return base || 'meeting';
};

export const sanitizeMinutesTitle = (title?: string | null) => {
  const trimmed = (title ?? '').trim();
  return trimmed.length > 0 ? trimmed : defaultMinutesTitle;
};

export const formatMeetingDate = (value?: string | Date | null) => {
  if (!value) return 'No date';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return 'No date';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDuration = (seconds?: number | null) => {
  if (!seconds || Number.isNaN(seconds)) return '—';
  const minutes = Math.round(seconds / 60);
  if (minutes < 1) {
    return `${seconds.toFixed(0)}s`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) {
    return `${minutes}m`;
  }
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
};

export const summarizeAgenda = (summary: MinutesSummary) => {
  if (summary.agenda.length === 0) return 'No agenda captured yet.';
  if (summary.agenda.length === 1) return summary.agenda[0];
  return `${summary.agenda[0]} · ${summary.agenda.length - 1} more`;
};

export const describeSummary = (summary: MinutesSummary) => {
  const highlights = [] as string[];
  if (summary.keyPoints.length > 0) {
    highlights.push(summary.keyPoints[0]);
  }
  if (summary.decisions.length > 0) {
    highlights.push(`Decision: ${summary.decisions[0]}`);
  }
  if (summary.actionItems.length > 0) {
    const open = summary.actionItems.filter((item) => item.status !== 'done').length;
    highlights.push(`${open} action item${open === 1 ? '' : 's'} open`);
  }
  return highlights.join(' • ') || 'No summary yet — start by adding key points.';
};

export const countActionItems = (summary: MinutesSummary) => {
  const total = summary.actionItems.length;
  const open = summary.actionItems.filter((item) => item.status !== 'done').length;
  const done = summary.actionItems.filter((item) => item.status === 'done').length;
  return { total, open, done };
};

export const getTemplateLabel = (key: MinutesTemplateKey) => minutesTemplateMap[key]?.label ?? 'Custom';

export const resolvePlanLimits = (plan: 'free' | 'pro') => minutesPlanLimits[plan] ?? minutesPlanLimits.free;

export const toMinutesSummary = (value: unknown): MinutesSummary =>
  MinutesSummarySchema.parse(value ?? {});

export const toMinutesTranscript = (value: unknown): MinutesTranscript =>
  MinutesTranscriptSchema.parse(value ?? {});

export const toMinutesAttendees = (value: unknown) =>
  MinutesAttendeeSchema.array().parse(value ?? []);

export const createActionItemSnapshot = (item: MinutesActionItem) =>
  `${minutesActionStatusLabel[item.status]} • ${minutesActionPriorityLabel[item.priority]} • ${item.task}`;

export const mergeMinutesRecord = (base: MinutesRecord, patch: Partial<MinutesRecord>) => {
  const next: MinutesRecord = {
    ...base,
    ...patch,
    attendees: toMinutesAttendees(patch.attendees ?? base.attendees),
    summary: toMinutesSummary(patch.summary ?? base.summary),
    transcript: toMinutesTranscript(patch.transcript ?? base.transcript),
  };
  return next;
};

export const formatRelativeTime = (value?: string | null) => {
  if (!value) return 'never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'never';
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(-diffMinutes, 'minute');
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 48) {
    return rtf.format(-diffHours, 'hour');
  }
  const diffDays = Math.round(diffHours / 24);
  return rtf.format(-diffDays, 'day');
};

export const buildDemoSummary = (key: MinutesTemplateKey): MinutesSummary => {
  const template = minutesTemplateMap[key] ?? minutesTemplates[0];
  const firstAgenda = template.agendaExamples[0] ?? 'Introductions';
  return {
    agenda: template.agendaExamples.slice(0, 3),
    keyPoints: [`Discussed ${firstAgenda.toLowerCase()}.`, 'Captured next sprint priorities.'],
    decisions: ['Aligned on next milestone date.'],
    actionItems: [
      {
        id: `demo-${key}-action-1`,
        task: 'Share recap deck',
        assignee: 'Alex',
        due: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        priority: 'med',
        status: 'open',
      },
      {
        id: `demo-${key}-action-2`,
        task: 'Prepare follow-up notes',
        assignee: 'Priya',
        due: null,
        priority: 'low',
        status: 'in-progress',
      },
    ],
    risks: ['Bandwidth tight for QA next sprint.'],
    parkingLot: ['Review integration metrics next week.'],
  } satisfies MinutesSummary;
};

export const buildDemoTranscript = (key: MinutesTemplateKey): MinutesTranscript => {
  const template = minutesTemplateMap[key] ?? minutesTemplates[0];
  return {
    language: 'en',
    speakers: ['Alex', 'Priya'],
    segments: [
      {
        id: `demo-${key}-segment-1`,
        t0: 0,
        t1: 32,
        speaker: 'Alex',
        text: `Thanks everyone for joining. Today we are focusing on ${template.agendaExamples[0]?.toLowerCase() ?? 'our goals'} and next steps.`,
      },
      {
        id: `demo-${key}-segment-2`,
        t0: 32,
        t1: 78,
        speaker: 'Priya',
        text: 'We delivered the sprint goal and gathered feedback from stakeholders. Key risks remain around QA bandwidth.',
      },
      {
        id: `demo-${key}-segment-3`,
        t0: 78,
        t1: 124,
        speaker: 'Alex',
        text: 'Let us capture action items: Alex will share recap deck, Priya will follow up with analytics, and we will sync again Friday.',
      },
    ],
  } satisfies MinutesTranscript;
};

export const applyTemplateDefaults = (record: MinutesRecord, key: MinutesTemplateKey) => {
  const summary = buildDemoSummary(key);
  const transcript = buildDemoTranscript(key);
  return mergeMinutesRecord(record, {
    templateKey: key,
    summary,
    transcript,
  });
};


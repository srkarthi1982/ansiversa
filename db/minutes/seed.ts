import { db } from 'astro:db';
import { Minutes, MinutesActionItem } from './tables';
import { buildDemoSummary, buildDemoTranscript, slugifyMinutesTitle } from '../../src/lib/minutes/utils';
import { minutesTemplateKeys } from '../../src/lib/minutes/schema';

export async function seedMinutes() {
  const existing = await db.select().from(Minutes).limit(1);
  if (existing.length > 0) {
    return;
  }

  const templateKey = minutesTemplateKeys[1];
  const minutesId = '00000000-0000-5000-9000-000000000101';
  const summary = buildDemoSummary(templateKey);
  const transcript = buildDemoTranscript(templateKey);

  await db.insert(Minutes).values({
    id: minutesId,
    userId: '00000000-0000-4000-8000-000000000002',
    title: 'Sprint Review Sync (Sample)',
    slug: `${slugifyMinutesTitle('Sprint Review Sync')}-demo`,
    status: 'draft',
    templateKey,
    meetingDate: new Date(),
    attendees: [
      { id: 'att-alex', name: 'Alex Morgan', role: 'Product Manager', optional: false },
      { id: 'att-priya', name: 'Priya Shah', role: 'Engineering Lead', optional: false },
      { id: 'att-jordan', name: 'Jordan Lee', role: 'Design Lead', optional: true },
    ],
    transcript,
    summary,
    privacy: 'standard',
    durationSec: 45 * 60,
    plan: 'pro',
    lastSavedAt: new Date(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  });

  if (summary.actionItems.length > 0) {
    await db.insert(MinutesActionItem).values(
      summary.actionItems.map((item) => ({
        id: item.id,
        minutesId,
        task: item.task,
        assignee: item.assignee ?? null,
        due: item.due ? new Date(item.due) : null,
        priority: item.priority,
        status: item.status,
        createdAt: new Date(),
      })),
    );
  }
}


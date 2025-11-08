import { db } from 'astro:db';
import { EmailDraft, EmailSignature, EmailTemplate } from './tables';
import { defaultEmailVariables } from '../../src/lib/email/schema';

export async function seedEmail() {
  const existing = await db.select().from(EmailDraft).limit(1);
  if (existing.length > 0) {
    return;
  }

  const now = new Date();
  const userId = '00000000-0000-4000-8000-000000000002';

  const signatureId = '00000000-0000-5000-9000-000000000301';
  await db.insert(EmailSignature).values({
    id: signatureId,
    userId,
    display: 'Best regards,\nAva Raman\nSuccess Lead, Ansiversa\ncontact@ansiversa.com',
    enabled: true,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(EmailTemplate).values({
    id: '00000000-0000-5000-9000-000000000302',
    userId,
    name: 'Post-demo follow-up',
    category: 'Follow-up',
    subject: 'Loved our conversation today',
    body:
      'Hi {FirstName},\n\nThanks again for walking through {Company}\'s priorities. I\'ve shared the deck and next steps below. Let me know if you\'d like a deeper dive on anything this week.\n\nWarm regards,\n{MyName}',
    language: 'en',
    isSystem: false,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(EmailDraft).values({
    id: '00000000-0000-5000-9000-000000000303',
    userId,
    title: 'Product launch follow-up',
    status: 'draft',
    subject: 'Quick follow-up on the launch plan',
    input:
      'hi team, just following up on the launch assets we promised. want to be sure everyone has what they need before thursday.',
    output:
      'I hope this message finds you well. Just checking in on the launch assets we promised so that we can confirm everyone has what they need before Thursday. Please let me know if there is anything outstanding.\n\nBest regards,\nAva Raman\nSuccess Lead, Ansiversa\ncontact@ansiversa.com',
    language: 'en',
    tone: 'professional',
    formality: 'medium',
    variables: defaultEmailVariables,
    signatureEnabled: true,
    ephemeral: false,
    plan: 'pro',
    lastSavedAt: now,
    createdAt: now,
  });
}

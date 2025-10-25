import { ActionError } from 'astro:actions';
import { CoverLetter, and, desc, eq } from 'astro:db';
import { z } from 'astro:schema';
import { getSessionWithUser } from '../../utils/session.server';
import {
  CoverLetterRecordSchema,
  coverLetterTemplateKeys,
  coverLetterTones,
  type CoverLetterTemplateKey,
  type CoverLetterTone,
} from '../../lib/cover-letter-writer/schema';
import { coverLetterRepository } from './repositories';

const { readFile } = await import('node:fs/promises');
const { randomUUID } = await import('node:crypto');

export const toneEnum = z.enum(coverLetterTones);
export const templateEnum = z.enum(coverLetterTemplateKeys);

export type CoverLetterRow = typeof CoverLetter.$inferSelect;

export const normalizeCoverLetter = (row: CoverLetterRow) =>
  CoverLetterRecordSchema.parse({
    id: row.id,
    userId: row.userId,
    title: row.title ?? 'Untitled cover letter',
    templateKey: (row.templateKey ?? 'formal') as CoverLetterTemplateKey,
    tone: (row.tone ?? 'formal') as CoverLetterTone,
    content: row.content ?? '',
    createdAt: row.createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: row.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  });

export const requireUser = async (ctx: { cookies: unknown }) => {
  const session = await getSessionWithUser(ctx.cookies as any);
  if (!session?.user) {
    throw new ActionError({ code: 'UNAUTHORIZED', message: 'Sign in to continue.' });
  }
  return session.user;
};

export const listCoverLetters = async (userId: string) => {
  const rows = await coverLetterRepository.getData({
    where: (table) => eq(table.userId, userId),
    orderBy: (table) => [desc(table.updatedAt), desc(table.createdAt)],
  });
  return rows.map(normalizeCoverLetter);
};

export const findCoverLetterOrThrow = async (id: string, userId: string) => {
  const rows = await coverLetterRepository.getData({
    where: (table) => and(eq(table.id, id), eq(table.userId, userId)),
    limit: 1,
  });
  const letter = rows[0];
  if (!letter) {
    throw new ActionError({ code: 'NOT_FOUND', message: 'Cover letter not found.' });
  }
  return letter;
};

const templateFiles: Record<CoverLetterTemplateKey, string> = {
  formal: 'formal.txt',
  modern: 'modern.txt',
  minimalist: 'minimalist.txt',
};

const templateCache = new Map<CoverLetterTemplateKey, string>();

const readTemplateFile = async (template: CoverLetterTemplateKey) => {
  const cached = templateCache.get(template);
  if (cached) return cached;
  try {
    const url = new URL(`../../templates/coverLetters/${templateFiles[template]}`, import.meta.url);
    const content = await readFile(url, 'utf-8');
    templateCache.set(template, content);
    return content;
  } catch (error) {
    console.error('Unable to read cover letter template', template, error);
    const fallback =
      'Dear Hiring Manager,\n\nI am writing to express my interest in the {{POSITION}} position at {{COMPANY}}.{{INTRO}}\n\nKey strengths:\n{{SKILL_LINES}}\n\nHighlighted achievements:\n{{ACHIEVEMENT_LINES}}\n\nThank you for your consideration.\n\nSincerely,\n{{SIGNATURE}}';
    templateCache.set(template, fallback);
    return fallback;
  }
};

const sanitize = (value: string) => value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const bulletList = (items: string[], bullet = '•') => {
  if (items.length === 0) {
    return `${bullet} Add specific accomplishments to showcase your fit.`;
  }
  return items.map((item) => `${bullet} ${item}`).join('\n');
};

export const renderFallbackLetter = async (
  templateKey: CoverLetterTemplateKey,
  data: {
    position: string;
    company: string;
    intro?: string;
    skills: string[];
    achievements: string[];
  },
) => {
  const template = await readTemplateFile(templateKey);
  const introSegment = data.intro?.trim() ?? '';
  return template
    .replace(/{{POSITION}}/g, data.position)
    .replace(/{{COMPANY}}/g, data.company)
    .replace(/{{INTRO}}/g, introSegment ? ` ${introSegment}` : '')
    .replace(/{{SKILL_LINES}}/g, bulletList(data.skills))
    .replace(/{{ACHIEVEMENT_LINES}}/g, bulletList(data.achievements))
    .replace(/{{SIGNATURE}}/g, 'Your Name');
};

export const callOpenAICoverLetter = async (
  payload: {
    position: string;
    company: string;
    intro?: string;
    skills: string[];
    achievements: string[];
    tone: CoverLetterTone;
  },
) => {
  const apiKey = import.meta.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const messages = [
    {
      role: 'system',
      content:
        'You craft concise, professional cover letters. Stay under 280 words, keep paragraphs short, and highlight measurable results. Return plain text only.',
    },
    {
      role: 'user',
      content: [
        `Role: ${payload.position}`,
        `Company: ${payload.company}`,
        `Tone: ${payload.tone}`,
        payload.intro ? `Intro: ${sanitize(payload.intro)}` : null,
        payload.skills.length ? `Skills: ${payload.skills.join(', ')}` : null,
        payload.achievements.length ? `Achievements: ${payload.achievements.join('; ')}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
    },
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: payload.tone === 'friendly' ? 0.8 : payload.tone === 'confident' ? 0.6 : 0.4,
        max_tokens: 420,
        messages,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== 'string' || !text.trim()) {
      return null;
    }

    return {
      letter: text.trim(),
      usage: {
        inputTokens: data?.usage?.input_tokens ?? 0,
        outputTokens: data?.usage?.output_tokens ?? 0,
      },
    };
  } catch (error) {
    console.error('Cover letter OpenAI request failed', error);
    return null;
  }
};

export const createCoverLetterId = () => randomUUID();

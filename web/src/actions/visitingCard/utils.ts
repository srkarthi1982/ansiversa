import { ActionError } from 'astro:actions';
import { VisitingCard, and, desc, eq } from 'astro:db';
import { z } from 'astro:schema';
import { getSessionWithUser } from '../../utils/session.server';
import {
  VisitingCardRecordSchema,
  visitingCardTemplates,
  visitingCardThemes,
  visitingCardFallbackTaglines,
  type VisitingCardRecord,
  type VisitingCardThemeId,
  type VisitingCardTemplateKey,
} from '../../lib/visiting-card-maker/schema';
import { visitingCardRepository } from './repositories';

const { readFile } = await import('node:fs/promises');
const { randomUUID } = await import('node:crypto');

export type VisitingCardRow = typeof VisitingCard.$inferSelect;

const themeEnum = z.enum(visitingCardThemes.map((theme) => theme.id) as [VisitingCardThemeId, ...VisitingCardThemeId[]]);
const templateEnum = z.enum(
  visitingCardTemplates.map((template) => template.key) as [VisitingCardTemplateKey, ...VisitingCardTemplateKey[]],
);

export const normalizeVisitingCard = (row: VisitingCardRow): VisitingCardRecord =>
  VisitingCardRecordSchema.parse({
    id: row.id,
    userId: row.userId,
    name: row.name ?? '',
    title: row.title ?? '',
    company: row.company ?? '',
    email: row.email ?? '',
    phone: row.phone ?? '',
    address: row.address ?? '',
    website: row.website ?? '',
    tagline: row.tagline ?? '',
    theme: themeEnum.parse(row.theme ?? 'aurora'),
    template: templateEnum.parse(row.template ?? 'minimal'),
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

export const listVisitingCards = async (userId: string) => {
  const rows = await visitingCardRepository.getData({
    where: (table) => eq(table.userId, userId),
    orderBy: (table) => [desc(table.updatedAt), desc(table.createdAt)],
  });
  return rows.map(normalizeVisitingCard);
};

export const findVisitingCardOrThrow = async (id: string, userId: string) => {
  const rows = await visitingCardRepository.getData({
    where: (table) => and(eq(table.id, id), eq(table.userId, userId)),
    limit: 1,
  });
  const card = rows[0];
  if (!card) {
    throw new ActionError({ code: 'NOT_FOUND', message: 'Visiting card not found.' });
  }
  return card;
};

const sanitize = (value: string) => value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const fallbackFileUrl = new URL('../../templates/taglines.txt', import.meta.url);
let cachedFallbackTaglines: string[] | null = null;

const loadFallbackTaglines = async () => {
  if (cachedFallbackTaglines) return cachedFallbackTaglines;
  try {
    const content = await readFile(fallbackFileUrl, 'utf-8');
    const lines = content
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    cachedFallbackTaglines = lines.length ? lines : [...visitingCardFallbackTaglines];
  } catch (error) {
    console.error('Unable to read visiting card tagline templates', error);
    cachedFallbackTaglines = [...visitingCardFallbackTaglines];
  }
  return cachedFallbackTaglines;
};

export const createFallbackTagline = async (data: { name: string; company: string; title?: string }) => {
  const taglines = await loadFallbackTaglines();
  const base = taglines[Math.floor(Math.random() * taglines.length)] ?? taglines[0] ?? '';
  const title = data.title?.trim();
  if (!base) {
    return `${data.company} • ${title || 'Professional services'}`;
  }
  return title ? `${base} — ${title} @ ${data.company}` : `${base} — ${data.company}`;
};

export const callOpenAITagline = async (payload: { name: string; company: string; title?: string }) => {
  const apiKey = import.meta.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const messages = [
    {
      role: 'system',
      content:
        'You are a creative branding assistant. Respond with a single, professional tagline under 12 words. Do not include quotation marks.',
    },
    {
      role: 'user',
      content: [
        `Name: ${payload.name}`,
        `Company: ${payload.company}`,
        payload.title ? `Role: ${payload.title}` : null,
        'Style: modern, confident, polished',
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
        temperature: 0.6,
        max_tokens: 60,
        messages,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== 'string') {
      return null;
    }
    const tagline = sanitize(text);
    if (!tagline) {
      return null;
    }

    return {
      tagline,
      usage: {
        inputTokens: data?.usage?.input_tokens ?? 0,
        outputTokens: data?.usage?.output_tokens ?? 0,
      },
    };
  } catch (error) {
    console.error('Visiting card OpenAI tagline request failed', error);
    return null;
  }
};

export const createVisitingCardId = () => randomUUID();

const svgEscape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const renderCardSvg = (card: VisitingCardRecord) => {
  const theme = visitingCardThemes.find((item) => item.id === card.theme) ?? visitingCardThemes[0];
  const template = visitingCardTemplates.find((item) => item.key === card.template) ?? visitingCardTemplates[0];
  const gradientId = `grad-${card.template}`;
  const headerText = svgEscape(card.name || card.company || 'Your Name');
  const subText = svgEscape(card.title || card.tagline || card.company || 'Professional Tagline');
  const footerLines = [card.email, card.phone, card.website, card.address]
    .map((value) => svgEscape(value || ''))
    .filter(Boolean);

  const accentStops = {
    minimal: '#312e81',
    horizon: '#2563eb',
    elevate: '#7c3aed',
    monoline: '#059669',
  } as Record<VisitingCardTemplateKey, string>;

  const accentColor = accentStops[template.key] ?? '#4338ca';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.95" />
      <stop offset="100%" stop-color="${accentColor}" stop-opacity="0.55" />
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="640" height="360" fill="#ffffff" rx="24" />
  <rect x="24" y="24" width="592" height="312" fill="url(#${gradientId})" opacity="0.12" rx="20" />
  <text x="48" y="120" font-family="'Inter', 'Helvetica Neue', sans-serif" font-size="36" font-weight="700" fill="#0f172a">${headerText}</text>
  <text x="48" y="160" font-family="'Inter', 'Helvetica Neue', sans-serif" font-size="18" font-weight="500" fill="#334155">${subText}</text>
  ${footerLines
    .map(
      (line, index) =>
        `<text x="48" y="${220 + index * 26}" font-family="'Inter', 'Helvetica Neue', sans-serif" font-size="16" fill="#475569">${line}</text>`,
    )
    .join('\n  ')}
  <text x="48" y="280" font-family="'Inter', 'Helvetica Neue', sans-serif" font-size="14" fill="#6366f1">${svgEscape(
    template.name,
  )} • ${svgEscape(theme.name)}</text>
</svg>`;
};

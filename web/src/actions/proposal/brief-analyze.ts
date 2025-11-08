import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { requireUser } from './utils';

const normalize = (value: string) => value.replace(/\r/g, '').trim();

const pickTop = (items: string[], max: number) => items.filter(Boolean).slice(0, max);

const extractBullets = (text: string) => {
  const matches = text.match(/(?:^|\n)[\-\*\d\.]+\s+([^\n]+)/g) ?? [];
  return matches.map((item) => item.replace(/^[\-\*\d\.\s]+/, '').trim());
};

const extractRisks = (text: string) => {
  const riskKeywords = ['risk', 'challenge', 'concern', 'constraint'];
  const lines = text.split(/\n+/);
  return lines.filter((line) => riskKeywords.some((keyword) => line.toLowerCase().includes(keyword))).map((line) => line.trim());
};

export const briefAnalyze = defineAction({
  accept: 'json',
  input: z.object({ text: z.string().default(''), industry: z.string().optional(), url: z.string().optional() }),
  async handler({ text, industry }, ctx) {
    await requireUser(ctx);
    const content = normalize(text);
    const bullets = extractBullets(content);
    const risks = extractRisks(content);

    const requirements = bullets.filter((bullet) => /must|need|require|should/i.test(bullet));
    const goals = bullets.filter((bullet) => /increase|improve|launch|deliver/i.test(bullet));
    const timelineHints = bullets.filter((bullet) => /week|month|day|deadline|timeline/i.test(bullet));

    return {
      goals: pickTop(goals.length ? goals : bullets, 4),
      requirements: pickTop(requirements.length ? requirements : bullets, 6),
      risks: pickTop(risks, 4),
      timelineHints: pickTop(timelineHints, 4),
      industry: industry ?? null,
    };
  },
});

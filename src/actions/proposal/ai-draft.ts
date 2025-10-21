import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { proposalToneOptions } from '../../lib/proposal/schema';
import { requireUser } from './utils';

const toneEnum = z.enum(proposalToneOptions);

const tonePrefixes: Record<typeof proposalToneOptions[number], string> = {
  professional: 'We recommend',
  friendly: 'Together we can',
  concise: 'The plan is to',
  bold: 'We will decisively',
  empathetic: 'We will thoughtfully',
};

export const aiDraft = defineAction({
  accept: 'json',
  input: z.object({
    client: z.string().min(2),
    industry: z.string().optional(),
    services: z.array(z.string()).default([]),
    tone: toneEnum.default('professional'),
  }),
  async handler({ client, industry, services, tone }, ctx) {
    await requireUser(ctx);

    const serviceList = services.length ? services.join(', ') : 'strategy, design, and implementation';
    const prefix = tonePrefixes[tone];

    return {
      overview: `${prefix} partner with ${client} to deliver a measurable lift across growth, customer experience, and internal enablement.`,
      scope: [
        `${prefix.toLowerCase()} map the current experience and surface opportunities.`,
        `Co-create a delivery plan tailored to ${industry ?? 'your industry'} best practices.`,
        `Provide ${serviceList} executed in two-week sprints for transparency.`,
      ],
      deliverables: [
        'Executive summary and north-star vision',
        'Detailed scope of work with milestones',
        'Design assets and implementation-ready documentation',
      ],
      timeline: [
        { milestone: 'Discovery & alignment', start: '', end: '', description: 'Stakeholder interviews, analytics review, and success metrics.' },
        { milestone: 'Design & solutioning', start: '', end: '', description: 'Iterative design reviews and approvals.' },
        { milestone: 'Implementation & training', start: '', end: '', description: 'Build support, QA, and enablement sessions.' },
      ],
      budget: {
        currency: 'USD',
        items: [
          { label: 'Discovery & strategy', qty: 1, unitPrice: 3800, total: 3800, notes: '' },
          { label: 'Design & prototyping', qty: 1, unitPrice: 6200, total: 6200, notes: '' },
          { label: 'Implementation support', qty: 1, unitPrice: 4200, total: 4200, notes: '' },
        ],
        subtotal: 14200,
        tax: 0,
        discount: 0,
        total: 14200,
        notes: 'Pricing valid for 45 days from the proposal date.',
      },
    };
  },
});

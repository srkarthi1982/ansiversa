import { db } from 'astro:db';
import { Proposal } from './tables';
import { createEmptyProposalData } from '../../src/lib/proposal/schema';
import { slugifyProposalTitle } from '../../src/lib/proposal/utils';

export async function seedProposal() {
  const proposals = await db.select().from(Proposal).limit(1);
  if (proposals.length > 0) {
    return;
  }

  const sampleTitle = 'Website Redesign Proposal';
  const data = createEmptyProposalData();
  data.client = {
    name: 'Acme Corp',
    contact: 'Jordan Walsh',
    company: 'Acme Corp',
    email: 'jordan@acme.com',
    phone: '+1 (415) 555-1324',
    website: 'https://acme.com',
    industry: 'SaaS',
    location: 'San Francisco, CA',
  };
  data.overview = 'A comprehensive redesign engagement focused on conversion, accessibility, and modular content.';
  data.goals = [
    'Boost qualified conversions by 25% within 6 months',
    'Improve lighthouse accessibility score above 95',
    'Equip Acme team with modular content blocks',
  ];
  data.scope.push('Visual design refresh across 15 core templates');
  data.deliverables.push('Design system tokens and components', 'Interactive Figma prototypes');
  data.timeline = [
    { milestone: 'Discovery & UX research', start: '2025-02-03', end: '2025-02-14', description: '' },
    { milestone: 'Design system foundations', start: '2025-02-17', end: '2025-03-07', description: '' },
    { milestone: 'Template design sprints', start: '2025-03-10', end: '2025-04-11', description: '' },
  ];
  data.budget.items = [
    { label: 'Discovery & research', qty: 1, unitPrice: 3200, total: 3200, notes: '' },
    { label: 'Design production', qty: 1, unitPrice: 6800, total: 6800, notes: '' },
    { label: 'Handoff & training', qty: 1, unitPrice: 2400, total: 2400, notes: '' },
  ];
  data.budget.subtotal = 12400;
  data.budget.tax = 0;
  data.budget.discount = 400;
  data.budget.total = 12000;
  data.team = [
    { name: 'Karthik S', role: 'Engagement Lead', bio: 'Over 12 years in SaaS UX and delivery.', email: 'karthik@ansiversa.com', phone: '' },
    { name: 'Priya Raman', role: 'Product Designer', bio: 'Figma & systems design specialist.', email: 'priya@ansiversa.com', phone: '' },
  ];
  data.caseStudies = [
    {
      title: 'Quiz Institute platform overhaul',
      summary: 'Revamped navigation and onboarding, increasing retention by 32%.',
      url: 'https://ansiversa.com/work/quiz-institute',
    },
  ];
  data.risks = ['Aggressive milestone expectations'];
  data.mitigations = ['Dedicated weekly steering meetings'];
  data.terms = [
    '50% advance invoice, 25% mid-project, 25% on final delivery',
    'All design IP transfers on final payment',
  ];

  await db.insert(Proposal).values({
    id: '00000000-0000-4000-9000-000000000001',
    userId: '00000000-0000-4000-8000-000000000002',
    title: sampleTitle,
    slug: `${slugifyProposalTitle(sampleTitle)}-demo`,
    templateKey: 'business',
    status: 'draft',
    currency: 'USD',
    data,
    lastSavedAt: new Date(),
    createdAt: new Date(),
  });
}

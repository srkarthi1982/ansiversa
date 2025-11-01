import { createEmptyPortfolioData, createPortfolioDocument } from './schema';
import type { PortfolioDocument } from '../../types/portfolio';

type SampleMetrics = { views: number; leads: number; exports: number };

export type SamplePortfolio = PortfolioDocument and SampleMetrics;

const buildSamplePrimary = (): SamplePortfolio => {
  const document = createPortfolioDocument({
    id: 'portfolio-ansiversa',
    title: 'Karthik Ramalingam',
    slug: 'karthik-ramalingam',
    templateKey: 'professional',
    status: 'published',
    plan: 'pro',
    publishedUrl: 'https://ansiversa.com/portfolio/karthik-ramalingam',
    data: createEmptyPortfolioData(),
  });
  document.data.basics = {
    ...document.data.basics,
    name: 'Karthik Ramalingam',
    title: 'Founder and CTO · Ansiversa',
    email: 'karthik@ansiversa.com',
    phone: '+971 55 123 4567',
    location: 'Dubai, UAE',
    headline: 'Crafting AI-native tools that feel personal and powerful.',
    website: 'https://ansiversa.com',
    availability: 'Accepting strategic build partnerships',
  };
  document.data.contact = {
    ...document.data.contact,
    email: 'karthik@ansiversa.com',
    phone: '+971 55 123 4567',
    location: 'Dubai, UAE',
    availability: 'Typically replies in < 12 hours',
    message: 'Tell me about your product vision and timeline. I will share a roadmap and next steps within a day.',
  };
  document.data.highlights = [
    '30+ shipped products across SaaS, edtech, and fintech',
    'Hosts the “Velocity Builders” podcast with 40k listeners',
    'Advisor to 6 venture-backed founders in MENA',
  ];
  document.data.projects[0] = {
    ...document.data.projects[0],
    name: 'Quiz Institute',
    tagline: 'Adaptive learning engine for ambitious institutions',
    spotlight: 'Scaled to 120 institutions in 10 months with 94% retention.',
  };
  document.data.experience[0] = {
    ...document.data.experience[0],
    role: 'Founder and CTO',
    company: 'Ansiversa',
    summary:
      'Leading a cross-functional studio building AI copilots and multi-tenant SaaS apps. Own strategy, architecture, and go-to-market.',
    achievements: [
      'Orchestrated launch of 26 micro-apps in 9 months.',
      'Built unified design system powering 50+ marketing pages.',
    ],
  };
  return {
    ...document,
    views: 18240,
    leads: 286,
    exports: 64,
  };
};

const buildSampleArchived = (): SamplePortfolio => {
  const document = createPortfolioDocument({
    id: 'portfolio-archived',
    title: 'Minimal Concept Portfolio',
    slug: 'minimal-concept',
    templateKey: 'minimal',
    status: 'archived',
    plan: 'free',
    data: createEmptyPortfolioData(),
  });
  document.data.basics = {
    ...document.data.basics,
    name: 'Aisha Patel',
    title: 'UX Researcher',
    headline: 'Translating human stories into inclusive products.',
    availability: 'Open to senior IC roles',
  };
  document.data.projects = document.data.projects.slice(0, 1);
  return {
    ...document,
    views: 820,
    leads: 18,
    exports: 4,
  };
};

const samples = [buildSamplePrimary(), buildSampleArchived()];

export const getSamplePortfolios = (): SamplePortfolio[] => samples.map((item) => ({ ...item }));

export const findSampleBySlug = (slug: string): SamplePortfolio | undefined =>
  samples.find((portfolio) => portfolio.slug === slug);

export const findSampleById = (id: string): SamplePortfolio | undefined => samples.find((portfolio) => portfolio.id === id);

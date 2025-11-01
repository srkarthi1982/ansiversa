import type {
  PortfolioAppearance,
  PortfolioContact,
  PortfolioData,
  PortfolioDocument,
  PortfolioPlan,
  PortfolioStatus,
  PortfolioTemplateKey,
} from '../../types/portfolio';

export const portfolioTemplates: Array<{
  key: PortfolioTemplateKey;
  label: string;
  description: string;
  accent: string;
  icon: string;
  plan: PortfolioPlan;
}> = [
  {
    key: 'professional',
    label: 'Professional',
    description: 'Crisp corporate layout with hero, skills grid, and project highlights.',
    accent: 'from-indigo-500 via-purple-500 to-sky-500',
    icon: 'fas fa-briefcase',
    plan: 'free',
  },
  {
    key: 'minimal',
    label: 'Minimal',
    description: 'Whitespace-focused layout with elegant typography and soft dividers.',
    accent: 'from-emerald-500 via-teal-500 to-cyan-500',
    icon: 'fas fa-circle-notch',
    plan: 'free',
  },
  {
    key: 'creative',
    label: 'Creative',
    description: 'Bold accent blocks with alternating backgrounds and animated skill tags.',
    accent: 'from-fuchsia-500 via-rose-500 to-orange-500',
    icon: 'fas fa-palette',
    plan: 'pro',
  },
  {
    key: 'bold',
    label: 'Bold',
    description: 'Full-width hero, marquee achievements, and testimonial carousel.',
    accent: 'from-amber-500 via-pink-500 to-indigo-500',
    icon: 'fas fa-bolt',
    plan: 'pro',
  },
];

export const portfolioTemplateKeys = portfolioTemplates.map((template) => template.key) as PortfolioTemplateKey[];

const defaultSocial = () => [
  { id: crypto.randomUUID(), label: 'LinkedIn', url: 'https://linkedin.com' },
  { id: crypto.randomUUID(), label: 'GitHub', url: 'https://github.com' },
];

const defaultAppearance = (): PortfolioAppearance => ({
  theme: 'professional',
  accentColor: '#4f46e5',
  accentName: 'Indigo Pulse',
  font: 'inter',
  layout: 'split',
});

const defaultContact = (): PortfolioContact => ({
  email: 'hello@example.com',
  phone: '+971 50 000 0000',
  location: 'Remote',
  availability: 'Open to new opportunities',
  message: 'Let’s collaborate on your next build. Drop a line and I will get back within 24 hours.',
  ctaLabel: 'Request a discovery call',
  social: defaultSocial(),
});

export const createEmptyPortfolioData = (): PortfolioData => ({
  basics: {
    name: 'Untitled Creator',
    title: 'Product Builder',
    email: 'hello@example.com',
    phone: '+971 50 000 0000',
    location: 'Remote',
    headline: 'Designing delightful digital experiences.',
    website: 'https://ansiversa.com',
    availability: 'Open to collaborations',
    avatarUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=320&q=80',
    social: defaultSocial(),
  },
  about:
    'Strategic product designer and full-stack engineer crafting end-to-end solutions. I translate complex requirements into delightful experiences.',
  skills: [
    {
      id: crypto.randomUUID(),
      name: 'Astro and SSR',
      level: 'expert',
      description: 'Production-grade Astro builds with server integrations and edge optimizations.',
    },
    {
      id: crypto.randomUUID(),
      name: 'Product Strategy',
      level: 'advanced',
      description: 'Discovery to launch cycles with measurable business outcomes.',
    },
  ],
  experience: [
    {
      id: crypto.randomUUID(),
      role: 'Founder and Principal Engineer',
      company: 'Ansiversa Labs',
      startDate: '2019',
      endDate: 'Present',
      summary: 'Leading multi-disciplinary teams to ship AI-assisted productivity suites for enterprises and creators.',
      achievements: [
        'Scaled to 40K monthly active users in 14 months.',
        'Reduced authoring time by 63% with AI-assisted flows.',
      ],
    },
  ],
  projects: [
    {
      id: crypto.randomUUID(),
      name: 'Quiz Institute',
      tagline: 'Adaptive learning platform for ambitious students.',
      description:
        'Full-stack platform delivering personalized exams, real-time analytics, and AI study companions for 120+ institutions.',
      link: 'https://ansiversa.com/quiz',
      tags: ['EdTech', 'AI', 'Platform'],
      spotlight: 'Achieved 95% satisfaction scores with automated study plans.',
    },
    {
      id: crypto.randomUUID(),
      name: 'Resume Builder',
      tagline: 'ATS-friendly resume engine with AI improvements.',
      description: 'Designed the experience, content model, and exports for our flagship resume builder.',
      link: 'https://ansiversa.com/resume-builder',
      tags: ['Productivity', 'AI'],
      spotlight: 'Helped 18K professionals ship polished resumes.',
    },
  ],
  testimonials: [
    {
      id: crypto.randomUUID(),
      name: 'Laila Hassan',
      role: 'Director of Product, VisionX',
      quote: 'Ansiversa translated our raw ideas into a polished platform that clients love. Execution was impeccable.',
    },
  ],
  contact: defaultContact(),
  highlights: [
    '10+ years building B2B/B2C products',
    'Speaker at Dubai DevSummit and AstroConf',
    'Mentor at Women Who Code Dubai',
  ],
  seo: {
    title: 'Ansiversa Portfolio — Build trust with polished storytelling',
    description: 'Create high-converting personal sites with live previews, AI writing, and multi-template support.',
    keywords: 'portfolio, ansiversa, templates, ai',
  },
  appearance: defaultAppearance(),
});

export const createPortfolioDocument = (
  overrides: Partial<PortfolioDocument & { status?: PortfolioStatus; plan?: PortfolioPlan }> = {},
): PortfolioDocument => {
  const now = new Date().toISOString();
  return {
    id: overrides.id ?? crypto.randomUUID(),
    userId: overrides.userId ?? 'demo-user',
    title: overrides.title ?? 'Untitled portfolio',
    slug: overrides.slug ?? 'untitled-portfolio',
    templateKey: overrides.templateKey ?? 'professional',
    status: overrides.status ?? 'draft',
    plan: overrides.plan ?? 'free',
    data: overrides.data ?? createEmptyPortfolioData(),
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    lastSavedAt: overrides.lastSavedAt ?? now,
    publishedUrl: overrides.publishedUrl ?? null,
  };
};

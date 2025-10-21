export type PortfolioTemplateKey = 'professional' | 'minimal' | 'creative' | 'bold';

export type PortfolioStatus = 'draft' | 'published' | 'archived';

export type PortfolioPlan = 'free' | 'pro';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface PortfolioSocialLink {
  id: string;
  label: string;
  url: string;
}

export interface PortfolioBasics {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  website: string;
  availability: string;
  avatarUrl: string;
  social: PortfolioSocialLink[];
}

export interface PortfolioExperience {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  summary: string;
  achievements: string[];
}

export interface PortfolioSkill {
  id: string;
  name: string;
  level: SkillLevel;
  description: string;
}

export interface PortfolioProject {
  id: string;
  name: string;
  tagline: string;
  description: string;
  link: string;
  tags: string[];
  spotlight: string;
}

export interface PortfolioTestimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
}

export interface PortfolioContact {
  email: string;
  phone: string;
  location: string;
  availability: string;
  message: string;
  ctaLabel: string;
  social: PortfolioSocialLink[];
}

export interface PortfolioSeo {
  title: string;
  description: string;
  keywords: string;
}

export interface PortfolioAppearance {
  theme: 'professional' | 'minimal' | 'creative' | 'bold';
  accentColor: string;
  accentName: string;
  font: 'inter' | 'lora' | 'sora' | 'urbanist';
  layout: 'classic' | 'split' | 'showcase';
}

export interface PortfolioData {
  basics: PortfolioBasics;
  about: string;
  skills: PortfolioSkill[];
  experience: PortfolioExperience[];
  projects: PortfolioProject[];
  testimonials: PortfolioTestimonial[];
  contact: PortfolioContact;
  highlights: string[];
  seo: PortfolioSeo;
  appearance: PortfolioAppearance;
}

export interface PortfolioDocument {
  id: string;
  userId: string;
  title: string;
  slug: string;
  templateKey: PortfolioTemplateKey;
  status: PortfolioStatus;
  plan: PortfolioPlan;
  data: PortfolioData;
  createdAt: string;
  updatedAt: string;
  lastSavedAt: string;
  publishedUrl: string | null;
}

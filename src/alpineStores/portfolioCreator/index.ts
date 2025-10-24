import Alpine from 'alpinejs';
import { hideLoader, showLoader } from '../base';
import {
  createEmptyPortfolioData,
  createPortfolioDocument,
  portfolioTemplateKeys,
  portfolioTemplates,
} from '../../lib/portfolio/schema';
import { getSamplePortfolios } from '../../lib/portfolio/sample';
import type {
  PortfolioData,
  PortfolioDocument,
  PortfolioPlan,
  PortfolioStatus,
  PortfolioTemplateKey,
} from '../../types/portfolio';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

type PortfolioListItem = PortfolioDocument & {
  views: number;
  leads: number;
  exports: number;
};

type BuilderInitOptions = {
  id?: string | null;
};

type AISectionTarget =
  | { type: 'about' }
  | { type: 'experience'; id: string }
  | { type: 'project'; id: string }
  | { type: 'highlight'; index: number };

class PortfolioCreatorStore {
  state: {
    loading: boolean;
    plan: PortfolioPlan;
    items: PortfolioListItem[];
    filtered: PortfolioListItem[];
    filters: {
      status: 'all' | PortfolioStatus;
      template: 'all' | PortfolioTemplateKey;
    };
    search: string;
    sort: 'recent' | 'name-asc' | 'name-desc';
    ai: { used: number; limit: number; unlimited: boolean };
    showPlanModal: boolean;
    metrics: { views: number; leads: number; exports: number; published: number };
  } = {
    loading: false,
    plan: 'free',
    items: [],
    filtered: [],
    filters: {
      status: 'all',
      template: 'all',
    },
    search: '',
    sort: 'recent',
    ai: { used: 1, limit: 3, unlimited: false },
    showPlanModal: false,
    metrics: { views: 0, leads: 0, exports: 0, published: 0 },
  };

  builderState: {
    id: string | null;
    title: string;
    slug: string;
    status: PortfolioStatus;
    templateKey: PortfolioTemplateKey;
    data: PortfolioData;
    hasUnsavedChanges: boolean;
    autosaveLabel: string | null;
    previewMode: 'desktop' | 'mobile';
    aiImproving: boolean;
    lastSavedAt: string | null;
  } = {
    id: null,
    title: 'Untitled portfolio',
    slug: 'untitled-portfolio',
    status: 'draft',
    templateKey: 'professional',
    data: createEmptyPortfolioData(),
    hasUnsavedChanges: false,
    autosaveLabel: null,
    previewMode: 'desktop',
    aiImproving: false,
    lastSavedAt: null,
  };

  adminInsights: {
    topTemplates: Array<{ key: PortfolioTemplateKey; count: number; label: string }>;
    plan: PortfolioPlan;
    activePortfolios: number;
    archivedPortfolios: number;
    publishedRatio: string;
  } = {
    topTemplates: [],
    plan: 'free',
    activePortfolios: 0,
    archivedPortfolios: 0,
    publishedRatio: '0%',
  };

  private sectionsOpen = new Set(['basics', 'about', 'skills', 'experience', 'projects', 'contact', 'seo']);
  private listInitialized = false;

  onInit(): void {
    this.initDashboard();
  }

  initDashboard(): void {
    this.ensureList();
  }

  initBuilder(options: BuilderInitOptions = {}): void {
    this.ensureList();
    const targetId = options.id ?? null;
    if (targetId) {
      const existing = this.state.items.find((item) => item.id === targetId);
      if (existing) {
        this.loadBuilder(existing);
        return;
      }
    }
    if (this.state.items.length > 0) {
      this.loadBuilder(this.state.items[0]);
    } else {
      this.createDraft();
    }
  }

  initTemplates(): void {
    this.ensureList();
  }

  initAdmin(): void {
    this.ensureList();
    this.refreshAdminInsights();
  }

  private ensureList(): void {
    if (this.listInitialized) return;
    this.listInitialized = true;
    void this.loadList();
  }

  async loadList(): Promise<void> {
    this.state.loading = true;
    showLoader();
    try {
      const samples = getSamplePortfolios();
      this.state.items = samples.map((item) => ({
        ...item,
        data: clone(item.data),
      }));
      this.applyFilters();
      this.updateMetrics();
      this.refreshAdminInsights();
    } finally {
      this.state.loading = false;
      hideLoader();
    }
  }

  createDraft(): void {
    if (this.hasReachedPortfolioLimit()) {
      this.openPlanUpsell();
      return;
    }
    const draft = createPortfolioDocument({
      title: 'Untitled portfolio',
      slug: this.generateUniqueSlug('untitled-portfolio'),
      status: 'draft',
      plan: this.state.plan,
      data: createEmptyPortfolioData(),
    });
    const draftWithMetrics: PortfolioListItem = {
      ...draft,
      views: 0,
      leads: 0,
      exports: 0,
    };
    this.state.items.unshift(draftWithMetrics);
    this.applyFilters();
    this.loadBuilder(draftWithMetrics);
    this.updateMetrics();
  }

  duplicate(id: string): void {
    if (this.hasReachedPortfolioLimit()) {
      this.openPlanUpsell();
      return;
    }
    const existing = this.state.items.find((item) => item.id === id);
    if (!existing) return;
    const copy = clone(existing) as PortfolioListItem;
    copy.id = crypto.randomUUID();
    copy.title = `${existing.title} (Copy)`;
    copy.slug = this.generateUniqueSlug(`${existing.slug}-copy`);
    copy.status = 'draft';
    copy.lastSavedAt = new Date().toISOString();
    copy.updatedAt = copy.lastSavedAt;
    copy.views = 0;
    copy.leads = 0;
    copy.exports = 0;
    copy.publishedUrl = null;
    this.state.items.unshift(copy);
    this.applyFilters();
    this.loadBuilder(copy);
    this.updateMetrics();
  }

  delete(id: string): void {
    const index = this.state.items.findIndex((item) => item.id === id);
    if (index === -1) return;
    this.state.items.splice(index, 1);
    this.applyFilters();
    if (this.builderState.id === id) {
      const fallback = this.state.items[0];
      if (fallback) {
        this.loadBuilder(fallback);
      } else {
        this.resetBuilder();
      }
    }
    this.updateMetrics();
    this.refreshAdminInsights();
  }

  private resetBuilder(): void {
    this.builderState = {
      id: null,
      title: 'Untitled portfolio',
      slug: 'untitled-portfolio',
      status: 'draft',
      templateKey: 'professional',
      data: createEmptyPortfolioData(),
      hasUnsavedChanges: false,
      autosaveLabel: null,
      previewMode: 'desktop',
      aiImproving: false,
      lastSavedAt: null,
    };
  }

  private loadBuilder(item: PortfolioListItem): void {
    this.builderState = {
      id: item.id,
      title: item.title,
      slug: item.slug,
      status: item.status,
      templateKey: item.templateKey,
      data: clone(item.data),
      hasUnsavedChanges: false,
      autosaveLabel: null,
      previewMode: 'desktop',
      aiImproving: false,
      lastSavedAt: item.lastSavedAt ?? item.updatedAt ?? null,
    };
    this.sectionsOpen = new Set(['basics', 'about', 'skills', 'experience', 'projects', 'contact', 'seo']);
  }

  setTemplate(key: PortfolioTemplateKey): void {
    if (!portfolioTemplateKeys.includes(key)) return;
    const templateMeta = portfolioTemplates.find((template) => template.key === key);
    if (templateMeta && templateMeta.plan === 'pro' && this.state.plan === 'free') {
      this.openPlanUpsell();
      return;
    }
    this.builderState.templateKey = key;
    this.builderState.data.appearance.theme = key;
    this.markUnsaved();
  }

  setSlug(value: string): void {
    this.builderState.slug = this.sanitizeSlug(value);
    this.markUnsaved();
  }

  syncTitleWithName(): void {
    if (!this.builderState) return;
    const candidate = this.builderState.data.basics.name || this.builderState.title;
    if (!candidate) return;
    this.builderState.title = candidate;
    this.builderState.slug = this.generateUniqueSlug(this.sanitizeSlug(candidate));
    this.markUnsaved();
  }

  markUnsaved(): void {
    this.builderState.hasUnsavedChanges = true;
  }

  saveNow(): void {
    if (!this.builderState.id) {
      this.createDraft();
      return;
    }
    const now = new Date().toISOString();
    const record = this.state.items.find((item) => item.id === this.builderState.id);
    if (!record) return;
    record.title = this.builderState.title.trim() || 'Untitled portfolio';
    record.slug = this.builderState.slug.trim() || this.generateUniqueSlug('portfolio');
    record.status = this.builderState.status;
    record.templateKey = this.builderState.templateKey;
    record.data = clone(this.builderState.data);
    record.updatedAt = now;
    record.lastSavedAt = now;
    if (record.status === 'published' && !record.publishedUrl) {
      record.publishedUrl = `/portfolio/view/${record.slug}`;
    }
    this.builderState.hasUnsavedChanges = false;
    this.builderState.autosaveLabel = 'Saved just now';
    this.builderState.lastSavedAt = now;
    this.applyFilters();
    this.updateMetrics();
    this.refreshAdminInsights();
  }

  publish(): void {
    if (!this.builderState.id) return;
    this.builderState.status = 'published';
    this.saveNow();
  }

  unpublish(): void {
    if (!this.builderState.id) return;
    this.builderState.status = 'draft';
    this.saveNow();
  }

  export(format: 'pdf' | 'html'): void {
    console.info(`Export requested: ${format}`);
    const record = this.state.items.find((item) => item.id === this.builderState.id);
    if (record) {
      record.exports += 1;
    }
    this.state.metrics.exports += 1;
  }

  applyFilters(): void {
    const searchTerm = this.state.search.trim().toLowerCase();
    const filtered = this.state.items.filter((item) => {
      if (this.state.filters.status !== 'all' && item.status !== this.state.filters.status) {
        return false;
      }
      if (this.state.filters.template !== 'all' && item.templateKey !== this.state.filters.template) {
        return false;
      }
      if (!searchTerm) return true;
      return (
        item.title.toLowerCase().includes(searchTerm) ||
        item.slug.toLowerCase().includes(searchTerm) ||
        item.data.basics.name.toLowerCase().includes(searchTerm)
      );
    });
    const sorted = filtered.sort((a, b) => {
      switch (this.state.sort) {
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
    this.state.filtered = sorted;
  }

  describe(item: PortfolioListItem): string {
    const segments: string[] = [];
    if (item.data.skills.length > 0) {
      segments.push(`${item.data.skills.length} skill${item.data.skills.length > 1 ? 's' : ''}`);
    }
    if (item.data.projects.length > 0) {
      segments.push(`${item.data.projects.length} project${item.data.projects.length > 1 ? 's' : ''}`);
    }
    if (item.data.testimonials.length > 0) {
      segments.push(`${item.data.testimonials.length} testimonial${item.data.testimonials.length > 1 ? 's' : ''}`);
    }
    return segments.length > 0 ? segments.join(' · ') : 'Add your skills, projects, and testimonials to get started.';
  }

  formatRelative(dateString?: string | null): string {
    if (!dateString) return 'never';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'never';
    const diffMinutes = Math.round((date.getTime() - Date.now()) / (1000 * 60));
    const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    if (Math.abs(diffMinutes) < 60) {
      return formatter.format(diffMinutes, 'minute');
    }
    const diffHours = Math.round(diffMinutes / 60);
    if (Math.abs(diffHours) < 24) {
      return formatter.format(diffHours, 'hour');
    }
    const diffDays = Math.round(diffHours / 24);
    return formatter.format(diffDays, 'day');
  }

  aiImprove(target: AISectionTarget): void {
    if (!this.consumeAIQuota()) return;
    this.builderState.aiImproving = true;
    showLoader();
    setTimeout(() => {
      switch (target.type) {
        case 'about': {
          const about = this.builderState.data.about.trim();
          this.builderState.data.about = about
            ? `${about} Elevate your brand with human-centered storytelling rooted in measurable outcomes.`
            : 'Elevate your brand with human-centered storytelling rooted in measurable outcomes.';
          break;
        }
        case 'experience': {
          const experience = this.builderState.data.experience.find((item) => item.id === target.id);
          if (experience) {
            experience.summary = `${experience.summary} Delivered quarterly OKRs ahead of schedule while mentoring cross-discipline squads.`.trim();
            if (!experience.achievements.includes('Drove NPS +28 through journey redesign.')) {
              experience.achievements.push('Drove NPS +28 through journey redesign.');
            }
          }
          break;
        }
        case 'project': {
          const project = this.builderState.data.projects.find((item) => item.id === target.id);
          if (project) {
            project.description = `${project.description} Resulted in a 47% lift in qualified leads via narrative-first storytelling.`.trim();
            project.spotlight = 'Resulted in a 47% lift in qualified leads via narrative-first storytelling.';
          }
          break;
        }
        case 'highlight': {
          const highlight = this.builderState.data.highlights[target.index] ?? '';
          this.builderState.data.highlights.splice(
            target.index,
            1,
            highlight
              ? `${highlight} | Recognized for outcome-driven execution.`
              : 'Recognized for outcome-driven execution and authentic leadership.',
          );
          break;
        }
      }
      this.builderState.aiImproving = false;
      this.markUnsaved();
      hideLoader();
    }, 600);
  }

  addSkill(): void {
    this.builderState.data.skills.push({
      id: crypto.randomUUID(),
      name: 'New capability',
      level: 'intermediate',
      description: 'Describe how you apply this skill in your work.',
    });
    this.markUnsaved();
  }

  removeSkill(id: string): void {
    this.builderState.data.skills = this.builderState.data.skills.filter((skill) => skill.id !== id);
    this.markUnsaved();
  }

  addExperience(): void {
    this.builderState.data.experience.push({
      id: crypto.randomUUID(),
      role: 'New role',
      company: 'Company name',
      startDate: '2022',
      endDate: 'Present',
      summary: 'Summarize your impact, responsibilities, and scale.',
      achievements: ['Highlight a quantifiable win.'],
    });
    this.markUnsaved();
  }

  removeExperience(id: string): void {
    this.builderState.data.experience = this.builderState.data.experience.filter((item) => item.id !== id);
    this.markUnsaved();
  }

  addProject(): void {
    this.builderState.data.projects.push({
      id: crypto.randomUUID(),
      name: 'New project',
      tagline: 'Add a one-line hook',
      description: 'Share the problem, the approach, and the results.',
      link: 'https://',
      tags: ['Design'],
      spotlight: 'Add a metric that proves impact.',
    });
    this.markUnsaved();
  }

  removeProject(id: string): void {
    this.builderState.data.projects = this.builderState.data.projects.filter((project) => project.id !== id);
    this.markUnsaved();
  }

  addHighlight(): void {
    this.builderState.data.highlights.push('Add a measurable career highlight.');
    this.markUnsaved();
  }

  removeHighlight(index: number): void {
    this.builderState.data.highlights.splice(index, 1);
    this.markUnsaved();
  }

  addTestimonial(): void {
    this.builderState.data.testimonials.push({
      id: crypto.randomUUID(),
      name: 'Client name',
      role: 'Role, company',
      quote: 'Working with you was transformational. Mention a tangible outcome here.',
    });
    this.markUnsaved();
  }

  removeTestimonial(id: string): void {
    this.builderState.data.testimonials = this.builderState.data.testimonials.filter((item) => item.id !== id);
    this.markUnsaved();
  }

  addSocialLink(): void {
    this.builderState.data.basics.social.push({
      id: crypto.randomUUID(),
      label: 'Dribbble',
      url: 'https://dribbble.com/',
    });
    this.builderState.data.contact.social.push({
      id: crypto.randomUUID(),
      label: 'Dribbble',
      url: 'https://dribbble.com/',
    });
    this.markUnsaved();
  }

  removeSocialLink(id: string): void {
    this.builderState.data.basics.social = this.builderState.data.basics.social.filter((link) => link.id !== id);
    this.builderState.data.contact.social = this.builderState.data.contact.social.filter((link) => link.id !== id);
    this.markUnsaved();
  }

  toggleSection(section: string): void {
    if (this.sectionsOpen.has(section)) {
      this.sectionsOpen.delete(section);
    } else {
      this.sectionsOpen.add(section);
    }
  }

  isSectionOpen(section: string): boolean {
    return this.sectionsOpen.has(section);
  }

  upgradeToPro(): void {
    this.state.plan = 'pro';
    this.state.ai.unlimited = true;
    this.state.ai.limit = 99;
    this.state.showPlanModal = false;
    this.refreshAdminInsights();
  }

  openPlanUpsell(): void {
    this.state.showPlanModal = true;
  }

  closePlanUpsell(): void {
    this.state.showPlanModal = false;
  }

  get aiQuotaLabel(): string {
    if (this.state.ai.unlimited) {
      return 'Unlimited AI improvements';
    }
    return `${this.state.ai.used}/${this.state.ai.limit} AI improves used today`;
  }

  get currentPlanLabel(): string {
    return this.state.plan === 'pro' ? 'Pro — Unlimited portfolios' : 'Free — 1 active portfolio';
  }

  get builderPublicUrl(): string {
    const slug = this.builderState.slug || 'preview';
    return `/portfolio/view/${slug}`;
  }

  get accessibleTemplates() {
    return portfolioTemplates.map((template) => ({
      ...template,
      locked: template.plan === 'pro' && this.state.plan === 'free',
    }));
  }

  private refreshAdminInsights(): void {
    const templateCounter = new Map<PortfolioTemplateKey, number>();
    this.state.items.forEach((item) => {
      templateCounter.set(item.templateKey, (templateCounter.get(item.templateKey) ?? 0) + 1);
    });
    this.adminInsights.topTemplates = portfolioTemplates.map((template) => ({
      key: template.key,
      label: template.label,
      count: templateCounter.get(template.key) ?? 0,
    }));
    const active = this.state.items.filter((item) => item.status !== 'archived');
    const archived = this.state.items.length - active.length;
    const published = this.state.items.filter((item) => item.status === 'published').length;
    this.adminInsights.activePortfolios = active.length;
    this.adminInsights.archivedPortfolios = archived;
    this.adminInsights.plan = this.state.plan;
    this.adminInsights.publishedRatio = active.length === 0 ? '0%' : `${Math.round((published / active.length) * 100)}%`;
  }

  private updateMetrics(): void {
    this.state.metrics = this.state.items.reduce(
      (acc, item) => {
        if (item.status === 'published') {
          acc.published += 1;
        }
        acc.views += item.views;
        acc.leads += item.leads;
        acc.exports += item.exports;
        return acc;
      },
      { views: 0, leads: 0, exports: 0, published: 0 },
    );
  }

  private generateUniqueSlug(candidate: string): string {
    const base = this.sanitizeSlug(candidate || 'portfolio');
    let slug = base;
    let counter = 2;
    while (this.state.items.some((item) => item.slug === slug && item.id !== this.builderState.id)) {
      slug = `${base}-${counter}`;
      counter += 1;
    }
    return slug;
  }

  private sanitizeSlug(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private hasReachedPortfolioLimit(): boolean {
    if (this.state.plan === 'pro') return false;
    const activeCount = this.state.items.filter((item) => item.status !== 'archived').length;
    return activeCount >= 1;
  }

  private consumeAIQuota(): boolean {
    if (this.state.ai.unlimited) return true;
    if (this.state.ai.used >= this.state.ai.limit) {
      this.openPlanUpsell();
      return false;
    }
    this.state.ai.used += 1;
    return true;
  }
}

Alpine.store('portfolio-creator', new PortfolioCreatorStore());

export type PortfolioCreatorStoreType = PortfolioCreatorStore;

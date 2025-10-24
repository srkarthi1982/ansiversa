import Alpine from 'alpinejs';
import { actions } from 'astro:actions';
import { hideLoader, showLoader } from '../base';
import { createEmptyResumeData, resumeTemplateKeys, skillLevels } from '../../lib/resume/schema';
import type {
  ResumeData,
  ResumeDocument,
  ResumeExperience,
  ResumeEducation,
  ResumeSkill,
  ResumeLink,
} from '../../lib/resume/schema';

type TemplateKey = (typeof resumeTemplateKeys)[number];
type SkillLevel = (typeof skillLevels)[number];

type ResumeListItem = ResumeDocument & {
  lastSavedAt: string;
  isDefault?: boolean;
};

type BuilderInitInput = {
  id?: string | null;
};

type AutosaveTimer = ReturnType<typeof setTimeout> | null;

const templateOptions: Array<{ key: TemplateKey; label: string; icon: string; plan: 'free' | 'pro' }> = [
  { key: 'modern', label: 'Modern', icon: 'fas fa-bolt', plan: 'free' },
  { key: 'classic', label: 'Classic', icon: 'fas fa-feather', plan: 'free' },
  { key: 'minimal', label: 'Minimal', icon: 'fas fa-circle-notch', plan: 'free' },
  { key: 'creative', label: 'Creative', icon: 'fas fa-palette', plan: 'pro' },
];

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const describeSummary = (data: ResumeData) => {
  const segments: string[] = [];
  if (data.experience.length > 0) {
    segments.push(`${data.experience.length} experience item${data.experience.length > 1 ? 's' : ''}`);
  }
  if (data.education.length > 0) {
    segments.push(`${data.education.length} education record${data.education.length > 1 ? 's' : ''}`);
  }
  if (data.skills.length > 0) {
    segments.push(`${data.skills.length} skill${data.skills.length > 1 ? 's' : ''}`);
  }
  return segments.length > 0 ? segments.join(' · ') : 'Start adding experience, education, and skills.';
};

class ResumeStoreImpl {
  state: {
    loading: boolean;
    hasUnsavedChanges: boolean;
    lastSavedLabel: string | null;
    resumes: ResumeListItem[];
    filteredResumes: ResumeListItem[];
  } = {
    loading: false,
    hasUnsavedChanges: false,
    lastSavedLabel: null,
    resumes: [],
    filteredResumes: [],
  };

  filters = {
    template: 'all' as TemplateKey | 'all',
    sort: 'recent' as 'recent' | 'oldest' | 'name-asc' | 'name-desc',
  };

  builderState: {
    id: string | null;
    title: string;
    templateKey: TemplateKey;
    locale: 'en' | 'ar' | 'ta';
    status: 'draft' | 'final';
    data: ResumeData;
    autosaveLabel: string | null;
    loading: boolean;
  } = {
    id: null,
    title: 'Untitled resume',
    templateKey: 'modern',
    locale: 'en',
    status: 'draft',
    data: createEmptyResumeData(),
    autosaveLabel: null,
    loading: false,
  };

  skillDraft: { name: string; level: SkillLevel } = { name: '', level: 'intermediate' };

  templates = templateOptions;

  private builderAutosaveTimer: AutosaveTimer = null;
  private sectionsOpen = new Set(['basics', 'experience', 'education', 'skills']);

  private normalizeResume(input: any): ResumeListItem {
    const baseData = input?.data ?? createEmptyResumeData();
    return {
      id: String(input?.id ?? crypto.randomUUID()),
      userId: String(input?.userId ?? ''),
      title: (input?.title ?? 'Untitled resume').trim() || 'Untitled resume',
      templateKey: (input?.templateKey ?? 'modern') as TemplateKey,
      locale: (input?.locale ?? 'en') as 'en' | 'ar' | 'ta',
      status: (input?.status ?? 'draft') as 'draft' | 'final',
      data: clone(baseData),
      lastSavedAt: input?.lastSavedAt ?? new Date().toISOString(),
      createdAt: input?.createdAt ?? new Date().toISOString(),
      isDefault: Boolean(input?.isDefault),
    };
  }

  private upsertResume(item: ResumeListItem): void {
    const index = this.state.resumes.findIndex((resume) => resume.id === item.id);
    if (index === -1) {
      this.state.resumes.unshift(item);
    } else {
      this.state.resumes.splice(index, 1, item);
    }
    this.applyFilters();
  }

  initList(): void {
    if (this.state.loading) return;
    void this.loadList();
  }

  initTemplates(): void {
    if (this.state.resumes.length === 0 && !this.state.loading) {
      void this.loadList();
    }
  }

  async loadList(): Promise<void> {
    this.state.loading = true;
    showLoader();
    try {
      const { data, error } = await actions.resume.list({});
      if (error) {
        throw error;
      }
      const items = Array.isArray(data?.items) ? data!.items : [];
      this.state.resumes = items.map((item) => this.normalizeResume(item));
      this.applyFilters();
      this.state.lastSavedLabel = this.state.resumes[0]?.lastSavedAt ?? null;
    } catch (error) {
      console.error('Unable to load resumes', error);
      this.state.resumes = [];
      this.state.filteredResumes = [];
    } finally {
      this.state.loading = false;
      hideLoader();
    }
  }

  applyFilters(): void {
    const filtered = this.state.resumes.filter((resume) => {
      if (this.filters.template !== 'all' && resume.templateKey !== this.filters.template) {
        return false;
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (this.filters.sort) {
        case 'oldest':
          return new Date(a.lastSavedAt).getTime() - new Date(b.lastSavedAt).getTime();
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        default:
          return new Date(b.lastSavedAt).getTime() - new Date(a.lastSavedAt).getTime();
      }
    });

    this.state.filteredResumes = sorted;
  }

  get filteredResumes(): ResumeListItem[] {
    return this.state.filteredResumes;
  }

  describeResume(resume: ResumeListItem): string {
    return describeSummary(resume.data);
  }

  formatRelative(dateString?: string | null): string {
    if (!dateString) return 'never';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'invalid date';
    const diffMs = date.getTime() - Date.now();
    const diffMinutes = Math.round(diffMs / (1000 * 60));
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

  async createDraft(): Promise<void> {
    showLoader();
    try {
      const { data, error } = await actions.resume.create({});
      if (error) {
        throw error;
      }
      const resume = this.normalizeResume(data?.resume);
      this.upsertResume(resume);
      window.location.assign(`/resume-builder/builder?id=${resume.id}`);
    } catch (error) {
      console.error('Unable to create resume', error);
      window.alert('Unable to create resume. Please try again.');
    } finally {
      hideLoader();
    }
  }

  async duplicate(id: string): Promise<void> {
    try {
      const { data, error } = await actions.resume.duplicate({ id });
      if (error) {
        throw error;
      }
      const cloneResume = this.normalizeResume(data?.resume);
      this.upsertResume(cloneResume);
    } catch (error) {
      console.error('Unable to duplicate resume', error);
      window.alert('Unable to duplicate resume right now.');
    }
  }

  async requestDelete(id: string): Promise<void> {
    const confirmDelete = window.confirm('Are you sure you want to delete this resume?');
    if (!confirmDelete) return;
    try {
      const { error } = await actions.resume.delete({ id });
      if (error) {
        throw error;
      }
      this.state.resumes = this.state.resumes.filter((item) => item.id !== id);
      this.applyFilters();
    } catch (error) {
      console.error('Unable to delete resume', error);
      window.alert('Unable to delete resume right now.');
    }
  }

  async toggleDefault(id: string): Promise<void> {
    try {
      const { error } = await actions.resume.setDefault({ id });
      if (error) {
        throw error;
      }
      this.state.resumes = this.state.resumes.map((resume) => ({
        ...resume,
        isDefault: resume.id === id,
      }));
      this.applyFilters();
    } catch (error) {
      console.error('Unable to update default resume', error);
      window.alert('Unable to update default resume right now.');
    }
  }

  async initBuilder({ id }: BuilderInitInput = {}): Promise<void> {
    if (this.builderState.loading) return;
    this.builderState.loading = true;
    showLoader();
    try {
      if (this.state.resumes.length === 0 && !this.state.loading) {
        await this.loadList();
        showLoader();
      }
      let target: ResumeListItem | undefined = id
        ? this.state.resumes.find((item) => item.id === id)
        : undefined;

      if (!target && id) {
        const { data, error } = await actions.resume.get({ id });
        if (error) {
          throw error;
        }
        target = this.normalizeResume(data?.resume);
        this.upsertResume(target);
      }

      if (!target) {
        const { data, error } = await actions.resume.create({});
        if (error) {
          throw error;
        }
        target = this.normalizeResume(data?.resume);
        this.upsertResume(target);
        window.history.replaceState({}, '', `/resume-builder/builder?id=${target.id}`);
      }

      this.builderState = {
        id: target.id,
        title: target.title,
        templateKey: target.templateKey,
        locale: target.locale,
        status: target.status,
        data: clone(target.data),
        autosaveLabel: null,
        loading: false,
      };

      this.state.hasUnsavedChanges = false;
      this.state.lastSavedLabel = target.lastSavedAt ?? null;
      this.sectionsOpen = new Set(['basics', 'experience', 'education', 'skills']);
    } catch (error) {
      console.error('Unable to load resume', error);
      window.alert('Unable to load resume right now.');
    } finally {
      this.builderState.loading = false;
      hideLoader();
    }
  }

  markUnsaved(): void {
    this.state.hasUnsavedChanges = true;
    this.builderState.autosaveLabel = 'Pending autosave…';
    this.scheduleAutosave();
  }

  private scheduleAutosave(): void {
    if (this.builderAutosaveTimer) {
      clearTimeout(this.builderAutosaveTimer);
    }
    this.builderAutosaveTimer = setTimeout(() => {
      void this.saveNow(true);
    }, 3000);
  }

  async saveNow(autosave = false): Promise<void> {
    if (!this.builderState.id) return;
    if (this.builderAutosaveTimer) {
      clearTimeout(this.builderAutosaveTimer);
      this.builderAutosaveTimer = null;
    }

    try {
      this.builderState.autosaveLabel = autosave ? 'Autosaving…' : 'Saving…';
      const { data, error } = await actions.resume.save({
        id: this.builderState.id,
        title: this.builderState.title,
        templateKey: this.builderState.templateKey,
        locale: this.builderState.locale,
        data: clone(this.builderState.data),
      });
      if (error) {
        throw error;
      }
      const resume = this.normalizeResume(data?.resume);
      const savedAt = resume.lastSavedAt ?? new Date().toISOString();
      this.builderState.autosaveLabel = autosave ? 'Autosaved just now' : 'Saved';
      this.state.lastSavedLabel = savedAt;
      this.state.hasUnsavedChanges = false;
      this.builderState.data = clone(resume.data);
      this.upsertResume(resume);
    } catch (error) {
      console.error('Unable to save resume', error);
      this.builderState.autosaveLabel = 'Save failed';
      if (!autosave) {
        window.alert('Unable to save resume. Please try again.');
      }
    }
  }

  syncTitleWithName(): void {
    const name = this.builderState.data.basics.fullName?.trim();
    if (!name) {
      this.builderState.title = 'Untitled resume';
    } else if (this.builderState.title === 'Untitled resume') {
      this.builderState.title = `${name} — Resume`;
    }
    this.markUnsaved();
  }

  setTemplate(template: TemplateKey): void {
    this.builderState.templateKey = template;
    this.markUnsaved();
  }

  openTemplateGallery(): void {
    window.location.assign('/resume-builder/templates');
  }

  selectTemplateFromGallery(template?: string | null): void {
    if (!template) return;
    if (!resumeTemplateKeys.includes(template as TemplateKey)) {
      window.alert('Template not available.');
      return;
    }
    this.setTemplate(template as TemplateKey);
    window.location.assign('/resume-builder/builder');
  }

  previewTemplate(template?: string | null): void {
    if (!template) return;
    window.alert(`Preview for ${template} template coming soon.`);
  }

  openPlanUpsell(): void {
    window.alert('Plan comparison coming soon.');
  }

  isSectionOpen(section: string): boolean {
    return this.sectionsOpen.has(section);
  }

  toggleSection(section: string): void {
    if (this.sectionsOpen.has(section)) {
      this.sectionsOpen.delete(section);
    } else {
      this.sectionsOpen.add(section);
    }
  }

  addExperience(): void {
    if (this.builderState.data.experience.length >= 20) {
      window.alert('Maximum experience entries reached.');
      return;
    }
    const entry: ResumeExperience = {
      id: crypto.randomUUID(),
      company: '',
      position: '',
      location: '',
      start: '',
      end: '',
      current: false,
      description: '',
    };
    this.builderState.data.experience.push(entry);
    this.markUnsaved();
  }

  removeExperience(index: number): void {
    this.builderState.data.experience.splice(index, 1);
    this.markUnsaved();
  }

  addEducation(): void {
    if (this.builderState.data.education.length >= 20) {
      window.alert('Maximum education entries reached.');
      return;
    }
    const entry: ResumeEducation = {
      id: crypto.randomUUID(),
      school: '',
      degree: '',
      field: '',
      start: '',
      end: '',
      description: '',
    };
    this.builderState.data.education.push(entry);
    this.markUnsaved();
  }

  removeEducation(index: number): void {
    this.builderState.data.education.splice(index, 1);
    this.markUnsaved();
  }

  addLink(): void {
    if (this.builderState.data.links.length >= 20) {
      window.alert('Maximum links reached.');
      return;
    }
    const link: ResumeLink = {
      id: crypto.randomUUID(),
      label: '',
      url: 'https://',
    };
    this.builderState.data.links.push(link);
    this.markUnsaved();
  }

  removeLink(index: number): void {
    this.builderState.data.links.splice(index, 1);
    this.markUnsaved();
  }

  addSkill(): void {
    const name = this.skillDraft.name.trim();
    if (!name) {
      window.alert('Enter a skill name.');
      return;
    }
    if (this.builderState.data.skills.length >= 30) {
      window.alert('Maximum number of skills reached.');
      return;
    }
    const exists = this.builderState.data.skills.some((skill) => skill.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      window.alert('Skill already added.');
      return;
    }
    const skill: ResumeSkill = { name, level: this.skillDraft.level };
    this.builderState.data.skills.push(skill);
    this.skillDraft = { name: '', level: this.skillDraft.level };
    this.markUnsaved();
  }

  removeSkill(index: number): void {
    this.builderState.data.skills.splice(index, 1);
    this.markUnsaved();
  }

  formatSkillLevel(level: SkillLevel): string {
    switch (level) {
      case 'beginner':
        return 'Beginner';
      case 'intermediate':
        return 'Intermediate';
      case 'advanced':
        return 'Advanced';
      case 'expert':
        return 'Expert';
      default:
        return level;
    }
  }

  formatExperienceMeta(item: ResumeExperience): string {
    const company = item.company?.trim();
    const location = item.location?.trim();
    const start = item.start ? this.formatMonthYear(item.start) : null;
    const end = item.current ? 'Present' : item.end ? this.formatMonthYear(item.end) : null;
    const parts = [company, location].filter(Boolean);
    const dates = [start, end].filter(Boolean).join(' – ');
    return [parts.join(' · '), dates].filter(Boolean).join(' · ');
  }

  formatEducationMeta(item: ResumeEducation): string {
    const degree = item.degree?.trim();
    const field = item.field?.trim();
    const start = item.start ? this.formatMonthYear(item.start) : null;
    const end = item.end ? this.formatMonthYear(item.end) : null;
    const qualification = [degree, field].filter(Boolean).join(' · ');
    const dates = [start, end].filter(Boolean).join(' – ');
    return [qualification, dates].filter(Boolean).join(' · ');
  }

  private formatMonthYear(value: string): string {
    if (!value) return '';
    const [year, month] = value.split('-').map((segment) => Number.parseInt(segment, 10));
    if (!year) return value;
    if (!month) return `${year}`;
    const formatter = new Intl.DateTimeFormat(this.builderState.locale, { month: 'short', year: 'numeric' });
    return formatter.format(new Date(year, month - 1));
  }

  formatContactLine(basics: ResumeData['basics']): string {
    const parts = [basics.email, basics.phone, basics.location].map((value) => (value ?? '').trim()).filter(Boolean);
    return parts.join(' • ');
  }

  async requestAiImprove(section: 'summary' | 'experience' | 'skills', index?: number): Promise<void> {
    try {
      let text = '';
      if (section === 'summary') {
        text = this.builderState.data.summary ?? '';
      } else if (section === 'experience') {
        if (typeof index !== 'number') return;
        text = this.builderState.data.experience[index]?.description ?? '';
      } else if (section === 'skills') {
        text = this.builderState.data.skills.map((skill) => skill.name).join(', ');
      }
      const { data, error } = await actions.resume.aiImprove({ text, tone: 'professional' });
      if (error) {
        throw error;
      }
      const suggestion = data?.suggestion ?? '';
      if (section === 'summary') {
        this.builderState.data.summary = suggestion;
      } else if (section === 'experience' && typeof index === 'number') {
        const target = this.builderState.data.experience[index];
        if (target) {
          target.description = suggestion;
        }
      } else if (section === 'skills') {
        const suggestions = suggestion.split(',').map((value) => value.trim()).filter(Boolean);
        suggestions.slice(0, 30).forEach((name) => {
          if (!this.builderState.data.skills.some((skill) => skill.name.toLowerCase() === name.toLowerCase())) {
            this.builderState.data.skills.push({ name, level: 'intermediate' });
          }
        });
      }
      this.markUnsaved();
    } catch (error) {
      console.error('Unable to improve content', error);
      window.alert('AI improve is unavailable at the moment.');
    }
  }

  async requestExport(format: 'pdf' | 'docx' | 'md' | 'html'): Promise<void> {
    if (!this.builderState.id) return;
    try {
      const { data, error } = await actions.resume.export({
        id: this.builderState.id,
        format,
        templateKey: this.builderState.templateKey,
      });
      if (error) {
        throw error;
      }
      window.alert(data?.message ?? `Export ready: ${data?.filePath ?? 'TBD'}`);
    } catch (error) {
      console.error('Unable to export resume', error);
      window.alert('Unable to export resume right now.');
    }
  }
}

export type ResumeStore = ResumeStoreImpl;

Alpine.store('resume', new ResumeStoreImpl());

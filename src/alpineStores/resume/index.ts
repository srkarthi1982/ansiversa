import Alpine from 'alpinejs';
import {
  createBlankResumeDocument,
  createEmptyResumeData,
  resumeTemplateKeys,
  skillLevels,
} from '../../lib/resume/schema';
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

const toISOString = (value?: string | null) => {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  return date.toISOString();
};

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

const loaderStore = () => Alpine.store('loader') as { show?: () => void; hide?: () => void } | undefined;

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
    loaderStore()?.show?.();
    try {
      // Placeholder: use static data until backend is wired.
      const seed = [
        createBlankResumeDocument({
          id: crypto.randomUUID(),
          userId: 'demo-user',
          title: 'Senior Product Designer',
          templateKey: 'modern',
          data: {
            ...createEmptyResumeData(),
            basics: {
              fullName: 'Alex Morgan',
              title: 'Senior Product Designer',
              email: 'alex@example.com',
              phone: '+971 50 000 0000',
              location: 'Dubai, UAE',
            },
            summary: 'Design leader with 8+ years crafting digital products for global teams.',
            experience: [
              {
                id: crypto.randomUUID(),
                company: 'Ansiversa',
                position: 'Lead Product Designer',
                start: '2021-06',
                end: null,
                current: true,
                description: 'Led redesign of AI resume tools, improving conversions by 28%.',
              },
            ],
            skills: [
              { name: 'UX Strategy', level: 'expert' },
              { name: 'Design Systems', level: 'advanced' },
            ],
          },
        }),
        createBlankResumeDocument({
          id: crypto.randomUUID(),
          userId: 'demo-user',
          title: 'Software Engineer — 2025',
          templateKey: 'minimal',
          isDefault: true,
          data: {
            ...createEmptyResumeData(),
            basics: {
              fullName: 'Karthik Ramalingam',
              title: 'Senior Full-Stack Engineer',
              email: 'karthik@example.com',
              phone: '+971 50 123 4567',
              location: 'Chennai, India',
            },
            summary: 'Full-stack engineer driving platform growth with scalable infrastructure and AI experiences.',
            experience: [
              {
                id: crypto.randomUUID(),
                company: 'Ansiversa',
                position: 'Senior Full-Stack Engineer',
                start: '2020-04',
                end: null,
                current: true,
                description: 'Architected quiz and resume mini-apps with Alpine & Astro SSR.',
              },
            ],
            education: [
              {
                id: crypto.randomUUID(),
                school: 'Anna University',
                degree: 'B.E. Computer Science',
                start: '2012-08',
                end: '2016-05',
                description: 'Graduated with First Class Distinction.',
              },
            ],
            skills: [
              { name: 'TypeScript', level: 'expert' },
              { name: 'Astro', level: 'advanced' },
              { name: 'Node.js', level: 'advanced' },
            ],
          },
        }),
      ];

      const withTimestamps: ResumeListItem[] = seed.map((doc, index) => ({
        ...doc,
        lastSavedAt: toISOString(new Date(Date.now() - index * 1000 * 60 * 60).toISOString()),
      }));

      this.state.resumes = withTimestamps;
      this.applyFilters();
      this.state.lastSavedLabel = withTimestamps[0]?.lastSavedAt ?? null;
    } finally {
      this.state.loading = false;
      loaderStore()?.hide?.();
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
    loaderStore()?.show?.();
    try {
      const response = await fetch('/resume/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateKey: 'modern' }),
      });
      if (!response.ok) {
        throw new Error(`Failed to create resume (${response.status})`);
      }
      const data = (await response.json()) as { id: string; title?: string; templateKey?: TemplateKey };
      this.state.resumes.unshift(
        createBlankResumeDocument({
          id: data.id,
          userId: 'demo-user',
          title: data.title ?? 'Untitled resume',
          templateKey: data.templateKey ?? 'modern',
        }),
      );
      this.state.resumes[0].lastSavedAt = new Date().toISOString();
      this.applyFilters();
      window.location.assign(`/resume/builder?id=${data.id}`);
    } catch (error) {
      console.error('Unable to create resume', error);
      window.alert('Unable to create resume. Please try again.');
    } finally {
      loaderStore()?.hide?.();
    }
  }

  async duplicate(id: string): Promise<void> {
    try {
      const source = this.state.resumes.find((item) => item.id === id);
      if (!source) {
        throw new Error('Resume not found');
      }
      const response = await fetch('/resume/api/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title: source.title }),
      });
      if (!response.ok) {
        throw new Error(`Failed to duplicate resume (${response.status})`);
      }
      const data = (await response.json()) as { id: string; title: string };
      const clone: ResumeListItem = {
        ...source,
        id: data.id,
        title: data.title,
        lastSavedAt: new Date().toISOString(),
        isDefault: false,
      };
      this.state.resumes.unshift(clone);
      this.applyFilters();
    } catch (error) {
      console.error('Unable to duplicate resume', error);
      window.alert('Unable to duplicate resume right now.');
    }
  }

  async requestDelete(id: string): Promise<void> {
    const confirmDelete = window.confirm('Are you sure you want to delete this resume?');
    if (!confirmDelete) return;
    try {
      const response = await fetch('/resume/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        throw new Error(`Failed to delete (${response.status})`);
      }
      this.state.resumes = this.state.resumes.filter((item) => item.id !== id);
      this.applyFilters();
    } catch (error) {
      console.error('Unable to delete resume', error);
      window.alert('Unable to delete resume right now.');
    }
  }

  toggleDefault(id: string): void {
    const updated = this.state.resumes.map((resume) => ({
      ...resume,
      isDefault: resume.id === id ? !resume.isDefault : false,
    }));
    this.state.resumes = updated;
    this.applyFilters();
  }

  async initBuilder({ id }: BuilderInitInput = {}): Promise<void> {
    if (this.builderState.loading) return;
    this.builderState.loading = true;
    loaderStore()?.show?.();
    try {
      let target: ResumeListItem | undefined;
      if (id) {
        target = this.state.resumes.find((item) => item.id === id);
      }
      if (!target) {
        const created = createBlankResumeDocument({
          id: id ?? crypto.randomUUID(),
          userId: 'demo-user',
        });
        target = { ...created, lastSavedAt: created.lastSavedAt ?? new Date().toISOString() };
        this.state.resumes.unshift(target);
        this.applyFilters();
      }

      this.builderState = {
        id: target.id,
        title: target.title,
        templateKey: target.templateKey,
        locale: target.locale,
        status: target.status,
        data: JSON.parse(JSON.stringify(target.data)) as ResumeData,
        autosaveLabel: null,
        loading: false,
      };

      this.state.hasUnsavedChanges = false;
      this.state.lastSavedLabel = target.lastSavedAt;
      this.sectionsOpen = new Set(['basics', 'experience', 'education', 'skills']);
    } finally {
      this.builderState.loading = false;
      loaderStore()?.hide?.();
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
      const payload = {
        id: this.builderState.id,
        data: this.builderState.data,
        templateKey: this.builderState.templateKey,
        locale: this.builderState.locale,
        autosave,
      };

      const response = await fetch('/resume/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Failed to save resume (${response.status})`);
      }

      const data = (await response.json()) as { savedAt: string };
      const savedAt = data.savedAt ?? new Date().toISOString();
      this.builderState.autosaveLabel = autosave ? 'Autosaved just now' : 'Saved';
      this.state.lastSavedLabel = savedAt;
      this.state.hasUnsavedChanges = false;

      const index = this.state.resumes.findIndex((item) => item.id === this.builderState.id);
      if (index !== -1) {
        const updated: ResumeListItem = {
          ...this.state.resumes[index],
          title: this.builderState.title,
          templateKey: this.builderState.templateKey,
          locale: this.builderState.locale,
          data: JSON.parse(JSON.stringify(this.builderState.data)),
          lastSavedAt: savedAt,
        };
        this.state.resumes.splice(index, 1, updated);
        this.applyFilters();
      }
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
    window.location.assign('/resume/templates');
  }

  selectTemplateFromGallery(template?: string | null): void {
    if (!template) return;
    if (!resumeTemplateKeys.includes(template as TemplateKey)) {
      window.alert('Template not available.');
      return;
    }
    this.setTemplate(template as TemplateKey);
    window.location.assign('/resume/builder');
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
      const response = await fetch('/resume/api/ai-improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, tone: 'professional' }),
      });
      if (!response.ok) {
        throw new Error(`AI improve failed (${response.status})`);
      }
      const data = (await response.json()) as { suggestion: string };
      if (section === 'summary') {
        this.builderState.data.summary = data.suggestion;
      } else if (section === 'experience' && typeof index === 'number') {
        const target = this.builderState.data.experience[index];
        if (target) {
          target.description = data.suggestion;
        }
      } else if (section === 'skills') {
        const suggestions = data.suggestion.split(',').map((value) => value.trim()).filter(Boolean);
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
      const response = await fetch('/resume/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: this.builderState.id,
          format,
          templateKey: this.builderState.templateKey,
        }),
      });
      if (!response.ok) {
        throw new Error(`Export failed (${response.status})`);
      }
      const data = (await response.json()) as { filePath?: string; message?: string };
      window.alert(data.message ?? `Export ready: ${data.filePath ?? 'TBD'}`);
    } catch (error) {
      console.error('Unable to export resume', error);
      window.alert('Unable to export resume right now.');
    }
  }
}

export type ResumeStore = ResumeStoreImpl;

Alpine.store('resume', new ResumeStoreImpl());

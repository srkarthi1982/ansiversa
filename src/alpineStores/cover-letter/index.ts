import Alpine from 'alpinejs';
import { actions } from 'astro:actions';
import type { CoverLetterDocument, CoverLetterPrompts } from '../../lib/coverLetter/schema';
import { createEmptyPrompts } from '../../lib/coverLetter/schema';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

type Plan = 'free' | 'pro' | 'elite';

type CoverLetterListItem = CoverLetterDocument & {
  lastSavedAt: string | null;
};

type AutosaveTimer = ReturnType<typeof setTimeout> | null;

type TemplateOption = {
  key: CoverLetterDocument['templateKey'];
  label: string;
  description: string;
  icon: string;
  plan: 'free' | 'pro';
};

const templateOptions: TemplateOption[] = [
  {
    key: 'minimal',
    label: 'Minimal',
    description: 'Clean typography with left-aligned paragraphs.',
    icon: 'fas fa-align-left',
    plan: 'free',
  },
  {
    key: 'classic',
    label: 'Classic',
    description: 'Traditional serif header and structured sections.',
    icon: 'fas fa-briefcase',
    plan: 'pro',
  },
  {
    key: 'bold',
    label: 'Bold Accent',
    description: 'Color accents and strong emphasis for stand-out applications.',
    icon: 'fas fa-bolt',
    plan: 'pro',
  },
];

const loaderStore = () => Alpine.store('loader') as { show?: () => void; hide?: () => void } | undefined;

class CoverLetterStoreImpl {
  state = {
    loading: false,
    letters: [] as CoverLetterListItem[],
    plan: 'free' as Plan,
    aiUsage: { used: 0, limit: 3 },
    hasUnsavedChanges: false,
  };

  editor = {
    id: null as string | null,
    loading: false,
    title: 'Untitled cover letter',
    role: '',
    company: '',
    greeting: 'Dear Hiring Manager',
    tone: 'professional' as CoverLetterDocument['tone'],
    length: 'medium' as CoverLetterDocument['length'],
    templateKey: 'minimal' as CoverLetterDocument['templateKey'],
    body: '',
    prompts: createEmptyPrompts(),
    status: 'draft' as CoverLetterDocument['status'],
    autosaveLabel: null as string | null,
    aiStatus: null as string | null,
  };

  private autosaveTimer: AutosaveTimer = null;

  templates = templateOptions;

  tones: Array<{ value: CoverLetterDocument['tone']; label: string; icon: string }> = [
    { value: 'professional', label: 'Professional', icon: 'fas fa-briefcase' },
    { value: 'confident', label: 'Confident', icon: 'fas fa-fire' },
    { value: 'friendly', label: 'Friendly', icon: 'fas fa-handshake' },
  ];

  lengths: Array<{ value: CoverLetterDocument['length']; label: string }> = [
    { value: 'short', label: 'Short (2 paragraphs)' },
    { value: 'medium', label: 'Medium (3 paragraphs)' },
    { value: 'long', label: 'Long (4+ paragraphs)' },
  ];

  onInit(location: Location) {
    const path = location.pathname;
    if (path.includes('/cover-letter-writer/editor')) {
      const id = new URL(location.href).searchParams.get('id');
      void this.initEditor({ id });
    } else if (path.includes('/cover-letter-writer/templates')) {
      this.ensureList();
    } else if (path.includes('/cover-letter-writer')) {
      this.ensureList();
    }
  }

  get plan(): Plan {
    return this.state.plan;
  }

  get isFreePlan(): boolean {
    return this.plan === 'free';
  }

  get letters(): CoverLetterListItem[] {
    return this.state.letters;
  }

  get aiUsage() {
    return this.state.aiUsage;
  }

  get preview() {
    const greeting = this.editor.greeting?.trim() || 'Dear Hiring Manager';
    const closing = this.editor.prompts.closing?.trim() || 'Thank you for your consideration.';
    const title = this.editor.title?.trim() || 'Untitled cover letter';
    const signature = (() => {
      const withoutSuffix = title.replace(/cover letter/i, '').trim();
      if (withoutSuffix) {
        return `Sincerely,\n${withoutSuffix}`;
      }
      return 'Sincerely,\nYour Name';
    })();

    let paragraphs: string[] = [];
    if (this.editor.body && this.editor.body.trim().length > 0) {
      paragraphs = this.editor.body
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
    } else {
      if (this.editor.prompts.introduction) {
        paragraphs.push(this.editor.prompts.introduction.trim());
      }
      if (this.editor.prompts.motivation) {
        paragraphs.push(this.editor.prompts.motivation.trim());
      }
      if (this.editor.prompts.valueProps.length > 0) {
        paragraphs.push(
          `Key strengths: ${this.editor.prompts.valueProps.map((value) => value.trim()).filter(Boolean).join(', ')}`,
        );
      }
      const achievements = this.editor.prompts.achievements
        .map((achievement) =>
          [achievement.headline, achievement.metric, achievement.description]
            .map((value) => (value ?? '').trim())
            .filter(Boolean)
            .join(' — '),
        )
        .filter(Boolean);
      if (achievements.length > 0) {
        paragraphs.push(`Highlights: ${achievements.join('; ')}`);
      }
    }

    if (paragraphs.length === 0) {
      paragraphs.push('Start composing your pitch with the prompts on the left.');
    }

    return {
      title,
      greeting,
      paragraphs,
      closing,
      signature,
    };
  }

  ensureList(): void {
    if (!this.state.loading && this.state.letters.length === 0) {
      void this.loadList();
    }
  }

  private normalizeLetter(input: any): CoverLetterListItem {
    const item: CoverLetterListItem = {
      id: String(input?.id ?? crypto.randomUUID()),
      userId: String(input?.userId ?? ''),
      title: String(input?.title ?? 'Untitled cover letter'),
      role: String(input?.role ?? ''),
      company: String(input?.company ?? ''),
      greeting: String(input?.greeting ?? 'Dear Hiring Manager'),
      tone: (input?.tone ?? 'professional') as CoverLetterDocument['tone'],
      length: (input?.length ?? 'medium') as CoverLetterDocument['length'],
      templateKey: (input?.templateKey ?? 'minimal') as CoverLetterDocument['templateKey'],
      body: String(input?.body ?? ''),
      prompts: clone(input?.prompts ?? createEmptyPrompts()) as CoverLetterPrompts,
      status: (input?.status ?? 'draft') as CoverLetterDocument['status'],
      lastSavedAt: input?.lastSavedAt ?? new Date().toISOString(),
      createdAt: input?.createdAt ?? new Date().toISOString(),
    };
    return item;
  }

  private upsertLetter(item: CoverLetterListItem): void {
    const index = this.state.letters.findIndex((letter) => letter.id === item.id);
    if (index === -1) {
      this.state.letters.unshift(item);
    } else {
      this.state.letters.splice(index, 1, item);
    }
  }

  async loadList(): Promise<void> {
    if (this.state.loading) return;
    this.state.loading = true;
    loaderStore()?.show?.();
    try {
      const { data, error } = await actions.coverLetter.list({});
      if (error) throw error;
      const plan = (data?.plan as Plan | undefined) ?? 'free';
      this.state.plan = plan;
      const usage = data?.aiUsage as { used?: number; limit?: number } | undefined;
      this.state.aiUsage = {
        used: usage?.used ?? 0,
        limit: usage?.limit ?? (plan === 'free' ? 3 : plan === 'pro' ? 20 : 9999),
      };
      const items = Array.isArray(data?.items) ? data!.items : [];
      this.state.letters = items.map((item: any) => this.normalizeLetter(item));
    } catch (error) {
      console.error('Unable to load cover letters', error);
      this.state.letters = [];
    } finally {
      this.state.loading = false;
      loaderStore()?.hide?.();
    }
  }

  async createLetter(): Promise<void> {
    try {
      const { data, error } = await actions.coverLetter.create({});
      if (error) throw error;
      const letter = this.normalizeLetter(data?.letter);
      this.upsertLetter(letter);
      window.location.assign(`/cover-letter-writer/editor?id=${letter.id}`);
    } catch (error) {
      console.error('Unable to create cover letter', error);
      window.alert('Unable to create a cover letter right now.');
    }
  }

  async duplicateLetter(id: string): Promise<void> {
    try {
      const { data, error } = await actions.coverLetter.duplicate({ id });
      if (error) throw error;
      const letter = this.normalizeLetter(data?.letter);
      this.upsertLetter(letter);
      window.alert('Cover letter duplicated.');
    } catch (error) {
      console.error('Unable to duplicate letter', error);
      window.alert('Unable to duplicate this cover letter.');
    }
  }

  async deleteLetter(id: string): Promise<void> {
    if (!window.confirm('Delete this cover letter? This action cannot be undone.')) {
      return;
    }
    try {
      const { error } = await actions.coverLetter.delete({ id });
      if (error) throw error;
      this.state.letters = this.state.letters.filter((letter) => letter.id !== id);
      window.alert('Cover letter deleted.');
    } catch (error) {
      console.error('Unable to delete letter', error);
      window.alert('Unable to delete this cover letter right now.');
    }
  }

  async initEditor({ id }: { id?: string | null } = {}): Promise<void> {
    if (this.editor.loading) return;
    this.editor.loading = true;
    loaderStore()?.show?.();
    try {
      if (this.state.letters.length === 0 && !this.state.loading) {
        await this.loadList();
        loaderStore()?.show?.();
      }

      let target: CoverLetterListItem | undefined = id
        ? this.state.letters.find((letter) => letter.id === id)
        : undefined;

      const shouldReplaceUrl = !id;

      if (!target && id) {
        const { data, error } = await actions.coverLetter.get({ id });
        if (error) throw error;
        target = this.normalizeLetter(data?.letter);
        this.upsertLetter(target);
      }

      if (!target) {
        const { data, error } = await actions.coverLetter.create({});
        if (error) throw error;
        target = this.normalizeLetter(data?.letter);
        this.upsertLetter(target);
      }

      if (target && shouldReplaceUrl) {
        window.history.replaceState({}, '', `/cover-letter-writer/editor?id=${target.id}`);
      }

      this.editor = {
        id: target?.id ?? null,
        loading: false,
        title: target?.title ?? 'Untitled cover letter',
        role: target?.role ?? '',
        company: target?.company ?? '',
        greeting: target?.greeting ?? 'Dear Hiring Manager',
        tone: target?.tone ?? 'professional',
        length: target?.length ?? 'medium',
        templateKey: target?.templateKey ?? 'minimal',
        body: target?.body ?? '',
        prompts: clone(target?.prompts ?? createEmptyPrompts()),
        status: target?.status ?? 'draft',
        autosaveLabel: null,
        aiStatus: null,
      };
      this.state.hasUnsavedChanges = false;
    } catch (error) {
      console.error('Unable to load cover letter', error);
      window.alert('Unable to load this cover letter right now.');
    } finally {
      this.editor.loading = false;
      loaderStore()?.hide?.();
    }
  }

  markUnsaved(): void {
    this.state.hasUnsavedChanges = true;
    this.editor.autosaveLabel = 'Pending autosave…';
    this.scheduleAutosave();
  }

  private scheduleAutosave(): void {
    if (this.autosaveTimer) {
      clearTimeout(this.autosaveTimer);
    }
    this.autosaveTimer = setTimeout(() => {
      void this.saveNow(true);
    }, 2000);
  }

  async saveNow(autosave = false): Promise<void> {
    if (!this.editor.id) return;
    if (this.autosaveTimer) {
      clearTimeout(this.autosaveTimer);
      this.autosaveTimer = null;
    }

    try {
      this.editor.autosaveLabel = autosave ? 'Autosaving…' : 'Saving…';
      const { data, error } = await actions.coverLetter.save({
        id: this.editor.id,
        title: this.editor.title,
        role: this.editor.role,
        company: this.editor.company,
        greeting: this.editor.greeting,
        tone: this.editor.tone,
        length: this.editor.length,
        templateKey: this.editor.templateKey,
        body: this.editor.body,
        status: this.editor.status,
        prompts: clone(this.editor.prompts),
      });
      if (error) throw error;
      const letter = this.normalizeLetter(data?.letter);
      this.upsertLetter(letter);
      this.editor.autosaveLabel = autosave ? 'Autosaved just now' : 'Saved';
      this.state.hasUnsavedChanges = false;
    } catch (error) {
      console.error('Unable to save cover letter', error);
      this.editor.autosaveLabel = 'Save failed';
      if (!autosave) {
        window.alert('Unable to save cover letter. Please try again.');
      }
    }
  }

  async composeNow(): Promise<void> {
    if (!this.editor.id) return;
    if (this.state.aiUsage.used >= this.state.aiUsage.limit) {
      window.alert('Daily AI compose limit reached. Upgrade to Pro for unlimited writes.');
      return;
    }
    try {
      this.editor.aiStatus = 'Composing…';
      const { data, error } = await actions.coverLetter.compose({
        id: this.editor.id,
        prompts: clone(this.editor.prompts),
        tone: this.editor.tone,
        length: this.editor.length,
      });
      if (error) throw error;
      const letter = this.normalizeLetter(data?.letter);
      this.editor.body = letter.body;
      this.editor.prompts = clone(letter.prompts);
      this.upsertLetter(letter);
      const usage = data?.usage as { used?: number; limit?: number } | undefined;
      if (usage) {
        this.state.aiUsage = {
          used: usage.used ?? this.state.aiUsage.used + 1,
          limit: usage.limit ?? this.state.aiUsage.limit,
        };
      } else {
        this.state.aiUsage = { ...this.state.aiUsage, used: this.state.aiUsage.used + 1 };
      }
      this.editor.autosaveLabel = 'Autosaved just now';
      this.state.hasUnsavedChanges = false;
    } catch (error) {
      console.error('Unable to compose cover letter', error);
      window.alert('AI compose is unavailable right now.');
    } finally {
      this.editor.aiStatus = null;
    }
  }

  async requestExport(format: 'pdf' | 'docx' | 'md' | 'txt'): Promise<void> {
    if (!this.editor.id) return;
    try {
      const { data, error } = await actions.coverLetter.export({ id: this.editor.id, format });
      if (error) throw error;
      const file = data?.file as { filename?: string; mimeType?: string; data?: string } | undefined;
      if (file?.filename && file?.mimeType && file?.data) {
        this.triggerDownload(file as { filename: string; mimeType: string; data: string });
        if (data?.message) {
          window.alert(data.message);
        }
      } else {
        window.alert('Export generated.');
      }
    } catch (error) {
      console.error('Unable to export cover letter', error);
      window.alert('Unable to export this cover letter.');
    }
  }

  private triggerDownload(file: { filename: string; mimeType: string; data: string }): void {
    try {
      const binary = atob(file.data);
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
      }
      const blob = new Blob([bytes], { type: file.mimeType });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = file.filename;
      anchor.rel = 'noopener';
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      setTimeout(() => {
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
      }, 0);
    } catch (error) {
      console.error('Download failed', error);
      window.alert('Export generated, but download could not start automatically.');
    }
  }

  canUseTemplate(template: CoverLetterDocument['templateKey']): boolean {
    if (this.isFreePlan) {
      return template === 'minimal';
    }
    return true;
  }

  setTemplate(template: CoverLetterDocument['templateKey']): void {
    if (!this.canUseTemplate(template)) {
      this.openPlanUpsell();
      return;
    }
    this.editor.templateKey = template;
    this.markUnsaved();
  }

  openTemplateGallery(): void {
    window.location.assign('/cover-letter-writer/templates');
  }

  selectTemplateFromGallery(template?: string | null): void {
    if (!template) return;
    if (!this.canUseTemplate(template as CoverLetterDocument['templateKey'])) {
      this.openPlanUpsell();
      return;
    }
    this.editor.templateKey = template as CoverLetterDocument['templateKey'];
    window.location.assign('/cover-letter-writer/editor');
  }

  previewTemplate(template?: string | null): void {
    if (!template) return;
    window.alert(`Preview for ${template} template coming soon.`);
  }

  openPlanUpsell(): void {
    window.alert('Upgrade to Pro to unlock premium templates, unlimited AI composes, and watermark-free exports.');
  }

  updatePromptField(field: keyof CoverLetterPrompts, value: any): void {
    (this.editor.prompts as any)[field] = value;
    this.markUnsaved();
  }

  addValueProp(): void {
    if (this.editor.prompts.valueProps.length >= 8) {
      window.alert('Maximum value propositions reached.');
      return;
    }
    this.editor.prompts.valueProps.push('');
    this.markUnsaved();
  }

  removeValueProp(index: number): void {
    this.editor.prompts.valueProps.splice(index, 1);
    this.markUnsaved();
  }

  addAchievement(): void {
    if (this.editor.prompts.achievements.length >= 6) {
      window.alert('Maximum achievements reached.');
      return;
    }
    this.editor.prompts.achievements.push({ headline: '', metric: '', description: '' });
    this.markUnsaved();
  }

  removeAchievement(index: number): void {
    this.editor.prompts.achievements.splice(index, 1);
    this.markUnsaved();
  }

  async insertFromResume(): Promise<void> {
    try {
      const { data, error } = await actions.resume.list({});
      if (error) throw error;
      const items = Array.isArray(data?.items) ? data!.items : [];
      if (items.length === 0) {
        window.alert('No resumes available to import.');
        return;
      }
      const resume = items[0];
      const basics = resume?.data?.basics ?? {};
      const summary = resume?.data?.summary ?? '';
      const experiences = Array.isArray(resume?.data?.experience) ? resume.data.experience : [];
      const achievements = experiences
        .flatMap((experience: any) => {
          const bullet = experience?.description ?? '';
          if (!bullet) return [];
          return [
            {
              headline: experience?.position ?? experience?.company ?? '',
              metric: experience?.start && experience?.end ? `${experience.start} – ${experience.end}` : '',
              description: bullet,
            },
          ];
        })
        .slice(0, 3);

      this.editor.prompts.introduction = summary
        ? summary
        : `Hello, my name is ${basics.fullName ?? '...'}.`;
      this.editor.prompts.valueProps = achievements.length > 0
        ? achievements.map((item) => item.description).filter(Boolean).slice(0, 3)
        : this.editor.prompts.valueProps;
      this.editor.prompts.achievements = achievements;
      this.markUnsaved();
      window.alert('Resume highlights inserted. Adjust the prompts before composing.');
    } catch (error) {
      console.error('Unable to import from resume', error);
      window.alert('Unable to pull resume data right now.');
    }
  }
}

export type CoverLetterStore = CoverLetterStoreImpl;

Alpine.store('cover-letter-writer', new CoverLetterStoreImpl());

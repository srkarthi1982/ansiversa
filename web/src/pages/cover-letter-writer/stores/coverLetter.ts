import Alpine from 'alpinejs';
import { actions } from 'astro:actions';
import { BaseStore, clone } from '../../../alpineStores/base';
import {
  coverLetterToneLabels,
  coverLetterTemplateLabels,
  coverLetterTemplateKeys,
  coverLetterTones,
  parseListInput,
  type CoverLetterRecord,
  type CoverLetterTemplateKey,
  type CoverLetterTone,
} from '../../../lib/cover-letter-writer/schema';

const resolveActions = () => {
  const registry = actions as unknown as Record<string, any>;
  return (registry.coverLetter ?? registry['cover-letter-writer'] ?? registry['cover-letter']) as Record<string, any>;
};

type Toast = { type: 'success' | 'error'; message: string } | null;

type UsageStats = { inputTokens: number; outputTokens: number } | null;

type EditorState = {
  title: string;
  position: string;
  company: string;
  intro: string;
  skillsInput: string;
  achievementsInput: string;
  tone: CoverLetterTone;
  templateKey: CoverLetterTemplateKey;
  content: string;
  loading: boolean;
  toast: Toast;
  lastSavedId: string | null;
  lastSource: string | null;
  usage: UsageStats;
};

type ListState = {
  items: CoverLetterRecord[];
  loading: boolean;
};

type ExportState = {
  loading: boolean;
  format: 'pdf' | 'docx' | 'txt';
  toast: Toast;
};

const defaultEditor = (): EditorState => ({
  title: 'Untitled cover letter',
  position: '',
  company: '',
  intro: '',
  skillsInput: '',
  achievementsInput: '',
  tone: 'formal',
  templateKey: 'formal',
  content: '',
  loading: false,
  toast: null,
  lastSavedId: null,
  lastSource: null,
  usage: null,
});

const defaultList = (): ListState => ({
  items: [],
  loading: false,
});

const defaultExportState = (): ExportState => ({
  loading: false,
  format: 'pdf',
  toast: null,
});

const coverLetterActions = resolveActions();

class CoverLetterStore extends BaseStore {
  private initialized = false;
  editor = defaultEditor();
  list: ListState = defaultList();
  exportState: ExportState = defaultExportState();

  get toneOptions() {
    return coverLetterTones.map((tone) => ({
      value: tone,
      label: coverLetterToneLabels[tone],
    }));
  }

  get templateOptions() {
    return coverLetterTemplateKeys.map((template) => ({
      value: template,
      label: coverLetterTemplateLabels[template],
    }));
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;
    void this.loadLetters();
  }

  private resetToast(timerField: 'toast' | 'exportToast') {
    setTimeout(() => {
      if (timerField === 'toast') {
        this.editor.toast = null;
      } else {
        this.exportState.toast = null;
      }
    }, 3200);
  }

  private setEditorToast(type: 'success' | 'error', message: string) {
    this.editor.toast = { type, message };
    this.resetToast('toast');
  }

  private setExportToast(type: 'success' | 'error', message: string) {
    this.exportState.toast = { type, message };
    this.resetToast('exportToast');
  }

  private upsertLetter(letter: CoverLetterRecord) {
    const existingIndex = this.list.items.findIndex((item) => item.id === letter.id);
    if (existingIndex === -1) {
      this.list.items.unshift(letter);
    } else {
      this.list.items.splice(existingIndex, 1, letter);
    }
  }

  async loadLetters() {
    if (this.list.loading) return;
    this.list.loading = true;
    this.setLoaderVisible(true);
    try {
      const { data, error } = await coverLetterActions.list({});
      if (error) throw error;
      const items = (data?.items ?? []) as CoverLetterRecord[];
      this.list.items = items;
    } catch (error) {
      console.error('Unable to load cover letters', error);
      this.list.items = [];
    } finally {
      this.list.loading = false;
      this.setLoaderVisible(false);
    }
  }

  resetEditor() {
    this.editor = defaultEditor();
  }

  private collectSkills() {
    return parseListInput(this.editor.skillsInput);
  }

  private collectAchievements() {
    return parseListInput(this.editor.achievementsInput);
  }

  updateTone(tone: CoverLetterTone) {
    this.editor.tone = tone;
  }

  updateTemplate(template: CoverLetterTemplateKey) {
    this.editor.templateKey = template;
  }

  private ensureTitle() {
    if (this.editor.title.trim()) return;
    const parts = [this.editor.position.trim(), this.editor.company.trim()].filter(Boolean);
    if (parts.length) {
      this.editor.title = `${parts.join(' at ')}`;
    }
  }

  async generateLetter() {
    if (this.editor.loading) return;
    this.editor.loading = true;
    this.editor.toast = null;
    try {
      this.ensureTitle();
      const payload = {
        position: this.editor.position.trim(),
        company: this.editor.company.trim(),
        intro: this.editor.intro.trim(),
        skills: this.collectSkills(),
        achievements: this.collectAchievements(),
        tone: this.editor.tone,
        templateKey: this.editor.templateKey,
      };
      if (!payload.position || !payload.company) {
        throw new Error('Please provide both the position and company.');
      }
      const { data, error } = await coverLetterActions.generate(payload);
      if (error) throw error;
      const result = data ?? {};
      this.editor.content = String(result.letter ?? '');
      this.editor.lastSource = result.metadata?.source ?? null;
      this.editor.usage = clone(result.metadata?.usage ?? null);
      this.editor.toast = { type: 'success', message: 'New draft ready.' };
      this.resetToast('toast');
    } catch (error) {
      console.error('Failed to generate cover letter', error);
      this.setEditorToast('error',
        error instanceof Error ? error.message : 'Unable to generate letter. Please refine your inputs.',
      );
    } finally {
      this.editor.loading = false;
    }
  }

  async improveLetter(focus?: string) {
    if (this.editor.loading || !this.editor.content.trim()) {
      this.setEditorToast('error', 'Generate or paste a letter before improving it.');
      return;
    }
    this.editor.loading = true;
    try {
      const payload = {
        content: this.editor.content,
        tone: this.editor.tone,
        focus: focus?.trim() || undefined,
      };
      const { data, error } = await coverLetterActions.improve(payload);
      if (error) throw error;
      const result = data ?? {};
      this.editor.content = String(result.letter ?? '');
      this.editor.lastSource = result.metadata?.source ?? null;
      this.editor.usage = clone(result.metadata?.usage ?? null);
      this.setEditorToast('success', 'Letter polished successfully.');
    } catch (error) {
      console.error('Failed to improve cover letter', error);
      this.setEditorToast('error', 'We could not improve the letter. Try again later.');
    } finally {
      this.editor.loading = false;
    }
  }

  async rewriteTone(tone: CoverLetterTone) {
    if (this.editor.loading || !this.editor.content.trim()) {
      this.setEditorToast('error', 'Generate or paste a letter before rewriting it.');
      return;
    }
    this.editor.loading = true;
    try {
      const payload = {
        content: this.editor.content,
        tone,
      };
      const { data, error } = await coverLetterActions.rewriteTone(payload);
      if (error) throw error;
      const result = data ?? {};
      this.editor.content = String(result.letter ?? '');
      this.editor.tone = tone;
      this.editor.lastSource = result.metadata?.source ?? null;
      this.editor.usage = clone(result.metadata?.usage ?? null);
      this.setEditorToast('success', `Tone updated to ${coverLetterToneLabels[tone]}.`);
    } catch (error) {
      console.error('Failed to rewrite cover letter tone', error);
      this.setEditorToast('error', 'Tone rewrite failed. Try a different tone.');
    } finally {
      this.editor.loading = false;
    }
  }

  async saveLetter() {
    if (!this.editor.content.trim()) {
      this.setEditorToast('error', 'There is no content to save yet.');
      return;
    }
    this.editor.loading = true;
    try {
      this.ensureTitle();
      const payload = {
        id: this.editor.lastSavedId ?? undefined,
        title: this.editor.title.trim(),
        content: this.editor.content,
        tone: this.editor.tone,
        templateKey: this.editor.templateKey,
      };
      const { data, error } = await coverLetterActions.save(payload);
      if (error) throw error;
      const record = data?.letter as CoverLetterRecord | undefined;
      if (record) {
        this.editor.lastSavedId = record.id;
        this.upsertLetter(record);
      }
      this.setEditorToast('success', 'Cover letter saved to your library.');
    } catch (error) {
      console.error('Failed to save cover letter', error);
      this.setEditorToast('error', 'Unable to save right now. Please try again.');
    } finally {
      this.editor.loading = false;
    }
  }

  async exportLetter(format: 'pdf' | 'docx' | 'txt') {
    if (!this.editor.lastSavedId) {
      this.setExportToast('error', 'Save the cover letter before exporting.');
      return;
    }
    if (this.exportState.loading) return;
    this.exportState.loading = true;
    this.exportState.format = format;
    try {
      const { data, error } = await coverLetterActions.export({
        id: this.editor.lastSavedId,
        format,
      });
      if (error) throw error;
      const message = data?.message ?? 'Export requested.';
      this.setExportToast('success', message);
    } catch (error) {
      console.error('Failed to export cover letter', error);
      this.setExportToast('error', 'Export failed. Please try again later.');
    } finally {
      this.exportState.loading = false;
    }
  }

  selectLetter(id: string) {
    const letter = this.list.items.find((item) => item.id === id);
    if (!letter) return;
    this.editor = {
      ...defaultEditor(),
      title: letter.title,
      tone: letter.tone,
      templateKey: letter.templateKey,
      content: letter.content,
      lastSavedId: letter.id,
      lastSource: 'library',
    };
    this.setEditorToast('success', 'Loaded cover letter from your library.');
  }

  async copyLetter() {
    if (!this.editor.content.trim()) {
      this.setEditorToast('error', 'Nothing to copy yet.');
      return;
    }
    try {
      await navigator.clipboard.writeText(this.editor.content);
      this.setEditorToast('success', 'Copied to clipboard.');
    } catch (error) {
      console.error('Clipboard write failed', error);
      this.setEditorToast('error', 'Unable to copy to clipboard in this browser.');
    }
  }
}

Alpine.store('coverLetter', new CoverLetterStore());

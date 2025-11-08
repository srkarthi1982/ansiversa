import Alpine from 'alpinejs';
import { BaseStore, clone } from '../../../alpineStores/base';
import { actions } from 'astro:actions';
import type {
  EmailDraft,
  EmailTemplate,
  EmailTone,
  EmailFormality,
  EmailRewriteMode,
  EmailTranslateTarget,
} from '../../../lib/email/schema';
import {
  defaultEmailVariables,
  toneLabels,
  formalityLabels,
  supportedLanguages,
} from '../../../lib/email/schema';
import { wordCount, charCount } from '../../../lib/text';

const emailActions = actions['email-polisher'];

type ToastState = { message: string; type: 'success' | 'error' } | null;

type QuickState = {
  title: string;
  subject: string;
  input: string;
  output: string;
  tone: EmailTone;
  formality: EmailFormality;
  language: string;
  needSubject: boolean;
  signatureEnabled: boolean;
  ephemeral: boolean;
  variables: Record<string, string>;
  loading: boolean;
  error: string | null;
  lastAction: 'polish' | 'rewrite' | 'translate' | null;
};

type ReplyState = {
  incoming: string;
  tone: EmailTone;
  relationship: 'new' | 'existing';
  urgency: 'low' | 'normal' | 'high';
  variants: number;
  loading: boolean;
  replies: Array<{ subject: string; body: string }>;
  error: string | null;
};

type SummaryState = {
  thread: string;
  includeActions: boolean;
  includeQuestions: boolean;
  loading: boolean;
  result: {
    bullets: string[];
    actionItems: Array<{ id: string; task: string; owner: string | null; due: string | null }>;
    openQuestions: string[];
    suggestedSubject: string;
  } | null;
  error: string | null;
};

type TranslateState = {
  target: EmailTranslateTarget;
  preserveTone: boolean;
  loading: boolean;
  output: string;
  error: string | null;
};

type DraftCollection = {
  items: EmailDraft[];
  activeId: string | null;
  loading: boolean;
};

type TemplateCollection = {
  items: EmailTemplate[];
  loading: boolean;
  category: string;
};

const defaultQuickState = (): QuickState => ({
  title: 'Untitled email',
  subject: '',
  input: '',
  output: '',
  tone: 'professional',
  formality: 'medium',
  language: 'en',
  needSubject: true,
  signatureEnabled: true,
  ephemeral: false,
  variables: clone(defaultEmailVariables),
  loading: false,
  error: null,
  lastAction: null,
});

class EmailStore extends BaseStore {
  plan: 'free' | 'pro' = 'free';
  toast: ToastState = null;

  quick: QuickState = defaultQuickState();
  reply: ReplyState = {
    incoming: '',
    tone: 'professional',
    relationship: 'existing',
    urgency: 'normal',
    variants: 3,
    loading: false,
    replies: [],
    error: null,
  };
  summary: SummaryState = {
    thread: '',
    includeActions: true,
    includeQuestions: true,
    loading: false,
    result: null,
    error: null,
  };
  translate: TranslateState = {
    target: 'ar',
    preserveTone: true,
    loading: false,
    output: '',
    error: null,
  };
  drafts: DraftCollection = {
    items: [],
    activeId: null,
    loading: false,
  };
  templates: TemplateCollection = {
    items: [],
    loading: false,
    category: 'Outreach',
  };
  signature: { display: string; enabled: boolean } = { display: '', enabled: true };

  private initialized = false;

  get activeDraft(): EmailDraft | undefined {
    return this.drafts.items.find((item) => item.id === this.drafts.activeId);
  }

  get quickWordCount() {
    return wordCount(this.quick.input);
  }

  get quickCharCount() {
    return charCount(this.quick.input);
  }

  get quickReadingTime() {
    const wordsPerMinute = 180;
    return Math.max(1, Math.ceil(this.quickWordCount / wordsPerMinute));
  }

  get templateCategories() {
    const categories = new Set<string>();
    for (const template of this.templates.items) {
      categories.add(template.category);
    }
    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }

  get filteredTemplates() {
    return this.templates.items.filter((template) => template.category === this.templates.category);
  }

  get canUseSummaries() {
    return this.plan === 'pro';
  }

  get canUseTranslate() {
    return this.plan === 'pro';
  }

  get requiresWatermark() {
    return this.plan === 'free';
  }

  get toneOptions() {
    return Object.entries(toneLabels).map(([value, label]) => ({ value: value as EmailTone, label }));
  }

  get formalityOptions() {
    return Object.entries(formalityLabels).map(([value, label]) => ({ value: value as EmailFormality, label }));
  }

  get languageOptions() {
    return Object.entries(supportedLanguages).map(([value, label]) => ({ value: value as EmailTranslateTarget, label }));
  }

  initDashboard(): void {
    if (this.initialized) return;
    this.initialized = true;
    void this.loadWorkspace();
  }

  initEditor(location?: Location): void {
    const searchId = (() => {
      try {
        const url = location ? new URL(location.href) : new URL(window.location.href);
        return url.searchParams.get('id');
      } catch (error) {
        return null;
      }
    })();

    if (!this.initialized) {
      this.initialized = true;
      void this.loadWorkspace().then(() => {
        if (searchId) {
          this.selectDraft(searchId);
        }
      });
      return;
    }

    if (searchId) {
      this.selectDraft(searchId);
    }
  }

  private async loadWorkspace(): Promise<void> {
    this.drafts.loading = true;
    this.loader?.show();
    try {
      const [{ data: listData, error: listError }, { data: templateData }, { data: signatureData }] = await Promise.all([
        emailActions.list({}),
        emailActions.templates({}),
        emailActions.signature({}),
      ]);

      if (listError) throw listError;
      const items = Array.isArray(listData?.items) ? (listData!.items as EmailDraft[]) : [];
      this.plan = (listData?.plan === 'pro' ? 'pro' : 'free') as 'free' | 'pro';
      this.drafts.items = items;
      this.drafts.activeId = items[0]?.id ?? null;
      if (this.activeDraft) {
        this.applyDraftToQuick(this.activeDraft);
      } else {
        this.quick = defaultQuickState();
      }

      if (templateData?.items) {
        this.templates.items = templateData.items as EmailTemplate[];
      }

      if (signatureData?.signature) {
        const signature = signatureData.signature as { display: string; enabled: boolean };
        this.signature = signature;
        this.quick.signatureEnabled = signature.enabled;
      }
    } catch (error) {
      console.error('[email-store] unable to load workspace', error);
      this.toast = { message: 'Unable to load saved drafts. Start fresh and try again later.', type: 'error' };
      this.quick = defaultQuickState();
    } finally {
      this.drafts.loading = false;
      this.loader?.hide();
    }
  }

  setCategory(category: string) {
    this.templates.category = category;
  }

  applyDraftToQuick(draft: EmailDraft) {
    this.quick = {
      title: draft.title,
      subject: draft.subject ?? '',
      input: draft.input ?? '',
      output: draft.output ?? '',
      tone: draft.tone,
      formality: draft.formality,
      language: draft.language,
      needSubject: draft.needSubject,
      signatureEnabled: draft.signatureEnabled,
      ephemeral: draft.ephemeral,
      variables: clone(draft.variables ?? defaultEmailVariables),
      loading: false,
      error: null,
      lastAction: null,
    };
    this.translate.output = '';
    this.reply.replies = [];
    this.summary.result = null;
  }

  selectDraft(id: string) {
    if (this.drafts.activeId === id) return;
    this.drafts.activeId = id;
    const draft = this.drafts.items.find((item) => item.id === id);
    if (draft) {
      this.applyDraftToQuick(draft);
    }
  }

  updateQuick(field: keyof QuickState, value: any) {
    (this.quick as any)[field] = value;
  }

  updateVariable(key: string, value: string) {
    this.quick.variables = {
      ...this.quick.variables,
      [key]: value,
    };
  }

  async polish() {
    if (!this.quick.input.trim()) {
      this.quick.error = 'Add some text to polish.';
      return;
    }

    this.quick.loading = true;
    this.quick.error = null;
    try {
      const { data, error } = await emailActions.polish({
        text: this.quick.input,
        tone: this.quick.tone,
        formality: this.quick.formality,
        language: this.quick.language,
        needSubject: this.quick.needSubject,
        signatureEnabled: this.quick.signatureEnabled,
        draftId: this.drafts.activeId ?? undefined,
      });
      if (error) throw error;
      this.quick.output = data?.text ?? '';
      if (data?.subject) {
        this.quick.subject = data.subject;
      }
      this.quick.lastAction = 'polish';
      this.toast = { message: 'Polish complete. Review and copy when ready.', type: 'success' };
    } catch (error) {
      console.error('Unable to polish email', error);
      this.quick.error = 'Could not polish right now. Try again later.';
    } finally {
      this.quick.loading = false;
    }
  }

  async rewrite(mode: EmailRewriteMode) {
    if (!this.quick.output.trim() && !this.quick.input.trim()) {
      this.quick.error = 'Add content to rewrite first.';
      return;
    }
    const source = this.quick.output.trim() ? this.quick.output : this.quick.input;
    this.quick.loading = true;
    try {
      const { data, error } = await emailActions.rewrite({
        text: source,
        mode,
        tone: this.quick.tone,
        language: this.quick.language,
        draftId: this.drafts.activeId ?? undefined,
      });
      if (error) throw error;
      this.quick.output = data?.text ?? '';
      this.quick.lastAction = 'rewrite';
      this.toast = { message: 'Rewrite applied. Preview the changes above.', type: 'success' };
    } catch (error) {
      console.error('Unable to rewrite email', error);
      this.quick.error = 'Could not rewrite just now.';
    } finally {
      this.quick.loading = false;
    }
  }

  async translateOutput() {
    if (!this.canUseTranslate) {
      this.toast = { message: 'Upgrade to Pro to unlock instant translation.', type: 'error' };
      return;
    }
    const source = this.quick.output.trim() || this.quick.input.trim();
    if (!source) {
      this.translate.error = 'Add content to translate first.';
      return;
    }
    this.translate.loading = true;
    this.translate.error = null;
    try {
      const { data, error } = await emailActions.translate({
        text: source,
        to: this.translate.target,
        preserveTone: this.translate.preserveTone,
        draftId: this.drafts.activeId ?? undefined,
      });
      if (error) throw error;
      this.translate.output = data?.text ?? '';
      this.quick.lastAction = 'translate';
      this.toast = { message: `Translated to ${supportedLanguages[this.translate.target]}.`, type: 'success' };
    } catch (error) {
      console.error('Unable to translate email', error);
      this.translate.error = 'Translation failed. Try again.';
    } finally {
      this.translate.loading = false;
    }
  }

  async generateReplies() {
    if (!this.reply.incoming.trim()) {
      this.reply.error = 'Paste the incoming email to get suggestions.';
      return;
    }
    this.reply.loading = true;
    this.reply.error = null;
    try {
      const { data, error } = await emailActions.reply({
        incoming: this.reply.incoming,
        tone: this.reply.tone,
        relationship: this.reply.relationship,
        urgency: this.reply.urgency,
        variants: this.reply.variants,
        draftId: this.drafts.activeId ?? undefined,
      });
      if (error) throw error;
      this.reply.replies = Array.isArray(data?.replies) ? (data!.replies as Array<{ subject: string; body: string }>) : [];
      this.toast = { message: 'Reply ideas ready. Copy the one you like.', type: 'success' };
    } catch (error) {
      console.error('Unable to generate replies', error);
      this.reply.error = 'Could not generate replies right now.';
    } finally {
      this.reply.loading = false;
    }
  }

  async summarizeThread() {
    if (!this.canUseSummaries) {
      this.toast = { message: 'Upgrade to Pro to unlock thread summaries.', type: 'error' };
      return;
    }
    if (!this.summary.thread.trim()) {
      this.summary.error = 'Paste a thread to summarize first.';
      return;
    }
    this.summary.loading = true;
    this.summary.error = null;
    try {
      const prefer = ['bullets'];
      if (this.summary.includeActions) prefer.push('action_items');
      if (this.summary.includeQuestions) prefer.push('open_questions');
      const { data, error } = await emailActions.summarize({
        thread: this.summary.thread,
        prefer,
        draftId: this.drafts.activeId ?? undefined,
      });
      if (error) throw error;
      this.summary.result = data?.summary ?? null;
      if (data?.summary?.suggestedSubject) {
        this.quick.subject = data.summary.suggestedSubject;
      }
      this.toast = { message: 'Summary prepared. Review key points below.', type: 'success' };
    } catch (error) {
      console.error('Unable to summarize thread', error);
      this.summary.error = 'Could not summarize right now.';
    } finally {
      this.summary.loading = false;
    }
  }

  async useTemplate(template: EmailTemplate) {
    this.quick.loading = true;
    this.quick.error = null;
    try {
      const { data, error } = await emailActions.renderTemplate({
        templateId: template.id,
        variables: this.quick.variables,
        signature: this.quick.signatureEnabled,
      });
      if (error) throw error;
      this.quick.input = data?.body ?? template.body;
      if (data?.subject) {
        this.quick.subject = data.subject;
      }
      this.quick.output = '';
      this.quick.lastAction = null;
      this.toast = { message: 'Template applied. Personalize before polishing.', type: 'success' };
    } catch (error) {
      console.error('Unable to render template', error);
      this.quick.error = 'Could not merge template right now.';
    } finally {
      this.quick.loading = false;
    }
  }

  async saveDraft(status: 'draft' | 'final' = 'draft') {
    const payload = {
      title: this.quick.title || (this.quick.subject || 'Untitled email'),
      subject: this.quick.subject,
      input: this.quick.input,
      output: this.quick.output,
      tone: this.quick.tone,
      formality: this.quick.formality,
      language: this.quick.language,
      variables: this.quick.variables,
      signatureEnabled: this.quick.signatureEnabled,
      ephemeral: this.quick.ephemeral,
      status,
    };

    try {
      this.loader?.show();
      if (!this.drafts.activeId) {
        const { data, error } = await emailActions.create({ title: payload.title, tone: payload.tone, formality: payload.formality, language: payload.language, subject: payload.subject });
        if (error) throw error;
        this.drafts.activeId = data?.id ?? null;
      }

      if (!this.drafts.activeId) {
        throw new Error('Missing draft identifier after creation.');
      }

      const { data, error } = await emailActions.save({ id: this.drafts.activeId, draft: payload });
      if (error) throw error;
      const updated = data?.draft as EmailDraft | undefined;
      if (updated) {
        const existingIndex = this.drafts.items.findIndex((item) => item.id === updated.id);
        if (existingIndex >= 0) {
          this.drafts.items.splice(existingIndex, 1, updated);
        } else {
          this.drafts.items.unshift(updated);
        }
        this.drafts.activeId = updated.id;
        this.applyDraftToQuick(updated);
      }
      this.toast = { message: status === 'final' ? 'Email locked as final.' : 'Draft saved.', type: 'success' };
    } catch (error) {
      console.error('Unable to save draft', error);
      this.toast = { message: 'Could not save draft. Try again later.', type: 'error' };
    } finally {
      this.loader?.hide();
    }
  }

  async deleteDraft(id: string) {
    if (!id) return;
    try {
      this.loader?.show();
      const { error } = await emailActions.delete({ id });
      if (error) throw error;
      this.drafts.items = this.drafts.items.filter((item) => item.id !== id);
      if (this.drafts.activeId === id) {
        this.drafts.activeId = this.drafts.items[0]?.id ?? null;
        if (this.activeDraft) {
          this.applyDraftToQuick(this.activeDraft);
        } else {
          this.quick = defaultQuickState();
        }
      }
      this.toast = { message: 'Draft removed.', type: 'success' };
    } catch (error) {
      console.error('Unable to delete draft', error);
      this.toast = { message: 'Could not delete draft.', type: 'error' };
    } finally {
      this.loader?.hide();
    }
  }

  async duplicateDraft(id: string) {
    try {
      this.loader?.show();
      const { data, error } = await emailActions.duplicate({ id });
      if (error) throw error;
      const draft = data?.draft as EmailDraft | undefined;
      if (draft) {
        this.drafts.items.unshift(draft);
        this.drafts.activeId = draft.id;
        this.applyDraftToQuick(draft);
      }
      this.toast = { message: 'Draft duplicated.', type: 'success' };
    } catch (error) {
      console.error('Unable to duplicate draft', error);
      this.toast = { message: 'Could not duplicate draft.', type: 'error' };
    } finally {
      this.loader?.hide();
    }
  }

  async copyOutput() {
    const text = this.quick.output.trim();
    if (!text) {
      this.toast = { message: 'Generate polished text before copying.', type: 'error' };
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      this.toast = { message: 'Copied polished email to clipboard.', type: 'success' };
    } catch (error) {
      console.error('Unable to copy to clipboard', error);
      this.toast = { message: 'Copy failed. Select text manually.', type: 'error' };
    }
  }

  dismissToast() {
    this.toast = null;
  }

  openEditor() {
    if (this.drafts.activeId) {
      window.location.assign(`/email-polisher/editor?id=${this.drafts.activeId}`);
    } else {
      void this.saveDraft().then(() => {
        if (this.drafts.activeId) {
          window.location.assign(`/email-polisher/editor?id=${this.drafts.activeId}`);
        }
      });
    }
  }
}

Alpine.store('email', new EmailStore());

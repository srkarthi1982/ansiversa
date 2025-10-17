import Alpine from 'alpinejs';
import { actions } from 'astro:actions';
import type { FlashNote, FlashNoteAIMode, FlashNoteDraft, FlashNoteReviewCard } from '../types/flashnote';
import { readJSON, writeJSON } from '../utils/storage';

const loaderStore = () => Alpine.store('loader') as { show?: () => void; hide?: () => void } | undefined;

const STORAGE_KEYS = {
  activeNote: 'flashnote:last-active',
  filterTag: 'flashnote:filter-tag',
};

const defaultDraft = (): FlashNoteDraft => ({
  title: 'Untitled note',
  content: '',
  tags: [],
});

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const sampleNotes: FlashNote[] = [
  {
    id: 'sample-1',
    userId: 'demo',
    title: 'Neurotransmitters at a glance',
    content:
      'Neurotransmitters are chemical messengers that transmit signals across a synapse. Key examples include dopamine for reward and motivation, serotonin for mood regulation, and acetylcholine for muscle activation.',
    tags: ['biology', 'neuroscience'],
    summary: 'Chemical messengers such as dopamine, serotonin, and acetylcholine relay signals across synapses.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    userId: 'demo',
    title: 'Project discovery checklist',
    content:
      'Before kicking off a new product initiative, confirm the problem statement, draft primary personas, map success metrics, and identify technical constraints. Align the delivery team on timelines and responsibilities.',
    tags: ['product', 'process'],
    summary: 'Validate problem, personas, metrics, and constraints before starting a project.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class FlashNoteStore {
  state: {
    notes: FlashNote[];
    filteredNotes: FlashNote[];
    activeNoteId: string | null;
    draft: FlashNoteDraft | null;
    aiSummary: string;
    aiMode: FlashNoteAIMode;
    filterTag: string | null;
    reviewMode: boolean;
    loading: boolean;
    error: string | null;
    tags: string[];
    reviewCards: FlashNoteReviewCard[];
    reviewIndex: number;
    reviewFlipped: boolean;
    exporting: boolean;
  } = {
    notes: [],
    filteredNotes: [],
    activeNoteId: null,
    draft: clone(defaultDraft()),
    aiSummary: '',
    aiMode: 'idle',
    filterTag: readJSON(STORAGE_KEYS.filterTag, null),
    reviewMode: false,
    loading: false,
    error: null,
    tags: [],
    reviewCards: [],
    reviewIndex: 0,
    reviewFlipped: false,
    exporting: false,
  };

  private initialized = false;

  get activeNote(): FlashNote | undefined {
    return this.state.notes.find((note) => note.id === this.state.activeNoteId);
  }

  get hasNotes(): boolean {
    return this.state.notes.length > 0;
  }

  init(): void {
    if (this.initialized) return;
    this.initialized = true;
    const activeId = readJSON<string | null>(STORAGE_KEYS.activeNote, null);
    this.state.activeNoteId = activeId;
    void this.fetchNotes();
  }

  private persistPreferences(): void {
    writeJSON(STORAGE_KEYS.activeNote, this.state.activeNoteId);
    writeJSON(STORAGE_KEYS.filterTag, this.state.filterTag);
  }

  private setDraftFromNote(note: FlashNote | null): void {
    if (!note) {
      this.state.draft = clone(defaultDraft());
      return;
    }
    this.state.draft = clone({
      title: note.title,
      content: note.content,
      tags: [...note.tags],
    });
  }

  async fetchNotes(): Promise<void> {
    this.state.loading = true;
    loaderStore()?.show?.();
    try {
      const { data, error } = await actions.flashnote.list({});
      if (error) throw error;
      const notes = Array.isArray(data?.notes) ? (data!.notes as FlashNote[]) : [];
      this.state.notes = notes;
      this.refreshCollections();
      if (!this.state.activeNoteId && notes[0]) {
        this.state.activeNoteId = notes[0].id;
      }
      this.setDraftFromNote(this.activeNote ?? notes[0] ?? null);
      this.state.aiSummary = this.activeNote?.summary ?? '';
      this.persistPreferences();
    } catch (error) {
      console.error('Unable to load flash notes', error);
      if (!this.state.notes.length) {
        this.state.notes = sampleNotes;
        this.refreshCollections();
        this.state.activeNoteId = sampleNotes[0].id;
        this.setDraftFromNote(sampleNotes[0]);
        this.state.aiSummary = sampleNotes[0].summary ?? '';
      }
      this.state.error = 'Unable to load your notes right now. Sample data is displayed.';
    } finally {
      this.state.loading = false;
      loaderStore()?.hide?.();
    }
  }

  refreshCollections(): void {
    this.state.tags = Array.from(
      new Set(
        this.state.notes.flatMap((note) => note.tags.map((tag) => tag.trim())).filter((tag) => tag.length > 0),
      ),
    ).sort((a, b) => a.localeCompare(b));
    this.applyFilter(this.state.filterTag);
  }

  selectNote(id: string): void {
    if (this.state.activeNoteId === id) return;
    this.state.activeNoteId = id;
    this.persistPreferences();
    const note = this.state.notes.find((item) => item.id === id) ?? null;
    this.setDraftFromNote(note);
    this.state.aiSummary = note?.summary ?? '';
    this.state.aiMode = 'idle';
    this.state.error = null;
  }

  createDraft(): void {
    this.state.activeNoteId = null;
    this.state.draft = clone(defaultDraft());
    this.state.aiSummary = '';
    this.state.aiMode = 'idle';
  }

  updateDraft(partial: Partial<FlashNoteDraft>): void {
    if (!this.state.draft) {
      this.state.draft = clone(defaultDraft());
    }
    this.state.draft = {
      ...this.state.draft!,
      ...partial,
      tags: partial.tags ?? this.state.draft!.tags,
    };
  }

  addTag(tag: string): void {
    if (!this.state.draft) return;
    const normalized = tag.trim();
    if (!normalized || this.state.draft.tags.includes(normalized) || this.state.draft.tags.length >= 12) return;
    this.state.draft.tags = [...this.state.draft.tags, normalized];
  }

  removeTag(tag: string): void {
    if (!this.state.draft) return;
    this.state.draft.tags = this.state.draft.tags.filter((item) => item !== tag);
  }

  importSample(): void {
    const now = new Date().toISOString();
    const generated = sampleNotes.map((note, index) => ({
      ...clone(note),
      id: `${note.id}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${index}`}`,
      createdAt: now,
      updatedAt: now,
    }));
    this.state.notes = [...generated, ...this.state.notes];
    this.refreshCollections();
    this.state.activeNoteId = generated[0]?.id ?? this.state.activeNoteId;
    this.setDraftFromNote(this.activeNote ?? null);
    this.state.aiSummary = this.activeNote?.summary ?? '';
    this.state.error = null;
  }

  applyFilter(tag: string | null): void {
    this.state.filterTag = tag ?? null;
    const normalized = tag?.toLowerCase() ?? null;
    if (normalized) {
      this.state.filteredNotes = this.state.notes.filter((note) =>
        note.tags.some((item) => item.toLowerCase() === normalized),
      );
    } else {
      this.state.filteredNotes = [...this.state.notes];
    }
    this.persistPreferences();
  }

  describeNote(note: FlashNote): string {
    const wordCount = note.content.trim().split(/\s+/).filter(Boolean).length;
    const tagCount = note.tags.length;
    return `${wordCount} word${wordCount === 1 ? '' : 's'} · ${tagCount} tag${tagCount === 1 ? '' : 's'}`;
  }

  async commit(): Promise<void> {
    if (!this.state.draft) return;
    const draft = clone(this.state.draft);
    this.state.loading = true;
    loaderStore()?.show?.();
    try {
      if (this.state.activeNoteId) {
        const { data, error } = await actions.flashnote.update({
          id: this.state.activeNoteId,
          title: draft.title,
          content: draft.content,
          tags: draft.tags,
        });
        if (error) throw error;
        const updated = data?.note as FlashNote;
        this.upsert(updated);
        this.state.activeNoteId = updated.id;
        this.state.aiSummary = updated.summary ?? '';
      } else {
        const { data, error } = await actions.flashnote.create({
          title: draft.title,
          content: draft.content,
          tags: draft.tags,
        });
        if (error) throw error;
        const created = data?.note as FlashNote;
        this.upsert(created);
        this.state.activeNoteId = created.id;
        this.state.aiSummary = created.summary ?? '';
        this.persistPreferences();
      }
      this.setDraftFromNote(this.activeNote ?? null);
      this.state.error = null;
    } catch (error: any) {
      console.error('Unable to save flash note', error);
      if (error?.code === 'UNAUTHORIZED') {
        const now = new Date().toISOString();
        const localId = `local-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`;
        const localNote: FlashNote = {
          id: localId,
          userId: 'local',
          title: draft.title,
          content: draft.content,
          tags: [...draft.tags],
          summary: this.state.aiSummary,
          createdAt: now,
          updatedAt: now,
        };
        this.upsert(localNote);
        this.state.activeNoteId = localNote.id;
        this.setDraftFromNote(localNote);
        this.state.error = 'Saved locally. Sign in to sync across devices.';
      } else {
        this.state.error = 'We could not save your changes. Please retry.';
      }
    } finally {
      this.state.loading = false;
      loaderStore()?.hide?.();
    }
  }

  private upsert(note: FlashNote): void {
    const index = this.state.notes.findIndex((item) => item.id === note.id);
    if (index === -1) {
      this.state.notes = [note, ...this.state.notes];
    } else {
      const copy = [...this.state.notes];
      copy.splice(index, 1, note);
      this.state.notes = copy;
    }
    this.refreshCollections();
  }

  async destroy(id?: string): Promise<void> {
    const targetId = id ?? this.state.activeNoteId;
    if (!targetId) return;
    this.state.loading = true;
    loaderStore()?.show?.();
    try {
      const { error } = await actions.flashnote.delete({ id: targetId });
      if (error) throw error;
      this.state.notes = this.state.notes.filter((note) => note.id !== targetId);
      this.refreshCollections();
      if (this.state.activeNoteId === targetId) {
        this.state.activeNoteId = this.state.notes[0]?.id ?? null;
        this.setDraftFromNote(this.activeNote ?? null);
        this.state.aiSummary = this.activeNote?.summary ?? '';
      }
      this.persistPreferences();
    } catch (error) {
      console.error('Unable to delete flash note', error);
      this.state.error = 'Deleting the note failed. Please try again later.';
    } finally {
      this.state.loading = false;
      loaderStore()?.hide?.();
    }
  }

  async triggerAI(mode: FlashNoteAIMode): Promise<void> {
    if (!this.state.activeNoteId && !this.state.draft?.content.trim()) {
      this.state.error = 'Add some content to run AI actions.';
      return;
    }
    const noteId = this.state.activeNoteId;
    this.state.aiMode = mode;
    this.state.error = null;
    try {
      let id = noteId;
      if (!id) {
        await this.commit();
        id = this.state.activeNoteId;
      }
      if (!id) throw new Error('No note to run AI against');
      const { data, error } = await actions.flashnote.summarise({ id, mode });
      if (error) throw error;
      const text = String(data?.resultText ?? '');
      this.state.aiSummary = text;
      const note = this.state.notes.find((item) => item.id === id);
      if (note) {
        note.summary = text;
      }
    } catch (error: any) {
      console.error('AI request failed', error);
      const retryAfter = error?.retryAfter ? ` Try again in ${error.retryAfter}s.` : '';
      this.state.error = error?.message ?? `AI request failed.${retryAfter}`;
    } finally {
      this.state.aiMode = 'idle';
    }
  }

  async toggleReview(force?: boolean): Promise<void> {
    const nextState = force ?? !this.state.reviewMode;
    if (nextState) {
      await this.prepareReview();
    }
    this.state.reviewMode = nextState;
    this.state.reviewIndex = 0;
    this.state.reviewFlipped = false;
  }

  async prepareReview(): Promise<void> {
    try {
      const { data, error } = await actions.flashnote.review({
        tag: this.state.filterTag ?? undefined,
      });
      if (error) throw error;
      const cards = Array.isArray(data?.cards) ? (data!.cards as FlashNoteReviewCard[]) : [];
      this.state.reviewCards = cards.length ? cards : this.state.filteredNotes.map((note) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        summary: note.summary,
        tags: note.tags,
      }));
    } catch (error) {
      console.error('Unable to start review', error);
      this.state.reviewCards = this.state.filteredNotes.map((note) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        summary: note.summary,
        tags: note.tags,
      }));
      this.state.error = 'Review mode is offline. Showing cached cards instead.';
    }
  }

  nextCard(): void {
    if (!this.state.reviewCards.length) return;
    this.state.reviewIndex = (this.state.reviewIndex + 1) % this.state.reviewCards.length;
    this.state.reviewFlipped = false;
  }

  prevCard(): void {
    if (!this.state.reviewCards.length) return;
    this.state.reviewIndex =
      (this.state.reviewIndex - 1 + this.state.reviewCards.length) % this.state.reviewCards.length;
    this.state.reviewFlipped = false;
  }

  flipCard(): void {
    this.state.reviewFlipped = !this.state.reviewFlipped;
  }

  async exportSelected(noteIds: string[], format: 'pdf' | 'markdown' | 'txt'): Promise<void> {
    if (!noteIds.length) {
      this.state.error = 'Select notes to export before continuing.';
      return;
    }
    this.state.exporting = true;
    try {
      const { data, error } = await actions.flashnote.export({
        noteIds,
        format,
      });
      if (error) throw error;
      const url = String(data?.downloadUrl ?? '');
      if (url) {
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `flashnote-${Date.now()}.${format === 'markdown' ? 'md' : format}`;
        anchor.rel = 'noopener';
        anchor.click();
      }
    } catch (error) {
      console.error('Export failed', error);
      this.state.error = 'We could not generate the export file. Please try again.';
    } finally {
      this.state.exporting = false;
    }
  }

  clearError(): void {
    this.state.error = null;
  }
}

Alpine.store('flashnote', new FlashNoteStore());

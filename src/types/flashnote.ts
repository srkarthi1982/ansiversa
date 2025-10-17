export type FlashNoteAIMode = 'idle' | 'summarising' | 'simplifying' | 'explaining' | 'quizzing';

export interface FlashNote {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  summary?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FlashNoteDraft {
  title: string;
  content: string;
  tags: string[];
}

export interface FlashNoteReviewCard {
  id: string;
  title: string;
  content: string;
  summary?: string | null;
  tags: string[];
}

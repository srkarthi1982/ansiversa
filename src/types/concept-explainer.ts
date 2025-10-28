export type AudienceLevel = 'Kids' | 'Teen' | 'Undergrad' | 'Professional' | 'Expert';

export type ExplanationStyle =
  | 'Textbook'
  | 'Teacher talk'
  | 'Story'
  | 'Cheatsheet'
  | 'Socratic';

export interface ConceptContext {
  language: string;
  region: string;
  subject: string;
  examTag?: string | null;
}

export interface ConceptWorkspaceOptions extends ConceptContext {
  concept: string;
  style: ExplanationStyle;
  level: AudienceLevel;
  mode: 'generate' | 'revise';
}

export interface ConceptBreakdownStage {
  id: string;
  title: string;
  summary: string;
  keyPoints: string[];
  levelNotes: Partial<Record<AudienceLevel, string>>;
  example?: string;
}

export interface ConceptAnalogy {
  title: string;
  description: string;
  level: AudienceLevel[];
}

export interface ConceptVisual {
  title: string;
  ascii: string;
  caption: string;
  highlight: string;
}

export interface ConceptPitfall {
  title: string;
  fix: string;
}

export interface ConceptMiniQuiz {
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface ConceptExportPreset {
  format: 'md' | 'pdf' | 'json';
  description: string;
  estimatedSize: string;
  updatedAt: string;
}

export interface LinkedWorkspace {
  title: string;
  description: string;
  actionLabel: string;
  href: string;
}

export interface ConceptSnapshot {
  concept: string;
  tagline: string;
  definition: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  effortMinutes: number;
  prerequisites: string[];
  keyOutcomes: string[];
  keywords: string[];
}

export interface ConceptWorkspaceState {
  loading: boolean;
  options: ConceptWorkspaceOptions;
  snapshot: ConceptSnapshot;
  breakdown: ConceptBreakdownStage[];
  analogies: ConceptAnalogy[];
  visuals: ConceptVisual[];
  pitfalls: ConceptPitfall[];
  miniQuiz: ConceptMiniQuiz;
  quickChecks: string[];
  exportPresets: ConceptExportPreset[];
  linkedWorkspaces: LinkedWorkspace[];
  lastAction?: string | null;
}

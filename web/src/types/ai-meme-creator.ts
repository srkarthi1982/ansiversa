export type MemePlanTier = 'free' | 'pro';

export type MemeTemplateRatio = '1:1' | '4:5' | '16:9' | '9:16';

export interface MemeHeroHighlight {
  icon: string;
  title: string;
  description: string;
}

export interface MemeHeroStat {
  label: string;
  value: string;
  context: string;
}

export interface MemeTemplate {
  id: string;
  name: string;
  ratio: MemeTemplateRatio;
  panels: number;
  animated: boolean;
  description: string;
  tags: string[];
  complexity: 'classic' | 'advanced';
  recommendedUse: string;
}

export interface MemeTemplateCategory {
  id: string;
  title: string;
  description: string;
  tags: string[];
  templates: MemeTemplate[];
}

export interface MemePromptPreset {
  id: string;
  label: string;
  scenario: string;
  tone: string;
  recommendedTemplates: string[];
  captionIdeas: string[];
  context: string;
}

export type MemeToneMode = 'wholesome' | 'savage' | 'corporate' | 'absurd' | 'playful';

export interface MemeToneOption {
  id: MemeToneMode;
  label: string;
  description: string;
  sliderPosition: number;
  icon: string;
}

export interface MemePromptStage {
  id: string;
  title: string;
  description: string;
  icon: string;
  actions: string[];
}

export interface MemeWorkspaceMetric {
  id: string;
  label: string;
  value: string;
  detail: string;
  icon: string;
  trend?: string;
}

export type MemeCanvasToolGroup = 'text' | 'layout' | 'effects' | 'safety';

export interface MemeCanvasTool {
  id: string;
  label: string;
  description: string;
  icon: string;
  group: MemeCanvasToolGroup;
  shortcuts: string[];
}

export interface MemePanelPreset {
  id: string;
  name: string;
  description: string;
  panels: number;
  ratio: MemeTemplateRatio;
  gutters: string;
  animated: boolean;
}

export interface MemeBatchPreset {
  id: string;
  label: string;
  description: string;
  variants: number;
  includes: string[];
  bestFor: string;
  plan: MemePlanTier;
}

export type MemeExportKind = 'png' | 'jpeg' | 'webp' | 'gif' | 'mp4' | 'zip' | 'clipboard';

export interface MemeExportFormat {
  id: string;
  label: string;
  format: MemeExportKind;
  description: string;
  plan: MemePlanTier;
  options: string[];
}

export interface MemeSafetyControl {
  id: string;
  label: string;
  description: string;
  icon: string;
  defaultLevel: MemePlanTier;
  settings: string[];
}

export interface MemeSafetyAlert {
  id: string;
  label: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  resolution: string;
}

export interface MemeIntegration {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: string;
  actionLabel: string;
}

export interface MemeApiEndpoint {
  method: 'GET' | 'POST';
  path: string;
  description: string;
}

export interface MemePlanComparisonRow {
  id: string;
  feature: string;
  icon: string;
  free: string;
  pro: string;
}

export interface AiMemeCreatorState {
  plan: MemePlanTier;
  templateCategories: MemeTemplateCategory[];
  selectedCategoryId: string;
  selectedTemplateId: string;
  promptPresets: MemePromptPreset[];
  selectedPromptId: string;
  toneOptions: MemeToneOption[];
  selectedToneId: MemeToneOption['id'];
  promptStages: MemePromptStage[];
  workspaceMetrics: MemeWorkspaceMetric[];
  canvasTools: MemeCanvasTool[];
  panelPresets: MemePanelPreset[];
  selectedPanelPresetId: string;
  batchPresets: MemeBatchPreset[];
  selectedBatchId: string;
  exportFormats: MemeExportFormat[];
  selectedExportId: string;
  safetyControls: MemeSafetyControl[];
  safetyAlerts: MemeSafetyAlert[];
  integrations: MemeIntegration[];
  apiEndpoints: MemeApiEndpoint[];
  planComparison: MemePlanComparisonRow[];
  heroHighlights: MemeHeroHighlight[];
  heroStats: MemeHeroStat[];
  activeSafetyControlIds: string[];
}

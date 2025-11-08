import Alpine from 'alpinejs';
import { BaseStore } from '../../../alpineStores/base';
import type {
  AiMemeCreatorState,
  MemeBatchPreset,
  MemeCanvasToolGroup,
  MemePlanTier,
  MemePromptPreset,
  MemeTemplate,
  MemeTemplateCategory,
} from '../../../types/ai-meme-creator';
import {
  getApiEndpoints,
  getBatchPresets,
  getCanvasTools,
  getExportFormats,
  getHeroHighlights,
  getHeroStats,
  getIntegrations,
  getPanelPresets,
  getPlanComparison,
  getPromptPresets,
  getPromptStages,
  getSafetyAlerts,
  getSafetyControls,
  getTemplateCategories,
  getToneOptions,
  getWorkspaceMetrics,
} from '../data/aiMemeCreatorData';

class AiMemeCreatorStore extends BaseStore {
  state: AiMemeCreatorState;
  private initialized = false;

  constructor() {
    super();
    const templateCategories = getTemplateCategories();
    const promptPresets = getPromptPresets();
    const toneOptions = getToneOptions();
    const panelPresets = getPanelPresets();
    const batchPresets = getBatchPresets();
    const exportFormats = getExportFormats();
    const safetyControls = getSafetyControls();
    const defaultPlan: MemePlanTier = 'pro';

    this.state = {
      plan: defaultPlan,
      templateCategories,
      selectedCategoryId: templateCategories[0]?.id ?? '',
      selectedTemplateId: templateCategories[0]?.templates[0]?.id ?? '',
      promptPresets,
      selectedPromptId: promptPresets[0]?.id ?? '',
      toneOptions,
      selectedToneId: toneOptions.find((tone) => tone.id === 'playful')?.id ?? toneOptions[0]?.id ?? 'wholesome',
      promptStages: getPromptStages(),
      workspaceMetrics: getWorkspaceMetrics(),
      canvasTools: getCanvasTools(),
      panelPresets,
      selectedPanelPresetId: panelPresets[0]?.id ?? '',
      batchPresets,
      selectedBatchId: batchPresets[0]?.id ?? '',
      exportFormats,
      selectedExportId: exportFormats[0]?.id ?? '',
      safetyControls,
      safetyAlerts: getSafetyAlerts(),
      integrations: getIntegrations(),
      apiEndpoints: getApiEndpoints(),
      planComparison: getPlanComparison(),
      heroHighlights: getHeroHighlights(),
      heroStats: getHeroStats(),
      activeSafetyControlIds: this.determineDefaultSafetyControls(defaultPlan, safetyControls),
    };
  }

  initLanding(): void {
    if (this.initialized) return;
    this.initialized = true;
    this.showLoaderBriefly(280);
  }

  setPlan(plan: MemePlanTier): void {
    if (this.state.plan === plan) return;
    this.state.plan = plan;
    this.state.activeSafetyControlIds = this.determineDefaultSafetyControls(plan, this.state.safetyControls);
  }

  selectCategory(categoryId: string): void {
    if (this.state.selectedCategoryId === categoryId) return;
    const category = this.state.templateCategories.find((item) => item.id === categoryId);
    if (!category) return;
    this.state.selectedCategoryId = categoryId;
    this.state.selectedTemplateId = category.templates[0]?.id ?? this.state.selectedTemplateId;
  }

  selectTemplate(templateId: string): void {
    if (this.state.selectedTemplateId === templateId) return;
    const exists = this.state.templateCategories.some((category) =>
      category.templates.some((template) => template.id === templateId),
    );
    if (!exists) return;
    this.state.selectedTemplateId = templateId;
  }

  cycleTemplate(direction: 'forward' | 'backward' = 'forward'): void {
    const templates = this.templatesForSelectedCategory();
    if (!templates.length) return;
    const index = templates.findIndex((template) => template.id === this.state.selectedTemplateId);
    const delta = direction === 'forward' ? 1 : -1;
    const nextIndex = index === -1 ? 0 : (index + delta + templates.length) % templates.length;
    this.state.selectedTemplateId = templates[nextIndex]?.id ?? this.state.selectedTemplateId;
  }

  selectPrompt(promptId: string): void {
    if (this.state.selectedPromptId === promptId) return;
    const exists = this.state.promptPresets.some((preset) => preset.id === promptId);
    if (!exists) return;
    this.state.selectedPromptId = promptId;
    const preset = this.selectedPrompt;
    if (preset?.recommendedTemplates?.length) {
      const firstTemplate = preset.recommendedTemplates.find((templateId) =>
        this.templates().some((template) => template.id === templateId),
      );
      if (firstTemplate) {
        this.state.selectedTemplateId = firstTemplate;
      }
    }
  }

  selectTone(toneId: string): void {
    if (this.state.selectedToneId === toneId) return;
    const exists = this.state.toneOptions.some((tone) => tone.id === toneId);
    if (!exists) return;
    this.state.selectedToneId = toneId as AiMemeCreatorState['selectedToneId'];
  }

  selectPanelPreset(presetId: string): void {
    if (this.state.selectedPanelPresetId === presetId) return;
    const exists = this.state.panelPresets.some((preset) => preset.id === presetId);
    if (!exists) return;
    this.state.selectedPanelPresetId = presetId;
    this.showLoaderBriefly(200);
  }

  selectBatchPreset(batchId: string): void {
    if (this.state.selectedBatchId === batchId) return;
    const exists = this.state.batchPresets.some((preset) => preset.id === batchId);
    if (!exists) return;
    this.state.selectedBatchId = batchId;
  }

  selectExportFormat(exportId: string): void {
    if (this.state.selectedExportId === exportId) return;
    const exists = this.state.exportFormats.some((preset) => preset.id === exportId);
    if (!exists) return;
    this.state.selectedExportId = exportId;
  }

  toggleSafetyControl(controlId: string): void {
    const control = this.state.safetyControls.find((item) => item.id === controlId);
    if (!control) return;
    if (control.defaultLevel === 'pro' && this.state.plan !== 'pro') return;
    const active = this.state.activeSafetyControlIds;
    if (active.includes(controlId)) {
      this.state.activeSafetyControlIds = active.filter((id) => id !== controlId);
    } else {
      this.state.activeSafetyControlIds = [...active, controlId];
    }
  }

  isSafetyControlActive(controlId: string): boolean {
    return this.state.activeSafetyControlIds.includes(controlId);
  }

  templates(): MemeTemplate[] {
    return this.state.templateCategories.flatMap((category) => category.templates);
  }

  templatesForSelectedCategory(): MemeTemplate[] {
    const category = this.state.templateCategories.find((item) => item.id === this.state.selectedCategoryId);
    return category ? category.templates : [];
  }

  get selectedCategory(): MemeTemplateCategory | null {
    return this.state.templateCategories.find((item) => item.id === this.state.selectedCategoryId) ?? null;
  }

  get selectedTemplate(): MemeTemplate | null {
    return this.templates().find((template) => template.id === this.state.selectedTemplateId) ?? null;
  }

  get selectedPrompt(): MemePromptPreset | null {
    return this.state.promptPresets.find((preset) => preset.id === this.state.selectedPromptId) ?? null;
  }

  get selectedBatchPreset(): MemeBatchPreset | null {
    return this.state.batchPresets.find((preset) => preset.id === this.state.selectedBatchId) ?? null;
  }

  toolsByGroup(group: MemeCanvasToolGroup) {
    return this.state.canvasTools.filter((tool) => tool.group === group);
  }

  recommendedTemplatesForPrompt(): MemeTemplate[] {
    const preset = this.selectedPrompt;
    if (!preset) return [];
    const allTemplates = this.templates();
    return preset.recommendedTemplates
      .map((templateId) => allTemplates.find((template) => template.id === templateId))
      .filter((template): template is MemeTemplate => Boolean(template));
  }

  tonePosition(): number {
    const tone = this.state.toneOptions.find((item) => item.id === this.state.selectedToneId);
    return tone?.sliderPosition ?? 0;
  }

  private determineDefaultSafetyControls(plan: MemePlanTier, controls: AiMemeCreatorState['safetyControls']): string[] {
    const allowed = plan === 'pro' ? new Set(['free', 'pro']) : new Set(['free']);
    return controls.filter((control) => allowed.has(control.defaultLevel)).map((control) => control.id);
  }
}

Alpine.store('aiMemeCreator', new AiMemeCreatorStore());

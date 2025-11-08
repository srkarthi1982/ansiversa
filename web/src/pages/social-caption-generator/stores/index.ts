import Alpine from "alpinejs";
import { BaseStore, clone } from "../../../alpineStores/base";
import {
  captionBrandVoices,
  captionCampaigns,
  captionCtaPresets,
  captionHashtagSets,
  captionPlanLimits,
  captionPlatforms,
  captionSeedDrafts,
  captionTemplates,
  createDraftFromGenerator,
  generatorDefaultPayload,
  localizationTargets,
  refreshVariantMetrics,
  regenerateDraftVariants,
} from "../../../data/captionSamples";
import type {
  CaptionCampaign,
  CaptionDraft,
  CaptionGeneratorPayload,
  CaptionLocalizationTarget,
  CaptionPlan,
  CaptionPlanLimits,
  CaptionPlatform,
  CaptionPlatformId,
  CaptionTemplate,
  CaptionVariant,
} from "../../../types/caption";

const ensureArray = <T>(value: T[] | undefined | null): T[] =>
  Array.isArray(value) ? value : [];

const sumBy = (values: number[]) =>
  values.reduce((total, current) => total + current, 0);

class CaptionStore extends BaseStore {
  private plan: CaptionPlan = "pro";
  private platforms: CaptionPlatform[] = captionPlatforms();
  private voices = captionBrandVoices();
  private hashtagSets = captionHashtagSets();
  private ctas = captionCtaPresets();
  private templates = captionTemplates();
  private campaigns = captionCampaigns();
  private drafts: CaptionDraft[] = captionSeedDrafts();

  generatorState: CaptionGeneratorPayload & {
    loading: boolean;
    ephemeral: boolean;
    resultId: string | null;
    showUtm: boolean;
    lastGeneratedAt: string | null;
    generationCount: number;
  } = {
    ...generatorDefaultPayload(),
    loading: false,
    ephemeral: false,
    resultId: this.drafts[0]?.id ?? null,
    showUtm: true,
    lastGeneratedAt: null,
    generationCount: 3,
  };

  editor = {
    activeDraftId: (this.drafts[0]?.id ?? null) as string | null,
    platformId: (this.drafts[0]?.platforms[0] ?? "insta") as CaptionPlatformId | null,
    variantId: null as string | null,
    textBuffer: "",
    autosaveLabel: "Saved",
    comparing: false,
    compareVariantId: null as string | null,
    localization: localizationTargets() as CaptionLocalizationTarget[],
  };

  feedback: { message: string | null; tone: "success" | "info" | "warning" } = {
    message: null,
    tone: "info",
  };

  constructor() {
    super();
    this.ensureVariantSelection();
  }

  // region: getters -------------------------------------------------------
  get planLimits(): CaptionPlanLimits | null {
    return captionPlanLimits(this.plan) ?? null;
  }

  get listPlatforms(): CaptionPlatform[] {
    return this.platforms;
  }

  get listVoices() {
    return this.voices;
  }

  get listHashtagSets() {
    return this.hashtagSets;
  }

  get listCtas() {
    return this.ctas;
  }

  get listTemplates(): CaptionTemplate[] {
    return this.templates;
  }

  get listCampaigns(): CaptionCampaign[] {
    return this.campaigns;
  }

  get draftsList(): CaptionDraft[] {
    return this.drafts;
  }

  get activeDraft(): CaptionDraft | null {
    if (!this.editor.activeDraftId) return null;
    return this.drafts.find((draft) => draft.id === this.editor.activeDraftId) ?? null;
  }

  get generatorResult(): CaptionDraft | null {
    if (!this.generatorState.resultId) return null;
    return this.drafts.find((draft) => draft.id === this.generatorState.resultId) ?? null;
  }

  get activeVariants(): CaptionVariant[] {
    const draft = this.activeDraft;
    if (!draft || !this.editor.platformId) return [];
    return ensureArray(draft.variants[this.editor.platformId]);
  }

  get activeVariant(): CaptionVariant | null {
    if (!this.editor.variantId) return this.activeVariants[0] ?? null;
    return this.activeVariants.find((variant) => variant.id === this.editor.variantId) ?? null;
  }

  get dashboardMetrics() {
    const generations = this.generatorState.generationCount;
    const campaigns = this.campaigns.length;
    const scheduled = sumBy(
      this.campaigns.map((campaign) =>
        campaign.items.filter((item) => item.status === "scheduled").length,
      ),
    );
    return {
      generations,
      campaigns,
      scheduled,
    };
  }

  get planUsage() {
    const limits = this.planLimits;
    if (!limits) {
      return null;
    }
    const used = this.generatorState.generationCount;
    const allowance =
      limits.generationsPerMonth === "unlimited" ? null : limits.generationsPerMonth;
    const remaining = allowance === null ? "∞" : Math.max(0, allowance - used);
    return {
      used,
      allowance,
      remaining,
    };
  }
  // endregion -------------------------------------------------------------

  // region: actions -------------------------------------------------------
  generateFromForm() {
    if (this.generatorState.loading) return;
    this.generatorState.loading = true;

    const payload = clone({
      idea: this.generatorState.idea,
      platforms: clone(this.generatorState.platforms),
      voiceId: this.generatorState.voiceId,
      hashtagSetId: this.generatorState.hashtagSetId,
      ctaId: this.generatorState.ctaId,
      link: this.generatorState.link,
      utm: clone(this.generatorState.utm),
    });

    const next = createDraftFromGenerator(payload, {
      title: payload.idea,
    });

    this.drafts.unshift(next);
    this.generatorState.resultId = next.id;
    this.generatorState.loading = false;
    this.generatorState.lastGeneratedAt = new Date().toISOString();
    this.generatorState.generationCount += 1;

    this.editor.activeDraftId = next.id;
    this.editor.platformId = next.platforms[0] ?? this.editor.platformId;
    this.editor.variantId = next.platforms.length
      ? next.variants[next.platforms[0]]?.[0]?.id ?? null
      : null;
    this.editor.textBuffer = this.activeVariant?.text ?? "";

    this.feedback = {
      message: "New multi-platform caption set generated.",
      tone: "success",
    };
  }

  regenerateActiveDraft() {
    const draft = this.activeDraft;
    if (!draft) return;

    const payload: CaptionGeneratorPayload = {
      idea: draft.idea,
      platforms: clone(draft.platforms),
      voiceId: draft.voiceId,
      hashtagSetId: draft.hashtagSetId,
      ctaId: draft.ctaId,
      link: draft.utm?.base ?? this.generatorState.link,
      utm: clone(draft.utm ?? this.generatorState.utm),
    };

    const refreshed = regenerateDraftVariants(draft, payload);
    this.replaceDraft(refreshed);
    this.editor.variantId =
      refreshed.variants[this.editor.platformId ?? refreshed.platforms[0]]?.[0]?.id ?? null;
    this.editor.textBuffer = this.activeVariant?.text ?? "";
    this.feedback = {
      message: "Variants regenerated with the same settings.",
      tone: "info",
    };
  }

  setActiveDraft(id: string) {
    this.editor.activeDraftId = id;
    const draft = this.activeDraft;
    if (!draft) return;
    this.editor.platformId = draft.platforms[0] ?? this.editor.platformId;
    this.editor.variantId = draft.platforms.length
      ? draft.variants[draft.platforms[0]]?.[0]?.id ?? null
      : null;
    this.editor.textBuffer = this.activeVariant?.text ?? "";
  }

  openVariant(platformId: CaptionPlatformId, variantId: string) {
    this.editor.platformId = platformId;
    this.editor.variantId = variantId;
    this.editor.textBuffer = this.activeVariant?.text ?? "";
  }

  updateEditorBuffer(value: string) {
    this.editor.textBuffer = value;
    const draft = this.activeDraft;
    if (!draft || !this.editor.platformId || !this.editor.variantId) return;

    const variants = draft.variants[this.editor.platformId];
    const index = variants.findIndex((variant) => variant.id === this.editor.variantId);
    if (index === -1) return;

    const updated = refreshVariantMetrics({
      ...variants[index],
      text: value,
    });

    draft.variants[this.editor.platformId].splice(index, 1, updated);
    draft.lastSavedAt = new Date().toISOString();
    this.editor.autosaveLabel = "Saving...";

    queueMicrotask(() => {
      this.editor.autosaveLabel = "Saved";
    });
  }

  chooseVariant(platformId: CaptionPlatformId, variantId: string) {
    const draft = this.activeDraft;
    if (!draft) return;
    draft.chosen[platformId] = variantId;
    draft.lastSavedAt = new Date().toISOString();
    const label = platformId.toUpperCase();
    this.feedback = {
      message: `${label} variant marked as ready to publish.`,
      tone: "success",
    };
  }

  toggleEphemeralMode() {
    this.generatorState.ephemeral = !this.generatorState.ephemeral;
  }

  updateGeneratorLink(value: string) {
    this.generatorState.link = value;
    this.generatorState.utm.base = value || this.generatorState.utm.base;
    this.recalculateUtmUrl();
  }

  updateUtmField(field: "source" | "medium" | "campaign" | "content") {
    return (value: string) => {
      this.generatorState.utm[field] = value;
      this.recalculateUtmUrl();
    };
  }

  addFeedback(message: string, tone: "success" | "info" | "warning" = "info") {
    this.feedback = { message, tone };
    setTimeout(() => {
      if (this.feedback.message === message) {
        this.feedback = { message: null, tone: "info" };
      }
    }, 2500);
  }

  useTemplate(key: string) {
    const template = this.templates.find((item) => item.key === key);
    if (!template) return;

    const payload: CaptionGeneratorPayload = {
      idea: template.idea,
      platforms: clone(template.platforms),
      voiceId: template.voiceId,
      hashtagSetId: template.hashtagSetId,
      ctaId: template.ctaId,
      link: this.generatorState.link,
      utm: clone(this.generatorState.utm),
    };

    const draft = createDraftFromGenerator(payload, {
      title: template.title,
      status: "draft",
      shareSlug: `${template.key}-${Date.now().toString(36)}`,
    });

    this.drafts.unshift(draft);
    this.editor.activeDraftId = draft.id;
    this.editor.platformId = draft.platforms[0] ?? this.editor.platformId;
    this.editor.variantId = draft.platforms.length
      ? draft.variants[draft.platforms[0]]?.[0]?.id ?? null
      : null;
    this.editor.textBuffer = this.activeVariant?.text ?? "";
    this.generatorState.resultId = draft.id;
    this.feedback = {
      message: `${template.title} template loaded in the editor.`,
      tone: "success",
    };
  }

  copyVariantText(variant: CaptionVariant) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      const hashtagBlock = variant.hashtags.map((tag) => `#${tag}`).join(" ");
      navigator.clipboard.writeText(`${variant.text}\n\n${hashtagBlock}`.trim());
      this.addFeedback("Variant copied to clipboard.", "success");
    }
  }
  // endregion -------------------------------------------------------------

  // region: helpers -------------------------------------------------------
  private replaceDraft(next: CaptionDraft) {
    const index = this.drafts.findIndex((draft) => draft.id === next.id);
    if (index === -1) return;
    this.drafts.splice(index, 1, next);
  }

  private ensureVariantSelection() {
    const draft = this.activeDraft;
    if (!draft) {
      this.editor.variantId = null;
      this.editor.textBuffer = "";
      return;
    }
    const platformId = draft.platforms[0] ?? "insta";
    this.editor.platformId = platformId;
    const variant = draft.variants[platformId]?.[0] ?? null;
    this.editor.variantId = variant?.id ?? null;
    this.editor.textBuffer = variant?.text ?? "";
  }

  private recalculateUtmUrl() {
    const utm = this.generatorState.utm;
    const params = new URLSearchParams({
      utm_source: utm.source,
      utm_medium: utm.medium,
      utm_campaign: utm.campaign,
      utm_content: utm.content,
    });
    const base = utm.base || this.generatorState.link;
    utm.url = `${base}?${params.toString()}`;
  }
  // endregion -------------------------------------------------------------
}

const store = new CaptionStore();
Alpine.store("caption", store);

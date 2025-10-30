import Alpine from 'alpinejs';
import { BaseStore } from '../../../alpineStores/base';
import {
  adAnalyticsSummary,
  adAnglePresets,
  adCampaignSummaries,
  adChannelSpecs,
  adComplianceCatalog,
  adDefaultBrief,
  adExportPresets,
  adIntegrationShortcuts,
  adLocalizationBundles,
  adPlanLimits,
  adSeedVariants,
  adTonePresets,
  adUtmTemplates,
} from '../../../data/adCopyAssistant';
import type {
  AdAngleId,
  AdCampaignBrief,
  AdCampaignSummary,
  AdChannelField,
  AdChannelId,
  AdChannelSpec,
  AdComplianceIssue,
  AdExportPreset,
  AdIntegrationShortcut,
  AdLocalizationBundle,
  AdPlan,
  AdPlanLimit,
  AdToneId,
  AdUtmTemplate,
  AdVariant,
  AdVariantFieldCounter,
} from '../../../types/adCopyAssistant';

type WorkspaceTab = 'overview' | 'variants' | 'compliance';

type Toast = { message: string; tone: 'success' | 'info' | 'warning' } | null;

const fallbackCounters = (value: string, field: AdChannelField): AdVariantFieldCounter => {
  const length = value.length;
  const hardLimit = typeof field.hardLimit === 'number' ? field.hardLimit : undefined;
  const recommended = typeof field.recommended === 'number' ? field.recommended : undefined;
  return {
    length,
    hardLimit,
    recommended,
    remaining: typeof hardLimit === 'number' ? Math.max(hardLimit - length, 0) : undefined,
    exceeded: typeof hardLimit === 'number' ? length > hardLimit : false,
    warn: typeof recommended === 'number' ? length > recommended : false,
  };
};

class AdCopyAssistantStore extends BaseStore {
  plan: AdPlan = 'free';
  brief: AdCampaignBrief = adDefaultBrief();
  keywordBuffer = this.brief.keywords.join(', ');
  differentiatorBuffer = this.brief.differentiators.join('\n');
  requiredPhraseBuffer = this.brief.requiredPhrases.join(', ');
  bannedWordBuffer = this.brief.bannedWords.join(', ');
  disclaimerBuffer = this.brief.disclaimers.join('\n');

  channels: AdChannelSpec[] = adChannelSpecs();
  angles = adAnglePresets();
  tones = adTonePresets();
  planOptions: AdPlanLimit[] = adPlanLimits();
  localization: AdLocalizationBundle[] = adLocalizationBundles();
  variantsByChannel: Record<AdChannelId, AdVariant[]> = adSeedVariants();
  complianceIssues: AdComplianceIssue[] = adComplianceCatalog();
  exportPresets: AdExportPreset[] = adExportPresets();
  integrations: AdIntegrationShortcut[] = adIntegrationShortcuts();
  analytics = adAnalyticsSummary();
  campaigns: AdCampaignSummary[] = adCampaignSummaries();
  utmTemplates: AdUtmTemplate[] = adUtmTemplates();

  workspace = {
    activeChannelId: (this.brief.channels[0] ?? this.channels[0]?.id ?? null) as AdChannelId | null,
    activeTab: 'overview' as WorkspaceTab,
    selectedLocale: this.brief.locales[0] ?? 'en-US',
    variantSelections: {} as Record<AdChannelId, string | null>,
    lastGeneratedAt: this.campaigns[0]?.lastUpdated ?? null,
    showPlanLimits: false,
  };

  toast: Toast = null;

  constructor() {
    super();
    this.ensureVariantSelections();
    this.recalculateFinalUrl();
  }

  onInit(): void {
    this.syncBuffersFromBrief();
  }

  get planDefinition(): AdPlanLimit | null {
    return this.planOptions.find((item) => item.plan === this.plan) ?? null;
  }

  get planUsage() {
    const plan = this.planDefinition;
    if (!plan) return null;
    const campaignCount = this.campaigns.length;
    const variantCount = this.countVariantsForSelectedChannels();
    return {
      campaignCount,
      campaignLimit: plan.campaigns,
      variantCount,
      variantLimit: plan.variantsPerChannel,
      localeCount: this.brief.locales.length,
      localeLimit: plan.locales,
    };
  }

  get activeChannelSpec(): AdChannelSpec | null {
    const id = this.workspace.activeChannelId;
    if (!id) return null;
    return this.channels.find((channel) => channel.id === id) ?? null;
  }

  get activeVariants(): AdVariant[] {
    const channelId = this.workspace.activeChannelId;
    if (!channelId) return [];
    return this.variantsByChannel[channelId] ?? [];
  }

  get activeVariant(): AdVariant | null {
    const channelId = this.workspace.activeChannelId;
    if (!channelId) return null;
    const variants = this.variantsByChannel[channelId] ?? [];
    const selectedId = this.workspace.variantSelections[channelId];
    if (selectedId) {
      const found = variants.find((variant) => variant.id === selectedId);
      if (found) return found;
    }
    return variants[0] ?? null;
  }

  get activeVariantFields() {
    const channel = this.activeChannelSpec;
    const variant = this.activeVariant;
    if (!channel || !variant) return [];
    return channel.fields.map((field) => {
      const value = variant.fields[field.id] ?? '';
      return {
        field,
        value,
        counter: variant.counters[field.id] ?? fallbackCounters(value, field),
      };
    });
  }

  get activeComplianceIssues(): AdComplianceIssue[] {
    const variant = this.activeVariant;
    const channelId = this.workspace.activeChannelId;
    if (!variant || !channelId) return [];
    return this.complianceIssues.filter(
      (issue) => issue.channelId === channelId && issue.variantId === variant.id && issue.status === 'open',
    );
  }

  get openComplianceCount(): number {
    return this.complianceIssues.filter((issue) => issue.status === 'open').length;
  }

  get localizationByLocale(): Record<string, AdLocalizationBundle> {
    const map: Record<string, AdLocalizationBundle> = {};
    for (const entry of this.localization) {
      map[entry.locale] = entry;
    }
    return map;
  }

  get selectedAngles(): Set<AdAngleId> {
    return new Set(this.brief.angles);
  }

  get tonePreset() {
    return this.tones.find((tone) => tone.id === this.brief.tone) ?? null;
  }

  setPlan(plan: AdPlan): void {
    this.plan = plan;
  }

  setActiveTab(tab: WorkspaceTab): void {
    this.workspace.activeTab = tab;
  }

  setActiveChannel(channelId: AdChannelId): void {
    this.workspace.activeChannelId = channelId;
    if (!this.workspace.variantSelections[channelId]) {
      this.ensureVariantSelection(channelId);
    }
  }

  setSelectedLocale(locale: string): void {
    this.workspace.selectedLocale = locale;
  }

  togglePlanDetails(): void {
    this.workspace.showPlanLimits = !this.workspace.showPlanLimits;
  }

  toggleAngle(angleId: AdAngleId): void {
    const angles = this.brief.angles;
    if (angles.includes(angleId)) {
      this.brief.angles = angles.filter((item) => item !== angleId);
    } else {
      this.brief.angles = [...angles, angleId];
    }
  }

  setTone(toneId: AdToneId): void {
    this.brief.tone = toneId;
  }

  toggleChannel(channelId: AdChannelId, enabled: boolean): void {
    const existing = new Set(this.brief.channels);
    if (enabled) {
      existing.add(channelId);
    } else {
      existing.delete(channelId);
      if (existing.size === 0) {
        existing.add(channelId);
      }
    }
    this.brief.channels = Array.from(existing);
    if (!this.variantsByChannel[channelId]) {
      this.variantsByChannel[channelId] = [];
    }
    this.ensureVariantSelection(channelId);
  }

  toggleLocale(locale: string, enabled: boolean): void {
    const set = new Set(this.brief.locales);
    if (enabled) {
      set.add(locale);
    } else {
      set.delete(locale);
      if (set.size === 0) {
        set.add(locale);
      }
    }
    this.brief.locales = Array.from(set);
    if (!this.brief.locales.includes(this.workspace.selectedLocale)) {
      this.workspace.selectedLocale = this.brief.locales[0] ?? locale;
    }
  }

  updateBriefField(field: keyof Pick<AdCampaignBrief, 'product' | 'offer' | 'audience' | 'goal' | 'valueProp' | 'hypothesis'>, value: string): void {
    this.brief[field] = value;
  }

  updateKeywordBuffer(value: string): void {
    this.keywordBuffer = value;
    this.brief.keywords = this.parseCommaList(value);
  }

  updateDifferentiators(value: string): void {
    this.differentiatorBuffer = value;
    this.brief.differentiators = this.parseLineList(value);
  }

  updateRequiredPhrases(value: string): void {
    this.requiredPhraseBuffer = value;
    this.brief.requiredPhrases = this.parseCommaList(value);
  }

  updateBannedWords(value: string): void {
    this.bannedWordBuffer = value;
    this.brief.bannedWords = this.parseCommaList(value);
  }

  updateDisclaimers(value: string): void {
    this.disclaimerBuffer = value;
    this.brief.disclaimers = this.parseLineList(value);
  }

  updateUtmField(field: keyof AdCampaignBrief['utm'], value: string): void {
    this.brief.utm[field] = value;
    this.recalculateFinalUrl();
  }

  applyUtmTemplate(templateId: string): void {
    const template = this.utmTemplates.find((item) => item.id === templateId);
    if (!template) return;
    Object.assign(this.brief.utm, template.values);
    this.recalculateFinalUrl();
  }

  generateFromBrief(): void {
    const timestamp = new Date().toISOString();
    this.showLoaderBriefly(360);
    for (const channelId of this.brief.channels) {
      const variant = this.createVariantFromBrief(channelId);
      if (!variant) continue;
      const list = this.variantsByChannel[channelId] ?? (this.variantsByChannel[channelId] = []);
      list.push(variant);
      this.workspace.variantSelections[channelId] = variant.id;
    }
    this.workspace.lastGeneratedAt = timestamp;
    this.analytics.variantsGenerated += this.brief.channels.length;
    this.analytics.experimentsRun += 1;
    this.toast = { message: 'New variants drafted from the campaign brief.', tone: 'success' };
  }

  selectVariant(channelId: AdChannelId, variantId: string): void {
    this.workspace.variantSelections[channelId] = variantId;
    this.workspace.activeChannelId = channelId;
  }

  duplicateVariant(channelId: AdChannelId, variantId: string): void {
    const list = this.variantsByChannel[channelId];
    if (!list) return;
    const original = list.find((variant) => variant.id === variantId);
    if (!original) return;
    const clone = structuredClone(original);
    clone.id = `${channelId}-${Date.now()}`;
    clone.label = `${original.label} • Copy`;
    clone.notes = [...clone.notes, 'Duplicated for manual edits'];
    list.push(clone);
    this.workspace.variantSelections[channelId] = clone.id;
    this.toast = { message: 'Variant duplicated. Update the fields as needed.', tone: 'info' };
  }

  updateActiveVariantField(fieldId: string, value: string): void {
    const channelId = this.workspace.activeChannelId;
    const variant = this.activeVariant;
    if (!channelId || !variant) return;
    variant.fields[fieldId] = value;
    this.updateVariantCounters(variant);
  }

  applyComplianceRewrite(issueId: string): void {
    const issue = this.complianceIssues.find((item) => item.id === issueId);
    if (!issue || issue.status === 'resolved') return;
    const variants = this.variantsByChannel[issue.channelId];
    if (!variants) return;
    const variant = variants.find((item) => item.id === issue.variantId);
    if (!variant) return;
    if (issue.rewrite) {
      variant.fields[issue.fieldId] = issue.rewrite;
      this.updateVariantCounters(variant);
      issue.status = 'resolved';
      this.toast = { message: 'Applied safe rewrite to resolve the compliance flag.', tone: 'success' };
    }
  }

  markComplianceResolved(issueId: string): void {
    const issue = this.complianceIssues.find((item) => item.id === issueId);
    if (!issue) return;
    issue.status = 'resolved';
  }

  requestLocalization(locale: string): void {
    const entry = this.localization.find((item) => item.locale === locale);
    if (entry) {
      entry.status = 'queued';
      entry.updatedAt = new Date().toISOString();
    } else {
      this.localization.push({
        locale,
        label: locale,
        toneNotes: 'Pending brief import.',
        status: 'queued',
        updatedAt: new Date().toISOString(),
      });
    }
    if (!this.brief.locales.includes(locale)) {
      this.brief.locales.push(locale);
    }
  }

  dismissToast(): void {
    this.toast = null;
  }

  private ensureVariantSelections(): void {
    for (const channel of this.channels) {
      this.ensureVariantSelection(channel.id);
    }
  }

  private ensureVariantSelection(channelId: AdChannelId): void {
    const variants = this.variantsByChannel[channelId] ?? [];
    this.workspace.variantSelections[channelId] = variants[0]?.id ?? null;
  }

  private parseCommaList(value: string): string[] {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  private parseLineList(value: string): string[] {
    return value
      .split(/\n+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  private recalculateFinalUrl(): void {
    const { baseUrl, source, medium, campaign, content, term } = this.brief.utm;
    if (!baseUrl) {
      this.brief.utm.finalUrl = '';
      return;
    }
    const params = new URLSearchParams({
      utm_source: source,
      utm_medium: medium,
      utm_campaign: campaign,
      utm_content: content,
    });
    if (term) {
      params.set('utm_term', term);
    }
    this.brief.utm.finalUrl = `${baseUrl.replace(/\/$/, '')}?${params.toString()}`;
  }

  private syncBuffersFromBrief(): void {
    this.keywordBuffer = this.brief.keywords.join(', ');
    this.differentiatorBuffer = this.brief.differentiators.join('\n');
    this.requiredPhraseBuffer = this.brief.requiredPhrases.join(', ');
    this.bannedWordBuffer = this.brief.bannedWords.join(', ');
    this.disclaimerBuffer = this.brief.disclaimers.join('\n');
  }

  private countVariantsForSelectedChannels(): number {
    let total = 0;
    for (const channelId of this.brief.channels) {
      total += (this.variantsByChannel[channelId] ?? []).length;
    }
    return total;
  }

  private createVariantFromBrief(channelId: AdChannelId): AdVariant | null {
    const channel = this.channels.find((item) => item.id === channelId);
    if (!channel) return null;
    const variants = this.variantsByChannel[channelId] ?? [];
    const index = variants.length;
    const labelSuffix = String.fromCharCode('A'.charCodeAt(0) + index);
    const angleId = this.brief.angles[index % this.brief.angles.length] ?? this.brief.angles[0];
    const toneId = this.brief.tone;
    const fields: Record<string, string> = {};
    for (const field of channel.fields) {
      fields[field.id] = this.composeFieldValue(channelId, field.id, angleId ?? 'benefit-first', field);
    }
    const variant: AdVariant = {
      id: `${channelId}-${Date.now()}-${index}`,
      label: `Variant ${labelSuffix}`,
      channelId,
      locale: this.workspace.selectedLocale,
      angleId: angleId ?? 'benefit-first',
      toneId,
      hypothesis: this.brief.hypothesis,
      fields,
      counters: {},
      metrics: {
        readiness: Math.min(95, 72 + index * 5),
        compliance: this.plan === 'pro' ? 92 : 85,
        conversion: Math.min(92, 70 + index * 4),
      },
      notes: [`Angle: ${angleId ?? 'benefit-first'}`, `Tone: ${toneId}`],
    };
    this.updateVariantCounters(variant);
    return variant;
  }

  private composeFieldValue(
    channelId: AdChannelId,
    fieldId: string,
    angleId: AdAngleId,
    field: AdChannelField,
  ): string {
    const { product, offer, valueProp, differentiators, keywords, utm } = this.brief;
    const differentiator = differentiators[0] ?? 'AI campaign workspace';
    const keyword = keywords[0] ?? 'automation';
    const tone = this.tones.find((tone) => tone.id === this.brief.tone);
    const angle = this.angles.find((item) => item.id === angleId);
    const hook = angle?.hook ?? valueProp;
    const max = field.hardLimit ?? field.recommended ?? 120;
    const slugify = (value: string, limit = max) =>
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
        .slice(0, limit);
    const trim = (value: string, limit = max) => (limit ? value.slice(0, limit) : value);

    switch (fieldId) {
      case 'headline_1':
      case 'headline':
        return trim(`${hook}`);
      case 'headline_2':
        return trim(`${product} ${differentiator}`);
      case 'headline_3':
        return trim(`${offer} inside Ansiversa`);
      case 'long_headline':
        return trim(`${hook} — ${valueProp}`);
      case 'description_1':
      case 'description':
        return trim(`${valueProp} ${differentiator}.`);
      case 'description_2':
        return trim(`Keep campaigns aligned with ${tone?.label ?? 'AI'} guardrails.`);
      case 'intro':
        return trim(
          `${product} helps revenue teams orchestrate compliant campaigns across Google, Meta, LinkedIn, and more with audit-ready trails.`,
        );
      case 'primary_text': {
        const segments = [
          hook,
          offer ? `Start with the ${offer}.` : '',
          valueProp,
          tone ? tone.description : '',
        ];
        return trim(segments.join(' ').replace(/\s+/g, ' ').trim());
      }
      case 'text': {
        const parts = [hook, offer ? `${offer} available now.` : '', `${differentiator}.`];
        return trim(parts.join(' ').replace(/\s+/g, ' ').trim());
      }
      case 'display_name':
        return trim(product, 30);
      case 'path_1':
        return slugify(keyword, 15);
      case 'path_2':
        return slugify(angleId.split('-')[0] ?? angleId, 15);
      case 'cta':
        return this.resolveDefaultCta(channelId, angleId);
      case 'final_url':
      case 'url':
        return utm.finalUrl || utm.baseUrl;
      default:
        return trim(valueProp);
    }
  }

  private resolveDefaultCta(channelId: AdChannelId, angleId: AdAngleId): string {
    if (channelId === 'linkedin') return 'Book a demo';
    if (channelId === 'meta-feed') return angleId === 'urgency-fomo' ? 'Sign Up' : 'Learn More';
    if (channelId === 'tiktok') return 'Learn More';
    if (channelId === 'youtube') return 'Learn More';
    return 'Learn More';
  }

  private updateVariantCounters(variant: AdVariant): void {
    const channel = this.channels.find((item) => item.id === variant.channelId);
    if (!channel) return;
    for (const field of channel.fields) {
      const value = variant.fields[field.id] ?? '';
      variant.counters[field.id] = fallbackCounters(value, field);
    }
  }
}

const store = new AdCopyAssistantStore();
Alpine.store('adCopyAssistant', store);

import Alpine from 'alpinejs';
import { BaseStore, clone } from '../../../alpineStores/base';
import type {
  CreativeTitleState,
  TitleAssetType,
  TitleBundle,
  TitleDevice,
  TitleLocalizationSample,
  TitlePov,
  TitleTone,
  TitleVariant,
  TitleExportPreset,
} from '../../../types/creative-title-maker';
import {
  getAssetTypeOptions,
  getBriefKnobs,
  getExportPresets,
  getLocalizationSamples,
  getPlanLimits,
  getScoreExplainers,
  getThemeBuckets,
  getTitleBundles,
  getTitleVariants,
  getToneOptions,
  getPovOptions,
  getStyleDeviceOptions,
  getWorkspaceMetrics,
  getHeroHighlights,
  getHeroStats,
  getRiskFlags,
  getIntegrationCards,
  getApiEndpoints,
} from '../data/creativeTitleMakerData';

class CreativeTitleMakerStore extends BaseStore {
  state: CreativeTitleState;
  private initialized = false;

  readonly assetTypeOptions = getAssetTypeOptions();
  readonly toneOptions = getToneOptions();
  readonly povOptions = getPovOptions();
  readonly deviceOptions = getStyleDeviceOptions();
  readonly knobCards = getBriefKnobs();
  readonly themeBuckets = getThemeBuckets();
  readonly heroHighlights = getHeroHighlights();
  readonly heroStats = getHeroStats();
  readonly riskFlags = getRiskFlags();
  readonly integrations = getIntegrationCards();
  readonly apiEndpoints = getApiEndpoints();

  constructor() {
    super();
    const variants = getTitleVariants();
    const bundles = getTitleBundles();
    const activeBundleId = bundles[0]?.id ?? 'benefit-pack';
    const activeVariantId = variants[0]?.id ?? '';

    this.state = {
      plan: 'pro',
      brief: {
        assetType: 'landingPage',
        tone: 'bold',
        pov: 'brand',
        primaryKeyword: 'Ansiversa',
        secondaryKeyword: 'creative title maker',
        audience: 'Product marketing teams',
        maxChars: 60,
        maxWords: 12,
        syllableTarget: 22,
        locale: 'en-US',
        includeKeywordFront: true,
        seoMode: true,
        theme: bundles[0]?.theme ?? 'benefit',
        devices: ['numeral', 'colon'],
      },
      metrics: getWorkspaceMetrics(),
      variants,
      bundles,
      selectedBundleId: activeBundleId,
      activeVariantId,
      scoreExplainers: getScoreExplainers(),
      riskFlags: getRiskFlags(),
      localizationSamples: getLocalizationSamples(),
      selectedLocaleId: 'es-ES',
      exportPresets: getExportPresets(),
      selectedExportId: 'csv-bulk',
      apiEndpoints: getApiEndpoints(),
      themeBuckets: getThemeBuckets(),
      planLimits: getPlanLimits(),
    };
  }

  initLanding(): void {
    if (this.initialized) return;
    this.initialized = true;
    this.showLoaderBriefly(250);
  }

  get activeVariant(): TitleVariant | null {
    const id = this.state.activeVariantId;
    if (!id) return this.state.variants[0] ?? null;
    return this.state.variants.find((variant) => variant.id === id) ?? this.state.variants[0] ?? null;
  }

  get activeBundle(): TitleBundle | null {
    const id = this.state.selectedBundleId;
    if (!id) return this.state.bundles[0] ?? null;
    return this.state.bundles.find((bundle) => bundle.id === id) ?? this.state.bundles[0] ?? null;
  }

  get selectedLocale(): TitleLocalizationSample | null {
    const id = this.state.selectedLocaleId;
    if (!id) return this.state.localizationSamples[0] ?? null;
    return (
      this.state.localizationSamples.find((sample) => sample.id === id) ?? this.state.localizationSamples[0] ?? null
    );
  }

  get selectedExport(): TitleExportPreset | null {
    const id = this.state.selectedExportId;
    if (!id) return this.state.exportPresets[0] ?? null;
    return this.state.exportPresets.find((preset) => preset.id === id) ?? this.state.exportPresets[0] ?? null;
  }

  get seoGuardrailSummary(): string {
    const brief = this.state.brief;
    const keywordPlacement = brief.includeKeywordFront ? 'front-loaded keyword' : 'flex keyword placement';
    const seoMode = brief.seoMode ? 'SERP guardrails active' : 'SEO relaxed';
    return `${keywordPlacement} · ${seoMode} · ${brief.maxChars} char max`;
  }

  setPlan(plan: 'free' | 'pro'): void {
    if (this.state.plan === plan) return;
    this.state.plan = plan;
  }

  toggleSeoMode(): void {
    this.state.brief.seoMode = !this.state.brief.seoMode;
    if (this.state.brief.seoMode && !this.state.brief.includeKeywordFront) {
      this.state.brief.includeKeywordFront = true;
    }
  }

  setAssetType(assetType: TitleAssetType): void {
    if (this.state.brief.assetType === assetType) return;
    this.state.brief.assetType = assetType;
    switch (assetType) {
      case 'email':
        this.state.brief.maxChars = 60;
        this.state.brief.maxWords = 9;
        this.state.brief.devices = this.syncDevices(['question', 'proof']);
        break;
      case 'short':
        this.state.brief.maxChars = 80;
        this.state.brief.maxWords = 10;
        this.state.brief.devices = this.syncDevices(['emoji', 'command']);
        break;
      case 'video':
        this.state.brief.maxChars = 100;
        this.state.brief.maxWords = 14;
        this.state.brief.devices = this.syncDevices(['numeral', 'colon', 'question']);
        break;
      default:
        this.state.brief.maxChars = 60;
        this.state.brief.maxWords = 12;
        break;
    }
  }

  setTone(tone: TitleTone): void {
    this.state.brief.tone = tone;
  }

  setPov(pov: TitlePov): void {
    this.state.brief.pov = pov;
  }

  setKeyword(keyword: string): void {
    this.state.brief.primaryKeyword = keyword;
  }

  setSecondaryKeyword(keyword: string): void {
    this.state.brief.secondaryKeyword = keyword;
  }

  setAudience(value: string): void {
    this.state.brief.audience = value;
  }

  setLocale(locale: string): void {
    this.state.brief.locale = locale;
  }

  setSyllableTarget(value: number | null): void {
    this.state.brief.syllableTarget = value;
  }

  toggleDevice(device: TitleDevice): void {
    const devices = this.state.brief.devices;
    if (devices.includes(device)) {
      this.state.brief.devices = devices.filter((item) => item !== device);
    } else {
      this.state.brief.devices = [...devices, device];
    }
  }

  private syncDevices(defaults: TitleDevice[]): TitleDevice[] {
    const allowed = new Set(this.deviceOptions.map((device) => device.id));
    return defaults.filter((device) => allowed.has(device));
  }

  selectBundle(id: string): void {
    if (this.state.selectedBundleId === id) return;
    const bundle = this.state.bundles.find((item) => item.id === id);
    if (!bundle) return;
    this.state.selectedBundleId = id;
    const candidate = bundle.variantIds[0];
    if (candidate) {
      this.selectVariant(candidate);
    }
  }

  selectVariant(id: string): void {
    if (this.state.activeVariantId === id) return;
    const variant = this.state.variants.find((item) => item.id === id);
    if (!variant) return;
    this.state.activeVariantId = id;
    if (!this.state.brief.devices.length) {
      this.state.brief.devices = clone(variant.devices);
    }
  }

  cycleBundle(direction: 'forward' | 'backward' = 'forward'): void {
    const currentIndex = this.state.bundles.findIndex((bundle) => bundle.id === this.state.selectedBundleId);
    if (currentIndex === -1) {
      this.state.selectedBundleId = this.state.bundles[0]?.id ?? '';
      return;
    }
    const delta = direction === 'forward' ? 1 : -1;
    const nextIndex = (currentIndex + delta + this.state.bundles.length) % this.state.bundles.length;
    const nextBundle = this.state.bundles[nextIndex];
    if (nextBundle) {
      this.selectBundle(nextBundle.id);
    }
  }

  selectLocale(id: string): void {
    if (this.state.selectedLocaleId === id) return;
    const sample = this.state.localizationSamples.find((item) => item.id === id);
    if (!sample) return;
    this.state.selectedLocaleId = id;
  }

  selectExport(id: string): void {
    if (this.state.selectedExportId === id) return;
    const preset = this.state.exportPresets.find((item) => item.id === id);
    if (!preset) return;
    this.state.selectedExportId = id;
  }

  regenerateBundle(id: string): void {
    const bundle = this.state.bundles.find((item) => item.id === id);
    if (!bundle) return;
    this.showLoaderBriefly(300);
    const metrics = this.state.metrics.map((metric) => {
      if (metric.id !== 'variants') return metric;
      const numeric = parseInt(metric.value, 10);
      if (Number.isNaN(numeric)) return metric;
      return { ...metric, value: String(numeric + 3), trend: 'Refreshed pack just now' };
    });
    this.state.metrics = metrics;
    if (bundle.variantIds.length) {
      this.selectVariant(bundle.variantIds[0]);
    }
  }

  variantsForBundle(bundleId: string): TitleVariant[] {
    const bundle = this.state.bundles.find((item) => item.id === bundleId);
    if (!bundle) return [];
    return this.state.variants.filter((variant) => bundle.variantIds.includes(variant.id));
  }
}

Alpine.store('creativeTitleMaker', new CreativeTitleMakerStore());

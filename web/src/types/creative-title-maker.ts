export type TitleAssetType =
  | 'article'
  | 'video'
  | 'short'
  | 'podcast'
  | 'book'
  | 'course'
  | 'landingPage'
  | 'email'
  | 'ad';

export type TitleTone = 'professional' | 'playful' | 'bold' | 'sincere' | 'confident';
export type TitlePov = 'you' | 'we' | 'brand';

export type TitleDevice =
  | 'numeral'
  | 'alliteration'
  | 'rhyme'
  | 'pun'
  | 'colon'
  | 'question'
  | 'command'
  | 'proof'
  | 'emoji';

export type TitleBucket =
  | 'benefit'
  | 'curiosity'
  | 'contrarian'
  | 'social'
  | 'proof'
  | 'howto'
  | 'listicle'
  | 'timely';

export type KeywordPlacement = 'front' | 'middle' | 'end';

export interface TitleVariantScore {
  clarity: number;
  novelty: number;
  seo: number;
  ctrIntent: number;
  brandFit: number;
}

export interface TitleVariant {
  id: string;
  text: string;
  bucket: TitleBucket;
  locale: string;
  tone: TitleTone;
  devices: TitleDevice[];
  keyword: string;
  keywordPlacement: KeywordPlacement;
  chars: number;
  words: number;
  syllables: number;
  slug: string;
  serpPreview: string;
  rationale: string[];
  flags: string[];
  scores: TitleVariantScore;
}

export interface TitleBundle {
  id: string;
  label: string;
  description: string;
  focus: string;
  variantIds: string[];
  theme: TitleBucket;
  highlight: string;
}

export interface TitleLocalizationSample {
  id: string;
  locale: string;
  language: string;
  title: string;
  adaptation: string;
  preservedTerms: string[];
  approach: string;
  note: string;
}

export interface TitleExportPreset {
  id: string;
  format: 'csv' | 'json' | 'pdf';
  label: string;
  description: string;
  includes: string[];
  bestFor: string;
  plan: 'free' | 'pro';
}

export interface TitlePlanLimits {
  projects: number | 'unlimited';
  variantsPerBrief: number;
  seoMode: 'basic' | 'full';
  localization: number | 'multi';
  exports: string[];
  integrations: string;
  history: string;
}

export interface TitleScoreExplainer {
  metric: keyof TitleVariantScore;
  label: string;
  score: number;
  highlights: string[];
  improvements: string[];
}

export interface TitleRiskFlag {
  id: string;
  label: string;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface TitleBriefKnob {
  id: string;
  label: string;
  description: string;
  type: 'select' | 'toggle' | 'slider' | 'chips';
  icon: string;
}

export interface TitleWorkspaceMetric {
  id: string;
  label: string;
  value: string;
  detail: string;
  icon: string;
  trend?: string;
}

export interface TitleIntegrationCard {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: string;
  actionLabel: string;
}

export interface TitleApiEndpoint {
  method: 'GET' | 'POST';
  path: string;
  description: string;
}

export interface TitleThemeBucket {
  id: TitleBucket;
  label: string;
  description: string;
  icon: string;
}

export interface CreativeTitleBrief {
  assetType: TitleAssetType;
  tone: TitleTone;
  pov: TitlePov;
  primaryKeyword: string;
  secondaryKeyword: string;
  audience: string;
  maxChars: number;
  maxWords: number;
  syllableTarget: number | null;
  locale: string;
  includeKeywordFront: boolean;
  seoMode: boolean;
  theme: TitleBucket;
  devices: TitleDevice[];
}

export interface CreativeTitleState {
  plan: 'free' | 'pro';
  brief: CreativeTitleBrief;
  metrics: TitleWorkspaceMetric[];
  variants: TitleVariant[];
  bundles: TitleBundle[];
  selectedBundleId: string;
  activeVariantId: string;
  scoreExplainers: TitleScoreExplainer[];
  riskFlags: TitleRiskFlag[];
  localizationSamples: TitleLocalizationSample[];
  selectedLocaleId: string;
  exportPresets: TitleExportPreset[];
  selectedExportId: string;
  apiEndpoints: TitleApiEndpoint[];
  themeBuckets: TitleThemeBucket[];
  planLimits: Record<'free' | 'pro', TitlePlanLimits>;
}

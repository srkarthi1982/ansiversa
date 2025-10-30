export type AdPlan = 'free' | 'pro';

export type AdChannelId =
  | 'google-search'
  | 'meta-feed'
  | 'linkedin'
  | 'x'
  | 'tiktok'
  | 'youtube';

export type AdChannelFieldType = 'text' | 'textarea' | 'url' | 'path' | 'enum';

export interface AdChannelField {
  id: string;
  label: string;
  type: AdChannelFieldType;
  required: boolean;
  hardLimit?: number;
  recommended?: number;
  description: string;
  placeholder?: string;
  options?: string[];
}

export interface AdChannelSpec {
  id: AdChannelId;
  name: string;
  icon: string;
  summary: string;
  fields: AdChannelField[];
  guidance: string[];
  creativeHints: string[];
}

export type AdAngleId =
  | 'price-value'
  | 'urgency-fomo'
  | 'social-proof'
  | 'credibility'
  | 'pain-relief'
  | 'benefit-first'
  | 'curiosity'
  | 'comparison'
  | 'guarantee';

export interface AdAnglePreset {
  id: AdAngleId;
  title: string;
  description: string;
  bestFor: string[];
  hook: string;
}

export type AdToneId =
  | 'professional'
  | 'friendly'
  | 'playful'
  | 'serious'
  | 'minimal'
  | 'bold';

export interface AdTonePreset {
  id: AdToneId;
  label: string;
  description: string;
  sliders: {
    warmth: number;
    energy: number;
    formality: number;
  };
  voiceNotes: string[];
}

export interface AdUtmPayload {
  baseUrl: string;
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
  finalUrl: string;
  shortlink?: string;
}

export interface AdCampaignBrief {
  product: string;
  offer: string;
  audience: string;
  goal: string;
  valueProp: string;
  differentiators: string[];
  keywords: string[];
  requiredPhrases: string[];
  bannedWords: string[];
  disclaimers: string[];
  tone: AdToneId;
  angles: AdAngleId[];
  channels: AdChannelId[];
  locales: string[];
  utm: AdUtmPayload;
  hypothesis: string;
}

export interface AdVariantFieldCounter {
  length: number;
  hardLimit?: number;
  recommended?: number;
  remaining?: number;
  exceeded: boolean;
  warn: boolean;
}

export interface AdVariantMetrics {
  readiness: number;
  compliance: number;
  conversion: number;
}

export interface AdVariant {
  id: string;
  label: string;
  channelId: AdChannelId;
  locale: string;
  angleId: AdAngleId;
  toneId: AdToneId;
  hypothesis: string;
  fields: Record<string, string>;
  counters: Record<string, AdVariantFieldCounter>;
  metrics: AdVariantMetrics;
  notes: string[];
}

export type AdComplianceSeverity = 'info' | 'warning' | 'error';

export interface AdComplianceIssue {
  id: string;
  channelId: AdChannelId;
  variantId: string;
  fieldId: string;
  severity: AdComplianceSeverity;
  rule: string;
  message: string;
  suggestion: string;
  rewrite: string;
  status: 'open' | 'resolved';
}

export interface AdLocalizationBundle {
  locale: string;
  label: string;
  toneNotes: string;
  status: 'queued' | 'in-progress' | 'ready' | 'blocked';
  reviewer?: string;
  updatedAt: string;
}

export interface AdPlanLimit {
  plan: AdPlan;
  campaigns: number;
  variantsPerChannel: number;
  locales: number;
  exports: Array<'csv' | 'json' | 'pdf'>;
  compliance: 'basic' | 'advanced';
  integrations: 'view' | 'one-click';
}

export interface AdExportPreset {
  id: string;
  label: string;
  format: 'csv' | 'json' | 'pdf';
  description: string;
  includes: string[];
  plan: AdPlan;
}

export interface AdIntegrationShortcut {
  id: string;
  name: string;
  href: string;
  description: string;
  icon: string;
}

export interface AdUtmTemplate {
  id: string;
  name: string;
  description: string;
  values: Pick<AdUtmPayload, 'source' | 'medium' | 'campaign' | 'content' | 'term'>;
}

export interface AdAnalyticsSummary {
  experimentsRun: number;
  avgLift: number;
  savedHours: number;
  variantsGenerated: number;
}

export interface AdCampaignSummary {
  id: string;
  name: string;
  channelMix: AdChannelId[];
  status: 'draft' | 'live' | 'paused';
  lastUpdated: string;
  lift: number;
  note: string;
}

export type CaptionPlatformId =
  | "insta"
  | "x"
  | "linkedin"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "pinterest";

export type CaptionPlan = "free" | "pro";

export interface CaptionPlatform {
  id: CaptionPlatformId;
  name: string;
  icon: string;
  limit: number;
  recommendedHashtags: string;
  description: string;
  usageNotes: string[];
}

export interface CaptionBrandVoice {
  id: string;
  name: string;
  tone: "friendly" | "professional" | "playful" | "bold" | "minimal";
  description: string;
  personality: string[];
  phrases: {
    prefer: string[];
    avoid: string[];
  };
  emojiPolicy: "none" | "light" | "rich";
}

export interface CaptionHashtagSet {
  id: string;
  name: string;
  tags: string[];
  category: string;
}

export interface CaptionCtaPreset {
  id: string;
  label: string;
  text: string;
  tone: "soft" | "direct" | "urgent";
}

export interface CaptionUtmConfig {
  base: string;
  source: string;
  medium: string;
  campaign: string;
  content: string;
  url: string;
}

export interface CaptionComplianceFlag {
  id: string;
  severity: "info" | "warning" | "error";
  message: string;
}

export interface CaptionVariantScore {
  clarity: number;
  punch: number;
  compliance: number;
}

export interface CaptionVariant {
  id: string;
  platformId: CaptionPlatformId;
  title: string;
  text: string;
  hashtags: string[];
  language: string;
  link?: string;
  cta?: string;
  counters: {
    characters: number;
    remaining: number;
    hashtags: number;
  };
  compliance: CaptionComplianceFlag[];
  score: CaptionVariantScore;
  createdAt: string;
  updatedAt: string;
}

export interface CaptionDraft {
  id: string;
  title: string;
  slug: string;
  shareSlug: string;
  status: "draft" | "published";
  idea: string;
  platforms: CaptionPlatformId[];
  voiceId: string | null;
  hashtagSetId: string | null;
  ctaId: string | null;
  utm?: CaptionUtmConfig;
  variants: Record<CaptionPlatformId, CaptionVariant[]>;
  chosen: Partial<Record<CaptionPlatformId, string>>;
  createdAt: string;
  lastSavedAt: string | null;
  publishedAt: string | null;
}

export interface CaptionTemplate {
  key: string;
  title: string;
  category: "Product" | "Marketing" | "Community" | "Hiring" | "Event" | "Education";
  description: string;
  idea: string;
  platforms: CaptionPlatformId[];
  voiceId: string;
  hashtagSetId: string;
  ctaId: string;
  sampleHook: string;
}

export interface CaptionCampaignItem {
  id: string;
  captionId: string;
  title: string;
  platforms: CaptionPlatformId[];
  dueOn: string;
  status: "draft" | "ready" | "scheduled";
  assets: string[];
  link?: string;
}

export interface CaptionCampaign {
  id: string;
  title: string;
  description: string;
  ownerPlan: CaptionPlan;
  startOn: string;
  endOn: string;
  status: "planning" | "in-flight" | "completed";
  items: CaptionCampaignItem[];
}

export interface CaptionPlanLimits {
  plan: CaptionPlan;
  generationsPerMonth: number | "unlimited";
  brandVoices: number | "unlimited";
  hashtagSets: number | "unlimited";
  localization: boolean;
  exports: Array<"csv" | "md" | "json">;
  shareWatermark: boolean;
}

export interface CaptionGeneratorPayload {
  idea: string;
  platforms: CaptionPlatformId[];
  voiceId: string | null;
  hashtagSetId: string | null;
  ctaId: string | null;
  link: string;
  utm: CaptionUtmConfig;
}

export type CaptionLocalizationTarget = {
  lang: string;
  label: string;
  rtl?: boolean;
  status: "queued" | "ready" | "error";
};

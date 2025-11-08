import type {
  CaptionBrandVoice,
  CaptionCampaign,
  CaptionCampaignItem,
  CaptionCtaPreset,
  CaptionDraft,
  CaptionGeneratorPayload,
  CaptionHashtagSet,
  CaptionPlan,
  CaptionPlanLimits,
  CaptionPlatform,
  CaptionPlatformId,
  CaptionTemplate,
  CaptionVariant,
  CaptionVariantScore,
} from "../types/caption";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const nowIso = () => new Date().toISOString();
const formatDate = (value: number | Date) => new Date(value).toISOString().slice(0, 10);

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60) || "caption";

const randomFromSeed = (seed: string) => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index);
    hash |= 0;
  }
  const normalized = Math.abs(hash % 1000) / 1000;
  return normalized;
};

const platformCatalog: CaptionPlatform[] = [
  {
    id: "insta",
    name: "Instagram",
    icon: "fab fa-instagram",
    limit: 2200,
    recommendedHashtags: "3-15",
    description: "Keep hooks punchy in the first line and lean into emoji-rich storytelling.",
    usageNotes: [
      "Links are not clickable in the caption. Remind users to check the bio.",
      "Use line breaks or emojis to pace the copy.",
      "Blend branded and discovery hashtags.",
    ],
  },
  {
    id: "x",
    name: "X (Twitter)",
    icon: "fab fa-x-twitter",
    limit: 280,
    recommendedHashtags: "0-2",
    description: "Short, punchy, and reactive copy works best with a single CTA.",
    usageNotes: [
      "Avoid more than two hashtags to protect readability.",
      "Keep the core message within the first 120 characters.",
    ],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "fab fa-linkedin",
    limit: 3000,
    recommendedHashtags: "3-5",
    description: "Professional tone with clear context and value framing.",
    usageNotes: [
      "Lead with an insight or community benefit.",
      "Close with a question or CTA to encourage comments.",
    ],
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "fab fa-facebook",
    limit: 63206,
    recommendedHashtags: "0-2",
    description: "Conversational storytelling with a focus on the first 125 characters.",
    usageNotes: [
      "Emphasize community and product benefits early.",
      "Hashtags are optional. Use sparingly for clarity.",
    ],
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "fab fa-tiktok",
    limit: 2200,
    recommendedHashtags: "3-6",
    description: "Pair short copy with scannable hashtags that match the video vibe.",
    usageNotes: [
      "Keep the CTA simple and reference on-screen actions.",
      "Lean into trending or community hashtags when relevant.",
    ],
  },
  {
    id: "youtube",
    name: "YouTube Shorts",
    icon: "fab fa-youtube",
    limit: 5000,
    recommendedHashtags: "2-3",
    description: "Lead with a hook, then add context and hashtags near the end.",
    usageNotes: [
      "Mention the core payoff within the first sentence.",
      "Reference the subscribe CTA when relevant.",
    ],
  },
  {
    id: "pinterest",
    name: "Pinterest",
    icon: "fab fa-pinterest",
    limit: 500,
    recommendedHashtags: "3-6",
    description: "Keyword-friendly descriptions that explain the visual and CTA.",
    usageNotes: [
      "Include a descriptive sentence with keywords.",
      "Guide readers to click through for more details.",
    ],
  },
];

const platformMap = new Map(platformCatalog.map((item) => [item.id, item]));

const brandVoices: CaptionBrandVoice[] = [
  {
    id: "ansiversa-bold",
    name: "Bold Launch",
    tone: "bold",
    description: "High-energy announcements that feel confident and visionary.",
    personality: ["Visionary", "Direct", "Action-first"],
    phrases: {
      prefer: ["inside Ansiversa", "mini-app", "launch"],
      avoid: ["maybe", "someday"],
    },
    emojiPolicy: "rich",
  },
  {
    id: "ansiversa-friendly",
    name: "Friendly Guide",
    tone: "friendly",
    description: "Conversational helper voice designed to make teams feel supported.",
    personality: ["Supportive", "Curious", "Helpful"],
    phrases: {
      prefer: ["here to help", "your workflow"],
      avoid: ["confusing", "overwhelmed"],
    },
    emojiPolicy: "light",
  },
  {
    id: "ansiversa-minimal",
    name: "Minimal Analyst",
    tone: "minimal",
    description: "Precise, data-first updates with a focus on clarity.",
    personality: ["Analytical", "Concise", "Calm"],
    phrases: {
      prefer: ["summary", "signal", "insight"],
      avoid: ["fluff", "noise"],
    },
    emojiPolicy: "none",
  },
];

const hashtagSets: CaptionHashtagSet[] = [
  {
    id: "launch-default",
    name: "Product Launch Essentials",
    category: "Launch",
    tags: ["ansiversa", "productlaunch", "buildinpublic", "startuptools", "automation"],
  },
  {
    id: "creators",
    name: "Creator Community",
    category: "Community",
    tags: ["creatoreconomy", "nocode", "aiworkflow", "marketingtips"],
  },
  {
    id: "hiring",
    name: "Hiring Spotlight",
    category: "Hiring",
    tags: ["hiring", "remotework", "careers", "nowhiring"],
  },
];

const ctaPresets: CaptionCtaPreset[] = [
  { id: "learn", label: "Learn more", text: "Learn more", tone: "soft" },
  { id: "try", label: "Try it now", text: "Try it today", tone: "direct" },
  { id: "book", label: "Book a demo", text: "Book a quick demo", tone: "urgent" },
];

const planLimits: CaptionPlanLimits[] = [
  {
    plan: "free",
    generationsPerMonth: 20,
    brandVoices: 1,
    hashtagSets: 2,
    localization: false,
    exports: ["csv", "md"],
    shareWatermark: true,
  },
  {
    plan: "pro",
    generationsPerMonth: "unlimited",
    brandVoices: "unlimited",
    hashtagSets: "unlimited",
    localization: true,
    exports: ["csv", "md", "json"],
    shareWatermark: false,
  },
];

const platformOpeners: Record<CaptionPlatformId, string> = {
  insta: "🚀",
  x: "⚡",
  linkedin: "📈",
  facebook: "🌟",
  tiktok: "🎬",
  youtube: "▶️",
  pinterest: "📌",
};

const voiceLeadIns: Record<string, string> = {
  "ansiversa-bold": "Big news:",
  "ansiversa-friendly": "We're excited to share:",
  "ansiversa-minimal": "Update:",
};

const voiceClosers: Record<string, string> = {
  "ansiversa-bold": "Let’s build faster together.",
  "ansiversa-friendly": "We can't wait to hear what you ship!",
  "ansiversa-minimal": "See the full breakdown in the link.",
};

const platformClosers: Record<CaptionPlatformId, string> = {
  insta: "Tap the link in bio to explore the mini apps.",
  x: "Try it →",
  linkedin: "Let’s connect on the future of work.",
  facebook: "Dive into the full toolkit today.",
  tiktok: "Drop a comment if you want the walkthrough!",
  youtube: "Subscribe for the build diaries.",
  pinterest: "Save this idea for your launch checklist.",
};

const complianceFor = (variant: CaptionVariant): CaptionVariant["compliance"] => {
  const platform = platformMap.get(variant.platformId);
  if (!platform) return [];
  const flags: CaptionVariant["compliance"] = [];
  if (variant.counters.characters > platform.limit) {
    flags.push({
      id: `${variant.id}-length`,
      severity: "error",
      message: `Over the ${platform.limit} character limit. Trim ${variant.counters.characters - platform.limit} characters.`,
    });
  } else if (platform.limit - variant.counters.characters < 40) {
    flags.push({
      id: `${variant.id}-length-close`,
      severity: "warning",
      message: `Close to the limit. Only ${variant.counters.remaining} characters left.`,
    });
  }

  if (variant.platformId === "insta" && variant.link) {
    flags.push({
      id: `${variant.id}-link`,
      severity: "info",
      message: "Instagram captions can't include clickable links. Mention the bio or Stories instead.",
    });
  }

  if (variant.platformId === "x" && variant.hashtags.length > 2) {
    flags.push({
      id: `${variant.id}-hashtags`,
      severity: "warning",
      message: "X performs best with 0-2 hashtags. Consider trimming the list.",
    });
  }

  return flags;
};

const scoreFor = (seed: string): CaptionVariantScore => {
  const base = randomFromSeed(seed);
  const clarity = Math.round(70 + base * 25);
  const punch = Math.round(65 + ((base * 930) % 1) * 25);
  const compliance = Math.round(80 + ((base * 1723) % 1) * 18);
  return {
    clarity: Math.min(100, clarity),
    punch: Math.min(100, punch),
    compliance: Math.min(100, compliance),
  };
};

const buildVariant = (
  platformId: CaptionPlatformId,
  idea: string,
  voiceId: string | null,
  ctaId: string | null,
  hashtagSet: CaptionHashtagSet | null,
  link: string,
  index: number,
): CaptionVariant => {
  const id = `${platformId}-${Date.now().toString(36)}-${index}`;
  const opener = platformOpeners[platformId];
  const leadIn = voiceId ? voiceLeadIns[voiceId] ?? "" : "";
  const closer = platformClosers[platformId];
  const voiceCloser = voiceId ? voiceClosers[voiceId] ?? "" : "";
  const cta = ctaPresets.find((item) => item.id === ctaId)?.text ?? "Learn more";
  const hashtags = hashtagSet ? hashtagSet.tags.slice(0, Math.max(3, 2 + index)) : [];

  const sentences = [
    `${opener} ${leadIn}`.trim(),
    idea,
    voiceCloser,
    `${cta}${link ? ` ${link}` : ""}`.trim(),
    closer,
  ].filter(Boolean);

  const text = sentences.join(" \n");
  const characters = text.length;
  const platform = platformMap.get(platformId);
  const remaining = platform ? Math.max(0, platform.limit - characters) : 0;
  const variant: CaptionVariant = {
    id,
    platformId,
    title: index === 0 ? "Primary" : `Variant ${String.fromCharCode(66 + index - 1)}`,
    text,
    hashtags,
    language: "en",
    link,
    cta,
    counters: {
      characters,
      remaining,
      hashtags: hashtags.length,
    },
    compliance: [],
    score: scoreFor(`${platformId}-${idea}-${index}`),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  variant.compliance = complianceFor(variant);
  return variant;
};

const buildDraftFromPayload = (
  payload: CaptionGeneratorPayload,
  options: { id?: string; title?: string; status?: "draft" | "published"; shareSlug?: string } = {},
): CaptionDraft => {
  const { idea, platforms, voiceId, hashtagSetId, ctaId, link, utm } = payload;
  const baseTitle = options.title ?? idea.split(" ").slice(0, 5).join(" ");
  const slug = toSlug(baseTitle);
  const shareSlug = options.shareSlug ?? `${slug}-share`;
  const hashtagSet = hashtagSets.find((item) => item.id === hashtagSetId) ?? null;
  const variants: CaptionDraft["variants"] = {
    insta: [],
    x: [],
    linkedin: [],
    facebook: [],
    tiktok: [],
    youtube: [],
    pinterest: [],
  };

  platforms.forEach((platformId) => {
    variants[platformId] = [
      buildVariant(platformId, idea, voiceId, ctaId, hashtagSet, link, 0),
      buildVariant(platformId, idea, voiceId, ctaId, hashtagSet, link, 1),
      buildVariant(platformId, idea, voiceId, ctaId, hashtagSet, link, 2),
    ];
  });

  const createdAt = nowIso();

  const draft: CaptionDraft = {
    id: options.id ?? `cap-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    title: baseTitle,
    slug,
    shareSlug,
    status: options.status ?? "draft",
    idea,
    platforms,
    voiceId,
    hashtagSetId,
    ctaId,
    utm,
    variants,
    chosen: Object.fromEntries(platforms.map((platformId) => [platformId, variants[platformId][0].id])),
    createdAt,
    lastSavedAt: createdAt,
    publishedAt: options.status === "published" ? createdAt : null,
  };

  return draft;
};

const sampleGeneratorPayloads: CaptionGeneratorPayload[] = [
  {
    idea: "Ansiversa now bundles 100+ AI mini apps to help teams ship faster",
    platforms: ["insta", "x", "linkedin"],
    voiceId: "ansiversa-bold",
    hashtagSetId: "launch-default",
    ctaId: "try",
    link: "https://ansiversa.com", 
    utm: {
      base: "https://ansiversa.com",
      source: "instagram",
      medium: "social",
      campaign: "launch_2025",
      content: "hero_video",
      url: "https://ansiversa.com?utm_source=instagram&utm_medium=social&utm_campaign=launch_2025&utm_content=hero_video",
    },
  },
  {
    idea: "See how product marketers are prototyping campaigns with Ansiversa",
    platforms: ["linkedin", "facebook"],
    voiceId: "ansiversa-friendly",
    hashtagSetId: "creators",
    ctaId: "learn",
    link: "https://ansiversa.com/marketing", 
    utm: {
      base: "https://ansiversa.com/marketing",
      source: "linkedin",
      medium: "social",
      campaign: "marketing_playbook",
      content: "customer_story",
      url: "https://ansiversa.com/marketing?utm_source=linkedin&utm_medium=social&utm_campaign=marketing_playbook&utm_content=customer_story",
    },
  },
  {
    idea: "We're hiring founding engineers to craft delightful AI workflows",
    platforms: ["x", "tiktok", "pinterest"],
    voiceId: "ansiversa-minimal",
    hashtagSetId: "hiring",
    ctaId: "book",
    link: "https://ansiversa.com/careers", 
    utm: {
      base: "https://ansiversa.com/careers",
      source: "x",
      medium: "social",
      campaign: "hiring_spring",
      content: "engineering_role",
      url: "https://ansiversa.com/careers?utm_source=x&utm_medium=social&utm_campaign=hiring_spring&utm_content=engineering_role",
    },
  },
];

const seedDrafts = sampleGeneratorPayloads.map((payload, index) =>
  buildDraftFromPayload(payload, {
    id: `seed-${index + 1}`,
    title: payload.idea.split(" ").slice(0, 6).join(" "),
    status: index === 0 ? "published" : "draft",
    shareSlug: `ansiversa-${index + 1}`,
  }),
);

const sampleCampaignItems: CaptionCampaignItem[] = [
  {
    id: "cmp-item-1",
    captionId: seedDrafts[0].id,
    title: "Launch hero post",
    platforms: ["insta", "linkedin"],
    dueOn: formatDate(new Date().setDate(new Date().getDate() + 2)),
    status: "scheduled",
    assets: ["launch-hero.png"],
    link: seedDrafts[0].utm?.url,
  },
  {
    id: "cmp-item-2",
    captionId: seedDrafts[1].id,
    title: "Customer story teaser",
    platforms: ["facebook"],
    dueOn: formatDate(new Date().setDate(new Date().getDate() + 5)),
    status: "ready",
    assets: ["story-teaser.mp4"],
    link: seedDrafts[1].utm?.url,
  },
  {
    id: "cmp-item-3",
    captionId: seedDrafts[2].id,
    title: "Hiring sprint spotlight",
    platforms: ["x", "tiktok"],
    dueOn: formatDate(new Date().setDate(new Date().getDate() + 9)),
    status: "draft",
    assets: [],
    link: seedDrafts[2].utm?.url,
  },
];

const campaigns: CaptionCampaign[] = [
  {
    id: "cmp-1",
    title: "Mini app launch runway",
    description: "Three-week sprint covering launch hero assets, walkthroughs, and hiring support posts.",
    ownerPlan: "pro",
    startOn: formatDate(new Date().setDate(new Date().getDate() - 3)),
    endOn: formatDate(new Date().setDate(new Date().getDate() + 14)),
    status: "in-flight",
    items: sampleCampaignItems,
  },
];

const templates: CaptionTemplate[] = [
  {
    key: "product-launch",
    title: "Product launch hero",
    category: "Product",
    description: "High-energy announcement template for multi-platform launches.",
    idea: "Announce the latest Ansiversa release",
    platforms: ["insta", "x", "linkedin"],
    voiceId: "ansiversa-bold",
    hashtagSetId: "launch-default",
    ctaId: "try",
    sampleHook: "Ready for 100 AI mini apps in one dashboard?",
  },
  {
    key: "feature-update",
    title: "Feature update",
    category: "Product",
    description: "Structured update focusing on new capabilities and beta invites.",
    idea: "Highlight smart automations shipping this week",
    platforms: ["linkedin", "facebook"],
    voiceId: "ansiversa-friendly",
    hashtagSetId: "creators",
    ctaId: "learn",
    sampleHook: "Fresh workflow templates just landed",
  },
  {
    key: "event-invite",
    title: "Event invite",
    category: "Event",
    description: "Bring your community to live demos, AMAs, and webinars.",
    idea: "Invite followers to the live build workshop",
    platforms: ["instagram", "linkedin", "youtube"] as CaptionPlatformId[],
    voiceId: "ansiversa-friendly",
    hashtagSetId: "creators",
    ctaId: "book",
    sampleHook: "Join our live walkthrough this Thursday",
  },
  {
    key: "hiring-post",
    title: "Hiring spotlight",
    category: "Hiring",
    description: "Structured job announcement with key role highlights.",
    idea: "Announce open roles for the growth team",
    platforms: ["linkedin", "x"],
    voiceId: "ansiversa-minimal",
    hashtagSetId: "hiring",
    ctaId: "book",
    sampleHook: "We’re searching for builders who love thoughtful UX",
  },
];

const planSummaries = new Map<CaptionPlan, CaptionPlanLimits>(planLimits.map((item) => [item.plan, item]));

export const captionPlatforms = () => clone(platformCatalog);
export const captionPlatformDetails = (id: CaptionPlatformId) => clone(platformMap.get(id));
export const captionBrandVoices = () => clone(brandVoices);
export const captionHashtagSets = () => clone(hashtagSets);
export const captionCtaPresets = () => clone(ctaPresets);
export const captionPlanLimits = (plan: CaptionPlan) => clone(planSummaries.get(plan));
export const captionTemplates = () => clone(templates);
export const captionCampaigns = () => clone(campaigns);
export const captionSeedDrafts = () => clone(seedDrafts);

export const createDraftFromGenerator = (payload: CaptionGeneratorPayload, options?: {
  id?: string;
  title?: string;
  status?: "draft" | "published";
  shareSlug?: string;
}): CaptionDraft => clone(buildDraftFromPayload(payload, options));

export const refreshVariantMetrics = (variant: CaptionVariant): CaptionVariant => {
  const platform = platformMap.get(variant.platformId);
  const characters = variant.text.length;
  const remaining = platform ? Math.max(0, platform.limit - characters) : 0;
  const updated: CaptionVariant = {
    ...variant,
    counters: {
      characters,
      remaining,
      hashtags: variant.hashtags.length,
    },
    updatedAt: nowIso(),
  };
  updated.compliance = complianceFor(updated);
  updated.score = scoreFor(`${variant.platformId}-${variant.text}`);
  return updated;
};

export const regenerateDraftVariants = (
  draft: CaptionDraft,
  payload: CaptionGeneratorPayload,
): CaptionDraft => {
  const fresh = buildDraftFromPayload(payload, {
    id: draft.id,
    title: draft.title,
    status: draft.status,
    shareSlug: draft.shareSlug,
  });
  return clone(fresh);
};

export const generatorDefaultPayload = (): CaptionGeneratorPayload => clone(sampleGeneratorPayloads[0]);

export const localizationTargets = () =>
  clone([
    { lang: "es", label: "Spanish", status: "ready" },
    { lang: "de", label: "German", status: "queued" },
    { lang: "ar", label: "Arabic", status: "queued", rtl: true },
    { lang: "hi", label: "Hindi", status: "queued" },
  ]);

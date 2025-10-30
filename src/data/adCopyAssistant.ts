import type {
  AdAnglePreset,
  AdAnalyticsSummary,
  AdCampaignBrief,
  AdCampaignSummary,
  AdChannelId,
  AdChannelSpec,
  AdComplianceIssue,
  AdExportPreset,
  AdIntegrationShortcut,
  AdLocalizationBundle,
  AdPlanLimit,
  AdTonePreset,
  AdUtmPayload,
  AdUtmTemplate,
  AdVariant,
  AdVariantMetrics,
} from '../types/adCopyAssistant';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const buildFinalUrl = (utm: AdUtmPayload): string => {
  const params = new URLSearchParams({
    utm_source: utm.source,
    utm_medium: utm.medium,
    utm_campaign: utm.campaign,
    utm_content: utm.content,
  });
  if (utm.term) {
    params.set('utm_term', utm.term);
  }
  return `${utm.baseUrl.replace(/\/$/, '')}?${params.toString()}`;
};

const channelCatalog: AdChannelSpec[] = [
  {
    id: 'google-search',
    name: 'Google Search & Performance Max',
    icon: 'fab fa-google',
    summary:
      'Responsive search ads with fifteen headlines, four descriptions, and URL paths tuned for conversion intent.',
    fields: [
      {
        id: 'headline_1',
        label: 'Headline 1',
        type: 'text',
        required: true,
        hardLimit: 30,
        recommended: 30,
        description: 'Lead with the clearest benefit or differentiation.',
        placeholder: 'Automate RevOps reporting',
      },
      {
        id: 'headline_2',
        label: 'Headline 2',
        type: 'text',
        required: true,
        hardLimit: 30,
        recommended: 30,
        description: 'Add urgency, proof, or offer reinforcement.',
        placeholder: '14-day launch sprint',
      },
      {
        id: 'headline_3',
        label: 'Headline 3',
        type: 'text',
        required: false,
        hardLimit: 30,
        recommended: 30,
        description: 'Optional third headline for dynamic rotation.',
        placeholder: 'Trusted by growth teams',
      },
      {
        id: 'description_1',
        label: 'Description 1',
        type: 'textarea',
        required: true,
        hardLimit: 90,
        recommended: 90,
        description: 'Expand on the benefit and reinforce the CTA.',
        placeholder: 'Unify briefs, variants, and compliance in one AI workspace.',
      },
      {
        id: 'description_2',
        label: 'Description 2',
        type: 'textarea',
        required: false,
        hardLimit: 90,
        recommended: 90,
        description: 'Optional supporting copy or social proof.',
        placeholder: 'Ship platform-ready ads with zero spreadsheet cleanup.',
      },
      {
        id: 'path_1',
        label: 'Path 1',
        type: 'path',
        required: false,
        hardLimit: 15,
        recommended: 15,
        description: 'Keyword-rich path that mirrors search intent.',
        placeholder: 'pipeline-ai',
      },
      {
        id: 'path_2',
        label: 'Path 2',
        type: 'path',
        required: false,
        hardLimit: 15,
        recommended: 15,
        description: 'Optional secondary path for clarity.',
        placeholder: 'ad-assistant',
      },
      {
        id: 'final_url',
        label: 'Final URL',
        type: 'url',
        required: true,
        description: 'Destination landing page URL used for all variants.',
        placeholder: 'https://ansiversa.com/launchpad',
      },
    ],
    guidance: [
      'Maintain at least 8 unique headlines to increase RSA coverage.',
      'Avoid unsupported superlatives like “#1” without evidence.',
      'Use Dynamic Keyword Insertion sparingly to keep clarity high.',
    ],
    creativeHints: [
      'Pair with presentation mockups from Presentation Designer for PMAX assets.',
      'Highlight automation and integrations to resonate with RevOps teams.',
    ],
  },
  {
    id: 'meta-feed',
    name: 'Meta Feed (Facebook & Instagram)',
    icon: 'fab fa-facebook',
    summary:
      'Primary text, headline, and description tailored for feed and placement variations with CTA enums.',
    fields: [
      {
        id: 'primary_text',
        label: 'Primary text',
        type: 'textarea',
        required: true,
        hardLimit: 2200,
        recommended: 125,
        description: 'Hook plus benefit in the first 125 characters; longer stories allowed.',
        placeholder: 'Growth teams automate campaigns in one collaborative AI hub.',
      },
      {
        id: 'headline',
        label: 'Headline',
        type: 'text',
        required: true,
        hardLimit: 40,
        recommended: 40,
        description: 'Call out the core offer or benefit clearly.',
        placeholder: 'Launch compliant ads in minutes',
      },
      {
        id: 'description',
        label: 'Description',
        type: 'text',
        required: false,
        hardLimit: 30,
        recommended: 30,
        description: 'Optional line that appears on some placements.',
        placeholder: 'Plan variants, UTMs, and exports fast.',
      },
      {
        id: 'cta',
        label: 'CTA',
        type: 'enum',
        required: true,
        description: 'Meta-provided call-to-action selection.',
        options: ['Learn More', 'Book Now', 'Sign Up', 'Subscribe'],
        placeholder: 'Learn More',
      },
      {
        id: 'url',
        label: 'URL',
        type: 'url',
        required: true,
        description: 'Destination or tracking link for the promotion.',
        placeholder: 'https://ansiversa.com/launchpad',
      },
    ],
    guidance: [
      'Lead with community benefits and social proof to improve thumbs-stop rate.',
      'Respect Meta advertising policies around medical or financial claims.',
      'Use sentence case for readability and compliance clarity.',
    ],
    creativeHints: [
      'Pair copy with vertical short-form video; include headline overlay.',
      'Test paid social image specs 1200×628 and 1080×1080 with bold CTA text.',
    ],
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Sponsored Content',
    icon: 'fab fa-linkedin',
    summary:
      'Professional intro text, headline, and description tuned for B2B lead generation campaigns.',
    fields: [
      {
        id: 'intro',
        label: 'Intro text',
        type: 'textarea',
        required: true,
        hardLimit: 600,
        recommended: 150,
        description: 'Provide context, insight, or value before the CTA.',
        placeholder: 'Revenue leaders are switching to Ansiversa LaunchPad to plan cross-channel ads with AI guardrails.',
      },
      {
        id: 'headline',
        label: 'Headline',
        type: 'text',
        required: true,
        hardLimit: 70,
        recommended: 70,
        description: 'Succinct promise or offer highlight.',
        placeholder: 'Unify campaign briefs and creative variants',
      },
      {
        id: 'description',
        label: 'Description',
        type: 'text',
        required: false,
        hardLimit: 100,
        recommended: 100,
        description: 'Optional supporting statement for desktop placements.',
        placeholder: 'Keep brand voice consistent across every locale.',
      },
      {
        id: 'cta',
        label: 'CTA',
        type: 'enum',
        required: true,
        description: 'Choose the appropriate LinkedIn CTA.',
        options: ['Learn more', 'Book a demo', 'Register', 'Download'],
        placeholder: 'Book a demo',
      },
      {
        id: 'url',
        label: 'Destination URL',
        type: 'url',
        required: true,
        description: 'Tracking-ready link for LinkedIn campaigns.',
        placeholder: 'https://ansiversa.com/launchpad',
      },
    ],
    guidance: [
      'Lead with insight or stat to hook professional audiences.',
      'Keep the CTA action-oriented — “Book a demo” works well for SaaS.',
      'Mention compliance or governance benefits when relevant.',
    ],
    creativeHints: [
      'Use thought-leadership style graphics with subtle motion.',
      'Include testimonials or case study metrics in supporting assets.',
    ],
  },
  {
    id: 'x',
    name: 'X (Twitter) Ads',
    icon: 'fab fa-x-twitter',
    summary:
      'Short-form copy optimized for promoted tweets with optional landing link.',
    fields: [
      {
        id: 'text',
        label: 'Post text',
        type: 'textarea',
        required: true,
        hardLimit: 280,
        recommended: 180,
        description: 'Keep hooks within first 120 characters and include hashtags sparingly.',
        placeholder: 'Ship compliant ad variants across every channel with Ansiversa LaunchPad. 14-day free trial for growth teams.',
      },
      {
        id: 'url',
        label: 'URL',
        type: 'url',
        required: false,
        description: 'Optional promoted URL appended to the card.',
        placeholder: 'https://ansiversa.com/launchpad',
      },
    ],
    guidance: [
      'Use one or two strategic hashtags to join relevant conversations.',
      'Avoid excessive capitalization and keep disclaimers concise.',
    ],
    creativeHints: [
      'Pair with a square or landscape graphic featuring one key stat.',
      'Mention event hashtags or community tags when running in bursts.',
    ],
  },
  {
    id: 'tiktok',
    name: 'TikTok Ads',
    icon: 'fab fa-tiktok',
    summary:
      'Primary text and display name for short-form video placements with CTA selection.',
    fields: [
      {
        id: 'primary_text',
        label: 'Primary text',
        type: 'text',
        required: true,
        hardLimit: 100,
        recommended: 34,
        description: 'Keep it punchy — supports up to 100 characters but trims on some devices.',
        placeholder: 'AI ad copy lab for teams who ship daily.',
      },
      {
        id: 'display_name',
        label: 'Display name',
        type: 'text',
        required: true,
        hardLimit: 30,
        recommended: 24,
        description: 'Appears above the ad creative; often brand name.',
        placeholder: 'Ansiversa LaunchPad',
      },
      {
        id: 'cta',
        label: 'CTA',
        type: 'enum',
        required: true,
        description: 'TikTok-provided call-to-action.',
        options: ['Learn More', 'Sign Up', 'Download', 'Get Offer'],
        placeholder: 'Learn More',
      },
      {
        id: 'url',
        label: 'URL',
        type: 'url',
        required: true,
        description: 'Landing page or tracking link.',
        placeholder: 'https://ansiversa.com/launchpad',
      },
    ],
    guidance: [
      'Reference the hook or on-screen text in the first 1–2 words.',
      'Avoid claims about outcomes without disclaimers; TikTok enforces strictly.',
    ],
    creativeHints: [
      'Use quick jump cuts with an over-the-shoulder workspace preview.',
      'Add captions and sticker CTAs that mirror the copy CTA.',
    ],
  },
  {
    id: 'youtube',
    name: 'YouTube Video Action',
    icon: 'fab fa-youtube',
    summary:
      'Headline, long headline, and description for video action campaigns and discovery units.',
    fields: [
      {
        id: 'headline',
        label: 'Headline',
        type: 'text',
        required: true,
        hardLimit: 15,
        recommended: 15,
        description: 'Concise hook that appears next to the video.',
        placeholder: 'Automate ad copy',
      },
      {
        id: 'long_headline',
        label: 'Long headline',
        type: 'text',
        required: true,
        hardLimit: 90,
        recommended: 90,
        description: 'Expanded headline for responsive layouts.',
        placeholder: 'Launch platform-ready ads without spreadsheets or guesswork.',
      },
      {
        id: 'description',
        label: 'Description',
        type: 'text',
        required: true,
        hardLimit: 70,
        recommended: 70,
        description: 'Supporting statement under the CTA.',
        placeholder: 'Book a demo to see Ansiversa LaunchPad in action.',
      },
      {
        id: 'url',
        label: 'URL',
        type: 'url',
        required: true,
        description: 'Destination URL for the companion banner.',
        placeholder: 'https://ansiversa.com/launchpad',
      },
    ],
    guidance: [
      'Ensure the first 3 seconds of video mention the same hook as the headline.',
      'Add callouts about trial length or guarantee to boost conversions.',
    ],
    creativeHints: [
      'Use Presentation Designer to storyboard supporting slides.',
      'Include voiceover script cues from Email Polisher follow-ups.',
    ],
  },
];

const channelMap = new Map(channelCatalog.map((spec) => [spec.id, spec]));

const angles: AdAnglePreset[] = [
  {
    id: 'price-value',
    title: 'Price / Value',
    description: 'Emphasize affordability, ROI, or savings compared to alternatives.',
    bestFor: ['Freemium launches', 'Competitive takeaways', 'Budget-conscious buyers'],
    hook: 'Save 20+ hours of manual copy edits every launch.',
  },
  {
    id: 'urgency-fomo',
    title: 'Scarcity & Urgency',
    description: 'Limited-time offers, fast-track onboarding, or bonus bundles to drive immediate action.',
    bestFor: ['Seasonal promos', 'Beta invites', 'Limited seats'],
    hook: 'Lock your seat in the LaunchPad beta — doors close Friday.',
  },
  {
    id: 'social-proof',
    title: 'Social Proof',
    description: 'Lean on testimonials, ratings, or adoption stats to build trust.',
    bestFor: ['Retargeting', 'High-consideration buyers'],
    hook: 'Trusted by 1,400+ growth teams to keep campaigns compliant.',
  },
  {
    id: 'credibility',
    title: 'Credibility',
    description: 'Awards, certifications, and industry validations to de-risk the decision.',
    bestFor: ['Regulated industries', 'Enterprise accounts'],
    hook: 'SOC 2 Type II compliant workflows with audit-ready logs.',
  },
  {
    id: 'pain-relief',
    title: 'Pain Relief',
    description: 'Name the pain and immediately present the solution.',
    bestFor: ['Problem-aware audiences', 'Competitive displacement'],
    hook: 'No more spreadsheet chaos — orchestrate every ad touchpoint in one hub.',
  },
  {
    id: 'benefit-first',
    title: 'Benefit First',
    description: 'Lead with the transformation or outcome customers crave.',
    bestFor: ['Cold acquisition', 'Awareness sprints'],
    hook: 'Launch platform-ready ad variants in minutes, not weeks.',
  },
  {
    id: 'curiosity',
    title: 'Curiosity & Pattern Breaks',
    description: 'Unexpected questions or contrasts that spark intrigue.',
    bestFor: ['Social feeds', 'Video hooks'],
    hook: 'What if every channel shared the same brand voice automatically?',
  },
  {
    id: 'comparison',
    title: 'Comparison',
    description: 'Highlight differences vs. status quo or competitors.',
    bestFor: ['Switch campaigns', 'Competitive SERPs'],
    hook: 'From 5 tools to 1: launch ads, captions, and follow-ups inside Ansiversa.',
  },
  {
    id: 'guarantee',
    title: 'Guarantee & Risk Reversal',
    description: 'Offer assurance like trials, guarantees, or cancel-anytime policies.',
    bestFor: ['Pricing pages', 'Conversion-focused retargeting'],
    hook: 'Start free for 14 days — cancel anytime, keep your creative library.',
  },
];

const tones: AdTonePreset[] = [
  {
    id: 'professional',
    label: 'Professional',
    description: 'Balanced, confident voice with light warmth and high clarity.',
    sliders: { warmth: 60, energy: 55, formality: 80 },
    voiceNotes: ['Limit emoji usage', 'Reference metrics and ROI', 'Keep claims evidence-based'],
  },
  {
    id: 'friendly',
    label: 'Friendly Guide',
    description: 'Welcoming and conversational without losing credibility.',
    sliders: { warmth: 80, energy: 65, formality: 55 },
    voiceNotes: ['Use inclusive language like “we” and “together”', 'Invite conversation with questions'],
  },
  {
    id: 'playful',
    label: 'Playful Spark',
    description: 'High-energy and witty copy ideal for social channels.',
    sliders: { warmth: 85, energy: 80, formality: 40 },
    voiceNotes: ['Embrace metaphor and playful verbs', 'Keep compliance disclaimers crisp'],
  },
  {
    id: 'serious',
    label: 'Serious Analyst',
    description: 'Reserved and detailed voice for regulated or enterprise buyers.',
    sliders: { warmth: 40, energy: 35, formality: 90 },
    voiceNotes: ['Lean on precise language and avoid slang', 'Reference compliance safeguards explicitly'],
  },
  {
    id: 'minimal',
    label: 'Minimal Operator',
    description: 'Short, direct sentences with a calm confidence.',
    sliders: { warmth: 45, energy: 40, formality: 75 },
    voiceNotes: ['Favor verbs over adjectives', 'Limit to two clauses per sentence'],
  },
  {
    id: 'bold',
    label: 'Bold Visionary',
    description: 'High-impact statements for launches and large announcements.',
    sliders: { warmth: 65, energy: 90, formality: 60 },
    voiceNotes: ['Use declarative statements', 'Anchor claims with proof points'],
  },
];

const defaultUtm: AdUtmPayload = {
  baseUrl: 'https://ansiversa.com/launchpad',
  source: 'paid',
  medium: 'cpc',
  campaign: 'launchpad-q2',
  content: 'benefit-variant',
  term: 'ai campaign builder',
  finalUrl: '',
  shortlink: 'https://ansv.co/launchpad',
};

defaultUtm.finalUrl = buildFinalUrl(defaultUtm);

const defaultBrief: AdCampaignBrief = {
  product: 'Ansiversa LaunchPad',
  offer: '14-day free trial',
  audience: 'Growth marketers and RevOps teams at B2B SaaS companies',
  goal: 'Book product demos for the LaunchPad workspace',
  valueProp: 'Unified campaign brief to multi-channel variants with compliance guardrails.',
  differentiators: ['Compliance-aware copy rewrites', 'Cross-app integrations with Ansiversa suite', 'Bulk export templates for Google & Meta'],
  keywords: ['pipeline automation', 'ai ad copy', 'revops workflow'],
  requiredPhrases: ['Ansiversa LaunchPad', '14-day free trial'],
  bannedWords: ['guaranteed results', 'best-in-class'],
  disclaimers: ['Results vary based on campaign history.', 'Free trial converts to paid plans per pricing page.'],
  tone: 'professional',
  angles: ['benefit-first', 'social-proof', 'urgency-fomo'],
  channels: ['google-search', 'meta-feed', 'linkedin'],
  locales: ['en-US'],
  utm: defaultUtm,
  hypothesis: 'If we stress the unified workspace and compliance safety, demo conversions will increase by 18%.',
};

const utmTemplates: AdUtmTemplate[] = [
  {
    id: 'product-launch-search',
    name: 'Product launch · Paid Search',
    description: 'UTM stack for new product campaigns targeting high-intent keywords.',
    values: {
      source: 'google',
      medium: 'cpc',
      campaign: 'launchpad-core',
      content: 'benefit-angle',
      term: '{KeyWord:automation suite}',
    },
  },
  {
    id: 'retargeting-paid-social',
    name: 'Retargeting · Paid Social',
    description: 'For warm audiences and product-qualified leads across Meta placements.',
    values: {
      source: 'meta',
      medium: 'paid-social',
      campaign: 'launchpad-retargeting',
      content: 'social-proof',
      term: '',
    },
  },
  {
    id: 'thought-leadership',
    name: 'Thought leadership · LinkedIn',
    description: 'Event or webinar promotion for professional networks.',
    values: {
      source: 'linkedin',
      medium: 'sponsored-update',
      campaign: 'revops-webinar',
      content: 'pain-relief',
      term: '',
    },
  },
];

const planLimits: AdPlanLimit[] = [
  {
    plan: 'free',
    campaigns: 3,
    variantsPerChannel: 2,
    locales: 1,
    exports: ['csv'],
    compliance: 'basic',
    integrations: 'view',
  },
  {
    plan: 'pro',
    campaigns: Number.POSITIVE_INFINITY,
    variantsPerChannel: 10,
    locales: 5,
    exports: ['csv', 'json', 'pdf'],
    compliance: 'advanced',
    integrations: 'one-click',
  },
];

const localizationBundles: AdLocalizationBundle[] = [
  {
    locale: 'en-US',
    label: 'English (US)',
    toneNotes: 'Default voice anchored in professional tone with light warmth.',
    status: 'ready',
    reviewer: 'Maya K.',
    updatedAt: '2024-05-18T10:00:00Z',
  },
  {
    locale: 'fr-FR',
    label: 'Français (France)',
    toneNotes: 'Swap direct urgency for collaborative phrasing; avoid idioms.',
    status: 'queued',
    updatedAt: '2024-05-17T08:30:00Z',
  },
  {
    locale: 'de-DE',
    label: 'Deutsch (Germany)',
    toneNotes: 'Highlight compliance assurances and data residency.',
    status: 'in-progress',
    reviewer: 'Lukas R.',
    updatedAt: '2024-05-19T15:15:00Z',
  },
  {
    locale: 'es-ES',
    label: 'Español (Spain)',
    toneNotes: 'Lean into benefit-first framing with friendly tone.',
    status: 'blocked',
    updatedAt: '2024-05-16T12:45:00Z',
  },
];

const variantMetrics = (readiness: number, compliance: number, conversion: number): AdVariantMetrics => ({
  readiness,
  compliance,
  conversion,
});

const computeCounters = (channelId: AdChannelId, fields: Record<string, string>) => {
  const spec = channelMap.get(channelId);
  const counters: AdVariant['counters'] = {};
  if (!spec) {
    return counters;
  }
  for (const field of spec.fields) {
    const value = fields[field.id] ?? '';
    const length = value.length;
    const hardLimit = typeof field.hardLimit === 'number' ? field.hardLimit : undefined;
    const recommended = typeof field.recommended === 'number' ? field.recommended : undefined;
    counters[field.id] = {
      length,
      hardLimit,
      recommended,
      remaining: typeof hardLimit === 'number' ? Math.max(hardLimit - length, 0) : undefined,
      exceeded: typeof hardLimit === 'number' ? length > hardLimit : false,
      warn: typeof recommended === 'number' ? length > recommended : false,
    };
  }
  return counters;
};

const createVariant = (
  channelId: AdChannelId,
  config: Omit<AdVariant, 'channelId' | 'counters'> & { fields: Record<string, string> },
): AdVariant => ({
  ...config,
  channelId,
  counters: computeCounters(channelId, config.fields),
});

const variantSeeds: Record<AdChannelId, AdVariant[]> = {
  'google-search': [
    createVariant('google-search', {
      id: 'google-a',
      label: 'Variant A',
      locale: 'en-US',
      angleId: 'benefit-first',
      toneId: 'professional',
      hypothesis: 'Highlighting speed-to-launch will increase demo form completions.',
      metrics: variantMetrics(86, 92, 78),
      notes: ['Pair with Presentation Designer hero visual', 'Focus keywords: pipeline automation'],
      fields: {
        headline_1: 'Launch ads in minutes',
        headline_2: 'Unified AI workspace',
        headline_3: '14-day free trial',
        description_1: 'Plan briefs, variants, and compliance in one Ansiversa hub. Automate the busywork.',
        description_2: 'Trusted by growth teams shipping across Google, Meta, LinkedIn, and more.',
        path_1: 'pipeline-ai',
        path_2: 'launchpad',
        final_url: defaultUtm.finalUrl,
      },
    }),
    createVariant('google-search', {
      id: 'google-b',
      label: 'Variant B',
      locale: 'en-US',
      angleId: 'social-proof',
      toneId: 'professional',
      hypothesis: 'Social proof messaging will improve CTR on competitive keywords.',
      metrics: variantMetrics(80, 88, 75),
      notes: ['Reference customer stat in description', 'Ready for CSV export'],
      fields: {
        headline_1: '1,400+ teams trust Ansiversa',
        headline_2: 'Keep ads compliant',
        headline_3: 'Pipeline-ready copy',
        description_1: 'Replace spreadsheets with guided AI workflows. Monitor character limits instantly.',
        description_2: 'Compliance guardrails and tone memory keep every channel on brand.',
        path_1: 'revops',
        path_2: 'automation',
        final_url: defaultUtm.finalUrl,
      },
    }),
  ],
  'meta-feed': [
    createVariant('meta-feed', {
      id: 'meta-a',
      label: 'Variant A',
      locale: 'en-US',
      angleId: 'benefit-first',
      toneId: 'friendly',
      hypothesis: 'Conversational hook with product payoff will stop the scroll.',
      metrics: variantMetrics(84, 90, 82),
      notes: ['Enable auto-caption suggestions in Social Caption Generator', 'Primary for retargeting set A'],
      fields: {
        primary_text:
          'LaunchPad bundles your briefs, variants, and compliance checks in one friendly AI space. Kick off the 14-day free trial.',
        headline: 'Ship ads in one workspace',
        description: 'Automation built for growth teams.',
        cta: 'Learn More',
        url: defaultUtm.finalUrl,
      },
    }),
    createVariant('meta-feed', {
      id: 'meta-b',
      label: 'Variant B',
      locale: 'en-US',
      angleId: 'urgency-fomo',
      toneId: 'bold',
      hypothesis: 'Limited-time trial bonus nudges cold audiences to click.',
      metrics: variantMetrics(78, 86, 79),
      notes: ['Use countdown sticker in creative', 'A/B against social-proof headline'],
      fields: {
        primary_text:
          "Only this week: get LaunchPad's AI ad copy library plus compliance rewrites on us. Your team ships more, reviews less.",
        headline: 'Trial bonus ends soon',
        description: 'Reserve your seat today.',
        cta: 'Sign Up',
        url: defaultUtm.finalUrl,
      },
    }),
  ],
  linkedin: [
    createVariant('linkedin', {
      id: 'linkedin-a',
      label: 'Variant A',
      locale: 'en-US',
      angleId: 'credibility',
      toneId: 'serious',
      hypothesis: 'Enterprise buyers respond to governance and compliance proof.',
      metrics: variantMetrics(88, 94, 81),
      notes: ['Mention SOC2 compliance in supporting assets', 'Send leads to webinar nurture built in Email Polisher'],
      fields: {
        intro:
          'Revenue operations teams choose Ansiversa LaunchPad to orchestrate compliant ad campaigns across every channel with auditable guardrails.',
        headline: 'Enterprise-ready ad automation',
        description: 'SOC 2 Type II workflows with localization memory.',
        cta: 'Book a demo',
        url: defaultUtm.finalUrl,
      },
    }),
    createVariant('linkedin', {
      id: 'linkedin-b',
      label: 'Variant B',
      locale: 'en-US',
      angleId: 'social-proof',
      toneId: 'professional',
      hypothesis: 'Customer proof points increase trust during evaluation.',
      metrics: variantMetrics(82, 91, 77),
      notes: ['Pair with testimonial carousel', 'Add localized case studies for EMEA'],
      fields: {
        intro:
          '“We collapsed four tools into one.” Marketing leads use LaunchPad to keep every ad launch consistent — from Google Search to TikTok.',
        headline: 'Trusted by 1,400+ growth teams',
        description: 'Keep voice, UTMs, and compliance aligned.',
        cta: 'Learn more',
        url: defaultUtm.finalUrl,
      },
    }),
  ],
  x: [
    createVariant('x', {
      id: 'x-a',
      label: 'Variant A',
      locale: 'en-US',
      angleId: 'curiosity',
      toneId: 'minimal',
      hypothesis: 'Intriguing question draws engagement and link clicks.',
      metrics: variantMetrics(76, 88, 70),
      notes: ['Include #B2BMarketing and #RevOps hashtags', 'Schedule via Social Caption Generator'],
      fields: {
        text: 'What if your Google, Meta, and LinkedIn ads shared the same AI brain? LaunchPad keeps every variant compliant. 14-day free trial.',
        url: defaultUtm.finalUrl,
      },
    }),
  ],
  tiktok: [
    createVariant('tiktok', {
      id: 'tiktok-a',
      label: 'Variant A',
      locale: 'en-US',
      angleId: 'benefit-first',
      toneId: 'playful',
      hypothesis: 'Punchy opener plus CTA overlay increases swipe-ups.',
      metrics: variantMetrics(74, 87, 73),
      notes: ['Overlay “Launch ads in minutes” text', 'Include B-roll of workspace UI'],
      fields: {
        primary_text: 'Stop guessing copy. LaunchPad drafts every channel for you.',
        display_name: 'Ansiversa LaunchPad',
        cta: 'Learn More',
        url: defaultUtm.finalUrl,
      },
    }),
  ],
  youtube: [
    createVariant('youtube', {
      id: 'youtube-a',
      label: 'Variant A',
      locale: 'en-US',
      angleId: 'guarantee',
      toneId: 'professional',
      hypothesis: 'Risk-reversal plus benefit improves VTR on discovery units.',
      metrics: variantMetrics(79, 89, 74),
      notes: ['Add CTA end card from Presentation Designer export', 'Mention free trial within first 5 seconds'],
      fields: {
        headline: 'Automate ad copy',
        long_headline: 'Plan, generate, and export compliant ads in one AI command center.',
        description: 'Start your 14-day free trial and keep every variant synced.',
        url: defaultUtm.finalUrl,
      },
    }),
  ],
};

const complianceIssues: AdComplianceIssue[] = [
  {
    id: 'cmp-google-01',
    channelId: 'google-search',
    variantId: 'google-b',
    fieldId: 'headline_1',
    severity: 'warning',
    rule: 'Unsupported superlative',
    message: '“1,400+ teams trust” flagged for proof verification.',
    suggestion: 'Link to case study proof or soften to “Teams trust”.',
    rewrite: 'Teams trust Ansiversa LaunchPad',
    status: 'open',
  },
  {
    id: 'cmp-meta-01',
    channelId: 'meta-feed',
    variantId: 'meta-b',
    fieldId: 'primary_text',
    severity: 'info',
    rule: 'Limited-time claims',
    message: '“Only this week” requires end date in compliance notes.',
    suggestion: 'Add campaign end date or switch to “for a limited time”.',
    rewrite: "For a limited time, get LaunchPad's AI ad copy library on us.",
    status: 'open',
  },
  {
    id: 'cmp-x-01',
    channelId: 'x',
    variantId: 'x-a',
    fieldId: 'text',
    severity: 'error',
    rule: 'Guarantee language',
    message: 'Remove implied guarantee “keeps every variant compliant”.',
    suggestion: 'Shift to supportive language without absolute promise.',
    rewrite: 'LaunchPad guides compliant copy across Google, Meta, and LinkedIn.',
    status: 'open',
  },
];

const exportPresets: AdExportPreset[] = [
  {
    id: 'google-csv',
    label: 'Google Ads CSV',
    format: 'csv',
    description: 'Bulk upload template with RSA columns, path fields, and labels.',
    includes: ['Headlines & descriptions', 'Path 1/2', 'UTM appended final URL'],
    plan: 'free',
  },
  {
    id: 'meta-json',
    label: 'Meta Creative JSON',
    format: 'json',
    description: 'Ready for Marketing API upload with tone metadata and CTA enums.',
    includes: ['Primary text', 'Headlines & descriptions', 'Compliance checklist'],
    plan: 'pro',
  },
  {
    id: 'creative-sheet',
    label: 'Creative PDF Sheet',
    format: 'pdf',
    description: 'Shareable deck summarizing variants, hypotheses, and metrics.',
    includes: ['Variant table', 'Compliance notes', 'Localization status'],
    plan: 'pro',
  },
];

const integrations: AdIntegrationShortcut[] = [
  {
    id: 'social-caption-generator',
    name: 'Social Caption Generator',
    href: '/social-caption-generator',
    description: 'Repurpose winning angles into organic captions with shared brand voices.',
    icon: 'fas fa-hashtag',
  },
  {
    id: 'presentation-designer',
    name: 'Presentation Designer',
    href: '/presentation-designer',
    description: 'Convert ad hypotheses into launch decks and creative storyboards.',
    icon: 'fas fa-display',
  },
  {
    id: 'email-polisher',
    name: 'Email Polisher',
    href: '/email-polisher',
    description: 'Spin follow-up nurture emails from approved ad variants.',
    icon: 'fas fa-envelope',
  },
  {
    id: 'prompt-builder',
    name: 'Prompt Builder',
    href: '/prompt-builder',
    description: 'Refine custom generation prompts for niche industries.',
    icon: 'fas fa-magic-wand-sparkles',
  },
];

const analytics: AdAnalyticsSummary = {
  experimentsRun: 27,
  avgLift: 0.21,
  savedHours: 48,
  variantsGenerated: 162,
};

const campaigns: AdCampaignSummary[] = [
  {
    id: 'cmp-neo',
    name: 'LaunchPad Q2 demand sprint',
    channelMix: ['google-search', 'meta-feed', 'linkedin'],
    status: 'live',
    lastUpdated: '2024-05-19T09:20:00Z',
    lift: 0.18,
    note: 'Experiment B outperforming control on demo conversions.',
  },
  {
    id: 'cmp-retarget',
    name: 'Lifecycle retargeting wave',
    channelMix: ['meta-feed', 'x'],
    status: 'paused',
    lastUpdated: '2024-05-12T13:45:00Z',
    lift: 0.12,
    note: 'Paused pending creative refresh and new compliance guidance.',
  },
  {
    id: 'cmp-emea',
    name: 'EMEA localization test',
    channelMix: ['linkedin', 'google-search'],
    status: 'draft',
    lastUpdated: '2024-05-10T08:00:00Z',
    lift: 0.0,
    note: 'Awaiting German localization sign-off.',
  },
];

export const adChannelSpecs = (): AdChannelSpec[] => clone(channelCatalog);
export const adAnglePresets = (): AdAnglePreset[] => clone(angles);
export const adTonePresets = (): AdTonePreset[] => clone(tones);
export const adDefaultBrief = (): AdCampaignBrief => clone(defaultBrief);
export const adPlanLimits = (): AdPlanLimit[] => clone(planLimits);
export const adLocalizationBundles = (): AdLocalizationBundle[] => clone(localizationBundles);
export const adSeedVariants = (): Record<AdChannelId, AdVariant[]> => clone(variantSeeds);
export const adComplianceCatalog = (): AdComplianceIssue[] => clone(complianceIssues);
export const adExportPresets = (): AdExportPreset[] => clone(exportPresets);
export const adIntegrationShortcuts = (): AdIntegrationShortcut[] => clone(integrations);
export const adAnalyticsSummary = (): AdAnalyticsSummary => clone(analytics);
export const adCampaignSummaries = (): AdCampaignSummary[] => clone(campaigns);
export const adUtmTemplates = (): AdUtmTemplate[] => clone(utmTemplates);

import type { QrStyleState } from './types';

export type QrPlanTier = 'free' | 'pro';
export type QrMode = 'static' | 'dynamic';

export type QrContentTypeId =
  | 'url'
  | 'text'
  | 'email'
  | 'phone'
  | 'sms'
  | 'whatsapp'
  | 'wifi'
  | 'contact'
  | 'event'
  | 'geo'
  | 'payment'
  | 'social';

type FieldInputType = 'text' | 'textarea' | 'select' | 'toggle' | 'number' | 'color';

export interface QrContentField {
  key: string;
  label: string;
  type: FieldInputType;
  placeholder?: string;
  helper?: string;
  plan?: QrPlanTier;
  options?: { value: string; label: string }[];
  maxLength?: number;
}

export interface QrContentTypeDefinition {
  id: QrContentTypeId;
  label: string;
  description: string;
  icon: string;
  plan: QrPlanTier;
  fields: readonly QrContentField[];
  samplePayload: string;
}

export const qrContentTypes: readonly QrContentTypeDefinition[] = [
  {
    id: 'url',
    label: 'Website URL',
    description: 'Link to any webpage, landing page, or file share.',
    icon: 'fas fa-link',
    plan: 'free',
    samplePayload: 'https://ansiversa.com/launch',
    fields: [
      {
        key: 'url',
        label: 'Target URL',
        type: 'text',
        placeholder: 'https://example.com/page',
        helper: 'Include https:// for best compatibility.',
      },
      {
        key: 'appendUtm',
        label: 'Append campaign UTM',
        type: 'toggle',
        helper: 'Adds utm_source=qr automatically when enabled.',
        plan: 'pro',
      },
      {
        key: 'campaign',
        label: 'Campaign label',
        type: 'text',
        placeholder: 'spring_launch',
        helper: 'Used when UTM parameters are enabled.',
        plan: 'pro',
      },
    ],
  },
  {
    id: 'text',
    label: 'Plain text note',
    description: 'Display a block of text or instructions when scanned.',
    icon: 'fas fa-align-left',
    plan: 'free',
    samplePayload: 'Thank you for visiting Ansiversa. Scan to explore 100+ mini apps.',
    fields: [
      {
        key: 'message',
        label: 'Message',
        type: 'textarea',
        placeholder: 'Type the text to embed inside the QR code.',
        maxLength: 600,
      },
    ],
  },
  {
    id: 'email',
    label: 'Email compose',
    description: 'Open the mail client with subject and body prefilled.',
    icon: 'fas fa-envelope',
    plan: 'free',
    samplePayload: 'hello@ansiversa.com',
    fields: [
      {
        key: 'address',
        label: 'Recipient email',
        type: 'text',
        placeholder: 'hello@example.com',
      },
      {
        key: 'subject',
        label: 'Subject',
        type: 'text',
        placeholder: 'Ansiversa product inquiry',
      },
      {
        key: 'body',
        label: 'Body',
        type: 'textarea',
        placeholder: 'Hi team, I would love to learn more about…',
      },
    ],
  },
  {
    id: 'phone',
    label: 'Phone call',
    description: 'Dial a phone number instantly.',
    icon: 'fas fa-phone',
    plan: 'free',
    samplePayload: '+1 312 555 0123',
    fields: [
      {
        key: 'number',
        label: 'Phone number',
        type: 'text',
        placeholder: '+1 312 555 0123',
      },
    ],
  },
  {
    id: 'sms',
    label: 'SMS message',
    description: 'Prefill a phone number and SMS body.',
    icon: 'fas fa-message',
    plan: 'free',
    samplePayload: 'SMSTO:+13125550123:Hello from Ansiversa',
    fields: [
      {
        key: 'number',
        label: 'Recipient number',
        type: 'text',
        placeholder: '+1 312 555 0123',
      },
      {
        key: 'message',
        label: 'Message',
        type: 'textarea',
        placeholder: 'Your order is ready for pickup.',
      },
    ],
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp chat',
    description: 'Open a WhatsApp conversation with a prepared greeting.',
    icon: 'fab fa-whatsapp',
    plan: 'free',
    samplePayload: 'https://wa.me/13125550123?text=Hi%20team',
    fields: [
      {
        key: 'number',
        label: 'WhatsApp number',
        type: 'text',
        placeholder: '+1 312 555 0123',
      },
      {
        key: 'message',
        label: 'Greeting',
        type: 'textarea',
        placeholder: 'Hi team! I discovered you via Ansiversa.',
      },
    ],
  },
  {
    id: 'wifi',
    label: 'Wi-Fi configuration',
    description: 'Share Wi-Fi credentials to connect securely.',
    icon: 'fas fa-wifi',
    plan: 'free',
    samplePayload: 'WIFI:T:WPA;S:AnsiversaLab;P:CreateTogether;H:false;;',
    fields: [
      {
        key: 'ssid',
        label: 'Network name (SSID)',
        type: 'text',
        placeholder: 'AnsiversaLab',
      },
      {
        key: 'security',
        label: 'Security',
        type: 'select',
        options: [
          { value: 'WPA', label: 'WPA/WPA2' },
          { value: 'WEP', label: 'WEP' },
          { value: 'nopass', label: 'Open network' },
        ],
      },
      {
        key: 'password',
        label: 'Password',
        type: 'text',
        placeholder: 'CreateTogether',
        helper: 'Leave empty for open networks.',
      },
      {
        key: 'hidden',
        label: 'Hidden SSID',
        type: 'toggle',
      },
    ],
  },
  {
    id: 'contact',
    label: 'Contact card',
    description: 'Save your full contact details to the address book.',
    icon: 'fas fa-id-card',
    plan: 'pro',
    samplePayload: 'BEGIN:VCARD...',
    fields: [
      { key: 'firstName', label: 'First name', type: 'text', placeholder: 'Aisha' },
      { key: 'lastName', label: 'Last name', type: 'text', placeholder: 'Singh' },
      { key: 'company', label: 'Company', type: 'text', placeholder: 'Ansiversa' },
      { key: 'title', label: 'Title', type: 'text', placeholder: 'Product Lead' },
      { key: 'email', label: 'Email', type: 'text', placeholder: 'aisha@ansiversa.com' },
      { key: 'phone', label: 'Phone', type: 'text', placeholder: '+1 312 555 0123' },
      { key: 'website', label: 'Website', type: 'text', placeholder: 'https://ansiversa.com' },
      {
        key: 'address',
        label: 'Address',
        type: 'textarea',
        placeholder: '200 Innovation Way\nChicago, IL 60601',
      },
    ],
  },
  {
    id: 'event',
    label: 'Calendar event',
    description: 'Invite scanners to a scheduled event with time and location.',
    icon: 'fas fa-calendar-day',
    plan: 'pro',
    samplePayload: 'BEGIN:VEVENT\nSUMMARY:Ansiversa Launch…',
    fields: [
      { key: 'title', label: 'Event name', type: 'text', placeholder: 'Ansiversa Launch Briefing' },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Live walkthrough of the Ansiversa mini-app suite.' },
      { key: 'location', label: 'Location', type: 'text', placeholder: 'Ansiversa HQ · Chicago' },
      { key: 'start', label: 'Start', type: 'text', placeholder: '2025-05-12T17:00' },
      { key: 'end', label: 'End', type: 'text', placeholder: '2025-05-12T18:30' },
    ],
  },
  {
    id: 'geo',
    label: 'Map pin',
    description: 'Open maps at a precise latitude and longitude.',
    icon: 'fas fa-location-dot',
    plan: 'free',
    samplePayload: 'geo:41.8781,-87.6298?q=Ansiversa%20HQ',
    fields: [
      { key: 'latitude', label: 'Latitude', type: 'text', placeholder: '41.8781' },
      { key: 'longitude', label: 'Longitude', type: 'text', placeholder: '-87.6298' },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'Ansiversa HQ' },
    ],
  },
  {
    id: 'payment',
    label: 'Payment link',
    description: 'Collect payments or donations through a smart link.',
    icon: 'fas fa-credit-card',
    plan: 'pro',
    samplePayload: 'https://pay.ansiversa.com/invoice/INV-2045',
    fields: [
      { key: 'provider', label: 'Provider', type: 'select', options: [
        { value: 'stripe', label: 'Stripe' },
        { value: 'paypal', label: 'PayPal' },
        { value: 'razorpay', label: 'Razorpay' },
        { value: 'upi', label: 'UPI' },
      ] },
      { key: 'amount', label: 'Amount', type: 'text', placeholder: '49.00' },
      { key: 'currency', label: 'Currency', type: 'text', placeholder: 'USD' },
      { key: 'reference', label: 'Reference', type: 'text', placeholder: 'INV-2045' },
      { key: 'note', label: 'Note', type: 'textarea', placeholder: 'Thanks for supporting the Ansiversa launch.' },
    ],
  },
  {
    id: 'social',
    label: 'Social profile hub',
    description: 'Bundle multiple social links into one smart card.',
    icon: 'fas fa-share-nodes',
    plan: 'pro',
    samplePayload: 'https://ansiversa.com/social/aisha',
    fields: [
      { key: 'username', label: 'Handle or username', type: 'text', placeholder: '@ansiversa' },
      { key: 'primaryNetwork', label: 'Primary network', type: 'select', options: [
        { value: 'instagram', label: 'Instagram' },
        { value: 'linkedin', label: 'LinkedIn' },
        { value: 'youtube', label: 'YouTube' },
        { value: 'tiktok', label: 'TikTok' },
        { value: 'x', label: 'X / Twitter' },
      ] },
      { key: 'landingUrl', label: 'Landing page URL', type: 'text', placeholder: 'https://ansiversa.com/links/aisha' },
      { key: 'cta', label: 'Call to action', type: 'text', placeholder: 'Book a demo' },
    ],
  },
] as const;

export const qrDotShapeOptions = [
  { value: 'square', label: 'Sharp squares' },
  { value: 'rounded', label: 'Rounded squares' },
  { value: 'dots', label: 'Soft dots' },
] as const;

export const qrEyeStyleOptions = [
  { value: 'square', label: 'Classic' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'circle', label: 'Circle' },
  { value: 'diamond', label: 'Diamond', plan: 'pro' as QrPlanTier },
] as const;

export const qrGradientPresets = [
  {
    id: 'aurora',
    name: 'Aurora Blue',
    from: '#6366f1',
    to: '#0ea5e9',
    angle: 125,
  },
  {
    id: 'sunset',
    name: 'Sunset Citrus',
    from: '#f97316',
    to: '#facc15',
    angle: 140,
  },
  {
    id: 'forest',
    name: 'Emerald Forest',
    from: '#22c55e',
    to: '#0ea5e9',
    angle: 110,
  },
  {
    id: 'velvet',
    name: 'Velvet Rose',
    from: '#f472b6',
    to: '#ef4444',
    angle: 160,
  },
] as const;

export const qrEccLevels = [
  { value: 'L', label: 'L · 7% recovery' },
  { value: 'M', label: 'M · 15% recovery' },
  { value: 'Q', label: 'Q · 25% recovery' },
  { value: 'H', label: 'H · 30% recovery' },
] as const;

export const qrSizeOptions = [
  { value: 240, label: '240 px' },
  { value: 320, label: '320 px' },
  { value: 420, label: '420 px' },
  { value: 600, label: '600 px (print)' },
] as const;

export const qrMarginOptions = [
  { value: 0, label: 'None (0)' },
  { value: 2, label: 'Tight (2)' },
  { value: 6, label: 'Standard (6)' },
  { value: 12, label: 'Wide (12)' },
] as const;

export const defaultQrStyle: QrStyleState = {
  size: 320,
  margin: 6,
  ecc: 'Q',
  foreground: '#111827',
  background: '#ffffff',
  gradientEnabled: true,
  gradient: {
    from: '#6366f1',
    to: '#0ea5e9',
    angle: 125,
  },
  dotStyle: 'rounded',
  eyeStyle: 'rounded',
  quietZoneColor: '#ffffff',
  logo: null,
};

export interface QrDynamicRecordSnapshot {
  id: string;
  label: string;
  shortCode: string;
  shortUrl: string;
  targetUrl: string;
  createdAt: string;
  lastScanAt: string;
  scanCount: number;
  plan: QrPlanTier;
  status: 'active' | 'paused';
  campaign?: string;
  tags: string[];
  recentScans: readonly QrScanEvent[];
}

export interface QrScanEvent {
  id: string;
  scannedAt: string;
  location: string;
  country: string;
  device: string;
  platform: 'iOS' | 'Android' | 'Desktop' | 'Other';
}

export const sampleDynamicRecords: readonly QrDynamicRecordSnapshot[] = [
  {
    id: 'qr_dyn_01',
    label: 'Ansiversa launch promo',
    shortCode: 'AVLAUNCH',
    shortUrl: 'https://ansv.rs/AVLAUNCH',
    targetUrl: 'https://ansiversa.com/launch',
    createdAt: '2025-04-02T14:05:00.000Z',
    lastScanAt: '2025-04-18T19:42:00.000Z',
    scanCount: 428,
    status: 'active',
    plan: 'pro',
    campaign: 'spring_launch',
    tags: ['promo', 'print'],
    recentScans: [
      {
        id: 'scan_01',
        scannedAt: '2025-04-18T19:42:00.000Z',
        location: 'Chicago, US',
        country: 'US',
        device: 'iPhone 15',
        platform: 'iOS',
      },
      {
        id: 'scan_02',
        scannedAt: '2025-04-18T18:10:00.000Z',
        location: 'Toronto, CA',
        country: 'CA',
        device: 'Pixel 8',
        platform: 'Android',
      },
      {
        id: 'scan_03',
        scannedAt: '2025-04-18T16:55:00.000Z',
        location: 'Berlin, DE',
        country: 'DE',
        device: 'Samsung Galaxy S24',
        platform: 'Android',
      },
    ],
  },
  {
    id: 'qr_dyn_02',
    label: 'Premium waitlist table tent',
    shortCode: 'PREMIUM',
    shortUrl: 'https://ansv.rs/PREMIUM',
    targetUrl: 'https://ansiversa.com/waitlist',
    createdAt: '2025-03-20T09:15:00.000Z',
    lastScanAt: '2025-04-17T21:05:00.000Z',
    scanCount: 189,
    status: 'active',
    plan: 'pro',
    tags: ['events'],
    recentScans: [
      {
        id: 'scan_11',
        scannedAt: '2025-04-17T21:05:00.000Z',
        location: 'Austin, US',
        country: 'US',
        device: 'iPad Pro',
        platform: 'iOS',
      },
      {
        id: 'scan_12',
        scannedAt: '2025-04-17T17:48:00.000Z',
        location: 'Seattle, US',
        country: 'US',
        device: 'Surface Pro 9',
        platform: 'Desktop',
      },
      {
        id: 'scan_13',
        scannedAt: '2025-04-17T16:36:00.000Z',
        location: 'Mumbai, IN',
        country: 'IN',
        device: 'OnePlus 12',
        platform: 'Android',
      },
    ],
  },
] as const;

export const batchCsvTemplate = `type,label,value,notes
url,Website,https://ansiversa.com,"Primary landing page"
text,Welcome note,"Welcome to the Ansiversa universe!","Use for onboarding slides"
wifi,Office Wi-Fi,AnsiversaLab|WPA|CreateTogether,"Lobby signage"
`;

export const dynamicAnalyticsSummary = {
  rolling7Day: {
    total: 128,
    change: 12,
    byPlatform: [
      { platform: 'iOS', percent: 46 },
      { platform: 'Android', percent: 39 },
      { platform: 'Desktop', percent: 12 },
      { platform: 'Other', percent: 3 },
    ],
  },
  topCountries: [
    { country: 'United States', percent: 41 },
    { country: 'India', percent: 18 },
    { country: 'Germany', percent: 12 },
    { country: 'Canada', percent: 9 },
  ],
  hourDistribution: [6, 4, 3, 2, 1, 1, 2, 6, 9, 12, 14, 17, 15, 13, 11, 8, 6, 5, 4, 3, 2, 2, 1, 1],
};

export const qrWorkspaceHighlights = [
  {
    icon: 'fas fa-wand-magic-sparkles',
    title: 'Smart payload builder',
    description:
      'Guided forms for URLs, text, Wi-Fi, vCards, calendar invites, payments, and more — each with instant validation.',
  },
  {
    icon: 'fas fa-palette',
    title: 'Brand-ready styling',
    description:
      'Mix gradients, quiet zones, logos, and custom finder eyes while ensuring optimal contrast for scanning reliability.',
  },
  {
    icon: 'fas fa-chart-line',
    title: 'Dynamic insights',
    description:
      'Retarget short links, gate by password or location, and monitor scans by device, geography, and campaign.',
  },
] as const;

const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

export type InvoicePlan = 'free' | 'pro';
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'void';
export type InvoiceTemplateKey = 'classic' | 'modern' | 'minimal';
export type InvoiceReminderTone = 'polite' | 'professional' | 'friendly';
export type InvoiceReminderMode = 'item' | 'reminder';

export type InvoiceBranding = {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  website: string;
  accentColor: string;
  logoUrl: string | null;
  footerNote: string;
};

export type InvoiceClient = {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  notes: string;
};

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxPct: number;
  discountPct: number;
};

export type InvoicePayment = {
  id: string;
  date: string;
  amount: number;
  method: string;
  note: string;
  receiptNumber: string | null;
};

export type InvoiceTotals = {
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  paidTotal: number;
  balanceDue: number;
};

export type InvoiceReminder = {
  id: string;
  mode: InvoiceReminderMode;
  tone: InvoiceReminderTone;
  text: string;
  createdAt: string;
};

export type InvoiceRecord = {
  id: string;
  number: string;
  slug: string | null;
  status: InvoiceStatus;
  templateKey: InvoiceTemplateKey;
  currency: string;
  issueDate: string;
  dueDate: string;
  reference: string;
  client: InvoiceClient;
  branding: InvoiceBranding;
  items: InvoiceItem[];
  payments: InvoicePayment[];
  totals: InvoiceTotals;
  notes: string;
  terms: string;
  reminders: InvoiceReminder[];
  shareUrl: string | null;
  createdAt: string;
  updatedAt: string;
  plan: InvoicePlan;
  watermark: boolean;
};

export type InvoiceProfile = {
  defaultCurrency: string;
  plan: InvoicePlan;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  website: string;
  accentColor: string;
  footerNote: string;
  logoUrl: string | null;
};

export type InvoiceTemplateOption = {
  key: InvoiceTemplateKey;
  label: string;
  accentColor: string;
  description: string;
  highlight: string;
};

export const invoiceTemplateOptions: InvoiceTemplateOption[] = [
  {
    key: 'classic',
    label: 'Classic professional',
    accentColor: '#2563eb',
    description: 'Timeless layout with left-aligned branding, perfect for agencies and consultants.',
    highlight: 'Balanced typography and spacious totals section.',
  },
  {
    key: 'modern',
    label: 'Modern gradient',
    accentColor: '#7c3aed',
    description: 'Gradient header with bold totals and clean item rows.',
    highlight: 'Standout header with compact table styling.',
  },
  {
    key: 'minimal',
    label: 'Minimal ledger',
    accentColor: '#0f172a',
    description: 'Monochrome layout inspired by classic ledgers, ideal for formal billing.',
    highlight: 'High contrast for printed exports and PDF clarity.',
  },
];

export const invoiceStatusOptions: { value: InvoiceStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'partial', label: 'Partially paid' },
  { value: 'paid', label: 'Paid' },
  { value: 'void', label: 'Void' },
];

export const paymentMethodOptions = [
  'Bank transfer',
  'Credit card',
  'Cash',
  'UPI',
  'Cheque',
  'PayPal',
  'Wire transfer',
];

export const reminderToneOptions: { value: InvoiceReminderTone; label: string }[] = [
  { value: 'polite', label: 'Polite' },
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
];

export const reminderModeOptions: { value: InvoiceReminderMode; label: string }[] = [
  { value: 'item', label: 'Item description' },
  { value: 'reminder', label: 'Payment reminder' },
];

const nowIsoString = () => new Date().toISOString();

const defaultBranding = (): InvoiceBranding => ({
  businessName: 'Ansiversa Studio',
  businessEmail: 'hello@ansiversa.app',
  businessPhone: '+1 (310) 555-0147',
  businessAddress: '27 Innovation Drive, San Francisco, CA 94107',
  website: 'https://ansiversa.app',
  accentColor: '#2563eb',
  logoUrl: null,
  footerNote: 'We help teams ship products faster.',
});

const defaultClient = (): InvoiceClient => ({
  name: 'Jordan Blake',
  company: 'Brightwave Labs',
  email: 'jordan@brightwave.io',
  phone: '+1 (415) 555-2846',
  address: '890 Mission Street, San Francisco, CA 94103',
  taxId: 'BW-20491',
  notes: '',
});

export const defaultProfile = (): InvoiceProfile => ({
  defaultCurrency: 'USD',
  plan: 'pro',
  businessName: 'Ansiversa Studio',
  businessEmail: 'hello@ansiversa.app',
  businessPhone: '+1 (310) 555-0147',
  businessAddress: '27 Innovation Drive, San Francisco, CA 94107',
  website: 'https://ansiversa.app',
  accentColor: '#2563eb',
  footerNote: 'Accelerating product teams with modern tooling.',
  logoUrl: null,
});

export const createInvoiceItem = (overrides: Partial<InvoiceItem> = {}): InvoiceItem => ({
  id: overrides.id ?? newId(),
  description: overrides.description ?? '',
  quantity: overrides.quantity ?? 1,
  unitPrice: overrides.unitPrice ?? 0,
  taxPct: overrides.taxPct ?? 0,
  discountPct: overrides.discountPct ?? 0,
});

export const createInvoicePayment = (overrides: Partial<InvoicePayment> = {}): InvoicePayment => ({
  id: overrides.id ?? newId(),
  date: overrides.date ?? new Date().toISOString().slice(0, 10),
  amount: overrides.amount ?? 0,
  method: overrides.method ?? 'Bank transfer',
  note: overrides.note ?? '',
  receiptNumber: overrides.receiptNumber ?? null,
});

export const emptyTotals = (): InvoiceTotals => ({
  subtotal: 0,
  taxTotal: 0,
  discountTotal: 0,
  grandTotal: 0,
  paidTotal: 0,
  balanceDue: 0,
});

export const createEmptyInvoiceRecord = (overrides: Partial<InvoiceRecord> = {}): InvoiceRecord => {
  const plan = overrides.plan ?? 'free';
  const issueDate =
    overrides.issueDate ?? new Date().toISOString().slice(0, 10);
  const dueDate =
    overrides.dueDate ?? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
  return {
    id: overrides.id ?? newId(),
    number: overrides.number ?? 'INV-0000',
    slug: overrides.slug ?? null,
    status: overrides.status ?? 'draft',
    templateKey: overrides.templateKey ?? 'classic',
    currency: overrides.currency ?? 'USD',
    issueDate,
    dueDate,
    reference: overrides.reference ?? '',
    client: { ...defaultClient(), ...(overrides.client ?? {}) },
    branding: { ...defaultBranding(), ...(overrides.branding ?? {}) },
    items:
      overrides.items?.map((item) => ({ ...createInvoiceItem(), ...item })) ?? [
        createInvoiceItem({
          description: 'Design sprint facilitation',
          quantity: 1,
          unitPrice: 2400,
          taxPct: 5,
          discountPct: 0,
        }),
        createInvoiceItem({
          description: 'Frontend implementation (20 hrs)',
          quantity: 20,
          unitPrice: 90,
          taxPct: 5,
          discountPct: 10,
        }),
      ],
    payments:
      overrides.payments?.map((payment) => ({
        ...createInvoicePayment(),
        ...payment,
      })) ?? [],
    totals: overrides.totals ?? emptyTotals(),
    notes:
      overrides.notes ??
      'Please make payment via bank transfer. Late invoices are subject to a 1.5% monthly fee.',
    terms:
      overrides.terms ??
      'Payment due within 14 days of invoice date. Ownership transfers after full payment.',
    reminders: overrides.reminders ?? [],
    shareUrl: overrides.shareUrl ?? null,
    createdAt: overrides.createdAt ?? nowIsoString(),
    updatedAt: overrides.updatedAt ?? nowIsoString(),
    plan,
    watermark: overrides.watermark ?? plan === 'free',
  };
};

export const mockInvoices: InvoiceRecord[] = [
  createEmptyInvoiceRecord({
    id: 'inv-aurora',
    number: 'INV-2025-001',
    status: 'sent',
    currency: 'USD',
    templateKey: 'classic',
    branding: {
      ...defaultBranding(),
      businessName: 'Aurora Digital Studio',
      businessEmail: 'finance@aurora.studio',
      businessPhone: '+1 (646) 555-1190',
      accentColor: '#2563eb',
      footerNote: 'Designing customer experiences that convert.',
    },
    client: {
      ...defaultClient(),
      company: 'Northwind Ventures',
      name: 'Mia Chen',
      email: 'mchen@northwind.vc',
      address: '1101 Market Street, Suite 18, San Francisco, CA 94103',
    },
    issueDate: '2025-02-01',
    dueDate: '2025-02-15',
    items: [
      createInvoiceItem({
        description: 'Product strategy workshop',
        quantity: 1,
        unitPrice: 3200,
        taxPct: 5,
      }),
      createInvoiceItem({
        description: 'UX research sprint (12 hrs)',
        quantity: 12,
        unitPrice: 110,
        taxPct: 5,
      }),
    ],
    notes: 'Wire transfer preferred. Include invoice number in the memo field.',
    terms:
      'Payment due within 14 days. Ownership of deliverables transfers after receipt of full payment.',
    plan: 'pro',
    watermark: false,
    payments: [
      createInvoicePayment({
        id: 'pay-aurora-1',
        date: '2025-02-10',
        amount: 2000,
        method: 'Bank transfer',
        note: 'Initial retainer',
        receiptNumber: 'RCT-2025-045',
      }),
    ],
  }),
  createEmptyInvoiceRecord({
    id: 'inv-horizon',
    number: 'INV-2025-002',
    status: 'draft',
    currency: 'EUR',
    templateKey: 'modern',
    issueDate: '2025-03-04',
    dueDate: '2025-03-18',
    branding: {
      ...defaultBranding(),
      businessName: 'Horizon Consulting',
      businessEmail: 'billing@horizon.consulting',
      businessPhone: '+44 20 7946 0958',
      accentColor: '#7c3aed',
      footerNote: 'Strategic roadmaps for ambitious teams.',
    },
    client: {
      ...defaultClient(),
      company: 'Nova Retail Group',
      name: 'Lucas Meyer',
      email: 'lucas@nova-retail.co',
      address: 'Schönhauser Allee 75, Berlin, Germany',
    },
    items: [
      createInvoiceItem({
        description: 'Omnichannel audit',
        quantity: 1,
        unitPrice: 2100,
        taxPct: 0,
      }),
      createInvoiceItem({
        description: 'Automation playbook',
        quantity: 1,
        unitPrice: 1800,
        taxPct: 0,
      }),
      createInvoiceItem({
        description: 'Team onboarding workshop',
        quantity: 2,
        unitPrice: 450,
        taxPct: 0,
      }),
    ],
    plan: 'free',
  }),
  createEmptyInvoiceRecord({
    id: 'inv-lumen',
    number: 'INV-2024-109',
    status: 'paid',
    currency: 'AED',
    templateKey: 'minimal',
    issueDate: '2024-12-12',
    dueDate: '2024-12-19',
    branding: {
      ...defaultBranding(),
      businessName: 'Lumen Analytics FZ-LLC',
      businessEmail: 'accounts@lumen.ai',
      businessPhone: '+971 4 431 1250',
      accentColor: '#0f172a',
      footerNote: 'Data insights for global retail teams.',
    },
    client: {
      ...defaultClient(),
      company: 'Aria Luxury Holdings',
      name: 'Reem Al Nuaimi',
      email: 'reem@arialuxury.ae',
      address: 'Floor 28, Burj Daman, Dubai, UAE',
    },
    items: [
      createInvoiceItem({
        description: 'Quarterly analytics retainer',
        quantity: 1,
        unitPrice: 5200,
        taxPct: 5,
      }),
      createInvoiceItem({
        description: 'Dashboard customization',
        quantity: 8,
        unitPrice: 150,
        taxPct: 5,
      }),
    ],
    payments: [
      createInvoicePayment({
        id: 'pay-lumen-1',
        date: '2024-12-16',
        amount: 6200,
        method: 'Wire transfer',
        note: 'Full settlement',
        receiptNumber: 'RCT-2024-318',
      }),
    ],
    notes: 'Settlement completed. Thank you for partnering with Lumen Analytics.',
    plan: 'pro',
    watermark: false,
  }),
];

import Alpine from 'alpinejs';
import { BaseStore } from '../base';
import {
  createEmptyInvoiceRecord,
  createInvoiceItem,
  createInvoicePayment,
  defaultProfile,
  invoiceStatusOptions,
  invoiceTemplateOptions,
  mockInvoices,
  paymentMethodOptions,
  reminderModeOptions,
  reminderToneOptions,
  type InvoiceClient,
  type InvoiceItem,
  type InvoicePayment,
  type InvoiceProfile,
  type InvoiceRecord,
  type InvoiceReminderMode,
  type InvoiceReminderTone,
  type InvoiceStatus,
  type InvoiceTemplateKey,
} from '../../lib/invoice/schema';
import {
  applyTotals,
  calculateInvoiceTotals,
  cloneInvoice,
  daysUntilDue,
  describeInvoice,
  ensureHexColor,
  formatCurrency,
  generateInvoiceNumber,
  generateReceiptNumber,
  isPastDue,
  slugFromInvoiceNumber,
  sortInvoices,
} from '../../lib/invoice/utils';

const STORAGE_KEY = 'ansiversa.invoice.records.v1';
const PROFILE_KEY = 'ansiversa.invoice.profile.v1';

const setByPath = (target: any, path: string, value: any) => {
  const normalized = path.replace(/\[(\w+)\]/g, '.$1');
  const segments = normalized.split('.').filter(Boolean);
  if (segments.length === 0) return target;
  let cursor = target;
  for (let index = 0; index < segments.length - 1; index += 1) {
    const key = segments[index]!;
    if (typeof cursor[key] !== 'object' || cursor[key] === null) {
      const nextKey = segments[index + 1];
      cursor[key] = Number.isInteger(Number(nextKey)) ? [] : {};
    }
    cursor = cursor[key];
  }
  cursor[segments.at(-1)!] = value;
  return target;
};

const newId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

type ToastState = { message: string; type: 'success' | 'error' } | null;
type BuilderInitInput = { id?: string | null };
type PaymentDraft = { date: string; amount: string; method: string; note: string };

type MetricsState = {
  outstanding: number;
  paidThisMonth: number;
  dueSoon: number;
};

type ViewerState = {
  invoice: InvoiceRecord | null;
  payment: InvoicePayment | null;
  notFound: boolean;
};

class InvoiceStore extends BaseStore {
  state = {
    loading: false,
    invoices: [] as InvoiceRecord[],
    filtered: [] as InvoiceRecord[],
    filters: {
      status: 'all' as InvoiceStatus | 'all',
      template: 'all' as InvoiceTemplateKey | 'all',
      search: '',
    },
    metrics: {
      outstanding: 0,
      paidThisMonth: 0,
      dueSoon: 0,
    } as MetricsState,
  };

  profile: InvoiceProfile = defaultProfile();

  builder = {
    id: null as string | null,
    record: createEmptyInvoiceRecord(),
    loading: false,
    hasUnsavedChanges: false,
    lastSavedLabel: null as string | null,
    autosaveLabel: null as string | null,
    aiBusy: false,
    reminderDraft: '',
    reminderTone: 'polite' as InvoiceReminderTone,
    reminderMode: 'reminder' as InvoiceReminderMode,
    shareUrl: null as string | null,
    toast: null as ToastState,
    paymentForm: {
      date: new Date().toISOString().slice(0, 10),
      amount: '',
      method: paymentMethodOptions[0] ?? 'Bank transfer',
      note: '',
    } as PaymentDraft,
  };

  viewer: ViewerState = {
    invoice: null,
    payment: null,
    notFound: false,
  };

  templates = invoiceTemplateOptions;
  statusOptions = invoiceStatusOptions;
  paymentMethods = paymentMethodOptions;
  reminderTones = reminderToneOptions;
  reminderModes = reminderModeOptions;

  private autosaveTimer: ReturnType<typeof setTimeout> | null = null;
  private isLoaded = false;

  constructor() {
    super();
    if (typeof window !== 'undefined') {
      this.loadProfile();
      this.loadFromStorage();
    }
  }

  onInit(location?: Location) {
    if (typeof window === 'undefined') return;
    const pathname = location?.pathname ?? window.location.pathname;
    if (pathname.startsWith('/invoice/builder')) {
      const params = new URL(location?.href ?? window.location.href).searchParams;
      const id = params.get('id');
      this.initBuilder({ id });
      return;
    }
    if (pathname.startsWith('/invoice/view/')) {
      const slug = pathname.split('/').filter(Boolean).at(-1) ?? '';
      this.initViewer(slug);
      return;
    }
    if (pathname.startsWith('/invoice/receipt/')) {
      const receiptId = pathname.split('/').filter(Boolean).at(-1) ?? '';
      this.initReceipt(receiptId);
      return;
    }
    if (pathname.startsWith('/invoice/templates')) {
      if (!this.isLoaded) this.loadFromStorage();
      return;
    }
    if (pathname.startsWith('/invoice')) {
      this.initDashboard();
    }
  }

  initDashboard() {
    if (!this.isLoaded) {
      this.loadFromStorage();
    }
    this.applyFilters();
  }

  private loadProfile() {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(PROFILE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<InvoiceProfile> | null;
        if (parsed && typeof parsed === 'object') {
          this.profile = { ...defaultProfile(), ...parsed };
        }
      }
    } catch (error) {
      console.error('Unable to load invoice profile', error);
      this.profile = defaultProfile();
    }
  }

  private saveProfile() {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(this.profile));
    } catch (error) {
      console.error('Unable to save invoice profile', error);
    }
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    this.state.loading = true;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seeded = mockInvoices.map((invoice) => applyTotals(cloneInvoice(invoice)));
        this.state.invoices = sortInvoices(seeded);
        this.persist();
        this.isLoaded = true;
        this.applyFilters();
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid invoice storage payload');
      }
      const hydrated = parsed.map((invoice) => applyTotals(cloneInvoice(invoice)));
      this.state.invoices = sortInvoices(hydrated);
      this.isLoaded = true;
      this.applyFilters();
    } catch (error) {
      console.error('Unable to load invoices from storage', error);
      const seeded = mockInvoices.map((invoice) => applyTotals(cloneInvoice(invoice)));
      this.state.invoices = sortInvoices(seeded);
      this.isLoaded = true;
      this.persist();
      this.applyFilters();
    } finally {
      this.state.loading = false;
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      const payload = JSON.stringify(this.state.invoices);
      window.localStorage.setItem(STORAGE_KEY, payload);
    } catch (error) {
      console.error('Unable to persist invoices', error);
    }
  }

  private computeMetrics() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    let outstanding = 0;
    let paidThisMonth = 0;
    let dueSoon = 0;

    this.state.invoices.forEach((invoice) => {
      outstanding += invoice.totals.balanceDue;
      invoice.payments.forEach((payment) => {
        const date = new Date(payment.date);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
          paidThisMonth += payment.amount;
        }
      });
      const days = daysUntilDue(invoice);
      if (typeof days === 'number' && days >= 0 && days <= 7 && invoice.totals.balanceDue > 0) {
        dueSoon += 1;
      }
    });

    this.state.metrics = {
      outstanding: Math.max(outstanding, 0),
      paidThisMonth,
      dueSoon,
    };
  }

  applyFilters() {
    const { status, template, search } = this.state.filters;
    const query = search.trim().toLowerCase();
    const filtered = this.state.invoices.filter((invoice) => {
      if (status !== 'all' && invoice.status !== status) return false;
      if (template !== 'all' && invoice.templateKey !== template) return false;
      if (query.length > 0) {
        const haystack = `${invoice.number} ${invoice.client.name} ${invoice.client.company}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
    this.state.filtered = filtered;
    this.computeMetrics();
  }

  setFilter(key: 'status' | 'template' | 'search', value: string) {
    if (key === 'status' && value !== 'all' && !this.statusOptions.some((option) => option.value === value)) {
      return;
    }
    if (key === 'template' && value !== 'all' && !this.templates.some((option) => option.key === value)) {
      return;
    }
    (this.state.filters as Record<string, unknown>)[key] = value;
    this.applyFilters();
  }

  updateProfile(partial: Partial<InvoiceProfile>) {
    this.profile = { ...this.profile, ...partial };
    this.saveProfile();
  }

  createDraft() {
    if (!this.isLoaded) {
      this.loadFromStorage();
    }
    const freeInvoices = this.state.invoices.filter((invoice) => invoice.plan === 'free').length;
    if (this.profile.plan === 'free' && freeInvoices >= 5) {
      this.showToast('Free plan allows 5 invoices. Upgrade to unlock more.', 'error');
      return;
    }
    const invoice = createEmptyInvoiceRecord({
      plan: this.profile.plan,
      currency: this.profile.defaultCurrency,
      branding: {
        businessName: this.profile.businessName,
        businessEmail: this.profile.businessEmail,
        businessPhone: this.profile.businessPhone,
        businessAddress: this.profile.businessAddress,
        website: this.profile.website,
        accentColor: this.profile.accentColor,
        logoUrl: this.profile.logoUrl,
        footerNote: this.profile.footerNote,
      },
    });
    invoice.number = generateInvoiceNumber(this.state.invoices.map((item) => item.number), invoice.issueDate);
    applyTotals(invoice);
    this.state.invoices = sortInvoices([invoice, ...this.state.invoices]);
    this.persist();
    this.applyFilters();
    this.prepareBuilder(invoice);
    if (typeof window !== 'undefined') {
      const url = `/invoice/builder?id=${invoice.id}`;
      if (window.location.pathname.startsWith('/invoice/builder')) {
        window.history.replaceState({}, '', url);
      } else {
        window.location.assign(url);
      }
    }
  }

  private prepareBuilder(invoice: InvoiceRecord) {
    this.builder.id = invoice.id;
    this.builder.record = cloneInvoice(invoice);
    applyTotals(this.builder.record);
    this.builder.shareUrl = invoice.shareUrl ?? null;
    this.builder.hasUnsavedChanges = false;
    this.builder.lastSavedLabel = invoice.updatedAt
      ? `Saved ${new Date(invoice.updatedAt).toLocaleString()}`
      : null;
    this.builder.autosaveLabel = null;
    this.builder.paymentForm = {
      date: new Date().toISOString().slice(0, 10),
      amount: '',
      method: invoice.payments.at(-1)?.method ?? this.paymentMethods[0] ?? 'Bank transfer',
      note: '',
    };
    this.builder.reminderDraft = '';
    this.builder.reminderMode = 'reminder';
    this.builder.reminderTone = 'polite';
  }

  initBuilder(input: BuilderInitInput = {}) {
    if (!this.isLoaded) {
      this.loadFromStorage();
    }
    if (input.id) {
      const existing = this.state.invoices.find((invoice) => invoice.id === input.id);
      if (existing) {
        this.prepareBuilder(existing);
        return;
      }
    }
    this.createDraft();
  }

  formatCurrency(amount: number, currency?: string) {
    return formatCurrency(amount, currency ?? this.builder.record.currency);
  }

  updateField(path: string, value: unknown) {
    setByPath(this.builder.record, path, value);
    this.markDirty();
  }

  updateClient(client: Partial<InvoiceClient>) {
    this.builder.record.client = { ...this.builder.record.client, ...client };
    this.markDirty();
  }

  private markDirty() {
    this.builder.hasUnsavedChanges = true;
    this.builder.autosaveLabel = 'Unsaved changes';
    this.scheduleAutosave();
  }

  private scheduleAutosave() {
    if (this.autosaveTimer) {
      clearTimeout(this.autosaveTimer);
    }
    this.autosaveTimer = setTimeout(() => {
      this.autosaveTimer = null;
      if (!this.builder.hasUnsavedChanges) return;
      this.builder.autosaveLabel = 'Saving…';
      this.upsertBuilderRecord();
      this.builder.lastSavedLabel = `Saved ${new Date().toLocaleTimeString()}`;
      this.builder.autosaveLabel = 'Saved';
    }, 1600);
  }

  private upsertBuilderRecord() {
    applyTotals(this.builder.record);
    const index = this.state.invoices.findIndex((invoice) => invoice.id === this.builder.record.id);
    const copy = cloneInvoice(this.builder.record);
    if (index === -1) {
      this.state.invoices = sortInvoices([copy, ...this.state.invoices]);
    } else {
      this.state.invoices.splice(index, 1, copy);
      this.state.invoices = sortInvoices(this.state.invoices);
    }
    this.builder.shareUrl = copy.shareUrl;
    this.persist();
    this.applyFilters();
    this.builder.hasUnsavedChanges = false;
  }

  saveNow() {
    this.builder.loading = true;
    setTimeout(() => {
      this.upsertBuilderRecord();
      this.builder.loading = false;
      this.builder.lastSavedLabel = `Saved ${new Date().toLocaleTimeString()}`;
      this.builder.autosaveLabel = 'Saved';
      this.showToast('Invoice saved', 'success');
    }, 250);
  }

  deleteInvoice(id: string) {
    const index = this.state.invoices.findIndex((invoice) => invoice.id === id);
    if (index === -1) return;
    this.state.invoices.splice(index, 1);
    this.state.invoices = sortInvoices(this.state.invoices);
    this.persist();
    this.applyFilters();
    if (this.builder.id === id) {
      this.builder.id = null;
    }
  }

  duplicateInvoice(id: string) {
    const existing = this.state.invoices.find((invoice) => invoice.id === id);
    if (!existing) return;
    const duplicate = cloneInvoice(existing);
    duplicate.id = newId();
    duplicate.number = generateInvoiceNumber(this.state.invoices.map((invoice) => invoice.number), duplicate.issueDate);
    duplicate.slug = null;
    duplicate.shareUrl = null;
    duplicate.status = 'draft';
    duplicate.payments = [];
    duplicate.totals = calculateInvoiceTotals(duplicate.items, duplicate.payments);
    duplicate.createdAt = new Date().toISOString();
    duplicate.updatedAt = duplicate.createdAt;
    this.state.invoices = sortInvoices([duplicate, ...this.state.invoices]);
    this.persist();
    this.applyFilters();
    this.showToast('Invoice duplicated', 'success');
  }

  addItem() {
    this.builder.record.items.push(
      createInvoiceItem({ description: 'New line item', quantity: 1, unitPrice: 0, taxPct: 0, discountPct: 0 }),
    );
    this.markDirty();
  }

  removeItem(index: number) {
    this.builder.record.items.splice(index, 1);
    if (this.builder.record.items.length === 0) {
      this.addItem();
    }
    this.markDirty();
  }

  updateItem(index: number, field: keyof InvoiceItem, value: string) {
    const item = this.builder.record.items[index];
    if (!item) return;
    if (['quantity', 'unitPrice', 'taxPct', 'discountPct'].includes(field)) {
      const numericValue = Number.parseFloat(value);
      (item as Record<string, number>)[field] = Number.isFinite(numericValue) ? Math.max(numericValue, 0) : 0;
    } else {
      (item as Record<string, unknown>)[field] = value;
    }
    this.markDirty();
  }

  addPayment() {
    const amount = Number.parseFloat(this.builder.paymentForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      this.showToast('Enter a valid payment amount.', 'error');
      return;
    }
    const payment = createInvoicePayment({
      date: this.builder.paymentForm.date,
      amount,
      method: this.builder.paymentForm.method,
      note: this.builder.paymentForm.note,
    });
    const receiptNumbers = this.builder.record.payments
      .map((entry) => entry.receiptNumber)
      .filter((entry): entry is string => typeof entry === 'string');
    if (this.builder.record.plan !== 'free') {
      payment.receiptNumber = generateReceiptNumber(this.builder.record.number, receiptNumbers);
    }
    this.builder.record.payments.push(payment);
    applyTotals(this.builder.record);
    this.builder.paymentForm.amount = '';
    this.builder.paymentForm.note = '';
    this.builder.paymentForm.date = new Date().toISOString().slice(0, 10);
    this.markDirty();
    this.showToast('Payment recorded', 'success');
  }

  removePayment(id: string) {
    const index = this.builder.record.payments.findIndex((payment) => payment.id === id);
    if (index === -1) return;
    this.builder.record.payments.splice(index, 1);
    applyTotals(this.builder.record);
    this.markDirty();
  }

  markSent() {
    if (!this.builder.record.number || !this.builder.record.id) {
      this.showToast('Assign an invoice number before sending.', 'error');
      return;
    }
    const slug = slugFromInvoiceNumber(this.builder.record.number);
    this.builder.record.slug = slug;
    if (typeof window !== 'undefined') {
      this.builder.record.shareUrl = `${window.location.origin}/invoice/view/${slug}`;
    }
    this.builder.record.status = this.builder.record.totals.paidTotal > 0 ? 'partial' : 'sent';
    this.builder.shareUrl = this.builder.record.shareUrl;
    this.markDirty();
    this.showToast('Invoice marked as sent', 'success');
  }

  voidInvoice() {
    this.builder.record.status = 'void';
    this.markDirty();
    this.showToast('Invoice voided', 'success');
  }

  updateStatus(status: InvoiceStatus) {
    this.builder.record.status = status;
    this.markDirty();
  }

  updateTemplate(key: InvoiceTemplateKey) {
    this.builder.record.templateKey = key;
    const template = this.templates.find((item) => item.key === key);
    if (template) {
      this.builder.record.branding.accentColor = template.accentColor;
    }
    this.markDirty();
  }

  updateCurrency(value: string) {
    this.builder.record.currency = value.trim().toUpperCase().slice(0, 3);
    this.markDirty();
  }

  updateAccentColor(value: string) {
    this.builder.record.branding.accentColor = ensureHexColor(value, this.builder.record.branding.accentColor);
    this.markDirty();
  }

  copyReminder() {
    if (typeof navigator === 'undefined' || typeof navigator.clipboard === 'undefined') {
      this.showToast('Clipboard access unavailable.', 'error');
      return;
    }
    const text = this.generateReminderCopy();
    navigator.clipboard
      .writeText(text)
      .then(() => this.showToast('Reminder copied to clipboard', 'success'))
      .catch(() => this.showToast('Unable to access clipboard', 'error'));
  }

  private generateReminderCopy() {
    const clientName = this.builder.record.client.name || this.builder.record.client.company || 'there';
    const amount = formatCurrency(this.builder.record.totals.balanceDue, this.builder.record.currency);
    const due = this.builder.record.dueDate
      ? new Date(this.builder.record.dueDate).toLocaleDateString()
      : 'the due date';
    const tone = this.builder.reminderTone;
    if (this.builder.reminderMode === 'item') {
      const line = this.builder.record.items[0]?.description ?? 'service item';
      if (tone === 'friendly') {
        return `${line} — tailored for ${this.builder.record.client.company || clientName}, highlighting outcomes, deliverables, and next steps.`;
      }
      if (tone === 'professional') {
        return `${line}. Includes scope, acceptance criteria, and delivery timeline for the engagement.`;
      }
      return `${line} with a focus on measurable value and a concise summary of what is included.`;
    }
    if (tone === 'friendly') {
      return `Hi ${clientName}, just a quick check-in about invoice ${this.builder.record.number}. The remaining balance of ${amount} is due by ${due}. Let me know if you need any updates or support!`;
    }
    if (tone === 'professional') {
      return `${clientName}, this is a courteous reminder that invoice ${this.builder.record.number} has an outstanding balance of ${amount}, payable by ${due}. Please confirm once the transfer is initiated.`;
    }
    return `Hello ${clientName}, hope you're well. Invoice ${this.builder.record.number} shows a balance of ${amount}. Kindly arrange payment by ${due}. Thank you!`;
  }

  setReminderDraft(value: string) {
    this.builder.reminderDraft = value;
  }

  setReminderTone(tone: InvoiceReminderTone) {
    this.builder.reminderTone = tone;
  }

  setReminderMode(mode: InvoiceReminderMode) {
    this.builder.reminderMode = mode;
  }

  private showToast(message: string, type: 'success' | 'error') {
    this.builder.toast = { message, type };
    setTimeout(() => {
      if (this.builder.toast?.message === message) {
        this.builder.toast = null;
      }
    }, 2600);
  }

  describe(invoice: InvoiceRecord) {
    return describeInvoice(invoice);
  }

  formatDueLabel(invoice: InvoiceRecord) {
    if (invoice.totals.balanceDue <= 0) {
      return 'Paid';
    }
    const days = daysUntilDue(invoice);
    if (typeof days !== 'number') {
      return 'No due date';
    }
    if (days < 0) {
      return `${Math.abs(days)} days overdue`;
    }
    if (days === 0) {
      return 'Due today';
    }
    if (days === 1) {
      return 'Due tomorrow';
    }
    return `Due in ${days} days`;
  }

  isPastDue(invoice: InvoiceRecord) {
    return isPastDue(invoice);
  }

  initViewer(slug: string) {
    if (!this.isLoaded) {
      this.loadFromStorage();
    }
    const invoice = this.state.invoices.find((item) => item.slug === slug);
    if (!invoice) {
      this.viewer.invoice = null;
      this.viewer.payment = null;
      this.viewer.notFound = true;
      return;
    }
    const copy = cloneInvoice(invoice);
    applyTotals(copy);
    this.viewer.invoice = copy;
    this.viewer.payment = null;
    this.viewer.notFound = false;
    if (invoice.status === 'sent') {
      invoice.status = 'viewed';
      applyTotals(invoice);
      this.persist();
      this.applyFilters();
    }
  }

  initReceipt(identifier: string) {
    if (!this.isLoaded) {
      this.loadFromStorage();
    }
    let foundInvoice: InvoiceRecord | undefined;
    let foundPayment: InvoicePayment | undefined;
    for (const invoice of this.state.invoices) {
      const payment = invoice.payments.find(
        (entry) => entry.id === identifier || entry.receiptNumber === identifier,
      );
      if (payment) {
        foundInvoice = invoice;
        foundPayment = payment;
        break;
      }
    }
    if (!foundInvoice || !foundPayment) {
      this.viewer.invoice = null;
      this.viewer.payment = null;
      this.viewer.notFound = true;
      return;
    }
    this.viewer.invoice = cloneInvoice(foundInvoice);
    applyTotals(this.viewer.invoice);
    this.viewer.payment = { ...foundPayment };
    this.viewer.notFound = false;
  }
}

const store = new InvoiceStore();

Alpine.store('invoice', store);
Alpine.store('invoice-and-receipt-maker', store);

export type InvoiceStoreInstance = InvoiceStore;

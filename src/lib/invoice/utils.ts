import type {
  InvoiceItem,
  InvoicePayment,
  InvoiceRecord,
  InvoiceStatus,
  InvoiceTotals,
} from './schema';

const roundTo = (value: number, precision = 2) =>
  Math.round((value + Number.EPSILON) * 10 ** precision) / 10 ** precision;

export const formatCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(amount) ? amount : 0);
  } catch (error) {
    console.warn('Unable to format currency', currency, error);
    return `${currency || 'USD'} ${amount.toFixed(2)}`;
  }
};

export const ensureHexColor = (value: string | undefined | null, fallback = '#2563eb') => {
  if (!value) return fallback;
  const hex = value.trim();
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex) ? hex : fallback;
};

const lineSubtotal = (item: InvoiceItem) => item.quantity * item.unitPrice;
const lineTax = (item: InvoiceItem) => lineSubtotal(item) * (item.taxPct / 100);
const lineDiscount = (item: InvoiceItem) => lineSubtotal(item) * (item.discountPct / 100);

export const calculateInvoiceTotals = (
  items: InvoiceItem[],
  payments: InvoicePayment[],
): InvoiceTotals => {
  const subtotal = items.reduce((sum, item) => sum + lineSubtotal(item), 0);
  const taxTotal = items.reduce((sum, item) => sum + lineTax(item), 0);
  const discountTotal = items.reduce((sum, item) => sum + lineDiscount(item), 0);
  const grandTotal = subtotal + taxTotal - discountTotal;
  const paidTotal = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const balanceDue = Math.max(grandTotal - paidTotal, 0);

  return {
    subtotal: roundTo(subtotal),
    taxTotal: roundTo(taxTotal),
    discountTotal: roundTo(discountTotal),
    grandTotal: roundTo(grandTotal),
    paidTotal: roundTo(paidTotal),
    balanceDue: roundTo(balanceDue),
  };
};

export const deriveInvoiceStatus = (invoice: InvoiceRecord): InvoiceStatus => {
  if (invoice.status === 'void') return 'void';
  if (invoice.totals.balanceDue <= 0 && invoice.totals.grandTotal > 0) {
    return 'paid';
  }
  if (invoice.totals.paidTotal > 0 && invoice.totals.balanceDue > 0) {
    return 'partial';
  }
  if (invoice.status === 'viewed') return 'viewed';
  if (invoice.status === 'sent') return 'sent';
  return invoice.status ?? 'draft';
};

export const generateInvoiceNumber = (existingNumbers: string[], issueDate?: string) => {
  const targetYear = issueDate ? Number(issueDate.slice(0, 4)) : new Date().getFullYear();
  const prefix = `INV-${targetYear}`;
  const relevant = existingNumbers
    .map((number) => number.trim())
    .filter((number) => number.startsWith(prefix));
  const next = relevant
    .map((number) => Number(number.split('-').at(-1)))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => b - a)[0];
  const nextSequence = Number.isFinite(next) ? (next as number) + 1 : 1;
  return `${prefix}-${String(nextSequence).padStart(3, '0')}`;
};

export const generateReceiptNumber = (invoiceNumber: string, existing: string[] = []) => {
  const suffix = invoiceNumber.split('-').slice(1).join('-') || new Date().getFullYear().toString();
  const prefix = `RCT-${suffix}`;
  const next = existing
    .map((number) => Number(number.split('-').at(-1)))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => b - a)[0];
  const nextSequence = Number.isFinite(next) ? (next as number) + 1 : 1;
  return `${prefix}-${String(nextSequence).padStart(3, '0')}`;
};

export const slugFromInvoiceNumber = (number: string) =>
  number
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .replace(/-+/g, '-');

export const isPastDue = (invoice: InvoiceRecord) => {
  const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null;
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return invoice.totals.balanceDue > 0 && dueDate < today;
};

export const daysUntilDue = (invoice: InvoiceRecord) => {
  const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null;
  if (!dueDate) return null;
  const today = new Date();
  const diff = dueDate.getTime() - today.setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const sortInvoices = (invoices: InvoiceRecord[]) =>
  [...invoices].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());

export const cloneInvoice = (invoice: InvoiceRecord): InvoiceRecord =>
  JSON.parse(JSON.stringify(invoice));

export const touchUpdatedAt = (invoice: InvoiceRecord) => {
  invoice.updatedAt = new Date().toISOString();
  return invoice;
};

export const applyTotals = (invoice: InvoiceRecord) => {
  invoice.totals = calculateInvoiceTotals(invoice.items, invoice.payments);
  invoice.status = deriveInvoiceStatus(invoice);
  return touchUpdatedAt(invoice);
};

export const describeInvoice = (invoice: InvoiceRecord) => {
  const amount = formatCurrency(invoice.totals.grandTotal, invoice.currency);
  const balance = formatCurrency(invoice.totals.balanceDue, invoice.currency);
  return `${invoice.client.company || invoice.client.name} · ${amount} · Balance ${balance}`;
};

export const shortStatusLabel = (status: InvoiceStatus) => {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'sent':
      return 'Sent';
    case 'viewed':
      return 'Viewed';
    case 'partial':
      return 'Partial';
    case 'paid':
      return 'Paid';
    case 'void':
      return 'Void';
    default:
      return 'Draft';
  }
};

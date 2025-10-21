import type { ProposalData } from './schema';

export const slugifyProposalTitle = (input: string): string => {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
  return base || 'proposal';
};

export const formatCurrency = (value: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(value) ? value : 0);
  } catch (error) {
    return `${currency} ${value.toFixed(2)}`;
  }
};

export const describeProposalSummary = (data: ProposalData) => {
  const segments: string[] = [];
  if (data.scope.length) {
    segments.push(`${data.scope.length} scope item${data.scope.length > 1 ? 's' : ''}`);
  }
  if (data.timeline.length) {
    segments.push(`${data.timeline.length} milestone${data.timeline.length > 1 ? 's' : ''}`);
  }
  if (data.budget.items.length) {
    segments.push(`${data.budget.items.length} budget item${data.budget.items.length > 1 ? 's' : ''}`);
  }
  return segments.length ? segments.join(' · ') : 'Add scope, timeline, and budget details to continue.';
};

export const ensureHexColor = (input: string, fallback = '#4f46e5') => {
  if (typeof input !== 'string') return fallback;
  const hex = input.trim();
  return /^#([a-fA-F0-9]{3}){1,2}$/.test(hex) ? hex : fallback;
};

export const nowIso = () => new Date().toISOString();

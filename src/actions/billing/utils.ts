import { ActionError } from 'astro:actions';
import { BillingCustomer, BillingPlan, BillingSubscription, asc, desc, eq } from 'astro:db';
import type { SessionUser } from '../../types/session-user';
import type Stripe from 'stripe';
import { getSessionWithUser } from '../../utils/session.server';
import {
  billingCheckoutSessionRepository,
  billingCustomerRepository,
  billingPlanRepository,
  billingSubscriptionRepository,
} from './repositories';

const { randomUUID } = await import('node:crypto');

export type BillingPlanRow = typeof BillingPlan.$inferSelect;
export type BillingCustomerRow = typeof BillingCustomer.$inferSelect;
export type BillingSubscriptionRow = typeof BillingSubscription.$inferSelect;

export type NormalizedPlan = {
  id: number;
  slug: string;
  name: string;
  description: string;
  currency: string;
  amount: number;
  interval: BillingPlanRow['interval'];
  stripeProductId: string | null;
  stripePriceId: string;
  features: string[];
  isActive: boolean;
};

const asNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'bigint') return Number(value);
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toStringArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string').map((item) => item.trim());
  }
  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>)
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim());
  }
  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return [];
};

export const normalizePlan = (row: BillingPlanRow): NormalizedPlan => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  description: row.description ?? '',
  currency: (row.currency ?? 'usd').toLowerCase(),
  amount: asNumber(row.amount, 0),
  interval: row.interval ?? 'month',
  stripeProductId: row.stripeProductId ?? null,
  stripePriceId: row.stripePriceId,
  features: toStringArray(row.features),
  isActive: row.isActive ?? false,
});

export const requireUser = async (ctx: { cookies: unknown }): Promise<SessionUser> => {
  const result = await getSessionWithUser(ctx.cookies as any);
  if (!result?.user) {
    throw new ActionError({ code: 'UNAUTHORIZED', message: 'Sign in to continue.' });
  }
  return result.user;
};

export const findPlanByIdentifier = async (identifier: {
  slug?: string | null;
  priceId?: string | null;
  planId?: number | null;
  requireActive?: boolean;
}): Promise<BillingPlanRow | null> => {
  const requireActive = identifier.requireActive !== false;
  let plan: BillingPlanRow | undefined;

  if (identifier.planId) {
    const rows = await billingPlanRepository.getData({
      where: (table) => eq(table.id, identifier.planId!),
      limit: 1,
    });
    plan = rows[0];
  } else if (identifier.slug) {
    const rows = await billingPlanRepository.getData({
      where: (table) => eq(table.slug, identifier.slug!),
      limit: 1,
    });
    plan = rows[0];
  } else if (identifier.priceId) {
    const rows = await billingPlanRepository.getData({
      where: (table) => eq(table.stripePriceId, identifier.priceId!),
      limit: 1,
    });
    plan = rows[0];
  }

  if (!plan) return null;
  if (requireActive && !(plan.isActive ?? false)) {
    return null;
  }
  return plan;
};

export const findPlanOrThrow = async (identifier: {
  slug?: string | null;
  priceId?: string | null;
  planId?: number | null;
  requireActive?: boolean;
}) => {
  const plan = await findPlanByIdentifier(identifier);
  if (!plan) {
    throw new ActionError({ code: 'NOT_FOUND', message: 'Billing plan is unavailable.' });
  }
  return plan;
};

export const findCustomerForUser = async (userId: string) => {
  const rows = await billingCustomerRepository.getData({
    where: (table) => eq(table.userId, userId),
    limit: 1,
  });
  const record = rows[0];
  if (!record) return null;
  if (record.deletedAt) return null;
  return record;
};

export const findCustomerByStripeId = async (stripeCustomerId: string) => {
  const rows = await billingCustomerRepository.getData({
    where: (table) => eq(table.stripeCustomerId, stripeCustomerId),
    limit: 1,
  });
  const record = rows[0];
  if (!record) return null;
  if (record.deletedAt) return null;
  return record;
};

export const recordSubscriptionSnapshot = async (subscription: BillingSubscriptionRow) => {
  await billingSubscriptionRepository.update(
    {
      updatedAt: new Date(),
    },
    (table) => eq(table.id, subscription.id),
  );
};

export const markCustomerSoftDeleted = async (id: number) => {
  await billingCustomerRepository.update(
    {
      deletedAt: new Date(),
    },
    (table) => eq(table.id, id),
  );
};

export const createCustomerRecord = async (data: {
  userId: string;
  stripeCustomerId: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  metadata?: Record<string, unknown> | null;
}) => {
  const now = new Date();
  const [inserted] = await billingCustomerRepository.insert({
    userId: data.userId,
    stripeCustomerId: data.stripeCustomerId,
    email: data.email,
    name: data.name ?? null,
    phone: data.phone ?? null,
    metadata: data.metadata ?? null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  } as any);
  return inserted;
};

export const ensurePlanSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || `plan-${randomUUID().slice(0, 8)}`;

export const listActivePlans = async () => {
  const rows = await billingPlanRepository.getData({
    where: (table) => eq(table.isActive, true),
    orderBy: (table) => [asc(table.amount), asc(table.createdAt)],
  });
  return rows.map(normalizePlan);
};

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['trialing', 'active', 'past_due']);

export const normalizeSubscription = (row: BillingSubscriptionRow) => ({
  id: row.id,
  stripeSubscriptionId: row.stripeSubscriptionId,
  status: row.status,
  priceId: row.stripePriceId,
  planId: row.planId,
  currentPeriodStart: row.currentPeriodStart?.toISOString?.() ?? null,
  currentPeriodEnd: row.currentPeriodEnd?.toISOString?.() ?? null,
  cancelAtPeriodEnd: row.cancelAtPeriodEnd ?? false,
  canceledAt: row.canceledAt?.toISOString?.() ?? null,
  endedAt: row.endedAt?.toISOString?.() ?? null,
  trialEndsAt: row.trialEndsAt?.toISOString?.() ?? null,
  metadata: row.metadata ?? null,
});

export const isSubscriptionActive = (row: BillingSubscriptionRow | null | undefined) => {
  if (!row) return false;
  if (!row.status) return false;
  return ACTIVE_SUBSCRIPTION_STATUSES.has(row.status);
};

export const findLatestSubscriptionForCustomer = async (customerId: number) => {
  const rows = await billingSubscriptionRepository.getData({
    where: (table) => eq(table.customerId, customerId),
    limit: 1,
    orderBy: (table) => [desc(table.createdAt)],
  });
  return rows[0] ?? null;
};

export const ensureStripeCustomer = async (stripe: Stripe, user: SessionUser) => {
  const existing = await findCustomerForUser(user.id);
  const metadata: Record<string, string> = { userId: user.id };

  const syncRecord = async (record: BillingCustomerRow, customer: Stripe.Customer) => {
    const updates: Record<string, unknown> = {};
    if (customer.email && customer.email !== record.email) {
      updates.email = customer.email;
    }
    if (customer.name && customer.name !== record.name) {
      updates.name = customer.name;
    }
    if (customer.phone && customer.phone !== record.phone) {
      updates.phone = customer.phone;
    }
    if (customer.metadata && Object.keys(customer.metadata).length > 0) {
      updates.metadata = { ...customer.metadata };
    }
    if (customer.invoice_settings?.default_payment_method) {
      const value = customer.invoice_settings.default_payment_method;
      const paymentMethodId = typeof value === 'string' ? value : value?.id ?? null;
      if (paymentMethodId && paymentMethodId !== record.defaultPaymentMethodId) {
        updates.defaultPaymentMethodId = paymentMethodId;
      }
    }
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date();
      await billingCustomerRepository.update(updates, (table) => eq(table.id, record.id));
      return { ...record, ...updates };
    }
    return record;
  };

  if (existing) {
    try {
      const customer = await stripe.customers.retrieve(existing.stripeCustomerId);
      if ('deleted' in customer && customer.deleted) {
        await markCustomerSoftDeleted(existing.id);
      } else {
        const synced = await syncRecord(existing, customer);
        return { record: synced, customer };
      }
    } catch (error) {
      console.warn('Stripe customer lookup failed, creating a new customer record', error);
    }
  }

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.username,
    metadata,
  });

  if (!customer.id) {
    throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'Unable to create Stripe customer.' });
  }

  const record = await createCustomerRecord({
    userId: user.id,
    stripeCustomerId: customer.id,
    email: customer.email ?? user.email,
    name: customer.name,
    phone: customer.phone,
    metadata: Object.keys(customer.metadata ?? {}).length ? { ...customer.metadata } : null,
  });

  return { record, customer };
};

export const updateCheckoutSessionStatus = async (
  sessionId: string,
  data: {
    status?: string | null;
    stripeCustomerId?: string | null;
    completedAt?: Date | null;
    url?: string | null;
  },
) => {
  await billingCheckoutSessionRepository.update(
    {
      ...data,
      updatedAt: new Date(),
    },
    (table) => eq(table.stripeSessionId, sessionId),
  );
};

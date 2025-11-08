import type Stripe from 'stripe';
import { eq } from 'astro:db';
import {
  billingPlanRepository,
  billingSubscriptionRepository,
} from './repositories';
import {
  ensurePlanSlug,
  findCustomerByStripeId,
  findPlanByIdentifier,
  normalizeSubscription,
  isSubscriptionActive,
} from './utils';
import { userRepository } from '../auth/repositories';

const asDate = (value: number | null | undefined) => (value ? new Date(value * 1000) : null);

const upsertPlanFromPrice = async (price: Stripe.Price) => {
  if (!price.id) {
    throw new Error('Stripe price does not include an id.');
  }

  const existing = await findPlanByIdentifier({ priceId: price.id, requireActive: false });
  if (existing) {
    return existing;
  }

  const product =
    typeof price.product === 'string' ? { id: price.product, name: price.nickname ?? price.product } : price.product;

  const planName = price.nickname ?? product?.name ?? `Stripe price ${price.id}`;
  const now = new Date();
  const [inserted] = await billingPlanRepository.insert({
    slug: ensurePlanSlug(planName),
    name: planName,
    description: price.nickname ?? product?.name ?? '',
    currency: price.currency ?? 'usd',
    amount: price.unit_amount ?? 0,
    interval: price.recurring?.interval ?? 'one_time',
    stripeProductId: product?.id ?? null,
    stripePriceId: price.id,
    features: null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  } as any);
  return inserted;
};

export const upsertSubscriptionFromStripe = async (subscription: Stripe.Subscription) => {
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id ?? null;
  if (!customerId) {
    throw new Error('Subscription is missing a customer identifier.');
  }

  const customerRecord = await findCustomerByStripeId(customerId);
  if (!customerRecord) {
    throw new Error(`No billing customer found for Stripe customer ${customerId}`);
  }

  const price = subscription.items?.data?.[0]?.price;
  if (!price?.id) {
    throw new Error(`Subscription ${subscription.id} is missing price information.`);
  }

  const plan = await upsertPlanFromPrice(price);

  const existing = await billingSubscriptionRepository.getData({
    where: (table) => eq(table.stripeSubscriptionId, subscription.id),
    limit: 1,
  });

  const payload = {
    customerId: customerRecord.id,
    planId: plan?.id ?? null,
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    stripePriceId: price.id,
    currentPeriodStart: asDate(subscription.current_period_start),
    currentPeriodEnd: asDate(subscription.current_period_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
    canceledAt: asDate(subscription.canceled_at),
    endedAt: asDate(subscription.ended_at),
    trialEndsAt: asDate(subscription.trial_end),
    metadata: Object.keys(subscription.metadata ?? {}).length ? { ...subscription.metadata } : null,
    updatedAt: new Date(),
  };

  let record = existing[0];
  if (record) {
    await billingSubscriptionRepository.update(payload, (table) => eq(table.id, record!.id));
    record = { ...record, ...payload };
  } else {
    const [inserted] = await billingSubscriptionRepository.insert({
      ...payload,
      createdAt: new Date(),
    } as any);
    record = inserted;
  }

  if (plan?.slug && isSubscriptionActive(record)) {
    await userRepository.update({ plan: plan.slug }, (table) => eq(table.id, customerRecord.userId));
  } else if (
    subscription.status === 'canceled' ||
    subscription.status === 'incomplete_expired' ||
    subscription.status === 'paused'
  ) {
    await userRepository.update({ plan: 'free' }, (table) => eq(table.id, customerRecord.userId));
  }

  return normalizeSubscription(record);
};

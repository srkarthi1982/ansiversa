import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { eq, asc } from 'astro:db';
import {
  requireUser,
  normalizePlan,
  normalizeSubscription,
  isSubscriptionActive,
  findCustomerForUser,
  findLatestSubscriptionForCustomer,
} from './utils';
import { billingPlanRepository } from './repositories';

const normalizeCustomer = (row: Awaited<ReturnType<typeof findCustomerForUser>>) => {
  if (!row) return null;
  return {
    id: row.id,
    stripeCustomerId: row.stripeCustomerId,
    email: row.email,
    name: row.name ?? null,
    phone: row.phone ?? null,
    defaultPaymentMethodId: row.defaultPaymentMethodId ?? null,
  };
};

export const listPlans = defineAction({
  accept: 'json',
  input: z
    .object({
      includeInactive: z.boolean().optional(),
    })
    .optional(),
  async handler(input, ctx) {
    const user = await requireUser(ctx);
    const includeInactive = input?.includeInactive ?? false;

    const rows = await billingPlanRepository.getData({
      where: includeInactive ? undefined : (table) => eq(table.isActive, true),
      orderBy: (table) => [asc(table.amount), asc(table.createdAt)],
    });

    const plans = rows.map(normalizePlan);
    const customer = await findCustomerForUser(user.id);
    const subscriptionRecord = customer ? await findLatestSubscriptionForCustomer(customer.id) : null;

    const subscription = subscriptionRecord ? normalizeSubscription(subscriptionRecord) : null;
    const active =
      subscriptionRecord && isSubscriptionActive(subscriptionRecord)
        ? {
            planId: subscriptionRecord.planId ?? null,
            priceId: subscriptionRecord.stripePriceId,
            status: subscriptionRecord.status,
            cancelAtPeriodEnd: subscriptionRecord.cancelAtPeriodEnd ?? false,
          }
        : null;

    return {
      plans,
      customer: normalizeCustomer(customer),
      subscription,
      active,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        plan: user.plan ?? null,
      },
    };
  },
});

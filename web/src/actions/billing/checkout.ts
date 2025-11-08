import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { billingCheckoutSessionRepository } from './repositories';
import {
  ensureStripeCustomer,
  findPlanOrThrow,
  normalizePlan,
  requireUser,
} from './utils';
import { getBillingUrls, getStripeClient } from '../../utils/stripe.server';

const checkoutInput = z
  .object({
    planSlug: z.string().optional(),
    planId: z.number().int().positive().optional(),
    priceId: z.string().optional(),
    quantity: z.number().int().min(1).max(100).default(1),
    mode: z.enum(['subscription', 'payment']).default('subscription'),
    successUrl: z.string().url().optional(),
    cancelUrl: z.string().url().optional(),
    metadata: z.record(z.string(), z.string()).optional(),
    trialPeriodDays: z.number().int().min(0).max(365).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.planSlug && !value.priceId && !value.planId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select a plan to continue.',
        path: ['planSlug'],
      });
    }
  });

export const createCheckoutSession = defineAction({
  accept: 'json',
  input: checkoutInput,
  async handler(input, ctx) {
    const user = await requireUser(ctx);
    const stripe = getStripeClient();

    const planRow = await findPlanOrThrow({
      slug: input.planSlug,
      priceId: input.priceId,
      planId: input.planId,
    });
    const plan = normalizePlan(planRow);

    const { record: customerRecord, customer } = await ensureStripeCustomer(stripe, user);

    const urls = getBillingUrls();
    const successUrl = input.successUrl ?? urls.successUrl;
    const cancelUrl = input.cancelUrl ?? urls.cancelUrl;

    if (!successUrl || !cancelUrl) {
      throw new ActionError({
        code: 'BAD_REQUEST',
        message:
          'Success and cancel URLs are required. Provide STRIPE_SUCCESS_URL / STRIPE_CANCEL_URL environment variables or include them in the request.',
      });
    }

    if (!plan.stripePriceId) {
      throw new ActionError({
        code: 'NOT_FOUND',
        message: 'Selected plan is missing a Stripe price identifier.',
      });
    }

    const metadata = {
      ...input.metadata,
      planId: String(plan.id),
      planSlug: plan.slug,
      userId: user.id,
    };

    const session = await stripe.checkout.sessions.create({
      mode: input.mode,
      customer: customer.id,
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: input.quantity,
        },
      ],
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      subscription_data:
        input.mode === 'subscription'
          ? {
              metadata,
              trial_period_days: input.trialPeriodDays,
            }
          : undefined,
      metadata,
    });

    const now = new Date();
    const expiresAt = session.expires_at ? new Date(session.expires_at * 1000) : null;
    const stripeCustomerId =
      typeof session.customer === 'string'
        ? session.customer
        : session.customer?.id ?? customerRecord.stripeCustomerId;

    await billingCheckoutSessionRepository.insert({
      userId: user.id,
      planId: plan.id,
      stripeSessionId: session.id,
      stripeCustomerId,
      mode: session.mode ?? input.mode,
      status: session.status ?? null,
      url: session.url ?? null,
      successUrl,
      cancelUrl,
      expiresAt,
      metadata,
      createdAt: now,
      updatedAt: now,
      completedAt: session.status === 'complete' ? now : null,
    } as any);

    return {
      sessionId: session.id,
      url: session.url,
      stripeCustomerId,
      plan,
    };
  },
});

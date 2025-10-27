import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { jsonResponse } from '../../../utils/actions-api';
import { getStripeClient, getStripeWebhookSecret } from '../../../utils/stripe.server';
import { billingEventRepository } from '../../../actions/billing/repositories';
import { updateCheckoutSessionStatus } from '../../../actions/billing/utils';
import { upsertSubscriptionFromStripe } from '../../../actions/billing/subscriptions';

export const prerender = false;

const serializeEvent = (event: Stripe.Event) => {
  try {
    return JSON.parse(JSON.stringify(event));
  } catch (error) {
    console.warn('Unable to serialize Stripe event payload', error);
    return {
      id: event.id,
      type: event.type,
      data: {
        object: {
          id: (event.data.object as { id?: string } | undefined)?.id ?? null,
        },
      },
    };
  }
};

const handleCheckoutSession = async (stripe: Stripe, session: Stripe.Checkout.Session) => {
  const subscriptionId =
    typeof session.subscription === 'string' ? session.subscription : session.subscription?.id ?? null;
  const stripeCustomerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;

  await updateCheckoutSessionStatus(session.id, {
    status: session.status ?? null,
    stripeCustomerId,
    completedAt: new Date(),
    url: session.url ?? null,
  });

  if (subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['items.data.price.product'],
      });
      await upsertSubscriptionFromStripe(subscription);
    } catch (error) {
      console.error(`Failed to sync subscription ${subscriptionId}`, error);
    }
  }
};

const handleSubscriptionEvent = async (stripe: Stripe, subscription: Stripe.Subscription) => {
  try {
    await upsertSubscriptionFromStripe(subscription);
  } catch (error) {
    console.error(`Failed to sync subscription ${subscription.id}`, error);
  }
};

export const POST: APIRoute = async ({ request }) => {
  const secret = getStripeWebhookSecret();
  if (!secret) {
    return jsonResponse(
      {
        success: false,
        error: {
          code: 'MISSING_WEBHOOK_SECRET',
          message: 'Stripe webhook secret is not configured.',
        },
      },
      500,
    );
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return jsonResponse(
      {
        success: false,
        error: {
          code: 'MISSING_SIGNATURE',
          message: 'Stripe-Signature header is required.',
        },
      },
      400,
    );
  }

  let stripe: Stripe;
  try {
    stripe = getStripeClient();
  } catch (error) {
    return jsonResponse(
      {
        success: false,
        error: {
          code: 'MISSING_STRIPE_SECRET',
          message: error instanceof Error ? error.message : 'Stripe secret key is not configured.',
        },
      },
      500,
    );
  }

  let event: Stripe.Event;
  const payload = await request.arrayBuffer();
  const body = Buffer.from(payload);

  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    return jsonResponse(
      {
        success: false,
        error: {
          code: 'INVALID_SIGNATURE',
          message: error instanceof Error ? error.message : 'Invalid Stripe webhook signature.',
        },
      },
      400,
    );
  }

  const serialized = serializeEvent(event);

  try {
    await billingEventRepository.insert({
      stripeEventId: event.id,
      type: event.type,
      apiVersion: event.api_version ?? null,
      stripeCreatedAt: event.created ? new Date(event.created * 1000) : null,
      data: serialized,
      createdAt: new Date(),
    } as any);
  } catch (error) {
    console.warn(`Failed to persist webhook event ${event.id}`, error);
  }

  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
      await handleCheckoutSession(stripe, event.data.object as Stripe.Checkout.Session);
      break;
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
    case 'customer.subscription.trial_will_end':
      await handleSubscriptionEvent(stripe, event.data.object as Stripe.Subscription);
      break;
    default:
      break;
  }

  return jsonResponse({ success: true, received: event.id });
};

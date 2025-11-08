import Stripe from 'stripe';

const STRIPE_API_VERSION: Stripe.LatestApiVersion = '2023-10-16';

let cachedClient: Stripe | null = null;

const resolveSecret = () => import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

export const getStripeClient = () => {
  const secretKey = resolveSecret();
  if (!secretKey) {
    throw new Error('Stripe secret key is not configured. Set STRIPE_SECRET_KEY in your environment.');
  }

  if (!cachedClient) {
    cachedClient = new Stripe(secretKey, {
      apiVersion: STRIPE_API_VERSION,
    });
  }

  return cachedClient;
};

export const getStripeWebhookSecret = () =>
  import.meta.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || null;

export const getBillingUrls = () => {
  const success =
    import.meta.env.STRIPE_SUCCESS_URL ||
    process.env.STRIPE_SUCCESS_URL ||
    import.meta.env.PUBLIC_BILLING_SUCCESS_URL ||
    process.env.PUBLIC_BILLING_SUCCESS_URL ||
    null;

  const cancel =
    import.meta.env.STRIPE_CANCEL_URL ||
    process.env.STRIPE_CANCEL_URL ||
    import.meta.env.PUBLIC_BILLING_CANCEL_URL ||
    process.env.PUBLIC_BILLING_CANCEL_URL ||
    null;

  return {
    successUrl: success,
    cancelUrl: cancel,
  };
};

export type StripeClient = ReturnType<typeof getStripeClient>;

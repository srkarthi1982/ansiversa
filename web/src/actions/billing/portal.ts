import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { getBillingUrls, getStripeClient } from '../../utils/stripe.server';
import { ensureStripeCustomer, requireUser } from './utils';

export const createPortalSession = defineAction({
  accept: 'json',
  input: z
    .object({
      returnUrl: z.string().url().optional(),
    })
    .optional(),
  async handler(input, ctx) {
    const user = await requireUser(ctx);
    const stripe = getStripeClient();
    const { record, customer } = await ensureStripeCustomer(stripe, user);

    const urls = getBillingUrls();
    const returnUrl = input?.returnUrl ?? urls.successUrl ?? urls.cancelUrl;
    if (!returnUrl) {
      throw new ActionError({
        code: 'BAD_REQUEST',
        message:
          'A return URL is required to open the billing portal. Provide STRIPE_SUCCESS_URL or include a returnUrl value in the request.',
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: returnUrl,
    });

    return {
      url: session.url,
      stripeCustomerId: customer.id,
      customer: {
        id: record.id,
        email: record.email,
        name: record.name,
      },
    };
  },
});

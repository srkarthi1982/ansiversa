import { listPlans } from './plans';
import { createCheckoutSession } from './checkout';
import { createPortalSession } from './portal';

export const billing = {
  listPlans,
  createCheckoutSession,
  createPortalSession,
};

export type BillingActions = typeof billing;

export { listPlans, createCheckoutSession, createPortalSession };

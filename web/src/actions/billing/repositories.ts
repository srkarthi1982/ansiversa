import {
  BillingPlan,
  BillingCustomer,
  BillingSubscription,
  BillingCheckoutSession,
  BillingEvent,
} from 'astro:db';
import { BaseRepository } from '../baseRepository';

export const billingPlanRepository = new BaseRepository(BillingPlan);
export const billingCustomerRepository = new BaseRepository(BillingCustomer);
export const billingSubscriptionRepository = new BaseRepository(BillingSubscription);
export const billingCheckoutSessionRepository = new BaseRepository(BillingCheckoutSession);
export const billingEventRepository = new BaseRepository(BillingEvent);

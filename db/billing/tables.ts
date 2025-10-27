import { column, defineTable, NOW } from 'astro:db';
import { User } from '../auth/tables';

export const BillingPlan = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    slug: column.text({ unique: true }),
    name: column.text(),
    description: column.text({ optional: true }),
    currency: column.text({ default: 'usd' }),
    amount: column.number({ default: 0 }),
    interval: column.text({ enum: ['one_time', 'day', 'week', 'month', 'year'], default: 'month' }),
    stripeProductId: column.text({ optional: true }),
    stripePriceId: column.text({ unique: true }),
    features: column.json({ optional: true }),
    isActive: column.boolean({ default: true }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
});

export const BillingCustomer = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    userId: column.text({ references: () => User.columns.id }),
    stripeCustomerId: column.text({ unique: true }),
    email: column.text(),
    name: column.text({ optional: true }),
    phone: column.text({ optional: true }),
    defaultPaymentMethodId: column.text({ optional: true }),
    metadata: column.json({ optional: true }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
    deletedAt: column.date({ optional: true }),
  },
});

export const BillingSubscription = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    customerId: column.number({ references: () => BillingCustomer.columns.id }),
    planId: column.number({ references: () => BillingPlan.columns.id, optional: true }),
    stripeSubscriptionId: column.text({ unique: true }),
    status: column.text(),
    stripePriceId: column.text(),
    currentPeriodStart: column.date({ optional: true }),
    currentPeriodEnd: column.date({ optional: true }),
    cancelAtPeriodEnd: column.boolean({ default: false }),
    canceledAt: column.date({ optional: true }),
    endedAt: column.date({ optional: true }),
    trialEndsAt: column.date({ optional: true }),
    metadata: column.json({ optional: true }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
});

export const BillingCheckoutSession = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    userId: column.text({ references: () => User.columns.id }),
    planId: column.number({ references: () => BillingPlan.columns.id, optional: true }),
    stripeSessionId: column.text({ unique: true }),
    stripeCustomerId: column.text({ optional: true }),
    mode: column.text(),
    status: column.text({ optional: true }),
    url: column.text({ optional: true }),
    successUrl: column.text({ optional: true }),
    cancelUrl: column.text({ optional: true }),
    expiresAt: column.date({ optional: true }),
    metadata: column.json({ optional: true }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
    completedAt: column.date({ optional: true }),
  },
});

export const BillingEvent = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    stripeEventId: column.text({ unique: true }),
    type: column.text(),
    apiVersion: column.text({ optional: true }),
    stripeCreatedAt: column.date({ optional: true }),
    data: column.json(),
    createdAt: column.date({ default: NOW }),
  },
});

export const billingTables = {
  BillingPlan,
  BillingCustomer,
  BillingSubscription,
  BillingCheckoutSession,
  BillingEvent,
} as const;

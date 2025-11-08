import { db, eq } from 'astro:db';
import { BillingPlan } from './tables';

const defaultPlans = [
  {
    slug: 'pro-monthly',
    name: 'Pro Monthly',
    description: 'Unlimited access across the Ansiversa mini-app universe billed every month.',
    currency: 'usd',
    amount: 1500,
    interval: 'month' as const,
    stripeProductId: 'prod_ansiversa_pro',
    stripePriceId: 'price_ansiversa_pro_monthly',
    features: [
      'Unlimited usage across all mini-apps',
      'Advanced AI drafting and proposal workflows',
      'Priority feature launches and roadmap access',
    ],
  },
  {
    slug: 'elite-annual',
    name: 'Elite Annual',
    description: 'Lock in annual savings and early access to experimental tools.',
    currency: 'usd',
    amount: 14900,
    interval: 'year' as const,
    stripeProductId: 'prod_ansiversa_elite',
    stripePriceId: 'price_ansiversa_elite_annual',
    features: [
      'Everything in Pro, billed once per year',
      'First access to new app drops and closed betas',
      'Exclusive content themes and seasonal bundles',
    ],
  },
] satisfies Array<typeof BillingPlan.$inferInsert>;

export async function seedBilling() {
  for (const plan of defaultPlans) {
    const existing = await db
      .select()
      .from(BillingPlan)
      .where(eq(BillingPlan.slug, plan.slug))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(BillingPlan).values({
        ...plan,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }
}

import Alpine from 'alpinejs';
import { BaseStore } from './base';

type BillingCycle = 'monthly' | 'annual';

class Pricing extends BaseStore {
  billingCycle: BillingCycle = 'monthly';

  onInit(): void {
    this.showLoaderBriefly();
  }

  setBillingCycle(cycle: BillingCycle): void {
    this.billingCycle = cycle;
  }

  toggleBillingCycle(): void {
    this.billingCycle = this.billingCycle === 'monthly' ? 'annual' : 'monthly';
  }

}

export type PricingStore = Pricing;

Alpine.store('pricing', new Pricing());

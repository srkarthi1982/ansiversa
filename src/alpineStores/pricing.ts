import Alpine from 'alpinejs';
import { flashLoader } from './base';

type BillingCycle = 'monthly' | 'annual';

class Pricing {
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

  private showLoaderBriefly(): void {
    flashLoader();
  }
}

export type PricingStore = Pricing;

Alpine.store('pricing', new Pricing());

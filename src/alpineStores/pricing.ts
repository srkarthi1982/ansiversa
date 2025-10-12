import Alpine from 'alpinejs';

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
    Alpine.store('loader').show();
    setTimeout(() => Alpine.store('loader').hide(), 300);
  }
}

export type PricingStore = Pricing;

Alpine.store('pricing', new Pricing());

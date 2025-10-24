import Alpine from 'alpinejs';
import { flashLoader } from './base';

type FaqKey = 'onboarding' | 'submitApp' | 'membership' | 'cadence' | 'support';

type FaqState = Record<FaqKey, boolean>;

const DEFAULT_STATE: FaqState = {
  onboarding: true,
  submitApp: false,
  membership: false,
  cadence: false,
  support: false,
};

class FaqStoreImpl {
  openItems: FaqState = { ...DEFAULT_STATE };

  onInit(): void {
    this.showLoaderBriefly();
  }

  toggle(item: FaqKey): void {
    this.openItems[item] = !this.openItems[item];
  }

  closeAll(): void {
    this.openItems = {
      onboarding: false,
      submitApp: false,
      membership: false,
      cadence: false,
      support: false,
    };
  }

  open(item: FaqKey): void {
    this.openItems[item] = true;
  }

  private showLoaderBriefly(): void {
    flashLoader();
  }
}

export type FaqStore = FaqStoreImpl;

Alpine.store('faq', new FaqStoreImpl());

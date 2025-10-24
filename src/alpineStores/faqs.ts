import Alpine from 'alpinejs';
import { BaseStore } from './base';

type FaqKey = 'uiKit' | 'astroDb' | 'stripeSetup' | 'support';

type FaqState = Record<FaqKey, boolean>;

const DEFAULT_STATE: FaqState = {
  uiKit: true,
  astroDb: false,
  stripeSetup: false,
  support: false,
};

class Faqs extends BaseStore {
  openItems: FaqState = { ...DEFAULT_STATE };

  onInit(): void {
    this.showLoaderBriefly();
  }

  toggle(item: FaqKey): void {
    this.openItems[item] = !this.openItems[item];
  }

  closeAll(): void {
    this.openItems = {
      uiKit: false,
      astroDb: false,
      stripeSetup: false,
      support: false,
    };
  }

  open(item: FaqKey): void {
    this.openItems[item] = true;
  }

}

export type FaqsStore = Faqs;

Alpine.store('faqs', new Faqs());

import Alpine from 'alpinejs';
import { flashLoader } from './base';

class FeaturesStoreImpl {
  onInit(): void {
    this.showLoaderBriefly();
  }

  private showLoaderBriefly(): void {
    flashLoader();
  }
}

export type FeaturesStore = FeaturesStoreImpl;

Alpine.store('features', new FeaturesStoreImpl());

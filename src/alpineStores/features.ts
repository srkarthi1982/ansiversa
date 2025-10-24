import Alpine from 'alpinejs';
import { BaseStore } from './base';

class FeaturesStoreImpl extends BaseStore {
  onInit(): void {
    this.showLoaderBriefly();
  }
}

export type FeaturesStore = FeaturesStoreImpl;

Alpine.store('features', new FeaturesStoreImpl());

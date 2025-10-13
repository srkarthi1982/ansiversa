import Alpine from 'alpinejs';

class FeaturesStoreImpl {
  onInit(): void {
    this.showLoaderBriefly();
  }

  private showLoaderBriefly(): void {
    Alpine.store('loader').show();
    setTimeout(() => Alpine.store('loader').hide(), 300);
  }
}

export type FeaturesStore = FeaturesStoreImpl;

Alpine.store('features', new FeaturesStoreImpl());

import Alpine from 'alpinejs';
import { BaseStore } from './base';

class Home extends BaseStore {
  isLoading = false;

  onInit(): void {
    this.showLoaderBriefly(2000);
  }
}

export type HomeStore = Home;

Alpine.store('home', new Home());

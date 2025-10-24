import Alpine from 'alpinejs';
import { flashLoader } from './base';

class Home {
  isLoading = false;

  onInit(): void {
    flashLoader(2000);
  }
}

export type HomeStore = Home;

Alpine.store('home', new Home());

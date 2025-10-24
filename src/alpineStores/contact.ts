import Alpine from 'alpinejs';
import { flashLoader } from './base';

class ContactStoreImpl {
  onInit(): void {
    this.showLoaderBriefly();
  }

  private showLoaderBriefly(): void {
    flashLoader();
  }
}

export type ContactStore = ContactStoreImpl;

Alpine.store('contact', new ContactStoreImpl());

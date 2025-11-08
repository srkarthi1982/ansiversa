import Alpine from 'alpinejs';
import { BaseStore } from './base';

class ContactStoreImpl extends BaseStore {
  onInit(): void {
    this.showLoaderBriefly();
  }
}

export type ContactStore = ContactStoreImpl;

Alpine.store('contact', new ContactStoreImpl());

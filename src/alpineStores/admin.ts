import Alpine from 'alpinejs';
import { flashLoader } from './base';

class AdminStore {
  onInit(): void {
    flashLoader();
  }
}

Alpine.store('admin', new AdminStore());

export type AdminStoreType = AdminStore;

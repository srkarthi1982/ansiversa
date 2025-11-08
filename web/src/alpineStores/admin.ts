import Alpine from 'alpinejs';
import { BaseStore } from './base';

class AdminStore extends BaseStore {
  onInit(): void {
    this.showLoaderBriefly();
  }
}

Alpine.store('admin', new AdminStore());

export type AdminStoreType = AdminStore;

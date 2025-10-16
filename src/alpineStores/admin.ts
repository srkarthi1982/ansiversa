import Alpine from 'alpinejs';

class AdminStore {
  onInit(): void {
    const loader = Alpine.store('loader') as { show?: () => void; hide?: () => void } | undefined;
    loader?.show?.();
    setTimeout(() => loader?.hide?.(), 300);
  }
}

Alpine.store('admin', new AdminStore());

export type AdminStoreType = AdminStore;

import Alpine from 'alpinejs';
import { BaseStore } from './base';
import { MINI_APP_DEFINITIONS } from '../data/miniApps';

const miniApps = MINI_APP_DEFINITIONS;

class DefaultMiniAppStore extends BaseStore {
  onInit(): void {
    this.showLoaderBriefly();
  }
}

miniApps.forEach((app) => {
  if (!Alpine.store(app.slug)) {
    Alpine.store(app.slug, new DefaultMiniAppStore());
  }
});

export type MiniAppStore = DefaultMiniAppStore;
export type { MiniAppDefinition } from '../data/miniApps';

import Alpine from 'alpinejs';
import { BaseStore } from './base';

type DocsSection = 'overview' | 'guides' | 'api' | 'deployment';

class Documentation extends BaseStore {
  activeSection: DocsSection = 'overview';

  onInit(): void {
    this.showLoaderBriefly();
  }

  setSection(section: DocsSection): void {
    this.activeSection = section;
  }

}

export type DocumentationStore = Documentation;

Alpine.store('documentation', new Documentation());

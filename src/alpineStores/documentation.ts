import Alpine from 'alpinejs';
import { flashLoader } from './base';

type DocsSection = 'overview' | 'guides' | 'api' | 'deployment';

class Documentation {
  activeSection: DocsSection = 'overview';

  onInit(): void {
    this.showLoaderBriefly();
  }

  setSection(section: DocsSection): void {
    this.activeSection = section;
  }

  private showLoaderBriefly(): void {
    flashLoader();
  }
}

export type DocumentationStore = Documentation;

Alpine.store('documentation', new Documentation());
